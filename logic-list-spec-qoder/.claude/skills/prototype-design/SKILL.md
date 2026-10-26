---
name: prototype-design
description: 原型设计规范，支持双模式生成符合项目UI设计标准的纯HTML页面代码。纯口述模式支持直接口述需求，草案模式支持logic-list-spec草案输入。包含后台管理系统和小程序两套设计体系，当用户要求创建新页面、组件或修改UI相关代码时，必须严格遵循对应规范确保风格一致性。
version: "3.0"
date_added: "2026-04-24"
changes:
  - V3.0: 新增草案模式，支持logic-list-spec草案输入；重构为双模式并行架构；新增解析器、映射器、验证器规则文件
  - V2.1: 禁用Emoji，新增资源推荐章节（Icon/图片网站），新增SVG图标代码库，skill重命名为prototype-design
  - V2.0: 新增小程序设计规范章节，重构为双规范并行结构
  - V1.0: 后台管理系统设计规范
---

# 原型设计规范 V3.0

本技能定义了项目的UI设计标准和规范，确保生成的页面与现有系统风格保持一致。项目采用**纯HTML/CSS/JavaScript**实现，无需任何构建工具或框架依赖。

**V3.0 新增双模式支持**：纯口述模式 + 草案模式（接收logic-list-spec输出）。

---

## 双模式架构

本技能支持两种输入模式：

### 模式一：纯口述模式

**适用场景：**
- 用户直接口述页面需求
- 用户描述页面功能和交互
- 快速原型验证场景
- 无现有业务逻辑草案

**处理流程：**

```
口述输入 → 模式识别 → 关键词提取 → 页面类型推断 → 规范选择 → 组件选择 → HTML生成
```

**详细流程：**

| Phase | 处理内容 | 参考规则 |
|-------|----------|----------|
| Phase 1 | 关键词提取（页面类型+用户角色+核心操作） | [rules/keyword-extractor.md](rules/keyword-extractor.md) |
| Phase 2 | 页面类型推断（规范类型+模板类型） | [rules/page-type-inferencer.md](rules/page-type-inferencer.md) |
| Phase 3 | 规范与组件选择 | 后台规范 / 小程序规范章节 |
| Phase 4 | HTML生成 | 共享规范章节 |
| Phase 5 | 输出验证 | [validators/output-validator.md](validators/output-validator.md) |

**口述模式验证清单：**

- [ ] 关键词提取完整（至少包含页面类型+用户角色）
- [ ] 规范选择正确（后台/小程序）
- [ ] 模板选择符合规范
- [ ] HTML符合零依赖原则
- [ ] 无Emoji使用

### 模式二：草案模式

**适用场景：**
- 用户提供 logic-list-spec 生成的草案文档
- 已有明确的业务逻辑定义
- 需要精确映射功能用例到UI
- 建立完整技能链：`需求 → idea-refine → logic-list-spec → prototype-design`

**处理流程：**

```
草案输入 → 模式识别 → 草案解析 → 功能用例映射 → 字段映射 → 状态映射 → HTML生成
```

**详细流程：**

| Phase | 处理内容 | 参考规则 |
|-------|----------|----------|
| Phase 1 | 草案结构解析（HMW/Not Doing/用例表/字段表/跳转表） | [rules/draft-parser.md](rules/draft-parser.md) |
| Phase 2 | 功能用例映射到组件 | [mappings/use-case-to-component.md](mappings/use-case-to-component.md) |
| Phase 3 | 字段映射到UI元素 | [mappings/field-to-ui-element.md](mappings/field-to-ui-element.md) |
| Phase 4 | 状态流转映射到交互逻辑 | [mappings/state-to-interaction.md](mappings/state-to-interaction.md) |
| Phase 5 | 页面导航映射到跳转逻辑 | [mappings/navigation-to-flow.md](mappings/navigation-to-flow.md) |
| Phase 6 | HTML组装与生成 | 共享规范章节 |
| Phase 7 | 状态标记处理 | 状态标记处理规则 |
| Phase 8 | 输出验证 | [validators/output-validator.md](validators/output-validator.md) |

