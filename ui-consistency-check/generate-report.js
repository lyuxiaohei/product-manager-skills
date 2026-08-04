const fs = require('fs');
const path = require('path');

const CATEGORY_LABELS = {
  color: '色彩一致性',
  typography: '字体一致性',
  spacing: '间距一致性',
  borderRadius: '圆角一致性',
  component: '组件一致性',
  layout: '布局一致性'
};

const SEVERITY_LABELS = {
  high: '严重',
  medium: '一般',
  low: '建议'
};

const SEVERITY_ICONS = {
  high: '🔴',
  medium: '🟡',
  low: '🔵'
};

function generateMarkdownReport(compareResult) {
  const { summary, issues } = compareResult;

  const lines = [];

  lines.push(`# UI 风格统一性走查报告`);
  lines.push('');
  lines.push(`**生成时间**: ${new Date().toLocaleString('zh-CN')}`);
  lines.push(`**页面地址**: ${summary.url}`);
  lines.push(`**页面标题**: ${summary.title}`);
  lines.push(`**设计基线**: ${summary.baseline}`);
  lines.push(`**采集元素数**: ${summary.totalElements}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // 概览
  lines.push('## 概览');
  lines.push('');
  lines.push(`| 指标 | 数值 |`);
  lines.push(`|------|------|`);
  lines.push(`| 问题总数 | **${summary.totalIssues}** |`);
  lines.push(`| ${SEVERITY_ICONS.high} 严重问题 | ${summary.bySeverity.high} |`);
  lines.push(`| ${SEVERITY_ICONS.medium} 一般问题 | ${summary.bySeverity.medium} |`);
  lines.push(`| ${SEVERITY_ICONS.low} 建议优化 | ${summary.bySeverity.low} |`);
  lines.push('');

  // 按类别统计
  if (Object.keys(summary.byCategory).length > 0) {
    lines.push('### 问题分布');
    lines.push('');
    lines.push('| 检查维度 | 问题数 |');
    lines.push('|----------|--------|');
    for (const [cat, count] of Object.entries(summary.byCategory)) {
      lines.push(`| ${CATEGORY_LABELS[cat] || cat} | ${count} |`);
    }
    lines.push('');
  }

  // 评分
  const score = Math.max(0, 100 - summary.bySeverity.high * 15 - summary.bySeverity.medium * 5 - summary.bySeverity.low * 2);
  const grade = score >= 90 ? 'A 优秀' : score >= 75 ? 'B 良好' : score >= 60 ? 'C 一般' : 'D 需改进';
  lines.push(`### 风格一致性评分: **${score}分 / ${grade}**`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // 严重问题
  if (summary.bySeverity.high > 0) {
    lines.push(`## ${SEVERITY_ICONS.high} 严重问题 (${summary.bySeverity.high})`);
    lines.push('');
    const highIssues = issues.filter(i => i.severity === 'high');
    highIssues.forEach((issue, idx) => {
      lines.push(`### ${idx + 1}. ${issue.message}`);
      lines.push('');
      lines.push(`| 属性 | 详情 |`);
      lines.push(`|------|------|`);
      lines.push(`| 检查维度 | ${CATEGORY_LABELS[issue.category] || issue.category} |`);
      lines.push(`| 相关元素 | ${issue.element} |`);
      lines.push(`| 期望值 | \`${issue.expected}\` |`);
      lines.push(`| 实际值 | \`${issue.actual}\` |`);
      lines.push(`| 位置 | ${issue.location} |`);
      lines.push('');
    });
  }

  // 一般问题
  if (summary.bySeverity.medium > 0) {
    lines.push(`## ${SEVERITY_ICONS.medium} 一般问题 (${summary.bySeverity.medium})`);
    lines.push('');
    const mediumIssues = issues.filter(i => i.severity === 'medium');
    lines.push('| # | 维度 | 问题描述 | 期望 | 实际 | 位置 |');
    lines.push('|---|------|----------|------|------|------|');
    mediumIssues.forEach((issue, idx) => {
      lines.push(`| ${idx + 1} | ${CATEGORY_LABELS[issue.category] || issue.category} | ${issue.message} | \`${issue.expected}\` | \`${issue.actual}\` | ${issue.location} |`);
    });
    lines.push('');
  }

  // 建议优化
  if (summary.bySeverity.low > 0) {
    lines.push(`## ${SEVERITY_ICONS.low} 建议优化 (${summary.bySeverity.low})`);
    lines.push('');
    const lowIssues = issues.filter(i => i.severity === 'low');
    lines.push('| # | 维度 | 问题描述 | 期望 | 实际 |');
    lines.push('|---|------|----------|------|------|');
    lowIssues.forEach((issue, idx) => {
      lines.push(`| ${idx + 1} | ${CATEGORY_LABELS[issue.category] || issue.category} | ${issue.message} | \`${issue.expected}\` | \`${issue.actual}\` |`);
    });
    lines.push('');
  }

  if (issues.length === 0) {
    lines.push('## ✅ 未发现风格不一致问题');
    lines.push('');
    lines.push('页面风格与设计基线高度一致，所有检查项均通过。');
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('*本报告由 UI 风格一致性走查工具自动生成*');

  return lines.join('\n');
}

function generateReport(compareResult, outputDir) {
  const report = generateMarkdownReport(compareResult);
  const reportPath = path.join(outputDir, 'ui-walkthrough-report.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`[report] 报告已保存: ${reportPath}`);
  return report;
}

// Main
const DATA_DIR = process.argv[2] || path.join(__dirname, 'output');

if (require.main === module) {
  const compareResult = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'compare-result.json'), 'utf-8'));
  const report = generateReport(compareResult, DATA_DIR);
  console.log(report);
}

module.exports = { generateReport, generateMarkdownReport };