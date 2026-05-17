# Path D2 — GrapheneOS substrate: the POSSIBLE case

**Author:** POSSIBLE advocate, 2026-05-15
**Audience:** Brian (taste-strong, Android-light)
**TL;DR:** Build on GrapheneOS, not against it. Specifically: **overlay first, fork only if overlay proves insufficient.** Pixel 9 (not the 6), relocked bootloader with GrapheneOS's own AVB key, banking via Sandboxed Play. This is the only path where v1 graduates into something a non-Brian user can actually carry.

---

## 1. Thesis

Path B (rooted Pixel + Magisk + DenyList) is a science experiment. Path D2 (GrapheneOS substrate) is the first version of a product. The whole point of the v1 prototype is to validate the *display-layer thesis* — that gradual grayscale plus a re-shaped lockscreen meaningfully changes how someone relates to their phone over ~2 weeks. That validation is worth almost nothing if the tester quietly stops using the device for banking, 2FA, or Wallet, because then we never learn whether the thesis survives contact with a real life — we only learn whether it survives contact with a *gimped* life. GrapheneOS is the **only** Android substrate in 2026 that (a) lets the bootloader relock with a non-Google AVB key (Android Verified Boot — the chain-of-trust that boot loaders check before running the OS), (b) passes Play Integrity's **basic** verdict, which is what the majority of consumer banking apps actually require, and (c) ships a Sandboxed Play Services compatibility layer mature enough that long-term user reports show Chase, Amex, Vanguard, Discover and most major US/UK banks working reliably. Choosing this substrate costs us 2-3 weeks of extra setup time relative to Path B; in exchange we get a v1 that has a credible v2 (a real product Brian could ship to ten testers) instead of a v1 that has a dead end.

## 2. Fork vs overlay — pick overlay

**Recommendation: D2-overlay. Do not fork.**

The fork option (D2-fork) is what the impossible-advocate will reasonably attack, and they will mostly be right. Forking GrapheneOS in 2026 is a bad-tasting move for three reasons:

