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
    private lateinit var permStatus: TextView
    private lateinit var listenerStatus: TextView
    private lateinit var tanglesBox: LinearLayout
    private lateinit var saturationCaption: TextView
    private lateinit var grayNow: TextView

    private val handler = Handler(Looper.getMainLooper())
    private var justUntied = false
    private var firstTryDoneThisVisit = false

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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val inter = ResourcesCompat.getFont(this, R.font.inter)
        val ink = ContextCompat.getColor(this, R.color.ink)
        val inkSoft = ContextCompat.getColor(this, R.color.ink_soft)
        val accent = ContextCompat.getColor(this, R.color.accent)
        val hairline = ContextCompat.getColor(this, R.color.hairline)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(28), dp(64), dp(28), dp(40))
        }

        root.addView(TextView(this).apply {
            text = "Graydawn"
            typeface = inter; setTypeface(typeface, Typeface.BOLD)
            setTextColor(ink); setTextSize(TypedValue.COMPLEX_UNIT_SP, 28f)
            letterSpacing = -0.02f
        })
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
            text = "the maker of graydawn wonders whether\nit's changed anything — want to help?"
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

        fun label(t: String) = root.addView(TextView(this).apply {
            text = t; typeface = inter; setTextColor(ink)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            setPadding(0, dp(20), 0, dp(4))
        })
        fun caption(t: String): TextView {
            val v = TextView(this).apply {
                text = t; typeface = inter; setTextColor(inkSoft)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                setTextIsSelectable(true)
                setPadding(0, 0, 0, dp(8))
            }
            root.addView(v); return v
        }

        // 1. system permission
        label("the key")
        permStatus = caption("")

        // 2. accessibility listener
        label("the listener")
        listenerStatus = caption("")
        listenerStatus.setOnClickListener {
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }

        // 3. tangles: existing phone settings that would fight the hold
        label("the tangles")
        tanglesBox = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        root.addView(tanglesBox)

        // 4. dawn schedule
        label("gray every dawn")
        caption("around 4:00 each morning, before anyone is awake")
        val checkedStates = arrayOf(
            intArrayOf(android.R.attr.state_checked), intArrayOf()
        )
        root.addView(Switch(this).apply {
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

        // 5. saturation length
        label("the saturation")
        saturationCaption = caption(saturationText(Gray.saturationMinutes(this)))
        root.addView(SeekBar(this).apply {
            max = 11 // 5..60 in 5-min steps
            progress = (Gray.saturationMinutes(this@MainActivity) - 5) / 5
            progressTintList = android.content.res.ColorStateList.valueOf(accent)
            thumbTintList = android.content.res.ColorStateList.valueOf(accent)
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar?, p: Int, fromUser: Boolean) {
                    val minutes = 5 + p * 5
                    Gray.setSaturationMinutes(this@MainActivity, minutes)
                    saturationCaption.text = saturationText(minutes)
                }
                override fun onStartTrackingTouch(sb: SeekBar?) {}
                override fun onStopTrackingTouch(sb: SeekBar?) {}
            })
        })

        // 6. try it
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
                handler.postDelayed({ refresh() }, 450L)
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
        permStatus.text = if (Gray.hasPermission(this)) {
            "granted — graydawn can flip the phone's color switch"
        } else {
            "not yet — have a friend with a laptop run this once:\n\n" +
                "adb shell pm grant com.ptc.graydawn " +
                "android.permission.WRITE_SECURE_SETTINGS"
        }
        listenerStatus.text = if (isServiceEnabled()) {
            if (GraydawnService.instance == null) {
                // Enabled in settings but the system never rebound it —
                // happens after force-stop and OEM battery killers.
                "listed as on, but not actually running — tap here,\n" +
                    "then flip Graydawn off and back on"
            } else {
                "on — watching for both volume buttons held together"
            }
        } else {
            "not listening yet — tap here, then enable Graydawn\nunder installed apps"
        }
        refreshFirstTry()
        letterCard.visibility =
            if (Letter.due(this) && !Letter.answered(this)) View.VISIBLE else View.GONE
        refreshStatus()
        refreshTangles()
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
                "asleep — needs the key and the listener below."
            until > now -> {
                val time = SimpleDateFormat("h:mm", Locale.US).format(Date(until))
                val left = ((until - now) / 60_000L).coerceAtLeast(1)
                "saturated until $time — $left min left"
            }
            Gray.isGray(this) ->
                "gray now. the hold brings the color back."
            Gray.dawnEnabled(this) ->
                "in color. gray returns at dawn."
            else ->
                "in color. the dawn switch is off."
        }
    }

    /** Look for existing phone settings that would fight the hold. */
    private fun refreshTangles() {
        val inter = ResourcesCompat.getFont(this, R.font.inter)
        val inkSoft = ContextCompat.getColor(this, R.color.ink_soft)
        val accent = ContextCompat.getColor(this, R.color.accent)
        tanglesBox.removeAllViews()

        fun tangle(text: String, clickable: Boolean = false, onTap: (() -> Unit)? = null) {
            tanglesBox.addView(TextView(this).apply {
                this.text = text
                typeface = inter
                setTextColor(if (clickable) accent else inkSoft)
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                setPadding(0, 0, 0, dp(8))
                onTap?.let { setOnClickListener { _ -> it() } }
            })
        }

        var found = false

        // 1. The phone's own hold-both-volume-keys shortcut. It fires at the
        // system level, upstream of graydawn — if anything is bound there,
        // the hold belongs to it, not to us.
        val holdTarget = Settings.Secure.getString(
            contentResolver, "accessibility_shortcut_target_service"
        )?.trim().orEmpty()
        if (holdTarget.isNotEmpty()) {
            found = true
            val what = if (holdTarget.contains("daltonizer", ignoreCase = true)) {
                "color correction"
            } else {
                holdTarget.substringAfterLast('/').substringAfterLast('.')
                    .ifEmpty { "another shortcut" }
            }
            if (Gray.hasPermission(this)) {
                tangle(
                    "your phone already uses hold-both-buttons for $what — " +
                        "it catches the hold before graydawn can.\n" +
                        "tap here to untie it.",
                    clickable = true
                ) {
                    Settings.Secure.putString(
                        contentResolver, "accessibility_shortcut_target_service", ""
                    )
                    justUntied = true
                    refresh()
                }
            } else {
                tangle(
                    "your phone already uses hold-both-buttons for $what — " +
                        "it catches the hold before graydawn can. " +
                        "untie it in Settings → Accessibility → Shortcuts, " +
                        "or grant the key above and tap here."
                )
            }
        } else if (justUntied) {
            tangle("untied — the hold is yours now.")
        }

        // 2. Other accessibility services that might also watch the buttons.
        val others = (Settings.Secure.getString(
            contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: "")
            .split(':')
            .filter { it.isNotBlank() && !it.startsWith("$packageName/") }
            .mapNotNull { flat ->
                android.content.ComponentName.unflattenFromString(flat)?.packageName
            }
            .distinct()
            .map { pkg ->
                // Package-visibility rules usually hide other apps' labels
                // from us; the last segment of the package reads fine.
                runCatching {
                    packageManager.getApplicationLabel(
                        packageManager.getApplicationInfo(pkg, 0)
                    ).toString()
                }.getOrDefault(pkg.substringAfterLast('.'))
            }
        if (others.isNotEmpty()) {
            found = true
            tangle(
                "also listening: ${others.joinToString(", ")}. " +
                    "if one of these watches the volume buttons or toggles " +
                    "grayscale on its own, the two of you will fight — " +
                    "quiet any button rules there."
            )
        }

        // 3. OEM battery managers that put unopened apps to sleep —
        // graydawn is exactly an app you never reopen.
        when {
            android.os.Build.MANUFACTURER.equals("samsung", true) -> {
                found = true
                tangle(
                    "samsung phones put apps to sleep after a few days " +
                        "unopened, which would silence the dawn. in Settings " +
                        "→ Battery, set Graydawn to unrestricted and add it " +
                        "to “never sleeping apps.”"
                )
            }
            android.os.Build.MANUFACTURER.equals("motorola", true) -> {
                found = true
                tangle(
                    "motorola's battery care likes to stop quiet apps, " +
                        "which would silence the dawn. in Settings → Battery, " +
                        "set Graydawn to unrestricted."
                )
            }
        }

        if (!found && !justUntied) {
            tangle("no tangles — the hold is yours alone.")
        }
    }

    private fun isServiceEnabled(): Boolean {
        val enabled = Settings.Secure.getString(
            contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        return enabled.contains("$packageName/")
    }

    private fun saturationText(minutes: Int): String =
        "each hold saturates the screen for $minutes minutes,\n" +
            "then the color drains back on its own."
}
