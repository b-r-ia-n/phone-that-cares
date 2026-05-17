# Handoff — Website

**Last updated:** 2026-04-25
**Workstream:** Website engineer — pages, copy, OS-mock embedding, Supabase-backed comments / edit-mode / RSVPs / poll / brainstorm series
**Live:** https://aphonethatcares.com
**Repo:** `/Users/b/Desktop/PhoneThatCares/Website/`
**OS mock source repo (built into `Website/public/os-mock-sessions/`):** `/Users/b/Desktop/PhoneThatCares/OS_Mocks/ArgOS.Mock.Sessions.2026.04.15/`

---

## Current state of the site

### Nav order
Welcome → Experiments → Vision → Thinking → Writing → Connect.
`/brainstorms` is **standalone** (not in nav, link-only).

### Welcome (`src/pages/index.astro`)
Centered ArgOS phone mockup embedded as iframe. Caption to the right (vertically centered, 420px max-width on >1100 viewports), updates dynamically based on the iframe's current route via a polling script that watches `iframe.contentWindow.location.hash`. Mobile: phone stacks above text; iframe is `pointer-events: none` and a "Open full mockup →" pill overlays it that opens the standalone mock in a new tab (avoids touch swipe vs page scroll conflict).

Copy below the phone (intro + two body lists + reach line) is mostly tagged `data-edit="..."` for inline editing via `?edit=1`.

### Experiments (`src/pages/experiments.astro`)
Three experiments. Top intro rewritten by Brian. Per-experiment carousels:
- **ArgOS 2026** — embedded mock as Carousel slide (1 video). Tagline: "A clickable phone mockup with two main pieces." Single body paragraph (was rewritten to be less AI-flavored — describes the lockscreen meta-apps + transformations drawer). CTA opens `/os-mock-sessions/`.
- **The Scroll Lab** — Chrome extension download.
- **ArgOS 2028** — carousel reordered so Discover (PTC2) and Scroll Settings (PTC2b) are slides 1–2; rest follow.
Each experiment has its own Comments slug (`experiment-argos-2026`, `experiment-scroll-lab`, `experiment-argos-2028`).

### Vision (`src/pages/vision.astro`)
Brian asked for shorter / less-about-me. Removed the first lede paragraph entirely; new opener: "I think a world with less addictive phones is possible and not too far away. This timeline is one plausible route from here to there..." Removed the "First UI idea hits a wall" timeline item. Removed the parenthetical from "Early mockups." Hedged "The cascade" with "In a world where this project is really successful..."

### Connect (`src/pages/connect.astro`)
Restructured: merged "What I'm looking for" + "Open threads" into one unified **What I'm looking for** section, four items each with its own Comments thread:
- People to try the stuff (`connect-looking-try-the-stuff`)
- Technical guidance on getting from launcher to a phone you can buy (`connect-looking-technical-guidance`)
- Introductions to people I should know (`connect-looking-introductions`)
- Pointers (`connect-looking-pointers`)
**Outstanding:** Brian wants "Join the weekly call" inside the "Four ways to reach me" section to be a regular bullet (parallel to Twitter / Email / Schedule a call), not the special CTA-styled link it currently is. Held pending PM batch — apply when revisiting Connect.
Old thread comment slugs (`connect-thread-per-app-android`, `connect-thread-os-mock-critique`, `connect-thread-launcher-to-phone`, `connect-thread-people`) are orphaned in the `comments` table but no longer rendered.

