# S1 Spike Protocol — Keyguard Substitution + Device-Unlock Authority

**Audience:** the operator on real hardware. Could be overnight Claude, morning Brian, or a later instance. Designed to be executed step-by-step.

**Preconditions:** Magisk installed on Pixel 6, our priv-app launcher installed via the Magisk module, `adb` access. The launcher should already render on emulator and on the device when launched via `am start`.

**Goal of S1:** determine whether Plan A (Magisk + priv-app on stock Pixel 6) can deliver real lockscreen replacement + biometric device-unlock-authority.

**Two sub-spikes**, in order:

---

## S1a — Fingerprint sensor accessibility from our app (≤5 min)

**The question:** Can our priv-app call `BiometricPrompt.authenticate()` and receive a success callback on real Pixel 6 hardware? (Strong prior: yes.)

### Setup

1. Enroll a fingerprint in stock Settings (Settings → Security & privacy → Device unlock → Fingerprint Unlock). This is the only step requiring Brian's finger. ~30 seconds.
2. Confirm our launcher is installed and runs: `adb shell pm list packages | grep com.ptc.launcher` shows it; `adb shell am start -W -n com.ptc.launcher/.MainActivity` succeeds; screencap shows the lock surface.

### Test

Build a tiny throwaway `biometric-probe.apk` (or add a hidden hook in our launcher's lock surface — a 5-tap on the time block triggers it). The probe calls:

```kotlin
val prompt = BiometricPrompt(activity, executor,
    object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
            // log "S1a:PASS"
        }
        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
            // log "S1a:ERR code=$errorCode msg=$errString"
        }
    })
prompt.authenticate(BiometricPrompt.PromptInfo.Builder()
    .setTitle("S1a probe")
    .setNegativeButtonText("Cancel")
    .build())
```

Watch logcat: `adb logcat -s ptc:V`.

### Pass/Fail

- **Pass:** logcat shows `S1a:PASS` after Brian touches the sensor. Proceed to S1b.
- **Soft-pass:** prompt shows but never gets to `onAuthenticationSucceeded` (sensor unresponsive). Probably hardware / enrollment issue, not our problem. Re-enroll and retry once.
- **Fail with error code `BIOMETRIC_ERROR_NO_HARDWARE` / `HW_UNAVAILABLE`:** rooted-app-can't-touch-biometric scenario. Document, escalate. *Very* unlikely on stock Android 14.
- **Fail with permission denied:** our priv-app whitelist is missing something. Add `USE_BIOMETRIC` to manifest, rebuild module.

---

## S1b — Device-unlock-authority (≤30 min)

**The question:** With `KeyguardService` disabled, does our priv-app's biometric success actually leave the device in a usable "unlocked" state? Can the user launch normal apps without re-encountering Keyguard?

### Setup — eliminate CE-storage dependency

CE (credential-encrypted) storage decrypts when the lockscreen credential is verified. With `KeyguardService` disabled, CE may not decrypt, leaving some app data inaccessible. For S1b, set screen lock to **None** so there's no CE-bound credential:

```
adb shell settings put secure lockscreen.disabled 1
# Or: stock Settings → Security & privacy → Device unlock → Screen lock → None.
```

This is acceptable for v1 personal-use (per architect.md).

### Approach B-first — RRO on `config_enableKeyguardService` (≤5 min)

**Build the overlay APK** (`keyguard-disable-overlay/`):

```
overlay/
├── AndroidManifest.xml
└── res/values/config.xml
```

`AndroidManifest.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.ptc.overlay.keyguarddisable">
    <overlay android:targetPackage="com.android.systemui"
             android:isStatic="true"
             android:priority="1000" />
</manifest>
```

`res/values/config.xml`:
```xml
<resources>
    <bool name="config_enableKeyguardService">false</bool>
</resources>
```

Build with `aapt2`, sign with same key as the launcher (debug is fine), push to `/product/overlay/` via the Magisk module (or `adb shell mount -o remount,rw /product` if not).

**Apply:**
```
adb shell cmd overlay enable --user current com.ptc.overlay.keyguarddisable
adb reboot
```

**After reboot, observe:**
1. Does the device boot normally? → if no (boot loop), recovery-flash, RRO didn't catch the manifest attribute, move to Approach A.
2. `adb shell dumpsys window | grep -i keyguard` — does it show a Keyguard window? → no Keyguard window = RRO worked.
3. Wake screen with `adb shell input keyevent KEYCODE_POWER`. What appears?
   - **Pass:** our launcher's lock surface appears, no stock Keyguard. Proceed to "Full S1b loop."
   - **Soft-pass:** our launcher appears but `dumpsys window` shows Keyguard window still — overlay didn't take. Try Approach A.
   - **Fail:** stock Keyguard appears, or black screen. Move to Approach A.

### Approach A-fallback — `pm disable` the component (≤5 min)

If RRO didn't work, fall back to the surgical component-disable:

```
adb shell pm disable com.android.systemui/com.android.systemui.keyguard.KeyguardService
adb reboot
```

**After reboot, observe:**
1. Does the device boot normally? → if boot loop, recovery-flash. If yes, proceed.
2. `adb shell dumpsys window | grep -i keyguard` — Keyguard window absent? → component-disable worked.
3. Stock SystemUI sanity check:
   - `adb shell input swipe 500 0 500 1000` (notification shade swipe down) — does the shade appear?
   - `adb shell input keyevent KEYCODE_APP_SWITCH` — does recents appear?
   - If both: SystemUI is alive, just Keyguard is out. Good.
   - If either fails: we damaged more than just Keyguard. Document, may need RRO instead.
4. Wake screen — same observations as Approach B step 3.

### Full S1b loop (after either A or B succeeds at "no Keyguard window")

This is the load-bearing test sequence.

**Step 1: Screen-wake observation.**
- `adb shell input keyevent KEYCODE_POWER` (screen off).
- Wait 2 seconds.
- `adb shell input keyevent KEYCODE_POWER` (screen on).
- Screencap: `adb exec-out screencap -p > S1b-wake.png`.
- **Pass:** screencap shows our lock surface. **Fail:** anything else.

**Step 2: Our biometric gate.** (Reuse the S1a probe, hooked into the lock surface so it fires on first user interaction — e.g. the fingerprint anchor tap.)
- Brian touches the sensor.
- Logcat: `S1b:PASS` (our gate accepted the biometric).
- Screencap: `S1b-after-biometric.png`. Lock surface should transition to next state per the navigation graph.

**Step 3: Launch a normal app, observe no Keyguard.**
- `adb shell am start -n com.android.settings/.Settings`.
- Screencap: `S1b-settings.png`.
- **Pass:** Settings shows, no Keyguard credential prompt. **Soft-pass:** Settings shows but a "verify identity" prompt appears for sensitive sections (acceptable — some Settings sections explicitly check `isKeyguardSecure()`). **Fail:** stock Keyguard appears, OR Settings refuses to open.

**Step 4: Lock + repeat.**
- `adb shell input keyevent KEYCODE_POWER` (off).
- `adb shell input keyevent KEYCODE_POWER` (on).
- Same as Step 1 — our lock surface should re-appear.
- This validates the loop: screen-on → our surface → biometric → unlocked → use device → screen off → screen-on → our surface again.

**Step 5: Notification shade unfiltered behavior.**
- From our lock surface, swipe down (`adb shell input swipe 500 100 500 1500`).
- Screencap: `S1b-shade.png`.
- **Pass:** notification shade pulls down normally, showing system notifications, no "verify identity" prompt. **Soft-pass:** shade pulls down but says "verify identity to see notifications" — that's the failure mode where some subsystem still holds locked-state. Document; this is path (b) from research §6.

### Pass/Soft-pass/Fail interpretation

- **Pass all 5 steps:** Plan A is **alive and viable**. Path (a) from research holds. The work for v1 is now "ship the real biometric integration on the lock surface, the GrayscaleService validation, and the daily-drive setup." Update architect.md with the confirmed outcome.

- **Pass 1-4, soft-pass on 5 (shade demands verify):** Plan A is **mostly alive**. The shade case is a UX wart, not a blocker. Either: a) accept it (the user verifies once per session via the shade; not ideal); b) investigate `TrustManagerService` to grant trust at boot via Magisk script; c) keep `KeyguardService` enabled but use a Keyguard-bound `KeyguardSlice` provider — way more work. Document, decide later.

