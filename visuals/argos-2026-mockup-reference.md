# Argos 2026 Mockup — page-by-page reference

## Top matter

**Documented directory:** `/Users/b/Desktop/PhoneThatCares/phone-os/ArgOS.Mock.Sessions.2026.04.15/`

**Why this one:** The website (`experiments.astro`) labels two mockups explicitly. The "ArgOS 2026" section links to `/os-mock-sessions/` and opens `ArgOS.Mock.Sessions.2026.04.15`. The "ArgOS 2028" section links to `/os-mock/` and opens `ArgOS.Mock.2026.04.14`. Those are the exact strings in the source. No ambiguity.

**Stack:**
- React 18 + TypeScript
- Vite 6 build
- React Router 7 (hash-based: `HashRouter`)
- Tailwind CSS 4
- Motion (`motion/react`) v12 — the Framer Motion successor
- Zustand 4 for state (sessions store, persisted to localStorage as `argos-sessions-v4`)
- `react-icons/si` for brand icons (Simple Icons set)
- `lucide-react` v0.487 for system icons

**Typography:**
- `--font-display`: Outfit (weights 300/400/500/600/700) — used for large time display, screen titles
- `--font-body`: DM Sans (variable, 9–40 optical size, weights 300–600) — used for labels, captions, body
- Both loaded from Google Fonts
- Break-cards inside SessionAppScreen introduce `Georgia, serif` as an alternate font on `font-cycling` mode

**Phone shell:**
- Fixed 390×844px container centered in the viewport
- Outer div: `bg-[#0a0a0a]`, `rounded-[3rem]`, `shadow-2xl`, `padding: 12px`
- Inner screen: `rounded-[36px]`, `overflow-hidden`, `bg-[#0a0a0a]`
- Designed to look like a device bezel but it's just CSS rounding — no SVG frame

**Mode colors (from CSS vars):**
- `--phone-discover`: `#F5C563` (amber/gold)
- `--phone-ask`: `#B19CD9` (lavender)
- `--phone-connect`: `#86EFAC` (mint green)
- `--phone-home`: `#7DD3FC` (sky blue)

---

## Routing & navigation

Router type: `HashRouter` — all URLs are hash-prefixed (e.g. `/#/connect`).

| Route | Component |
|---|---|
| `/` | LockScreen |
| `/connect` | ConnectScreen |
| `/sessions` | SessionsScreen |
| `/sessions/treatments` | TreatmentsListScreen |
| `/sessions/treatments/:appId` | AppTreatmentDetailScreen |
| `/sessions/app/:appId` | SessionAppScreen |
| `/home` | HomeScreen |
| `/ask` | AskScreen |
| `/think-out-loud/:person` | ThinkOutLoudScreen |
| `/about/:personId` | AboutPersonScreen |
| `/notifications` | NotificationsScreen |
| `/conversation/:personId` | ConversationScreen |

**Lock screen directional mapping:**
| Direction | Label shown | Route |
|---|---|---|
| Swipe up | Discover | `/sessions` |
| Swipe down | Ask | `/ask` |
| Swipe left | Connect | `/connect` |
| Swipe right | Home | `/home` |

**Back navigation patterns:**
- Most screens have an ArrowLeft button that explicitly calls `navigate('/')` or `navigate('/connect')` or `navigate('/sessions')` — there is no browser-back stack mechanism; back is always hardcoded.

---

## Per-screen breakdown

---

### LockScreen

**Route:** `/`

**Background:**
- Base: `#0a0a0a`
- Overlay gradient: `bg-gradient-to-b from-zinc-900/50 via-transparent to-zinc-900/30`

**Status bar:** AndroidStatusBar — time "11:11" left, Signal + "4G" + WiFi + battery right. `text-white/95`, `pointer-events-none`.

**Layout (top to bottom):**
1. AndroidStatusBar (absolute, top of screen)
2. Time cluster (`top-16`, centered):
   - Time: `"11:11"` hardcoded, `text-[5.5rem] font-light tracking-tight text-white/95`, Outfit font
   - Date + weather on same line, `-0.5rem` margin-top: date string (dynamic, `en-US` locale: e.g. "Monday, May 15"), separator dot `text-white/30`, Sun icon + `"68°"` (hardcoded). All `text-xs tracking-[0.2em] uppercase text-white/50`, DM Sans.
3. Notifications (`top-[260px]`, `left-6 right-6`):
   - Two hardcoded notification pills, `rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]`
   - Card 1: Blue circle avatar "M", app label "Messages", text "Sarah: Hey! Want to grab coffee later?", timestamp "now"
   - Card 2: Purple circle avatar "S", app label "Slack", text "2 new messages in #general", timestamp "5m"
   - No tappable behavior — these are static display only.
4. Interactive circle (`top-[504px]`, centered):
   - Outer circle: `w-40 h-40` (160px), `rounded-full`, `border-width: 2px`. Color: idle = `rgba(255,255,255,0.09)`. Color changes on drag based on direction.
   - Four directional icons outside the ring (Lucide, `size={20} strokeWidth={1.5}`, `text-white/75`):
     - Top (up): `Sprout`
     - Bottom (down): `Mic`
     - Left: `MessageCircleHeart`
     - Right: `Grid3x3`
   - Central puck: `w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm`, draggable
