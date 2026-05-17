# Handoff — Android v1, morning after overnight #1

**Written:** 2026-05-16, ~9:30 AM PT, after Brian's first hands-on session with the build.
**Audience:** the next android-agent instance picking this up. Brian is asleep / away after this.

This is *Brian's feedback after touching the running launcher on the emulator*, plus what you actually need to read before continuing. The previous instance's context window was getting full; this exists so you start with a clean head.

---

## TL;DR (read this first)

**Last night's overnight goal chain succeeded.** Six `/goal`-driven Claude sessions built a working Compose Android launcher, installed on the emulator, running as default home. All five surfaces from the React mock render (Lock + Discover + Ask + Connect + Home). Total cost $8.20, ~54 min of actual claude work spread across 7.5h wall-clock because of a bug in the harness (see "Bugs in the harness" below).

**Brian's read:** "first success — there's something here, I have a clickable Android thing. Feeling good about that." He likes the overall direction. Then he gave a lot of specific feedback on what's wrong, which is what this handoff is mostly about.

**The one-line summary of what's wrong:** the screens look approximately right but the *details* aren't refined enough to match the React mock or the launcher-build-brief, and almost nothing is interactive yet beyond directional navigation. Cards aren't tappable. Toggles aren't toggleable. The drag gesture is finicky. Emojis where line icons belong. Etc.

---

## What's working (verified visually this morning)

Screenshots saved at `phone-os/android-v1/reports/morning-{lock,discover,ask,connect,home}.png`. Look at them before you do anything else.

- **Lock surface** — renders time (large light), date/weather row (`SAT · MAY 16 · ☀ 68°`), two inbox preview rows, four direction labels arranged around a breathing fingerprint anchor at ~25% from bottom. Bottom-left flash + bottom-right camera quick-action icons present. Status bar at top (system Android, not ours).
- **Discover (gold accent)** — 10 real-package tiles with package names, ramp budgets pulled from the spec defaults (Instagram 30m, Twitter 15m, Reddit 25m, YouTube 45m, Spotify 60m, Facebook 20m, TikTok-eq 20m, LinkedIn 30m, Snapchat 25m, Pinterest 40m), `GRAY` / `OFF` mode flags, thin progress bars at bottom of each card.
- **Ask (amber accent)** — three faint memory snippets, 5-dot purple waveform, mic in a tinted circle, "TAP TO SPEAK" caption.
- **Connect (coral accent)** — 7 mock conversations across SMS/Signal/WhatsApp/Telegram/IG. Uniform card design with single-letter avatars, colored platform badges, last-message previews, timestamps, unread dots.
- **Home (blue accent)** — 4×4 grid of installed packages pulled from PackageManager. Includes the PTC launcher's own icon (custom android-in-grid icon) plus stock emulator apps (Settings, T-Mobile SIM, Calendar, etc.).

Navigation between the five surfaces via the four-direction picker on the Lock surface works *enough* for screenshots — but see the drag-gesture issue below.

---

## What's NOT verified

