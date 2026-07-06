#!/bin/bash
# Nightly rig — run wrapper.
# Assembles WHO (persona + Oblique card) / WORLD (thin map + freshness) / WHAT
# (Brian's verbatim message) into one prompt and hands it to a headless claude run.
#
# Usage:
#   run.sh --dry-run    # print the assembled prompt, do NOT call claude
#   run.sh              # execute the nightly run (Opus 4.8, medium effort)
#
# Selection is DETERMINISTIC from the date, with separate salts so persona and
# card don't move in lockstep (keeps the pairing space wide). Reproducible + logged.

set -euo pipefail

# claude binary — absolute so launchd's minimal PATH can find it (override via env)
CLAUDE_BIN="${CLAUDE_BIN:-/Users/b/.local/bin/claude}"

RIG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PTC_DIR="$(cd "$RIG_DIR/../.." && pwd)"          # ~/Desktop/PhoneThatCares
DATE="$(date +%Y-%m-%d)"
DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

# --- deterministic date-hash helper: hash(DATE + salt) -> non-negative integer ---
dhash() { printf '%s' "$DATE-$1" | cksum | cut -d' ' -f1; }

# --- WHO: persona-or-builder + always an Oblique card ---
# bash 3.2 (macOS /bin/bash) has no mapfile — read lines into arrays manually
PERSONAS=(); while IFS= read -r _l; do PERSONAS+=("$_l"); done < <(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$RIG_DIR/personas.txt")
CARDS=();    while IFS= read -r _l; do CARDS+=("$_l");    done < <(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$RIG_DIR/oblique.txt")

# ~1/3 of nights = builder-Claude (no persona mask)
IS_BUILDER=0
[[ $(( $(dhash who-type) % 3 )) -eq 0 ]] && IS_BUILDER=1

if [[ $IS_BUILDER -eq 1 ]]; then
  WHO_LABEL="builder-Claude"
  WHO_BLOCK="Tonight you are NOT wearing a persona mask. You are just Claude — the
genius AI programmer and thought partner. The literal invitation: \"You are
actually just Claude. Do you have any ideas for stuff Brian might find
valuable?\" Build-oriented or idea-oriented, your call."
else
  PIDX=$(( $(dhash persona) % ${#PERSONAS[@]} ))
  MODE_ID="${PERSONAS[$PIDX]}"
  WHO_LABEL="robo-$MODE_ID"
  WHO_BLOCK="Tonight your EYES are \"robo-$MODE_ID\" — an influence, NOT an
impersonation. Open telegram-agent/share/modes.ts, find the MODES entry with
id: \"$MODE_ID\", and read its full \`prompt\`. Inhabit that lens as you roam —
what it notices, what it reaches for — WITHOUT pretending to be the real person
or putting words in their mouth. You are taking inspiration from, not replicating."
fi

CIDX=$(( $(dhash card) % ${#CARDS[@]} ))
CARD="${CARDS[$CIDX]}"

# --- WORLD: thin map + freshness, computed live (pointers, not dumps) ---
recent_journals="$(ls -t "$PTC_DIR"/telegram-agent/memory/conversations/*.md 2>/dev/null | head -3 | sed "s|$PTC_DIR/||")"
recent_handoffs="$(find "$PTC_DIR/_context" "$PTC_DIR/telegram-agent" "$PTC_DIR/website" -maxdepth 2 -iname 'HANDOFF*.md' 2>/dev/null | xargs ls -t 2>/dev/null | head -4 | sed "s|$PTC_DIR/||")"
recent_git="$(cd "$PTC_DIR" && git log --oneline -8 2>/dev/null)"

# --- assemble the prompt ---
PROMPT_FILE="$(mktemp -t nightly-rig.XXXXXX)"
cat > "$PROMPT_FILE" <<PROMPT
You are tonight's instance of Brian's nightly serendipity engine. Date: $DATE.
WHO: $WHO_LABEL   |   CARD: "$CARD"

=== WHO (your eyes + your method) ===
$WHO_BLOCK

Tonight's Oblique card (your METHOD — the "how"): "$CARD"
Sit with it. Try to honor it. You may set it aside if it would hurt the work —
but if you do, log one line on how you used or set aside the card.

=== WORLD (where you've landed — orient to NOW, then roam) ===
Thin map of where Brian's things live:
  - ~/.claude/CLAUDE.md  ("Where things live" section — the master map)
  - $PTC_DIR/CLAUDE.md  (Phone That Cares project map)
  - telegram-agent/memory/identity.md  (who Brian is)
Weighting as you read: ~60% journals + telegram-agent/memory/ + ~/.claude/.../memory/,
~40% project / Argos / Android-build material. Your persona colors how you read all of it.

Freshness layer (most recent first — land oriented to now):
  Recent journals:
$recent_journals
  Newest handoffs:
$recent_handoffs
  Recent git:
$recent_git

=== WHAT (Brian's message to you — verbatim) ===
Hi there. I'm Brian. You will find some background information about me attached
somewhere. I'm trying to learn to serve God. Love myself and those around me.
This aim includes things like right livelihood, deepening my connections with
those around me, finding new people, new media, that shows me different ways to
be. And I'm looking for your help. I'm sure there's ways in which I don't know
what I need. I have a therapist and meditation practice for that. And I have my
friends. But I see no reason not to use every tool, affordance, wise friend at my
disposal. Which of course includes you! Every night, I am having an instance
spend a few hours poking around to see if it has any ideas, thoughts, advice,
stuff it might want to build, etc for me. I should have a system where you can
look at what past similar instances have worked on, but I really want to welcome
you to take actions I haven't considered. I ideally don't want to come back to a
book's worth of words / advice, things I can digest a little more quickly are
preferred, but if you feel like writing a short story about someone I might find
resonant? Esp a Caro or McCarthy instance? Be my guest. Whatever your instincts,
plus tonight's unique inspiration card, point you towards, I'm open to. Thanks
for your help :)  — Brian, June 2026

=== CONTINUITY ===
1. FIRST: read $RIG_DIR/RUNLOG.md — what past instances did. Don't repeat; build on it.
2. Then do your ONE thing (an idea, advice, a built demo, a synthesis, a short
   story, a letter). Digestible preferred — NOT a book.
3. Write your gift as a FILE in $RIG_DIR/artifacts/ — ALWAYS, whatever form it
   takes. HTML is great and renders nicely; a letter, advice, or a short story as
   .md or .txt is equally fine — but it must be a saved file there, not left only
   in the RUNLOG or in your final reply, because Brian's morning auto-opens
   whatever new file you put in artifacts/. If your gift is just words, save the
   words as a .md. (Non-sensitive built things may also be pushed to the Library
   "Made by Claude" shelf via telegram-agent/claudespace/push-artifact.py.)
4. LAST: append a short entry to $RIG_DIR/RUNLOG.md (date, who, card, what you
   made + why, links/paths, one line on how the card was used).

=== GUARDRAILS (hard) ===
Additive only — create files, build demos, write syntheses, push to the PRIVATE
library. NO deletes, NO destructive git, NO public pushes, NO outward sends
(no email, no posting, no messaging anyone). Everything stays reviewable for
when Brian is back.

IMPORTANT — do NOT run \`open\` on your artifact yourself. The project CLAUDE.md
says to auto-open HTML, but for THIS run that's handled for you: the wrapper opens
your new artifact exactly once after you finish. If you also open it, Brian gets
duplicate windows. Just write the file and leave it closed.
PROMPT

if [[ $DRY_RUN -eq 1 ]]; then
  echo "===== DRY RUN — assembled prompt for $DATE ====="
  echo "WHO=$WHO_LABEL  CARD=\"$CARD\"  (builder=$IS_BUILDER)"
  echo "-----------------------------------------------"
  cat "$PROMPT_FILE"
  rm -f "$PROMPT_FILE"
  exit 0
fi

# --- execute ---
echo "[$(date)] nightly-rig run: WHO=$WHO_LABEL CARD=\"$CARD\"" >> "$RIG_DIR/run.log"
STAMP="$(mktemp -t nightly-rig-stamp.XXXXXX)"   # marker to find artifacts made this run
"$CLAUDE_BIN" -p "$(cat "$PROMPT_FILE")" \
  --model claude-opus-4-8 \
  --dangerously-skip-permissions \
  >> "$RIG_DIR/run.log" 2>&1
rm -f "$PROMPT_FILE"

# Auto-open whatever this run created so it's waiting in the browser by morning.
# (If the Mac was asleep, `open` fires on wake — the tab appears when Brian's back.)
NEW_ARTIFACTS="$(find "$RIG_DIR/artifacts" -type f -newer "$STAMP" ! -name '.gitkeep' 2>/dev/null)"
rm -f "$STAMP"
if [[ -n "$NEW_ARTIFACTS" ]]; then
  echo "$NEW_ARTIFACTS" | while IFS= read -r _a; do open "$_a"; done
  echo "[$(date)] nightly-rig opened: $NEW_ARTIFACTS" >> "$RIG_DIR/run.log"

  # If a new HTML gift was made, refresh the "everything the instances made you"
  # gallery so it shows up there too (build_gallery.py walks ~/Desktop and only
  # screenshots new files, so this is cheap). Non-fatal — gallery is secondary.
  if echo "$NEW_ARTIFACTS" | grep -q '\.html$'; then
    GALLERY_DIR="$PTC_DIR/_context/from-claude-2026-06-17"
    if [[ -f "$GALLERY_DIR/build_gallery.py" ]]; then
      echo "[$(date)] nightly-rig refreshing gallery..." >> "$RIG_DIR/run.log"
      if ( cd "$GALLERY_DIR" && python3 build_gallery.py ) >> "$RIG_DIR/run.log" 2>&1; then
        echo "[$(date)] gallery refreshed" >> "$RIG_DIR/run.log"
      else
        echo "[$(date)] gallery refresh failed (non-fatal)" >> "$RIG_DIR/run.log"
      fi
    fi
  fi
fi
echo "[$(date)] nightly-rig done" >> "$RIG_DIR/run.log"
