# Android Build — Handoff 2026.05.02

Supplements `HANDOFF-android-feasibility-update-2026-04-24.md` and the tier explorer at https://aphonethatcares.com/research/tier-explorer/. Read those first.

## What this conversation was for

Brian opened the first round of the **expand → contract** cycle to pick the UI features and outputs for a first Android prototype. The prototype's job: a device a real person can live with for ~2 weeks, where social media still works (it's the experimental surface), and as much of the rest of their lifestyle as possible survives. Loopholes are fine — this is a prototype, not a manufacturable product.

Brian asked Claude to be **disagreeable when warranted** and floated running two Claude instances in parallel as POSSIBLE vs IMPOSSIBLE adversaries (mirroring the frame used to build the tier explorer).

## Claude's opening take (round 1)

### Reframing the constraint
The binding constraint isn't "as much lifestyle as possible." It's: **don't break the experimental surface.** Banking breaking is annoying; Instagram/X breaking means we can't run the experiment. Optimize against breaking social, accept breakage of banking/Wallet/etc. for the prototype tester pool.

### Recommended move on the ladder
**Move 5 — rooted Pixel with Magisk + Zygisk-DenyList, plus a Magisk module / LSPosed hooks for system-level rendering changes.**

Reasoning:
- **Move 2 (Accessibility overlay)** is tempting because Play Store stays intact, but Google is actively hostile to non-a11y use of the Accessibility API, apps can detect overlays and refuse to render, and you'll burn the prototype budget on cat-and-mouse.
- **Move 6 (GrapheneOS)** is seductive because relocked bootloader → Play Integrity basic passes → banking mostly survives. But you can't easily inject custom SystemUI behavior without forking the OS, which is a much larger commit than a prototype warrants. Save GrapheneOS for v2 if the thesis lands.
- **Move 5** lets you do system-level grayscale/blur cleanly, social apps mostly run with DenyList, and the cost is just some banking breakage. Right Pareto point for a prototype.

This is the call Claude is least sure of. Worth pressure-testing in round 2.

### Recommended UI feature cut

**Build for v1:**
- **Grayscale, per-app, ramped** — cheap, system-level via SurfaceFlinger color matrix or display saturation, validated in the literature (Holden et al.), tests the thesis directly. The centerpiece.
- **Passive tracking** — trivial via UsageStatsManager. Provides ground truth for the dashboard and inputs to the ramp logic.
- **Per-app picker UI** — Screens 1 and 2 from the Argos spec, as a regular app.
- **One lock-screen surface change** — pick *one* of the four-direction modes. Suggested: **Connect**, because it most differentiates from existing launchers and ties to the "compass for social connection" thread.

**Defer for v1:**
- **Feed blur (gradual)** — to blur only the feed you need either accessibility-tree walking (per-app, fragile, breaks on every app update) or full-screen blur (unusable). Full-screen-blur-on-scroll-velocity is a possible compromise but it's a research project of its own.
- **Break cards** — injecting UI into another app's render surface without cooperation is genuinely hard. The honest version is a full-screen overlay triggered by scroll heuristics, which is a different product.

**Why cut them:** ~80% of the engineering pain lives in blur and break cards. Grayscale alone is sufficient to test the core display-layer hypothesis. If grayscale moves the needle in user studies, that's evidence to justify the bigger build.

### Two-Claude setup
Recommended structure: not "pessimist vs optimist about features," but **POSSIBLE vs IMPOSSIBLE about feasibility for a specific candidate build** — mirroring the adversarial-collaboration frame used for the tier explorer. They argue about a concrete artifact, not vibe about disposition.

## Open questions / where to push next

1. **Move-level call:** root vs GrapheneOS vs Accessibility. Claude picked root; needs adversarial pressure-test.
2. **Feature cut:** is grayscale-only sufficient for v1, or does Brian feel blur/break-cards are non-negotiable to test the full thesis? If non-negotiable, what's the minimum viable version of each?
3. **Lock-screen mode:** if we ship one of the four-direction modes, which? Claude suggested Connect; this is a taste call.
4. **Tester profile:** who's the v1 user? "Typical user" is doing too much work — a tech-tolerant friend will accept different breakage than a non-technical family member, and the move-level decision shifts with that.
5. **Output set:** the conversation focused on UI features. Brian also asked about "outputs" — the dashboard / passive-tracking surfaces / what data the device produces for the tester and for Brian. Not yet covered.

## Meta notes for next session

- Brian's mode this period is **research & thinking**, not shipping. Don't push toward "let's build it" unless he signals.
- He explicitly wants disagreement when warranted. Don't soften strong takes.
- Iterate-don't-wrap register. Mid-thought turn endings are fine.
- The next concrete move is probably either (a) drafting the two adversarial Claude prompts and running round 2 on the move-level call, or (b) widening on outputs/dashboard before contracting.
