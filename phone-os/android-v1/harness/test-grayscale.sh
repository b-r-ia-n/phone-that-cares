#!/usr/bin/env bash
# Tests GrayscaleService: launches Chrome, checks daltonizer is enabled;
# presses HOME, checks daltonizer is disabled.
set -euo pipefail

PASS=0
FAIL=0

check() {
    local label="$1"
    local actual="$2"
    local expected="$3"
    if [ "$actual" = "$expected" ]; then
        echo "[PASS] ${label}: got '${actual}'"
        PASS=$((PASS + 1))
    else
        echo "[FAIL] ${label}: expected '${expected}', got '${actual}'"
        FAIL=$((FAIL + 1))
    fi
}

echo "[test-grayscale] Resetting daltonizer state..."
adb shell settings put secure accessibility_display_daltonizer_enabled 0

echo "[test-grayscale] Launching com.android.chrome..."
adb shell am start -n "com.android.chrome/com.google.android.apps.chrome.Main" \
    --activity-clear-task 2>/dev/null || \
adb shell monkey -p com.android.chrome -c android.intent.category.LAUNCHER 1 2>/dev/null || true

echo "[test-grayscale] Waiting 3s for service to react..."
sleep 3

DALTONIZER_ON=$(adb shell settings get secure accessibility_display_daltonizer_enabled 2>/dev/null | tr -d '[:space:]')
check "Chrome foreground → daltonizer enabled" "$DALTONIZER_ON" "1"

DALTONIZER_MODE=$(adb shell settings get secure accessibility_display_daltonizer 2>/dev/null | tr -d '[:space:]')
check "Chrome foreground → daltonizer mode=0 (grayscale)" "$DALTONIZER_MODE" "0"

echo "[test-grayscale] Pressing HOME..."
adb shell input keyevent KEYCODE_HOME
sleep 3

DALTONIZER_OFF=$(adb shell settings get secure accessibility_display_daltonizer_enabled 2>/dev/null | tr -d '[:space:]')
check "After HOME → daltonizer disabled" "$DALTONIZER_OFF" "0"

echo ""
echo "Results: ${PASS} passed, ${FAIL} failed"
if [ "$FAIL" -gt 0 ]; then
    exit 1
fi
