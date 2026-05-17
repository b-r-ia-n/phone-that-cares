# Pixel 6 Magisk Install Troubleshooting Log

**Purpose:** chronological account of things that went wrong, theories tested, and what actually fixed it (or didn't). For future instances and morning-Brian.

**Device:** Pixel 6 `oriole`, bootloader unlocked, originally on `AP2A.240605.024` (June 2024).

---

## Symptoms encountered (in order)

### 1. (Overnight, ~23:00) Magisk-patched boot.img flashed but no root after boot

**Symptom:** Flashed `magisk-patched-boot-v3.img` (boot.img from Aug 2024 factory + Magisk's boot_patch.sh). Device booted. `adb shell su` → "not found". `/data/adb/magisk` → permission denied. `getprop ro.boot.veritymode` → `enforcing`.

**Theory:** dm-verity is enforcing, which blocks Magisk's rootfs overlay from mounting. Magisk's init detects this and bails before bootstrapping root.

**Attempted fix:** `fastboot --disable-verity --disable-verification flash vbmeta <vbmeta.img>` using brew-installed fastboot v37.0.0.

**Result:** Failed with `error: Failed to find AVB_MAGIC at offset: 0` despite the vbmeta.img having a valid `AVB0` header (confirmed via `xxd`).

---

### 2. (Overnight) fastboot 37.0.0 vbmeta parsing bug

**Symptom:** Same error message even with absolute paths, both slots, fresh extracts. md5 of vbmeta.img matched fresh extract from inner image zip.

**Theory:** brew's `android-platform-tools` v37.0.0 has either a parsing bug or expects a newer avbtool format. The image was built with `avbtool 1.3.0`; fastboot 37 may want newer.

**Fix that worked:** Downloaded `platform-tools_r33.0.3-darwin.zip` from Google's archive. Used fb33's fastboot binary. Same command worked: output included `Rewriting vbmeta struct at offset: 0`. **Always use fb33 for vbmeta flashes on this device class.**

**Side effect:** OK, problem resolved but the test of "did this disable verity for the Magisk install?" was masked by the next failure.

---

### 3. (Overnight → morning) Device fell to recovery after Magisk-patched boot + vbmeta-disable

**Symptom:** Even with vbmeta-disable flashed successfully via fb33 + Magisk-patched boot flashed → device started booting but never returned to adb. ~5+ min unresponsive on USB. When USB returned, device was in recovery (showed "Cannot load Android system, your data may be corrupt").

**Theory:** Kernel/system ABI mismatch. The boot.img we patched was from the August 2024 factory image, but the device's system/vendor/product partitions were the original June 2024 stock. Mixed-build firmware caused the kernel to panic on boot or some subsystem to fail.

**Attempted fix 1:** Try slot A — A/B device, maybe slot A still has original working boot. Used `fastboot --set-active=a` then reboot.

**Result 1:** Slot A also went to recovery. Confirmed slot A doesn't have an independent bootable OS — both slots came up broken.

**Attempted fix 2:** Full factory flash via August `flash-all.sh`. Two attempts. Both hung at the `fastboot --skip-reboot update` step — specifically the "Rebooting into fastboot" transition (going to fastbootd, userspace fastboot needed to write super partitions).

**Theory for fastbootd hang:** fastbootd is loaded from userspace, which requires a working system partition. Since system was in a broken intermediate state, fastbootd couldn't load. Caught us in a chicken-and-egg: to fix system, need fastbootd; to get fastbootd, need working system.

**Sub-symptom:** During the hang, multiple `fastboot` processes spun at 100% CPU. After killing them, USB sometimes drops entirely for the device.

---

### 4. (Morning) Sideload from "broken recovery" screen failed

**Symptom:** Device kept landing in stock recovery's "Cannot load Android system" shortcut screen, which only offers "Try again" and "Factory data reset" — no sideload option. `adb sideload` returned "sideload connection failed: closed".

**Theory:** The "boot-failed shortcut" recovery is a different mode from the full recovery menu. Sideload only available in the full menu's "Apply update from ADB".

**Fix that worked:**
1. Force-off via long-press POWER (10s).
2. Boot to fastboot via VOL DOWN + POWER.
3. From Mac: `fastboot reboot recovery` → enters "No command" screen.
4. On device: POWER+VOL UP combo (press-and-hold POWER, tap VOL UP, release both) → opens the full recovery menu.
5. Navigate to "Apply update from ADB" → screen shows "Now send the package...".
6. Brian's hands needed for step 1 + 2 + 4. The Mac handles step 3 and the sideload itself.

---

### 5. (Morning) OTA sideload completed but device didn't boot to Android

**Symptom:** Sideload of `oriole-ota-ap2a.240605.024.zip` (the OTA, ~2GB) completed successfully (`Total xfer: 2.00x`). `adb reboot` from recovery. Device came back to recovery, not Android.

**Currently investigating:** slot state post-OTA. OTA typically installs to inactive slot. If A is active and OTA installed to B, then B is the fresh OS but the reboot may have gone to A (still broken).

**Next step:** check `fastboot getvar current-slot` and `slot-unbootable:a/b`, set active to whichever has the fresh install, reboot.

---

## Gotchas to remember

- **fastboot v37.0.0 (brew default) breaks on vbmeta `--disable-verity` flash.** Use fb33 (`platform-tools_r33.0.3`) for that operation specifically. fb37 is fine for other fastboot operations.
- **Pixel 6 (`oriole`) uses `boot.img`, not `init_boot.img`** — my T1 research had this wrong. Pixel 6a, 7+ use init_boot; Pixel 6 (which shipped on A12) stayed on boot.img through Android updates.
- **`super_empty` partition only flashable via fastbootd** — `fastboot flash super_empty` from regular bootloader fastboot fails with `partition (super_empty) not found`.
- **fastbootd transition requires a working system partition** — if super is corrupt, fastbootd won't load. Recovery from a broken super requires OTA sideload from recovery menu, not `fastboot update`.
- **Multiple concurrent fastboot processes can wedge USB** — if a `fastboot` process spins at 100% CPU, `pkill -9 -f fastboot` and let things settle. Avoid polling fastboot devices in a tight loop while a flash is in progress.
- **Stock "Cannot load Android system" recovery shortcut ≠ full recovery menu.** Full menu (with sideload) requires `fastboot reboot recovery` + the POWER+VOL UP combo trick on the "No command" screen.
- **Bootloader unlock survives factory data reset and most flashing operations** — confirmed via multiple cycles. Keep `fastboot getvar unlocked` ≥ `yes`.
- **A/B slot logic:** `fastboot --set-active=a` (NOT `set-active a` — older subcommand form doesn't exist in fb33+). Use `--slot=all` to flash both slots in one command (only certain flash subcommands honor it; not `flash boot`).

---

## Live timeline (HH:MM PDT, 2026-05-17)

- 07:00 — first flash-all.sh attempt. Hung at "Rebooting into fastboot" after radio flash.
- 07:50 — discovered hung fastboot processes at 100% CPU; killed.
- 08:05 — flash-all.sh attempt 2. Same hang at same step (fastbootd transition).
- 08:09 — confirmed STALL; killed.
- 08:23 — switched active slot to A; rebooted. Slot A also lands in recovery — confirmed both slots broken.
- 08:25 — downloaded June 2024 factory image (matched device's original build).
- 08:26 — downloaded OTA (2.1GB) for AP2A.240605.024.
- 08:27 — tried `adb sideload` from "broken recovery" — failed (not in sideload mode).
- 09:00 — Brian back; walked through recovery menu navigation: force-off → fastboot → `fastboot reboot recovery` → POWER+VOL UP combo → recovery menu → "Apply update from ADB".
- 09:07 — sideload of OTA started successfully.
- 09:11 — sideload completed (xfer 2.00x).
- 09:12 — `adb reboot` from recovery → device back to recovery, not Android.
- 09:13 — currently checking slot state to determine if OTA installed to correct slot.

---

## Open hypothesis (resolved partially, still mystery)

After OTA sideload, the new OS is on the *inactive* slot. Current active slot was set to A by me earlier (slot A had no usable OS at that time). OTA likely installed to slot B (the inactive). The post-sideload reboot may have gone to slot A (still broken).

**Test:** check `fastboot getvar current-slot` and unbootable flags. If slot B has the fresh OS, `fastboot --set-active=b` and reboot.

**Result:** slot B was indeed the OTA target. Slot info post-sideload:
- `current-slot: b` (already set by OTA installer)
- `slot-successful:a: yes` (Brian's original first boot)
- `slot-successful:b: no` (never booted successfully — even after OTA)
- both unbootable: no

So OTA installed to B as expected, but B isn't completing a successful boot.

---

## Last morning attempts (resolved: not resolved)

### 6. Flash JUNE boot.img + vbmeta-disable directly to slot B

**Theory:** OTA may have delta-installed and skipped flashing boot.img since it expected slot A's existing boot to be the base. Flash boot.img explicitly to make sure.

**Did:** Used fb33 to flash `oriole-ap2a.240605.024/partitions-extracted/boot.img` to slot=b. Also flashed June `vbmeta.img` with `--disable-verity --disable-verification` to both slots (success output "Rewriting vbmeta struct at offset: 0" for both). Set active to B. Rebooted.

**Result:** Same — boots to recovery, not Android.

### 7. Attempted `fastboot reboot fastboot` (to fastbootd) for super partition repair

**Theory:** With fresh June boot + vbmeta-disable, fastbootd might load this time. Then we can reflash super partitions.

**Did:** `fastboot reboot fastboot` — hung indefinitely. Same wall as before.

**Diagnosis:** fastbootd requires userspace to load, which requires a working super partition state. The Magisk install attempts may have left super in an unrecoverable state for fastbootd. The chicken-and-egg holds.

### 8. (planned but skipped) Flash June vendor_boot + dtbo directly

**Plan:** Flash more individual partitions from the June factory to slot B (vendor_boot, dtbo, pvmfw). Maybe one of those is corrupt and preventing boot.

**Did:** Attempted but command ran while device wasn't in fastboot. Reboot timing during the earlier hang caused the device to land in recovery automatically. Aborted to leave device in stable recoverable state.

---

## Final morning state

- **Device:** Pixel 6, bootloader unlocked (`flash.locked: 0`), `verifiedbootstate: orange`, currently in stock recovery (after rebooting from the recovery menu).
- **Slot B (active):** has June 2024 boot.img (freshly flashed), June 2024 vbmeta with disable-verity (freshly flashed), system/vendor/product partially from OTA sideload (status unclear — never booted successfully).
- **Slot A:** has whatever was there originally + my earlier mucking. `slot-successful:a: yes` is preserved from Brian's first boot, but my testing showed slot A also lands in recovery.
- **Magisk APK** still installed in device's userdata (which was preserved through the recovery transitions).
- **DND total silence** was on but reset by all the reboots — pixel will make notification sounds normally now.

## What's actually broken (best guess)

The super partition (which contains system, vendor, product, system_ext, vendor_dlkm as logical sub-partitions) is in an inconsistent state on slot B. The OTA install transferred 2.0x of the file, but the install-time application of changes to the super partition may have only partially succeeded — possibly because the bootloader's fastbootd userspace couldn't fully apply OTA-A/B updates with the original slot's super in a half-flashed state from my earlier Magisk-patched boot experiments.

Without fastbootd, there's no way from the Mac side to fully reflash super partitions. Workarounds we haven't tried:
1. Different USB cable / USB-C port — fastbootd reliability is sometimes affected by USB enumeration
2. Power-cycle entirely (battery disconnect — not possible on Pixel 6 without taking it apart)
3. Hold POWER + VOL UP at boot to enter fastbootd directly (bypass the `fastboot reboot fastboot` transition that's hanging). Pixel 6 entry sequence: from power-off, hold VOL DOWN + POWER to fastboot, then in fastboot's UI use VOL DOWN to highlight "Fastbootd" and POWER to select.

**The third option (fastbootd via device UI rather than `fastboot reboot fastboot` command) is the next thing to try when Brian's available** — it bypasses the broken software transition.

## Recovery path for Brian when back

1. Power off device (long-press POWER 10s)
2. VOL DOWN + POWER → fastboot bootloader screen
3. Use VOL DOWN to navigate to "Fastbootd" (not Recovery, not Start, not Reboot)
4. POWER to select. Device should enter fastbootd (greenish screen, says "FASTBOOTD MODE" or similar)
5. From Mac: `cd ~/Desktop/PhoneThatCares/_context/android-build-2026-05-16/downloads/oriole-ap2a.240605.024/partitions-extracted && FB33=/Users/b/Desktop/PhoneThatCares/_context/android-build-2026-05-16/downloads/platform-tools-33/platform-tools/fastboot`
6. Reflash super partitions: `$FB33 flash super_empty super_empty.img` then `$FB33 --slot=b flash system system.img` (and vendor, product, system_ext, vendor_dlkm — see `partitions-extracted/` for all the files).
7. After all super partitions flashed: `$FB33 reboot` — should boot to fresh June 2024 Android.
8. Do first-time setup (skip Google, dev options, USB debugging).
9. Then redo Magisk install:
   - `adb push downloads/oriole-ap2a.240605.024/partitions-extracted/boot.img /sdcard/Download/`
   - Open Magisk app, "Install" → "Select and Patch a File" → boot.img → patch
   - `adb pull /sdcard/Download/magisk_patched-*.img`
   - `fastboot flash boot magisk_patched-*.img` (via fb33)
   - Reboot, verify `adb shell su -c id` → uid=0
10. Install our priv-app module: `bash ~/Desktop/PhoneThatCares/android-magisk-module/flash.sh`
11. Set launcher as default home, grant notification listener permission.
12. Run S1 spike per `research/s1-spike-protocol.md`.

This path is exactly what we'd have done overnight if the fastbootd hang hadn't bitten us.
