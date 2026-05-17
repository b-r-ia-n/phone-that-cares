# PTC Design Skill — "Warm Restraint"

A reference for any Claude instance building UI for The Phone That Cares (lock-screen mocks, Telegram-bot mini-apps, bookmark surfaces, settings, website, mobile shells). Read this before designing.

Brian's taste isn't fully crystallized yet — this captures the read as of 2026-04-30 from a 35-reference taste-rating session. Treat it as a working compass, not a finished spec.

---

## The thesis

**Warm restraint, plus one piece of small magic.**

The PTC visual register is Rauno-school (Linear, Vercel, Emil Kowalski, Paco Coursey) **plus the warmth axis Rauno doesn't model.** Brian explicitly confirmed this when rating Things 3: *"where to steal softness Rauno doesn't model — this feels good for that."*

So: the typographic discipline, sub-200ms motion, tabular numerics, soft surfaces, custom focus rings, and chord-keyboard sensibility of the design-engineering canon — but wrapped around something that feels human, quiet, and quietly magical. Not cold. Not severe. Not trendy. Not retro.

The Light Phone is the foil. Same calm-tech category, but Brian reads them as throwing out the baby (warmth, joy, life) with the bathwater. PTC must not feel ascetic.

---

## Loves (steal directly from these)

- **Things 3** — softness. Spring physics that retain velocity. The patron saint of slow, careful mobile UI.
- **Daylight Computer** — *"charmingly not modern, not trendy, but also not old or dated."* The scroll-color background shift felt magical. Aim for one such moment per surface.
- **iA Writer** — surfaces *just the right information and just enough of it.* Type rhythm to steal directly for any reading surface.
- **Beeper** — *"your whole attention gets segmented such that one thing happens at a time."* Architectural restraint, not just visual restraint. One thing at a time is a real PTC value.
- **Paco Coursey** — same scene as Rauno, slightly more playful. The "slightly more playful" half is where PTC lives.

The pattern: warm restraint + one piece of small magic. Each of these has a quiet, hand-made quality.

---

## Likes (good signal, use as supporting references)

rauno.me, Emil Kowalski, Linear, Resend, Family, Arc, Raycast, Claude.ai, Granola, Light Phone (as visual exec, not positioning), Aperture, Maggie Appleton, Teenage Engineering, Playdate.

Notable per-ref reads:
- **Granola**: *"a little personality, but not too much, which is appropriate for a notes app — also appropriate for my app, probably."* Take this as guidance for PTC personality calibration. Some warmth in copy, never cute-overload.
- **Teenage Engineering**: lots of dense visual content, doesn't feel overwhelming because of *really well-defined dividing lines.* Use clean structural separation when surfaces get information-dense.
- **Arc**: nice color, feels nice — but pushy UI is a knock. Don't be pushy.
- **Maggie Appleton**: kinda cute, kind of friendly. Cute-friendly is in-bounds; cute-overload is not.

---

## What to dodge

- **Cold competence** — Vercel, Perplexity, Craig Mod, Liveblocks all rated meh. *"Well-executed but normal-ass."* Technical polish without warmth reads as soulless. PTC must not feel like a SaaS landing page.
- **Juice-cranking** — Opal: *"really good at turning the juice up… but the effect is severe… almost like a kid's Chuck E. Cheese, a little too much."* No glowing stones. No video-game magic. The "magic" should be quiet (Daylight scroll-shift quiet), not loud.
- **Sloppiness mistaken for charm** — T3 Chat: *"nice vibes but feels Limewire."* The only outright "pass" in the set. Unstyled or under-considered surfaces read as disrespect. Hand-made ≠ unfinished.
- **Severity / asceticism** — Light Phone (as a positioning lesson, not a visual one). The whole point of PTC is that calm tech does not require austerity.

---

## Practical guidance for upcoming PTC surfaces

These are the surfaces Brian mentioned — Telegram-bot mini-apps (bookmarks viewer, settings, etc.) and continued lock-screen / website work.

### Color & surface
- Warm off-white and soft near-black, not pure white / pure black.
- One warm accent (think Family's monochrome-with-one-warm-accent approach). Brian's existing taste-gallery uses `--accent: #c8b89a` — a warm tan. Keep within that warm-neutral family unless a surface specifically calls for differentiation.
- Surfaces should feel slightly *off* — never the cold gray of a default Tailwind theme.

### Typography
- Type-led layouts. Steal iA Writer's rhythm.
- Tabular nums for any numeric display (counts, timestamps, ratings).
- Uppercase small-caps for section labels, with generous letter-spacing — but use sparingly.

### Motion
- Sub-200ms for most transitions. Spring physics for anything that moves spatially (sheets, drawers, list reorderings) — Things 3 / Family register, not iOS bounce-house.
- **One small magic moment per surface.** Not on every interaction. Daylight does it once (the scroll background shift) and it lands. Resist the urge to sprinkle.
- Never animate high-frequency actions (typing, scrolling deltas, hover feedback on dense lists).

### Interaction architecture
- Beeper principle: *attention gets segmented such that one thing happens at a time.* Don't show everything at once. Sequence the surfaces. A bookmarks view should not also surface settings, notifications, AI suggestions, and a feed simultaneously.
- iA Writer principle: surface just enough information.
- Don't be pushy (Arc knock). No upsells, no nags, no "complete your profile" prompts. The phone is supposed to *care*, which means not nagging.

### Copy
- Granola register: a little personality, not too much. Warm but professional. The phone has a point of view but doesn't perform it.
- No emoji unless deliberate. No exclamation points unless deliberate.

### What "small magic" can look like
- A tiny scroll-driven reveal (Daylight).
- An interaction whose timing feels human, not robotic — a list item that settles into place rather than snapping.
- Tabular numbers that animate by digit on update (Apple Sports register).
- A custom focus ring that's quietly distinctive.
- A sound — Rauno-style, used once on a meaningful action, never on every click.

---

## Telegram-bot mini-app specific notes

The mini-apps live inside Telegram's webview. That gives them a constraint: they appear *inside another app's chrome*, so they can't compete with system UI for attention.

- Lean further into restraint than you would for a standalone web app.
- Use Telegram's theme variables (`var(--tg-theme-bg-color)` etc.) so the mini-app respects the user's Telegram theme — but layer the PTC warm palette on top via accent color and surface treatment, so it still feels like PTC.
- A mini-app is a transient surface — the user came from a chat and will return to it. Don't over-scaffold. Single-purpose, single-screen, in-and-out.

---

## On time

For any proposed gesture or flow, imagine the wall-clock cost — in seconds — and compare to the convention it replaces. Brian's "four rooms with doorways" (`visuals/entry-models-study.html` model 09) is the template move: take a gesture people already do, load it with meaning at no added time.

---

## How to use this file

When building any PTC surface:
1. Start by naming what *one piece of small magic* the surface earns. Often the answer is "none for this surface" — that's correct sometimes.
2. Check your draft against the dodges: is it cold-competent? Juice-cranked? Sloppy? Severe?
3. Check it against the loves: would Things 3 / Daylight / iA Writer / Beeper recognize it as a sibling?
4. If you're unsure, default toward less. Restraint is the safer error.

If something in this doc seems wrong for the surface you're building, flag it to Brian rather than working around it. The taste model is still being calibrated.
