# Handoff — Argos settings redesign + website carousel + /morning fix
*2026-05-12. Written by Sonnet 4.6 for the next instance.*

---

## What we were working on

Three parallel tracks, all shipped:

1. **Argos settings page redesign** — reorder, cleanup, and lede update in `pages.ts`
2. **Website telegram-bot page** — new lede + 7-screenshot carousel
3. **`/morning` three-questions-at-once bug** — root-caused and fixed

Context: argos launched publicly (~May 4). This session was post-launch polish — making the settings page match the designed mockup, getting real screenshots onto the website, and fixing the one known UX bug before wider exposure.

---

## What's done

### 1. Argos settings page (`pages.ts`)

File: `~/Desktop/PhoneThatCares/telegram-agent/share/pages.ts`
*(Note: this may still be at `~/Desktop/Projects/argos-telegram-agent/share/pages.ts` — the CLAUDE.md shows the repo moved but the old path was what we used. Check both.)*

Changes made and pushed to both vals:

- **New lede** (header): "argos is designed to be something like a minimum viable personal assistant, adding capabilities as it knows more about you. use this page to change how you want it to interact with you." — replaces the old three-tier bullet list.
- **Section reorder**: daily rituals → mode picker ("who's at the other end") → shelves ("what argos collects") → about you → how argos sees you → make your own system prompt → style → facts → reminders → commands. Previously mode picker was first.
- **Removed "what argos is for you" section** — the caps-row section (rituals / people / mentors / library / memory) is gone entirely. The lede replaces its function.
- **Renamed "make your own mentor" → "make your own system prompt"** — Brian is moving away from the "mentor" metaphor as primary framing.
- **Mode cards smaller**: `min-width: 200px → 130px`, `max-width: 240px → 150px`, `padding: 14px 16px → 10px 12px`, portrait-empty font-size `36px → 24px`, portrait-add font-size `48px → 32px`. Goal: show ~2.5 cards on mobile (RoboJournal, RoboCaro, half of RoboMcCarthy visible without scrolling).

Both vals updated (201):
- Dev: `e534cea8-432e-11f1-8dff-42b51c65c3df` (`@hello_argobot`)
- Prod: `46072a84-476a-11f1-86f1-42b51c65c3df` (`@argostherobot`)

### 2. Website telegram-bot page

File: `~/Desktop/PhoneThatCares/website/src/pages/telegram-bot.astro`
*(May be at `~/Desktop/PhoneThatCares/Website/src/pages/telegram-bot.astro` — note capital W)*

Changes:
- **New lede**: full MVPA framing — "Argos is designed to be something like a minimum viable personal assistant, adding capabilities as it knows more about you. With just your name, your timezone, and a few things you love..." (the full paragraph from the settings page, with sentence-case for the website).
- **7-screenshot carousel** replacing the single hero image. Screenshots live at `public/experiments/argos-*.jpg`. Order (first taken → last):
  1. `argos-morning-checkin.jpg` — Telegram chat, morning check-in conversation
  2. `argos-morning-offering.jpg` — morning offering, Tawaraya Sōtatsu painting
  3. `argos-reading-picks.jpg` — reading page, "for right now" picks
  4. `argos-settings-modes.jpg` — settings, mode picker showing RoboMcCarthy active
  5. `argos-settings-rituals.jpg` — settings, daily rituals section (new lede visible)
  6. `argos-library.jpg` — library of Brian, shelf list
  7. `argos-reading-by-thread.jpg` — reading by thread, topic clusters
- **Portrait aspect ratio** override: `.hero :global(.carousel__frame) { aspect-ratio: 9/16; max-height: 600px; }` — overrides the Carousel component's default 16:10 frame for phone screenshots.
- Imported `Carousel` from `../components/Carousel.jsx`.

Deployed via `npx vercel --prod --yes` from the website directory. **Important**: GitHub pushes do NOT trigger Vercel on this project. Always deploy via `npx vercel --prod` from the website folder. The `.vercel/project.json` has the project ID. `vercel` CLI available via `npx vercel`.

**Warning**: `vercel --prod` builds from the local working tree, not from git. There are a lot of in-progress files (brainstorms page, admin pages, comments, etc.) that get included in every deploy. The main pages (index, experiments, telegram-bot) are returning 200 and not visibly broken, but if Brian has half-finished work in experiments.astro or BaseLayout.astro, it'll go live. Stash or be aware.

