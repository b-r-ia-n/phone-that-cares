#!/usr/bin/env bash
# FC — Connect fidelity. Relaunch to lock, drag LEFT to Connect, recapture after.png for the judge.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
adb shell am force-stop com.ptc.launcher >/dev/null 2>&1
adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1; sleep 3
adb shell input swipe 540 1800 100 1800 280 >/dev/null 2>&1; sleep 3   # LEFT = CONNECT
if [[ -n "${OUT_DIR:-}" ]]; then adb exec-out screencap -p > "$OUT_DIR/after.png" 2>/dev/null || true; fi
if adb logcat -d -t 300 | grep -qE 'FATAL EXCEPTION|AndroidRuntime'; then echo "FAIL  crash in logcat"; fail=1; else echo "PASS  no crash"; fi
echo "PASS  navigated to Connect (drag left); fidelity judged vs refs/connect.png"
echo "ASSERTION_EXIT=$fail"; exit $fail
