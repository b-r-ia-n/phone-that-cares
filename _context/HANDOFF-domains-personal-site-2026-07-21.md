# Handoff — Domains + Personal Site (2026-07-21)

Session ran overnight 07-20 → 07-21. Two threads: consolidating Brian's domains, and a personal website at wonderi.ng. Domain thread got most of the time and is **blocked on a phone call**. Website thread is **designed but not built**.

---

## 1. Domains

### Verified facts (pulled from registry whois, not guessed)

| Domain | Registrar | Expires | Status | Notes |
|---|---|---|---|---|
| **wonderi.ng** | Truehost Cloud (KE) | 2028-02-19 | `clientTransferProhibited` | NS = ns51/52.domaincontrol.com. Nothing served. Account = bri@nvaughn.info. $10/yr |
| **nvaughn.com** | Namezero, LLC (IANA 606) | 2027-10-14 | `ok` — **already unlocked** | NS = worldnic. Parked, no MX. DNSSEC unsigned. Registrant = anothernotherbrian@gmail.com |
| **nvaughn.info** | Namecheap | — | — | **Live Google Workspace MX.** Brian's current mail. Don't touch |

### Recommendation (revised mid-session)

- **wonderi.ng — leave at Truehost.** Originally recommended moving it to Dynadot for custody. Reversed: Truehost charges $10/yr vs Dynadot $10.37, renewals demonstrably reach him (Feb 2026 confirmation email), and it's paid to 2028. No savings, no urgency.
- **nvaughn.info — leave at Namecheap.** It holds live mail. Don't disturb during any migration.
- **nvaughn.com — the only real task.** ~$35/yr NetSol-family renewal, auto-renew ON, and his home address + phone are public in whois.

### Consolidation research (done, don't redo)

- Only **Dynadot** among mainstream registrars accepts `.ng` transfers (~$10.37/yr). Cloudflare, Porkbun, Namecheap, GoDaddy do not. So "one registrar" is possible but forced to Dynadot.
- Cloudflare Registrar requires the domain to use Cloudflare DNS — no DNS portability. Supports .info (~$21) and .com ($10.44). MX/Google Workspace works fine there.
- Transfers aren't a fee so much as a forced +1yr renewal at the new registrar's price.

### nvaughn.com — the saga, and where it's stuck

Traced it fully. Chain of discovery:

1. Whois says registrar **Namezero, LLC** — a dead retail brand under Newfold/web.com (same parent as Network Solutions, Dotster, Register.com).
2. Brian **won it at a SnapNames drop auction, 14-Oct-2025, $79.** Confirmed in SnapNames Purchase History, which lists Registrar Name = **Namezero**.
3. SnapNames is an auction front-end only — **it never issues auth codes.** Wins get registered into an **auto-created account at the partner registrar**, keyed to the SnapNames registrant email.
4. Brian is logged into networksolutions.com as anothernotherbrian@gmail.com. **Domains list is empty** (upsell page only). Domain appears **only in Renewal Center**, which is billing-only and not clickable.
5. All the brand portals (namezero.com → dotster.com/namezero → web.com/dotster) redirect to the same Network Solutions system. So it's the same portal, a **different account**.

**Diagnosis:** the domain sits in a separate auto-created web.com/Namezero account not linked to his login. This is a documented SnapNames failure mode (DomainNameWire 2021: 20 wins spread across 5 NetSol accounts; NetSol also has a bug stripping `+` from plus-addressed Gmails, creating accounts under nonexistent addresses).

**Next action — a phone call. SnapNames: 1-877-352-5630, Mon–Fri 9am–6pm ET.**

Script:
> "I won nvaughn.com at auction 14-Oct-2025 for $79, registrar shown as Namezero. It's in my SnapNames Purchase History but doesn't appear under Domains in my Network Solutions account for anothernotherbrian@gmail.com — only in Renewal Center. I need account access or the auth code."

Also worth doing first (30 seconds): open the 10/14/2025 emails **"Congratulations on winning your domain name"** and **"Account Update Confirmation"** in that gmail. One is likely the registrar welcome email with account details.

Fallback: NetSol support 855-834-8495 / 1-800-361-5712; chat Mon–Fri 8–8 ET. But documented cases say **SnapNames owns this relink, NetSol can't fix it.**

### Traps — do not trip these

