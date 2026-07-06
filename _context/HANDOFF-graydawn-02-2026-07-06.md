# HANDOFF — Graydawn 0.2 overnight build (July 5–6)

Written ~11pm July 5 by the overnight instance. Branch `worktree-seeglass-overnight`, commit `b7c6a53`, PR #1 updated. Everything below is built, emulator-verified, and installed on the Pixel 8.

## What shipped (all of scope items 1–9 from the July 5 handoff)

1. **Saturation frame** — "the borrow" is gone. Section header "the saturation", status "saturated until 4:12 — 14 min left", caption "each hold saturates the screen for N minutes… then the color drains back." Pref keys kept their old names so the Pixel upgraded in place. The tagline stays concrete ("holding both volume buttons — a half-second — brings the color back for a while") and the saturation vocabulary appears where it's literally true.
2. **Copy pass** — design-pass table applied: "the hold" everywhere (no "chord"), literal first clauses, "have a friend with a laptop run this once", "no tangles — the hold is yours alone." Untie now leaves a receipt: "untied — the hold is yours now."
3. **Litmus chip + status line** — dawn-gradient chip (coral→gold→sky) beside a real-time status line (tnum, ticks 1/min). Five states, all verified. The stale-borrow bug is fixed: manual "go gray now" during a saturation clears `borrow_until` and cancels the alarms (verified in dumpsys — pending alarm actually gone).
4. **First-try card** — one-time, appears when key+listener are both live, resolves to "that's it. that's the whole trick." on the first successful hold (poll verified live). Near-miss (both buttons down, released too soon) gives a single tiny buzz — logic in place, **needs your fingers to feel-test, emulator has no buttons**.
5. **The last splash** — tapping "go gray now" blooms a full-screen dawn gradient over the still-colored screen (~300ms), the daltonizer snaps at peak with one soft low buzz, and the same bloom — now rendered gray by the display itself — drains away (~600ms). You watch the color leave the pixels that announce it. Screenshot of the bloom at peak came out beautiful; the drain is physically un-screenshottable, which is the whole point. End-of-saturation stays quiet: triple warn buzz ~30s out, then a bottom whisper "gray again." Saturation start whispers "20 minutes of color."
6. **Dawn hardening** — warn buzz moved off its doze-fragile `setWindow` alarm into the service watchdog (a second allow-while-idle alarm would steal doze budget from the snap-back). Screen-on dawn catch-up: if the 4am alarm slips, first wake past 4:00 grays (verified). First install never ambushes: the first gray is your first tap or the first real dawn (verified). **Dawn defers to an active saturation** — if someone's mid-hold at 4am, their minutes were never a loan, so dawn records itself and lets the snap-back alarm finish the job. Watchdog also recovers a mid-flight saturation after a service restart with the alarm dead (verified end-to-end).
7. **Enabled-but-dead honesty** — force-stop (and Samsung/Moto battery killers) leave an a11y service listed as enabled but not running, and Android won't rebind it. The listener line now detects this and says so: "listed as on, but not actually running — tap here, then flip Graydawn off and back on."
8. **Day-12 letter** — POST_NOTIFICATIONS asked once, in-app, only after setup is real. At day 12 (from `firstInstallTime`), one notification ever + an in-app card: "the maker of graydawn wonders whether it's changed anything — want to help?" LetterActivity is three consents (open → usage access → send): weekly UsageStats, full-weeks-before vs full-weeks-after (the straddling week dropped from both sides), top 8 apps ≥5 min/day, composed as a plain letter with a free-text note, previewed exactly as it will arrive, sent by the person via mailto. **Address baked in: `b@aphonethatcares.com`** (single constant, `Letter.ADDRESS`). Verified on emulator incl. real usage numbers and the Gmail handoff. Test it anytime: `adb shell am start -n com.ptc.graydawn/.LetterActivity`.
9. **Release signing** — shared PTC keystore at `~/Desktop/PhoneThatCares/keys/` (gitignored), password in the txt file beside it. Both apps build signed release APKs. **Back the keys/ folder up somewhere private (password-manager attachment). Losing it strands every installed copy forever.**

