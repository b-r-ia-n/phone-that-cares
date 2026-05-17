#!/usr/bin/env bash
# Grant WRITE_SECURE_SETTINGS and enable GrayscaleService via adb.
set -euo pipefail

PKG="com.ptc.launcher"
SERVICE="${PKG}/.GrayscaleService"

echo "[enable-accessibility] Granting WRITE_SECURE_SETTINGS to ${PKG}..."
adb shell pm grant "${PKG}" android.permission.WRITE_SECURE_SETTINGS

echo "[enable-accessibility] Enabling accessibility service: ${SERVICE}..."
adb shell settings put secure enabled_accessibility_services "${SERVICE}"
adb shell settings put secure accessibility_enabled 1

echo "[enable-accessibility] Done. Service enabled: $(adb shell settings get secure enabled_accessibility_services)"