5. Direction label: `bottom-[40px]`, center, `text-white/60 text-sm tracking-wide`, appears only while dragging. Text: "Discover" / "Ask" / "Connect" / "Home"
6. Bottom row (`bottom-12`): Flashlight button left, Camera button right. Each `w-10 h-10 rounded-full border border-white/12`. Icons: Lucide `Flashlight` and `Camera`, `size={16}`. Opacity 0.55. No navigation behavior in code.

**Interactive elements:**
- Central puck: drag gesture (mouse and touch). Constrained to `CIRCLE_RADIUS = 80px`. Dominant axis determines direction. Threshold to commit navigation: `THRESHOLD = 60px`. Release beyond threshold navigates. Release inside threshold returns puck to center.
- Direction icon color feedback: ring color starts changing at 1/3 of radius (`26.4px`), reaches max at 85% of radius (`68px`). Up = amber `rgba(245,197,99,...)`, Down = lavender `rgba(177,156,217,...)`, Left = mint `rgba(134,239,172,...)`, Right = sky `rgba(125,211,252,...)`. Opacity ramps from 0.025 to 0.175.
- Flashlight and Camera buttons: rendered, no `onClick` handler in code — non-functional in the mockup.

**Apps / content:** None. No app icons.

**Motion:**
- Time: `initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}`, duration 0.6s, easeOut
- Date/weather: `initial={{ opacity:0 }} animate={{ opacity:0.5 }}`, duration 0.6s, delay 0.2s
- Notifications: `initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}`, duration 0.5s, delay 0.6s / 0.7s
- Puck: scale 1 → 1.05 on drag, duration 0.2s. Color: `animate={{ backgroundColor }}` between two rgba values.
- Flashlight/Camera buttons: `initial={{ opacity:0 }} animate={{ opacity:0.55 }}`, delay 0.8s
- Direction label: `AnimatePresence`, scale + opacity fade in/out

**What is NOT on this screen:**
- No passcode/biometric prompt
- No date-formatted clock (date is real but time is hardcoded "11:11")
- No media controls
- No quick-settings drawer
- No actual notification count or badge
- No "slide to unlock" affordance
- No swipe-up gesture on the notification pills themselves

---

### HomeScreen

**Route:** `/home`

**Background:**
- Base: `#0a0a0a`
- Gradient: `bg-gradient-to-b from-blue-950/10 via-transparent to-transparent`

**Status bar:** AndroidStatusBar

**Layout:**
1. Header (`px-6 pt-12`): ArrowLeft (back to `/`) left, time "11:11" right (`text-xl font-light text-white/70`, Outfit)
2. App grid (`px-8 pb-[120px]`): 4-column grid, `gap-6`. 17 apps total — 4 full rows + 1 item.
3. Dock (`bottom-[50px]`, `px-8`): 4 apps, `bg-white/10 backdrop-blur-xl rounded-3xl p-4 border border-white/20`

**App grid — exact order and app list:**

Row 1: Gmail (`#EA4335`), Calendar (`#4285F4`), Maps (`#4285F4`), Weather (`#5AC8FA`, Lucide `CloudSun`)
Row 2: Photos (`#4285F4`), Spotify (`#1DB954`), Keep (`#FFBB00`), Uber (`#2a2a2a`)
Row 3: Venmo (`#3D95CE`), Instagram (`#E4405F`), YouTube (`#FF0000`), WhatsApp (`#25D366`)
Row 4: Signal (`#3A76F0`), Slack (`#4A154B`), Chase (`#117ACA`), Airbnb (`#FF5A5F`)
Row 5 (1 item): Discover (`#F5C563`, Lucide `Sprout`, navigates to `/sessions`)

All icons: `w-16 h-16 rounded-2xl`, icons `size={30}`. Labels: `text-xs text-white/70`, DM Sans.

**Dock apps (exact order left to right):**
Phone (Lucide `Phone`, `#30D158`), Messages (Lucide `MessageSquare`, `#0A84FF`), Chrome (`SiGooglechrome`, `#4285F4`), Camera (Lucide `Camera`, `#8E8E93`)

All dock icons: `w-14 h-14 rounded-2xl`. No labels in dock.

**Interactive elements:**
- Back arrow → `/`
- "Discover" app tile (id 17, last item) → `/sessions`. All other app tiles have no navigation in the code — they call `navigate(app.route)` only if `route` property exists, and only Discover has it.
- Dock apps: no `onClick` handlers — non-functional.

**Apps / content:** See app grid and dock above.

**Motion:** Each app tile: `initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}`, staggered `delay: index * 0.03`, duration 0.3s. Dock: `initial={{ opacity:0, y:20 }}`, delay 0.4s.

**What is NOT on this screen:**
- No search bar
- No widget row
- No app folders
- No page dots (no second home screen)
- No notification badges/dots on icons
- No long-press context menu

---