1. **Maintenance cost is real and recurring.** SystemUI lives deep in `frameworks/base` and `packages/SystemUI`. Any non-trivial change to the keyguard or status bar creates merge conflicts on every AOSP monthly security bump. The AOSP customization literature is unambiguous: "modifying the Android source code to customize the System UI makes it more difficult and complex to apply future Android updates" — recommended practice is overlays in the `device/` or `vendor/` tree, not source-tree edits. ([Koenig Solutions](https://www.koenig-solutions.com/blog/aosp-development); [AOSP QnA](https://medium.com/@aruncse2k20/aosp-qna-part-4-71bda02fab67))
2. **The GrapheneOS social situation is bad for forkers.** Daniel Micay stepped down as lead in 2023 citing harassment, but project governance remains opaque; trademark and `android-prepare-vendor` access have been **explicitly denied** to CalyxOS and AOSP Alliance members. ([HN: anti-FOSS move](https://news.ycombinator.com/item?id=34800794); [robotnix issue #137](https://github.com/danielfullmer/robotnix/issues/137)) A friendly fork is possible technically; an *unfriendly* one is the default. We do not want to be in a public spat with GrapheneOS on day one of shipping a wellness-adjacent product.
3. **We don't need it.** Almost everything we want for v1 can ship as a **privileged system app overlay** installed on top of stock GrapheneOS:
    - Per-app grayscale: doable via `DisplayManager.setSaturationLevel` + `AccessibilityService` for app-foreground detection, or — better — a tiny privileged service that drives SurfaceFlinger's global color transform matrix when our target app is foregrounded. The 4x4 color transform Android already uses for color-blindness modes is the same primitive we need. ([Android frameworks/native color transform](https://android.googlesource.com/platform/frameworks/native/+/0147a17adb08a155e1d6f72e6ca5e794fc7f5cc4%5E!/))
    - Lockscreen: ship as a *replacement launcher + always-on-top activity* gated to the unlock event, not a `SystemUI.apk` swap. The four-direction picker is a launcher concern, not a keyguard concern, once we accept it as "the first screen after unlock" rather than "the lock screen itself."
    - Passive tracking: `UsageStatsManager`, granted via `android.permission.PACKAGE_USAGE_STATS`. Works on stock Android, works on GrapheneOS, no system mods needed.

The single thing overlay *can't* do cleanly is intercept the keyguard before unlock. That's fine for v1 — the Argos lockscreen lives one tap deeper, which is arguably more honest anyway (you decide what you're here for *after* asserting you're you, not before).

**If overlay hits a real wall — specifically, if SurfaceFlinger refuses per-app color transforms from userspace** — we fall back to a thin fork that only patches `SurfaceFlinger.cpp` to accept a per-package color matrix from a privileged binder service. That is a ~200-line patch, not a "fork the OS" project.

## 3. Evidence the components are mature

- **GrapheneOS Sandboxed Play + banking, 12-month report:** users on Pixel 7/8/9 running Sandboxed Play in a dedicated profile report stable operation of Chase, Amex, Vanguard, Discover, and most UK banks; the documented failure class is apps that demand `ctsProfileMatch` rather than basic integrity. ([Factually long-term report](https://factually.co/fact-checks/electronics-tech/long-term-banking-apps-reliability-grapheneos-12-months-2a6e29); [Factually compat overview](https://factually.co/product-reviews/electronics-tech/run-banking-drm-apps-on-grapheneos-play-services-options-977e84))
- **Play Integrity verdict on GrapheneOS:** passes `basicIntegrity` because the bootloader is relocked with GrapheneOS's AVB key and the OS is officially signed. Fails `ctsProfileMatch` (Google-certified-only) and `MEETS_STRONG_INTEGRITY` (Google-key-only). The first is what most banks actually check. ([GrapheneOS FAQ](https://grapheneos.org/faq); [GrapheneOS usage](https://grapheneos.org/usage))
- **Relocked bootloader with non-Google AVB key on Pixel:** Pixel 4 and newer support AVB 2.0 with a custom key slot (`fastboot flash avb_custom_key`). GrapheneOS, CalyxOS, and `avbroot`-patched ROMs all use this path in production. ([avbroot README](https://github.com/chenxiaolong/avbroot); [Gassmann relock writeup](https://n.ethz.ch/~tgassmann/blog/relocking-bootloader))
- **GrapheneOS device support in 2026:** Pixel 6/6 Pro/6a through Pixel 10 Pro Fold, plus Pixel Tablet/Fold. Pixel 6 security updates end October 2026 — usable for the 2-week tester window, but **buy a Pixel 8a or 9** if you want the device to outlive the experiment. ([GrapheneOS FAQ](https://grapheneos.org/faq); [Privacy Guides: Pixel 6 EOL](https://discuss.privacyguides.net/t/pixel-6-pro-supports-drops-in-oct-2026/34619))
- **SurfaceFlinger color transform is real and well-understood:** the same 4x4 matrix already powers Android's color-blindness accessibility modes and the system-wide grayscale toggle. We're not inventing the primitive, we're addressing it per-package. ([frameworks/native](https://android.googlesource.com/platform/frameworks/native/+/0147a17adb08a155e1d6f72e6ca5e794fc7f5cc4%5E!/))

## 4. The dev loop

Concrete commands and timings, assuming the new build server is a ~32-core box with 64+ GB RAM and fast NVMe (standard "beefy build server" config):

**Stock GrapheneOS install + relock (no build needed):**
```
# from a laptop, Pixel in bootloader mode
./bootloader-unlock
fastboot flash avb_custom_key avb_pkmd.bin
# flash factory image via web installer (grapheneos.org/install/web)
./bootloader-lock
```
Time: ~30 minutes end-to-end.

**Building GrapheneOS from source (only if we fall back to the thin fork):**
- AOSP full clean build on Google's 72-core machine: ~40 min. On a 32-core box: ~2-3 hours full, ~5-20 min incremental once `ccache` is warm. ([android-building thread on CPU count](https://groups.google.com/g/android-building/c/Q76dYAhwrkA))
- GrapheneOS-specific build doc walks through the toolchain. ([grapheneos.org/build](https://grapheneos.org/build))
```
source build/envsetup.sh
lunch ptc_oriole-user        # oriole = Pixel 6, replace with target
m -j$(nproc) target-files-package
./script/finalize.sh
./script/release.sh oriole   # signs with our own keys
```
- Flash: `fastboot update <release>.zip`, ~5 min.

**Iteration: the overlay app itself.** This is an Android Studio project that builds in seconds and installs via `adb install -r`. The full clean-install-test cycle on a stock GrapheneOS device is sub-minute. **This is where 95% of v1 development time actually lives.**

**Running multiple Claudes:** the build server is `ssh`-able from all of them; AOSP source tree lives there; incremental builds are cheap. The natural division is one Claude on the overlay (Compose, Argos hookups), one on system-app permissions and SurfaceFlinger access, one writing/running the install scripts and `avbroot` glue.

## 5. What we cut from v1 to land

Same cuts as Path B, plus one substrate-specific cut:
- **Cut feed blur.** Per-app blur needs either accessibility-tree walking (fragile, illegal-feeling on a privacy OS) or full-screen blur (unusable). Defer to v2.
- **Cut break cards.** Cross-app render injection. Same defer.
- **Cut three of the four lockscreen directions.** Ship **Connect** only.
- **Cut sandboxed-Play setup from the install script.** Document it, let Brian do it manually on first boot. Saves us automating an install flow we'll only ever run once.
- **Cut OTA infrastructure for v1.** Re-flash to update. Fine for one tester.

What we keep: per-app grayscale (ramped), passive tracking, the Connect direction, the per-app picker, banking working, Argos as the backend.

## 6. Counter-arguments

**"AOSP builds take forever, you'll burn weeks."** They take ~2-3 hours full on the build server and minutes incremental. We will probably do **zero** full builds for v1 if overlay works. Even the fallback (the SurfaceFlinger patch) is a single-file recompile. The Path B claim that "we'll iterate faster on a rooted phone" is true for *Magisk module* iteration but false once you count the time spent debugging DenyList breakage as social apps push new integrity checks.

**"GrapheneOS is politically unstable / one-person-dependent."** Micay stepped down publicly in 2023; the project has been shipping monthly Pixel-aligned updates for three years since, expanded device support to the full Pixel 10 line, and announced a Motorola partnership at MWC 2026. ([PiunikaWeb on Motorola deal](https://piunikaweb.com/2025/10/13/grapheneos-ending-pixel-exclusivity-new-oem/); [Privacy Guides on Micay stepdown](https://discuss.privacyguides.net/t/daniel-micay-publicly-steps-down-as-project-leader-of-grapheneos/12677)) The project has more institutional momentum now than when Micay was its sole face. The risk is real but mis-shaped: it's not *will GrapheneOS exist in 12 months* (yes), it's *will the maintainers be hostile if you publicly ship a product on top of it* (maybe — which is why we don't fork).

**"Fork maintenance is expensive."** Yes — which is why we're not forking. Overlay first.

**"Banking will still break sometimes."** Some apps (Robinhood historically, some EU neobanks, Wallet for tap-to-pay) genuinely don't work even with Sandboxed Play because they want `ctsProfileMatch` or hardware-backed strong integrity. We accept this. The v1 tester (Brian) keeps a second device or a card for tap-to-pay. This is a vastly smaller surface than what breaks under Magisk+DenyList, where the breakage is **adversarial and moving** (social-app vendors actively patch detection) instead of **static and known** (a specific list of strong-integrity-only apps).

**"You'll lose hardware attestation, so this isn't really 'secure.'"** Not the goal. v1 isn't a threat-model exercise, it's a UX experiment. The reason we want the GrapheneOS substrate isn't its security posture — it's its *signing posture*. Relockable with a non-Google key is the only path to a passable Play Integrity verdict on a modified OS. We're using GrapheneOS's signing chain, not its threat model.

## 7. Three risks I accept

1. **Sandboxed Play coverage is per-bank and shifts.** Brian's specific bank/brokerage/Wallet stack might land in the broken column. Mitigation: a 30-minute compat check against his actual apps before flashing the device. If his bank is in the known-broken set, defer to v1.5 with a profile workaround or carry a backup phone.
2. **SurfaceFlinger per-package color matrix may not be reachable from a privileged userspace service.** If it isn't, we fall back to the thin fork (~200-line patch in `SurfaceFlinger.cpp` plus a binder interface). Adds ~1 week. Still cheaper than the rooted-Pixel rabbit hole.
3. **Pixel 6 EOL (Oct 2026) is close.** Five months of remaining security updates on Brian's existing Pixel 6 is enough for a 2-week tester run, but if v1 succeeds and we want to give the device to a second tester in Q4, we need a Pixel 8a or 9 by then. Budget item: ~$500.

## 8. Why this is better than Path B even at higher cost

Path B's promise is "ship faster." That's true by maybe 2 weeks. Path B's cost is that **everything you learn from it is non-transferable**. A rooted Pixel with Magisk+DenyList is, by construction, a device only the developer can use. The DenyList game is adversarial; social-app vendors and Google's Play Integrity team are actively shipping countermeasures; any v1→v2 transition starts with "throw out the substrate." You are paying for the experiment twice.

Path D2 buys you a substrate where the v1 prototype, the v1.5 second-tester device, and the v2 sellable product are **the same artifact**. The lockscreen overlay, the per-app grayscale service, the passive-tracking dashboard, the Argos backend — every line of code written for v1 ships unchanged into v2. The only thing that changes between versions is which features get un-cut.

There's also a softer point worth naming: the *frame* of the product. Phone That Cares is "warm restraint, beauty over harshness, integration not restriction." Shipping it on a substrate famous for being more secure than stock Android — instead of one famous for being a rooting playground — is a frame choice that lines up with the thesis. Path B accidentally encodes "this is a hacker's project for people willing to break their phone." Path D2 encodes "this is what your phone could be if someone designed it for your nervous system." The substrate is part of the message.

The extra two weeks is the cost of admission to a product that has a future.

---

## 9. Citations

- [GrapheneOS FAQ](https://grapheneos.org/faq) — supported devices, Play Integrity verdicts, governance overview
- [GrapheneOS Usage Guide](https://grapheneos.org/usage) — Sandboxed Play, AVB
- [GrapheneOS Build Docs](https://grapheneos.org/build) — build prerequisites, signing
- [Factually: Banking apps on GrapheneOS, 12-month report](https://factually.co/fact-checks/electronics-tech/long-term-banking-apps-reliability-grapheneos-12-months-2a6e29)
- [Factually: Sandboxed Play setup for banking](https://factually.co/product-reviews/electronics-tech/setup-sandboxed-google-play-grapheneos-banking-apps-4b7723)
- [Factually: Supported Pixel models 2026](https://factually.co/fact-checks/technology/grapheneos-supported-pixel-models-2026-27329f)
- [Privacy Guides: Pixel 6 EOL October 2026](https://discuss.privacyguides.net/t/pixel-6-pro-supports-drops-in-oct-2026/34619)
- [Privacy Guides: Micay steps down as lead](https://discuss.privacyguides.net/t/daniel-micay-publicly-steps-down-as-project-leader-of-grapheneos/12677)
- [PiunikaWeb: GrapheneOS x Motorola 2026](https://piunikaweb.com/2025/10/13/grapheneos-ending-pixel-exclusivity-new-oem/)
- [avbroot — A/B OTA re-signing tool](https://github.com/chenxiaolong/avbroot)
- [avbroot supported devices](https://github.com/chenxiaolong/avbroot/issues/299)
- [Gassmann: Relocking the bootloader on a custom ROM](https://n.ethz.ch/~tgassmann/blog/relocking-bootloader)
- [XDA: Guide to lock bootloader with rooted GrapheneOS](https://xdaforums.com/t/guide-to-lock-bootloader-while-using-rooted-grapheneos-magisk-root.4510295/)
- [Android frameworks/native — per-display color transform commit](https://android.googlesource.com/platform/frameworks/native/+/0147a17adb08a155e1d6f72e6ca5e794fc7f5cc4%5E!/)
- [DeepWiki: SurfaceFlinger color management](https://deepwiki.com/jason-sophia/android-frameworks-native/2.3.3-color-management-and-hdr)
- [Koenig Solutions: AOSP development guide](https://www.koenig-solutions.com/blog/aosp-development) — SystemUI mod maintenance burden
- [AOSP QnA — SystemUI customization patterns](https://medium.com/@aruncse2k20/aosp-qna-part-4-71bda02fab67)
- [XDA: replacing SystemUI.apk](https://xdaforums.com/t/need-help-aosp-lineageos-how-do-i-use-my-own-modified-systemui-apk.4402781/) — signing-key constraint
- [android-building: AOSP build time vs core count](https://groups.google.com/g/android-building/c/Q76dYAhwrkA)
- [HN: GrapheneOS anti-FOSS move discussion](https://news.ycombinator.com/item?id=34800794) — fork relations
- [robotnix issue #137 — trademark/vendor-script restrictions vs CalyxOS](https://github.com/danielfullmer/robotnix/issues/137)
- [DivestOS vs CalyxOS vs GrapheneOS comparison](https://www.h25.io/tools/grapheneos-vs-calyxos-vs-divestos-for-darknet-work-in-2026-a-detailed-overview-of-pros-and-cons/)
