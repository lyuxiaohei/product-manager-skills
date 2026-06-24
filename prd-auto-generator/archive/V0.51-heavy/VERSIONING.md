# prd-auto-generator 版本管理

> 通用规则见 [VERSIONING.md](../VERSIONING.md)

---

## 当前版本

**V0.51**

---

## 版本历史

| 版本 | 日期 | 变更说明 | 变更文件 |
|------|------|---------|---------|
| V0.51 | 2026-05-21 | 集成 diagram-design 辅助技能，流程图优先使用 diagram-design，Mermaid 作为备选；颜色约定与 diagram-design 设计系统对齐 | SKILL.md, rules/flowchart-rules.md V0.1→V0.12, 技能链协作指南.md V0.2→V0.21 |
| V0.5 | 2026-04-28 | 增量版本指导、质量检查、模块前言、规则编号规范、骨架完善 | SKILL.md, rules/, templates/ |
| V0.4 | 2026-04-20 | 版本范围支持、材料清单、文档结构规则、版本级骨架模板 | SKILL.md, 新增 templates/version-prd.md, rules/structure-rules.md |
| V0.3 | 2026-04-13 | 叙述体优先、信息不重复、按需输出、侧重小程序 | SKILL.md, rules/writing-rules.md |

---

## 子文件版本

| 文件 | 当前版本 | 说明 |
|------|---------|------|
| rules/flowchart-rules.md | V0.12 | 流程图生成规则 |
| rules/structure-rules.md | — | 文档结构规则 |
| rules/writing-rules.md | — | 文案写作规则 |
| rules/material-checklist.md | — | 材料清单 |
| templates/version-prd.md | V5.0 | 版本 PRD 骨架模板 |
| templates/prd-page-section.md | — | PRD 页面章节模板 |

---

## 输出文档版本

### 命名规则

| 输出类型 | 命名格式 |
|---------|----------|
| PRD 文档 | `PRD/PRD-{项目名}-V{版本}.md` |
| 流程图（diagram-design） | `PRD/diagrams/{流程名}.html` |
| 流程图（Mermaid 备选） | `PRD/diagrams/{流程名}.svg` |
| Mermaid 源文件 | `PRD/diagrams/{流程名}.mmd` |

### 版本号来源

用户通过参数指定（如 `--version=0.3`）或对话中声明。同一版本多次运行时覆盖更新。

### 文档内版本标注

| 位置 | 格式 |
|------|------|
| 文档标题 | `# {项目名} - PRD V{版本号}` |
| 元信息行 | `> 版本：V{版本号} \| 最后更新：{日期}` |
| 版本概述 | `V{版本号} 为 {项目名} {版本定位描述}` |
