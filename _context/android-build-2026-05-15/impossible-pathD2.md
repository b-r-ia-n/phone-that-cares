# IMPOSSIBLE — Path D2 (GrapheneOS substrate + fork or system-app overlay)

*An adversarial brief. Written to be argued with, not to win.*

## 1. Thesis

Path D2 isn't "Path B (rooted Pixel + Magisk) plus banking." It's a different category of project. Path B is "ship a Magisk module and an app." Path D2 is **"become an Android distribution maintainer who happens to also be doing product work."** That second job — tracking AOSP merges, tracking GrapheneOS merges, rebuilding the world every time Google ships a Pixel firmware update, re-signing OTAs, debugging Verified Boot failures at 2am — has eaten more ambitious solo Android projects than I can count. The trap isn't that Path D2 is impossible. It's that it's *plausible enough to start* and *expensive enough, in a slow-leaking way, that you don't notice you've stopped doing Phone That Cares until six months in.* The honest 2-week-daily-driver target with banking working is a fantasy on this path. Realistic floor is 2-4 months to first daily-driver, with banking still partially broken, and a permanent maintenance tax thereafter. Meanwhile, Path B gets you a wearable prototype in 1-2 weeks and tells you 80% of what you need to know about the thesis.

A brief glossary, since some of these terms are load-bearing and you (Brian) shouldn't have to take them on faith:

