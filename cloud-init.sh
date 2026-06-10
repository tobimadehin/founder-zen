#!/bin/bash
# Bootstrap any fresh VPS for founder-zen. Idempotent — safe to re-run.
# Pass zen.toml as base64 via ZEN_TOML_B64, or place it at /opt/zen/zen.toml first.
set -euo pipefail

INSTALL_DIR="/opt/zen"
REPO_URL="${ZEN_REPO_URL:-https://github.com/tobimadehin/founder-zen}"

# system deps
apt-get update -qq
apt-get install -y -qq curl git sqlite3 unzip ca-certificates gnupg lsb-release python3

# docker
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

# rclone
if ! command -v rclone &>/dev/null; then
  curl -fsSL https://rclone.org/install.sh | bash
fi

# cloudflared
if ! command -v cloudflared &>/dev/null; then
  ARCH=$(dpkg --print-architecture)
  curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb" \
    -o /tmp/cloudflared.deb
  dpkg -i /tmp/cloudflared.deb
fi

# clone repo
if [ ! -d "$INSTALL_DIR/.git" ]; then
  git clone "$REPO_URL" "$INSTALL_DIR"
else
  git -C "$INSTALL_DIR" pull --ff-only
fi

# source shared shell utilities
# shellcheck disable=SC1091
source "$INSTALL_DIR/lib/shell-utils.sh"

# place zen.toml
if [ -n "${ZEN_TOML_B64:-}" ]; then
  echo "$ZEN_TOML_B64" | base64 -d > "$INSTALL_DIR/zen.toml"
elif [ ! -f "$INSTALL_DIR/zen.toml" ]; then
  printf "ERROR: zen.toml not found. Set ZEN_TOML_B64 or place the file at %s/zen.toml.\n" "$INSTALL_DIR" >&2
  exit 1
fi

# parse config
CONFIG="$INSTALL_DIR/zen.toml"

