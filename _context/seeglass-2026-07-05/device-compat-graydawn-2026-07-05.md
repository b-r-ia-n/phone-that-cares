# Graydawn device compatibility — Samsung One UI + Motorola (US market)

*Research pass, 2026-07-05 overnight. Web-only — nothing here touched real Samsung/Moto hardware. Every claim is tagged:*

- **[MULTI]** — verified by multiple independent sources
- **[SINGLE]** — one credible report/source
- **[INFER]** — reasoned from framework knowledge or indirect evidence; needs hardware confirmation

Baseline: everything below assumes the Pixel 8 / Android 14 behavior already verified (daltonizer secure settings, a11y `FLAG_REQUEST_FILTER_KEY_EVENTS` chord, chord-shortcut tangle + clear, `setExactAndAllowWhileIdle` + `USE_EXACT_ALARM`, adb-granted `WRITE_SECURE_SETTINGS`).

---

## TL;DR

| Question | Samsung One UI (S + A series) | Motorola |
|---|---|---|
| Daltonizer secure settings work? | Likely yes — One UI's own grayscale is AOSP color correction reskinned [INFER] | Yes — documented AOSP color-correction path [MULTI] |
| A11y service gets volume KeyEvents (screen on)? | Yes — Torchie/Button Mapper/Key Mapper ecosystem works on Samsung [MULTI] | Expected yes (near-stock) [INFER] |
| Volume KeyEvents with screen **off**/AOD? | **No — platform-level, all OEMs including Pixel** [MULTI] | Same [MULTI] |
| System volume-chord collision? | Yes, same 3-sec vol-up+down chord; likely same secure setting key [SINGLE/INFER] | Same as stock [INFER] |
| Battery mgmt kills the app? | **Highest risk of any US OEM** — sleeping apps break alarms after ~3 days unused; a11y services get toggled off [MULTI] | Moderate risk — "Battery Care" + aggressive adaptive battery [MULTI] |
| WRITE_SECURE_SETTINGS via `pm grant`? | Works on consumer devices [SINGLE, weak] | Expected yes [INFER] |
| Extra grayscale writers that fight Graydawn? | **Many**: Bedtime/Sleep mode, Modes & Routines, power saving modes [MULTI] | One: Google Digital Wellbeing Bedtime mode [MULTI] |

Bottom line: the *mechanisms* should all port. The two real Samsung risks are (1) **the app getting put to sleep** (kills the 4am alarm and possibly the a11y service) and (2) **other Samsung features writing grayscale state underneath us**. Both are detectable/mitigable, neither is a hard blocker.

---

## 1. Samsung One UI (Galaxy S + A, One UI 5/6/7, Android 13–15)

### 1a. The volume-key accessibility shortcut (chord collision)

