#!/usr/bin/env bash
# K1 — Keyguard substitution. After sleep/wake, OUR activity is the device-entry surface and
# SystemUI keyguard is NOT showing. Genuine substitution, not draw-on-top.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
echo "-- sleep then wake --"
adb shell input keyevent KEYCODE_SLEEP >/dev/null 2>&1; sleep 2
adb shell input keyevent KEYCODE_WAKEUP >/dev/null 2>&1; sleep 3
WIN=$(adb shell dumpsys window 2>/dev/null)
if echo "$WIN" | grep -qiE 'mKeyguardShowing=false|showing=false'; then
  echo "PASS  systemui keyguard not showing"
else
  echo "FAIL  systemui keyguard appears to be showing"; fail=1
fi
if echo "$WIN" | grep -iE 'mCurrentFocus|mFocusedApp' | grep -q com.ptc.launcher; then
  echo "PASS  our surface focused after wake"
else
  echo "FAIL  our surface not focused after wake"; fail=1
fi
echo "-- keyguard-related window state (for judge) --"; echo "$WIN" | grep -iE 'keyguard' | head -10
echo "ASSERTION_EXIT=$fail"; exit $fail