### Brainstorms (`src/pages/brainstorms.astro`) — NEW
Standalone page, not in nav. URL: `/brainstorms`.
- Four Sunday sessions: **Apr 26, May 3, May 10, May 17** at 4:00–5:30pm Pacific. (PM brief originally said Mondays, Brian confirmed Sundays — the dates collide with WeeklyCallCard, treat them as the same recurring call rebranded with topics.)
- Session 1 = "Assistants" (full blurb), Session 2 = "What's actually going on" (full blurb), Session 3 = `<BrainstormPoll>` (Phone & Body vs History of Tech Change), Session 4 = TBD.
- Each session: an "add to calendar" link (Google Calendar pre-fill with topic, time, blurb, Meet URL, reminder note), and a `<BrainstormRSVP>` widget.
- Page is intentionally stripped down — no ASCII, no card chrome, minimal font hierarchy. Brian's feedback was the first iteration looked "too professional, like someone with a team of software engs made it."

### Writing (`src/pages/writing.astro`)
Three Substack essays. Brian removed the "All on Safety First. New things show up there first." lede and the "More writing on Substack →" footer. Just essays now.

### Thinking, Experiments(carousel), Connect(weekly-call), Stickers
Unchanged from prior handoff. WeeklyCallCard still on Connect, Sundays Apr 26 / May 3 / May 10 / May 17 at 4–5pm Pacific. **Note collision:** the brainstorm series is the same Sundays at overlapping time (4:00–5:30pm vs 4–5pm). Likely intentional (brainstorms = themed weekly call) but might want to rationalize: drop WeeklyCallCard, or delete brainstorms duplicates, or update copy to make the relationship clear.

### Stickers
Submissions still post directly as `status: 'approved'` (no moderation). Admin UI at `/admin/stickers` (magic-link gated). StickerWall not currently on Connect.

---

## Components

| File | Purpose |
|---|---|
| `src/components/Comments.jsx` | Inline comments per `page_slug`. Honeypot + 60s cooldown. RLS public insert + select. |
| `src/components/EditMode.jsx` | `?edit=1` Supabase magic-link auth (allowlist `bri@nvaughn.info`). Mounted globally via BaseLayout. Applies `content_overrides` to `[data-edit="..."]` elements for everyone. When authed, sets contenteditable + Save bar. **Bug worth knowing:** the phase-transition useEffect is sensitive — refactored once during this session to fix an "only one edit per session" bug caused by stacked input listeners and contenteditable churn during the save phase cycle. Current version separates phase resolution from contenteditable setup. If touching, test by editing → saving → editing again. |
| `src/components/WeeklyCallCard.jsx` | Pacific-time weekly call card with per-date Google Cal links. Auto-hides after last session. |
| `src/components/StickerWall.jsx` / `AdminStickers.jsx` | Stickers UI + admin moderation. |
| `src/components/BrainstormRSVP.jsx` | NEW. Per-session RSVP (Yes/Maybe/No + optional name/handle). Shows attendee inline ("Brian, @sam, and 3 others are in"). localStorage prevents dupes; "change" button to reset. Yes + Maybe shown publicly; No silent. |
| `src/components/BrainstormPoll.jsx` | NEW. Two-option poll with progress-bar UI, running totals from Supabase, localStorage prevents double-vote. |
| `src/components/Carousel.jsx`, `ScrollLab.jsx` | Pre-existing. |

---

## Supabase schema (project `rhjuoqhlitihhbutwbbs`)

| Table | Columns | RLS |
|---|---|---|
| `comments` | id, page_slug, name, handle, body, submitted_by_ip, created_at | anon SELECT + INSERT; admin-only UPDATE/DELETE via `auth.jwt() ->> 'email' = 'bri@nvaughn.info'` |
| `content_overrides` | id, page_slug, block_id, body, updated_at — unique (page_slug, block_id) | anon SELECT; admin-only ALL via same email check |
| `stickers` | unchanged from prior session | unchanged |
| `brainstorm_rsvps` | id, session_id, response (yes/maybe/no), display_name, created_at | anon INSERT + SELECT |
| `brainstorm_poll_votes` | id, poll_id, option_id, created_at | anon INSERT + SELECT |

### Auth config (set during this session)
- **site_url:** `https://aphonethatcares.com` (was `http://localhost:3000`, which broke magic-link redirects)
- **uri_allow_list:** `https://aphonethatcares.com/**,https://*.vercel.app/**,http://localhost:4321/**`

