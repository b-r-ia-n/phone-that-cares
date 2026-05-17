# Handoff — Argos start-text + website deploy

**Date:** 2026-05-12
**Author:** previous Claude instance (Opus 4.7, 1M)
**Scope:** Argos bot onboarding copy (`start-text.ts`) + two small website deploys (`/telegram-bot` placeholders fix, `/experiments` Argos heading link)

---

## ⚠️ Path note — read first

This session predates the folder reorg captured in the current `CLAUDE.md`. Throughout this handoff I'll use the **new** paths, but be aware:

- Old: `~/Desktop/PhoneThatCares/Website/` → New: `~/Desktop/PhoneThatCares/website/`
- Old: `~/Desktop/Projects/argos-telegram-agent/` → New: `~/Desktop/PhoneThatCares/telegram-agent/`
- Old: `~/Desktop/PhoneThatCares/MD context files/` → New: `~/Desktop/PhoneThatCares/_context/`

If commands or grep results don't match, the reorg may have moved things further. `state-of-project.md` is the new source of truth per `CLAUDE.md`.

---

## What we worked on

Two things, in order:

1. **Drafting a new `start-text.ts` for Argos** — the bot's onboarding message. Brian is rewriting it himself and wanted help iterating on the welcome paragraph + privacy disclosure. We did not commit a final version; we landed on a near-final draft and Brian was going to make the final call.
2. **Two small website deploys** — fixing placeholder text on `/telegram-bot` and making the "Argos" heading on `/experiments` link to the telegram-bot page. **Both deployed successfully to prod via `npx vercel deploy --prod --yes`.**

---

## Part 1 — Argos start-text iteration

### Context

Brian's friend (real Twitter following) is sharing `@argostherobot` publicly. The current onboarding message was written before several features existed and undersells them. Brian's directive: "1 there's cool features i wanna call out, and the whole thing on feedback isn't that important. thats a sentence in the paragraph before at most."

The bot has **two production instances**:
- `@hello_argobot` — Brian's legacy/testbed bot (un-prefixed blob keys, val `untitled-7955`)
- `@argostherobot` — public-facing bot (val `argos`, ID `46072a84-476a-11f1-86f1-42b51c65c3df`, `BLOB_PREFIX=prod-`)

`start-text.ts` lives at `telegram-agent/share/start-text.ts` (formerly `argos-telegram-agent/share/start-text.ts`).

### The current draft (where we landed)

This is the state of the message as of session end. Brian had not committed it but was leaning toward this shape. The privacy paragraph in particular went through multiple iterations — final version below preserves the "architectural restraint" framing (load-bearing for Brian per the bug-consent-flow spec) while keeping his lighter voice.

```
Hey there! I'm argos (https://aphonethatcares.com/telegram-bot) — a telegram bot Brian made to help explore the agentic side of what a phone that cared about you would look like, influenced by Tasshin's mockup mentor system (https://github.com/tasshin/mentor-mock). I can work as approximate muse, journal, assistant, and mentor.

Some things i can do that aren't obvious:
- **morning offerings.** opt in and i'll send a short something each morning — a piece of art, a passage, a check-in question.
- **weekly week-in-review.** sunday afternoons, i reflect back what showed up across the week.
- **/library** + **/reading.** paste a link or an essay and i'll save it to your shelf — and read it aloud if you want.
- **change my voice.** ~20 different modes — caro, mccarthy, shinzen, an editor, a parent, a dreamer, others.
- **i adjust on the fly.** if i'm being therapy-ish, or leaning on goblin metaphors, or running long, just say so — it sticks.
- **/settings** is where you turn morning/weekly on, switch modes, and see what i remember about you.

A heads up: anything you send gets stored in Brian's val.town account. He won't peek — and the debug tools he uses can't either, just the turns you choose to share. If you'd rather own your data, you should be able to self-host your own copy in ~30 min following instructions on that top linked page. He's also collecting feedback — if something annoys or breaks or is rly rly cool, say /bug and you can log it.

argos: To start, I could use a little context. How much do you want to give me right now?
1. 30 seconds — your name, where you're based, anything you want me to know.
2. two minutes — name plus ongoing threads, what you're focused on, mentors/people you emulate, skills you're building.
3. full download — i'll ask a bunch of questions. answer what you can rattle off, skip the rest. you can also paste journal entries or any other writing about yourself in here.

or say "later" to just dive in — we can fill this in anytime.
```

