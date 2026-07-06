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

Brian's direction (July 5 voice notes + evening discussion): before sharing with anyone, Graydawn needs to be legible to strangers. Not production — "me tweeting about this to people on twitter" level. Design-pass findings: `_context/seeglass-2026-07-05/design-pass-graydawn-2026-07-05.md` (litmus chip, first-try card, copy table, last-splash overlay). Scope:

1. **Rename "the borrow" — DECIDED (2026-07-05 evening): build around "saturating."** Brian's reasoning: "borrow" implies the color isn't yours (debt/restriction frame); he wants gray to feel like *just a different default*, the user has color the whole time. "Saturating" is literally what the display does AND carries the experiential sense (a saturated stretch of experience). Copy directions: the hold *saturates* the phone for 20 minutes; at the end saturation *drains* back; section header "the saturation" or similar; status "saturated until 4:12". Runners-up if the copy feels stilted in practice: **the waking** (color sleeps / the hold wakes it / it dozes off — one sleep-cycle metaphor matching the app name), **the bloom** (opens, folds at dusk). Builder has latitude on exact phrasings; the frame (ownership, different-default, no lender) is the non-negotiable.
2. **Copy clarity pass** — keep poetic names as headers, make every caption's first clause literal; one word for the gesture everywhere ("the hold", drop "chord"). Full table in the design-pass doc.
3. **Litmus chip + status line** — chip filled with saturated dawn gradient; daltonizer grays the chip itself, so the indicator physically can't lie. Status states with real times. Requires fixing: manual "go gray now" during an active borrow must cancel the borrow (stale `borrow_until` bug).
4. **First-try moment** — one-time card once key+listener are true: tap go-gray (watch chip drain) → hold both buttons a half-second until the buzz → "that's it." Optional near-miss buzz (both keys down+up without firing).
5. **A felt going-gray moment** — screen can't fade (binary snap), but the a11y service can draw TYPE_ACCESSIBILITY_OVERLAY with no extra permission. "Last splash": color bloom fades in BEFORE the daltonizer snap, then the bloom (now rendered gray by the display itself) dissolves. End-of-borrow mid-scroll: quieter — triple buzz + 1.5s whisper. Untie needs a receipt line.
6. **The day-12 letter (consented before/after study) — Brian wants this.** ~Day 12–13 after install (NOT week 3: weekly UsageStats buckets only go back 4 weeks; daily only 7 days), a card/notification: "the maker of graydawn wonders whether it's changed anything — want to help?" On yes: request Usage Access (Settings toggle), read weekly per-app screen time ~2 weeks before vs ~2 weeks after install, compose a HUMAN-READABLE letter + free-text feedback box, send via share sheet / email draft addressed to Brian. **No INTERNET permission — the user reads and sends the letter themselves.** Needs POST_NOTIFICATIONS asked during setup (people may never reopen the app). Brian's take on rigor: 20–30 users with a visible drop = decision-grade signal; that's the bar.
7. **Device compatibility research — US market only.** Targets: Samsung One UI (Galaxy S *and* A series — A-series is a huge share of US Samsung), recent Pixels (covered), Motorola (near-stock, ~10% US Android, low risk). Ignore anything <5% US share (Xiaomi/LG/etc. irrelevant). Research Samsung's own volume-key accessibility shortcuts / One UI settings that would tangle; extend the tangles section if needed. Known open risks: some OEMs don't deliver key events to a11y services with screen off; aggressive battery killers.
8. **Marketing/framing instance** — a separate thinking pass tonight on how to frame/advertise: tweet thread, download page on aphonethatcares.com, the honest-friction framing ("you'll need a friend with a laptop for one command. it's that kind of app"). NOTE: demo footage must be CAMERA video of the physical phone — screen recordings capture pre-daltonizer surfaces and show no change at all (verified fact, and a fun line in itself).
9. Release signing before sharing APKs (both apps).

## Open decisions

- Combine Graydawn + Seeglass into one app? **Decided: no** (all three of Brian/me/design-pass agreed — different install friction, different trust asks; the a11y+secure-settings app must stay tiny and auditable). Siblings under one PTC landing page / tweet thread.
- Analytics: **decided — no telemetry, no INTERNET permission.** The day-12 consented letter (see scope #6) is the whole data story.
- "The borrow" rename: candidates offered, awaiting Brian's pick (scope #1).
- Configurable chord gesture: explicitly deprioritized by Brian ("as long as the standard one works").

## Backlog (acknowledged, unscheduled)

Custom-Tab Google auth (YouTube login), pay-Brian tip jar (needs Play Console), Play-listing pass (privacy policy, a11y declaration, store copy), Graydawn user-selectable chord + dawn time, per-place reset-window tuning, release keystore + signed builds, download page.
