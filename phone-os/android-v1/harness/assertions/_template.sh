#!/usr/bin/env bash
# Assertion script convention. One per goal: harness/assertions/<goal_id_lowercase>.sh
# These are the SPEC — pure, externally-observable adb/gradle checks. No LLM judgment.
# The point: make the cheap way to pass identical to the real way (anti reward-hacking).
#
# Rules:
#   - Print human-readable PASS/FAIL lines as you go.
#   - End with exactly one line: ASSERTION_EXIT=<n>  (0 = all checks passed)
#   - exit with that same code.
#   - Never modify app code or tests here; only observe.
set -uo pipefail
source "$(dirname "$0")/../env.sh"

fail=0
check() { # check "label" <cmd...>  — runs cmd, prints PASS/FAIL, accumulates failure
  local label="$1"; shift
  if "$@" >/dev/null 2>&1; then echo "PASS  $label"; else echo "FAIL  $label"; fail=1; fi
}

# --- example checks ---
# check "emulator reachable" bash -c 'adb get-state | grep -q device'
# check "package installed"  bash -c 'adb shell pm list packages | grep -q com.ptc.launcher'

echo "ASSERTION_EXIT=$fail"
exit $fail
