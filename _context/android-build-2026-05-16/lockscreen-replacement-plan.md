# Real Lockscreen Replacement — Build Plan

**Written:** 2026-05-16
**Supersedes (for lockscreen scope only):** the v1 carve-out in `_context/android-build-2026-05-15/build-plan.html` that explicitly *cut* the SystemUI lock-screen replacement. We're now putting it back in.
**Status:** plan, not yet started. Sequential execution — prep fixes are S0, not a parallel side-quest.
**Hardware:** Pixel 6 (confirmed 2026-05-16). Pixel 8a/9 question is closed for v1.

---

## Goal in one line

Brian's Pixel 6 boots, screen-on shows our four-direction picker as the **actual lockscreen** (no real Android Keyguard visible behind), biometric unlock works, daily-drivable for a week without bricking.

## Success criterion (Brian, 2026-05-16)

> Brian carries this Pixel 6 (rooted, SIM in) as his only phone for 7 days, with intentions set on 5+ social apps. End-of-week: he opens IG/Twitter/etc less than he did before, and **the reduction doesn't feel like a fight**. Banking apps not working is a known annoyance, not a daily one. No daily moment where the phone itself frustrated him enough to consider reverting.

The **product** is "intention set upstream → device honors it downstream → I don't have to white-knuckle." The lockscreen replacement is the frame around that product, not the product itself.

**What this success criterion changes about priority:**

- **GrayscaleService working reliably on foreground switch** stops being a "verify this" bullet and becomes a v1 make-or-break, ranked alongside biometric unlock in importance.
- **Discover becoming interactive** (GRAY/OFF toggle, ramp editing, tap-to-launch) is the intention-setting UI — the *core product surface*. Priority-1 alongside the lockscreen work, not polish.
- **Lockscreen replacement** and four-direction picker are necessary-but-not-sufficient. They make the phone feel like ours; they don't deliver the success criterion alone.

**Failure modes named:**
- "Less compelling because the phone is broken / frustrating" = failure, not success.
- "I can never get into Instagram" = failure. Not building a blocker.
- "Works for a day, then I rip out my own intention" = failure of the intention layer. Implies intentions must be easy to *adjust* (low-friction edit via Discover), not just easy to *honor*.

## Two operating assumptions (Brian, 2026-05-16)

1. **Nothing works first time.** Every phase has a *spike* before a *commit*. Spikes are throwaway proofs that the next step is even possible. If a spike fails, we re-route, not push.
2. **Instances will hit context limits mid-task.** We need a continuity convention so a fresh instance can pick up without re-reading 50 files. See "Multi-instance continuity" below.

---

## Three substrate paths

### Path A — Magisk + priv-app on stock Pixel firmware (RECOMMENDED for v1)

Install our launcher into `/system/priv-app/` via a Magisk module, sign with platform cert (or use Magisk signature spoofing), grant signature-level perms (`BIND_KEYGUARD_APPWIDGET`, `STATUS_BAR_SERVICE`, etc.), disable SystemUI's `KeyguardService`, register our Activity to fire on screen-on.

- **Pros:** no OS fork. Existing launcher code reusable. Iterate via APK + module rebuild. Days, not weeks.
- **Cons:** platform-signing dragons. Boot loops possible. Biometric integration from a non-AOSP-blessed app is the real unknown.

### Path B — GrapheneOS source fork

Build the Pixel 6 ROM with our Keyguard substituted at source — replace `frameworks/base/packages/SystemUI/.../keyguard/` or wire it to host our Activity. Flash via factory image.

- **Pros:** clean. Code lives where Keyguard lives. All system integrations cooperate by default. Matches the v2 D2-overlay destination.
- **Cons:** AOSP build env, ~200GB source, multi-hour builds, security-patch merge cost forever.

### Path C — `FLAG_SHOW_WHEN_LOCKED` activity over real Keyguard (NOT recommended)

Trivial, no root, doesn't actually replace Keyguard — just decorates above it. Notification shade still shows the real lock screen behind. Doesn't achieve the feel.

### Recommendation

