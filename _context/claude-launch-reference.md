# Claude Code — Launch Reference

## Agents (say "you're the X agent" after launching)

| Agent | Role |
|---|---|
| `pm-agent` | Project state, priorities, open threads |
| `website-agent` | aphonethatcares.com, Astro/Vercel/Supabase |
| `telegram-agent` | Argos bot, val.town deployment, testing |
| `android-agent` | Android fork research and build planning |
| `design-agent` | Web UI, HTML artifacts, Argos pages (not Android) |

Rule files: `PhoneThatCares/.claude/rules/`

---

## Useful launch flags

```bash
# Resume most recent conversation in this directory
claude -c

# Resume a specific session (pick from list)
claude -r

# Name a session (shows in /resume picker + terminal title)
claude -n "argos librarian push"

# Skip permission prompts (for trusted dirs only)
claude --dangerously-skip-permissions
# or use the alias:
claudepeers

# Use a specific model
claude --model opus
claude --model sonnet

# Append extra context without touching CLAUDE.md
claude --append-system-prompt "you're the telegram agent"

# Run non-interactively (pipe-friendly)
claude -p "summarize the open threads in _context/state-of-project.md"

# Limit spend on a non-interactive run
claude -p "..." --max-budget-usd 0.50

# Auto-approve edits (still asks for Bash)
claude --permission-mode acceptEdits

# Full auto — no prompts at all (careful)
claude --permission-mode auto

# Plan mode — Claude proposes before doing anything
claude --permission-mode plan

# Restrict to specific tools only
claude --allowedTools "Read,Bash(git *)"

# Low/high effort (affects reasoning depth)
claude --effort low    # faster, cheaper
claude --effort high   # deeper thinking

# Bare mode — no CLAUDE.md, no hooks, minimal overhead
# Useful for quick one-off tasks in unfamiliar dirs
claude --bare -p "what does this file do?" 
```

---

## Useful combos

```bash
# Spin up a named android-planning session, skip permissions
claude -n "android spec" --dangerously-skip-permissions

# Quick summarize without opening interactive session
claude -p "what are the open bugs in telegram-agent?" --max-budget-usd 0.30

# Resume last session and immediately continue
claude -c
```

---

## Skills (invoke with /skill-name in any session)

| Skill | When |
|---|---|
| `/rauno-style` | Any UI work on PTC |
| `/frontend-design` | Building web pages, components, dashboards |
| `/canvas-design` | Static visual artifacts, posters |
| `/webapp-testing` | Playwright testing for the website |
| `/claude-api` | Anthropic SDK, prompt caching, model config |
| `/review` | Before pushing to any repo |
| `/security-review` | Before wider Argos exposure |
| `/simplify` | Code cleanup and debt reduction |
