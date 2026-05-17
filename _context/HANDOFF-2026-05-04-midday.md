# Handoff — argos + PTC, 2026-05-04 midday

*Picks up from `argos-telegram-agent/share/HANDOFF-2026-05-04-morning.md` (~7am Pacific). Written in case Brian switches to a Sonnet 4.6 instance mid-session.*

---

## Read this in 60 seconds

You're with **Brian** (`bri@nvaughn.info`). Argos shipped publicly today. Since the morning handoff, this session has done three tracks:

1. **Iteratively cleaned bugs/UX from Brian's prod use** — pushed to both vals (`@hello_argobot` dev `e534cea8-432e-11f1-8dff-42b51c65c3df` + `@argostherobot` prod `46072a84-476a-11f1-86f1-42b51c65c3df`).
2. **Designed the "librarian"** — an asynchronous background process that consolidates / indexes / decays / mirrors data the synchronous face writes during turns. Plan + implementation design approved.
3. **Did a UX/design pass on the library + a settings page redesign** — six page redesigns, a generative-second-pass with new affordances, and a cross-pollination doc reconciling librarian-design with UX-design.

Push pattern unchanged from morning handoff:
```bash
set -a; . ~/.argos.env; set +a
SRC=/Users/b/Desktop/Projects/argos-telegram-agent/share
for VAL in e534cea8-432e-11f1-8dff-42b51c65c3df $VAL_ID_PROD; do
  curl -sS -X PUT -H "Authorization: Bearer $VAL_TOWN_API_TOKEN" \
    "https://api.val.town/v2/vals/$VAL/files?path=<filename>" \
    --data-binary @<(jq -Rs '{content: .}' < $SRC/<filename>) \
    -H "content-type: application/json"
done
# multi-bot.txt → push as path=main.ts
```

---

## What shipped this session (already pushed to both vals)

