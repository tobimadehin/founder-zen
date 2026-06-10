# founder-zen

Hi, I'm zen. I run on your VPS, answer to your Telegram, and handle the ops work that interrupts your day.

Under 500 lines of code. 5 n8n workflows. 1 config file. You can read the whole thing in an afternoon.

Status monitoring, Reddit research, blog drafts, newsletter copy. All on a $12/mo droplet. No SaaS subscriptions, no data leaving your infra.

Fork me, name me after your company, and point me at your stack.

---

## What I do

- **Watchdog** — HTTP health checks every 30 seconds. You find out about outages before your users do, not after. Fires to Telegram and your phone (ntfy), commits the incident to your cState status page automatically
- **Reddit ICP research** — score threads for relevance across your target subreddits, surface the ones worth reading, skip the noise
- **Blog drafting** — outline, write, and ship a LinkedIn snippet alongside the post
- **Newsletter drafting** — subject lines, copy, ready to paste into your sender

## Before you start

You need these before running setup:

| Thing | Where |
|---|---|
| Telegram bot token + your chat ID | BotFather → `/newbot`, then message `@userinfobot` |
| OpenRouter API key | openrouter.ai |
| Brave Search API key | api.search.brave.com |
| Reddit app (client ID + secret) | reddit.com/prefs/apps → create a "script" app |
| S3 or R2 bucket + credentials | Cloudflare R2 or any S3-compatible provider |
| GitHub PAT + a cState repo | github.com → Settings → Developer settings → Personal access tokens |
| ZeptoMail API key | Your ZeptoMail account |
| Cloudflare Tunnel token | Cloudflare dashboard → Zero Trust → Tunnels → create a tunnel, route to `localhost:5678` |

## Setup

Copy and fill in your config:

```bash
cp zen.toml.example zen.toml
# fill in zen.toml with your keys
```

Base64-encode it:

```bash
base64 -w0 zen.toml
# copy the output
```

Provision a 2GB VPS (DigitalOcean, Hetzner, Vultr — doesn't matter), paste this as **user-data** in the provider UI:

```yaml
#cloud-config
runcmd:
  - export ZEN_TOML_B64="PASTE_BASE64_HERE"
  - bash <(curl -fsSL https://raw.githubusercontent.com/tobimadehin/founder-zen/main/cloud-init.sh)
```

Boot the VPS. In about 3 minutes, zen is running. Send `/draft blog test` on Telegram to confirm.

You never SSH in.

## Commands

| Command | What happens |
|---|---|
| `/draft blog [prompt]` | Outlines and writes a full post, drops it as a `.md` file + LinkedIn snippet |
| `/draft newsletter [topic]` | Parallel subject line + outline passes, synthesized into a send-ready email |
| `/reddit` | Scores today's threads across your target subreddits, sends the top ones |
| anything else | Help text |

The Reddit digest also runs automatically every morning at 8am. Watchdog runs continuously in the background — you don't trigger it.

## Memory

zen reads three files from `/opt/zen/memory/` to personalize its output:

| File | What goes in it |
|---|---|
| `icp.md` | Your ideal customer profile — who they are, their pain points, what they care about |
| `tone.md` | Your writing style — examples, things to avoid, how you sound |
| `subreddits.md` | Target subreddits and keywords to filter by |

These are backed up to S3 nightly and restored on boot. Edit them directly on the server, or via your S3 bucket. The repo never sees them.

## Stack

n8n + Telegram + DeepSeek V4 Flash via OpenRouter + SQLite + Cloudflare Tunnel + ntfy.sh

Workflows live in `workflows/templates/`. The node scripts live in `workflow-scripts/`. `npm run build` compiles them into importable n8n JSON.

## Cost

| Item | Cost |
|---|---|
| VPS (min 2GB RAM) | ~$6-12/mo |
| OpenRouter (DeepSeek V4 Flash) | ~$0.10-0.20/mo |
| Brave Search API | $0 (2000 free/mo) |
| Cloudflare Tunnel | $0 |
| S3/R2 memory backup | $0 (free tier) |
| **Total** | **~$6-12/mo** |

## License
MIT. 
