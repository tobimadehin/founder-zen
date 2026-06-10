#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG="$ROOT/zen.toml"

# shellcheck disable=SC1091
source "$ROOT/lib/shell-utils.sh"

bot_token=$(parse_toml telegram bot_token "$CONFIG")
zen_slug=$(parse_toml zen slug "$CONFIG")

webhook_url="https://${zen_slug}.cfargotunnel.com/webhook/telegram"

echo "Registering Telegram webhook: $webhook_url"

response=$(curl -s -X POST \
  "https://api.telegram.org/bot${bot_token}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${webhook_url}\", \"allowed_updates\": [\"message\"]}")

if echo "$response" | grep -q '"ok":true'; then
  echo "Webhook registered successfully."
else
  echo "Failed to register webhook: $response"
  exit 1
fi
