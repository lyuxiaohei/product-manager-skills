#!/usr/bin/env node
// build-library.js — dedupe + rank captured prompts into <project>/.prompts/library.md
// Scans .prompts/*.md (per-session capture files), extracts prompts, dedupes
// (normalized exact match), ranks by reuse frequency, writes a curated library.md.
//
// Usage: node build-library.js [project-dir]   (default: cwd)
// Near-duplicate (fuzzy) matching is intentionally NOT done — only exact-after-
// normalization. Curate the output by hand for a real tag/category layer.

const fs = require('fs');
const path = require('path');

const projectDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const dir = path.join(projectDir, '.prompts');

if (!fs.existsSync(dir)) {
  console.error(`No .prompts/ at ${dir}. Capture some prompts first.`);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'library.md');
if (!files.length) { console.error('No session .md files to build from.'); process.exit(1); }

// Entry shape written by save-prompt.js: "\n## <ts>\n\n<content>"
const ENTRY = /\n## \d{4}-\d\d-\d\d \d\d:\d\d:\d\d\n\n([\s\S]*?)(?=\n## |\n*$)/g;

const counts = new Map();   // normKey -> { count, sample }
let total = 0;
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  let m;
  while ((m = ENTRY.exec(text))) {
    const p = m[1].trim();
    if (!p) continue;
    total++;
    const key = p.replace(/\s+/g, ' ').toLowerCase().slice(0, 300);  // normalize for dedup
    const cur = counts.get(key);
    if (cur) cur.count++;
    else counts.set(key, { count: 1, sample: p });
  }
}

const entries = [...counts.values()].sort(
  (a, b) => b.count - a.count || b.sample.length - a.sample.length
);
const reused = entries.filter(e => e.count > 1);
const once = entries.filter(e => e.count === 1);

const oneline = s => s.replace(/\s+/g, ' ').trim();

const out = [];
out.push('# Prompt Library (auto-generated)');
out.push('');
out.push(`> ${total} captured → **${entries.length} unique** (${reused.length} reused ≥2×).`);
out.push(`> Regenerate by re-running build-library.js. This file is overwritten each run — curate a separate copy if you hand-tag.`);
out.push('');
if (reused.length) {
  out.push(`## ⭐ Reused (${reused.length})`);
  for (const e of reused) out.push(`- **×${e.count}** — ${oneline(e.sample).slice(0, 180)}`);
  out.push('');
}
out.push(`## Once (${once.length})`);
for (const e of once) out.push(`- ${oneline(e.sample).slice(0, 180)}`);
out.push('');

fs.writeFileSync(path.join(dir, 'library.md'), out.join('\n'));
console.log(`library.md: ${entries.length} unique (${reused.length} reused) from ${total} captured @ ${dir}`);
