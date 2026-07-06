package com.ptc.graydawn

import android.content.Intent
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.provider.Settings
import android.util.TypedValue
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat

/**
 * The letter, in three consents: opening this screen, granting usage
 * access, tapping send. Nothing is read before the second and nothing
 * leaves before the third.
 */
class LetterActivity : AppCompatActivity() {

    private fun dp(v: Int): Int = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics
    ).toInt()

    private lateinit var root: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(28), dp(64), dp(28), dp(40))
        }
        setContentView(ScrollView(this).apply { addView(root) })
    }

    override fun onResume() {
        super.onResume()
        build()
    }

    private fun build() {
        root.removeAllViews()
        val inter = ResourcesCompat.getFont(this, R.font.inter)
        val ink = ContextCompat.getColor(this, R.color.ink)
        val inkSoft = ContextCompat.getColor(this, R.color.ink_soft)
        val accent = ContextCompat.getColor(this, R.color.accent)
        val hairline = ContextCompat.getColor(this, R.color.hairline)

        fun text(t: String, size: Float, color: Int, bold: Boolean = false) =
            TextView(this).apply {
                text = t; typeface = inter
                if (bold) setTypeface(typeface, Typeface.BOLD)
                setTextColor(color); setTextSize(TypedValue.COMPLEX_UNIT_SP, size)
            }.also { root.addView(it) }

        fun action(t: String, onTap: () -> Unit) = TextView(this).apply {
            text = t; typeface = inter; setTextColor(accent)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            setPadding(dp(16), dp(10), dp(16), dp(10))
            background = GradientDrawable().apply {
                setStroke(dp(1), hairline); cornerRadius = dp(10).toFloat()
            }
            setOnClickListener { onTap() }
        }.also {
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(16) }
            root.addView(it, lp)
        }

        text("a letter", 24f, ink, bold = true)
        text(
            "graydawn was made by one person who wonders whether it changed " +
                "anything. this screen writes a short letter from this phone's " +
                "own screen-time counter — the weeks before the gray next to " +
                "the weeks after — plus anything you want to add.\n\n" +
                "graydawn has no internet. you read the letter first, and it " +
                "only goes if you send it.",
            14f, inkSoft
        ).setPadding(0, dp(10), 0, 0)

        if (!Letter.hasUsageAccess(this)) {
            text(
                "\nfor the numbers, the phone needs you to flip one switch — " +
                    "find Graydawn in the list and allow usage access. come " +
                    "straight back.",
                14f, inkSoft
            )
            action("open the usage access switch") {
                startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
            }
            action("write the letter without numbers") { showLetter(emptyList()) }
            return
        }
        showLetter(Letter.compare(this))
    }

    private fun showLetter(lines: List<Letter.AppLine>) {
        val inter = ResourcesCompat.getFont(this, R.font.inter)
        val ink = ContextCompat.getColor(this, R.color.ink)
        val inkSoft = ContextCompat.getColor(this, R.color.ink_soft)
        val accent = ContextCompat.getColor(this, R.color.accent)
        val hairline = ContextCompat.getColor(this, R.color.hairline)

        val note = EditText(this).apply {
            hint = "anything you'd tell the maker — how it felt, what broke, " +
                "whether you kept it. optional."
            typeface = inter
            setTextColor(ink); setHintTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            minLines = 3
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = GradientDrawable().apply {
                setStroke(dp(1), hairline); cornerRadius = dp(10).toFloat()
            }
        }

        val preview = TextView(this).apply {
            typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTextIsSelectable(true)
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = GradientDrawable().apply {
                setStroke(dp(1), hairline); cornerRadius = dp(10).toFloat()
            }
            text = Letter.compose(this@LetterActivity, lines, "")
        }

        note.addTextChangedListener(object : android.text.TextWatcher {
            override fun afterTextChanged(s: android.text.Editable?) {
                preview.text =
                    Letter.compose(this@LetterActivity, lines, s?.toString() ?: "")
            }
            override fun beforeTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
            override fun onTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
        })

        fun spacer(h: Int) = root.addView(
            android.view.View(this),
            LinearLayout.LayoutParams(1, dp(h))
        )

        spacer(20)
        root.addView(note)
        spacer(16)
        root.addView(TextView(this).apply {
            text = "the letter, exactly as it will arrive:"
            typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setPadding(0, 0, 0, dp(6))
        })
        root.addView(preview)

        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        fun button(t: String, onTap: () -> Unit) = TextView(this).apply {
            text = t; typeface = inter; setTextColor(accent)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            setPadding(dp(16), dp(10), dp(16), dp(10))
            background = GradientDrawable().apply {
                setStroke(dp(1), hairline); cornerRadius = dp(10).toFloat()
            }
            setOnClickListener { onTap() }
        }.also {
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { rightMargin = dp(12) }
            row.addView(it, lp)
        }
        button("send it") {
            Letter.markDone(this)
            Letter.send(this, preview.text.toString())
        }
        button("never mind") {
            Letter.markDeclined(this)
            finish()
        }
        spacer(20)
        root.addView(row)
    }
}
