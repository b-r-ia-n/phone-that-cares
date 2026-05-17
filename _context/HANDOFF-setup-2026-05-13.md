# Setup Handoff — 2026-05-13
_Written by Claude after a full day of Ghostty/tmux/context setup with Brian._

---

## Brian's intentions, in his own words

This day was about reducing friction. Brian is working on PhoneThatCares across 6-7 Claude instances at a time — telegram bot, PM, website, Android planning — and the spin-up tax was annoying him. Every time he opened a new tab, he had to re-explain context. Every time he handed off to a new instance, information got lost.

What he wanted:
- Open a tab, start Claude, and have it already know what's going on
- A visual side-panel showing current todos that updates as Claude works
- Handoff files thorough enough that a new instance can orient itself in seconds
- File names that make sense (`kebab-case`, not `MD context files`)
- One home for everything PhoneThatCares (`~/Desktop/PhoneThatCares/`)
- Agent roles he can invoke with two words ("you're the pm agent")

He also wanted the notes pane to be editable from within the terminal, and to toggle open/closed without memorizing commands. That last part got messy.

---

## Current state of all modified files

### Ghostty config — `~/.config/ghostty/config`
```
working-directory = /Users/b/Desktop/PhoneThatCares/_context
font-family = JetBrains Mono
font-size = 14
window-padding-x = 8
window-padding-y = 8
cursor-style-blink = false
keybind = cmd+backslash=text:\x1b[20~   ← sends F9 to toggle notes pane
keybind = cmd+e=text:\x1b[21~           ← sends F10 to edit notes
theme = Rose Pine
```
**Status:** Font, theme, padding all working. `Cmd+\` keybinding NOT yet confirmed working (Brian hasn't done cat -v test after Ghostty restart to verify bytes are sent).

---

### tmux config — `~/.tmux.conf`
Key settings:
- Prefix: `Ctrl+A` (changed from default `Ctrl+B` which Ghostty was eating)
- Mouse on, base-index 1
- `bind-key -n F9` → runs `~/.claude/toggle-notes.sh` (no prefix needed)
- `bind-key -n F10` → runs `~/.claude/edit-notes.sh` (no prefix needed)
- Status bar: warm minimal, shows ▶/◀ state indicator bottom right
- `Ctrl+A t` also toggles the notes pane (confirmed working)

**Status:** `Ctrl+A t` confirmed working. `Cmd+\` (via F9) not yet confirmed — requires Ghostty restart + cat -v test.

---

### zshrc — `~/.zshrc`
Key additions:
- **Auto-tmux:** Every new Ghostty tab runs `exec tmux new-session -c ~/Desktop/PhoneThatCares/_context` → each tab gets its own independent tmux session (latest version; went through several iterations to fix tabs stealing each other's focus)
- **claude() wrapper:** Runs `~/.claude/toggle-notes.sh` before launching Claude, so notes pane opens automatically
- **claudepeers alias:** `command claude --dangerously-skip-permissions`
- **_ptc_reminder():** Prints agent list when you cd into PhoneThatCares
- **notes() function:** Calls toggle-notes.sh, optional window rename
- **iTerm2 tab colors:** Existing script for color-coding projects, updated `Chrome_Extension` → `chrome-extension`

**Status:** Auto-tmux working. claude() wrapper not yet confirmed (notes pane hasn't auto-opened on claude launch in test). New tabs now open fresh (confirmed in last test).

---

### Claude settings — `~/.claude/settings.json`
Only remaining non-default settings:
```json
{
  "permissions": { "defaultMode": "auto" },
  "enabledPlugins": { "frontend-design@...": true, "vercel@...": true },
  "effortLevel": "high",
  "voice": { "enabled": true, "mode": "hold" },
  "skipDangerousModePermissionPrompt": true,
  "skipAutoPermissionPrompt": true,
  "voiceEnabled": true
}
```
SessionStart/Stop hooks removed (replaced by the claude() zshrc wrapper).

---

### Notes pane scripts

**`~/.claude/toggle-notes.sh`** (executable)
- Gets current tmux window name
- Derives file: `_context/sessions/<window-name>.md`
- Creates file with simple bullet template if missing
- Checks for existing `watch` pane — kills it if present, opens it if not
- Watch pane shows filename + glow-rendered markdown, refreshes every 2s

**`~/.claude/edit-notes.sh`** (executable)
- Gets current window's notes file
- Opens nano in a new tmux window
- Kills that window when nano exits

**Status:** Scripts exist and are executable. Auto-open via claude() wrapper not yet confirmed working end-to-end. Manual `Ctrl+A t` confirmed working.

---

### PhoneThatCares folder structure
**Major changes from before this session:**
```
~/Desktop/PhoneThatCares/
  _context/                    ← renamed from "MD context files"
    state-of-project.md        ← new: full project state + Brian's writing
    todo.md                    ← simple bullets, agents write here
    task.md                    ← Claude session working notes
    claude-launch-reference.md ← launch flags, agents, skills cheatsheet
    val-town-reference.md      ← new: Argos deployment reference
    argos-architecture.md      ← new: Argos system architecture
    sessions/                  ← new: per-tab notes files
    handoffs/                  ← dated handoff archive
    top-level-context-dump-phone-that-cares-organized.md
  telegram-agent/              ← moved from ~/Desktop/Projects/argos-telegram-agent/
  website/                     ← renamed from Website/
  chrome-extension/            ← renamed from Chrome_Extension/
  os-mocks/                    ← renamed from OS_Mocks/
  visuals/                     ← renamed from Visualizations/
  words/                       ← renamed from Words/
  .claude/
    CLAUDE.md                  ← lean, <80 lines, with skills section
    rules/
      pm-agent.md
      website-agent.md
      telegram-agent.md
      android-agent.md
      design-agent.md
  dashboard-argos-brian.html
  dashboard-project.html
  CLAUDE.md
