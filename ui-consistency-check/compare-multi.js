const fs = require('fs');
const path = require('path');

// 忽略列表 - 这些是正常的差异，不是风格问题
const IGNORE_FONTS = ['iconfont', 'FontAwesome', 'Material Icons', 'foot' ];
const IGNORE_COLORS = ['rgba(0,0,0,0)', 'transparent', 'rgba(0, 0, 0, 0)'];

function shouldIgnoreFont(ff) {
  if (!ff) return true;
  return IGNORE_FONTS.some(f => ff.toLowerCase().includes(f.toLowerCase()));
}

function shouldIgnoreColor(c) {
  if (!c) return true;
  return IGNORE_COLORS.some(i => c.replace(/\s+/g, '') === i.replace(/\s+/g, ''));
}

// 按页面聚合样式特征
function extractPageProfiles(allPageData) {
  const profiles = [];

  allPageData.forEach(page => {
    const profile = {
      pageName: page.pageName,
      url: page.url,
      elementCount: page.elements.length,
      // 去重后的样式值集合
      buttonBorderRadius: new Set(),
      buttonBgColors: new Set(),
      cardBorderRadius: new Set(),
      cardShadows: new Set(),
      fontFamilies: new Set(),
      tableFontSizes: new Set(),
      headingFontSizes: new Set(),
      // 原始统计
      buttonBRCount: new Map(),
      cardBRCount: new Map(),
      fontCount: new Map(),
    };

    page.elements.forEach(el => {
      const s = el.styles;
      const ff = s['font-family'];
      if (ff && !shouldIgnoreFont(ff)) {
        profile.fontFamilies.add(ff);
        profile.fontCount.set(ff, (profile.fontCount.get(ff) || 0) + 1);
      }

      if (el.category === 'button') {
        const br = s['border-radius'];
        if (br) {
          profile.buttonBorderRadius.add(br);
          profile.buttonBRCount.set(br, (profile.buttonBRCount.get(br) || 0) + 1);
        }
        const bg = s['background-color'];
        if (bg && !shouldIgnoreColor(bg)) {
          profile.buttonBgColors.add(bg);
        }
      }

      if (el.category === 'card') {
        const br = s['border-radius'];
        if (br) {
          profile.cardBorderRadius.add(br);
          profile.cardBRCount.set(br, (profile.cardBRCount.get(br) || 0) + 1);
        }
        const shadow = s['box-shadow'];
        if (shadow && shadow !== 'none') {
          profile.cardShadows.add(shadow);
        }
      }

      if (el.category === 'table-cell') {
        const fs = s['font-size'];
        if (fs) profile.tableFontSizes.add(fs);
      }

      if (el.category === 'heading') {
        const fs = s['font-size'];
        if (fs) profile.headingFontSizes.add(fs);
      }
    });

    // 找出每个页面最常用的值
    profile.dominantButtonBR = getDominant(profile.buttonBRCount);
    profile.dominantCardBR = getDominant(profile.cardBRCount);
    profile.dominantFont = getDominant(profile.fontCount);

    profiles.push(profile);
  });

  return profiles;
}

function getDominant(countMap) {
  if (countMap.size === 0) return null;
  let best = null, bestCount = 0;
  for (const [val, count] of countMap) {
    if (count > bestCount) { best = val; bestCount = count; }
  }
  return best;
}

