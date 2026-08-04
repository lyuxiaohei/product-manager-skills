#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SKILL_DIR = __dirname;
const OUTPUT_DIR = path.join(SKILL_DIR, 'output');

// 获取目标 URL
const targetUrl = process.argv[2];
if (!targetUrl) {
  console.error('用法: node run-check.js <URL> [loginUrl] [username] [password]');
  console.error('示例: node run-check.js http://192.168.18.64/boss/system-setting/mall');
  console.error('示例: node run-check.js http://192.168.18.64/boss/system-setting/mall http://192.168.18.64/boss/login admin 123456');
  process.exit(1);
}

const loginUrl = process.argv[3] || '';
const loginUser = process.argv[4] || '';
const loginPass = process.argv[5] || '';

console.log('╔══════════════════════════════════════╗');
console.log('║   UI 风格统一性走查工具 v1.0       ║');
console.log('╚══════════════════════════════════════╝');
console.log('');
console.log(`目标页面: ${targetUrl}`);
console.log('');

// Step 1: 确保输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Step 2: 采集页面数据
console.log('━━━ Step 1: 采集页面数据 ━━━');
try {
  execSync(`node "${path.join(SKILL_DIR, 'capture-page.js')}" "${targetUrl}" "${OUTPUT_DIR}" "${loginUrl}" "${loginUser}" "${loginPass}"`, {
    stdio: 'inherit',
    cwd: SKILL_DIR
  });
} catch (err) {
  console.error('采集失败:', err.message);
  process.exit(1);
}

// Step 3: 风格对比
console.log('');
console.log('━━━ Step 2: 风格一致性对比 ━━━');
try {
  execSync(`node "${path.join(SKILL_DIR, 'compare.js')}" "${OUTPUT_DIR}"`, {
    stdio: 'inherit',
    cwd: SKILL_DIR
  });
} catch (err) {
  console.error('对比失败:', err.message);
  process.exit(1);
}

// Step 4: 生成报告
console.log('');
console.log('━━━ Step 3: 生成走查报告 ━━━');
try {
  execSync(`node "${path.join(SKILL_DIR, 'generate-report.js')}" "${OUTPUT_DIR}"`, {
    stdio: 'inherit',
    cwd: SKILL_DIR
  });
} catch (err) {
  console.error('报告生成失败:', err.message);
  process.exit(1);
}

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║   ✅ 走查完成!                      ║');
console.log('╚══════════════════════════════════════╝');
console.log('');
console.log(`报告位置: ${path.join(OUTPUT_DIR, 'ui-walkthrough-report.md')}`);
console.log(`截图位置: ${path.join(OUTPUT_DIR, 'screenshot-full.png')}`);

// 输出报告摘要
try {
  const result = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'compare-result.json'), 'utf-8'));
  const s = result.summary;
  console.log('');
  console.log(`📊 走查摘要:`);
  console.log(`   页面: ${s.title}`);
  console.log(`   元素总数: ${s.totalElements}`);
  console.log(`   问题总数: ${s.totalIssues}`);
  console.log(`   🔴 严重: ${s.bySeverity.high}  🟡 一般: ${s.bySeverity.medium}  🔵 建议: ${s.bySeverity.low}`);
} catch (e) {
  // ignore
}