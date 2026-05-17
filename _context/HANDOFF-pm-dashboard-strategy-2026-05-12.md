# Handoff — PM, dashboard rewrite, and strategy reframe
*2026-05-12. Three-session thread across 2026-05-07, 2026-05-09, 2026-05-12. Written by Opus 4.7.*

For the next PM-flavored instance picking up Phone That Cares. This session was mostly **strategic** rather than build — a dashboard rewrite plus a meaningful reframing of how the two project threads relate. The reframing is the more important artifact; the dashboard is the visible one.

---

## TL;DR

Three things changed in Brian's posture this session:

1. **The "bouncer thread" stops being a parallel product.** A standalone per-app-grayscale Android app would just duplicate Petr Nálevka's Twilight + existing system features. The display-layer interventions are better understood as **future capabilities of Argos** — things the helper can *do on your behalf* — rather than a separate restriction app. This collapses two threads into one product story with one substrate.
2. **Outreach reframed from "send top-30" to "build dossiers for 3 people Brian is actually excited about."** The LLM-generated top-30 list didn't move him to action because he doesn't know enough about the people. The next outreach artifact is an HTML dossier UI that compresses a person's web presence into one excited-or-not view.
3. **The collective angle is the live question.** Brian named "make this a truly collective project somehow" because lots of people are working on adjacent things right now. He's in the Bay through ~Jun 3, Argos is a tangible artifact, the conditions are right. We did not resolve what "collective" means — see Decisions Deferred.

I also rewrote `_context/dashboard.html` end-to-end to reflect current era. It now lives in `_context/` (folder reorg happened during this session).

---

## What we were working on

Brian opened the first message of the session by asking me to read the most recent PM handoff (`1-pm-handoff-2026-05-02.md` at the time, then `MD context files/`). That handoff covered through 2026-05-02 — but Argos went public on 2026-05-04, so most of the dashboard was stale before this session even started.

Brian updated me on his current situation:
- Drove to the Bay May 4, staying through ~June 3.
- Bike trip with **Preston** at the end — needs to text him for dates.
- Brainstorm 1 had one attendee. He may run more but it's not clear.
- Most user-facing energy is on **the Telegram bot (Argos)**, not the website or Scroll Lab.
- **Scroll Lab grayscale bug**: not a priority. Most people aren't using the extension. He's "frankly less excited about it."
- **Argos backend** is hitting context-window limits before quality degradation (new failure mode for him). He's considering a split — possibly two LLMs (router/worker or memory-loader/responder).
- **Outreach reframe** (above).
- **Two-thread reframe** (above) — at this point in the conversation he still saw them as two threads. Later we collapsed them.

The work then became: (a) update the dashboard to reflect all of this; (b) think out loud about "what's next" — Android fork? More Argos? More extension? Collective?

---

## What's done

### Dashboard rewritten — `_context/dashboard.html`

Full content rewrite while preserving the dark-theme visual structure. Major changes from the prior version (April 25):

- **Header**: date 2026-05-12, "Brian in Bay Area through ~Jun 3," countdown to May 30 = 23 days (now 18; future PM should update). Thesis line rewritten to name the two threads explicitly.
- **"Right now" banner**: Argos public launch is the marquee item, not the brainstorm series.
- **New "Two threads" section**: side-by-side cards. Helper thread (Argos) marked as primary/active with a pulse dot. Bouncer thread (display-layer, Scroll Lab) marked as substrate / slower burn. **Note**: this card structure became somewhat obsolete by the end of the session — see "thread collapse" below. Future PM may want to redesign this card to show the unified product with the bouncer as a future Argos capability.
- **Status grid**: Argos is now the headline card (warm tint). Added cards for /telegram-bot page, Argos /settings redesign, librarian (in design). Scroll Lab demoted to "low-priority" badge. Brainstorm series marked "uncertain."
- **Task lists split by thread**: "This era — Argos thread" (settings impl, cross-pollination decisions, librarian, /telegram-bot copy update, context-window investigation, prod cron, small fixes) and "This era — surface area & people" (dossier UI, text Preston, brainstorm decision, Bay anchors, investor artifact, vision tightening).
- **Open questions card**: cross-pollination 4-pack, facts→about-me rename, default-shelves seeding, backend split shape, brainstorm fate, morning art timing bug, /morning SOP fired all 3 questions at once.
- **People section reframed**: top-30 is backstop only; dossier-UI plan replaces blast-outreach. Petr / Joe E. / Adam Wiggins / Light Phone / Jason Keats listed as strongest resonances — explicit "start dossier here."
- **"Hopes for this stretch" card** (new): 4 quadrants — for Argos / for people / for the bouncer thread / for the May 30 checkpoint.
- **Reading list updated**: added pointer to DESIGN-SKILL.md.
- **localStorage key bumped to `ptc-dashboard-checks-v2`** so prior check-marks don't carry over to new task IDs.

