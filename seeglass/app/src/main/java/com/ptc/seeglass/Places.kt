package com.ptc.seeglass

import android.content.Context
import android.content.SharedPreferences

data class Place(
    val id: String,
    val name: String,
    val url: String,
    // CSS selector for feed items (spacing dilation). Empty = skip spacing.
    val itemSelector: String,
    val experimental: Boolean = false,
    // Optional opt-in trim CSS (applied only when trims enabled in settings)
    val trimCss: String = ""
)

object Places {
    val ALL = listOf(
        Place(
            id = "x", name = "X", url = "https://x.com/home",
            itemSelector = "[data-testid=\"cellInnerDiv\"]"
        ),
        Place(
            id = "youtube", name = "YouTube", url = "https://m.youtube.com/",
            itemSelector = "ytm-rich-item-renderer, ytm-video-with-context-renderer",
            trimCss = "ytm-reel-shelf-renderer, ytm-rich-section-renderer { display: none !important; }"
        ),
        Place(
            id = "reddit", name = "Reddit", url = "https://www.reddit.com/",
            itemSelector = "shreddit-post, article"
        ),
        Place(
            id = "instagram", name = "Instagram", url = "https://www.instagram.com/",
            itemSelector = "article",
            trimCss = "a[href=\"/explore/\"] { display: none !important; }"
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

    // Ramp duration in minutes (global, per-place override possible later)
    fun rampMinutes(ctx: Context): Int = p(ctx).getInt("ramp_minutes", 20)
    fun setRampMinutes(ctx: Context, v: Int) = p(ctx).edit().putInt("ramp_minutes", v).apply()

    fun demoMode(ctx: Context): Boolean = p(ctx).getBoolean("demo_mode", false)
    fun setDemoMode(ctx: Context, v: Boolean) = p(ctx).edit().putBoolean("demo_mode", v).apply()

    fun trims(ctx: Context): Boolean = p(ctx).getBoolean("trims", false)
    fun setTrims(ctx: Context, v: Boolean) = p(ctx).edit().putBoolean("trims", v).apply()

    // Session state per place: accumulated active millis + last seen wall clock
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

    fun resetSession(ctx: Context, placeId: String) = saveSession(ctx, placeId, 0L, 0L)
}

object Care {
    // Time away after which a session resets
    const val RESET_AFTER_AWAY_MILLIS = 30 * 60 * 1000L

    const val DEMO_MULTIPLIER = 20

    // Break cards: first appearance and interval, as fractions of ramp duration.
    // At 20 min ramp: first ~8 min, then every ~6 min.
    const val BREAK_FIRST_FRACTION = 0.4
    const val BREAK_INTERVAL_FRACTION = 0.3

    // Spacing dilation ceiling in px
    const val MAX_EXTRA_SPACE_PX = 56

    // Contrast floor (1.0 -> this) across the ramp
    const val CONTRAST_FLOOR = 0.92
}
