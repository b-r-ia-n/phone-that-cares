# PTC Android overnight harness

Autonomous build + verify + self-repair loop that runs a chain of goals against the `ptc-test`
emulator and leaves a windowed emulator + an HTML report.

## Run it

```bash
bash harness/overnight.sh
```

Boots/reuses the AVD, runs the goal chain (`goals/G*.txt`, listed in `overnight.sh`'s `GOALS=`),
writes `reports/morning.html`, and leaves the emulator **running + windowed** with the latest build.

## The loop (per goal)

`run-goal.sh <GOAL>` does:

1. **Build (round 0).** A fresh, *persisted* `claude -p` builder session works the goal. Its
   `session_id` is captured to `reports/<goal>/session_id.txt`.
2. **Verify.** Two independent signals, neither written by the builder:
   - `assertions/<goal>.sh` — pure adb/gradle checks (the spec). Ends with `ASSERTION_EXIT=<n>`.
   - `judge.sh <goal>` — a separate `claude -p` (haiku) that sees ONLY the evidence
     (assertion output, dumpsys/logcat slices, **and the screenshot**, which it Reads) and writes
     `reports/<goal>/verdict.json` = `{status: pass|partial|fail, why, reward_hack_suspected, caveats}`.
3. **Repair.** While the verdict isn't `pass` and rounds remain (`PTC_MAX_REPAIR`, default 2),
   **resume the same builder session** with the judge verdict + assertion output + a fresh
   screenshot path, and tell it to genuinely fix it (not fake it). Re-verify each round.

Because the builder is resumed (not restarted), it keeps the context of what it built. And because
the judge reads the screenshot, "you claimed done but the screen is black" goes straight back to the
one who claimed it — which is what closes the reward-hacking hole the first run exposed.

`run-goal.sh` exits `0` only if the final verdict is `pass`, so `run.log` reflects real verification,
not the builder's self-report.

## Talk to a goal's instance yourself

```bash
bash harness/resume-goal.sh K2                         # grabs a screenshot, asks for status + next step
bash harness/resume-goal.sh K2 "still black on wake"   # your own message
```

Drops you into the *same* conversation that built that goal, with full context, interactively.
Requires the goal to have been run with the persistence-enabled `run-goal.sh`.

## Knobs

| Env | Default | Meaning |
|---|---|---|
| `PTC_MAX_REPAIR` | `2` | repair rounds after the first attempt |
| `PTC_BUILD_MODEL` | `sonnet` | builder model |

## Files per goal (`reports/<goal>/`)

`prompt.txt` (initial) · `repair-N.txt` (feedback) · `stream.jsonl` (full transcript) ·
`live.log` (readable tool log) · `session_id.txt` · `assertion.txt` · `verdict.json` ·
`after.png` · `logcat.log` · `activities.txt` · `result.txt` (exit + final verdict + rounds).

## Adding a goal

1. Write `goals/<ID>.txt` — the `/goal` condition, phrased so success is externally observable.
2. Write `assertions/<id>.sh` (lowercase) — pure checks, ending `ASSERTION_EXIT=<n>`. **You** write
   this, never the builder (the goal tells the builder it may *read* but not modify it).
3. Add `<ID>` to `GOALS=` in `overnight.sh` and a title case in `morning.sh`.