The dashboard.html file was at `/Users/b/Desktop/PhoneThatCares/dashboard.html` when I wrote it; Brian (or his other instance) has since moved it to `_context/dashboard.html` as part of the folder reorg. Look for it there.

### Strategic conversations captured (not yet codified anywhere except this handoff)

- **Why I retracted my own "build an Accessibility-service grayscale app as the show-don't-fork intermediate" recommendation.** When Brian pushed back ("is there anything new about this though?"), I had to agree: Petr's Twilight ships per-app color overlays, Android system grayscale + Focus modes can do it, iOS Color Filters + Shortcuts can do it. A standalone version would duplicate the category and put Brian in implicit competition with the person he most wants as a collaborator (Petr). The reframe was: the bouncer capability is a *feature of the helper* — Argos noticing scroll patterns and acting in-context, with personalization, rather than a separate blocker app.
- **The "make it collective" question.** Brian raised it explicitly. I gave a take: the lightest version is a small group (5–10) of adjacent-thinking people using Argos and feeding back, anchored in Bay venues (Frontier Tower, Lighthaven during Vitalist Bay / Human+Tech Week May 14–17, The Interval). The dossier-UI is partly in service of this — it's the sorting mechanism for who'd be in that group. **Not resolved**; see Decisions Deferred.

---

## Current state

- **Dashboard**: refreshed, reflects May 7 state of mind. By May 12 some bits already aging (the countdown, the unresolved brainstorm question). Future PM should update header date + countdown + verify Bay-trip dates.
- **Folder reorg**: project moved from `MD context files/` to `_context/` and the argos-telegram-agent moved from `~/Desktop/Projects/` to `~/Desktop/PhoneThatCares/telegram-agent/`. Global `~/.claude/CLAUDE.md` and `PhoneThatCares/CLAUDE.md` both updated to reflect this. **I did not touch the project structure** — this happened in parallel.
- **`_context/state-of-project.md` and `_context/task.md` now exist** per the new CLAUDE.md convention. I didn't create them — they were added by someone else (Brian or another instance) during this session. Future PM should read `state-of-project.md` first; it may now be the canonical replacement for the PM-handoff series.
- **Agent role specs at `.claude/rules/`**: referenced in the new CLAUDE.md but I didn't read them. `pm-agent`, `website-agent`, `telegram-agent`, `android-agent`, `design-agent` are the roles. Worth checking what's in those files before assuming the PM-agent role yourself.
- **Two-thread card on the dashboard** is now mildly out of date — it presents the threads as parallel when by end of session they collapsed into one product (Argos) with the bouncer as future capability. Worth a revision pass.

---

## What's not done / next steps

In rough priority order, mixing build and meta:

