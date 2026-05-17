#!/usr/bin/env bash
# flash.sh — push the built Magisk module to a Magisk-rooted Pixel 6 and install it.
#
# Usage:
#   ./flash.sh --dry-run    # print every command, execute nothing
#   ./flash.sh              # actually run
#
# Preconditions (refused-if-missing):
#   - `adb` on PATH and exactly one device visible via `adb devices`.
#   - Device must be bootloader-unlocked: getprop ro.boot.flash.locked == 0
#   - Magisk already installed on device (patched init_boot already flashed).
#     This script does NOT flash the patched init_boot — that's a one-time
#     setup step documented in README.md and the hardware-prep runbook.
#   - ptc-launcher-module.zip already built (run ./build-module.sh first).
#
# Idempotent: safe to re-run. magisk --install-module replaces an existing
# module of the same id on the next reboot.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZIP="$HERE/ptc-launcher-module.zip"
REMOTE_DIR="/sdcard/Download"
REMOTE_ZIP="$REMOTE_DIR/ptc-launcher-module.zip"

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*"; }

run() {
  log "\$ $*"
  if [[ $DRY_RUN -eq 0 ]]; then
    eval "$@"
  fi
}

# ---- Preflight ----
log "flash.sh starting (dry-run=$DRY_RUN)"

if ! command -v adb >/dev/null 2>&1; then
  echo "ERROR: adb not on PATH. Install platform-tools." >&2
  exit 1
fi

if [[ ! -f "$ZIP" ]]; then
  echo "ERROR: $ZIP not found. Run ./build-module.sh first." >&2
  exit 1
fi

# adb devices: require exactly one device in "device" state (not unauthorized/offline)
if [[ $DRY_RUN -eq 0 ]]; then
  DEV_LINES="$(adb devices | awk 'NR>1 && $2=="device" {print $1}')"
  DEV_COUNT="$(echo -n "$DEV_LINES" | grep -c . || true)"
  if [[ "$DEV_COUNT" -ne 1 ]]; then
    echo "ERROR: expected exactly 1 adb device, got $DEV_COUNT." >&2
    echo "  adb devices output:" >&2
    adb devices >&2
    exit 1
  fi
  log "adb device: $DEV_LINES"

  # Bootloader-unlocked check
  LOCKED="$(adb shell getprop ro.boot.flash.locked | tr -d '\r')"
  if [[ "$LOCKED" != "0" ]]; then
    echo "ERROR: bootloader appears locked (ro.boot.flash.locked=$LOCKED)." >&2
    echo "  Magisk-rooted Pixel needs an unlocked bootloader. Aborting." >&2
    exit 1
  fi
  log "bootloader unlocked (ro.boot.flash.locked=0)"

  # Magisk root sanity check
  if ! adb shell 'command -v su >/dev/null && su -c id' 2>/dev/null | grep -q 'uid=0'; then
    echo "ERROR: root not available via su. Is Magisk installed?" >&2
    exit 1
  fi
  log "root available via su"
fi

# ---- Push + install ----
run "adb push '$ZIP' '$REMOTE_ZIP'"
run "adb shell su -c 'magisk --install-module $REMOTE_ZIP'"
run "adb shell su -c 'sync'"

log "module installed; rebooting to activate"
run "adb reboot"

log "flash.sh done"
echo
echo "After reboot, verify with:"
echo "  adb shell ls /system/priv-app/com.ptc.launcher/"
echo "  adb shell ls /system/etc/permissions/ | grep ptc"
echo "  adb shell pm list packages | grep com.ptc.launcher"
echo "  adb shell dumpsys package com.ptc.launcher | grep -E 'privileged|granted=true'"
