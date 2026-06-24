# prototype-design 版本管理

> 通用规则见 [VERSIONING.md](../VERSIONING.md)

---

## 当前版本

**V0.50**

---

## 版本历史

| 版本 | 日期 | 变更说明 | 变更文件 |
|------|------|---------|---------|
| V0.5 | 2026-04-24 | 双模式支持（口述 + 草案），技能链协作指南集成 | SKILL.md, 技能链协作指南.md |
| V0.4 | 2026-04-20 | 后台管理系统组件规范完善，新增分类树组件 | components/backend-components.md |
| V0.3 | 2026-04-15 | 小程序组件规范，新增 Tab、卡片、弹窗等组件 | components/miniprogram-components.md |
| V0.2 | 2026-04-10 | 草案解析器，功能用例到组件的映射规则 | rules/draft-parser.md, mappings/ |
| V0.1 | 2026-04-08 | 基础框架，后台管理页面模板 | SKILL.md, templates/backend-template.md |

---

## 子文件版本

| 文件 | 当前版本 | 说明 |
|------|---------|------|
| rules/mode-detect.md | — | 模式自动检测 |
| rules/keyword-extractor.md | — | 口述关键词提取 |
| rules/page-type-inferencer.md | — | 页面类型推断 |
| rules/draft-parser.md | — | 草案解析 |
| mappings/use-case-to-component.md | — | 功能用例→组件映射 |
| mappings/field-to-ui-element.md | — | 字段→UI元素映射 |
| mappings/state-to-interaction.md | — | 状态流转→交互映射 |
| mappings/navigation-to-flow.md | — | 页面导航→跳转映射 |
| components/backend-components.md | — | 后台组件规范 |
| components/miniprogram-components.md | — | 小程序组件规范 |
| templates/backend-template.md | — | 后台页面模板 |
| templates/miniprogram-template.md | — | 小程序页面模板 |

---

## 输出文档版本

### 命名规则

| 输出类型 | 命名格式 |
|---------|----------|
| 原型 HTML | 用户指定路径或项目约定（通常为项目 `pages/` 目录） |

### 版本号来源

prototype-design 不生成带版本号的输出文件。原型 HTML 文件按页面名命名，由用户或项目结构决定存放位置。版本信息通过技能链上下游传递：
- 上游：接收 logic-list-spec Draft 输出（含版本号）
- 下游：输出供 logic-list-spec Extract 消费，再传递版本号至 PRD
