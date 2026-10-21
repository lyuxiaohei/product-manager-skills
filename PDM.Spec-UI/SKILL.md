---
name: PDM.Spec-UI（原型UI规范）
version: 1.0.1
description: 原型 UI 规范技能（四端路由）：PC端后台 / PC端前台 / 移动端前台 / 移动端后台。凡产出自研系统或客户项目的 HTML 原型页面时使用——先按路由表定端，再取该端规范照办。「初绘原型」「修订原型」等绘制技能只管业务流程，不内置任何样式规则，UI 一律引用本技能。当用户说「ui-spec／按规范画页面／原型用什么样式／四端规范」或正在生成原型页面时触发。
---

# 原型 UI 规范（四端路由）

页面为纯 HTML/CSS/JS 单文件，样式与脚本内联，必须兼容 `file://` 直接打开——**此条四端通用**。

> 职责边界（0929 道远定）：绘制技能（初绘原型/修订原型）只处理流程与内容；**长什么样全归本技能**。绘制技能产出页面前必须先来此处路由。

## 一、先定端（四端路由表）

按「使用者 × 设备」判定，一页只属一端；跨端功能拆成两页各自路由：

| 端 | 使用者 | 典型页面 | 规范位置 | 状态 |
|---|---|---|---|---|
| **PC端后台** | 管理/运营人员，PC 浏览器 | 列表、表单、审核、配置 | `references/pc-admin/` | ✅ 已建（完整） |
| **PC端前台** | 消费者/客户，PC 浏览器 | 门户、PC 商城 | `references/pc-front/` | 【待建】回退规则＋检查基线可用 |
| **移动端前台** | 消费者，手机 | 小程序、H5 | `references/mobile-front/` | ✅ v1 已建（骨架+组件族） |
| **移动端后台** | 管理员/现场，手机 | 审批、扫码、盘点 | `references/mobile-admin/` | ✅ 样式层 v1（载体待拍板） |

**两件跨端基线（任何端开工前后各用一次）**：

| 文件 | 用途 | 时机 |
|---|---|---|
| `references/style-direction.md` | 风格定调六要素（一段式指令） | 开工**前**定调 |
| `references/common-checklist.md` | 四端通用合规自检（可访问性/焦点/表单/动效/触控/文案，提炼自 Vercel Web Interface Guidelines） | 完工**后**自检 |

- 已建端：走 §二 完整流程。
- 待建端：走该端 README 的**回退规则**，产出页面头部注明「按回退规则产出·<端名>规范待建」。

## 二、PC端后台 使用流程

1. 从 `references/pc-admin/common/page-skeleton.md` 搭骨架（顶栏 + 侧边栏 + 页签条 + 内容区）
2. 按目标系统从 `references/pc-admin/common/sidebar-menu.md` 复制**整份**侧边栏，只改 3 处状态（当前链路 `open`、当前页 `selected`、已有页面挂 `go()` 相对路径）
3. 从 `references/pc-admin/common/styles.md` 复制 CSS 变量与壳样式块
4. **先定交互载体**：按 `references/pc-admin/common/surface-selection.md` 判定本交互用页面还是弹窗（**默认页面**；弹窗只承担确认/提示/选择/拦截）
5. 按页面类型从 `references/pc-admin/components/` 取业务组件模板（见路由表）——**表单页一律分卡片**：一张卡＝一个业务段落（信息 / 明细 / 附件 / 计划），每卡带 `.card-head` + `.card-title` 标题（见 `references/pc-admin/components/form.md`）
6. 页面尾部引入 `references/pc-admin/common/interactions.md` 的统一脚本
7. **结构调整类改动**（拆卡片 / 搬段落 / 删弹窗块 / 加包裹层）改完按 `references/pc-admin/common/page-check.md` 自检——结构坏了浏览器会静默纠错，不做配平与几何体检看不出来

### PC端后台 模板路由

**通用模板（每个页面必备）：**

| 文件 | 内容 |
|---|---|
| `references/pc-admin/common/page-skeleton.md` | 页面骨架、顶栏、页签条、两种滚动布局模式 |
| `references/pc-admin/common/sidebar-menu.md` | 两系统菜单数据（名称/图标/链接）+ 左下角系统切换块 |
| `references/pc-admin/common/styles.md` | 设计变量、顶栏/侧边栏/内容区卡片 CSS |
| `references/pc-admin/common/interactions.md` | 菜单折叠与系统切换的统一 JS |
| `references/pc-admin/common/page-check.md` | **页面结构自检**：标签配平、卡片体检、症状→根因对照、定位手法 |

