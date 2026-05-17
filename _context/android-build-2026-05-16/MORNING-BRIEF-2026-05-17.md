# Morning Brief — 2026-05-17

**Read this first.** Then `_context/sessions/android.md` for the live state. Then specific docs as needed.

---

## TL;DR

Overnight got further than the build plan's "target," didn't reach "moon." The full software stack — launcher prep fixes, research, S1 spike protocol, Magisk module skeleton, notification filter scaffolding, test app list, hardware runbook — is shipped and committed. The Pixel 6 is in a known-good stock state with the Magisk APK installed and the bootloader unlocked. The unblocked path from here to a Magisk-rooted Pixel is ~10 minutes of your hands, and from there to S1 spike result is another ~30 minutes.

The blocker was an unexpected fastboot 37.0.0 quirk on the vbmeta image — `Failed to find AVB_MAGIC at offset: 0` despite the image being valid. Workarounds documented; the simplest is using the Magisk app's UI on the device to patch boot.img directly (it handles vbmeta internally).

---

## What's done (committed on wip/overnight-2026-05-16)

**Launcher repo** (`phone-os/android-v1/launcher`, branch `wip/overnight-2026-05-16`):
- `4f62cd7` — T0: drag direction-lock fix + first-frame black fix (enableEdgeToEdge ordering + splash-screen background) + verified by uninstall/install/screencap cycle. Run-goal.sh watchdog fix lives in PTC root.
- `631677d` — T7: notification filter scaffolding. NotificationsSettings.kt (real TextField + SharedPreferences), NotificationFilter.kt (pure-Kotlin keyword stub, 6 unit tests), PtcNotificationListenerService.kt (registered in manifest, needs one-time grant), debug ring buffer (long-press a header to toggle), built into APK.

**PTC root repo** (`branch wip/overnight-2026-05-16`):
- `d979625` — initial commit (was already there)
- `dd6328b` — T0 root-level files (run-goal.sh watchdog, all docs, etc.) — this was a big bulk-import commit because the root had never been committed before
- `2a075f1` — T2: Magisk module skeleton at `/android-magisk-module/` (build-module.sh, flash.sh, reset.sh, README, permission XML, update-binary verbatim from Magisk master)
- `2a75104` — T7 state doc
- `a83785c` — T3 spike protocol + T4 hardware runbook + T4.5 test apps + architect.md updates + session notes

## Where the Pixel is right now

- Bootloader unlocked (state preserved through everything)
- Currently booted to stock Android 14 (`AP2A.240605.024` per build fingerprint, August kernel from boot.img re-flash) — *should* be on stock boot.img again (recovery completed before sleep)
- Magisk-v28.1 APK installed as a normal app
- DND total silence on so you weren't woken
- Bootloader: unlocked, slot _b active, no Magisk rooted state

**One sanity check before resuming:**
```
source /Users/b/Desktop/PhoneThatCares/phone-os/android-v1/harness/env.sh
PIXEL=24031FDF60001Z
adb -s $PIXEL shell "getprop ro.build.fingerprint; getprop ro.boot.flash.locked; getprop ro.boot.veritymode"
```
Expect: build fingerprint Android 14 oriole, `flash.locked=0`, `veritymode=enforcing` (NOT yet disabled).

If anything looks bricked, run `runbook-hardware-prep.md` §9 (disaster recovery) — the August factory image is at `_context/android-build-2026-05-16/downloads/oriole-ap2a.240805.005.f1/` ready to be `flash-all.sh`'d. Bootloader unlock is preserved through any factory flash.

## The blocker and three ways around it

**Problem:** `fastboot --disable-verity --disable-verification flash vbmeta ...` returns `error: Failed to find AVB_MAGIC at offset: 0` on fastboot v37.0.0, even though the vbmeta.img has a valid `AVB0` header (verified via `xxd` and md5 vs. fresh extract). Without verity disabled, the Magisk-patched boot.img runs but Magisk's init bails before bootstrapping root — so `magisk` binary never appears, `su` doesn't work, our priv-app module can't install.

