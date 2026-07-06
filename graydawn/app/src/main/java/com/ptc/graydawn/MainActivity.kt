package com.ptc.graydawn

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.provider.Settings
import android.util.TypedValue
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.SeekBar
import android.widget.Switch
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat

class MainActivity : AppCompatActivity() {

    private fun dp(v: Int): Int =
        TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics
        ).toInt()

    private lateinit var permStatus: TextView
    private lateinit var listenerStatus: TextView
    private lateinit var tanglesBox: LinearLayout
    private lateinit var grayNow: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val inter = ResourcesCompat.getFont(this, R.font.inter)
        val ink = ContextCompat.getColor(this, R.color.ink)
        val inkSoft = ContextCompat.getColor(this, R.color.ink_soft)
        val accent = ContextCompat.getColor(this, R.color.accent)

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
            text = "the day begins gray. hold both volume\nbuttons to borrow color for a while."
            typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setPadding(0, dp(6), 0, dp(28))
        })

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

        // 3. tangles: existing phone settings that would fight the chord
        label("the tangles")
        tanglesBox = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        root.addView(tanglesBox)

        // 4. dawn schedule
        label("gray every dawn")
        caption("around 4:00 each morning, before anyone is awake")
        root.addView(Switch(this).apply {
            isChecked = Gray.dawnEnabled(this@MainActivity)
            setOnCheckedChangeListener { _, checked ->
                Gray.setDawnEnabled(this@MainActivity, checked)
            }
        })

        // 5. borrow length
        label("the borrow")
        val borrowCaption = caption(borrowText(Gray.borrowMinutes(this)))
        root.addView(SeekBar(this).apply {
            max = 11 // 5..60 in 5-min steps
            progress = (Gray.borrowMinutes(this@MainActivity) - 5) / 5
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar?, p: Int, fromUser: Boolean) {
                    val minutes = 5 + p * 5
                    Gray.setBorrowMinutes(this@MainActivity, minutes)
                    borrowCaption.text = borrowText(minutes)
                }
                override fun onStartTrackingTouch(sb: SeekBar?) {}
                override fun onStopTrackingTouch(sb: SeekBar?) {}
            })
        })

        // 6. try it
        grayNow = TextView(this).apply {
            typeface = inter; setTextColor(accent)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            setPadding(0, dp(32), 0, dp(12))
            setOnClickListener {
                if (Gray.hasPermission(this@MainActivity)) {
                    Gray.setGray(this@MainActivity, !Gray.isGray(this@MainActivity))
                }
                refresh()
            }
        }
        root.addView(grayNow)

        setContentView(ScrollView(this).apply { addView(root) })
    }

    override fun onResume() {
        super.onResume()
        refresh()
    }

    private fun refresh() {
        permStatus.text = if (Gray.hasPermission(this)) {
            "granted — graydawn can reach the switch"
        } else {
            "not yet granted. from a computer, once:\n\n" +
                "adb shell pm grant com.ptc.graydawn " +
                "android.permission.WRITE_SECURE_SETTINGS"
        }
        listenerStatus.text = if (isServiceEnabled()) {
            "listening for the chord"
        } else {
            "not listening yet — tap here, then enable Graydawn\nunder installed apps"
        }
        grayNow.text = if (!Gray.hasPermission(this)) {
            "(waiting for the key)"
        } else if (Gray.isGray(this)) {
            "return color"
        } else {
            "go gray now"
        }
        refreshTangles()
    }

    /** Look for existing phone settings that would fight graydawn. */
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
        // the chord belongs to it, not to us.
        val chordTarget = Settings.Secure.getString(
            contentResolver, "accessibility_shortcut_target_service"
        )?.trim().orEmpty()
        if (chordTarget.isNotEmpty()) {
            found = true
            val what = if (chordTarget.contains("daltonizer", ignoreCase = true)) {
                "color correction"
            } else {
                chordTarget.substringAfterLast('/').substringAfterLast('.')
                    .ifEmpty { "another shortcut" }
            }
            if (Gray.hasPermission(this)) {
                tangle(
                    "your phone's own volume-key shortcut is tied to " +
                        "$what — it grabs the chord before graydawn can.\n" +
                        "tap here to untie it.",
                    clickable = true
                ) {
                    Settings.Secure.putString(
                        contentResolver, "accessibility_shortcut_target_service", ""
                    )
                    refresh()
                }
            } else {
                tangle(
                    "your phone's own volume-key shortcut is tied to " +
                        "$what — it grabs the chord before graydawn can. " +
                        "untie it in Settings → Accessibility → Shortcuts, " +
                        "or grant the key above and tap here."
                )
            }
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

        if (!found) {
            tangle("no tangles found — the chord is yours alone.")
        }
    }

    private fun isServiceEnabled(): Boolean {
        val enabled = Settings.Secure.getString(
            contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        return enabled.contains("$packageName/")
    }

    private fun borrowText(minutes: Int): String =
        "$minutes minutes of color, then the tide comes back"
}