---

## OS mock — embedded on Welcome, also at `/os-mock-sessions/`

The Welcome page iframe loads the built mock from `Website/public/os-mock-sessions/`. Source lives at `OS_Mocks/ArgOS.Mock.Sessions.2026.04.15/`. **To deploy mock changes:**
1. Edit source under `OS_Mocks/ArgOS.Mock.Sessions.2026.04.15/src/`
2. `cd` there, `npm run build`
3. Copy `dist/assets/` → `Website/public/os-mock-sessions/assets/` (delete old assets first), copy `dist/index.html` → `Website/public/os-mock-sessions/index.html`
4. Deploy the website with `npx vercel deploy --prod --yes`

### Mock changes during this session
Was a multi-hour iterative effort. Highlights:
- **Layout stabilization sweep**: every screen had `h-screen` and `vh`-based positioning that broke when embedded in an iframe shorter than the phone canvas. Replaced `h-screen` → `h-full` everywhere; converted `vh`-based offsets to pixel offsets calibrated against the 390×844 phone canvas. Fixed file-by-file via three parallel sub-agents.
- **App.tsx**: removed double-bezel structure (was three rounded layers stacking, creating "pointy" corner artifact). Now a single 390×844 phone with `bg-zinc-900` (was a gradient that read as banding) and a single inner content div with `rounded-[36px]` (computed for concentricity with outer `rounded-[3rem]` after 12px padding). Outer wrapper background dropped to `bg-[#0a0a0a]`, no `p-8`, so the phone fills the viewport edge-to-edge — important for the iframe embed not clipping the status bar.
- **AndroidStatusBar**: opacity bumped to 95%, z-60, explicit inline color style, `pointer-events: none`. Fix that actually mattered was the iframe sizing change; status bar had been clipped above the visible viewport.
- **LockScreen**: spacing tuned several times. Currently radial top-[504px], camera/flashlight bottom-12, drag-label bottom-[40px].
- **HomeScreen**: dock at bottom-[50px], app-grid header `mb-8` (apps shifted up), Uber tile color `#2a2a2a` (was pure black, invisible on black bg). App tile labeled "Discover" (was "Styles"), `route: '/sessions'`.
- **ConnectScreen**: platform name labels next to each contact name (Messages / iMessage / WhatsApp / Signal / etc.), shown at `text-[11px] text-white/30`. Scrollbar hidden. FAB at `bottom-10 right-10`. Messages list now fills down to phone bottom (`h-[calc(100%-104px)]`).
- **ConversationScreen**: scrollbar hidden, plant icon removed, Sarah's avatar URL unified with Connect, Mom's avatar URL also unified. Compose field at `bottom-0`. Conversations populated for ids 1 (Sarah), 2 (Marcus), 3 (Mom), 4 (Dev Group), 5 (Jamie) — last message in each thread matches the Connect preview line.
- **AboutPersonScreen**: gray box now `h-[calc(100%-180px)] mb-6` (fills down). Per-person `personData` / `observations` / `bookContent` for ids 1–12. Sarah / Marcus / Mom / Dev Group / Jamie are full entries; rest lighter. Dev Group treated as a group (members in `people` list, group origin in `howYouMet`).
- **ThinkOutLoudScreen**: per-person prompt + context map keyed by lowercased slug. Custom prompts for sarah, marcus, mom, dev-group, jamie; falls back to default "What's going on with {name}?"
- **AskScreen**: memory snippets converted to clickable chat-bubble pills (`bg-white/[0.05]`, rounded, smaller text). Added "See past chats" link below.
- **NotificationsScreen**: scrollbar hidden, back button now navigates to `/sessions` (was `/discover`, which is a non-existent route → black screen).
- **SessionsScreen** (the Discover page): h1 "Discover" (was "Styles"). Header has a Bell button → `/notifications`, plus the existing Styles settings pill.
- **TreatmentsListScreen**: `name: 'Off'` mode label changed to `name: 'No styles applied'` (in `lib/modes.ts`) — affects every app's "off" display, intentional.
- **SessionAppScreen**: Instagram stories — "Your story" + mic + ceramics now have profile photo URLs. Twitter user avatar populated. `BRIAN_PFP` constant in `mockFeeds.ts` updated (was using a broken Unsplash photo ID).

