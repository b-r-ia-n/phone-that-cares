package com.ptc.graydawn

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Process
import androidx.core.app.NotificationCompat
import java.util.concurrent.TimeUnit

/**
 * The day-12 letter: a consented before/after note the phone writes and
 * the person sends themselves. Graydawn has no internet permission — the
 * letter only leaves because someone reads it and taps send.
 */
object Letter {

    // Swappable single constant; forwards to Brian. Set up the Namecheap
    // "Redirect Email" entry for this address before sharing APKs.
    const val ADDRESS = "b@aphonethatcares.com"
    private const val DUE_DAYS = 12L
    private const val CHANNEL = "letter"

    fun installTime(ctx: Context): Long =
        ctx.packageManager.getPackageInfo(ctx.packageName, 0).firstInstallTime

    fun due(ctx: Context): Boolean =
        System.currentTimeMillis() - installTime(ctx) >= TimeUnit.DAYS.toMillis(DUE_DAYS)

    fun answered(ctx: Context): Boolean =
        Gray.prefs(ctx).getBoolean("letter_done", false) ||
            Gray.prefs(ctx).getBoolean("letter_declined", false)

    fun markDone(ctx: Context) =
        Gray.prefs(ctx).edit().putBoolean("letter_done", true).apply()

    fun markDeclined(ctx: Context) =
        Gray.prefs(ctx).edit().putBoolean("letter_declined", true).apply()

    /**
     * One notification, ever — people may never reopen the app, so this
     * is how the question reaches them. Checked at dawn and on service
     * connect; silently skipped if notifications weren't allowed.
     */
    fun postIfDue(ctx: Context) {
        if (!due(ctx) || answered(ctx)) return
        if (Gray.prefs(ctx).getBoolean("letter_notified", false)) return
        if (post(ctx)) {
            Gray.prefs(ctx).edit().putBoolean("letter_notified", true).apply()
        }
    }

