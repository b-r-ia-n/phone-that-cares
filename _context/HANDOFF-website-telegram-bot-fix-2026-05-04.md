# Website fix needed — `/telegram-bot` page

*For an instance with full Website context, deploying via Vercel.*

---

## What needs to happen

The live page at **`aphonethatcares.com/telegram-bot`** is serving placeholder text from a previous deploy. Brian's friend (real Twitter following) is going to share `@argostherobot` publicly **today** — strangers will land on this page and need to see real bot info, not placeholders.

A working version of the page already exists at:
**`~/Desktop/PhoneThatCares/Website/src/pages/telegram-bot.astro`**

It's correct locally but not deployed. The fix is just: **deploy it.**

The live page currently shows:
- `Open Telegram, find @ARGOS_BOT_USERNAME, send anything` (placeholder)
- `Open @ARGOS_BOT_USERNAME in Telegram` (placeholder, in the CTA button)
- `[Remix the bot →](REMIX_LINK_HERE)` (placeholder, in step 02)

The local file already has these fixed:
- `BOT_USERNAME = '@argostherobot'` (line 4)
- `REMIX_LINK = 'https://www.val.town/x/brian1/Argos'` (line 5)
- All references in the body use `{BOT_USERNAME}` and `{REMIX_LINK}` interpolation
- Step 7's commands list updated (old version had `/remember` and `/facts` which don't exist anymore — current list reflects what argos actually has)

---

## Deploy path

The Website was using GitHub→Vercel auto-deploy at some point (`.vercel/project.json` exists with `prj_WJ9xN4ma8ia1Or50vhTxIDU94NmW`), but Brian noted: *"oh i think we're mostly not using github anymore."*

So GitHub-push doesn't trigger Vercel. The previous orchestrator instance pushed `ac2f831` to `origin/main` thinking it would auto-deploy — it didn't.

**Most likely current deploy mechanism**: `vercel --prod` from the Website directory, run manually.

```bash
cd ~/Desktop/PhoneThatCares/Website
vercel --prod          # may need: npm i -g vercel  first
```

Vercel CLI will pick up `.vercel/project.json`, build, and deploy. ~2 minutes. After deploy completes, `aphonethatcares.com/telegram-bot` should serve the new page.

Alternative if Brian prefers a different deploy: do whatever the current preferred path is.

---

## Important caveats

### Other in-progress local work — leave alone

`git status` shows a LOT of locally-modified and untracked files Brian has been working on:
- `BaseLayout.astro`, `index.astro`, `experiments.astro`, `vision.astro`, `thinking.astro` (modified)
- `Comments.jsx`, `EditMode.jsx`, `BrainstormPoll.jsx`, `WeeklyCallCard.jsx`, `AdminStickers.jsx`, `BrainstormRSVP.jsx` (untracked)
- `pages/admin/`, `pages/brainstorms.astro`, `pages/connect.astro`, `pages/research/`, `pages/experiments/` (untracked)
- `supabase/`, `src/lib/`, etc.

**Don't ship those.** They're Brian's in-progress brainstorm/admin/comments/research work. The previous orchestrator was careful to commit ONLY `src/pages/telegram-bot.astro` + `public/experiments/telegram-bot.jpg` to git — keep that scope.

If `vercel --prod` builds from the local working tree (not from git), it'll include the locally-modified files in the deploy. **Verify the deploy preview before promoting to prod** — if Brian's other in-progress work shows up at `aphonethatcares.com/whatever`, that's a problem. Possibly stash before deploy:

```bash
cd ~/Desktop/PhoneThatCares/Website
git stash --include-untracked --keep-index
# or, more surgical: git stash push -m "wip" -- (everything except telegram-bot.astro and the JPG)
vercel --prod
git stash pop
```

Or just confirm what the deploy includes via Vercel's preview URL before promoting to prod.

### Build dependencies

The page imports only `BaseLayout.astro`. The local `BaseLayout` has additive changes (new optional `showComments` prop, `Comments`/`EditMode` imports). The `telegram-bot.astro` file passes only the existing required props (`theme`, `activeSlug`), so it works with either old-or-new BaseLayout. No special handling needed.

### Asset

`telegram-bot.astro` references `/experiments/telegram-bot.jpg` (already in `public/experiments/`). The previous orchestrator added it to git in the same commit. If `vercel --prod` builds from working tree, the file's already there. Confirm during deploy.

---

## Verification after deploy

```bash
curl -sSL "https://aphonethatcares.com/telegram-bot?_=$(date +%s)" | grep -oE "ARGOS_BOT_USERNAME|@argostherobot|REMIX_LINK_HERE|val\.town/x/brian1" | sort | uniq -c
```

Expected (success):
```
   3 @argostherobot
   1 val.town/x/brian1
```

If you still see `ARGOS_BOT_USERNAME` or `REMIX_LINK_HERE`, the deploy didn't take — investigate Vercel cache / CDN purge.

---

## Context: the friend's tweet is imminent

Brian is going public with argos today. The website is the only public landing strangers will hit beyond the Telegram bot itself. **This deploy is the literal last thing between argos and several thousand strangers.** Worth getting right.

Other things that already shipped (not your concern, just for context):
- `@argostherobot` is live on val.town and tested end-to-end
- The bot's onboarding flow has been overhauled and tested overnight via 8 personas
- The bug consent flow, taste profile, morning offerings, etc. are all live
- See `~/Desktop/Projects/argos-telegram-agent/share/HANDOFF-2026-05-04-morning.md` for the bot side

---

— previous orchestrator (Opus 4.7, ~9am Pacific 2026-05-04). Memory at ~95% — going dark. Brian will spin you up with full Website context.
