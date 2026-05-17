# Website handoff — 2026-05-04
*For the next Claude instance picking up the Phone That Cares website work in support of argos's public-ish launch.*

---

## TL;DR

Brian's friend (someone with a real Twitter following) is going to post about argos. We've spent the last 8-10 hours hardening the bot, deploying a *second* production-grade Telegram bot, and migrating Brian's journal data. **The website's `/telegram-bot` page has placeholder text that needs to be filled in before the tweet** — that's your main job. Plus a few smaller things.

---

## State of argos as of now

There are now **two bots**:

1. **`@hello_argobot`** — the original. Lives on the original val (`untitled-7955`, val ID `e534cea8-432e-11f1-8dff-42b51c65c3df`). Brian's existing 2-year journal lives here. Friends already use it. Stays as-is — Brian's testbed / legacy bot.
2. **`@argostherobot`** — the new public-facing one (named "Argos The Robot," matches the "Robo X" mode-prefix convention). Lives on a brand new val (`argos`, val ID `46072a84-476a-11f1-86f1-42b51c65c3df`). All env vars set. Webhook registered with `secret_token` pinned. **This is what the tweet will point to.**

Brian's per-chat blob data was copied today from un-prefixed keys to `prod-`-prefixed keys, so `@argostherobot` reads his journal from `prod-archive-...` etc. The prod val has a `BLOB_PREFIX=prod-` env var that scopes everything. Friends on `@hello_argobot` are unaffected — they keep reading/writing un-prefixed keys.

### Security state (all shipped)
- Webhook `secret_token` enforcement on both vals
- Constant-time HMAC compare, full 64-char tokens
- Per-user $5/day spend cap + global $50/day circuit breaker, both enforced before LLM calls
- SSRF guards on `verify_url` and `send_photo` (private IP / cloud-metadata / loopback / link-local blocked)
- `/reset` covers all per-chat keys
- Refuse-to-start on placeholder `CONFIG_SECRET`
- README has "If you fork this — what your users should know" section that's blunt about host visibility

### Outstanding non-website things (for context, not your scope)
- Test suite has 3 failures introduced today by an `implicit_start` fix — Brian's other Claude instance is dealing with that
- Brian is rewriting `start-text.ts` (the bot's onboarding messages) himself
- Cron schedule for the prod val isn't configured yet — morning briefs won't auto-fire on `@argostherobot` until that's set up

---

## What you need to update on the website

The page at **`aphonethatcares.com/telegram-bot`** is the one users see when the bot's onboarding message links them. It also gets linked from the friend's tweet. Three issues to fix:

### 1. Replace `@ARGOS_BOT_USERNAME` placeholder with `@argostherobot`

Search the page source for the literal string `ARGOS_BOT_USERNAME`. There are at least two occurrences:
- Inside the "Try the hosted version" `<code>` block
- In the `href="https://t.me/ARGOS_BOT_USERNAME"` link target

Replace both with `argostherobot` (without the `@` in URLs, with the `@` in the visible code block).

### 2. Replace `REMIX_LINK_HERE` with an actual val.town remix URL

In step 02 of the self-host walkthrough, the "Remix the bot" CTA points at `REMIX_LINK_HERE`. This is a placeholder. Real value should be val.town's "remix" URL for a *template* val that strangers can copy. **Decision needed**: does Brian want to (a) make `@argostherobot`'s prod val itself the template (would expose its env-var schema but no secrets), or (b) create a separate `argos-template` val with the same code but no secrets, intended explicitly as the public-fork source? Option (b) is safer.

If option (b): create the template val, push the same files (`share/*.ts` + `multi-bot.txt → main.ts`) but with no env vars set. Use the val.town "remix" URL: `https://www.val.town/v/brian1/argos-template/remix` or similar.

If option (a): the URL is `https://www.val.town/v/brian1/argos/remix`. Faster, slightly less safe.

Ask Brian if he hasn't decided. My guess: he'd pick (b) when the question lands.

### 3. Finish the truncated privacy sentence

Inside the `cta-card` block, the install-note paragraph reads:

> **On privacy:** messages flow through my OpenAI

…and just stops. The sentence is mid-thought. It should clarify that:
- Messages flow through Brian's OpenAI account (so OpenAI processes them in transit)
- Messages get stored in Brian's val.town blob storage indefinitely
- He doesn't intend to look but technically can
- A self-host path is right below

Pull language from the existing `START_MSG_2` in `~/Desktop/Projects/argos-telegram-agent/share/start-text.ts` which Brian is also reworking — match its register so the website and bot speak with one voice.

The bot's current copy:
> "Heads up: anything you send gets stored in Brian's val.town account. He doesn't intend to look, but if you'd rather own your data, you should be able to self-host your own copy in ~30 min — instructions at the link above."

That's the same disclosure shape. Adapt for the website's tone (slightly more polished, fewer "heads up"-style breaks).

---

## Things to be aware of while you're in there

**The "30 min" claim**: the self-host walkthrough has 7 steps. Realistic for a tech-comfortable user is more like 15-45 min. The "~30 min" framing is honest enough as long as the remix link actually works (so the user's clock starts somewhere). Don't change the number; do make sure the path actually exists.

**Brian's voice on the website**: warm, direct, slightly self-deprecating, no marketing-speak, lowercase-friendly. Match what's already on the page rather than inventing new register. The "Phone That Cares" thesis is *care over restriction, beauty over harshness* — this page should feel that way too.

**Aesthetic conventions**: warm off-white (`#f6f3ec`-ish), near-black text, soft borders, single accent. The page already uses CSS variables; respect them. There's a `design-skill-2026-04-30.md` somewhere in this folder if you need the full taste-doc.

**Scope discipline**: this isn't a redesign. Three placeholder fills + one truncated sentence. If you find other things wrong, surface them to Brian rather than fixing in the same pass.

---

## Files you'll be editing

The page lives in the Astro site at `~/Desktop/PhoneThatCares/Website/`. Probably under `src/pages/telegram-bot.astro` or similar. `grep -r "ARGOS_BOT_USERNAME" Website/src/` will pinpoint the file fast.

Verify locally with `npm run dev` (or whatever the project's dev command is — check `package.json`). Visually confirm the three fixes render correctly before committing.

If the site auto-deploys on commit (Vercel-style), don't push until Brian's seen the changes. If it doesn't auto-deploy, you can push freely.

---

## Useful pointers

- Argos repo (the bot itself): `~/Desktop/Projects/argos-telegram-agent/`
- Bot source-of-truth files: `~/Desktop/Projects/argos-telegram-agent/share/`
- Start-text source: `~/Desktop/Projects/argos-telegram-agent/share/start-text.ts`
- README with current self-host instructions: `~/Desktop/Projects/argos-telegram-agent/README.md`
- Today's earlier handoff (architectural context, lots of detail): `~/Desktop/Projects/argos-telegram-agent/share/HANDOFF-2026-05-01-pm.md`

---

## What Brian is doing in parallel

He's rewriting the bot's intro messages (`start-text.ts`) by hand. When he's done, the bot's onboarding voice will probably evolve slightly — match the website's tone to whatever the new bot copy lands on. Probably worth checking in with him before finalizing the website's privacy paragraph.

---

— Claude (the instance that just built `@argostherobot`'s prod val + migrated journal data + audited the security state)
