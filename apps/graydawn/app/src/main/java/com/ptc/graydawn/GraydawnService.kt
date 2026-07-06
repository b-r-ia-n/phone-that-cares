package com.ptc.graydawn

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent

class GraydawnService : AccessibilityService() {

    companion object {
        // A full, felt half-second — 400ms read as "instant" in practice.
        private const val HOLD_MS = 550L
        const val DEBUG_ACTION = "com.ptc.graydawn.DEBUG_BORROW"
        const val DEBUG_SPLASH = "com.ptc.graydawn.DEBUG_SPLASH"
        const val DEBUG_LETTER = "com.ptc.graydawn.DEBUG_LETTER"
        const val DEBUG_DAWN = "com.ptc.graydawn.DEBUG_DAWN"

        /**
         * The activity and receivers run in this same process; a direct
         * handle is the simplest honest way for them to reach the
         * overlays. Null whenever the service isn't connected.
         */
        @Volatile
        var instance: GraydawnService? = null
            private set
    }

    private val handler = Handler(Looper.getMainLooper())
    private var upDown = false
    private var downDown = false
    private var fired = false
    private var candidate = false

    private val holdCheck = Runnable {
        if (upDown && downDown && !fired) {
            fired = true
            onHold()
        }
    }

    /**
     * The hold is a switch in both directions: gray brings color for a
     * while; holding again during the color lets it drain back now.
     * One continuous hold can only fire once (`fired` re-arms on release).
     */
    private fun onHold() {
        if (Gray.saturationUntil(this) > System.currentTimeMillis()) {
            Gray.endSaturationEarly(this)
            handler.removeCallbacks(watchdog)
            // One firm buzz — the double buzz means color; this is its echo.
            Gray.vibrate(this, longArrayOf(0, 40))
            splashThenGray()
        } else if (Gray.saturate(this)) {
            val minutes = Gray.saturationMinutes(this)
            whisper(
                if (minutes == Gray.UNTIL_DAWN) "color! yours until dawn."
                else "color! ${Gray.lengthLabel(minutes)} of it."
            )
            armWatchdog()
        }
    }

    // Belt-and-suspenders behind the alarm. No warning buzz before the
    // end — the drain announces itself; people notice on their own.
    private val watchdog = object : Runnable {
        override fun run() {
            val until = Gray.saturationUntil(this@GraydawnService)
            // Nothing to watch for until-dawn: dawn itself ends it.
            if (until == 0L || until == Gray.UNTIL_DAWN_MS) return
            val remaining = until - System.currentTimeMillis()
            if (remaining <= 0L) {
                if (Gray.regrayIfDue(this@GraydawnService)) whisper("gray again.")
                return
            }
            handler.postDelayed(this, minOf(20_000L, remaining).coerceAtLeast(250L))
        }
    }

    private fun armWatchdog() {
        handler.removeCallbacks(watchdog)
        handler.postDelayed(watchdog, 250L)
    }

    private val screenOnReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            Gray.regrayIfDue(this@GraydawnService)
            Gray.dawnCatchUpIfDue(this@GraydawnService)
        }
    }

    // Mirrors the chord exactly (including the end-early direction), so
    // the whole hold behavior is exercisable over adb. An optional
    // `--ei minutes N` extra sets the length first (-1 = until dawn).
    private val debugReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            val minutes = intent.getIntExtra("minutes", Int.MIN_VALUE)
            if (minutes != Int.MIN_VALUE) Gray.setSaturationMinutes(ctx, minutes)
            onHold()
        }
    }

    // Lands a dawn on demand — same code path as the real 4am broadcast.
    private val debugDawnReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            ctx.sendBroadcast(Intent(ctx, DawnReceiver::class.java))
        }
    }

    // Taste-testing hook: return color silently, then run the full
    // splash-to-gray ceremony a beat later.
    private val debugSplashReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            Gray.setGray(this@GraydawnService, false)
            handler.postDelayed({ splashThenGray() }, 700L)
        }
    }

    private val debugLetterReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            Letter.post(this@GraydawnService)
        }
    }

    /** The last splash, then gray. Falls back to a plain snap if drawing fails. */
    fun splashThenGray() {
        Overlays.splash(this) { Gray.setGray(this, true) }
    }

    fun whisper(text: String) {
        Overlays.whisper(this, text)
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(
                debugReceiver, IntentFilter(DEBUG_ACTION), Context.RECEIVER_EXPORTED
            )
            registerReceiver(
                debugSplashReceiver, IntentFilter(DEBUG_SPLASH), Context.RECEIVER_EXPORTED
            )
            registerReceiver(
                debugLetterReceiver, IntentFilter(DEBUG_LETTER), Context.RECEIVER_EXPORTED
            )
            registerReceiver(
                debugDawnReceiver, IntentFilter(DEBUG_DAWN), Context.RECEIVER_EXPORTED
            )
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(debugReceiver, IntentFilter(DEBUG_ACTION))
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(debugSplashReceiver, IntentFilter(DEBUG_SPLASH))
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(debugLetterReceiver, IntentFilter(DEBUG_LETTER))
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(debugDawnReceiver, IntentFilter(DEBUG_DAWN))
        }
        registerReceiver(screenOnReceiver, IntentFilter(Intent.ACTION_SCREEN_ON))
        // If the dawn schedule is on, make sure the alarm exists.
        if (Gray.dawnEnabled(this)) Gray.scheduleDawn(this)
        // A dawn may have slipped past while nothing was awake to land it.
        Gray.dawnCatchUpIfDue(this)
        // A saturation may have been live when the service restarted.
        if (Gray.saturationUntil(this) != 0L && !Gray.regrayIfDue(this)) armWatchdog()
        Letter.postIfDue(this)
    }

    override fun onDestroy() {
        instance = null
        runCatching { unregisterReceiver(debugReceiver) }
        runCatching { unregisterReceiver(debugSplashReceiver) }
        runCatching { unregisterReceiver(debugLetterReceiver) }
        runCatching { unregisterReceiver(debugDawnReceiver) }
        runCatching { unregisterReceiver(screenOnReceiver) }
        handler.removeCallbacks(watchdog)
        super.onDestroy()
    }

    override fun onKeyEvent(event: KeyEvent): Boolean {
        val isUp = event.keyCode == KeyEvent.KEYCODE_VOLUME_UP
        val isDown = event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN
        if (!isUp && !isDown) return false

        when (event.action) {
            KeyEvent.ACTION_DOWN -> {
                // Key repeats from a held button would keep resetting the
                // hold timer; only fresh presses count.
                if (event.repeatCount > 0) return upDown && downDown
                if (isUp) upDown = true
                if (isDown) downDown = true
                if (upDown && downDown) {
                    // Both held: candidate hold. Consume; decide after the window.
                    candidate = true
                    handler.removeCallbacks(holdCheck)
                    handler.postDelayed(holdCheck, HOLD_MS)
                    return true
                }
            }
            KeyEvent.ACTION_UP -> {
                if (isUp) upDown = false
                if (isDown) downDown = false
                if (!upDown && !downDown) {
                    handler.removeCallbacks(holdCheck)
                    val consumed = fired
                    // Near-miss: both buttons were down together but let go
                    // before the hold landed. One tiny tap — "almost; longer."
                    if (candidate && !fired) {
                        Gray.vibrate(this, longArrayOf(0, 25))
                    }
                    fired = false
                    candidate = false
                    if (consumed) return true
                }
            }
        }
        // While the other key is held, swallow volume changes so the hold
        // doesn't blast the volume; single presses pass through untouched.
        return upDown && downDown
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}
}
