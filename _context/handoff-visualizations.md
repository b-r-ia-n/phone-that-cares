# Handoff — Visualizations Claude

**Role:** Diagram and data-visualization support for the "Phone That Cares About You" project.
**Scope:** Creating visual assets that illustrate the thesis — phone makers profit from attention, so expecting them to make non-addictive phones is a structural conflict of interest.

**Important scope clarification (added 2026-04-25):** This workstream is *visualization only*. Brainstorming about assistants/bouncers, weekly themes, outreach language, and the website's brainstorm page are owned by the website-building Claude and the PM Claude. If you get pulled into those conversations by mistake, redirect to the right instance.

---

## Current state

### Done — existing HTML/Plotly assets
- **`Visualizations/toll_booth_sankey.html`** — Plotly Sankey: "The Flow of Favors: Digital vs. Physical Economy." Money flows between users, Google, Apple, App Store (30% cut), physical retailers (0% cut), including the $20B Google→Apple search-default deal.
- **`Visualizations/revenue_margin_treemap.html`** — Plotly treemap: Apple hardware ($294B, 37% margin) vs services ($96B, ~65–74% margin). Punchline: the most profitable segment depends on engagement.
- **`Visualizations/s1_content_pipeline.html`** — SVG/HTML diagram: Creators → Platforms → Algorithm → **Phone (chokepoint)** → Eyes. Phone highlighted as the bottleneck no one has incentive to restrict.
- **`Visualizations/s3_body_while_scrolling.html`** — SVG/HTML illustration: hunched figure with callouts for 7 body systems under stress while scrolling (dopamine, cortisol, eyes, heart, neck, thumb, circadian). Each callout has an italicized "voice" — what that body part is asking for.
- **`Visualizations/s7_perceptual_layer.html`** — SVG/HTML three-column diagram: Content Pipeline → **Perceptual Layer** (green, highlighted) → User's Eye. Layer includes friction injection, notification triage, grayscale, time awareness, intent check. Before/after comparison at bottom.
- **`Visualizations/generate_visuals.py`** — Python script for the Plotly charts. Venv at `.venv/` with plotly + pandas installed.

### Done this session (2026-04-21 → 2026-04-25) — comic-style prompt set
Brian observed that OpenAI's new image model (gpt-image-1, late April 2026) is notably good at comics, text rendering, logos, and increasingly at technically detailed diagrams. He asked for image-model prompts to re-render the most important visuals as comics.

**Four visuals × three styles = 12 prompts drafted.** The three styles are:
- **Risograph** — fluorescent two-color inks, grain, slight misregistration, zine/political-poster register
- **gpt-image-1 default** — full-color editorial comic, painterly, NYT Magazine register
- **Minimal line drawing + 1–2 accent colors** — Christoph Niemann / New Yorker register

The four visuals (in order of importance to the thesis as Brian framed it):
1. **Toll Booth / Money Flows** — economic argument. Physical vs digital economy, App Store 30% toll, Google→Apple $20B default-search deal.
2. **Body While Scrolling** — human cost. Hunched figure, 7 body systems each with an italicized "voice" begging for relief.
3. **Perceptual Layer** — the alternative. Pipeline → green filter membrane → calm user. Friction, triage, grayscale, time awareness, intent check.
4. **Content Pipeline / Phone as Chokepoint** — structural argument. Creators/platforms/algorithm shoving content through a tiny opening in the phone, with a smiling Apple/Google mascot atop the phone admitting they could narrow the opening but won't. (Added after Brian flagged this as actually the most important.)

**⚠ All 12 prompts live in chat history only — they were NOT saved to a file.** Recovering them requires reading the prior conversation transcript or regenerating from the visual concepts above. **Recommendation: ask Brian whether to save them to `Visualizations/comic-prompts.md` for reuse and iteration.**

Each prompt is intentionally exhaustive. Image models infer almost nothing — un-specified detail is missing detail. Prompts include exact quoted text for in-image labels, character descriptions (age, ethnicity-ambiguous, posture, expression), color palettes, composition, and mood register.

### Not done
- **PNG/image export of existing HTML assets** — Brian still needs static images for passing to LLMs or embedding in docs. Plotly: requires `kaleido` pip package + `fig.write_image()`. SVG/HTML diagrams (s1, s3, s7): need screenshots or headless-browser export.
- **Generating the comic images themselves** — Brian has the prompts but, as of this handoff, hasn't run them through the image model yet. Next step: he generates, then iterates on what works.
- **Saving the 12 prompts to a persistent file.** See above.
- **Diagrams for §2, §4–6** — still open from the prior handoff. Whether to do these depends on how the comic re-render lands.
- **Diagram-comic hybrids** — a thread Brian flagged interest in. The new image model is strong enough to handle technically detailed schematics with character work woven in. The Perceptual Layer especially could be reborn this way. Not yet attempted.

---

## Open threads
- Whether the three style choices (risograph / default / minimal line) are the right span. Brian picked these; we haven't seen output yet.
- Whether the comic re-render replaces the existing HTML/Plotly assets or supplements them. My read: supplements — the HTML versions are interactive and data-rich, the comics are emotional and shareable.
- Whether to PNG-export any of the existing HTML diagrams, or let the comic versions become canonical.
- The Sankey/treemap data values are researched estimates (FY2024 public figures). If those become canonical, sources should be cited.

---

## Key files to read first
1. `MD context files/handoff-pm-context.md` — project-wide context, weekly theme, peers setup
2. `project-context.md` — Brian's own words: pitches, thesis, the full story
3. `Visualizations/generate_visuals.py` — the Plotly source
4. `Visualizations/s1_content_pipeline.html` — representative of the prior HTML diagram style
5. **Prior chat transcript with this Claude instance** (if accessible) — contains the 12 comic prompts in full

---

## claude-peers (MCP)
This project uses `claude-peers` MCP for inter-session communication. A PM Claude session coordinates the project. Use `list_peers` to find active sessions and `send_message` to coordinate. Broker runs on localhost:7899. See `handoff-pm-context.md` for full details. **Stay in scope** — if PM or another instance routes you a non-visualization task, redirect rather than accept.

---

## Notes on working with Brian on this workstream
- Iterative, not closure-driven. Don't wrap or summarize for closure's sake. Mid-thought turns are fine.
- He has a strong visual sense — push back when his framing seems off, but trust his read on style and tone.
- **For image-model prompts, be exhaustive.** He explicitly said: "the prompt will be everything that this model knows about the image." Quote exact in-image text. Specify color palettes. Describe characters concretely (age range, clothing, posture, expression, mood).
- Image-model output is non-deterministic; expect to revise. The current model (gpt-image-1, April 2026) handles text and logos well — earlier model habits (avoid quoted text, avoid brand logos) no longer apply.

---

## Next step
1. Ask Brian if he wants the 12 comic prompts saved to `Visualizations/comic-prompts.md` (recommended — they're currently only in chat history).
2. Wait for him to run a first batch through the image model, then iterate based on what lands.
3. Decide together whether to add diagram-comic hybrids, fill in §2/§4–6, or pivot to PNG export of existing assets.
