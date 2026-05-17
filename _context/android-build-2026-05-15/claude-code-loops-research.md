# Claude Code autonomous loops, for the Android build

Research compiled 2026-05-15 for Brian. Audience: smart, not a Claude-Code-internals expert. Sources annotated at the end.

The short version: `/goal` is real, it shipped three days ago, and it's the right primitive for an Android-fork project that has measurable end states (boots, launcher renders, module loads in Zygisk). Pair it with worktrees (one Claude per concern), Auto Mode for tool approvals, an ADB-over-Tailscale link to the Pixel 6, and a hard outer watchdog that owns cost and device safety. The whole stack is well-trodden as of mid-2026 — the only unusual part of Brian's setup is the *hardware-in-the-loop* piece, and there's now enough Android-via-MCP tooling that it's a configuration problem, not a research problem.

---

## 1. What `/goal` actually is

`/goal` is a slash command introduced in **Claude Code v2.1.139** (released ~May 12, 2026 [1][3]). You give it a completion condition up to 4,000 chars. After every turn, a *separate* small/fast evaluator model (Haiku by default [1]) reads the condition plus the conversation transcript and answers yes/no with a one-line reason. "No" → Claude takes another turn with the reason as guidance. "Yes" → goal clears, achievement gets logged. [1][6]

Three things matter about the architecture:

1. **The worker and the judge are different models.** Worker is whatever model is doing the session (Opus/Sonnet); judge is Haiku. The judge can't run tools — it can only judge what the worker has *surfaced in the transcript*. So conditions like "the test suite passes" work; conditions like "the code is good" don't, because there's nothing for Haiku to read. [1][6]
2. **It's implemented as a session-scoped prompt-based Stop hook.** You could build the same thing yourself with hooks, but `/goal` is the ergonomic wrapper. [1]
3. **It runs in headless mode too.** `claude -p "/goal CONDITION"` will run the entire loop to completion in one invocation. This is the mode you want for overnight runs. [1]

Built-in caveats: one goal per session, evaluator tokens billed on the small/fast model (negligible vs main spend), can be paused with `/goal clear`, resumes across `--continue` (but the turn counter resets). Anthropic recommends including "or stop after N turns" in the condition itself as a soft cost bound. [1]

**Important framing from the VentureBeat coverage:** the explicit design goal of `/goal` is to *separate the agent that does the work from the agent that decides it's done*, because LLMs are notoriously bad at deciding they're finished. [6] This is the bit that makes overnight runs viable — without an external judge, an autonomous agent either declares victory too early or thrashes forever.

## 2. The canonical autonomous-mode patterns

There are now four named patterns, and they stack:

- **Auto Mode** — auto-approves tool calls *within* a turn using a two-stage classifier (fast filter for safe ops, escalation for risky ones). Doesn't make Claude work longer; it just removes per-tool prompts. [8] Configure via `/en/auto-mode-config`. [1]
- **`/goal`** — auto-starts another turn until a condition holds. (Section 1.)
- **`/loop INTERVAL PROMPT`** — re-runs a prompt on a wall-clock interval inside a session (e.g. `/loop 5m run tests and fix anything red`). Stops when you stop it. [4][9]
- **`/schedule` + Routines** — persistent cron-style tasks that survive session death; Routines (announced April 14, 2026, research preview) run on Anthropic's cloud against a repo, triggered by cron/webhook/GitHub events. [7][9]
- **`--dangerously-skip-permissions`** ("YOLO mode") — bypasses *all* approval prompts. The community/Anthropic convention is to only use this inside a Docker container with `--network none` or with firewall ACLs. The eesel-AI study cited everywhere claims **32% of devs using this flag have had an unintended file modification and 9% have had data loss.** [4][2]
- **The Ralph Loop** — community pattern (~100 lines of bash) that runs Claude in fresh-context iterations against a `progress.txt` task list, commits after every iteration, with per-call timeout (default 10 min), exponential backoff on rate limits, and a resume mode. State lives in git, not in context. This is the de-facto recipe for unattended overnight work that doesn't blow up context windows. [5]

