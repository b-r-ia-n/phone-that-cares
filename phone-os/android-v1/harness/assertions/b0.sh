#!/usr/bin/env bash
# B0 — baseline regression: launcher still builds, installs, runs cleanly.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
check() { local l="$1"; shift; if "$@" >/dev/null 2>&1; then echo "PASS  $l"; else echo "FAIL  $l"; fail=1; fi; }

check "APK built"            test -f "$PTC_LAUNCHER/app/build/outputs/apk/debug/app-debug.apk"
check "emulator reachable"  bash -c 'adb get-state | grep -q device'
check "package installed"   bash -c 'adb shell pm list packages | grep -q "^package:com.ptc.launcher$"'

adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1; sleep 2
check "MainActivity resumed" bash -c 'adb shell dumpsys activity activities | grep -E "mResumedActivity|mFocusedApp" | grep -q com.ptc.launcher'
check "no fatal in logcat"   bash -c '! adb logcat -d -t 400 | grep -qE "FATAL EXCEPTION|AndroidRuntime"'

echo "ASSERTION_EXIT=$fail"; exit $fail
