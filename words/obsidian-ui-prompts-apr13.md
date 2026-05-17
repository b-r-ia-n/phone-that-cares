
Project context (prepend this to any tool)
A phone lock screen and four companion screens for a speculative mobile OS called "A Phone That Cares About You." The aesthetic is quiet, dark, beautiful — not harsh, not scoldy, not minimalist-bro. Think calm technology, soft contrast, generous space, line-based icons. The overall feeling should be that this phone is on your side.

Screen 1 — Lock screen (the hub)
A standard Android lock screen with a four-way swipe interaction. The swipe takes place from the center of a circle sitting roughly where the fingerprint sensor is on a Pixel (about a third of the way up from the bottom, centered horizontally). There's a small indicator showing where your finger is as you drag — a little dot or puck that follows your thumb.
As your finger approaches each of the four edges of the circle, the circle changes color to indicate which space you're about to enter:

Up → Discover: circle tints soft warm yellow/amber
Down → Ask (voice AI): circle tints soft violet
Left → Connect: circle tints light green
Right → Home (normal phone): circle tints light blue

At rest, the circle is barely visible — a faint ring. Four small icons sit at the four compass points just outside the ring, very low opacity, just enough to be learnable: a small plant with two leaves (Discover, up), a microphone (Ask, down), a message-with-heart (Connect, left), a 3×3 grid (Home, right). Icons should be Lucide or Phosphor style — consistent stroke weight, line-based.
Above all of this: a large, quiet time display (something like 10:42) and the date below it in small tracked-out caps. Wallpaper is very dark, almost black, with a subtle gradient or texture — not a photo.

Screen 2 — Connect (messaging)
A unified messaging inbox that pulls from all the user's messaging apps — iMessage, WhatsApp, Messenger, Signal, Instagram DMs, Telegram, etc. The app is called Connect.
Each row in the list shows:

A contact circle on the left with the person's profile picture inside it
A smaller app badge tucked into the corner of the contact circle (like a notification badge position) showing which app the message is from — WhatsApp logo, Messenger logo, iMessage bubble, etc.
The person's name and a preview of the latest message
A low-opacity, small-font indicator somewhere on the row showing how long it has been since you last messaged them, or since they last messaged you ("3d", "2w", "last spoke 4mo ago")
A button at the far right of each row that takes you to a separate page where you can talk out loud to your phone about the conversation and how you feel about the person — think of this as a reflective layer before you reply. Icon for that button should feel warm, not clinical.

At the top of the screen there's a filter control — horizontal pill chips or similar. Example filters:

"Waiting on your response"
"They're waiting on you"
"Haven't talked in a while"
"All"

Header of the page says Connect. Overall feel: calm, not anxiety-inducing. No red notification badges. No unread count shouting at you.

Screen 3 — Discover (scroll / meta-feed)
A feed page that shows content clearly from multiple sources and multiple types of sources in one place — Substack essays, Instagram photos and videos, YouTube clips, blog posts, tweets, articles — all surfaced together. Each content card should make its source obvious (small source badge or label) so the mix is visible and intentional, not flattened into one homogeneous feed.
The top of the screen has category chips you can tap to filter. Specific categories to show:

Needlework
Surfing
Dank memes
And have the edge of a fourth category just barely visible at the right edge of the screen, implying more (something like "Ceramics" or "Trail running" — pick something specific, not "Food" or "Travel")

Above the category chips, at the very top, there's a "For You Today" option — this is the headline mode. When selected, it scrapes across all the user's interests and surfaces the best stuff it thinks they'll want to see today. It's the default when you land on this screen.
The feed itself should show 2–3 cards visible at once, with the mix of sources obvious — e.g. a Substack essay card on top, an Instagram photo below it, a YouTube thumbnail peeking in at the bottom. Each card clearly branded with its source.
Header says Discover. Again, calm — no infinite-scroll dopamine cues, no red dots, no autoplay indicators.

