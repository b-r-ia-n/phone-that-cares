# Handoff — Android Feasibility Research + Tier Explorer

## Role / scope
This session was research + a publishable web artifact for Brian's "Phone That Cares" project. Two pieces:

1. **Adversarial collaboration research** on what UI interventions (gradual grayscale, gradual blur, inline "break cards") are possible on Android — first on stock Android, then on non-stock.
2. **Interactive HTML artifact** summarizing the non-stock findings as a hoverable/clickable tier ladder for publication on aphonethatcares.com.

## Current state

**Research — done.** Two rounds of adversarial agents (POSSIBLE vs IMPOSSIBLE advocates), each with real web research and a rebuttal pass, plus a mediated synthesis. The answers are written into the tier explorer HTML itself (each tier and service has a detail blurb with caveats and citations).

**Tier explorer — shippable.** `/Users/b/Desktop/PhoneThatCares/tier-explorer.html`. Self-contained single HTML file. Matches the website's "writing" theme (warm tan #EDDED0 + brown accent #8B4A2B). Interactions:
- Desktop (≥ 1320px viewport): detail panel is "docked" in the right gutter between main text column and viewport edge, centered horizontally in that gutter.
- Narrower: detail panel becomes a bottom-sheet overlay with backdrop.
- Hover updates the panel; click pins; click again / elsewhere / × unpins.
- Tables: moves-ladder (9 rows) + services matrix (15 services × 9 moves).

**Title:** "So you want to do stuff Google doesn't expect with Android" — Brian's phrasing, finalized.

**Terminology decision:** "Tier" → **Move** (developer action; Google responds). "Invasive" → "departure from Google's defaults."

## Open threads / minor polish

- `main` max-width got bumped to **760px** (linter/user edit); the `.panel-dock` still uses `left: calc(50% + 370px)` which was sized for 740px main. At 760 it should be `+ 380px`. Trivially wrong by 10px — panel centers slightly too far left. Fix next time or leave.
- Brian mentioned the artifact "may eventually want to be part of an essay." Not drafted. The HTML is the artifact; the essay is future work.
- Website integration: the artifact is a standalone HTML file. Embedding into the Astro site at Website/ would mean porting to an Astro page (the writing theme is already set up; see `Website/dist/research/forking-android/index.html` for the pattern — kicker, intro, prose, source-note, citations structure).
- Title bug caveat: page still has `<!-- title below reflects the edit -->` comment from an old edit — harmless but can be cleaned up.

## Key files (in priority order)

1. `/Users/b/Desktop/PhoneThatCares/tier-explorer.html` — the artifact
2. `/Users/b/Desktop/PhoneThatCares/Words/deep researches/android-limitations-gemini.md` — the Gemini source doc Brian pasted in (I saved a cleaned copy here)
3. `/Users/b/Desktop/PhoneThatCares/android-inputs-and-levers-phone-that-cares.rtf` — the other technical source (Android API inventory)
4. `/Users/b/Desktop/PhoneThatCares/top-level-context-dump-phone-that-cares-organized.md` — Brian's organized project context dump; read first if you're new
5. `/Users/b/Desktop/PhoneThatCares/Website/src/styles/themes.css` + `global.css` — style reference for web integration
6. `/Users/b/.claude/projects/-Users-b-Desktop-PhoneThatCares/memory/` — my persistent memory (Brian's background, project state, UI spec, context-dump location)

## Next step

Either:
(a) **If Brian wants to ship it:** port `tier-explorer.html` into an Astro page under `Website/src/pages/research/` so it lives on aphonethatcares.com. Look at `Website/dist/research/forking-android/index.html` as the template.
(b) **If Brian wants to keep thinking:** he's in "research & thinking" mode this week (not producing tangible outputs), so no rush. The artifact is already good enough to show people.

Also fix the 10px panel-centering offset (`+ 370px` → `+ 380px`) if you touch the file.

## Inter-session comms

This machine has **claude-peers MCP access** — you can `list_peers` and `send_message` to other Claude sessions running here, including the PM session coordinating Phone That Cares work. If the PM pings about this work, that's how. Surface any blockers or questions there rather than waiting.
