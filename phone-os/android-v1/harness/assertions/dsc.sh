#!/usr/bin/env bash
# DSC — Discover functional: tap a tile and a real app comes to the foreground.
# Robust to slow first-frame under emulator load. The failure mode we hit: dumpsys
# reports the activity "resumed" ~3s before Compose actually draws, so a fixed-sleep
# swipe fires into an all-black surface whose gesture handler isn't composed yet, and
# a guessed tap lands on nothing. Fix: gate the swipe on the lock surface having truly
# RENDERED (screencap PNG size jumps from ~24KB black to ~76KB drawn), then tap the
# real tile coordinate, and retry the whole thing. On real hardware first-frame is
# sub-second and none of this waiting matters.
set -uo pipefail
source "$(dirname "$0")/../env.sh"

PROBE=/tmp/_dsc_probe.png
RENDER_MIN=55000   # px-content threshold: black≈24KB, lock≈76KB, discover≈104KB

real_app_fg() {
  adb shell dumpsys activity activities 2>/dev/null \
    | grep -iE 'topResumedActivity|ResumedActivity' \
    | grep -qiE 'instagram|twitter|youtube|com\.android\.chrome'
}

wait_launcher_resumed() {
  for _ in $(seq 1 20); do
    adb shell dumpsys activity activities 2>/dev/null \
      | grep -iE 'topResumedActivity|ResumedActivity' | grep -qi 'com.ptc.launcher' && return 0
    sleep 1
  done
  return 1
}

# True once the surface has substantial pixels drawn (not the black pre-compose frame).
rendered() {
  adb exec-out screencap -p > "$PROBE" 2>/dev/null || return 1
  local sz; sz=$(wc -c < "$PROBE" 2>/dev/null | tr -d ' ')
  [[ "${sz:-0}" -gt "$RENDER_MIN" ]]
}
wait_rendered() { for _ in $(seq 1 30); do rendered && return 0; sleep 0.5; done; return 1; }

fail=1
captured=0
for round in $(seq 1 6); do
  if real_app_fg; then fail=0; break; fi
  adb shell am force-stop com.ptc.launcher >/dev/null 2>&1
  adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1
  wait_launcher_resumed || true
  wait_rendered || true                                   # lock surface actually drawn first
  adb shell input swipe 540 1800 540 1100 300 >/dev/null 2>&1   # drag UP -> Discover
  sleep 2                                                  # let Discover compose
  if [[ $captured -eq 0 && -n "${OUT_DIR:-}" ]]; then
    adb exec-out screencap -p > "$OUT_DIR/after.png" 2>/dev/null && captured=1 || true
  fi
  adb shell input tap 282 516 >/dev/null 2>&1            # tap Instagram tile (real coord)
  for _ in $(seq 1 6); do
    if real_app_fg; then fail=0; break; fi
    sleep 1
  done
  [[ $fail -eq 0 ]] && break
  echo "  round $round: tile tap did not launch yet, retrying"
done

FG=$(adb shell dumpsys activity activities 2>/dev/null | grep -iE 'topResumedActivity|ResumedActivity' | head -1)
echo "foreground after tile tap: $FG"
if [[ $fail -eq 0 ]]; then
  echo "PASS  tapping a Discover tile launched a real app"
else
  echo "FAIL  tile tap did not launch a real app (still: $FG)"
fi
echo "ASSERTION_EXIT=$fail"; exit $fail