The combination most relevant to Brian: **Auto Mode + `/goal` + headless `-p`**, optionally wrapped in a Ralph-style bash supervisor for the outer guardrails. You don't necessarily need `--dangerously-skip-permissions` once Auto Mode covers the routine tool calls.

## 3. Multi-Claude orchestration

Worktrees became native in Claude Code on **Feb 20, 2026** (Boris Cherny's announcement [11]). `claude --worktree feature-x` makes a directory at `.claude/worktrees/feature-x/`, checks out branch `feature-x`, and starts an isolated session there. Subagents can be given `isolation: worktree` in their frontmatter and they'll spawn into their own worktrees too. [10][11]

What's actually working in practice as of mid-2026:

- **4–8 concurrent worktrees per developer** is the sweet spot; people get bottlenecked on *review*, not on Claude. One 30-engineer trial reported a 3.13x speedup with zero merge conflicts. [10]
- **Decompose by file ownership, not feature.** The single biggest cause of bad merges is two agents touching the same file — the playbooks recommend mapping which files each task will touch *before* you launch the agents. [12]
- **Shared context, not shared state.** A single `PROJECT_BRIEF.md` checked into the repo gives all agents architectural alignment without state coupling. [12]
- **Coordination via tmux + status files.** For 3 or fewer agents, tmux panes are fine. Above that, an orchestrator agent reading agent status files starts to pay for itself. [12]

For the Android build specifically: a good split is one worktree per concern — *launcher Compose UI*, *Magisk module*, *LSPosed hook*, *device-test harness*. They have disjoint file ownership and they integrate at the APK/module level, not the source level.

## 4. Hardware-in-the-loop dev cycles

This was the part I was most worried wouldn't be mature yet. It is.

The standard architecture is **MCP server for ADB**, of which there are several reasonable implementations:

- `watabee/mcp-server-adb` — bare ADB-over-MCP, good for build/install/logcat loops. [13]
- `android-adb-testing` (LobeHub) — adds the Observe–Think–Act loop: screenshot → accessibility tree → tap/swipe/type, with logcat monitoring and emulator management. [14]
- **Droid Android Automation** — a Claude Code skill that returns screenshots paired with structured UI metadata as LLM-friendly JSON. This is the right shape for vision-driven verification. [14]

**OpenTester** (the Gerardo Suarez writeup [15]) is the closest reference for what Brian probably wants: a Planner/Cortex/Orchestrator three-agent pipeline driving an Android device through a perception→reasoning→action loop, with stuck-detection that triggers replanning. Their key insight worth stealing: **record enriched metadata during the AI-driven exploration, then replay deterministic tests without AI calls.** That's how you keep the cost of regression testing near zero once the first pass works.

For Brian's tether: ADB over Tailscale is the production setup. [16] USB-bootstrap once per reboot to enable `adbd` in TCP mode, then ADB-over-Tailscale-IP on port 5555. Critical: **never expose 5555 publicly**, use Tailscale ACLs to scope which machines can reach it. ADB has no authentication. [16]

A working overnight loop looks like: build module → `adb push` → `adb shell magisk --install-module` → reboot (or restart Zygisk) → wait for boot complete → screenshot → assert launcher renders → logcat grep for crashes → if anything red, feed back into Claude. The condition you'd give `/goal`: *"launcher_test.sh exits 0 and `adb logcat -d | grep -E 'FATAL|AndroidRuntime'` is empty across three consecutive boots."*

## 5. Failure modes and the practical playbook

Real failure modes, with mitigations the community has converged on:

| Failure | Mitigation |
|---|---|
| Cost runaway ($200 overnight surprise [9]) | Hard outer cap: track tokens in the supervisor and SIGTERM Claude at threshold. Include "stop after N turns" in `/goal` condition. Drop effort with `/effort` or `MAX_THINKING_TOKENS=8000`. |
| Hallucinated success ("done!" when not done) | This is exactly what `/goal`'s separate evaluator addresses. Belt-and-suspenders: also gate on a deterministic exit code from a real script. |
| Infinite loop on a stuck state | Per-call timeout (Ralph default: 10min). Outer turn cap. Stuck-detection in the Orchestrator (OpenTester pattern). |
| Context drift over long runs | Don't run long contexts. Ralph Loop's fresh-context-per-iteration with `progress.txt` is the answer. Auto-compaction at 60–80% reduction is built in but treat as backup. [9] |
| Bricked device | Snapshot before each module install. For a rooted Pixel, that's a `dd` of the relevant partitions or — easier — keeping a known-good factory image + fastboot recovery script as the watchdog's "panic" action. Make the supervisor able to flash recovery without Claude. |
| Accidental destructive command | Run Claude with a `permissions.deny` for `rm -rf`, `fastboot erase`, `mkfs`, etc. Don't rely on `--dangerously-skip-permissions` discipline. |
| Secrets leak into commits | Explicit file allowlist for commits + `.gitignore`. Ralph Loop pattern. [5] |
| Rate-limit thrash | Exponential backoff (2^n, capped at 60s). [5] |

The meta-mitigation: **the supervisor (bash, your code) owns cost, time, and device safety. Claude owns code.** Don't try to make Claude self-police those — it's bad at it and the failure mode is exactly what you're trying to avoid.

## 6. Recommended setup for Brian

Concrete stack, tuned for rooted Pixel 6 + Magisk module + LSPosed module + Compose launcher, with you as v1 tester:

**Worktree split (one Claude each, parallel):**

1. `launcher-compose/` — Sonnet, the Compose launcher app. Pure code, no device required for inner loop (use the emulator MCP for unit-ish UI tests).
2. `magisk-module/` — Sonnet, the Magisk module (grayscale, passive tracking). Needs device for verification.
3. `lsposed-hook/` — Opus (this is the trickiest layer), the LSPosed hook. Needs device + reboot loop.
4. `device-harness/` — Sonnet, the bash + ADB-over-Tailscale supervisor. Owns build/push/install/screenshot/logcat. *No Claude code lives here at runtime — this is your watchdog.*

**Three loop modes, picked by task:**

- **Inner dev loop (you at the keyboard):** worktree-local Claude with Auto Mode on, ADB-over-Tailscale to the Pixel, manual prompts. Sub-30-sec cycle time.
- **`/goal` for "make this thing work":** e.g. `/goal launcher renders on Pixel 6 boot, app_drawer.test.sh exits 0, and adb logcat shows no FATAL across three reboots. Stop after 40 turns.` Run with Auto Mode + headless `-p`.
- **Overnight Ralph Loop:** for the long tail — issue backlog, "make all 12 lock-screen mode transitions pass their screenshot diffs." Bash supervisor owns the iteration, commits per iteration, has the cost cap and the recovery-flash escape hatch.

**Watchdog must-haves (in the supervisor, not in Claude's prompt):**

- Token-spend cap — kill Claude at $X.
- Wall-clock cap per goal (e.g. 6h) — kill and email you.
- Reboot-loop detector — if device has rebooted 5x in 10min and not reached `sys.boot_completed=1`, halt and stage a fastboot-recovery flash. Don't auto-flash overnight; require your manual unlock.
- `adb wait-for-device` with a 90s ceiling around every device interaction.
- Deny-list: `fastboot erase`, `fastboot flash` (only the supervisor flashes), `rm -rf`, `dd of=/dev/`, anything writing to `/data/data/` outside your module's path.
- Git autocommit per iteration, `.gitignore` for keys, explicit `git add` allowlist.

**Cost & rate-limit realism:** the consensus is that the $200 Max 20x plan is for individual experimentation, not for production orchestration workloads. [9] A 4-worktree overnight run will find the bottom of that bucket fast. Plan on API billing for at least the overnight Opus passes; keep the daytime worktrees on Sonnet with Auto Mode and you'll stretch it. Drop `MAX_THINKING_TOKENS` for the supervisor-driven loops where thinking isn't earning anything.

**One small magic / one strong opinion:** make the device harness produce a tiny HTML report per overnight run — three screenshots (boot, launcher, after-module-load), the logcat diff vs golden, the goal verdict and reason from Haiku, the token spend. You'll wake up to one glanceable artifact instead of a transcript. Matches the project's design vocabulary and means you'll actually look at it.

---

## 7. Citations

1. **[Claude Code docs — Keep Claude working toward a goal](https://code.claude.com/docs/en/goal)** — the definitive `/goal` reference. Confirms v2.1.139, Haiku evaluator, Stop-hook implementation, 4K char limit, headless support, evaluator can't call tools.
2. **[ClaudeLog — Dangerous Skip Permissions](https://claudelog.com/mechanics/dangerous-skip-permissions/)** — community reference for YOLO mode (403'd on fetch but indexed widely).
3. **[explainx.ai — Claude Code 2.1.139 adds /goal](https://explainx.ai/blog/claude-code-goal-command-long-running-agents-2026)** — release dating and framing.
4. **[Pasquale Pillitteri — Claude Code Autonomous Mode guide](https://pasqualepillitteri.it/en/news/141/claude-code-dangerously-skip-permissions-guide-autonomous-mode)** — practical recipe for combining `--dangerously-skip-permissions` with `/loop`/`/schedule`; Docker `--network none` pattern; spec-driven split.
5. **[PlonGuo on Medium — How I Set Up Claude Code for Autonomous Development with the Ralph Loop](https://medium.com/@jason.ghzr/how-i-set-up-claude-code-for-autonomous-development-with-the-ralph-loop-3f98269e42ca)** — the canonical Ralph Loop writeup; fresh-context iterations, 10-min per-call timeout, exponential backoff, git-as-memory.
6. **[VentureBeat — Claude Code's /goals separates the agent that works from the one that decides it's done](https://venturebeat.com/orchestration/claude-codes-goals-separates-the-agent-that-works-from-the-one-that-decides-its-done)** — the architectural framing (worker vs judge). (HTTP 429 on fetch but title and excerpt confirm thesis.)
7. **[The New Stack — Claude Code can now do your job overnight](https://thenewstack.io/claude-code-can-now-do-your-job-overnight/)** — Routines launch coverage, April 14 2026.
8. **[InfoQ — Inside Claude Code Auto Mode](https://www.infoq.com/news/2026/05/anthropic-claude-code-auto-mode/)** — two-stage classifier, red-spinner approval gate, "walk away" framing.
9. **[MindStudio — AI Agent Token Budget Management in Claude Code](https://www.mindstudio.ai/blog/ai-agent-token-budget-management-claude-code)** — the $200-overnight failure mode; hard internal limits; 60–80% compaction; $200 Max 20x is individual-scale.
10. **[Claude Code docs — Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees)** — official worktree reference, `--worktree` flag, `isolation: worktree` subagent frontmatter.
11. **[Boris Cherny announcement (Threads, Feb 20 2026)](https://www.threads.com/@boris_cherny/post/DVAAnexgRUj/)** — native worktree support shipped to CLI.
12. **[MindStudio — Parallel Agentic Development with Git Worktrees](https://www.mindstudio.ai/blog/parallel-agentic-development-git-worktrees)** — five-pillar playbook; file-ownership-first decomposition; shared brief, separate state; tmux for ≤3 agents, orchestrator above.
13. **[watabee/mcp-server-adb (GitHub)](https://github.com/watabee/mcp-server-adb)** — MCP server for raw ADB.
14. **[android-adb-testing (LobeHub)](https://lobehub.com/mcp/aiarchitecttools-android-adb-testing)** and **[Droid Android Automation skill](https://mcpmarket.com/tools/skills/droid-android-automation)** — vision-driven UI exploration with accessibility tree, structured JSON metadata.
15. **[Gerardo Suarez on Medium — Claude Code Now Tests Android Apps Like a QA Engineer](https://medium.com/@andresuarezz2693/claude-code-now-tests-android-apps-like-a-qa-engineer-heres-how-we-built-it-bf4efa3c22d7)** — OpenTester architecture (Planner/Cortex/Orchestrator), record-enriched-metadata-then-replay-without-AI pattern, stuck-detection + replanning.
16. **[Shehbaj Dhillon Gist — Setup guide for AI agents to control Android via ADB + Tailscale](https://gist.github.com/shehbajdhillon/2ddcd702ed41fc1fa45bfc0075918c12)** — Tailscale ACLs, port 5555 hygiene, USB-bootstrap-per-reboot.