### Naming convention now used
- "Lock screen" / "Home" / "Connect" / "Discover" (was "Styles" — primary social page) / "Ask" / "Notifications"
- "Styles" reserved for the settings/treatments sub-menu inside Discover
- "About [person]" for AboutPerson pages
- "Think out loud" for ThinkOutLoudScreen
- "Conversation" for ConversationScreen

---

## Welcome-page caption map (`src/pages/index.astro`)

The polling script in the Welcome page maps the iframe's HashRouter route → caption. Current mapping:

| Route | Title | Body |
|---|---|---|
| `/` | Lock screen | "This OS concept pulls information from many apps at once and collects it into shared, useful places. Swipe up for social media, left to access a general messaging app, down to access a general AI, and right for a standard home screen." |
| `/home` | Home | "The home screen lets users access all of their apps in the normal ways." |
| `/connect` | Connect | "A place to respond to all your messages or think out loud about a conversation or your relationship with a person. Click on the profile picture or the AI icon inside a thread to open up the think out loud UI." |
| `/sessions` | Discover | "This page lets you use your social media apps like normal, but adds a layer of effects to make it a little bit harder to feel like you're sucked into another universe, when you use them." |
| `/ask` | Ask | "The ask screen acknowledges that most times you open your phone these days will be to search for information that an AI could find for you." |
| `/notifications` | Notifications | "Collect all your notifications from different apps together in a useful and workman-like way." |
| `/sessions/treatments` | Styles | "Add an optional layer of transformation in between a social media app and your eyeballs." |
| `/about/:id` (dynamic) | About [person] | "This page is a way to take notes, think aloud in conversation with an LLM, or look at the larger context of your conversation history with them." |
| `/conversation/:id` (dynamic) | Conversation | "This is your regular conversation with this person. Click the AI button to open up a secondary menu and reflect on it." |
| `/think-out-loud/:person` (dynamic) | Think out loud | "This page is for taking notes on a conversation, adding reminders to things you might want to remember." |

---

## Inline edit mode (`?edit=1`)

Add `?edit=1` to any URL → black pill at the bottom prompts for `bri@nvaughn.info`. Magic link → click it → returns authed → editable blocks (anything wrapped in `data-edit="..."`) get a dashed blue outline. Click, type, Save.

Magic link redirect now correctly returns to `aphonethatcares.com` (was `localhost:3000`).

**What's `data-edit`-tagged on Welcome:** h1, intro paragraphs, contents-list label, every contents bullet (`welcome-contents-experiments` etc.), looking-list label + each looking bullet, reach-line. Mock-preview caption blocks are NOT edit-tagged because the polling script overwrites them on every iframe route change — would need a different overrides-respecting design to make those editable that way.

**What's tagged elsewhere:** Connect lede, looking-h, each looking-item title + body, reach-h. Other pages have minimal tagging.

---

## Decisions / posture worth keeping

- **"Workbench, not launch page."** Deliberately unfinished reads as more surface area for engagement. Don't tighten the site into a brochure. Brian explicitly pushed back on the brainstorms page when the first version felt "too professional, like someone with a team of software engs made it" — keep new pages handmade-feeling.
- **Primary CTA** has shifted from "email me with a reaction" → "schedule a call." Other CTAs (Twitter, email) are subordinate bullets.
- **No moderation** on stickers or comments — Brian chose the risk. Honeypot + cooldown stay.
- **Type hierarchy on Welcome:** body paragraphs primary; lists & reach line secondary (0.92rem, text-secondary).
- **Less LLM-flavored copy** is an active goal. Brian dictates rough text and asks me to tighten without smoothing into LLM-shape (parallel structures, tricolons, "not X but Y," summary sentences).
- **Iterate, don't wrap.** Brian collaborates iteratively. Don't tie things off mid-loop. He'll often dictate a multi-page batch and want them all shipped together.

