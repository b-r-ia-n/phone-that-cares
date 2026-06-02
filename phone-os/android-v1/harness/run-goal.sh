#!/usr/bin/env bash
# Run one goal, then verify + auto-repair.
#
# Flow:
#   round 0  : fresh builder session (persisted, so it's resumable)
#   verify   : adb assertion script  +  independent judge -> verdict.json
#   repair   : while not pass and rounds remain, RESUME the same builder session with
#              the judge verdict + assertion output + a fresh screenshot, then re-verify.
#
# The builder session is persisted (no --no-session-persistence) and its id is saved to
# reports/<goal>/session_id.txt so it can also be resumed interactively (see resume-goal.sh).
#
# Env knobs:
#   PTC_MAX_REPAIR   repair rounds after the first attempt (default 2)
#   PTC_BUILD_MODEL  builder model (default sonnet)
#
# Usage: run-goal.sh G1
set -uo pipefail
source "$(dirname "$0")/env.sh"

GOAL_ID="$1"
GOAL_FILE="$PTC_GOALS/$GOAL_ID.txt"
GOAL_COND=$(cat "$GOAL_FILE")
OUT_DIR="$PTC_REPORTS/$GOAL_ID"
mkdir -p "$OUT_DIR"
export GOAL_ID OUT_DIR   # so assertion scripts can navigate + re-capture after.png

MAX_REPAIR="${PTC_MAX_REPAIR:-2}"
BUILD_MODEL="${PTC_BUILD_MODEL:-claude-opus-4-8}"
HERE="$(dirname "$0")"
SESSION_ID=""

START_TS=$(date +%s)
echo "[$GOAL_ID] start $(date -Iseconds)" | tee "$OUT_DIR/timing.txt"

adb_avail() { adb get-state 2>/dev/null | grep -q device; }
if adb_avail; then adb exec-out screencap -p > "$OUT_DIR/before.png" 2>/dev/null || true; fi

# ── Build the initial prompt ─────────────────────────────────────────────────
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
  printf '%s\n' "Your work will be checked by an independent judge that reads SCREENSHOTS and an adb assertion script — not your description. Make the feature genuinely, visibly work; do not stub or fake to pass. Surface the verifying command outputs in your final turn."
  printf '\n'
  printf '/goal %s\n' "$GOAL_COND"
} > "$PROMPT_FILE"

