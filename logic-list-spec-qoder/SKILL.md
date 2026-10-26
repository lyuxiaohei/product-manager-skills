---
name: logic-list-spec-qoder
description: "基于项目HTML源码，按版本范围生成业务逻辑清单。功能用例从代码提取，数据来源和业务问题附建议答案留白待确认。"
risk: low
source: project
date_added: "2026-04-21"
version: "1.0"
---

# 业务逻辑清单自动生成技能 V1.0

---

## 执行流程

### 阶段一：材料收集与范围确认（用户确认后进入阶段二）

1. **读取导航索引** — 读取 `index.md` 或 `index.html`，提取带目标版本标记的页面列表，确定本次文档覆盖范围
2. **读取现有文档** — 若已有同版本业务逻辑清单，读取现有内容以避免重复；若为增量版本，读取上一版清单识别变更
3. **读取页面源码** — 按 `reference/material-checklist.md` 的顺序和要点，逐页读取版本范围内的 HTML 页面代码
4. **制定文档计划** — 按 `reference/document-structure.md` 确定模块编排和章节编号，提交用户审阅

### 阶段二：逐页生成文档内容（每章写完提交用户审阅）

5. **逐页生成三表** — 对每个页面：
   - **功能用例表**（必选）：按 `reference/use-case-generation.md` 从源码提取交互场景，生成 场景/操作/预期结果 表格
   - **关键字段数据来源**（必选）：列出页面中每个关键字段的数据来源；不确定的字段留白并附建议答案，格式：`（建议：{建议内容}）`
   - **业务逻辑增强**（可选）：列出跨页面的业务逻辑问题；不确定的问题留白并附建议答案，格式同上
6. **生成全局章节**：
   - 跳转关系表（所有页面的入口→出口映射）
   - 返回导航（统一 `history.back()` 说明）
   - 登录拦截（受保护/公开页面分类）
   - 状态流转表（如涉及订单等状态机）

### 阶段三：截图与输出

7. **自动截图** — 运行 `scripts/screenshot.py` 为每个页面截图：
   - 视口 375×812（iPhone X），2x 缩放
   - 通过 `Page.addScriptToEvaluateOnNewDocument` 注入登录态（localStorage 设置 `syd_current` 和 `syd_accounts`）
   - 注入 CSS 修复移动端状态栏重叠（`padding-top: 44px !important`）
   - 截图保存到文档同级的 `screenshots/` 目录
8. **合并输出** — 将截图以相对路径插入文档，合并为完整 Markdown 文件，输出到指定路径

---

## 输入参数

| 参数名称 | 参数说明 | 必填 |
|----------|----------|------|
| 源码目录 | 项目 HTML/JS 文件根目录 | 是 |
| 版本号 | 目标版本号，如 V0.3、V0.4 | 是 |
| 页面列表 | 指定页面清单（覆盖导航索引的版本标记） | 否 |
| 输出路径 | 文档保存路径（默认 `doc/{版本号}/`） | 否 |
| 上一版清单路径 | 增量版本时提供上一版清单路径 | 否 |

## 输出规范

### 输出文件

- 输出目录：项目根目录下的 `doc/V{版本号}/` 文件夹
- 文件命名：`业务逻辑清单_V{版本号}.md`
- 截图目录：`doc/V{版本号}/screenshots/`
- 截图命名：与页面文件名一致（如 `product_detail.html` → `product_detail.png`）
- 一份完整的版本业务逻辑清单为一个 Markdown 文件

### 质量检查项

生成完成后自动执行以下检查：

| 检查项 | 说明 |
|--------|------|
| 标题编号连续性 | H2 中文数字无跳号（一→二→三），H3/H4 编号无跳号 |
| 三表完整性 | 每个页面都有功能用例表和关键字段数据来源 |
| 截图引用 | 每个页面都有截图引用，路径为相对路径 |
| 跳转关系完整 | 跳转表中提到的页面在文档中有对应章节 |
| 页面范围对齐 | 页面清单中的每个页面在文档中有对应章节 |
| 留白标记 | 不确定的数据来源和业务问题已附建议答案 |

### 章节结构

详见 `reference/document-structure.md` 和 `templates/doc-skeleton.md`。核心结构：

```
# 项目名 - 业务逻辑清单 V{版本号}

> 版本概述（范围、页面数量、数据来源、统计口径）

---

## 一、{模块名} `V{版本号}`
### 1.1 {页面名}（filename.html）
#### 1.1.1 功能用例表
#### 1.1.2 关键字段数据来源
#### 1.1.3 业务逻辑增强

## 二、{模块名} `V{版本号}`
...

## {N}、页面导航 `V{版本号}`
### {N}.1 跳转关系
### {N}.2 返回导航
### {N}.3 登录拦截

## {N+1}、状态流转 `V{版本号}`（可选）
```

---

## 模板与参考资料索引

### 模板

| 模板 | 说明 | 文件 |
|------|------|------|
| 文档骨架 | 整份文档的章节骨架 | [templates/doc-skeleton.md](templates/doc-skeleton.md) |
| 页面章节 | 单个页面的三表结构 | [templates/page-section.md](templates/page-section.md) |

### 参考资料

| 参考资料 | 说明 | 文件 |
|----------|------|------|
| 材料清单 | 原材料读取顺序和策略 | [reference/material-checklist.md](reference/material-checklist.md) |
| 文档结构 | 标题层级、编号规则、全局章节 | [reference/document-structure.md](reference/document-structure.md) |
| 用例生成 | 如何从源码提取功能用例 | [reference/use-case-generation.md](reference/use-case-generation.md) |

### 脚本

| 脚本 | 说明 | 文件 |
|------|------|------|
| 截图脚本 | Chrome CDP 自动截图（注入登录态+CSS修复） | [scripts/screenshot.py](scripts/screenshot.py) |
