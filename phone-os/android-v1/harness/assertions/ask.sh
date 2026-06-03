#!/usr/bin/env bash
# ASK — Ask page rework. Bring up the lock surface, wait for it to RENDER, then drag
# DOWN to the Ask route and confirm we actually LANDED on Ask (poll the view hierarchy
# for Ask-specific text) before recapturing for the verifier. Earlier this false-failed:
# a fixed-sleep swipe fired into an unrendered surface, so capture caught the lock
# screen (or settings) instead of Ask. Drag starts near center (the working coords),
# not low-and-off-screen.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
PROBE=/tmp/_ask_probe.png
RENDER_MIN=55000

on_ask() {  # true if the Ask surface is up (its hierarchy has the prompt / talk control)
  adb shell uiautomator dump /sdcard/_ask.xml >/dev/null 2>&1 || return 1
  adb shell cat /sdcard/_ask.xml 2>/dev/null | grep -qiE 'what do you want to do|tap to talk|type instead|see past chats'
}

fail=0
for p in com.instagram.android com.twitter.android com.google.android.youtube; do
  adb shell am force-stop "$p" >/dev/null 2>&1
done
adb shell am force-stop com.ptc.launcher >/dev/null 2>&1
adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1
for _ in $(seq 1 20); do
  adb shell dumpsys activity activities 2>/dev/null | grep -iE 'topResumedActivity|ResumedActivity' | grep -qi com.ptc.launcher && break
  sleep 1
done
# wait for lock surface render before gesturing
for _ in $(seq 1 30); do
  adb exec-out screencap -p > "$PROBE" 2>/dev/null || true
  sz=$(wc -c < "$PROBE" 2>/dev/null | tr -d ' ')
  [[ "${sz:-0}" -gt "$RENDER_MIN" ]] && break
  sleep 1
done

# Drag DOWN to Ask, retry until the Ask surface is confirmed up.
landed=0
for round in $(seq 1 6); do
  if on_ask; then landed=1; break; fi
  adb shell input swipe 540 1000 540 1900 320 >/dev/null 2>&1   # drag DOWN -> Ask
  sleep 2
  if on_ask; then landed=1; break; fi
  # not there yet — reset to lock and retry
  adb shell am start -n com.ptc.launcher/.MainActivity >/dev/null 2>&1
  sleep 1
done
[[ -n "${OUT_DIR:-}" ]] && adb exec-out screencap -p > "$OUT_DIR/after.png" 2>/dev/null || true

if [[ $landed -eq 1 ]]; then echo "PASS  landed on Ask surface (prompt/talk/type/past-chats present)"; else echo "FAIL  never landed on Ask surface"; fail=1; fi
if adb logcat -d -t 300 2>/dev/null | grep -qE 'FATAL EXCEPTION|E +AndroidRuntime'; then echo "FAIL  crash in logcat"; fail=1; else echo "PASS  no crash"; fi
echo "coherence + record/type wiring + past-chats list judged by the verifier"
echo "ASSERTION_EXIT=$fail"; exit $fail
