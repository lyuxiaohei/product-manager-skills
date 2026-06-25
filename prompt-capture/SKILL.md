---
name: prompt-capture
description: Install or remove a Claude Code hook that automatically captures every prompt the user submits into a per-project .prompts folder (one markdown file per session, timestamped entries). Use when the user wants to automatically save/log/record their prompts per-session, set up a prompt journal or prompt library from their inputs, install the prompt-capture hook, or uninstall it. Covers placing the hook script, wiring the UserPromptSubmit hook into settings.json (global/user scope), and gitignoring the .prompts folder.
---

# Prompt Capture

A `UserPromptSubmit` hook appends every submitted prompt to
`<project>/.prompts/<session_id>.md` — one markdown file per session, each
prompt a timestamped entry. Scope is **global** (user `settings.json`): it
auto-creates `.prompts/` in whatever project you're in.

## How it works

- Hook event `UserPromptSubmit` fires on every prompt; Claude Code pipes a JSON
  payload (`prompt`, `session_id`, `cwd`) to the script's stdin.
- The bundled `assets/save-prompt.js` ensures `<cwd>/.prompts/` exists, then
  appends `## <local-time>\n\n<prompt>` to `<cwd>/.prompts/<session_id>.md`
  (creates the file with a header on first prompt of a session).
- Read-only capture: the script writes a file, prints nothing to stdout, exits 0
  — it never modifies or blocks the prompt.

## Install (global)

1. **Place the script:** copy `assets/save-prompt.js` to `~/.claude/hooks/save-prompt.js`
   (create `~/.claude/hooks/` if missing). On Windows the home is
   `C:/Users/<user>/.claude`.
2. **Wire the hook** into `~/.claude/settings.json` (user-level = all projects).
   Add a top-level `hooks` key (merge if one exists):
   ```json
   "hooks": {
     "UserPromptSubmit": [
       { "matcher": "", "hooks": [
         { "type": "command", "command": "node \"<ABSOLUTE_PATH>/.claude/hooks/save-prompt.js\"" }
       ] }
     ]
   }
   ```
   Use the **absolute** path to the script (forward slashes ok on Windows).
3. **Gitignore in each project:** create/append `.prompts/` to the project's
   `.gitignore` so captured prompts never get committed. **Do not skip this** —
   prompts can contain secrets/customer data.
4. **Verify:** `node -e 'JSON.parse(require("fs").readFileSync("<ABSOLUTE_PATH>/.claude/settings.json"))'`
   confirms valid JSON. The hook fires on the user's next submitted prompt —
   confirm a file appears under `.prompts/`. If not, restart Claude Code
   (settings/hooks load at startup).

## Uninstall

Remove the `hooks.UserPromptSubmit` entry from `~/.claude/settings.json` (or the
whole `hooks` key if it held nothing else) and delete `~/.claude/hooks/save-prompt.js`.
Leave `.prompts/` folders and `.gitignore` entries in place (they're harmless and
hold captured history).

## Notes / caveats

- **Privacy:** prompts are stored locally in plaintext under each project.
  `.gitignore` stops commits but the files still exist on disk — don't point
  this at a cloud-synced folder if prompts are sensitive.
- **Noise:** it captures *every* prompt including one-offs ("继续"). Curate later
  by deleting `.prompts/` files, or extend the script to filter by length/skip
  patterns.
- **Performance:** `mkdir`-if-missing + `appendFileSync`, no network — negligible
  per prompt.
- **Session filename** is the raw `session_id` (parallels the transcript
  `<session_id>.jsonl`); sort the folder by modified time for recency.

## Resource

- `assets/save-prompt.js` — the hook script. Copy verbatim to
  `~/.claude/hooks/save-prompt.js`.
