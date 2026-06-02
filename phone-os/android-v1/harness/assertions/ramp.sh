#!/usr/bin/env bash
# RAMP — gradual true grayscale. Launch chrome (short-ramp test target), sample the logged
# saturation level over ~45s and assert it DECREASES (ramp working), capture early/late shots for
# the judge, and confirm re-foregrounding resumes at the accrued (not reset) level.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
PKG=com.android.chrome
last_sat() { adb logcat -d 2>/dev/null | grep -oE 'RAMP sat=[0-9]+' | tail -1 | grep -oE '[0-9]+$'; }

adb logcat -c 2>/dev/null || true
adb shell am force-stop com.ptc.launcher >/dev/null 2>&1
adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1; sleep 2
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 5
[[ -n "${OUT_DIR:-}" ]] && adb exec-out screencap -p > "$OUT_DIR/ramp-early.png" 2>/dev/null || true
EARLY=$(last_sat)
sleep 45
[[ -n "${OUT_DIR:-}" ]] && adb exec-out screencap -p > "$OUT_DIR/ramp-late.png" 2>/dev/null || true
[[ -n "${OUT_DIR:-}" ]] && adb exec-out screencap -p > "$OUT_DIR/after.png" 2>/dev/null || true   # judge sees the grayer state
LATE=$(last_sat)
echo "saturation early=${EARLY:-?} late=${LATE:-?}  (lower = grayer; expect late < early)"
if [[ -n "$EARLY" && -n "$LATE" && "$LATE" -lt "$EARLY" ]]; then echo "PASS  saturation ramped down over time"; else echo "FAIL  no observed downward saturation ramp"; fail=1; fi

# monotonic / unstoppable: re-foreground, must resume below the start (not reset to full color)
adb shell am force-stop "$PKG" >/dev/null 2>&1; sleep 1
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 5
RESUME=$(last_sat)
echo "resume after reopen=${RESUME:-?} (expect < early — accrued, not reset)"
if [[ -n "$RESUME" && -n "$EARLY" && "$RESUME" -lt "$EARLY" ]]; then echo "PASS  resumes at accrued level (unstoppable)"; else echo "FAIL  reset on reopen (stoppable) or no reading"; fail=1; fi

# the saturation API must not be permission-denied
if adb logcat -d -t 600 2>/dev/null | grep -qiE 'SecurityException.*SATURATION|CONTROL_DISPLAY_SATURATION.*denied|requires.*CONTROL_DISPLAY_SATURATION'; then
  echo "FAIL  saturation API permission denied"; fail=1
else
  echo "PASS  no saturation permission error"
fi
echo "ASSERTION_EXIT=$fail"; exit $fail