## Your Pixel 8 right now

- Graydawn **0.2 (debug-signed)** installed in place at ~11pm — key, listener, prefs all survived; phone stayed gray throughout; **dawn alarm confirmed armed for 2026-07-06 04:00:00**.
- I did **not** open the app on your phone — the one-time notification-permission dialog should meet you awake, not at 4am. So your first open tomorrow: dialog, then the first-try card (small quirk: your phone may be gray already, so step 1's "watch the chip lose its color" is backwards for you — a fresh user installs in color; do a hold instead and the card resolves).
- MacroDroid still shows in the tangles (as designed).
- To move your phone to the **release-signed** build later (so you run the exact public artifact): `adb uninstall com.ptc.graydawn` → install `graydawn-release.apk` → re-grant the key → re-enable the listener. Two minutes, loses prefs, do it while awake.

## Deliverables (in `_context/seeglass-2026-07-05/`)

- `graydawn.apk` (debug, matches your phone) / `graydawn-release.apk` (public artifact)
- `seeglass-release.apk` (signed; no code changes to Seeglass tonight)
- `device-compat-graydawn-2026-07-05.md` — Samsung/Moto research. Headlines: One UI has the identical hold-both-volumes shortcut (untie flow is the *common* case there); volume keys verifiably reach a11y services on One UI; **no OEM delivers the keys with the screen off — "wake the screen, then hold" is a doc line**; Samsung auto-sleeps unopened apps (tangles section now shows a battery line on Samsung/Moto devices).
- `marketing-graydawn-2026-07-05.md` — tweet thread (5 tweets), download-page copy, 6-shot camera list, framing notes + banned-words list.

## The email address (2-minute morning task)

`b@aphonethatcares.com` is baked into the letter. Your DNS is at Namecheap and **email-forwarding MX records already exist**, so: Namecheap → Domain List → aphonethatcares.com → Manage → **Redirect Email** → add alias `b` → forward to `bri@nvaughn.info`. Then send yourself a test. If it fights you, the address is one constant in `Letter.kt`.

## Could this work on iPhone? (your 11pm question)

**As an app: no.** iOS gives third-party apps no API to touch display color, no way to see volume-button presses outside a foreground media context, and no accessibility-service equivalent. Nothing like the key/listener pair exists to even ask for, and App Store review has no category for it.

**As a recipe: ~80% yes, and it's charming.** iPhones already contain most of Graydawn in Settings:
- *Gray by default:* Settings → Accessibility → Display & Text Size → Color Filters → Grayscale.
- *Gray every dawn:* Shortcuts app → Automation → time of day 4:00 → "Set Color Filters On" → runs silently, no confirmation ([it's an established pattern](https://jondueck.ca/journal/2023/greyscale-ios/), [example recipe](http://z1g1.net/productivity/2023/10/14/greyscale-ios.html)).
- *The hold:* triple-click the side button (Accessibility Shortcut → Color Filters). Different gesture, same muscle-memory quality.

**What iOS can't do: the saturation.** There's no reliable "color came back → 20 minutes → gray returns" — no state-change trigger in Shortcuts, and long background Waits get killed. Triple-click color lasts until you triple-click again or the 4am automation. Also unavailable: the buzz vocabulary, litmus chip, tangles, and the day-12 letter. Verdict: a "graydawn for iPhone" *setup guide page* on the site would cost an evening, needs no App Store, and is very tweetable ("the iphone version is not an app. your phone already knows how; here's the incantation"). Could live beside the download page.

## Open / next

- Brian feel-tests 0.2: the hold, near-miss buzz, splash timing, whispers, notification ask.
- Namecheap forward (above), then a real end-to-end letter test.
- Release-signed migration for the Pixel (whenever).
- Demo video is CAMERA footage of the physical phone (screen recordings show nothing — still true, still a good line).
- Backlog unchanged: X-login retry confirm, YouTube Custom-Tab auth, TikTok stub, download page build, tip jar, Play-listing pass.
