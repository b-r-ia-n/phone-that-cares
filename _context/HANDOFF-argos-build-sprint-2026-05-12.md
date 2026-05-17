# Handoff — argos build sprint, 2026-05-12

Picks up from `~/Desktop/Projects/argos-telegram-agent/share/HANDOFF-2026-05-04-morning.md` (refreshed 2026-05-11). Today's session was a big day on argos — mapped the architecture for a friend conversation, then ran a coordinated 6-agent build sprint, then pushed most of it to prod. Several real product threads remain open.

---

## What we were working on

Brian had a conversation planned with his friend Brighton (LLM systems engineer). Goals for the day:

1. **Make the argos codebase legible** — what's where, how it works, what could work better. Output: a single sense-making HTML doc Brian could share. **Done.**
2. **Capture Brighton's wishlist** of features Brian wants but doesn't have. **Done.**
3. **Build a live editor** so Brian (and eventually users) can edit SOPs, system prompts, mode prompts, and morning-shape instructions without opening Claude Code. **Done — live and verified on prod.**
4. **Run a parallel build sprint** on the highest-priority items from Brighton's wishlist. **Done — 4 of 6 deliverables pushed to prod, 2 staged.**

---

## What's done — concrete

### Architecture doc

Single HTML file at **`~/Desktop/argos-architecture-2026-05-11.html`**. Contains:
- 15 sense-making questions a smart engineer would ask, with answers
- 8 Mermaid diagrams (the big picture, the modules box blown up, message arrival decision tree, single-turn sequence diagram, memory layout, SOP state machine, day-in-the-life gantt, tool dispatch + external APIs, HTML page surface)
- Full 27-tool inventory with availability gating
- Cost surface table with biggest spend drivers
- Open threads list

Brian liked this and asked specifically for diagram 1b (the "modules" box expanded) which has its own section + per-file role table.

### `/agents` live editor on prod ✅

URL: `https://brian1--4ef325f8476a11f18e0742b51c65c3df.web.val.run/agents?secret=poiupoiu09870987`

Per-user editor at: `/agents/user?id={cid}&token={signedChatIdToken}` — linked from `/settings`.

**Three-layer prompt resolution** (the core architectural primitive — built by Agent A):
- **Base** = source constant (e.g., `SOP_MORNING` in `start-text.ts`)
- **Global overlay** = Brian's `/agents` edits in `prompt-overlays-global.json` — applies to everyone
- **Per-user overlay** = each user's `/agents/user` edits in `prompt-overlays-{cid}.json` — applies just to them

Resolution order: user > global > base. Cleared overlays (set to `null`) fall through.

Editable: SOP_MORNING, SOP_EVENING, ONBOARDING_PROMPT, TOOL_GUIDANCE, ART_PROMPT_FRAGMENT, ART_FEW_SHOTS, START_MSG_1, START_MSG_3, every mode's `prompt`, every morning shape's `instruction`.

**Why blob overlays, not source-file mutation:** val.town **blocks self-edits from inside a val** — token scope downgrades when the request originates from within val.town's runtime. The original design (mutate source files via API) hit a 403 from inside even with full-scope tokens. Overlays sidestep this entirely and compose perfectly with per-user overrides.

### Sprint deliverables (6 agents)

All agent findings are at `~/Desktop/Projects/argos-telegram-agent/memory/projects/build-2026-05-11/` — `agent-A.md` through `agent-F.md` plus `README.md`. Read those for full detail.

| # | Title | Status on prod |
|---|---|---|
| A | Overlay editor + per-user overlays (above) | ✅ pushed (v100-106) |
| B | Claude LLM swap (Sonnet 4.6) with prompt caching | **staged, NOT pushed** |
| C | Daily 9pm health digest + missing-art sweep | ✅ pushed (v107, v110) |
| D | Morning art audit + Tavily investigation | report only |
| E | Librarian as async runtime + user-created shelves | ✅ pushed (v109, v110, v111) |
| F | Subtle in-chat SOP edit affordance | ✅ pushed (v108) |

**Total tests written across the sprint: 91 (50 librarian + 18 overlay + 23 health), all green.**

---

## Current state per piece

### Pushed and live