Screen 4 — Home (standard home screen)
This is a standard smartphone home screen with app icons arranged in a grid. You can open the app drawer from here if you want, but the default is the home screen. Users still need to get to their bank app and their airline app — this is the escape hatch.
The aesthetic should match the other pages — same dark background, same type treatment, same overall calm — but this screen is otherwise intentionally unremarkable. Just a pretty, compelling, normal home screen. App icons in rows, clock at top, a small dock at the bottom with 4–5 common apps.
The point: this phone isn't taking anything away from you. The normal phone is right there, one swipe right, whenever you want it.

Screen 5 — Ask (voice AI overlay)
An LLM-powered voice conversation interface. This one is different from the others: it takes up the whole screen, but it should look like an overlay on top of the lock screen — the time and date from screen 1 are still faintly visible behind it, dimmed but present. The user hasn't actually "entered" a visual phone UI; they're just talking.
The screen should show:

The LLM's opening line displayed as soft text, something natural like "Hey — what's up?" or "What do you want to do?" (lean toward "What do you want to do?" since this interface is still taking actions on the phone on the user's behalf — texting people, looking things up, setting timers, etc.)
A bit of memory/history — one or two faint, low-opacity snippets of recent context or past exchanges floating above the current prompt, like "yesterday: you asked me to remind you about the dentist" or "this morning: drafted a reply to Sarah". Just enough to signal this thing remembers you, without overwhelming.
A live audio indicator somewhere central — a soft waveform, breathing dot, or animated ring — showing that the phone is actively listening.
No keyboard, no send button. This is voice-first. If there's any text input affordance at all, it's a small secondary option.

The overall feeling is intimate and quiet — like the phone is a friend who picked up on the first ring and is actually paying attention. Not a chatbot, not Siri's hard beep.


---

this is intended to be a mobile phone based on the Android OS.

---

some clarifications made after seeing a v1 generation based on this prompt:

Okay, this is looking really good. I'm gonna make a couple small changes. One is I want this to look like a sort of standard Android device. So I want to have you add you know the 4G LTE, the bars, the battery. Yeah, that stuff at the top. We also might want like a little weather icon. maybe saying sun comes out in 15 minutes or something. As well as I think our current press location is a little bit too high. I want to move it like well you know I don't know how to quantify it. One third of the way between the current location and as far as it would go down on the screen. So just a little bit lower. I want to add a couple notifications. Maybe like a text from a friend. maybe just two different like a text from a friend and something else like that. I think we also want little visual indicators of like camera and flashlight, maybe. I would like to add some actual image to the discovery page. I also think I actually want to remove needlework as a category. Yeah, I'd like to have some actual content on that page just for understanding. And I think the same standard Android like battery and data and like little notifications maybe top left. Like indicator visual indicators of like Slack messages, text, battery mode, that sort of thing. Just so it feels a little more fleshed out like a standard phone operating system. This is not a big deal, but I think the swipe action on the main lock screen page, the color change begins a little bit too quickly. I want the color to not change until we're let's say it all until we're a third of the way towards the outside of the circle. And shouldn't hit max color until we're like at least two thirds of the way. or maybe until we're right at the edge of the circle. And it would be great if right when you get to the edge of the circle. there's some sort of like maybe the outer ring increases in brightness by 50% or something. Just to show that if you let go now, it's gonna do something. the connect page looks a little I think we want it denser. Like if I open Google Messages on my phone, for example. the Google messages takes up I don't know, 10% of the screen or less, that little thing. It also I think we want a search bar top right. I think we want I guess we can't have an indicator of you because the U that you were being maybe different across apps. But at least a search and then the connect thing should be kind of small. also like that page to open up to a second page, which is a meta-level talking about this conversation page. We'll give you some description of that and a revision of the messaging page below

---

Alright, putting on the persona. I'm going to be opinionated.

---
## Revised prompts for the AI tools

Keeping these consistent with the overall project aesthetic from the earlier prompts (dark quiet background, line icons, soft contrast, calm). The warm amber is out; use the overall palette you were getting good results with in Figma Make.