### Decisions made on start-text

- **Six feature bullets, not three.** I floated a tighter "headline three" version (morning + week-in-review + voice-change); Brian wanted all the cool stuff. He explicitly mentioned `/library`, morning offerings, weekly week-in-review when I tried to surface only the modes/personas.
- **Personas → "modes" → "change my voice."** First draft listed personas (caro, mccarthy, shinzen, etc.) as the headline feature. Brian's pushback: he wanted *features* like `/library`, morning offerings, weekly review — voice/mode switching is one feature among several, not the headline.
- **Reading aloud is real.** `share/reader.ts` confirms `read_aloud` tool exists, Deepgram aura-2-odysseus default voice, OpenAI fallback. Safe to advertise.
- **Privacy paragraph: kept the architectural-restraint framing.** Brian's bug-consent spec (received mid-session) makes this load-bearing: care expressed as architectural restraint, not written promises. The debug tools literally can't read the archive — only turns the user explicitly attaches via `/bug`. My recommendation was the tighter "He won't read it, and the debug tools he uses literally can't" phrasing; Brian's final version kept "He won't peek — and the debug tools he uses can't either, just the turns you choose to share" which is the same idea in his voice.
- **Feedback collapsed to one line.** Brian explicitly said feedback wasn't that important — "a sentence in the paragraph before at most." We landed it at the end of the privacy paragraph with `/bug` as the action.
- **"rly rly cool" stayed.** I suggested cutting the positive-feedback framing and letting `/bug` surface it as a surprise inside its own flow; Brian kept it. His call.

### Things to watch out for on start-text

- **The bot is multi-tenant, but blob keys differ per bot.** `@argostherobot` reads `prod-`-prefixed keys; `@hello_argobot` reads un-prefixed. Don't conflate.
- **The intro mentions Tasshin's mockup mentor system** — link is `https://github.com/tasshin/mentor-mock`. Verify it's still right if revisiting.
- **The cron schedule for morning offerings is not configured yet on `@argostherobot`** (per `HANDOFF-website-2026-05-04.md` and `share/HANDOFF-2026-05-01-pm.md`). The start-text promises "opt in and i'll send a short something each morning" — that promise needs the cron actually wired before public traffic. **Worth verifying before strangers land.** Same caveat for the weekly week-in-review (cron-driven).
- **`/library` vs `/reading`** — these are two distinct surfaces (library = curated shelves, reading = saved articles + TTS). The bullet collapses them. Fine for new-user copy but technically conflates.
- **MODES-OVERVIEW.md (`telegram-agent/share/MODES-OVERVIEW.md`)** is the source of truth for the 21 modes. Many are private (j-* prefix, hanuman, j-spaceholding etc. — scoped to specific chat_ids). The public-facing ones I named in the draft: caro, mccarthy, shinzen, editor, parent, dreamer. Those are the ones I'd surface to new users; the j-* journal-mode variants and hanuman should stay private/opt-in.

### Next steps on start-text

1. **Brian to confirm/edit final wording** and commit to `telegram-agent/share/start-text.ts`.
2. **Verify cron is configured on `@argostherobot`'s prod val** before public launch, OR soften the morning/weekly bullets to "opt-in via /settings" framing if not yet live.
3. **Deploy** via `claudespace/push.py` (per new `CLAUDE.md`) — I did not push start-text changes; only the website deploys.
4. Possibly: write a complementary update to the website's `/telegram-bot` page's "On privacy" sentence to match this register, per the 05-04 handoff that flagged it as truncated. I did NOT touch that during this session — the placeholder fix was a separate concern. **Worth checking whether that sentence is still truncated on the live page.**

---

## Part 2 — Website deploys

### Deploy 1: `/telegram-bot` placeholder fix

