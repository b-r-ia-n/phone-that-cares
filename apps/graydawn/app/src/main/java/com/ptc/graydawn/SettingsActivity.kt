package com.ptc.graydawn

import android.content.Intent
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.util.TypedValue
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat

/**
 * The plumbing lives here, in plain words: permissions, potential
 * conflicts, a clean way to leave. The poetry stays on the main page
 * with the product.
 */
class SettingsActivity : AppCompatActivity() {

    private fun dp(v: Int): Int = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics
    ).toInt()

    private lateinit var root: LinearLayout

    private val inter get() = ResourcesCompat.getFont(this, R.font.inter)
    private val ink get() = ContextCompat.getColor(this, R.color.ink)
    private val inkSoft get() = ContextCompat.getColor(this, R.color.ink_soft)
    private val accent get() = ContextCompat.getColor(this, R.color.accent)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(28), dp(24), dp(28), dp(40))
        }
        setContentView(ScrollView(this).apply { addView(root) })
    }

    override fun onResume() {
        super.onResume()
        build()
    }

    private fun label(t: String) = root.addView(TextView(this).apply {
        text = t; typeface = inter; setTextColor(ink)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
        setPadding(0, dp(22), 0, dp(4))
    })

    private fun caption(t: String, onTap: (() -> Unit)? = null): TextView {
        val v = TextView(this).apply {
            text = t; typeface = inter
            setTextColor(if (onTap != null) accent else inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTextIsSelectable(onTap == null)
            setLineSpacing(0f, 1.25f)
            setPadding(0, 0, 0, dp(8))
            onTap?.let { setOnClickListener { _ -> it() } }
        }
        root.addView(v); return v
    }

    /** A bordered, unmistakable action — used where a plain line would
        read as body text and get missed. */
    private fun actionButton(t: String, onTap: () -> Unit) {
        root.addView(TextView(this).apply {
            text = t; typeface = inter; setTextColor(accent)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            setPadding(dp(16), dp(11), dp(16), dp(11))
            background = android.graphics.drawable.GradientDrawable().apply {
                setStroke(dp(1), ContextCompat.getColor(this@SettingsActivity, R.color.hairline))
                cornerRadius = dp(10).toFloat()
            }
            setOnClickListener { onTap() }
        }, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = dp(6) })
    }

    private fun build() {
        root.removeAllViews()

        root.addView(TextView(this).apply {
            text = "←"
            typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
            setPadding(dp(4), dp(4), dp(16), dp(8))
            setOnClickListener { finish() }
        })
        root.addView(TextView(this).apply {
            text = "settings"
            typeface = inter; setTypeface(typeface, Typeface.BOLD)
            setTextColor(ink); setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
            letterSpacing = -0.02f
        })

        // ---- permissions (each with its way back out) ----
        label("permissions")
        caption(
            if (Gray.hasPermission(this)) {
                "system settings access — granted. this is what lets " +
                    "graydawn flip the phone's color switch. to take it " +
                    "back, from a computer:\n\nadb shell pm revoke " +
                    "com.ptc.graydawn android.permission.WRITE_SECURE_SETTINGS"
            } else {
                "system settings access — not granted. from a computer, " +
                    "once:\n\nadb shell pm grant com.ptc.graydawn " +
                    "android.permission.WRITE_SECURE_SETTINGS"
            }
        )
        val enabled = isServiceEnabled()
        val running = enabled && GraydawnService.instance != null
        caption(
            when {
                running -> "volume button listener — on. it watches for both " +
                    "volume buttons held together, and notices when the camera " +
                    "comes to the front so it can keep its color. nothing else, " +
                    "nothing recorded. tap to manage or turn off."
                enabled -> "volume button listener — listed as on but not " +
                    "actually running (this happens after a force-stop). " +
                    "tap, then flip Graydawn off and back on."
                else -> "volume button listener — off. tap, then enable " +
                    "Graydawn under installed apps."
            }
        ) { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        caption(
            if (Letter.hasUsageAccess(this)) {
                "usage access — on. only ever read to write the letter " +
                    "you send yourself. tap to turn off."
            } else {
                "usage access — off. only asked for if you choose to put " +
                    "screen-time numbers in the letter. tap to manage."
            }
        ) { startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)) }
        val nm = getSystemService(android.app.NotificationManager::class.java)
        caption(
            if (nm.areNotificationsEnabled()) {
                "notifications — on. graydawn sends one, ever: the " +
                    "check-in around day 12. tap to change."
            } else {
                "notifications — off. the day-12 check-in will wait in " +
                    "the app instead. tap to change."
            }
        ) {
            startActivity(
                Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
            )
        }

        // ---- potential conflicts ----
        label("potential conflicts")
        val conflicts = Conflicts.collect(this) { build() }
        if (conflicts.isEmpty()) {
            caption("none found.")
        } else {
            for (c in conflicts) caption(c.text, c.fix)
        }

        // ---- leaving ----
        label("leaving")
        caption(
            "uninstalling from here first returns the color and cancels " +
                "every alarm, so nothing stays behind. (uninstalling the " +
                "usual way can leave the phone gray — fixable in Settings → " +
                "Accessibility → Color correction.)"
        )
        actionButton("leave cleanly — return color and uninstall") {
            Gray.endSaturationEarly(this)
            Gray.cancelDawn(this)
            Gray.setGray(this, false)
            val ok = runCatching {
                startActivity(
                    Intent(Intent.ACTION_DELETE, Uri.parse("package:$packageName"))
                ); true
            }.getOrDefault(false)
            if (!ok) {
                // Fall back to the app's own settings page, where uninstall
                // also lives — never leave the tap feeling dead.
                runCatching {
                    startActivity(
                        Intent(
                            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.parse("package:$packageName")
                        )
                    )
                }
            }
        }

        // ---- footer ----
        root.addView(TextView(this).apply {
            text = "Graydawn ${
                runCatching { packageManager.getPackageInfo(packageName, 0).versionName }
                    .getOrNull() ?: "?"
            } — made by brian"
            typeface = inter; setTextColor(inkSoft)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            setPadding(0, dp(32), 0, dp(2))
        })
        caption("write to him anytime") {
            startActivity(Intent(this, LetterActivity::class.java))
        }
    }

    private fun isServiceEnabled(): Boolean {
        val enabled = Settings.Secure.getString(
            contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        return enabled.contains("$packageName/")
    }
}