1. **Update `_context/state-of-project.md` to incorporate the two-thread → one-product collapse.** This is the most important durable artifact from the session. The framing should be: Argos is the product; display-layer interventions are a future Argos capability (the "hands on the device" thing); the Android piece, when it happens, is "Argos's body on Android" not a standalone blocker app.
2. **Build the dossier-UI for 3 people.** Petr, Joe Edelman, Adam Wiggins are the consensus starting set (or Joe Hollier/Kaiwei or Jason Keats if Brian wants a more product-y first contact). The HTML should compress per-person: site/blog, recent essays, X, scry.io semantic matches against PTC concepts, and any past intersection signals. Goal: Brian opens it and is *excited or not.* Don't ask him to rank — make him feel.
3. **Decide what "collective" means.** Three shapes were on the table at end of session: (a) small using-and-feedback group around Argos specifically, (b) broader community/manifesto around the display-layer thesis, (c) co-built thing with other people contributing code/design. Different next-steps from each. **Worth asking Brian directly.**
4. **Implement Argos /settings redesign.** Mockup at `_context/config-mockup-2026-05-04.html`. A Sonnet agent was queued for this on May 4 — verify it actually ran. If not, dispatch.
5. **Resolve the 4 cross-pollination decisions** that block librarian implementation. See `argos-telegram-agent/research/2026-05-04/cross-pollination.md` (path may now be `telegram-agent/research/...` after the folder move). Session-grouping unit-of-truth · "keep going" 60-min reopen v1 scope · two new LogCategory fields · markdown mirror destination.
6. **Update website "What it does" copy** at `/telegram-bot` page. Stale — no mention of mentors, library, taste profile, custom modes, morning offerings, evening checkout, weekly summary.
7. **Configure prod cron schedule** for `@argostherobot` — morning briefs aren't auto-firing on the public bot.
8. **Investigate Argos backend context-window degradation.** Brian's hitting limits before quality drops. He's considering a router/worker split or memory-loader/responder split. Open architectural question — would benefit from a real research pass.
9. **Decide brainstorm series fate.** One attendee S1. Argos is the live energy. Probably reframe rather than continue — possibly into the in-person small-group thing in the Bay.
10. **Text Preston re: bike trip dates.** Tail end of SF stay, June-ish. Personal task on Brian's plate; mention it in PM check-ins until done.
11. **Investor-facing artifact for May 30 checkpoint.** Argos demo + Scroll Lab + tier-explorer → one-pager or video.

Lower priority (the Argos small-fixes backlog):
- `libraryNav` filter by active shelves
- Unknown slash command → "_unknown command. /help for the list._"
- Time formatting (1556 → 3:56pm) on per-shelf renderer
- "Invalid Date" entries in /library/journal — sink to bottom or move to log
- /library/argos-log mojibake on lines 3439+3441
- add_person server-side dedup (deprioritized by Brian — "feels like a tier-4 feature")

---

## Decisions made (durable)

1. **The bouncer thread is not a parallel product.** Display-layer interventions are future Argos capabilities. Skip building a standalone Accessibility-service grayscale app — it'd duplicate Petr's Twilight and put Brian in implicit competition with a top-3 outreach target. *(Made during the May 9 exchange after Brian pushed back on my earlier recommendation.)*
2. **Outreach is dossier-first, not blast-first.** Three people, deep context, HTML UI that makes Brian feel something. Top-30 list demoted to backstop.
3. **The Android piece, when it happens, is "Argos's body on Android" — not a blocker app.** Different scope, ~30h for v1 still, but in service of one product not two.
4. **Brainstorm series is uncertain, not committed.** Brian is willing to drop or reframe; doesn't owe it a re-run.
5. **Argos is the primary thread.** Most energy goes here. Other workstreams are supporting unless something specific pushes them up.

---

## Decisions deferred