    /** Posts the letter notification unconditionally (debug + due path). */
    fun post(ctx: Context): Boolean {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (!nm.areNotificationsEnabled()) return false

        nm.createNotificationChannel(
            NotificationChannel(CHANNEL, "a letter", NotificationManager.IMPORTANCE_DEFAULT)
        )
        val open = PendingIntent.getActivity(
            ctx, 4, Intent(ctx, LetterActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val dawns = TimeUnit.MILLISECONDS.toDays(
            System.currentTimeMillis() - installTime(ctx)
        )
        val note = NotificationCompat.Builder(ctx, CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("$dawns gray dawns in...")
            .setContentText("how's using graydawn going? i'm curious")
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        return runCatching { nm.notify(4, note) }.isSuccess
    }

    // ---- usage comparison --------------------------------------------------

    fun hasUsageAccess(ctx: Context): Boolean {
        val ops = ctx.getSystemService(Context.APP_OPS_SERVICE)
            as android.app.AppOpsManager
        val mode = if (android.os.Build.VERSION.SDK_INT >= 29) {
            ops.unsafeCheckOpNoThrow(
                android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(), ctx.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            ops.checkOpNoThrow(
                android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(), ctx.packageName
            )
        }
        return mode == android.app.AppOpsManager.MODE_ALLOWED
    }

    data class AppWeeks(val label: String, val before: List<Long>, val after: List<Long>)

    /**
     * Weekly buckets, up to ~4 weeks back (all Android keeps at weekly
     * granularity). Each value is that app's min/day for one full week;
     * the week straddling install day is dropped so the sides compare
     * honestly. Lists run oldest → newest.
     */
    fun compare(ctx: Context): List<AppWeeks> {
        val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val install = installTime(ctx)
        val now = System.currentTimeMillis()
        val begin = install - TimeUnit.DAYS.toMillis(30)

        val buckets = usm.queryUsageStats(UsageStatsManager.INTERVAL_WEEKLY, begin, now)
            ?: return emptyList()

        // weekStart(epoch-day) -> pkg -> min/day in that week
        data class Week(val start: Long, val days: Double, val perApp: HashMap<String, Long>)
        val weeks = HashMap<Long, Week>()
        for (b in buckets) {
            if (b.totalTimeInForeground <= 0L) continue
            if (b.firstTimeStamp < install && b.lastTimeStamp > install) continue // straddle
            val key = b.firstTimeStamp / 86_400_000L
            val days = ((b.lastTimeStamp - b.firstTimeStamp) / 86_400_000.0)
                .coerceAtLeast(1.0)
            val w = weeks.getOrPut(key) { Week(b.firstTimeStamp, days, HashMap()) }
            w.perApp.merge(
                b.packageName, (b.totalTimeInForeground / 60_000.0 / days).toLong(), Long::plus
            )
        }

        val ordered = weeks.values.sortedBy { it.start }
        val beforeWeeks = ordered.filter { it.start < install }
        val afterWeeks = ordered.filter { it.start >= install }

        val pm = ctx.packageManager
        fun launchable(pkg: String): Boolean =
            pm.getLaunchIntentForPackage(pkg) != null && pkg != ctx.packageName
        fun label(pkg: String): String = runCatching {
            pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString().lowercase()
        }.getOrDefault(pkg.substringAfterLast('.'))

        return ordered.flatMap { it.perApp.keys }.distinct()
            .filter(::launchable)
            .map { pkg ->
                AppWeeks(
                    label(pkg),
                    beforeWeeks.map { it.perApp[pkg] ?: 0L },
                    afterWeeks.map { it.perApp[pkg] ?: 0L }
                )
            }
            .filter { (it.before + it.after).any { v -> v >= 5 } }
            .sortedByDescending { (it.before + it.after).maxOrNull() ?: 0L }
            .take(8)
    }

    /**
     * Day totals from Android's daily buckets — the resolution that lets
     * settings changes line up against use. Android only keeps daily
     * granularity for about a week, so this covers the recent stretch;
     * the weekly table carries the longer arc.
     */
    fun dailyTotals(ctx: Context): List<Pair<Long, Long>> {
        if (!hasUsageAccess(ctx)) return emptyList()
        val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val install = installTime(ctx)
        val now = System.currentTimeMillis()
        val buckets = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY, now - TimeUnit.DAYS.toMillis(10), now
        ) ?: return emptyList()
        val pm = ctx.packageManager
        fun launchable(pkg: String): Boolean =
            pm.getLaunchIntentForPackage(pkg) != null && pkg != ctx.packageName
        val perDay = HashMap<Long, Long>()
        for (b in buckets) {
            if (b.totalTimeInForeground <= 0L || !launchable(b.packageName)) continue
            val day = (b.firstTimeStamp - install) / 86_400_000L
            perDay.merge(day, b.totalTimeInForeground / 60_000L, Long::plus)
        }
        // Day 1 = graydawn's first full day; drop anything pre-install.
        return perDay.entries.filter { it.key >= 0 }.sortedBy { it.key }
            .map { (it.key + 1) to it.value }
    }

    /** lines == null means the person chose not to attach numbers. */
    fun compose(ctx: Context, lines: List<AppWeeks>?, note: String): String {
        val days = TimeUnit.MILLISECONDS.toDays(
            System.currentTimeMillis() - installTime(ctx)
        )
        val install = installTime(ctx)
        val sb = StringBuilder()
        sb.append("hi brian —\n\n")
        sb.append("this phone has had graydawn for $days days.\n")
        // The one setting worth reporting: where they put the slider is
        // the only measurement of where the right default actually is.
        val length = Gray.lengthLabel(Gray.saturationMinutes(ctx))
        val touched = if (Gray.minutesTouched(ctx)) "their own choice" else "the default, never moved"
        sb.append("the hold is set to $length ($touched).\n\n")
        // Settings along the way — the journal, rendered by day. Rides
        // only with the data offering: they said yes to numbers, this is
        // a number-shaped thing.
        val changes = if (lines != null) Gray.journal(ctx) else emptyList()
        if (changes.isNotEmpty()) {
            sb.append("settings along the way (day 1 = graydawn's first):\n")
            for ((ts, what) in changes) {
                // Clamped: a clock set backwards shouldn't invent day -3.
                val day = (((ts - install) / 86_400_000L) + 1).coerceAtLeast(1)
                val words = what.split(' ')
                val line = when (words.getOrNull(0)) {
                    "hold" -> "the hold → ${
                        Gray.lengthLabel(words.getOrNull(1)?.toIntOrNull() ?: continue)
                    }"
                    "dawn" -> "gray every dawn → ${words.getOrNull(1)}"
                    "camera" -> "camera keeps color → ${words.getOrNull(1)}"
                    else -> what
                }
                sb.append("  day $day: $line\n")
            }
            sb.append("\n")
        }
        if (lines != null) {
            val daily = dailyTotals(ctx)
            if (daily.isNotEmpty()) {
                sb.append("screen time per day, the recent stretch ")
                sb.append("(android only keeps day-resolution for about a week):\n")
                sb.append("  ")
                sb.append(daily.joinToString(" · ") { "day ${it.first}: ${it.second} min" })
                sb.append("\n\n")
            }
        }
        if (lines != null) {
            sb.append("screen time per day, week by week ")
            sb.append("(the → is when graydawn arrived):\n\n")
            if (lines.isEmpty()) {
                sb.append("  (not enough full weeks to compare yet)\n")
            } else {
                for (l in lines) {
                    val before = if (l.before.isEmpty()) "(no data)"
                        else l.before.joinToString(", ") + " min/day"
                    val after = if (l.after.isEmpty()) "(no full week yet)"
                        else l.after.joinToString(", ") + " min/day"
                    sb.append("  ${l.label} — $before → $after\n")
                }
            }
            sb.append("\nthe week it arrived straddles the line, so it's left out. ")
            sb.append("rough numbers from one phone, not a study.\n\n")
        }
        sb.append("from the person:\n")
        sb.append(if (note.isBlank()) "  (they left it blank)" else "  $note")
        sb.append("\n")
        return sb.toString()
    }

    private const val SUBJECT = "a graydawn letter"

    /**
     * Prefilled email to Brian. Gmail ignores EXTRA_TEXT on mailto
     * intents, so subject and body ride inside the URI, URL-encoded.
     * Returns false if no mail app answers.
     */
    fun sendEmail(ctx: Context, body: String): Boolean {
        val uri = "mailto:$ADDRESS" +
            "?subject=${android.net.Uri.encode(SUBJECT)}" +
            "&body=${android.net.Uri.encode(body)}"
        val mailto = Intent(Intent.ACTION_SENDTO).apply {
            data = android.net.Uri.parse(uri)
            putExtra(Intent.EXTRA_SUBJECT, SUBJECT)
            putExtra(Intent.EXTRA_TEXT, body)
        }
        return runCatching {
            if (mailto.resolveActivity(ctx.packageManager) != null) {
                ctx.startActivity(mailto); true
            } else false
        }.getOrDefault(false)
    }

    /** Any-app share sheet — their messenger, their notes, their call. */
    fun sendShare(ctx: Context, body: String) {
        val share = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, SUBJECT)
            putExtra(Intent.EXTRA_TEXT, "to: $ADDRESS\n\n$body")
        }
        runCatching { ctx.startActivity(Intent.createChooser(share, "send the letter")) }
    }
}