### ConnectScreen

**Route:** `/connect`

**Background:** `#0a0a0a` solid. No gradient.

**Status bar:** AndroidStatusBar

**Layout:**
1. Header (`px-6 pt-14 pb-3`): ArrowLeft → `/` left. Title "Connect" (`text-2xl font-light tracking-tight text-white/95`, Outfit). Right: Search icon + circular user avatar (Unsplash photo, `w-8 h-8 rounded-full`).
2. Messages list (scrollable, `h-[calc(100%-104px)]`, scrollbar hidden, `px-6 pb-4`)
3. FAB (floating action button): `bottom-10 right-10`, `w-14 h-14 rounded-full`, `bg-white/10 backdrop-blur-xl border border-white/20`. Icon: `MessageSquarePlus`. No `onClick` in code — non-functional.

**Message list — exact contacts and platforms:**

| Name | Platform | Preview text | Time |
|---|---|---|---|
| Sarah | SMS (Google Messages) | "Did you see the photos from last weekend?" | 2 min |
| Marcus | Signal | "Thanks for the recommendation!" | 1 day |
| Mom | SMS (Google Messages) | "Call me when you get a chance" | 3 days |
| Dev Group | Signal | "Meeting at 3pm tomorrow" | 5 hours |
| Jamie | WhatsApp | "Sent you a reel" | 2 weeks |
| Alex | Instagram | "You: See you then!" | 4 months |
| Jordan | Substack | "That article was great" | 1 week |
| Taylor | WhatsApp | "Up for a run this weekend?" | 6 days |
| Sam | Signal | "Band practice Thursday?" | 2 weeks |
| Dana | Telegram | "You: Finished the book!" | 3 weeks |
| Riley | iMessage | "Coffee shop closed early today" | 1 month |
| Chris | Messenger | "Still on for the ride?" | 5 weeks |

**Each list item layout:** Single `rounded-2xl bg-white/[0.05]` rectangle split into two zones by a vertical divider (`w-[1px] h-12 bg-white/[0.12]`):
- Left zone (`w-16 h-16`): Person avatar (photo or emoji), tappable → `navigate('/about/:id')`
- Right zone: Name + platform label + timestamp on first line, preview text below. Tappable → `navigate('/conversation/:id')`

**Platform badge colors:**
SMS = `#1A73E8` (Google Messages icon), iMessage = `#0A84FF`, WhatsApp = `#25D366`, Messenger = `#0084FF`, Signal = `#3A76F0`, Instagram = `#E4405F`, Telegram = `#26A5E4`, Substack = `#FF6719`

**Apps / content:** Purely messaging — conversations across 8 platforms. No photos, no feed content, no non-messaging apps.

**Motion:** Each row: `initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}`, staggered `delay: index * 0.03`. FAB: `initial={{ opacity:0, scale:0.8 }}`, delay 0.6s.

**What is NOT on this screen:**
- No photos, camera, stories, or feed content
- No search functionality beyond the icon (no search UI revealed in code)
- No read/unread state differentiation (no bold names, no dots)
- No message count badges
- No group creation or other action from FAB (non-functional)
- No pinned conversations

---

### SessionsScreen ("Discover")

**Route:** `/sessions`

**Background:** `#0a0a0a`

**Status bar:** AndroidStatusBar

**Layout:**
1. Header (`px-6 pt-14 pb-3`): ArrowLeft → `/`. Title "Discover" (not "Sessions" — the screen is labeled "Discover"). Right side: Bell icon button → `/notifications`, and "Styles" button (`SlidersHorizontal` icon) → `/sessions/treatments`.
2. Gray box container (`mx-6`, `rounded-2xl bg-white/[0.05] px-5 pt-8 pb-5`, height `calc(100%-200px)`): 3-column grid of app tiles.
3. "Add app" tile at end of grid (dashed border, `Plus` icon), opens bottom sheet.
4. Add app bottom sheet (AnimatePresence): slides up from bottom (`max-h-[506px]`), dark background `#1a1a1a`, rounded-t-2xl. Lists inactive apps. Tap any to add.

**App tiles in the grid:**

Default active apps (from `defaultActiveIds`): Instagram, X, YouTube, Reddit, Substack. The mockup ships with these 5 active by default; user can add more from the full list of 12.

Each tile:
- App icon `w-14 h-14 rounded-2xl`, icon size 26, icon color from `getModeFilter()` (may be grayscale or blurred depending on mode + progress)
- App name `text-[11px] font-medium text-white/85`
- Progress bar (thin, 1px, `w-14`) — visible when mode is not `off` and progress > 0
- Time display `text-[9px] text-white/40` — visible when time > 0. Format: `Xm YYs / Zm` (time spent / ramp)
- Tapping tile → `/sessions/app/:appId`

**Full app catalog (all 12 in `allScrollApps`):**