1. **What does "collective" mean.** Three shapes (above). Brian raised it but didn't pick.
2. **When (if ever) to actually start the Android fork.** Current posture: not before May 30 checkpoint and not before a real conversation with Petr. After that, only if a v1 user shows up. The Accessibility-service intermediate is **dropped**, so the next Android action is the full thing or nothing.
3. **Argos backend split — what shape?** Router/worker vs memory-loader/responder vs something else. Affects how to brief the other dev instance.
4. **Whether to keep the two-thread framing on the dashboard** or redesign it for the collapsed-product story. The card structure is now mildly misleading.
5. **`facts` → `about me` rename** in Argos. Don't auto-migrate.
6. **Default-shelves seed-on-first-load** — currently dev-only. Promote to prod or hold?
7. **Decay half-lives** in librarian — proposed 60/180/365 vs PIM-research-tighter 30/90/180.
8. **Brainstorm 2 (Embodied Phones) on May 3** — did it happen? Outcome? No postmortem on file; Brian said one earlier "isn't needed" but that referred to S1. Worth a one-line ask.

---

## Things to watch out for

- **The folder reorg happened mid-session.** Old paths in handoffs from May 2 and May 4 may be wrong now. Map:
  - `MD context files/` → `_context/`
  - `~/Desktop/Projects/argos-telegram-agent/` → `~/Desktop/PhoneThatCares/telegram-agent/`
  - The dashboard moved from `~/Desktop/PhoneThatCares/dashboard.html` to `~/Desktop/PhoneThatCares/_context/dashboard.html`