**草案模式验证清单：**

- [ ] 草案结构解析完整（HMW/Not Doing/用例表/字段表）
- [ ] 所有功能用例映射到组件
- [ ] 所有字段映射到UI元素
- [ ] 状态流转逻辑完整实现
- [ ] 页面导航跳转正确实现
- [ ] 状态标记正确处理
- [ ] HTML符合零依赖原则

### 模式自动检测

系统自动检测输入类型，优先级：**草案模式 > 口述模式**

**草案模式触发条件（满足任一即可）：**

| 检测类型 | 触发条件 |
|----------|----------|
| 结构化标记 | 包含 `[草案]`、`[待原型]`、`[待确认]`、`[必验]` 状态标记 |
| HMW关键字 | 包含 `How Might We` 或 `HMW` 问题陈述格式 |
| Not Doing标识 | 包含 `Not Doing 清单` 章节或标识 |
| 表格结构 | 包含 `功能用例表`、`状态流转表`、`关键字段数据来源` 表格 |
| 章节结构 | 包含 `页面定位`、`假设清单` 章节 |
| 显式声明 | 用户明确提到"草案"、"业务逻辑清单"、"logic-list-spec输出" |

**口述模式判定：** 不满足草案触发条件的纯文本输入。

详细检测规则见：[rules/mode-detect.md](rules/mode-detect.md)

---

## 输入规范

### 口述模式输入

用户可自由描述，建议包含：

| 描述项 | 说明 | 示例 |
|--------|------|------|
| 页面用途 | 页面解决什么问题 | "商品列表页面" |
| 用户角色 | 使用者身份 | "运营人员" / "用户" |
| 核心功能 | 主要操作 | "搜索、筛选、分页" |
| 关键交互 | 重要交互行为 | "点击查看详情" |

**示例：**

> "设计一个商品列表页面，运营人员可以查看所有商品，支持搜索、筛选、分页，点击可以查看详情"

### 草案模式输入

接收 logic-list-spec 输出的草案文档，文件名格式：`业务逻辑清单_V{版本}-草案.md`

**核心结构：**

| 章节 | 作用 |
|------|------|
| HMW问题陈述 | 页面定位依据 |
| 成功标准 | 验收清单 |
| Not Doing清单 | 不生成项过滤 |
| 页面定位 | 规范选择依据 |
| 功能用例表 | 组件实例化 |
| 关键字段数据来源 | UI元素映射 |
| 状态流转表 | 交互逻辑生成 |
| 页面导航关系 | 跳转逻辑生成 |

草案输入示例见：[reference/draft-input-example.md](reference/draft-input-example.md)

---

## 状态标记处理规则

草案模式特有，处理草案文档中的状态标记：

| 状态标记 | 处理方式 | 输出附加 |
|----------|----------|----------|
| `[草案]` | 正常生成，标记来源为草案 | 无特殊附加 |
| `[待原型]` | 正常生成 | 附加"待验证"标注（HTML注释或视觉标记） |
| `[待确认]` | 正常生成 | 附加确认提示占位符区域 |
| `[必验]` | 正常生成 | 附加验证清单区域 |
| `[风险]` | 正常生成 | 附加风险提示区域 |
| `[暂略]` | 不生成对应部分 | 记录为待补充项 |

---

## 规则文件索引

| 文件 | 作用 |
|------|------|
| [rules/mode-detect.md](rules/mode-detect.md) | 模式识别规则 |
| [rules/draft-parser.md](rules/draft-parser.md) | 草案解析规则 |
| [rules/keyword-extractor.md](rules/keyword-extractor.md) | 口述关键词提取规则 |
| [rules/page-type-inferencer.md](rules/page-type-inferencer.md) | 页面类型推断规则 |

---

## 映射文件索引

