# Launcher build brief

For the agent building the Android emulator version of the Phone That Cares OS overnight. **Read this once** — it's the only thing you need on the launcher and four-mode entry surface. Destination screen contents are not in this doc; spawn a sub-instance to read them from the existing React mockup (path below).

## What you're building

The four-direction picker that sits between fingerprint unlock and the four mode home screens (Discover / Ask / Connect / Home). Per the android workstream synthesis (2026-05-15), this is the **first screen after unlock**, not a SystemUI lock-screen replacement.

## The principle (do not lose this)

The act of opening the phone externalizes a piece of the user's intention. They aren't just unlocking — they're declaring which of the four rooms they're entering. The gesture *is* the declaration.

## Visual register

The aesthetic for this surface is the **Rauno Freiberg / Linear / Vercel design-engineering register, applied with discipline**: type-led, monospace co-star, hairlines instead of glows, coordinate-target visuals, pure black canvas, white type at varying opacity. No mood-tinting, no warm cast, no near-black. The body of the screen uses Inter (sans) for headline content and JetBrains Mono (or IBM Plex Mono / SF Mono fallback) for all metadata, labels, and notifications. The status bar at the top stays standard Android chrome.

## Direction → mode mapping (do not change)

| Direction | Mode | Existing route |
|---|---|---|
| ↑ swipe | Discover | `/sessions` |
| → swipe | Home | `/home` |
| ↓ swipe | Ask | `/ask` |
| ← swipe | Connect | `/connect` |

Labels are arranged clockwise from the top edge. These match the existing Argos 2026 React mock — keep the mapping identical so user habit transfers.

## Lock-surface layout (top to bottom)

1. **Standard Android status bar** — Material 3 default. Time + 2 notification icons on the left; wifi / signal bars / battery percent / battery icon on the right. White at ~92% opacity. **Do not Rauno-ize the status bar.** It stays normal.

2. **Time block** — a hairline-framed monolith centered horizontally:
   - 1px white rule at 16% opacity (top of frame)
   - Time `11:11` in Inter Light, ~76sp, tabular numerics, white at 96% opacity, letter-spacing -0.04em, left-aligned within the 22dp padded block
   - Small line-art **partly-cloudy weather glyph** to the right of the time, at ~24sp (about 1/3 the time's cap-height), white at 55% opacity. Use a Lucide-style CloudSun outline at stroke-width 1.2. **The icon's bottom edge should sit on the time's text baseline** (which for digits without descenders is the digits' visual bottom). On the web this falls out of `align-items: baseline` on the flex row; in Compose the equivalent is `Alignment.LastBaseline` or aligning the icon's bottom to the time's `lastBaseline`. The icon should look like it's resting on the same invisible floor as the "11:11", not floating in the middle of the line.
   - 1px white rule (mid of frame)
   - Meta line `TUE 2026.05.16 — 68°F CLEAR — WAXING GIBBOUS` in JetBrains Mono, 9sp, letter-spacing 0.14em, white at 42% opacity. The astronomical detail (lunar phase) is a deliberate "more information than strictly required" — it's part of the instrument feel.
   - 1px white rule (bottom of frame)

3. **Notifications** in JetBrains Mono, 9sp, letter-spacing 0.04em:
   - `INBOX/01  SARAH · SMS · 2m`
   - `INBOX/02  SLACK · #GENERAL · 5m`
   - `INBOX/NN` index in white at 28% opacity; sender name (e.g. `SARAH`) at 78%; everything else at 58%.

4. **Compass** — four mode labels positioned around a central anchor:
   - `DISCOVER` at top edge of compass area
   - `HOME` at right edge
   - `ASK` at bottom edge
   - `CONNECT` at left edge
   - All in JetBrains Mono, 9sp, letter-spacing 0.20em, white at 40% opacity at rest
   - **No numeric prefixes.** Word alone.
   - Active mode tightens letter-spacing to 0.24em and goes to 100% white. This is the entire active state — no color change, no fill, no underline.

5. **Coordinate-target fingerprint anchor** at the center of the compass:
   - 32×32dp container, biometric sensor underneath
   - Visual: four corner brackets (5dp each leg), small crosshair with a 1dp filled center dot, all at stroke-width 1, white at 62% opacity at rest
   - On press: opacity goes to 100%, no other visual change
   - **No breathing animation** — Rauno register is precise, not gentle. The crosshair is still at rest.

6. **Utility glyphs in bottom corners**:
   - Flashlight icon at bottom-left (~32dp from corner)
   - Camera icon at bottom-right (~32dp from corner)
   - Both at 18sp, stroke-width 1.2, line-art (Lucide-style outlines), white at 42% opacity at rest, 85% on tap/hover
   - These trigger the standard Pixel flashlight/camera actions

## The gesture

