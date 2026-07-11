# Visual assumptions / choices / decisions — running log

Brian asked for an explicit list, kept current as we go. **Append, don't rewrite history;
date each entry. If you change a decision, add a new line saying so and why.**

## 2026-07-11 (v0, main instance)

**World / mood**
- Time of day: dusk, sun low WNW (dir-to-sun ≈ (-0.86, 0.20, 0.24)) — chosen because the
  place is west-facing and evening glass-off is a real (and the prettiest) Blacks
  condition. Not yet user-adjustable; a time-of-day control is a plausible future knob.
- Sun color #ff9e57-ish (1.0, 0.62, 0.34); sky = warm horizon band → deep blue-violet
  zenith, a few early stars above dir.z ≈ 0.3, dithered to kill banding.
- Fog: exponential, k = 0.00019/m, warm gray-mauve (0.30, 0.26, 0.27). Assumption: hazy
  marine evening, ~5 km visibility feel.
- Camera default: from over the ocean WSW of the gliderport (azim −2.9, elev 0.13,
  dist 1600 m), target the gliderport at 70 m — "standing off the cliff in the air."

**Air (current interim register — will be superseded by the haze/reveal plan)**
- ONE salient variable: vertical velocity w. Rising = warm gold (1.0, 0.74, 0.40),
  sinking = dim slate blue (0.30, 0.44, 0.62) at ~40% of rising's strength, dead air
  near-invisible. Full-scale |w| = 4.2 m/s, response curve pow 2.3 (sparse colormap —
  only genuinely working air lights up).
- Particle sprites: 2.0 m gaussian billboards, base alpha 0.0007, rising max +0.055,
  sinking max +0.02, additive. (History: started 5 m/0.02 base — read as gold blizzard;
  Brian: "too opaque/large/dense, i want to see the detail of the cliffs" → cut ~2.5×.)
- 262,144 tracers, mostly respawning upstream over the ocean weighted toward low
  altitude, ~25% volume-filling so the lee isn't empty.

**Terrain**
- Real USGS 1m lidar (bare earth), 512×432 @ ~4.7 m. Palette: sage scrub (0.27,0.28,0.21)
  on flats, sandstone (0.52,0.40,0.27) on slopes (slope > ~0.2 blends in), sand band
  below 9 m, value-noise mottling at two scales. Assumption: muted, warm, no vegetation
  geometry yet.
- Ocean: separate infinite plane at z = −0.4 (terrain fragments below 0.4 m discard);
  fresnel toward horizon color, sun glitter (pow 90 spec + wide pow 7 sheen), slow
  value-noise swell tilting normals. Deep water (0.055, 0.095, 0.115).

**The guy**
- Delta wing ~14 m span — deliberately ~1.5× oversize so he reads at vista distance;
  plus a soft warm glow sprite (22 m gaussian, alpha 0.28) so the eye can find him.
  Assumption: legibility beats scale accuracy at 1.6 km.
- Trail: 256-point ring, warm white (1.0, 0.92, 0.75), alpha fades pow 1.5 oldest→newest.
- Intent figure: dashed ghost line (2-on-2-off per 4 verts), alpha 0.10 — visible if you
  look, silent if you don't. The realized-path-vs-intent gap is the story.
- Landed tint: wing goes ember red (0.9, 0.4, 0.3) while mode ≠ flying.

**HUD**
- Inter, 12 px, warm off-white at ~50% alpha, bottom corners only. One slider (wind).
  No panels, no numbers unless they're the salient variable (mph readout, glider ft).

## 2026-07-11 (Lane A: obstacle box + jun-19 day mode)

**The box**
- Look: a quiet dark slab in a weathered-timber register — warm dark albedo
  (0.21, 0.165, 0.125) with value-noise mottling, lit by the same low sun + sky ambient,
  fogged with the scene. Deliberately NOT techy (no wireframe, no glow, no ghost preview):
  it should feel like an object hanging in the evening air, not a debug gizmo.
- Default size/placement: 90×90×45 m slab (~300 ft square), centered 300 m seaward of
  the gliderport, bottom face ≈ 60 m over the water — right in the lift band's approach,
  per Brian's original "big box hovering 200' in the air" phrasing.
- Interaction: tap B toggles; hold B + drag moves it in the vertical N-S plane; hold B +
  scroll pushes it east/west. Kept off the HUD — one line of hint text only.
- Glider vs box: flying into it = crash (same landed mode as terrain). Particles die
  inside it (no tracers passing through the solid).

**jun 19 day mode**
- Toggle is a small dotted-underline text button left of the wind slider; when on, the
  slider hides (the day drives the wind — one salient variable at a time) and the readout
  becomes `jun 19 · 5:45 pm · 9 mph WNW` (local PDT clock, compass direction).
- Time scale: 90 sim-seconds per hour (~36 min per looping day). Direction lerps
  shortest-path between hourly obs; gusts scale with the obs gust-minus-mean.

**Noted, not yet fixed**
- Dust curtain pools at the NW corner at low wind (respawn-zone pileup) — for the
  visual-registers rebalance. *(Fixed by the registers lane, see 2026-07-11 Lane B.)*
- Trail draws straight-line jumps across the mesa after a respawn (ring buffer not
  cleared) — for the dramaturgy lane.

**trees data (2026-07-11, trees lane)**
- Tree positions are REAL, not procedural: canopy height model from the same USGS 2014
  San Diego lidar as the terrain (EPT point cloud, first returns minus ground), local
  maxima >= 2.5 m. 14,050 trees in `data/trees.js` (6,372 inside the sim domain, rest
  extend ~2.7 km north into the reserve); x,y,z_ground,height,radius packed Float32.
