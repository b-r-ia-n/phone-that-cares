#!/usr/bin/env bash
# reset.sh — rollback the Pixel 6 to factory stock Android 14.
#
# This is the "something went wrong, get me back to known-good" script.
# It does NOT auto-download the factory image (large + licensing). It walks
# the operator through the canonical fastboot flashall procedure assuming
# the image is already extracted locally.
#
# Target image: oriole / AP2A.240605.024 (June 2024).
# Factory image URL: https://developers.google.com/android/images  (find `oriole`
# row, build AP2A.240605.024). Mirror: see TODO in EMERGENCY section below.
#
# Usage:
#   ./reset.sh                       # interactive, walks through steps
#   ./reset.sh --image-dir <path>    # path to extracted factory image dir
#
# The factory image ZIP from Google looks like:
#   oriole-ap2a.240605.024-factory-<hash>.zip
# Extracting it produces a directory:
#   oriole-ap2a.240605.024/
#   ├── bootloader-oriole-*.img
#   ├── radio-oriole-*.img
#   ├── image-oriole-ap2a.240605.024.zip
#   ├── flash-all.sh
#   └── ... (vendor stuff)
#
# We DO NOT call Google's flash-all.sh because it wipes userdata. We call
# `fastboot --skip-reboot flashall` from inside the extracted dir, which
# uses the manifest but lets us choose --disable-verity / --disable-verification
# and step through interactively.

set -euo pipefail

IMAGE_DIR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --image-dir) IMAGE_DIR="$2"; shift 2 ;;
    -h|--help)
      sed -n '1,40p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*"; }
pause() { read -r -p "  press enter when ready... " _; }

cat <<'BANNER'
=========================================================
 PhoneThatCares — reset.sh
 Target: Pixel 6 (oriole), Android 14, AP2A.240605.024
=========================================================
BANNER

if [[ -z "$IMAGE_DIR" ]]; then
  echo
  echo "No --image-dir given. Pre-flight checklist:"
  echo
  echo "  1. Download factory image from:"
  echo "       https://developers.google.com/android/images"
  echo "     Find row 'Pixel 6 (oriole)', build 'AP2A.240605.024' (June 2024)."
  echo "     File: oriole-ap2a.240605.024-factory-*.zip (~3 GB)"
  echo
  echo "  2. Unzip it. You'll get a directory like:"
  echo "       oriole-ap2a.240605.024/"
  echo
  echo "  3. Re-run with: ./reset.sh --image-dir /path/to/oriole-ap2a.240605.024"
  echo
  exit 1
fi

if [[ ! -d "$IMAGE_DIR" ]]; then
  echo "ERROR: --image-dir '$IMAGE_DIR' is not a directory." >&2
  exit 1
fi

if ! command -v fastboot >/dev/null 2>&1; then
  echo "ERROR: fastboot not on PATH. Install platform-tools." >&2
  exit 1
fi

# Quick sanity: image dir should contain a bootloader-oriole-*.img
if ! ls "$IMAGE_DIR"/bootloader-oriole-*.img >/dev/null 2>&1; then
  echo "ERROR: $IMAGE_DIR does not look like an extracted oriole factory image." >&2
  echo "  Expected: bootloader-oriole-*.img, radio-oriole-*.img, image-oriole-*.zip" >&2
  exit 1
fi

log "image dir looks good: $IMAGE_DIR"

# ---- Step 1: confirm device in fastboot ----
echo
log "STEP 1: Put the device into fastboot mode."
echo "  - From booted device: adb reboot bootloader"
echo "  - From powered off:   hold Power + Vol Down"
pause

FB_DEVS="$(fastboot devices | awk '{print $1}')"
FB_COUNT="$(echo -n "$FB_DEVS" | grep -c . || true)"
if [[ "$FB_COUNT" -ne 1 ]]; then
  echo "ERROR: expected exactly 1 fastboot device, got $FB_COUNT." >&2
  fastboot devices >&2
  exit 1
fi
log "fastboot device: $FB_DEVS"

# ---- Step 2: flashall ----
echo
log "STEP 2: Flash factory image (USERDATA PRESERVED — we are NOT running -w)."
echo "  The command is: fastboot --skip-reboot flashall"
echo "  This flashes bootloader, radio, and OS image. Takes ~5-10 min."
echo
echo "  If the device is bootlooping and userdata is suspect, abort and run"
echo "  Google's flash-all.sh from $IMAGE_DIR instead — that does a full wipe."
pause

( cd "$IMAGE_DIR" && fastboot --skip-reboot flashall )

# ---- Step 3: reboot ----
echo
log "STEP 3: Reboot."
pause
fastboot reboot
log "reset.sh done. Device should boot to clean stock Android 14."

cat <<'POST'

After reboot:
  - Magisk and the PTC launcher module are gone (boot image was reflashed stock).
  - userdata was preserved (we did not pass -w). Apps and settings remain.
  - To re-establish the Magisk + PTC environment, run flash.sh after re-patching
    init_boot via Magisk app and re-flashing it.

POST

cat <<'EMERGENCY'
=========================================================
 EMERGENCY: device is bootlooping and won't show fastboot
=========================================================

  Pixel 6 bootloop recovery (worst case):

  1. Force-enter fastbootd / bootloader:
       Hold Power + Vol Down for 10 seconds with USB plugged in.
       If the screen never lights, try a different USB-C cable (data, not power-only).

  2. If bootloader visible but device won't accept fastboot commands:
       fastboot oem unlock     (only if for some reason it relocked)
       fastboot getvar all     (sanity check connection)

  3. If you can reach bootloader but flashall fails:
       Run Google's flash-all.sh from the extracted factory image dir.
       This does a FULL WIPE including userdata. Last resort.
         cd <image-dir> && ./flash-all.sh

  4. If you cannot reach bootloader at all:
       The device might be in EDL (Emergency Download Mode). Pixel 6 EDL recovery
       requires hardware (test points + Qualcomm tools). At that point, RMA via
       Google support; this is beyond a software-only fix.

  TODO: stage a mirror of oriole-ap2a.240605.024-factory.zip somewhere
  Brian controls, in case Google rotates the URL. ~3 GB file.
EMERGENCY
