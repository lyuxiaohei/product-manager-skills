# ROADMAP · 技能库路线图

> 更新：2026-10-26 · 配套台账：[README.md](README.md)（75 项全量清单）
> 纪律：**删除一律手动**（本文件只列清单不执行）；覆盖/同步前先核最新版本（version → mtime → 内容超集）。

## 0. 本仓库怎么用（30 秒）

| 你在哪 | 读哪个目录 | 技能数 |
|---|---|---|
| ZCode | `~/.zcode/skills` + `~/.agents/skills`（两条发现路径） | 68 |
| Claude Code | `~/.claude/skills` | 68 |
| 找技能/查用途 | 本仓库 `README.md` 台账 | 75 项 |

- **权威源**：PDM 系列（16 个）以 `D:\工作台-吕道远\5-A34-AI项目工程化技能\skills` 为权威；其余技能以**本仓库为唯一真源**（GitHub：`lyuxiaohei/product-manager-skills`）。
- **修改流向**：改技能 → 端上改 → 回写本仓库 commit/push → 仓库分发三端。别只改一端。
- **每次覆盖前**留当日快照到 `skill-updates/<日期>/`（恢复源，2026-10-26 靠它救回过 26 行）。

## 1. 技能生命周期分级

| 级别 | 技能 | 说明 |
|---|---|---|
| **PDM 链（权威源驱动）** | PDM.* 16 个 | 修订从 A34 出发，仓库是快照 |
| **活跃自建** | 原型标注、prototype-design、logic-list-spec、 competitive-analysis、strategy-and-competitive-analysis、meeting-prd-analyzer、prd-auto-generator、jd-crawler、简历四件套（k3-resume-replica/resume-tailor/resume-bullet-writer/creative-portfolio-resume）、admin-ui-spec、ui-ux-pro-max 等 | 正常迭代 |
| **官方/产品快照** | docx、xlsx、pdf 类、canvas-design、brand-guidelines、algorithmic-art、doc-coauthoring、find-skills、frontend-design、web-design-guidelines、humanizer(-zh)、paseo 系列 | 随上游更新，仓库仅存档 |
| **稳定维护（低频有效）** | idea-refine、ppt-master、operation-manual、software-copyright-docs、statusline-customizer、file-organizer、domain-modeling、prototype-domain-modeling、ui-consistency-check、mermaid-diagram-specialist、video-to-markdown、git-push（现名"散落技能文件"） | mtime 老但无被取代证据 |
| **🔴 拟弃用·待确认** | （无——2026-10-26 三项已裁定完毕，见 §2-A） | 有实质证据，等一句裁定 |
| **⚰️ 已弃用·归档** | prompt-capture、`archive/logic-list-spec-qoder`、`archive/context-restore`、`archive/openclaw-install` | 见 §2-A 裁定记录 |
| **📦 素材/散件（非技能）** | SKU批量填充弹窗（PNG）、knowledge-compiler.skill（zip 包）、baoyu-format-markdown（嵌套壳）、grill-me（嵌套壳） | 待整理，不安装 |

## 2. 待办路线

### A. 近期 · 弃用裁定（✅ 2026-10-26 三项已裁定）

| 技能 | 弃用证据 | 裁定 |
|---|---|---|
| `logic-list-spec-qoder` | v1.0 HTML 源码版；logic-list-spec v2.0 的 **Extract 模式**功能覆盖 | ✅ 弃——已移入 `archive/` |
| `context-restore` | 依赖 `/context-save`（gstack 系），四位置均无，孤儿 | ✅ 弃（gstack 不再使用）——已移入 `archive/` |
| `openclaw-install` | 一次性安装器 | ✅ 弃（2026-10-26 二次裁定，推翻同日"保留"）——已移入 `archive/` |

处置约定：仓库侧 `git mv` 进 `archive/`（内容保留、历史保留）；**三端安装副本的移除由道远手动删**（见 §2-B）。

### B. ✅ 手动删除清单（2026-10-26 已全部执行）

15 项已删除（仓库旧壳 4、.claude 5、.zcode 3、.agents 3），**删除前逐项备份并核验文件数一致**：
备份位于 `C:\Users\Administrator\.zcode\deletion-backups\2026-10-26\`（含 MANIFEST.txt；还原＝从对应子目录 cp 回原位）。
删除后基线：仓库可发现 66，三端各 65（合计 195）。保留未删：`散落技能文件\` 等 5 个待整理素材（见 §1 素材行与 §2-C）。

### C. 中期 · 整理

- [ ] `散落技能文件\` → 改名 `git-push\`（目录名≠技能名，且含 SKILL~5.MD 残留）
- [ ] `grill-me\`、`baoyu-format-markdown\` 嵌套扶正（照 product-manager-toolkit 的 mv 流程）
- [ ] `knowledge-compiler.skill`（zip）解包评估：是技能包就扶正，是素材就归档
- [ ] `SKU批量填充弹窗\` 移入素材区（纯 PNG，非技能）
- [ ] 原型标注 `scripts/annotate.py`（已退役的注入器）随下次该技能修订时清理

### D. 长期 · 流程

- [ ] 同步/分发流程脚本化，**必须内置方向仲裁**（version→mtime→超集检查，判不了就跳过呈报）——观察条目 #0114（回流缺失）/#0118（覆盖方向未仲裁）的修复面
- [ ] README 台账增加「运行时版本」列，仓库↔端落差评审可见
- [ ] 四端一致性月度校验（find SKILL.md + md5 对账）

## 3. 弃用判定标准（今后怎么判）

一个技能进入「拟弃用」需满足至少一条**实质证据**（mtime 老不算）：

1. **被超集取代**：另一技能的现有模式覆盖其全部功能（如 logic-list-spec-qoder vs v2.0 Extract）；
2. **被并入**：功能已合并进其他技能且有并入注记（如 prompt-capture → PDM.Skill-Evolve）；
3. **孤儿依赖**：依赖的伴侣技能/外部工作流已不存在（如 context-restore 无 context-save）；
4. **一次性使命完成**：安装器/迁移工具，目标环境已部署；
5. **素材混入**：无根 SKILL.md 的资料目录，本就不该按技能维护。