ZEN_SLUG=$(parse_toml zen slug "$CONFIG")
N8N_USER=$(parse_toml n8n user "$CONFIG")
N8N_PASSWORD=$(parse_toml n8n password "$CONFIG")
BOT_TOKEN=$(parse_toml telegram bot_token "$CONFIG")
CHAT_ID=$(parse_toml telegram chat_id "$CONFIG")
OPENROUTER_KEY=$(parse_toml openrouter api_key "$CONFIG")
PRIMARY_MODEL=$(parse_toml openrouter primary_model "$CONFIG")
VISION_MODEL=$(parse_toml openrouter vision_model "$CONFIG")
REDDIT_CLIENT_ID=$(parse_toml reddit client_id "$CONFIG")
REDDIT_CLIENT_SECRET=$(parse_toml reddit client_secret "$CONFIG")
REDDIT_UA=$(parse_toml reddit user_agent "$CONFIG")
REDDIT_SUBS=$(parse_toml reddit subreddits "$CONFIG" | tr -d '[]" ' | tr ',' ',')
REDDIT_KW=$(parse_toml reddit keywords "$CONFIG" | tr -d '[]" ')
NTFY_URL=$(parse_toml ntfy base_url "$CONFIG")
NTFY_TOPIC=$(parse_toml ntfy topic "$CONFIG")
# shellcheck disable=SC2034
MONITOR_INTERVAL=$(parse_toml monitor interval_seconds "$CONFIG")
# shellcheck disable=SC2034
MONITOR_ENDPOINTS=$(python3 -c "
import tomllib, json
with open('$CONFIG', 'rb') as f:
    config = tomllib.load(f)
print(json.dumps(config.get('monitor', {}).get('endpoints', [])))
")
# shellcheck disable=SC2034
GITHUB_TOKEN=$(parse_toml github token "$CONFIG")
# shellcheck disable=SC2034
GITHUB_CSTATE_REPO=$(parse_toml github cstate_repo "$CONFIG")
# shellcheck disable=SC2034
GITHUB_CSTATE_BRANCH=$(parse_toml github cstate_branch "$CONFIG")

# generate n8n encryption key once
if [ ! -f "$INSTALL_DIR/.n8n_key" ]; then
  openssl rand -hex 32 > "$INSTALL_DIR/.n8n_key"
fi
N8N_ENCRYPTION_KEY=$(cat "$INSTALL_DIR/.n8n_key")

# write .env for docker-compose
cat > "$INSTALL_DIR/.env" <<EOF
ZEN_SLUG=$ZEN_SLUG
N8N_USER=$N8N_USER
N8N_PASSWORD=$N8N_PASSWORD
N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY
WEBHOOK_URL=https://${ZEN_SLUG}.cfargotunnel.com
ZEN_BOT_TOKEN=$BOT_TOKEN
ZEN_CHAT_ID=$CHAT_ID
ZEN_OPENROUTER_KEY=$OPENROUTER_KEY
ZEN_PRIMARY_MODEL=$PRIMARY_MODEL
ZEN_VISION_MODEL=$VISION_MODEL
ZEN_REDDIT_CLIENT_ID=$REDDIT_CLIENT_ID
ZEN_REDDIT_CLIENT_SECRET=$REDDIT_CLIENT_SECRET
ZEN_REDDIT_USER_AGENT=$REDDIT_UA
ZEN_REDDIT_SUBREDDITS=$REDDIT_SUBS
ZEN_REDDIT_KEYWORDS=$REDDIT_KW
ZEN_NTFY_URL=$NTFY_URL
ZEN_NTFY_TOPIC=$NTFY_TOPIC
ZEN_MONITOR_INTERVAL=${MONITOR_INTERVAL:-30}
ZEN_MONITOR_ENDPOINTS=$MONITOR_ENDPOINTS
ZEN_GITHUB_TOKEN=$GITHUB_TOKEN
ZEN_GITHUB_CSTATE_REPO=$GITHUB_CSTATE_REPO
ZEN_GITHUB_CSTATE_BRANCH=${GITHUB_CSTATE_BRANCH:-main}
EOF

chmod 600 "$INSTALL_DIR/.env"

# restore memory from S3
"$INSTALL_DIR/scripts/restore.sh" || printf "Warning: memory restore failed (first run?)\n"

# seed empty memory files if none exist
mkdir -p "$INSTALL_DIR/memory"
[ -f "$INSTALL_DIR/memory/icp.md" ]        || printf "# ICP\n\nAdd your ideal customer profile here.\n" > "$INSTALL_DIR/memory/icp.md"
[ -f "$INSTALL_DIR/memory/tone.md" ]       || printf "# Tone\n\nAdd your writing style guide here.\n" > "$INSTALL_DIR/memory/tone.md"
[ -f "$INSTALL_DIR/memory/subreddits.md" ] || printf "# Subreddits\n\nList target subreddits and keyword filters here.\n" > "$INSTALL_DIR/memory/subreddits.md"

# create data dirs
mkdir -p "$INSTALL_DIR/data/n8n" "$INSTALL_DIR/data/ntfy"
touch "$INSTALL_DIR/data/zen.db"

# start containers
cd "$INSTALL_DIR"
docker compose --env-file .env up -d --build

# wait for n8n
printf "Waiting for n8n...\n"
for _ in $(seq 1 30); do
  curl -sf "http://localhost:5678/healthz" &>/dev/null && break
  sleep 3
done
curl -sf "http://localhost:5678/healthz" || { printf "n8n did not start in time\n" >&2; exit 1; }

# init SQLite schema
sqlite3 "$INSTALL_DIR/data/zen.db" < "$INSTALL_DIR/schema.sql"

# import n8n workflows
"$INSTALL_DIR/scripts/import-workflows.sh"

# register Telegram webhook
"$INSTALL_DIR/scripts/register-webhook.sh"

# install nightly backup cron
CRON_LINE="0 2 * * * $INSTALL_DIR/scripts/backup.sh >> /var/log/zen-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "zen-backup" ; echo "$CRON_LINE") | crontab -

chmod +x "$INSTALL_DIR/scripts/"*.sh

printf "\nfounder-zen is running.\n"
printf "  n8n:          http://localhost:5678\n"
printf "  ntfy:         http://localhost:8080\n"
printf "  trafilatura:  http://localhost:8091/healthz\n\n"
printf "Next: configure your Cloudflare Tunnel to route %s.cfargotunnel.com -> localhost:5678\n" "$ZEN_SLUG"
