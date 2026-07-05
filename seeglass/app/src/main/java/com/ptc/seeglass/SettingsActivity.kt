package com.ptc.seeglass

import android.graphics.Typeface
import android.os.Bundle
import android.util.TypedValue
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.SeekBar
import android.widget.Switch
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat

class SettingsActivity : AppCompatActivity() {

    private fun dp(v: Int): Int =
        TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics
        ).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val inter = ResourcesCompat.getFont(this, R.font.inter)
        val ink = ContextCompat.getColor(this, R.color.ink)
        val inkSoft = ContextCompat.getColor(this, R.color.ink_soft)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(28), dp(64), dp(28), dp(40))
        }

        fun title(t: String) = root.addView(TextView(this).apply {
            text = t
            typeface = inter
            setTypeface(typeface, Typeface.BOLD)
            setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
            setPadding(0, 0, 0, dp(24))
        })

        fun label(t: String, topPad: Int = 20) = root.addView(TextView(this).apply {
            text = t
            typeface = inter
            setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            setPadding(0, dp(topPad), 0, dp(4))
        })

        fun caption(t: String): TextView {
            val v = TextView(this).apply {
                text = t
                typeface = inter
                setTextColor(inkSoft)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                setPadding(0, 0, 0, dp(8))
            }
            root.addView(v)
            return v
        }

        title("Settings")

        // Ramp duration
        label("The ramp", 0)
        val rampCaption = caption(rampText(Prefs.rampMinutes(this)))
        root.addView(SeekBar(this).apply {
            max = 17 // 5..90 in 5-min steps
            progress = (Prefs.rampMinutes(this@SettingsActivity) - 5) / 5
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar?, p: Int, fromUser: Boolean) {
                    val minutes = 5 + p * 5
                    Prefs.setRampMinutes(this@SettingsActivity, minutes)
                    rampCaption.text = rampText(minutes)
                }
                override fun onStartTrackingTouch(sb: SeekBar?) {}
                override fun onStopTrackingTouch(sb: SeekBar?) {}
            })
        })

        // Demo mode
        label("Demo mode")
        caption("preview the whole ramp at 20× speed")
        root.addView(Switch(this).apply {
            isChecked = Prefs.demoMode(this@SettingsActivity)
            setOnCheckedChangeListener { _, checked ->
                Prefs.setDemoMode(this@SettingsActivity, checked)
            }
        })

        // Trims
        label("Trims")
        caption("optionally hide YouTube Shorts shelves and Instagram Explore.\noff by default — nothing is taken unless you ask.")
        root.addView(Switch(this).apply {
            isChecked = Prefs.trims(this@SettingsActivity)
            setOnCheckedChangeListener { _, checked ->
                Prefs.setTrims(this@SettingsActivity, checked)
            }
        })

        setContentView(ScrollView(this).apply { addView(root) })
    }

    private fun rampText(minutes: Int): String =
        "color drains over $minutes minutes of being there"
}
