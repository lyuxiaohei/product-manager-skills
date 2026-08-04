---
name: ui-consistency-check
description: 'UI 风格统一性走查 — 对比页面是否遵循设计系统规范，检测色彩/字体/间距/圆角/组件的一致性'
---

# UI 风格统一性走查

对目标页面进行自动化 UI 风格一致性检查，对比设计基线，生成结构化走查报告。

## 执行流程 (SOP)

### Step 1: 建立设计基线
- 默认使用 Ant Design 5 设计系统作为基线
- 用户可指定自定义基线文件 (`design-baseline.json`)
- 基线包含：色彩、字体、间距、圆角、阴影、组件规范

### Step 2: 采集目标页面数据
- 使用 Playwright 打开目标页面
- 截取全页截图 + 视口截图
- 提取所有交互元素的 computed styles
- 按组件类型分类：按钮/输入框/表格/卡片/标签/弹窗/导航等

### Step 3: 风格一致性对比
执行 6 个维度的检查：
1. **色彩一致性** — 按钮色、链接色、文本色是否偏离基线
2. **字体一致性** — 字号层级、字体族、字重是否统一
3. **间距一致性** — 同类元素的内外边距是否一致
4. **圆角一致性** — 同类组件圆角是否统一
5. **组件一致性** — 卡片阴影、表格样式是否一致
6. **布局一致性** — 页面整体结构

### Step 4: 生成走查报告
- 按严重程度分级：严重 / 一般 / 建议
- 输出 Markdown 格式报告
- 包含评分和问题详情

## 使用方式

### 完整走查 (单页面)
```
/run-ui-check <URL>
```

### 跨页面对比
```
/run-ui-check <URL1> <URL2> <URL3>
```

### 自定义基线
修改 `design-baseline.json` 中的 tokens 值后执行走查。

## 输出文件

走查完成后，结果保存在 `output/` 目录：
- `screenshot-full.png` — 全页截图
- `screenshot-viewport.png` — 视口截图
- `captured-data.json` — 采集的完整元素数据
- `compare-result.json` — 对比结果 (结构化)
- `ui-walkthrough-report.md` — 走查报告 (可读)

## 脚本说明

| 脚本 | 功能 |
|------|------|
| `capture-page.js` | Playwright 页面数据采集 |
| `compare.js` | 风格一致性对比引擎 |
| `generate-report.js` | 报告生成 |
| `run-check.js` | 一键执行完整走查流程 |

## 注意事项

- 需要安装 Playwright: `npm install playwright`
- 页面需为可访问的 URL (支持本地/内网地址)
- 对于需登录的页面，先手动登录后使用 cookie 注入
- 设计基线可根据项目实际设计系统自定义