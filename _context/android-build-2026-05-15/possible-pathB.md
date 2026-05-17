# Path B v1 is doable — the POSSIBLE case

## 1. Thesis

This is doable in 2–3 weeks because every load-bearing component already exists as a maintained open-source project that Brian's Pixel 6 specifically supports, and the v1 scope can be made small enough that *nothing in it requires writing new platform-level magic from scratch.* Magisk (the root manager) ships v30.7 in February 2026. The LSPosed framework (a runtime-patching layer for Android — lets you change how SystemUI behaves without recompiling Android) was forked to `JingMatrix/Vector` at 11.2k stars with v2.0 released March 22, 2026 and explicit Android 8.1–17 support. Per-app grayscale via SurfaceFlinger color matrix is a documented `service call SurfaceFlinger 1015` one-liner that root can fire from a foreground-watcher daemon — and a Kotlin app called `Grayscaler` already does the foreground-watcher half non-root via Shizuku. The Pixel 6 (raven/oriole) is the most-trodden Magisk target in the world; rooted-with-locked-bootloader is a solved problem via avbroot. Brian's build server + parallel Claudes means you can keep three loops hot at once (color daemon / lockscreen module / launcher app) and the binding work is mostly Kotlin Compose, which is well within Claude's wheelhouse. The risky parts are scoping and integration, not "can the platform do this."

## 2. Evidence the components are mature

**Magisk + Zygisk (Magisk's in-process injection mechanism — lets modules run inside every app's process):** v30.7 stable shipped Feb 2026, canary channel ongoing. DenyList (the per-app "lie to this app and pretend we're not rooted" list) is built-in. This is the most boring, well-traveled part of the stack.

**Shamiko / hiding root from banking apps:** The original Shamiko/LSPosed repos got archived, which initially looks scary. But (a) `JingMatrix/Vector` is the active LSPosed successor at 11.2k stars / 709 forks / v2.0 in March 2026, (b) Shamiko forks exist (e.g. `rushizgithub/shamiko`) and (c) the v1 plan should not depend on banking working on this device anyway (see §4).

