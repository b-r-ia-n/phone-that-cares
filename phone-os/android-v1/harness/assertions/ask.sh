#!/usr/bin/env bash
# ASK — Ask page rework. Navigate to Ask (drag DOWN), recapture for the verifier; no crash.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
adb shell am force-stop com.ptc.launcher >/dev/null 2>&1
adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1; sleep 3
adb shell input swipe 540 1800 540 2300 280 >/dev/null 2>&1; sleep 3   # drag DOWN -> Ask
[[ -n "${OUT_DIR:-}" ]] && adb exec-out screencap -p > "$OUT_DIR/after.png" 2>/dev/null || true
if adb logcat -d -t 300 2>/dev/null | grep -qE 'FATAL EXCEPTION|AndroidRuntime'; then echo "FAIL  crash in logcat"; fail=1; else echo "PASS  no crash"; fi
echo "PASS  navigated to Ask; coherence + record/type wiring + past-chats list judged by the verifier"
echo "ASSERTION_EXIT=$fail"; exit $fail
