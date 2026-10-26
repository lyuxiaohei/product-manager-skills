# 2-技能 · 技能台账

个人/团队技能集中仓库。2026-10-21 完成三源整理：从 **A34 项目权威源**收录 PDM 系列 15 个，从 **zcode 安装端**收录自建 5 个 + Anthropic 官方 5 个，从 **Claude Code 安装端**收录官方 5 个 + Paseo 产品 6 个，并修正 4 项结构/版本漂移（archify 2.14→3.2、diagram-design 换安装形态、humanizer-zh / find-skills 拍平双嵌套）。

2026-10-26 完成**四向对齐**：① 回流当日 A34 权威源 09:13 修订轮（10 个 PDM 技能 1.x 升级，经三端 md5 核验与权威源三方一致）；② 回流 paseo / paseo-plugin（安装端 10-22 版）；③ 收录 8 个缺口技能（admin-ui-spec、humanizer 英文原版、logic-list-spec v2.0、mermaid-diagram-specialist、PDM.Model-Routing、paseo-loop、web-design-guidelines、xlsx），仓库可发现技能 60→**69，追平四位置全集**；④ 扶正 product-manager-toolkit 双嵌套（就地 mv，内容取更晚的 03-18 版）；⑤ logic-list-spec-qoder 技能名改为 logic-list-spec-qoder，消除与 logic-list-spec v2.0 的撞名。

> 排除项（有意不收录）：tabbit（符号链接）、CuINiOrR（与 prd-auto-generator 重复）。~~admin-ui-spec、logic-list-spec v2.0~~ 已于 2026-10-26 经用户确认收录。
> 🗺️ 生命周期分级 / 弃用裁定 / 待办路线：见 [ROADMAP.md](ROADMAP.md)。

## 技能总览（75 项）