// 按样式属性分组，找出哪些页面一致、哪些不一致
function findCrossPageInconsistencies(profiles) {
  const dimensions = [
    { key: 'buttonBorderRadius', label: '按钮圆角', sets: 'buttonBorderRadius' },
    { key: 'cardBorderRadius', label: '卡片圆角', sets: 'cardBorderRadius' },
    { key: 'fontFamilies', label: '字体族', sets: 'fontFamilies' },
    { key: 'cardShadows', label: '卡片阴影', sets: 'cardShadows' },
    { key: 'tableFontSizes', label: '表格字号', sets: 'tableFontSizes' },
  ];

  const results = [];

  dimensions.forEach(dim => {
    // 按值分组页面
    const valueGroups = new Map(); // value -> [pageNames]

    profiles.forEach(p => {
      const values = p[dim.sets];
      if (values instanceof Set) {
        values.forEach(v => {
          if (!valueGroups.has(v)) valueGroups.set(v, []);
          valueGroups.get(v).push(p.pageName);
        });
      }
    });

    // 过滤掉所有页面都有的值（一致的）
    const totalPages = profiles.length;
    const inconsistentValues = [];

    for (const [value, pages] of valueGroups) {
      if (pages.length < totalPages) {
        inconsistentValues.push({ value, pages, count: pages.length });
      }
    }

    if (inconsistentValues.length > 1) {
      // 按页面数排序
      inconsistentValues.sort((a, b) => b.count - a.count);
      const majority = inconsistentValues[0];
      const minorities = inconsistentValues.slice(1);

      const item = {
        dimension: dim.label,
        consistent: majority.count >= totalPages * 0.7,
        groups: inconsistentValues.map(g => ({
          value: g.value,
          pages: g.pages,
          count: g.count,
          isMajority: g === majority
        })),
        summary: ''
      };

      if (item.consistent) {
        // 少数页面偏离
        const deviatingPages = minorities.flatMap(g => g.pages);
        item.summary = `大部分页面(${majority.count}个)使用 "${majority.value}", 以下 ${deviatingPages.length} 个页面不一致: ${deviatingPages.join('、')}`;
        item.severity = 'medium';
      } else {
        // 没有明显多数，分裂成多个阵营
        item.summary = `页面风格分裂: ${inconsistentValues.map(g => `"${g.value}" (${g.count}个页面)`).join(' vs ')}`;
        item.severity = 'high';
      }

      results.push(item);
    }
  });

  return results;
}

