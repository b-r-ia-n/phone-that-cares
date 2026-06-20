#!/bin/bash
# Nightly rig — tonight's WHO + CARD selector (cloud + local).
# Prints the night's identity. Deterministic from the date, with separate hash
# salts for persona vs. card so the pairing space stays wide. No side effects.
#
#   WHO=<robo-xxx | builder-Claude>
#   MODE_ID=<id or empty if builder>
#   CARD=<the oblique card text>
#
# The nightly instance runs this first, then inhabits WHO and honors CARD.

set -euo pipefail
RIG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATE="${NIGHTLY_DATE:-$(date +%Y-%m-%d)}"   # override with NIGHTLY_DATE for testing

dhash() { printf '%s' "$DATE-$1" | cksum | cut -d' ' -f1; }

PERSONAS=(); while IFS= read -r _l; do PERSONAS+=("$_l"); done < <(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$RIG_DIR/personas.txt")
CARDS=();    while IFS= read -r _l; do CARDS+=("$_l");    done < <(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$RIG_DIR/oblique.txt")

# ~1/3 of nights = builder-Claude (no persona mask)
if [[ $(( $(dhash who-type) % 3 )) -eq 0 ]]; then
  echo "WHO=builder-Claude"
  echo "MODE_ID="
else
  PIDX=$(( $(dhash persona) % ${#PERSONAS[@]} ))
  echo "WHO=robo-${PERSONAS[$PIDX]}"
  echo "MODE_ID=${PERSONAS[$PIDX]}"
fi

CIDX=$(( $(dhash card) % ${#CARDS[@]} ))
echo "CARD=${CARDS[$CIDX]}"
echo "DATE=$DATE"
