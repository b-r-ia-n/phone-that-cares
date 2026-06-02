#!/usr/bin/env bash
# Generates reports/morning.html from per-goal transcripts + evidence.
set -uo pipefail
source "$(dirname "$0")/env.sh"

OUT="$PTC_REPORTS/morning.html"
NOW=$(date -Iseconds)

# Walk each goal dir, extract result + final claude turn for verdict.
goal_section() {
  local G=$1
  local D="$PTC_REPORTS/$G"
  local TITLE
  case "$G" in
    B0) TITLE="Baseline regression — still builds & runs" ;;
    L1) TITLE="Refined lockscreen — Light from the next room + flashlight/camera" ;;
    GR) TITLE="Grayscale end-to-end on real apps" ;;
    NF) TITLE="Notification filter — live (OpenAI)" ;;
    CH) TITLE="Ask-page conversation recall" ;;
    K1) TITLE="Keyguard substitution (rooted emulator)" ;;
    K2) TITLE="Biometric → unlock authority" ;;
    FD) TITLE="Discover — fidelity to mock" ;;
    FA) TITLE="Ask — fidelity to mock" ;;
    FC) TITLE="Connect — fidelity to mock" ;;
    FH) TITLE="Home — fidelity to mock" ;;
    RAMP) TITLE="Gradual true-grayscale ramp (the core mechanic)" ;;
    *)  TITLE="$G" ;;
  esac

  if [[ ! -d "$D" ]]; then
    cat <<EOF
<section class="goal not-run">
  <div class="head"><span class="id">$G</span><span class="status">not run</span></div>
  <h3>$TITLE</h3>
  <p class="dim">This goal didn't run.</p>
