# Phone That Cares — State of the Project
_Last updated: 2026-05-12 (evening). Maintained as a living document — overwrite this, don't append._

---

## What this is

PhoneThatCares is Brian's sabbatical bet that **phone addiction is best intervened at the display layer** — not via app blockers, screen-time guilt, or dumb phones, but through simple UI changes on the device itself (gradual grayscale on social apps, picture-frame overlays, parallax depth, break cards, gentle haptics, lock-screen mode switching). The unifying thesis: in the content chain from creator → algorithm → screen, the phone is the only link where you're the customer rather than the product, and almost no one is doing serious design work on the user's side.

Working tag: **"a phone that cares about you."** Live at **aphonethatcares.com**. Spiritual stance: beauty over harshness / integration over restriction. Brian in Bay Area through ~Jun 7.

---

## Current state — workstreams

- **aphonethatcares.com (Astro/Vercel/Supabase).** Live workbench site, not a launch page. Deploys via `npx vercel deploy --prod` — repo is intentionally stale (2 commits, ~45 in-flight files). Pages: home, vision, experiments (4 numbered), research, brainstorms, connect, telegram-bot. Inline-edit mode + Supabase-backed comments.
- **Argos (@argostherobot, prod val `e534cea8-…`).** The most active build surface. Shipped publicly May 4. Multi-tenant on val.town. Has modes (RoboCaro, RoboMcCarthy, custom), morning offerings, library shelves, taste profile, save_fact, journal, mentors. May 11 sprint (6 agents) shipped: per-user prompt-overlay + `/agents` editor, librarian-as-async-runtime (live), daily health digest, onboarding edit nudge. **As of May 12 evening: main LLM swapped to Claude Sonnet 4.6** (adapter + clients.ts pushed, v347). Smoke test pending — awaiting confirmation that events show `claude-sonnet-4-6`.
- **Scroll Lab (Chrome extension).** Working but has a known grayscale A/B bug (`content.js` lines 2160–2173 randomly overwrites user choice on page load). Fix diagnosed, two paths — Brian hasn't picked one.
- **Tier Explorer / Android research.** Live at `/research/tier-explorer/` as a static drop-in. Frames Android interventions as 9 "moves" × 15 services.
- **Design system.** Formalized from 28-site rating exercise → `DESIGN-SKILL.md`. Thesis: warm restraint + one piece of small magic per surface. Warm off-white `#f6f3ec`, accent `#8a5a2b`, Inter `ss01 cv11 tnum`, sub-200ms motion. Anti-wellness-app (no streaks/badges/progress bars).

---

## Next big thing — Android fork

The leading approach: **rooted Pixel + Magisk + Zygisk-DenyList** (not GrapheneOS, not Accessibility-overlay). Ship grayscale-only as centerpiece + passive tracking + Argos per-app picker + one lock-screen direction. Defer feed-blur and break-cards (~80% of engineering pain lives there). Target: a real person lives with the device for ~2 weeks while social media still works. The move-level call hasn't been pressure-tested yet — Brian wanted an adversarial POSSIBLE-vs-IMPOSSIBLE round before committing.

---

## Open threads

- **Argos Claude swap follow-up** — cache is near-no-op until system prompt split into stable/volatile sections (~30 min); watch for spurious save_fact/set_context tool calls in first few days (Sonnet follows MUST/CRITICAL more literally than gpt-5.4)
- **Scroll Lab grayscale bug** — pick path A vs B; depends on whether A/B data collection is still a live goal
- ~~Telegram bot landing page~~ — confirmed fixed; `@argostherobot` + remix link live on aphonethatcares.com/telegram-bot
- **Outreach** — top-30 list has been ready since April; not sent; May SF trip window passed; Petr Nálevka or Joe Edelman recommended as first targets; site-readiness concern: vision page feels AI-y, no single essay picked to send
- **Business model** — still unresolved (open-source launcher vs. phone company vs. ?)
- **Publishing** — material exists, nothing shipped as public essay; this is the real bottleneck per PM read
- **Android adversarial round** — POSSIBLE-vs-IMPOSSIBLE pressure test before committing to build approach
- ~~save_fact dedup~~ — fixed (prompt-level "check for duplicates" instruction in tool description)
- ~~default shelves missing for new users~~ — intentional as of May 1 commit; new users start empty, opt-in via settings

