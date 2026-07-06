package com.ptc.graydawn

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.Settings
import java.util.Calendar

object Gray {

    private const val DALTONIZER_ENABLED = "accessibility_display_daltonizer_enabled"
    private const val DALTONIZER = "accessibility_display_daltonizer"
    private const val MODE_GRAYSCALE = 0

    const val DAWN_HOUR = 4

    /** Slider sentinel: the hold's color lasts until the next dawn. */
    const val UNTIL_DAWN = -1
    const val UNTIL_DAWN_MS = Long.MAX_VALUE

    // Pref keys keep their original names ("borrow_*") so an installed
    // phone upgrades without losing state; only the language changed.
    fun prefs(ctx: Context): SharedPreferences =
        ctx.getSharedPreferences("graydawn", Context.MODE_PRIVATE)

    fun hasPermission(ctx: Context): Boolean =
        ctx.checkSelfPermission("android.permission.WRITE_SECURE_SETTINGS") ==
            PackageManager.PERMISSION_GRANTED

    fun isGray(ctx: Context): Boolean =
        Settings.Secure.getInt(ctx.contentResolver, DALTONIZER_ENABLED, 0) == 1

    /** Returns false if the write failed (permission not granted). */
    fun setGray(ctx: Context, on: Boolean): Boolean = runCatching {
        Settings.Secure.putInt(ctx.contentResolver, DALTONIZER, MODE_GRAYSCALE)
        Settings.Secure.putInt(ctx.contentResolver, DALTONIZER_ENABLED, if (on) 1 else 0)
    }.isSuccess

    fun saturationMinutes(ctx: Context): Int = prefs(ctx).getInt("borrow_minutes", 20)
    fun setSaturationMinutes(ctx: Context, v: Int, byUser: Boolean = false) {
        val edit = prefs(ctx).edit().putInt("borrow_minutes", v)
        // The letter reports whether the length is our default or their
        // choice — the slider position is the only measurement we take.
        if (byUser && v != saturationMinutes(ctx)) edit.putBoolean("minutes_touched", true)
        edit.apply()
    }
    fun minutesTouched(ctx: Context): Boolean = prefs(ctx).getBoolean("minutes_touched", false)

    /** "7 minutes" / "2 hours" / "until dawn" — one voice everywhere. */
    fun lengthLabel(minutes: Int): String = when {
        minutes == UNTIL_DAWN -> "until dawn"
        minutes >= 120 -> "${minutes / 60} hours"
        minutes == 1 -> "1 minute"
        else -> "$minutes minutes"
    }

    fun dawnEnabled(ctx: Context): Boolean = prefs(ctx).getBoolean("dawn_enabled", true)
    fun setDawnEnabled(ctx: Context, v: Boolean) {
        prefs(ctx).edit().putBoolean("dawn_enabled", v).apply()
        if (v) {
            // Turning the switch on means "starting tomorrow", not
            // "snap gray the next time the screen lights up today."
            markDawnDone(ctx)
            scheduleDawn(ctx)
        } else {
            cancelDawn(ctx)
        }
    }

    fun saturationUntil(ctx: Context): Long = prefs(ctx).getLong("borrow_until", 0L)

    private fun pending(ctx: Context, cls: Class<*>, code: Int): PendingIntent =
        PendingIntent.getBroadcast(
            ctx, code, Intent(ctx, cls),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

    /**
     * The hold: color now, gray again after the saturation runs out.
     * The warning buzz near the end is timed by the service watchdog,
     * not an alarm — a second allow-while-idle alarm would trade doze
     * throttle budget away from the snap-back, which must not slip.
     */
    fun saturate(ctx: Context): Boolean {
        if (!setGray(ctx, false)) return false
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val minutes = saturationMinutes(ctx)
        if (minutes == UNTIL_DAWN) {
            // No snap-back at all — tomorrow's dawn is what ends this one.
            prefs(ctx).edit().putLong("borrow_until", UNTIL_DAWN_MS).apply()
            am.cancel(pending(ctx, RegrayReceiver::class.java, 2))
        } else {
            val until = System.currentTimeMillis() + minutes * 60_000L
            prefs(ctx).edit().putLong("borrow_until", until).apply()
            // Exact + allow-while-idle: Doze may defer a plain setWindow alarm
            // for hours on real hardware, so the snap-back must punch through.
            am.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP, until,
                pending(ctx, RegrayReceiver::class.java, 2)
            )
        }
        vibrate(ctx, longArrayOf(0, 40, 80, 40))
        return true
    }

    /**
     * Going gray by hand while a saturation is live ends the saturation —
     * otherwise a stale borrow_until leaves the status line lying.
     */
    fun endSaturationEarly(ctx: Context) {
        prefs(ctx).edit().putLong("borrow_until", 0L).apply()
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.cancel(pending(ctx, RegrayReceiver::class.java, 2))
    }

    /** Watchdog: if a saturation has run out, end it now. True if it regrayed. */
    fun regrayIfDue(ctx: Context): Boolean {
        val until = saturationUntil(ctx)
        if (until == 0L || System.currentTimeMillis() < until) return false
        prefs(ctx).edit().putLong("borrow_until", 0L).apply()
        setGray(ctx, true)
        return true
    }

    // ---- dawn bookkeeping -------------------------------------------------

    private fun today(): Long = System.currentTimeMillis() / 86_400_000L

    fun markDawnDone(ctx: Context) =
        prefs(ctx).edit().putLong("last_dawn_day", today()).apply()

    private fun dawnDoneToday(ctx: Context): Boolean =
        prefs(ctx).getLong("last_dawn_day", 0L) >= today()

    private fun pastDawnToday(): Boolean =
        Calendar.getInstance().get(Calendar.HOUR_OF_DAY) >= DAWN_HOUR

    /**
     * The dawn alarm is deliberately inexact, so a deep-dozing phone can
     * sleep through 4:00. Called on screen-on and service connect: if
     * today's dawn hasn't landed yet and it's past the hour, land it now.
     * An active saturation is honored — nothing is taken back early; the
     * snap-back alarm will bring the gray when the saturation ends.
     */
    fun dawnCatchUpIfDue(ctx: Context): Boolean {
        if (!hasPermission(ctx)) return false
        // First run: the phone's first gray should be the first-try tap or
        // the first real dawn — never an ambush at install time.
        if (prefs(ctx).getLong("last_dawn_day", 0L) == 0L) {
            markDawnDone(ctx)
            return false
        }
        if (!dawnEnabled(ctx) || dawnDoneToday(ctx) || !pastDawnToday()) return false
        markDawnDone(ctx)
        // An until-dawn saturation ends here — that's the deal it was made
        // under. A finite one is honored; its own alarm brings the gray.
        if (saturationUntil(ctx) == UNTIL_DAWN_MS) endSaturationEarly(ctx)
        else if (saturationUntil(ctx) > System.currentTimeMillis()) return false
        return setGray(ctx, true)
    }

    /** Daily inexact alarm around the dawn hour (default 4:00). */
    fun scheduleDawn(ctx: Context) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, DAWN_HOUR)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }
        am.setInexactRepeating(
            AlarmManager.RTC_WAKEUP, cal.timeInMillis, AlarmManager.INTERVAL_DAY,
            pending(ctx, DawnReceiver::class.java, 3)
        )
    }

    fun cancelDawn(ctx: Context) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.cancel(pending(ctx, DawnReceiver::class.java, 3))
    }

    fun vibrate(ctx: Context, pattern: LongArray) {
        @Suppress("DEPRECATION")
        val v = ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
        runCatching { v.vibrate(VibrationEffect.createWaveform(pattern, -1)) }
    }
}