```

---

### Agent rules — `PhoneThatCares/.claude/rules/`
All 5 agents updated with:
- **When loaded:** write session notes to `_context/sessions/<tmux-window-name>.md`
- How to get window name: `tmux display-message -p '#W'`
- Relevant skills for their role
- Current status as of 2026-05-12

---

### Skills installed — `~/.claude/skills/`
- `rauno-style` (existing)
- `frontend-design` (new, from Anthropic skills repo)
- `canvas-design` (new)
- `webapp-testing` (new)
- `claude-api` (new)

---

### Global CLAUDE.md — `~/.claude/CLAUDE.md`
Updated paths:
- `~/Desktop/PhoneThatCares/telegram-agent/memory/identity.md` (was argos-telegram-agent)
- `_context/state-of-project.md` as start point for PTC
- Removed stale `/Users/jlab/` paths

---

## What's NOT working / still needs confirming

1. **`Cmd+\` toggle** — not confirmed. Needs: restart Ghostty → `cat -v` → press Cmd+\ → verify `^[[20~` appears
2. **Notes pane auto-open on `claude` launch** — not confirmed end-to-end. The claude() wrapper was added but hasn't been tested with a fresh tab
3. **Per-tab notes files** — logic is correct but hasn't been tested: open tab, rename window (`Ctrl+A ,`), launch claude, verify `_context/sessions/<name>.md` appears
4. **Val ID in telegram-agent rule** — `e534cea8` is in push.py (dev val); `46072a84` appears to be prod. Needs Brian to confirm which is which

## What's working (Brian confirmed)
- Rose Pine theme in Ghostty
- JetBrains Mono font
- New tabs open fresh (independent tmux sessions)
- `Ctrl+A t` toggles notes pane
- `Ctrl+A` as tmux prefix
- State-of-project.md written and accurate
- All folder renames done
- Agent rules created and wired
- 91/91 unit tests passing in telegram-agent
