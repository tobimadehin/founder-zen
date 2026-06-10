#!/usr/bin/env python3
"""Generate .env from zen.toml for local Docker Compose."""

import json
import os
import secrets
import sys

try:
    import tomllib
except ImportError:
    sys.exit("ERROR: Python 3.11+ required (needs built-in tomllib)")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "zen.toml")
KEY_FILE = os.path.join(ROOT, ".n8n_key")
ENV_FILE = os.path.join(ROOT, ".env")

if not os.path.exists(CONFIG):
    sys.exit(f"ERROR: zen.toml not found at {CONFIG}\nCopy zen.toml.example and fill it in.")

with open(CONFIG, "rb") as f:
    c = tomllib.load(f)

if os.path.exists(KEY_FILE):
    with open(KEY_FILE) as f:
        enc_key = f.read().strip()
else:
    enc_key = secrets.token_hex(32)
    with open(KEY_FILE, "w") as f:
        f.write(enc_key)
    print(f"Generated new N8N_ENCRYPTION_KEY -> {KEY_FILE}")

slug = c["zen"]["slug"]
endpoints = json.dumps(c.get("monitor", {}).get("endpoints", []))
reddit = c.get("reddit", {})
subs = ",".join(reddit.get("subreddits", []))
kws = ",".join(reddit.get("keywords", []))

lines = [
    f"ZEN_SLUG={slug}",
    f"N8N_USER={c['n8n']['user']}",
    f"N8N_PASSWORD={c['n8n']['password']}",
    f"N8N_ENCRYPTION_KEY={enc_key}",
    # localhost for local dev — no Cloudflare Tunnel needed
    "WEBHOOK_URL=http://localhost:5678",
    f"ZEN_BOT_TOKEN={c['telegram']['bot_token']}",
    f"ZEN_CHAT_ID={c['telegram']['chat_id']}",
    f"ZEN_OPENROUTER_KEY={c['openrouter']['api_key']}",
    f"ZEN_PRIMARY_MODEL={c['openrouter']['primary_model']}",
    f"ZEN_VISION_MODEL={c['openrouter']['vision_model']}",
    f"ZEN_REDDIT_CLIENT_ID={reddit.get('client_id', '')}",
    f"ZEN_REDDIT_CLIENT_SECRET={reddit.get('client_secret', '')}",
    f"ZEN_REDDIT_USER_AGENT={reddit.get('user_agent', '')}",
    f"ZEN_REDDIT_SUBREDDITS={subs}",
    f"ZEN_REDDIT_KEYWORDS={kws}",
    f"ZEN_NTFY_URL={c['ntfy']['base_url']}",
    f"ZEN_NTFY_TOPIC={c['ntfy']['topic']}",
    f"ZEN_MONITOR_INTERVAL={c['monitor']['interval_seconds']}",
    f"ZEN_MONITOR_ENDPOINTS={endpoints}",
    f"ZEN_GITHUB_TOKEN={c['github']['token']}",
    f"ZEN_GITHUB_CSTATE_REPO={c['github']['cstate_repo']}",
    f"ZEN_GITHUB_CSTATE_BRANCH={c['github']['cstate_branch']}",
    f"ZEN_BRAVE_KEY={c['brave']['api_key']}",
    f"ZEN_ZEPTO_KEY={c['zepto']['api_key']}",
    f"ZEN_FROM_EMAIL={c['zepto']['from_email']}",
    f"ZEN_ADMIN_EMAIL={c['zepto']['admin_email']}",
]

with open(ENV_FILE, "w") as f:
    f.write("\n".join(lines) + "\n")

try:
    os.chmod(ENV_FILE, 0o600)
except Exception:
    pass  # Windows — chmod is a no-op but that's fine

print(f"Wrote {ENV_FILE} ({len(lines)} vars)")
