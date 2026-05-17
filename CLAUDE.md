# Phone That Cares — Project Context

Brian's sabbatical project. Thesis: the display layer of your phone is the best intervention point for phone addiction — simple UI changes at the device level, beauty over harshness, integration over restriction. Live at aphonethatcares.com.

## Start here

`_context/state-of-project.md` — current state + Brian's voice. Read this before anything else.
`_context/task.md` — live current-session task state (overwrite each session, don't append).

## Folder map

- `_context/` — handoffs, state-of-project, writing corpus, dashboards
- `telegram-agent/` — Argos Telegram bot (val.town, TypeScript). Deploy via `claudespace/push.py`.
- `website/` — Astro site (aphonethatcares.com). Deploy: `npx vercel deploy --prod` from this folder.
- `chrome-extension/` — Scroll Lab grayscale prototype
- `os-mocks/` — speculative phone OS design work
- `words/` — Brian's writing and transcripts
- `visuals/` — design explorations

## Agent roles

Tell Claude "you're the [role] agent" — role specs live in `.claude/rules/`:

- `pm-agent` — project state, priorities, open threads
- `website-agent` — aphonethatcares.com, Astro/Vercel/Supabase
- `telegram-agent` — Argos bot, val.town deployment
- `android-agent` — Android fork research and build
- `design-agent` — UI/design system, DESIGN-SKILL.md
- `ptc-meta-agent` — workflow rig, agent definitions, cross-cutting conventions, zoom-out

## Available skills (use /skill-name to invoke)

- `/rauno-style` — PTC design aesthetic: warm restraint, sub-200ms motion, `#f6f3ec`, Inter tnum. Use for any UI work on this project.
- `/frontend-design` — production-grade web UI with strong aesthetic direction. Use when building pages, dashboards, components.
- `/canvas-design` — visual art / static design artifacts (posters, diagrams).
- `/webapp-testing` — Playwright testing for the website.
- `/claude-api` — Anthropic SDK work, prompt caching, model migrations.
- `/review` — code review before pushing.
- `/security-review` — security audit (run before wider Argos exposure).
- `/simplify` — clean up code quality and reduce debt.

## What this is NOT

Not a self-control app. Not a screen time tracker. Not a dumb phone. Integration, not restriction.
