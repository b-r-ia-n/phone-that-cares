package com.ptc.seeglass

import android.content.Intent
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat

class ShelfActivity : AppCompatActivity() {

    private fun dp(v: Int): Int =
        TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics
        ).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val inter = ResourcesCompat.getFont(this, R.font.inter)
        val ink = ContextCompat.getColor(this, R.color.ink)
        val inkSoft = ContextCompat.getColor(this, R.color.ink_soft)
        val hairline = ContextCompat.getColor(this, R.color.hairline)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(28), dp(64), dp(28), dp(40))
        }

        root.addView(TextView(this).apply {
            text = "Seeglass"
            typeface = inter
            setTypeface(typeface, Typeface.BOLD)
            setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 28f)
            letterSpacing = -0.02f
        })
        root.addView(TextView(this).apply {
            text = "your places, behind softer glass"
            typeface = inter
            setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setPadding(0, dp(6), 0, dp(28))
        })

        Places.ALL.forEach { place ->
            root.addView(View(this).apply {
                setBackgroundColor(hairline)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, 1
                )
            })
            root.addView(LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, dp(18), 0, dp(18))
                isClickable = true
                isFocusable = true
                setOnClickListener {
                    startActivity(
                        Intent(this@ShelfActivity, PlaceActivity::class.java)
                            .putExtra(PlaceActivity.EXTRA_PLACE_ID, place.id)
                    )
                }
                addView(TextView(this@ShelfActivity).apply {
                    text = place.name
                    typeface = inter
                    setTextColor(ink)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
                    layoutParams = LinearLayout.LayoutParams(
                        0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f
                    )
                })
                if (place.experimental) {
                    addView(TextView(this@ShelfActivity).apply {
                        text = "experimental"
                        typeface = inter
                        setTextColor(inkSoft)
                        setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
                    })
                } else {
                    addView(TextView(this@ShelfActivity).apply {
                        text = Uri.parse(place.url).host?.removePrefix("www.") ?: ""
                        typeface = inter
                        setTextColor(inkSoft)
                        setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
                    })
                }
            })
        }
        root.addView(View(this).apply {
            setBackgroundColor(hairline)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 1
            )
        })

        root.addView(TextView(this).apply {
            text = "settings"
            typeface = inter
            setTextColor(ContextCompat.getColor(this@ShelfActivity, R.color.accent))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setPadding(0, dp(28), 0, dp(12))
            setOnClickListener {
                startActivity(Intent(this@ShelfActivity, SettingsActivity::class.java))
            }
        })

        setContentView(ScrollView(this).apply { addView(root) })
    }
}
