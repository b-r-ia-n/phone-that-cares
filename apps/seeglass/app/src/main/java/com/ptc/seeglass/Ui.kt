package com.ptc.seeglass

import android.app.Activity
import android.graphics.Typeface
import android.util.TypedValue
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat
import java.text.DateFormat
import java.util.Date

/** Tiny shared vocabulary for the quiet settings screens. */
class Ui(private val a: Activity, private val root: LinearLayout) {

    val inter = ResourcesCompat.getFont(a, R.font.inter)
    val ink = ContextCompat.getColor(a, R.color.ink)
    val inkSoft = ContextCompat.getColor(a, R.color.ink_soft)
    val accent = ContextCompat.getColor(a, R.color.accent)
    val hairline = ContextCompat.getColor(a, R.color.hairline)

    fun dp(v: Int): Int = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), a.resources.displayMetrics
    ).toInt()

    fun title(t: String) = root.addView(TextView(a).apply {
        text = t; typeface = inter; setTypeface(typeface, Typeface.BOLD)
        setTextColor(ink); setTextSize(TypedValue.COMPLEX_UNIT_SP, 24f)
        letterSpacing = -0.02f
        setPadding(0, 0, 0, dp(20))
    })

    fun label(t: String, topPad: Int = 24) = root.addView(TextView(a).apply {
        text = t; typeface = inter; setTextColor(ink)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
        setPadding(0, dp(topPad), 0, dp(4))
    })

    fun caption(t: String): TextView {
        val v = TextView(a).apply {
            text = t; typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setPadding(0, 0, 0, dp(8))
        }
        root.addView(v); return v
    }

    fun action(t: String, onClick: () -> Unit): TextView {
        val v = TextView(a).apply {
            text = t; typeface = inter; setTextColor(accent)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            setPadding(0, dp(14), 0, dp(14))
            setOnClickListener { onClick() }
        }
        root.addView(v); return v
    }

    companion object {
        fun mastText(until: Long): String =
            "lashed to the mast until " +
                DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT)
                    .format(Date(until)) + " — the knots hold"
    }
}
