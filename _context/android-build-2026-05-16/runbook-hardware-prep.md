# Hardware Runbook — Pixel 6 prep, Magisk install, module install, S1 spike

**Status (as of 2026-05-16 ~23:30 PDT):** Brian's already done T0.5 (bootloader unlocked, dev options on, USB debugging, OEM unlock). Overnight Claude is in the middle of step 3 (Magisk install). This runbook documents the full sequence so a fresh instance or morning-Brian can pick up.

---

## 0. Sanity check before anything

```
adb devices                                          # Pixel listed as "device"
adb -s 24031FDF60001Z shell getprop ro.boot.flash.locked   # → 0
adb -s 24031FDF60001Z shell getprop ro.build.fingerprint   # → google/oriole/...
```

If any of these fail, return to T0.5 prep.

**Pixel serial:** `24031FDF60001Z` (referred to as `$PIXEL` below).

## 1. Environment setup

```
source /Users/b/Desktop/PhoneThatCares/phone-os/android-v1/harness/env.sh
PIXEL=24031FDF60001Z
cd /Users/b/Desktop/PhoneThatCares/_context/android-build-2026-05-16/downloads
```

Already-staged files in `downloads/`:
- `oriole-ap2a.240805.005.f1-factory.zip` — full factory image (2.7 GB)
- `oriole-ap2a.240805.005.f1/` — extracted
- `oriole-ap2a.240805.005.f1/boot.img` — stock boot image
- `vbmeta-extract/vbmeta.img` — extracted from inner image zip
- `Magisk-v28.1.apk` — Magisk app
- `magisk-extracted/` — unzipped Magisk APK contents (binaries + scripts)
- `magisk-patched-boot-v3.img` — boot.img Magisk-patched (already pulled from device after on-device patch)

## 2. Patch boot.img with Magisk (already done — skip if `magisk-patched-boot-v3.img` exists)

If you need to re-patch (different factory image, different Magisk version):

```
adb -s $PIXEL shell "rm -rf /data/local/tmp/magisk-patch && mkdir /data/local/tmp/magisk-patch"
for f in oriole-ap2a.240805.005.f1/boot.img \
         magisk-extracted/lib/arm64-v8a/libmagiskboot.so \
         magisk-extracted/lib/arm64-v8a/libmagiskinit.so \
         magisk-extracted/lib/arm64-v8a/libmagisk.so \
         magisk-extracted/lib/arm64-v8a/libinit-ld.so \
         magisk-extracted/assets/stub.apk \
         magisk-extracted/assets/util_functions.sh \
         magisk-extracted/assets/boot_patch.sh; do
  adb -s $PIXEL push "$f" /data/local/tmp/magisk-patch/
done
adb -s $PIXEL shell "cd /data/local/tmp/magisk-patch && \
  mv libmagiskboot.so magiskboot && mv libmagiskinit.so magiskinit && \
  mv libmagisk.so magisk && mv libinit-ld.so init-ld && chmod -R 755 . && \
  sh boot_patch.sh boot.img"
adb -s $PIXEL pull /data/local/tmp/magisk-patch/new-boot.img ./magisk-patched-boot-v3.img
```

## 3. Flash patched boot + disable verity (THIS IS WHERE WE GOT STUCK TONIGHT)

```
adb -s $PIXEL reboot bootloader
# wait for fastboot
fastboot --slot=all --disable-verity --disable-verification flash vbmeta /Users/b/Desktop/PhoneThatCares/_context/android-build-2026-05-16/downloads/vbmeta-extract/vbmeta.img
fastboot flash boot /Users/b/Desktop/PhoneThatCares/_context/android-build-2026-05-16/downloads/magisk-patched-boot-v3.img
fastboot reboot
```

**Known issue tonight:** `fastboot --disable-verity --disable-verification flash vbmeta` returns `error: Failed to find AVB_MAGIC at offset: 0` despite the image having a valid `AVB0` header (verified via `xxd`). Possible causes:
- fastboot 37.0.0 (currently installed via `brew install --cask android-platform-tools`) may have a parsing bug or version mismatch with this image.
- The vbmeta image may need to be from a different factory image (try the original `AP2A.240605.024` device build instead of the August `AP2A.240805.005`).
- An older fastboot version may be more forgiving.

**Workarounds to try in order:**
1. **Use Magisk app's "Install" UI directly on the device.** Magisk-v28.1 is installed on the Pixel. Open it, tap Install → "Direct Install (Recommended)" or "Select and Patch a File" → pick `/sdcard/Download/boot.img` (push first). Magisk handles vbmeta internally. Reboot via `fastboot reboot fastboot` then `fastboot flash boot ...` from the Mac. This is the path most tutorials use and most reliably works.
2. **Try an older fastboot.** `brew install --cask --force android-platform-tools@33` — version 33 known to work cleanly with Pixel 6 + Magisk on Android 14.
3. **Build an empty vbmeta with avbtool** to flash instead: see https://android.googlesource.com/platform/external/avb/+/master/avbtool — the `make_vbmeta_image --flags 3` invocation produces a no-verification vbmeta.
4. **Match the actual device build's factory image** — current device fingerprint is `AP2A.240605.024`. Pull `oriole-ap2a.240605.024-factory-<hash>.zip` from https://developers.google.com/android/images (the JS-rendered table — manually copy the URL), extract `vbmeta.img`, try again.

