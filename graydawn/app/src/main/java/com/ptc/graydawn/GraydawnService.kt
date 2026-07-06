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
        private const val HOLD_MS = 400L
        const val DEBUG_ACTION = "com.ptc.graydawn.DEBUG_BORROW"
    }

    private val handler = Handler(Looper.getMainLooper())
    private var upDown = false
    private var downDown = false
    private var fired = false

    private val holdCheck = Runnable {
        if (upDown && downDown && !fired) {
            fired = true
            Gray.borrow(this)
            armWatchdog()
        }
    }

    // Belt-and-suspenders behind the alarm: while a borrow is live, a slow
    // tick (and every screen-on) checks whether it has run out.
    private val watchdog = object : Runnable {
        override fun run() {
            if (Gray.borrowUntil(this@GraydawnService) == 0L) return
            Gray.regrayIfDue(this@GraydawnService)
            handler.postDelayed(this, 20_000L)
        }
    }

    private fun armWatchdog() {
        handler.removeCallbacks(watchdog)
        handler.postDelayed(watchdog, 20_000L)
    }

    private val screenOnReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            Gray.regrayIfDue(this@GraydawnService)
        }
    }

    private val debugReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            Gray.borrow(this@GraydawnService)
            armWatchdog()
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(
                debugReceiver, IntentFilter(DEBUG_ACTION), Context.RECEIVER_EXPORTED
            )
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(debugReceiver, IntentFilter(DEBUG_ACTION))
        }
        registerReceiver(screenOnReceiver, IntentFilter(Intent.ACTION_SCREEN_ON))
        // If the dawn schedule is on, make sure the alarm exists.
        if (Gray.dawnEnabled(this)) Gray.scheduleDawn(this)
        // A borrow may have been live when the service restarted.
        if (Gray.borrowUntil(this) != 0L && !Gray.regrayIfDue(this)) armWatchdog()
    }

    override fun onDestroy() {
        runCatching { unregisterReceiver(debugReceiver) }
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
                if (isUp) upDown = true
                if (isDown) downDown = true
                if (upDown && downDown) {
                    // Both held: candidate chord. Consume; decide after the hold window.
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
                    fired = false
                    if (consumed) return true
                }
            }
        }
        // While the other key is held, swallow volume changes so the chord
        // doesn't blast the volume; single presses pass through untouched.
        return upDown && downDown
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}
}
