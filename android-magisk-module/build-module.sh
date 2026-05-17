#!/usr/bin/env bash
# build-module.sh — zip the module/ directory contents into a flashable Magisk ZIP.
#
# Usage: ./build-module.sh
#
# Steps:
#   1. Copy the launcher debug APK into module/system/priv-app/com.ptc.launcher/
#   2. Zip the CONTENTS of module/ (not the dir itself) into ptc-launcher-module.zip
#   3. Verify with `unzip -l` and print a summary
#
# The zip must contain module.prop and META-INF/ at its top level — Magisk
# rejects zips where these are nested inside a parent directory.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULE_DIR="$HERE/module"
OUT_ZIP="$HERE/ptc-launcher-module.zip"

APK_SRC="$HERE/../phone-os/android-v1/launcher/app/build/outputs/apk/debug/app-debug.apk"
APK_DST_DIR="$MODULE_DIR/system/priv-app/com.ptc.launcher"
APK_DST="$APK_DST_DIR/com.ptc.launcher.apk"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*"; }

log "build-module.sh starting"

# ---- 1. Stage APK ----
if [[ ! -f "$APK_SRC" ]]; then
  echo "ERROR: launcher APK not found at:" >&2
  echo "  $APK_SRC" >&2
  echo "Build the launcher first: cd phone-os/android-v1/launcher && ./gradlew assembleDebug" >&2
  exit 1
fi
mkdir -p "$APK_DST_DIR"
cp "$APK_SRC" "$APK_DST"
APK_SIZE_HUMAN="$(du -h "$APK_DST" | cut -f1)"
log "staged APK -> $APK_DST ($APK_SIZE_HUMAN)"

# ---- 2. Zip ----
rm -f "$OUT_ZIP"
( cd "$MODULE_DIR" && zip -qr "$OUT_ZIP" . -x "*.DS_Store" )
log "wrote $OUT_ZIP"

# ---- 3. Verify ----
echo
echo "=== ZIP contents ==="
unzip -l "$OUT_ZIP"
echo

# Sanity-check that module.prop and META-INF live at the zip root.
if ! unzip -l "$OUT_ZIP" | awk '{print $NF}' | grep -qx "module.prop"; then
  echo "ERROR: module.prop is not at the zip root — Magisk will reject this." >&2
  exit 1
fi
if ! unzip -l "$OUT_ZIP" | awk '{print $NF}' | grep -qx "META-INF/com/google/android/update-binary"; then
  echo "ERROR: META-INF/com/google/android/update-binary missing." >&2
  exit 1
fi

ZIP_SIZE_HUMAN="$(du -h "$OUT_ZIP" | cut -f1)"
ZIP_SHA="$(shasum -a 256 "$OUT_ZIP" | awk '{print $1}')"

echo "=== summary ==="
echo "  output : $OUT_ZIP"
echo "  size   : $ZIP_SIZE_HUMAN"
echo "  sha256 : $ZIP_SHA"
echo
log "build-module.sh done"
