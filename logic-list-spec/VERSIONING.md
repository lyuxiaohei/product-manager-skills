# logic-list-spec 版本管理

> 通用规则见 [VERSIONING.md](../VERSIONING.md)

---

## 当前版本

**V0.22**

---

## 版本历史

| 版本 | 日期 | 变更说明 | 变更文件 |
|------|------|---------|---------|
| V0.22 | 2026-06-15 | 截图改为可选（默认关闭）：用户不主动要求则不生成/不引用截图；阶段三改名「渲染与输出」；新增 `--screenshot` 输入参数 | SKILL.md, templates/page-section.md, templates/doc-skeleton.md, rules/document-structure.md, 技能链协作指南.md |
| V0.21 | 2026-05-21 | 集成 diagram-design 辅助技能，流程图优先使用 diagram-design，Mermaid 作为备选 | SKILL.md, rules/flowchart-rules.md V0.51→V0.52, 技能链协作指南.md V0.2→V0.21 |
| V0.2 | 2026-04-24 | 新增 Draft 模式，深度融合 idea-refine 方法论；模板支持草案版与正式版；新增状态标记体系 | SKILL.md, 新增 rules/draft-generation.md, templates/doc-skeleton.md 重写 |
| V0.11 | 2026-04-22 | 新增登录拦截章节、状态流转表、截图脚本 | SKILL.md, rules/, scripts/screenshot.py |
| V0.1 | 2026-04-21 | Extract 模式基础功能 | SKILL.md, 初始文件结构 |

---

## 子文件版本

| 文件 | 当前版本 | 说明 |
|------|---------|------|
| rules/flowchart-rules.md | V0.52 | 流程图生成规则 |
| rules/document-structure.md | — | 文档结构规则 |
| rules/draft-generation.md | — | Draft 模式规则 |
| rules/requirement-collection.md | — | 需求收集规则 |
| rules/use-case-generation.md | — | 用例生成规则 |
| templates/doc-skeleton.md | V2.0 | 文档骨架模板 |
| templates/page-section.md | — | 页面章节模板 |

---

## 输出文档版本

### 命名规则

| 模式 | 输出文件 | 命名格式 |
|------|---------|----------|
| Draft | 草案清单 | `doc/V{版本}/业务逻辑清单_V{版本}-草案.md` |
| Extract | 正式清单 | `doc/V{版本}/业务逻辑清单_V{版本}.md` |
| Draft / Extract | 流程图（diagram-design） | `doc/V{版本}/diagrams/{页面名}_flow.html` |
| Draft / Extract | 流程图（Mermaid 备选） | `doc/V{版本}/diagrams/{页面名}_flow.svg` |
| Extract | 截图 | `doc/V{版本}/screenshots/{页面名}.png` |

### 版本号来源

用户通过参数指定（如 `--version=0.3`）或对话中声明。同一版本多次运行时覆盖更新。
