# Phone That Cares — Android v1 (overnight build)

You are one of several Claude instances building Phone That Cares Android v1 against the Android Emulator on Brian's Mac. Today is 2026-05-16. Brian is asleep; this run is autonomous.

## Required reading (in order)

1. `/Users/b/Desktop/PhoneThatCares/_context/android-build-2026-05-15/launcher-build-brief.md` — **the spec for the four-direction picker / first-screen-after-unlock**. Read this in full. Numeric values (anchor 48dp, breath 2.6s, commit 70dp, smoothstep easing, per-direction palette) are the spec. Calibrate but don't ignore.
2. `/Users/b/Desktop/PhoneThatCares/visuals/launcher-mocks.html` — interactive HTML mock. The **Refined** section at the bottom is the visual target. The A/B/C/D variants above it are exploration only — ignore for the build.
3. `/Users/b/Desktop/PhoneThatCares/_context/design-skill-2026-04-30.md` — visual register / tonal guide. Read once.
4. `/Users/b/Desktop/PhoneThatCares/_context/android-build-2026-05-15/mock-deep-read.md` — component-by-component summary of the React mock you'll be translating to Compose.
5. `/Users/b/Desktop/PhoneThatCares/phone-os/ArgOS.Mock.Sessions.2026.04.15/src/app/components/` — the actual React mock source. Read the component for whatever screen you're building.

## Workspace

- `/Users/b/Desktop/PhoneThatCares/phone-os/android-v1/launcher/` — the Compose launcher project (you'll create this if G1 hasn't run yet)
- `/Users/b/Desktop/PhoneThatCares/phone-os/android-v1/goals/` — one file per goal with its `/goal` condition
- `/Users/b/Desktop/PhoneThatCares/phone-os/android-v1/reports/` — overnight transcripts + morning summary
- `/Users/b/Desktop/PhoneThatCares/phone-os/android-v1/harness/` — shell scripts that run you

## Environment (set by the harness when invoked)

- `JAVA_HOME=/opt/homebrew/opt/openjdk@17`
- `ANDROID_HOME=/opt/homebrew/share/android-commandlinetools`
- `PATH` includes `$JAVA_HOME/bin`, `$ANDROID_HOME/cmdline-tools/latest/bin`, `$ANDROID_HOME/platform-tools`, `$ANDROID_HOME/emulator`
- An AVD called `ptc-test` is running headless on Android 14 (API 34), ARM64.
- `OPENAI_API_KEY` is exported if Brian provided one (for Ask wiring).

**If you spawn a sub-shell that doesn't inherit env**, source `harness/env.sh` first.

## Package convention

- Application id: `com.ptc.launcher`
- Main activity: `com.ptc.launcher.MainActivity`
- Min SDK 30, target SDK 34, Compose BOM latest stable
- Kotlin 1.9+, Compose Compiler matched to BOM

## Design principles (override if conflict with launcher-build-brief)

- Warm restraint. Inter font with `ss01 cv11 tnum`. Tabular numerics on numbers.
- Sub-200ms motion. No animation on high-frequency actions.
- "Integration not restriction" — the grayscale ramp is feedback, NOT a hard limit. User can continue past budget; it just stays fully grayscale.

## Four directions (from launcher-build-brief)

| Dir | Mode | Route | Mood (in-transit bleed) |
|---|---|---|---|
| ↑ | Discover | `/sessions` | radial top, blue `rgba(140,160,220, 0.26)` |
| ↓ | Ask | `/ask` | radial bottom, amber `rgba(225,170,95, 0.24)` |
| ← | Connect | `/connect` | radial left, coral `rgba(225,155,140, 0.24)` |
| → | Home | `/home` | radial right, pale blue `rgba(195,210,230, 0.14)` |

These match the existing React mock; do not change.

## Lock screen for tonight

We are NOT replacing the actual lock screen. The four-direction picker is the launcher's home activity — it's the first screen you see after stock unlock. Per launcher-build-brief, the picker uses a fingerprint anchor + drag gesture even though the actual fingerprint sensor isn't intercepted (the emulator doesn't have one anyway). The visual model is the spec; the gesture flow is "tap anchor, drag in a direction, commit at 70dp."

## Per-app state model (from sessionsStore.ts in the React mock)

```kotlin
data class AppSessionState(
  val packageName: String,
  val mode: Mode,                // GRAYSCALE, OFF (others deferred)
  val dailyRampMinutes: Int,     // Instagram 30, X 15, others vary 20–45
  val timeSpentTodayMs: Long,
  val dayKey: String,            // YYYY-MM-DD, resets at midnight local
)
```

Linear interpolation: `progress = timeSpentTodayMs / (dailyRampMinutes * 60_000.0)`, clamped 0..1. Grayscale intensity = progress × 100%.

## How to verify your work

- Build with `./gradlew :app:assembleDebug` from the launcher dir.
- Install with `adb install -r app/build/outputs/apk/debug/app-debug.apk`.
- Take a screenshot: `adb exec-out screencap -p > /tmp/screenshot.png`.
- Inspect activity stack: `adb shell dumpsys activity activities | head -50`.
- Read logs: `adb logcat -d -t 200 | grep -E "ptc\.launcher|FATAL|AndroidRuntime"`.
- The emulator (AVD: ptc-test) is already booted; verify with `adb devices`.

## Failure handling

If you get stuck for >5 turns on the same error, write what you tried + why you think it's failing to `reports/G{N}/stuck.md`, then either try a different angle OR declare the goal partially met and surface what got done. Partial progress is fine; the morning report shows what got done.

## A directive from Brian (added 2026-05-16, late evening)

> "The downsides are pretty low tonight, so swing for the fences. I'd rather wake up to broken stuff I can click than pristine empty folders. Improvise, persevere."

Translation: if the goal condition says "at least 3 mock app tiles," consider shipping 10 with real polish. If a screen "renders without crash," consider whether the visual register from the React mock + launcher-build-brief is actually achieved, not just whether it compiles. Lean toward more ambition than the literal goal, especially on visual surfaces. If you have to choose between (a) a clean, minimal version that meets the literal condition and (b) a more complete version that pushes past the condition but might have rough edges — pick (b). Brian can click around and tell us what's right in the morning. He cannot click around a folder of `// TODO`s.

## Commit hygiene

The launcher repo is a fresh git repo. Commit per logical change with descriptive messages. **Do not commit `.env.local` or any file containing API keys.** A `.gitignore` is already in place at the project root above; create one in the launcher repo too.
