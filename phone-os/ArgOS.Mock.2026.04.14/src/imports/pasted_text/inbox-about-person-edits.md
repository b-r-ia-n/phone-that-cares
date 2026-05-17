Prompt 1: Edits to Connect inbox

Keep the current Connect page exactly as it is with the following edits:
1. Row structure — one rounded rectangle divided by a vertical line. Each conversation row should be a single rounded-rectangle container (12–16px corner radius, ~4–6% white fill) divided into two tappable zones by a thin vertical divider line (about 10–15% white opacity). The corner radius applies to the outer edges of the whole row only — the junction where the two zones meet is a clean vertical line, not rounded. Visually: one pill-shaped container split down the middle.

Left zone: Narrow, contains only the circular contact photo with comfortable padding. This zone is tappable and opens the "About this person" page.
Right zone: Wider, contains the name, message preview, and time-since indicator. This zone is tappable and opens the message thread.

The thin vertical divider is the only thing separating them. No gap of dark background between the two zones — the container is continuous, just divided.
2. Fix the cutoff at the bottom of the mockup. The Marcus callout card and bottom tab bar are currently getting clipped. Add roughly 30–40px of bottom padding inside the phone frame so all content is fully visible.
Everything else stays the same.


Prompt 2: Edits to About this person page

Keep the same aesthetic — very dark near-black background, quiet, calm, line-based icons — and rework the layout as follows. The goal is to make Think Out Loud happen natively on this screen, not as a button that navigates elsewhere.
1. Header row (top of screen):

Back arrow top-left, small and quiet.
Top-right: the person's small circular photo (~48px) with a thin quiet ring, and immediately to the left of the photo, the person's first name in medium-weight sans-serif at roughly header-scale. Photo and name sit together as a unit in the top-right. No large display-scale name in the body of the page.

2. Directly below the header, the context strip (single row of icons):
A single horizontal bar with 4–5 small line icons evenly spaced, each representing a type of context about this person (notes, open loops, shared history, rituals, contact details). Same subtle rounded-rectangle treatment as before. Tapping an icon expands a small inline panel below with 2–3 lines of AI-surfaced content. Default state: nothing expanded.
3. Middle of screen — the meaningful content:
A quiet section showing 2–3 short AI-surfaced observations about recent dynamics with this person. These should be calm, lightly positive or neutral framings of normal interaction patterns — not dramatic, not nagging, not fake-cheerful. Think of it as what a thoughtful friend might notice. Examples (vary these, don't use all):

"You and Caroline usually talk every couple of weeks. You tend to send each other photos from trips."
"Your last few exchanges have been about the book club. She seemed excited about the March pick."
"You two often talk in the evenings. Your conversations tend to run long."

Each observation is a short paragraph or single sentence, low-opacity, generously spaced. No icons next to them, no cards, just quiet text. This is the "meaningful content" that grounds the page — it should feel observed, not inferred or generated.
4. Bottom of screen — the Think Out Loud space (native, not a button to elsewhere):
This is where Think Out Loud actually happens, directly on this page. Layout:

A soft, centered invitation line in medium-scale type: "What's on your mind about Caroline?" (or varied, see below).
Below that, a small secondary line suggesting what the user might say, styled quieter: "You can talk about how you've been feeling, something you want to say, or just sit with it for a second."
Below that, a large soft breathing microphone affordance — a circular container with a mic icon inside, gently pulsing or with a soft glow, indicating the phone is ready to listen. Not a flat button. Roughly 64–80px diameter, centered.

The user arrives on this page and can immediately tap the mic (or, ideally, the mic is already listening when you arrive). No navigation to another screen.
Copy variations for the invitation line — the tool should pick one and the others are guidance for tone. All should be warm, calm, lightly positive, not dramatic:

"What's on your mind about Caroline?"
"What do you want to say to her?"
"How are you feeling about Caroline today?"
"Anything you've been wanting to tell her?"

Avoid: "You two haven't vibed in a while. Want to talk about it?" — too diagnostic. Also avoid any framing that implies something is wrong or needs fixing.
Remove entirely:

The "Think out loud about it →" button that navigated to another screen. Replaced by the native mic interaction at the bottom.
The large display-scale "Caroline" name in the middle of the page. Replaced by the small name next to the photo in the header.
The "You last talked X hours ago, you've messaged X times" line. Replaced by the more meaningful observed-dynamics content in the middle of the page.

Fix the bottom cutoff — add 30–40px of bottom padding inside the phone frame so the mic and content are fully visible.


Prompt 3: Edits to Discover page

Keep the current Discover page structure and aesthetic with the following edits:
1. Mix the content sources from the very first card. Right now the top of the feed is all ocean/surfing imagery, which reads as a single-topic feed. Instead, interleave clearly different interest areas starting from the top card. Use this order:

Card 1: A surfing photo from Instagram (current top card is fine).
Card 2: A ceramics post — "Glazing techniques for wood-fired ceramics" — from a blog or Substack, with an image of a ceramic piece with ash glaze or similar.
Card 3: A different surfing post — maybe a YouTube video thumbnail with a play button overlay, titled something like "Why Nazaré broke its own record this winter".
Card 4: A dank meme — a meme image with its source platform badge (Reddit, Twitter, etc.).

The point is that by the time the user has scrolled past 3–4 cards, they've clearly seen content from multiple interests and multiple source types. Surfing and ceramics and memes in the first four cards, not all surfing.
2. Shift the visual treatment from "cards with metadata below" to "feed content with inline branding." Right now each card is an image with a separate text block underneath showing source badge, category, title, author. This reads as a list of links, not a feed. Instead:

Text overlays the image when there's imagery — title in white with a soft shadow or gradient scrim at the bottom of the image, source badge in the top-left corner of the image at low opacity.
Video content shows a small semi-transparent play button overlaid on the image, centered.
Remove the large separate text block beneath each image. Keep source and title compact and integrated with the visual.
For text-only content like articles, keep a card treatment but make it tighter — title prominent, source as a small badge, no big author line.

The goal: scrolling Discover should feel like scrolling the content itself, not scrolling a list of links to the content. The user is already in the feed.
3. Keep everything else — the category chips at the top ("For You Today", "Surfing", "Dank memes", etc.), the header, the dark aesthetic.


Prompt 4: Edits to Ask (voice AI) page

Keep the current Ask page mostly as it is — the design is working well. Two edits:
1. Remove the phone's time and date from behind the content. Currently the lock screen's clock and date are showing through the overlay and overlapping with the page's text. Remove them entirely from this screen. Keep the dark background, but no time/date bleeding through.
2. Keep the pattern of "a question + a quiet suggestion of what you might ask" — e.g. "What do you want to do?" as the main line, with a smaller secondary line below like "You can ask me to text someone, set a reminder, look something up, or just think through something with you." This same pattern should be mirrored in the Think Out Loud section of the About this person page (covered in that prompt separately), to establish a consistent voice-input visual language across the OS.