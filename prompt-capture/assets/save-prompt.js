#!/usr/bin/env node
// save-prompt.js — Claude Code `UserPromptSubmit` hook.
// Captures every submitted prompt to <project>/.prompts/<session_id>.md
// (one file per session, markdown, timestamped entries).
//
// Read-only capture: reads stdin JSON, writes a file, exits 0, prints nothing
// to stdout — so it never modifies or blocks the user's prompt.
//
// stdin JSON fields (Claude Code hook payload):
//   prompt       — the submitted prompt text
//   session_id   — current session id (filename key)
//   cwd          — project root (where .prompts/ is created)

const fs = require('fs');
const path = require('path');

function localTs(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
         `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  try {
    let data = {};
    try { data = JSON.parse(raw); } catch { /* not JSON */ }

    const prompt = typeof data.prompt === 'string' ? data.prompt.trim() : '';
    if (!prompt) process.exit(0);                 // nothing to capture

    const sessionId = data.session_id || 'unknown-session';
    const cwd = data.cwd || (data.workspace && data.workspace.cwd) || process.cwd();

    const dir = path.join(cwd, '.prompts');
    fs.mkdirSync(dir, { recursive: true });

    const file = path.join(dir, `${sessionId}.md`);
    const ts = localTs(new Date());
    const entry = `\n## ${ts}\n\n${prompt}\n`;

    if (fs.existsSync(file)) {
      fs.appendFileSync(file, entry);
    } else {
      const header =
        `# Prompts — session ${sessionId}\n\n` +
        `> project: \`${cwd}\`\n> started: ${ts}\n`;
      fs.writeFileSync(file, header + entry);
    }
  } catch {
    // Never break prompt submission on a logging failure.
  }
  process.exit(0);
});