- **Do NOT enable whois privacy at NetSol.** It rewrites the registrant contact, which can count as a Change of Registrant → 60-day transfer lock. Dynadot gives privacy free after the move.
- **Do NOT edit registrant contact details** before getting the auth code. Same 60-day lock.
- **Do NOT renew at NetSol.** Not due until Oct 2027, and it's ~$35 at their prices.
- 60-day post-registration lock from Oct 2025 has **long expired** — not a blocker.
- NetSol account merges are **irreversible** and impose their own 60-day lock.

### Exposed right now in public whois on nvaughn.com

Brian Vaughn · 6486 Paseo Lazo, Carlsbad CA 92009 · +1.760.845.2004 · anothernotherbrian@gmail.com

(wonderi.ng is clean — NiRA doesn't publish registrant fields, though `.ng` supports no privacy at any registrar.)

### Email

`bri@nvaughn.info` → `bri@nvaughn.com` is **independent of all the above**. It's a Google Workspace change (add nvaughn.com as a domain, point MX, switch primary). Can be done with the domain still stuck at Namezero. Open question: domain alias vs secondary domain — they behave differently and are annoying to undo. Not researched yet.

---

## 2. Personal site — wonderi.ng

**Brian's decision: wonderi.ng is the personal / top-level site.** nvaughn.com becomes the durable fallback + mail domain. Reasoning: site can be playful, email address shouldn't be able to disappear (`.ng` is a ccTLD; low but nonzero policy risk).

### The concept

Plain hub page — Vulfpeck-plain, per his stated anchor — with a wave field of light behind it.

Reference he pointed at: `~/Desktop/Projects/luiz-andre-gama/prototypes/light-traps-wave.html` (from the Gama replication project). It's a real WebGL2 FDTD wave simulation with ping-pong float textures. Its `HELLO` mode already does the core trick: **glyphs are rendered into a barrier mask, so letters are physical obstacles the waves diffract around.**

### Brian's spec, in his words

- Like the Vulfpeck plain HTML site
- "the light moves and reflects around and interacts with the text"
- **"the text might wanna be readable even before the wavefronts hit them"** — light must never be what *reveals* the text
- **"mouse movement causes waves, which hit text and bounce around"**

### Design decisions made (not yet built)

- **Text is real DOM**, plain black on warm paper, always readable. Canvas sits behind. Degrades to a literal plain HTML page if WebGL fails or `prefers-reduced-motion`.
- **Every character becomes a barrier** — walk the DOM per-character with `Range.getClientRects()`, draw actual glyphs into the mask canvas at matching coords. Keeps wrapping in sync. Rebuild on resize + `document.fonts.ready`.
- **No ambient emitters.** At rest the page is completely still and plain. The cursor is the only light source.
- **Caustics, not glow** — brightness from curvature of the wave surface (light focusing on a pool bottom), warm gold on warm paper, low contrast.
- Mask needs ~1–2 cells of dilation or small text won't block waves; at ~640-cell grid, body text becomes a rough scattering surface, which is a feature (light on textured paper), while large text gives clean diffraction.
- Sim grid ~640 long edge desktop / ~320 mobile, cells square (grid aspect = viewport aspect).

### Content frame

From the 2026-07-16 research pass (`~/Desktop/Portfolio 2026/_working/personal-site-research-2026-07-14.html`): plain hub page = hyperlinked bio + Shipped list + /now. He already runs a constellation (aphonethatcares.com, b.notebook, gallery, Argos, publishing desk) and lacks only a hub.

### State

`~/Desktop/Projects/wondering/` created, **empty**. Nothing written. Build was interrupted to do the domain work.

---

## Open questions for Brian

1. SnapNames call — has it happened? Everything on nvaughn.com waits on it.
2. Possible **double renewal on wonderi.ng**: Truehost's Feb 2026 email says next due 2027-02-19, but registry says 2028-02-19 with an update on 2026-05-22. Worth checking billing for a duplicate charge.
3. Domain alias vs secondary domain for `bri@nvaughn.com` — needs a decision once the domain is free.
4. Site content: bio/Shipped/now need his actual words.

---

## Note on working with Brian this session

He asked mid-session for **shorter messages** — bullets, not paragraphs. Lead with the action. This is now in memory (`feedback-shorter-logistics`). He also got understandably frustrated when I guessed at registrar UI menus instead of looking things up — verify paths before telling him where to click.
