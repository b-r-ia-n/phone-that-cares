# HANDOFF — Graydawn, end of July 6 day session

Supersedes the July 5 build handoffs for current state. Written after a long
live-feedback session with Brian on his Pixel 8. Branch `worktree-seeglass-overnight`,
**PR #1 is MERGED** — code now lives in the main checkout at `PhoneThatCares/apps/graydawn/`
and `apps/seeglass/` (moved out of the hidden worktree so Brian can find it). Latest
commit `9acee86`. All work this session is committed and pushed.

## What Graydawn is (unchanged core)

Whole-phone grayscale every ~4am via the daltonizer secure setting. Hold both volume
buttons ~0.55s to bring color back for N minutes (default 20); at the end it drains back.
One-time `adb pm grant WRITE_SECURE_SETTINGS`, one accessibility service for the button
listen. No INTERNET permission, ever. ~9 Kotlin files, still small and auditable.

## The frame (the non-negotiable, and the reason for most decisions)

Nothing is taken from the user, nothing is owed. Gray is a *different default*, not a
restriction. "Saturation" replaced "the borrow" (borrow implied the color wasn't yours).
Verbs stay clean: the hold *saturates* / *brings back*; the end *drains back*. Never
borrow/earn/spend/owe. If a sentence would sit comfortably in a wellness app, it's wrong.

## Session changes (July 6), in order

**Feel / motion**
- Hold window 400→**550ms** + key-repeat guard (400ms read as "instant"; Brian: 550 is right).
- Splash retuned to **450ms rise / 250ms hold at peak / 1100ms drain**, plain diagonal
  gradient (coral→gold→sky). Brian: "perfect." (Briefly tried crossing radial waves — he
  preferred the simple diagonal. Reverted, kept.)
- Warn buzzes before end-of-saturation **removed** — the drain announces itself.
- Saturation-start whisper is now "color! N minutes of it."

**The day-12 letter → rebuilt twice to Brian's design**
- Now opens with **Brian's cartoon** (centered, `drawable/brian.png`) + his first-person
  copy ("hey there! i'm brian, i made graydawn…") with two tight bullets (send data / write
  a note) and a CTA line. Bullets are real hanging-indent rows, not text blobs.
- **Two offerings, either/both**: "send the cold hard data" and "write a little note".
- Data path opens a **separate consent page** that explains the usage-access switch before
  asking (with "give graydawn usage access" / "actually, never mind" / back arrow).
- **Delivery is the user's choice, last**: "email it to brian" (mailto, prefilled) or
  "share it another way" (share sheet — their messenger/notes/etc).
- Letter data is now **week-by-week per app** (weekly UsageStats buckets, ~4wk back; the
  install-straddling week dropped from both sides). Was flat before/after averages.
- **Removed** the "no internet" parenthetical from the letter body (Brian: nobody cares
  much in round one; the app still has no INTERNET and the download page keeps that line).
- Back arrow goes to the app homepage (MainActivity), not to nowhere.

**Notification** (the one Graydawn ever sends)
- Title **"N gray dawns in…"** (N computed live from install date), body **"how's using
  graydawn going? we're curious"**. Tapping opens the letter.
- OPEN NIT Brian flagged: "we're curious" — "we" faintly implies a company; the app's frame
  is one person. One-word change if he wants "i'm curious". Left as-is pending his call.

**Icons**
- Graydawn launcher icon is now **Brian's own** (from `apps/greydawn_icon.svg`): half-risen
  sun, orange below → gray above, rays cycling color→gray around the dial. Rebuilt as a
  vector with his exact hexes (#f6871f / #878787 / #c0895b on #ede9e1).
- Seeglass got a tumbled sea-glass pebble (my design; Brian hasn't reviewed, low priority).

**Home page de-cluttered (the big structural call)**
- Principle Brian landed on: **poetry for the product, plain words for the plumbing.** The
  hold / the saturation / gray every dawn keep their names (felt experiences). Permissions,
  conflicts, settings, leaving are pipes and now *read* like pipes.
- Main page shows setup **only when something is broken** (missing permission, or a
  hold-stealing conflict). When healthy it says nothing — no checkmark furniture. This is
  what fixed Brian's "too animist" note: organ-names only surface when an organ is failing.
- "gray every dawn" toggle now shares its label's row.
- **New Settings page** (`SettingsActivity`, gear icon inline with the title): **permissions**
  (system settings access + revoke command, volume listener, usage access, notifications —
  each with its state and a link/means to turn it OFF), **potential conflicts** (renamed
  from "tangles"), **leaving** (see below), footer "made by brian · write to him anytime".
- **"Leave cleanly"** — returns color, cancels all alarms, then opens the uninstall dialog.
  Addresses a real bug Brian caught: uninstalling normally leaves the phone stuck gray
  (secure settings aren't reverted on uninstall; fixable in Settings→Accessibility→Color
  correction, but ugly). Now a bordered button (was plain text he couldn't tap) with a
  fallback to app-details if the uninstall intent is refused.

## Technical decisions / facts worth carrying

- **Gmail ignores `EXTRA_TEXT` on mailto intents** — the letter body must ride URL-encoded
  inside the mailto URI. Fixed; "email it to brian" now prefills. (Verified the intent path;
  Brian still owes one real end-to-end send to confirm formatting on arrival.)
- **Uninstall doesn't revert secure settings** — hence "leave cleanly". `WRITE_SECURE_SETTINGS`
  granted via adb can only be revoked via adb (`pm revoke …`); shown honestly in settings.
- **Enabled-but-dead a11y service**: after force-stop / OEM battery-kill, the service reads as
  enabled in settings but the system won't rebind it. App detects (`GraydawnService.instance == null`
  while listed enabled) and tells the user to toggle it off/on. Real, seen live.
- **Dawn hardening (from July 5, still true)**: `setExactAndAllowWhileIdle` + `USE_EXACT_ALARM`
  for snap-back; screen-on catch-up if the inexact 4am alarm slips; first-install never
  ambushes; dawn defers to an active saturation. Verified: real 4am dawn fired clean July 6.
- **No gradual system grayscale without root** (Android 14): daltonizer is binary snap only;
  smooth ramps only where we own pixels. (Seeglass's WebView is where ramps live.)
- Debug broadcasts (exported, adb-triggerable): `DEBUG_BORROW`, `DEBUG_SPLASH`, `DEBUG_LETTER`.
- Build: `apps/graydawn`, `JAVA_HOME=/opt/homebrew/opt/openjdk@17/...`, `./gradlew assembleDebug`.
  Release signing wired to `~/Desktop/PhoneThatCares/keys/ptc-release.keystore` (gitignored;
  **back it up** — losing it strands every install).

## Adjustability — decided: ship rigid, let the letters decide

Brian raised whether the app wants more knobs (custom dawn time; saturation up to 24h;
"starts gray, then off for the day"). Decision: **no new options for v1.** Reasoning:
options are easy to add, near-impossible to remove; fewness-of-features is itself the
product ("a small, knowable thing"); and the data channel to resolve this — the letters —
already exists. If replies say people needed all-day color, the right future shape is the
5–60 slider with **one extra detent past 60 = "until dawn"** (a cliff, not exponential
math). Not before evidence. Same logic killed custom dawn-time.

## Google Play — decided: not for v1

Sideloading is *correct* for the 20–30-person signal round: `WRITE_SECURE_SETTINGS` can't be
granted through a Play install (needs adb), and accessibility-service use outside disability
assistance is exactly what Google rejects/removes. The honest-friction framing ("a friend
with a laptop for one command") only exists because it's a sideloaded APK. A $25 Play account
is trivial whenever — the blocker isn't the account, it's the policy fit, which would require
re-architecting so grayscale doesn't need secure settings (a genuinely different app). Revisit
only if it outgrows friends-of-friends, or for the tip jar (needs Play billing).

## State of Brian's Pixel 8

Running the latest debug build (`9acee86`). Screen timeout bumped to 10 min for review
comfort (was ~30s). Dawn alarm armed for 2026-07-07 04:00. MacroDroid still shows under
"potential conflicts" (correct — it has an a11y service). Still **debug-signed** — moving to
the release APK is a v-public step (loses prefs; 2 min).

## What's left before public release (the agenda)

Blocking:
1. **One real end-to-end email test** — Brian sends himself the letter, confirms formatting.
2. Decide "we're curious" vs "i'm curious" (one word).
3. Move Pixel to the **release-signed** build and live on it a day or two.
4. **Download page** on aphonethatcares.com — copy written (marketing doc), needs: page built,
   release APK hosted, iPhone-recipe section, compat caveat from the research doc.
5. **Demo video** — camera at the physical phone (screen recordings can't capture the
   daltonizer). 6-shot list in the marketing doc.
6. **Tweet thread** — draft exists, needs Brian's voice pass.

Non-blocking: a Samsung guinea-pig test if a friend has one; `/security-review` skim before
strangers install (a11y + WRITE_SECURE_SETTINGS app deserves one look); notification quiet vs
heads-up; raw-data-zip attachment for the letter (a design project, ships fine without).

## Files (all in `apps/graydawn/app/src/main/java/com/ptc/graydawn/`)

`MainActivity` (home: chip, status, dawn toggle, slider, go-gray, gear), `SettingsActivity`
(permissions/conflicts/leaving), `LetterActivity` (the day-12 letter), `Letter` (usage
compare + compose + send), `Conflicts` (shared conflict detection, blocking vs info),
`Gray` (daltonizer + alarms + saturation state), `GraydawnService` (the a11y listener +
watchdog + debug hooks), `Overlays` (splash + whisper), `Receivers` (dawn/regray/boot).

Companion docs in `_context/seeglass-2026-07-05/`: `marketing-graydawn-…md`,
`device-compat-graydawn-…md`, `icons-preview.html`, `notification-cards.html`.
