# Graydawn — fresh-user design pass (July 5, designer subagent)

Roleplay: a stranger from Twitter opening Graydawn cold. Feeds the "tweet-level public" build.

## First-open confusions (in order)
1. Tagline lands — clearest sentence in the app.
2. "the key / can reach the switch" — which switch? Connected to the adb command only by luck.
3. "the chord" is never defined; reader has to guess it means the two buttons.
4. "the tangles" in orange reads as an error; "tap to untie" changes a system setting with no confirmation or receipt.
5. Nothing anywhere says whether the phone is gray RIGHT NOW.
6. Third metaphor (borrow/dawn/tide); the warning buzz is undocumented — three mystery buzzes read as a notification.
7. "go gray now" produces no visible change — the app's own beige/near-black UI looks identical in grayscale. (= Brian's "felt unclear whether it worked")
8. First chord attempt fails silently (quick press, not a half-second hold) with no feedback.

## The litmus chip (status element — the keeper)
One row under the tagline: a small rounded chip filled with a saturated dawn gradient (coral→gold→sky) + one status line. Because the daltonizer desaturates the whole display, the chip IS the status — vivid when in color, gray when gray. Self-verifying; no trust in the code required. Status line states (tnum, tick 1/min, refresh onResume):
- `gray now. hold both volume buttons to borrow color.`
- `color until 4:12 — 14 min left`
- `in color. gray returns at dawn.` / `in color. the dawn switch is off.`
- `asleep — needs the key and the listener below.`

## First-try moment
One-time inline card once key+listener are both true: (1) `tap "go gray now" below.` — chip visibly drains; (2) `now hold both volume buttons together — a full half-second, until it buzzes.`; (3) app polls borrowUntil, resolves `that's it. that's the whole trick.` Never shows again. Optional: single tiny buzz on a near-miss (both keys down+up without firing) = "almost — hold longer."

## The going-gray moment
- **Option A "the last splash"** (manual go-gray): full-screen TYPE_ACCESSIBILITY_OVERLAY color bloom fades in ~250ms while still in color; snap daltonizer at peak; the overlay — now rendered gray by the display transform itself — fades out ~500ms. You watch the color drain out of the splash. One soft low buzz. <1s, non-touchable.
- **Option B** (end-of-borrow, mid-scroll): keep triple warn-buzz; at the snap a ~1.5s bottom whisper `gray again.` Legible, not hijacking.
- Borrow start: ~1.5s whisper `20 minutes of color` (buzz says "heard you," whisper says "how much").

## Copy pass
Principle: keep the poetic names as HEADERS; make every caption's first clause literal. One word for the gesture everywhere: **"the hold"** (drop "chord" — musician-brain, never defined).

| current | proposed |
|---|---|
| tagline | add `— a half-second —` |
| `granted — graydawn can reach the switch` | `granted — graydawn can flip the phone's color switch` |
| `not yet granted. from a computer, once: …` | `not yet — have a friend with a laptop run this once:` + command |
| `listening for the chord` | `on — watching for both volume buttons held together` |
| tangles lead-in | `things on this phone that would fight the hold:` |
| `…tied to color correction — it grabs the chord…` | `your phone already uses hold-both-buttons for color correction — it catches the hold before graydawn can. tap here to untie it.` |
| `no tangles found — the chord is yours alone.` | `no tangles — the hold is yours alone.` |
| `20 minutes of color, then the tide comes back` | `each hold buys 20 minutes of color. three soft buzzes, then gray comes back.` |
| `go gray now` | keep text; give it button affordance |
| `(waiting for the key)` | `(needs the key above first)` |
| `gray every dawn / around 4:00 each morning…` | keep — best copy in the app |

## Quick takes
- **Merge with Seeglass: no.** Different install stories, trust asks, mental models. Merging makes each look bigger and scarier exactly when you want "tiny weird thing." Siblings in the tweet thread, not in the binary.
- **Analytics: no.** At n<50, replies/DMs beat dashboards; "no network, nothing ever leaves your phone" is the strongest trust line an accessibility+WRITE_SECURE_SETTINGS app can have. Even local stats cut against the ethos.
- **Tweet:** "i made a weird little app. every morning at 4am your phone loses its color. holding both volume buttons borrows 20 minutes of it back." adb friction framed honestly as a feature — "you'll need a friend with a laptop for one command. it's that kind of app." Film the physical phone: hold, buzz, splash draining to gray = the money shot.

## Small extras
- Untie needs a receipt: after success, `untied — the hold is yours now.`
- Slider feedback already good; leave alone.
