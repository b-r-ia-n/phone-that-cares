# Magisk + Priv-App Feasibility on Stock Pixel 6 (Android 14)

**Target:** `oriole`, build `AP2A.240605.024` (June 2024 stock factory image).
**Goal:** install our launcher as `/system/priv-app/`, claim Keyguard-substitution-tier permissions, replace SystemUI Keyguard.
**Written:** 2026-05-16 evening. T1 task from the overnight build plan.
**Disposition:** Plan A is feasible up to the priv-app install. The platform-signature question is the single gate. There is a plausible but unverified path that avoids it (RRO disabling `config_enableKeyguardService` + `pm disable` of the component) — needs hardware.

---

## 1. Magisk install path for stock Pixel 6 Android 14

### Concrete steps

1. **Download factory image** matching the device's exact build:
   - Device: `oriole`. Build: `AP2A.240605.024` (June 2024).
   - Source: `https://developers.google.com/android/ota` (OTA images) or the matching factory image at `https://developers.google.com/android/images`. **Match the build fingerprint exactly** — Magisk on the wrong build = boot loop.
2. **Extract `init_boot.img`** from the factory image ZIP (Pixel 6 on Android 13+ uses `init_boot.img`, **not** `boot.img` — see "known issue" below). Pixel 6 shipped with Android 12 (`boot.img`), but devices currently on Android 13/14 OTA-migrated to the `init_boot` partition layout.
   - Unzip the factory image → unzip the inner `image-oriole-*.zip` → grab `init_boot.img`.
3. **Transfer `init_boot.img` to device** via `adb push` to `/sdcard/Download/`.
4. **Install Magisk APK** on device (Magisk 27.x stable — current as of June 2024 reference; latest is fine for stock Pixel). Open Magisk → Install → "Select and Patch a File" → pick `init_boot.img` → it writes `magisk_patched-<rand>.img` to `/sdcard/Download/`.
5. **Pull the patched image back** with `adb pull /sdcard/Download/magisk_patched-*.img ./magisk-patched-init_boot.img`.
6. **Flash via fastboot:**
   ```
   adb reboot bootloader
   fastboot flash init_boot magisk-patched-init_boot.img
   fastboot reboot
   ```
7. **Verify root:** `adb shell su -c id` returns `uid=0(root)`. Open Magisk app — it self-completes setup on first launch (requires one reboot).

### Citations / write-ups

- DroidWin, "How to Root Android 14 via Magisk Patched Boot/Init_Boot": https://droidwin.com/how-to-root-android-14-via-magisk-patched-boot-init_boot/
- XDA "[GUIDE] Pixel 6 oriole: Unlock Bootloader, Update, Root, Pass SafetyNet": https://xdaforums.com/t/guide-pixel-6-oriole-unlock-bootloader-update-root-pass-safetynet.4356233/
- Magisk official OTA / install guides: https://topjohnwu.github.io/Magisk/install.html and https://topjohnwu.github.io/Magisk/ota.html
- Pre-patched `init_boot.img` reference for `AP2A.240605.024` exists (community-built, Magisk 27.0). Trust your own patch over a stranger's.

### Known issue on this specific build

- **`init_boot` vs `boot`** — Pixel 6 originally shipped with Android 12 using `boot.img` for ramdisk. On Android 13+, the ramdisk moved to a separate `init_boot` partition. Patching the wrong partition is the #1 cause of boot loop on this device class. For `AP2A.240605.024` (Android 14), **patch `init_boot.img`, flash to `init_boot`**.
- Magisk 27.x is the current stable lineage. Earlier 26.x is fine on Android 14 if needed; avoid Canary unless you need a specific fix.

**Answer:** Path is well-trodden. Patch `init_boot.img` from the matching factory image, fastboot-flash to the `init_boot` partition. Pre-stage the factory image as the recovery escape hatch.

---

## 2. Priv-app placement via Magisk module

### Module structure

Standard Magisk module skeleton — the "systemless `/system`" overlay model. The module's `system/` directory mirrors the partition layout; on boot Magisk bind-mounts it over real `/system` without modifying the underlying partition.

```
ptc-launcher-module.zip
├── module.prop
├── META-INF/com/google/android/
│   ├── update-binary           (copy of magisk module installer)
│   └── updater-script          (#MAGISK)
├── post-fs-data.sh             (optional — see below)
├── system/
│   ├── priv-app/
│   │   └── com.ptc.launcher/
│   │       └── com.ptc.launcher.apk
│   └── etc/permissions/
│       └── privapp-permissions-com.ptc.launcher.xml
```