</section>
EOF
    return
  fi

  local EXIT_CODE="?" DURATION="?"
  if [[ -f "$D/result.txt" ]]; then
    EXIT_CODE=$(grep "^exit_code:" "$D/result.txt" | awk '{print $2}')
    DURATION=$(grep "^duration_seconds:" "$D/result.txt" | awk '{print $2}')
  fi

  local STATUS="unknown"
  local CSS="unknown"
  if [[ "$EXIT_CODE" == "0" ]]; then STATUS="completed"; CSS="ok"; fi
  if [[ "$EXIT_CODE" =~ ^[1-9] ]]; then STATUS="failed or capped"; CSS="bad"; fi

  # Prefer the independent judge verdict if present (the real pass/fail signal)
  local VERDICT_WHY="" VERDICT_HACK=""
  if [[ -f "$D/verdict.json" ]]; then
    local VSTAT
    VSTAT=$(python3 -c "import json;print(json.load(open('$D/verdict.json')).get('status',''))" 2>/dev/null)
    VERDICT_WHY=$(python3 -c "import json;d=json.load(open('$D/verdict.json'));print(d.get('why','')+((' [CAVEAT: '+d['caveats']+']') if d.get('caveats') else ''))" 2>/dev/null | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
    VERDICT_HACK=$(python3 -c "import json;print('yes' if json.load(open('$D/verdict.json')).get('reward_hack_suspected') else '')" 2>/dev/null)
    case "$VSTAT" in
      pass)    STATUS="judge: PASS"; CSS="ok" ;;
      partial) STATUS="judge: PARTIAL"; CSS="unknown" ;;
      fail)    STATUS="judge: FAIL"; CSS="bad" ;;
    esac
  fi

  # Assertion output (the mechanical spec result)
  local ASSERT_TAIL=""
  if [[ -f "$D/assertion.txt" ]]; then
    ASSERT_TAIL=$(cat "$D/assertion.txt" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
  fi

  # Extract final result + cost from the stream.jsonl
  local FINAL="" COST="?"
  if [[ -f "$D/stream.jsonl" ]]; then
    FINAL=$(python3 -c "
import json,sys
final=''
cost=''
for line in open('$D/stream.jsonl'):
  line=line.strip()
  if not line: continue
  try:
    ev=json.loads(line)
    t=ev.get('type','')
    if t=='result':
      final=str(ev.get('result',''))[:3000]
      cost=str(ev.get('total_cost_usd',''))
  except: pass
print(final + '\n---COST---\n' + cost)
" 2>/dev/null)
    COST=$(echo "$FINAL" | awk '/---COST---/{f=1; next} f{print; exit}')
    FINAL=$(echo "$FINAL" | sed '/---COST---/,$d' | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
  fi

  # Tail of the live.log for at-a-glance tool history
  local LIVE_TAIL=""
  if [[ -f "$D/live.log" ]]; then
    LIVE_TAIL=$(tail -40 "$D/live.log" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
  fi

  # Determine which screenshot to show
  local SHOT=""
  [[ -f "$D/after.png" ]] && SHOT="$G/after.png"

  # Stuck note if present
  local STUCK=""
  if [[ -f "$D/stuck.md" ]]; then
    STUCK="<details class='stuck'><summary>Stuck note</summary><pre>$(cat "$D/stuck.md" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')</pre></details>"
  fi

  local DUR_MIN
  if [[ "$DURATION" =~ ^[0-9]+$ ]]; then
    DUR_MIN=$(awk "BEGIN{printf \"%.1f\", $DURATION/60}")
  else
    DUR_MIN="?"
  fi

  cat <<EOF
<section class="goal $CSS">
  <div class="head"><span class="id">$G</span><span class="status $CSS">$STATUS</span><span class="meta">${DUR_MIN}m · exit $EXIT_CODE · \$${COST:-?}</span></div>
  <h3>$TITLE</h3>
  ${VERDICT_WHY:+<p class="verdict"><strong>Judge:</strong> $VERDICT_WHY${VERDICT_HACK:+ <span class="hack">⚠ reward-hack suspected</span>}</p>}
  ${SHOT:+<img src="$SHOT" alt="$G after screenshot" />}
  ${ASSERT_TAIL:+<details><summary>Assertion output (the spec)</summary><pre>$ASSERT_TAIL</pre></details>}
  ${FINAL:+<details open><summary>Final claude turn</summary><pre>$FINAL</pre></details>}
  ${LIVE_TAIL:+<details><summary>Tool log (tail)</summary><pre>$LIVE_TAIL</pre></details>}
  $STUCK
</section>
EOF
}

# Aggregate
SECTIONS=""
# Show whatever actually ran (any reports/<goal>/ with a result.txt).
for D in "$PTC_REPORTS"/*/; do
  G=$(basename "$D")
  [[ -f "$D/result.txt" ]] || continue
  SECTIONS+=$(goal_section "$G")
  SECTIONS+="
"
done

# git diff stats
DIFF_STATS=""
if [[ -d "$PTC_LAUNCHER/.git" ]]; then
  DIFF_STATS=$(cd "$PTC_LAUNCHER" && git log --oneline 2>/dev/null | head -30 | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
fi

cat > "$OUT" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>PTC Android — overnight report · $(date -I)</title>
<style>
:root{--bg:#f6f3ec;--ink:#1a1714;--muted:#6f6a62;--rule:#d9d3c6;--accent:#8a5a2b;--ok:#3d6b3a;--bad:#8a3a2b;--card:#fffdf7;--card-rule:#e6dfd0;}
*{box-sizing:border-box;}
body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;font-feature-settings:'ss01','cv11','tnum';font-size:15px;line-height:1.55;margin:0;padding:0 24px 120px;max-width:860px;margin-inline:auto;}
header{padding:48px 0 24px;border-bottom:1px solid var(--rule);}
.kicker{font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
h1{font-size:28px;font-weight:600;letter-spacing:-0.01em;margin:0 0 4px;}
.date{color:var(--muted);font-size:13px;}
h2{font-size:18px;font-weight:600;margin:32px 0 12px;}
section.goal{background:var(--card);border:1px solid var(--card-rule);border-radius:6px;padding:16px 18px;margin-bottom:14px;}
section.goal .head{display:flex;align-items:baseline;gap:14px;margin-bottom:6px;}
section.goal .id{font-weight:600;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;color:var(--accent);}
section.goal .status{font-size:12px;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;}
section.goal .status.ok{color:var(--ok);}
section.goal .status.bad{color:var(--bad);}
section.goal .status.unknown{color:var(--muted);}
section.goal .meta{font-size:12px;color:var(--muted);margin-left:auto;font-variant-numeric:tabular-nums;}
section.goal h3{margin:4px 0 8px;font-size:15px;font-weight:600;}
section.goal img{max-width:240px;border:1px solid var(--card-rule);border-radius:4px;margin:8px 0;}
details{margin-top:8px;}
summary{cursor:pointer;font-size:13px;color:var(--muted);}
pre{font-family:'Berkeley Mono',ui-monospace,monospace;font-size:12px;background:#f1ece2;padding:10px 12px;border-radius:4px;overflow-x:auto;line-height:1.5;white-space:pre-wrap;word-break:break-word;}
.dim{color:var(--muted);font-size:13.5px;}
.verdict{font-size:13.5px;margin:6px 0 10px;padding:8px 10px;background:#f1ece2;border-left:2px solid var(--accent);border-radius:3px;}
.hack{color:var(--bad);font-weight:600;}
section.commits{background:var(--card);border:1px solid var(--card-rule);border-radius:6px;padding:16px 18px;margin-bottom:14px;}
</style>
</head>
<body>
<header>
<div class="kicker">Phone That Cares — Android v1</div>
<h1>Overnight report</h1>
<div class="date">Generated $NOW</div>
</header>

<h2>Goals</h2>
$SECTIONS

<h2>Commits to launcher repo</h2>
<section class="commits">
${DIFF_STATS:+<pre>$DIFF_STATS</pre>}
${DIFF_STATS:-<p class="dim">No commits.</p>}
</section>

</body>
</html>
HTML

echo "[morning] wrote $OUT"