| App | Brand color | Default mode | Default ramp | Available modes |
|---|---|---|---|---|
| Instagram | `#E4405F` | grayscale | 30 min | grayscale, feed-blur, break-cards, passive-tracking, off |
| X | `#000000` | tweet-spacing | 15 min | tweet-spacing, grayscale, feed-blur, font-cycling, off |
| YouTube | `#FF0000` | off | 45 min | grayscale, feed-blur, break-cards, passive-tracking, off |
| Reddit | `#FF4500` | off | 20 min | font-cycling, grayscale, break-cards, feed-blur, off |
| Substack | `#FF6719` | off | 30 min | font-cycling, feed-blur, break-cards, passive-tracking, off |
| Facebook | `#1877F2` | off | 30 min | grayscale, feed-blur, break-cards, passive-tracking, off |
| Threads | `#000000` | off | 20 min | tweet-spacing, grayscale, feed-blur, font-cycling, off |
| Pinterest | `#E60023` | off | 30 min | grayscale, feed-blur, break-cards, passive-tracking, off |
| Snapchat | `#FFFC00` | off | 20 min | grayscale, feed-blur, break-cards, passive-tracking, off |
| Discord | `#5865F2` | off | 30 min | grayscale, feed-blur, break-cards, font-cycling, off |
| Bluesky | `#0085FF` | off | 20 min | tweet-spacing, grayscale, feed-blur, font-cycling, off |
| TikTok | `#000000` | off | 20 min | grayscale, feed-blur, break-cards, passive-tracking, off |

**Demo presets (baked into initial state):** Instagram = 30 min elapsed, X = 5 min elapsed, YouTube = 5 min elapsed.

**Interactive elements:**
- App tile → `/sessions/app/:appId`
- Bell → `/notifications`
- Styles button → `/sessions/treatments`
- Add tile → bottom sheet
- Bottom sheet: selecting inactive app calls `addApp(id)` and dismisses sheet

**Motion:** Container: `initial={{ opacity:0, y:20 }}`, delay 0.1s. Tiles: `initial={{ opacity:0, scale:0.9 }}`, staggered. Bottom sheet: spring animation `y: '100%' → 0`, `damping:30, stiffness:300`.

**What is NOT on this screen:**
- No usage history or charts
- No remove-app affordance (add only, no edit/delete mode)
- No per-app notifications
- No summary of total time

---

### TreatmentsListScreen ("Styles")

**Route:** `/sessions/treatments`

**Background:** `#0a0a0a`

**Status bar:** AndroidStatusBar

**Layout:**
1. Header (`px-6 pt-12 pb-6`): ArrowLeft → `/sessions` left. Center title "Styles" (`text-base font-medium text-white/90`, DM Sans). Empty spacer right (no buttons).
2. Gray box (`mx-6`, `rounded-2xl bg-white/[0.05] px-4 pt-6 pb-3`, `h-[calc(100%-200px)]`):
   - Subheading: `"Pick how the phone should meet you in each app."` `text-xs text-white/40 text-center`
   - List of active app rows (one per active app), each `rounded-xl bg-white/[0.03] border border-white/[0.05]`, tapping navigates to `/sessions/treatments/:appId`

**Each app row:**
- App icon `w-10 h-10 rounded-xl`
- App name `text-sm font-medium text-white/90`
- Mode name + time progress if active (e.g. "Grayscale · 30m 00s / 30m")
- Progress bar (0.5px height) if mode is not off and progress > 0
- `ChevronRight` right side

**Motion:** Rows: `initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}`, staggered.

**What is NOT on this screen:**
- No way to remove apps from this screen
- No global on/off toggle

---

### AppTreatmentDetailScreen

**Route:** `/sessions/treatments/:appId`

**Background:** `#0a0a0a`

**Status bar:** AndroidStatusBar

**Layout:**
1. Header (`px-6 pt-12 pb-5`): ArrowLeft → `/sessions/treatments`. Right: app name + app icon (`w-9 h-9 rounded-xl`).
2. Gray box (`mx-6`, `rounded-2xl bg-white/[0.05] px-5 pt-6 pb-5`, `h-[calc(100%-200px)]`, scrollable):
   - Section "TODAY": large time display (`text-2xl font-light`, Outfit) showing `timeSpentTodayMs` formatted. Progress bar. "of Xm ramp" label.
   - Section "RAMP": range slider `0–90min` in 5-min steps, current value shown. `accentColor: app.color`. Label: "Time to full effect."
   - Section "MODE": list of mode picker buttons (one per `app.availableModes`). Each shows mode name + description. Selected state: `bg-white/[0.08] border-white/20`. "Active" badge in `app.color`.
   - Long description of the active mode below the picker.
3. Bottom button: "Open {app.name}" — filled with `app.color`, navigates to `/sessions/app/:appId`.

**Modes and descriptions (from `lib/modes.ts`):**