| 文件 | 作用 |
|------|------|
| [mappings/use-case-to-component.md](mappings/use-case-to-component.md) | 功能用例→组件映射 |
| [mappings/field-to-ui-element.md](mappings/field-to-ui-element.md) | 字段→UI元素映射 |
| [mappings/state-to-interaction.md](mappings/state-to-interaction.md) | 状态流转→交互映射 |
| [mappings/navigation-to-flow.md](mappings/navigation-to-flow.md) | 页面导航→跳转映射 |

---

## 验证文件索引

| 文件 | 作用 |
|------|------|
| [validators/input-validator.md](validators/input-validator.md) | 输入验证规则 |
| [validators/output-validator.md](validators/output-validator.md) | 输出HTML验证规则 |

---

## 适用场景

| 规范 | 适用页面 | 判断依据 |
|------|----------|----------|
| **后台规范** | 素材库、页面装修、订单管理（运营侧）、售后审批 | PC端运营工具，左侧导航+Header布局 |
| **小程序规范** | 商品详情、购物车、下单支付、订单列表（用户侧）、售后申请 | 移动端用户界面，375px手机框架 |

**快速判断：** 
- 运营人员使用的工具 → 后台规范
- 用户浏览/下单的界面 → 小程序规范

---

## 共享规范

以下规范适用于后台和小程序两套系统：

### 技术栈

- **HTML5**: 语义化标签
- **CSS3**: 原生CSS + CSS变量
- **JavaScript**: ES6+ 原生语法
- **运行方式**: 直接在浏览器中打开HTML文件

### 使用原则

1. **零依赖**: 不依赖Node.js、npm、构建工具
2. **内联样式**: CSS直接写在`<style>`标签内
3. **原生JS**: 使用ES6+语法，无需编译
4. **禁止Emoji**: 所有UI元素禁止使用Emoji，使用SVG图标替代

### Emoji与图标使用规范

**重要：本项目全面禁止使用Emoji，所有图标必须使用SVG或纯文字。**

**禁止使用Emoji的场景：**

| 场景 | 说明 | 替代方案 |
|------|------|----------|
| **导航菜单** | 侧边栏菜单项、底部Tab栏 | 使用SVG图标或纯文字 |
| **按钮** | 所有类型按钮 | 仅使用纯文字 |
| **Tab标签** | 页面内的Tab切换标签 | 仅使用纯文字 |
| **表单标签** | 表单字段标签、表单标题 | 仅使用纯文字 |
| **弹窗标题** | Modal弹窗的标题文字 | 仅使用纯文字 |
| **空状态** | 空数据提示区域 | 仅使用纯文字 |
| **文件树** | 文件/文件夹图标 | 使用SVG图标 |
| **播放按钮** | 视频封面播放图标 | 使用SVG播放图标 |
| **关闭按钮** | 弹窗关闭按钮 | 使用 × 符号或SVG |

**SVG图标使用方式：**

推荐使用内联SVG，无需额外依赖：

```html
<!-- 搜索图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="11" cy="11" r="8"/>
  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
</svg>

<!-- 返回图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="15 18 9 12 15 6"/>
</svg>

<!-- 关闭图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</svg>
```

### 字体规范

| 元素 | 字号 | 字重 |
|------|------|------|
| Logo 标题 / 导航标题 | 17-18px | 600 |
| 页面标题 | 15-16px | 600-700 |
| 正文 | 13-14px | 400 |
| 次要文字 | 11-12px | 400 |
| 辅助信息 | 9-10px | 400 |

---

## 一、后台设计规范（运营管理系统）

适用于：素材库、页面装修、订单管理（运营侧）、售后审批等PC端运营工具。

### 1.1 系统名称

- **主名称**: 商城运营后台
- **副名称**: 运营管理系统

### 1.2 色彩规范

