# Path B v1 — the IMPOSSIBLE case

*Adversarial counsel, 2026-05-15. Author: a senior Android engineer who's watched ambitious rooted-Pixel builds quietly degrade. The job here is to make the specific case against the timeline and shape, not to wave hands.*

---

## 1. Thesis

Path B v1 — rooted Pixel 6 + Magisk + Zygisk-DenyList + Shamiko + a Magisk module doing per-app grayscale via SurfaceFlinger + an LSPosed (an "Xposed" hook framework that lets modules patch Java methods in system processes at runtime) module replacing the SystemUI lockscreen — slips to **6–10 weeks**, not 2, and even then has a meaningful (~40%) probability of quietly degrading into "Brian's daily driver minus banking, minus one social app, minus reliable lockscreen, with a recovery event every ~4 weeks." The reason isn't any single hard problem. It's that this build sits at the intersection of four hostile maintenance treadmills (Play Integrity revocations, monthly Pixel patches, SystemUI ABI churn, and per-app foreground-detection races) where each treadmill has a half-life shorter than the time it takes Brian and Claude to ship a feature on top of it. The "v1 tester is the developer" frame then hides the breakage, because the developer's tolerance for "I'll just reflash" is roughly 50× a normal user's. The honest move is to scope v1 down before starting — pick the one piece of this that's load-bearing for the thesis (almost certainly per-app grayscale + passive tracking) and ship it as a Magisk module + a regular foreground app, no SystemUI hook, no lockscreen replacement, banking on a second device. Get the 2-week live test from *that*. Treat the four-direction lockscreen as v2.

---

## 2. What specifically breaks

Not "things might break." Specific, named.

**Strong Integrity is effectively gone for a rooted Pixel 6 in 2026.** As of Google's May 2025 policy change, `MEETS_DEVICE_INTEGRITY` requires a locked bootloader on Android 13+, and `MEETS_STRONG_INTEGRITY` requires a hardware-TEE (Trusted Execution Environment — a secure chip area; tl;dr "Google can cryptographically prove the bootloader is locked") signature plus a security patch from within the last year. ([Android Enterprise blog][1], [Approov][2]) The cat-and-mouse workaround is TrickyStore + a leaked OEM "keybox" (the cryptographic identity an OEM ships in each device), but Google revokes leaked keyboxes within days to a week ([XDA keybox-revocation guide 2025][3]). That means: every 1–4 weeks Brian is hunting for a fresh keybox or accepting that integrity has dropped.