| ModeId | Name | Short description | Long description |
|---|---|---|---|
| grayscale | Grayscale | Feed gradually loses color | Over the course of your daily budget, color drains out of the feed. A quiet way to notice how long you've been here. |
| feed-blur | Feed blur | Feed softens over time | Posts gently lose focus as your session runs. Your eyes will start to do the work they normally don't. |
| tweet-spacing | Tweet spacing | Posts spread apart over time | As you scroll, the space between posts grows. The timeline loosens its grip. |
| font-cycling | Font cycling | Alternates serif and sans | Body text rotates through typefaces more often as the session goes on. You start to notice the words as shapes. |
| break-cards | Break cards | Soft pauses between posts | Small pause cards appear more often as time passes. Quiet check-ins, nothing to do. |
| passive-tracking | Passive tracking | No visual changes, just notices | The feed looks normal. Only the timer moves — so you can see how long you've been here, later. |
| off | No styles applied | Feed as-is | Nothing added, nothing tracked. Just the app. |

**Interactive elements:**
- Ramp slider: live-updates store via `setDailyRamp()`
- Mode buttons: live-updates store via `setMode()`
- "Open" button → `/sessions/app/:appId`

**What is NOT on this screen:**
- No history graph
- No way to remove the app from Discover
- No notifications settings

---

### SessionAppScreen

**Route:** `/sessions/app/:appId`

**Background:** Varies by app.

**Status bar:** AndroidStatusBar

This screen has three distinct render paths:

#### Instagram path (`appId === 'instagram'`)

**Background:** `bg-black`

**Layout:**
1. AndroidStatusBar
2. Instagram header (`px-4 pt-11 pb-2`): Instagram logo image (loaded from `/os-mock-sessions/instagram-logo.png`). Right: optional timer display (if mode active + time > 0, shows `Xm` label tapping → `/sessions/treatments/instagram`), then `Heart` icon, then `Send` icon.
3. Stories row (horizontal scroll, `border-b border-white/[0.06]`): 5 story circles
4. Feed (vertical scroll, full width), with CSS filter applied at the feed-area level
5. Instagram bottom nav bar: Home, Search, PlusSquare, Clapperboard, Profile avatar

**Stories (exact data):**
- "Your story" — no ring, user selfie photo (Unsplash)
- "caroline.k" — gradient ring (`#f09433` → `#bc1888`), photo
- "miketheb..." — gradient ring, photo
- "ceramics..." — gradient ring, photo
- "tides.and..." — gradient ring, photo

**Feed content:** Pulled from `mockFeedsByApp['instagram']` (data in `src/app/data/mockFeeds.ts` — not read but referenced). Displayed as `InstagramCard` components: avatar + username header, full-width square image, action row (Heart/Comment/Send/Bookmark), like count, caption, comment previews, optional song attribution.

**Mode effects (CSS filter on feed-area div):**
- `grayscale`: `filter: grayscale(${progress*100}%)` — gradually desaturates
- `feed-blur`: `filter: blur(${progress*0.94}px)` — barely perceptible blur (max ~0.94px at full ramp)

**Break cards (for break-cards mode):** Full-screen `min-h-[420px]` card with ASCII art and a soft prompt. One of 5 ASCII art patterns, one of 5 prompts. Inserted every 4th item.

**Font cycling:** Every 12th item switches to `Georgia, serif` for body text.

**Tweet spacing:** Extra gap `Math.round(progress*72)px` added between posts.

#### X path (`appId === 'x'`)

**Background:** `bg-black`

**Layout:**
1. AndroidStatusBar
2. X header: user avatar left, X logo SVG center, settings icon + optional timer right
3. "For you" / "Following" tab bar (static, non-functional tabs)
4. Feed (vertical scroll)
5. X bottom nav: Home, Search, Communities, Notifications, Messages

**Feed:** `XCard` components — avatar + username/handle/time row, tweet text, optional image, action row (reply count, repost count, like count, bookmark). Mode effects applied differently: `feed-blur` is applied per-card at 1/12 frequency (`blurPx: 3.5`) rather than to the whole feed container.

#### Generic path (all other apps)

**Background:** `#0a0a0a`

**Layout:**
1. AndroidStatusBar
2. Simple header (`px-5 pt-12`): back arrow → `/sessions`, app icon + name center, time elapsed right (tappable → `/sessions/treatments/:appId`)
3. Progress bar (2px height, `app.color`) under header — visible when mode is not off
4. Feed (vertical scroll, `py-3 px-4`)
5. No bottom nav

**Feed card types:**
- YouTube: `YouTubeCard` — 16:9 aspect image, title, author/meta below
- Reddit: `RedditCard` — subreddit label, title, optional body, optional image, thumbs up + comment count
- Substack: `SubstackCard` — optional image, author/date, title, optional body

Note: Facebook, Threads, Pinterest, Snapchat, Discord, Bluesky, TikTok all map to generic path but `FeedCard` returns `null` for those appIds (only x, youtube, reddit, substack have card implementations). Those apps show an empty feed with only the "End of feed" footer.

**Motion (all paths):** Feed fades in: `initial={{ opacity:0 }} animate={{ opacity:1 }}`, duration 0.3s.

**What is NOT on this screen:**
- No actual in-app navigation (no DMs, no profile, no explore)
- No real-time data
- Instagram Reels is not implemented (Clapperboard tab non-functional)
- No video playback (Play button is static)
- Most platform-specific features (stories interaction, Twitter threads, etc.) are static

---

### AskScreen

**Route:** `/ask`

