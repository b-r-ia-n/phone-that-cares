#!/usr/bin/env bash
# NF — notification filter. Mechanical floor: listener service bound + pure filter unit tests green.
# Live show/hide on the lock surface is judged from evidence.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
if adb shell cmd notification list_listeners 2>/dev/null | grep -qi com.ptc.launcher \
   || adb shell settings get secure enabled_notification_listeners 2>/dev/null | grep -qi com.ptc.launcher; then
  echo "PASS  notification listener registered"
else
  echo "FAIL  notification listener not registered"; fail=1
fi
echo "-- filter unit tests --"
( cd "$PTC_LAUNCHER" && ./gradlew :app:testDebugUnitTest --tests "*NotificationFilter*" ) >/tmp/nf-unit.log 2>&1 \
  && echo "PASS  NotificationFilter unit tests" || { echo "FAIL  NotificationFilter unit tests (see /tmp/nf-unit.log)"; fail=1; }
echo "ASSERTION_EXIT=$fail"; exit $fail