- Buildings rejected by roof-plateau + no-ground-visibility test; cliff-edge CHM
  artifacts rejected by local ground-relief test. Beach/cliff face/ocean verified clean
  in `data/trees-preview.png`.
- Heights 2.5-43 m (median ~9). The tall dark-green mass in the SE corner is the real
  UCSD eucalyptus grove — keep it; it anchors the place. Torrey pines proper are the
  scattered 5-15 m crowns on the canyon rims and the reserve mesa.
- Vintage is 2014: renderer shouldn't promise current campus landscaping.

## 2026-07-11 (Lane B: visual registers — haze base / w-reveal / streaklet pulse)

**Base register is now "marine layer + sun" (supersedes w-colored particles as default)**
- 262,144 tiny (2 m) w-colored grains → 65,536 soft haze wisps, 13–34 m gaussian
  billboards, flattened 0.62× vertically (stratified marine air) and stretched up to
  +0.42 when rising ≥2.5 m/s — streamers visibly elongate up the cliff face.
- No data color in this register. Wisp color = dusk haze (0.40, 0.37, 0.43) warmed
  toward the sun color by forward scatter (0.22 floor + 0.60·pow(mu, 2.5), mu = view·sun)
  so haze between eye and sun catches gold, the rest stays gray-mauve.
- Churn = |curl| of the local velocity (6 extra trilerp taps per wisp, smoothed
  0.06/frame, normalized at 0.30 s⁻¹) drives opacity: baseA = 0.007 + 0.022·churn.
  Rotors and the shear band boil with haze; laminar air is near-invisible. This is the
  cheap Q-criterion proxy from the survey.
- Stratification: alpha ×(0.35 + 0.65·e^(−z/140)) — the layer hugs low, thins aloft.
- Per-wisp life 24–48 s with 4 s fade-in / 5 s fade-out; near-camera fade
  (smoothstep 60→300 m) + size shrink below 400 m so wisps never blob the lens;
  distance softening by fog (×(1 − 0.65·fogMix)).
- Respawn distribution (this also killed the NW dust curtain): 45% marine feed spread
  across x = 0.03–0.38 DX at z ≤ ~150 m, 15% "lift intake" just off the cliff base
  (x = 0.26–0.40 DX, ≤70 m above ground), 40% volume fill. Age-staggered init + fade-in
  means no visible spawn seam; life turnover stops low-wind pooling. Verified clean at
  2 mph from the high oblique.

**Reveal register (hold W, or window.__setReveal(0..1))**
- Crossfade uniform (Cam.misc.z), ~300 ms linear ramp both ways. Nothing pops.
- World dims with reveal: sun terms ×(1−0.85r) in sky/ocean glitter, ×(1−0.78r) on
  terrain/box diffuse, ambient ×(1−0.30r), fog color ×(1−0.45r), sky base ×(1−0.40r).
  Stars keep full brightness — night leans in while you look at the air.
- Same wisps re-lit from within by w: rising = pow(clamp(w/4.0), 2.0) → ember gold
  (1.0, 0.55, 0.16) + white-hot core (rising²·0.5 of (1.0, 0.88, 0.66)); sinking =
  pow(clamp(−w/2.5), 2.0) → teal (0.12, 0.55, 0.58); transparent at zero (base 0.0010).
  Alphas 0.019 rising / 0.012 sinking.
- In reveal, wisps shrink to 0.6× and the gaussian softens (exponent 2.6 → 2.0):
  tighter grain = less additive stacking = embers, not a fire wall. (History: first
  attempts saturated the whole escarpment orange — a 25 m sprite has ~150× the area of
  v0's 2 m grain, so per-wisp alpha had to drop ~5× and sprites shrink before the
  column integral behaved.)
- Honest caveat: at 12+ mph the whole escarpment genuinely works, so from the head-on
  vista the ember field is broad, not a thin band. The south view (looking along the
  cliff) is the money shot — a curling gold plume over the lip.

**Streaklet pulse (tap S, or window.__pulse())**
- 4,096 comet-tailed segments reseeded per pulse (time-salted so each pulse differs),
  staggered birth over 0.7 s, life 3.0–4.2 s, fade-in 0.25 s, fade-out from 55% of life.
  Compute + draw fully skipped once the pulse expires (zero cost when idle).
- Spawn hugs the story: x = 0.08–0.70 DX, z = ground + pow(r, 2.2)·300 — mostly low,
  over the cliff zone, few wasted in empty sky.
- Tail length = speed × 2.2 s (clamp 4–90 m) — speed encoded as geometry, never color.
  Screen-space ribbon, 0.9 m min half-width (~1 px floor at vista distance), head
  warm-white (1.0, 0.90, 0.75) fading to transparent tail. Alpha gated by speed
  (smoothstep 2→8 m/s) so dead air barely whispers; near fade 120→420 m.
- No arrows, ever. In stills the pulse can read slightly rain-like; in motion the
  streaklets advect coherently along the flow (the nullschool effect).

**Keys & HUD**
- Hold W = reveal, tap S = pulse, B unchanged (box). One quiet hint added to the
  existing HUD line: "hold W: lift & sink · S: streaklets". No new panels.
- Tooling hooks: window.__setReveal(v|null), window.__pulse().

**Perf / regressions**
- 121 fps at full res (unchanged from v0 despite 7 velocity taps per wisp — wisp count
  is 4× lower). Box, jun-19 day mode, glider, ocean, terrain verified unregressed.
