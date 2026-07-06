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
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (!nm.areNotificationsEnabled()) return

        nm.createNotificationChannel(
            NotificationChannel(CHANNEL, "a letter", NotificationManager.IMPORTANCE_DEFAULT)
        )
        val open = PendingIntent.getActivity(
            ctx, 4, Intent(ctx, LetterActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val note = NotificationCompat.Builder(ctx, CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("a letter from graydawn")
            .setContentText("the maker wonders whether it's changed anything — want to help?")
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        runCatching { nm.notify(4, note) }
        Gray.prefs(ctx).edit().putBoolean("letter_notified", true).apply()
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

    data class AppLine(val label: String, val beforeMinPerDay: Long, val afterMinPerDay: Long)

    /**
     * Weekly buckets, ~2 weeks either side of the install. The bucket
     * that straddles install day is dropped from both sides so the
     * comparison is honest full-weeks vs full-weeks.
     */
    fun compare(ctx: Context): List<AppLine> {
        val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val install = installTime(ctx)
        val now = System.currentTimeMillis()
        val begin = install - TimeUnit.DAYS.toMillis(16)

        val buckets = usm.queryUsageStats(UsageStatsManager.INTERVAL_WEEKLY, begin, now)
            ?: return emptyList()

        val beforeMs = HashMap<String, Long>()
        val afterMs = HashMap<String, Long>()
        var beforeSpanMs = 0L
        var afterSpanMs = 0L
        val beforeSpans = HashSet<Long>()
        val afterSpans = HashSet<Long>()

        for (b in buckets) {
            val side = when {
                b.lastTimeStamp <= install -> beforeMs
                b.firstTimeStamp >= install -> afterMs
                else -> continue // straddles the install; drop it
            }
            if (b.totalTimeInForeground <= 0L) continue
            side.merge(b.packageName, b.totalTimeInForeground, Long::plus)
            // Count each bucket window once per side (keyed by start time).
            if (side === beforeMs) {
                if (beforeSpans.add(b.firstTimeStamp)) {
                    beforeSpanMs += b.lastTimeStamp - b.firstTimeStamp
                }
            } else {
                if (afterSpans.add(b.firstTimeStamp)) {
                    afterSpanMs += b.lastTimeStamp - b.firstTimeStamp
                }
            }
        }

        val beforeDays = (beforeSpanMs / 86_400_000.0).coerceAtLeast(1.0)
        val afterDays = (afterSpanMs / 86_400_000.0).coerceAtLeast(1.0)

        val pm = ctx.packageManager
        fun launchable(pkg: String): Boolean =
            pm.getLaunchIntentForPackage(pkg) != null && pkg != ctx.packageName
        fun label(pkg: String): String = runCatching {
            pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString().lowercase()
        }.getOrDefault(pkg.substringAfterLast('.'))

        return (beforeMs.keys + afterMs.keys)
            .filter(::launchable)
            .map { pkg ->
                AppLine(
                    label(pkg),
                    ((beforeMs[pkg] ?: 0L) / 60_000.0 / beforeDays).toLong(),
                    ((afterMs[pkg] ?: 0L) / 60_000.0 / afterDays).toLong()
                )
            }
            .filter { it.beforeMinPerDay >= 5 || it.afterMinPerDay >= 5 }
            .sortedByDescending { maxOf(it.beforeMinPerDay, it.afterMinPerDay) }
            .take(8)
    }

    fun compose(ctx: Context, lines: List<AppLine>, note: String): String {
        val days = TimeUnit.MILLISECONDS.toDays(
            System.currentTimeMillis() - installTime(ctx)
        )
        val sb = StringBuilder()
        sb.append("hi brian —\n\n")
        sb.append("this phone has had graydawn for $days days. ")
        sb.append("here's what its own usage counter says, screen time per day, ")
        sb.append("the weeks before the gray vs the weeks after:\n\n")
        if (lines.isEmpty()) {
            sb.append("  (the phone wouldn't share its numbers — usage access ")
            sb.append("may have been declined. that's fine; the note below still counts.)\n")
        } else {
            for (l in lines) {
                sb.append("  ${l.label} — ${l.beforeMinPerDay} min/day before, ")
                sb.append("${l.afterMinPerDay} after\n")
            }
        }
        sb.append("\nthe week the app arrived straddles the line, so it's left out ")
        sb.append("of both sides. rough numbers from one phone, not a study.\n\n")
        sb.append("from the person:\n")
        sb.append(if (note.isBlank()) "  (they left it blank)" else "  $note")
        sb.append("\n\n(written on this phone by graydawn, which has no internet — ")
        sb.append("it only left because someone tapped send.)\n")
        return sb.toString()
    }

    /** mailto first (prefilled recipient); plain share sheet as fallback. */
    fun send(ctx: Context, body: String) {
        val subject = "a graydawn letter"
        val mailto = Intent(Intent.ACTION_SENDTO).apply {
            data = android.net.Uri.parse("mailto:$ADDRESS")
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, body)
        }
        val ok = runCatching {
            if (mailto.resolveActivity(ctx.packageManager) != null) {
                ctx.startActivity(mailto); true
            } else false
        }.getOrDefault(false)
        if (!ok) {
            val share = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, subject)
                putExtra(Intent.EXTRA_TEXT, "to: $ADDRESS\n\n$body")
            }
            runCatching { ctx.startActivity(Intent.createChooser(share, "send the letter")) }
        }
    }
}
