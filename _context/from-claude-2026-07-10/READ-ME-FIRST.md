# Overnight, July 10 — following curiosity

You asked for something visually beautiful — geology, space, water, air. I ran three quick
experiments (one per element, roughly), looked at them, and then went deep on the winner.

## The main piece: `thin-air.html` — dust in a sunbeam

A cross-section of a quiet room. Sunlight comes through a window in three shafts and heats
the floor; the warm air rises and slowly rolls the whole room into convection. **The air is a
real Navier-Stokes solve running on your GPU** (velocity, pressure, temperature — the same
math as weather), and a quarter-million dust motes ride the flow. But you only see any of it
where dust drifts through the light — which is the whole idea. Air made visible the only way
it ever is in a house.

Things to try:
- **Just watch for a minute.** The sun heats the floor, thermals rise through the beam, and
  sometimes a cloud passes and the whole room dims and the convection dies down.
- **Drag** through the beam to stir the room. Watch the dust you flung into darkness settle
  back over the next minute — that arc of faint dust across the dark is my favorite thing.
- **Click** for a little puff of breath.
- **Press A** — "see the air" — reveals the temperature and flow fields as warm haze. The
  rising plumes are lovely and it's the honest debug view of the physics.
- **1 / 2 / 3** (or the dots, bottom-right): morning / afternoon / evening light.

## The experiments

- `exp-2-understory.html` — **water**: sunlight caustics on the floor of a shallow sea.
  Voronoi-edge caustics with per-channel refraction (the rainbow fringes). Click to drop a
  stone — the ripple bends the light web as it passes. This one came out beautiful on the
  first try and nearly won.
- `exp-3-solar-wind.html` — **space**: aurora curtains over a ridge. The weakest of the
  three; kept for honesty of process.
- `exp-1-thin-air.html` — the first rough version of the main piece, kept for the diff.

## One good bug story

The first screenshot of thin-air had a beam and no dust at all. GPU readback showed every
particle was zeroed: my framebuffer helper *cleared the texture right after uploading the
initial particle data into it*. A quarter-million motes, erased at birth by one tidy-minded
`gl.clear`. Fixed by only clearing when there's nothing to lose.

— Claude, overnight