**Workaround 1 (recommended — ~5 min):** drive Magisk app on the device.
```
adb -s $PIXEL push downloads/oriole-ap2a.240805.005.f1/boot.img /sdcard/Download/
adb -s $PIXEL shell am start -n com.topjohnwu.magisk/.ui.MainActivity
```
On the device: Install → Select and Patch a File → pick boot.img from Download → wait for patch. The patched img writes to `/sdcard/Download/magisk_patched-*.img`. Pull it, flash via fastboot. **Magisk app handles vbmeta internally** — this is the canonical path and bypasses the fastboot CLI bug. The CLI path we tried tonight just couldn't pass the verity-disable to a file fastboot 37 refused to parse.

**Workaround 2 — older fastboot.** `brew uninstall --cask android-platform-tools && brew install --cask android-platform-tools@33`. Older fastboot may not have the AVB_MAGIC check. Re-try the same commands.

**Workaround 3 — avbtool-generated empty vbmeta.** Bigger lift, more reliable for repeated use: build a no-verification vbmeta with `avbtool make_vbmeta_image --flags 3 --output vbmeta-empty.img` and flash that without `--disable-verity` flags. Requires installing `avbtool` (Python-based, pip-installable from the AOSP source tree).

## Then the rest of the path (already documented)

After verity disable + Magisk bootstrapped:
1. Install our priv-app module: `bash /Users/b/Desktop/PhoneThatCares/android-magisk-module/flash.sh` (not dry-run). It pushes the zip to `/sdcard/Download/`, calls `magisk --install-module`, reboots.
2. Set our launcher as default home: `adb shell cmd package set-home-activity com.ptc.launcher/.MainActivity`.
3. Grant notification listener: `adb shell cmd notification allow_listener com.ptc.launcher/com.ptc.launcher.PtcNotificationListenerService`.
4. Run S1 spike per `research/s1-spike-protocol.md`. ~30 min including biometric enrollment (one-time finger tap).
5. After S1 passes: install test apps per `test-apps.md`.

## The hard question — Plan A still alive?

Based on tonight's evidence I'd say **yes, very probably.** The fastboot-CLI blocker is a tooling bug, not a fundamental issue with Plan A. The Magisk app's UI path is well-trodden for exactly this device + build class. The research's core finding stands: we don't need platform-cert signing for Keyguard substitution; RRO + pm-disable-component should work; the gating S1b question (does device-unlock-authority "just work" post-Keyguard-disable) is still unresolved but is exactly what's resolvable in 30 min of hardware time once we get past the verity wall.

If after Workaround 1 you still can't get Magisk rooted, that *would* be evidence to reconsider Plan A — but probably not Plan B yet. More likely the device build / image mismatch is the issue (we have August factory but device is June fingerprint), and the right move is to download `oriole-ap2a.240605.024-factory-<hash>.zip` to match the exact device build. Get the hash from https://developers.google.com/android/images (JS-rendered table; manual copy).

## Open questions for you when you wake up

1. **Comfortable with the Workaround 1 path?** ~5 min on the device + 2 min on the Mac. The other workarounds are more elaborate.
2. **Test apps — install path?** The `test-apps.md` flagged this: real Google account vs. throwaway vs. no-Google-sideload-only. *Lean: throwaway.*
3. **If S1b passes**, do you want me to keep going on real launcher↔Keyguard integration, or hold for your direction? Big chunks would come next: real BiometricPrompt wiring into the lock surface, the actual GrayscaleService hardware validation, real LLM wire-up for the notification filter, the missing real-Keyguard-substitute window-flag handling.

---

## Files to read after this brief (in order)

1. `_context/sessions/android.md` — current state, 8 bullets, what's done what's not
2. `_context/android-build-2026-05-16/runbook-hardware-prep.md` — the full step-by-step including the workarounds for the vbmeta blocker
3. `_context/android-build-2026-05-16/research/s1-spike-protocol.md` — what to do once Magisk is rooted
4. `_context/android-build-2026-05-16/architect.md` — locked-in decisions, refreshed tonight (substrate flipped back to stock, biometric primary as goal, notification filter section added, etc.)
5. `_context/android-build-2026-05-16/research/magisk-stock-pixel6-feasibility.md` — full technical research underpinning everything

---

Slept well, hope.
