const fs = require('fs');
const path = require('path');

// 颜色距离计算 (简单 RGB 欧几里得距离)
function parseColor(colorStr) {
  if (!colorStr) return null;
  // rgb(r, g, b) / rgba(r, g, b, a)
  const rgba = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], alpha: rgba[4] ? parseFloat(rgba[4]) : 1 };
  // #hex
  const hex = colorStr.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (hex) return { r: parseInt(hex[1], 16), g: parseInt(hex[2], 16), b: parseInt(hex[3], 16), alpha: 1 };
  // #hex short
  const hexShort = colorStr.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])/i);
  if (hexShort) return { r: parseInt(hexShort[1]+hexShort[1], 16), g: parseInt(hexShort[2]+hexShort[2], 16), b: parseInt(hexShort[3]+hexShort[3], 16), alpha: 1 };
  // named colors
  const named = {
    white: [255,255,255], black: [0,0,0], red: [255,0,0],
    transparent: [0,0,0,0]
  };
  if (named[colorStr.toLowerCase()]) {
    const v = named[colorStr.toLowerCase()];
    return { r: v[0], g: v[1], b: v[2], alpha: v[3] ?? 1 };
  }
  return null;
}

function colorDistance(c1, c2) {
  const a = parseColor(c1), b = parseColor(c2);
  if (!a || !b) return Infinity;
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function pxToNum(px) {
  if (!px) return null;
  const m = px.match(/^([\d.]+)px$/);
  return m ? parseFloat(m[1]) : null;
}

function normalizeColorForCompare(c) {
  if (!c) return '';
  return c.replace(/\s+/g, '').toLowerCase();
}

// 检查器函数
const checkers = {
  // 按钮色彩检查
  buttonColor(els, baseline, tokens) {
    const issues = [];
    const buttons = els.filter(e => e.category === 'button');
    const primaryColor = parseColor(tokens.colors.primary.value);
    const tolerance = tokens.colors.primary.tolerance;

    buttons.forEach(btn => {
      const bg = btn.styles['background-color'] || '';
      const bgColor = parseColor(bg);
      if (bgColor && bgColor.alpha > 0 && bgColor.r + bgColor.g + bgColor.b > 30) {
        const dist = colorDistance(bg, tokens.colors.primary.value);
        const isWhite = bgColor.r > 250 && bgColor.g > 250 && bgColor.b > 250;
        const isTransparent = bg.includes('rgba(0, 0, 0, 0)') || bg === 'transparent';
        // 跳过白色/透明背景（可能是默认按钮/文字按钮）
        if (!isWhite && !isTransparent && dist > tolerance * 10) {
          issues.push({
            category: 'color',
            severity: 'medium',
            element: `按钮 "${btn.text.substring(0, 30)}"`,
            expected: tokens.colors.primary.value,
            actual: bg,
            location: `(${btn.rect.x}, ${btn.rect.y}) ${btn.rect.width}x${btn.rect.height}`,
            message: `按钮背景色偏离主色: ${bg} (距离=${dist.toFixed(1)})`
          });
        }
      }
    });
    return issues;
  },

  // 字体大小检查
  typographySize(els, baseline, tokens) {
    const issues = [];
    const headings = els.filter(e => e.category === 'heading');
    const fontSizeTokens = tokens.typography.fontSize;

    headings.forEach(h => {
      const fs = h.styles['font-size'];
      const expectedKey = h.tag;
      const expected = fontSizeTokens[expectedKey];
      if (expected) {
        const actualPx = pxToNum(fs);
        const expectedPx = pxToNum(expected.value);
        if (actualPx !== null && expectedPx !== null) {
          const diff = Math.abs(actualPx - expectedPx);
          if (diff > expected.tolerance) {
            issues.push({
              category: 'typography',
              severity: 'high',
              element: `${h.tag} "${h.text.substring(0, 30)}"`,
              expected: expected.value,
              actual: fs,
              location: `(${h.rect.x}, ${h.rect.y})`,
              message: `标题字号不一致: ${h.tag} 应为 ${expected.value}, 实际 ${fs}`
            });
          }
        }
      }
    });

    // 检查正文字号
    const bodyTexts = els.filter(e => e.category === 'generic' && e.text.length > 10 && e.styles['font-size']);
    const bodyExpected = pxToNum(fontSizeTokens.body.value);
    const bodyTolerance = fontSizeTokens.body.tolerance;
    const fontSizeMap = new Map();

    bodyTexts.forEach(el => {
      const fs = el.styles['font-size'];
      const fsPx = pxToNum(fs);
      if (fsPx !== null) {
        if (!fontSizeMap.has(fs)) fontSizeMap.set(fs, []);
        fontSizeMap.get(fs).push(el);
      }
    });

    // 找出异常字号
    const sizes = Array.from(fontSizeMap.entries()).sort((a, b) => b[1].length - a[1].length);
    const mostCommonSize = sizes[0]?.[0];
    if (mostCommonSize && sizes.length > 1) {
      const mostCommonPx = pxToNum(mostCommonSize);
      sizes.slice(1).forEach(([size, sizeEls]) => {
        const sizePx = pxToNum(size);
        if (mostCommonPx !== null && sizePx !== null && Math.abs(sizePx - mostCommonPx) > 2 && sizeEls.length <= 2) {
          sizeEls.slice(0, 3).forEach(el => {
            issues.push({
              category: 'typography',
              severity: 'medium',
              element: `文字 "${el.text.substring(0, 30)}"`,
              expected: mostCommonSize,
              actual: size,
              location: `(${el.rect.x}, ${el.rect.y})`,
              message: `正文字号偏离主体: 大部分为 ${mostCommonSize}, 此处为 ${size}`
            });
          });
        }
      });
    }

    return issues;
  },

  // 间距一致性检查
  spacingCheck(els, baseline, tokens) {
    const issues = [];
    // 检查同类元素间距是否一致
    const categories = ['button', 'input', 'card', 'tag', 'form'];
    const spacingTokens = tokens.spacing;

    categories.forEach(cat => {
      const catEls = els.filter(e => e.category === cat);
      if (catEls.length < 2) return;

      const paddingMap = new Map();
      catEls.forEach(el => {
        const pt = el.styles['padding-top'];
        const pr = el.styles['padding-right'];
        const pb = el.styles['padding-bottom'];
        const pl = el.styles['padding-left'];
        const key = `${pt}|${pr}|${pb}|${pl}`;
        if (!paddingMap.has(key)) paddingMap.set(key, []);
        paddingMap.get(key).push(el);
      });

      // 如果同类元素有多种 padding 组合，报告
      if (paddingMap.size > 2) {
        const sorted = Array.from(paddingMap.entries()).sort((a, b) => b[1].length - a[1].length);
        const dominant = sorted[0];
        sorted.slice(1).forEach(([pkey, pels]) => {
          if (pels.length <= 1) {
            pels.forEach(el => {
              issues.push({
                category: 'spacing',
                severity: 'medium',
                element: `${cat} "${el.text.substring(0, 30)}"`,
                expected: dominant[0],
                actual: pkey,
                location: `(${el.rect.x}, ${el.rect.y})`,
                message: `${cat} 内边距不一致: 大部分为 ${dominant[0]}, 此处为 ${pkey}`
              });
            });
          }
        });
      }
    });

    return issues;
  },

  // 圆角一致性检查
  borderRadiusCheck(els, baseline, tokens) {
    const issues = [];
    const borderRadiusTokens = tokens.borderRadius;

    const categories = ['button', 'input', 'card', 'tag', 'modal'];
    categories.forEach(cat => {
      const catEls = els.filter(e => e.category === cat);
      if (catEls.length < 2) return;

      const radiusMap = new Map();
      catEls.forEach(el => {
        const br = el.styles['border-radius'];
        const key = br || '0px';
        if (!radiusMap.has(key)) radiusMap.set(key, []);
        radiusMap.get(key).push(el);
      });

      if (radiusMap.size > 2) {
        const sorted = Array.from(radiusMap.entries()).sort((a, b) => b[1].length - a[1].length);
        const dominant = sorted[0];
        sorted.slice(1).forEach(([rkey, rels]) => {
          if (rels.length <= 1) {
            rels.forEach(el => {
              issues.push({
                category: 'borderRadius',
                severity: 'medium',
                element: `${cat} "${el.text.substring(0, 30)}"`,
                expected: dominant[0],
                actual: rkey,
                location: `(${el.rect.x}, ${el.rect.y})`,
                message: `${cat} 圆角不一致: 大部分为 ${dominant[0]}, 此处为 ${rkey}`
              });
            });
          }
        });
      }
    });

    return issues;
  },

  // 表格样式检查
  tableCheck(els, baseline, tokens) {
    const issues = [];
    const tableCells = els.filter(e => e.category === 'table-cell');
    if (tableCells.length === 0) return issues;

    const tableTokens = tokens.components.table;
    const expectedFontSize = tableTokens.fontSize;

    const fontSizes = new Map();
    tableCells.forEach(cell => {
      const fs = cell.styles['font-size'];
      if (!fontSizes.has(fs)) fontSizes.set(fs, []);
      fontSizes.get(fs).push(cell);
    });

    const sorted = Array.from(fontSizes.entries()).sort((a, b) => b[1].length - a[1].length);
    if (sorted.length > 1) {
      const dominant = sorted[0][0];
      sorted.slice(1).forEach(([fs, cells]) => {
        if (cells.length <= 2) {
          issues.push({
            category: 'typography',
            severity: 'low',
            element: `表格单元格 ×${cells.length}`,
            expected: dominant,
            actual: fs,
            location: `(${cells[0].rect.x}, ${cells[0].rect.y})`,
            message: `表格字体大小不一致: 大部分为 ${dominant}, 个别为 ${fs}`
          });
        }
      });
    }

    return issues;
  },

  // 卡片阴影检查
  cardShadowCheck(els, baseline, tokens) {
    const issues = [];
    const cards = els.filter(e => e.category === 'card');
    if (cards.length < 2) return issues;

    const shadowMap = new Map();
    cards.forEach(card => {
      const bs = card.styles['box-shadow'] || 'none';
      if (!shadowMap.has(bs)) shadowMap.set(bs, []);
      shadowMap.get(bs).push(card);
    });

    if (shadowMap.size > 2) {
      const sorted = Array.from(shadowMap.entries()).sort((a, b) => b[1].length - a[1].length);
      const dominant = sorted[0];
      sorted.slice(1).forEach(([shadow, sels]) => {
        if (sels.length <= 1) {
          sels.forEach(el => {
            issues.push({
              category: 'component',
              severity: 'low',
              element: `卡片 "${el.text.substring(0, 30)}"`,
              expected: dominant[0],
              actual: shadow,
              location: `(${el.rect.x}, ${el.rect.y})`,
              message: `卡片阴影不一致: 大部分为 "${dominant[0].substring(0, 50)}...", 此处为 "${shadow.substring(0, 50)}..."`
            });
          });
        }
      });
    }

    return issues;
  },

  // 字体族检查
  fontFamilyCheck(els, baseline, tokens) {
    const issues = [];
    const expectedFont = tokens.typography.fontFamily.value.toLowerCase();

    const fontMap = new Map();
    els.forEach(el => {
      const ff = (el.styles['font-family'] || '').toLowerCase();
      if (!ff) return;
      if (!fontMap.has(ff)) fontMap.set(ff, []);
      fontMap.get(ff).push(el);
    });

    const sorted = Array.from(fontMap.entries()).sort((a, b) => b[1].length - a[1].length);
    sorted.slice(1).forEach(([font, fontEls]) => {
      if (fontEls.length <= 2 && !font.includes('icon') && !font.includes('fontawesome')) {
        issues.push({
          category: 'typography',
          severity: 'high',
          element: `文字元素 ×${fontEls.length}`,
          expected: tokens.typography.fontFamily.value,
          actual: fontEls[0].styles['font-family'],
          location: `(${fontEls[0].rect.x}, ${fontEls[0].rect.y})`,
          message: `字体族不一致: 大部分使用 "${sorted[0][0].substring(0, 40)}", 此处使用 "${font.substring(0, 40)}"`
        });
      }
    });

    return issues;
  }
};

function compare(baseline, capturedData) {
  const tokens = baseline.tokens;
  const els = capturedData.elements;
  const allIssues = [];

  console.log(`[compare] 开始对比, 基线: ${baseline.name}, 元素数: ${els.length}`);

  // 执行所有检查器
  for (const [name, checkFn] of Object.entries(checkers)) {
    try {
      console.log(`[compare] 执行检查: ${name}`);
      const issues = checkFn(els, baseline, tokens);
      allIssues.push(...issues);
      console.log(`[compare] ${name}: 发现 ${issues.length} 个问题`);
    } catch (err) {
      console.error(`[compare] ${name} 检查失败:`, err.message);
    }
  }

  // 按严重程度排序
  const severityOrder = { high: 0, medium: 1, low: 2 };
  allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // 统计
  const summary = {
    baseline: baseline.name,
    url: capturedData.url,
    title: capturedData.title,
    timestamp: capturedData.timestamp,
    totalElements: els.length,
    totalIssues: allIssues.length,
    bySeverity: {
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length
    },
    byCategory: {}
  };
  allIssues.forEach(i => {
    summary.byCategory[i.category] = (summary.byCategory[i.category] || 0) + 1;
  });

  return { summary, issues: allIssues };
}

// Main
const DATA_DIR = process.argv[2] || path.join(__dirname, 'output');
const BASELINE_PATH = process.argv[3] || path.join(__dirname, 'design-baseline.json');

if (require.main === module) {
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
  const capturedData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'captured-data.json'), 'utf-8'));

  const result = compare(baseline, capturedData);

  const resultPath = path.join(DATA_DIR, 'compare-result.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
  console.log(`\n[compare] ✅ 对比完成! 共发现 ${result.summary.totalIssues} 个问题`);
  console.log(`  严重: ${result.summary.bySeverity.high} | 一般: ${result.summary.bySeverity.medium} | 建议: ${result.summary.bySeverity.low}`);
  console.log(JSON.stringify({ summary: result.summary }));
}

module.exports = { compare, checkers };