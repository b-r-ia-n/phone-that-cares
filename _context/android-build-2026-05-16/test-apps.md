# Test Apps — v1 Daily-Drive Install List

**Purpose:** ground S5 (daily-drive) in a realistic phone. Brian wants ~25 apps installed on the Pixel 6 before the daily-drive — real social, normal-life utilities, a couple of banking (expected to break, that's data), and 1-2 joke apps.

**Install path:** see "Install via Play Store" below. Sideload-via-adb fallback noted at the bottom.

---

## The list (24 apps)

### Social — 6

The actually-interesting category for the product. Pick the ones Brian uses (or might use). If preferences differ, swap freely.

| App | Package | Play URL |
|---|---|---|
| Instagram | `com.instagram.android` | https://play.google.com/store/apps/details?id=com.instagram.android |
| Twitter / X | `com.twitter.android` | https://play.google.com/store/apps/details?id=com.twitter.android |
| TikTok | `com.zhiliaoapp.musically` | https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically |
| Reddit | `com.reddit.frontpage` | https://play.google.com/store/apps/details?id=com.reddit.frontpage |
| YouTube | `com.google.android.youtube` | https://play.google.com/store/apps/details?id=com.google.android.youtube |
| LinkedIn | `com.linkedin.android` | https://play.google.com/store/apps/details?id=com.linkedin.android |

### Messaging — 4

| App | Package | Play URL |
|---|---|---|
| WhatsApp | `com.whatsapp` | https://play.google.com/store/apps/details?id=com.whatsapp |
| Signal | `org.thoughtcrime.securesms` | https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms |
| Telegram | `org.telegram.messenger` | https://play.google.com/store/apps/details?id=org.telegram.messenger |
| Discord | `com.discord` | https://play.google.com/store/apps/details?id=com.discord |

### Banking / financial — 2

**Expected to break on root.** That's the test. Don't engineer around it.

| App | Package | Play URL |
|---|---|---|
| Venmo | `com.venmo` | https://play.google.com/store/apps/details?id=com.venmo |
| Chase | `com.chase.sig.android` | https://play.google.com/store/apps/details?id=com.chase.sig.android |

### Normal pixel-owner stuff — 10

| App | Package | Play URL |
|---|---|---|
| Google Maps | `com.google.android.apps.maps` | https://play.google.com/store/apps/details?id=com.google.android.apps.maps |
| Gmail | `com.google.android.gm` | https://play.google.com/store/apps/details?id=com.google.android.gm |
| Google Calendar | `com.google.android.calendar` | https://play.google.com/store/apps/details?id=com.google.android.calendar |
| Google Photos | `com.google.android.apps.photos` | https://play.google.com/store/apps/details?id=com.google.android.apps.photos |
| Spotify | `com.spotify.music` | https://play.google.com/store/apps/details?id=com.spotify.music |
| Uber | `com.ubercab` | https://play.google.com/store/apps/details?id=com.ubercab |
| Firefox | `org.mozilla.firefox` | https://play.google.com/store/apps/details?id=org.mozilla.firefox |
| Notion | `notion.id` | https://play.google.com/store/apps/details?id=notion.id |
| Strava | `com.strava` | https://play.google.com/store/apps/details?id=com.strava |
| Outlook | `com.microsoft.office.outlook` | https://play.google.com/store/apps/details?id=com.microsoft.office.outlook |

### Joke / character — 2

| App | Package | Play URL |
|---|---|---|
| BeReal | `com.bereal.ft` | https://play.google.com/store/apps/details?id=com.bereal.ft |
| NGL: Anonymous Q&A | `com.ngl.app` | https://play.google.com/store/apps/details?id=com.ngl.app |

---

## Install via Play Store (recommended)

Best path: sign in to a Google account on the Pixel once, then batch-install.

1. On the Pixel: Settings → Passwords & accounts → Add account → Google. Sign in with whichever Google account is fine (could be your daily, could be a v1-tester throwaway).
2. Open Play Store on the Pixel.
3. From the laptop, open each Play URL above one at a time, click "Install" — the install request is sent to your signed-in device. Repeat for all 24.
4. Or: open Play Store on the Pixel, search each by name, install.

**Estimated time:** ~15 minutes total for all 24.

## Install via adb sideload (fallback)

If Play Store auth on the rooted device misbehaves (Play Protect blocks, account refuses to sign in on rooted Pixel, etc):

1. Get APKs from APKMirror (https://www.apkmirror.com) for each — that's the most-trusted public APK source.
2. `adb install -r <apk>` for each.
3. Some apps (banking, Snap) may refuse to launch because they detect sideload or root. That's already-known and acceptable.

A bulk install script `install-test-apps.sh` would look like:
```bash
APKS=( instagram-*.apk twitter-*.apk tiktok-*.apk ... )
for apk in "${APKS[@]}"; do
  adb install -r "$apk"
done
```

We're not pre-staging APKs tonight — that's a lot of bandwidth + a copyright/licensing gray zone. Use the sideload path only if Play Store fails.

---

## No-go pile (apps considered, deliberately skipped)

| App | Reason |
|---|---|
| Snapchat | Aggressive root detection; reliably refuses to launch on rooted devices. Skip rather than fight. |
| Facebook Messenger | Brian's not on FB; redundant given WhatsApp + Signal + Telegram. |
| Twitch | Not in Brian's usage; if he wants it, easy to add to S5 iteration. |
| TikTok Lite | Just TikTok is enough. |
| Snap Maps / Find My / etc | Standalone surveillance tools not relevant to v1 thesis. |
| Cash App | Banking app #3 — two is enough to test the "banking is broken" outcome. |
| Apple Music | Not on Android; not applicable. |
| Tinder / Hinge | Dating apps not in v1 use case; happy to add if Brian wants. |
| Robinhood / Coinbase | Banking-class apps; we have Venmo + Chase for that test. |
| Yo / Cuddlr | Defunct or fake-out. Real joke is BeReal-feels-like-a-joke, NGL-feels-like-a-joke. |

---

## What to look for in S5 with these installed

- **Grayscale on social apps** — does foreground-switch to Instagram/Twitter/TikTok flip grayscale fast enough that the experience feels meaningfully different?
- **Notification filter end-to-end** — set prefs like "Caroline texts, but not Twitter notifications," generate notifications from each app, observe behavior.
- **Banking failure mode** — what does Chase/Venmo show when it detects root? Is it a graceful "this device is not supported" message, or a hard crash? Either is acceptable for v1; we just want to *know*.
- **Daily-life completeness** — anything Brian reaches for and finds missing? Add to a "next batch" list in S6.

---

## Open question for morning Brian

The Google account question: sign in to your real Google account (gets full Play Store + sync), use a throwaway, or skip Google entirely and sideload everything from APKMirror? The choice has implications for what data lives on the device (real-account = real history of Brian's stuff; throwaway = blank slate; no-account = no Play Store at all, sideload only). **Architect lean:** throwaway Google account for v1 daily-drive. Lets you test Play Store + most-likely app paths without exposing your real data on a rooted device.