**业务组件模板（按页面类型取用）：**

| 要什么 | 文件 | 内容 |
|---|---|---|
| 筛选区域 | `references/pc-admin/components/filter-bar.md` | 查询表单网格、收起/重置/查询、状态页签 |
| 列表 | `references/pc-admin/components/data-table.md` | 数据表格、固定操作列、状态标签、复选框 |
| 分页器 | `references/pc-admin/components/pagination.md` | 条数信息、页码、每页条数、跳转 |
| 表单 | `references/pc-admin/components/form.md` | 分卡片表单、必填星号、输入/单选/复选/下拉、校验反馈 |
| 弹窗 | `references/pc-admin/components/modal.md` | 模态框结构、开关 JS、按钮体系 |
| **载体选择** | `references/pc-admin/common/surface-selection.md` | **什么交互用页面、什么用弹窗**、判定三问、页面三骨架、迁移要点 |

典型组合：**列表页** = 通用 + filter-bar + data-table + pagination；**表单页 / 详情页 / 审核页** = 通用 + form（+ data-table）+ 提交条；**弹窗**仅用于确认 / 提示 / 选择 / 拦截。

## 三、四端通则（无论哪端都守）

- 所有按钮/操作链接必须绑定真实交互（开弹窗 / 页面跳转 / `window.print()` / 明确视觉态），**不允许裸元素无反馈**——静态原型同理
- 同一系统的所有页面共用**同一份导航**：名称、图标、顺序完全一致
- 主色一律 `#1677ff`（`var(--primary)`），不要新造蓝色；待建端回退也用同一色板变量
- 跨端同一业务对象（如「订单」）的命名与状态词汇保持一致，只变布局不变词汇

## 四、PC端后台 硬性规则（历史沉淀，勿删）

- **载体选择默认用页面**：新建 / 编辑 / 详情 / 审核一律做成页面；弹窗只承担确认、提示、选择、拦截四类轻交互
- **表单页必须分卡片**：一张卡＝一个业务段落，卡片标题走 `.card-head` + `.card-title`（概括词，如「订单信息」「采购明细」）。**禁止**把明细段留在信息卡里用粗体小字当分隔标题；本卡动作（如「添加一行」）放卡头右侧 `.head-btns`，不要挂在表格下方做整宽按钮
- **卡片标题写法唯一**：一律 `<div class="card-head"><h3 class="card-title">…</h3></div>`；裸 `.card-title` 的下间距（20px）与卡头（14px）不一致，并排即露馅
- 顶栏 logo 纯文字无图标：供应链「一兆链采供应链管理后台」，商城「商城运营后台」
- 系统切换只出现在侧边栏左下角，点击直接跳转，无登录态、无遮罩
- 样式基准页：`01. 自研系统原型-当前版本/供应链管理后台/商品管理/商品发布.html`（位于 5-A04-自研系统，本技能不复制该资产，需要时去源头看）

## 溯源

- 2026-09-29 自 5-A03 `skills/admin-ui-spec` 复制改造：原名只覆盖 PC 后台，现扩为四端路由；PC 后台规范 11 件原样保留（仅 modal.md 一处内部互引路径更新）。
- 2026-10-06 提炼扩展（道远指令「下载不安装·只提取有用部分」）：从生态技能下载提炼三件——`common-checklist.md`（Vercel Web Interface Guidelines·四端合规自检）、`style-direction.md`（designed-by-ai/design-mobile-apps 的风格定调六要素）、`mobile-front/README.md` 升为 v1 规范（prototype-design 小程序规范骨架＋5-A05 实战校准·色彩参数化）。同日再提炼 `mobile-admin/README.md` 样式层 v1（full-stack-skills 组织 antd-skills 38 组件体系＋vue-ui-skills Vant 令牌，两包临时下载未安装）。两个来源仓库仅临时下载提炼，未安装为技能。
- 原 admin-ui-spec（5-A03 侧）不动，继续服务 A03 的原型标注等工作。
