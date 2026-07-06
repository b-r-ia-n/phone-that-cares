package com.ptc.graydawn

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Dawn: the day begins gray. A finite saturation is honored — the hold
 * got its minutes outright, so dawn waits for the snap-back alarm rather
 * than taking them back mid-scroll. An until-dawn saturation ends here;
 * that was its deal from the start.
 */
class DawnReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        Gray.markDawnDone(ctx)
        val until = Gray.saturationUntil(ctx)
        if (until == Gray.UNTIL_DAWN_MS) {
            Gray.endSaturationEarly(ctx)
        } else if (until > System.currentTimeMillis()) {
            return
        }
        Gray.setGray(ctx, true)
        Letter.postIfDue(ctx)
    }
}

/** The saturation drains back; the day is gray again. */
class RegrayReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        Gray.prefs(ctx).edit().putLong("borrow_until", 0L).apply()
        Gray.setGray(ctx, true)
        GraydawnService.instance?.whisper("gray again.")
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
