# Android v1 — System Architect Notes

**Purpose:** living reference for Android-OS constraints relevant to PTC v1 + the accumulated architectural decisions made during the build. Read first by any working instance. Updated by the most recent instance to touch a given decision (and by the `architect-agent` whenever it answers a novel question).

**Scope:** Android v1 only. v2 (D2-overlay / GrapheneOS full-substrate) gets its own notes when we start it.

**Last updated:** 2026-05-16 (evening — substrate + biometric decisions locked, lockscreen-replacement scope clarified)

---

## Guiding principle — mirror normal Android by default

Unless there's a *specific* reason to deviate (the design vocabulary calls for it, a v1 success condition requires it, an Android constraint forces it), **default to behaving exactly like stock Android does.** Notification shade, status bar, recents, settings deep-links, accessibility, audio behavior, charging UI, lock-to-app, screen rotation — all default to stock unless we have a positive reason.

Why: stock Android is "for the most part well-enough designed" (Brian). Inventing new behavior in places that aren't load-bearing for our thesis is scope creep that adds bugs without adding product. The product is the four-direction lockscreen, the intention-honoring grayscale/launch-blocking, and the notification filter — *everything else is plumbing that should feel like a normal phone.*

Practical implications for design / engineering decisions:
- When in doubt about "should X behave like stock or differently," the answer is "like stock" until someone writes a one-sentence justification for differing.
- When implementing a new surface, the first question is "what does stock do here?" — not "what would be most elegant?"
- This principle is the tie-breaker in ambiguous design conversations.

## North star

**Product:** social media on Brian's phone feels less compelling when he's said he wants it to. Intention upstream → device honors it downstream → no white-knuckling.

The launcher and lockscreen replacement are the *frame*. The GrayscaleService + per-app intent state is the *product*. Don't lose this when making technical tradeoffs.

Full success criterion: see `lockscreen-replacement-plan.md` — "Success criterion."

---

## Locked-in decisions (with reasoning)

### Hardware: Pixel 6
- **Decided:** 2026-05-16
- **Why:** already in hand; v1 path is rooted-with-Magisk, Pixel 6 has well-trodden Magisk path; banking out of v1 scope so latest-gen Tensor not needed.
- **Implication:** all factory image / Magisk / GrapheneOS work targets `oriole` codename.

### Substrate path: Plan A (Magisk + priv-app on **stock Pixel firmware**) → Plan B (stock AOSP source fork)
- **Decided:** 2026-05-16 evening (revised — flipped from earlier-evening "Graphene for Plan A"). Brian.
- **Plan A:** Stock Pixel firmware on Pixel 6, Magisk for root, our launcher as priv-app via Magisk module, SystemUI Keyguard disabled / substituted. Reuses existing launcher code.
- **Plan B (fallback if Plan A hits a wall):** source fork of stock AOSP. Modify SystemUI Keyguard at source, flash via factory image.
- **Why stock-firmware for Plan A (revised reasoning):** Biometric-as-unlock-authority is the gating UX question for v1, and stock has the broadest reference base for "Magisk priv-app doing system-level things including biometric unlock." Graphene + KitsuneMagisk is doable but less-trodden, which introduces substrate-vs-our-code ambiguity exactly where we can least afford it (during S1 spike). Pick the most-documented path; let v2 be the GrapheneOS conversation.
- **Why stock-AOSP for Plan B (not Graphene-fork):** same reasoning as before — most documentation, broadest reference base for source-level Keyguard surgery.
- **GrapheneOS is deferred to v2.** Alongside the rest of the privacy / hardened-substrate work. Not abandoned, not lost — just not v1's lever.
- **Implication:** all next steps assume Plan A (stock + Magisk + priv-app). The fs-verity-on-Graphene wrinkle disappears with this flip. Magisk install path on stock Pixel 6 is well-trodden — `boot.img` patch via Magisk app, fastboot flash.

### Known Plan-A risks (stock substrate)
- **Magisk module priv-app placement** — well-trodden on stock Pixel 6. The remaining risk is whether Android 14+ priv-app permission whitelisting (XML in `/etc/permissions/`) plus signature-level perms is sufficient for Keyguard substitution, or whether platform-cert signing is additionally required. **This is the S1b spike question.**
- **Per-app grayscale** — AccessibilityService approach (no Zygisk needed) is the primary path on stock too. Same risk as before: foreground-switch latency on real hardware unknown until tested.
- **OTA updates breaking Magisk** — same risk as before. Mitigation: pin Android version, update on Brian's terms.

### Banking apps: nice-to-have, not a v1 priority (refined 2026-05-16 evening)
- **Decided:** 2026-05-15, refined 2026-05-16 evening. Brian.
- **Stance:** if banking apps happen to work on our default Plan A setup, great — install a couple and see. If they don't work, we ditch them without trying to fix. Brian has a second phone for banking; v1 success doesn't require it. The thing we explicitly *don't* do is spend engineering on DenyList polish or Play Integrity workarounds to make banking work.
- **Implication:** include 1-2 banking apps in the test-install batch and observe — that's the engineering budget. Don't go further. If a banking app shows up as a daily-life blocker for Brian in S5, treat as a "use second phone" cue, not a backlog item.

