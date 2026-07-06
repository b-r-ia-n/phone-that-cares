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

    fun borrowMinutes(ctx: Context): Int = prefs(ctx).getInt("borrow_minutes", 20)
    fun setBorrowMinutes(ctx: Context, v: Int) =
        prefs(ctx).edit().putInt("borrow_minutes", v).apply()

    fun dawnEnabled(ctx: Context): Boolean = prefs(ctx).getBoolean("dawn_enabled", true)
    fun setDawnEnabled(ctx: Context, v: Boolean) {
        prefs(ctx).edit().putBoolean("dawn_enabled", v).apply()
        if (v) scheduleDawn(ctx) else cancelDawn(ctx)
    }

    fun borrowUntil(ctx: Context): Long = prefs(ctx).getLong("borrow_until", 0L)

    private fun pending(ctx: Context, cls: Class<*>, code: Int): PendingIntent =
        PendingIntent.getBroadcast(
            ctx, code, Intent(ctx, cls),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

    /** Borrow color: gray off now; warn haptic near the end; gray returns after. */
    fun borrow(ctx: Context): Boolean {
        if (!setGray(ctx, false)) return false
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val ms = borrowMinutes(ctx) * 60_000L
        val until = System.currentTimeMillis() + ms
        prefs(ctx).edit().putLong("borrow_until", until).apply()
        if (ms > 45_000L) {
            am.setWindow(
                AlarmManager.RTC_WAKEUP, until - 30_000L, 10_000L,
                pending(ctx, WarnReceiver::class.java, 1)
            )
        }
        // Exact + allow-while-idle: Doze may defer a plain setWindow alarm
        // for hours on real hardware, so the snap-back must punch through.
        am.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP, until,
            pending(ctx, RegrayReceiver::class.java, 2)
        )
        vibrate(ctx, longArrayOf(0, 40, 80, 40))
        return true
    }

    /** Watchdog: if a borrow has run out, end it now. True if it regrayed. */
    fun regrayIfDue(ctx: Context): Boolean {
        val until = borrowUntil(ctx)
        if (until == 0L || System.currentTimeMillis() < until) return false
        prefs(ctx).edit().putLong("borrow_until", 0L).apply()
        setGray(ctx, true)
        return true
    }

    /** Daily inexact alarm around the dawn hour (default 4:00). */
    fun scheduleDawn(ctx: Context) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 4)
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