**Background:**
- Base: `#0a0a0a`
- Gradient: `bg-gradient-to-b from-violet-950/20 via-transparent to-violet-950/30`

**Status bar:** AndroidStatusBar

**Layout:**
1. Back arrow (`top-12 left-6`) → `/`
2. Memory snippets (staggered in from left, centered, `w-[300px]`):
   - "yesterday: you asked me to remind you about the dentist"
   - "this morning: drafted a reply to Caroline"
   - "tonight: the sky should be clear enough to see saturn"
   - Each is a tappable pill `rounded-2xl px-3 py-1.5 bg-white/[0.05] border border-white/[0.08]`, `text-sm text-white/60`
   - Below: "See past chats" link `text-xs text-white/40 underline decoration-dotted`
3. Waveform (5 animated bars, violet gradient `from-violet-400 to-violet-300`, `w-2 rounded-full`, height animated randomly between 40–100%). Updates every 200ms interval while `isListening: true`.
4. Main prompt area:
   - Title: `"What do you want to do?"` `text-2xl font-light text-white/90`, Outfit
   - Body: `"You can ask me to text someone, set a reminder, look something up, or just think through something with you."` `text-base text-white/40`
   - Listening indicator: violet dot `w-2 h-2 rounded-full bg-violet-400` pulsing (scale 1→1.2, opacity 0.5→1, 2s loop) + "Listening..." `text-sm text-white/50`
5. "or type instead" text link (`bottom-[99px]`, `text-xs text-white/30 underline decoration-dotted`) — no `onClick` in code

**Apps / content:** None. No app icons. No navigation links to specific conversations.

**Motion:**
- Memory snippets: `initial={{ opacity:0, x:-20 }}`, staggered 0.3 + index*0.1
- Waveform bars: `animate={{ height }}`, duration 0.2s each, updates every 200ms
- Listening dot: scale/opacity pulse loop, 2s, `easeInOut`, `repeat: Infinity`
- "or type instead": `initial={{ opacity:0 }}`, delay 1s

**What is NOT on this screen:**
- No actual voice recognition or text input field active
- No conversation history list beyond the 3 hardcoded memory snippets
- No suggested prompts
- The "See past chats" and memory pill taps have no destination (empty handlers)

---

### ThinkOutLoudScreen

**Route:** `/think-out-loud/:person`

**Background:**
- Base: `#0a0a0a`
- Gradient: `bg-gradient-to-b from-violet-950/10 via-transparent to-transparent`

**Status bar:** None. (No `AndroidStatusBar` in this component.)

**Layout:**
1. Header (`px-6 pt-12`): ArrowLeft → `/connect`, title "Think Out Loud" (`text-xl font-light text-white/70`, Outfit)
2. Person name + emoji avatar (centered), `text-3xl font-light text-white/95`
3. Context line: relationship recency/pattern, `text-sm text-white/40`
4. Breathing microphone circle (`w-32 h-32 rounded-full`, `from-violet-500/20 to-violet-600/20`, `border-2 border-violet-400/30`, Mic icon `size={48} text-violet-300/80`). Pulses between scale 1 and 1.1 every 1s.
5. Prompt text below mic: personalized question, `text-base text-white/70`
6. After 3 seconds (simulated): "Want me to help you draft something?" link appears (`text-sm text-white/50 underline decoration-dotted`), animated in from below.

**Person data (5 hardcoded entries, matched by URL slug):**
- `sarah`: "Take your time. What's coming up with Sarah?" / "You last talked 2 days ago. You've messaged almost every week for years."
- `marcus`: "What are you thinking about with Marcus? Could be about work, the side project, or anything else." / "You last talked 6 weeks ago. You've messaged 40+ times over the years."
- `mom`: "What's on your mind about your mom?" / "You last talked 3 days ago. You usually catch up on Sundays."
- `dev-group`: "Anything on your mind about the next session? Feeling nervous about cancelling, unsure about the prep?" / "Next session is Thursday. The thread's been quiet for a couple of days."
- `jamie`: "What's on your mind about Jamie?" / "You last talked 2 weeks ago. You tend to go quiet for stretches, then catch up in bursts."

Fallback for unknown slugs: generic prompt + slug-as-name.

**Interactive elements:**
- Back arrow → `/connect`
- Mic is non-interactive (no `onClick`)
- "Want me to help draft" link: no `onClick`

**What is NOT on this screen:**
- No recording indicator that actually starts/stops
- No status bar
- No navigation to a draft/compose screen
- Not routed from anywhere in the current mockup — this screen exists but no screen currently navigates to it (see Inconsistencies section)

---

### AboutPersonScreen

**Route:** `/about/:personId`

**Background:** `#0a0a0a`

**Status bar:** None. (No `AndroidStatusBar`.)

