# Handoff — "Made by Claude" shelf UI redesign (instance #2)

You own ONE thing: make the "Made by Claude" library shelf look great and
separate planning docs from made things. You are NOT building the nightly rig
(another instance has that) and NOT doing the artifact backfill (a third instance
has that). Stay in your lane so you don't collide with them.

## What already exists (shipped & live — don't rebuild)
- Shelf logic: `telegram-agent/share/claude-shelf.ts` — exports `renderClaudeShelf`
  / `renderClaudeShelfFromList` (the gallery page), `serveArtifact` (with strict
  CSP), `handleArtifactPush`, `handleClaudeShelf` (the routes dispatch).
- Wired in `routes.ts` (thin: `handleClaudeShelf(...)`) + a landing card in
  `library-shelves.ts`. Both already deployed.
- Push client: `telegram-agent/claudespace/push-artifact.py`.
- Data model: a lean JSON index `claude-artifacts-${cid}.json` (array of
  `ClaudeArtifact` = {id,title,slug,project,summary,date,thumb?}) + per-artifact
  `claude-artifact-${cid}-${id}.html` + optional `.png` thumb, in val.town blob.

## Source of truth & deploy (READ telegram-agent/REPO-STALE.md)
- Git is DEAD. Do not use git or `push.py`. Prod = the val.town val:
  - val id: `46072a84-476a-11f1-86f1-42b51c65c3df` (name `argos`)
  - live URL: `https://brian1--4ef325f8476a11f18e0742b51c65c3df.web.val.run`
- Deploy a file via API PUT:
  `PUT https://api.val.town/v2/vals/46072a84-476a-11f1-86f1-42b51c65c3df/files?path=claude-shelf.ts`
  header `Authorization: Bearer $VAL_TOWN_API_TOKEN` (from `~/.argos.env`),
  body `{"content": <file text>, "type": "script"}`.
- ⚠️ `routes.ts` is at val.town's hard **80,000-char cap** — keep ALL new logic in
  `claude-shelf.ts`. If you must touch routes.ts, keep it under 80000 chars
  (check `wc -m`) or the PUT 400s.

## The task
1. **Adopt the preferred UI.** Brian likes the look of
   `_context/from-claude-2026-06-17/gallery.html` ("Everything the instances made
   you") much more than the current plain card grid. Read it, and rework
   `renderClaudeShelfFromList` to match that aesthetic — keep it self-contained
   (inline CSS, no external deps beyond the Inter font it already pulls), PTC
   palette (`#f6f3ec`, accent `#8a5a2b`), token-gated view/thumb links, and the
   header/nav already present. Consider reusing "Everything the instances made
   you" as the page title/heading if it reads well.
2. **Separate build-notes from made things.** Morning build reports, build-plans,
   handoffs, and synthesis-planning docs should NOT clutter the main gallery.
   Give them their own tab / collapsed section / toggle, with *made things* (demos,
   tools, finished artifacts) foregrounded by default.
   - **Convention (shared with the backfill instance):** artifacts whose
     `project` field is **`build notes`** are the planning/report kind → render
     them in the separate tab/section. Everything else renders in the main
     gallery. Key your tab logic off `project === "build notes"`. Do not invent a
     new schema field unless `project` truly can't carry it (it can).
3. **Deploy** the updated `claude-shelf.ts` to the prod val via API PUT.
4. **Verify** (compute Brian's token = HMAC-SHA256 of CONFIG_SECRET over the
   string `8743487849`):
   - `GET {live}/library?id=8743487849&token=<tok>` → 200, made-by-claude card present
   - `GET {live}/library/made-by-claude?id=8743487849&token=<tok>` → 200, new UI,
     build-notes correctly segregated.

## Guardrails
Additive only: edit `claude-shelf.ts` and PUT it to prod. No deletes, no git, no
outward sends, nothing public. Don't touch the nightly-rig files or run the
backfill — those are other instances' jobs.

## When done
Append a short note to `_context/nightly-rig/BUILD-LOG.md` (or create it):
what you changed in the UI, that you deployed + verified, and the screenshot/URL
Brian can look at.