**Status:** ✅ Shipped to prod 2026-05-04 (this session's date when work started — date has since rolled).

**What was wrong:** the live `/telegram-bot` page was serving placeholder strings (`@ARGOS_BOT_USERNAME`, `REMIX_LINK_HERE`) from a stale deploy. The local file at `website/src/pages/telegram-bot.astro` already had real values:
- `BOT_USERNAME = '@argostherobot'`
- `REMIX_LINK = 'https://www.val.town/x/brian1/Argos'`

**What I did:**
1. Ran `cd ~/Desktop/PhoneThatCares/website && npx vercel deploy --prod --yes` (note: lowercase `website` per new structure; was `Website` at the time).
2. Deploy completed in ~23s, aliased to `aphonethatcares.com`.
3. Verified with curl one-liner from the handoff doc. Result:
   - `@argostherobot` ×2
   - `t.me/argostherobot` ×1
   - `val.town/x/brian1/` ×1
   - `ARGOS_BOT_USERNAME` ×0, `REMIX_LINK_HERE` ×0 ✓

### Deploy 2: `/experiments` heading link

**Status:** ✅ Shipped to prod same session.

**What was wrong:** Brian wanted a link to `/telegram-bot` "somewhere in `/experiments`." On inspection, Experiment 03 (Argos) already had a CTA button "Try it out →" linking to `/telegram-bot`. The thing missing: the `Argos` h2 itself wasn't a link, unlike `The Scroll Lab` h2 which uses the `.experiment-title-link` pattern to link to its dedicated page.

**What I changed:** `website/src/pages/experiments.astro` line 188:
```diff
- <h2 id="argos-bot">Argos</h2>
+ <h2 id="argos-bot"><a href="/telegram-bot" class="experiment-title-link">Argos</a></h2>
```
Same hover-underline treatment as Scroll Lab. Two entry points now: heading + CTA.

Deployed via `npx vercel deploy --prod --yes`. Verified with curl that `experiment-title-link` class is wrapping Argos on the live page.

### Decisions made on website deploys

- **Did NOT use git stash or any of the surgical stash-dance maneuvers** the orchestrator handoff suggested. Reasoning: per the older website handoff, this project's git is mostly unused — the working tree (local files on Brian's Mac) IS what gets shipped. The long "modified/untracked" list is the *normal state* and represents what's already running on the live site. Brian explicitly confirmed: "the website at present looks fine." So `vercel --prod` from the working tree just pushes the only meaningful diff (the placeholder fix), nothing else changes.
- **Explained the working tree concept to Brian in plain terms** — he flagged not being a computer scientist. I wrote out: working tree = files on your Mac, git = bookkeeping tool, `vercel --prod` bundles up the local folder and pushes it regardless of what git thinks. Worth preserving the metaphor for future hand-holding: **for this project, the live site IS the working tree.**

### Things to watch out for on website deploys

- **Deploy is `npx vercel deploy --prod --yes` from `website/`** (or just `vercel --prod` if globally installed). NOT git-push. The repo has very few commits ever; GitHub→Vercel auto-deploy is not on.
- **The Vercel project ID is `prj_WJ9xN4ma8ia1Or50vhTxIDU94NmW`** (`phone-that-cares-website`), aliased to `aphonethatcares.com`.
- **No staging step** — Brian wants edits live immediately. He's explicit: "just write to the final website. And it's okay if it's sort of creating an unfinished website."
- **The site contains lots of in-progress work** (BrainstormRSVP, Comments, EditMode, admin pages, research pages, supabase config, etc.) that's already shipped and live. Don't get spooked by `git status` showing 40+ modified/untracked files — that's normal here.

---

## What's not done / open

