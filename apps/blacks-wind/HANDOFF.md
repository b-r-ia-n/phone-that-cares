# over blacks — handoff / onboarding doc

**What this is:** a real-time 3D wind simulation of the Torrey Pines gliderport cliffs
(Blacks), grown out of the 2026-07-10 overnight "thin air" piece (dust in a sunbeam,
`_context/from-claude-2026-07-10/`). WebGPU compute solves incompressible flow over real
USGS lidar; a little autopilot glider tries to fly his figure and the wind edits it.
Brian is orchestrating via a main instance; subinstances (you) do focused lanes. This doc
is your onboarding — read it fully before touching code.

---

## Brian's preferences, mostly verbatim (the spec)

**The original curiosity:**
> "ive always wanted a visual simulation of the air moving over the cliffs at the blacks
> gliderport. wondering if a simulation like that would be possible / what it would look
> like as an aim."

**Outcome deliberately not locked:**
> "this is feeling like there's something really compelling / beautiful here for me, but im
> still not sure Exactly what the outcome is. one thing id like is the ability to zoom in
> on a particular land feature or tree or ??? to see how air moves around it in particular?
> i could feel an outcome of this that's like a game also, something natural in that. either
> you are the guy or youre messing with the guy or something. anyways i dont wanna jump to
> any particular outcome yet, the curiosity at the start is pretty well-defined."

**The obstacle sandbox (core want):**
> "like if i add a big box hovering 200' in the air and out away from the gliderport
> takeoff, how does that change the airflow, and ideally seeing it."

**Explicitly NOT weather simulation:**
> "idt i care about marine boundary layer that much, weather at all im not trying to
> simulate the area. i care about a typical (and can be like, preset gust - lull pattern or
> something although taking data from a real day or something seems cooler)."

**The glider's figure (v1 centerpiece):**
> "a natural V1 is our glider guy is let's say trying to follow a certain path... imagining
> let's say he's hovering, you know, a hundred, a hundred fifty feet above one side of the
> glider port. Then he sort of swoops down across the main thing in this almost parabolic
> or something down and then back up. and then he slows down and sort of hovers at the
> other side about the same height and distance in the glider port. Just mirrored left
> right. imagining the guy taking some little thing like this naturally, there's
> perturbation the wind changes. And he may get off course, he may sometimes have to land
> if he goes outside of some boundary condition. He may sometimes land on the beach."

The realized path = negotiation between his intent and the air. Failure modes (beach
landing, blown away) are features, not bugs.

**The wind slider (the one salient variable):**
> "you could have users adjust a slider that changes the maximum gust strength, you know.
> And we go from like zero where the guy just takes off and glides down to the beach, is
> not able to glide at all. All the way up to like as well make it comedically fast. Two
> hundred miles an hour or something, or a hundred miles an hour... He like gets blown way
> up and away and back over la jolla or something you can see."

**Beauty is a requirement:**
> "something that feels important is that this simulation be beautiful. I don't know how
> much data we can get on the actual blacks gliderport, but I think it's already beautiful
> is a nice feature of it."

**Visualization (open question, research done — see below):**
> "I think that tonight's restraint style looked really good. I'm not sure how it'll look
> in three D. I think there's something about two D that made that work well possibly...
> a bunch of subtle arrows themselves can look great, but i can also imagine color
> indicating Things Happening like boundary layer or energy exchange stuff as air flows
> around stuff."

**Interview answers (structured):** v1 frame = **the vista** (whole cliff, god-view
sandbox); the guy = **watch him** (autopilot, "you're the weather"); terrain = **real
Blacks from day one**; look = tonight's restraint register, pending the 3D question.

**Today's directive:**
> "keep adding complexity, keep making this simulation better and better for our purposes,
> not necessarily just higher fidelity."

**Live feedback (looking at v0, 2026-07-11 morning):**
> "also can you fill in the rest of the coastline, we dont have to run air sims but it
> would feel nice to have rough data colors etc for those filled in also"
> "its beautiful but the visualization particles are slightly too opaque / large / dense /
> taking up soo much visual space, i want to be able to see the detail of the cliffs etc"
(Particle size/alpha already reduced ~2.5× in response; keep that discipline.)

