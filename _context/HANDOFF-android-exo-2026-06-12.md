# Handoff — Android v1 emulator/exo track (paused 2026-06-12)

**Status: PAUSED on purpose.** Brian is stepping away from the OS-fork / launcher-replacement
track to **build the best standalone Android app he can first** (shippable without un-bricking a
phone or rooting — distributable, testable on any device). We'll return to the fork work later.
This file is the resume point so none of the emulator-track state is lost.

> Read order when resuming: this file → `_context/sessions/android.md` →
> `_context/android-build-2026-05-16/architect.md` → the verified report below.

---

## TL;DR — what the emulator track proved

The emulator workbench answered the core feasibility question: **the whole PTC product loop is
buildable** — a phone-OS shell where *intention upstream → device honors it downstream*. Every
primary surface is real, and the v1 intervention (gradual per-app grayscale) works. The remaining
gaps are all "it's an emulator, not a SIM'd phone" or "needs real hardware," not "can't be built."

**Verified report (open it):**
`http://localhost:8137/phone-os/android-v1/reports/verified-2026-06-03/index.html`

---

## What genuinely works (verified by eye / live test)

- **Lock screen** — 4-direction picker (Discover ↑ / Ask ↓ / Connect ← / Home →), real fingerprint
  glyph (the `⊕` placeholder is gone), visible status bar, thin clock + Messages/Slack notification
  cards, `COMMIT_DP = 95f` (Brian's 70→95dp +35% "too easy to trigger" fix).
- **Discover** — real social apps installed (Instagram, X, YouTube); tapping a tile **launches the
  real app**; Notifications page + Styles tab render; live per-app ramp meters.
- **Per-app grayscale ramp** — THE v1 intervention. True per-app desaturation via
  `cmd color_display set-layer-saturation` (shell binding of hidden
  `ColorDisplayManager#setAppSaturationLevel`); monotonic, can't be stopped for the day, midnight
  reset. App installed as priv-app to hold `CONTROL_DISPLAY_SATURATION`. Verified: Chrome drained
  to gray while system UI stayed colored → genuine per-app, not a scrim.
- **Connect** — our app IS the default SMS app (`sms_default_application = com.ptc.launcher`);
  shows real SMS threads; receives injected texts (`adb emu sms send`).
- **Ask — AI chat (TEXT) WORKS LIVE.** Verified 2026-06-12: typed "What is the capital of France…",
  tapped send (↑ button, NOT keyboard-enter), got a real GPT reply ("…Paris…"). Real OpenAI
  round-trip; key is baked at build time from `OPENAI_API_KEY` env → `BuildConfig.OPENAI_API_KEY`
  (`launcher/app/build.gradle.kts`). Turns into a continuing conversation thread.

## Renders but data is seeded/mock (NOT live)

- Past-chats list, recall chips, the Notifications page — fabricated PTC-flavored examples to show
  the design, not real history/state.

## Wired but UNVERIFIED

- **Voice ("Tap to talk")** — Whisper STT wired the same way as chat (BuildConfig key), but needs
  the emulator mic routed from the Mac; never tested. Text chat definitely works; voice is a maybe.
- **Connect open-a-thread / send** — list + receive are real; **sending is a no-op (no SIM)**;
  opening a thread's conversation view not confirmed.

## Dead / open

- **NF** — notification filtering not wired to real decisions (LlmNotificationFilter exists in
  source, gpt-4o-mini, but not hooked to live notifications).
- **K2** — biometric → unlock authority failed on emulator (better resolved on real hardware).
- **Physical Pixel 6** — still soft-bricked. Separate track (`TROUBLESHOOTING-LOG.md`,
  fastbootd-via-device-UI recovery pending). The north star (SIM in, carry 7 days) is gated on this.

---

## Emulator / environment state

- AVD `ptc-test` (google_apis, API 34, ARM64, `adb root` works). **RAM bumped 2G → 4096** on
  2026-06-12 (2GB was starving Instagram → system_server ANRs / frozen "process system"). Config at
  `~/.android/avd/ptc-test.avd/config.ini` (`hw.ramSize=4096`; backup `.bak` alongside).
- Launch (windowed, clickable): `emulator -avd ptc-test -no-snapshot -no-audio -gpu
  swiftshader_indirect -memory 4096`. Logins + installed build persist across reboots (on disk).
- **Instagram is logged in.** X is APK-version-blocked (sideloaded build rejected; real Play Store
  fixes later). YouTube logged-out (stub Play Store can't init Google sign-in). See `MANUAL-STEPS.md`.
- Known: emulator system_server ANRs under heavy load (YouTube GMS init spiked guest loadavg ~50).
  Settle guest loadavg < 12 before launching exo runs.

## The exo (build-verify-repair rig)

- `harness/overnight.sh [GOAL...]` — boots/reuses AVD, runs goals, writes `reports/morning.html`,
  leaves windowed emulator with latest build. Auto-sleeps 1800s + retries on usage cap.
- `harness/run-goal.sh` — per goal: persisted builder session → adb assertion → independent judge →
  auto-repair (resume session w/ verdict, `PTC_MAX_REPAIR=2`). Models = `claude-opus-4-8`.
- `harness/resume-goal.sh <GOAL> ["msg"]` — interactively continue a goal's builder session.
- `harness/assertions/*.sh` — adb checks. `goals/refs/*.png` — fidelity references.
- **Tone/frame (important to Brian):** all instances are teammates, collaborative not adversarial;
  the rig is the "exo"; honesty > fake-green; the running build is the design SSOT.

## Hard-won lesson: assertion flakiness (the big gotcha)

The exo gave **false-FAILs** on DSC, FL, ASK — all built correctly but tripped a cold-start race:
dumpsys reports an activity "resumed" ~3s before Compose draws, so a fixed-`sleep` + guessed-tap
fired into a black surface (or the wrong foregrounded app, e.g. logged-in Instagram on top).
**Fix pattern now in `dsc.sh`/`fl.sh`/`ask.sh`:** force-stop social apps first; gate on actual
render (screencap PNG size > ~55KB: black≈24KB, lock≈76KB, Discover≈104KB); confirm the correct
surface/app is foreground before judging; retry the gesture; crash-grep error-level `E AndroidRuntime`
ONLY (bare `AndroidRuntime` matches uiautomator's benign debug lines). All three pass now.
**If you write new assertions, start from this pattern.** Also: 90-min watchdog doesn't hard-kill
(known issue); log-based assertions are gameable (judge caught RAMP log-dodging) — prefer
screenshot-delta checks.

---

## Git state

- Root `/Users/b/Desktop/PhoneThatCares` on `wip/overnight-2026-05-16`. All emulator-track work
  committed through `20dc5eb` (FL/ASK assertion fixes + verified report).
- Launcher repo `phone-os/android-v1/launcher` — builders committed their own work through
  `628cba6` (cold-start fix). ASK rework = `c0b7be2`; SMS = `b96e254`; DSC = `a259d43`/`6ac99af`.

## What carries over to a standalone app (continuity)

The standalone-app pivot can reuse a lot of this directly:
- **The Compose surfaces** — lock/Discover/Connect/Ask/Home are real Compose code in
  `launcher/app/src/main/java/com/ptc/launcher/`, faithful ports of the React mocks.
- **The AI chat wiring** — `ChatService.kt` (OpenAI), `AskViewModel.kt`, `TranscriptScreen.kt`,
  `SttService.kt` (Whisper) — proven working for text.
- **The design system** — refined "Light from the next room" lock, the card designs, the picker.
- What a standalone app CAN'T do that the fork can: replace the real keyguard, become the default
  SMS app system-wide, or apply true per-app grayscale (that needs the priv-app saturation perm).
  An app can still do an *in-app* version of the grayscale idea, the AI companion, the surfaces.
  Worth deciding early which of the fork-only powers actually matter for the app's value prop.

## Resume checklist (when we come back to the fork track)

1. `emulator -avd ptc-test ... -memory 4096`; relaunch `com.ptc.launcher/.MainActivity`.
2. Settle guest loadavg < 12 before any exo run.
3. Untested-but-wanted: voice tap-to-talk (route Mac mic), Connect open-a-thread view.
4. The real frontier remains: **un-brick the physical Pixel 6** → then the 7-day carry test.
