#!/usr/bin/env bash
# APPS — real social apps installed + launchable (login is Brian's manual step; not asserted).
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
for pkg in com.instagram.android com.twitter.android com.google.android.youtube; do
  if adb shell pm list packages 2>/dev/null | grep -q "^package:$pkg$"; then
    echo "PASS  installed: $pkg"
    adb shell monkey -p "$pkg" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 4
    if adb logcat -d -t 200 2>/dev/null | grep -qE "FATAL EXCEPTION.*$pkg|AndroidRuntime.*$pkg"; then
      echo "FAIL  $pkg crashed on launch"; fail=1
    else
      echo "PASS  $pkg launched (no immediate crash)"
    fi
  else
    echo "FAIL  not installed: $pkg"; fail=1
  fi
done
echo "ASSERTION_EXIT=$fail"; exit $fail
