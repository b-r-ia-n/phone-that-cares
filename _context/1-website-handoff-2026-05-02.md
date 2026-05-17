# Handoff — Website

**Last updated:** 2026-05-02
**Builds on:** `HANDOFF-website.md` (2026-04-25). The longer doc still describes deploy mechanics, the OS mock build pipeline, Supabase schema, secrets, decisions / posture, and how Brian works — read it first if you're new here. This file covers only what's changed since.

---

## Critical context, restated

**The site does not deploy via git.** Deploys go straight to Vercel via `npx vercel deploy --prod --yes` from `Website/`. The repo has only 2 commits ever and ~45 files in flight (modified + untracked) — that's normal here, do **not** try to "push to ship." A previous instance got confused about this and wanted to commit/push the new `/telegram-bot` page; we deployed it via Vercel instead. If you find yourself reaching for `git push`, stop and reread.

`claude-peers` MCP was not loaded in this session — only the Figma MCP. If you need to reach another instance, ask Brian to relay.

---

## What changed since 2026-04-25

### Brainstorms page (`src/pages/brainstorms.astro`) — heavy iteration

The page went through ~6 rounds of polish for sharing on Twitter. Final shape:

- **Lede (paragraph block):** "Come help me think about how phones work now and how they should work in the future. Sundays 4–5:30pm Pacific on Google Meet. RSVP to help me build hype, or just show up if you feel like it."
- **Sessions are numbered:** "1. Assistants", "2. Embodied phones", "3. TBD", "4. TBD". Number is rendered as `<span class="topic-num">{i+1}.</span>` inside the h2.
- **Calendar chip on the right of each title** — month-over-day pill ripped from `WeeklyCallCard` and downsized (38px min-width, 0.58rem month, 0.92rem day). Each chip is the GCal link for that session.
- **Session 1 (Assistants)** blurb was rewritten by Brian: "So we can fit intelligence in a box. Surely this can make our lives better somehow, right? But how? Come talk about assistants. What would actually be useful to people, what areas of life do you want remembered, reminded, actions taken on your behalf?"
- **Session 2 (Embodied phones)** blurb has concrete examples instead of the original "or whatever" — turning the phone in a circle, standing up every ten minutes, inferring emotional state from how you're holding it.
- **Session 3 is no longer a poll.** It used to render `<BrainstormPoll>` with two options. Brian decided to skip the on-site poll and run a Twitter poll instead. Session 3 is now just a TBD blurb listing potential options ("phone addiction", "history of tech change", or "DM me on Twitter to suggest"). The `<BrainstormPoll>` component still exists at `src/components/BrainstormPoll.jsx` and is fine to leave, but is currently unused. The Supabase tables `brainstorm_poll_votes` are still there with prior data.
- **ASCII dividers got mobile variants.** Each session has both a `divider` (full width, ~80 chars) and a `dividerMobile` (~30 chars). CSS toggles between them at the 480px breakpoint via `.divider-wide` / `.divider-narrow` classes — was clipping silently before.
- **Calendar event description cleaned up:** dropped the misleading "Set reminders: 2 hours before + 20 minutes before" line (GCal can't honor that programmatically anyway). Also strips HTML from blurbs before stuffing them into the GCal description (session 3's blurb has an inline `<a>` to Twitter).
- **Footer link** is now "DM me on Twitter" → `https://twitter.com/br___ian` (profile, not compose — Twitter compose URLs need numeric user IDs we don't have).

### BrainstormRSVP (`src/components/BrainstormRSVP.jsx`)

Restructured — the form is now collapsed by default behind a small **"RSVP →"** trigger that expands inline. The list of who's coming sits **on the same row** as the trigger. Buttons (Yes / Maybe / No) are now visually equivalent (Yes used to have an accent fill that read as "this is the default option," which Brian disliked).

New optional prop: `figmaUrl`. If passed, renders a "figma link" inline next to the coming-line. Currently used only on session 1, pointing at the FigJam board:
`https://www.figma.com/board/jh1W4RBRPzpYkJmaHcYXa5/phone-that-cares-about-you?node-id=0-1&t=OHwhz7FYLrsdsnPf-1`

### ArgOS 2026 walkthrough video — replaced

Brian recorded a new narrated walkthrough. Source: `OS_Mocks/ArgOS Mobile Walkthrough 2026.04.26.mov` (63MB original).

Transcoded via ffmpeg to web-friendly:
```
ffmpeg -i "<source.mov>" -vf "scale=720:-2" -c:v libx264 -crf 28 -preset slow \
  -movflags +faststart -c:a aac -b:a 96k -ac 2 \
  Website/public/experiments/argos-sessions-2026-04-26.mp4
```

Result: 7.6MB, 720px wide, h264 CRF 28, AAC 96k stereo, faststart for streaming. Audio kept (Brian narrates). Old `/experiments/argos-sessions.mp4` is no longer referenced — safe to delete.

The slide reference in `src/pages/experiments.astro` points at `argos-sessions-2026-04-26.mp4`.

### Telegram bot page (`/telegram-bot`)

Created by another instance during this period. Files:
- `src/pages/telegram-bot.astro` — hero, "what it does," try-Brian's-version CTA, 7-step self-host walkthrough adapted from Brian's bot repo (`/Users/b/Desktop/Projects/argos-telegram-agent/share/landing.html`), credit to Tasshin Fogleman.
- `public/experiments/telegram-bot.jpg` — copied from `PNGs/Telegram-Bot.jpg`.

**Two placeholders Brian still needs to fill:**
- `@ARGOS_BOT_USERNAME` — the bot's Telegram handle
- `REMIX_LINK_HERE` — the val.town remix URL once Brian publishes the self-host val

The bot is multi-tenant (one bot, many users; data lives in Brian's Val.town account) with a self-host alternative for users who want full data ownership.

### Experiments page (`src/pages/experiments.astro`) — renumbered

The Argos bot got slotted in as **Experiment 03**. ArgOS 2028 moved to **Experiment 04**. ArgOS 2026 stayed at 01, Scroll Lab at 02. Order on the page is: ArgOS 2026 → Scroll Lab → Argos (Telegram) → ArgOS 2028.

### Scroll Lab dedicated page (`/experiments/the-scroll-lab`) — NEW

New page at `src/pages/experiments/the-scroll-lab.astro`. Same content as the section on `/experiments`, but as a standalone page. The carousel **starts on slide 2 (Tweet Padding)** via a new `initialIndex` prop on `<Carousel>`.

The "The Scroll Lab" h2 on `/experiments` is now an `<a>` styled to look like the heading (transparent border-bottom; underlines on hover). Class `.experiment-title-link`.

Comments use the **same slug** (`experiment-scroll-lab`) on both pages — conversation stays unified across the section view and the dedicated page.

### Carousel (`src/components/Carousel.jsx`)

New `initialIndex` prop (defaults to 0). Used by the Scroll Lab page.

### OS mock — text selection disabled

Friends reported that dragging the wrong way on the embedded mock highlighted text and broke gesture interactions. Fixed at the source level — `OS_Mocks/ArgOS.Mock.Sessions.2026.04.15/src/styles/index.css` now has:

```css
html, body { user-select: none; -webkit-touch-callout: none; }
input, textarea, [contenteditable="true"] { user-select: text; }
```

Mock was rebuilt and copied to `Website/public/os-mock-sessions/` per the existing pipeline.

---

## Components touched

| File | What changed |
|---|---|
| `src/pages/brainstorms.astro` | Wholesale redesign — see above. |
| `src/components/BrainstormRSVP.jsx` | Collapsed-by-default trigger; coming-line on same row; new `figmaUrl` prop. |
| `src/components/BrainstormPoll.jsx` | No longer rendered anywhere. Component still exists. |
| `src/components/Carousel.jsx` | Added `initialIndex` prop. |
| `src/pages/experiments.astro` | Argos bot added as Exp 03; renumbered; Scroll Lab title is now a link; new video filename. |
| `src/pages/experiments/the-scroll-lab.astro` | NEW — dedicated Scroll Lab page. |
| `src/pages/telegram-bot.astro` | NEW (other instance). |
| `OS_Mocks/.../src/styles/index.css` | Disabled user-select. |

---

## Open / TBD (updated)

Carry-over from prior handoff:
1. **"Join the weekly call" parallelism** in Connect reach section — still outstanding.
2. **Brainstorms vs WeeklyCallCard date collision** — still unresolved. Same Sundays, overlapping times. Likely the brainstorms supersede WeeklyCallCard but no decision yet.
3. **Welcome mock captions can't be inline-edited** (polling JS overwrites).
4. **Vision page** could go further toward "shorter / less about me."
5. **Old orphan comments** under `connect-thread-*` slugs — still in DB.

New since 2026-04-25:
6. **Telegram-bot placeholders:** `@ARGOS_BOT_USERNAME` and `REMIX_LINK_HERE` need real values before sharing widely.
7. **BrainstormPoll component is dead code** — fine to leave, fine to delete. Supabase `brainstorm_poll_votes` data is preserved.
8. **Duplicate test RSVPs on session 1** — Brian noticed when one of his test names + a real RSVP from "Brighton" looked like he'd RSVPed three times. Data not cleaned; he didn't ask.
9. **`/experiments/argos-sessions.mp4`** is the old Argos walkthrough video — no longer referenced anywhere, safe to delete.
10. **The git repo is stale.** Two commits, weeks of in-flight changes uncommitted. Worth eventually addressing as its own task — but it's not blocking deployment, and it should not be "fixed" by lumping all 45 files into one commit. Talk to Brian first.

---

## What stayed the same

Deploy mechanics, Supabase schema (other than what's noted), OS mock build pipeline, secrets and access, Brian's working style, decisions / posture from the prior handoff — all unchanged. Pull from `HANDOFF-website.md` for those.
