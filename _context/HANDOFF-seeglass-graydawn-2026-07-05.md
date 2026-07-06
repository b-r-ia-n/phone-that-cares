# HANDOFF — Seeglass + Graydawn (July 4–5 overnight builds + July 5 day session)

Written 2026-07-05 evening. Branch `worktree-seeglass-overnight`, PR #1 (draft).
Worktree: `.claude/worktrees/seeglass-overnight/`. Commits: `f35b44c` (v1), `d464418` (v2), `12fab4f` (Graydawn tangle fix).
Deliverables + APKs: `_context/seeglass-2026-07-05/` (seeglass.apk, graydawn.apk, briefs, screenshots).

## The two apps

**Seeglass** (`seeglass/`) — the "caring browser." Shelf of 8 places (X, YouTube, Reddit, Instagram, Facebook, Substack, LinkedIn, TikTok-experimental) in a WebView with a care engine: 20-min saturation ramp (linear — Brian explicitly rejected easing), growing post spacing, ASCII break cards, opt-in trims (YT Shorts shelf, IG Explore), per-place settings pages, archive (long-press shelf row), "tie myself to the mast" settings lock (hour / morning / 3 days / week, no escape hatch), 20× demo mode. Needs only INTERNET permission — **installable by anyone from a bare APK, no adb** (that question came up; answer: yes, hand people the APK; for real sharing make a release-signed build first — current APKs are debug-signed).

**Graydawn** (`graydawn/`) — whole-phone grayscale every ~4am (daltonizer); hold both volume buttons ~0.5s to borrow color for N minutes (default 20); triple-buzz 30s warning; snap back. Needs one-time `adb shell pm grant com.ptc.graydawn android.permission.WRITE_SECURE_SETTINGS` + enabling its accessibility service.

## Verified facts (citable, tested live)

- **Gradual system-wide grayscale is impossible without root** (Android 14): daltonizer saturation setting accepts writes but SurfaceFlinger ignores them (colorTransformMatrix stays full Rec.709 grayscale at all levels); `service call SurfaceFlinger 1015` → permission denied; `ColorDisplayManager.setSaturationLevel` is signature-priv. System = binary snap only. Smooth ramps only where you own pixels (WebView CSS). This is the essay-grade fact.
- `screencap` does NOT capture the daltonizer transform — measure via `dumpsys SurfaceFlinger | grep colorTransformMatrix`.
- **The system hold-both-volume-keys accessibility shortcut intercepts the chord UPSTREAM of all accessibility services.** If anything is bound to `accessibility_shortcut_target_service`, Graydawn never sees the buttons. This was the July 5 failure on Brian's Pixel 8 (his binding: `com.android.server.accessibility/Daltonizer`). Untying is mandatory setup, not advice. The app's "tangles" section now detects it + offers tap-to-untie (WRITE_SECURE_SETTINGS can clear it). It also lists other enabled a11y services (MacroDroid on Brian's phone).
- `setWindow` alarms get doze-deferred for hours on real hardware (invisible on emulator). Regray now uses `setExactAndAllowWhileIdle` + `USE_EXACT_ALARM` (sideload-fine; revisit for Play) + service watchdog (20s tick during borrow, screen-on check, restart recovery). Verified live on the Pixel 8: pending alarm shows `window=0 exactAllowReason=policy_permission`.
- X login fix (truthful UA for x.com only — spoofed Chrome UA contradicted client hints): shipped in v2, **retry still unconfirmed by Brian**.
- "Sign in with Google" is blocked in WebViews → YouTube stays logged out (Custom-Tab auth bounce is the backlogged fix).

## Brian's phone (Pixel 8, serial 37141FDJH004ZP)

Both apps installed (debug-signed). Graydawn: key granted, service enabled, system shortcut untied, dawn alarm live (fired successfully at 4am July 5), first real chord borrow verified working end-to-end. MacroDroid still has an a11y service enabled — if it has volume-button macros they should be quieted.

## Known roughness / small bugs

- **"go gray now" during an active borrow doesn't cancel the borrow timer** — leaves stale `borrow_until`; harmless (alarm no-ops into gray) but confusing, and the planned status display would lie. Fix: manual toggle ends the borrow (clear pref, cancel alarms).
- TikTok is a stub (empty itemSelector, experimental).
- Emulator rule: **always kill the emulator after verification** (`adb -s emulator-5554 emu kill`) — leftover emulators caused "more than one device/emulator" for Brian twice.

## The next build: Graydawn "tweet-level public" release

Brian's direction (July 5 voice notes): before sharing with anyone, Graydawn needs to be legible to strangers. Not production — "me tweeting about this to people on twitter" level. Wanted:

1. **Copy clarity pass** — "the key / the listener / the borrow" are lovely but opaque to someone who didn't build it. Keep warmth, add legibility.
2. **Current-status element** — always-answerable "is it on? am I in a borrow? when does gray come back?"
3. **Chord discoverability + first-try moment** — in-app practice so people get muscle memory (service can detect the chord live while the app is open).
4. **A felt going-gray moment** — screen can't fade (binary snap), but the a11y service can draw TYPE_ACCESSIBILITY_OVERLAY windows with no extra permission: brief color wash / card / countdown are all available primitives.
5. Release signing before sharing APKs.
6. A fresh-eyes design pass ran July 5 (designer subagent) — findings should be synthesized into the build plan (see session transcript / Brian's notes).

## Open decisions (Brian's, not made)

- Combine Graydawn + Seeglass into one app? Leaning **no** (different install friction, different metaphors, and an app holding WRITE_SECURE_SETTINGS + a11y service should stay tiny and auditable) — but revisit as "siblings under one PTC landing page."
- Data tracking / analytics for the public release? Leaning none or local-only; undecided.
- Distribution / how to advertise: tweet thread + download page on aphonethatcares.com is the natural path; the "gradual ramp is impossible, so here's what I did instead" finding is the hook.

## Backlog (acknowledged, unscheduled)

Custom-Tab Google auth (YouTube login), pay-Brian tip jar (needs Play Console), Play-listing pass (privacy policy, a11y declaration, store copy), Graydawn user-selectable chord + dawn time, per-place reset-window tuning, release keystore + signed builds, download page.