| 目录 | 技能名 | 版本 | 来源 | 用途 |
|---|---|---|---|---|
| PDM.AI-DIG | AI切入节点挖掘 | 1.2.1 | A34 | 从调研逐字稿/会议纪要挖掘 AI/智能体可承接的业务节点 |
| PDM.Model-Routing | 模型路由 | 1.0.0 | A34 | PDM 技能链模型路由规范（五档角色，单一事实源） |
| PDM.NOTE-CHECK | 会议记录事实核查 | 1.3.1 | A34 | 会议纪要事实核查与净化修订（分析前置质检层） |
| PDM.PRD-Generator | PRD自动生成 | 2.0.1 | A34 | 基于源码与业务规格生成/增量更新 PRD |
| PDM.Preparation | 产品经理预调研 | 1.7.0 | A34 | 售前情报与调研指导：公司画像/竞品矩阵/问题清单/假设库 |
| PDM.Preparation-Analysis | 产品经理首次分析 | 1.4.1 | A34 | 拜访纪要→原型输入转化（四件产出） |
| PDM.Preparation-Prototype | 初绘原型 | 1.2.1 | A34 | 首次调研会后出二次会演示材料（原型/流程图/对照表） |
| PDM.Refinement-Prototype | 修订原型 | 1.3.1 | A34 | 会后意见落进存量原型＋全站一致性同步 |
| PDM.Review-Developer | 开发侧评审 | 1.4.2 | A34 | PRD/原型的程序员视角评审（可编码性五维） |
| PDM.Review-Director | 管理层评审 | 1.4.2 | A34 | PRD/原型的研发总监视角评审（承接决策五维） |
| PDM.Review-Rehearsal | 评审彩排 | 1.0.2 | A34 | 业务方视角模拟评审，产出彩排问题清单 |
| PDM.Review-Summary | 评审汇总 | 1.4.3 | A34 | 三视角评审结果合并收拢 |
| PDM.Review-Tester | 可测试性评审 | 1.4.2 | A34 | 测试工程师视角评审（六维推演） |
| PDM.Skill-Evolve | 技能观察员 | 3.6.3 | A34 | 会话中捕捉技能改进机会，写观察日志 |
| PDM.Spec-UI | 原型UI规范 | 1.1.0 | A34 | 原型 UI 四端规范（PC后台/PC前台/移动前台/移动后台） |
| PDM.review-train | 评审技能校准器 | 1.2.2 | A34 | 三视角盲测＋金标准提取＋归因校准 |
| admin-ui-spec | admin-ui-spec | — | claudecode | 供应链管理后台/商城运营后台 HTML 原型 UI 开发规范 |
| algorithmic-art | algorithmic-art | — | claudecode | p5.js 生成艺术（种子随机＋参数探索） |
| archify | archify | 3.2 | 修正自 zcode | 架构/流程/时序/ER 等可交互 HTML 图表生成 |
| brand-guidelines | brand-guidelines | — | claudecode | Anthropic 官方品牌色与排版规范 |
| canvas-design | canvas-design | — | claudecode | 海报/静态视觉设计（png/pdf） |
| competitive-analysis | competitive-analysis | — | 既有 | S2B2C/供应链/电商竞品分析 |
| archive/context-restore | ⚰️ context-restore | 1.0.0 | 既有 | **已弃用（2026-10-26 裁定）**：孤儿技能，依赖的 /context-save（gstack）已弃用 |
| cover-letter-generator | cover-letter-generator | — | zcode | 求职信个性化生成 |
| creative-portfolio-resume | creative-portfolio-resume | — | zcode | 创意岗位简历（视觉设计＋ATS 兼容） |
| diagram-design | diagram-design | 2.5 | 修正自 zcode | 品牌化架构/流程/ER 等图表（HTML/SVG/PNG） |
| doc-coauthoring | doc-coauthoring | — | claudecode | 文档共创结构化工作流 |
| docx | docx | — | claudecode | Word 文档创建/读取/编辑/转换 |
| domain-modeling | domain-modeling | — | 既有 | 领域模型与统一语言构建、ADR 记录 |
| file-organizer | file-organizer | — | 既有 | 文件/文件夹智能整理与去重 |
| find-skills | find-skills | — | 修正自 claudecode | 技能发现与安装引导 |
| frontend-design | frontend-design | — | zcode | 高质量前端界面设计（反 AI 通用审美） |
| goal-creator | goal-creator | — | zcode | 无人值守任务 goal 命令/任务书生成器 |
| humanizer | humanizer | 2.5.1 | agents端 | Anthropic 官方英文文本去 AI 痕迹（humanizer-zh 的英文原版） |
| humanizer-zh | humanizer-zh | — | 修正自 zcode | 中文文本去 AI 生成痕迹 |
| idea-refine | idea-refine | — | 既有 | 结构化发散/收敛迭代打磨想法 |
| jd-crawler | jd-crawler | 0.1.1 | zcode | 猎聘/Boss直聘 JD 批量爬取落库 |
| k3-resume-replica | K3简历复刻 | — | zcode | PDF 投递版简历 100% 复刻为单文件 HTML |
| logic-list-spec | logic-list-spec | 2.0 | zcode | 业务逻辑清单生成（Draft 模式，从需求正文起草） |
| archive/logic-list-spec-qoder | ⚰️ logic-list-spec-qoder | 1.0 | 既有 | **已弃用（2026-10-26 裁定）**：被 logic-list-spec v2.0 Extract 模式取代 |
| meeting-prd-analyzer | meeting-prd-analyzer | — | 既有 | 会议纪要→需求变更抽取/PRD 更新 |
| mermaid-diagram-specialist | mermaid-diagram-specialist | — | agents端 | Mermaid 流程图/时序图/ERD/架构图专家（mermaid-expert 旧壳的改名正式版） |
| archive/openclaw-install | ⚰️ openclaw-install | — | 既有 | **已弃用（2026-10-26 二次裁定，推翻保留）**：一次性安装器不再需要 |
| operation-manual | operation-manual | — | 既有 | 软著操作手册 docx 生成（截图＋python-docx） |
| paseo | paseo | — | claudecode | Paseo 产品参考（项目/工作区/代理/调度） |
| paseo-advisor | paseo-advisor | — | claudecode | 单代理顾问：第二意见 |
| paseo-committee | paseo-committee | — | claudecode | 双高推理代理委员会：根因分析与计划 |
| paseo-handoff | paseo-handoff | — | claudecode | 全上下文交接给另一代理 |
| paseo-help | paseo-help | — | claudecode | Paseo 产品答疑与排障 |
| paseo-loop | paseo-loop | — | agents端 | 代理循环运行直到满足退出条件（loop/babysit/watch） |
| paseo-plugin | paseo-plugin | — | claudecode | Paseo 插件构建与管理 |
| ppt-master | ppt-master | — | 既有 | AI 多格式 SVG 内容生成（PPT） |
| prd-auto-generator | prd-auto-generator | 0.51 | 既有 | 按版本范围生成 PRD（叙述体优先） |
| prompt-capture | prompt-capture | — | 既有 | 提示词自动捕获钩子（功能已并入 PDM.Skill-Evolve，留档） |
| product-manager-toolkit | product-manager-toolkit | — | 既有 | PM 工具箱（PRD 模板/访谈分析/RICE 优先级脚本；2026-10-26 扶正双嵌套） |
| prototype-design | prototype-design | 0.51 | 既有 | 原型设计规范（口述/草案双模式 HTML 页面） |
| prototype-domain-modeling | prototype-domain-modeling | — | 既有 | 从静态 HTML 原型逆向业务实体模型 |
| resume-bullet-writer | resume-bullet-writer | — | zcode | 简历条目成就化改写（量化指标） |
| resume-tailor | resume-tailor | — | zcode | 按 JD 定制简历（保持真实性） |
| SKU批量填充弹窗 | — | — | 既有 | SKU 批量填充弹窗素材（无根 SKILL.md，待整理） |
| software-copyright-docs | software-copyright-docs | — | 既有 | 软著申请材料（操作手册＋申请表栏目） |
| statusline-customizer | statusline-customizer | — | 既有 | Claude Code 状态栏配置/定制/修复 |
| strategy-and-competitive-analysis | strategy-and-competitive-analysis | — | 既有 | 战略与竞争分析框架（Good Strategy/波特五力等） |
| ui-consistency-check | ui-consistency-check | — | 既有 | UI 风格统一性走查（色彩/字体/间距/圆角） |
| ui-ux-pro-max | ui-ux-pro-max | — | zcode | UI/UX 设计智能库（50+风格/161配色/99 UX 准则） |
| video-to-markdown | video-to-markdown | — | 既有 | 视频转 Markdown 思维导图（下载→Whisper→导图） |
| video-to-markdown-download | — | — | 既有 | 旧版嵌套壳（04-10 内容已被 08-04 正式版取代，**待手动删除**） |
| web-design-guidelines | web-design-guidelines | — | agents端 | Web 界面规范合规走查（无障碍/UX 审计） |
| xlsx | xlsx | — | agents端 | 电子表格读取/编辑/创建（xlsx 为主输入输出的任务） |
| 原型标注 | 原型标注 | — | zcode | HTML 原型双轨标注层（业务?圆标＋开发角标） |
| 文件名编码管理 | 文件名编码管理 | — | 既有 | 工作台全域文件命名/编码权威规则 |
| baoyu-format-markdown | — | — | 既有 | 宝玉格式 Markdown 散件（无根 SKILL.md，待整理） |
| grill-me | — | — | 既有 | grill-me 散件（无根 SKILL.md，待整理） |
| mermaid-expert | — | — | 既有 | 旧版嵌套壳（内容=mermaid-diagram-specialist 旧名，**待手动删除**） |
| 散落技能文件 | git-push | 1.0 | 既有 | 散件集（含安全推送技能 git-push；目录名≠技能名，含 SKILL~5.MD 残留） |

