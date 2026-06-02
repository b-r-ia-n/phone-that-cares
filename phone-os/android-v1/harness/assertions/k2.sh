#!/usr/bin/env bash
# K2 — biometric -> unlock authority. Inject fingerprint; device transitions to unlocked.
# NOTE: the emulator fakes the sensor and skips the real Gatekeeper/keystore trust path — a pass
# here is SUGGESTIVE (~50%), not proof for real hardware. Requires a fingerprint pre-enrolled (id 1).
set -uo pipefail
source "$(dirname "$0")/../env.sh"
fail=0
echo "-- lock, wake, inject fingerprint id=1 --"
adb shell input keyevent KEYCODE_SLEEP >/dev/null 2>&1; sleep 2
adb shell input keyevent KEYCODE_WAKEUP >/dev/null 2>&1; sleep 2
adb emu finger touch 1 >/dev/null 2>&1; sleep 1; adb emu finger remove >/dev/null 2>&1; sleep 2
ST=$(adb shell dumpsys window 2>/dev/null | grep -ioE 'mKeyguardShowing=(true|false)' | head -1)
echo "keyguard state after fingerprint: ${ST:-unknown}"
if echo "$ST" | grep -qi false; then echo "PASS  unlocked after fingerprint"; else echo "FAIL  still locked after fingerprint"; fail=1; fi
echo "CAVEAT: emulator fingerprint is injected; real Gatekeeper/keystore path NOT exercised."
echo "ASSERTION_EXIT=$fail"; exit $fail