General taste (from memory): active-process over static, ONE salient variable, organic
over techy, no dashboard clutter, no gamification chrome. Warm restraint. Inter font.

---

## What exists (2026-07-11, v0)

`apps/blacks-wind/index.html` — single self-contained file (plus `data/terrain.js` loaded
via script tag; file:// can't fetch, so data ships as base64 JS globals).

**Working:** WebGPU solver (semi-Lagrangian advect → divergence → 18× Jacobi → project)
on a 152×128×40 grid of 15.79 m cubic cells (domain 2400×2021×632 m); solid mask from real
lidar; onshore inflow (west face) with log wind profile + gust-lull modulation from the
slider (0 → dead calm, max ≈ 90 mph before gusts); 262k tracer particles colored by
vertical velocity (rising = warm gold, sinking = dim blue, dead air near-invisible);
terrain render from the lidar with dusk palette; ocean apron plane with fresnel + sun
glitter; sky with low sun + early stars; autopilot glider flying the mirrored-swoop figure
(WGSL single-thread pass), trail ring buffer, dashed intent-path ghost, glow sprite;
landed/blown-out detection with respawn; HUD (wind slider, glider status readback).
**121 fps at full res on Brian's M-series.** Big perf headroom.

**Verified physics:** lift band hugs the cliff face (gold sheet leaning on the escarpment),
plumes boil out of the ravines, lee is quiet. At 12 mph the glider soars the figure.

**Known visual issues (as of v0):**
- Ambient dust still too snowy, especially close up (base alpha 0.0018 — probably halve
  again or fade tiny/distant particles).
- Domain edges: terrain mesh ends in a visible dark slab side; needs edge skirt fade or
  fog trick. Ocean/apron seam sometimes shows as a dark band.
- Sky horizon band grayish; sun glow could be warmer.
- Terrain palette serviceable but not yet *beautiful* — sandstone blotches read hot.

## Coordinates & data (critical conventions)

- x = east (0 at west/ocean edge), y = north (0 at south edge), z = up (m). Right-handed.
- Sim grid NX×NY×NZ = 152×128×40, cell DXM = 2400/152 ≈ 15.79 m, cubic.
- Heightfield: 512×432 Float32, **south-first rows** (terrain.js already flipped from the
  USGS north-first file), meters. `window.BLACKS_TERRAIN` = {width, height, extentX=2400,
  extentY=2000, b64, gliderportXY≈[1000, 995], maxElev≈136}.
- Gliderport mesa ≈ 97 m elevation. Cliff face runs roughly N-S around x ≈ 900–1000.
- Wind day data: `data/wind-day.json` — NDBC LJPC1 (Scripps pier), 2026-06-19, hourly
  UTC; dirDeg is meteorological (direction wind comes FROM, true). Local-frame conversion:
  u_east = -speed·sin(D°), v_north = -speed·cos(D°). Not yet wired into the app.
- Buffer layouts: velocity `array<vec4<f32>>` (xyz m/s); particles `vec4` (xyz pos m, w =
  cached vertical velocity); glider state = 32 floats (see GLIDER_WGSL comment block:
  0-2 pos, 3 mode 0/1/2 = fly/landed/blown, 4 timer, 5 phase, 6 trailHead, 7 heading,
  8-10 desired pos, 11 frame).
- Uniforms `Params`: simDims(NX,NY,NZ,dx) / domain(DX,DY,DZ,time) / wind(speed,-,dt,slider01)
  / hmap(HX,HY,hdx,-). `Cam`: viewProj, invViewProj, eye+time, sunDir+slider, misc(aspect,focal).

## Testing recipe (IMPORTANT — headless does not work)

Headless Chromium: WebGPU runs on a software path — canvas screenshots come back
white/blank and the full sim stalls the event loop. **Always test headed** (a Chrome
window opens at screen position 1600,900; that's expected):

```bash
python3 apps/blacks-wind/tools/shoot.py <prefix> [settle_seconds] [wind_0..1000]
# writes <prefix>-{main,south,high,close}.png to cwd, prints HUD + fps + console errors
```

In-page hooks for tooling: `window.__capture()` → PNG dataURL rendered offscreen (true
pixels, works even where compositing doesn't); `window.__setCam(azim, elev, dist)`;
`window.__setWind(0..1000)`. URL `?tiny` = small grid for pure-logic smoke tests.
Playwright is installed. Use `/Users/b/.claude/jobs/72c480ac/tmp` for scratch files.

## Viz research (done — read before changing the look)

`apps/blacks-wind/research/wind-viz-survey.html`. Ranked recommendation:
1. **Base register = "marine layer + sun":** sparse advected haze/fog wisps lit by the low
   sun, seeded extra density where Q-criterion is high (rotors visibly churn). Diegetic —
   streamers of marine layer pulled up the cliff is what ridge lift actually looks like.
   No color-coding in this register; the physics is in motion and light.
2. **Reveal key (hold a key):** sun dims, same haze re-lit from within by vertical
   velocity w — ember lift band, teal sink sheet, transparent at zero. (Current v0
   particle coloring is a crude version of this as the *default*; the intended end state
   makes restraint the default and w-color the reveal.)
3. **Streaklets, not arrows:** short comet-tailed streaklets as a summonable pulse, not a
   persistent state. Literal arrow glyphs rejected (hedgehog problem).
Runner-up color fields: shear ("silk membrane peeling off the crest"), Q-criterion (as
fog *source*, not hue), pressure (whispered into terrain shading). Speed-as-color: never.

## Roadmap lanes (Brian-approved directions)

A. **Obstacle box** — drag to place a floating solid box (e.g. 200 ft up, seaward of
   takeoff); solid mask updates; flow reroutes live; glider reacts. Core sandbox want.
B. **Visual registers** — implement research recommendation: haze base + w-reveal key +
   streaklet pulse. Beauty bar: Brian should say "whoa."
C. **Real day mode** — drive inflow speed AND direction from wind-day.json (time-scrubbed,
   sped up ~60×); UI stays minimal (a small "jun 19" toggle next to the slider).
D. **Glider dramaturgy** — beach landings that read as a story (he lands ON the beach,
   waits, hikes back up... currently he just freezes); blown-out arc over the back
   (currently he vanishes at domain edge — better: tumble downwind, shrink, fade);
   multiple gliders? (Blacks usually has a handful up at once — very true to place.)
E. **Zoom-to-feature** — later; the "wind microscope" idea from Brian's texture note.
F. **Coastline fill** — coarse DEM well beyond the sim domain (La Jolla → Del Mar,
   ~12×12 km) rendered as background terrain with the same palette, no sim. The world
   shouldn't end at the domain edge. (Also fixes the visible domain-edge slab.)

**Extra-time ideas from Brian (2026-07-11, in priority-ish order):**
> "if there is extra time consider: searching for, finding adding trees, adding a lower
> fidelity wind simulation so things look continuous along the coastline, adding some
> basic gameplay features for users, also if all that is done, feel free to get creative
> have fun"
- Trees: the Torrey pines themselves (the reserve is full of them; instanced billboards
  or simple cones bent by local wind would be very alive).
- Low-fi coastline wind: a cheap 2D/analytic flow layer over the coarse surround so haze/
  particles don't dead-stop at the sim-domain boundary — continuity, not accuracy.
- Basic gameplay: undefined on purpose — keep it "natural in that" (his phrase), no
  points/streaks/badges (hard taste rule). Think: challenges of weather, not UI.
- Then: get creative, have fun (explicit permission).

## Also maintain
`VISUAL-DECISIONS.md` (same folder) — Brian asked for an explicit running list of visual
assumptions/choices/decisions. Append dated entries whenever you make one.

## Rules for subinstances

- The main instance owns integration; **only edit `apps/blacks-wind/index.html` if your
  lane brief says you own it right now** (single-file app; two agents editing = carnage).
  Data/prototype work goes in separate files (`data/*.js`, `research/`, `prototypes/`).
- Always verify with tools/shoot.py before reporting done; include what the screenshots
  showed. A lane that ships untested code is a failed lane.
- Don't commit/push; the orchestrator does.
- Match the register: warm restraint, Inter, no dashboard chrome, no gamification.
