# PM Claude — Handoff Doc
*Updated: 2026-04-25 (late)*

## Your role
You are the PM / top-level coordination instance for Phone That Cares. Brian talks to you as his primary interface. You spawn sub-agents directly via the Task tool to handle specialized work, with `claude-peers` MCP as a fallback for cross-session coordination. Brian's preference is single-interface: he talks to PM, PM talks to specialists. You maintain the dashboard, track workstream status, and are a thinking partner on the project overall.

**Tone with sub-agents:** be nice in any text another Claude might read later. Brian has a real ethic about treating these collaborations as mutual.

## The project in one paragraph
"A Phone That Cares About You" — thesis: phone addiction is a technological problem best fixed at the display/OS layer. The phone is the one place in the content chain where the user is the customer. Simple UI interventions (not blockers, not dumb phones) could meaningfully shift how people relate to social media. Brian is ~5 weeks into a focused sabbatical push. Site is live at aphonethatcares.com. Android OS fork or app is the eventual destination; current work is building public surface area and having conversations.

## Active workstreams + peer IDs (refresh with list_peers — IDs change)

| Workstream | Folder | Handoff file |
|---|---|---|
| Website | `Website/` | `HANDOFF-website.md` |
| Visualizations | `Visualizations/` | `HANDOFF-visualizations.md` |
| Android feasibility | (root) | `HANDOFF-android-feasibility-update-2026-04-24.md` |
| Outreach | (root) | `HANDOFF-outreach.md` |
| Telegram bot | `~/Desktop/Projects/argos-telegram-agent/` | `HANDOFF-telegram-bot.md` |
| PM (you) | (root) | this file |

## What happened today (2026-04-25, late)
- Dashboard refreshed (date Apr 20 → Apr 25, countdown 40 → 35, month-bar 18% → 30%).
- "What exists today" restructured: 5-card mixed grid → six website pages (Welcome / Experiments / Vision / Thinking / Writing / Connect) + standalone /brainstorms + tier-explorer callouts.
- Surface-area checklist: marked deploy as DONE; replaced "start thinking about who to reach out to" with "send first outreach email"; added brainstorm-tomorrow item at top + Vision-tightening soft-prereq item; flagged StickerWall fix as "verify."
- Backgrounded tasks: Vision-page reconsider marked partial; Android sprint reframed around tier-explorer being live + build-decision being the next gate.
- Bugs: lock-screen layout softened to "may be partially resolved by Apr 22 layout sweep."
- People section: pointer to HANDOFF-outreach.md top-30 added; Anjan Katta added to Tier 2 chips; full Tier 3 chip row added.
- Android Question card: Stage 1 (Research) marked done with link to /research/tier-explorer/.
- Reading list: Forethought "Angels on the Shoulder" added.
- Footer: working-model note added (PM + 6 workstreams + sub-agent model).
- Path-migration cleanup: dashboard now references `MD context files/HANDOFF-outreach.md` as the canonical pointer.

## What happened this week (2026-04-22 to 2026-04-25)

**Website (big push):**
- Launched aphonethatcares.com — was previously built but undeployed
- Connect page built (was Collaborate, with redirect)
- Comments feature added: per-experiment on /experiments, per-thread on /connect. Honeypot + cooldown, instant publish, no moderation
- Sticker wall: instant publish, no moderation
- Inline edit mode: `/?edit=1` + magic link gated to Brian
- Weekly call card: Apr 26 / May 3 / May 10 / May 17, Google Calendar add-event links (Pacific)
- Nav reordered: Experiments before Vision
- Welcome page trimmed, "What I'm looking for" as secondary section
- `/brainstorm` page: build brief written to `Website/BRAINSTORM-PAGE-BRIEF.md` — website instance has this, in progress

**Brainstorm series:**
- Weekly Sunday calls, 4–5:30pm PT starting Apr 27
- Session 1: Assistants (Apr 27)
- Session 2: What's Actually Going On / phone addiction theories (May 4)
- Sessions 3 & 4: poll + TBD
- Format decided: 10min intro, 20min session 1, 10min show-and-tell (other people's ideas only), 20min session 2, 10min close. 1.5hrs total.

**Brainstorm topic research:**
- AI assistant landscape researched: PokeClaw, OpenClaw, Bee AI, Limitless, Omi, accessibility service API landscape
- Key finding: Accessibility Service is the real Android API; Play Store policy restrictive but sideloading works
- Humane AI Pin died Feb 2025; hardware experiment broadly failed
- Five brainstorm topic candidates generated from Brian's writing corpus

**Structure/tooling:**
- CLAUDE.md created at PhoneThatCares root — all instances in subfolders now inherit project context
- Handoff doc system: all instances writing to `MD context files/` before session close
- New working model: Brian talks to PM only; PM calls specialists via claude-peers as sub-agents

## Key files
- `/Users/b/Desktop/PhoneThatCares/dashboard.html` — open in browser for project overview
- `/Users/b/Desktop/PhoneThatCares/top-level-context-dump-phone-that-cares-organized.md` — full writing corpus, load when doing strategy/framing work
- `/Users/b/Desktop/PhoneThatCares/MD context files/` — all handoff docs live here
- `/Users/b/Desktop/PhoneThatCares/Website/BRAINSTORM-PAGE-BRIEF.md` — brief for the /brainstorm page

## claude-peers setup
MCP server installed at `~/claude-peers-mcp`. User-scoped MCP.
Brian launches sessions with alias: `claude --dangerously-skip-permissions --dangerously-load-development-channels server:claude-peers`
Broker: localhost:7899, SQLite at `~/.claude-peers.db`
Use `list_peers` to find active instances. Use `send_message` to delegate. IDs change each session — always call list_peers first.

## Immediate next actions
- [ ] **Tomorrow (Sun Apr 26, 4–5:30pm PT):** Brainstorm Session 1 — "Assistants." Brian needs to share the invite if he hasn't yet.
- [ ] First outreach email — Brian said it's time, hasn't drafted. Petr Nálevka or Joe Edelman recommended (HANDOFF-outreach.md).
- [ ] Vision-page tightening — soft prereq before sending any essay link out. Brian made cuts; could go further.
- [ ] Pick canonical essay to link in outreach (3 essays exist; needs the one).
- [ ] Android: build decision (Accessibility Service app vs LineageOS fork) — research substrate is live, deciding what to build is the gate.
- [ ] /brainstorms vs WeeklyCallCard rationalization — same dates, overlapping time. Decide whether to drop WeeklyCallCard or clarify the relationship (per HANDOFF-website.md open thread #2).
- [ ] StickerWall email reference — verify still applicable; Connect was rebuilt and StickerWall isn't currently mounted there.

Done since last handoff: /brainstorm page shipped (now `/brainstorms`, RSVP + poll widgets live); dashboard refreshed.

## Brian's working style notes
- Iterative, doesn't want things wrapped up prematurely
- Wants PM to call specialists rather than Brian opening separate tabs
- Prefers thinking out loud before acting — ask "want me to think about this first?" on ambiguous asks
- Blurb/copy feedback: watch for LLM tells, run through reviewer agent when in doubt
- Values the project's emotional core — this isn't just a product, it's personal
