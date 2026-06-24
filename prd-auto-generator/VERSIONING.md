# prd-auto-generator 版本管理

> 通用规则见 [VERSIONING.md](../VERSIONING.md)

---

## 当前版本

**V1.0**（精简版，模块级 3 段）

> V0.51 重量版（页面级 6 节 + 11 列字段表）已归档至 `archive/V0.51-heavy/`。

---

## 版本历史

| 版本 | 日期 | 变更说明 | 变更文件 |
|------|------|---------|---------|
| V1.0 | 2026-06-15 | **大重构**：页面级6节→模块级3段；引入 UC/AC-{代号} 编号体系 + 用例↔验收强绑定；字段表11列→8列；新增 Given-When-Then 验收；可选章节4→2（角色并入角色列表、非功能并入异常边界）；测试账号装验收表结尾、数据口径装字段表；V0.51 重量版归档 | SKILL.md, VERSIONING.md, templates/version-prd.md V6.0→V7.0, templates/prd-module-section.md(新增), rules/structure-rules.md V6.0→V7.0, rules/writing-rules.md V5.0→V6.0, rules/material-checklist.md V6.0→V7.0, rules/flowchart-rules.md V0.12→V0.13, archive/V0.51-heavy/ |
| V0.51 | 2026-05-21 | 集成 diagram-design 辅助技能，流程图优先 diagram-design，Mermaid 备选 | SKILL.md, rules/flowchart-rules.md |
| V0.5 | 2026-04-28 | 增量版本指导、质量检查、模块前言、规则编号规范 | SKILL.md, rules/, templates/ |
| V0.4 | 2026-04-20 | 版本范围支持、材料清单、文档结构规则、版本级骨架模板 | SKILL.md, templates/version-prd.md, rules/structure-rules.md |
| V0.3 | 2026-04-13 | 叙述体优先、信息不重复、按需输出 | SKILL.md, rules/writing-rules.md |

---

## 子文件版本

| 文件 | 当前版本 | 说明 |
|------|---------|------|
| templates/version-prd.md | V7.0 | 版本 PRD 骨架（模块级 3 段） |
| templates/prd-module-section.md | V1.0 | 模块 3 段详细模板（新增） |
| rules/structure-rules.md | V7.0 | 文档结构 + 编号体系 |
| rules/writing-rules.md | V6.0 | 写作规则 |
| rules/flowchart-rules.md | V0.13 | 流程图生成规则 |
| rules/material-checklist.md | V7.0 | 材料清单 + 清单映射 |

> 归档的 V0.51 重量版子文件版本见 `archive/V0.51-heavy/`。

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

用户通过参数指定（如 `--version=0.3`）或对话声明。同一版本多次运行覆盖更新。

### 文档内版本标注

| 位置 | 格式 |
|------|------|
| 文档标题 | `# {项目名} - PRD V{版本号}` |
| 元信息行 | `> 版本：V{版本号} \| 最后更新：{日期}` |
