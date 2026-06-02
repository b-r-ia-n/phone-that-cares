#!/usr/bin/env bash
# Start the AVD headless and wait for boot_completed.
set -euo pipefail
source "$(dirname "$0")/env.sh"

LOG="$PTC_REPORTS/emulator.log"
mkdir -p "$PTC_REPORTS"

# Already running?
if adb devices | grep -q "emulator-"; then
  echo "[emu] emulator already running"
  exit 0
fi

echo "[emu] booting AVD $PTC_AVD (headless, no snapshot)…"
nohup emulator -avd "$PTC_AVD" -no-snapshot -no-audio -gpu swiftshader_indirect \
  > "$LOG" 2>&1 &
echo $! > "$PTC_REPORTS/emulator.pid"

echo "[emu] waiting for adb…"
adb wait-for-device

echo "[emu] waiting for sys.boot_completed=1 (up to 180s)…"
for i in $(seq 1 90); do
  BC=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
  if [[ "$BC" == "1" ]]; then
    echo "[emu] booted after ${i}×2s"
    adb shell input keyevent 82  # dismiss keyguard
    exit 0
  fi
  sleep 2
done

echo "[emu] timed out waiting for boot" >&2
exit 1