### Prompt: Connect screen (inbox)

> A unified messaging inbox screen for a speculative mobile OS called "A Phone That Cares About You." The aesthetic is quiet, dark, beautiful — calm technology, soft contrast, generous space, line-based icons. Very dark near-black background with subtle gradient. No warm amber accents; use cool neutral tones with the softest possible accent color.
> 
> Header: the word **Connect** in a quiet sans-serif, left-aligned. A small search icon and a user avatar in the top right. No section headers anywhere else on the screen.
> 
> Main content: a single vertical list of 7–8 conversation rows, no section dividers, no category headers. Each row shows only:
> 
> - A contact avatar (circular photo) on the left
> - A very small platform badge (WhatsApp, iMessage, Signal, Messenger, etc.) tucked into the bottom-right corner of the avatar, tiny and low-contrast
> - The contact's first name in medium weight
> - A one-line preview of the most recent message, truncated
> - A single, quiet time indicator on the right showing **time since the last exchange** (e.g. "3 weeks", "2 days", "4 months") — not a timestamp. Low opacity, small type.
> 
> No unread badges. No red dots. No notification counts. No "waiting on you" labels. No colored dots of any kind. No timezone indicators. The rows should feel spacious and evenly weighted — each person present, none shouting.
> 
> Near the bottom of the scroll (not fixed, just appearing once as you scroll), a single quiet callout card: a soft suggestion from the phone about one specific person the user hasn't connected with in a while. Example copy: _"You haven't talked to Marcus in 6 weeks — you two usually vibe."_ Below that, a single text link: _"Think out loud about it →"_. This card should feel like a friend leaning in, not a notification. One at a time, dismissable. Don't make it a fixed section — make it feel like it's quietly sitting in the flow.
> 
> Bottom of screen: a minimal tab bar with 2–3 tabs maximum. No floating action button. No compose button. (People compose by tapping into a thread, not from a global CTA.)
> 
> Overall feeling: walking into a quiet room where all your relationships live. No anxiety, no urgency, no triage. Just: here are your people.

### Prompt: Think Out Loud screen (reflection, per-person)

> A reflection screen in the same mobile OS. You arrive here by tapping "Think out loud about it" from the Connect inbox. The aesthetic matches: dark near-black background, quiet, spacious, line-based icons, calm.
> 
> This is NOT a messaging composer. There is no text input field visible at the top. This is a space to talk out loud to your phone about a person and a relationship, with no pressure to send anything.
> 
> Header: a small back arrow top-left, and the text **Think Out Loud** in quiet sans-serif, centered or left-aligned.
> 
> Main content, centered and breathing:
> 
> - The person's first name only — e.g. **Marcus** — in a medium-large quiet display type. No big profile photo. A very small avatar thumbnail (or none at all) next to the name is fine.
> - A single quiet context line below the name, in small low-opacity caps or regular text: _"You last talked 6 weeks ago. You've messaged 40+ times over the years."_ Factual, no judgment, no nudge.
> - A large, soft, centered **breathing microphone affordance** — a circle with a mic icon, gently pulsing, indicating the phone is already listening. No button to press to start. You arrive, it listens.
> - Just below the mic, a single line of prompt text: _"Take your time. What's going on with Marcus?"_ or similar. Tone should be warm but not therapeutic — like a patient friend, not a counselor.
> 
> Nothing else on screen. No "draft a message" CTA. No "just thinking for now" secondary button. No bottom nav chrome. No cards, no sections.
> 
> After the user speaks and pauses (this is the _next_ state, you can mock it as a second frame if helpful): a very quiet prompt appears at the bottom offering _"Want me to help you draft something?"_ as a small text link. Optional. Dismissable. The point of this screen is the pause, not the draft.
> 
> Overall feeling: stepping into a small, quiet room with one person who is listening. No phone, no interface, just attention. The mic and the name. Beauty through removal.