### Lockscreen replacement is back in scope — *genuine Keyguard substitution*
- **Decided:** 2026-05-16, reaffirmed evening. Originally cut in the May 15 plan as "four-direction picker is the first screen after unlock, not a literal lock-screen swap." Brian wants the real thing.
- **Why:** "this doesn't feel like a full OS behind it" — the gap between "launcher app" and "phone" is most felt at the lockscreen boundary.
- **What "genuine" means here:** SystemUI's Keyguard is *disabled or substituted*, not decorated above. `FLAG_SHOW_WHEN_LOCKED` over a still-running Keyguard (Path C in the lockscreen plan) is explicitly NOT what we're building. The notification shade pulling down on top of our surface and revealing the real lock surface underneath is a failure case.
- **Implication:** the priv-app must claim Keyguard-equivalent system perms, and the screen-on / wake / unlock flow must terminate at our Activity, not bounce through Android's Keyguard. This is the load-bearing technical lift of v1.

### Biometric primary as the goal
- **Decided:** 2026-05-16 evening. Brian.
- **Stance:** the v1 unlock UX is fingerprint-first with PIN fallback. PIN-only is a degraded outcome we'll only accept if the S1 spike says biometric-as-unlock-authority cannot be done from our app.
- **Two distinct biometric questions** (don't conflate when running S1):
  1. *Can our app read the fingerprint sensor?* — `BiometricPrompt` (API 28+) makes this a yes on third-party apps. No root needed. This is not the unknown.
  2. *Can our app be the device's unlock authority?* — i.e. fingerprint to our app actually transitions the device from "locked" to "unlocked" state, dismisses Keyguard, lets the home surface receive input. This is the unknown the S1 spike resolves. It's a Keyguard-substitution question, not a fingerprint-API question.
- **Implication for S1 design:** the spike must measure end-to-end device-unlock, not just "BiometricPrompt returned success." Specifically: after biometric success, can our Activity receive `Intent.ACTION_USER_PRESENT`-equivalent state and can the user reach any installed app without re-encountering Keyguard?
- **Pixel 6 caveat:** under-display optical sensor is slower/flakier than capacitive. Expect imperfection at the hardware layer regardless of software.

### Spike-first phasing
- **Decided:** 2026-05-16. Every phase = spike → verify → commit. Spikes <1 day, throwaway.
- **Why:** "nothing works first time" — Brian's explicit assumption. Avoid committing to expensive paths before the critical unknowns resolve.
- **Implication:** S1 (biometric spike) gates the whole Path A bet.

---

## Open decisions (waiting on Brian)

1. ~~Substrate under Plan A~~ — **decided 2026-05-16 evening: GrapheneOS.** See "Substrate path" above.
2. ~~Biometric vs PIN-only for v1~~ — **decided 2026-05-16 evening: biometric primary as the goal; PIN fallback always present; degrade to PIN-only only if S1 forces it.** See "Biometric primary" above.
3. ~~Notification shade on our lockscreen~~ — **decided 2026-05-16 evening:** **kept, by default principle.** Notifications on the lockscreen surface, the pull-down notification shade, and all stock notification behaviors stay as stock Android does them. The product-distinguishing layer is the user-defined LLM filter (Discover settings → natural-language prefs → per-notification evaluation), which determines *which* notifications reach the lockscreen / heads-up — not what the shade itself looks like. See "Notification filter" section below.
4. ~~Emergency call handling~~ — **decided 2026-05-16 evening:** lean toward include in v1. Treat as standard required surface. Punt only if it becomes a genuine blocker during S3/S4 implementation, not preemptively.

---

### Notification filter (decided 2026-05-16 evening)
- **What it is:** in Discover's notifications page (settings), the user describes in natural language what notifications they want on the lockscreen — e.g. "let me know if Caroline texts or I get a LinkedIn message; don't notify me of Twitter notifications or Instagram followers."
- **How it evaluates:** at notification arrival, an LLM call (Claude Haiku candidate — fast, cheap) takes the notification's source app + content + the user's preferences string → returns show/hide. Hidden notifications still surface in the notification shade pull-down (no information loss), they just don't appear on the lockscreen surface or as heads-up.
- **Why v1:** Brian wants this in v1, not punted. The placeholder text in Discover's notifications page already shows the vibe; we're activating it.
- **Risks to surface:**
  - **Latency.** Every notification triggers an LLM call → must be sub-300ms-perceived to not feel laggy. Mitigation: cache per (app, content-pattern) decisions aggressively; show notification optimistically + retract if filter rejects; or batch evaluate.
  - **Battery / cost.** A notification-heavy day could mean hundreds of LLM calls. Caching most-common patterns and using Haiku-tier model keeps cost minimal but battery via radio/wake is the concern. Worth measuring in S5.
  - **Failure mode.** If LLM is unavailable (offline, rate-limited), default = show all (safe direction — user can manually filter). Never silently drop a notification on LLM failure.
- **v1 vs follow-up:** v1 ships the scaffolding — settings UI in Discover, stub filter that keyword-matches the preferences string, real LLM hookup if there's overnight time. The actual LLM-per-notification flow can land in v1.1 if v1 ships sooner.

## Android-OS constraint reference

### Keyguard
- Lives in SystemUI (`frameworks/base/packages/SystemUI/.../keyguard/`).
- To replace from outside SystemUI, you need either signature-level permission (priv-app + platform cert) or to disable SystemUI's KeyguardService via `pm disable` and substitute.
- `FLAG_SHOW_WHEN_LOCKED` on a regular activity does NOT replace Keyguard — it decorates above it. Real Keyguard is still underneath.

### Biometric
- `BiometricPrompt` (API 28+) is the modern, app-facing API. *Open question:* does it work from a non-AOSP-blessed app on a rooted Pixel 6? **This is S1.**
- Lower-level FingerprintManager is deprecated since API 28 but might be the fallback if BiometricPrompt fails on rooted devices.
- Pixel 6 fingerprint is under-display optical — known to be slower/flakier than capacitive. Brian should expect imperfection.

### Per-app grayscale (the product-critical capability)
- AccessibilityService can flip `Settings.Secure.accessibility_display_daltonizer_enabled` and `accessibility_display_daltonizer`.
- Does **NOT** require root.
- We have this implemented (`GrayscaleService.kt`, 112 lines) but **never verified on real device that toggling on foreground change works at acceptable latency.** This is the #1 product risk after biometric.
- Magisk-installed SurfaceFlinger module is the polish path if AccessibilityService approach is too laggy — listed in original Path B-cut as optional polish.

### Magisk + system app installation
- Magisk modules can place APKs in `/system/priv-app/`. Survives reboots, gets system-app status.
- Platform signature can be either: built into the module (sign launcher with platform cert), or spoofed via Magisk's signature spoofing (older, may not work on current Android).
- Banking apps detect Magisk; mitigated by DenyList per-app. Out of scope for v1 (banking out of scope generally).
- Magisk modules break on OS security updates. v1 plan: pin one Android version, update on Brian's terms.

### Boot loops and recovery
- Disabling Keyguard could brick into needing fastboot reflash. Always stage Pixel 6 factory image + recovery image before any system-app work.
- `fastboot flashing unlock` factory-resets the device. Back up first.

### What we don't need to touch in v1
- Notification shade (stays stock)
- Status bar (stays stock; we may render our own on the lockscreen surface)
- Recents (stays stock)
- Settings app (stays stock)
- Play Services (stays stock — banking out of scope so Integrity not fought)

---

## Current technical risks ranked

1. **Biometric from non-AOSP-blessed app on rooted Pixel 6** — gates Path A entirely. S1 spike.
2. **GrayscaleService latency on real foreground switch** — gates the product success criterion. Verify on hardware ASAP after S2.
3. **Disabling SystemUI Keyguard cascade effects** — may break secure folder, notification shade, biometric trust. Investigate during S3.
4. **Boot loops from system-app installation** — recoverable but eats a day each time. Mitigation: pre-stage recovery, change one thing at a time.
5. **OTA updates breaking Magisk** — long-term risk, mitigated by version-pinning. Not an immediate blocker.

---

## Multi-instance continuity convention (mirrors plan)

- Living state doc per active phase: `_context/android-build-2026-05-16/state-S<n>.md`.
- Soft handoff trigger at ~60% context budget; hard handoff at ~85%.
- Fresh instance protocol: read `state-S<current>.md` first, then the briefing section, *then* anything else.
- Phase boundaries get a real handoff doc.
- Architect should be consulted when novel Android-OS constraint questions arise; architect updates *this file* with the answer before returning.

---

## Rig note — subagent worktree isolation (2026-05-16)

PhoneThatCares has a git repo at the root (`/Users/b/Desktop/PhoneThatCares/.git`) specifically to enable Agent-tool worktree isolation for subagents. Nested repos (`telegram-agent/`, `chrome-extension/`, `website/`) untouched — git won't descend into dirs containing their own `.git`. `.gitignore` at the root covers node_modules, Android build dirs, large media, screenshots, env files. Brian has since restarted Claude, so the worktree-isolated Agent tool is available to current sessions.

---

## How to use this doc (for working instances)

- **Read this first** before any Android work in this build.
- **Before asking architect** a new question, check whether it's already answered here.
- **After a novel architectural decision is made or constraint discovered**, update the relevant section here. Don't let knowledge die in a chat transcript.
- **If a "locked-in decision" turns out to be wrong**, don't silently override it — add a dated note explaining the reversal, so future instances see the reasoning chain.
