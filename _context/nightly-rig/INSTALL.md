# Installing the nightly rig

The build is additive and reviewable. The **last two steps must be human-initiated** —
the Claude Code auto classifier (correctly) refuses to arm a headless
`--dangerously-skip-permissions` loop on chat consent alone. Run these yourself in
a `!`-prefixed shell or a terminal.

## 0. Sanity-check the assembled prompt first (safe — prints only, no agent run)
```
bash _context/nightly-rig/run.sh --dry-run | less
```
Read it. Confirm WHO/WORLD/WHAT look right and the persona/card pairing makes sense.
Re-run on different days to spot-check variety (selection is date-deterministic).

## 1. Arm the script  (human-initiated)
```
chmod +x _context/nightly-rig/run.sh
```

## 2. One live test run, watched  (human-initiated)
```
_context/nightly-rig/run.sh        # runs tonight's WHO/CARD now; watch run.log
```
Tail it in another pane: `tail -f _context/nightly-rig/run.log`
Check `_context/nightly-rig/artifacts/` and the new RUNLOG.md entry afterward.

## 3. Install the launchd job  (human-initiated)
```
cp _context/nightly-rig/com.brian.nightly-rig.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.brian.nightly-rig.plist
launchctl list | grep nightly-rig     # confirm it's registered
```
To stop it later: `launchctl unload ~/Library/LaunchAgents/com.brian.nightly-rig.plist`

## Caveats
- **Sleep:** if the Mac is fully asleep at 3:30am, launchd runs the job on next wake
  (StartCalendarInterval catches up once). If the lid's closed / machine off, it's
  skipped — no pile-up. For the June 25–Jul 2 backpacking window, either leave the
  Mac awake (`caffeinate -s`) or set a `pmset repeat wake` a few min before 3:30.
- **Model/effort:** wrapper uses `--model claude-opus-4-8`. Medium effort is the
  account/session default; set it in `~/.claude/settings.json` if you want it pinned.
- **claude path:** hardcoded to `/Users/b/.local/bin/claude` (override `CLAUDE_BIN`).
- **No public surface:** guardrails in the prompt forbid deletes / destructive git /
  public pushes / outward sends. Library pushes go to the PRIVATE shelf only.