After this step succeeds (verity disabled + Magisk boot flashed), boot the device. Verify:
```
adb -s $PIXEL shell getprop ro.boot.veritymode    # → disabled (NOT enforcing)
adb -s $PIXEL shell su -c id                      # → uid=0(root)
adb -s $PIXEL shell ls /data/adb/magisk           # → should list files
```

## 4. Install our priv-app Magisk module

Module is staged at `/Users/b/Desktop/PhoneThatCares/android-magisk-module/ptc-launcher-module.zip`. Build script: `cd .../android-magisk-module && bash build-module.sh`.

```
adb -s $PIXEL push /Users/b/Desktop/PhoneThatCares/android-magisk-module/ptc-launcher-module.zip /sdcard/Download/
adb -s $PIXEL shell "su -c 'magisk --install-module /sdcard/Download/ptc-launcher-module.zip'"
adb -s $PIXEL reboot
```

After boot:
```
adb -s $PIXEL shell pm list packages | grep ptc        # → com.ptc.launcher
adb -s $PIXEL shell dumpsys package com.ptc.launcher | grep -E "priv|appPath"
# Expect appPath=/system/priv-app/com.ptc.launcher/com.ptc.launcher.apk
# And privilegedApp=true
```

## 5. Set our launcher as default home

```
adb -s $PIXEL shell cmd package set-home-activity com.ptc.launcher/.MainActivity
```

Press home; our lock surface should appear. Screencap with `adb exec-out screencap -p > home-confirm.png`.

## 6. Notification listener permission grant

For T7's notification filter to receive notifications:
```
adb -s $PIXEL shell cmd notification allow_listener com.ptc.launcher/com.ptc.launcher.PtcNotificationListenerService
```

## 7. Run S1 spike protocol

See `research/s1-spike-protocol.md`. The condensed version:

**S1a (5 min):** verify our app can call `BiometricPrompt.authenticate()` and get a callback. Enroll a fingerprint first if not already. Brian's finger needed for ~30 sec.

**S1b (30 min):** disable Keyguard, verify our lock surface comes up on screen-wake and biometric in our app actually unlocks the device.

```
# Set screen lock to None first (eliminates CE-storage dependency)
adb -s $PIXEL shell settings put secure lockscreen.disabled 1
# (or via Settings → Security & privacy → Device unlock → Screen lock → None)

# Try Approach B first (RRO) — currently not implemented; defer to Approach A
# Approach A — pm disable the component:
adb -s $PIXEL shell "su -c 'pm disable com.android.systemui/com.android.systemui.keyguard.KeyguardService'"
adb -s $PIXEL reboot
```

After reboot, check via `dumpsys window | grep -i keyguard` whether Keyguard window is gone. Run the full S1b loop from the spike protocol doc.

## 8. Install test apps for daily-drive

See `test-apps.md`. Use Play Store via a signed-in Google account. ~15 min.

## 9. Disaster recovery (if anything bricks)

The factory image is staged at `downloads/oriole-ap2a.240805.005.f1/`. To re-flash factory:

```
cd /Users/b/Desktop/PhoneThatCares/_context/android-build-2026-05-16/downloads/oriole-ap2a.240805.005.f1
# Edit flash-all.sh to remove the -w flag if you want to keep userdata (or use -- skip-reboot then reboot manually).
# To preserve current data: comment out the line containing "-w".
bash flash-all.sh
```

This re-locks nothing, reverts to stock Android 14 August build, takes ~5 minutes. Bootloader unlock state is preserved (factory image flash doesn't relock).

If device is bootlooping in fastboot:
1. Volume down + power for 10 sec on the device to force-enter fastboot if not there.
2. `fastboot devices` should show it. If not, USB cable or driver issue.
3. Re-flash stock boot: `fastboot flash boot oriole-ap2a.240805.005.f1/boot.img` (NOT the patched one).
4. `fastboot reboot`.

---

## Tonight's actual state when leaving

- Device is booted to stock Android 14 (June 2024 build, fingerprint `AP2A.240605.024`), bootloader unlocked, Magisk APK installed but NOT yet bootstrapping root.
- Boot partition has been flashed with `magisk-patched-boot-v3.img` (Magisk-patched, default flags). Kernel reflects this (June 3 2024 build from August factory image).
- vbmeta is still `enforcing` verity — that's the blocker.
- All files for resumption are staged in `_context/android-build-2026-05-16/downloads/`.
- DND total silence is on (`zen_mode=2`) so notifications won't wake Brian.

Resume from §3 above with one of the listed workarounds.
