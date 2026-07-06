package com.ptc.seeglass

import android.os.Bundle
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.SeekBar
import android.widget.Switch
import androidx.appcompat.app.AppCompatActivity

class PlaceSettingsActivity : AppCompatActivity() {

    private lateinit var place: Place

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        place = Places.byId(intent.getStringExtra(PlaceActivity.EXTRA_PLACE_ID) ?: "x")

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }
        val ui = Ui(this, root)
        root.setPadding(ui.dp(28), ui.dp(64), ui.dp(28), ui.dp(40))
        val masted = Prefs.isMasted(this)

        ui.title(place.name)
        if (masted) ui.caption(Ui.mastText(Prefs.mastUntil(this)))

        // on the shelf
        ui.label("on the shelf", if (masted) 20 else 0)
        ui.caption("off = archived; it waits here, not on the shelf")
        root.addView(Switch(this).apply {
            isChecked = !Prefs.archived(this@PlaceSettingsActivity, place.id)
            isEnabled = !masted
            setOnCheckedChangeListener { _, checked ->
                Prefs.setArchived(this@PlaceSettingsActivity, place.id, !checked)
            }
        })

        // the ramp
        ui.label("the ramp")
        val rampNow = Prefs.rampMinutes(this, place.id)
        val rampCaption = ui.caption(rampText(rampNow))
        root.addView(SeekBar(this).apply {
            max = 18 // 0 = off, else 5*n minutes
            progress = if (rampNow <= 0) 0 else (rampNow / 5).coerceIn(1, 18)
            isEnabled = !masted
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar?, p: Int, fromUser: Boolean) {
                    if (!fromUser) return
                    val minutes = p * 5
                    Prefs.setRampMinutes(this@PlaceSettingsActivity, place.id, minutes)
                    rampCaption.text = rampText(minutes)
                }
                override fun onStartTrackingTouch(sb: SeekBar?) {}
                override fun onStopTrackingTouch(sb: SeekBar?) {}
            })
        })

        // break cards
        ui.label("break cards")
        ui.caption("small pauses that surface in the feed")
        root.addView(Switch(this).apply {
            isChecked = Prefs.breakCards(this@PlaceSettingsActivity, place.id)
            isEnabled = !masted
            setOnCheckedChangeListener { _, checked ->
                Prefs.setBreakCards(this@PlaceSettingsActivity, place.id, checked)
            }
        })

        // trims
        if (place.trims.isNotEmpty()) {
            ui.label("trims")
            ui.caption("nothing is taken unless you ask")
            place.trims.forEach { trim ->
                root.addView(Switch(this).apply {
                    text = trim.label
                    typeface = ui.inter
                    isChecked = Prefs.trimEnabled(
                        this@PlaceSettingsActivity, place.id, trim.id
                    )
                    isEnabled = !masted
                    setPadding(0, ui.dp(6), 0, ui.dp(6))
                    setOnCheckedChangeListener { _, checked ->
                        Prefs.setTrimEnabled(
                            this@PlaceSettingsActivity, place.id, trim.id, checked
                        )
                    }
                })
            }
        }

        setContentView(ScrollView(this).apply { addView(root) })
    }

    private fun rampText(minutes: Int): String =
        if (minutes <= 0) "no color ramp here"
        else "color drains over $minutes minutes of being there"
}
