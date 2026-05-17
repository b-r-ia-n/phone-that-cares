# android-magisk-module

Magisk module that installs the PTC launcher (`com.ptc.launcher`) as a
system priv-app on a Magisk-rooted Pixel 6 running stock Android 14
(`AP2A.240605.024`), with a permission allowlist sized for Keyguard
substitution.

This is T2 from the overnight build plan. The deliverable is artifacts,
not a working device — flashing happens on hardware after this lands.

## Files

```
android-magisk-module/
├── README.md                          this file
├── build-module.sh                    stage APK + zip the module
├── flash.sh                           push the zip to device and install via magisk
├── reset.sh                           rollback runbook to factory stock
└── module/                            contents zipped into ptc-launcher-module.zip
    ├── module.prop                    Magisk module manifest
    ├── META-INF/com/google/android/
    │   ├── update-binary              upstream Magisk module installer (see Provenance)
    │   └── updater-script             single line `#MAGISK`
    └── system/
        ├── priv-app/com.ptc.launcher/
        │   └── com.ptc.launcher.apk   (placed here by build-module.sh; not committed)
        └── etc/permissions/
            └── privapp-permissions-com.ptc.launcher.xml
```

No `post-fs-data.sh` — Magisk's default auto-mount handles permissions and
SELinux contexts (`0644 system:system u:object_r:system_file:s0`) correctly
for the APK + XML on `/system`. Per research §2.

## End-to-end usage

```bash
# 1. Build the module zip.
./build-module.sh
#   -> stages phone-os/android-v1/launcher/.../app-debug.apk into the tree
#   -> writes ptc-launcher-module.zip
#   -> prints zip listing + sha256

# 2. (Hardware) prepare the Pixel 6:
#    - Unlock bootloader (one-time): fastboot flashing unlock
#    - Patch init_boot.img via Magisk app, fastboot flash init_boot, reboot
#    See research/magisk-stock-pixel6-feasibility.md §1 for the full procedure.
#    See _context/android-build-2026-05-16/runbook-hardware-prep.md if it exists.

# 3. Install the module on device.
./flash.sh --dry-run     # read every command before pulling the trigger
./flash.sh               # actually push + install + reboot

# 4. Verify after reboot:
adb shell ls /system/priv-app/com.ptc.launcher/
adb shell ls /system/etc/permissions/ | grep ptc
adb shell pm list packages | grep com.ptc.launcher
adb shell dumpsys package com.ptc.launcher | grep -E 'privileged|granted=true'
```

## flash.sh refuses-to-run preconditions

- `adb` on PATH
- exactly one device in `adb devices` (state `device`, not unauthorized/offline)
- `ro.boot.flash.locked == 0` (bootloader unlocked)
- `su -c id` returns `uid=0` (Magisk root present)
- `ptc-launcher-module.zip` exists (run `./build-module.sh` first)

`--dry-run` skips the device checks too and just prints commands.

## Permissions in the allowlist

Only `signature|privileged` perms are listed. Pure `signature` perms
(`STATUS_BAR_SERVICE`, `INTERNAL_SYSTEM_WINDOW`) are deliberately excluded —
they require the platform certificate, which is not obtainable on stock
Pixel firmware. The launcher is architected to not request them.
See `_context/android-build-2026-05-16/research/magisk-stock-pixel6-feasibility.md` §3 and §4.

Included:
- `CONTROL_KEYGUARD` — call into KeyguardService
- `BIND_KEYGUARD_APPWIDGET` — appwidget hosting on the lock surface
- `MANAGE_USERS` — multi-user awareness
- `STATUS_BAR` — toggle/expand status bar (the privileged variant, not the `signature` SERVICE one)
- `READ_PRIVILEGED_PHONE_STATE`, `MODIFY_PHONE_STATE` — call state for ringer/lock interactions
- `WAKE_LOCK` — keep screen on during unlock UX
- `DISABLE_KEYGUARD` — deprecated but harmless; mostly here as a flag

The launcher manifest must also `<uses-permission>` each of these. The XML
file grants the right, the manifest requests it.

## Reset

`reset.sh` is the rollback runbook. It does NOT auto-download the factory
image. It expects you to have already downloaded and extracted
`oriole-ap2a.240605.024-factory-*.zip` from
https://developers.google.com/android/images and walks through
`fastboot --skip-reboot flashall` interactively, preserving userdata.
The script also documents an EMERGENCY bootloop-recovery checklist
inline at the bottom.

## Provenance of `update-binary`

`module/META-INF/com/google/android/update-binary` is fetched verbatim from:

  https://raw.githubusercontent.com/topjohnwu/Magisk/master/scripts/module_installer.sh

Fetched 2026-05-16. SHA-256 of the fetched file:

  bcf4b1d9913f3af17755569c853e0b5a75b8005f6a18eb3f86dadcc0e968c29d

If you update Magisk and the installer changes, re-fetch from that URL and
verify the hash. The hash above is the snapshot we built against.

## What this module is NOT

- Not a Keyguard-disable mechanism. That happens via `pm disable` of
  `com.android.systemui/.keyguard.KeyguardService` or via an RRO, separately
  on-device after this module is installed. See research §5.
- Not a way to obtain `signature` permissions. The launcher must be
  architected to not request them. See research §4.
- Not signed with the platform certificate (debug-signed). Priv-app
  *placement* is what grants priv-app eligibility, not the signature.

## Cross-references

- Build plan: `_context/android-build-2026-05-16/build-plan-overnight-2026-05-16.md` (T2)
- Architect notes: `_context/android-build-2026-05-16/architect.md`
- Feasibility research: `_context/android-build-2026-05-16/research/magisk-stock-pixel6-feasibility.md`
- Lockscreen replacement plan: `_context/android-build-2026-05-16/lockscreen-replacement-plan.md`
