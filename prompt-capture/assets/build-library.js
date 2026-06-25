#!/usr/bin/env node
// build-library.js v2 — fuzzy-dedupe + auto-categorize → <project>/.prompts/library.md
// Scans .prompts/*.md (per-session capture files), extracts prompts, clusters
// NEAR-duplicates (Jaccard ≥ threshold on latin-words + CJK-bigrams, so reworded
// Chinese prompts group together), auto-tags by keyword, writes a library.md
// grouped by tag with reuse counts.
//
// Usage: node build-library.js [project-dir] [--threshold 0.35]
// Default threshold 0.35 (Sørensen-Dice). Lower → more aggressive grouping.

const fs = require('fs');
const path = require('path');

const projectDir = process.argv[2] && !process.argv[2].startsWith('--') ? path.resolve(process.argv[2]) : process.cwd();
const thrArg = process.argv.includes('--threshold');
const THRESHOLD = thrArg ? parseFloat(process.argv[process.argv.indexOf('--threshold') + 1]) : 0.35;

const dir = path.join(projectDir, '.prompts');
if (!fs.existsSync(dir)) { console.error(`No .prompts/ at ${dir}.`); process.exit(1); }
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'library.md');
if (!files.length) { console.error('No session .md files to build from.'); process.exit(1); }

const ENTRY = /\n## \d{4}-\d\d-\d\d \d\d:\d\d:\d\d\n\n([\s\S]*?)(?=\n## |\n*$)/g;

// ---- tokenization: latin words (len≥2) + CJK bigrams (handles Chinese without a segmenter) ----
function tokens(s) {
  const t = new Set();
  (s.toLowerCase().match(/[a-z0-9]{2,}/g) || []).forEach(w => t.add(w));
  const cjk = s.replace(/[^一-鿿]/g, '');
  for (let i = 0; i < cjk.length - 1; i++) t.add(cjk.slice(i, i + 2));
  return t;
}
function dice(a, b) {
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  return (a.size + b.size) ? (2 * inter) / (a.size + b.size) : 0;  // Sørensen–Dice
}

// ---- auto-tag rules (keyword → tag); a cluster can carry several tags ----
const TAG_RULES = [
  { tag: 'PRD / 需求', kw: ['prd', '需求', '验收', '用例', 'uc', 'ac', '范围', '优先级', 'mvp'] },
  { tag: '建模 / 逻辑', kw: ['建模', '实体', '模型', '状态机', '逻辑', '业务', '聚合', '单据', '缺口'] },
  { tag: '原型 / UI', kw: ['原型', '页面', 'ui', '组件', '交互', '弹窗', 'modal', '导航'] },
  { tag: '调试 / 代码', kw: ['bug', '报错', '调试', '修复', '代码', '测试', 'error', '失败'] },
  { tag: '工具 / 技能', kw: ['技能', 'skill', 'hook', '脚本', 'statusline', '工具', '安装', '配置'] },
  { tag: '协作 / git', kw: ['git', 'push', 'commit', '仓库', 'github', '提交', '推送'] },
];
function tagsFor(s) {
  const low = s.toLowerCase();
  const hits = TAG_RULES.filter(r => r.kw.some(k => low.includes(k))).map(r => r.tag);
  return hits.length ? hits : ['未分类'];
}

// ---- extract ----
const prompts = [];
let total = 0;
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  let m;
  while ((m = ENTRY.exec(text))) {
    const p = m[1].trim();
    if (!p) continue;
    total++;
    prompts.push(p);
  }
}

// ---- greedy fuzzy cluster ----
const clusters = [];   // { toks, samples[] }
for (const p of prompts) {
  const pt = tokens(p);
  let host = null;
  for (const c of clusters) {
    if (dice(pt, c.toks) >= THRESHOLD) { host = c; break; }
  }
  if (host) host.samples.push(p);
  else clusters.push({ toks: pt, samples: [p] });
}

// ---- pick representative (longest) + tag, sort by cluster size ----
const groups = clusters.map(c => {
  const rep = c.samples.slice().sort((a, b) => b.length - a.length)[0];
  return { count: c.samples.length, rep, tags: tagsFor(rep) };
}).sort((a, b) => b.count - a.count || b.rep.length - a.rep.length);

// group by primary tag
const byTag = new Map();
for (const g of groups) {
  const tag = g.tags[0];
  if (!byTag.has(tag)) byTag.set(tag, []);
  byTag.get(tag).push(g);
}
const reusedN = groups.filter(g => g.count > 1).length;
const oneline = s => s.replace(/\s+/g, ' ').trim();

// ---- render ----
const out = [];
out.push('# Prompt Library (auto, v2 fuzzy)');
out.push('');
out.push(`> ${total} captured → **${groups.length} clusters** (${reusedN} with near-dups, threshold ${THRESHOLD}).`);
out.push(`> Grouped by auto-tag. Re-run to refresh (file overwritten). Curate a copy for hand-tagging.`);
out.push('');
for (const [tag, gs] of byTag) {
  out.push(`## ${tag} (${gs.length})`);
  for (const g of gs) {
    const mark = g.count > 1 ? `**×${g.count}** — ` : '';
    out.push(`- ${mark}${oneline(g.rep).slice(0, 180)}`);
  }
  out.push('');
}
fs.writeFileSync(path.join(dir, 'library.md'), out.join('\n'));
console.log(`library.md: ${groups.length} clusters (${reusedN} near-dup) from ${total} captured @ ${dir}`);
