package com.ptc.graydawn

import android.accessibilityservice.AccessibilityService
import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.PowerManager
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.view.animation.AccelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.widget.TextView
import androidx.core.content.res.ResourcesCompat

/**
 * The one place graydawn is allowed to be theatrical. Accessibility
 * services may draw TYPE_ACCESSIBILITY_OVERLAY windows with no extra
 * permission — the splash and the whisper both live there.
 */
object Overlays {

    private fun wm(svc: AccessibilityService): WindowManager =
        svc.getSystemService(Context.WINDOW_SERVICE) as WindowManager

    private fun interactive(svc: AccessibilityService): Boolean =
        (svc.getSystemService(Context.POWER_SERVICE) as PowerManager).isInteractive

    private fun params() = WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        PixelFormat.TRANSLUCENT
    )

    /**
     * The last splash: a bloom of dawn color rises over the screen while
     * it can still be seen in color; the daltonizer snaps at the peak;
     * the same bloom — the display now rendering it gray — drains away.
     * You watch the color leave the very pixels announcing it.
     *
     * onPeak runs exactly once, at full bloom. ~1s total, non-touchable.
     */
    fun splash(svc: AccessibilityService, onPeak: () -> Unit) {
        if (!interactive(svc)) { onPeak(); return }

        val bloom = View(svc).apply {
            background = GradientDrawable(
                GradientDrawable.Orientation.BL_TR,
                intArrayOf(
                    Color.parseColor("#ff6b57"), // coral
                    Color.parseColor("#ffc24b"), // gold
                    Color.parseColor("#6bb6ff")  // sky
                )
            ).apply { gradientType = GradientDrawable.LINEAR_GRADIENT }
            alpha = 0f
        }

        val windowManager = wm(svc)
        if (runCatching { windowManager.addView(bloom, params()) }.isFailure) {
            onPeak(); return
        }

        bloom.animate()
            .alpha(1f)
            .setDuration(300L)
            .setInterpolator(DecelerateInterpolator())
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(a: Animator) {
                    onPeak()
                    Gray.vibrate(svc, longArrayOf(0, 60))
                    // A held beat at the peak, then the drain.
                    bloom.animate()
                        .alpha(0f)
                        .setStartDelay(150L)
                        .setDuration(600L)
                        .setInterpolator(AccelerateInterpolator())
                        .setListener(object : AnimatorListenerAdapter() {
                            override fun onAnimationEnd(a: Animator) {
                                runCatching { windowManager.removeView(bloom) }
                            }
                        })
                        .start()
                }
            })
            .start()
    }

    /** A quiet line at the bottom of the screen, gone in about two seconds. */
    fun whisper(svc: AccessibilityService, text: String) {
        if (!interactive(svc)) return

        fun dp(v: Int): Int = TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), svc.resources.displayMetrics
        ).toInt()

        val pill = TextView(svc).apply {
            this.text = text
            typeface = ResourcesCompat.getFont(svc, R.font.inter) ?: Typeface.DEFAULT
            setTextColor(Color.parseColor("#f6f3ec"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setPadding(dp(18), dp(10), dp(18), dp(10))
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#e61a1714"))
                cornerRadius = dp(22).toFloat()
            }
            alpha = 0f
        }

        val lp = params().apply {
            width = WindowManager.LayoutParams.WRAP_CONTENT
            height = WindowManager.LayoutParams.WRAP_CONTENT
            gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            y = dp(96)
        }

        val windowManager = wm(svc)
        if (runCatching { windowManager.addView(pill, lp) }.isFailure) return

        pill.animate().alpha(1f).setDuration(150L).setListener(
            object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(a: Animator) {
                    pill.animate()
                        .alpha(0f)
                        .setStartDelay(1_300L)
                        .setDuration(350L)
                        .setListener(object : AnimatorListenerAdapter() {
                            override fun onAnimationEnd(a: Animator) {
                                runCatching { windowManager.removeView(pill) }
                            }
                        })
                        .start()
                }
            }
        ).start()
    }
}