Samsung has **exactly the same chord as stock**: press and hold Volume up + Volume down for 3 seconds to activate the a11y service of your choosing. Samsung documents it under **Settings → Accessibility → Advanced settings → "Volume up and down keys"** (older One UI wording: "Volume up and down buttons"). [MULTI]
- Samsung support: [Advanced accessibility settings](https://www.samsung.com/us/support/answer/ANS10001906/), [TalkBack on Galaxy](https://www.samsung.com/us/support/answer/ANS10002553/)
- Google: [Use accessibility shortcuts](https://support.google.com/accessibility/android/answer/7650693?hl=en)

Samsung **also** has a second, separate hardware shortcut stock doesn't: **"Side and Volume up keys"** (a.k.a. Direct access — press power/side + vol-up simultaneously; if 2+ functions are bound a picker dialog appears). [MULTI — same Samsung support pages] This one doesn't collide with Graydawn's chord (different keys), but it's another way TalkBack ends up enabled, and its existence means Samsung's shortcut plumbing is a superset of AOSP's.

**Which secure settings key?** The generic-Android `settings put secure accessibility_shortcut_target_service null` command is circulated in Samsung-inclusive disable-TalkBack guides ([Technastic](https://technastic.com/disable-talkback-on-android/), [XDA thread on setting a11y services via adb](https://xdaforums.com/t/set-accessibility-service-via-adb.3689201/)), and One UI's chord is the AOSP feature reskinned, so the same key almost certainly backs it. [SINGLE/INFER — no source explicitly dumps a Galaxy's secure table before/after toggling the Samsung UI switch.] Two cautions:

1. On Android 12+ the value can be a **colon-separated list** of targets (Samsung's UI lets you check multiple services under the shortcut). Clear the whole key, don't string-match one component. [INFER from AOSP behavior]
2. Samsung's "Side and Volume up keys" direct-access shortcut is presumably stored in a **Samsung-namespaced secure key** (not identified in any source I found). It doesn't intercept our chord, so we don't need to clear it — but when first Samsung hardware is available, `settings list secure | grep -i -e shortcut -e access -e direct` before/after flipping each Samsung shortcut toggle is a 5-minute job that removes all guessing. [SPECULATION as to key name]

**Practical wrinkle that raises the stakes:** accidental-TalkBack-via-volume-chord is a famous enough Samsung problem that there's a cottage industry of "how to turn off TalkBack on Samsung" articles ([Gizmochina](https://www.gizmochina.com/how-to/turn-off-talkback-on-samsung/), [MakeUseOf](https://www.makeuseof.com/how-to-turn-off-talkback-android/), etc.). That implies the chord is live-or-one-dialog-away on many Samsungs out of the box — so on Samsung, Graydawn's tangle-clear is **the common case, not the edge case**. [INFER from prevalence]

### 1b. Does a FILTER_KEY_EVENTS service actually get volume KeyEvents on One UI?

**Screen on / lockscreen: yes.** The whole hold-both-volume-buttons a11y-service category works on Samsung:
- **Torchie** (hold both volume buttons → torch, implemented as an AccessibilityService intercepting physical volume keys — the exact Graydawn interaction) runs on Samsung; its only Samsung-specific note is that **Ultra Power Saving Mode kills the service** ([Torchie troubleshooting wiki](https://github.com/anselm94/Torchie-Android/wiki/Troubleshooting), [Torchie README](https://github.com/anselm94/Torchie-Android)). [MULTI — app README + wiki + years of XDA use]
- **Button Mapper** and **Key Mapper** both support volume keys on Samsung; Button Mapper's setup docs even lean on Samsung's own "Side and volume key" a11y advanced settings ([Button Mapper advanced setup](https://setup.buttonmapper.app/), [Key Mapper docs](https://docs.keymapper.club/known-issues/)). [MULTI]
- Key Mapper's known-issues page lists **no Samsung-specific volume-key failure**. [SINGLE — absence of evidence]

**Screen off / AOD: no — and this is not a Samsung problem, it's Android.** When the device is non-interactive, volume keys are handled in the window-manager policy (`interceptKeyBeforeQueueing`) and are generally not flagged `PASS_TO_USER`, so they never reach the accessibility input filter:
- Button Mapper states it can only intercept hardware buttons **while the screen is on** ([XDA spotlight](https://www.xda-developers.com/xda-spotlight-button-mapper-an-app-to-remap-your-phones-hardware-buttons/)); screen-off long-press needs the separate `SET_VOLUME_KEY_LONG_PRESS_LISTENER` grant and only worked Android 8–10. [MULTI]
- Torchie's screen-off mode is documented as degraded/"weird" on Android 6+ (single alternating presses instead of the chord) — i.e., the chord doesn't arrive intact when non-interactive ([Torchie wiki](https://github.com/anselm94/Torchie-Android/wiki/Troubleshooting)). [MULTI]
- AOSP input pipeline reference: [Keyboard devices — input pipeline / interceptKeyBeforeQueueing](https://source.android.com/docs/core/interaction/input/keyboard-devices). [MULTI]

**Implication for Graydawn:** the "hold both buttons for color" gesture should be documented as *wake the screen first, then hold* (lockscreen is fine, pocket/AOD is not). That's true on the Pixel too — worth re-verifying what exactly was tested on the Pixel 8 with screen fully off vs lockscreen. Since this is the same on every OEM, it's a UX doc line, not a compat matrix line.

### 1c. Daltonizer secure settings on One UI

- One UI's user-facing grayscale lives at **Settings → Accessibility → Visibility enhancements → Color adjustment → Grayscale** ([Samsung: display unexpectedly grayscale](https://www.samsung.com/sg/support/mobile-devices/how-to-troubleshoot-when-the-samsung-phone-display-is-unexpectedly-grayscale/), [TechWiser](https://techwiser.com/ways-to-turn-grayscale-on-or-off-on-android-samsung-included/)). "Color adjustment" is Samsung's rename of AOSP color correction (the daltonizer). Samsung community workarounds for grayscale bugs literally use the **color-correction quick tile** to force grayscale off ([Samsung community: grayscale does not reverse](https://r1.community.samsung.com/t5/support/grayscale-mode-does-not-reverse-automatically/td-p/21909755)). [INFER, strong — Samsung UI is a reskin of the AOSP feature]
- The adb daltonizer recipe (`accessibility_display_daltonizer_enabled=1`, `accessibility_display_daltonizer=0`) is circulated device-agnostically ([mrk-han gist](https://gist.github.com/mrk-han/67a98616e43f86f8482c5ee6dd3faabe), [alexzh.com adb accessibility](https://alexzh.com/adb-commands-accessibility/)), and I found **no report of it failing on a Galaxy** across the DetoxDroid, Grayscaler, and QS-tile-grayscale issue trackers ([DetoxDroid issues](https://github.com/flxapps/DetoxDroid/issues) — device-specific reports are OnePlus/Xiaomi/GrapheneOS, not Samsung; [Grayscaler](https://github.com/C10udburst/Grayscaler); [dtkav/grayscale](https://github.com/dtkav/grayscale)). [SINGLE-ish — absence of complaints is weak positive evidence]

**Verdict: likely works, unconfirmed on hardware.** The bigger issue is not whether the setting works but **who else writes it**:

- **Bedtime / Sleep mode forces grayscale** and in some One UI versions users couldn't turn the grayscale component off at all ([Samsung community: "Bedtime mode now forces greyscale"](https://us.community.samsung.com/t5/Galaxy-S22/Bedtime-mode-now-forces-greyscale/td-p/2199141), [Samsung grayscale troubleshooting](https://www.samsung.com/sg/support/mobile-devices/how-to-troubleshoot-when-the-samsung-phone-display-is-unexpectedly-grayscale/)). [MULTI]
- **Modes & Routines** has a grayscale action that is **known-buggy**: it can turn grayscale on but frequently fails to reverse it when the mode ends ([grayscale does not reverse automatically](https://r1.community.samsung.com/t5/support/grayscale-mode-does-not-reverse-automatically/td-p/21909755), [unable to exit grayscale](https://us.community.samsung.com/t5/Galaxy-S22/Unable-to-exit-out-of-Grayscale-and-go-back-to-color/td-p/2450229)). [MULTI]
- **Power saving / Ultra power saving** can also render the phone grayscale ([TechWiser](https://techwiser.com/ways-to-turn-grayscale-on-or-off-on-android-samsung-included/)). [SINGLE]

If any of these write the same daltonizer keys (likely for Bedtime/Routines [INFER]), the failure modes for Graydawn are: user's Sleep mode *ends* at 7am and writes color back (undoing Graydawn's gray), or a mode *starts* during the 20-minute borrow and re-grays it, or — given the known Samsung bugs — a stale grayscale gets blamed on Graydawn. The existing watchdog snap-back already covers most of this if it re-asserts desired state rather than assuming it persists; add "detect external writes and tell the user which Samsung feature to turn off."

### 1d. Battery management — the biggest Samsung risk

Samsung is the most aggressive app-killer among US OEMs ([dontkillmyapp.com/samsung](https://dontkillmyapp.com/samsung)). [MULTI] Specifics that hit Graydawn directly:

- **Sleeping / Deep-sleeping apps**: "After 3 days any unused app will not be able to start from background (e.g. **alarms will not work anymore**)." Graydawn is precisely the kind of app a user never reopens — it sits invisible and fires at 4am — so it's a **prime candidate for auto-sleep**, which would silently kill the 4am alarm. [MULTI: dontkillmyapp + [Android Central](https://www.androidcentral.com/samsung-aggressively-killing-background-apps-android-11-theres-easy-fix)]
- **Accessibility services get toggled off** on Samsung — user reports of a11y services silently disabling on S23 Ultra and others, root cause traced to battery optimization ([Samsung Members](https://r1.community.samsung.com/t5/galaxy-s/accessibility-keeps-turning-itself-off/td-p/22542025), [EU community](https://eu.community.samsung.com/t5/mobile-apps-services/accessibility-service-automatically-toggles-off-on-samsung/td-p/13970381), [Accountable2You support doc](https://support.accountable2you.com/article/754-android-accessibility-keeps-turning-off-accountable2you)). [MULTI]
- **Ultra Power Saving Mode kills a11y services** outright (Torchie's Samsung note). [SINGLE, older TouchWiz-era but likely still true in spirit]
- Partial good news: "Since One UI 6.0, foreground services of apps **targeting Android 14** will be guaranteed to work as intended" (dontkillmyapp, quoting Samsung). Graydawn targets API 34, so it's on the right side of that promise — but the promise covers FGS, not alarms-from-slept-apps or a11y services. [SINGLE — Samsung's own claim]

**Required user mitigations on Samsung** (one-time, ~60 seconds):
1. Settings → Battery → Background usage limits → **add Graydawn to "Never sleeping apps"** and ideally turn off "Put unused apps to sleep."
2. Settings → Apps → Graydawn → Battery → **Unrestricted**.
3. Don't use Ultra Power Saving mode (or accept that Graydawn pauses inside it).

### 1e. WRITE_SECURE_SETTINGS / Knox

- `adb shell pm grant <pkg> android.permission.WRITE_SECURE_SETTINGS` is routine on consumer Samsungs — the Tasker/MacroDroid ecosystem depends on it ([Tasker Google Group example on a Galaxy](https://groups.google.com/g/tasker/c/s4R15WKxGJw)). No reports found of the grant itself being refused on retail One UI. [SINGLE, weak but consistent]
- Knox only matters on **MDM-enrolled / work-profile devices**, where the admin can block developer options and USB debugging entirely ([Samsung Knox docs](https://docs.samsungknox.com/admin/knox-manage/faqs/faq-481-how-to-configure-app-permissions-knox-manage/)) — in that case the user can't sideload-and-grant at all, which is a distribution constraint, not an app bug. Secure Folder is irrelevant (separate profile; Graydawn lives in the main profile). [INFER]
- The common real-world failure is mundane: Windows ADB drivers / "no devices found" on Samsungs, not the grant. [SINGLE]
- One unknown: whether Samsung's **permission auto-reset for unused apps** ever revokes an adb-granted `WRITE_SECURE_SETTINGS` (on stock it shouldn't — auto-reset targets runtime permissions — but Samsung's "remove permissions if app unused" toggle should be turned off for Graydawn anyway). [SPECULATION]

### 1f. Galaxy A-series vs S-series

Same One UI, same settings surface, same mitigations. A-series has less RAM, so low-memory kills of the a11y service will be more frequent — the system restarts bound a11y services, but the watchdog matters more there. No A-series-specific reports found either way. [INFER]

---

## 2. Motorola (~10% US, near-stock)

- **Grayscale**: Motorola's own support page attributes unexpected B&W to Google **Digital Wellbeing Bedtime mode** and AOSP **color correction** (Settings → Accessibility → Color and motion) ([Motorola support](https://en-us.support.motorola.com/app/answers/detail/a_id/156959/~/display-color-changes-to-black-and-white)). That's the stock daltonizer path — Graydawn's mechanism should work unmodified. [MULTI]
- **Volume chord / shortcut**: no Moto-specific deviations found; expect stock behavior and the stock `accessibility_shortcut_target_service` tangle. [INFER]
- **Battery**: worse than its near-stock reputation suggests — dontkillmyapp rates Motorola 3/5, citing **"Battery Care AI"** that "kills apps even when disabled in settings," plus aggressive Adaptive Battery ([dontkillmyapp.com/motorola](https://dontkillmyapp.com/motorola)). [MULTI] Mitigations: per-app battery → Unrestricted, disable Adaptive Battery; dontkillmyapp's nuclear option is uninstalling the Battery Care app via adb — since Graydawn users already have adb out, that's actually viable to include as an optional line in the install script.
- Digital Wellbeing Bedtime mode is the one competing grayscale writer on Moto (and Pixel!) — if the user has Bedtime mode's grayscale scheduled, it will fight Graydawn at schedule boundaries. Same detector logic as Samsung, simpler list. [INFER]

---

## 3. General: screen-off keys and the 4am alarm

- **No US OEM reliably delivers volume KeyEvents to an a11y input filter while non-interactive** (screen off / AOD / doze). This is AOSP input-policy behavior, not OEM misbehavior (see 1b sources). Design consequence: the borrow gesture requires a woken screen everywhere; don't chase this as a Samsung bug. [MULTI]
- The **4am alarm doesn't need keys** — its risks are (a) app put to sleep (Samsung ~3-day rule, Moto Battery Care) and (b) a11y-service death removing the watchdog. `setExactAndAllowWhileIdle` + `USE_EXACT_ALARM` handles Doze itself on all OEMs ([Android docs](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms)); it does *not* protect an app the OEM has force-stopped — a force-stopped app's alarms are cancelled by the platform. So battery-exemption setup is the real dependency for the 4am fire, on both OEMs. [MULTI]

---

## 4. Actionable

### 4a. Tangles-detector additions for Samsung

On `Build.MANUFACTURER.equalsIgnoreCase("samsung")`:

1. **Chord shortcut** (already built): read `accessibility_shortcut_target_service` — treat any non-empty value as a tangle; clear the **whole** key (Android 12+ stores a colon-separated list; Samsung's UI allows multiple checked services). User-facing wording: *"Samsung's own volume-button shortcut (Settings → Accessibility → Advanced settings → Volume up and down keys) was pointing at [service]; Graydawn turned it off so the color-borrow hold works."*
2. **Grayscale co-writers** — at detector time and in the watchdog, check and surface:
   - `Settings.Secure accessibility_display_daltonizer_enabled` changed externally → log + re-assert, and message: *"Something else on your phone is changing color settings. On Samsung, check: Modes and Routines (Sleep mode / any mode with Grayscale), Digital Wellbeing → Bedtime mode → grayscale, and Power saving mode."*
   - There is no documented Samsung-side secure key to *read* for "Bedtime mode grayscale scheduled" — treat external daltonizer writes as the detection signal rather than trying to enumerate Samsung keys. (Open hardware question 3 below.)
3. **Battery exemption nag** — Samsung-only setup screen item: deep-link to app battery settings (`Settings.ACTION_APPLICATION_DETAILS_SETTINGS` → Battery) and instruct: *Unrestricted* + *Never sleeping apps* + turn off *"Put unused apps to sleep."* Also disable the "Pause app activity if unused" permission-reset toggle for Graydawn.
4. **Liveness tripwire** (cheap, OEM-agnostic): on each 4am fire, write a timestamp; if the a11y service's watchdog notices the last fire is >25h stale, post a notification — this converts silent Samsung app-sleep into a visible, fixable event.
5. On Motorola: same chord clear; optionally detect the Battery Care package and mention it in setup docs.

### 4b. Download-page compatibility statement (draft)

> Graydawn is tested on Pixel (Android 14/15). It uses only standard Android mechanisms, so it should also work on Samsung Galaxy and Motorola phones — with one extra step on Samsung: after installing, set Graydawn's battery usage to Unrestricted and add it to "Never sleeping apps" (Settings → Battery), or Samsung will quietly stop the 4am alarm after a few days. On any phone, wake the screen before holding both volume buttons — Android doesn't deliver button presses to apps while the screen is off. If your phone has a Bedtime mode or a Samsung Routine that turns the screen gray, turn its grayscale off so the two don't fight. Nobody's run this on a Galaxy yet as far as I know — if you do, I'd genuinely love to hear how it went: [contact].

### 4c. Open questions only answerable on real hardware

1. **Does One UI deliver both-volume-key events to a FILTER_KEY_EVENTS service on the lockscreen** (screen woken, not unlocked)? Ecosystem evidence says screen-on works; the lockscreen-specifically case is unverified.
2. **Does clearing `accessibility_shortcut_target_service` actually stop One UI's 3-second chord interception**, or does Samsung's settings UI re-populate it (or use an additional Samsung key)? Also: does an OTA / One UI upgrade restore the shortcut?
3. **What exactly do Samsung's Color adjustment, Bedtime/Sleep mode, and Modes & Routines grayscale write?** One `settings list secure` diff before/after each toggle on a Galaxy answers this permanently — highest-value 10 minutes on first Samsung hardware.
4. **Does the adb-granted WRITE_SECURE_SETTINGS grant survive** One UI's "remove permissions for unused apps" and OS updates?
5. **A-series longevity**: does the a11y service + 4am alarm survive 7 days untouched on a low-RAM Galaxy A with the documented battery exemptions applied?
6. Pixel re-check prompted by this research: confirm whether the Pixel 8 chord test was done with screen fully off vs lockscreen — sources say fully-off should not work anywhere.

---

## Source index

- https://dontkillmyapp.com/samsung · https://dontkillmyapp.com/motorola
- https://www.samsung.com/us/support/answer/ANS10001906/ (Advanced accessibility settings — volume-key + side+vol-up shortcuts)
- https://www.samsung.com/us/support/answer/ANS10002553/ (TalkBack on Galaxy)
- https://www.samsung.com/sg/support/mobile-devices/how-to-troubleshoot-when-the-samsung-phone-display-is-unexpectedly-grayscale/
- https://us.community.samsung.com/t5/Galaxy-S22/Bedtime-mode-now-forces-greyscale/td-p/2199141
- https://r1.community.samsung.com/t5/support/grayscale-mode-does-not-reverse-automatically/td-p/21909755
- https://us.community.samsung.com/t5/Galaxy-S22/Unable-to-exit-out-of-Grayscale-and-go-back-to-color/td-p/2450229
- https://r1.community.samsung.com/t5/galaxy-s/accessibility-keeps-turning-itself-off/td-p/22542025
- https://eu.community.samsung.com/t5/mobile-apps-services/accessibility-service-automatically-toggles-off-on-samsung/td-p/13970381
- https://github.com/anselm94/Torchie-Android + /wiki/Troubleshooting (volume-chord a11y app; Samsung + screen-off behavior)
- https://docs.keymapper.club/known-issues/ · https://setup.buttonmapper.app/ · https://www.xda-developers.com/xda-spotlight-button-mapper-an-app-to-remap-your-phones-hardware-buttons/
- https://source.android.com/docs/core/interaction/input/keyboard-devices (input pipeline / interceptKeyBeforeQueueing)
- https://support.google.com/accessibility/android/answer/7650693 (accessibility shortcuts)
- https://en-us.support.motorola.com/app/answers/detail/a_id/156959/ (Moto grayscale causes)
- https://gist.github.com/mrk-han/67a98616e43f86f8482c5ee6dd3faabe (adb a11y/daltonizer recipes)
- https://github.com/flxapps/DetoxDroid (closest analog app; issue tracker scanned for Samsung reports)
- https://developer.android.com/about/versions/14/changes/schedule-exact-alarms
- https://www.androidcentral.com/samsung-aggressively-killing-background-apps-android-11-theres-easy-fix
- https://support.accountable2you.com/article/754-android-accessibility-keeps-turning-off-accountable2you
- https://technastic.com/disable-talkback-on-android/ (adb shortcut-clear on Samsung)
- https://groups.google.com/g/tasker/c/s4R15WKxGJw (WRITE_SECURE_SETTINGS grants on Galaxy)