- `koan_or_fable` shape renamed → `fable_or_parable`. Instruction explicitly excludes Zen koans. (Brian said the LLM was always picking koan, never fable. He wants fables.)
- `short_film` shape: 5min → 6min.
- ONBOARDING_PROMPT softened — removed all-caps "CRITICAL" framing on the taste-profile-vs-save_fact redirect; kept the substance. (Brian's worry about LLMs over-reacting to imperatives.)
- `library-shelves.ts` taste-profile shelf count: was character count of the markdown blob (showed "1,404"), now counts bullets / comma-separated items / non-empty lines.
- `crons.ts` `composeAndSendMorningFor` — morning offerings now **honor the user's selected /mode** (RoboCaro, RoboMcCarthy, custom modes). Earlier rev hardcoded `DEFAULT_MODE_ID` ("morning is argos's character"); Brian retired that stance — the user's chosen voice runs the morning too. Evening already used the normal-turn flow → no change.
- `storage.ts` `appendFact` — server-side dedup. Normalizes (lowercase, strip leading articles, strip trailing punct) and rejects exact + prefix-containment matches. Returns `boolean` so the handler can signal "skipped" back to the LLM.
- `multi-bot.txt` `complete_onboarding` handler — strengthened tool-result string to push the post-onboarding orientation beat into the model's current reply (was just `"ok, onboarding complete."`). **Verified passing on dev val** — synthetic test sent `/start` → `"later"` → bot replied: *"totally fine. you're set up — argos sends a morning thing around 7am your time (/settings to change), /hit_me anytime if you want something now, and /settings has everything else."*
- `system-prompts.ts` `TOOL_GUIDANCE` — added "SAVE-ABLE MOMENTS" block. Per Brian's edit, dropped the proposed "don't pester; one offer per moment" tail. The bot is now allowed to offer to log canonical-feeling moments directly (the "shoe-meltdown" scenario from the UX report).
- `library-page.ts` — dropped the `/ all (457)` link from the reading-page nav (mobile chrome cleanup) AND a full Rauno-style redesign of `renderLibraryPage` (the dense filterable grid at `/library/reading/all`). Match warm-off-white aesthetic from `library-shelves.ts`. Brian approved the redesign visually.

The website tweet-blocker (`aphonethatcares.com/telegram-bot` placeholders) was already deployed before this session started. Verified.

---

## Decisions Brian made this session (durable)

1. **Three-tier framing** for argos. Captured in `/Users/b/Desktop/Projects/argos-telegram-agent/share/argos-tier-framing.md`. Will go at top of `/settings` page (renamed from /config) AND on the website. Don't ship verbatim — it's voice-rough seed copy. Wants one more pass.
2. **Settings page redesign approved.** Mockup at `/Users/b/Desktop/PhoneThatCares/MD context files/config-mockup-2026-05-04.html` (v2 — Brian's reorder applied). Renamed `/config` → `/settings`. New section order: tier blurb at top → daily rituals → argos's character (mode picker) → manage shelves → other adjustments → your profile → data. **Brian wants this implemented next** by a Sonnet 4.6 agent.
3. **Librarian plan approved with edits.** Plan in `/Users/b/Desktop/Projects/argos-telegram-agent/share/librarian-plan-2026-05-04.md`; impl design in `/Users/b/Desktop/Projects/argos-telegram-agent/research/2026-05-04/librarian-design.md`. Jobs in: **#1 reading-list digestion, #2 journal coalescence (with voice-note grouping), #4 decay scoring, #5 link generation, #7 markdown substrate mirror**. Jobs cut: **#3 weekly reflection cards** (LM-resonance trap risk), **#6 persona-note refinement** (existing distillation cron does it).
4. **Design library UX before librarian** — librarian produces metadata that pages need to render; designing surfaces first means fewer redesigns. Settings is part of this front-end push; librarian implementation comes after.
5. **save_fact dedup substance** — Brian requested it; we shipped it.
6. **Shoe-meltdown nudge** — Brian approved the proposed prompt addition (with one edit: removed the "don't pester" tail).

---

## Open decisions Brian still owes (cross-pollination doc surfaces 3-4)

From `/Users/b/Desktop/Projects/argos-telegram-agent/research/2026-05-04/cross-pollination.md`:

1. **Session grouping is designed twice with different units of truth.** UX clusters fragments at render-time (5-min window, no schema change). Librarian collapses them into a single parent with `coalesces[]` and asks renderer to filter `coalesced_into === undefined`. **Resolution proposed:** librarian's coalescence is canonical; UX reads `structured.coalesced_count` and `voice_group_id` from the parent. Brian to bless.
2. **UX's "keep going" affordance forces the librarian's "60-min reopen" extension case from "not v1" into v1.** Without it, "keep going" creates orphan singletons. Brian to decide: scope creep into v1, or drop the affordance from the journal redesign.
3. **Two new `LogCategory` fields** — `argos_role` (italic posture line in every UX mockup) and `front_matter` (meditation sidebar). Both face-side schema additions. Brian to bless.
4. **Markdown mirror destination** — val.town blob + admin zip download, OR sync directly into the existing `memory/` git folder. The "scroll in Finder" property only really exists for the latter. Brian's call.

Plus from the librarian-design doc:
- **Decay half-lives**: proposed 60/180/365 days for bulk/classifier/manual. PIM research suggests tighter (30/90/180). Brian's call.
- **`read_shelf` filter on coalesced children**: default behavior question.
- **State machine for user-edited/deleted coalesced parents** (`coalescence_locked`, `coalescence_dissolved_at`). Cross-pollination flagged needs full design conversation.

---

## What's queued / what's running

- A Sonnet 4.6 implementation agent **about to be spawned** (this handoff is part of that agent's brief). Their job: implement the settings redesign in `share/multi-bot.txt` (or wherever `/config` is rendered — see `routes.ts:101+`). Renames to "settings", reorders sections, adds tier blurb. Keep all existing functionality; this is a structural + visual redesign, not a feature rewrite.
- **Librarian implementation NOT YET STARTED.** Don't start it until the settings redesign + the four cross-pollination decisions are settled.
- Generative-pass deliverables in `research/2026-05-04/design-pass/generative/` — Brian has not yet evaluated. Year-ago-today journal card, "lately" strip on landing, taste-profile live preview. Show him when he asks; don't auto-implement.

## Smaller open items (from Brian's earlier to-do)

- `libraryNav` filter by active shelves (don't link to /library/journal if no journal shelf).
- `add_person` server-side dedup (same shape as save_fact's; Brian deprioritized — said "feels like a tier-4 feature we don't even have").
- Unknown slash command → "_unknown command. /help for the list._" instead of falling through to LLM.
- Mojibake on /library/argos-log lines 3439+3441 — UTF-8 archive-read issue.
- Website "What it does" copy is stale (no mention of mentors / library / taste profile / custom modes / morning offerings / evening checkout / weekly summary).

## Open bugs Brian saw in his prod session today

- `/library/[shelf]` shows times like "1556" — should display as 12-hour AM/PM lowercase. Fix is per-shelf renderer in `library-shelves.ts` `renderListShelfPage`. Caught by UX-research agent; mockups demonstrate the fix.
- "Invalid Date" entries in /library/journal sit at the top. Should sink to bottom or move to log. Cause unconfirmed. UX agent's redesign treats them as a "loose pages" footer.
- Brian triggered `/morning` and got all three SOP questions at once instead of one-at-a-time. Possibly because there was a pre-composed pending-morning. Not yet root-caused. He plans to repro from a clean state.
- Taste profile UI: he wants a richer, "exciting/editable" treatment than the current textarea. UX agent's taste-profile mockup proposes chip-rows with hazards as struck-through chips + a "what argos sees" preview panel.
- Library landing: per-shelf descriptions feel static. Brian wants them to describe *what argos is doing in this shelf*. UX agent proposes a small italic "argos's role here" line per shelf.

---

## File reference

**Just-redesigned mockups (open in browser):**
- Library landing — `research/2026-05-04/design-pass/01-library-landing.html`
- Taste profile — `research/2026-05-04/design-pass/02-taste-profile.html`
- Journal — `research/2026-05-04/design-pass/03-journal.html`
- Meditation shelf — `research/2026-05-04/design-pass/04-meditation-shelf.html`
- People — `research/2026-05-04/design-pass/05-people.html`
- Argos log — `research/2026-05-04/design-pass/06-argos-log.html`
- **Settings (the next thing to implement)** — `/Users/b/Desktop/PhoneThatCares/MD context files/config-mockup-2026-05-04.html`
- Generative additions: `research/2026-05-04/design-pass/generative/01-landing-lately.html`, `03-journal-year-ago.html`

**Design docs:**
- UX critique — `research/2026-05-04/design-pass/critique.md`
- Generative pass — `research/2026-05-04/design-pass/generative-pass.md`
- Librarian design — `research/2026-05-04/librarian-design.md`
- Cross-pollination — `research/2026-05-04/cross-pollination.md`

**To-do for Brian (stateful HTML):**
- `/Users/b/Desktop/PhoneThatCares/MD context files/brian-todo-2026-05-04.html`

---

## How Brian works (operating notes — stable)

- Iterative, not waterfall. Don't over-plan; ship and adjust.
- Lowercase by default in his own writing.
- Strong taste; trust him to tell you when something's off. He'll push back; expects you to push back too.
- Distrusts ALL-CAPS imperatives in LLM prompts ("LLMs over-react to that"). Soften without losing substance.
- Anti-wellness-app: no streaks, no badges, no progress bars, no "encouragement."
- Anti-LLM-resonance-trap: don't elevate emotional content as "the most important thing."
- Beauty over harshness. Restraint over volume. Sub-200ms motion. Inter `ss01 cv11 tnum`. Warm off-white #f6f3ec, accent #8a5a2b.
- Reads on phone. Keep prose tight.
- Out of Opus tokens — switching to Sonnet 4.6 for the rest of the session. Cost-not-a-tight-constraint posture from earlier may not hold; lean simpler.

— claude (Opus 4.7, 1M context), 2026-05-04 ~10:30am Pacific. Brian going dark on Opus, switching to Sonnet for implementation work.