### `module.prop`

```
id=ptc-launcher
name=PhoneThatCares Launcher (priv-app)
version=v0.1
versionCode=1
author=PTC
description=Installs the PTC launcher as a system priv-app with permission whitelist.
```

### `META-INF` installer

Copy verbatim from any Magisk module template (`Magisk-Modules-Repo/example`). The `updater-script` is a single line: `#MAGISK`. The `update-binary` is the upstream Magisk installer that picks up the `system/` tree automatically.

### `post-fs-data.sh` (usually not needed for priv-app)

For a pure priv-app + permission XML, **no script is needed** — Magisk's auto-mount handles it. Include a script only if you need to:
- Set perms/SELinux contexts that Magisk's defaults don't (rare; Magisk applies `0644 system:system u:object_r:system_file:s0` by default for system files, which is correct for APK + XML).
- Delete a conflicting file from real `/system` via a `.replace` flag (not our case — we're adding, not replacing).

If a script is needed for SELinux context fixup:
```sh
#!/system/bin/sh
chcon u:object_r:system_file:s0 /system/priv-app/com.ptc.launcher/com.ptc.launcher.apk
chcon u:object_r:system_file:s0 /system/etc/permissions/privapp-permissions-com.ptc.launcher.xml
```

### APK signature requirements

- For **priv-app status alone:** the APK can be signed with any key (debug or release). Placement in `/system/priv-app/` is what grants priv-app eligibility, not the signature.
- For **`signature` and `signature|privileged` permissions:** placement in `priv-app` plus the XML whitelist (see §3) is the path for `signature|privileged`. For pure `signature` (platform-cert only) permissions, the APK must additionally be signed with the platform certificate. See §4.
- **APK Signature Scheme v2/v3** required for Android 9+; v4 added in Android 11 (optional). Standard `apksigner` workflow handles this.

### Citations

- Magisk Developer Guide: https://topjohnwu.github.io/Magisk/guides.html
- "Create own Custom Magisk Module" (XDA): https://xdaforums.com/t/create-own-custom-magisk-module.3745666/
- AOSP guide, Najmudheen A: https://medium.com/@iamnajmudheen7311/aosp-guide-granting-privileged-permissions-priv-app-in-android-14-81d38d0dba27

**Answer:** Standard Magisk module layout, no `post-fs-data.sh` strictly required, APK can be debug-signed for priv-app placement. Platform-signature requirement applies only to `signature` (non-privileged) perms — covered in §4.

---

## 3. Priv-app permission whitelisting

### File location and structure

`/system/etc/permissions/privapp-permissions-com.ptc.launcher.xml` — note: filename convention is `privapp-permissions-<package>.xml`. The file must be on the **same partition** as the priv-app (so `/system/etc/permissions/` for `/system/priv-app/`). Different partitions can't allowlist each other.

```xml
<?xml version="1.0" encoding="utf-8"?>
<permissions>
  <privapp-permissions package="com.ptc.launcher">
    <permission name="android.permission.STATUS_BAR_SERVICE"/>
    <permission name="android.permission.STATUS_BAR"/>
    <permission name="android.permission.MANAGE_USERS"/>
    <permission name="android.permission.INTERNAL_SYSTEM_WINDOW"/>
    <permission name="android.permission.BIND_KEYGUARD_APPWIDGET"/>
    <permission name="android.permission.CONTROL_KEYGUARD"/>
    <permission name="android.permission.MODIFY_PHONE_STATE"/>
    <permission name="android.permission.READ_DREAM_STATE"/>
    <permission name="android.permission.WRITE_DREAM_STATE"/>
    <permission name="android.permission.MEDIA_CONTENT_CONTROL"/>
  </privapp-permissions>
</permissions>
```

The APK's `AndroidManifest.xml` must also `<uses-permission>` each of these. Whitelist grants the right; manifest requests it.

### Per-permission verdict

For each candidate Keyguard-substitute permission — protection level + verdict on whether priv-app whitelist suffices, or whether platform-cert signing is additionally required:

| Permission | Protection level | Priv-app + whitelist enough? |
|---|---|---|
| `DISABLE_KEYGUARD` | `normal` | Yes — any app can hold this; no whitelist needed. **Deprecated**; use `setShowWhenLocked()` / `requestDismissKeyguard()` instead. Mostly irrelevant to genuine Keyguard substitution. |
| `STATUS_BAR_SERVICE` | `signature` | **No — needs platform cert.** This is the one that lets you *be* the status bar. `signature`, not `signature|privileged`. |
| `STATUS_BAR` (different perm — toggle/expand) | `signature\|privileged` | Yes — priv-app + whitelist. |
| `INTERNAL_SYSTEM_WINDOW` | `signature` | **No — needs platform cert.** Required for windows that draw above all other UI as if part of SystemUI. |
| `MANAGE_USERS` | `signature\|privileged` | Yes — priv-app + whitelist. |
| `BIND_KEYGUARD_APPWIDGET` | `signature\|system` (older docs) → effectively `signature\|privileged` on modern Android | Yes — priv-app + whitelist (best understanding; needs confirmation against current AOSP source). |
| `BIND_NOTIFICATION_LISTENER_SERVICE` | `signature` | **No — needs platform cert** for the *bind* itself. **However:** a regular `NotificationListenerService` (the third-party-app API) is granted via user-toggle in Settings → Notification access. We can use the user-grant path without any signature dance, sidestepping this entirely. |
| `CONTROL_KEYGUARD` | `signature\|privileged` (best read) | Yes — priv-app + whitelist. Required if we want to call into the existing `KeyguardService` instead of replacing it. |

**The two showstoppers** for genuine Keyguard substitution under priv-app-only:
- `STATUS_BAR_SERVICE` — `signature`, platform cert required.
- `INTERNAL_SYSTEM_WINDOW` — `signature`, platform cert required.

If we don't actually need to **be** the status bar (we can let stock SystemUI continue drawing the status bar over our lock surface, as the "mirror normal Android" principle in `architect.md` suggests we should anyway), **then `STATUS_BAR_SERVICE` is not needed.** This is the crucial reframe — see §5.

If we don't need `INTERNAL_SYSTEM_WINDOW` (we instead use `TYPE_KEYGUARD_DIALOG` window-type, which is itself signature-gated, OR a regular fullscreen activity with `setShowWhenLocked()`), we may be able to substitute Keyguard *without ever holding a `signature`-only permission.* This is the key thread to pull on.

### Citations

- AOSP, Privileged permission allowlist: https://source.android.com/docs/core/permissions/perms-allowlist
- AOSP, Signature permission allowlist (Android 15+): https://source.android.com/docs/core/permissions/signature-permission-allowlist
- `data/etc/privapp-permissions-platform.xml`: https://android.googlesource.com/platform/frameworks/base/+/master/data/etc/privapp-permissions-platform.xml
- "Granting Runtime Permissions to priv-apps" (Kim): https://kimmandoo.medium.com/granting-runtime-permission-to-priv-apps-6e256ab67335
- Permission protection-level summaries: https://erev0s.com/blog/android-permissions-grouped-per-api-and-protection-level/ and https://gist.github.com/Watsonboy1989/fa01a6869d82062c770e137107693744

**Answer:** Of the candidate perms, `STATUS_BAR_SERVICE` and `INTERNAL_SYSTEM_WINDOW` are `signature` (platform-cert only). Everything else (`MANAGE_USERS`, `CONTROL_KEYGUARD`, `BIND_KEYGUARD_APPWIDGET`, the `STATUS_BAR` toggle perm) is `signature|privileged` and grantable via priv-app + XML whitelist. **The real question is whether we can substitute Keyguard without ever needing a pure-`signature` permission** — see §5.

---

## 4. Platform-cert signing — is it obtainable?

### What "platform cert" means

The AOSP build produces four key pairs in `build/target/product/security/`: `platform`, `shared`, `media`, `testkey`. Apps in the system image declare `LOCAL_CERTIFICATE := platform` (or `certificate: "platform"` in Soong) to be signed with the platform key. Possessing the platform private key lets your APK claim any `signature` permission defined by the `android` package.

### For stock Pixel firmware

- **The Pixel stock platform cert is NOT public.** Google signs its release firmware with internal release keys. The platform key for `AP2A.240605.024` is a Google-only secret. There is no path to obtain it.
- **The AOSP `testkey`s are public** (in the AOSP tree). They are useful only on AOSP builds you sign yourself — they don't match the platform cert on stock Pixel firmware, so a `testkey`-signed APK on stock Pixel will get **zero** `signature` permissions.
- Confirmed by multiple writeups: https://source.android.com/docs/core/ota/sign_builds, https://www.maxsilver.org/articles/one-click-deploy-platform-signed-android-apps/, https://github.com/wfairclough/android_aosp_keys

**Implication: on stock Pixel firmware, our APK can never legitimately hold a `signature`-only permission.** This is the constraint that makes platform-cert signing an unbounded ask under Plan A.

### Magisk-based signature spoofing — does it still work on Android 14?

There are two distinct "spoofing" concepts:
1. **microG-style package-signature spoofing** (`FAKE_PACKAGE_SIGNATURE`) — lets an app *report* a different signing certificate to other apps. Used by microG to impersonate Google Play Services. **Does NOT grant `signature` permissions** — the permission check is server-side in `system_server`, not client-side. Useless for our problem.
2. **`services.jar`-patching to grant signature perms** — modules like Haruka (https://xdaforums.com/t/module-haruka-signature-spoofing-for-microg-on-any-rom.4744233/) patch the `PackageManagerService` permission-checking code so the check that says "is this app signed by the platform cert?" returns true. Works on Android 14 and 15 per the module page (October 2024). However:
   - This is a one-app-at-a-time patch designed for microG, not a general "make my app platform-signed" tool.
   - Google made changes to signature checking in November 2024 that broke older spoofing methods. Current Haruka claims to handle this.
   - Even when it works, you're now in the territory where every OTA forces a re-patch and any signature-checking app (banking, Play Integrity) will fail. For our use case where banking is explicitly out of scope, this matters less.

**The honest answer:** services.jar-patching can technically grant `signature` permissions, but it's fragile, OTA-hostile, and not what these modules are tested against (they're tested for microG/GSF impersonation). Using it as the basis for v1 is fighting the substrate.

### Alternative: avoid `signature` perms entirely

If we can build the launcher to *not request* `STATUS_BAR_SERVICE` or `INTERNAL_SYSTEM_WINDOW`, the platform-cert question evaporates. This is plausible because:
- The launcher doesn't need to **be** the status bar; stock SystemUI's status bar will draw over our lock surface, which the "mirror normal Android" principle accepts.
- The launcher doesn't need `INTERNAL_SYSTEM_WINDOW` for its window — a regular `Activity` with `setShowWhenLocked(true)` + `setTurnScreenOn(true)` shows on screen-on. The window-type question is whether stock Keyguard renders **on top** of it. If `KeyguardService` is disabled (see §5), there's no Keyguard window to draw on top, so a regular activity window is enough.

This is the Plan A optimistic path: **disable Keyguard, render our activity, don't need any pure-`signature` perm.** Whether it actually holds together is §5's question.

### Citations

- AOSP Sign builds for release: https://source.android.com/docs/core/ota/sign_builds
- Maxsilver, "One-click Deploy Platform-Signed Android Apps": https://www.maxsilver.org/articles/one-click-deploy-platform-signed-android-apps/
- Haruka module (Android 14/15 signature spoofing via services.jar): https://xdaforums.com/t/module-haruka-signature-spoofing-for-microg-on-any-rom.4744233/
- microG signature-spoofing wiki: https://github.com/microg/GmsCore/wiki/Signature-Spoofing

**Answer:** Platform cert for stock Pixel firmware is not obtainable. services.jar-patching (Haruka) can technically grant `signature` perms on Android 14 but is fragile and out-of-scope-shaped. The realistic Plan A is to architect the launcher to never need a `signature` permission, leaning on `signature|privileged` (whitelist-grantable) only.

---

## 5. Keyguard-disable mechanisms

Three approaches, in priority order. The goal: when screen turns on, our Activity is the first thing the user sees and interacts with — no stock Keyguard underneath, no stock Keyguard above.

### Approach A — `pm disable` the KeyguardService component

**Exact component name on Android 14 stock Pixel:** `com.android.systemui/.keyguard.KeyguardService` — confirmed from AOSP SystemUI manifest at https://cs.android.com/android/platform/superproject/+/master:frameworks/base/packages/SystemUI/AndroidManifest.xml. The service is declared with `android:enabled="@bool/config_enableKeyguardService"` — this is the key, see Approach B.

Command (run as root via Magisk after install):
```
adb shell pm disable com.android.systemui/com.android.systemui.keyguard.KeyguardService
```

**What likely breaks:**
- `KeyguardService` is bound by `WindowManagerService` early in the boot sequence. If the bind fails, behavior depends on `system_server`'s fallback path. The `KeyguardViewMediator` runs inside SystemUI and is what *actually* draws the lock surface; the service is the IPC entry. Disabling the service may leave `WindowManagerService` waiting / falling back without Keyguard, *which is what we want* — but may also boot-loop SystemUI if the bind is required.
- **Notification shade, recents, status bar, biometric prompt UI** all live in the same `com.android.systemui` process. Disabling the *component* (not the package) leaves the process running and these surfaces functional. This is the surgical outcome we want.
- **Possible side effects to watch:** secure-folder, work-profile credential prompt, "device admin says you can't" lockscreens (DPM-driven Keyguard).
- Note that `pm disable` of a system component on a rooted device is reversible via `pm enable`. Boot-loop risk is real but recoverable via recovery flash.

### Approach B — RRO targeting `config_enableKeyguardService`

The SystemUI manifest references `@bool/config_enableKeyguardService` as the enabled attribute on the service. This is a **runtime-resource-overlay-able** boolean. An RRO that flips this to `false` would prevent the service from being enabled at all, without ever needing a `pm disable` call. This is the cleanest possible answer if it works.

**Caveat:** The `enabled` attribute is read at PackageManager scan time (boot). Whether RRO overrides on `bool` resources are consulted by PMS during manifest parsing is the open question — RROs are best-known for app-runtime resource lookups, less well-trodden for early-boot manifest attributes. AOSP RRO docs (https://source.android.com/docs/core/runtime/rros) don't explicitly address this case.

**Implementation sketch:**
```
overlay/
├── AndroidManifest.xml      (targetPackage=com.android.systemui, isStatic=true, priority high)
└── res/values/config.xml    (<bool name="config_enableKeyguardService">false</bool>)
```
Drop the resulting APK in `/product/overlay/` or `/system/product/overlay/` and reboot. Enable with `cmd overlay enable --user current <overlay-pkg>` if not auto-enabled.

**Why this is attractive:** doesn't require disabling any package. No SELinux drama. Reversible by `cmd overlay disable`. If it works, this is the spike-cleanest path.

### Approach C — `pm disable-user com.android.systemui` (last resort)

This disables the entire SystemUI package, breaking shade, recents, status bar, biometric UI, volume UI — everything. We'd have to substitute *all* of SystemUI, which is far out of scope. **Don't do this.** Note as a known-bad fallback so the next instance doesn't accidentally try it.

### Recommendation

1. **Try B first** (RRO). Most reversible, cleanest semantics. If AOSP honors the overlay at the right time, this is the win.
2. **Fall back to A** (`pm disable` the component). If B doesn't catch, the surgical component-disable is the next most likely to work without cascading damage.
3. **Skip C.** If both A and B fail, we're in Plan B territory (source fork), not "try the nuclear option on Plan A."

### Citations

- KeyguardService manifest declaration: https://cs.android.com/android/platform/superproject/+/master:frameworks/base/packages/SystemUI/AndroidManifest.xml
- `KeyguardService.java` AOSP source: https://cs.android.com/android/platform/superproject/+/master:frameworks/base/packages/SystemUI/src/com/android/systemui/keyguard/KeyguardService.java
- RRO documentation: https://source.android.com/docs/core/runtime/rros
- RRO troubleshooting: https://source.android.com/docs/core/runtime/rro-troubleshoot

**Open — needs hardware/spike.** RRO on `config_enableKeyguardService` is the cleanest theoretical path but no public write-up confirms it works. `pm disable` of the component is more conservative; whether it cascades into SystemUI-process death is the empirical question. Both are testable in <10 minutes once the device is flashed.

---

## 6. BiometricPrompt as device-unlock-authority from priv-app

### The two questions, separated

1. **Can our app call `BiometricPrompt.authenticate()` and get a success callback?** Yes, trivially. `BiometricPrompt` is API 28+, available to any app on any unrooted device with no special permissions beyond `USE_BIOMETRIC`. Strong prior. Not the unknown.
2. **Does that success transition the *device* from "locked" to "unlocked" state?** This is the hard question. `BiometricPrompt` from a regular app does not transition device-lock state — it authenticates *the app's flow,* not the device.

### What "device unlocked" means inside Android

`KeyguardManager.isDeviceLocked()` and `isKeyguardLocked()` track device-lock state via `KeyguardService`. The device transitions to "unlocked" when Keyguard's `verifyUnlock()` path succeeds — which only happens through `KeyguardService` itself, which we're trying to **disable**.

This creates a logical question: **if `KeyguardService` is disabled, what is "device-locked" state?** Two plausible answers, both empirical:

- **(a) The state machine collapses** — without `KeyguardService` bound, `KeyguardManager.isKeyguardLocked()` returns false always, the system never enters "locked" state, our activity launches at screen-on and there's nothing to "unlock." Biometric in our activity becomes a UX gate, not a system-state transition. **This is the optimistic outcome we want.** The device is, from the OS's perspective, always "unlocked"; our launcher imposes the UX of locking.
- **(b) Some other system path holds "locked" state** — e.g. `TrustManagerService`, the credential-encrypted storage path (`DirectBoot`), `UserManager.isUserUnlocked()`. In this case our biometric success would need to somehow tickle one of these to fully unlock. This is the path where we'd need additional system-cert plumbing.

### Concrete concerns

- **Credential-encrypted storage (CE) / Direct Boot.** Some user data is encrypted with a key derived from the lockscreen credential. The device "becomes unlocked" for storage purposes when the credential is verified. Disabling Keyguard may leave CE storage **un**-decryptable, meaning some apps see no data until you set the screen lock to "None" in Settings → Security. If we set lockscreen to None and impose our own biometric UX, we lose CE protection — which is fine for v1's personal-use scope but worth noting.
- **`requestDismissKeyguard()`** — works only from a visible activity that has `setShowWhenLocked(true)`, returns success only if keyguard is non-secure or device is in trusted state (https://developer.android.com/reference/android/app/KeyguardManager#requestDismissKeyguard). **Not useful for our scenario** because we want to *replace* Keyguard, not dismiss it from above.
- **No public prior art** found for "third-party app replaces Keyguard with its own biometric-gated activity." Closest references are AOSP CarSystemUI customization docs (out-of-scope for phones) and "third-party lock screen apps" on Play Store that all use the Path C approach (decorate above real Keyguard) — explicitly not what we want.

### What S1b should measure

Per the build plan:
- Set screen lock to None in stock Settings (eliminates CE-storage dependency).
- Install our priv-app launcher.
- Apply Keyguard-disable mechanism from §5.
- Reboot. Wake screen.
  - Does our activity render and receive input? (binary observation)
- In our activity, call `BiometricPrompt.authenticate()`. Touch sensor.
  - Does it return `onAuthenticationSucceeded`?
- After success, launch a normal app (Settings, e.g.) via `startActivity`.
  - Does it open, with no Keyguard re-appearing? (binary observation)
- Press power, screen off. Power on.
  - Does our activity reappear, requiring biometric again? (the desired loop)
- Pull down notification shade.
  - Does anything in the shade try to "verify your identity"? (the failure case where some other system path still holds locked-state)

**Open — needs hardware/spike.** This is S1b. The most likely outcome (~70% prior) is path (a) — device-lock state effectively no longer exists once `KeyguardService` is out, our biometric is a UX gate, the whole thing works. The risk is path (b) — some other subsystem holds locked-state and refuses to let go without `KeyguardService` participation. No way to settle from public sources.

---

## 7. OTA update considerations

### What breaks

Stock Pixel OTAs are A/B updates that flash the **inactive slot**. If Magisk patched `init_boot` on slot A and the OTA flashes a new `init_boot` to slot B, the device reboots to a Magisk-less slot — losing root, losing our module, losing our launcher.

### Correct procedure (Magisk's documented path)

Per https://topjohnwu.github.io/Magisk/ota.html:
1. **Restore stock boot images** in Magisk app (Magisk → Settings → Restore Images) — leaves Magisk module installed but reverts boot image to stock-on-active-slot.
2. **Let the OTA download** normally via Settings → System → Software update.
3. **Before rebooting**, in Magisk app tap **"Install to Inactive Slot (After OTA)"**. This patches the OS that the OTA just wrote to the inactive slot.
4. **Reboot.** Bootloader switches active slot, you boot into the new OS with Magisk and our module intact.

If you reboot via the OS update prompt without doing step 3, you boot to clean stock and lose root until you re-patch + re-flash `init_boot`.

### Pinning a version

For v1 daily-drive we want to **not** OTA. Two options:
- **Disable automatic system updates:** Settings → System → Software update → (kebab menu) → Auto-download isn't reliable on stock; better: Settings → Developer options → Automatic system updates **off**. Combined with leaving the OTA notification dismissed.
- **Hard pin:** revoke the Software Update package's network permission with `pm disable com.google.android.gms` (overkill — breaks too much) or block the OTA server hosts via a private DNS or hosts file (Magisk hosts module). Brian decides; soft pinning is probably enough for a 7-day daily-drive.

### Known issue specifically for Pixel 6 + Android 14 OTAs

Reported instance: AVDs and one Pixel 6a Magisk-OTA from Android 15 January 2025 update produced bootloops (https://github.com/topjohnwu/Magisk/issues/8700). For our build (`AP2A.240605.024`, June 2024), this specific issue post-dates the build, but the lesson holds: **always have the factory image staged before any OTA attempt.**

### Citations

- Magisk OTA Upgrade Guides: https://topjohnwu.github.io/Magisk/ota.html
- XDA Android 14 Magisk + OTA procedure: https://xdaforums.com/t/android-14-magisk-rooting-ota-update-procedure.4673473/
- XDA Pixel + root OTA: https://www.xda-developers.com/how-to-install-ota-updates-keep-root-google-pixel-phone/

**Answer:** Pin `AP2A.240605.024` for v1 daily-drive. Disable auto-updates in Developer options. Pre-stage the factory image as recovery. If OTA becomes necessary post-v1, follow Magisk's documented restore-images → download → install-to-inactive-slot procedure.

---

## 8. Top open questions that need hardware

These can't be settled from public sources. Order is by what the build plan should resolve first.

1. **Does disabling `KeyguardService` (via `pm disable` OR RRO on `config_enableKeyguardService`) leave the rest of SystemUI — notification shade, status bar, recents, biometric UI — functional?** No public write-up of someone disabling just this component on Android 14 Pixel. Empirical-only. Spike: 10 minutes once flashed.
2. **Does device-unlock-authority "just work" once `KeyguardService` is out (path (a) from §6) — or does some other subsystem (`TrustManagerService`, CE storage, `UserManager`) hold lock-state and refuse to release it?** This is the S1b gating question. No prior art found. Spike: 30 minutes including biometric enrollment and the "launch app after biometric" verification.
3. **Will any non-system app refuse to launch / function** because `KeyguardManager.isKeyguardSecure()` now returns false and that app demands a secure lock screen (banking apps, some enterprise email)? Banking is explicitly out of scope per `architect.md` so this is *information*, not a v1 blocker — but worth noting which apps in the T4.5 test list this affects. Spike: covered naturally by S5 daily-drive.

A fourth that's interesting but not load-bearing: **does the RRO approach (§5 Approach B) work at all on stock Pixel firmware?** If RRO honors the manifest-time `android:enabled` attribute, this is the cleanest possible Keyguard-disable. Spike: 5 minutes — drop overlay APK in `/product/overlay/` via Magisk module, reboot, observe.

---

## Disposition for the build plan

- **Plan A is feasible for steps 1-2** (Magisk install, priv-app placement, permission whitelist) with no platform-cert dependency, **provided** we architect the launcher to not request `STATUS_BAR_SERVICE` or `INTERNAL_SYSTEM_WINDOW` (the two pure-`signature` perms in the candidate list).
- **The critical-path unknown is §5 + §6** — whether disabling `KeyguardService` works cleanly and whether device-unlock-authority "just exists" once Keyguard is out. These are the S1b spike questions.
- **No Plan B pivot is warranted from this research alone.** The threshold per the build plan ("KeyguardService can only be disabled via platform-signed app, no realistic spoofing path") is not met — at minimum the RRO approach + the `pm disable` approach are both worth a real-hardware spike before declaring Plan A blocked.

### Updates to architect.md suggested

- The "Magisk module priv-app placement" risk in `architect.md` "Known Plan-A risks" section should be reframed: the risk is not "platform-cert vs whitelist for keyguard substitution" but specifically "whether `KeyguardService` can be cleanly disabled and whether device-unlock-authority survives." Platform-cert is no longer the obvious blocker because we can architect around the `signature`-only perms.
- The "Keyguard" entry in "Android-OS constraint reference" can be sharpened with the exact component name `com.android.systemui/.keyguard.KeyguardService` and the existence of the `config_enableKeyguardService` overlay-able boolean.

---

RESEARCH COMPLETE — 2026-05-16 23:08 PDT
