#!/usr/bin/env bash
# SMS — our app is the default SMS app + an injected inbound SMS is received.
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
ROLE=$(adb shell cmd role holders android.app.role.SMS 2>/dev/null | tr -d '\r')
[[ -z "$ROLE" ]] && ROLE=$(adb shell settings get secure sms_default_application 2>/dev/null | tr -d '\r')
echo "SMS role holder: $ROLE"
if echo "$ROLE" | grep -q com.ptc.launcher; then echo "PASS  our app holds the default-SMS role"; else echo "FAIL  our app is not the default SMS app"; fail=1; fi

MARK="exo-$(date +%s)"
adb emu sms send 15551234567 "$MARK hello from the exo" >/dev/null 2>&1 || adb shell am broadcast -a android.provider.Telephony.SMS_RECEIVED >/dev/null 2>&1
sleep 5
RECV=$(adb shell content query --uri content://sms/inbox --projection body 2>/dev/null | tr -d '\r')
if echo "$RECV" | grep -q "$MARK"; then echo "PASS  inbound SMS received + stored"; else echo "FAIL  injected SMS not found in inbox"; fail=1; fi
echo "ASSERTION_EXIT=$fail"; exit $fail