**LSPosed → Vector (the framework we'd write the lockscreen module against):** `github.com/JingMatrix/Vector` — formerly JingMatrix/LSPosed, renamed and refactored Java→Kotlin. Active as of mid-2026, Android 8.1–17 Beta. Concrete reference modules that hook SystemUI today: Face Unlock Bypass, the Lockscreen Camera shortcut module on `modules.lsposed.org`, and `Cpatcher` which demonstrates a full IHook/ObfsUtils/SystemUI-handlers architecture. Building a four-direction Argos lockscreen reduces to "find SystemUI's keyguard view, replace it with our Compose view, route swipes to four intents." This is exactly the surface those modules already touch.

**SurfaceFlinger per-app grayscale:** SurfaceFlinger (Android's compositor) exposes a global color-transform matrix. As root you literally just do:
```
service call SurfaceFlinger 1015 i32 1 f 0.299 f 0.587 f 0.114 f 0 ...
```
to switch to grayscale and `service call SurfaceFlinger 1015 i32 0` to clear it. This is documented in XDA threads and used by `BlueLightFilter` (a Magisk/KernelSU module that toggles SurfaceFlinger color transforms) and `DisplayCalibration` on GitHub. The "per-app" half is a foreground-app watcher that fires those commands on app switch — and `C10udburst/Grayscaler` (143 stars, v1.0 Feb 2025, Kotlin + Compose, accessibility-service driver, Shizuku for `WRITE_SECURE_SETTINGS`) already does precisely this, just non-root. As root we don't even need Shizuku — we have full `service call` access. That makes our version *simpler* than the existing open-source proof-of-concept.

**Foreground app detection:** Two known paths. UsageStatsManager (the official one) is polling-based with delay, and Android 14 tightened it. AccessibilityService listening for `TYPE_WINDOW_STATE_CHANGED` is real-time and is exactly what `Grayscaler` uses. Both work today. With root we additionally have `dumpsys activity activities | grep mResumedActivity` as a fallback debug path.

**Pixel 6 root:** The Pixel 6 (raven/oriole) is in the sweet spot — old enough that everything works, new enough that Google still ships factory images. AVBRoot supports it. Rooted + relocked bootloader is documented on XDA. The "do not disable OEM unlock checkbox" footgun is well-known.

**Compose launcher:** `dikeboy/compose-launcher` is a reference; the Compose Navigation 3.0 + Glance widgets stack is the 2026 norm. Brian's six screens (home/sessions/ask/conversations/people/notifications) are CRUD-shaped — no novel UI invention required, just taste.

## 3. The dev loop

Brian's Pixel 6 sits on his desk plugged in. Daily-driver use happens off-USB on the SIM, dev iteration happens over Wi-Fi adb.

**One-time setup (day 1):**
```
fastboot flashing unlock                         # OEM unlock
# flash factory image + Magisk-patched boot.img
adb tcpip 5555 && adb connect <pixel.local>:5555 # wireless adb
```

**Per-iteration loop:**
- **Color daemon (Magisk module):** `./gradlew :app:assembleDebug && adb push module.zip /data/local/tmp/ && adb shell su -c "magisk --install-module /data/local/tmp/module.zip" && adb reboot` — but for the foreground-watcher app component, no reboot needed: `adb install -r app.apk` and the accessibility service restarts. Cycle time: ~15s.
- **Lockscreen Vector/LSPosed module:** `./gradlew assembleDebug && adb install -r module.apk && adb shell am force-stop com.android.systemui && adb shell killall system_server` — SystemUI restarts in 3–5s with the new hook live. Cycle time: ~10s. (No reboot.)
- **Launcher Compose app:** `./gradlew installDebug` then `adb shell am start -n com.ptc.launcher/.MainActivity`. With Compose's built-in hot reload preview in Android Studio Hedgehog+, the inner loop on individual screens is sub-second.
- **scrcpy mirror window** always open on the laptop (`scrcpy --tcpip=pixel.local`) so Claude/Brian can see the device without picking it up.

**Parallel Claude topology:** Three workstreams, three terminals, three repos:
1. `ptc-android-color/` — Magisk module + foreground watcher
2. `ptc-android-keyguard/` — Vector module for lockscreen
3. `ptc-android-launcher/` — Compose launcher + Argos backend integration

Each has its own session notes file. The build server runs the assemble jobs; the Pixel is the single shared test target (only one APK install at a time, but the three projects rarely conflict).

**Argos backend reuse:** The Telegram bot's TypeScript backend stays. The launcher app calls the same val.town endpoints. Day-1 feature parity with the bot is free.

## 4. v1 cut list (scope discipline)

Cut from v1, document for v2:
- **Banking on this device.** Don't fight Play Integrity. Brian carries a $200 second phone or uses his laptop for bank stuff. This deletes ~40% of the engineering risk overnight. (Shelter work profile is a v1.1 attempt; if it falls over on his specific bank, oh well.)
- **Three of the four lockscreen directions.** Ship one direction working (probably Connect — opens Argos chat) and leave the other three as static "coming soon" labels. Users — even Brian — can't evaluate four-way swipe nav from a mockup; he can from one real one.
- **Feed-blur and break-cards.** Defer entirely. The handoff already says this.
- **Per-app grayscale curve / gradual desaturation.** v1 is binary: app is in greyscale-list or it isn't. The matrix interpolation is a one-day polish item for v1.1.
- **Custom icons / icon-pack support.** Use system icons. Brian's aesthetic eye doesn't need to be satisfied on day 1 — it needs to be satisfied on day 14.
- **Notifications screen.** Use the system shade for v1. Building a custom notification surface is a 1-week rabbit hole.
- **Sessions/ask/people/conversations as polished surfaces.** Ship them as functional-but-rough Compose screens calling Argos. Polish in week 3 once the daily-driver experience surfaces the real priorities.

Net v1: rooted Pixel + grayscale daemon + one-direction lockscreen + launcher home + Argos chat surface + usage tracking. Everything else is text-on-screen placeholders. That's a 2-week scope.

## 5. Counter-arguments

**"But Play Integrity / SafetyNet."** Doesn't matter — we explicitly cut banking. Brian's daily-driver apps (browser, social, messaging, maps, Argos) don't check integrity. The handful that do (Netflix HDR, some games) are not in scope.

**"But Pixel security updates will break Magisk."** Magisk has shipped continuously through every Pixel update for five years. Worst case: a monthly update lands, Magisk takes 2–7 days to ship a compatible release, Brian holds off updating that month. He's already living with that constraint mentally.

**"But Vector/LSPosed could break on an Android upgrade."** Brian's Pixel 6 stays on its current Android version for the 2-week test. Don't upgrade during v1.

**"But Android 14+ killed UsageStatsManager realtime."** We use AccessibilityService for realtime (the Grayscaler approach) and UsageStats only for historical "how much did I use Instagram this week" panels where the delay is fine.

**"But SurfaceFlinger color transforms are global, not per-app."** Correct, and that's fine. The "per-app" illusion is achieved by the watcher: app comes to foreground → set matrix → app leaves → clear matrix. The transition is <16ms (one frame). Grayscaler proves this works perceptually.

**"But a custom launcher will break edge cases (split-screen, picture-in-picture, work profile chooser)."** It will. Brian as v1 tester will surface them in week 1. He's not a typical user — he can tolerate "long-press doesn't work yet, use the back gesture."

**"But Magisk + Vector + custom launcher is a lot of moving parts."** Each part is independently shippable and independently revertable. If Vector breaks, the lockscreen falls back to stock and the rest of the system keeps working. The architecture *degrades gracefully* — that's the strongest possible answer to "what if a piece breaks mid-test."

## 6. Three concrete risks accepted

**Risk 1: AccessibilityService gets killed by Android's background restrictions.** On a Pixel 6 with battery optimization on, accessibility services do sometimes get nuked. Mitigation: disable battery optimization for our app (one toggle, documented), and as root we can also set `cmd appops set <pkg> RUN_IN_BACKGROUND allow`. If it still dies, we add a foreground service with a persistent notification (ugly but bulletproof).

**Risk 2: Vector module breaks SystemUI on a specific subscreen we didn't test (e.g. emergency dialer, fingerprint setup).** Real risk. Mitigation: the LSPosed module loads scoped to `com.android.systemui` only, and the hook is defensive — if our keyguard view fails to inflate, we fall through to the original. Plus: Magisk's safe-mode (volume-down at boot) disables all modules, so Brian always has a recovery path.

**Risk 3: The 2-week scope slips to 4 weeks because integration always slips.** The honest one. Mitigation: ruthless v1 cut list above (§4), and a hard rule that week 3 is *only* daily-driver polish, not new features. If by end of week 2 the launcher won't launch Argos, ship a v0 where the launcher is just `Nova Launcher + Argos as default messaging app + the grayscale Magisk module` — and treat that as the real v1. Brian still gets a phone he lives with for 2 weeks.

## 7. Citations

- [JingMatrix/Vector (LSPosed successor)](https://github.com/JingMatrix/Vector) — active fork, 11.2k stars, v2.0 March 2026, Android 8.1–17 Beta. The framework we'd build the lockscreen against.
- [JingMatrix-LSPosed mirror](https://git.gay/w/JingMatrix-LSPosed) — read-only mirror confirming May 2026 sync activity.
- [LSPosed module registry](https://modules.lsposed.org/) — proof of an active module ecosystem; SystemUI hooks like Lockscreen Camera and Face Unlock Bypass live here.
- [Magisk changelog](https://topjohnwu.github.io/Magisk/changes.html) — v30.7 stable Feb 2026, ongoing canary.
- [Shamiko Magisk module (rushizgithub fork)](https://github.com/rushizgithub/shamiko) — community maintenance of root-hiding post-archival.
- [C10udburst/Grayscaler](https://github.com/C10udburst/Grayscaler) — Kotlin + Compose + AccessibilityService per-app grayscale, v1.0 Feb 2025. Reference implementation that proves the foreground-watcher + color-matrix pattern works.
- [BlueLightFilter Magisk module](https://github.com/NoneBaiano/BlueLightFIlter) — Magisk/KernelSU module that uses SurfaceFlinger color transforms system-wide. Proves the matrix-from-root pathway.
- [XDA: Adjust Screen Saturation](https://xdaforums.com/t/guide-adjust-screen-saturation.3997599/) — documents the `service call SurfaceFlinger 1015 i32 1 f ...` matrix command we'd use.
- [Android `UsageStatsManager` reference](https://developer.android.com/reference/android/app/usage/UsageStatsManager) — official API for usage-history panels.
- [Android `AccessibilityService` guide](https://developer.android.com/guide/topics/ui/accessibility/service) — the realtime foreground-window-change event source.
- [XDA: Install and root GrapheneOS with Magisk](https://xdaforums.com/t/install-and-root-grapheneos-with-magisk.4762986/) — proves rooted-Pixel pathway, even on top of Graphene if we ever want it. (We don't for v1 — stock Pixel firmware is simpler.)
- [XDA: Guide to Lock Bootloader while rooted](https://xdaforums.com/t/guide-to-lock-bootloader-while-using-rooted-grapheneos-magisk-root.4510295/) — relocking pattern via avbroot.
- [Magisk + AVBRoot Pixel guide](https://xdaforums.com/t/guide-on-how-to-root-graphene-os-with-magisk-using-avbroot-lock-your-bootloader-on-pixel-10-pro-xl-pixel-phones.4786210/) — recent (Pixel 10 era) confirmation the avbroot path is alive.
- [dikeboy/compose-launcher](https://github.com/dikeboy/compose-launcher) — reference Compose launcher.
- [Shelter work profile write-up](https://www.mgillion.be/articles/09-05-2025) — if we ever try to claw banking back into the device.
- [Genymobile/scrcpy](https://github.com/Genymobile/scrcpy) — the mirror tool that makes the dev loop pleasant.
- [Issuetracker: UsageStatsManager regression on recent Android](https://issuetracker.google.com/issues/490300839) — documents the Android 14+ realtime tightening; explains why AccessibilityService is the right call.