**Layout:**
1. Header (`px-6 pt-12 pb-6`): ArrowLeft → `/connect` left. Right: "About {name}" text + person avatar (photo or emoji), `text-base font-medium text-white/90`.
2. Large gray box (`mx-6 mb-6`, `rounded-2xl bg-white/[0.05] px-6 pt-8 pb-3`, `h-[calc(100%-180px)]`):
   - Tab content area (flex-1, scrollable)
   - Icon strip at bottom (5 tab icons)
   - Privacy line: "THIS STAYS BETWEEN YOU AND YOUR PHONE" `text-[9px] tracking-[0.15em] uppercase text-white/20`
3. Privacy line is inside the gray box, below the icons.

**Tabs (5 icons at bottom of gray box):**
| Key | Icon | Implemented |
|---|---|---|
| mic | Mic | Yes — full content |
| book | BookOpen | Yes — full content |
| link | Link2 | Stub: "nothing saved here yet" |
| photo | Images | Stub: "nothing saved here yet" |
| calendar | Calendar | Stub: "nothing saved here yet" |

**Mic tab content:**
- "Think out loud" header + subtext
- Breathing microphone button (`w-[68px] h-[68px]`, violet gradient, `Mic size={28}`). Tapping toggles `isListening`. When listening, ring pulses outward (scale 1→1.3, opacity 0.5→0, 2s loop infinite).
- "OR TRY..." section with 5 example prompts:
  - "Search our conversation for birthday gift ideas"
  - "I want to tell her something but I'm nervous"
  - "Help me remember her favorite restaurant in Mexico City"
  - "I don't know what to say back"
  - "Remind me what we've enjoyed talking about in the past"
- Relationship observation paragraph (from `observations` dict, personId-keyed)
- Link to book tab: "More past conversation summaries... here" (button → `setActiveTab('book')`)

**Book tab content:**
Sections (each with all-caps label + content):
- HOW YOU MET — paragraph text
- LIKES — bulleted list
- DISLIKES — bulleted list
- SHARED CONTEXT — bulleted list
- PEOPLE — bulleted list (people in their orbit)
- NOTES — bulleted list

All data is hardcoded for persons 1–12 (matching ConnectScreen IDs).

**Interactive elements from ConversationScreen:**
- Tapping person avatar in ConversationScreen header → `/about/:personId`
- Tapping sparkles icon in ConversationScreen header → `/about/:personId`

**What is NOT on this screen:**
- No status bar
- Link/photo/calendar tabs are stubs
- No actual conversation search
- Mic button doesn't connect to any real flow

---

### NotificationsScreen

**Route:** `/notifications`

**Background:**
- Base: `#0a0a0a`
- Gradient: `bg-gradient-to-b from-zinc-900/30 via-transparent to-transparent`

**Status bar:** AndroidStatusBar

**Layout:**
1. Header (`px-6 pt-14 pb-4`): ArrowLeft → `/sessions`. Title "Notifications" (`text-2xl font-light text-white/95`, Outfit). "Clear all" button right (`text-xs text-white/50`).
2. Scrollable list (`h-[calc(100%-120px)]`, `px-6 pb-8`):
   - "TODAY" section header (`text-[10px] tracking-[0.15em] uppercase text-white/30`)
   - 4 today notification cards
   - "EARLIER" section header
   - 2 earlier notification cards

**Notification cards:** `p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]`. Each card:
- Header row: app icon (Lucide) + app name (all-caps, `text-[10px] tracking-[0.12em]`) + timestamp right
- Primary notification text (`text-[15px] text-white/70`)
- Secondary items (indented, `text-xs text-white/50`)
- Optional "+ N more" count

**Today notifications (exact content):**
1. INSTAGRAM — 15 min — "Sarah and 12 others liked your post" / "@surflinechronicles started following you" / "New message request from @clay_studio_sf" / +5 more
2. TWITTER/X — 45 min — "Vitalik Buterin and 3 others liked your reply" / "@patio11 replied to your thread" / "2 new followers" / +8 more
3. YOUTUBE — 1 hour — "Kelly Slater Official uploaded: 'Pipeline, final heat'" / "3 channels you follow posted this week"
4. SUBSTACK — 2 hours — "New post from Robin Sloan: 'An app can be a home-cooked meal'" / "2 writers you follow published this week"

**Earlier notifications:**
5. REDDIT — yesterday — "Your post in r/surfing got 47 upvotes" / "3 replies to your comment in r/ceramics"
6. INSTAGRAM — yesterday — "Jamie and 6 others liked your story" / "New comment on your post from @seaglass_studio"

**Interactive elements:**
- Back arrow → `/sessions`
- "Clear all" button: no `onClick`
- Notification cards: no `onClick` — static display

**What is NOT on this screen:**
- No navigation from tapping a notification
- Clear all is non-functional

---

### ConversationScreen

**Route:** `/conversation/:personId`

**Background:** `#0a0a0a`

**Status bar:** AndroidStatusBar

**Layout:**
1. Header (`px-4 pt-14 pb-3`, `border-b border-white/[0.08]`): ArrowLeft → `/connect`. Person avatar + name (tappable → `/about/:personId`). Right: Sparkles icon → `/about/:personId`, Phone icon, Video icon, MoreVertical icon. (Phone, Video, MoreVertical have no `onClick`.)
2. Messages area (`h-[calc(100%-160px)]`, scrollable, `px-4 py-4`)
3. Compose bar (absolute bottom, `border-t border-white/[0.08]`, `bg: rgba(10,10,10,0.95) backdrop-blur(20px)`): text input + send button (`bg-[#0A84FF] rounded-full`, send arrow icon SVG)

