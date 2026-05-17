# Argos architecture

Condensed orientation for a fresh Claude instance. For the full history, see
`telegram-agent/HANDOFF-2026-04-30.md` (~43kb).

## What Argos is

A multi-tenant Telegram bot ([@argostherobot](https://t.me/argostherobot),
dev mirror `@hello_argobot`) that talks with you, remembers what you tell it,
sends a daily morning offering (art / essay / fragment), runs Tasshin's
morning/evening/area/connect SOPs, and silently classifies what you say into
shelves of your own data ("library of you"). One val.town val per
deployment, all per-user state in val.town blob storage keyed by Telegram
chat_id. Shipped publicly May 4, 2026; small friends-only scale.

## Request flow

```
Telegram message
  → POST <val>/  (webhook)
  → main.ts handleTelegramUpdate
  → enqueueTurn() into librarian-queue (async sense-making, OFF the turn)
  → buildSystemPrompt (mode + overlays + context + facts + persona + people + SOP)
  → selectTools (contextual: onboarding | library | people | ritual | always)
  → callOpenAI() in clients.ts → routes to Anthropic (claude-sonnet-4-6) or OpenAI
  → tool-call loop (up to 5 rounds): tools-base / friends / reader / librarian
  → tgSend reply, log to archive + history, recordSpend
```

Cron path: val cron every 15 min → `runAllCrons()` in `crons.ts` →
morning-prep, morning-deliver, closet, evening, weekly, distill,
audio-precache, librarian-batch.

## Key modules (share/)

- **`main.ts`** (`multi-bot.txt` locally) — webhook + cron entry, turn handler, slash commands, tool dispatch, system prompt build
- **`storage.ts`** — blob key registry, types, load/save helpers, spend caps, event log
- **`prefixed-blob.ts`** — wrapper over `std/blob` applying `BLOB_PREFIX` per-val
- **`telegram.ts`** — `tgSend`, `tgReact`, `tgSendAudio`, `tgSendDocument`, file fetch
- **`clients.ts`** — `callOpenAI` (dispatches to Anthropic or OpenAI), `transcribe`, `tavilySearch`, PRICING
- **`anthropic-adapter.ts`** — translates OpenAI-shaped messages/tools ↔ Anthropic format
- **`crons.ts`** — cron tasks (morning compose+deliver, evening, closet, distill, weekly)
- **`routes.ts`** — HTTP route dispatcher
- **`librarian.ts`** — async "data engine": queue-drained classifier, shelf updates, distillation
- **`classifier.ts`** — silent mini-model classifier for life-data shelves
- **`tools-base.ts`** — base tool schemas (memory, facts, settings)
- **`friends.ts`** — friend memory corpus + 9 person tools
- **`reader.ts`** — reading list, reader mode, TTS pipeline, sequence composer
- **`indexer.ts`** — library item indexer (summary + topics + register + author)
- **`modes.ts`** — the conversational interlocutors (see overlay/modes below)
- **`overlays.ts`** — three-layer prompt resolution (user > global > base)
- **`start-text.ts`** — onboarding + SOP prompts (morning, evening, area, connect)
- **`morning-shapes.ts`** — daily-offering shape catalog (single_image, historical_artifact, etc.)
- **`library-shelves.ts`** / **`library-page.ts`** / **`library-curation.ts`** — shelf + reading-list UIs
- **`pages.ts`** / **`landing-v2.ts`** / **`dashboard.ts`** / **`system-overview.ts`** — admin + public pages
- **`playground.ts`** — side-by-side mode compare
- **`triage.ts`** / **`nostalgia.ts`** — post-import review, dead-link archive

## Blob storage schema

All keys are namespaced by `BLOB_PREFIX` (e.g. `prod-`), then keyed by chat_id.

**Per-user (`-{chatId}` suffix):** `name-X.json`, `context-X.json`,
`custom-instructions-X.json`, `timezone-X.json`, `facts-X.json`,
`feedback-X.json`, `persona-X.json`, `history-X.json` (48k tok cap),
`archive-X.json` (untruncated raw), `people-X.json`, `reading-X.json`
(the library), `sequences-X.json`, `reminders-X.json`,
`pending-morning-X.json`, `last{morning,checkin,evening,distill,closet}-X.json`,
`firstseen-X.json`, `sop-X.json`, `onboarding-X.json`, `config-X.json`,
`mode-X.json`, `triage-X.json`, `log-categories-X.json`, `log-entries-X.json`,
`prompt-overlays-X.json`, `audio-X-<id>.mp3` + chunked `-part-N.mp3`.

**Global:** `active-chats.json`, `events.json`, `bug-reports.json`,
`prompt-overlays-global.json`, `librarian-queue-X.json`,
`librarian-deadletter.json`, `character-art-*` (unprefixed shared assets).

## Tools system

`ALL_TOOLS = [...BASE_TOOLS, ...FRIENDS_TOOLS, ...READER_TOOLS]` in `main.ts`.
Each tool has an `_availability` tag: `always` | `onboarding` | `library` |
`people` | `ritual`. Per-turn, `selectTools()` filters by detected context
(regex on user text + SOP state + onboarded flag), then strips the
`_availability` field before sending to the model. Tool execution dispatches
by name to `executeFriendsTool` / `executeReaderTool` / inline base-tool
handlers. Loop runs up to `MAX_TOOL_ROUNDS = 5`.

## Memory / library system

Two parallel tracks:

1. **Conversational memory** — `history` (token-capped working memory),
   `archive` (untruncated), `facts` (durable list), `persona` (LLM-evolved
   note), `context` (user's own self-description), `custom-instructions`,
   `taste-profile`. Friend memory in `people-X.json` (corpus + per-person notes).

2. **Library of you** — librarian classifier silently routes each user turn
   into shelves (meditation, food, exercise, money, todo + user-created via
   `propose_new_shelf` / `confirm_new_shelf`). Plus a reading list:
   articles/bookmarks saved via Chrome extension or chat, indexed by topic /
   author / register, with audio transcoding for long pieces. Web surfaces:
   `/library`, `/library/<shelf>`, `/library/reading`, `/library/argos-log`,
   `/library/taste-profile`, `/sequence?slug=X`, `/reader`.

## Overlay / modes system

Three-layer prompt resolution in `overlays.ts`:
**per-user overlay > global overlay > base** (source constants).
Overlays are blobs (`prompt-overlays-{cid}.json`,
`prompt-overlays-global.json`) edited via `/agents` admin page or per-user
editor. Replaces the old self-mutating-source approach which broke because
val.town blocks self-edits.

Current modes (as of HANDOFF, post-cull from 22 → 6): `journal` (default,
RoboJournal — attentive but not reactive), `caro` (RoboCaro — Robert Caro,
turn-every-page), `mccarthy` (RoboMcCarthy — Cormac McCarthy register),
`shinzen` (Shinzen Young), `odysseus`, `hanuman`. Plus user-creatable
custom mentors (paste a system prompt → appears under `/mode`). Mode
persists per-user in `mode-{cid}.json`. `/playground` compares modes
side-by-side on the same input.

The `journal` default carries an anti-sycophancy "Pushback Policy" block
(confidence-gated agreement, banned openings, steel-man-first).

## Scale

3 live testers at the time of the 2026-04-30 handoff; shipped publicly to
friends May 4. Designed for <10 users, friends-only. Per-user soft cap
$5/day, global circuit breaker $50/day.
