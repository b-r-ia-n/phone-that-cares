package com.ptc.graydawn

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Dawn: the day begins gray. */
class DawnReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        Gray.setGray(ctx, true)
    }
}

/** A soft word before the color leaves. */
class WarnReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        Gray.vibrate(ctx, longArrayOf(0, 30, 120, 30, 120, 30))
    }
}

/** The borrow ends; the tide comes back in. */
class RegrayReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        Gray.prefs(ctx).edit().putLong("borrow_until", 0L).apply()
        Gray.setGray(ctx, true)
    }
}

/** Reboots keep the covenant. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED && Gray.dawnEnabled(ctx)) {
            Gray.scheduleDawn(ctx)
        }
    }
}