**Agent C — health-check + sweep** (`share/health-check.ts`, wired in `crons.ts`):
- Daily 9pm Brian-local digest. Reads 24h of `events.json`, formats one tg message. Suppresses on truly quiet days.
- Idempotent via `last-health-check.json` blob.
- Sample output: `*argos health — 2026-05-12*\n24h: 3 active users, 13 events, ~$0.07\nmornings: 3 delivered, 1 auto-cleared, 1 missing art\nphotos: 1 ok / 1 failed\ntool errors: find_artwork×2, web_search×1\nsop auto-cleared: 1`
- Sweep runs 10am–noon Brian-local. Flags mornings where art was wanted but no `send_photo` event landed.
- **Known gap:** `morning_delivered_from_pending` doesn't carry `shapes` in its detail, so most prod mornings (which go through the pre-compose path) are blind to the sweep. Documented in agent-C.md as deferred follow-up — plumb `shapes` into `pending-morning-{cid}.json` and surface in the deliver event.

**Agent E — librarian as async runtime** (`share/librarian.ts`):
- New file. Owns classifier dispatch, persona distillation (moved from crons.ts), shelf proposal flow.
- `enqueueTurn` writes to **per-chat queues** (`librarian-queue-{cid}.json`) + an index blob — last-minute fix from the single global queue race condition Agent E originally shipped with.
- `runLibrarianBatch` runs every cron tick (~15 min real, ~5 min effective latency per Brian's stated tolerance), walks the index, drains each chat's queue.
- Dead-lettering after 3 retries → `librarian-deadletter.json`. Nothing silently dropped.
- `propose_new_shelf` / `confirm_new_shelf` for **user-created data types** — when a user says "I want to start logging X" (regex heuristic `detectShelfIntent`), the librarian LLM-shapes a `{slug, name, fields, rationale}` proposal and DMs the user yes/tweak/no. On "yes" it creates a `LogCategory` in `log-categories-{cid}.json`.
- "yes/no/tweak" parsing uses tight regexes — won't intercept incidental yes in a longer message.

**Agent F — onboarding closer mention** (`share/start-text.ts`):
- Single paragraph edit to `ONBOARDING_PROMPT`. Tells the LLM to casually mention (one short clause, no fanfare) at end of onboarding that built-in prompts are editable from /settings. Explicit "don't repeat this in later conversations."
- Decision rationale (good one): morning/evening SOPs are Tasshin-derived intimacy rituals; adding meta-UI nudges to them is exactly the failure mode Brian flagged. Onboarding completion is the one moment where surfacing customizability is *expected* — user just answered "how do you want me to talk to you," already in customization headspace.
- `/edit_sop` chat command was deliberately skipped — "/settings is the one to remember" is undercut by a second command for the same destination.

### Staged, not pushed

**Agent B — Claude swap** (`share/anthropic-adapter.ts`, `share/clients.ts`, `share/test-claude-adapter.ts`):
- Anthropic adapter that translates OpenAI-shape ↔ Claude-shape so no call sites change.
- Dispatcher: `callOpenAI()` routes by model name — `claude*` → adapter, else existing OpenAI path.
- Main model would become `claude-sonnet-4-6`. MINI_MODEL stays `gpt-5.4-mini` on OpenAI (for classifier, vision-gate, make_actionable, draft_reply, distill). Whisper and gpt-image-1 stay on OpenAI.
- 39/39 pure translator tests green. **Live API tests written but NOT run** — Anthropic API key is set on val.town (`ANTHROPIC_API_KEY` env var) but wasn't in local `~/.argos.env` when the agent ran.
- Push commands ready in `agent-B.md`.

**Why not yet pushed:** Two real reasons:
1. Live API round-trip never verified.
2. The `cache_control` breakpoint is currently a **no-op** because argos's system prompt has per-turn timestamp + per-turn memory counts → cache invalidates every turn. Real cache win requires splitting `buildSystemPrompt` into stable (mode, persona, tools) + volatile (timestamp, counts) and putting the breakpoint between. ~30 min follow-up after swap is verified.

### Report only

**Agent D — morning art audit + Tavily investigation** (full report in `agent-D.md`).

Key findings:
- **57% hit rate** on morning art over 8-day window
- **5 send_photo failures** — Telegram's URL-fetch is flaky on ARTIC IIIF and Wikimedia hosts. Fix: download-then-multipart instead of URL handoff to Telegram.
- **Severe artist clustering**: Yoshitoshi 11, Hasui 10, Kiyochika 6, Hiroshige 5 — Japanese ukiyo-e collapse driven by ARTIC's holdings + LLM priors after the "avoid Great Wave/Starry Night" nudge.
- The "8 museum APIs" framing is misleading. Brooklyn, NGA, Smithsonian, Rijksmuseum contributed **zero real hits**. Effectively ARTIC + Wikidata + some MET/Commons.
- **Vision-gate emits no events** → currently unmeasurable. Top fix to add visibility.
- Cost per morning art: $0.06–0.12. Not the real cost driver.

**Tavily:** Brian's currently using ~4 credits/day; free tier is 1,000/mo = **25× headroom**. Keep Tavily. The "almost out of credits" warning Brian saw was likely a one-off; not an ongoing issue. The `tavilyImageFallback` code path has been invoked **zero times** by real users.

**Three recommended fixes (small, in priority order):**
1. Instrument vision-gate with events
2. Fix send_photo flakiness (download-then-multipart)
3. Add a global `recently-shown-art.json` blob to break cross-user repetition

---

## What's NOT done / next steps, prioritized

### Top priority (decisions waiting on Brian)

1. **Push agent B (Claude swap).** Two-step:
   - First: run live API test with the Anthropic key to verify a real round-trip works.
     ```bash
     ANTHROPIC_API_KEY=<your-key> deno run --allow-env --allow-net \
       /Users/b/Desktop/Projects/argos-telegram-agent/share/test-claude-adapter.ts
     ```
     (~$0.05). Add `ANTHROPIC_API_KEY=...` to `~/.argos.env` for convenience.
   - Then push: commands in `agent-B.md`.
   - Then: do the cache-split follow-up (~30 min). Split `buildSystemPrompt` into stable+volatile, move the `cache_control` breakpoint between them. Real savings (50-70% on cached portion) only happen after this.

2. **The "tweak" path in the librarian.** When a user replies "tweak" to a shelf proposal, the librarian DMs "tell me what to change" but doesn't yet re-shape on the next reply. Two design options:
   - (a) Complete the loop (5 lines): on next turn, treat non-yes/no text as the tweak hint and re-run `shapeProposal` with it.
   - (b) ALSO block further classification while a proposal is in `tweaking` state. Stronger constraint — feels more "librarian-like" but cuts off other classification.

3. **Agent D's three small fixes** — instrument vision-gate, fix send_photo flakiness (download-then-multipart), global recently-shown blob. Each is small (~30 min). Could be one sub-agent that does all three.

### Medium priority

4. **Per-chat queue migration in librarian.** Current state on prod uses per-chat queues + an index — the race condition was fixed before deploy. But if you discover that the queue index gets out of sync with the actual per-chat blobs (e.g., a chat in the index that has no queue blob, or vice versa), there's no reconciliation step yet. Worth adding a sanity sweep in `runLibrarianBatch`.

5. **Plumb `shapes` into `morning_delivered_from_pending`.** Required for Agent C's missing-art sweep to actually work on most prod mornings. ~10 lines in `crons.ts`.

6. **`pending-shelves-{cid}.json` accumulates indefinitely.** Status field tracks "pending/accepted/rejected/tweaking" but the blob grows. Needs a TTL or max-entries prune. Mild concern at current scale.

7. **`main.ts` is at 79789 bytes — 211 under val.town's 80k limit.** Next non-trivial addition needs an extraction. Most natural: pull `executeTool` into `tools-handlers.ts` (would also fix the schema-vs-handler inconsistency where `reader.ts` and `friends.ts` ship both but `tools-base.ts` only ships schemas).

### Future / Brighton's wishlist (deferred, but committed-to)

In `~/Desktop/Projects/argos-telegram-agent/memory/projects/future-ideas-2026-05-11.md`. Summary:

- **Spotify playlist as an SOP** — concrete demo of "SOPs as composable blocks"
- **WhatsApp via Beeper bridge** — abstract `telegram.ts` into Messenger interface, add Matrix adapter
- **Talk-to-Claude-Code via telegram** — lower-friction way to ask for builds/fixes; possibly its own bot in a separate thread
- **AnkiDroid linkout** instead of rebuilding flashcards; possibly a lightweight "argos surfaces a concept from 3 weeks ago" cron
- **Texting friends back** — tabled until shape is clearer

### Brian's morning-art tone preference (do yourself, no agent needed)

Brian explicitly asked to *tone down* the LLM commentary on morning art — not as silent as Brighton wants, but less reactive. **No "here's what I like about it" voice.** One or two lines of context fine ("this is where John Muir was when he took this photo"). The `ART_PROMPT_FRAGMENT` is now editable via `/agents` — Brian's plan was to do this edit himself. He may or may not have done it yet; check the global overlay blob to see.

---

## Decisions made

### Architectural

- **Blob overlays > source mutation.** Original `/agents` editor wrote directly to source files via val.town API. This worked from Brian's terminal but 403'd from inside the val itself (val.town downgrades token scope on self-edits — known platform behavior, not configurable). Pivoted to overlay blobs. **Bonus:** the same primitive supports per-user overrides, which is the architectural foundation for the "platform, not a bot" thesis Brian articulated (see Brighton convo notes).
- **Per-chat librarian queues, not global.** Single global queue had a race where two near-simultaneous turns from different users would clobber each other on the load-push-save pattern. Per-chat blobs + an index blob fix the cross-user case. Within-chat races are negligible (one user texting themselves <200ms apart is rare and the worst case is a single dropped turn that the next message recovers from).
- **Librarian owns ALL sense-making** — classifier, distill, shelf proposals. Main bot's job is reduced to "talk to users." Matches Brian's framing ("main bot degrades when there's too much in memory").
- **Shelf proposals NOT exposed as LLM tools to the main bot.** Only the librarian creates shelves, via async functions fired by the intent heuristic. Cheaper, simpler. If we want LLM-autonomous proposing later, easy to upgrade.
- **Onboarding closer is the ONLY in-chat SOP-edit mention.** Brian was clear: not in morning/evening rituals (intimacy moments), not preachy. Settings page link is the canonical surface.
- **Keep Tavily.** 25× headroom on free tier. The credit warning Brian saw was likely a one-off. Don't migrate to alternatives unless quota actually depletes.
- **Sonnet 4.6 as the Claude swap default** (not Opus). Cost-comparable to gpt-5.4; prompt caching makes it net cheaper. Opus 4.7 would be 5-6× more expensive — only worth it if Brian explicitly wants max-quality voice.
- **Don't auto-deploy from agents.** Each agent stages patches + writes push commands; Brian reviews diffs and pushes. Exception was Agent A (the editor itself was already half-broken so the bar was "doesn't make worse"). This rule is in `memory/projects/build-2026-05-11/README.md`.

### Process

- **Tests are mandatory for sub-agents.** Each agent in the sprint had to write tests, run them green, and include output in their findings doc. Caught a few bugs early.
- **Shared findings dir** at `memory/projects/build-2026-05-11/` — so agents can read predecessors and Brian has one place to look.
- **Cost soft-target $5/agent, hard ceiling $10.** Most agents came in well under.

---

## Decisions deferred (worth surfacing to Brian)

1. **Librarian "tweak" path completion** (see above). Two options spelled out. Five-line code change but the *block-during-tweaking* behavior is the real design decision.
2. **Cache-split refactor for `buildSystemPrompt`** to make Claude prompt caching actually work. ~30 min, real savings.
3. **Anki: build flashcards in argos vs link out to AnkiDroid.** Brian leaned link-out. Open: is there a deep link scheme to AnkiDroid? (Brief research item, future ideas doc.)
4. **WhatsApp vs Telegram primary.** Brian prefers WhatsApp. Beeper bridge is feasible. Hasn't been built. Probably the next big architectural move after this sprint settles.
5. **Bot-talks-to-Claude-Code feature.** Brian wants this; doesn't know its shape. Lives in future-ideas. Important: he wants it as a *separate test-bot thread* so it doesn't pollute the main journaling bot.
6. **Two-bot architecture** (literal second val/bot for the librarian, vs logical separation within one val). Currently implemented as logical separation. Brian's stated preference was unclear — agent E asked but Brian moved on. The logical separation is good enough until proven otherwise.

---

## Things to watch out for

### Deployment

- **val.town blocks self-edits from inside a val.** Tokens get downgraded when API calls originate from val.town's runtime. From Brian's terminal, full-scope tokens work. From inside, even full tokens can return 403 on writes. This is why `/agents` uses blob overlays, not source mutation. If you're adding any new "let users edit code" feature, you must use the same overlay pattern.
- **Per-file deploys aren't transactional.** Today's push had a ~6-second window where `crons.ts` referenced a `librarian.ts` that didn't yet exist on val (caused 500s). **Order matters:** POST new files FIRST, then PUT modified files that reference them. I had it backwards once and immediately had to recover.
- **`/files/content?path=X` returns raw content. `/files?path=X` returns metadata.** Easy to confuse. Cost me 33 empty files on my first pass this morning.
- **val.town env vars are account-wide, not per-val.** Brian named his API token env var `VAL_TOWN_API_KEY` (not `_TOKEN`); the agent reads both names but prefers `_KEY` first.

### Token / API gotchas

- The token Brian first created (`vtwn_251i...`) was read-only — could `GET` but not `PUT` from inside a val. The original token (`vtwn_36LT...`) had full scope. Currently val.town has the full-scope token in `VAL_TOWN_API_KEY`. If save errors return 403 again, that's the cause.
- **Anthropic API ≠ Claude Pro/Max.** Brian's Claude.ai subscription doesn't bill API calls. Anthropic Console (`console.anthropic.com`) is the separate billing system. Brian set the key on val.town this morning.

### Runtime

- **`events.json` is bounded at 1000 events.** Burst days lose older events. Agent C's digest assumes most days don't exceed this; spammy days will under-report.
- **`logEvent` is racy.** Load-push-save with no atomicity. Two concurrent crons writing simultaneously can clobber. Not new, but newly exercised by the librarian's writes. Eventually wants a real append primitive.
- **5-min classifier latency is real.** Shelf reactions used to fire mid-turn; now they fire after the next cron tick. Brian explicitly OK'd this. If a user complains the emoji reaction is slow, point them at the librarian — not at a bug.
- **The "yes" reply edge case.** When a user replies "yes" to a librarian shelf proposal, the main bot ALSO processes the same message and may respond normally. The librarian's confirmation DM arrives shortly after. User sees two responses. Lo-fi but acceptable.
- **`main.ts` is 211 bytes under val.town's 80k file limit.** Next addition needs an extraction. Plan ahead.

### What could break subtly

- **Librarian classifier emoji reactions silently delayed.** If the librarian batch errors and doesn't process the queue, reactions stop appearing. Watch for `librarian_process_error` events. Dead-letter blob catches the worst cases but has no UI.
- **Cache hit rate appears to be 0 after Claude swap.** Currently expected (per-turn timestamp invalidates the breakpoint). Don't conclude the swap is broken until you do the cache-split follow-up.
- **Stale `pending-shelves-{cid}.json` entries.** No auto-cleanup. Old proposals stay forever. Probably fine for now.

---

## Relevant files

### Today's edits (now on val.town prod)

| File | Path | Status |
|---|---|---|
| `agents-page.ts` | `share/agents-page.ts` | New, on prod (Agent A) |
| `overlays.ts` | `share/overlays.ts` | New, on prod (Agent A) |
| `health-check.ts` | `share/health-check.ts` | New, on prod (Agent C) |
| `librarian.ts` | `share/librarian.ts` | New, on prod (Agent E + per-chat fix) |
| `main.ts` | `share/main.ts` | Edited, on prod (Agent A + E) |
| `crons.ts` | `share/crons.ts` | Edited, on prod (Agent C + E + manual merge) |
| `routes.ts` | `share/routes.ts` | Edited, on prod (Agent A) |
| `pages.ts` | `share/pages.ts` | Edited, on prod (Agent A added /agents/user link) |
| `system-prompts.ts` | `share/system-prompts.ts` | Edited, on prod (Agent A) |
| `start-text.ts` | `share/start-text.ts` | Edited, on prod (Agent F's onboarding closer) |

### Today's edits (staged, NOT on prod)

| File | Path | Status |
|---|---|---|
| `anthropic-adapter.ts` | `share/anthropic-adapter.ts` | New, NOT yet on prod (Agent B) |
| `clients.ts` | `share/clients.ts` | Edited for Claude dispatch, NOT yet on prod (Agent B) |

### Tests (local only, not pushed)

| File | Path |
|---|---|
| `test-overlays.ts` | `share/test-overlays.ts` (18 tests) |
| `test-health.ts` | `share/test-health.ts` (23 tests) |
| `test-librarian.ts` | `share/test-librarian.ts` (50 tests after per-chat refactor) |
| `test-claude-adapter.ts` | `share/test-claude-adapter.ts` (39 tests; live tests TBD) |

### Today's documents

| File | Path |
|---|---|
| Architecture HTML | `~/Desktop/argos-architecture-2026-05-11.html` |
| Brighton convo dump | `~/Desktop/Projects/argos-telegram-agent/memory/projects/brighton-convo-2026-05-11.md` |
| Future ideas registry | `~/Desktop/Projects/argos-telegram-agent/memory/projects/future-ideas-2026-05-11.md` |
| Build sprint README | `~/Desktop/Projects/argos-telegram-agent/memory/projects/build-2026-05-11/README.md` |
| All 6 agent findings docs | `~/Desktop/Projects/argos-telegram-agent/memory/projects/build-2026-05-11/agent-{A,B,C,D,E,F}.md` |
| Prior handoff (still load-bearing) | `~/Desktop/Projects/argos-telegram-agent/share/HANDOFF-2026-05-04-morning.md` (refreshed 2026-05-11) |

### val.town access

```bash
set -a; . ~/.argos.env; set +a
# $VAL_TOWN_API_TOKEN = full-scope token
# $VAL_ID_PROD = 46072a84-476a-11f1-86f1-42b51c65c3df (argos)
# Dev val = e534cea8-432e-11f1-8dff-42b51c65c3df (untitled-7955, @hello_argobot)

# List files (metadata only):
curl -sS -H "Authorization: Bearer $VAL_TOWN_API_TOKEN" \
  "https://api.val.town/v2/vals/$VAL_ID_PROD/files?path=&recursive=true&limit=100"

# Get raw content:
curl -sS -H "Authorization: Bearer $VAL_TOWN_API_TOKEN" \
  "https://api.val.town/v2/vals/$VAL_ID_PROD/files/content?path=main.ts"

# PUT modified file:
jq -Rs '{content: .}' < <file> | curl -sS -X PUT \
  -H "Authorization: Bearer $VAL_TOWN_API_TOKEN" \
  -H "content-type: application/json" \
  "https://api.val.town/v2/vals/$VAL_ID_PROD/files?path=<file>" \
  --data-binary @-

# POST new file (path in QUERY, body has {type, content}):
jq -Rs '{type:"script", content: .}' < <file> | curl -sS -X POST \
  -H "Authorization: Bearer $VAL_TOWN_API_TOKEN" \
  -H "content-type: application/json" \
  "https://api.val.town/v2/vals/$VAL_ID_PROD/files?path=<file>" \
  --data-binary @-
```

---

## Context that won't be obvious

### How Brian thinks about this project

- **Argos is a wedge into a bigger thesis.** The Phone That Cares project is about the display layer of phones as an intervention point in attention. Argos is the chat-bot half — proof that a phone can have a *relationship with you*, not just deliver content to you. The platform/SOPs framing in the Brighton convo (read `brighton-convo-2026-05-11.md`) is Brian's articulation of where this goes: SOPs as composable units users define for themselves, librarian as the data engine, argos as the conversational substrate. Today's `/agents` overlay system is the architectural primitive that enables the platform direction.

- **He cares about taste / feel.** Loves Rauno Freiberg aesthetic. Warm off-white #f6f3ec, accent #8a5a2b, Inter `ss01 cv11 tnum`. Lowercase by default in his own writing. The /agents editor uses these and feels in-aesthetic. The bot itself: anti-wellness-app — no streaks, no badges, no progress bars, no encouragement. Anti-LLM-resonance-trap — don't elevate emotional content as "the most important thing." Restraint over volume.

- **He hates ALL-CAPS imperatives in prompts.** "LLMs over-react to that." Soften without losing substance.

- **He distrusts feigned bot personality.** This morning's earlier work removed the "no worries, I'll catch you tomorrow" continuity nudge — felt off because the bot wasn't actually hurt. He wants the bot to be present and useful, not performatively-human.

- **He explicitly OKed liberal Opus use early in the sprint.** Cost wasn't a tight constraint *today*, but he flagged daily cost is creeping. Push the cache-split follow-up after the Claude swap to actually save money.

- **He wants pushback.** "Are you sure?" / "I'd actually recommend X" / "this is a real bug not a polish issue" all welcome. Don't just execute; have a take.

- **He's iterative, not waterfall.** Don't over-plan; ship and adjust. The sprint today shipped 4 of 6 to prod within a few hours — that pace matches how he likes to work.

- **He's running this for ~7 real users.** Himself, Vika (prod), OG, "🗽", Christine, Caroline, Jin Ai (dev). A friend with a Twitter following recently shared argos — could grow.

### Specific things that bit me today, so they don't bite you

1. **The token mystery.** First push of `/agents` worked, save failed with 403. Thought it was token scope (was: read-only token). Brian made a new full-scope token. Save STILL failed with 403. Real reason: val.town downgrades scope from inside the runtime. Wasted ~45 min. Don't try to mutate source from inside a val — use blob overlays.

2. **The "VAL_TOWN_API_KEY" vs "VAL_TOWN_API_TOKEN" name mismatch.** Brian named the env var `VAL_TOWN_API_KEY` on val.town; I'd specced `_TOKEN`. Took a debug endpoint listing visible env keys to discover. The agents-page.ts code now reads both names (and a couple of typos).

3. **The /files/content vs /files API confusion.** `/files?path=X` returns metadata only, not content. Wrote 33 empty files in `/tmp/argos-val-snapshot/prod/` before noticing.

4. **Per-file deploys aren't transactional.** The `librarian.ts` POST failed silently in my first push (used PUT instead of POST for a new file) → 6-second window where `crons.ts` and `main.ts` referenced a non-existent module → 500s. The val recovered when I POSTed the new file. **Rule:** POST new files first, then PUT modified files.

5. **`crons.ts` was edited by both Agent C and Agent E independently.** E ran second and overwrote C's edits. I caught this by grepping for both sets of changes before pushing. If you launch parallel agents that touch the same file in future sprints, either serialize them or do a merge step before pushing.

### Where to start tomorrow

If Brian comes back fresh and asks "what's next":

1. Push agent B (Claude swap) — live-test first, then push, then do the cache-split follow-up.
2. Finish the librarian "tweak" path (decision in agent-E.md).
3. Apply Agent D's three small art-pipeline fixes.
4. Plumb `shapes` into `morning_delivered_from_pending` so Agent C's sweep works.

If Brian is in a bigger-picture mood:

1. WhatsApp via Beeper — biggest unmoved item from the wishlist.
2. Two-bot architecture — separate librarian val vs. logical separation. Brian asked about this but we shipped logical separation. The literal-separation conversation is open.
3. The full "platform, not bot" thesis — what does it look like when users compose SOPs, share SOPs, etc.

---

## Final note

This was a high-momentum day. The sprint was 6 parallel agents → 4 pushed → 91 tests green → real architectural wins (the overlay primitive, the librarian extraction). Brian was generous with autonomy, gave clear feedback on taste questions, and trusted the agents to ship. Tone calibrated well: terse when he wanted terse, opinions when he asked for them, restraint on the things he cares about (no meta-UI in intimacy moments, no wellness-app affordances).

The argos codebase ended the day materially better than it started — sense-making doc shared with Brighton, live editor for SOPs, async librarian, daily health digest, user-created data types primitive — but the next session should focus on **completing what was started** (Claude swap, tweak path, art fixes) before opening new threads.

— Claude (Opus 4.7, 1M context), 2026-05-12 evening Pacific
