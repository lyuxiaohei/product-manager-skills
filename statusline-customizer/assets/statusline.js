#!/usr/bin/env node
// Claude Code statusline — copy to ~/.claude/statusline.js and wire up via
// settings.json (see SKILL.md). Shows cwd, git branch, model, and an
// ACCURATE context % computed from the transcript (the built-in % is wrong
// for non-Anthropic models whose window Claude Code can't detect).
//
// Layout:  <yellow>cwd <cyan>(branch)  <dim>model  ctx NN.N% · used/1M
// ctx color: green <70%, yellow 70-90%, red >=90%
//
// Context window: GLM-5.2 = 1,000,000. Override per-model with the
// CC_CONTEXT_WINDOW env var so the same script serves any backend, e.g.
//   "command": "CC_CONTEXT_WINDOW=200000 node ~/.claude/statusline.js"

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

const CONTEXT_WINDOW = Number(process.env.CC_CONTEXT_WINDOW) || 1_000_000;

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(raw); } catch { /* not JSON */ }

  // ---- cwd, ~ collapsed + forward slashes ----
  const cwd = (data.workspace && data.workspace.current_dir) || data.cwd || process.cwd();
  const home = os.homedir();
  let dispCwd = cwd;
  if (cwd.toLowerCase() === home.toLowerCase()) dispCwd = '~';
  else if (cwd.toLowerCase().startsWith(home.toLowerCase())) dispCwd = '~' + cwd.slice(home.length);
  dispCwd = dispCwd.replace(/\\/g, '/');

  // ---- git branch (or short sha) ----
  let branch = '';
  try {
    branch = execSync('git symbolic-ref --short HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    try {
      branch = execSync('git rev-parse --short HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch { /* not a git repo */ }
  }

  const model = (data.model && data.model.display_name) || '';

  // ---- real context % from the transcript's most-recent usage record ----
  let pct = null, used = 0;
  const tp = data.transcript_path;
  if (tp && fs.existsSync(tp)) {
    try {
      const lines = fs.readFileSync(tp, 'utf8').split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (!line) continue;
        let o; try { o = JSON.parse(line); } catch { continue; }
        const u = o.message && o.message.usage;
        if (u && (u.input_tokens != null || u.cache_read_input_tokens != null)) {
          used = (u.input_tokens || 0)
               + (u.cache_read_input_tokens || 0)
               + (u.cache_creation_input_tokens || 0);
          pct = (used / CONTEXT_WINDOW) * 100;
          break;
        }
      }
    } catch { /* unreadable transcript */ }
  }

  // ---- colors ----
  const Y = '\x1b[33m', C = '\x1b[36m', DIM = '\x1b[2m', R = '\x1b[0m';
  const GREEN = '\x1b[32m', RED = '\x1b[31m', YELLOW = '\x1b[33m';
  let ctxColor = GREEN;
  if (pct != null) {
    if (pct >= 90) ctxColor = RED;
    else if (pct >= 70) ctxColor = YELLOW;
  }

  let out = `${Y}${dispCwd}${R}`;
  if (branch) out += ` ${C}(${branch})${R}`;
  if (model) out += `${DIM} ${model}${R}`;
  if (pct != null) {
    const pctStr = pct < 1 ? pct.toFixed(2)
                 : pct < 10 ? pct.toFixed(1)
                 : String(Math.round(pct));
    out += `  ${ctxColor}ctx ${pctStr}%${R}${DIM} · ${fmtK(used)}/${(CONTEXT_WINDOW / 1000)}k${R}`;
  } else {
    out += `  ${DIM}ctx --${R}`;
  }
  process.stdout.write(out);
});

function fmtK(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'k';
  return String(n);
}
