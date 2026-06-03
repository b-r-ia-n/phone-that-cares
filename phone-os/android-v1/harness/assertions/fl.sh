#!/usr/bin/env bash
# FL — lock surface fidelity. Relaunch to the lock surface, recapture for the verifier (vs refs/lock.png).
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
adb shell am force-stop com.ptc.launcher >/dev/null 2>&1
adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1; sleep 4
[[ -n "${OUT_DIR:-}" ]] && adb exec-out screencap -p > "$OUT_DIR/after.png" 2>/dev/null || true
if adb shell dumpsys activity activities 2>/dev/null | grep -E 'ResumedActivity' | grep -q com.ptc.launcher; then
  echo "PASS  lock surface (MainActivity) is showing"
else
  echo "FAIL  launcher not foreground"; fail=1
fi
if adb logcat -d -t 300 2>/dev/null | grep -qE 'FATAL EXCEPTION|AndroidRuntime'; then echo "FAIL  crash in logcat"; fail=1; else echo "PASS  no crash"; fi
echo "fidelity vs refs/lock.png judged by the verifier"
echo "ASSERTION_EXIT=$fail"; exit $fail