function generateReport(profiles, inconsistencies, outputDir) {
  const lines = [];
  const totalPages = profiles.length;
  const totalElements = profiles.reduce((s, p) => s + p.elementCount, 0);

  lines.push('# 跨页面 UI 风格一致性走查报告');
  lines.push('');
  lines.push(`**生成时间**: ${new Date().toLocaleString('zh-CN')}`);
  lines.push(`**系统地址**: https://scmtest.hongzhao.com/boss`);
  lines.push(`**走查页面数**: ${totalPages} | **总元素数**: ${totalElements}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // 风格一致性概览
  const consistentDims = inconsistencies.filter(i => i.consistent);
  const splitDims = inconsistencies.filter(i => !i.consistent);
  const score = Math.max(0, 100 - splitDims.length * 20 - consistentDims.length * 5);

  lines.push('## 风格一致性评分');
  lines.push('');
  lines.push(`| 指标 | 数值 |`);
  lines.push(`|------|------|`);
  lines.push(`| 检查维度 | ${inconsistencies.length + 5} |`);
  lines.push(`| 完全一致的维度 | ${5 - inconsistencies.length} |`);
  lines.push(`| 少数偏离的维度 | ${consistentDims.length} |`);
  lines.push(`| 严重分裂的维度 | ${splitDims.length} |`);
  lines.push(`| **综合评分** | **${score}分** |`);
  lines.push('');

  // 各页面风格快照
  lines.push('---');
  lines.push('');
  lines.push('## 各页面风格快照');
  lines.push('');
  lines.push('| 页面 | 按钮圆角 | 卡片圆角 | 字体族 | 卡片阴影 |');
  lines.push('|------|----------|----------|--------|----------|');
  profiles.forEach(p => {
    const br = p.dominantButtonBR || '-';
    const cr = p.dominantCardBR || '-';
    const ff = (p.dominantFont || '-').substring(0, 25);
    const shadows = [...p.cardShadows].map(s => s.substring(0, 20)).join(', ') || 'none';
    lines.push(`| ${p.pageName} | \`${br}\` | \`${cr}\` | \`${ff}...\` | \`${shadows}\` |`);
  });
  lines.push('');

  // 不一致详情
  if (inconsistencies.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## 跨页面不一致详情');
    lines.push('');

    // 先展示严重分裂
    if (splitDims.length > 0) {
      lines.push('### 严重分裂（无统一标准）');
      lines.push('');
      splitDims.forEach(item => {
        lines.push(`**${item.dimension}** — ${item.summary}`);
        lines.push('');
        lines.push('| 风格值 | 页面数 | 页面列表 |');
        lines.push('|--------|--------|----------|');
        item.groups.forEach(g => {
          lines.push(`| \`${g.value}\` | ${g.count} | ${g.pages.join('、')} |`);
        });
        lines.push('');
      });
    }

    // 再展示少数偏离
    if (consistentDims.length > 0) {
      lines.push('### 少数页面偏离（大部分一致）');
      lines.push('');
      consistentDims.forEach(item => {
        lines.push(`**${item.dimension}** — ${item.summary}`);
        lines.push('');
        lines.push('| 风格值 | 页面数 | 页面列表 |');
        lines.push('|--------|--------|----------|');
        item.groups.forEach(g => {
          const tag = g.isMajority ? '主流' : '偏离';
          lines.push(`| \`${g.value}\` (${tag}) | ${g.count} | ${g.pages.join('、')} |`);
        });
        lines.push('');
      });
    }
  } else {
    lines.push('## 所有页面风格完全一致');
    lines.push('');
    lines.push('未发现跨页面风格不一致问题。');
  }

  // 详细对比表 - 每个页面 vs 每个页面
  lines.push('---');
  lines.push('');
  lines.push('## 页面两两对比矩阵');
  lines.push('');
  lines.push('下表展示页面间的风格差异数（按钮圆角、卡片圆角、字体族、阴影等维度）：');
  lines.push('');

  // 表头
  const pageNames = profiles.map(p => p.pageName);
  lines.push('| 页面 | ' + pageNames.map(n => n.substring(0, 4)).join(' | ') + ' |');
  lines.push('|------|' + pageNames.map(() => '---').join('|') + '|');

  // 计算差异数
  profiles.forEach(p1 => {
    const diffs = pageNames.map(p2Name => {
      if (p1.pageName === p2Name) return '-';
      const p2 = profiles.find(p => p.pageName === p2Name);
      let diffCount = 0;
      if (p1.dominantButtonBR !== p2.dominantButtonBR) diffCount++;
      if (p1.dominantCardBR !== p2.dominantCardBR) diffCount++;
      if (p1.dominantFont !== p2.dominantFont) diffCount++;
      const s1 = [...p1.cardShadows].sort().join('|');
      const s2 = [...p2.cardShadows].sort().join('|');
      if (s1 !== s2) diffCount++;
      return diffCount;
    });
    lines.push(`| ${p1.pageName} | ${diffs.join(' | ')} |`);
  });
  lines.push('');
  lines.push('> 数字表示两个页面之间风格不同的维度数，0 表示完全一致');

  lines.push('---');
  lines.push('');
  lines.push('*本报告由 UI 风格一致性走查工具自动生成*');

  const report = lines.join('\n');
  const reportPath = path.join(outputDir, 'cross-page-report.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`[report] 报告已保存: ${reportPath}`);
  return report;
}

// Main
const DATA_DIR = process.argv[2] || path.join(__dirname, 'output', 'multi-page');

if (require.main === module) {
  const allPageData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all-pages-data.json'), 'utf-8'));
  const profiles = extractPageProfiles(allPageData);
  const inconsistencies = findCrossPageInconsistencies(profiles);
  const report = generateReport(profiles, inconsistencies, DATA_DIR);
  console.log(report);
}

module.exports = { extractPageProfiles, findCrossPageInconsistencies, generateReport };