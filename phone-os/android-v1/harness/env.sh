#!/usr/bin/env bash
# Sourced by every harness script. Sets up the Android toolchain env.

export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

export PTC_ROOT="/Users/b/Desktop/PhoneThatCares/phone-os/android-v1"
export PTC_LAUNCHER="$PTC_ROOT/launcher"
export PTC_REPORTS="$PTC_ROOT/reports"
export PTC_GOALS="$PTC_ROOT/goals"
export PTC_AVD="ptc-test"

# Optional — only G6 (Ask wired) cares about OPENAI_API_KEY.
# If not set, G6 degrades to a "STT not configured" message.
if [[ -f "$HOME/.argos.env" ]]; then
  set -a; source "$HOME/.argos.env"; set +a
fi

# Allow override file for tonight only.
if [[ -f "$PTC_ROOT/.env.local" ]]; then
  set -a; source "$PTC_ROOT/.env.local"; set +a
fi
