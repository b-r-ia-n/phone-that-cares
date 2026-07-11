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

## 2026-07-11 (world lane: coastline surround + real trees)

**Coastline surround (La Jolla → Del Mar, 14×18 km coarse DEM)**
- Same terrain pipeline/palette as the detail domain — one TP uniform gained an
  origin/zBias/flag vec4 so both meshes share the shader. Continuity comes from the
  identical world-space mottling + fog; no separate "background register."
- Seam choice: **mask, not stack.** The surround discards its fragments inside the
  detail domain's rectangle (inset 55 m so there's an underlap ring), and sits only
  0.5 m low. History: first tried 1.5 m low — that drowned the surround's near-zero
  beach under the ocean plane and the domain's SW corner read as a hard rectangular
  cut in the sand.
- Beach shelf: the 3DEP surround clamps surf + sand to 0 m, so its shore fell
  straight into the sea while the lidar domain has a ~100 m beach. At decode we
  dilate the land edge ~2 cells (~70 m) seaward at 1.2 m elevation — a continuous
  sand ribbon now runs Scripps → Del Mar and through the domain seam. More truthful
  than the raw DEM (Blacks beach is real and about that wide).
- Fog does the distance work: at 5–10 km the surround dissolves into the mauve haze
  (continuity, not detail). Far plane 12 km → 30 km, zoom clamp 4.2 km → 12 km so
  you can pull back and see the whole coast; ocean apron already reached the horizon.

**Trees (14,050 real lidar canopy positions)**
- Register: two crossed alpha-cut quads per tree, per-tree rotation; crown = noise-
  broken ellipse SDF over the upper 2/3, thin stem below. Dark green albedo
  (0.105, 0.125, 0.085) with world-noise mottle — quiet dark presence, not green
  blobs. A fake rounded normal lets west faces catch a little SUN_COL (×1.35);
  east sides go near-silhouette. Trees dim with the reveal like all scenery.
- Tall crowns widen: halfW = max(1.15·r, 0.24·h), because the 30–43 m UCSD
  eucalyptus with narrow lidar radii read as office towers on the skyline.
- Rooted 2 m below z_ground so nothing floats where the 36 m surround DEM disagrees
  with the lidar ground sample.
- Wind: inside the sim domain each crown samples the solved velocity (nearest cell
  at 0.7·h) and leans by v·0.13 s, capped at 0.30·h, quadratic-in-height bend +
  a small speed-scaled shiver; outside the domain they lean with half the ambient
  inflow (new Cam.wind uniform, direction-aware for jun-19 mode). Verified: calm =
  upright, 60 mph = visible eastward lean, plausible at the cap.
- Perf: 121 fps unchanged (14k instances × 12 verts is nothing). Haze, reveal,
  streaklets, box, day mode, glider all verified unregressed by screenshot.

## 2026-07-11 (structures lane: real OSM buildings / parking / roads / trails)

**Source & scope.** `data/structures.js` (`window.BLACKS_STRUCTURES`) — OSM extract in the
same local frame as the lidar. All rendered as scenery (dim in the W-reveal, fog with the
scene). Built once at boot into four static vertex buffers (~86k building tris, 5.4k road,
1.9k parking, 0.8k trail) — one draw call each. No subsampling: everything ships (residential
La Jolla to the south, full UCSD/Salk campus). At dusk + fog the far sprawl recedes into
mauve haze on its own, so it reads as horizon city-glow, not clutter. 121 fps unchanged.

**Buildings (extruded footprint prisms).**
- Geometry: walls as quad strips + ear-clipped roof cap (non-convex OSM footprints handled;
  degenerate/sliver polys skipped defensively; z_ground outside −5..200 dropped). Base sunk
  1.5 m below z_ground so no floating gap where the coarse surround DEM disagrees with the
  footprint's sampled ground. Height = OSM height, min 3 m for untagged/zero.
- Palette: dark warm mass `(0.150,0.128,0.112)` × per-building hash (0.72–1.27), low WNW sun
  strikes west faces, east faces near-silhouette (falls out of diffuse), sky ambient fill.
