# Handoff — argos-telegram-agent
*2026-04-25. Written at the end of a long build session. Supersedes HANDOFF.md from 2026-04-20.*

---

Hey. This one's been a productive day. Brian's back in San Diego from Mexico City, the morning script was failing, and we fixed a bunch of things. Here's where things stand.

## What we fixed today

### Rate limit crashes (the main event)
Brian's Anthropic account is capped at 30k input tokens/minute, *excluding cache reads*. The cache TTL is 5 minutes — on a walk where he sends voice notes every 8-10 minutes, the cache is cold on basically every message. The system prompt (~10k tokens) counts as uncached input each time.

The old fix (`.slice(-20)` on conversation history) was too blunt. Replaced with `capHistory()` — keeps the last 8k *characters* of conversation history regardless of message count. Long voice note sessions were the real killer; a single 5-minute transcription can be 1k+ tokens.

Morning script was also crashing: it loaded yesterday's full conversation file as context, and after a heavy session that file was huge. Fixed by capping it to the last 4000 chars.

### Timezone: now PDT (UTC-7)
Brian is back in San Diego. Updated `LOCAL_OFFSET_HOURS` to -7 in both `worker/src/index.js` and `morning.py`. Morning cron updated from `0 12 * * *` to `0 13 * * *` (6am PDT). Switch back to -6 and `0 12 * * *` when he's in CDMX.

### Morning script: artwork images
`wikipedia_image()` was returning portrait headshots because `pageimages` API always returns the infobox thumbnail. Replaced with a smarter approach: fetch all article images via `prop=images`, filter out portrait-like filenames (using surname matching + keyword list), pick the first artwork candidate. Falls back to `pageimages` if nothing passes the filter.

### Morning script: hallucinated links
Two-pronged fix: (1) system prompt now explicitly tells Claude not to include hyperlinks for written works — title and author only; (2) `strip_dead_links()` validates any URLs that appear anyway and strips ones that don't resolve. Runs before sending.

### New commands
- `/bug <text>` — writes to `memory/inbox/bugs.md`, no LLM, instant
- `/note <text>` — writes to `memory/inbox/notes.md`, no LLM, instant
- `/emergent-ventures` — renamed from `/ev` (alias kept)
- `/phone-that-cares` — renamed from `/ptc` (alias kept)

### Emergent Ventures mode
`/emergent-ventures` runs a stateless Q&A to fill out `memory/projects/ev-application.md`. Asks one question at a time, sets a pending marker in the file, auto-intercepts the next plain message as the answer. 7 questions covering the standard EV application structure. `/emergent-ventures stop` to pause, `/emergent-ventures status` to check progress.

### Mentor lenses
The system prompt now has explicit when-to-invoke triggers for specific mentor voices. Previously Argos just knew mentors existed but had no trigger logic — it defaulted to base mentor every time. Now:
- `[Caro]` — writing, craft, seeing clearly, power dynamics
- `[McCarthy]` — sentences, prose rhythm, literary aesthetic
- `[Calatrava]` — design, technical depth in service of beauty
- `[Scott Alexander]` — systems thinking, Moloch dynamics
- `[Shinzen]` — meditation, contemplative practice
- `[Evil Brian]` — acerbic honest read, avoiding the obvious

Brian trimmed `mentors.md` significantly — removed DFW, Adrian, Taft, and the historical inspiration figures (Wright Brothers split off into Calatrava entry, Zhou Enlai/Machiavelli kept). Adrian and Taft were removed because the LM doesn't have enough context on them to channel them usefully.

### Weekly summary in context
`loadRecentSummary()` now runs in parallel with `loadCore()` and `loadTodayMessages()`. Tries current week, -1 week, -2 weeks. If found, injects it into the system prompt as a "RECENT CONTEXT" block. Gives Argos rolling medium-term memory without loading raw conversations.

### CLAUDE.md files
Created `CLAUDE.md` in this repo — brief map of the memory layout for Claude Code sessions opened here. Also updated Brian's global `~/.claude/CLAUDE.md` with a full memory map covering all his major file locations (PTC, personal archive, Obsidian, this memory folder).

## Current command list

| Command | What it does |
|---------|-------------|
| `/morning` | Morning check-in SOP (Tasshin's structure, one question at a time) |
| `/evening` | Evening check-out, Three Questions (Play/Learn/Serve) |
| `/area <name>` | Area check-in SOP for any area in areas.md |
| `/phone-that-cares [thought]` | Loads full PTC doc into this turn (alias: `/ptc`) |
| `/emergent-ventures` | EV grant application Q&A mode (alias: `/ev`) |
| `/remember <text>` | Appends to facts.md |
| `/note <text>` | Appends to inbox/notes.md |
| `/bug <text>` | Appends to inbox/bugs.md |
| `/usage` | Shows Anthropic + Whisper cost breakdown |

## Architecture reminder

- **Worker** (`worker/src/index.js`): Cloudflare Worker, deployed via `cd worker && ./node_modules/.bin/wrangler deploy`. Handles Telegram webhook, transcription, all commands.
- **Morning** (`morning.py`): GitHub Actions, runs daily at 13:00 UTC (6am PDT). Reads local files from checkout, writes to `memory/sent.md`, commits and pushes.
- **Memory**: All in GitHub (`b-r-ia-n/argos-agent`), synced to Mac at `:15` each hour via LaunchAgent. Worker reads/writes via GitHub API. Morning script reads local checkout.
- **Prompt cache**: System prompt cached with `cache_control: ephemeral`. Cache reads excluded from 30k TPM limit. TTL is 5 minutes — cold on most walk-paced nav chats.

## Known rough edges / things not yet built

- `/note` and `/bug` land in GitHub but there's no push notification to Brian's desktop. He has to actively look. A Claude Code hook or session-start check would close this.
- The weekly summaries now load into Argos context, but `weekly.py` only runs if ≥4 days had real conversations. Light weeks won't have a summary.
- Telegram caption limit (1024 chars) on art days — if the morning message is long, it gets truncated. Fix would be: send photo, then follow-up text message.
- Bot and worker still named after old "stoop" brand. Cosmetic, not worth fixing.
- `/mode` not fully implemented.

## What's worth doing next

- Character cap on the morning script's other inputs (taste files, essays) if TPM issues persist
- `/note` bridge to Claude Code (session-start check for recent inbox items)
- Ambient scout jobs (surf, tides, ISS passes) — architecture supports it trivially via more GitHub Actions workflows

---

Good luck. Brian's sharp and his instincts for simplicity are load-bearing. If he pushes back on something, take it seriously.

— Claude Sonnet 4.6, 2026-04-25
