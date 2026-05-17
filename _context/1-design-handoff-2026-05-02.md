# Design Handoff — 2026.05.02

Handoff for any Claude instance picking up PTC design work after this session. The design taste model just got a real first pass, and there's now a reference doc to point at.

---

## TL;DR

- A working design thesis for PTC has been derived: **warm restraint + one piece of small magic per surface.** Rauno-school visual discipline plus the warmth axis Rauno doesn't model.
- The full skill doc lives at **`MD context files/DESIGN-SKILL.md`** in this folder. Any instance building a PTC surface (Telegram mini-app, lock-screen mock, website update, etc.) should read it before designing.
- A taste-rating tool was built at `~/Desktop/Projects/design-inspo/taste-gallery.html` and used to rate 28 of 35 reference sites. The skill doc is derived from that rating session.

---

## What happened this session

1. **Built `taste-gallery.html`** — a single-file rating tool that pulls screenshots of reference sites (rauno.me, Things 3, Daylight, Linear, Light Phone, etc.) and lets Brian rate Love / Like / Meh / Pass with notes. Lives at `~/Desktop/Projects/design-inspo/`.
   - Initially used thum.io for screenshots — free tier blacks out captures with watermarks. Swapped to WordPress mshots, which is free and works (with a generation-then-poll pattern). A couple sites still didn't load (Web Interface Guidelines, Devouring Details, cmdk, Nothing OS, Henrik Karlsson, Are.na, Read.cv, Campsite) — those are the `null`-rated entries.
   - Canvas was originally cropping screenshots via `object-fit: cover`. Now it scrolls vertically and shows full-height captures at natural proportions.
   - The category tag overlay was moved from top-left to bottom-right and pinned (sticky over a scrolling inner container) so it doesn't block page content.
2. **Brian rated 28 of 35 references** with notes on most of them. Exported as JSON. The unrated ones are mostly screenshot failures, not skipped opinions.
3. **Read the taste profile** and found a clear pattern. The thesis above came out of this — Brian explicitly confirmed the "warmth Rauno doesn't model" framing when rating Things 3.
4. **Wrote `DESIGN-SKILL.md`** capturing the thesis, the loves with what to steal from each, the dodges with the references that triggered each, and practical guidance for the upcoming Telegram-mini-app surfaces (bookmarks viewer, settings, etc.).

---

## What the skill doc gives you

If you're a Claude instance opening this file because you're about to build a PTC interface, here's what to expect from `DESIGN-SKILL.md`:

- **Thesis** — one-line summary plus a paragraph on why it's different from cold-Rauno and from Light Phone severity.
- **Loves** — five reference sites with what specifically to steal from each.
- **Likes** — supporting references with notable per-ref reads (e.g. Granola for personality calibration, Teenage Engineering for dense-but-clean information design).
- **Dodges** — four failure modes with the references that triggered each (cold competence, juice-cranking, sloppiness-as-charm, severity).
- **Practical guidance** — color, type, motion, interaction architecture, copy.
- **Telegram-bot mini-app section** — specific notes for the immediate upcoming use case.
- **Four-step "how to use this file"** — apply per-surface.

Read it once in full before designing. Don't skim.

---

## What's open / next

- **More references to rate.** Brian noticed the thesis emerged cleanly from 28 ratings, but several screenshots failed and a few categories are thin. Worth rerunning the gallery against a different screenshot service (or per-site fallbacks) and capturing the missed ones — especially Web Interface Guidelines (Rauno's own canonical rules), Devouring Details, and cmdk, which are core to the Rauno corpus.
- **Apply the skill doc to a real surface.** The Telegram-bot mini-apps are the immediate use case (a bookmarks viewer and a settings page were mentioned). First time the skill gets used in anger, expect to discover gaps in the thesis. Flag them back to Brian rather than working around them — the taste model is still being calibrated.
- **The taste model is provisional.** The doc explicitly says so. As surfaces ship and Brian reacts to them, update `DESIGN-SKILL.md` with new per-ref reads or refined dodges. Don't treat it as locked.

---

## Files touched this session

- `~/Desktop/Projects/design-inspo/taste-gallery.html` — rating tool (created, then iterated on screenshot service + canvas behavior + tag positioning).
- `~/Desktop/PhoneThatCares/MD context files/DESIGN-SKILL.md` — design skill doc (created, then moved into this folder).
- `~/Desktop/PhoneThatCares/MD context files/1-design-handoff-2026-05-02.md` — this file.
- Memory pointer at `~/.claude/projects/-Users-b-Desktop-Projects-design-inspo/memory/ptc_design_taste.md` — short pointer entry so future sessions in design-inspo know the skill doc exists.

---

## Tone reminder for whoever picks this up

Brian collaborates iteratively, has real design taste, and notices when something feels off. He wants takes, not deferrals. If your draft of a surface feels cold, juicy, sloppy, or severe, he'll see it immediately — better to flag your own concern in the same message than wait for him to catch it. The skill doc's "how to use this file" checklist exists for this reason; actually run through it before showing him work.
