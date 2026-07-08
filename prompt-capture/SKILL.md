---
name: prompt-capture
description: Install/remove a Claude Code hook that auto-captures every submitted prompt into a per-project .prompts folder (one markdown file per session, timestamped). v2 filters noise (skips tiny/ACK prompts like "继续" and bare slash commands), redacts common secrets (sk-, gh_, bearer, key=value, bigmodel-style tokens) before writing, and ships a build-library script that fuzzy-dedupes (near-duplicate clustering) + auto-tags (PRD/建模/原型/调试/工具/协作) + ranks captured prompts into a categorized library.md. Use when the user wants to auto-save/log prompts per-session, build a prompt journal or deduplicated prompt library, tune denoise/redaction, or install/uninstall the hook. Covers hook wiring in settings.json (global scope) and gitignoring the .prompts folder.
---

# Prompt Capture

A `UserPromptSubmit` hook appends every submitted prompt to
`<project>/.prompts/<session_id>.md` — one markdown file per session, each
prompt a timestamped entry. Scope is **global** (user `settings.json`): it
auto-creates `.prompts/` in whatever project you're in.

## How it works

- Hook event `UserPromptSubmit` fires on every prompt; Claude Code pipes a JSON
  payload (`prompt`, `session_id`, `cwd`) to the script's stdin.
- `assets/save-prompt.js` ensures `<cwd>/.prompts/` exists, then appends
  `## <local-time>\n\n<prompt>` to `<cwd>/.prompts/YYYYMMDD-<project>-<shortid>.md`
  (header on first prompt of a session). `project` = cwd basename, `shortid` =
  first 8 hex of `session_id`; the date is the first prompt's local date and
  stays fixed for the session (cross-day sessions append to the same file).
- **v2 — denoise:** skips tiny / pure-ACK prompts ("继续", "ok", …) so the log
  stays high-signal. **redact:** scrubs common secrets (sk-, gh_, bearer,
  key=value, bigmodel-style tokens) to `[REDACTED]` before writing.
- Read-only capture: writes a file, prints nothing to stdout, exits 0 — never
  modifies or blocks the prompt.

## Denoise & redaction (tune per project)

Defaults are ON with sensible values. Override by creating
`<project>/.prompts/config.json`:

```json
{ "min_length": 3, "denoise": true, "redact": true, "skip_slash_commands": true,
  "skip_words": ["继续","可以"], "extra_skip_words": ["再加一个"],
  "extra_redact_patterns": ["1[3-9][0-9]{9}", "内部代号\\d+"] }
```

- `min_length` — skip prompts shorter than this (default 2).
- `skip_slash_commands` — skip bare slash commands like `/help` (default true).
- `skip_words` — **replaces** the built-in ACK denylist; `extra_skip_words` appends.
- `extra_redact_patterns` — extra regex strings (applied `gi`) scrubbed to
  `[REDACTED]` on top of the built-in secrets (phone/ID/internal codes).
  Regex escapes need double-backslash in JSON (`\\d`, not `\d`).
- `denoise` / `redact` — set to `false` to disable either stage.
No config file = built-in defaults (works out of the box).

## Build a prompt library

`assets/build-library.js` v2 scans `.prompts/*.md`, **fuzzy-clusters** near-dupes
(Sørensen-Dice ≥ 0.35 on latin words + CJK bigrams — so reworded Chinese prompts
group together), **auto-tags** each cluster by keyword
(PRD / 建模 / 原型 / 调试 / 工具 / 协作), writes `.prompts/library.md` grouped by
tag with reuse counts:

```bash
node ~/.claude/hooks/build-library.js [project-dir] [--threshold 0.35]
```

Lower threshold → merge more aggressively. Re-run anytime (file overwritten).
Hand-curated tags/categories layer on top of this auto baseline.

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
- **Noise:** denoising is ON by default (skips tiny/ACK prompts); tune via
  `config.json` or disable. Run `build-library.js` periodically to dedupe+rank.
- **Redaction is conservative:** only well-known secret shapes — it won't catch
  arbitrary private data. Treat `.prompts/` as still-sensitive (it's gitignored,
  not encrypted).
- **Performance:** `mkdir`-if-missing + `appendFileSync`, no network — negligible
  per prompt.
- **Session filename** is `YYYYMMDD-<project>-<shortid>.md` — date = first
  prompt's local date, project = cwd basename, shortid = first 8 hex of
  `session_id` (parallels the transcript `<session_id>.jsonl`). Cross-day
  sessions keep the first date. Sort the folder by name for chronological order.

## Resources

- `assets/save-prompt.js` — the hook script (capture + denoise + redact). Copy
  to `~/.claude/hooks/save-prompt.js`.
- `assets/build-library.js` — dedupe + rank into `library.md`. Copy to
  `~/.claude/hooks/build-library.js`, run on demand.
