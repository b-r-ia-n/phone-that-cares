package com.ptc.graydawn

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.SeekBar
import android.widget.Switch
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private fun dp(v: Int): Int =
        TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics
        ).toInt()

    private lateinit var statusLine: TextView
    private lateinit var firstTryCard: TextView
    private lateinit var letterCard: LinearLayout
    private lateinit var setupBox: LinearLayout
    private lateinit var saturationCaption: TextView
    private lateinit var grayNow: TextView

    private val handler = Handler(Looper.getMainLooper())
    private var justUntied = false
    private var firstTryDoneThisVisit = false

    private val inter get() = ResourcesCompat.getFont(this, R.font.inter)
    private val ink get() = ContextCompat.getColor(this, R.color.ink)
    private val inkSoft get() = ContextCompat.getColor(this, R.color.ink_soft)
    private val accent get() = ContextCompat.getColor(this, R.color.accent)
    private val hairline get() = ContextCompat.getColor(this, R.color.hairline)

    // The status line carries real minutes; tick it once a minute while
    // visible. The first-try card polls faster, only while it's showing.
    private val minuteTick = object : Runnable {
        override fun run() {
            refreshStatus()
            handler.postDelayed(this, 60_000L - System.currentTimeMillis() % 60_000L)
        }
    }
    private val firstTryPoll = object : Runnable {
        override fun run() {
            if (firstTryCard.visibility != View.VISIBLE || firstTryDone()) return
            if (Gray.saturationUntil(this@MainActivity) > System.currentTimeMillis()) {
                prefs().edit().putBoolean("first_try_done", true).apply()
                firstTryDoneThisVisit = true
                firstTryCard.text = "that's it. that's the whole trick."
                refreshStatus()
                return
            }
            handler.postDelayed(this, 500L)
        }
    }

    private fun prefs() = Gray.prefs(this)
    private fun firstTryDone() = prefs().getBoolean("first_try_done", false)

    private fun label(parent: LinearLayout, t: String) = parent.addView(
        TextView(this).apply {
            text = t; typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            setPadding(0, dp(20), 0, dp(4))
        }
    )

    private fun caption(parent: LinearLayout, t: String): TextView {
        val v = TextView(this).apply {
            text = t; typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTextIsSelectable(true)
            setPadding(0, 0, 0, dp(8))
        }
        parent.addView(v); return v
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(28), dp(64), dp(28), dp(40))
        }

        val titleRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        titleRow.addView(TextView(this).apply {
            text = "Graydawn"
            typeface = inter; setTypeface(typeface, Typeface.BOLD)
            setTextColor(ink); setTextSize(TypedValue.COMPLEX_UNIT_SP, 28f)
            letterSpacing = -0.02f
        }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        titleRow.addView(android.widget.ImageView(this).apply {
            setImageResource(R.drawable.ic_gear)
            // Generous padding keeps the tap target ~44dp while the glyph
            // itself stays small and quiet.
            setPadding(dp(11), dp(11), dp(9), dp(11))
            contentDescription = "settings"
            setOnClickListener {
                startActivity(Intent(this@MainActivity, SettingsActivity::class.java))
            }
        }, LinearLayout.LayoutParams(dp(40), dp(40)))
        root.addView(titleRow)
        root.addView(TextView(this).apply {
            text = "the day begins gray. holding both volume\nbuttons — a half-second — brings the\ncolor back for a while."
            typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setPadding(0, dp(6), 0, dp(20))
        })

        // The litmus chip: filled with saturated dawn color, so the
        // display's own transform is the status — vivid when the phone is
        // in color, gray when it's gray. It physically can't lie.
        val chipRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        chipRow.addView(View(this).apply {
            background = GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                intArrayOf(
                    Color.parseColor("#ff6b57"),
                    Color.parseColor("#ffc24b"),
                    Color.parseColor("#6bb6ff")
                )
            ).apply { cornerRadius = dp(12).toFloat() }
        }, LinearLayout.LayoutParams(dp(64), dp(24)).apply { rightMargin = dp(12) })
        statusLine = TextView(this).apply {
            typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            fontFeatureSettings = "tnum"
        }
        chipRow.addView(statusLine)
        root.addView(chipRow)

        // First-try card (once, when the key and listener are both live).
        firstTryCard = TextView(this).apply {
            typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setLineSpacing(0f, 1.25f)
            setPadding(dp(16), dp(14), dp(16), dp(14))
            background = GradientDrawable().apply {
                setStroke(dp(1), hairline)
                cornerRadius = dp(12).toFloat()
            }
            text = "try it once —\n" +
                "tap “go gray now” at the bottom. the chip\n" +
                "above will lose its color.\n" +
                "then hold both volume buttons — a full\n" +
                "half-second — until it buzzes."
            visibility = View.GONE
        }
        root.addView(firstTryCard, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = dp(20) })

        // Day-12 letter card.
        letterCard = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(14), dp(16), dp(14))
            background = GradientDrawable().apply {
                setStroke(dp(1), hairline)
                cornerRadius = dp(12).toFloat()
            }
            visibility = View.GONE
        }
        letterCard.addView(TextView(this).apply {
            text = "how's using graydawn going?\nbrian, who made it, is curious."
            typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setLineSpacing(0f, 1.25f)
            setOnClickListener {
                startActivity(Intent(this@MainActivity, LetterActivity::class.java))
            }
        })
        letterCard.addView(TextView(this).apply {
            text = "no thanks"
            typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setPadding(0, dp(8), 0, 0)
            setOnClickListener {
                Letter.markDeclined(this@MainActivity)
                refresh()
            }
        })
        root.addView(letterCard, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = dp(20) })

        // Setup area: full sections while anything needs a person's hand,
        // one quiet line once the machinery is healthy.
        setupBox = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        root.addView(setupBox)

        // Dawn schedule — label and switch share the row.
        val checkedStates = arrayOf(
            intArrayOf(android.R.attr.state_checked), intArrayOf()
        )
        val dawnRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(20), 0, dp(4))
        }
        dawnRow.addView(TextView(this).apply {
            text = "gray every dawn"
            typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
        }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        dawnRow.addView(Switch(this).apply {
            isChecked = Gray.dawnEnabled(this@MainActivity)
            thumbTintList = android.content.res.ColorStateList(
                checkedStates, intArrayOf(accent, Color.parseColor("#b8b0a4"))
            )
            trackTintList = android.content.res.ColorStateList(
                checkedStates, intArrayOf(Color.parseColor("#d9c4a8"), hairline)
            )
            setOnCheckedChangeListener { _, checked ->
                Gray.setDawnEnabled(this@MainActivity, checked)
                refreshStatus()
            }
        })
        root.addView(dawnRow)
        caption(root, "around 4:00 each morning, before anyone is awake")

        // The camera pass — label and switch share the row, like dawn.
        val cameraRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(20), 0, dp(4))
        }
        cameraRow.addView(TextView(this).apply {
            text = "the camera keeps its color"
            typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
        }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        cameraRow.addView(Switch(this).apply {
            isChecked = Gray.cameraKeepsColor(this@MainActivity)
            thumbTintList = android.content.res.ColorStateList(
                checkedStates, intArrayOf(accent, Color.parseColor("#b8b0a4"))
            )
            trackTintList = android.content.res.ColorStateList(
                checkedStates, intArrayOf(Color.parseColor("#d9c4a8"), hairline)
            )
            setOnCheckedChangeListener { _, checked ->
                Gray.setCameraKeepsColor(this@MainActivity, checked)
            }
        })
        root.addView(cameraRow)
        caption(root, "the gray lifts while the camera is open — photos were always in color anyway")

        // Saturation length.
        label(root, "the saturation")
        saturationCaption = caption(root, saturationText(Gray.saturationMinutes(this)))
        root.addView(SeekBar(this).apply {
            // 0..59 → 1..60 minutes, then four cliffs: 2h, 4h, 8h, until dawn.
            max = 63
            progress = minutesToSlider(Gray.saturationMinutes(this@MainActivity))
            progressTintList = android.content.res.ColorStateList.valueOf(accent)
            thumbTintList = android.content.res.ColorStateList.valueOf(accent)
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar?, p: Int, fromUser: Boolean) {
                    val minutes = sliderToMinutes(p)
                    Gray.setSaturationMinutes(this@MainActivity, minutes, byUser = fromUser)
                    saturationCaption.text = saturationText(minutes)
                }
                override fun onStartTrackingTouch(sb: SeekBar?) {}
                override fun onStopTrackingTouch(sb: SeekBar?) {}
            })
        })

        // Try it.
        grayNow = TextView(this).apply {
            typeface = inter; setTextColor(accent)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            setPadding(dp(16), dp(10), dp(16), dp(10))
            background = GradientDrawable().apply {
                setStroke(dp(1), hairline)
                cornerRadius = dp(10).toFloat()
            }
            setOnClickListener { onGrayNowTapped() }
        }
        root.addView(grayNow, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = dp(28); bottomMargin = dp(12) })

        setContentView(ScrollView(this).apply { addView(root) })
    }

    private fun onGrayNowTapped() {
        if (!Gray.hasPermission(this)) return
        if (Gray.isGray(this)) {
            Gray.setGray(this, false)
            refresh()
        } else {
            // Going gray by hand ends any live saturation — otherwise the
            // status line would keep promising color that's already gone.
            Gray.endSaturationEarly(this)
            val svc = GraydawnService.instance
            if (svc != null) {
                svc.splashThenGray()
                // The snap lands at the bloom's peak; refresh just after.
                handler.postDelayed({ refresh() }, 600L)
            } else {
                Gray.setGray(this, true)
                refresh()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        refresh()
        handler.post(minuteTick)
        maybeAskNotifications()
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(minuteTick)
        handler.removeCallbacks(firstTryPoll)
    }

    /** Notifications carry the day-12 letter; ask once, after setup is real. */
    private fun maybeAskNotifications() {
        if (android.os.Build.VERSION.SDK_INT < 33) return
        if (!Gray.hasPermission(this) || !isServiceEnabled()) return
        if (prefs().getBoolean("notifications_asked", false)) return
        if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") ==
            android.content.pm.PackageManager.PERMISSION_GRANTED
        ) return
        prefs().edit().putBoolean("notifications_asked", true).apply()
        requestPermissions(arrayOf("android.permission.POST_NOTIFICATIONS"), 1)
    }

    private fun refresh() {
        refreshSetup()
        refreshFirstTry()
        letterCard.visibility =
            if (Letter.due(this) && !Letter.answered(this)) View.VISIBLE else View.GONE
        refreshStatus()
    }

    private fun refreshFirstTry() {
        val ready = Gray.hasPermission(this) && isServiceEnabled()
        val show = ready && (!firstTryDone() || firstTryDoneThisVisit)
        firstTryCard.visibility = if (show) View.VISIBLE else View.GONE
        if (show && !firstTryDone()) {
            handler.removeCallbacks(firstTryPoll)
            handler.post(firstTryPoll)
        }
    }

    private fun refreshStatus() {
        val until = Gray.saturationUntil(this)
        val now = System.currentTimeMillis()
        grayNow.text = if (!Gray.hasPermission(this)) {
            "(needs the key above first)"
        } else if (Gray.isGray(this)) {
            "return color"
        } else {
            "go gray now"
        }
        statusLine.text = when {
            !Gray.hasPermission(this) || !isServiceEnabled() ->
                "asleep — needs the two permissions below."
            until == Gray.UNTIL_DAWN_MS ->
                "in color until dawn."
            until > now -> {
                val time = SimpleDateFormat("h:mm", Locale.US).format(Date(until))
                val left = ((until - now) / 60_000L).coerceAtLeast(1)
                val leftText = if (left >= 90) "${left / 60}h ${left % 60}m" else "$left min"
                "saturated until $time — $leftText left"
            }
            Gray.isGray(this) ->
                "gray now. the hold brings the color back."
            Gray.dawnEnabled(this) ->
                "in color. gray returns at dawn."
            else ->
                "in color. the dawn switch is off."
        }
    }

    /**
     * The main page only speaks up about problems: a missing permission
     * or a conflict that breaks the hold outright. When everything works
     * it says nothing at all — the plumbing lives in settings.
     */
    private fun refreshSetup() {
        setupBox.removeAllViews()
        val key = Gray.hasPermission(this)
        val enabled = isServiceEnabled()
        val running = enabled && GraydawnService.instance != null

        if (!key || !running) {
            label(setupBox, "permissions")
            if (!key) {
                caption(
                    setupBox,
                    "system settings access — not yet. have a friend with " +
                        "a laptop run this once:\n\n" +
                        "adb shell pm grant com.ptc.graydawn " +
                        "android.permission.WRITE_SECURE_SETTINGS"
                )
            }
            if (!running) {
                caption(
                    setupBox,
                    if (enabled) {
                        // Enabled in settings but the system never rebound
                        // it — happens after force-stop and battery killers.
                        "volume button listener — listed as on but not " +
                            "actually running. tap here, then flip Graydawn " +
                            "off and back on."
                    } else {
                        "volume button listener — off. tap here, then " +
                            "enable Graydawn under installed apps."
                    }
                ).setOnClickListener {
                    startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                }
            }
        }

        val blocking = Conflicts.collect(this) {
            justUntied = true
            refresh()
        }.filter { it.blocking }
        if (blocking.isNotEmpty() || justUntied) {
            label(setupBox, "a conflict")
            if (blocking.isEmpty() && justUntied) {
                caption(setupBox, "cleared — the hold is yours now.")
            }
            for (c in blocking) {
                setupBox.addView(TextView(this).apply {
                    text = c.text
                    typeface = inter
                    setTextColor(if (c.fix != null) accent else inkSoft)
                    setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                    setPadding(0, 0, 0, dp(8))
                    c.fix?.let { setOnClickListener { _ -> it() } }
                })
            }
        }
    }

    private fun isServiceEnabled(): Boolean {
        val enabled = Settings.Secure.getString(
            contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        return enabled.contains("$packageName/")
    }

    private fun saturationText(minutes: Int): String =
        if (minutes == Gray.UNTIL_DAWN)
            "each hold saturates the screen until dawn —\n" +
                "the gray returns tomorrow morning."
        else
            "each hold saturates the screen for ${Gray.lengthLabel(minutes)},\n" +
                "then the color drains back on its own."

    // The slider's shape: sixty one-minute steps, then four cliffs.
    private fun sliderToMinutes(p: Int): Int = when (p) {
        in 0..59 -> p + 1
        60 -> 120
        61 -> 240
        62 -> 480
        else -> Gray.UNTIL_DAWN
    }

    private fun minutesToSlider(minutes: Int): Int = when {
        minutes == Gray.UNTIL_DAWN -> 63
        minutes >= 480 -> 62
        minutes >= 240 -> 61
        minutes >= 120 -> 60
        else -> (minutes - 1).coerceIn(0, 59)
    }
}
