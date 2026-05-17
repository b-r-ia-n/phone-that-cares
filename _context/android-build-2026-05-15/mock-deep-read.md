# Phone That Cares — Mock Deep Read
## For Android v1 Build, 2026-05-15

This document is a thorough read of the ArgOS.Mock.Sessions 2026-04-15 codebase and the broader Phone That Cares writing corpus. It's written for another Claude instance building the actual Android implementation. Objective: precise UX behavior, edge cases, data models, and design intent baked into the code.

---

## 1. Lock Screen: Interaction Model & Authentication

### The Intent (Clarified)
Thumbprint authenticates mid-screen. The four directional gestures are **only accessible post-auth**. The lock screen is thus a two-state surface: unauthenticated (time, weather, notifications visible; circle is present but inactive) → authenticated (circle becomes interactive, swipe-to-navigate becomes active).

### Current Code Analysis

**File:** `LockScreen.tsx:1–335`

#### Pre-Authentication State (What's Always Visible)
- Time in 5.5rem light font, animates in
- Date and weather (68°) in xs tracking, animates in at +0.2s delay
- Two notification cards (Messages: "Sarah: Hey!", Slack: "2 new messages #general") animate in with staggered delays
- Camera and flashlight buttons in bottom corners, opacity 0.55
- **No interactive circle at this stage** in the current mock (but the mock's intent is that the circle exists, simply inactive)

#### Post-Authentication State (Interactive Circle Activation)
The code doesn't explicitly distinguish these states — the entire component renders as a single surface. **For Android:** must implement a state toggle (authenticated: boolean). Once true:

**Interactive Circle Behavior** (lines 220–292):
- Central draggable puck (6×6px, white/20 opacity) at center of 160px circle (80px radius)
- Drag constrains motion to circle radius: `constrainedDistance = Math.min(distance, CIRCLE_RADIUS)`
- Four directional indicators (icons) appear around circle: Sprout (up), Mic (down), Heart (left), Grid (right)
- These icons fade to opacity 0.75 when inactive, 1.0 when their direction is active

**Drag Detection Logic** (lines 30–87):
- `handleStart`: captures clientX/clientY, stores as center
- `handleMove`: continuously calculates angle and distance; determines direction via: `Math.abs(y) > Math.abs(x)` → vertical (up/down), else horizontal (left/right)
- Direction set to 'up' if `y < 0`, 'down' if `y > 0`, 'left' if `x < 0`, 'right' if `x > 0`
- **THRESHOLD = 60px** — navigation only triggers if distance > 60 at release

**Visual Feedback During Drag** (lines 91–123):
- Circle border color transitions from IDLE_RING_COLOR (rgba(255,255,255,0.09)) to directional color
- **Color starts at 1/3 radius** (26px, since 80 × 0.33): no color until threshold met
- Gradual color progress from 1/3 to 85% of radius (68px), opacity ramps from 0.025 to 0.175
- Colors:
  - Up (Discover): rgb(245,197,99) – warm gold
  - Down (Ask): rgb(177,156,217) – soft purple
  - Left (Connect): rgb(134,239,172) – soft green
  - Right (Home): rgb(125,211,252) – soft blue
- Edge brightness effect: if distance >= 68px (COLOR_MAX_THRESHOLD), scale filter to 1.5x brightness

**Direction Label** (lines 294–310):
- AnimatePresence shows text label at bottom when activeDirection exists
- Text: "Discover", "Ask", "Connect", or "Home"

**Navigation Routes** (lines 68–81):
- Up → `/sessions` (Discover)
- Down → `/ask` (Ask)
- Left → `/connect` (Connect)
- Right → `/home` (Home)

### Key Implementation Notes for Android

1. **Pre-auth visual:** The circle should exist (shown at reduced opacity or grayed out) but `onPointerDown` should no-op if not authenticated.
2. **Biometric flow:** Integrate Android's BiometricPrompt API. On success, set authenticated = true, unlock circle interactivity.
3. **Haptic feedback:** Consider light haptic on direction lock-in (y/x threshold cross) and stronger haptic on threshold cross (60px).
4. **Constrained dragging:** The math is clean; port as-is.
5. **Edge case — drag outside circle:** Currently clamped via `constrainedDistance = Math.min()`. Behavior is correct: user can't "overshoot" the circle.
6. **Edge case — lift finger mid-drag:** `handleEnd` fires; if distance < 60, resets circle and state (lines 83–86). Correct.

---

## 2. Each Direction's Destination & Entry State

### Up → Discover (/sessions)

**File:** `SessionsScreen.tsx:1–179`

#### Visual Layout
- Header: back arrow (→ /), "Discover" title, two buttons (bell icon → /notifications, "Styles" button → /sessions/treatments)
- Main container: rounded gray box (bg-white/5) containing grid of app tiles
- Apps shown in 3-column grid with 3×3 gap spacing (lines 74)
- "Add app" tile with dashed border + Plus icon (if inactive apps exist)
- Bottom sheet for adding apps (modal overlay + slide-in)

#### Data Model — App Tiles
**Source:** `SessionsScreen.tsx:75–84` queries sessions store + `scrollApps.ts`

Each active app shows:
- **Icon + app name** — colored square with app icon (color per app config)
- **Progress bar** — if mode !== 'off' && progress > 0, shows filled bar proportional to timeSpentTodayMs / dailyRampMinutes
- **Time spent badge** — if timeSpent > 0, shows e.g., "12m 30s / 30m"
- **Filter applied** — if grayscale/feed-blur mode active, icon itself shows filter effect (via getModeFilter)

#### Entry Behavior
User swipes up from lock screen → navigate('/sessions') → SessionsScreen mounts. Initial state:
- activeAppIds loaded from store (default: instagram, x, youtube, reddit, substack per scrollApps.ts:139)
- Grid animates in with staggered delays (delay: 0.15 + index × 0.05)
- "Add app" tile visible if inactiveApps.length > 0
- Notifications bell button is live; clicking navigates to /notifications

#### Key Store References
- `useSessionsStore((s) => s.sessions)` — Record<appId, AppSessionState>
- `useSessionsStore((s) => s.activeAppIds)` — string[]
- `getProgress(session)` — returns Math.max(0, Math.min(1, timeSpentTodayMs / rampMs))

---

### Down → Ask (/ask)

**File:** `AskScreen.tsx:1–179`

#### Visual Layout
- Back arrow (top-left)
- Memory snippets (3 items): "yesterday: you asked me to remind you about the dentist", etc.
- "See past chats" link below snippets
- Waveform indicator — 5 bars, animated height, violet gradient (violet-400 to violet-300)
- Prompt text: "What do you want to do?"
- Subtitle: "You can ask me to text someone, set a reminder, look something up, or just think through something with you."
- Listening indicator: pulsing dot + "Listening..." text
- "or type instead" link at bottom

#### Voice Behavior
- `isListening` state initialized to true (line 15)
- Waveform bars update every 200ms (line 20, slowed 50% from original) with random heights 0.4–1.0
- Listening indicator pulses scale and opacity infinitely while isListening = true
- **No voice OUT in final build** — this is input-only. The mock shows input setup; output happens in a follow-up conversation surface (not visible here)

#### Memory Snippets Data
**Source:** `AskScreen.tsx:7–11` (hardcoded for mock):
```
- "yesterday: you asked me to remind you about the dentist"
- "this morning: drafted a reply to Caroline"
- "tonight: the sky should be clear enough to see saturn"
```
Each is a tappable button (intent placeholder). Real implementation: fetch from Argos context store.

#### Entry Behavior
User swipes down from lock screen → navigate('/ask') → AskScreen mounts. Initial state:
- isListening = true, waveform animates immediately
- All sections animate in with staggered delays (0.2s, then +0.1s per snippet, then +0.2s for waveform, etc.)
- No keyboard visible by default; tap "or type instead" to surface text input (not implemented in mock)

#### Key Implementation Notes for Android
1. **Microphone access:** Real implementation needs Android microphone permissions + actual audio capture (Mock just simulates waveform).
2. **Waveform sync:** Waveform bars should reflect actual audio amplitude if real mic is active. The animation interval (200ms) feels right for visual feedback without overwhelming CPU.
3. **Memory context:** Currently hardcoded; should query Argos agent context or local conversation history.
4. **No voice output UI:** The mock doesn't show where AI responses appear. Likely: below waveform, after listening stops, as text. No speaker/voice icon visible in this mock.

---

### Left → Connect (/connect)

**File:** `ConnectScreen.tsx:1–265`

#### Visual Layout
- Header: back arrow, "Connect" title, search icon, profile avatar button
- Scrollable message list — 12 mock conversations with multi-platform support
- Floating action button (bottom-right): MessageSquarePlus icon

#### Message List Structure
Each message row spans full width with two distinct zones:
- **Left zone (16px × 16px, fixed width):** person's avatar (image or emoji) + platform badge (small icon)
- **Divider:** 1px vertical line separating left from right
- **Right zone (flex):** name, platform label, time, preview text

Example (lines 28–37):
```
{
  id: '1',
  name: 'Sarah',
  avatar: '👩‍🎨',
  imageUrl: 'https://...',
  platform: 'sms',
  preview: 'Did you see the photos from last weekend?',
  timeSince: '2 min',
}
```

#### Platform Config
**Source:** `ConnectScreen.tsx:132–141`

Platforms supported: sms, imessage, whatsapp, messenger, signal, instagram, telegram, substack. Each has:
- Icon (from react-icons/si)
- Color (e.g., #25D366 for WhatsApp)
- Label (e.g., "Messages")

#### Navigation
- Clicking left zone (avatar) → navigate(`/about/${message.id}`)
- Clicking right zone (message content) → navigate(`/conversation/${message.id}`)
- FAB (message+ button) — no navigation implemented in mock

#### Entry Behavior
User swipes left from lock screen → navigate('/connect') → ConnectScreen mounts. Initial state:
- 12 mock conversations loaded (alphabetically by platform, then by timeSince descending)
- Each message animates in with staggered delay (delay: index × 0.03)
- List is scrollable, hides scrollbar

#### Design Intent
"Unified inbox" — all platforms in one surface. No tab-switching, no per-app filtering. The unified view respects the fracturing of human connection across platforms and presents them as one conversation layer.

---

### Right → Home (/home)

**File:** `HomeScreen.tsx:1–143`

#### Visual Layout
- Header: back arrow, time display (11:11)
- 4×4 grid of app icons (16 apps + Discover shortcut)
- Dock at bottom (4 apps fixed): Phone, Messages, Chrome, Camera
- Apps included: Gmail, Calendar, Maps, Weather, Photos, Spotify, Keep, Uber, Venmo, Instagram, YouTube, WhatsApp, Signal, Slack, Chase, Airbnb, Discover

#### App Grid Details
**Source:** `HomeScreen.tsx:24–46` (apps array)

Each app object:
- id (number or 'discover')
- name (string)
- icon (React Icon component)
- color (hex)
- route (optional, e.g., '/sessions' for Discover)

Grid (line 88): `grid grid-cols-4 gap-6`

Each app tile:
- Colored square (app.color background), 16×16 rounded-2xl
- Icon inside (30px size)
- App name below (11px, text-white/70)
- Hover effect: scale-105 transition

#### Dock (lines 115–139)
- Always-visible bar at bottom (50px from bottom, z-20)
- Glass morphism: bg-white/10, backdrop-blur-xl, rounded-3xl, border-white/20
- Four icons in a row: Phone, Messages, Chrome, Camera
- Each 14×14 rounded-2xl with app color

#### Entry Behavior
User swipes right from lock screen → navigate('/home') → HomeScreen mounts. Initial state:
- Grid animates in with staggered delays (delay: index × 0.03)
- Dock animates in at delay 0.4
- Back button is live; tapping navigates back to lock screen

#### Design Intent
This is a standard Android home screen reimplementation. No special logic beyond layout. The fact that "Discover" is included in the app grid (with a route) is notable — it's positioned as just another accessible surface, not primary.

---

## 3. Sessions / Treatments: Daily Budget & Grayscale Ramp

### The Data Model

**File:** `sessionsStore.ts:1–186`

#### AppSessionState Interface (line 6–11)
```typescript
export interface AppSessionState {
  mode: ModeId;                    // e.g., 'grayscale', 'off'
  dailyRampMinutes: number;        // e.g., 30 (target minutes to full effect)
  timeSpentTodayMs: number;        // elapsed time in current day
  dayKey: string;                  // YYYY-MM-DD format
}
```

#### Daily Reset Logic (todayKey function, line 26–31)
```typescript
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}
```
Each day (24-hour UTC reset) gets a new dayKey. If session.dayKey !== todayKey(), the session is considered "new day" and timeSpentTodayMs resets.

#### Per-App Configuration (DEMO_PRESETS, line 33–37)
```typescript
const DEMO_PRESETS: Record<string, number> = {
  instagram: 30 * 60 * 1000,       // 30 min pre-populated for demo
  x: 5 * 60 * 1000,               // 5 min pre-populated
  youtube: 5 * 60 * 1000,          // 5 min pre-populated
};
```
These are mock seed values for the demo. In production, initialize to 0.

#### Initial Sessions Setup (initialSessions, line 39–50)
For each app in allScrollApps:
- Set mode to app.defaultMode (e.g., Instagram → 'grayscale')
- Set dailyRampMinutes to app.defaultRampMinutes (e.g., Instagram → 30)
- Set timeSpentTodayMs to DEMO_PRESETS[appId] ?? 0
- Set dayKey to todayKey()

### Store Actions

**tick(appId, deltaMs)** (line 57–79)
- Called by useSessionTimer every 250ms with elapsed wall-clock time
- On tick: check if dayKey matches today; if not, reset timeSpentTodayMs to DEMO_PRESETS and update dayKey
- Add deltaMs to timeSpentTodayMs
- Guards: rejects if appId not in sessions; rejects if deltaMs > 10s (treats as bogus)

**setMode(appId, mode)** (line 80–90)
- Swaps mode for an app (e.g., 'grayscale' → 'off')
- Called from AppTreatmentDetailScreen mode picker

**setDailyRamp(appId, minutes)** (line 91–101)
- Sets dailyRampMinutes (0–90 range, stepped by 5)
- Called from AppTreatmentDetailScreen ramp slider

**resetDay(appId)** (line 102–116)
- Manually reset a day's timer (testing, or user action)
- Sets timeSpentTodayMs = 0, dayKey = todayKey()

**rehydrateDay()** (line 155–173)
- Called on app boot; checks all sessions against today's dayKey
- If any session's dayKey is stale, updates it and resets timeSpentTodayMs

### Progress Calculation

**getProgress(session)** (line 181–185)
```typescript
export function getProgress(session: AppSessionState): number {
  const rampMs = session.dailyRampMinutes * 60 * 1000;
  if (rampMs <= 0) return 0;
  return Math.max(0, Math.min(1, session.timeSpentTodayMs / rampMs));
}
```
Maps timeSpentTodayMs to [0, 1] range where 1 = rampMs reached. Used for:
- Progress bar fill width
- Grayscale filter intensity
- Feed blur amount
- Break card frequency

### Timer Implementation

**File:** `useSessionTimer.ts:1–40`

```typescript
export function useSessionTimer(appId: string | undefined) {
  const tick = useSessionsStore((s) => s.tick);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!appId) return;
    lastRef.current = Date.now();

    const interval = window.setInterval(() => {
      if (document.hidden) {
        lastRef.current = Date.now();
        return;                        // Tab hidden, don't accumulate
      }
      const now = Date.now();
      const delta = now - (lastRef.current ?? now);
      lastRef.current = now;
      if (delta > 0 && delta < 10_000) {  // Guard: 0–10s
        tick(appId, delta);
      }
    }, 250);                           // Fire every 250ms

    const onVis = () => {
      lastRef.current = Date.now();   // Reset on tab return
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [appId, tick]);
}
```

#### Key Behaviors
1. **Tab visibility:** When tab is hidden (user switches apps), doesn't accumulate time. On visibility change, resets lastRef to prevent a burst of accumulated delta.
2. **Polling interval:** 250ms. Accurate enough for UX feedback without overwhelming the browser.
3. **Delta guard:** Rejects deltas > 10s (assumes user was gone, switched tabs, etc.)
4. **Mounted only during app view:** useSessionTimer is called in SessionAppScreen (line 93) when viewing a scrolling-feed app. Mounted on entry, unmounted on exit.

### Accessing Configurations

**SessionsScreen.tsx:**
- Queries session via `useSessionsStore((s) => s.sessions[app.id])`
- Computes progress via `getProgress(session)`
- Displays time via `formatMinutes(session.timeSpentTodayMs)`
- Shows ramp target via `session.dailyRampMinutes` + "m"

**AppTreatmentDetailScreen.tsx (lines 10–206):**
- Allows per-app mode selection via buttons (lines 144–181)
- Slider for dailyRampMinutes (lines 117–126), min 0, max 90, step 5
- Shows current progress bar (lines 84–92)
- Calls `setMode` and `setDailyRamp` actions on change

#### Edge Case — New Apps
When user adds a new app via "Add app" button (SessionsScreen line 150):
- `addApp(appId)` action fires (sessionsStore:132–150)
- If appId not already in sessions, creates new session with:
  - mode = app.defaultMode
  - dailyRampMinutes = app.defaultRampMinutes
  - timeSpentTodayMs = 0
  - dayKey = todayKey()

---

## 4. Grayscale Ramp Specifics

**File:** `modes.ts:1–124`

### getModeFilter Function (line 75–85)
```typescript
export function getModeFilter(mode: ModeId, progress: number): CSSProperties {
  const p = Math.max(0, Math.min(1, progress));
  switch (mode) {
    case 'grayscale':
      return { filter: `grayscale(${p * 100}%)` };
    case 'feed-blur':
      return { filter: `blur(${p * 0.94}px)` };
    default:
      return {};
  }
}
```

**Grayscale specifics:**
- At progress = 0 → grayscale(0%) — full color
- At progress = 0.5 → grayscale(50%) — halfway desaturated
- At progress = 1.0 → grayscale(100%) — fully desaturated

This is **linear**, not stepped. The CSS filter applies to the entire scrolling feed view.

### Application in SessionAppScreen (lines 103–107)
```typescript
const progress = getProgress(session);
const mode = session.mode;
const filterStyle = getModeFilter(mode, progress);
```
Then passed to feed container (line 419–421):
```jsx
<div className="flex-1 overflow-y-auto scrollbar-hide" style={filterStyle}>
```

### Default Values for New Apps
**From scrollApps.ts:**
```typescript
{
  id: 'instagram',
  name: 'Instagram',
  icon: SiInstagram,
  color: '#E4405F',
  availableModes: ['grayscale', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
  defaultMode: 'grayscale',           // ← START HERE
  defaultRampMinutes: 30,             // ← TIME TO FULL EFFECT
}
```

Instagram: grayscale enabled by default, 30-minute ramp.
X: tweet-spacing enabled by default, 15-minute ramp.
YouTube, Reddit, Substack, Facebook, etc.: defaultMode 'off', but if user enables, ramp is their choice.

### Global Default
There is no explicit "global default" — each app has its own defaults in scrollApps.ts. If a user adds an app, it inherits that app's defaults.

---

## 5. Ask Precise Behavior

**File:** `AskScreen.tsx:1–179`

### Voice Input Only, No Output
The mock shows **input setup only**:
- Microphone icon + pulsing listening indicator
- Waveform bars animated
- "Listening..." text

**No output screen is included in this mock.** The expected flow:
1. User swipes down → AskScreen
2. User speaks or taps to send text
3. Argos processes request
4. Response appears... where? (Below waveform? On a separate conversation screen? Not visible in this mock.)

### Screen Output Components
- **Memory snippets** (top): 3 hardcoded strings, each tappable (lines 7–11, 56–82)
  - "yesterday: you asked me to remind you about the dentist"
  - "this morning: drafted a reply to Caroline"
  - "tonight: the sky should be clear enough to see saturn"
  - "See past chats" link below (lines 71–82, navigation not implemented)

- **Waveform** (middle): 5 animated bars, heights 0.4–1.0, update every 200ms (lines 20–27, 85–107)
  - Violet gradient (violet-400 to violet-300)
  - Spring easing on height changes

- **Prompt text** (center): "What do you want to do?" + subtitle explaining capabilities (lines 116–127)

- **Listening indicator** (below prompt): pulsing dot + "Listening..." (lines 130–158)

- **Type option** (bottom): "or type instead" link (lines 162–174, not implemented)

### Memory Snippets Data
Currently hardcoded in AskScreen.tsx:7–11. In production:
- Should query Argos context API for recent memory/observations
- Should be dynamic (update as new observations are made)
- Tapping a snippet likely opens a past conversation or provides context to the current ask

### No Voice Output
The mock intentionally has no speaker/output indicator. The design assumes:
- User asks a question via voice or text
- Response comes back as text or mixed-media
- But the output UI is not shown in this mock

This is a noted gap in the brief: "Ask precise behavior. Brian clarified: voice IN only, no voice OUT. Screen output is fine."

---

## 6. Connect Precise Behavior

**File:** `ConnectScreen.tsx`, `ThinkOutLoudScreen.tsx`, `AboutPersonScreen.tsx`, `ConversationScreen.tsx`

### ConnectScreen — Unified Inbox

**File:** `ConnectScreen.tsx:1–265`

- **Unified platform view:** SMS, iMessage, WhatsApp, Messenger, Signal, Instagram, Telegram, Substack all in one scrollable list
- **No filtering, no tabs:** All messages sorted by timeSince (most recent first)
- **Per-message platform badge:** Each message row shows platform icon + label
- **Two navigation paths per message:**
  - Left zone (avatar) → /about/{personId} (person context page)
  - Right zone (text) → /conversation/{personId} (message thread)
- **FAB for new message** (bottom-right, not implemented)

#### Think Out Loud — Voice Reflection

**File:** `ThinkOutLoudScreen.tsx:1–197`

Accessed from two places:
1. From ConnectScreen, user can navigate to a person, then tap "Think Out Loud" (in AboutPersonScreen)
2. URL: /think-out-loud/:person (e.g., /think-out-loud/sarah)

**Screen layout:**
- Back arrow (→ /connect)
- Person name + emoji avatar (top center)
- Context line (e.g., "You last talked 2 days ago. You've messaged almost every week for years.")
- Breathing microphone (centered, pulsing circle around mic icon)
- Prompt (e.g., "Take your time. What's coming up with Sarah?")
- After 3s (hardcoded timeout, line 73), a "Want me to help you draft something?" link appears

**Voice input:** Microphone is listening. The mock simulates user speaking after 3 seconds (line 72–74); in production, integrate real audio capture.

**Output:** Not shown. Expected: draft suggestion or follow-up conversation below the prompt, after voice ends.

#### AboutPersonScreen — Relationship Repository

**File:** `AboutPersonScreen.tsx:1–660`

A "book" per person. Accessed via:
- ConversationScreen header → "Sparkles" button → /about/{personId}
- ConnectScreen message avatar click → /about/{personId}

**Tabs** (5 total):
1. **Mic (active by default):** Think Out Loud section + example prompts + relationship observation
2. **Book:** "You and [Person]" structured data:
   - HOW YOU MET
   - LIKES (bulleted)
   - DISLIKES (bulleted)
   - SHARED CONTEXT (bulleted)
   - PEOPLE (related contacts)
   - NOTES (misc info)
3. **Link, Photo, Calendar:** Placeholders ("nothing saved here yet")

**Data structure** (lines 8–387):
```typescript
const personData: Record<string, { name, avatar, imageUrl? }> = { /* ... */ }
const observations: Record<string, string> = { /* ... */ }
const bookContent: Record<string, BookContent> = { /* ... */ }
```

**Example (Sarah, id: '1'):**
- name: 'Sarah'
- observation: "You and Sarah usually talk every couple of days. You tend to send each other photos from trips. Your last few exchanges have been about the book club."
- bookContent.howYouMet: "Book club at the Elm Street library, spring 2019. You both hated the same novel that month."
- bookContent.likes: ["strong black coffee", "portuguese pastries", "long walks at dusk", "her rescue dog, Mira", "handwritten letters"]
- bookContent.people: ["Wren — her daughter, age 6, really into dinosaurs right now", ...]
- bookContent.notes: ["Allergic to shellfish", "Job hunting right now (product management)", "Usually free Thursday evenings", ...]

**Mic tab specifics:**
- Central "Think Out Loud" button (pulsing microphone, tap to toggle listening)
- Below: 5 example prompts (tappable, visual hint for what to ask)
- Below that: the observation + link to Book tab
- **Privacy footer:** "THIS STAYS BETWEEN YOU AND YOUR PHONE"

**Design intent:** This is a digital counterpart to a physical "relationship journal." It's never pushed into conversation; it's consulted optionally. The data is personal, local (stays on device).

#### ConversationScreen — Message Thread

**File:** `ConversationScreen.tsx:1–416`

Accessed via ConnectScreen message click → /conversation/{personId}

**Header:**
- Back arrow (→ /connect)
- Person name + avatar (tappable, goes to /about/{personId})
- Right side: Sparkles (→ about), Phone, Video, More menu

**Message list:**
- Scrollable thread, oldest at top
- User messages: right-aligned, blue (0A84FF) background, rounded except bottom-right
- Other messages: left-aligned, white/8 background, rounded except bottom-left
- Timestamps in white/30, 11px
- Staggered animation in (delay: index × 0.05)

**Compose field (bottom):**
- Text input, rounded-full, bg-white/8, placeholder "Text message"
- Send button (blue, arrow icon)

**Data (lines 13–269):**
5 conversations pre-populated (Sarah, Marcus, Mom, Dev Group, Jamie). Hardcoded for mock; in production, fetch from message store.

**Example (Sarah):**
```
Sarah (2 min): "Did you see the photos from last weekend?"
You (2:16 PM): "Yes! Just wrapped it up yesterday. It was incredible"
Sarah (2:17 PM): "I knew you'd love it! The ending was so good"
Sarah (2:17 PM): "Want to grab coffee this weekend and talk about it?"
You (2:19 PM): "That would be perfect. Saturday morning?"
[etc.]
```

**Design intent:** A clean, iMessage-like interface. One thing at a time: you're either in the inbox (ConnectScreen), looking at a person's profile (AboutPersonScreen), or in a conversation (ConversationScreen). No stacked overlays, no simultaneous feeds.

---

## 7. Discover Precise Behavior

**File:** `SessionsScreen.tsx`, `SessionAppScreen.tsx`, `mockFeeds.ts`, `scrollApps.ts`

### SessionsScreen — App Grid

**File:** `SessionsScreen.tsx:1–179`

Grid of active apps (3 columns), each tile shows:
- App icon + name
- Time spent today (if any) + ramp target
- Progress bar (if mode !== 'off')
- Icon filter effect if grayscale/feed-blur is active and progress > 0

**Add app button:** Opens bottom sheet with inactive apps list

Clicking an app tile → /sessions/app/{appId} (SessionAppScreen)

### SessionAppScreen — Feed View with Mode Filters

**File:** `SessionAppScreen.tsx:1–859`

Mounting this screen:
1. Calls `useSessionTimer(appId)` (line 93) — starts ticking timeSpentTodayMs every 250ms
2. Reads session from store, computes progress
3. Applies getModeFilter(mode, progress) to feed container
4. Renders feed based on mock data from mockFeedsByApp[appId]

**Special handling for Instagram (lines 133–259):**
- Instagram-specific header (logo, heart, send icons)
- Stories row (carousel of profile photos)
- Feed with Instagram card layout (header, image carousel, action buttons, likes, caption, comments)
- Bottom nav (home, search, post, reels, profile)
- Break cards (ASCII art + prompt) inserted based on breakFreq

**Special handling for X (lines 261–367):**
- X-specific header (X logo, settings)
- Tab bar ("For you" active, "Following" inactive)
- Feed with X card layout (avatar, author, handle, time, body, image, engagement metrics)
- Bottom nav (home, search, compose, notifications, messages)
- Break cards inserted based on breakFreq

**Generic handling (lines 369–457):**
- Back button, app icon + name, time display
- Progress bar (filled width = progress × 100%)
- Feed with generic card layout
- Break cards inserted

### Feed Rendering Logic (lines 113–124)
```typescript
const rendered = useMemo(() => {
  const out = [];
  let breakCount = 0;
  items.forEach((item, i) => {
    out.push({ kind: 'item', item, index: i });
    if (breakFreq > 0 && (i + 1) % breakFreq === 0) {
      out.push({ kind: 'break', id: `break-${i}`, artIndex: breakCount });
      breakCount++;
    }
  });
  return out;
}, [items, breakFreq]);
```

Break cards inserted every breakFreq items. For break-cards mode, breakFreq = 4 (modes.ts:103), so one break card every 4 posts.

### Mode-Specific Visual Changes

**1. Grayscale (modes.ts:78–79)**
- Filter applied to entire feed: `grayscale(progress * 100%)`
- Gradual desaturation as user spends time
- Icon on app tile also shows filter effect (SessionsScreen:195)

**2. Feed-blur (modes.ts:81)**
- Filter applied: `blur(progress * 0.94px)`
- At max progress: 0.94px blur (subtle)
- Applied to entire feed

**3. Tweet-spacing (modes.ts:91–95)**
- Extra gap inserted between posts: `extraGap = Math.round(progress * 72)`
- At 0% progress: 0px extra gap
- At 100% progress: 72px extra gap
- Applied via CSS gap property on feed container

**4. Break-cards (modes.ts:101–104)**
- breakFreq = 4 (always 4, not progress-dependent in current code)
- Break cards show ASCII art + prompt (lines 71–77)

**5. Font-cycling (modes.ts:109–112)**
- fontFreq = 12 (always 12)
- Items at indices divisible by fontFreq use Georgia serif; others use body font
- Applied per-item in render loop (SessionAppScreen:214–217)

**6. Passive-tracking (modes.ts:55–60)**
- No visual changes to feed
- Timer still increments
- User only sees progression in the time display + app tile progress bar

**7. Off (modes.ts:63–68)**
- mode = 'off', no filter applied
- No progress tracking visible
- Feeds look completely normal

### mockFeeds.ts Data Structure

**File:** `mockFeeds.ts:1–150+`

FeedItem interface (lines 6–21):
```typescript
export interface FeedItem {
  id: string;
  imageUrl?: string;
  imageUrls?: string[];    // For carousel
  isVideo?: boolean;
  title?: string;
  body?: string;
  author?: string;
  handle?: string;
  meta?: string;           // e.g., "2h ago · 1.2K likes"
  aspectRatio: 'square' | 'tall' | 'wide';
  song?: string;           // Instagram only
  likes?: number;
  commentCount?: number;
  comments?: FeedComment[];
}
```

Instagram feed (lines 26–150+):
- 10+ items per feed, each with image, handle, body, likes, comments, optional song
- Example: @mikethebaker post with sourdough bread photo, comments from @sourdough.sam and @jess.eats

Data is imported into SessionAppScreen as mockFeedsByApp[appId], then rendered based on app-specific card components (InstagramCard, XCard, YouTubeCard, RedditCard, SubstackCard).

### Accessing "For You Today"

The mock doesn't explicitly implement "For You Today" as a distinct surface. The approach:
- SessionsScreen shows active apps (a curated list pre-selected by the user)
- Each app's feed comes from mockFeedsByApp[appId]
- The feed isn't explicitly labeled "For You" — it's just the app's feed

In production:
- "For You Today" could be a separate surface within Discover (a tab or button)
- Or it could be personalized feed curation per user's interests + Argos recommendations

### scrollApps.ts — App Registry

**File:** `scrollApps.ts:1–144`

Defines all scrolling apps:
- instagram, x, youtube, reddit, substack, facebook, threads, pinterest, snapchat, discord, bluesky, tiktok

Each app object:
```typescript
{
  id: 'instagram',
  name: 'Instagram',
  icon: SiInstagram,
  color: '#E4405F',
  availableModes: ['grayscale', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
  defaultMode: 'grayscale',
  defaultRampMinutes: 30,
}
```

defaultActiveIds (line 139):
```typescript
export const defaultActiveIds = ['instagram', 'x', 'youtube', 'reddit', 'substack'];
```

Only these 5 appear in Discover by default. User can add more via "Add app" button.

---

## 8. Design Intent & Edge Cases

### Lock Screen Four-Direction Routing

The four directions encode a **spatial memory model:**
- **Up** = growth, looking ahead → Discover (apps, sessions, modes)
- **Down** = voice, asking inward → Ask (voice reflection)
- **Left** = connection, other people → Connect (unified inbox)
- **Right** = home, familiar → Home (standard app grid)

This is intentional mnemonic design. The routes should be stable across all Android implementations.

### Grayscale as "Quiet Feedback"

From state-of-project.md:
> "Over the course of your daily budget, color drains out of the feed. A quiet way to notice how long you've been here."

The grayscale is not punitive; it's observational. It's asking the user "hey, how long have you been scrolling?" without blocking or judging. The visual feedback is:
- First 10 min (assuming 30-min ramp): no change
- 10–20 min: grayscale creeps in (noticeable by 15 min)
- 20–30 min: full grayscale

This is a design choice: **linear interpolation, no threshold jumping**. The mock implements this correctly. In Android, use the same formula.

### Break Cards as "Soft Pauses"

From modes.ts:
> "Small pause cards appear more often as time passes. Quiet check-ins, nothing to do."

Break cards (break-cards mode):
- ASCII art: visual noise that's intentionally not a photo or text
- Prompt: "How are you doing?" or "Still here." or "Take a breath if you want."
- **No UI:** no buttons, no gamification, no "X" to dismiss
- Visual effect: large padding, centered, lets the user sit with the pause

The design is **non-interventionist.** A break card doesn't force anything; it just appears. User can scroll past it immediately if they want.

### The "Ramp" Not a "Limit"

dailyRampMinutes is **not a hard limit.** It's the time window over which the mode reaches full effect. User can:
- Spend 60 minutes on a 30-minute ramp → progress = 2.0, clamped to 1.0 (fully grayscale)
- Continue scrolling past the ramp; no forced exit, no "your time is up"

This is from the design philosophy: **integration, not restriction.** The phone is offering feedback, not blocking.

### Personal Relationship Data — Privacy

The book (AboutPersonScreen) stores relationship observations, preferences, shared context, notes. This data:
- **Stays local** (no sync in the mock, but likely device-encrypted in Android)
- **Is never proactive** (doesn't surface unless user explicitly navigates to /about/:personId)
- **Has a privacy footer** ("THIS STAYS BETWEEN YOU AND YOUR PHONE")

This is intentional. The goal is to support thoughtful connection, not surveillance of relationships.

### Memory Snippets in Ask

The three hardcoded snippets:
- "yesterday: you asked me to remind you about the dentist"
- "this morning: drafted a reply to Caroline"
- "tonight: the sky should be clear enough to see saturn"

These are examples of Argos observations — things the agent has remembered from past conversations or context. In production:
- Should be fetched from Argos context API
- Should update as new observations are made
- Should be tappable to jump to the original conversation

### Platform-Agnostic Connect

ConnectScreen unifies SMS, iMessage, WhatsApp, Signal, Instagram, Telegram, Substack. This is intentional: humans' relationships are fractal across platforms. The phone acknowledges this by presenting a **unified social layer**.

No app-specific UI beyond a badge; the interface is consistent across all platforms.

---

## 9. Potential Build Gaps & Sanity Checks

### Missing from the Mock (But Should Be in Android)

1. **Actual microphone input** — AskScreen has a simulated waveform, but no real audio capture or Argos integration. Android implementation will need:
   - BiometricPrompt for lock screen auth
   - MediaRecorder for audio capture on Ask screen
   - Real waveform analysis (or simulated)
   - Argos API integration for voice-to-text and response

2. **Conversation persistence** — ConversationScreen has mock data. Production needs:
   - Message database (local or synced)
   - Fetch message history on screen load
   - Real-time updates if new messages arrive
   - Platform-specific integrations (SMS content provider, Signal database, WhatsApp backup, etc.)

3. **App time tracking across real apps** — useSessionTimer.ts hooks into DOM visibility. Android equivalent:
   - ActivityLifecycleCallbacks to detect when apps are in foreground
   - UsageStatsManager to query actual time spent in each app
   - Or overlay-based tracking (if using Accessibility overlay approach)

4. **Relationship data sync** — About screen book is hardcoded. Production needs:
   - Sync mechanism with Argos agent for dynamic observations
   - Local database for relationship metadata
   - Edit UI for notes, preferences, etc.

5. **Notification integration** — Lock screen shows 2 mock notifications. Production needs:
   - Real notification listener
   - Platform-specific notification handling

6. **Home screen app integration** — HomeScreen.tsx is a mock grid. Production needs:
   - Hook into actual Android launcher API
   - Real shortcuts to installed apps
   - Dock behavior

7. **Scroll feed integration** — SessionAppScreen with Instagram/X feeds uses mock data. Production needs:
   - Overlay or accessibility injection into real apps
   - Fetch real feed data from Instagram/X APIs or scrape
   - Apply grayscale/blur/spacing filters to real UI trees

### Data Flow That Works in Mock But Needs Care in Android

**useSessionTimer** — Fires every 250ms, checks document.hidden. In Android:
- Replace document.hidden with Activity lifecycle callbacks
- Consider battery impact of 250ms polling (might want to batch/throttle)
- Handle app backgrounding, rotation, lock screen

**rehydrateDay on app boot** — The mock expects this to be called once on mount. In Android:
- Call this on each app launch (MainActivity.onCreate)
- Also call on midnight (AlarmManager or BroadcastReceiver)
- Handle time-zone changes

**Zustand persist middleware** — Mock uses `persist()` to localStorage. In Android:
- Use SharedPreferences or Room database
- Handle encryption for sensitive data (relationship observations)
- Implement sync if multi-device support is planned

### Design Consistency Across Platforms

From design-skill-2026-04-30.md:
- Warm off-white (#f6f3ec), soft near-black, Inter font with specific OpenType features
- Sub-200ms motion, custom focus rings
- "One piece of small magic per surface"

Android implementations should match these constraints. The lock screen circle color ramp, the waveform animation, the break card ASCII art — all of these are "small magic" and should translate 1:1 to Android.

### Potential Friction Points

1. **Platform fragmentation** — Grayscale ramp might not work uniformly across all Android apps. Some apps might override system colors or use custom renderers. Consider fallback strategies (accessibility overlay vs. display filter).

2. **User expectation mismatch** — Users accustomed to hard limits (e.g., Google Family Link) might not understand the "ramp" concept immediately. Consider onboarding.

3. **Thermal/battery impact** — Overlay-based grayscale filter + 250ms polling + real-time waveform animation could drain battery on older devices. Profile and optimize.

4. **Rooted device requirement** — The design assumes rooted Pixel (per state-of-project.md). This limits the user base. Consider whether Accessibility Service or AppOps overlay is viable as a fallback.

---

## Summary for Android Builder

### Core Surfaces (Priority Order)
1. **Lock screen** — Auth + directional routing (highest polish required)
2. **Discover** — App grid + SessionAppScreen with feed + modes (core value delivery)
3. **Connect** — Unified inbox + AboutPersonScreen (relationship layer)
4. **Ask** — Voice reflection (lowest complexity; depends on Argos integration)
5. **Home** — Launcher grid (standard Android work)

### Key Data Structures to Replicate
- **AppSessionState** — mode, dailyRampMinutes, timeSpentTodayMs, dayKey
- **FeedItem** — for mock feeds or real feed injection
- **PersonData** — for relationship repository (AboutPersonScreen)
- **ScrollApp** — registry of apps with modes and defaults

### Critical Implementation Details
- **Grayscale ramp:** Linear progress-to-filter-intensity mapping, no threshold jumping
- **Timer:** 250ms polling, respects tab/app visibility, guards against deltas > 10s
- **Daily reset:** `dayKey` format YYYY-MM-DD, resets at midnight UTC
- **Biometric auth:** Lock screen circle inactive until authenticated
- **Four-direction routing:** Up/Down/Left/Right must reach Discover/Ask/Connect/Home with sub-60px threshold

### Design Philosophy Anchors
- Integration over restriction: ramps, not limits; feedback, not blocking
- Warm restraint: soft colors, sub-200ms motion, one magic moment per surface
- Relational: unified inbox, relationship book, no platform fragmentation
- Private: all personal data stays local, no proactive surfacing

---

**Document complete. Written for immediate Android implementation. Any ambiguities, escalate to Brian.**