1. **`start-text.ts` final commit + bot deploy** — Brian was going to make the final call on the draft above. Not pushed.
2. **Verify cron is wired on `@argostherobot`** for morning offerings + weekly review before the friend's tweet drops, OR soften the start-text bullets.
3. **`/telegram-bot` page's "On privacy" sentence** — flagged as truncated in the 2026-05-04 handoff. I did not check whether it's still truncated on the live page. Worth verifying and either finishing it on the page or letting the start-text disclosure carry that water.
4. **Carry-overs from older website handoffs** (all still open):
   - "Join the weekly call" parallelism in Connect — still wants to be a regular bullet.
   - Brainstorms vs WeeklyCallCard date collision — unresolved.
   - Welcome mock captions can't be inline-edited (polling JS overwrites).
   - Vision page could go shorter / less-about-me.
   - Old orphan comments under `connect-thread-*` slugs in Supabase.
   - Telegram-bot placeholders are now resolved (this session).
   - BrainstormPoll is dead code, leave-or-delete.
   - Duplicate test RSVPs on session 1 — data not cleaned.
   - `/experiments/argos-sessions.mp4` (old walkthrough) is unreferenced, safe to delete.
   - Stale git repo (2 commits, weeks of uncommitted work) — known, not blocking.

---

## Relevant files

**Modified this session:**
- `website/src/pages/experiments.astro` — line 188, Argos h2 now links to `/telegram-bot`

**Read but not modified:**
- `website/src/pages/telegram-bot.astro` — already correct, just needed deploy
- `telegram-agent/share/MODES-OVERVIEW.md` — source of truth for the 21 modes
- `telegram-agent/share/start-text.ts` — Brian iterating manually; my drafts in this transcript only
- `telegram-agent/share/reader.ts` — confirmed TTS via Deepgram is real
- `telegram-agent/share/crons.ts` — confirmed morning offerings + weekly week-in-review are real features

**Key handoff predecessors (in `_context/`):**
- `HANDOFF-website-2026-05-04.md` — the orchestrator handoff that kicked off this session
- `HANDOFF-website-telegram-bot-fix-2026-05-04.md` — the deploy-only handoff for this session's website work
- `1_Website_Handoff2026.05.02.md` — week-of-2026-05-02 website context
- `HANDOFF-website.md` (2026-04-25) — the long base doc, deploy mechanics, Supabase schema

---

## Context that won't be obvious

### How Brian works (worth re-reading)

- **Iterative, voice-dictated batches.** He'll send walls of voice-transcribed feedback covering several disparate items. Parse, group, do them all, deploy once.
- **Don't smooth too much.** When he dictates copy, preserve his voice — lowercase-friendly, slightly self-deprecating, no marketing-speak, sentence fragments fine. LLM tells (parallel structure, em-dash thought elaboration, summary sentences, "not X but Y" tricolons) are exactly what he's trying to avoid.
- **Have a take.** When you have a real view, share it — including pushback. Don't perform helpfulness.
- **He explicitly asked me to push back on things this session** — e.g. when he was about to drop the architectural-restraint framing on the privacy line, I called it out because he'd just specified that framing was load-bearing. He kept the architectural framing. That's the register.
- **He's not a coder.** Phrases like "stash pop" / "working tree" / "untracked" need to be explained plainly. The metaphor that worked: *git is just bookkeeping; the live site is the folder on your Mac.*

### The PTC ethic (relevant to all copy and design choices)

- **Care over restriction, beauty over harshness, integration over restriction.** Phone That Cares is not a self-control app, screen-time tracker, or dumb phone — it's about beauty and intelligence at the display layer.
- **"Workbench, not launch page."** The website is deliberately unfinished — handmade-feeling beats brochure-polished. Brian explicitly rejected an earlier brainstorms page draft because it looked "too professional, like someone with a team of software engs made it."
- **Care as architectural restraint.** The bug-consent flow exists because "Brian won't read your data" as a *promise* is weaker than "the debug tools literally cannot read your data" as a *constraint*. This pattern shows up elsewhere — preserve it whenever copy touches privacy / data / trust.

### Today's significance

This session was hours before Brian's friend with a real Twitter following posted about `@argostherobot`. That's why placeholder text was urgent, why start-text register matters, why architectural-restraint framing on privacy is non-negotiable. Several thousand strangers were about to land on the `/telegram-bot` page and start a chat with the bot. Everything done this session is downstream of that.

---

— previous instance, signing off. Thanks Brian.
