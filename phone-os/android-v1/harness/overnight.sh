#!/usr/bin/env bash
# Overnight orchestrator. Boots emulator, runs goal chain, generates morning report.
set -uo pipefail
source "$(dirname "$0")/env.sh"

mkdir -p "$PTC_REPORTS"
RUN_LOG="$PTC_REPORTS/run.log"

echo "=== PTC overnight run starting $(date -Iseconds) ===" | tee "$RUN_LOG"

# Boot emulator
if ! "$(dirname "$0")/start-emulator.sh" 2>&1 | tee -a "$RUN_LOG"; then
  echo "FATAL: emulator failed to boot" | tee -a "$RUN_LOG"
  echo '<html><body><h1>Emulator failed to boot</h1><p>See run.log</p></body></html>' > "$PTC_REPORTS/morning.html"
  osascript -e 'display notification "Emulator failed to boot — see overnight run.log" with title "PTC overnight"' 2>/dev/null || true
  open "$PTC_REPORTS/morning.html" 2>/dev/null || true
  exit 1
fi

# Initialize launcher project as a git repo so commits work
if [[ ! -d "$PTC_LAUNCHER/.git" ]]; then
  mkdir -p "$PTC_LAUNCHER"
  ( cd "$PTC_LAUNCHER" && git init -q && \
    git config user.email "ptc-overnight@local" && \
    git config user.name "PTC Overnight" && \
    echo "# PTC Launcher" > README.md && \
    git add README.md && git commit -q -m "init: empty workspace for overnight build" )
fi

# Run the goal chain. Each goal: up to 3 attempts. Cap-hit failures sleep 30 min
# before retry; other failures move on immediately.
GOALS=(G1 G2 G3 G4 G5 G6)
MAX_ATTEMPTS=3
CAP_SLEEP=1800   # 30 min between cap-hit retries
CAP_PATTERN='usage limit|rate limit|429|quota|plan usage|API_OVERLOADED|too many requests|quota_exceeded'

for G in "${GOALS[@]}"; do
  attempt=1
  while [[ $attempt -le $MAX_ATTEMPTS ]]; do
    echo "" | tee -a "$RUN_LOG"
    echo "=== $G attempt $attempt/$MAX_ATTEMPTS $(date -Iseconds) ===" | tee -a "$RUN_LOG"
    if "$(dirname "$0")/run-goal.sh" "$G" 2>&1 | tee -a "$RUN_LOG"; then
      echo "=== $G ok (attempt $attempt) ===" | tee -a "$RUN_LOG"
      break
    fi
    # Check if failure looks cap-related
    CAP_HIT=0
    if grep -qiE "$CAP_PATTERN" "$PTC_REPORTS/$G/stderr.log" "$PTC_REPORTS/$G/live.log" 2>/dev/null; then
      CAP_HIT=1
    fi
    if [[ $CAP_HIT -eq 1 && $attempt -lt $MAX_ATTEMPTS ]]; then
      echo "=== $G hit usage cap; sleeping ${CAP_SLEEP}s then retrying ===" | tee -a "$RUN_LOG"
      sleep "$CAP_SLEEP"
      attempt=$((attempt + 1))
    else
      if [[ $CAP_HIT -eq 1 ]]; then
        echo "=== $G failed after $MAX_ATTEMPTS attempts (cap-related); moving on ===" | tee -a "$RUN_LOG"
      else
        echo "=== $G failed (non-cap); moving on ===" | tee -a "$RUN_LOG"
      fi
      break
    fi
  done
done

echo "" | tee -a "$RUN_LOG"
echo "=== all goals done, generating morning report ===" | tee -a "$RUN_LOG"

"$(dirname "$0")/morning.sh" 2>&1 | tee -a "$RUN_LOG" || true

# Notify + open
osascript -e 'display notification "Overnight run complete — see morning.html" with title "PTC overnight"' 2>/dev/null || true
open "$PTC_REPORTS/morning.html" 2>/dev/null || true

# Shut down emulator
if [[ -f "$PTC_REPORTS/emulator.pid" ]]; then
  kill $(cat "$PTC_REPORTS/emulator.pid") 2>/dev/null || true
fi
adb emu kill 2>/dev/null || true

echo "=== done $(date -Iseconds) ===" | tee -a "$RUN_LOG"
