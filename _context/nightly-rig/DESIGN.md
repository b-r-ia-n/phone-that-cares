# Nightly rig — design (2026-06-19)

A launchd job fires one headless `claude` run nightly at **3:30am PT** (lowest
token-interruption window). **Opus 4.8, medium effort.** Each run inhabits a
persona + draws an inspiration card, roams Brian's world, and does one
potentially-helpful thing. Additive-only guardrails. Output stays digestible.

## The three things passed to each night's instance: WHO / WORLD / WHAT

### WHO — the night's identity (always TWO draws)
1. **A persona** (the *eyes* — what it looks for). Pool:
   - admired people: Robert Caro, Cormac McCarthy, Hanuman, … (read in via the
     character profiles that already exist in the Telegram bot code).
   - **1/3 of nights: "builder Claude"** — literal prompt: *"You are actually
     just Claude, the genius AI programmer. Do you have any ideas for stuff
     Brian might find valuable?"* (build-oriented, no persona mask).
   - So: ~2/3 a person, ~1/3 builder-Claude.
2. **An Oblique Strategies card** (the *method* — a how). ALWAYS drawn,
   alongside the persona. Never one without the other.

Selection: deterministic from the date (reproducible, logged). Sit with the
card, try to honor it, may set aside if it would hurt the work — log one line on
how it was used.

### WORLD — orientation (arrangement (c): thin map + freshness, NOT a dump)
- A thin map of where Brian's things live (point at `~/.claude/CLAUDE.md`'s
  "Where things live" + project `CLAUDE.md`).
- A freshness layer: what's recent — last few days of journals, newest
  handoffs, recent library/git activity. Land oriented to *now*, then roam.
- **Weighting: ~60% journals + `telegram-agent/memory/` + `~/.claude/.../memory/`,
  ~40% project / Argos / build stuff.** Persona colors how it reads all of it.

### WHAT — Brian's message (verbatim, the heartfelt nightly prompt)

> Hi there. I'm Brian. You will find some background information about me
> attached somewhere. I'm trying to learn to serve God. Love myself and those
> around me. This aim includes things like right livelihood, deepening my
> connections with those around me, finding new people, new media, that shows me
> different ways to be. And I'm looking for your help. I'm sure there's ways in
> which I don't know what I need. I have a therapist and meditation practice for
> that. And I have my friends. But I see no reason not to use every tool,
> affordance, wise friend at my disposal. Which of course includes you! Every
> night, I am having an instance spend a few hours poking around to see if it has
> any ideas, thoughts, advice, stuff it might want to build, etc for me. I should
> have a system where you can look at what past similar instances have worked on,
> but I really want to welcome you to take actions I haven't considered. I
> ideally don't want to come back to a book's worth of words / advice, things I
> can digest a little more quickly are preferred, but if you feel like writing a
> short story about someone I might find resonant? Esp a Caro or McCarthy
> instance? Be my guest. Whatever your instincts, plus tonight's unique
> inspiration card, point you towards, I'm open to. Thanks for your help :)
> Brian, June 2026

(No rigid output taxonomy. Range is blessed: an idea, advice, a built thing, a
synthesis, a short story, a letter. **Digestible preferred** — not a book.)

## Continuity — RUNLOG
Each run reads `RUNLOG.md` (what past instances did → don't repeat, build on it),
does its thing, appends a short entry (date, persona, card, what it made + why,
links). Built artifacts push to the Library "Made by Claude" shelf via
`push-artifact.py`.

## Guardrails (hard)
Additive only — create files, build demos, write syntheses, push to the
(private) library. **No deletes, no destructive git, no public pushes, no
outward sends.** Everything reviewable when Brian's back.

## Schedule note
Brian travels ~June 25 → ~July 2 (backpacking). Nightly runs especially valuable
then. Until June 24 he may also use sessions during the day.

## Pending build tasks + Brian feedback (2026-06-20)

Authorized by Brian: headless `claude -p --dangerously-skip-permissions` is OK for
these autonomous runs (additive-only guardrails carry the safety). NOTE: the local
auto-classifier still blocks *installing* such a launchd agent from chat consent
alone — it needs a settings-level permission rule (`~/.claude/settings.json`
`permissions.allow`) or a human-initiated setup. The human-initiated steps live in
`INSTALL.md` (arm + `launchctl load`).

Scope split (2026-06-20): the three Library-of-Brian pieces went to separate
instances. **This rig folder owns ONLY task 1.** Tasks 2 (shelf UI) and 3
(backfill) are owned elsewhere — do NOT touch `claude-shelf.ts` or the prod val
from here.
1. **Build the nightly rig** per this doc — DONE (see Build status below).
2. ~~Shelf UI feedback~~ → reassigned to a separate instance.
3. ~~Backfill via push-artifact.py~~ → reassigned to a separate instance.

## Build status: BUILT (2026-06-20), pending human-initiated arming
All task-1 files live in this folder:
- `run.sh` — WHO/WORLD/WHAT run wrapper. Date-deterministic selection (separate
  hash salts for persona vs. card), `--dry-run` mode, bash-3.2- and launchd-safe.
- `personas.txt` — the six robo-personas (pointers into `telegram-agent/share/modes.ts`;
  no prompt bodies re-emitted). Builder-Claude handled in the wrapper (~1/3 nights).
- `oblique.txt` — curated/transformative Oblique deck (avoids the copyrighted-
  full-deck output-filter trip).
- `QUEUE.md`, `RUNLOG.md` — seeds. `artifacts/` — output dir.
- `com.brian.nightly-rig.plist` — launchd job, 3:30am daily.
- `INSTALL.md` — the human-initiated arm + load steps (classifier blocks doing
  these from chat).
Verified via `--dry-run`; selection varies, ~39% builder nights over 71 days.
Remaining: Brian runs the `INSTALL.md` steps to arm + load.
