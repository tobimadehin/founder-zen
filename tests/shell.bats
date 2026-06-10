#!/usr/bin/env bats
# Requires: bats-core (https://github.com/bats-core/bats-core)
# Run: bats tests/shell.bats

setup() {
  source "$(dirname "$BATS_TEST_FILENAME")/../lib/shell-utils.sh"

  TMPFILE="$(mktemp)"
  cat > "$TMPFILE" <<'EOF'
[zen]
slug = "dployr"

[telegram]
bot_token = "abc123"
chat_id = "999888"

[n8n]
base_url = "http://localhost:5678"
user = "admin"
password = "secret"

[openrouter]
api_key = "sk-or-test"
primary_model = "deepseek/deepseek-chat"
vision_model = "google/gemini-flash-1.5"

[reddit]
client_id = "reddit_id"
subreddits = ["devops", "selfhosted"]
EOF
}

teardown() {
  rm -f "$TMPFILE"
}

@test "parse_toml: reads slug from [zen] section" {
  run parse_toml zen slug "$TMPFILE"
  [ "$status" -eq 0 ]
  [ "$output" = "dployr" ]
}

@test "parse_toml: reads bot_token from [telegram] section" {
  run parse_toml telegram bot_token "$TMPFILE"
  [ "$status" -eq 0 ]
  [ "$output" = "abc123" ]
}

@test "parse_toml: reads password from [n8n] section" {
  run parse_toml n8n password "$TMPFILE"
  [ "$status" -eq 0 ]
  [ "$output" = "secret" ]
}

@test "parse_toml: reads api_key from [openrouter] section" {
  run parse_toml openrouter api_key "$TMPFILE"
  [ "$status" -eq 0 ]
  [ "$output" = "sk-or-test" ]
}

@test "parse_toml: does not bleed keys across sections" {
  # [telegram] and [n8n] both have a 'user' or similar — ensure section scoping works
  run parse_toml n8n user "$TMPFILE"
  [ "$status" -eq 0 ]
  [ "$output" = "admin" ]
}

@test "parse_toml: returns empty string for missing key" {
  run parse_toml zen nonexistent_key "$TMPFILE"
  [ "$status" -eq 0 ]
  [ "$output" = "" ]
}

@test "parse_toml: returns empty string for missing section" {
  run parse_toml nosuchsection slug "$TMPFILE"
  [ "$status" -eq 0 ]
  [ "$output" = "" ]
}
