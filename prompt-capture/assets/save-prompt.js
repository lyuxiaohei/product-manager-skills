#!/usr/bin/env node
// save-prompt.js — Claude Code `UserPromptSubmit` hook (v2: denoise + redact).
// Captures submitted prompts to <project>/.prompts/<session_id>.md
// (one file per session, markdown, timestamped entries).
//
// v2 adds:
//   - DENOISE: skip tiny / pure-ACK prompts ("继续", "ok", ...) so the log
//     stays high-signal. Tunable: min_length + skip_words.
//   - REDACT: scrub common secret patterns (sk-, gh_, bearer, key=value,
//     bigmodel-style tokens) to [REDACTED] before writing.
//
// Both are ON by default. Override per-project via <cwd>/.prompts/config.json:
//   { "min_length": 3, "denoise": true, "redact": true,
//     "skip_words": ["继续","可以","..."], "extra_skip_words": ["另存"] }
//
// Read-only capture: reads stdin JSON, writes a file, exits 0, prints nothing
// to stdout — never modifies or blocks the prompt.
//
// stdin JSON fields: prompt, session_id, cwd.

const fs = require('fs');
const path = require('path');

const DEFAULT_SKIP_WORDS = [
  '继续', '可以', '好的', '好', '嗯', 'ok', 'okay', 'yes', 'no', 'nope',
  '对', '是', '不是', '收到', '明白', '了解', '知道了', 'kk', '继续吧',
  'go', 'next', '继续开发', '谢谢', '感谢',
];

function loadConfig(cwd) {
  const cfg = { min_length: 2, denoise: true, redact: true, skip_words: DEFAULT_SKIP_WORDS };
  try {
    const f = path.join(cwd, '.prompts', 'config.json');
    if (fs.existsSync(f)) {
      const c = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (typeof c.min_length === 'number') cfg.min_length = c.min_length;
      if (typeof c.denoise === 'boolean') cfg.denoise = c.denoise;
      if (typeof c.redact === 'boolean') cfg.redact = c.redact;
      if (Array.isArray(c.skip_words)) cfg.skip_words = c.skip_words;        // replaces defaults
      if (Array.isArray(c.extra_skip_words)) cfg.skip_words = cfg.skip_words.concat(c.extra_skip_words);
    }
  } catch { /* bad config → use defaults */ }
  return cfg;
}

function isNoise(prompt, cfg) {
  const t = prompt.trim();
  if (t.length < cfg.min_length) return true;                        // too short
  if (cfg.skip_words.some(w => w && w.trim().toLowerCase() === t.toLowerCase())) return true; // pure ACK
  return false;
}

// Scrub common secret patterns. Conservative: only well-known shapes, so it
// won't mangle normal prose.
function redact(s) {
  s = s.replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED:sk]');
  s = s.replace(/gh[opsu]_[A-Za-z0-9]{36,}/g, '[REDACTED:gh]');
  s = s.replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED:aws]');
  s = s.replace(/xox[baprs]-[A-Za-z0-9-]{10,}/g, '[REDACTED:slack]');
  s = s.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]');
  s = s.replace(/[0-9a-f]{32}\.[A-Za-z0-9_-]{12,}/gi, '[REDACTED:token]'); // bigmodel/GLM-style
  // key=value: api_key=..., "token": "...", Authorization: Bearer ...
  s = s.replace(
    /((?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|passwd?|authorization))(["'\s]*[:=]\s*["']?)([^\s"';,}]{8,})/gi,
    '$1$2[REDACTED]'
  );
  return s;
}

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
    const cfg = loadConfig(cwd);

    if (cfg.denoise && isNoise(prompt, cfg)) process.exit(0);   // DENOISE: skip

    const clean = cfg.redact ? redact(prompt) : prompt;

    const dir = path.join(cwd, '.prompts');
    fs.mkdirSync(dir, { recursive: true });

    const file = path.join(dir, `${sessionId}.md`);
    const ts = localTs(new Date());
    const entry = `\n## ${ts}\n\n${clean}\n`;

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
