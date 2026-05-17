# Overnight Build Plan — 2026-05-16 → 2026-05-17

**Audience:** the instance(s) of Claude that work this overnight, and Brian reading it in the morning.
**Style note:** this is a *first pass* by Brian's request. He's on a walk; he'll edit. Don't treat anything here as locked.

---

## Vocabulary

**Spike** — a tiny, throwaway implementation whose only purpose is to *answer a question*, not to be kept. Build the smallest possible thing that proves "yes this approach is feasible" or "no it isn't," then delete it and start the real implementation knowing the answer. The output of a spike is *knowledge*, not code. "S1 biometric spike" = a 50-line APK that tests one question (does device-unlock-authority work from our app?) — not "build the real biometric flow." Spike-first phasing means: before committing to any phase's real implementation, run a spike to verify the riskiest assumption of that phase. Inverse of "build the whole thing, then find out at the end it never could have worked."

## Autonomy and stuck-budget (overnight rules)

Brian is backpacking for the next several days. **Vibe: swing for the moon.** Burn Claude budget aggressively. Be brave, try things, push past first failures.

**On "irreversible decisions":** very few things are actually irreversible. Use git/GitHub aggressively as the safety net:
- Commit and push to a `wip/overnight-2026-05-16` branch on the PhoneThatCares repo *frequently* — every meaningful unit of work. Even broken intermediate states are fine on a wip branch.
- Tag known-good states (`git tag overnight-2026-05-16-T0-done`) so rollback is one command.
- Don't ask permission for code changes, file moves, refactors, new directories, dependencies, test files, scripts, runbooks, research docs. Just do them and commit. The only things genuinely needing a "wait for Brian" gate are: (a) actions that touch Brian's real Google account or other personal credentials, (b) destructive flashes that exceed the recovery path we've pre-staged (factory image + Magisk patched boot.img must exist locally before any flash that could brick), (c) any spending on external services (e.g. signing up for a paid API) — though Claude API calls for the notification-filter prototype are fine.

**Stuck-budget conventions:**
- **Before declaring any subtask blocked**, spend **at least 60-90 minutes of wall-clock** on creative routes: web search for prior art, try variations, read AOSP source, consult the architect agent, sanity-check against multiple references. Use `date` to check wall-clock at the start of "trying" and again before declaring blocked. If under 60 minutes elapsed, keep trying. Brian's words: "don't accept being stuck lightly."
- **What "stuck" looks like:** you've tried 3+ distinct approaches, each documented with what was attempted and where it broke, and you can write a concrete "the next thing to try would require X (hardware Brian has to physically tap, a decision Brian has to make, a piece of info that doesn't exist on the public internet)." If you can't write that sentence, you're not stuck yet — you're frustrated. Keep going.
- **When genuinely stuck:** write findings to `state-S<n>.md` under a `## Tried and failed` section, commit, then *try a different task* — don't sit on the blocker. Brian will read the failure trail when he's back from the trip.
- **Plan A pivot threshold:** if research/spike reveals that KeyguardService substitution requires platform-cert signing of our APK *and* there's no realistic path to obtaining/spoofing the Pixel platform cert from a Magisk module, that's a Plan A blocker. Document at the top of `sessions/android.md` and start writing out the Plan B (stock-AOSP source fork) build plan. Anything less than that — iteration friction, biometric soft-pass with a workaround, perms-XML fiddliness, single component requiring a more invasive disable than expected — keep pushing on Plan A.
- **Time checks are cheap.** Run `date` whenever you transition between subtasks or feel like the work has been going a while. Note timestamps in `state-S<n>.md` so the morning trail is legible.

## What changed today (final, end-of-evening)

