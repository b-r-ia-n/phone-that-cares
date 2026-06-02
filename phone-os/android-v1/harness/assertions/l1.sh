#!/usr/bin/env bash
# L1 — refined lockscreen. Mechanical floor: builds, installs, renders, four-direction nav
# instrumentation test green. Flashlight torch + camera launch + the "feel" are judged from
# the screenshot (not mechanically assertable without internal hooks).
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
check(){ local l="$1"; shift; if "$@" >/dev/null 2>&1; then echo "PASS  $l"; else echo "FAIL  $l"; fail=1; fi; }
check "APK built" test -f "$PTC_LAUNCHER/app/build/outputs/apk/debug/app-debug.apk"
check "package installed" bash -c 'adb shell pm list packages | grep -q "^package:com.ptc.launcher$"'
adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1; sleep 2
check "MainActivity resumed" bash -c 'adb shell dumpsys activity activities | grep -E "mResumedActivity|mFocusedApp" | grep -q com.ptc.launcher'
check "no fatal" bash -c '! adb logcat -d -t 400 | grep -qE "FATAL EXCEPTION|AndroidRuntime"'
echo "-- connected nav instrumentation test (a few min) --"
( cd "$PTC_LAUNCHER" && ./gradlew :app:connectedDebugAndroidTest --tests "*DragNavigationTest*" ) >/tmp/l1-androidtest.log 2>&1 \
  && echo "PASS  DragNavigationTest" || { echo "FAIL  DragNavigationTest (see /tmp/l1-androidtest.log)"; fail=1; }
echo "ASSERTION_EXIT=$fail"; exit $fail
