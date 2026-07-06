I# Graydawn — marketing / framing pass (July 5 overnight)

For Brian, over coffee. Docs only, nothing deployed. Frame held throughout: nothing is taken,
nothing is owed. Gray is a different default. The hold saturates the phone for twenty minutes;
at the end the saturation drains back. No debt words anywhere.

---

## 1. Tweet thread draft

Five tweets. Tweet 1 carries the camera video. Lowercase to match the app's own voice.

**1/**
> i made a weird little app. every morning at 4am, while you're asleep, your phone quietly
> loses its color. holding both volume buttons — a half-second, until it buzzes — brings the
> color back for twenty minutes at a time.
>
> it's called graydawn.
>
> *(attach: camera video of the phone)*

**2/**
> it doesn't block anything. no timers, no streaks, nothing to fail at. your phone at 4pm
> works exactly like it did at 4am — it's just gray. turns out color was doing a lot of
> the asking.

**3/**
> fun fact from building it: screen recordings can't see the effect. the gray happens in the
> display hardware, downstream of everything software can capture. every graydawn video is a
> camera pointed at a physical phone. i love that the only way to show it is the honest way.

**4/**
> the whole app is about five hundred lines. one permission. no internet access — nothing
> leaves your phone, ever. around day twelve it offers to help you write me a letter about
> whether anything changed. you read the letter, you send it. or you don't.

**5/**
> installing it takes one command from a laptop — you'll need a friend with adb, or to be
> that friend. it's that kind of app.
>
> aphonethatcares.com/graydawn

Notes on the thread:
- Tweet 2 is the thesis smuggled in as an observation. "color was doing a lot of the asking"
  is the line most likely to travel; keep it even if trimming to 4 tweets.
- If trimming: cut tweet 3 (move the camera fact to a reply when someone asks why the video
  looks filmed).
- Never write "borrow," "earn," "spend," "allowance," "detox," or "screen time" in replies
  either. If someone frames it as self-control, the reply is: "it's not restriction — nothing
  stops working. it's just a different default. the color's still yours whenever you want it."

---

## 2. Download-page copy (aphonethatcares.com/graydawn)

**Headline:**
> **graydawn**
> the day begins gray.

**Section — what it does:**
> every morning around 4am, your phone's display goes grayscale. all of it, system-wide,
> at the hardware level. everything still works — messages, maps, camera, the whole phone —
> it's just gray.
>
> when you want color, hold both volume buttons for a half-second, until it buzzes. the
> screen saturates for twenty minutes, then drains back to gray with a soft warning first.
> hold again whenever you like. there's no count, no limit, and nothing keeping score.

**Section — what it doesn't do:**
> graydawn has no internet access — the permission isn't even in the app. nothing you do
> ever leaves your phone. no accounts, no analytics, no dashboard. it's about five hundred
> lines of code and you can read every one of them.
>
> around day twelve, it will ask — once — whether the gray has changed anything, and offer
> to help you write a letter to the person who made it, with your before-and-after screen
> time if you choose to share it. you read the letter before it goes anywhere. you send it
> yourself, or you don't. that's the entire data story.

**Section — installing it:**
> this is the honest part: graydawn needs one command from a computer, once, to be allowed
> to flip your phone's color switch. you'll need a friend with a laptop, or to be that friend.
>
> 1. download the apk and install it *(link)*
> 2. from a computer with adb, run once:
>    `adb shell pm grant com.ptc.graydawn android.permission.WRITE_SECURE_SETTINGS`
> 3. open the app — it walks you through the rest (an accessibility toggle so it can hear
>    the volume buttons, and it will point out anything on your phone that would fight the
>    hold, with a tap to fix it)
>
> it's a strange install for a strange app. the friction is real, and it's also a filter:
> if you make it through, you wanted this.

**Section — will it work on my phone?**
> built and lived-with on a pixel. samsung and motorola should work and are being tested —
> if it misbehaves on yours, that's exactly the kind of letter i'd love to get. *(update this
> line once the compat research lands.)*

**Section — on an iphone? (decided July 6: include this — good-faith availability, nobody excluded)**
> the iphone version is not an app — apple doesn't let apps touch the display's color or
> hear the volume buttons. but your iphone already knows how to do most of this; here's the
> incantation:
> 1. *gray by default:* Settings → Accessibility → Display & Text Size → Color Filters →
>    Grayscale
> 2. *gray every dawn:* Shortcuts → Automation → 4:00 AM daily → "Set Color Filters" On →
>    Run Immediately (it runs silently)
> 3. *the hold:* set the Accessibility Shortcut to Color Filters, and triple-click the side
>    button for color. different gesture, same muscle.
> what you don't get: the 20 minutes. color stays until you triple-click again or dawn
> comes back around. about 80% of the thing, zero downloads.

---

## 3. Demo video shot list (camera at the physical phone — always)

1. **the premise** — dark room, phone face-up on a nightstand, clock somewhere reading 4:00.
   nothing happens on screen. hard cut: morning light, a hand picks the phone up, the whole
   screen is gray. no caption needed.
2. **the hold** — close-up, side of the phone, thumb and finger squeezing both volume buttons.
   hold long enough that the half-second reads on camera. the buzz lands (sound on — let the
   vibration be audible against the table).
3. **the saturation** — the money shot. screen fills with color as the splash blooms, or simply:
   a gray photo album becomes a colored one. dwell here. this is the shot that makes people
   want it.
4. **the drain** — at minute twenty: three soft buzzes, then the splash going gray in the hand,
   mid-scroll. calm, not dramatic. the point is that nothing bad happened.
5. **ordinary gray life** — a few seconds of normal use in grayscale: texting, maps, camera.
   proof that nothing is broken or locked.
6. *(optional, for the camera-fact tweet)* — laptop screen showing a screen-recording of the
   same moment, in full color, seeing nothing. phone beside it, gray. one shot, no words.

Practical: film in daylight for shots 2–5 (gray reads better against a warm room), lock
exposure so the snap doesn't trigger auto-adjust, and do a take of the hold with a sock or
cloth under the phone so the buzz is audible but not rattly.

---

## 4. Framing notes

- **Lead with the image, not the problem.** No phone-addiction statistics, no "we spend X
  hours a day." The premise — your phone loses its color at dawn — is stronger than any
  framing of why.
- **"Weird little app" is the genre.** It's a gift and a curiosity, not a solution or a
  program. The moment it sounds like a wellness product, the people it's for stop reading.
- **Nothing is taken, nothing is owed.** The color is yours the whole time; gray is just the
  default the day starts from. Watch verbs: the hold *brings back* / *saturates*; the end
  *drains back*. Never borrows, earns, spends, runs out of allowance.
- **Friction is a feature, stated plainly.** The adb command filters for the right first
  users and doubles as the trust story — an app this invasive-sounding *should* be hard to
  install and easy to read.
- **The camera-only demo is proof, not a limitation.** "software can't screenshot it" says
  the effect is real at a level apps don't reach. Use it.
- **The letter is correspondence, not data collection.** Always "write me a letter," never
  "share your data." The user reading it before sending is the whole point — mention that
  every time.
- **Don't promise outcomes.** Not "you'll use your phone less." If pressed: "i genuinely
  don't know yet — that's what the letters are for."
- **Seeglass stays a footnote.** Different install, different trust ask. "there's a sibling
  app for the browser side" at most; separate binaries and separate pages by design.
- **Words to never use:** wellness, detox, dopamine, mindful, screen time (except inside the
  letter feature where it's literal), habit, willpower, take back.