- Window lights: sparse warm dots `(1.0,0.70,0.36)` on near-vertical faces only. Coarse
  3.7 m grid (≈one per storey), hash-gated ~5% lit (shop 20%), a centered pane per lit cell
  (not the whole cell). Added to surface colour before fog (so distant windows fade), dim
  ×(1−0.85·reveal). Reads inhabited-but-quiet; the south/vista views are the money shot.
- Gliderport shop: auto-detected as the nearest 180–600 m² footprint to (1008,1053); flagged
  warmer albedo `(0.205,0.150,0.112)` + denser/brighter windows — the one lived-in glow at
  the mesa edge. Verified: warm window visible from vista and close.
- Salk: rendered faithfully — its two footprints (1473,715 / 1473,772) are separate blocks,
  so the courtyard gap is inherent from above. No special handling needed.

**Parked cars (gliderport dirt lot only).** 8 small dark-cool boxes (2.3×1.0×0.75 m half-
extents, kind=2, albedo `(0.052,0.058,0.072)`, no windows) in a loose two-row cluster near
(1050,1050), seeded PRNG jitter + yaw, sat on sampled terrain +0.75 m. Deliberately subtle —
they mingle with the shop-side trees at vista distance (restraint per brief), texture up close.

**Parking (flat triangulated polys, z_ground + 0.25 m).** Surface attr: OSM `dirt`/`sand` →
sandy `(0.285,0.238,0.170)` (the gliderport customer lot, tagged dirt in the data); everything
else (incl. untagged `unknown`, which is mostly real paved campus lots) → cool worn asphalt
`(0.115,0.120,0.135)`. History: first dirt tone `(0.34,0.285,0.205)` read a touch pale/
prominent on the mesa; pulled down to keep it a quiet sandy clearing. Known simplification:
one constant z per lot, so a lot spanning a slope reads as a slightly flat shelf (fine on the
flat mesa where the gliderport lot lives).

**Roads / trails (ribbon triangles).** Per-segment quads offset by half-width in XY, laid at
vertex z + 0.40 m (roads) / +0.50 m (trails) to clear coarse-terrain interpolation error and
avoid z-fighting. Width = OSM `width` else class default; motorway (I-5) floored at 16 m.
Worn-asphalt tone, center marginally lighter (across-width t attr, `smoothstep` toward
`(0.150,0.150,0.155)`); NO lane markings, no glowing edges — reads as the faint gray web from
a real glider. Trails ~1.4 m, sandy `(0.30,0.25,0.185)`→`(0.40,0.34,0.25)`; the cliff hike
trail renders as a nice pale ribbon winding the face (glider path not re-routed).

**Known simplification (noted per brief).** Buildings/cars/box-less structures are NOT added
to the wind solver's solid mask — the flow does not see them. Fine for v1: they sit mostly
east of / on the mesa, out of the lift band the sim cares about. The only solid the solver
respects remains terrain + the obstacle box.

**Perf / regressions.** 117–121 fps across wind 0 / 330 / 1000. Zero page errors. Haze base,
hold-W reveal (structures dim correctly), S streaklets, B box, jun-19 day mode, coastline
surround, 14k trees, gliders (soar/blown), ocean, terrain all verified unregressed with
structures present.

## 2026-07-11 (Lane D: glider dramaturgy — story through the guy)

**The story is now a full loop, not a freeze.** The single glider became a small cast
(NG = 4). Failure is the drama; the guy negotiating the air is the whole point.

**Modes (per-glider state, stride 32 floats).** 0 fly · 1 flare · 2 sit · 3 hike ·
4 blown. Extra floats added over v0: 12 down-flag (0 mesa / 1 beach / 2 water),
13 hike-stage, 14–16 carried velocity, 17 tumble angle, 18 launch-grace, 19 glide-out.

**Sink-out → beach landing → sit → hike → relaunch (the wind-0 arc).**
- Give-up rule: while flying, if he drops below ground+22 m in air with w < 0.4 and
  horizontal flow < 13 m/s, he abandons the figure (`glideOut`) and makes for the sand
  (target x = 0.345·DX), bleeding altitude in lazy S-turns along the shoreline. If he
  catches lift on the way out (w > 1.8 or flow > 16) he cancels and soars again — the
  save is part of the story.
- Flare: within ground+5 m he levels, sheds speed (cvel damped exp(−1.1·dt)), settles to
  ground+1.2 m. Box-strike = a softer flutter-down (cvel ×0.3), same landed mode.
