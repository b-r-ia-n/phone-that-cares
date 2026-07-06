# HANDOFF — Offscreen (né Graydawn), end of July 6 evening session

Supersedes `HANDOFF-graydawn-03-2026-07-06.md` for current state. A very long live
session with Brian: the download page was built, the installer became a webpage,
the app got renamed, and 1.0 was cut and security-hardened. Branch
`graydawn-download-page`, latest `676f12e`, all committed and pushed. **PR #2 (draft)**
targets `wip/overnight-2026-05-16` (the effective mainline — local `main` is a stub).

## THE NAME: Offscreen

Renamed from Graydawn late tonight, after a 6-way mock comparison
(`_context/name-mocks-2026-07-06/`, single-file copy sent to a friend). Tagline —
which Brian chose by falling in love with it mid-sentence: **"the color lives
offscreen."** It's the page tagline AND the app subtitle's opening.

- **Package stays `com.ptc.graydawn` forever** (renaming = stranding every install).
  Internal-only: prefs file, broadcast actions, class names, repo folder
  `apps/graydawn/`, CSS theme name. All invisible; don't churn them.
- Kept deliberately: notification title **"N gray dawns in..."** (the mornings are
  still gray; Brian hasn't vetoed) and the app's "the day begins gray" isn't in the
  subtitle anymore (subtitle: "the color lives offscreen. holding both volume
  buttons — a half-second — brings it back for a while.").

## Current version: 1.0 (versionCode 8), sha fd868cf9…

**SHIPPED TO PROD 2026-07-06 (next morning):** live at aphonethatcares.com/offscreen,
APK sha verified on the live URL, /graydawn meta-refresh redirect working.

## What shipped today (all emulator- or person-verified)

**The installer is the website.** `aphonethatcares.com/offscreen` (once prod) runs
real adb in Chrome via WebUSB (ya-webadb, deps in website package.json): fetches the
APK, installs, grants WRITE_SECURE_SETTINGS, **verifies the grant via dumpsys**
("granted. checked twice."), then **launches the app on the phone** (`am start`) so
there's no "did it work?" moment. Brian ran the first real install through it.
Fallbacks: `curl …/offscreen/install.sh | sh` (fetches Google platform-tools itself)
and raw adb lines, in a collapsed "prefer to run it yourself?" fold. Phone visitors
get a direct-APK note. `/graydawn` redirects to `/offscreen`.

**Page design** (all Brian's copy after his voice pass): arrives IN COLOR and drains
to gray after 5s (his idea — the product happens to you before any words); the sun
is a hold-toggle (550ms, real vibration, 5s color) but now *undocumented* — a secret;
thesis line hero ("offscreen is an app trying to help you notice the beauty and
richness and complexity of your life, by making your phone a little less interesting
by default."); meta-line `android · free · 3-5 minutes to set up · get it ↓`;
5-step checkable setup list (circles fade when tapped, localStorage-persistent,
installer auto-checks 1–4; the button sits BETWEEN steps 4 and 5); his three
"what it doesn't do" paragraphs (doesn't judge / isn't creeping / day-twelve, with
*would* italicized); humble iPhone section that just invites someone's shortcut
recipe (the full untested Focus-mode recipe lives in the copyedit note if ever
wanted — Wait action dies in background; Focus-until-time + focus-off automation is
the workaround; yields to Sleep/Work Focus).

**App features added today (over 9acee86):**
- **Two-way hold**: holding during color ends it early (single firm buzz = the double
  buzz's echo; drain splash). `fired` flag prevents double-toggling per hold.
- **Slider**: 1–60 min by the minute, then cliffs 2h/4h/8h/**until dawn** (sentinel
  UNTIL_DAWN=-1 / borrow_until=Long.MAX_VALUE; no snap-back alarm; DawnReceiver +
  dawnCatchUpIfDue end it; watchdog stands down). `Gray.lengthLabel()` = one voice.
- **Camera pass**: a11y service now reads the window-state events it always received;
  camera apps (resolved via camera intents) lift the gray, leaving restores it,
  saturations take precedence, pass persisted across service death. Toggle lives in
  SETTINGS ("the camera keeps its color", default on) — Brian moved it off main.
  Trust copy updated (settings caption + a11y consent dialog).
- **Settings journal + letter growth**: `Gray.note()` → files/journal.txt (settings
  changes only, never usage, one line per slider gesture). Letter reports: current
  hold setting + touched-flag, "settings along the way" (day-indexed, clamped),
  per-day screen-time totals (Android keeps daily buckets ~1 week). Both ride only
  with the data offering. This is the **frontier instrument** — see
  `_context/graydawn-defaults-vs-freedom.md` (the recorded defaults-vs-non-coercion
  tension; asymmetric failure rule; letters+slider are the only telemetry).
- **Adaptive icon**: was legacy-square-in-circle; now background layer (bone #ede9e1)
  + foreground sun at **b.notebook proportions** (~58% of visible circle; spec from
  `~/Desktop/Projects/corpus/scripts/gen-icons.mjs`, geometry only — graydawn colors).
- "i'm curious" in the notification; settings footer reads versionName dynamically.

**Security review (tonight, full-surface):** fixed — debug broadcast receivers
(DEBUG_BORROW/SPLASH/LETTER/DAWN) now register **only on debuggable builds** (were
exported on release: any co-installed app could toggle color/move the slider/fake a
dawn); LetterActivity exported=false. Clean elsewhere: no INTERNET, a11y service
bind-permission-protected and **cannot read window content** (config lacks the
capability), immutable PendingIntents, egress only via the letter the person sends.
**Consequence: adb debug hooks no longer work on release builds** — including
Brian's phone. Test on debug builds / emulator (`ptc-test` AVD).
Note: the debuggable-guard itself was code-reviewed but its on-device behavior was
not emulator-verified (token economy) — a 2-min check next session if paranoid:
release build should IGNORE `adb shell am broadcast -a com.ptc.graydawn.DEBUG_BORROW`.

**Letter e2e: PASSED.** Brian sent himself the real letter. Gmail quirk discovered:
self-send-via-alias gets deduplicated (same Message-ID returns to the same account →
All Mail only, not inbox, not spam). **Strangers are unaffected** (different accounts
both ends). MX for aphonethatcares.com → Namecheap eforward, alias works.

## Brian's Pixel state (end of session)

Offscreen 1.0 **code 7** via adb (one behind the hardened code-8 build — one page-button
press upgrades him). A11y services: MacroDroid + Offscreen (BOTH restored by hand
after a cable-drop mid-`settings put` **wiped the enabled_accessibility_services list**
— new scar: never write that key when the cable might drop; always read-modify-write
and re-verify). USB debugging: ON (he'll want it off after his next upgrade). Letter
notification consumed; he never explicitly confirmed email FORMATTING was pretty —
worth one ask.

## The rig (unchanged facts + new ones)

- Build: `cd apps/graydawn && JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ./gradlew assembleRelease`
  — check gradle's real exit; keystore `keys/ptc-release.keystore` (cert fc9190db…, alias ptc, password in
  `ptc-release-password.txt` beside it). **BACKED UP 2026-07-06** to iCloud Drive:
  `~/Library/Mobile Documents/com~apple~CloudDocs/PhoneThatCares-keys-backup/`
  (keystore + password + README, checksum-verified). If the laptop copy is lost,
  restore from there — without this file no existing install can ever update.
- Website source of truth: `/Users/b/Desktop/PhoneThatCares/website` (nested repo,
  deploys from folder via `npx vercel deploy [--prod]`, git intentionally stale).
  Worktree working copy: `.claude/worktrees/seeglass-overnight/website/website-work/`
  (git-excluded); flow = edit there → build → cp changed files to main checkout →
  deploy. Page: `src/pages/offscreen.astro`; assets `public/offscreen/`.
- Preview URLs churn every deploy (SSO-gated). Latest: phone-that-cares-website-dx22oku9g.vercel.app/offscreen
- Emulators: always `adb -s emulator-5554 emu kill` after. Flaky cable: wait+retry.
- Copyedit doc (Brian's, in Obsidian): "graydawn — every word it says (2026-07-06)" —
  now historical (pre-rename); regenerate under Offscreen when copy settles.

## Open threads, in order

1. ~~"ship"~~ **DONE** — offscreen live at aphonethatcares.com/offscreen.
2. **Tweet thread** — rewritten in `_context/offscreen-tweet-thread-2026-07-06.md`;
   awaiting Brian's cut-down pass + the demo video for tweet 1.
3. **Demo video** — camera at the physical phone (daltonizer invisible to recordings);
   6-shot list in `_context/seeglass-2026-07-05/marketing-graydawn-2026-07-05.md`.
4. Brian: one page-button press → hardened 1.0 (code 8); then USB debugging off.
5. Flagged, unvetoed: notification title "N gray dawns in..."; the cut
   "wake the screen before holding" fact now lives nowhere on the page.
6. Samsung guinea pig when one appears; Kasra's iPhone recipe if he builds it.
7. Cosmetic someday: rename `apps/graydawn/` folder; regenerate copyedit doc.
