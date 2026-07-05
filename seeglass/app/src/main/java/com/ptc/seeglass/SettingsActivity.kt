package com.ptc.seeglass

import android.content.Intent
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.SeekBar
import android.widget.Switch
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import java.util.Calendar

class SettingsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        build()
    }

    override fun onResume() {
        super.onResume()
        build() // masted state or per-place edits may have changed
    }

    private fun build() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(64, 128, 64, 96)
        }
        val ui = Ui(this, root)
        root.setPadding(ui.dp(28), ui.dp(64), ui.dp(28), ui.dp(40))
        val masted = Prefs.isMasted(this)

        ui.title("Settings")

        if (masted) {
            ui.caption(Ui.mastText(Prefs.mastUntil(this)))
        }

        // default ramp
        ui.label("the ramp", if (masted) 20 else 0)
        val rampCaption = ui.caption(rampText(Prefs.defaultRampMinutes(this)))
        root.addView(SeekBar(this).apply {
            max = 17
            progress = (Prefs.defaultRampMinutes(this@SettingsActivity) - 5) / 5
            isEnabled = !masted
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar?, p: Int, fromUser: Boolean) {
                    if (!fromUser) return
                    val minutes = 5 + p * 5
                    Prefs.setDefaultRampMinutes(this@SettingsActivity, minutes)
                    rampCaption.text = rampText(minutes)
                }
                override fun onStartTrackingTouch(sb: SeekBar?) {}
                override fun onStopTrackingTouch(sb: SeekBar?) {}
            })
        })
        ui.caption("the default; each place can differ")

        // demo
        ui.label("demo mode")
        ui.caption("preview the whole ramp at 20× speed")
        root.addView(Switch(this).apply {
            isChecked = Prefs.demoMode(this@SettingsActivity)
            setOnCheckedChangeListener { _, checked ->
                Prefs.setDemoMode(this@SettingsActivity, checked)
            }
        })

        // places
        ui.label("places")
        ui.caption("each place has its own settings")
        Places.ALL.forEach { place ->
            root.addView(LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, ui.dp(12), 0, ui.dp(12))
                isClickable = true
                setOnClickListener {
                    startActivity(
                        Intent(this@SettingsActivity, PlaceSettingsActivity::class.java)
                            .putExtra(PlaceActivity.EXTRA_PLACE_ID, place.id)
                    )
                }
                addView(TextView(this@SettingsActivity).apply {
                    text = place.name
                    typeface = ui.inter; setTextColor(ui.ink)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
                    layoutParams = LinearLayout.LayoutParams(
                        0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f
                    )
                })
                addView(TextView(this@SettingsActivity).apply {
                    text = placeSummary(place)
                    typeface = ui.inter; setTextColor(ui.inkSoft)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
                })
            })
        }

        // the mast
        ui.label("the mast")
        if (masted) {
            ui.caption("your past self asked to be held to this.")
        } else {
            ui.caption("lock everything above, for a while. like Odysseus.")
            ui.action("tie yourself to the mast") { askMast() }
        }

        setContentView(ScrollView(this).apply { addView(root) })
    }

    private fun askMast() {
        val labels = arrayOf(
            "for an hour", "until morning", "for three days", "for a week"
        )
        AlertDialog.Builder(this)
            .setTitle("How long shall the knots hold?")
            .setItems(labels) { _, which ->
                val now = System.currentTimeMillis()
                val until = when (which) {
                    0 -> now + 3_600_000L
                    1 -> nextMorning()
                    2 -> now + 3 * 86_400_000L
                    else -> now + 7 * 86_400_000L
                }
                Prefs.tieToMast(this, until)
                build()
            }
            .setNegativeButton("not now", null)
            .show()
    }

    private fun nextMorning(): Long {
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 7)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) add(Calendar.DAY_OF_YEAR, 1)
        }
        return cal.timeInMillis
    }

    private fun placeSummary(place: Place): String {
        val bits = mutableListOf<String>()
        val ramp = Prefs.rampMinutes(this, place.id)
        bits += if (ramp > 0) "${ramp} min" else "no ramp"
        if (Prefs.breakCards(this, place.id)) bits += "cards"
        if (Prefs.archived(this, place.id)) bits += "archived"
        return bits.joinToString(" · ")
    }

    private fun rampText(minutes: Int): String =
        "color drains over $minutes minutes of being there"
}
