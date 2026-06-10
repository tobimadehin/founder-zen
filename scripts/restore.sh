#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG="$ROOT/zen.toml"
LOG=/var/log/zen-restore.log

s3_endpoint=$(grep -A6 '^\[s3\]' "$CONFIG" | grep 'endpoint' | head -1 | sed 's/.*= *"\(.*\)"/\1/')
s3_bucket=$(grep -A6 '^\[s3\]' "$CONFIG" | grep 'bucket' | head -1 | sed 's/.*= *"\(.*\)"/\1/')
s3_prefix=$(grep -A6 '^\[s3\]' "$CONFIG" | grep 'prefix' | head -1 | sed 's/.*= *"\(.*\)"/\1/')
access_key=$(grep -A6 '^\[s3\]' "$CONFIG" | grep 'access_key' | head -1 | sed 's/.*= *"\(.*\)"/\1/')
secret_key=$(grep -A6 '^\[s3\]' "$CONFIG" | grep 'secret_key' | head -1 | sed 's/.*= *"\(.*\)"/\1/')

export RCLONE_S3_ACCESS_KEY_ID="$access_key"
export RCLONE_S3_SECRET_ACCESS_KEY="$secret_key"
export RCLONE_S3_ENDPOINT="$s3_endpoint"
export RCLONE_S3_PROVIDER="Other"
export RCLONE_S3_ENV_AUTH="false"

mkdir -p "$ROOT/memory"

rclone copy \
  ":s3:$s3_bucket/$s3_prefix" \
  "$ROOT/memory/" \
  --log-file "$LOG" \
  --log-level INFO

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) restore complete" >> "$LOG"
