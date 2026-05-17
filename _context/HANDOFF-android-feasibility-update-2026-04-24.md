# Handoff update — Android feasibility + tier explorer (2026-04-24)

Supplements `HANDOFF-android-feasibility.md`. Read that first; this captures what's changed and what was learned since.

## Live state

The tier explorer is **shipped and live** at https://aphonethatcares.com/research/tier-explorer/.

Brian had another instance handle the port. Surprise: it was **not** ported to Astro. It's a static drop-in at `Website/public/research/tier-explorer/index.html` — the original single-file HTML moved verbatim into `public/`. The other research pages (`forking-android.astro`, `architecture-of-attention.astro`) are proper Astro pages under `Website/src/pages/research/`. Tier-explorer is the odd one out.

Practical consequence: edits to tier-explorer don't go through Astro templating. It's just a static HTML file. If that matters later (shared layout, nav, analytics, etc.) an Astro port is still available as future work.

## Fixes applied this session

- **10px panel-centering offset** — `left:calc(50% + 370px)` → `380px` at `Website/public/research/tier-explorer/index.html:115`. Local only; needs deploy (whatever git push / Vercel build path the site uses) to go live.
- **Stale title comment** at line 7 (`<!-- title below reflects the edit; keep page title matching for clean share previews -->`) — **left in place**. On re-read it's a real editor note, not stale.

## The research landscape (decisions + terminology)

### Frame
Two adversarial-collaboration rounds (POSSIBLE vs IMPOSSIBLE advocates, real web research, rebuttal pass, mediated synthesis) answering: what display-layer interventions — gradual grayscale, gradual blur, inline "break cards" — are possible on Android, first stock then non-stock. Answers are embedded in the tier-explorer artifact itself (each move and service has a detail blurb with caveats + citations).

### Terminology (finalized)
- **"Tier" → "Move."** A *move* is what a developer can do; Google's defaults are what Google does in response. Framing the landscape as a ladder of moves (not tiers of invasiveness) keeps the agency on the developer side.
- **"Invasive" → "departure from Google's defaults."** Neutralizes the moral charge. What looks invasive from Google's perspective is often just not-Google's-defaults.
- **Title:** "So you want to do stuff Google doesn't expect with Android" — Brian's phrasing, kept.

### Structure
- **Moves ladder:** 9 rows, ordered by departure from Google's defaults.
- **Services matrix:** 15 services × 9 moves — which services enable which moves, with per-cell caveats.

### Why this artifact exists (project context)
Phone That Cares is Brian's display-layer intervention thesis — the bet that the place to intervene on phone overuse is the display layer (grayscale, blur, break cards in-stream), not app blockers or screen-time dashboards. The Argos UI spec (per-app mode picker: Grayscale / Blur / Break cards / Passive / Off + ramp) is the current product frame. The tier-explorer is the feasibility substrate for that product frame on Android — what's actually buildable, at what level of Google-defaults-departure.

## Key files

1. `Website/public/research/tier-explorer/index.html` — the live artifact (static, not Astro)
2. `tier-explorer.html` at repo root — original single-file version; likely the source of truth that got copied to `public/`
3. `Words/deep researches/android-limitations-gemini.md` — Gemini source doc
4. `android-inputs-and-levers-phone-that-cares.rtf` — Android API inventory source
5. `top-level-context-dump-phone-that-cares-organized.md` — organized project context
6. `Website/src/pages/research/forking-android.astro` + `architecture-of-attention.astro` — Astro page pattern if tier-explorer ever gets properly ported
7. `~/.claude/projects/-Users-b-Desktop-PhoneThatCares/memory/` — persistent memory (Brian's background, project state, Argos UI spec, context-dump location)

## What Brian is doing next

Reading the tier-explorer today or tomorrow to internalize the landscape, then coming back with questions. Mode is "research & thinking," not producing tangible outputs. Don't push him toward ship-next-thing moves unless he signals that's what he wants.

## Inter-session comms

`claude-peers` MCP is available on this machine — `list_peers` / `send_message` to reach other running Claude sessions (including a PM session coordinating this project).
