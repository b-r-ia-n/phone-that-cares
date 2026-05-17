#!/usr/bin/env bash
# Run one goal headless. Capture transcript, exit code, screenshot, logcat slice.
# Usage: run-goal.sh G1
set -uo pipefail
source "$(dirname "$0")/env.sh"

GOAL_ID="$1"
GOAL_FILE="$PTC_GOALS/$GOAL_ID.txt"
GOAL_COND=$(cat "$GOAL_FILE")
OUT_DIR="$PTC_REPORTS/$GOAL_ID"
mkdir -p "$OUT_DIR"

START_TS=$(date +%s)
echo "[$GOAL_ID] start $(date -Iseconds)" | tee "$OUT_DIR/timing.txt"

# Take a "before" screenshot
adb_avail() { adb get-state 2>/dev/null | grep -q device; }
if adb_avail; then adb exec-out screencap -p > "$OUT_DIR/before.png" 2>/dev/null || true; fi

# Build prompt via a temp file to avoid heredoc/$()/quote interactions.
PROMPT_FILE="$OUT_DIR/prompt.txt"
{
  printf '%s\n\n' "You are working on Phone That Cares Android v1, goal $GOAL_ID."
  printf '%s\n' "Read /Users/b/Desktop/PhoneThatCares/phone-os/android-v1/PROJECT_BRIEF.md before doing anything."
  printf '\n'
  printf '%s\n' "Working directory: $PTC_LAUNCHER (mkdir -p it if it does not exist yet)."
  printf '\n'
  printf '%s\n' "You have full bash, build, install, and adb access. PATH includes adb, emulator, gradle wrapper deps, JDK 17."
  printf '%s\n' "Use 'adb devices' to confirm emulator. Build with ./gradlew. Screenshot with 'adb exec-out screencap -p > /tmp/x.png'."
  printf '%s\n' "Inspect with 'adb logcat -d -t 200'. The emulator AVD ptc-test is already booted."
  printf '\n'
  printf '%s\n' "If you get stuck on the same error for >5 turns, write what you tried to $OUT_DIR/stuck.md and either try a different angle or stop. Partial progress is fine."
  printf '\n'
  printf '%s\n' "When the goal condition is met, surface the verifying command outputs in your final turn so the Haiku judge can confirm."
  printf '\n'
  printf '/goal %s\n' "$GOAL_COND"
} > "$PROMPT_FILE"

# Run claude headless. Wall-clock cap via background killer.
# stream-json output: jsonl events written as they happen. Tail-able for live progress.
# We also tee a flattened text view for quick eyeballing.
(
  cd "$PTC_LAUNCHER" 2>/dev/null || cd "$PTC_ROOT"
  cat "$PROMPT_FILE" | claude -p \
    --dangerously-skip-permissions \
    --model sonnet \
    --output-format stream-json \
    --include-partial-messages \
    --verbose \
    --no-session-persistence \
    2> "$OUT_DIR/stderr.log" \
    | tee "$OUT_DIR/stream.jsonl" \
    | python3 -c "
import json, sys
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        ev = json.loads(line)
        t = ev.get('type','?')
        if t == 'assistant':
            msg = ev.get('message', {})
            for block in msg.get('content', []):
                if block.get('type') == 'text':
                    sys.stdout.write('[txt] ' + (block.get('text','')[:200]).replace('\n',' ') + '\n')
                elif block.get('type') == 'tool_use':
                    name = block.get('name','?')
                    inp = json.dumps(block.get('input',{}))[:200]
                    sys.stdout.write(f'[tool] {name} {inp}\n')
        elif t == 'user':
            msg = ev.get('message', {})
            for block in msg.get('content', []):
                if block.get('type') == 'tool_result':
                    out = str(block.get('content',''))[:200].replace('\n',' ')
                    sys.stdout.write(f'[result] {out}\n')
        elif t == 'result':
            sys.stdout.write('[done] ' + str(ev.get('subtype','?')) + ' cost=$' + str(ev.get('total_cost_usd','?')) + '\n')
        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(f'[parse-err] {e}\n')
" > "$OUT_DIR/live.log" 2>&1
) &
CLAUDE_PID=$!

# 90-minute wall clock cap
( sleep 5400 && kill -TERM "$CLAUDE_PID" 2>/dev/null ) &
WATCHDOG_PID=$!

wait "$CLAUDE_PID"
EXIT_CODE=$?
# Kill watchdog AND its children — otherwise the `sleep 5400` orphans to init.
pkill -P "$WATCHDOG_PID" 2>/dev/null
kill "$WATCHDOG_PID" 2>/dev/null || true

END_TS=$(date +%s)
DURATION=$((END_TS - START_TS))

echo "[$GOAL_ID] exit=$EXIT_CODE duration=${DURATION}s" | tee -a "$OUT_DIR/timing.txt"

# Capture evidence (only if emulator is reachable; otherwise these hang)
if adb_avail; then
  adb exec-out screencap -p > "$OUT_DIR/after.png" 2>/dev/null || true
  adb logcat -d -t 500 > "$OUT_DIR/logcat.log" 2>/dev/null || true
  adb shell dumpsys activity activities 2>/dev/null | head -100 > "$OUT_DIR/activities.txt" || true
fi

# Final state summary
{
  echo "exit_code: $EXIT_CODE"
  echo "duration_seconds: $DURATION"
  echo "started: $(date -r "$START_TS" -Iseconds)"
  echo "ended: $(date -r "$END_TS" -Iseconds)"
} > "$OUT_DIR/result.txt"

exit "$EXIT_CODE"
