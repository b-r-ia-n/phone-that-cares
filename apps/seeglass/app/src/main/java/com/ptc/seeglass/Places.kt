package com.ptc.seeglass

import android.content.Context
import android.content.SharedPreferences

data class Trim(val id: String, val label: String, val css: String)

data class Place(
    val id: String,
    val name: String,
    val url: String,
    // CSS selector for feed items (spacing dilation). Empty = skip spacing.
    val itemSelector: String,
    val experimental: Boolean = false,
    // Use the Chrome-spoof UA. False = truthful default WebView UA
    // (x.com's bot check dislikes a UA that contradicts client hints).
    val spoofUa: Boolean = true,
    val trims: List<Trim> = emptyList()
)

object Places {
    val ALL = listOf(
        Place(
            id = "x", name = "X", url = "https://x.com/home",
            itemSelector = "[data-testid=\"cellInnerDiv\"]",
            spoofUa = false
        ),
        Place(
            id = "youtube", name = "YouTube", url = "https://m.youtube.com/",
            itemSelector = "ytm-rich-item-renderer, ytm-video-with-context-renderer",
            trims = listOf(
                Trim(
                    "shorts", "hide the Shorts shelf",
                    "ytm-reel-shelf-renderer, ytm-rich-section-renderer { display: none !important; }"
                )
            )
        ),
        Place(
            id = "reddit", name = "Reddit", url = "https://www.reddit.com/",
            itemSelector = "shreddit-post, article"
        ),
        Place(
            id = "instagram", name = "Instagram", url = "https://www.instagram.com/",
            itemSelector = "article",
            trims = listOf(
                Trim(
                    "explore", "hide Explore",
                    "a[href=\"/explore/\"] { display: none !important; }"
                )
            )
        ),
        Place(
            id = "facebook", name = "Facebook", url = "https://m.facebook.com/",
            itemSelector = "[role=\"article\"], article"
        ),
        Place(
            id = "substack", name = "Substack", url = "https://substack.com/home",
            itemSelector = "article, [class*=\"reader2-post\"]"
        ),
        Place(
            id = "linkedin", name = "LinkedIn", url = "https://www.linkedin.com/feed/",
            itemSelector = "[data-id^=\"urn:li:activity\"], .feed-shared-update-v2"
        ),
        Place(
            id = "tiktok", name = "TikTok", url = "https://www.tiktok.com/",
            itemSelector = "",
            experimental = true
        ),
    )

    fun byId(id: String): Place = ALL.first { it.id == id }
}

object Prefs {
    private fun p(ctx: Context): SharedPreferences =
        ctx.getSharedPreferences("seeglass", Context.MODE_PRIVATE)

    // ---- global ----

    fun defaultRampMinutes(ctx: Context): Int = p(ctx).getInt("ramp_minutes", 20)
    fun setDefaultRampMinutes(ctx: Context, v: Int) =
        p(ctx).edit().putInt("ramp_minutes", v).apply()

    fun demoMode(ctx: Context): Boolean = p(ctx).getBoolean("demo_mode", false)
    fun setDemoMode(ctx: Context, v: Boolean) =
        p(ctx).edit().putBoolean("demo_mode", v).apply()

    // ---- the mast ----

    fun mastUntil(ctx: Context): Long = p(ctx).getLong("mast_until", 0L)
    fun isMasted(ctx: Context): Boolean = System.currentTimeMillis() < mastUntil(ctx)
    fun tieToMast(ctx: Context, untilMillis: Long) =
        p(ctx).edit().putLong("mast_until", untilMillis).apply()

    // ---- per place ----

    /** Ramp minutes for a place: 0 = no ramp; defaults to the global setting. */
    fun rampMinutes(ctx: Context, placeId: String): Int =
        p(ctx).getInt("ramp_$placeId", defaultRampMinutes(ctx))

    fun setRampMinutes(ctx: Context, placeId: String, v: Int) =
        p(ctx).edit().putInt("ramp_$placeId", v).apply()

    fun breakCards(ctx: Context, placeId: String): Boolean =
        p(ctx).getBoolean("breaks_$placeId", true)

    fun setBreakCards(ctx: Context, placeId: String, v: Boolean) =
        p(ctx).edit().putBoolean("breaks_$placeId", v).apply()

    fun trimEnabled(ctx: Context, placeId: String, trimId: String): Boolean =
        p(ctx).getBoolean("trim_${placeId}_$trimId", false)

    fun setTrimEnabled(ctx: Context, placeId: String, trimId: String, v: Boolean) =
        p(ctx).edit().putBoolean("trim_${placeId}_$trimId", v).apply()

    fun archived(ctx: Context, placeId: String): Boolean =
        p(ctx).getBoolean("arch_$placeId", false)

    fun setArchived(ctx: Context, placeId: String, v: Boolean) =
        p(ctx).edit().putBoolean("arch_$placeId", v).apply()

    // ---- session state ----

    fun sessionActiveMillis(ctx: Context, placeId: String): Long =
        p(ctx).getLong("sess_active_$placeId", 0L)

    fun sessionLastSeen(ctx: Context, placeId: String): Long =
        p(ctx).getLong("sess_seen_$placeId", 0L)

    fun saveSession(ctx: Context, placeId: String, activeMillis: Long, lastSeen: Long) {
        p(ctx).edit()
            .putLong("sess_active_$placeId", activeMillis)
            .putLong("sess_seen_$placeId", lastSeen)
            .apply()
    }
}

object Care {
    const val RESET_AFTER_AWAY_MILLIS = 30 * 60 * 1000L
    const val DEMO_MULTIPLIER = 20

    const val BREAK_FIRST_FRACTION = 0.4
    const val BREAK_INTERVAL_FRACTION = 0.3
    const val MAX_EXTRA_SPACE_PX = 56
    const val CONTRAST_FLOOR = 0.92
}