| 用途   | 色值      | CSS变量 | 使用场景 |
| ------ | --------- | ------- | -------- |
| 主色   | `#1890ff` | `--primary-color` | 主按钮、Logo、hover状态、链接 |
| 背景灰 | `#f5f5f5` | `--bg-color` | 页面背景 |
| 内容白 | `#ffffff` | `--card-bg` | 卡片、内容区背景 |
| 错误红 | `#ff4d4f` | `--error-color` | 错误状态、危险操作 |
| 成功绿 | `#52c41a` | `--success-color` | 成功状态 |
| 警告黄 | `#faad14` | `--warning-color` | 警告状态 |

### 1.3 布局规范

```
┌─────────────────────────────────────────────────────────┐
│                    Header (64px)                         │
│  Logo区域：商城运营后台 / 运营管理系统                      │
├────────────┬────────────────────────────────────────────┤
│   Sider    │              Content                       │
│  (200px)   │           (padding: 20px)                  │
│  垂直菜单   │                                          │
└────────────┴────────────────────────────────────────────┘
```

| 参数 | 值 |
|------|-----|
| 最小宽度 | 1200px |
| Header高度 | 64px |
| Sider宽度 | 200px（可折叠为80px） |
| 内容区padding | 20px |
| 卡片圆角 | 8px |
| 按钮圆角 | 6px |

### 1.4 后台组件规范