- **Fail on 1 (screen-wake doesn't show our surface):** Plan A is **partially blocked**. Need to investigate what does come up on wake — is it stock Keyguard (RRO didn't catch), the previous app (we never imposed lockscreen behavior), or black (SystemUI confused)?

- **Fail on 2 (biometric in our app):** S1a should have caught this. Re-run S1a; if S1a passes and S1b fails, the difference is the rooted-priv-app context. Investigate.

- **Fail on 3 (Settings refuses, Keyguard appears):** path (b) is real. Plan A still alive but harder — would need additional plumbing. Document, escalate.

- **Hard fail (boot loop, SystemUI dead, etc):** recover via factory image flash, document, consider Plan B pivot. Per build plan's threshold, hard fail = "KeyguardService requires platform-cert AND no spoofing path" — neither A nor B working may indicate this is the case.

### Branching out of S1b

| Outcome of S1b | Next move |
|---|---|
| Full pass | Move to T6 next steps (real biometric integration into lock surface), declare Plan A confirmed |
| Soft-pass on 5 only | Move forward, note in `state-T6.md`; come back to shade-state later |
| Fail on 1 with RRO | Switch to Approach A (pm disable component), re-run |
| Fail on 1 with both A and B | Plan A blocked. Document failure, consider Plan B (source fork stock AOSP). Don't decide pivot autonomously — leave the decision for morning Brian. |
| Hard fail | Recover via factory image, document, pause |

---

## Artifacts produced by S1

Per the build plan, write everything to `/Users/b/Desktop/PhoneThatCares/_context/android-build-2026-05-16/artifacts/`:

- `S1a-result.txt` — pass/fail + logcat slice
- `S1b-wake.png` — screencap after first screen-wake
- `S1b-after-biometric.png` — screencap after biometric success
- `S1b-settings.png` — screencap after launching Settings
- `S1b-shade.png` — screencap of notification shade pull-down
- `S1b-result.md` — pass/soft-pass/fail per step + overall disposition

---

## Throwaway code: biometric-probe

For S1a, we have two options:
- **Option A:** a separate `biometric-probe.apk` (~50 lines Kotlin). Cleaner — doesn't pollute the launcher.
- **Option B:** a hook in the launcher's lock surface (e.g., tap the time block 5× to invoke the probe). Faster — no separate build.

**Recommendation: Option B for tonight.** Add a `TapCountModifier` to the time block; on 5 taps within 3 seconds, fire the biometric probe + log. Remove this code in the post-S1 cleanup. (Documented in T6's "after S1 passes" step.)

---

## What if we can't get to S1 tonight at all

If factory image download / Magisk install / module install doesn't complete tonight (e.g. blocking issue, time runs out), this protocol document survives unchanged. Morning Brian or next instance picks up T6's "preconditions" check, gets to "preconditions met," then runs this protocol from the top.