- Sit: 6–11 s (hashed per glider) catching his breath. down-flag from landing elevation
  chooses the narration: beach / just-offshore-swim / mesa.
- Hike: walks a real low-relief line — the ravine just south of the gliderport
  (5 waypoints 835,830 → 1000,950), climbing terrain+2 m at 13 m/s. Beach landings walk
  the whole trail (~25–30 s, watchable point rising up the face); mid-cliff and mesa
  landings join partway (stage 2 / 4) for a shorter climb. At the lip he relaunches
  facing west into the wind, with a 4 s grace so he doesn't instantly re-sink.
- Honest note: gliding out from a mesa relaunch he often intercepts the rising cliff face
  and settles on the shoulder (~60 m) rather than the sand — physically right (can't glide
  through a cliff), but the narration still says "mesa"; the beach line only fires on a
  genuine low landing (first sink-out from the hover usually reaches it). Left as-is —
  a cliff-specific label wasn't worth the WGSL risk for a vista-distance speck.

**Blown-away arc (the wind-1000 comedy beat).**
- "Hopeless" trigger: behind the lip in big air (x > 0.75·DX & wind > 15, or x > 0.44·DX
  & wind > 25) he's already lost — no need to wait for the domain edge. Also fires at the
  actual edges/ceiling. He converts to mode 4 with a launch velocity kicked downwind
  (inflowDir × wind × 0.8, floored) and hard up (z-vel ≥ max(wind·0.55, 7)): way up, then
  away. 12 s of tumbling (wing rotates on two axes, rate 2.2–3.3/s), gravity arcs him back
  over, he shrinks (last 1.5 s) and fog-fades to nothing, then respawns. Reads as a tiny
  comet flung up into the churning marine haze over the back — exactly "blown way up and
  away and back over la jolla." At max wind this loops ~15 s (he can't even complete a
  launch — correct: 99 mph is unflyable).

**The cast (NG = 4).**
- Each glider works his own stretch of ridge — different hover A/B latitudes, hover
  heights (40–78 m), figure periods (23–36 s), and start phases (0/.31/.57/.82) so the
  skyline feels inhabited, never synchronized. They all share the one solved wind, so they
  all sink out / blow away together when it turns.
- Only glider 0 is the **protagonist**: he alone keeps the warm glow sprite, the trail
  ring, and the dashed intent-ghost figure; the HUD narrates only him. Extras are quieter
  — wings scaled 0.85× and dimmed ×0.72, no glow, no trail, no ghost. Verified from the
  high oblique: protagonist reads clearly with his ghost loop; extras are faint white
  specks along the crest — present, not distracting.

**Protagonist glow follows the story.** Default warm dot (22 m, α 0.28); down = ember
breathing slow (16 m, α 0.14 + 0.08·sin); hiking = a small warm point (9 m); blown =
fades out with him over 6 s. The wing tints ember-red while down, fog-fades fully before
respawn when blown.

**Trail artifact fix.** The ring buffer is re-seeded (all TRAIL_N verts set to current
pos, w = 0, head → 0) on every relaunch and every blown-respawn — kills the straight-line
jumps across the mesa the old single-clearless buffer drew. Trail records only while the
protagonist is airborne (modes 0/4), ~10 Hz.

**Quiet HUD narration (protagonist only).** One line, no chrome: "soaring · N ft" /
"sinking out — making for the beach · N ft" / "flaring to land" / "down on the beach —
catching his breath" (or mesa / "splashed down just offshore — swimming in") /
"hiking back up the trail · N ft" / "blown over the back — somewhere past la jolla by now".

**Calm-air dissipation (supporting physics tweak).** Advection retention now
mix(0.9965, 0.999) scaled by wind/5 — at dead calm residual motion actually dies in a few
seconds instead of coasting, so the wind-0 "he just glides down, can't stay up" story is
true. No effect above ~5 mph inflow.

**Perf / regressions.** 121 fps at full res (4 gliders is 1 workgroup of 4 threads —
nothing). Verified unregressed by screenshot at wind 0 / 150 / 300 / 1000: haze base,
hold-W reveal, S streaklets, B obstacle box, jun-19 day mode, coastline surround, 14k
trees, ocean, terrain. Zero page errors across all runs.