### 3. `/morning` bug fix

**The bug**: Brian triggered `/morning` manually and got all three check-in questions at once instead of one at a time.

**Root cause**: Two things working against each other:
1. The trigger message `"[user invoked morning check-in]"` is ambiguous — the LLM can read it as "orient the user about the whole session" and front-load all three questions.
2. `SOP_MORNING` said "Move through the three. Default: advance after user's first substantive answer" — but didn't say "ask only one question per turn." The LLM could interpret this as a list to present upfront.

**Fix** (both files pushed to both vals):

`start-text.ts` — changed the opening line of the body of `SOP_MORNING` from:
> "Move through the three. Default: advance to the next question after the user's first substantive answer..."

to:
> "Ask one question per turn — wait for the user's reply before moving on. Begin with question 1 now. Advance to the next question after the user's first substantive answer..."

`multi-bot.txt` — changed trigger from:
> `"[user invoked morning check-in]"`

to:
> `"[morning check-in starting — ask question 1 only]"`

Not yet verified in prod (we fixed it but Brian didn't re-trigger to confirm). Worth doing a `/morning` test in `@hello_argobot` (dev) before trusting it.

---

## Current state

Everything above is live. The settings page, website carousel, and morning fix are all deployed.

The cron on the prod val IS running — verified from event log:
- `morning_pre_composed` at 7:01am Pacific
- `morning_delivered_from_pending` at 2pm (7am user local time)
The handoff from May 4 said it wasn't set up, but it was already running by the time we checked.

---

## What's not done / next steps

In rough priority order:

### Immediate (small, high value)

1. **Verify `/morning` fix** — test in `@hello_argobot` dev to confirm one-question-at-a-time behavior. Brian repros: send `/morning`, check that only Q1 appears in bot's reply.

2. **Website "What it does" copy is stale** — the bullet list under "What it does" still says "Optional morning check-ins — off by default" and doesn't mention mentors / library / taste profile / custom modes / evening checkout / weekly summary. This is on the public page. Brian hasn't asked to fix it yet, but it's a known gap from the handoff.

3. **Library time display bug** — `/library/[shelf]` shows times like "1556" instead of "3:56 pm". Fix in `library-shelves.ts` → `renderListShelfPage`. Caught by UX-research agent; straightforward format fix.

4. **"Invalid Date" entries** in `/library/journal` sit at top. Should sink to bottom or be treated as "loose pages." Cause unconfirmed.

### Medium (design/UX)

5. **Librarian implementation** — plan approved, implementation not started. Plan at `~/Desktop/PhoneThatCares/telegram-agent/share/librarian-plan-2026-05-04.md`, impl design at `research/2026-05-04/librarian-design.md`. Jobs approved: #1 reading-list digestion, #2 journal coalescence, #4 decay scoring, #5 link generation, #7 markdown substrate mirror. Jobs cut: #3 weekly reflection cards, #6 persona-note refinement.

6. **Four cross-pollination decisions** Brian still owes (from May 4 handoff, status unknown — he may have decided these):
   - Session grouping: librarian's coalescence canonical vs. UX's render-time clustering
   - "Keep going" affordance: scope into librarian v1 or drop from journal redesign
   - Two new `LogCategory` fields: `argos_role` and `front_matter`
   - Markdown mirror destination: val.town blob vs. existing `memory/` git folder

7. **Library page redesigns** — six mockups from the May 4 generative pass exist at `research/2026-05-04/design-pass/`. Not yet implemented. Settings was the first one shipped; the others (library landing, taste profile, journal, meditation shelf, people, argos log) are still in mockup form.

8. **Generative pass ideas** (not yet evaluated by Brian): year-ago-today journal card, "lately" strip on landing, taste-profile live preview. Mockups at `research/2026-05-04/design-pass/generative/`.

---

## Decisions made this session

- **MVPA framing is the primary intro** for both settings page and website. The "three tiers" framing (at minimum / a little more / as much as you want) was tried and then replaced — Brian felt the tier bullets were wrong for the settings page, and the prose version ("minimum viable personal assistant, adding capabilities as it knows more about you...") landed better.
- **Settings lede is short on the settings page** (two sentences) and long on the website (full paragraph). The settings page doesn't need to sell the product; the website does.
- **"Mentor" metaphor is retired** as primary framing. Brian is moving toward "system prompt" (literally) and away from "mentor" / "character" language. The mode section is still called "who's at the other end" which is good. "Make your own system prompt" is the section title now.
- **Mode card size**: 130px min-width. Shows ~2.5 cards on a 390px phone screen. Brian's explicit ask: see RoboJournal, RoboCaro, and half of RoboMcCarthy without scrolling.
- **Deploy path**: `npx vercel --prod` from the website directory. Not GitHub. This is confirmed — GitHub does NOT trigger Vercel.

## Decisions deferred

- **Website "What it does" section**: stale but not fixed. Brian hasn't given direction on how to rewrite it. The new framing (MVPA → morning offering → check-in → library) would naturally restructure this section too, but it's not done.
- **Bigger website restructure**: Brian gestured at wanting the MVPA framing to be "the structuring thing" of the telegram-bot page — not just the lede, but potentially reorganizing the whole page around it. We added the lede and carousel but left the "What it does" + self-host walkthrough structure intact. There's a larger page redesign possible here.
- **Credit section**: still references Tasshin's mentor-mock as lineage. With the mentor metaphor retired, this may feel off. Brian hasn't flagged it.

---

## Things to watch out for

- **Val push pattern**: both vals always get every file push. Dev is `e534cea8-...`, prod is `$VAL_ID_PROD` (in `~/.argos.env`). Always `set -a; . ~/.argos.env; set +a` first. The `main.ts` path on val.town corresponds to `multi-bot.txt` locally — push as `path=main.ts`.
- **80k byte limit on multi-bot.txt**: the May 4 midday handoff mentioned checking this. It was large then. If you're editing it, be aware.
- **Vercel working-tree deploys**: every `vercel --prod` includes all locally-modified files, including in-progress work. Consider stashing before deploying if Brian has open edits in experiments.astro or BaseLayout.astro.
- **The old `/config` URL still works**: the bot sends `/config` links via `/settings` command (multi-bot.txt line ~1307). The route handler in routes.ts accepts both `/config` and `/settings` as pathnames. The page title says "settings" now. This is fine — both URLs work.
- **Character art images** are stored in val.town blob as `character-art-*.png` keys. The mode portraits (RoboJournal, RoboCaro, etc.) pull from there.

---

## Key file paths

| File | What it is |
|------|-----------|
| `telegram-agent/share/pages.ts` | Settings page HTML (configPage function) — what we edited |
| `telegram-agent/share/multi-bot.txt` | Main bot logic → pushed as `main.ts` to val.town |
| `telegram-agent/share/start-text.ts` | SOP_MORNING, SOP_EVENING, onboarding messages |
| `telegram-agent/share/routes.ts` | HTTP route handlers — `/config` route at line ~92 |
| `telegram-agent/share/crons.ts` | Morning/evening ritual composition and scheduling |
| `telegram-agent/share/library-shelves.ts` | Per-shelf library page renderers (time display bug lives here) |
| `website/src/pages/telegram-bot.astro` | The Argos page on aphonethatcares.com |
| `website/src/components/Carousel.jsx` | Carousel component — accepts `slides` array of `{src, caption, type?}` |
| `website/public/experiments/argos-*.jpg` | The 7 screenshots from Brian's Telegram |
| `_context/HANDOFF-2026-05-04-midday.md` | May 4 handoff — most complete prior state document |
| `_context/state-of-project.md` | Current project state (read this first) |

---

## Context that won't be obvious

- Brian's voice is lowercase, direct, no marketing-speak, no wellness-app energy. The settings page prose should feel like something a friend made, not a SaaS product.
- He's strongly allergic to ALL-CAPS imperatives in prompts ("LLMs over-react to that"). If you're editing system prompts, soften without losing substance.
- The "mentor mockup" lineage (Tasshin Fogleman's work) is still credited on the website but Brian is increasingly working in his own direction. Don't lean on that framing.
- Rauno Freiberg aesthetic: warm off-white `#f6f3ec`, accent `#8a5a2b`, Inter with tnum/ss01, sub-200ms transitions, restraint over volume. This is the settings page's aesthetic too. `/rauno-style` skill exists if doing UI work.
- Push pattern is always both vals together. Never push to only one without a reason.
- Brian iterates fast and reads on phone. Keep prose tight, sections scannable.
- The session was about 20-30 minutes of actual work time. He explicitly wanted to timebox it. Future sessions may be similarly focused — don't over-plan.

---

— Sonnet 4.6, 2026-05-12