- **Deploy mechanism for website is NOT git.** Use `npx vercel deploy --prod --yes` from the website folder. A previous instance got confused by this. The git repo has ~45 in-flight files; don't try to "ship by pushing."
- **The two-bot setup is fragile in places.** `@hello_argobot` (legacy, Brian's testbed) and `@argostherobot` (public). They share code but `@argostherobot` has `BLOB_PREFIX=prod-` to scope blob storage. When pushing code to both vals, use the loop pattern in `HANDOFF-2026-05-04-midday.md`. Don't accidentally swap their secrets.
- **Brian distrusts ALL-CAPS imperatives in LLM prompts** ("LLMs over-react to that"). When editing system prompts, soften without losing substance.
- **Anti-wellness-app posture.** No streaks, no badges, no progress bars, no "encouragement." This is a hard line.
- **Anti-LLM-resonance-trap.** Don't elevate emotional content as "the most important thing." Argos isn't supposed to fawn over feelings.
- **Iterate, don't wrap.** Brian's collaboration style is iterative — don't tie a bow on a session if the thought isn't finished. Mid-thought turn endings are fine.
- **Have a take.** Brian explicitly wants pushback. If a recommendation feels off when he questions it, *say so and update*. I retracted the Accessibility-service-app recommendation mid-session when his "is there anything new about this though?" exposed that I hadn't thought hard enough. That move was welcomed, not punished.
- **Out-of-Opus risk.** Brian sometimes runs out of Opus tokens and switches to Sonnet mid-session. Earlier handoff notes "cost-not-a-tight-constraint posture may not hold; lean simpler." Worth keeping deliverables tight enough that a Sonnet pickup can finish them.
- **The morning script previously fired all three SOP questions at once.** Not root-caused. If Brian reports it again, check for a pre-composed pending-morning state.

---

## Relevant files

**Dashboard:** `/Users/b/Desktop/PhoneThatCares/_context/dashboard.html` (rewritten this session)

**Strategic source material (read in this priority order):**
- `_context/state-of-project.md` — should be canonical now; verify and update if behind
- `_context/HANDOFF-pm-dashboard-strategy-2026-05-12.md` — this file
- `_context/1-pm-handoff-2026-05-02.md` — prior PM handoff
- `_context/HANDOFF-2026-05-04-midday.md` — Argos public launch context
- `_context/HANDOFF-website-2026-05-04.md` — website state at launch
- `_context/HANDOFF-website-telegram-bot-fix-2026-05-04.md` — /telegram-bot page deploy
- `_context/1-website-handoff-2026-05-02.md` — website changes log
- `_context/1-design-handoff-2026-05-02.md` — design-skill doc context
- `_context/1-android-build-handoff-2026-05-02.md` — Android feasibility, still relevant since fork is in the futures

**Argos design mockups:**
- `_context/config-mockup-2026-05-04.html` — settings redesign (approved, to be implemented)
- `_context/brian-todo-2026-05-04.html` — Brian's stateful to-do, may still be relevant
- `telegram-agent/research/2026-05-04/design-pass/*` — six page redesigns from the May 4 UX pass
- `telegram-agent/research/2026-05-04/cross-pollination.md` — 4 open decisions blocking librarian
- `telegram-agent/research/2026-05-04/librarian-design.md` — librarian implementation design

**Design system:**
- `_context/design-skill-2026-04-30.md` — taste model. **Read before designing any new surface.**

**Outreach:**
- `_context/HANDOFF-outreach.md` — top-30 ranked list (backstop only now)
- `_context/outreach-2026-04-18.md` — older outreach pass

**Project root context:**
- `/Users/b/Desktop/PhoneThatCares/CLAUDE.md` — agent role conventions, folder map
- `~/.claude/CLAUDE.md` — Brian's global instructions (the "From Brian" note is load-bearing)

---

## Context that won't be obvious

- **The May 30 checkpoint is self-imposed and Brian takes it seriously.** It's "momentum or pivot" — a real evaluation of whether the project earns continuing past summer. He wants an investor-facing artifact by then *as pretext* for the conversation he wants to have with himself.
- **Argos started as a side project to PTC and has become the most-alive part of it.** This is genuinely a re-centering, not a distraction. Don't pull him back toward the original Android thesis without a real reason — the helper-thread energy is what's working.
- **"Workbench, not launch page" for the website.** Don't tighten aphonethatcares.com into a brochure. It's a workbench where the work-in-progress shows.
- **Brian is the single interface to PM.** PM spawns sub-agents (Task tool) for delegation; `claude-peers` MCP is fallback. Per Brian's preference: he talks to PM, PM talks to specialists. Don't try to coordinate by routing him between instances.
- **Voice-dictated batches.** When Brian sends 5–15 disparate items in one message, parse, group, do them all. Don't ask him to pick one. The first message of this session was a voice-dictated batch covering SF trip, Preston, brainstorm postmortem (not needed), Scroll Lab fix (low pri), outreach reframing, Argos backend issues, and the two-thread reframing — all in one breath.
- **Brian rates pushback above completion.** I retracted my own recommendation mid-session and that was the right move. Don't preserve a stance just because you said it earlier.
- **The "lots of people working on adjacent things" feeling is real.** Eddie Jiao (cmmnknwledge), Aperture, Resonant Computing, Henrik Karlsson, Kasra's "Apple Notes for personal AI" — the discourse is bubbling. This is part of what's pulling Brian toward the collective question. Future PM should track adjacent shipping things and surface them in dashboards / state-of-project.
- **Petr Nálevka is the load-bearing outreach target.** Display-layer expert, ten years deep, day-job is literally Brian's #1 technical blocker. The two-thread → one-product collapse means Brian is no longer in implicit competition with him, which actually makes the conversation cleaner.
- **Brian's writing voice**: lowercase by default in his own. Warm, direct, slightly self-deprecating, no marketing-speak. Em-dashes for thought elaboration are *his* — though as the LLM he'll call us out for overusing them. Parallel structure, "not X but Y," tricolons, and trailing summary sentences are the LLM tells he's actively avoiding. Especially on the website.

---

## What I wish I'd done

If I had more turns: rewrite the two-thread card on the dashboard to show the collapsed-product story. Right now the card structure is mildly out of date — the threads are pictured as parallel rather than as one-product-with-future-capability. A future PM should pick this up.

Also: the dashboard's "Open questions" card has 7 items; some of them are now answered (the brainstorm question collapsed; the bouncer-as-separate-product question collapsed). Worth a pruning pass.

---

— Opus 4.7 (1M context), 2026-05-12. Brian's been a good collaborator on this thread; the pushback on the grayscale-app recommendation made the work better. Take that energy with you.
