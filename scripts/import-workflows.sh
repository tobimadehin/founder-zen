#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG="$ROOT/zen.toml"

n8n_url=$(grep -A4 '^\[n8n\]' "$CONFIG" | grep 'base_url' | head -1 | sed 's/.*= *"\(.*\)"/\1/')
api_key_file="$ROOT/.n8n_api_key"

if [ ! -f "$api_key_file" ]; then
  printf "ERROR: %s not found.\n" "$api_key_file" >&2
  printf "Generate an API key in n8n (Settings → API) and save it there.\n" >&2
  exit 1
fi
N8N_API_KEY=$(cat "$api_key_file")

# build from templates
node "$ROOT/scripts/build-workflows.js"

printf "Importing workflows to %s...\n" "$n8n_url"

# Fetch existing workflows once — used to find existing IDs by name
existing_json=$(curl -s "${n8n_url}/api/v1/workflows?limit=200" -H "X-N8N-API-KEY: ${N8N_API_KEY}")

upserted_ids=()
for workflow_file in "$ROOT/workflows/"*.json; do
  name=$(basename "$workflow_file")
  printf "  %s... " "$name"

  # strip read-only fields; convert /c/... to C:/... for Windows Python
  win_path="${workflow_file/#\/c\//C:/}"
  wf_name=$(python3 -c "import json; d=json.load(open('$win_path', encoding='utf-8')); print(d.get('name',''))")
  payload=$(python3 -c "
import json
d = json.load(open('$win_path', encoding='utf-8'))
for k in ('id','tags','createdAt','updatedAt','versionId'):
    d.pop(k, None)
print(json.dumps(d))
")

  # Check if a workflow with this name already exists
  existing_id=$(echo "$existing_json" | python3 -c "
import json,sys
d=json.load(sys.stdin)
name='$wf_name'
match=[wf['id'] for wf in d.get('data',[]) if wf.get('name')==name]
print(match[0] if match else '')
" 2>/dev/null || echo "")

  if [ -n "$existing_id" ]; then
    # PATCH existing workflow — no duplicate created
    result=$(echo "$payload" | curl -s \
      -X PUT "${n8n_url}/api/v1/workflows/${existing_id}" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      -d @-)
    new_id=$(echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")
    [ -n "$new_id" ] && printf "updated (id=%s)\n" "$existing_id" || printf "FAILED (update)\n"
    new_id="$existing_id"
  else
    # POST new workflow
    result=$(echo "$payload" | curl -s \
      -X POST "${n8n_url}/api/v1/workflows" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      -d @-)
    new_id=$(echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")
    [ -n "$new_id" ] && printf "created (id=%s)\n" "$new_id" || printf "FAILED (create)\n"
  fi

  [ -n "$new_id" ] && upserted_ids+=("$new_id")
done

printf "Activating upserted workflows...\n"

# Deactivate anything not in our upserted set (old orphans)
all_wf=$(curl -s "${n8n_url}/api/v1/workflows?limit=200" -H "X-N8N-API-KEY: ${N8N_API_KEY}")
all_ids=$(echo "$all_wf" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(' '.join(wf['id'] for wf in d.get('data',[])))
")

for id in $all_ids; do
  is_ours=0
  for uid in "${upserted_ids[@]}"; do
    [ "$id" = "$uid" ] && is_ours=1 && break
  done
  if [ "$is_ours" = "0" ]; then
    curl -s -o /dev/null -X POST "${n8n_url}/api/v1/workflows/${id}/deactivate" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}"
  fi
done

for id in "${upserted_ids[@]}"; do
  r=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${n8n_url}/api/v1/workflows/${id}/activate" \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}")
  printf "  activate %s: %s\n" "$id" "$r"
done

printf "Done.\n"