# ── One claude turn. mode=fresh (initial) or resume (repair). $2 = prompt/feedback file. ──
run_turn() {
  local mode="$1" infile="$2"
  # Build a single always-non-empty arg array (empty-array expansion under `set -u`
  # is an unbound-variable error on macOS bash 3.2).
  local args=(-p --dangerously-skip-permissions --model "$BUILD_MODEL"
              --output-format stream-json --include-partial-messages --verbose)
  if [[ "$mode" == "resume" && -n "$SESSION_ID" ]]; then
    args+=(--resume "$SESSION_ID")
  fi
  (
    cd "$PTC_LAUNCHER" 2>/dev/null || cd "$PTC_ROOT"
    cat "$infile" | claude "${args[@]}" \
      2>> "$OUT_DIR/stderr.log" \
      | tee -a "$OUT_DIR/stream.jsonl" \
      | python3 -c "
import json, sys
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        ev = json.loads(line)
        t = ev.get('type','?')
        if t == 'assistant':
            for block in ev.get('message', {}).get('content', []):
                if block.get('type') == 'text':
                    sys.stdout.write('[txt] ' + (block.get('text','')[:200]).replace('\n',' ') + '\n')
                elif block.get('type') == 'tool_use':
                    sys.stdout.write(f\"[tool] {block.get('name','?')} {json.dumps(block.get('input',{}))[:200]}\n\")
        elif t == 'user':
            for block in ev.get('message', {}).get('content', []):
                if block.get('type') == 'tool_result':
                    sys.stdout.write('[result] ' + str(block.get('content',''))[:200].replace('\n',' ') + '\n')
        elif t == 'result':
            sys.stdout.write('[done] ' + str(ev.get('subtype','?')) + ' cost=\$' + str(ev.get('total_cost_usd','?')) + '\n')
        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(f'[parse-err] {e}\n')
" >> "$OUT_DIR/live.log" 2>&1
  ) &
  local pid=$!
  ( sleep 5400 && kill -TERM "$pid" 2>/dev/null ) &
  local wd=$!
  wait "$pid"; local rc=$?
  pkill -P "$wd" 2>/dev/null; kill "$wd" 2>/dev/null || true
  return $rc
}

# session_id appears in the stream init event; capture the first one.
capture_session_id() {
  local sid
  sid=$(grep -oE '"session_id":"[^"]+"' "$OUT_DIR/stream.jsonl" 2>/dev/null | head -1 | cut -d'"' -f4)
  if [[ -n "$sid" ]]; then SESSION_ID="$sid"; echo "$sid" > "$OUT_DIR/session_id.txt"; fi
}

capture_evidence() {
  if adb_avail; then
    adb exec-out screencap -p > "$OUT_DIR/after.png" 2>/dev/null || true
    adb logcat -d -t 500 > "$OUT_DIR/logcat.log" 2>/dev/null || true
    adb shell dumpsys activity activities 2>/dev/null | head -100 > "$OUT_DIR/activities.txt" || true
  fi
}

run_verify() {
  local assert_script="$HERE/assertions/$(echo "$GOAL_ID" | tr 'A-Z' 'a-z').sh"
  if [[ -f "$assert_script" ]] && adb_avail; then
    echo "[$GOAL_ID] assertion: $assert_script" | tee -a "$OUT_DIR/timing.txt"
    bash "$assert_script" > "$OUT_DIR/assertion.txt" 2>&1
    echo "(assertion runner exit=$?)" >> "$OUT_DIR/assertion.txt"
  fi
  if adb_avail; then "$HERE/judge.sh" "$GOAL_ID" >> "$OUT_DIR/judge-run.log" 2>&1 || true; fi
}

verdict_status() {
  python3 -c "import json;print(json.load(open('$OUT_DIR/verdict.json')).get('status','unknown'))" 2>/dev/null || echo unknown
}

# ── Round 0: fresh build ─────────────────────────────────────────────────────
run_turn fresh "$PROMPT_FILE"; EXIT_CODE=$?
capture_session_id
capture_evidence
run_verify
STATUS=$(verdict_status)
echo "[$GOAL_ID] round 0 verdict=$STATUS (session=${SESSION_ID:-none})" | tee -a "$OUT_DIR/timing.txt"

# ── Repair rounds ────────────────────────────────────────────────────────────
round=0
while [[ "$STATUS" != "pass" && $round -lt $MAX_REPAIR ]]; do
  if [[ -z "$SESSION_ID" ]]; then
    echo "[$GOAL_ID] cannot repair — no session_id captured" | tee -a "$OUT_DIR/timing.txt"
    break
  fi
  round=$((round + 1))
  FB="$OUT_DIR/repair-$round.txt"
  {
    printf '%s\n' "Your previous attempt at goal $GOAL_ID did NOT pass independent verification. Repair round $round of $MAX_REPAIR."
    printf '\n%s\n' "=== INDEPENDENT JUDGE VERDICT ==="
    cat "$OUT_DIR/verdict.json" 2>/dev/null
    printf '\n%s\n' "=== ASSERTION SCRIPT OUTPUT ==="
    cat "$OUT_DIR/assertion.txt" 2>/dev/null
    printf '\n%s\n' "A fresh screenshot of the CURRENT on-device state is at $OUT_DIR/after.png — use Read to look at it."
    printf '%s\n' "Fix the actual problem so the condition is genuinely and visibly met. Do NOT weaken/modify the assertion script and do NOT fake the result. If it is truly impossible after real attempts, write $OUT_DIR/findings.md explaining why, and stop."
  } > "$FB"
  echo "[$GOAL_ID] repair round $round — resuming session $SESSION_ID" | tee -a "$OUT_DIR/timing.txt"
  run_turn resume "$FB"; EXIT_CODE=$?
  capture_evidence
  run_verify
  STATUS=$(verdict_status)
  echo "[$GOAL_ID] round $round verdict=$STATUS" | tee -a "$OUT_DIR/timing.txt"
done

END_TS=$(date +%s)
DURATION=$((END_TS - START_TS))
echo "[$GOAL_ID] exit=$EXIT_CODE final_verdict=$STATUS repair_rounds=$round duration=${DURATION}s" | tee -a "$OUT_DIR/timing.txt"

{
  echo "exit_code: $EXIT_CODE"
  echo "final_verdict: $STATUS"
  echo "repair_rounds: $round"
  echo "session_id: ${SESSION_ID:-none}"
  echo "duration_seconds: $DURATION"
  echo "started: $(date -r "$START_TS" -Iseconds)"
  echo "ended: $(date -r "$END_TS" -Iseconds)"
} > "$OUT_DIR/result.txt"

# Exit 0 if the judge passed; non-zero otherwise (so the orchestrator can see verify status).
[[ "$STATUS" == "pass" ]] && exit 0 || exit 1
