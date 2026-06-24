# Statusline Reference

Detailed reference for building Claude Code statuslines. SKILL.md holds the
workflow; this file holds the mechanics.

## How the statusline works

1. Claude Code reads `statusLine` from `settings.json`.
2. On each render it runs the `command`, piping a session JSON object to the
   command's **stdin**.
3. It takes the command's **stdout** (first line) and renders it as the status
   bar. ANSI color escapes are honored.
4. Setting a custom `statusLine` **replaces** the built-in status bar entirely.
   Removing the key reverts to the built-in default.

Config shape (`~/.claude/settings.json`):

```json
"statusLine": {
  "type": "command",
  "command": "node ~/.claude/statusline.js"
}
```

## JSON fields piped to stdin

Common fields (confirm by logging stdin if a field is missing on your version):

| Field | Meaning |
|-------|---------|
| `workspace.current_dir` / `cwd` | Current working directory (Windows path on Windows) |
| `workspace.project_dir` | Project root |
| `model.id` / `model.display_name` | Model in use |
| `transcript_path` | Path to the session JSONL — use this to compute real token usage |
| `session_id` | Session id |
| `version` | Claude Code version |
| `output_style.name` | Active output style |
| `cost.total_cost_usd` | Running cost |
| `cost.total_lines_added` / `total_lines_removed` | Diff stats |
| `exceeds_200k_tokens` | Boolean — the ONLY context hint Claude Code exposes; not a live % |

## Computing accurate context % (the key technique)

The built-in status bar computes `% = used_tokens / model_context_window`. It
only knows windows for `claude-*` model ids. For **any other model** (GLM, gpt,
qwen, etc. via an Anthropic-compatible proxy) the window is unknown, so the
division fails and the bar renders a saturated **100%** — misleading, and it
makes users think auto-compact is broken.

Fix: read the real token count from the transcript and divide by the model's
known window yourself.

```js
const lines = fs.readFileSync(transcript_path, 'utf8').split('\n');
for (let i = lines.length - 1; i >= 0; i--) {       // newest-first
  let o; try { o = JSON.parse(lines[i]); } catch { continue; }
  const u = o.message && o.message.usage;
  if (u && (u.input_tokens != null || u.cache_read_input_tokens != null)) {
    const used = (u.input_tokens || 0)
               + (u.cache_read_input_tokens || 0)    // cached prompt body
               + (u.cache_creation_input_tokens || 0); // newly cached
    const pct = (used / CONTEXT_WINDOW) * 100;
    break;
  }
}
```

- `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` =
  the full context size of the most recent request. Correct numerator.
- Iterate from the **end** — the last `usage` record is the current context.
- Set `CONTEXT_WINDOW` to the backend's real window (GLM-5.2 = 1,000,000;
  GLM-4.x = 128,000–200,000; gpt-4o = 128,000). Parametrize via env var so one
  script serves any backend.

**Auto-compact is NOT broken** in this situation: it triggers on real token
counts (~92–95% of the window), not the display. The 100% is cosmetic. Manual
`/compact` and `/clear` always work regardless.

## Windows notes

- Claude Code on Windows sends **Windows paths** (`C:\Users\...`) in the JSON.
  Node's `fs.*` and `child_process` accept these directly — do not convert.
- When **testing** a script from Git Bash, `$PWD` and `$HOME` are POSIX-style
  (`/c/Users/...`) which Windows-node `fs.existsSync` rejects, so the transcript
  read silently fails (shows `ctx --`). Build the test payload with `node -e`
  + `JSON.stringify` (or `cygpath -w`) to feed real Windows paths.
- Some proxy env vars (`MSYSTEM= MINGW64`, `USERNAME`, `COMPUTERNAME`) are
  available if you want shell-PS1-style fields.

## Choosing the script language

- **Node** is the safe default — Claude Code ships Node, so `node script.js`
  runs everywhere with no extra deps. Avoid `jq` (often absent on Windows).
- Bash inline commands work on Unix but are fragile on Windows; prefer a file.

## Common customizations

- **Replicate a shell PS1**: output `<green>user@host <purple>$MSYSTEM
  <yellow>cwd <cyan>(branch)`. On Git for Windows the PS1 lives in
  `/etc/profile.d/git-prompt.sh` (a.k.a. `<Git>\etc\profile.d\git-prompt.sh`),
  not in home dotfiles.
- **Show cost**: append `${DIM}$${(data.cost.total_cost_usd||0).toFixed(2)}${R}`.
- **Show output style / version**: from the JSON fields above.
- **Color thresholds**: green < 70 %, yellow 70–90 %, red ≥ 90 % is a readable
  convention for context %.

## Performance note

Reading the whole transcript each render is instant for small sessions. As a
session approaches a large window (1M tokens) the JSONL can reach tens of MB
and each render may add ~50–200 ms. If that becomes noticeable, read only the
file tail instead of `readFileSync` of the whole file.