---

## In Brian's words

These are excerpts from the full writing corpus (`top-level-context-dump-phone-that-cares-organized.md`). Selected for voice and orientation — the "why this, why now" that no summary captures.

---

**The chain (from first long-form pitch, 2025-04-13):**
> "I think phones could be better. I think there are a number of distinct, non-complex, and easily discoverable UI interfaces you could make. As I see it today, phones are basically passive with respect to information streams. It will show you TikTok, Instagram, YouTube, pornography, beheadings, whatever you want, and it doesn't have any opinions about that. And there's something beautiful like that. It's like a piece of glass, right? It will show you whatever is there. On the other hand, I sometimes feel like there's a tug-of-war happening. You have millions of content creators, thousands, tens of thousands of people working on social media apps who are incentivized to keep you looking. And on the other team, there's you, one person with a magic device in their pocket that evolution has not equipped them to deal with skillfully. But the thing is, there's a chain, and with any chain, if you break any one link, the chain breaks."

---

**The elegant solution (2025-04-13):**
> "A lot of people are like, oh no, TikTok will never change, and I think that's frankly fair. I don't especially desire for TikTok to be forced to change. I could see that being a better world, but it feels inelegant as a solution. The elegant solution in my mind is that there is a final place where information streams are displayed to users. That's your phone, your desktop computer, your iPad. And my basic pitch is that you can read more detail in the rest of my project application, but I think you could add intentionality. Currently a phone has something like a collapsed posture where it will do whatever you want. It will let itself get pushed around."

---

**The thesis in tightest form (2025-04-13):**
> "My pitch is that today's media ecosystem involves 1000000 of content creators tens of thousands of people working in tech, all of whom are trying really hard to get you to watch the next video after this one. Then a few more. But as very few people working directly on behalf of users. In theory, in this ecosystem, I think this is the natural role of your phone. It's one place you are the customers. You can't be the product. Least in some ways. But in practice, phone companies seem to view the roles primarily passive. Displaying anything in any context, by default. My thesis is that there are simple UI changes available on the device level. That would affect this ecosystem. Changes to how content is framed, displayed, interacted with, that would dramatically increase users feeling of empowerment over when and how they're using social media."

---

**What this isn't about (2025-04-14):**
> "In the current technology paradigm, we have huge, sophisticated teams competing for your attention, with no corresponding team helping you decide what's worth paying attention to, how and when to engage. So far, I can't find deep reason this should be true! This imbalance isn't about personal willpower or 'addiction' - it's about missing tools for navigating an increasingly complex attention landscape."

---

**The closed-attention loop (2025-10-13):**
> "This sort of most fundamental underlying assumption behind my whole thing is that phone addiction is a loop that only works because of closed attention, because of sort of artificially reduced awareness. Someone who's going on their phone for 8 hours is physically quite uncomfortable in many cases. Their bodies, their overall nervous systems don't want to be doing that. Can only do so because they're ignoring the signals from some other parts of their bodies. They're saying, please, we get a drink? Can we go on a walk? We talk to some friends? The standard stories about what phone addiction is — superstimulus, bright colors, tailored content — don't really hold water to me. I think there's truth to them, but there's not overwhelming truth. There's nothing that couldn't be improved on."

---

**It's nuts that no one has done this (2026-04-11):**
> "Currently, billions of people around the world spend hours a day staring at their phones and dislike it. Don't enjoy it. And it is a result of research in the tradition of Las Vegas machines. Using everything we know about human psychology to get them to do something they don't retroactively or going and want to do. I think this could be solved by a several $1,000,000 project at most. And the fact that no one has done it is absolutely nuts."