---

## Open / TBD

1. **"Join the weekly call" parallelism** in the Connect reach section — make it a regular bullet (Brian flagged, deferred).
2. **Brainstorms vs WeeklyCallCard** — same dates, overlapping time. Decide whether to drop WeeklyCallCard, or keep both and clarify the relationship. Likely brainstorms supersedes.
3. **Welcome mock captions can't be inline-edited** — the JS polling overwrites them on every route change. If Brian wants those editable, refactor to read from `content_overrides` per route.
4. **Mock — discover/styles app drawer Uber visibility** — already fixed (dark gray), but if Brian wants more contrast tuning, that's HomeScreen.tsx line ~34.
5. **About-page bio names collision** — Marcus's bio lists "Jamie — his younger brother" but Jamie is also a standalone contact. Two different Jamies. Brian was told; awaiting a call.
6. **Vision page is still timeline-heavy.** Brian wanted "significantly shorter and significantly less about me" — I made surgical cuts, but the page could go further. Hold for explicit direction.
7. **Old orphan comments** under `connect-thread-*` slugs in Supabase — no longer displayed. Probably fine to leave. Delete if cleanup desired.

---

## Deployment

- Vercel project `prj_WJ9xN4ma8ia1Or50vhTxIDU94NmW` (`phone-that-cares-website`).
- Deploy: `cd Website && npx vercel deploy --prod --yes`
- Domain `aphonethatcares.com` aliased.
- `astro.config.mjs` has `redirects: { '/collaborate': '/connect' }`.

---

## Secrets & access

- **Supabase PAT** `sbp_840ec6f18a0b3671b37243c97be3d3caa5d874df` — used to run schema migrations / config updates via Management API. **Expires 2026-05-16.** Don't commit anywhere.
- **Supabase project ref:** `rhjuoqhlitihhbutwbbs`.
- **Admin auth:** magic link to `bri@nvaughn.info`. The Supabase auth user exists; created during the 2026-04-22 session.

---

## Cross-instance coordination

`claude-peers` MCP is available. The PM instance was `8gfx137p` (last seen 2026-04-22, may have rotated). Recently active instances in `/Desktop/PhoneThatCares/`: `t8n3w9eo`, `63cz4o7o`. Use `set_summary` on session start so peers know who you are. Brian routinely runs multiple instances simultaneously — e.g. PM Claude wrote the brainstorm brief at `/Users/b/Desktop/PhoneThatCares/Website/BRAINSTORM-PAGE-BRIEF.md`.

---

## How Brian works (worth absorbing before starting)

- **Iterative, voice-dictated batches.** He'll send a wall of voice-transcribed feedback covering 5–15 disparate items. Parse them, group by file, do them all, deploy once.
- **Spawn sub-agents for parallel independent work.** Layout sweeps across N files, per-screen content edits, etc. Then rebuild + deploy from main.
- **Deploy between batches.** No staging step — Brian wants to refresh the live URL. He's said explicitly: "just write to the final website. And it's okay if it's sort of creating an unfinished website."
- **Don't smooth too much.** When Brian dictates copy, preserve his voice. The LLM tells (parallel structure, em-dash thought elaboration, summary sentences, abstract nouns) are exactly what he's trying to avoid.
- **He has a take on visual fussiness.** "Looks like someone with a team of software engs made it" is a real critique. Bias toward fewer fonts, less visual hierarchy, less card chrome on personal pages.
