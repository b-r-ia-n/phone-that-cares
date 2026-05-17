# Beeper, Matrix bridges, and the "Connect" surface

Research note, 2026-05-15. For the Phone That Cares Android build.

A quick gloss on terms before we dive in. **Matrix** is an open federated chat protocol. A **homeserver** is the backend Matrix instance that holds your account and rooms — like an IMAP server for chat. A **bridge** is a piece of software that translates between Matrix and some non-Matrix network (WhatsApp, Telegram, etc.), so messages flow both ways. A **puppeting bridge** logs in as you on the remote network (using your real WhatsApp/Telegram session) and mirrors every conversation into Matrix rooms — as opposed to a relaybot bridge, which is one shared account everyone talks through. Puppeting is what you want here: real conversations, real identity, all in one place.

The basic answer to the question is: **yes, the open-source infrastructure exists, it's actively maintained, and it's exactly what Beeper is built on. You can ship a Connect surface in weeks, not months — with the giant exception of iMessage, which still requires a Mac in 2026 no matter what you do.**

---

## 1. Beeper in 2026

Beeper was acquired by Automattic in April 2024 for $125M ([Wikipedia](https://en.wikipedia.org/wiki/Beeper_(software))). The Beeper Mini saga is now closed: Beeper Mini was a brief late-2023 attempt to put iMessage on Android *without* a Mac, by reverse-engineering Apple's push protocol via JJTech's [pypush](https://github.com/JJTech0130/pypush). It worked for about two weeks before Apple shut down the server-side auth path, then ping-ponged through a few workarounds before being fully discontinued in January 2024 when Apple started banning the Mac accounts used as registration providers ([9to5Google](https://9to5google.com/2024/01/26/beeper-imessage-disabled-apple-ban/), [Tom's Guide](https://www.tomsguide.com/phones/rip-beeper-mini-imessage-on-android-is-now-truly-done)).

Post-acquisition, Beeper rebuilt around an **on-device** model — the new client (iOS/Android/Desktop) runs the bridges *locally* rather than on Beeper's servers, so messages don't pass through Beeper Cloud at all for supported networks ([Beeper rewrite blog post via TMC](https://blog.tmcnet.com/blog/rich-tehrani/unified-communications/beeper-relaunches-with-on-device-messaging-premium-features-and-a-privacy-first-ai-roadmap.html)). Internally this is the `bridgev2` framework in mautrix-go, plus a new `megabridge`/`megahungry` model that lets one process host many single-tenant bridge instances ([Tulir 2024 H1 updates](https://mau.fi/blog/2024-h1-mautrix-updates/)). WhatsApp and Signal are fully on-device; Telegram, Discord, Matrix native, and others are mid-migration as of mid-2026.

Pricing as of May 2026 ([beeper.com/faq](https://www.beeper.com/faq)): **Free** for up to 5 accounts. **Beeper Plus** at $9.99/mo for 10 accounts + multi-account per network + scheduling/incognito/transcription. **Beeper Plus Plus** at $49.99/mo for unlimited. iMessage works via a paid bridge that needs an always-on Mac.

The relevant fact for us: Beeper open-sourced essentially their whole bridge stack. The company is the bridges' maintainer. They actively *encourage* self-hosting via [bridge-manager](https://github.com/beeper/bridge-manager), and **self-hosted bridges don't count against your Beeper account quota** ([beeper/self-host](https://github.com/beeper/self-host)) — so even the hosted Beeper route is friendly to BYO bridges.

---

## 2. mautrix bridges — the open-source ecosystem

These are all **AGPL-3.0**, all written in Go, all maintained by Tulir Asokan and the Beeper team. The maintenance cadence in 2026 is steady: monthly release notes on [mau.fi/blog](https://mau.fi/blog/), most bridges getting commits weekly. From [github.com/mautrix](https://github.com/mautrix) (last-update dates as of mid-May 2026):

| Bridge | Repo | Last update | Notes |
|---|---|---|---|
| WhatsApp | `mautrix/whatsapp` | 2026-05-14 | Uses unofficial multi-device API; treat like a linked device |
| Telegram | `mautrix/telegram` | 2026-05-13 | Go rewrite released April 2026 |
| Signal | `mautrix/signal` | 2026-05-13 | Updated for Signal 8.0 protocol (March 2026) |
| iMessage | `mautrix/imessage` | 2026-05-14 | Needs a Mac, jailbroken iOS, or BlueBubbles backend |
| Discord | `mautrix/discord` | 2026-05-13 | |
| Meta (Messenger + Instagram DM) | `mautrix/meta` | 2026 active | Combined bridge replaced separate `mautrix/facebook` + `mautrix/instagram` |
| Google Messages (SMS/RCS) | `mautrix/gmessages` | 2026-05-13 | Acts as a linked device to Messages for web |
| Twitter | `mautrix/twitter` | 2026-05-13 | |
| Slack | `mautrix/slack` | 2026-05-13 | |
| GroupMe | community fork | varies | Less actively maintained |
| LinkedIn | community fork | varies | Less actively maintained |

The Big Six for our purposes — WhatsApp, Signal, Telegram, iMessage, Meta (IG/Messenger), Google Messages — are all first-class and actively maintained.

**Risk notes on specific bridges:**
- **WhatsApp**: low ban risk if you use it like a normal linked device. Risk goes up if you combine the bridge with VoIP numbers, brand-new accounts, or aggressive cold-DMing ([docs.mau.fi troubleshooting](https://docs.mau.fi/bridges/general/troubleshooting.html)).
- **Instagram (mautrix-meta)**: Meta has been the most hostile platform. Periodic challenge-flows, account locks, IG-specific breakage. Active maintenance but the most likely thing to break on any given week ([mautrix/meta issues](https://github.com/mautrix/meta/issues)).
- **Signal**: stable, but Signal occasionally ships breaking protocol changes that force same-day bridge releases.
- **Google Messages**: rides on the Messages-for-web pairing, so it's roughly as stable as that feature itself.

---

## 3. iMessage on Android specifically

This is the hardest piece, and Brian's mental model is right: **someone got it working with a Mac + Apple ID** is currently the only durable path. Pypush / direct-from-Android died with Beeper Mini in early 2024. The pypush repo is still around but is "being rewritten and is not feature-complete" — text only, no group chats, no attachments, no reactions ([Claw Messenger 2026 roundup](https://www.clawmessenger.com/blog/imessage-on-android)). Sunbird/Nothing Chats was the highest-profile attempt after Beeper Mini and died of security breaches within weeks.

Practical options in 2026, all of which require a Mac (or jailbroken iOS device) on 24/7:

- **BlueBubbles** ([bluebubbles.app](https://bluebubbles.app/faq/)) — open source, free. Mac server reads `chat.db`, pushes via Firebase relay to the Android client. Most feature-complete community option.
- **AirMessage** — same architecture, slightly cleaner UX, end-to-end-encrypted connection (no Firebase in the path).
- **Beeper's iMessage bridge** ([beeper/imessage](https://github.com/beeper/imessage)) — works, requires a Mac registration provider, behind the Beeper Plus paywall.
- **mautrix-imessage with BlueBubbles backend** — the open-source middle path: run BlueBubbles on the Mac, point [mautrix-imessage](https://github.com/mautrix/imessage) at its REST/WebSocket API, get iMessage rooms in your Matrix homeserver. Documented at [docs.mau.fi](https://docs.mau.fi/bridges/go/imessage/index.html). This is the route that fits Phone That Cares: open source end-to-end, integrates with the rest of the bridge stack, and Brian (or any tester) only needs to leave a Mac Mini plugged in somewhere.

For a v1 prototype that one person uses for two weeks, the BlueBubbles + mautrix-imessage path is honestly fine. The Mac requirement is real but it's a one-time setup, not ongoing pain.

---

## 4. Self-hosted Matrix homeserver

You need a homeserver to be the data backend that the bridges plug into and the Android app reads from. Three live options ([matrixdocs server comparison](https://matrixdocs.github.io/docs/servers/comparison)):

- **Synapse** (Python, matrix-org reference) — 82% of federated deployments, feature-complete, heaviest. Default choice unless you have a reason not to.
- **Dendrite** (Go, second-gen) — lighter, intended for small deployments. Feature-prioritized for single-user use cases ([matrix-org/dendrite](https://github.com/matrix-org/dendrite)).
- **Conduit** (Rust, single-binary) — most resource-efficient, runs on a Pi. Some feature gaps (partial Spaces, etc.).

For a one-person, ~10-account setup: **Conduit or Dendrite** if you're hosting on a small VPS ($5/mo box is fine), Synapse if you want maximum bridge compatibility and don't mind 1–2GB RAM minimum. Federation isn't required — your homeserver can run closed and just talk to your bridges.

Deployment patterns:
- The fastest option is the **matrix-docker-ansible-deploy** playbook — one server, ansible-playbook, you get Synapse + every bridge you want with Postgres, Coturn, nginx all wired up.
- **Beeper's bridge-manager** lets you skip homeserver-hosting entirely: register self-hosted bridges *against Beeper's homeserver*, no port forwarding, no TLS certs. This is the path of least resistance if you don't mind your bridges being registered to a Beeper account.

For Phone That Cares specifically, I'd put a finger on **matrix-docker-ansible-deploy → Synapse + the 5-6 bridges we want, on a $10/mo Hetzner box**. Total setup time once you know what you're doing: a few hours.

---

## 5. Custom Android client on top of Matrix

The Matrix client side is in better shape than you might expect.

- **Element X Android** ([element-hq/element-x-android](https://github.com/element-hq/element-x-android)) — official client, built on the **Matrix Rust SDK** + Jetpack Compose. Minimum SDK 24 (Android 7.0+). This is the modern reference.
- **Matrix Rust SDK** ([matrix-org/matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk)) — production-ready, used by Element X, Fractal, iamb. Exposes `matrix-sdk-ui` for high-level "give me a room list" abstractions and `matrix-sdk-base` for headless state. Cross-compiles to Android via bindings.
- **SchildiChat** — community Element-Android fork showing the cosmetic customization pattern (different design, extra features) works fine.

The realistic move for us is **not** to fork Element X — its UI is heavy and opinionated, and you'd spend more time deleting than building. Instead: **start a fresh Jetpack Compose app, link `matrix-sdk-ui` via the Kotlin bindings, build the Connect view from scratch.** You get the SDK's sync engine, encryption, room state, and timeline handling for free; you write only what's distinctive about Connect.

The bridges expose each remote conversation as a normal Matrix room. From the client's perspective, an Instagram DM thread and a WhatsApp group are just rooms with different bot members. You don't need per-network code in the UI — that's the whole win of the Matrix approach.

---

## 6. Realistic scope

Honest estimate for Brian to ship a Connect surface aggregating 5–7 platforms via Matrix bridges, with a custom UI:

- **Homeserver + bridges stood up, all platforms logging in, messages flowing**: 2–4 days. Most of this is QR-pairing each network and chasing the one bridge that's misbehaving that week.
- **Mac mini + BlueBubbles + iMessage bridge wired in**: 1 day.
- **Android client shell with Matrix Rust SDK + a unified inbox view**: 1–2 weeks for a working prototype, 3–4 weeks for something that feels good. Most of the time is taste and motion polish, not protocol code.
- **Aesthetic pass against the PTC design system** (`#f6f3ec`, Inter tnum, sub-200ms motion, no streaks/badges): folded into the above, but plan another week for "make it feel right."

**Total to a Brian-uses-this-for-two-weeks state: 4–6 weeks of focused work.** Three of those weeks are the Android UI.

**Maintenance hazards** (this is the real cost, not the build):
- Instagram bridge breaks roughly monthly. Plan to update mautrix-meta and reauthenticate. Sometimes accounts get challenge-flagged.
- WhatsApp's linked-device cap (currently 4 devices) means the bridge counts against it. If Meta tightens this, the bridge is the first thing to fall.
- Signal protocol breakage is rare but same-day urgent when it happens.
- iMessage Mac side: mostly stable, but macOS updates have broken AppleScript paths before. The Mac must stay logged into your Apple ID.
- All bridges are AGPL — if you fork or modify them, you owe source. For a single-user / Brian-uses-it case this doesn't bite.

The bridges *do* break. They get fixed quickly — usually within days — but it means this surface is never zero-maintenance.

---

## 7. Recommendation for v1

For a phone that Brian uses for ~2 weeks: **use hosted Beeper as the backend, build a custom Android Connect view that talks to Beeper's homeserver via the Matrix protocol.**

Reasoning:
- $9.99/mo Beeper Plus gets you all bridges except the high-friction ones, plus iMessage, plus *they* handle bridge breakage. For a v1 prototype, that's worth more than the open-source purity points.
- You can still self-host any bridge you want via bridge-manager and have it count as 0 toward your account limit — so you keep the open-source escape hatch.
- Your custom Android client is doing real Matrix protocol regardless. The homeserver behind the bridges is interchangeable. If Beeper enshittifies in 6 months, swap to a self-hosted Synapse and nothing in the client changes.
- It cuts ~3 days of setup and ~ongoing-weekly bridge babysitting out of the prototype phase, which is when you want to be iterating on UI, not chasing Instagram challenges.

**Bridges to wire up first, in priority order:** WhatsApp, iMessage (BlueBubbles backend or Beeper's Mac bridge), Signal, Telegram, Google Messages (SMS/RCS). Instagram DMs and Discord second wave — they're more brittle and matter less for "is this phone livable."

The thing to *not* do in v1: build any per-network UI affordance. Treat every conversation as a Matrix room with a network label, render them identically. The PTC thesis is that the display layer is the intervention point; the win of going through Matrix is that the display layer doesn't have to know what's underneath.

One thing worth flagging — Brian's friend who got iMessage on Android working almost certainly used BlueBubbles or AirMessage on a Mac, not anything pypush-derived. If they claimed otherwise it was Beeper Mini in its two-week window. The Mac requirement is the one thing nobody has cracked in 2026 and it's not on the horizon to crack.

---

## Sources

- [Beeper (Wikipedia)](https://en.wikipedia.org/wiki/Beeper_(software))
- [Beeper FAQ / pricing](https://www.beeper.com/faq)
- [Beeper Developer Docs — Bridges](https://developers.beeper.com/bridges)
- [beeper/bridge-manager](https://github.com/beeper/bridge-manager)
- [beeper/self-host](https://github.com/beeper/self-host)
- [Beeper relaunch / on-device architecture writeup](https://blog.tmcnet.com/blog/rich-tehrani/unified-communications/beeper-relaunches-with-on-device-messaging-premium-features-and-a-privacy-first-ai-roadmap.html)
- [Tulir Asokan — mautrix release notes blog](https://mau.fi/blog/)
- [mautrix GitHub org](https://github.com/mautrix)
- [mautrix bridge docs](https://docs.mau.fi/bridges/)
- [mautrix/imessage](https://github.com/mautrix/imessage)
- [mautrix/meta](https://github.com/mautrix/meta)
- [Apple shuts down Beeper Mini — 9to5Google, Jan 2024](https://9to5google.com/2024/01/26/beeper-imessage-disabled-apple-ban/)
- [RIP Beeper Mini — Tom's Guide](https://www.tomsguide.com/phones/rip-beeper-mini-imessage-on-android-is-now-truly-done)
- [JJTech0130/pypush](https://github.com/JJTech0130/pypush)
- [iMessage on Android 2026 — Claw Messenger roundup](https://www.clawmessenger.com/blog/imessage-on-android)
- [BlueBubbles FAQ](https://bluebubbles.app/faq/)
- [BlueBubbles vs AirMessage — XDA](https://www.xda-developers.com/bluebubbles-vs-airmessage/)
- [Matrix server comparison](https://matrixdocs.github.io/docs/servers/comparison)
- [matrix-org/dendrite](https://github.com/matrix-org/dendrite)
- [matrix-org/matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk)
- [element-hq/element-x-android](https://github.com/element-hq/element-x-android)
- [element-hq/element-android](https://github.com/element-hq/element-android)
