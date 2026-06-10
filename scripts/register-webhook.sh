#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG="$ROOT/zen.toml"

bot_token=$(grep -A4 '^\[telegram\]' "$CONFIG" | grep 'bot_token' | head -1 | sed 's/.*= *"\(.*\)"/\1/')
zen_slug=$(grep -A2 '^\[zen\]' "$CONFIG" | grep 'slug' | head -1 | sed 's/.*= *"\(.*\)"/\1/')

webhook_url="https://${zen_slug}.cfargotunnel.com/webhook/telegram"

echo "Registering Telegram webhook: $webhook_url"

response=$(curl -s -X POST \
  "https://api.telegram.org/bot${bot_token}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${webhook_url}\", \"allowed_updates\": [\"message\"]}")

echo "$response" | grep -q '"ok":true' \
  && echo "Webhook registered successfully." \
  || { echo "Failed to register webhook: $response"; exit 1; }