- **Substrate decided:** Plan A is **stock Pixel firmware + Magisk + our launcher as priv-app** (flipped from earlier-evening Graphene decision — biometric prioritization + most-trodden-path heuristic won). Plan B (fallback) is stock-AOSP source fork. GrapheneOS deferred to v2. Reasoning in `architect.md` → "Substrate path."
- **Biometric:** primary as the goal. PIN fallback always present. PIN-only is a degraded v1 outcome accepted only if S1 spike forces it.
- **Lockscreen replacement:** genuine Keyguard substitution. `FLAG_SHOW_WHEN_LOCKED`-style decoration over a still-running Keyguard is **not** the bar.
- **Lockscreen notifications kept** (normal behavior). Notification *filtering* via LLM-evaluated natural-language preferences in Discover's settings — prototype in v1.
- **Emergency call** — lean include; punt only if it becomes an in-the-weeds blocker.
- **Pixel 6 is plugged in and empty** — overnight scope upgrades from "research + emulator only" to "swing for end-to-end Plan A on real hardware." See T0.5 (Brian's 5-min prep) and T6 (overnight hardware path).

---

## What overnight Claude can and cannot do

**Can (this is what we lean into):**
- Read code, write code, run emulator tests against `AVD: ptc-test`.
- Build the Magisk module skeleton, write install scripts, prepare flashable artifacts so morning-Brian's hardware time is reflashing and observing — not constructing.
- Deep-dive research: confirm fs-verity priv-app install/update path on current GrapheneOS, identify the *correct* Keyguard-disable mechanism (pm disable-user? overlay? `<config_keyguardEnabled>` resource overlay?), find prior art on third-party Keyguard substitutes.
- Write throwaway test APKs that the morning Brian can sideload to validate specific questions (e.g. biometric API behavior on emulator vs. hardware).
- Update `architect.md` with new constraints discovered.
- Write the runbook for Brian's hardware-prep morning.

**Cannot (don't try):**
- Flash the Pixel 6 (Brian's hands, physical confirmation on the device).
- Test real biometric (emulator fingerprint is fake; only real Pixel 6 + real finger settles S1).
- Validate Magisk-on-Graphene in situ — until the device is flashed, this is research, not test.
- Make irreversible decisions on Brian's behalf. Surface, recommend, wait.

**Soft rule:** if a task can only be settled with hardware, write the runbook for it; don't pretend to execute it.

---

## Overnight task tree

Sequence matters where noted. Otherwise prefer parallel where the worktree-isolated Agent tool can be used (architect.md confirms the PTC root is now a git repo for this).

### T0 — Confirm the foundation isn't broken (S0 prep fixes from the lockscreen plan)

**Why first:** every hour after this builds on the launcher. If the launcher is shipping with a known drag bug, lockscreen feel will inherit it.

**Tasks:**
1. **Drag-gesture direction-lock** — `LockSurface.kt` re-derive dominant axis each frame, not on first crossing.
2. **First-frame black screen** on launcher install — render the lock surface synchronously on first composition.
3. **Watchdog orphan-sleep** in `harness/run-goal.sh` — the one-line fd redirect fix.

**Success conditions (must all be true to mark T0 done):**
- `AVD: ptc-test` boots straight to the launcher with the lock surface visible in the first rendered frame. Take a screencap; if the first frame is black, T0 is not done.
- Drag from a starting axis to a perpendicular axis re-locks each frame — diagonal-then-horizontal commits to horizontal at the new dominant axis, not the original one. Recorded video shows this.
- The harness `run-goal.sh` exits with no orphan sleep processes after a forced kill. `ps -ef | grep sleep` after the harness exit shows nothing left over.

**Failure modes to surface (don't push through silently):**
- If the drag fix surfaces a deeper Compose gesture issue (e.g. `pointerInput` block re-keying every frame causing thrash) — time-box to 1 day, write findings to `state-S0.md`, *don't* let it block T1/T2.

**Output:** `state-S0.md` with the fixes' file:line refs, screencap + video links, and any deferred items.

---

### T0.5 — Brian's 5-minute Pixel 6 prep (only blocking step that needs his hands tonight)

**For Brian, before going to bed:**

1. Boot the Pixel 6, walk through first-time setup. **Skip every account/Google sign-in.** Anything that lets you proceed without — choose that. We can sign in later if needed for app installs.
2. Settings → About phone → tap "Build number" 7 times. Confirms developer mode unlocked.
3. Settings → System → Developer options → enable **OEM unlocking** (toggle), and enable **USB debugging**.
4. Plug Pixel into Mac with USB-C. On the device, tap "Trust this computer / Always allow from this computer."
5. (Optional but recommended) **Unlock the bootloader now**, so the overnight instance is fully unblocked: open a Mac terminal, run `adb reboot bootloader`, wait for the device to land in fastboot, then run `fastboot flashing unlock`. **Use volume keys + power button on the device** to confirm. Device factory-resets, takes ~2 min, then boots back to setup. Run through first-time setup again (still no Google account). End state: bootloader unlocked, USB debugging back on.
6. Confirm the Mac sees the device: terminal, `adb devices` should show the Pixel's serial number and "device" status.
7. Leave plugged in to a stable power source. **Don't lock the screen / let it sleep** if possible — Settings → Display → Screen timeout → 30 min, and Developer options → "Stay awake" while charging.
8. Done.

**Total Brian-time:** ~5 minutes without the bootloader unlock, ~8-10 with it. Strongly recommend doing the unlock — it removes the one step the overnight instance can't do for itself (volume-key confirmation on the device).

**Success check for the overnight instance:** confirm `adb devices` shows the Pixel and `adb shell getprop ro.boot.flash.locked` returns `0` (= unlocked). If yes, T6 (hardware path) is unblocked. If no, T6 waits.

---

### T1 — Magisk-on-stock-Pixel-6 feasibility research (no hardware needed for the research; useful for T6 once hardware is ready)

**Why this is overnight-shaped:** mostly web research + runbook writing. Resolves "do we know how to install our launcher as priv-app on stock Pixel 6 Android, with Keyguard substitution, with biometric unlock from our app" before any actual flash.

**Tasks:**
1. **Validate the current Magisk-on-stock-Pixel-6 story.** Confirm the current Magisk install path for `oriole` (Pixel 6) on the latest stable Android factory image — `boot.img` patching via Magisk app, fastboot flash. Find the most recent reliable write-up; cite the Android version + Magisk version.
2. **Keyguard-disable mechanism.** Three candidate approaches in priority order:
   - Disable just the `KeyguardService` component inside SystemUI (`pm disable com.android.systemui/.keyguard.KeyguardService`) without disabling the rest of SystemUI. Find the exact component name on Android 14/15 stock Pixel and whether disabling it leaves notification shade + recents + status bar functional. **This is the cleanest desired outcome.**
   - Resource overlay on `config_keyguardEnabled` or equivalent via RRO (Runtime Resource Overlay). Less invasive, but may not prevent Keyguard from running — depends on whether the resource is actually consulted.
   - `pm disable-user com.android.systemui` (heavy hammer, breaks shade + recents). Only as last resort if surgical disable doesn't work — we'd then need to substitute ALL of SystemUI, which is way out of scope.
   Surface what's actually known about each. Where uncertain, label uncertain — that becomes a hardware-test item.
3. **Platform signature vs. priv-app whitelist.** Since Android 8, priv-app permissions require both placement in `/system/priv-app/` AND an XML whitelist in `/etc/permissions/`. Identify exactly which signature-level permissions our launcher needs to claim Keyguard-substitution responsibilities (candidates: `STATUS_BAR_SERVICE`, `DISABLE_KEYGUARD`, `INTERNAL_SYSTEM_WINDOW`, others). Determine whether priv-app + whitelist is sufficient or whether we additionally need platform-cert signing. **This is the question most likely to gate Plan A.**
4. **Biometric-from-priv-app on rooted stock Pixel 6.** Specifically the *device-unlock-authority* half: not "can we call BiometricPrompt" (yes, trivially) but "can our priv-app's biometric success transition the device from locked to unlocked state such that subsequent app launches don't re-encounter Keyguard." Find prior art if any exists. Most likely this is mostly a hardware-test item.

**Success conditions:**
- A `research/magisk-graphene-priv-app.md` document exists with sections for each of the four sub-questions above, each section ending with a one-line "**Answer:**" or "**Open — needs hardware/spike.**" line. No section ends in ambiguous prose.
- An updated entry in `architect.md` → "Android-OS constraint reference" → "Keyguard" reflecting any concrete new knowledge.
- A flagged list of the top 1-3 things this research couldn't settle without hardware, which roll into T3 and morning-Brian's hardware time.

**Failure modes:**
- "Documentation is unclear, the only way to find out is to flash and try" — this is a legitimate outcome. Say so. Don't pad with speculation.

---

### T2 — Magisk module skeleton + install scripts

**Why now:** so morning-Brian's first hardware session is "flash this, observe what happens" rather than "let's build the thing first."

**Tasks:**
1. Create `android-magisk-module/` at the project root. Standard Magisk module layout (`module.prop`, `META-INF/`, `system/priv-app/com.ptc.launcher/`, `system/etc/permissions/privapp-permissions-com.ptc.launcher.xml`).
2. Place the current launcher APK build (or a stub if T0 reveals a build issue) in the module's `system/priv-app/` path.
3. Write the privapp-permissions XML for the signature-level perms identified in T1.
4. Write a `flash.sh` runbook (idempotent, safe to re-run): expects the Pixel 6 in fastboot, reflashes the boot image with the Magisk-patched version, sideloads the module ZIP.
5. Write a `reset.sh` runbook for when things break: re-flash factory image, restore from backup, get back to a known-good state. Pre-stage the factory image + Graphene image URLs in the script as comments — don't auto-download (those are big and licensing-y).

**Success conditions:**
- The module ZIP packages cleanly and `Magisk Manager` would accept it (verify by `unzip -l` showing the expected layout; can't fully verify without device).
- `flash.sh` is dry-runnable: `flash.sh --dry-run` prints every command it would execute without executing it. Brian can read this in the morning before pulling any trigger.
- `reset.sh` documents the *exact* sequence to get back to "factory Graphene-on-Pixel-6" — Brian has a verbal-confidence rollback path before he ever flashes.
- A README in the module dir explains what each file is and why it's there.

**Failure modes:**
- If the launcher APK isn't currently buildable to a signed release artifact, document the build steps and produce a debug-signed APK. Note in `state-S0.md`.

---

### T3 — S1 spike prep: design the biometric / Keyguard-substitution test

**Why prep (not run):** S1 is the gating spike. Morning-Brian needs to walk into a phone-in-hand session knowing exactly what to test, in what order, with what success criteria. Don't make him design the spike at 9am.

**Tasks:**
1. Write `research/s1-spike-protocol.md` — the exact sequence morning-Brian (or post-coffee-Brian) executes once the phone is flashed and our module is installed. Each step has: action, expected observation, what it tells us.
2. **Two distinct sub-spikes**, run in this order:
   - **S1a — Fingerprint sensor accessibility from our app.** Tiny throwaway APK that calls `BiometricPrompt.authenticate()`. Question: does it succeed when our app is installed normally (not priv-app)? Confirm baseline. (Strong prior: yes.)
   - **S1b — Device-unlock authority from our app.** With our launcher installed as priv-app via the Magisk module, with `KeyguardService` disabled: does screen-on land on our Activity? Does biometric success in our Activity transition the device to a usable "unlocked" state — can we launch installed apps after?
3. For each sub-spike, define:
   - **Pass:** what we see if it worked.
   - **Soft-pass:** what we see if it kinda worked but there's a wrinkle (e.g. biometric reads fine but the device still considers itself "locked" — notification shade refuses to expand for sensitive content, etc).
   - **Fail:** what we see if it didn't work.
   - **Branch on fail:** does this push us to platform-signing investigation, to Plan B, or to a redesign of the unlock surface?

**Success conditions for T3 (the prep, not S1 itself):**
- `s1-spike-protocol.md` exists and is concrete enough that a non-expert collaborator could execute it.
- A throwaway `biometric-probe.apk` is built and ready in the artifacts dir.
- The decision tree (what each outcome means) is one diagram or one short ordered list — not buried in prose.

---

### T4 — Hardware-prep runbook for Brian

**Why:** Brian has to do the irreversible-ish hardware steps. He should not have to assemble them from memory.

**Tasks:**
1. Write `runbook-hardware-prep.md` covering, in order:
   - Backup Pixel 6 (what to back up, how — `adb backup` is dead; need a real plan: cloud account data, screenshots, anything device-local). **Surface anything Brian likely has on the phone that he'd lose if a reflash went sideways.**
   - Bootloader unlock (`fastboot flashing unlock`, factory-reset confirmation).
   - Flash GrapheneOS via the official web installer (or sideloaded — recommend web installer, document both).
   - Install KitsuneMagisk via patched boot image (point to the most recent reliable write-up).
   - Verify root works (`adb shell su -c id` returns uid=0).
   - Sideload our Magisk module via `Magisk Manager`.
   - Reboot, observe what surface comes up first.
2. **Per-step:** estimated time, what can go wrong, what the rollback looks like if it does.
3. End with a checklist Brian can literally check off.

**Success condition:** a non-Android-engineer could execute this from a cold start with the document open in one hand. (Brian isn't a non-Android-engineer, but writing for that audience forces the right level of clarity.)

---

### T4.5 — Test-app install list + install plan

**Why:** Brian wants 20-30 apps on the device for S5 daily-drive grounding — real social, real banking (some will break, that's data), normal-pixel-owner apps, 1-2 joke apps. Without this, S5 is testing an empty phone, which doesn't tell us anything about real life.

**Tasks:**
1. **Curate the app list.** Aim for ~25 apps. Categories:
   - **Social (the ones we actually care about):** Instagram, TikTok, X/Twitter, Facebook, Snapchat, Reddit, YouTube, Threads. Pick 5-7 — the ones Brian actually uses or might. Brian: if you want to weigh in on which, drop a note; otherwise instance picks the obvious ones.
   - **Messaging / comms:** WhatsApp, Telegram, Signal, Discord, Gmail. Pick 3-4.
   - **Banking (low priority, expected to mostly break — that's the test):** 2 apps. Chase + Venmo are reasonable defaults. Note: their breakage is data, not a problem to fix.
   - **Normal pixel-owner stuff:** Google Maps, Spotify, Uber, weather (default Pixel weather is fine, but maybe Carrot Weather for character), a calendar app if not relying on Google's, a notes app (Bear / Obsidian / Apple Notes equivalent), a browser (Firefox / Brave as alternative to default Chrome), a photo viewer / editor (default Photos is fine). Aim for 8-10 here.
   - **Joke apps:** 1-2. NGL, Yo, Cuddlr, BeReal, Locket — something silly. Pick what feels right.
2. **Decide install path.** Two options:
   - **(a) Play Store batch install:** Write the list as a `test-apps.md` document with package names and Play Store URLs. In morning, Brian opens the list on his laptop, batch-clicks install from Play Store with his Google account signed in. Cleaner for normal-app behavior (updates, signed releases, etc).
   - **(b) `adb install` sideload:** Pre-collect APKs (legally — only Brian's licensed apps, and only ones not gated by Play Protect / DRM). Write an `install-test-apps.sh` script that bulk-`adb install`s them all. Deterministic, no Google-account dependency, but APK collection is its own task.
   - **Recommended:** start with (a) as the default. Sideloading via `adb` is the fallback if Play Store auth on the rooted device misbehaves. Plan for (a), write the runbook for (b) as backup.
3. **Write `test-apps.md`** with the curated list, package names, Play Store URLs, install path. Group by category.
4. **Note the no-go pile** — apps we considered but chose to skip, with one-line reasons. Helps morning-Brian see the decision space.

**Success conditions:**
- `test-apps.md` exists with ~25 apps, grouped, with package names and Play Store URLs.
- A "to install: open these URLs in order" or "to install: run this script" path is documented clearly enough that morning-Brian doesn't have to think about it.
- Banking apps explicitly flagged as "expected to break, that's fine."

**Failure modes:**
- If sideloading some categories is the only viable route (e.g. apps that detect root via Play Protect), document which ones and write the APK-source plan.

---

### T6 — Hardware path (overnight, contingent on T0.5 done): real Pixel 6 end-to-end attempt

**Why now:** Brian's leaving the Pixel 6 plugged in, empty. Vibe is swing-for-the-moon. If T0.5 leaves the device unblocked, an overnight instance can attempt the full Plan A install + S1 spike on real hardware. Worst case: it doesn't work, we have a long failure trail and are exactly where we'd have been Friday morning anyway. Best case: morning-Brian wakes up to a Pixel 6 running our launcher as a real lockscreen with biometric unlock.

**Preconditions (check first — abort cleanly if any fail):**
- `adb devices` shows the Pixel and `adb shell getprop ro.boot.flash.locked` returns `0`.
- T2 (Magisk module skeleton) is complete: a flashable module ZIP exists at a known path.
- T1 has resolved (or made best-effort-with-flags-set on) the Keyguard-disable mechanism question. If T1 says "unknown without hardware" — that's fine, that's why we have hardware tonight; try the most likely candidate and observe.
- The factory image + Magisk-patched `boot.img` are pre-staged at known paths on the Mac.

**Tasks (sequential — each must succeed before the next; commit at each step):**
1. **Confirm the device is in a clean state.** `adb shell getprop ro.build.fingerprint` to capture the exact starting build; pin this in `state-T6.md`.
2. **Flash Magisk-patched boot.img.** `adb reboot bootloader` → `fastboot flash boot magisk-patched-boot.img` → `fastboot reboot`. Wait for boot. `adb shell su -c id` should return uid=0.
3. **Install our Magisk module.** Push module ZIP, install via Magisk Manager CLI (or by remounting `/system` rw and copying — research the cleanest method during T1/T2). Reboot. Verify our launcher APK is at `/system/priv-app/com.ptc.launcher/com.ptc.launcher.apk`.
4. **Verify launcher runs.** `adb shell pm list packages | grep ptc` — present? Launch it: `adb shell monkey -p com.ptc.launcher 1`. Surface should render. If yes, we have a working priv-app launcher on real hardware.
5. **S1a — Biometric API baseline.** Sideload the `biometric-probe.apk` from T3, run it, attempt fingerprint enrollment (Brian has to put his finger on the sensor — *but we can defer this to morning since it's a 1-min Brian action; overnight just verifies the API path works without the actual finger*). Verify `BiometricPrompt.authenticate()` returns the expected error code ("no fingerprint enrolled") rather than a permissions error.
6. **S1b — Keyguard substitution attempt.** Execute the T1-identified Keyguard-disable mechanism (e.g. `adb shell pm disable com.android.systemui/.keyguard.KeyguardService`). Lock the screen (`adb shell input keyevent 26`). Wake the screen. **Observe what surface comes up.** Three outcomes:
   - **Pass:** our lock surface renders, screen interaction reaches it.
   - **Soft-pass:** our surface renders but underneath/alongside the stock Keyguard (we decorated, didn't substitute) — document exactly what's visible.
   - **Fail:** nothing comes up, or boot loop, or our launcher crashes. If boot loop, use the staged recovery image immediately (`reset.sh` from T2).
7. **Document everything in `state-T6.md`** with timestamps, exact commands, exact observations, and screencaps via `adb shell screencap` saved to `_context/android-build-2026-05-16/artifacts/`.

**Success conditions for T6:**
- **Floor (acceptable to wake up to):** Magisk installed, our launcher present as priv-app, we've attempted Keyguard substitution and have a clear documented observation of what happened. Even if the Keyguard attempt failed, the failure data is the night's most valuable output.
- **Stretch (the "moon"):** screen wake shows our lock surface as the real lockscreen, even without biometric wired up. Morning-Brian can tap his fingerprint on enrollment and we wire up unlock authority on day 2.
- **Disaster recovery:** if anything goes wrong, the device ends the night either (a) booted to the launcher in some state, (b) booted to stock with Magisk installed but our module disabled, or (c) booted to factory stock with bootloader unlocked. **Never (d) bricked / bootlooping / unrecoverable.** If the only path forward looks like (d), stop, restore via `reset.sh`, document, move on.

**Branching:**
- If preconditions fail: skip T6, write a clear "T6 not attempted, reason: X" in `sessions/android.md`. Don't half-attempt.
- If step 2 (Magisk install) fails: full stop. Most likely cause = wrong boot image for the device's Android version. Document, recover, try again only if confident on the fix.
- If step 6 fails with boot loop: recover immediately, no second attempts overnight.

---

### T7 — Notification filter scaffolding (Discover settings UI + stub filter)

**Why now:** Brian wants the LLM-evaluated notification filter prototyped in v1, not deferred. Tonight: scaffold the UI + stub the filter; LLM wire-up can happen during/after T6 depending on remaining budget.

**Tasks:**
1. **Find the existing Discover notifications page** in the launcher code. Brian mentioned there's already low-opacity placeholder text showing the vibe ("let me know if Caroline texts or if I get a LinkedIn message, but don't notify me about Twitter notifications"). Read what's there; understand the current state.
2. **Wire up a real text input** for the natural-language preferences. Persistence: `SharedPreferences` is fine for v1. The placeholder text becomes the placeholder of an actual `TextField`. User types, prefs save on edit.
3. **Build the stub filter.** A `NotificationFilter` class with `evaluate(notification: StatusBarNotification): ShowHide`. Initial implementation: simple keyword match against the prefs string (split on common conjunctions, check if any phrase appears in source app name + notification text). Returns `Show` by default if nothing matches.
4. **Wire to a `NotificationListenerService`** so we actually receive notifications. This needs the user to grant notification access permission on first run; document that.
5. **LLM hookup (stretch).** Replace stub filter with a Claude Haiku call: prompt includes user prefs + notification source + notification content → returns show/hide. Cache decisions by `(app, content-hash)` with 1-hour TTL. Fail-open: LLM error = show. Use the Anthropic SDK; environment variable for API key (Brian: if you don't have ANTHROPIC_API_KEY set in shell rc, instance: surface this — don't try to figure it out).
6. **A debug UI** somewhere accessible-but-hidden in Discover (long-press a header, or developer toggle) that shows the recent filter decisions: source app, content snippet, decision, latency. Crucial for tuning the filter behavior in S5 daily-drive.

**Success conditions:**
- Discover notifications page has a real, persistent text input that saves the user's preferences string.
- A `NotificationListenerService` is registered and receives notifications when permission is granted.
- The filter evaluates each notification through the stub (or LLM, stretch).
- Debug UI shows decision trail.
- One commit per task (1-6) on the wip branch.

**Failure modes:**
- If `NotificationListenerService` requires a permission grant that needs adb commands or settings clicks: document the one-line `adb shell cmd notification allow_listener com.ptc.launcher/...` workaround in the runbook.

---

### T5 — Update `state-of-project.md` Android section + close the loop

**Why:** PM agent and future Brian both read this. Don't let today's substrate/biometric/lockscreen-scope decisions live only in the architect notes.

**Tasks:**
1. Update `_context/state-of-project.md` Android section with: substrate decided (GrapheneOS), biometric primary, lockscreen replacement scope clarified.
2. Update `_context/sessions/android.md` to reflect overnight-run state — "S0 done / fixes in", "T1 research complete / open questions: X, Y", etc. Keep to 2-6 bullets.
3. If T1 surfaces architectural facts material enough to merit it, write a short `architect.md` update.

---

## Sequencing and parallelism

- **T0.5 is Brian's, before bed.** Everything below assumes it's done. If it isn't, T6 is skipped.
- **T0, T1, T2, T7** can run in parallel — independent worktrees (the PTC root git repo now supports worktree-isolated subagents). T0 is launcher bug fixes, T1 is research, T2 is module skeleton, T7 is notification filter UI work.
- **T3** depends on T1 (needs the Keyguard-disable mechanism resolved enough to design S1b).
- **T4** depends on T1 (Magisk install story) and T2 (the actual flash.sh).
- **T4.5** (test app list) is independent — can run any time.
- **T6** depends on T0.5 (hardware ready), T1 (research informed), T2 (module ready), and T3 (S1 protocol designed). It's the culmination if everything upstream lands.
- **T5** is last, threads through everything.

If overnight context budget is tight, prioritize in this order: **T0 → T2 → T1 → T3 → T6 → T7 → T4 → T4.5 → T5.** T6 jumps the queue because the hardware opportunity is the night's biggest upside swing — if T0.5 leaves the Pixel ready, we want to take that swing while the iron's hot. T0 unblocks the foundation; T2 makes morning-Brian productive even if research is incomplete; T1 is the highest-information research; T3/T4 are docs; T5 is housekeeping.

---

## Multi-instance continuity (mirrors the lockscreen plan)

- Soft handoff at ~60% context: write/update `state-S0.md` (or relevant state doc), continue.
- Hard handoff at ~85%: write `state-S0.md` + ## Next-instance briefing (<200 words), stop.
- Fresh instance's first read: `state-S0.md` first, *then* this build plan, *then* anything else.

---

## Overall success conditions for "overnight was worth it"

**Floor (anything less and the night didn't earn its budget):**
- `sessions/android.md` reflects current state, top-of-file shows any Plan-A blockers loudly if found.
- T0 done (3 prep fixes shipped + emulator validated).
- T1 research either resolved or has a clean "open Q only resolvable on hardware: X" line.
- T2 Magisk module skeleton exists, dry-runnable.

**Target (the realistic good night):**
- Floor +
- T3 spike protocol exists; throwaway probe APK built.
- T4 hardware runbook exists (and is partly redundant with T6 results if T6 ran).
- T7 notification filter scaffolding in code: text input persists, NotificationListenerService receives events, stub filter evaluates.
- T4.5 test app list curated.

**Moon (swing-for-it outcome):**
- Target +
- T6 attempted on real hardware. Magisk installed on Pixel 6, our launcher present as priv-app, Keyguard substitution attempted with documented outcome (pass/soft-pass/fail with screencaps).
- T7 LLM hookup wired and one test notification has been filtered end-to-end.

**When Brian gets back from backpacking**, he should be able to read `sessions/android.md` → the build plan's morning-Brian section → T6's `state-T6.md` (if it ran) in 5 minutes and know exactly where we are.

---

## What this plan deliberately doesn't try to do tonight

- Build anything that depends on hardware behavior (real biometric flow, real foreground-app detection latency for GrayscaleService, real Keyguard-disable cascade observation).
- Make the substrate-or-biometric decisions any *more* than they were made today. Those are settled until evidence forces a revisit.
- Write production polish on the launcher. S0 is bug fixes; polish is S5/S6 in the lockscreen plan.
- Decide notification shade behavior or emergency-call handling. Still open. Surface them, don't resolve them.

---

## Open questions Brian might want to weigh in on when he's back from the walk

1. **Backup story for the Pixel 6 before flashing.** What's actually on the phone that we'd lose? Worth a `pre-flash-backup-checklist.md` or is "factory reset, sign back into Google" the move?
2. **Test SIM or daily SIM in the Pixel 6 during S1-S4?** Putting his real SIM in early commits to "this phone might be the daily driver soon"; using a test SIM keeps the experiment contained but means S5 daily-drive needs another reflash window.
3. **How much Plan A pain triggers a Plan B pivot?** Concretely: if T1 research reveals fs-verity-on-Graphene makes priv-app updates require a full module rebuild + module-reinstall each time, that's iteration friction but not a blocker. If T1 reveals KeyguardService can only be disabled via platform-signed app, that *is* a blocker. Want to name the rough threshold in advance so an instance can call the pivot without waking him.