---

**The enchanted glass shard (2025-04-13):**
> "I think it feels economically inevitable that we will simply choose the better future. I don't think people would be willing to spend dollars a day not to — that's a fortune lock, that's like trillions of dollars of connections. Like, the damage phones are causing is actually just not that expensive to fix. Someone is gonna find a way. I would simply like to make it faster. Currently, we have like the enchanted glass shard that both is magical and cuts you. And I think what we want is to take the both. So I guess the brainstorming buckets are: make the enchanted glass shard cut you less. Start adding fur. Make it color. And make it sort of eventually actively working for you."

---

**Integration vs. division (2025-10-06):**
> "Current approaches to managing (even the word 'managing'!) digital engagement kinda fall into predictable categories: screen time tracking and guilt-inducing metrics; app blocking and restriction tools; reduced-capability devices. These solutions all create internal conflict. They pit the part of you that seeks engagement, novelty, or escape against a part that seeks control, judges, restricts. The opportunity lies in creating interfaces that foster integration rather than division. Deep success would mean that after using this phone, you would be able to use a regular phone more skillfully and intentionally too."

---

**People want to live harmoniously (2026-04-11):**
> "There are frames in which people aren't addicted, aren't agentic, and that's obviously true. But there are also frames where like if there was a good solution that just felt better, people would absolutely just take that. And that is a truth that I think is often not captured in addiction stories. Like people want to live harmoniously with themselves with their substances or technology or whatever — they're just in one frame, they don't have the right affordances available yet to do so."

---

**The future retrospective (2026-04-11):**
> "In retrospect, the system was fairly unstable. Hundreds of millions of people spending thirty hours a week on social media that they did not especially value or identify as wanting to do was not sustainable. That was never going to be a business practice that lasted a hundred years. Much like the opium dens era, it is a sort of embarrassing thing that happened. The tacit unspoken agreement by all mobile device providers to not try particularly hard to explore ways to make these devices less addictive made them a lot of money for a bit. But was an unstable equilibrium, which as soon as any one device started to incorporate features that respected people's time and autonomy, the rest had to follow or get out of the game."

---

**Memorializing a "failed" project (2026-03-21) — the emotional underside:**
> "Hello, Claude. As an experiment memorializing my phone that cares about project — this has been an on and off project for over a year now. A few dozen hours. And probably going to pick it up again after this. But right now, I'm imagining that I've given up because probably it'll fail. I've known that from the start. And I wanna feel it... Could be that this whole project is my mind wanting to serve my heart or making gestures about it, but not able to fully do it — not somatically, not internally, not in an embodied way. Not yet."

> "Also wanna memorialize the good. It was really deeply hopeful. It looks like something really good in me that wanted to work and tried to make it happen. Something in me that was able to be connected both to the suffering of people who are spending all their time on their phone pushing their feelings away. But also part of me connected to technology, believes in this as a force for good."

---

**The Wright Brothers framing — how to hold this work (2026-03-30):**
> "I've also been reading David McCullough's The Wright Brothers, thinking about how technological change happens. Interesting that heavier-than-air wasn't just thought about, it was well known, discussed, etc. I'm thinking about the moment when Wilbur wrote to the Smithsonian, requesting as much info on flight as they had available. Feel some parallels: an obviously theoretically solvable problem (in my case, because phone addiction has only even existed for half maybe my lifetime), widely understood as a problem and discussed but variable quality thinking about it."

> "Please maintain a light editorial hand throughout. This is a beautiful, crazy world and your job like mine is to a significant extent to wonder at it, to be curious enough not to decide too early. I don't mind official sources but just like the Wright Brothers were right not to fully trust the 'experts' of their day who hadn't yet solved the problem of flight, we have to keep in mind that addiction is pretty rampant in the modern world."