- **AVB** = Android Verified Boot. The chain of cryptographic signatures from the hardware-fused boot ROM up through the bootloader, kernel, and system image. "Custom AVB key" = you generate your own signing key, fuse its public hash into the Pixel's anti-rollback slot, and the bootloader will then refuse to boot anything you didn't sign.
- **Bootloader state colors** = green (booted with Google's key), yellow (booted with a known user key, your case), orange (unlocked, anything goes), red (signature failed). Yellow is the "I locked it with my own key" state.
- **SystemUI** = the Android process that draws the status bar, lock screen, notification shade, recents, quick settings. The thing you'd be modifying to put the four-direction lock screen in.
- **Play Integrity** = Google's successor to SafetyNet. The thing banks call to ask Google "is this a real, unmodified Pixel?" Has three verdict tiers — Basic, Device, Strong — which we'll come back to.

## 2. The Play Integrity reality on a fork

This is the single biggest landmine on Path D2, and it deserves the most attention because it's the one Brian is most likely to underweight.

**The plan as stated** — relock the bootloader with a custom AVB key, ship a forked GrapheneOS, expect Play Integrity to pass. Here's why that's three different problems stacked, not one:

**(a) MEETS_STRONG_INTEGRITY is hardware-attested against Google's signing keys.** Strong Integrity requires the device's hardware-backed Keymaster to produce an attestation certificate that chains up to Google's root. A custom AVB key gives you a *locked bootloader in yellow state* — which is good — but the hardware attestation certificate it produces will show the non-Google verified-boot key hash in the attestation extension. Apps that pin to "must chain to Google's root and show a Google-signed boot image" will reject this. Strong Integrity on a custom-signed ROM is, per the explicit consensus across GrapheneOS forums, XDA, and 2026 Play Integrity guides, **never passing** without spoofing — and spoofing requires Magisk or a similar root that itself breaks Strong Integrity.[^1][^2][^3]

**(b) GrapheneOS itself only passes by special arrangement.** GrapheneOS passes Basic and Device Integrity on stock GrapheneOS *because GrapheneOS the project negotiated with Google to whitelist their verified-boot key hashes in the hardware attestation root list, and because they ship sandboxed Play Services that present as a known-good environment.* Their official position is "apps should use the hardware attestation API and whitelist alternate OS keys"[^4] — which is them telling banks to do extra work, which most banks don't do. The privilege of "GrapheneOS passes integrity" does not transfer to "a fork of GrapheneOS passes integrity." The fork has a *different AVB key*, which means a *different attestation chain*, which means *not in the whitelist*. You would have to either (i) convince Google to whitelist your fork's key (they will not), or (ii) convince every bank you use to whitelist your fork's key independently (they will not — banks barely whitelist GrapheneOS itself, and only a handful of European banks have done so as of late 2025[^5]).

**(c) The trend is the wrong direction.** Google rolled out reCAPTCHA Mobile Verification in late 2025 / early 2026, which extends hardware attestation gating from banking apps to general web traffic — failed verification gets you a QR code asking you to re-authenticate on a Play-Services device.[^6] Cloud Fraud Defense (April 2026) makes Play Integrity load-bearing for many more app categories. The window where "custom ROM + spoofing module = working banking" is closing, not opening.

**Concrete prediction**: on a forked-GrapheneOS-with-own-AVB-key, you will pass Basic Integrity (which most apps don't care about), fail Device Integrity (which a meaningful minority require), and definitely fail Strong Integrity (which Chase, Wells Fargo, Cash App, Venmo, most US banks, and an increasing share of European banks require as of 2026). You will lose banking. You will *also* lose Uber driver verification, some 2FA apps, Google Wallet entirely, and an unpredictable rotating set of "we updated and now nothing works" apps you'll spend evenings debugging.

The absence of evidence is itself the evidence: search "successfully passed Play Integrity on a forked GrapheneOS with own AVB key" and you find people *asking* the question and being told no. The standard answer in the GrapheneOS forum is "use stock GrapheneOS or lose attestation."[^1][^7]

## 3. The maintenance treadmill

Even setting Play Integrity aside — say you accept banking breaks, which contradicts the stated D2 goal but let's grant it — there's the ongoing cost.

**LineageOS does an upstream AOSP merge every month**[^8], and that's their full-time job, with a global volunteer team, and they still ship security patches on a lag. **Google moved AOSP releases to a quarterly cadence in 2024 and a biannual cadence in 2025**[^9], which sounds like a maintenance gift but actually means Pixel firmware ships *more* out-of-tree changes between AOSP drops, so when AOSP catches up the merge conflicts are worse. **GrapheneOS rebuilds for each monthly Pixel firmware drop** — your fork would need to follow each of those, then merge in your SystemUI/grayscale changes, then re-sign with your AVB key, then push an OTA.

Pixel firmware updates monthly. If you skip an update, you fall off the security patch level and apps start refusing to install. If you take an update, you spend a chunk of a day on a merge that might fail. Historical reference: **/e/OS, CalyxOS, and DivestOS all run with paid or quasi-paid maintainers and still routinely ship security patches weeks behind upstream.** DivestOS shut down in early 2025, partly because the maintenance load was unsustainable for a small team. A solo maintainer with another full-time job (the actual product) is, historically, not who finishes this race.

Your SystemUI modifications are the worst kind of merge surface, too. SystemUI is one of the most-modified components in AOSP between releases — Material You themes, lock-screen redesigns, quick-settings rearchitecture have all happened in the last three Android versions. Every one of those upstream changes will conflict with your four-direction-lock-screen patch. Plan to re-port your changes every release.

## 4. The GrapheneOS political risk

This matters less than the technical points but it's a real factor.

Daniel Micay stepped down as GrapheneOS lead in May 2023 after sustained harassment including swatting attacks.[^10] The project transitioned to a four-director foundation board requiring 3-of-4 agreement for major decisions.[^11] In April 2025 one of the two remaining senior developers was conscripted into an active war and lost repository access for an extended period.[^12] The project ships, but it ships from a very small team with a thin bus factor and a history of public drama (Micay was famously combative; the project has banned and publicly attacked critics, including Privacy Guides moderators[^13]).

GrapheneOS's public stance on people building on top of them is: **"we are not affiliated with and do not endorse any company selling devices with GrapheneOS,"** they will not help you with your fork, they will not whitelist your AVB key with Google, and historically they have been *publicly hostile* to commercial downstream users and to French government-adjacent forks.[^14] Brian, you are not building a commercial product or a government fork, but you are exactly the kind of "I forked GrapheneOS and modified the security model" person they have called irresponsible in the past. Don't expect help in their forum.

The structural risk: GrapheneOS could fragment, change governance, or relicense (the codebase is permissive, so a hostile relicensing would only affect future work, but it would still hurt — and the project leadership has discussed protective measures). If your product depends on tracking upstream GrapheneOS, you take on whatever volatility they have. That's a small probability of a large cost. It's not zero.

## 5. The "AOSP build server" reality

The beefy build server is real and helps. It doesn't help as much as it sounds.

**First-build time on AOSP for a Pixel target with a 72-core machine and 64 GB RAM: ~40 minutes, per Google's own published numbers.** On a 6-core machine: ~6 hours.[^15] You said "beefy build server coming online" — assume you can get to the ~1-2 hour mark for a clean build. **But:**

- **First-build assumes a healthy tree, healthy toolchain, healthy network.** Real first builds in my experience are 1-3 *days*, not 1-2 hours, because you spend the time fixing Java version mismatches, missing build deps, kernel-prebuilt SHA failures, repo-sync flakiness, vendor blob extraction, and Pixel-specific firmware patches that don't apply cleanly. The 40-minute number is "after you have a working tree."
- **Incremental builds are fine.** Touching SystemUI: 5-15 minutes. Touching framework: 20-40 minutes. That part is OK.
- **Hidden cost #1: OTA generation.** Building a flashable, signed OTA with your custom AVB key is its own multi-step pipeline. AVBRoot, OTA tools, signing, vbmeta generation. Each step has its own failure modes.
- **Hidden cost #2: Cloud bill.** A c5.24xlarge on AWS is $4.08/hour on-demand, ~$3000/month if you leave it on, ~$600/month if you spin it up on demand for daily builds.[^16] Spot pricing or self-hosting (you have a build server) helps, but storage for AOSP trees is also nontrivial — ~400GB per branch, and you'll want multiple branches.
- **Hidden cost #3: The Pixel 6 is aging.** Google ended guaranteed security updates for the Pixel 6 in October 2024. Pixel 6 is on extended community support via GrapheneOS but GrapheneOS itself has signaled the older Pixels are becoming maintenance burdens. Forking from a substrate that's deprecating its support for your hardware is a slow-motion dead end. Plan to switch to a Pixel 8 or 9 within a year, which means another round of bring-up.

## 6. Specific timeline reality

Realistic schedule for an experienced solo Android engineer (Brian is not that, though he has Claudes — and Claudes are not great at multi-day AOSP debugging because the feedback loop doesn't fit in a context window):

| Phase | Optimistic | Realistic |
|---|---|---|
| Get a clean stock GrapheneOS build to flash and boot | 3 days | 1-2 weeks |
| AVB custom-key signing pipeline working, bootloader relocked | 2 days | 1 week |
| SystemUI modifications for one lock-screen direction | 1 week | 3-4 weeks |
| System-level grayscale (color matrix in SurfaceFlinger or DisplayManager) per-app | 3 days | 1-2 weeks |
| Argos launcher app (Compose, reusing backend) | 1 week | 2-3 weeks |
| Banking apps actually working | Never (per §2) | Never |
| First daily-driver build that doesn't brick on OTA | 2 weeks | 6-10 weeks |
| Stable enough for a 2-week live trial | 4 weeks | 3-5 months |

The "realistic" column assumes nothing else goes wrong. Something will. Add 30%.

## 7. What this displaces

This is the part that actually matters, more than any single technical claim above.

If Brian spends 3-5 months on Path D2, here's what doesn't happen:

- **Argos doesn't get the per-app picker, the new lock-screen surface as an Argos artifact, the broader user base it could have.** Argos is the workstream with the most actual users and momentum.
- **The publishing bottleneck stays the bottleneck.** The state-of-project explicitly names publishing — essays, outreach — as the real bottleneck. None of that ships from inside an AOSP debugging session.
- **The Android *thesis test* gets delayed, not accelerated.** Path B (Magisk + DenyList + LSPosed) gets a working grayscale-per-app prototype on Brian's phone in 1-2 weeks, with banking still working, with a real tester (Brian) able to live with it. That's the actual hypothesis test. Path D2 delays the hypothesis test in service of also testing "can we relock the bootloader," which is a separate question that doesn't need to be answered now.
- **Strategic optionality.** If Path B's prototype reveals that grayscale alone moves the needle, you have hard evidence to justify a v2 that *might* warrant Path D2's investment — or might warrant partnering with someone who already maintains a fork, or might warrant a different platform shift entirely. Doing D2 first burns the option to learn before committing.

The deepest problem with Path D2 isn't that it fails. It's that it succeeds *just enough* to keep you on it. You'll get the lock screen working in month 2 and that win will make month 3 feel justified, and so on, and the thesis itself goes uncontested the whole time.

## 8. Where Path B is actually the right answer — and where it isn't

To be honest about the alternative:

**Path B (rooted Pixel + Magisk + Zygisk-DenyList + LSPosed) genuinely shines for:**
- Time to first working prototype (1-2 weeks).
- Iteration speed (rebuild a Magisk module, push, reboot — minutes).
- Banking compatibility *for now* — DenyList + Play Integrity Fix passes Basic and (currently) Device Integrity on many apps. This is the part that's slowly degrading, but for a 2-week trial in mid-2026, it works.
- Reversibility — Brian can return the phone to stock in an hour if it goes badly.
- Honest scope match — it tests the display-layer thesis without taking on OS-distribution work.

**Where Path B is genuinely weaker:**
- **Strong Integrity is dead on arrival** on rooted devices too. If a target tester uses an app that requires Strong Integrity (some US banks, Google Wallet, some corporate MDM apps), Path B can't help them either. So §2 is partly a wash — *neither path passes Strong Integrity*. The difference is that Path B fails fast and cheap, and Path D2 fails slow and expensive after months of work.
- **SystemUI changes are harder.** Real four-direction lock screen on Path B requires either replacing the lock screen via a launcher-like Accessibility hack (fragile) or LSPosed hooks into SystemUI (works but limited). Path D2's clean SystemUI fork is genuinely better here — *if* you ever ship it.
- **System-wide grayscale is slightly hackier on Path B** — you'd use the existing Android color-correction accessibility setting toggled by an app, or a Magisk module that pokes SurfaceFlinger. Both work. Neither is as clean as a fork-level patch.

The honest framing: Path D2 is a better v2 if the v1 thesis lands. **Don't make it the v1.**

## 9. Citations

[^1]: GrapheneOS Discussion Forum, "Workaround for Play Integrity on GrapheneOS — Possible?" — https://discuss.grapheneos.org/d/23977-workaround-for-play-integrity-on-grapheneos-possible
[^2]: XDA Forums, "Play Integrity in 2026: Basic vs Device vs Strong" / "How to Pass Strong Integrity" — https://xdaforums.com/t/guide-how-to-pass-strong-integrity-on-android-step-by-step-guide.4729435/ ; https://www.privacyportal.co.uk/blogs/free-rooting-tips-and-tricks/play-integrity-in-2026-basic-vs-device-vs-strong-what-actually-matters
[^3]: Mayrhofer, "Android System Integrity: Comparing Key Attestation and the Play Integrity API" (academic, 2024) — https://www.mayrhofer.eu.org/courses/android-security/selected-paper/2024/Comparing_key_attestation_and_Play_Integrity_API.pdf
[^4]: GrapheneOS, "Attestation compatibility guide" — https://grapheneos.org/articles/attestation-compatibility-guide
[^5]: GrapheneOS on X, May 2025: "Multiple prominent banking apps in Europe have already implemented support for GrapheneOS via hardware attestation. The pace of apps adopting the Play Integrity API is unfortunately currently faster than apps adding support for GrapheneOS." — https://x.com/GrapheneOS/status/1925728241421062354
[^6]: WebProNews / ComplianceHub coverage of Google reCAPTCHA Mobile Verification and Cloud Fraud Defense rollout, late 2025 / April 2026 — https://www.webpronews.com/google-and-apple-tighten-grip-on-device-verification-grapheneos-warns-of-locked-out-alternatives ; Android Authority, "Google Play's latest security change may break many Android apps" — https://www.androidauthority.com/google-play-integrity-hardware-attestation-3561592/
[^7]: GrapheneOS Discussion Forum, "Non-stock Android Verified Boot key" — https://discuss.grapheneos.org/d/15389-non-stock-android-verified-boot-key ; "Play Integrity MEETS_DEVICE_INTEGRITY" — https://discuss.grapheneos.org/d/18118-play-integrity-meets-device-integrity
[^8]: LineageOS, `scripts/aosp-merger` — https://github.com/LineageOS/scripts/tree/master/aosp-merger ; LineageOS Changelog 30, 31 — https://lineageos.org/Changelog-30/ , https://lineageos.org/Changelog-31/
[^9]: DEV Community / industry reporting, "Google Just Cut Android's Open Source Releases in Half" — https://dev.to/armanalahi/google-just-cut-androids-open-source-releases-in-half-and-nobodys-happy-about-it-3kjk
[^10]: Hacker News thread / Privacy Guides Community, "Daniel Micay publicly steps down as project leader of GrapheneOS" (May 2023) — https://news.ycombinator.com/item?id=36089104 ; https://discuss.privacyguides.net/t/daniel-micay-publicly-steps-down-as-project-leader-of-grapheneos/12677
[^11]: Lemmy.ca, "Daniel Micay Steps Down As Lead Developer Of GrapheneOS and as Foundation Director" — https://lemmy.ca/post/568614 ; Factually, "Has the GrapheneOS core developer team changed since 2023?" — https://factually.co/fact-checks/technology/grapheneos-core-developer-team-changes-2023-2025-147a92
[^12]: Factually, "Who runs GrapheneOS after Daniel Micay" — https://factually.co/fact-checks/technology/who-runs-grapheneos-after-daniel-micay-14e426
[^13]: Michael Altfield, "Why I was banned from GrapheneOS by Daniel Micay" (Aug 2025) — https://tech.michaelaltfield.net/2025/08/19/grapheneos-daniel-micay-banned/
[^14]: ComplianceHub, "France's Encryption War Escalates: GrapheneOS Exodus" — https://compliancehub.wiki/frances-encryption-war-escalates-grapheneos-exodus-signals-dangerous-precedent-for-open-source-privacy-tech/ ; GrapheneOS FAQ — https://grapheneos.org/faq
[^15]: Pratik Mahalle, "Why AOSP Builds Take Forever" (Medium) — https://pratikmahalle.medium.com/why-aosp-builds-take-forever-and-what-you-can-actually-do-about-it-c077c40797ee ; Centennial Software, "Building Android (AOSP) for emulator and Pixel devices" — https://www.centennialsoftwaresolutions.com/help/building-android-aosp-for-emulator-and-pixel-devices/ ; Google groups, "AOSP build time vs CPU core count" — https://groups.google.com/g/android-building/c/Q76dYAhwrkA
[^16]: AWS EC2 c5.24xlarge pricing (96 vCPU, 192 GiB, ~$4.08/hr on-demand, ~$2,978/mo) — https://www.economize.cloud/resources/aws/pricing/ec2/c5.24xlarge/