1. Thumb lands on the coordinate-target anchor → biometric unlock runs in parallel
2. Anchor enters "engaged" state: crosshair to 100% opacity
3. From the anchor, user drags in one of four cardinal directions
4. Direction is classified once drag exceeds 4dp; one direction wins based on dominant axis
5. As drag progresses (eased by smoothstep over 0–70dp):
   - A single 0.6px white line draws from the anchor (at 0.85 opacity) toward the active direction; length proportional to eased drag progress, capped at ~95dp
   - Active mode label brightens (letter-spacing widens to 0.24em, opacity to 100%)
   - Destination cross-dissolves in beneath the lock
   - Lock content dims to ~50% opacity
6. On release past 70dp → commit: destination becomes opaque, lock fades to 0
7. On release under 70dp → snap back: line retracts to anchor, mode label resets, opacities return to rest

## Motion and timing

- Easing for dissolve and line growth: **smoothstep** (`t * t * (3 - 2 * t)`)
- Snap-back duration: ~300ms ease-out
- Commit transition: ~280ms ease-out
- No breath / pulse / ambient animation at rest. The screen sits still.

## Type and color

- Display sans: **Inter** with features `ss01 cv11 tnum` (Light/200 for time)
- Mono: **JetBrains Mono** preferred; **IBM Plex Mono** or **SF Mono** acceptable fallbacks
- Canvas: pure `#000` — not near-black, not warm-neutral
- All text in white at varying opacity: 0.20 (faintest meta), 0.42 (utility), 0.55 (icon), 0.62 (anchor), 0.78 (notification sender), 0.92 (active mode + status bar), 0.96 (time)
- No accent colors. Notification dots in the status bar are the only chroma on the surface.
- Tabular numerics on time, date, percent, durations

## Destination screen contents

**Do not build destinations from this doc.** Spawn a sub-instance and have it read:

```
phone-os/ArgOS.Mock.Sessions.2026.04.15/src/app/components/
  ├── SessionsScreen.tsx       — Discover surface (scroll-app treatment manager, 12 apps)
  ├── AskScreen.tsx
  ├── ConversationScreen.tsx
  ├── ThinkOutLoudScreen.tsx   — all three together comprise the Ask surface
  ├── ConnectScreen.tsx        — messaging across 8 platforms, 12 contacts
  ├── HomeScreen.tsx           — full app grid (17) + 4-app dock
  └── ...
```

A condensed reference also exists at `visuals/argos-2026-mockup-reference.md` with the exact app list, contact list, and routing. Read it if helpful.

**Important note on register for destinations**: the destination screens themselves can either (a) carry the same Rauno register forward, or (b) revert to their existing visual treatment from the React mock. The launcher locks into a register; the destinations may or may not. Make the call as you build — easier to ship (a) consistent and (b) is fine if the destinations need their own visual language. Flag to Brian which call you made.

## Hard constraints (from android-build synthesis 2026-05-15)

- **Path B-cut**: rooted Pixel 6 + Magisk + DenyList + Compose launcher
- Per-app grayscale via Accessibility service (Magisk SurfaceFlinger module as later polish)
- Picker is **post-unlock**, not a SystemUI replacement
- Banking explicitly out of scope for v1 (second phone)
- Full synthesis at `_context/android-build-2026-05-15/synthesis.html`

## Open dials (your call as you build)

The numbers in this doc are reasoned starting points, not laws. Calibrate against a real thumb on an emulator/device:

- **Commit threshold** (70dp) — easier-to-trigger if too forgiving feels wrong, harder if too easy
- **Letter-spacing delta** (0.20em → 0.24em on active) — visible enough or too subtle on a real screen
- **Line width** (0.6px) — may need to render at 1px on actual device pixels for clarity
- **Meta line content** — the WAXING GIBBOUS / clear / 68°F detail is exemplary, not normative. Pull real values from system data; keep the dash-separated mono format.

## What this doc deliberately does not specify

- Destination screen contents → read the React mock
- App-list-per-mode → read the React mock
- Status bar exact icon set → use Material 3 standard
- Notification stack interaction (tap to expand, swipe to dismiss) → use Material 3 standard
- Settings / configuration UI for the launcher → out of v1 scope

## Reference artifacts

- `visuals/launcher-mocks.html` — interactive HTML mock. **The "If Rauno designed this" section at the bottom is the spec.** The A/B/C/D variants and the "Refined" section above it are earlier explorations — superseded, ignore for build.
- `visuals/entry-models-study.html` — the candidate exploration that led here; read only if you want to understand *why* a four-direction launcher exists at all. Not necessary for the build.
- `_context/design-skill-2026-04-30.md` — visual register guide. Read once.

## Single-line summary

A coordinate-target anchor on a pure-black lock surface with a hairline-framed time, drag in any cardinal direction, a thin white line draws toward the active mode label and the room cross-dissolves up beneath. Commit at 70dp. Mono in the body, sans for the moment.
