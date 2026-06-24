---
name: statusline-customizer
description: Configure, customize, or fix the Claude Code status line (the status bar at the bottom of the terminal). Use when the user wants to set up, change, or remove a custom statusline; add fields like git branch, model name, context %, cost, or cwd; replicate a shell PS1 prompt as the statusline; OR fix a broken/inaccurate statusline — especially the context % showing a wrong value (e.g. stuck at 100%) on non-Anthropic models (GLM, gpt, qwen, etc.) routed through an Anthropic-compatible proxy. Covers the settings.json statusLine config, the JSON piped via stdin, ANSI colors, and computing accurate context usage from the transcript.
---

# Statusline Customizer

## How it works

Claude Code renders the status bar by running the `statusLine.command` from
`settings.json`, piping a session JSON object to its **stdin**, and printing
the command's **stdout** (first line, ANSI colors honored) as the bar. A custom
`statusLine` replaces the built-in bar; removing the key reverts to built-in.

```json
"statusLine": { "type": "command", "command": "node ~/.claude/statusline.js" }
```

## Workflow

1. **Read current state.** Check `~/.claude/settings.json` for an existing
   `statusLine` key (don't clobber it) and whether a script already exists.
2. **Clarify intent.** Three common asks:
   - *New/replace* → install a script + add the config.
   - *Modify fields* → edit the existing script (cwd, branch, model, %, cost…).
   - *Revert to built-in* → remove the `statusLine` key (and any orphan script).
3. **Write the script in Node** (Claude Code ships Node → portable, no `jq`).
   The bundled `assets/statusline.js` is a tested starting point — copy it to
   `~/.claude/statusline.js` and adapt. For other backends set the window via
   `CC_CONTEXT_WINDOW`, e.g. `CC_CONTEXT_WINDOW=200000 node ~/.claude/statusline.js`.
4. **Wire config.** Add/update the `statusLine` key in `settings.json`.
5. **Test by piping JSON** to the script (see reference). Use `node -e` +
   `JSON.stringify` to build the payload — never hand-escape Windows paths in
   shell (POSIX paths silently fail `fs.existsSync` on Windows-node).
6. **Tell the user** it applies on the next prompt render.

## The context-% trap (read this before "fixing" auto-compact)

The built-in `% = used / model_window` only works for `claude-*` ids. For
**any other model** the window is unknown, so the bar renders a saturated
**100%** even at low real usage. Users then think auto-compact is broken — it
isn't; auto-compact fires on real tokens (~92–95%), not the display.

Fix = compute the % yourself from `transcript_path`. Full technique, JSON field
table, and Windows/test pitfalls: see [references/statusline-reference.md](references/statusline-reference.md).
The bundled `assets/statusline.js` already implements this correctly.

## Resources

- `assets/statusline.js` — tested statusline script. Shows cwd · (branch) ·
  model · `ctx N% · used/1M`, color-coded. Copy to `~/.claude/statusline.js`.
- `references/statusline-reference.md` — JSON stdin fields, the transcript
  token technique, Windows notes, language choice, common customizations.
