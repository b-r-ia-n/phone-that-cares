# T7 — Notification filter scaffolding

**Status:** scaffolding shipped (deliverables 1-4). LLM stretch goal (5) NOT done.
**Started:** 2026-05-16 23:11 PDT
**Branch:** `wip/overnight-2026-05-16` in `/Users/b/Desktop/PhoneThatCares/phone-os/android-v1/launcher`

## What shipped

1. **`NotificationFilter.kt`** — pure Kotlin, no Android deps, unit-testable. Parses Brian's natural-language prefs into Phrase{polarity, keywords} via splits on `but not`/`but`/`,`/`;`/`.`/` and `/`except`. Polarity classified by negative markers (`don't notify`, `but not`, `hide`, `mute`, etc.) vs positive markers (`let me know`, `tell me`, etc.). `evaluate(source, content, prefs)` returns `Show` / `Hide` / `Unknown`. Negative matches win over positive (explicit hides beat shows). Unknown is fail-open at call site (treated as Show).
2. **`NotificationPrefsStore.kt`** — SharedPreferences-backed prefs file (`ptc_notifications`), debug-log toggle, and a Compose-observable in-memory `SnapshotStateList` ring buffer of the last 20 filter decisions.
3. **`NotificationsSettings.kt`** — Compose section that mounts inside `SessionsScreen` (Discover surface). Includes:
   - Section header `NOTIFICATIONS` — **long-press (>550ms) toggles the debug log footer** and persists the toggle in SharedPreferences.
   - `BasicTextField` bound to prefs, persists on every keystroke. Placeholder text matches Brian's example: *"Let me know if Caroline texts or I get a LinkedIn message. Don't notify me about Twitter."*
   - Caption: *"lockscreen + heads-up only · shade stays stock"* — encodes the mirror-Android principle visibly.
   - Debug rows show: `HH:mm:ss · app · content-snippet · SHOW/HIDE/UNKN · Xms`.
4. **`PtcNotificationListenerService.kt`** — extends `NotificationListenerService`. On `onNotificationPosted`: extracts source + (title + text + bigText) → calls `NotificationFilter.evaluate` → logs to ring buffer → if `Hide`, calls `snoozeNotification(key, 1L)` to drop the heads-up while leaving the notification in the shade.
5. **`AndroidManifest.xml`** — registered service with `BIND_NOTIFICATION_LISTENER_SERVICE` permission + intent-filter for `android.service.notification.NotificationListenerService`. Added `<uses-permission>` declaration.
6. **`strings.xml`** — added `notification_listener_label` for the service.
7. **`DiscoverScreen.kt`** — inserts `NotificationsSettingsSection` as a full-width header item in the existing `LazyVerticalGrid` (using `item(span = GridItemSpan(maxLineSpan))`), so it scrolls naturally above the per-app grid without competing scroll containers.
8. **`NotificationFilterTest.kt`** — 6 unit tests covering Brian's example prefs (Caroline-show, LinkedIn-show, Twitter-hide, unknown-app, empty-prefs, negative-wins-over-positive).

## Files created / modified

Created:
- `phone-os/android-v1/launcher/app/src/main/java/com/ptc/launcher/NotificationFilter.kt`
- `phone-os/android-v1/launcher/app/src/main/java/com/ptc/launcher/NotificationPrefsStore.kt`
- `phone-os/android-v1/launcher/app/src/main/java/com/ptc/launcher/NotificationsSettings.kt`
- `phone-os/android-v1/launcher/app/src/main/java/com/ptc/launcher/PtcNotificationListenerService.kt`
- `phone-os/android-v1/launcher/app/src/test/java/com/ptc/launcher/NotificationFilterTest.kt`

Modified:
- `phone-os/android-v1/launcher/app/src/main/AndroidManifest.xml` — registered service + permission
- `phone-os/android-v1/launcher/app/src/main/res/values/strings.xml` — service label
- `phone-os/android-v1/launcher/app/src/main/java/com/ptc/launcher/DiscoverScreen.kt` — inserted settings section as grid header item

## Permission grant required at install time

After APK install, the notification-listener access has to be granted (Brian or adb):

```bash
adb shell cmd notification allow_listener com.ptc.launcher/com.ptc.launcher.PtcNotificationListenerService
```

Or via UI: Settings → Apps → Special access → Notification access → toggle "Phone That Cares — Notification Filter".
Without this grant, `onNotificationPosted` never fires; the prefs UI still works but the filter is a no-op.

## Depends on rebuild + emulator test to validate

- APK rebuild via the T2 module flow (parent instance handles).
- After install on emulator: post a test notification, confirm `onNotificationPosted` logs an entry to the debug ring buffer.
- Long-press the `NOTIFICATIONS` header → verify debug footer appears.
- Type into the prefs box → kill app → relaunch → confirm prefs persisted.
- Hide-decision behavior on real notifications: `snoozeNotification(key, 1L)` works on stock Android 14 but the exact UX (does heads-up flicker briefly? does lockscreen still show it during the 1ms snooze window?) needs hardware observation. **The real v1 target is to do filtering inside our own Keyguard substitute (T6/S3) rather than fighting stock SystemUI — once SystemUI's Keyguard is disabled, we render our own notification list and consult `NotificationFilter` there. The current snooze-based path is a stopgap.**

## Open questions for morning Brian

1. **Hide UX semantics — confirm intent.** Currently `Hide` = "no heads-up, no lockscreen presentation, but stays in shade." Brian's words match this. But there's a softer option (defer/snooze for 5 min then re-evaluate) and a harder one (DND-style — also silenced if phone is ringing). v1 = strict snooze-based. Worth a sanity check before S3 wires it into the real lockscreen.
2. **Heads-up flicker via `snoozeNotification`.** Snoozing for 1ms doesn't prevent the heads-up from rendering for the brief instant before snooze takes effect — there may be a visible blip. Two cleaner paths if this matters: (a) cancel the notification and re-post a copy with `VISIBILITY_SECRET` (loses original app identity), or (b) wait for the Keyguard substitution work in S3, where we control the lockscreen render and can simply choose not to display Hide-decision notifications. (b) is the principled fix.
3. **LLM wire-up not done.** Stretch goal — skipped to keep the night within budget and because the keyword-match stub is genuinely useful for Brian's example prefs. To wire it up: create `LlmNotificationFilter.kt` with an `evaluate` that calls Anthropic Haiku, plumb `ANTHROPIC_API_KEY` via `BuildConfig` (currently `OPENAI_API_KEY` is plumbed — different env var), add an `LruCache<String, Decision>` keyed on `(app, content-hash)`. Fail-open: any LLM error returns `Unknown` → caller shows.
4. **Debug-log access pattern.** Long-press on the `NOTIFICATIONS` header is unobtrusive but undiscoverable; if Brian wants the debug log to be visible by default during dogfooding, flip the SharedPreferences default to `true` for now.

## Tried and failed

Nothing material. The one tricky spot was nested-scrollable layout (verticalScroll wrapping a LazyVerticalGrid is a Compose anti-pattern); resolved by inserting the settings section as a `GridItemSpan(maxLineSpan)` header item inside the existing grid, which scrolls naturally as one list.

## Commits

- `T7: notification filter scaffolding (prefs UI + listener + stub filter)` — single commit covers all the files above. Single commit (vs Brian's "one commit per task" hint in the build plan) because the deliverables are tightly coupled — splitting them would produce intermediate states that don't compile.