#### 按钮样式

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
}
.btn:hover { border-color: #1890ff; color: #1890ff; }
.btn-primary { background: #1890ff; border-color: #1890ff; color: #fff; }
.btn-danger { color: #ff4d4f; border-color: #ff4d4f; }
```

```html
<button class="btn btn-primary">确认</button>
<button class="btn">取消</button>
<button class="btn btn-danger">删除</button>
```

#### 素材网格

```css
.material-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.material-card { border-radius: 8px; overflow: hidden; }
.card-thumbnail { height: 100px; object-fit: cover; }
```

**重要：** 5列固定布局，100px固定高度。

#### 分页组件

```css
.page-btn { min-width: 36px; height: 36px; border-radius: 6px; }
.page-btn.active { background: #1890ff; color: #fff; }
```

#### 分类树

```css
.category-panel { width: 220px; }
.category-item { padding: 8px 16px; cursor: pointer; }
.category-item.active { background: #e6f7ff; color: #1890ff; }
```

### 1.5 后台页面模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>商城运营后台</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --primary-color: #1890ff; --bg-color: #f5f5f5; --card-bg: #fff; }
    .app { display: flex; flex-direction: column; height: 100vh; }
    .header { height: 64px; padding: 0 24px; background: #fff; }
    .header-title { font-size: 18px; font-weight: 600; color: #1890ff; }
    .main { display: flex; flex: 1; }
    .sider { width: 200px; background: #fff; }
    .menu-item { padding: 16px 20px; cursor: pointer; }
    .menu-item.active { background: #e6f7ff; color: #1890ff; }
    .content { flex: 1; padding: 20px; overflow: auto; }
  </style>
</head>
<body>
  <div class="app">
    <header class="header">
      <div class="header-title">商城运营后台</div>
    </header>
    <div class="main">
      <aside class="sider">
        <div class="menu-item active">素材库</div>
      </aside>
      <main class="content">内容区域</main>
    </div>
  </div>
</body>
</html>
```

---

## 二、小程序设计规范（苏银豆商城）

适用于：商品详情、购物车、下单支付、订单列表、售后申请等移动端用户界面。

### 2.1 系统名称

- **小程序名称**: 苏银豆商城
- **所属银行**: 江苏银行

### 2.2 色彩规范

| 用途 | 色值 | CSS变量 | 使用场景 |
|------|------|--------|----------|
| 主色渐变起点 | `#ff6034` | `--primary-start` | 按钮、Tab选中态、价格标签 |
| 主色渐变终点 | `#ee0a24` | `--primary-end` | 渐变终点、角标背景 |
| 价格红 | `#ee0a24` | `--price-color` | 商品价格数字 |
| 背景灰 | `#f5f5f5` | `--bg-color` | 页面背景 |
| 卡片白 | `#fff` | `--card-bg` | 卡片、弹窗背景 |
| 状态栏文字 | 白色/黑色 | `--status-text` | 根据背景自动切换 |

### 2.3 布局规范

```
┌─────────────────────────────────────┐
│         状态栏 (44px 预留)           │  ← padding-top预留
├─────────────────────────────────────┤
│         导航栏 (44px)                │  ← 标题 + 返回按钮 + 胶囊
├─────────────────────────────────────┤
│                                     │
│         内容区 (可滚动)              │  ← padding-bottom: 60px
│                                     │
├─────────────────────────────────────┤
│         Tab栏 (56px)                │  ← 底部固定，5个入口
└─────────────────────────────────────┘
```

| 参数 | 值 |
|------|-----|
| 手机框架宽度 | 375px |
| 状态栏高度 | 44px（padding-top预留） |
| 导航栏高度 | 44px |
| Tab栏高度 | 56px（底部固定） |
| 卡片圆角 | 12px |
| 按钮圆角 | 22px（全圆角） |
| 内容区底部padding | 60px（为Tab栏预留） |

### 2.4 小程序组件规范

#### 手机框架容器

```css
.phone-frame {
  width: 375px;
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
}
.page-scroll {
  min-height: 100vh;
  overflow-y: auto;
  padding-bottom: 60px;
}
```

#### 状态栏 + 导航栏

```css
.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  padding: 14px 20px 0;
  color: #fff;
  z-index: 2;
}
.status-bar.dark { color: #333; }

.sub-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  padding-top: 44px;
  background: #fff;
}
.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}
.back-btn {
  position: absolute;
  left: 12px;
  width: 32px;
  height: 32px;
}
```

#### 底部Tab栏

```css
.tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  height: 56px;
  border-top: 1px solid #eee;
  z-index: 200;
  padding-bottom: 8px;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.tab-item span { font-size: 10px; color: #999; }
.tab-item.active svg { color: #ff6034; }
.tab-item.active span { color: #ff6034; font-weight: 600; }
.cart-badge .badge {
  position: absolute;
  top: -4px;
  right: -7px;
  background: #ee0a24;
  color: #fff;
  font-size: 9px;
  min-width: 14px;
  height: 14px;
  border-radius: 7px;
}
```

```html
<div class="tab-bar">
  <a href="home_page.html" class="tab-item">
    <svg>...</svg>
    <span>首页</span>
  </a>
  <div class="tab-item active">
    <svg>...</svg>
    <span>购物车</span>
  </div>
</div>
```

#### 商品网格卡片

```css
.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.product-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}
.product-card .product-img {
  width: 100%;
  aspect-ratio: 1;
  background: #f8f8f8;
}
.product-card .product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-card .price-now {
  color: #ee0a24;
  font-size: 15px;
  font-weight: 700;
}
```

**重要：** 2列布局，aspect-ratio:1 正方形缩略图。

#### 主按钮（全圆角渐变）

```css
.btn-primary {
  background: linear-gradient(135deg, #ff6034, #ee0a24);
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
}
.btn-primary:active { opacity: 0.85; }
```

```html
<button class="btn-primary">立即购买</button>
```

#### 规格选择弹窗（底部滑入）

```css
.spec-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 300;
}
.spec-popup {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 16px 16px 0 0;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}
.spec-popup.show { transform: translateY(0); }
.spec-option {
  padding: 6px 14px;
  border-radius: 18px;
  border: 1px solid #ddd;
}
.spec-option.selected {
  border-color: #ff6034;
  color: #ff6034;
  background: #fff5f0;
}
```

#### 收银台弹窗（居中卡片）

```css
.pay-popup-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pay-popup {
  width: calc(100% - 48px);
  max-width: 320px;
  background: #fff;
  border-radius: 16px;
}
.pay-popup-btn {
  width: 100%;
  height: 44px;
  background: #07c160;
  color: #fff;
  border-radius: 8px;
}
```

#### 左滑删除（触屏手势）

```css
.cart-item-wrapper {
  position: relative;
  overflow: hidden;
}
.cart-item-wrapper .delete-btn {
  position: absolute;
  right: 0;
  width: 72px;
  background: #ee0a24;
  color: #fff;
  z-index: 0;
}
.cart-item {
  position: relative;
  z-index: 1;
  transition: transform 0.2s ease;
}
```

#### 地址选择弹窗

```css
.addr-popup {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 16px 16px 0 0;
  max-height: 60vh;
  overflow-y: auto;
}
.addr-list-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
}
.addr-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #ddd;
}
.addr-radio.checked {
  background: #ff6034;
  border-color: #ff6034;
}
```

### 2.5 小程序页面模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>商品详情 - 苏银豆商城</title>
  <link rel="stylesheet" href="../css/common.css">
  <style>
    /* 页面特定样式 */
  </style>
</head>
<body>
<div class="phone-frame">

  <!-- 状态栏 + 导航栏 -->
  <div class="sub-nav">
    <div class="status-bar dark">
      <span class="time">09:41</span>
      <div class="icons">...</div>
    </div>
    <div class="nav-bar">
      <div class="back-btn" onclick="history.back()">
        <svg>...</svg>
      </div>
      <span class="nav-title">商品详情</span>
      <div class="capsule-btn">...</div>
    </div>
  </div>

  <!-- 可滚动内容区 -->
  <div class="page-scroll">
    <!-- 页面内容 -->
  </div>

  <!-- 底部Tab栏（可选） -->
  <div class="tab-bar">...</div>

</div>
<script src="../js/common.js"></script>
<script>
  // 页面逻辑
</script>
</body>
</html>
```

### 2.6 小程序开发检查清单

创建小程序页面时，核对以下规范：

- [ ] 使用 `.phone-frame` 375px 容器
- [ ] 状态栏预留 44px（padding-top）
- [ ] 导航栏高度 44px，标题字号 17px
- [ ] 底部Tab栏高度 56px（如有）
- [ ] 主色使用渐变 `#ff6034 → #ee0a24`
- [ ] 价格使用红色 `#ee0a24`
- [ ] 按钮圆角 22px（全圆角）
- [ ] 卡片圆角 12px
- [ ] 商品网格 2列布局
- [ ] 图片设置 `object-fit: cover` + `aspect-ratio: 1`
- [ ] 引用 `../css/common.css` 公共样式
- [ ] 底部弹窗使用 `border-radius: 16px 16px 0 0`
- [ ] Tab栏/按钮/菜单仅使用纯文字（禁止Emoji）

---

## 三、设计决策表

当不确定使用哪套规范时，参考以下判断：

| 页面类型 | 使用规范 | 关键特征 |
|----------|----------|----------|
| 素材库管理页 | 后台规范 | PC端、5列网格、左侧导航 |
| 页面装修配置 | 后台规范 | PC端、拖拽操作 |
| 商品详情页 | 小程序规范 | 移动端、用户浏览、购买按钮 |
| 购物车 | 小程序规范 | 移动端、左滑删除、结算按钮 |
| 确认订单页 | 小程序规范 | 移动端、支付方式选择、收银台弹窗 |
| 订单列表（用户侧） | 小程序规范 | 移动端、查看自己的订单 |
| 订单管理（运营侧） | 后台规范 | PC端、查看所有用户订单 |
| 售后申请页 | 小程序规范 | 移动端、用户发起申请 |
| 售后审批页 | 后台规范 | PC端、运营审批处理 |

---

## 四、后台开发检查清单

创建后台页面时，核对以下规范：

- [ ] 主色调使用 `#1890ff`
- [ ] 背景色使用 `#f5f5f5`（页面）或 `#fff`（卡片）
- [ ] Header高度 64px，Sider宽度 200px
- [ ] 内容区 padding: 20px
- [ ] 弹窗居中显示，圆角 8px
- [ ] 系统名称使用"商城运营后台"
- [ ] CSS使用变量管理颜色
- [ ] 图片设置 `object-fit: cover`
- [ ] 素材网格使用 5 列固定布局
- [ ] 分页器 36px 高度，6px 圆角
- [ ] Flex容器正确使用 `flex-shrink: 0` 和 `min-height: 0`
- [ ] 单文件可独立运行
- [ ] 菜单项/按钮/Tab仅使用纯文字或SVG图标（禁止Emoji）

---

## 五、资源推荐

### 5.1 Icon图标下载网站

| 网站 | 特点 | 格式 | 授权 | 推荐场景 |
|------|------|------|------|----------|
| **[iconfont.cn](https://www.iconfont.cn)** | 阿里巴巴图标库，中文搜索，国内最大 | SVG/PNG | 多种授权 | 中文项目首选 |
| **[IconPark](https://iconpark.oceanengine.com)** | 字节跳动开源，可自定义颜色/尺寸 | SVG | MIT开源 | 完全免费商用 |
| **[Heroicons](https://heroicons.com)** | Tailwind出品，简洁现代风格 | SVG | MIT开源 | 简洁UI设计 |
| **[Feather Icons](https://feathericons.com)** | 极简风格，24x24像素 | SVG | MIT开源 | 轻量级图标 |
| **[Remix Icon](https://remixicon.com)** | 2000+图标，开源图标系统 | SVG | Apache 2.0 | 丰富图标库 |
| **[Lucide](https://lucide.dev)** | Feather fork，持续更新 | SVG | ISC开源 | 开发者友好 |

**使用建议：**
- **中文项目** → iconfont.cn（中文搜索便捷）
- **完全免费商用** → IconPark、Heroicons、Feather（MIT协议）
- **内联SVG** → 直接复制SVG代码到HTML中

### 5.2 图片素材下载网站

| 网站 | 特点 | 授权 | 推荐场景 |
|------|------|------|----------|
| **[Unsplash](https://unsplash.com)** | 高质量免费图片，无版权限制 | Unsplash License | 商品图片、Banner |
| **[Pexels](https://www.pexels.com)** | 免费商用图片和视频 | Pexels License | 商品图片、背景图 |
| **[Pixabay](https://pixabay.com)** | 图片、矢量图、视频、音乐 | Pixabay License | 多类型素材 |
| **[Freepik](https://www.freepik.com)** | 矢量图、PSD、图片 | 需注明出处 | 设计素材 |

**本项目素材来源：**
- 商品图片：`images/unsplash/` 目录
- 图片命名格式：`unsplash-{id}.jpg`

### 5.3 小程序图标资源

小程序Tab栏/导航栏常用图标（SVG代码）：

```html
<!-- 首页图标 -->
<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>

<!-- 分类图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="3" y="3" width="7" height="7"/>
  <rect x="14" y="3" width="7" height="7"/>
  <rect x="14" y="14" width="7" height="7"/>
  <rect x="3" y="14" width="7" height="7"/>
</svg>

<!-- 购物车图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="9" cy="21" r="1"/>
  <circle cx="20" cy="21" r="1"/>
  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
</svg>

<!-- 收藏图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
</svg>

<!-- 用户图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</svg>

<!-- 返回图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="15 18 9 12 15 6"/>
</svg>

<!-- 搜索图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="11" cy="11" r="8"/>
  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
</svg>

<!-- 更多图标 -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="9 18 15 12 9 6"/>
</svg>

<!-- WiFi图标（状态栏） -->
<svg viewBox="0 0 24 24">
  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
</svg>

<!-- 电池图标（状态栏） -->
<svg viewBox="0 0 24 24">
  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
</svg>
```

---

## 六、版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| V2.1 | 2026-04-24 | 禁用Emoji，新增资源推荐章节（Icon/图片网站），新增SVG图标代码库 |
| V2.0 | 2026-04-24 | 新增小程序设计规范章节，重构为双规范并行结构 |
| V1.0 | 2026-04-24 | 后台管理系统设计规范 |