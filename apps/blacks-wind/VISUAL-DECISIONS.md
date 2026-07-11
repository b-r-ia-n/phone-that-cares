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
  visual-registers rebalance.
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