## 已知待整理项

以下目录为历史散件/旧壳，无根 SKILL.md 或双嵌套，本次按「不动项」保留，待后续专项整理：
`SKU批量填充弹窗`、`baoyu-format-markdown`、`grill-me`、`prototype-design`（上游自带嵌套副本）、`文件名编码管理`。

**待手动删除清单**（2026-10-26 对齐产生，已确认内容被更新版本取代，按用户要求不脚本删除）：
`mermaid-expert/`（旧名壳）、`video-to-markdown-download/`（旧版壳）、`product-manager-toolkit.broken-husk/`（扶正后的空外壳）。

## 维护约定

- 技能目录＝根级 `SKILL.md`＋支撑文件；**入库时校验**：根 SKILL.md 存在、frontmatter `name:` 可解析、无双嵌套。
- PDM 系列以 `D:\工作台-吕道远\5-A34-AI项目工程化技能\skills\` 为权威源（2026-10-26 实测存在，16 技能），仓库副本为快照；更新时从权威源整体替换，并核对 `version:` 与 mtime 晚于各安装端。
- **回流约定（2026-10-26 起）**：每次修订/安装轮落盘后，以「各位置中 version 最高且校验通过」的一侧为源回写本仓库并 commit；权威源路径失效时先重锚再执行。
- 官方（Anthropic）与产品（Paseo）技能随上游更新，仓库副本仅为快照存档，不作为安装源。
