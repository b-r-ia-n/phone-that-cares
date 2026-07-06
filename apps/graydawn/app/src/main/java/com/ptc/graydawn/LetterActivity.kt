package com.ptc.graydawn

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.provider.Settings
import android.util.TypedValue
import android.view.Gravity
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat

/**
 * Brian's letter, two pages. MAIN: the ask and the two offerings — the
 * cold hard data and a little note, either or both — then the person
 * picks how it travels. ACCESS: one page that explains the usage-access
 * switch before asking for it. Nothing is read before they ask for the
 * numbers; nothing leaves before they choose to send.
 *
 * White background on purpose: Brian's drawing lives on white.
 */
class LetterActivity : AppCompatActivity() {

    private enum class Page { MAIN, ACCESS }

    private fun dp(v: Int): Int = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics
    ).toInt()

    private lateinit var root: LinearLayout
    private var page = Page.MAIN
    private var wantsData = false
    private var wantsNote = false
    private var noteText = ""
    private var cachedLines: List<Letter.AppWeeks>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(28), dp(24), dp(28), dp(40))
        }
        window.decorView.setBackgroundColor(Color.WHITE)
        window.statusBarColor = Color.WHITE
        setContentView(ScrollView(this).apply {
            setBackgroundColor(Color.WHITE)
            addView(root)
        })
    }

    override fun onResume() {
        super.onResume()
        // Coming back from settings with the switch flipped: continue.
        if (page == Page.ACCESS && Letter.hasUsageAccess(this)) page = Page.MAIN
        build()
    }

    // ---- shared pieces -----------------------------------------------------

    private val inter get() = ResourcesCompat.getFont(this, R.font.inter)
    private val ink get() = ContextCompat.getColor(this, R.color.ink)
    private val inkSoft get() = ContextCompat.getColor(this, R.color.ink_soft)
    private val accent get() = ContextCompat.getColor(this, R.color.accent)
    private val hairline get() = ContextCompat.getColor(this, R.color.hairline)

    private fun spacer(h: Int) = root.addView(
        android.view.View(this), LinearLayout.LayoutParams(1, dp(h))
    )

    private fun caption(t: String) = TextView(this).apply {
        text = t; typeface = inter; setTextColor(inkSoft)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
        setLineSpacing(0f, 1.35f)
    }.also { root.addView(it) }

    private fun button(t: String, onTap: () -> Unit) = TextView(this).apply {
        text = t; typeface = inter; setTextColor(accent)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
        setPadding(dp(16), dp(10), dp(16), dp(10))
        background = GradientDrawable().apply {
            setStroke(dp(1), hairline); cornerRadius = dp(10).toFloat()
        }
        setOnClickListener { onTap() }
    }

    private fun addButton(v: TextView, topMargin: Int = 12) {
        root.addView(v, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { this.topMargin = dp(topMargin) })
    }

    private fun backArrow(onTap: () -> Unit) {
        root.addView(TextView(this).apply {
            text = "←"
            typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
            setPadding(dp(4), dp(4), dp(16), dp(12))
            setOnClickListener { onTap() }
        })
    }

    private fun build() {
        root.removeAllViews()
        when (page) {
            Page.MAIN -> buildMain()
            Page.ACCESS -> buildAccess()
        }
    }

    // ---- page: the ask -----------------------------------------------------

    private fun buildMain() {
        // Back leads home — to the rest of the app, not to nowhere.
        backArrow {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }

        // Brian, waving. Centered, with room to breathe.
        root.addView(ImageView(this).apply {
            setImageResource(R.drawable.brian)
            adjustViewBounds = true
        }, LinearLayout.LayoutParams(dp(150), dp(150)).apply {
            gravity = Gravity.CENTER_HORIZONTAL
        })

        spacer(24)
        caption(
            "hey there! i'm brian, i made offscreen. i'm wondering whether " +
                "it works — whether it changed anything about the way you " +
                "use your phone."
        )
        spacer(14)
        caption("if you want to help me:")
        // Bullets sit tight under their lead-in — one paragraph, visually.
        fun bullet(t: String) {
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            row.addView(TextView(this).apply {
                text = "•"
                typeface = inter; setTextColor(inkSoft)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
                setPadding(dp(6), 0, dp(8), 0)
            })
            row.addView(TextView(this).apply {
                text = t
                typeface = inter; setTextColor(inkSoft)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
                setLineSpacing(0f, 1.3f)
            }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
            root.addView(row, LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(6) })
        }
        bullet(
            "the first button below will help you send me the cold hard " +
                "data on your screen time for the last four weeks"
        )
        bullet(
            "the second will let you write a little note with anything " +
                "you want to share"
        )
        spacer(14)
        caption(
            "feel free to do either or both — anything you want to share helps."
        )

        // Offering one: the data.
        val dataReady = wantsData && Letter.hasUsageAccess(this)
        if (!dataReady) {
            addButton(button("send the cold hard data") {
                wantsData = true
                if (Letter.hasUsageAccess(this)) build()
                else { page = Page.ACCESS; build() }
            }, topMargin = 24)
        }

        // Offering two: the note.
        val note: EditText? = if (wantsNote) {
            EditText(this).apply {
                hint = "how it felt, what broke, whether you kept it — anything."
                typeface = inter
                setTextColor(ink); setHintTextColor(inkSoft)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
                minLines = 3
                setText(noteText)
                setPadding(dp(14), dp(12), dp(14), dp(12))
                background = GradientDrawable().apply {
                    setStroke(dp(1), hairline); cornerRadius = dp(10).toFloat()
                }
            }
        } else {
            addButton(button("write a little note") {
                wantsNote = true
                build()
            })
            null
        }
        if (note != null) {
            spacer(16)
            root.addView(note)
        }

        // The letter itself, once there's anything to carry.
        if (!dataReady && !wantsNote) return

        if (dataReady && cachedLines == null) cachedLines = Letter.compare(this)
        val lines = if (dataReady) cachedLines else null

        spacer(20)
        root.addView(TextView(this).apply {
            text = "the letter, exactly as it will arrive:"
            typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setPadding(0, 0, 0, dp(6))
        })
        val preview = TextView(this).apply {
            typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTextIsSelectable(true)
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = GradientDrawable().apply {
                setStroke(dp(1), hairline); cornerRadius = dp(10).toFloat()
            }
            text = Letter.compose(this@LetterActivity, lines, noteText)
        }
        root.addView(preview)

        note?.addTextChangedListener(object : android.text.TextWatcher {
            override fun afterTextChanged(s: android.text.Editable?) {
                noteText = s?.toString() ?: ""
                preview.text = Letter.compose(this@LetterActivity, lines, noteText)
            }
            override fun beforeTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
            override fun onTextChanged(s: CharSequence?, a: Int, b: Int, c: Int) {}
        })

        // The last step is theirs: how it travels.
        spacer(20)
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        fun rowButton(t: String, onTap: () -> Unit) {
            row.addView(button(t) { onTap() }, LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { rightMargin = dp(10) })
        }
        rowButton("email it to brian") {
            Letter.markDone(this)
            if (!Letter.sendEmail(this, preview.text.toString())) {
                Letter.sendShare(this, preview.text.toString())
            }
        }
        rowButton("share it another way") {
            Letter.markDone(this)
            Letter.sendShare(this, preview.text.toString())
        }
        root.addView(row)
        // No "never mind" here — the back arrow is the way out, and
        // declining stays where it's explicit (the day-12 card's "no
        // thanks"). The access page keeps its never-mind: that's the one
        // place a person is mid-commitment and wants a clean exit.
    }

    // ---- page: the switch --------------------------------------------------

    private fun buildAccess() {
        backArrow { page = Page.MAIN; wantsData = false; build() }

        caption(
            "android keeps a screen-time counter on every phone — that's " +
                "where the cold hard data lives.\n\n" +
                "for offscreen to read it, you flip one switch: the screen " +
                "that opens next lists your apps; find Offscreen and allow " +
                "usage access.\n\n" +
                "offscreen reads only the per-app screen time that goes into " +
                "the letter, and you'll read the letter before anything is " +
                "sent. if that sounds okay:"
        )
        addButton(button("give offscreen usage access") {
            startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
        }, topMargin = 24)
        addButton(button("actually, never mind") {
            page = Page.MAIN; wantsData = false; build()
        })
    }
}
