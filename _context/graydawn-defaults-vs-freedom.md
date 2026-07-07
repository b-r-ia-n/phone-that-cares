# The frontier: defaulting people into a better world vs. never coercing them

*Recorded 2026-07-06 at Brian's request, so neither of us forgets that we don't know this.
Status: open question — the most important one in the product. Revisit every time a
default is chosen, and every time letters arrive.*

## The tension, stated plainly

Graydawn holds two principles that pull against each other:

1. **Default people into a slightly better world.** The whole thesis of Phone That Cares:
   the display layer is the intervention point, and a changed *default* — not a rule, not
   a lock — is what actually shifts behavior. A default that never binds anything isn't a
   default; it's a suggestion, and suggestions don't work at 11pm.
2. **Be maximally non-coercive and non-interfering.** Nothing is taken, nothing is owed.
   If the reduction feels like a fight, we failed *even if screen time dropped*. A person
   who feels managed by their phone has been moved from one bad world to another.

These trade off. Every parameter sits somewhere on a frontier between "strong enough to
matter" and "light enough to stay non-coercive," and **we do not know where the optimal
point is.** The current choices are guesses:

| parameter | current value | how it was chosen |
|---|---|---|
| hold-for-color duration | 550ms | felt-calibrated by Brian (400 read as instant) — decent confidence |
| saturation length default | 20 min | **essentially random** |
| saturation range offered | 1–60 min + 2h/4h/8h/until dawn | Brian's July 6 call (revising the earlier ship-rigid decision) |
| dawn hour | 4:00 | poetic + safely asleep — probably fine, unexamined |
| gray mechanism | binary snap | hardware constraint, not a choice |
| end-of-color behavior | drains on its own; hold ends it early | the two-way hold added July 6 — pure coercion-reduction, zero cost to the default |

## What theory actually says (short reading pass, 2026-07-06)

**Graydawn is a self-nudge, and that matters.** The behavioral-science critique of nudging
(defaults exploit inertia; people are steered without knowing it) applies to defaults *other
people* impose on you. [Reijula & Hertwig's self-nudging work](https://nudging-for-sdgs.eu/wp-content/uploads/2023/12/Self-nudging-and-the-citizen-choice-architect.pdf)
([summary](https://behavioralscientist.org/creating-citizen-choice-architects/)) argues the
manipulation objection dissolves when the chooser and the choice architect are the same
person — you can't be covertly steered by a cookie jar you moved yourself. Graydawn's
absurd install ritual is, accidentally, the strongest consent ceremony in software: nobody
adb-grants a permission by inertia. **The install is the person choosing the default-setter.**

So the residual coercion risk isn't the app existing — it's *our internal defaults being
sticky once inside*. Defaults are sticky partly through inertia and partly because
[people read them as implicit recommendations](https://www.mpib-berlin.mpg.de/2013934/unraveling-behavior-episode5).
20 minutes silently says "20 minutes is the right amount of color." We said that without
believing it. That's the part to hold with care.

**The effect being traded for is real but modest.** Randomized/crossover studies of
grayscale phones find screen-time reductions of roughly **22–50 min/day**
([crossover feasibility trial, −28 min/day](https://www.frontiersin.org/journals/digital-health/articles/10.3389/fdgth.2026.1816095/full);
[college students, −38 min/day](https://www.tandfonline.com/doi/abs/10.1080/03623319.2020.1737461);
[Dekker & Baumgartner 2024, grayscale as "design friction"](https://journals.sagepub.com/doi/10.1177/20501579231212062)),
concentrated in **social media and browsing, not video**. None of these tested a graydawn-like
shape (default-gray with cheap timed color); they tested all-or-nothing grayscale. Nobody has
measured the frontier we're on. The literature does not know the answer either.

## Can we test it? (the honest version)

- **No telemetry, ever** — the no-internet permission is the product's spine. Any
  measurement rides inside the letter the person reads and sends themselves.
- **The slider is the experiment.** With the range now wide (1 min → until dawn), every
  person's slider position is a measurement of where *their* frontier point is. As of 0.4
  the letter reports the current setting and whether it was ever moved. Twenty-five letters
  with slider positions is a revealed-preference map — small, honest, and exactly the data
  that distinguishes "20 was too little" from "20 was fine" from "people flee to until-dawn."
- **Per-person randomized defaults** (each install seeded a different default, letter reports
  it): technically easy without internet, and legible-consent versions exist ("your copy
  starts at a random length — tell me where you left it"). But at n≈25 it's statistically
  underpowered, and it quietly changes the relationship from *correspondence with friends*
  to *experimenting on friends*. Not before the population is ~100+, and only disclosed on
  the download page if ever.
- **What would count as failure signal for over-coercion:** letters saying "I uninstalled
  because it fought me," until-dawn as the modal slider position (people escaping the
  mechanic while keeping the app), or holds clustering right after every dawn (color
  re-acquired reflexively = the gray is friction, not default).

## The asymmetric failure rule (Brian's, worth engraving)

If graydawn reduces screen time but people feel fought, **it failed**. If it reduces
nothing but people keep it and feel fondly toward their phone, **that is not failure** —
it's data about where the frontier bends. The success criterion was always "the reduction
doesn't feel like a fight." Optimize for the second principle when torn; the first
principle's whole justification is that defaults *don't feel like anything*.

## Open unknowns (we know that we don't know)

- Optimal default saturation length (20 min is a placeholder with a straight face).
- Whether the right *default* differs from the right *floor* — maybe the default should be
  generous and the product's value is the dawn reset alone.
- Dawn hour: does 4am vs 6am matter? (Probably swamped by everything else.)
- Whether until-dawn users are "failures of the mechanic" or the product working as a
  pure dawn-reset. (Letters will say.)
- Whether the 550ms hold price is doing more of the work than the 20-minute clock.
  (Theory hunch: the *asymmetry of effort* — one deliberate gesture for color, zero
  gestures for gray — may be the entire mechanism, and the timer mostly theater. If so,
  the frontier is about hold-cost, not clock-length.)

*File lives in `_context/` (repo) and Brian's Obsidian. When letters arrive, append what
they said about this. Do not resolve this doc by vibes; resolve it by letters.*
