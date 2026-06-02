#!/usr/bin/env bash
# GR — grayscale end-to-end. Deterministic target: com.android.chrome must be configured
# mode=GRAYSCALE by the builder. (Real IG/X are sideloaded for realism, but Chrome is the
# reliable assertion target since it always launches on google_apis.)
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
dz() { adb shell settings get secure accessibility_display_daltonizer_enabled 2>/dev/null | tr -d '\r'; }

adb shell am start -a android.intent.action.VIEW -d "https://example.com" com.android.chrome >/dev/null 2>&1
sleep 3
ON=$(dz); echo "daltonizer after foreground=$ON (expect 1)"
[[ "$ON" == "1" ]] && echo "PASS  grayscale ON for configured app" || { echo "FAIL  grayscale did not enable"; fail=1; }

adb shell input keyevent KEYCODE_HOME >/dev/null 2>&1
sleep 3
OFF=$(dz); echo "daltonizer after home=$OFF (expect 0)"
[[ "$OFF" == "0" ]] && echo "PASS  grayscale OFF when backgrounded" || { echo "FAIL  grayscale did not reset"; fail=1; }

echo "ASSERTION_EXIT=$fail"; exit $fail
