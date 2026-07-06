# Build Log

## 2026-06-20 — Shelf UI redesign

**What changed:**
- Rewrote `renderClaudeShelfFromList` in `claude-shelf.ts` to match the gallery.html aesthetic ("Everything the instances made you")
- New look: wider max-width (1280px), sticky search bar, project filter chips, gallery-style cards with category + date footer
- Added tabbed UI: "made things" (default) vs "build notes" — tabs key off `project === "build notes"`
- Search filters across all visible cards
- Client-side JS for tab switching, search, and project chip filtering

**Deploy:** PUT to val.town prod, version 139. Both `/library` (200) and `/library/made-by-claude` (200) verified.

**Current state:** 15 made things, 0 build notes (backfill instance hasn't run yet).

---

## Brian's design feedback (2026-06-20) — library shelf prototypes

Notes from Brian on the May 13 shelf prototypes (exercise, food, journal, meditation). Capture for future build conversations.

### Movement shelf
- **Calendar as primary view**, not "kinds of movement." A month grid where each day shows what you did, color-coded by activity type. Expandable to 2-3 months, scrollable through past months. Click a day → detail view.
- Visual encoding TBD — prototyping 3 variants (dots, stripes, gradient) as static HTML.
- **Three data layers** the exercise page needs:
  1. **Exercise library** — accumulated exercises from PTs, body workers, climbing coaches. A persistent reference.
  2. **Current rotation** — "what are the 3 workouts I'm cycling through this week"
  3. **Activity log** — what actually happened (this is what the calendar shows)
- Primary use case: message Argos from the climbing gym — "I have X extra energy, here's what I'm thinking, what exercises make sense?"

### Per-shelf LLM context
- Each library page could be "tended by" an LLM with domain-specific context (3-8 weeks of that shelf's data + 2 weeks of general journals for life context).
- Brian's instinct: this probably lives on the library page itself, not as a separate export.
- Considered: export context as copyable .txt for paste-into-any-LLM, but felt finicky.
- The modular-context idea is worth a dedicated build conversation.

### Food shelf
- Body notes + entries together: strong. "When you eat" time diagram with frequency colors: good.

### Journal shelf
- "Lens that felt alive" and "questions you're sitting with": keep both.
- Wants ability to start an LLM conversation from a journal topic — could deep-link to Argos or build a chat UI on the page.

### Meditation shelf
- Per-shelf LLM context especially compelling here — pattern recognition across sits, connecting observations to life events.
