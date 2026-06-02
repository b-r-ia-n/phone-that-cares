#!/usr/bin/env bash
# CH — Ask-page conversation recall. Mechanical floor: app installed + AskScreen compose test
# (tapping a past-conversation chip opens a transcript view) green. Live OpenAI reply judged from evidence.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
adb shell pm list packages 2>/dev/null | grep -q "^package:com.ptc.launcher$" && echo "PASS  package installed" || { echo "FAIL  package installed"; fail=1; }
echo "-- AskScreen recall compose test --"
( cd "$PTC_LAUNCHER" && ./gradlew :app:connectedDebugAndroidTest --tests "*AskScreen*" ) >/tmp/ch-androidtest.log 2>&1 \
  && echo "PASS  AskScreen test" || { echo "FAIL  AskScreen test (see /tmp/ch-androidtest.log)"; fail=1; }
echo "ASSERTION_EXIT=$fail"; exit $fail
