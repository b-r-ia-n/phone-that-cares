A "Discover" page for a speculative mobile OS called "A Phone That Cares About You." This page replaces the user's scrolling on Instagram, TikTok, YouTube, Substack, etc. — it acts as a meta-feed where they can either see a curated mix across all their interests and sources, or switch into a specific source feed to scroll that platform directly. The thesis: suck all the juice out of social media apps into one place, then layer calm UI interventions on top.
Aesthetic: Very dark near-black background. Quiet, calm, beautiful. Line-based icons. Cool neutral palette with soft desaturated accents. No warm amber. Matches the rest of the OS visual language.
Header (top of page):

Back arrow top-left, small and quiet.
The word "Discover" in quiet sans-serif, left-aligned, as the largest text on the page — this is the primary header and should be visually dominant in the header area.
Top-right, to the right of the Discover title: two small quiet elements, not pill-shaped, not containerized — just small text and icons sitting directly on the dark background:

A small line-icon bell for notifications (opens the Notifications page when tapped). Small — roughly 18–20px.
Next to the bell, the word "Grayscale" in small low-opacity text followed by a tiny up-arrow icon (indicating it expands a panel). Same visual weight as the bell, roughly matching it in scale. Tapping this opens the scroll settings panel.



Both the bell and the "Grayscale ↑" indicator should be small, quiet, and NOT contained in pills or rounded rectangles — they float directly on the background as inline text and icons. They should read as ambient status indicators, not buttons.
Category chips (below the header, horizontal scrolling pill chips for topic filtering):
A horizontal row of small rounded pill chips, each filtering the current feed by topic. These pills should be noticeably SMALLER than the "Discover" header — about 60–70% of the scale they would normally be. The active chip has a slightly brighter fill; inactive chips are quieter.
Chips, left to right (with the edge of more implied on the right):

Highlight Reel (active by default)
Surfing
Ceramics
Dank memes
Trail running

Main content — the feed:
A vertical scrolling feed with tight density — no card containers, no rounded rectangles around posts, no background fills on individual posts. Media goes full-bleed horizontally (edge to edge across the screen width, no side padding). Minimal gaps between posts (roughly 4–8px of dark background between each post). This should feel like scrolling Instagram or TikTok, not a premium magazine app.
Each post includes Instagram-style metadata so it feels native rather than scraped:

Poster username below or overlaid on the media (e.g. @surflinechronicles)
Song name for video content, as a small line with a music note: ♪ Floating Points — Birth
Caption preview — one line of small text from the post's caption, truncated with "...more"
Source indicator — small plain-white abbreviation (IG, YT, SS, RD) in the top-right corner of each media element, no background, roughly 11–12px

Video content (IG reels, YouTube, TikTok) shows a medium-to-large centered play button overlaid on the video frame — semi-transparent white circle with a play triangle inside, roughly 48–56px diameter, centered. This is the standard visual language for "this is a video, tap to play."
Specific posts for the Highlight Reel default view (top to bottom):

Instagram portrait video (9:16 aspect ratio, tall) — surfing clip at Mavericks. Username @surflinechronicles, song credit ♪ Floating Points — Birth, caption preview "Morning glass, no one out. Felt like stealing ...more". Centered play button. Small "IG" label top-right of the media.
Substack landscape post — photo of wood-fired ceramics, title "Glazing techniques for wood-fired ceramics" overlaid at the bottom in smaller text, author Studio Notes. Small "SS" label top-right.
YouTube landscape video (16:9) — another surf clip, title "Why Nazaré broke its own record this winter", channel name below, view count, centered play button. Small "YT" label top-right.
Reddit square meme (1:1) — actual meme image. Small "RD" label top-right, subreddit name like r/surfing as small text below.
Another Instagram portrait video — different topic like ceramics or trail running, showing the mix continues.

Continue implying more posts below.
Bottom tab bar — persistent source switcher (THIS IS IMPORTANT):
A persistent horizontal bar at the very bottom of the Discover page, similar to Instagram's bottom navigation or TikTok's bottom bar. Contains 5 small icons evenly spaced. The currently active source is at 100% opacity; the others sit at roughly 40–50% opacity. Tapping an icon switches the entire feed to that source.
The 5 sources, left to right:

Highlight Reel (active by default) — a small sparkle, star, or "featured" icon indicating the curated mix across all sources
Substack — the Substack logo if the tool can render it, otherwise a small document/newspaper line icon
YouTube — the YouTube logo if renderable, otherwise a small play-in-rectangle line icon
Instagram — the Instagram logo if renderable, otherwise a small camera/polaroid line icon
Twitter/X — the X logo if renderable, otherwise a small bird or X line icon

No text labels under the icons. The bar itself should be subtle — a thin top border separating it from the feed content, or a slight gradient fade. Roughly 56–64px tall. This bar is persistent and always visible at the bottom of the Discover page regardless of scroll position.
The "Discover" header is clearly dominant over everything else in the header area. The bell, "Grayscale ↑", and category chips should all feel secondary and smaller in comparison.
Scroll settings panel (the overlay that opens when the user taps "Grayscale ↑"):
When the user taps the "Grayscale ↑" text in the header, a panel slides up from the bottom of the screen. This panel opens WITHIN the phone mockup frame, not as a full-screen overlay outside the phone. It should appear as if it's happening inside the phone, not as a separate modal that breaks out of the device frame.
Panel contents:

Header: "Scroll settings" in quiet sans-serif, with a small × close icon in the top-right of the panel
Small label: "CURRENT" in tracked-out caps
Row showing active experiment: Grayscale with description "The feed gradually loses color over time" and a soft radio indicator
Small label: "OTHER WAYS TO SCROLL"
List of 4–5 other options, each a quiet row with name, one-line description, unselected radio:

Tweet padding — spreads the feed out over time
Feed blur — gradually softens the timeline
Font cycling — alternates serif and sans-serif
Break cards — small pauses between posts
None — feed as-is


Small label: "TIME TO FULL EFFECT"
Horizontal slider with Instant · 10 min · 20 min labels, currently set near the 20 min end
At the bottom: two small stats side by side in tracked-out caps — "SESSION" / "1:30" and "WORDS" / "398" — with a small reset icon

The panel uses the same dark aesthetic as the rest of the OS, with subtle rounded-rectangle row containers at 4–6% white fill. The Discover feed behind the panel is dimmed.
Overall feeling: A rich, dense, visually juicy feed that genuinely competes with Instagram or TikTok for attention, with calm quiet chrome around it (small header, small status indicators, subtle category filtering, familiar bottom navigation). The interventions layer is present but not dominant — you see that grayscale is happening, you see you can change it, but the content itself is the star of the page. Content forward, navigation minimal, interventions quietly in the background.