**Path A first, Path B as escape hatch.** If the Path A biometric spike fails, escalate. Don't half-do both.

---

## Spike-first phasing (with explicit fail-branches)

Every phase is **spike → verify → commit**. Spikes are <1 day. If spike fails, branch as noted.

### S0 — Prep fixes (first step, sequential)
**Goal:** ship the three known fixes before any new work, so the foundation we're building on isn't already broken.
- [ ] Fix drag-gesture direction-lock bug in `LockSurface.kt` (re-derive dominant axis each frame, not on first crossing).
- [ ] Fix first-frame black screen on launcher install.
- [ ] Fix orphan-sleep watchdog in `harness/run-goal.sh` (one-line fd redirect).
**Output:** clean emulator build, drag feels right, screencap on install is the lock surface (not black).
**Fail-branch:** if drag fix surfaces a deeper Compose gesture issue, time-box to 1 day and document. Don't let it block S1.

### S0.5 — Substrate decision
- [ ] Brian decides: stock Pixel firmware vs GrapheneOS as Path A substrate. (See "Open decisions" #1.)

### S1 — Biometric-from-rooted-app spike (THE critical spike)
**Goal:** Can a non-system APK on a rooted Pixel 6 call `BiometricPrompt` and get a fingerprint unlock? Yes/no/sort-of.
**Why first:** this is the most likely thing to kill Path A. If biometric only works from a true platform-signed system app, our cost goes up materially.
**Output:** a 1-page note + a tiny throwaway APK that demonstrates.
**Fail-branch:** if biometric only works as priv-app with platform signing, time-box the platform-signing effort to 2 days. If that also fails, escalate to Path B.

### S2 — Magisk module skeleton
**Goal:** install our existing launcher APK to `/system/priv-app/` via a Magisk module; confirm it still runs as a launcher.
**Output:** working module on Brian's Pixel 6.
**Fail-branch:** if priv-app placement causes the launcher to crash, that's likely a signing/permission cert mismatch — branch to investigate platform cert path (or fall back to Path B sooner than planned).

### S3 — Disable SystemUI Keyguard + register our Activity for screen-on
**Goal:** screen-on goes to our Activity, not Android's Keyguard. Even a black screen is success here.
**Output:** screen-on shows our app, even if it's broken.
**Fail-branch:** if disabling SystemUI keyguard cascades (notifications shade breaks, secure folder fails, banking detects root), document and decide which to live with. If it boot-loops, recovery-flash is the fallback (keep recovery image accessible — pre-stage in S0).

### S4 — Wire biometric unlock into our lock surface
**Goal:** fingerprint unlocks our surface, transitions to home.
**Output:** unlockable daily-drivable phone.
**Fail-branch:** if biometric is flaky, ship PIN fallback v1 and live with it for a week.

### S5 — Daily-drive for 5-7 days
**Goal:** Brian uses it. Journals what breaks, what's missing, what's wonderful. **The journal is the source of truth, not in-the-moment "this feels fine."** (Same dev-is-tester mitigation from the May 15 adversarial round.)
**Output:** prioritized punch list for S6.

### S6 — Triage + iterate
**Output:** v1.1 build.

---

## Multi-instance continuity convention

The problem: a Claude instance with 1M context will still hit its limit during a multi-day build. We need a way for instance N+1 to pick up where N left off without re-reading 20 files of background.

**Convention — adopt for this build:**

1. **One living state doc per active phase:** `_context/android-build-2026-05-16/state-S<n>.md`. Brief — what's done, what's in flight, what's blocked, what to do next, file:line refs to anything mid-edit. ~50 lines max.

2. **Soft handoff trigger at ~60% context budget:** when an instance notices its own context filling (rough heuristic: turn 40+ in a heavy session, or after any 10k+ token tool result), it stops, writes/updates the `state-S<n>.md`, then proceeds. Don't wait for the hard limit.

3. **Hard handoff at ~85%:** stop work, write a *complete* state-S<n>.md, append a `## Next-instance briefing` section (under 200 words: "you are picking up at X. Last thing tried: Y. Open question: Z. Don't re-read these files I already distilled."), terminate.

4. **Fresh instance protocol:** the *first* thing the next instance does — before any other read — is read `state-S<current>.md`. Then the briefing section. Only then does it consider any other files.

5. **Phase boundaries get a real handoff doc** (like the May 16 morning handoff). Living state is for *within* a phase.

6. **The `/goal` harness still owns the overnight-chain case.** This convention is for interactive multi-instance work during the day.

This is lightweight. We can refine after running it for one phase.

---

## Open decisions (Brian)

1. **Substrate for Path A on Pixel 6** — stock Pixel firmware or GrapheneOS underneath?
   - Stock = simpler, more familiar territory, banking apps closer to working (though out of v1 scope).
   - GrapheneOS = cleaner privilege model, matches v2 D2-overlay path, slightly more setup.
   - **My lean:** GrapheneOS. Same hardware, modestly more setup, much cleaner future.

2. **Biometric or PIN-only for v1?**
   - Biometric is the unknown (spike S1 resolves).
   - PIN-only is shippable today but feels like a step backward.
   - **My lean:** biometric primary, PIN fallback always present.

3. **Notification shade behavior on our lockscreen?**
   - Block entirely / peek-only / normal.
   - **My lean:** block on our lockscreen. Notifications surface inside the Connect surface instead. Coheres with "phone that cares" — no firehose-pulldown by default.

4. **Emergency call?**
   - Required by law in some places. Easy to forget until you need it.
   - **My lean:** punt v1, document. Brian is the only tester, low regret risk. Revisit before any wider testing.

5. **Daily-driver target date?**
   - Soft target — depends on S1 spike outcome.
   - **My lean:** name a *spike-resolution* date instead of a *daily-driver* date. "S1 resolved by D+3" is the meaningful milestone. Daily-drivable when S4 ships, which we'll know after S1.

---

## Hardware prep (Brian, can start any time)

- [ ] Pixel 6 ready (yours)
- [ ] Unlock bootloader: `fastboot flashing unlock` (**this factory-resets the phone — back up first**)
- [ ] Stage a Pixel 6 factory image + recovery image on the Mac. We **will** brick at some point and need a fast reflash path.
- [ ] If GrapheneOS path: install GrapheneOS via the official web installer.
- [ ] Install Magisk via patched boot image.
- [ ] Confirm `adb` + `fastboot` work against the device with USB-C.

---

## Risks I want named explicitly

- **Biometric** — most likely Path A killer. Spike first (S1).
- **OTA updates** — Magisk modules break on Android security updates. Plan: pin one Android version, update on your terms, accept the security tradeoff for v1 personal use.
- **Boot loops** — disable-keyguard could brick into needing fastboot reflash. Always keep recovery image staged.
- **Dev-is-tester trap** — same as last round. Journal is the mitigation. Trust the journal over in-the-moment intuition.
- **Banking apps detecting root** — out of v1 scope per the May 15 plan. Second phone for banking. Don't get pulled into fighting this in v1.
- **Scope creep into v2 territory** — every phase will surface "and also we should replace the notification shade / status bar / recents." Resist. v1 is lockscreen replacement + the four surfaces. Status bar, shade, recents stay stock until v2.

---

## What this plan deliberately doesn't try to do

- Replace SystemUI in full (notification shade, recents, status bar) — v2
- Banking apps — second phone, post-v1
- Matrix bridges for real Connect data — separate workstream
- Polish to React-mock fidelity — do on hardware in S5, not emulator

---

## What's next, concretely

1. Spawn an instance scoped to **S0 only** (the three prep fixes). Sequential — not parallel with planning. Writes `state-S0.md` and reports back.
2. Brian decides #1 (substrate) and #2 (biometric) in parallel with S0 if he wants, otherwise after.
3. Brian does hardware prep at his pace (bootloader unlock + factory image staging — see "Hardware prep" above).
4. Spawn an instance scoped to **S1 only** (biometric spike). Writes `state-S1.md`. Reports back with go/no-go for Path A.
5. Branch from there.

This sequencing means we don't commit to deep Magisk work until we know biometric is going to be a thing — and we don't build on a foundation with known bugs.