**Specific apps that will refuse to run or run in degraded mode, even with Shamiko + DenyList:**
- **Revolut** — actively detects Zygisk and LSPosed modules; users report Shamiko doesn't work, requires switching to APatch or KernelSU + ZygiskNext, sometimes still fails ([XDA Revolut bypass][4], [XDA Revolut detects LSPosed][5]).
- **Wells Fargo, Venmo** — reject Zygisk-enabled devices outright; Shamiko "occasionally fails" per community reports ([Medium: Detecting Shamiko 2025][6]).
- **A long list of named banks** from the Zygisk-Assistant tracker with no known bypass: Crédit Mutuel, Commerzbank, HSBC India, Halifax, Kotak, YONO SBI, Singpass, Bet365 Authenticator ([Zygisk-Assistant issue #81][7]).
- **Pokémon GO** explicitly scans for `/system/bin/su`, Magisk Manager, and Play Integrity attestation failures; "uninstalling Magisk Manager fails in >94% of cases" per benchmarking cited in community writeups ([POGO root guide 2025][8]).
- **Snapchat** — officially does not support rooted devices; bypasses exist but are unreliable and break per Snapchat update ([Appuals Snapchat rooted][9]).
- **Genshin/HoYoverse games** ship `mhyprot2`, a kernel-mode anti-cheat that's "more aggressive than other industry-leading anticheat" ([meekolab analysis][10]).

So: assume the banking app *Brian actually uses* has a coin-flip chance of being on the broken list. If he banks with Chase, fine. If he banks with a European bank or uses Revolut, the "Shelter work profile / second cheap phone" fallback isn't a fallback — it's the *primary* path, and Path B v1 has just become "Path B v1 plus a second phone you carry," which is not actually a daily driver.

**SystemUI hook for the four-direction lockscreen is the single most fragile piece of the stack.** LSPosed stable releases break on Android version transitions and on QPR (Quarterly Platform Release) updates. The original `LSPosed/LSPosed` repo is no longer maintained — the maintained fork is `JingMatrix/Vector` ([Awesome Android Root LSPosed guide][11]). Android 14 introduced ART runtime changes and non-SDK interface restrictions that broke many SystemUI hooks; Android 16 QPR1 ("Material You expressive," Sep 2025) further rewrote SystemUI such that PixelXpert — the most-developed SystemUI-hooking module on Pixel — required a new major version line, and many features were removed entirely ([PixelXpert XDA thread][12], [PixelXpert repo][13]). The Sep 2025 patch broke LSPosed v1.10.2 outright; users had to pull GitHub Actions builds ([JingMatrix issue tracker][14]). Translation: building a *custom* SystemUI hook for the lockscreen on top of this is building load-bearing UI on a foundation that gets re-poured every quarter and sometimes monthly.

**SurfaceFlinger color matrix as a per-app grayscale mechanism is real but underspecified.** All the Magisk modules in this space (`SF Saturation Boost`, etc.) do a *single global* color matrix tweak via `service call SurfaceFlinger 1015` or a property like `persist.sys.sf.color_saturation` — system-wide, set once at boot ([Magisk Module SF Saturation][15]). The community per-app grayscale tools (`Grayscaler`, `GrayMan`, `Gray-Switch`) *do not* use SurfaceFlinger — they use an Accessibility service to detect foreground app + `WRITE_SECURE_SETTINGS` to flip the system-wide display color filter ([C10udburst/Grayscaler][16], [GrayMan flow][17]). And those tools document the exact race Brian will hit: when the grayscale-preference of a foregrounded pop-up differs from the background app, you get *"a tight loop of the pop-up closing and re-opening while the screen flickers between color and gray"* — mitigation is to ignore foreground changes for 2 seconds after a switch ([GrayMan flow][17]). That's the prior art telling you what your first month of debugging looks like.

---

## 3. The hidden taxes

**Pixel monthly patch cadence vs. Magisk/LSPosed recovery.** Pixel ships a security update on roughly the first Monday of every month. Several recent ones broke root or LSPosed:
- **Sep 2025 patch**: `init_boot.img` patching with Magisk 29 / 30.2 sent devices to bootloader; users had to flash stock and switch to KernelSU-Next ([XDA Sept 2025 root lost][18], referenced via search summary).
- **May 2025 anti-rollback**: permanent-brick risk on Pixel 6/6 Pro/6a/8/8a if you don't flash both slots ([XDA anti-rollback warning][19]).
- **Dec 2024 patch**: broke Magisk root on Pixel 6 Pro ([Magisk issue #5055][20]).

Realistic cost per recovery: 2–8 hours, plus the small but nonzero brick risk. Over a 12-week build window expect 1–3 recovery events. That is 4–24 hours of *pure tax*, not feature work.

**SystemUI ABI churn.** SystemUI's internal classes — `KeyguardViewMediator`, `NotificationPanelViewController`, lockscreen affordance classes — are non-SDK Java internals. Google rewrites or renames them between releases (and sometimes between QPRs) without warning. Every rename is a broken hook. PixelXpert's version table (separate branches for A12, A13, A13-QPR3+, A14, A15, A16, A16-QPR1) is the empirical evidence of this churn ([PixelXpert repo][13]). Brian's custom hook will need that same maintenance, on a one-person team.

**Pixel 6 OS support ending.** The Pixel 6 received its final OS update with Android 16 (Oct 2025); security patches continue through Oct 2026 ([endoflife.date Pixel][21], [Droid Life update timeline][22]). That's ~17 months of security-patch tax remaining, then the device is past EOL. If Brian wants a 12-month live test, he's running on EOL hardware for part of it, and the next round of testers can't use a Pixel 6.

**SELinux** (Security-Enhanced Linux — the policy layer that decides which process can talk to which other process) **denials accumulate.** Every Magisk module that needs to poke SurfaceFlinger via shell calls or root-spawned helpers is one `audit2allow` cycle away from a silent feature regression after a patch. This is mostly invisible until something stops working at 11pm.

---

## 4. Where the timeline lies

Subtasks Brian and Claude will underestimate, with realistic vs. optimistic estimates:

| Subtask | Optimistic | Realistic | Why |
|---|---|---|---|
| Initial root, Magisk, Zygisk-DenyList, Shamiko, integrity passing basic+device | 1 day | 2–4 days | Keybox sourcing, finding which Play Integrity Fix fork currently works, dealing with the boot-image flow for May 2025+ Pixel firmware |
| Per-app grayscale via SurfaceFlinger color matrix | 3 days | 2–3 weeks | Flicker race, 2s debounce tuning, handling notification overlays / popups / IME, behavior across rotation, AOD, ambient display. The hard part is "no one app's color filter clobbers a notification shade that's showing a chat preview from another app." |
| LSPosed module replacing SystemUI lockscreen with four-direction layout | 1 week | 4–8 weeks | Reverse-engineering Pixel SystemUI's keyguard classes, hooking without breaking biometric/PIN unlock, handling SIM PIN, emergency dial, secure notifications, charging UI, AOD. Plus regression on every patch. |
| Compose launcher (home / sessions / ask / conversations / people / notifications) | 1 week | 1–2 weeks | This part is honest — it's a normal Android app. But it's also the only piece that's normal. |
| Argos backend integration (already exists in telegram-agent) | 2 days | 4–7 days | Auth flow on-device, push channel, background sync without getting killed by Doze (Android's aggressive background-kill mode) |
| "Daily driver for 2 weeks" without the build collapsing | included | 3–4 weeks of stabilization *before* the 2 weeks start | This is the buried lede — see §5 |

**Total realistic: 9–18 weeks** before the 2-week test starts. The 2-week test is itself optimistic; one Pixel monthly patch lands during it.

The single subtask most likely to blow up by 5×: **the SystemUI lockscreen hook.** It is the closest thing in this plan to "build a custom kernel module for a moving target," and it's load-bearing for the most distinctive surface in the design.

---

## 5. The "developer is tester" hazard

Brian as v1 tester is reasonable for a *prototype* but actively dangerous for a *daily driver*. The known biases ([MeasuringU on bias][23], [Userpilot on dogfooding traps][24]):

- **Tolerance inflation.** Brian will reflash at 11pm and call it "fine." A normal v2 tester will return the device. The build will *feel* shippable when it isn't.
- **Workaround invisibility.** Brian will route around things ("oh, I just open the banking app on the old phone") and not log them as failures. The carry-a-second-phone fallback becomes invisible permanent infrastructure.
- **Context collapse.** Brian knows that "if SystemUI crashes, the lockscreen falls back to stock and you can still unlock with PIN." A real user sees their phone brick.
- **Selection of what to test.** Brian will use the phone in the ways he's been imagining for a year. He won't try to set up a new Wi-Fi network, restore from backup, factory reset, or hand it to his mother. The bugs hiding outside Brian's habitual paths stay hidden.
- **Sunk-cost framing of breakage.** After 8 weeks of build, "this small flicker isn't a real bug" is a near-irresistible read. It will be a real bug to user 2.

The historical pattern: dogfooding works for tools (IDEs, dev infra, where the dev *is* the user) and fails as primary validation for consumer products. Brian is building a consumer product. ([JetBrains dogfooding][25] is the positive case; note it's an IDE.)

---

## 6. Three places where the build silently degrades

The drift is the danger. Three named scenarios:

**Drift 1: "Banking on a second phone" becomes permanent.** Stated plan already includes Shelter work profile *or* a second phone as a fallback. The drift: Brian discovers Revolut + one bank don't work even in Shelter, picks up the second phone "just for this week," and 6 weeks later he's carrying two devices. The thesis is "a phone that cares" — a phone people *replace their phone with*. A two-phone solution is not that.
- **Early detection signal:** day 3 of daily use, audit which apps you opened on the second phone. If >1, the build's thesis is at risk.

**Drift 2: Four-direction lockscreen quietly becomes "lockscreen + 4 home-screen shortcuts."** When the SystemUI hook proves too fragile, the path of least resistance is to leave stock keyguard and put a four-quadrant launcher behind unlock. This is much easier and looks similar in screenshots, but it loses the design's whole point: that the *first thing you see on your phone* is the intentional surface. With stock keyguard you see notifications first, then the surface. The thesis is gone, but the demo still demos.
- **Early detection signal:** if at week 3 the lockscreen hook isn't reliably surviving a screen-off / screen-on cycle, abandon the hook for v1, ship the launcher path, and *say out loud* that v1 is no longer testing the load-bearing claim.

**Drift 3: "Per-app grayscale" becomes "global grayscale with a few allowlisted apps."** The flicker race + foreground-detection latency (200ms–1s depending on UsageStats vs. Accessibility) makes true per-app feel jittery. The natural retreat is to default-gray everything and only flip color for camera, maps, calendar. This is *Grayscaler* and *GrayMan* — it already exists, has existed for years, and the design thesis was that PTC's grayscale is *smarter* than that.
- **Early detection signal:** when Brian writes the first "allowlist" config (camera, maps), check whether the underlying mechanism is doing anything other than what off-the-shelf Grayscaler does. If not, the differentiation is gone.

The general pattern: each degradation independently looks reasonable. Together they collapse v1 into "rooted Pixel + off-the-shelf Magisk modules + a nice Compose launcher" — which is real, but is *not* what's being claimed when you say "real Android device, with a SIM, daily driver for 2 weeks tests the Phone That Cares thesis."

---

## What I'd actually recommend (since you asked for an honest engineer)

Don't kill Path B. Cut it.

**v1 (3–4 weeks, daily-driver-able):**
- Rooted Pixel 6, Magisk + Zygisk-DenyList + Shamiko, integrity at basic+device level only, no TrickyStore (don't fight that war for v1).
- Per-app grayscale as a *regular app* using AccessibilityService + WRITE_SECURE_SETTINGS, same mechanism as Grayscaler. Magisk module only if you need it; you almost certainly don't for v1.
- Passive tracking via UsageStatsManager (a normal app permission).
- Argos integration as a launcher app, not a SystemUI hook.
- **No lockscreen replacement.** Stock keyguard. Four-direction surface lives one swipe in.
- Banking: explicitly tested on Brian's actual bank *first*. If it fails, this is news, not a workaround.

**v2 (after the v1 live test): the SystemUI lockscreen.** That's the project. Don't put it inside v1.

This is the version where the 2-week live test actually validates something, and where one Pixel patch landing midway doesn't end the test.

---

## 7. Citations

[1]: [Google Play Integrity API behavioral changes — Android Enterprise community](https://www.androidenterprise.community/kb/announcements/google-play-integrity-api-behavioral-changes/11228) — official-ish notice of May 2025 policy: locked bootloader required for device integrity on A13+.

[2]: [The Limitations of Google Play Integrity API — Approov / Security Boulevard, 2025-11](https://securityboulevard.com/2025/11/the-limitations-of-google-play-integrity-api-ex-safetynet-2/) — hardware-TEE attestation for strong integrity, recent-patch requirement.

[3]: [Play Integrity Fixes: Surviving Google's Keybox Revocations 2025 — XDA](https://xdaforums.com/t/guide-play-integrity-fixes-surviving-googles-keybox-revocations-2025.4743738/) — leaked keyboxes revoked within days/week; the cat-and-mouse loop.

[4]: [GUIDE: bypass new Revolut root/custom firmware check — XDA](https://xdaforums.com/t/guide-how-to-bypass-new-revolut-root-custom-firmware-check.4716510/) — Revolut actively detects.

[5]: [Revolut app is detecting LSPosed modules — XDA](https://xdaforums.com/t/revolut-app-is-detecting-lsposed-modules.4681368/) — Revolut detects LSPosed presence, not just root.

[6]: [Detecting Shamiko & Zygisk Root Hiding on Android 2025 — Medium / Arnav Singh](https://medium.com/@arnavsinghinfosec/detecting-shamiko-zygisk-root-hiding-on-android-2025-the-definitive-developer-guide-71beac4a378d) — Wells Fargo, Venmo reject Zygisk; Shamiko fails for behavioral inconsistencies.

[7]: [List of apps that detect root — Zygisk-Assistant issue #81](https://github.com/snake-4/Zygisk-Assistant/issues/81) — named-app tracker: Crédit Mutuel, Commerzbank, HSBC India, Halifax, Kotak, Singpass, etc.

[8]: [Best Pokémon GO Spoofing Phones 2025 — pogospoofing](https://pogospoofing.com/pokemon-go-spoofing-phones-2025-rooted-devices-guide/) — Niantic detection scope; >94% failure rate of simple hiding.

[9]: [How to run Snapchat on rooted Android — Appuals](https://appuals.com/run-snapchat-rooted-android/) — Snapchat policy on rooted devices, bypass fragility.

[10]: [Analyzing Genshin Impact's Anticheat Module — meekolab](https://research.meekolab.com/analyzing-genshin-impacts-anticheat-module) — mhyprot2 kernel-mode anti-cheat aggressiveness.

[11]: [Complete LSPosed Framework Guide — Awesome Android Root](https://awesome-android-root.org/rooting-guides/lsposed-guide) — original LSPosed unmaintained; Vector is the live fork.

[12]: [Pixel Xpert Android 16 Compatible — XDA thread page 172](https://xdaforums.com/t/mod-xposed-magisk-android-16-compatible-pixel-xpert-system-modifications-for-pixel-phones-12.4421743/page-172) — A16 QPR1 broke many SystemUI features; separate version line required.

[13]: [PixelXpert GitHub repo](https://github.com/siavash79/PixelXpert) — version table evidence: A12, A13, A13-QPR3+, A14, A15, A16, A16-QPR1 each requires its own branch.

[14]: [LSPosed crash on A16 September patch — Vector issue #421](https://github.com/JingMatrix/Vector/issues/421) — Sep 2025 patch broke stable LSPosed; required Actions build.

[15]: [SF Saturation Boost Magisk Module](https://www.magiskmodule.com/sf-saturation-boost/) — typical Magisk SurfaceFlinger module: global, boot-time, not per-app.

[16]: [C10udburst/Grayscaler — GitHub](https://github.com/C10udburst/Grayscaler) — per-app grayscale via Accessibility + Shizuku + WRITE_SECURE_SETTINGS; no SurfaceFlinger, no root required.

[17]: [GrayMan: Grayscale Manager — LlamaLab Automate community](https://llamalab.com/automate/community/flows/48187) — documents the flicker race and 2-second debounce mitigation.

[18]: [Sept 2025 Security update — root lost — XDA](https://xdaforums.com/t/sept-2025-security-update-root-lost.4761002/) — concrete recent-patch-breaks-root incident.

[19]: [May 2025 BEWARE permanent brick anti-rollback — XDA](https://xdaforums.com/t/may-2025-and-newer-beware-of-permanent-bricks-if-you-dont-handle-the-anti-rollback-bootloader-correctly-on-all-pixel-6-6-pro-6a-8-8-pro-8a.4735780/) — brick risk on Pixel 6 line specifically.

[20]: [Pixel 6 Pro Dec update breaks root — Magisk issue #5055](https://github.com/topjohnwu/Magisk/issues/5055) — pattern of patches breaking Magisk.

[21]: [Google Pixel — endoflife.date](https://endoflife.date/pixel) — Pixel 6 final OS = Android 16; security patches end Oct 2026.

[22]: [Where are the Pixel 6 and Pixel 6 Pro Updates — Droid Life](https://www.droid-life.com/2025/10/09/where-are-the-pixel-6-and-pixel-6-pro-updates/) — Pixel 6 update cadence is already getting flaky as it nears EOL.

[23]: [9 Biases in Usability Testing — MeasuringU](https://measuringu.com/ut-bias/) — formal treatment of self-experimenter / dogfooding biases.

[24]: [Product Dogfooding in Software Development — Userpilot](https://userpilot.com/blog/product-dogfooding/) — "dogfooding should never eclipse user testing"; the insider-bias problem.

[25]: [Dogfooding at JetBrains — JetBrains blog 2026](https://blog.jetbrains.com/life-at-jetbrains/2026/05/dogfooding-at-jetbrains/) — the positive case (devs as users of dev tools); contrast with consumer-product case.
