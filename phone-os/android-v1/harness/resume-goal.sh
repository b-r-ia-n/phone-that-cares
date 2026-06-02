#!/usr/bin/env bash
# Interactively continue a goal's builder session — "hey, this didn't work, here's the state now."
#
# The overnight harness persists each goal's builder session and saves its id to
# reports/<goal>/session_id.txt. This drops you into that same conversation with full context.
#
# Usage:
#   resume-goal.sh K2                      # grabs a fresh screenshot, asks it for status + next step
#   resume-goal.sh K2 "the screen is black, here's the current shot"   # your own message
#
# Note: this is INTERACTIVE (no -p) so you can converse. The fresh screenshot path is appended
# to your message so the resumed instance can Read it.
set -uo pipefail
source "$(dirname "$0")/env.sh"

GOAL_ID="${1:-}"
[[ -z "$GOAL_ID" ]] && { echo "usage: resume-goal.sh <GOAL_ID> [message]"; exit 1; }
shift || true

SID=$(cat "$PTC_REPORTS/$GOAL_ID/session_id.txt" 2>/dev/null || true)
if [[ -z "$SID" ]]; then
  echo "No session_id for $GOAL_ID. Was it run with the persistence-enabled harness (run-goal.sh)?"
  echo "Looked in: $PTC_REPORTS/$GOAL_ID/session_id.txt"
  exit 1
fi

SHOT="$PTC_REPORTS/$GOAL_ID/manual-state.png"
if adb get-state 2>/dev/null | grep -q device; then
  adb exec-out screencap -p > "$SHOT" 2>/dev/null || true
fi

MSG="$*"
if [[ -z "$MSG" ]]; then
  MSG="Continuing our work on goal $GOAL_ID. Here is the CURRENT on-device state: $SHOT (use Read to view it). What's the status, what went wrong, and what's your next step?"
else
  [[ -f "$SHOT" ]] && MSG="$MSG  (current screenshot: $SHOT — Read it.)"
fi

echo "Resuming $GOAL_ID session $SID …"
cd "$PTC_LAUNCHER" 2>/dev/null || cd "$PTC_ROOT"
exec claude --resume "$SID" --dangerously-skip-permissions "$MSG"