**Message bubbles:**
- From contact: `bg-white/[0.08] text-white/90 rounded-bl-md`, left-aligned
- From user: `bg-[#0A84FF] text-white rounded-br-md`, right-aligned
- Both: `px-4 py-2.5 rounded-2xl`, `text-[15px]`, DM Sans
- Timestamp below each bubble: `text-[11px] text-white/30`

**Available conversations (personIds 1–5 have data; 6–12 return "Conversation not found"):**
- 1 (Sarah): 8 messages — book club and coffee meetup
- 2 (Marcus): 8 messages — tech advice, React state libs
- 3 (Mom): 7 messages — presentation, soup recipe
- 4 (Dev Group): 7 messages — study session logistics
- 5 (Jamie): 7 messages — surf trip, reel sent

**Motion:** Each message: `initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}`, staggered `delay: index * 0.05`.

**What is NOT on this screen:**
- Compose field is non-functional (no submit handler)
- Phone/Video/Menu buttons non-functional
- No attachment, emoji, or voice message options
- Conversations for persons 6–12 (Alex, Jordan, Taylor, Sam, Dana, Riley, Chris) return "Conversation not found"

---

## Mode → contents summary table

| Lock-screen direction | Mode name | Route | Content/apps |
|---|---|---|---|
| Swipe UP | Discover | `/sessions` | Scroll apps: Instagram, X, YouTube, Reddit, Substack (default 5 active); user can add Facebook, Threads, Pinterest, Snapchat, Discord, Bluesky, TikTok. Per-app style settings. Entry to Notifications. |
| Swipe DOWN | Ask | `/ask` | Argos voice assistant interface. 3 hardcoded memory snippets. Waveform. No apps. |
| Swipe LEFT | Connect | `/connect` | Unified messaging inbox: SMS, Signal, WhatsApp, iMessage, Messenger, Instagram DM, Telegram, Substack. 12 contacts. No photos, no feed. |
| Swipe RIGHT | Home | `/home` | Full app grid: Gmail, Calendar, Maps, Weather, Photos, Spotify, Keep, Uber, Venmo, Instagram, YouTube, WhatsApp, Signal, Slack, Chase, Airbnb, Discover. Dock: Phone, Messages, Chrome, Camera. |

---

## Inconsistencies and dead ends

1. **ThinkOutLoudScreen is routed but unreachable.** Route `/think-out-loud/:person` exists in `App.tsx` but no other screen navigates to it. The AboutPersonScreen mic tab has a microphone button that toggles `isListening` locally — it does not navigate to ThinkOutLoudScreen. The only way to reach it is direct URL entry.

2. **Conversations 6–12 are dead.** ConnectScreen navigates to `/conversation/:id` for all 12 contacts, but `ConversationScreen` only has data for persons 1–5. Tapping Alex, Jordan, Taylor, Sam, Dana, Riley, or Chris shows "Conversation not found."

3. **AboutPersonScreen has no status bar.** Inconsistent with every other screen — possibly intentional to feel more like a private/quiet space, but possibly an oversight.

4. **ThinkOutLoudScreen also has no status bar.** Same as above.

5. **Most app tiles on HomeScreen are non-functional.** Only the "Discover" tile navigates; all others have no `onClick`. In a real launcher these would open apps.

6. **SessionAppScreen: 7 of 12 apps show an empty feed.** Facebook, Threads, Pinterest, Snapchat, Discord, Bluesky, TikTok all go through the generic render path but `FeedCard` returns `null` for them. They render a header and "End of feed" only.

7. **Notification cards are non-interactive.** They look tappable (hover state in CSS) but no `onClick` is wired.

8. **Clear all, Camera, Flashlight, MessageSquarePlus FAB**: buttons rendered, no handlers.

9. **Time is hardcoded to "11:11"** on LockScreen, HomeScreen, and AndroidStatusBar. The date on LockScreen is dynamic (real `Date` object), but the clock never changes.

10. **The `figma/` subdirectory** exists inside `components/` but was not read — its contents are unknown and may contain additional components not routed through `App.tsx`.

---

## Things that could not be determined from code alone

- **The `mockFeeds` data** (`src/app/data/mockFeeds.ts`) was not read. The exact feed content for Instagram, X, YouTube, Reddit, and Substack is unknown beyond the card layout components described above.
- **The `figma/` components directory** inside `components/` — unknown whether these are additional screens or design tokens.
- **Visual rendering of mode effects** — particularly `feed-blur` at max progress (`blur(0.94px)`) is extremely subtle. The real perceptual effect in-browser is unknown without running it.
- **The `dist/` build** may differ from `src/` if it was built at a different point in time.
- **Font rendering** on mobile vs. desktop — Outfit and DM Sans are loaded from Google Fonts; actual weight/optical-size rendering depends on browser.