- Whether the drag gesture truly commits at 70dp per the brief, or whether it's snapping at lower thresholds (Brian thinks it might be).
- Whether the **mood overlay bleed** (the per-direction radial gradient that's supposed to grow from the corresponding edge during drag) actually appears mid-drag. We screenshotted destinations, not in-flight drag states.
- Whether the **breathing ring animation** on the fingerprint anchor is actually animating at 2.6s ease-in-out per spec.
- The **GrayscaleService** (G4) — declared, AccessibilityService XML present, but we never confirmed that toggling between foreground apps actually flips `accessibility_display_daltonizer_enabled` in real-time.
- The **Ask STT round-trip** (G6) — the UI shows "TAP TO SPEAK" but we didn't verify that tapping records audio, sends to OpenAI Whisper (`OPENAI_API_KEY` is in `phone-os/android-v1/.env.local`), and renders a response from the Argos val.town backend.
- The instrumentation tests (`./gradlew :app:connectedDebugAndroidTest`) — they were claimed to pass by the goal subtype=success verdict, but Brian didn't run them this morning.

---

## Brian's feedback — verbatim or near-verbatim, categorized

### Lock surface

- **Bottom flash + camera icons** are emojis right now. They should be **white line-work icons** (sub-full opacity). Same for the **weather indicator** next to the time — currently a colored sun-behind-cloud emoji; should be **white line-work weather icon**, semi-transparent.
- **Status bar is missing the typical info row**: time/date, message bubble indicator, Bluetooth, Wi-Fi, cellular, battery. Even though this is an emulator, build a fake status bar that looks like the real Pixel one. (Note: the system Android status bar already shows time/battery — Brian wants more than that, and probably owned by us so we control the typography.)
- **Inbox preview rows aren't left-aligned with the time/date.** Currently centered. Should align with clock + weather row to a consistent left margin.
- **Font sizing** — Brian's hunch is the lock-screen text is under the Android minimum legible/accessibility size. Look up the actual min and verify; bump if needed.
- **Fingerprint anchor circle**: Brian liked the *crosshair-only* version in the React mock — just a plus mark, no innermost circle. Current build has a plus inside a small ring inside a larger soft glow. **Remove the innermost ring**; keep just the plus and the outer glow.
- **Direction labels (Discover/Ask/Connect/Home)** are visible by default. Brian initially thought they should be invisible at rest, then confirmed they were visible — but said the React mock's version "works a little better" with **90° corner brackets** around the labels. Look at how `phone-os/ArgOS.Mock.Sessions.2026.04.15/src/app/components/LockScreen.tsx` renders the direction affordances and translate fidelity better.

### Drag gesture — real bug

Brian's exact words: "you can drag the circle left, right... if you drag it a little bit left and then start dragging down, that downward motion will be used as leftward drag. So I can drag it 15-20 pixels left, then go down 50-60, eventually it just opens connect, which should be only if I predominantly went left."

Translation: the direction is being **locked in too early** based on first-axis-to-cross-threshold, then can't be revised. Should measure total distance from the initial touch point and reclassify direction based on the dominant axis of the *current cumulative vector*, not the first 4dp.

Look at `LockSurface.kt` lines ~78-90 — the `lockedDir` state currently freezes at the first crossing of `LOCK_DIR_DP` (4dp). Either re-derive direction every frame from the cumulative `rawDrag` vector, or only commit at release-time based on the final dominant axis.

### Discover

- **Nothing is clickable.** Cards don't open the app. `GRAY` / `OFF` labels aren't toggleable. Ramp time (`30m`) isn't editable. This is a real omission — currently a display-only screen.
- **Install real apps on the emulator**: Twitter, Instagram, Reddit, Substack, Spotify, Facebook, LinkedIn. Then the Discover cards should actually launch them, with the GrayscaleService kicking in on foreground.
- **General principle Brian articulated**: *"If we have specified a screen which implies some other feature, I want to have that instance automatically try to add that other thing which is required for it to achieve its goal."* — Apply to all future goals.

### Home

- Should look more like a **standard Android home screen**, not a cramped 4×4 grid. All apps should be available, scrollable, with the ability to exit back to the launcher's own surface. Probably a paged grid + dock, Pixel-like.

### Ask, Discover, Home (and others)

- Brian wants **another design pass aligned more closely to the React mock**. The visual register is right (the warm-restraint typography choices), but specifics drift from the mock. Read the React component source carefully and translate fidelity better.
- Fonts a bit bigger across the board.

### Connect

- Brian's general question: **what level of connectivity do we actually have?** Currently all conversations are mock — no Signal/WhatsApp/Telegram backend. He explicitly noted he hasn't given those apps any Beeper-like bridge to connect to. The build-plan.html has a whole section on Matrix bridges as the eventual real backend; for now Connect is a UI shell with mock data, which is what the original goal said. Don't change this without the Matrix/Beeper infrastructure being set up first.

### General

- Brian is OK with the round of font/type choices ("kind of cool") but wants sizing up a notch.
- He flagged the React mock's lock screen drag thing as visually clearer — "something interesting about how the mock-up one works a little better." Suggests the implementation visibly diverges from the mock in a way the mock doesn't.

---

## Bugs in the harness (please fix early)

### 1. Orphan-sleep watchdog (HIGH — caused last night's 7.5h wall-clock for 54min of work)

**Location:** `phone-os/android-v1/harness/run-goal.sh`, around line 85-90:

```bash
( sleep 5400 && kill -TERM "$CLAUDE_PID" 2>/dev/null ) &
WATCHDOG_PID=$!
```

**Problem:** the subshell `(...)` inherits the write-end of the pipe from the upstream `claude -p ... | tee stream.jsonl | python3 ...` pipeline. When the parent kills `$WATCHDOG_PID`, the subshell dies but the inner `sleep 5400` becomes an orphan that *still holds the pipe fd*. `tee` can't see EOF until the orphan dies. Result: a 90-minute wait between every goal, even though each goal's claude finished in 4–14 minutes.

**Fix:** redirect the watchdog's fds away from the pipe:

```bash
( sleep 5400 && kill -TERM "$CLAUDE_PID" 2>/dev/null ) </dev/null >/dev/null 2>&1 &
WATCHDOG_PID=$!
```

Also belt-and-suspenders: when killing the watchdog after wait, kill the whole process group:

```bash
kill -TERM "-$WATCHDOG_PID" 2>/dev/null || kill "$WATCHDOG_PID" 2>/dev/null
```

(Requires `set -m` for job control, or run the watchdog in its own pgroup with `setsid`.)

### 2. First-frame black screen (MEDIUM)

When the launcher is first installed and set as default home, the very first screencap returned an all-black screen with only the system status bar. A force-stop + relaunch rendered the full lock surface correctly. Either Compose first-frame timing, an `enableEdgeToEdge()` ordering issue, or `rememberInfiniteTransition` not painting until composition settles. Investigate before this becomes anyone's first impression on a real device.

### 3. Harness file-path bug from before (FIXED, noting for posterity)

The earlier harness invocation used `$(cat <<HEREDOC)` with apostrophes in the prompt body, which broke bash heredoc/$()/quote interaction. Fixed by writing the prompt to a temp file with `printf`. If you change the prompt construction in run-goal.sh, do not regress.

---

## Files to read before doing anything (curated — these are all small)

In this order:

1. **This handoff** (you just did).
2. **`_context/android-build-2026-05-15/launcher-build-brief.md`** — the canonical spec for the lock surface. The implementation is supposed to match this. Numeric values (anchor 48dp, breath 2.6s, commit 70dp, smoothstep easing, per-direction palette) are the spec; deviations are bugs.
3. **`_context/android-build-2026-05-15/build-plan.html`** — current operational plan. Path is "Path B-cut for v1, D2-overlay as v2." Don't deviate without a real reason.
4. **`_context/android-build-2026-05-15/mock-deep-read.md`** — line-by-line summary of the React mock's behavior. The component-level spec from which the Compose translation should derive.
5. **`phone-os/ArgOS.Mock.Sessions.2026.04.15/src/app/components/`** — the actual React source. Read these for whatever screen you're modifying. Especially:
    - `LockScreen.tsx` — for the drag-gesture pattern Brian thinks is working better in the mock
    - `SessionsScreen.tsx` — for Discover behavior (tappability, mode toggle, ramp editing)
    - `AskScreen.tsx`
    - `ConnectScreen.tsx`
    - `HomeScreen.tsx`
6. **`visuals/launcher-mocks.html`** — the design instance's most recent HTML mock. The "Refined" section at the bottom is the spec; ignore the A/B/C/D variants above.
7. **`phone-os/android-v1/reports/morning.html`** — last night's overnight report. Has the cost/turns/Haiku verdicts per goal.
8. **`phone-os/android-v1/reports/morning-*.png`** — screenshots of all five surfaces from this morning, captured against the running emulator.
9. **`phone-os/android-v1/launcher/app/src/main/java/com/ptc/launcher/`** — the actual Kotlin source. Especially:
    - `MainActivity.kt` — entry point, NavGraph
    - `LockSurface.kt` (607 lines) — the four-direction lock screen
    - `DiscoverScreen.kt` (241 lines) — the Sessions screen
    - `AskScreen.kt` (403 lines) — voice-in UI
    - `ConnectScreen.kt` (264 lines) — inbox
    - `HomeScreen.kt` (204 lines) — app grid
    - `GrayscaleService.kt` (112 lines) — the AccessibilityService driving Color Correction
    - `SttService.kt` (212 lines) — Whisper API client
    - `UsageStatsRepository.kt` + `UsageStatsAggregator.kt` — passive tracking

**Do NOT read** (per Brian's instructions — too big, already distilled):

- `_context/Top.Level.Context.Dump.phone-that-cares-organized.md`
- The full writing corpus
- The four POSSIBLE/IMPOSSIBLE adversarial briefs unless you specifically need them

---

## Workspace paths

- **Project root:** `/Users/b/Desktop/PhoneThatCares/phone-os/android-v1/`
- **Launcher Kotlin source:** `phone-os/android-v1/launcher/app/src/main/java/com/ptc/launcher/`
- **Harness:** `phone-os/android-v1/harness/`
- **Goals:** `phone-os/android-v1/goals/`
- **Reports:** `phone-os/android-v1/reports/`
- **`.env.local`** (OPENAI_API_KEY, chmod 600, gitignored): `phone-os/android-v1/.env.local`

---

## How to re-run / install / iterate

### Setup environment

```bash
source /Users/b/Desktop/PhoneThatCares/phone-os/android-v1/harness/env.sh
```

This exports `JAVA_HOME`, `ANDROID_HOME`, `PATH` and sources `.env.local` for `OPENAI_API_KEY`.

### Boot the emulator (windowed, so Brian can see)

```bash
emulator -avd ptc-test -no-snapshot -no-audio -gpu swiftshader_indirect &
adb wait-for-device
# Wait for sys.boot_completed=1
```

### Rebuild + install the launcher

```bash
cd /Users/b/Desktop/PhoneThatCares/phone-os/android-v1/launcher
./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell cmd package set-home-activity com.ptc.launcher/.MainActivity
adb shell input keyevent KEYCODE_HOME
```

### Take a screenshot

```bash
adb exec-out screencap -p > /tmp/x.png
```

### Run a single goal headless via /goal

```bash
bash /Users/b/Desktop/PhoneThatCares/phone-os/android-v1/harness/run-goal.sh G7
# (after creating goals/G7.txt)
```

### Run the full overnight chain again

```bash
bash /Users/b/Desktop/PhoneThatCares/phone-os/android-v1/harness/overnight.sh
```

(Don't do this without fixing the orphan-sleep bug first, unless you want another 90-min-per-goal experience.)

---

## Suggested ordering for the next session

Priority order, but use judgment:

1. **Fix the orphan-sleep watchdog** (one-line fix, prevents another 7.5h-for-54min)
2. **Investigate + fix the drag gesture direction-classification bug.** Read `LockScreen.tsx` for how the React mock handles axis dominance, then port the logic to `LockSurface.kt`. This is the most-noticed UX issue.
3. **Make Discover cards interactive.** Card tap → launch the package; `GRAY`/`OFF` chip → toggle mode; ramp duration → editable. Per-app state already persists, you're just wiring the UI.
4. **Install real social apps on the emulator** (`adb install -r <apk>` — you'll need to source APKs from APKMirror or similar; or pull from Google Play via the emulator if it has Play Services on this AVD). Twitter, Instagram, Reddit, Substack, Spotify, Facebook, LinkedIn.
5. **Replace emoji icons with white line-work**: bottom flash + camera, and the weather indicator in the date row. Material Symbols line-work in white at appropriate alpha is the move.
6. **Fingerprint anchor: remove innermost ring**, keep just the plus + outer glow.
7. **Left-align lock surface text columns** (clock, date, inbox previews) to a consistent left margin.
8. **Fake status bar** at the top of the lock surface — time, message bubble, BT, WiFi, cellular, battery. Owned by us, white line-work, semi-transparent.
9. **Font size pass** — find Android's accessibility-recommended minimum for lock-screen text and bump anything below it.
10. **Design alignment pass** for Ask, Discover, Home — compare each Compose composable side-by-side with its React mock counterpart and reduce drift.
11. **Verify the actually-unverified bits**: drag commit threshold, mood overlay during drag, GrayscaleService toggling on foreground change, Ask STT round-trip with the OPENAI key.

The general principle Brian articulated, worth repeating: **if a goal you're working on implies a feature requires some other thing, auto-add that other thing.** Don't stop and ask; just include it in the goal's scope.

---

## Final notes

- Brian is generally pleased with how the overnight run worked as an experiment. He's not pleased with the rendering quality of specific screens vs the brief, but that's a *gap to close*, not a redirection.
- The lid was open during the run; caffeinate kept the Mac awake.
- Cost-wise, $8.20 for the whole night is comfortable. Don't worry about budget — he explicitly said "don't worry about cloud budget" yesterday evening.
- Tone in the morning was good. He said "thanks for helping getting this going" and "feeling good about that." He's in iteration-not-handwringing mode.

Good luck.
