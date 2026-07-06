package com.ptc.graydawn

import android.content.ComponentName
import android.content.Context
import android.os.Build
import android.provider.Settings

/**
 * Phone settings that would fight the hold. Blocking items break it
 * outright and surface on the main page; the rest are informational and
 * live in settings under "potential conflicts."
 */
object Conflicts {

    class Item(val text: String, val blocking: Boolean, val fix: (() -> Unit)?)

    fun collect(ctx: Context, onFixed: () -> Unit): List<Item> {
        val out = ArrayList<Item>()

        // 1. The phone's own hold-both-volume-keys shortcut. It fires at
        // the system level, upstream of graydawn — if anything is bound
        // there, the hold belongs to it, not to us. Blocking.
        val holdTarget = Settings.Secure.getString(
            ctx.contentResolver, "accessibility_shortcut_target_service"
        )?.trim().orEmpty()
        if (holdTarget.isNotEmpty()) {
            val what = if (holdTarget.contains("daltonizer", ignoreCase = true)) {
                "color correction"
            } else {
                holdTarget.substringAfterLast('/').substringAfterLast('.')
                    .ifEmpty { "another shortcut" }
            }
            if (Gray.hasPermission(ctx)) {
                out.add(Item(
                    "your phone already uses hold-both-buttons for $what — " +
                        "it catches the hold before graydawn can. " +
                        "tap here to clear it.",
                    blocking = true,
                    fix = {
                        Settings.Secure.putString(
                            ctx.contentResolver,
                            "accessibility_shortcut_target_service", ""
                        )
                        onFixed()
                    }
                ))
            } else {
                out.add(Item(
                    "your phone already uses hold-both-buttons for $what — " +
                        "it catches the hold before graydawn can. clear it in " +
                        "Settings → Accessibility → Shortcuts, or grant " +
                        "system settings access first and tap here.",
                    blocking = true, fix = null
                ))
            }
        }

        // 2. Other accessibility services that might also watch the buttons.
        val others = (Settings.Secure.getString(
            ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: "")
            .split(':')
            .filter { it.isNotBlank() && !it.startsWith("${ctx.packageName}/") }
            .mapNotNull { flat ->
                ComponentName.unflattenFromString(flat)?.packageName
            }
            .distinct()
            .map { pkg ->
                // Package-visibility rules usually hide other apps' labels
                // from us; the last segment of the package reads fine.
                runCatching {
                    ctx.packageManager.getApplicationLabel(
                        ctx.packageManager.getApplicationInfo(pkg, 0)
                    ).toString()
                }.getOrDefault(pkg.substringAfterLast('.'))
            }
        if (others.isNotEmpty()) {
            out.add(Item(
                "also listening for buttons: ${others.joinToString(", ")}. " +
                    "if one of these watches the volume buttons or toggles " +
                    "grayscale on its own, the two will fight — quiet any " +
                    "button rules there.",
                blocking = false, fix = null
            ))
        }

        // 3. OEM battery managers that put unopened apps to sleep —
        // graydawn is exactly an app you never reopen.
        when {
            Build.MANUFACTURER.equals("samsung", true) -> out.add(Item(
                "samsung phones put apps to sleep after a few days unopened, " +
                    "which would silence the dawn. in Settings → Battery, set " +
                    "Graydawn to unrestricted and add it to " +
                    "“never sleeping apps.”",
                blocking = false, fix = null
            ))
            Build.MANUFACTURER.equals("motorola", true) -> out.add(Item(
                "motorola's battery care likes to stop quiet apps, which " +
                    "would silence the dawn. in Settings → Battery, set " +
                    "Graydawn to unrestricted.",
                blocking = false, fix = null
            ))
        }

        return out
    }
}
