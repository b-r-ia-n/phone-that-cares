#!/usr/bin/env bash
# FL — lock surface fidelity. Relaunch to the lock surface, wait for it to actually
# RENDER (not the black cold-start frame), recapture for the verifier (vs refs/lock.png).
# Earlier this false-failed: a fixed sleep captured a black frame with a social app
# (left logged-in) still foregrounded, so the verifier never saw the lock surface.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
PROBE=/tmp/_fl_probe.png
RENDER_MIN=55000   # black≈24KB, lock≈76-96KB

fail=0
# Clear anything sitting on top (social apps from login, etc.) then bring up our launcher.
for p in com.instagram.android com.twitter.android com.google.android.youtube; do
  adb shell am force-stop "$p" >/dev/null 2>&1
done
adb shell am force-stop com.ptc.launcher >/dev/null 2>&1
adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1

# Wait for launcher resumed, then for the surface to truly render.
for _ in $(seq 1 20); do
  adb shell dumpsys activity activities 2>/dev/null | grep -iE 'topResumedActivity|ResumedActivity' | grep -qi com.ptc.launcher && break
  sleep 1
done
rendered=0
for _ in $(seq 1 30); do
  adb exec-out screencap -p > "$PROBE" 2>/dev/null || true
  sz=$(wc -c < "$PROBE" 2>/dev/null | tr -d ' ')
  if [[ "${sz:-0}" -gt "$RENDER_MIN" ]]; then rendered=1; break; fi
  sleep 1
done
[[ -n "${OUT_DIR:-}" ]] && cp "$PROBE" "$OUT_DIR/after.png" 2>/dev/null || true

FG=$(adb shell dumpsys activity activities 2>/dev/null | grep -iE 'topResumedActivity|ResumedActivity' | head -1)
if echo "$FG" | grep -qi com.ptc.launcher; then echo "PASS  launcher foreground"; else echo "FAIL  launcher not foreground ($FG)"; fail=1; fi
if [[ $rendered -eq 1 ]]; then echo "PASS  lock surface rendered (px content present)"; else echo "FAIL  lock surface never rendered (black frame)"; fail=1; fi
if adb logcat -d -t 300 2>/dev/null | grep -qE 'FATAL EXCEPTION|E +AndroidRuntime'; then echo "FAIL  crash in logcat"; fail=1; else echo "PASS  no crash"; fi
echo "fidelity (fingerprint glyph / status bar / clock+cards / 95dp commit) vs refs/lock.png judged by the verifier"
echo "ASSERTION_EXIT=$fail"; exit $fail
