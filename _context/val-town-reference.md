# val.town reference — argos

Practical notes for deploying and operating the Argos Telegram bot on val.town.

## What "the val" is

One HTTP-type val on Brian's `brian1` account, owned by his val.town account.
The val is a single Deno/TypeScript project: one `main.ts` (HTTP + cron entry)
plus sibling `.ts` modules. The val is BOTH the Telegram webhook target AND
the cron host — same code, same files, two trigger types.

- **Prod val id:** `e534cea8-432e-11f1-8dff-42b51c65c3df` (bot `@argostherobot`)
- **Webhook URL pattern:** `https://brian1--<id-without-dashes>.web.val.run`
- **Cron schedule:** `0,15,30,45 * * * *` UTC (every 15 min)
- **Dev val:** separate val on the same account backing `@hello_argobot`.
  Distinguished from prod by `BLOB_PREFIX` env var.

## Local ↔ val mapping

Local source lives in `telegram-agent/share/`. Files map 1:1 to val paths
(`storage.ts` → `storage.ts`, etc.) with ONE exception: `share/multi-bot.txt`
is pushed as `main.ts` on the val and registered as type `http`. Everything
else is type `script`. Historical accident — the `.txt` extension predates
val.town's TS support and was never renamed.

The val IS the source of truth at runtime; `share/` is the local working
copy. Pushes are one-way (local → val). Pulls (val → local) exist via
`pull.py` for snapshotting.

## Deploy workflow — `claudespace/push.py`

```
python3 claudespace/push.py              # push DEFAULT_FILES set
python3 claudespace/push.py share/foo.ts # push specific file(s)
```

The script reads `VAL_TOWN_API_TOKEN` from `~/.argos.env`, then PUTs each
file to `https://api.val.town/v2/vals/<VAL_ID>/files?path=<name>` (falls
back to POST on 404). DEFAULT_FILES covers the core set: storage, tools-base,
friends, reader, library-shelves, journals-page, library-page, pages, routes,
multi-bot.txt. Add new files explicitly as args, or update DEFAULT_FILES.

There is no build step. Changes are live within seconds of a successful PUT.

## Hard constraints / quirks

- **80,000 char file size limit per val file.** `main.ts` (`multi-bot.txt`)
  has historically oscillated at the limit; new features required extraction.
  Subsequent refactors split out `crons.ts`, `routes.ts`, `clients.ts`,
  `storage.ts`, `telegram.ts`, `librarian.ts`, etc. Stay aware when adding
  large prompts/strings.
- **HTTP request timeout ~60 sec** (free tier). Anything longer (long TTS
  synth, deep search) must be deferred to cron. See the audio pre-cache
  pattern in `reader.ts`.
- **No self-edits.** A running val cannot modify its own source files —
  that's why the `/agents` prompt editor was replaced by the overlay blob
  system (`overlays.ts`).
- **Blob storage is account-scoped, not val-scoped.** Prod and dev would
  collide on chat IDs without `BLOB_PREFIX`. Prod sets `BLOB_PREFIX="prod-"`;
  dev leaves it unset. All modules import `blob` from `./prefixed-blob.ts`,
  never from `std/blob` directly. Static shared assets (character-art) bypass
  the prefix via an allow-list.

## Did the deploy work? Where are logs?

- **val.town web UI** — open the val, "Logs" tab shows console output and
  errors per request. This is the primary debug surface.
- **`/dashboard?secret=<CONFIG_SECRET>`** — admin events log
  (`events.json` blob). Look for `tg_send_error`, `chat_error`, `ai_call`.
  If a user reports the bot "didn't respond," check here first — both
  `tgSend` and `tgSendAudio` log non-2xx as `tg_send_error` events.
- **Smoke test:** `python3 share/run_tests.py` (HTTP probes for every page
  + behavioral webhook simulator). Fill in token + secret placeholders at
  the top of the file first.

## Environment variables

Set on the val via val.town UI → Settings → Environment Variables.

Required:
- `VAL_TOWN_API_TOKEN` — used by `push.py` (lives in `~/.argos.env` locally, not on the val itself)
- `TELEGRAM_BOT_TOKEN` — from BotFather
- `TELEGRAM_WEBHOOK_SECRET` — pinned via `/?action=register-webhook&secret=<CONFIG_SECRET>`
- `OPENAI_API_KEY` — chat (mini-model + transcribe), image gen, TTS fallback
- `ANTHROPIC_API_KEY` — main chat model (claude-sonnet-4-6)
- `TAVILY_API_KEY` — web search
- `CONFIG_SECRET` — signs tokenized per-user URLs; protects admin surfaces. 32+ chars.
- `HOST_NAME` — your name on admin pages

Optional:
- `DEEPGRAM_API_KEY` — preferred TTS (aura-2)
- `OPENAI_ADMIN_KEY` — canonical cost panel
- `BLOB_PREFIX` — `"prod-"` on prod; unset on dev
- `ALLOWED_CHATS` — comma-separated chat IDs; if set, bot ignores other users

Rotate `VAL_TOWN_API_TOKEN` periodically (token grants full code-push access).
