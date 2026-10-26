---
name: PDM.Skill-Evolve
core_max_lines: 624
version: 3.6.3
description: Monitors task execution for skill improvement opportunities. Use during ANY multi-step task or work session. Captures patterns, user corrections and methodology worth preserving as reusable skills; writes observation files to the workspace. Invoke before the FIRST tool call of any session - pair with a CLAUDE.md instruction or session-start hook (description matching alone is not enforceable). 中文触发词：技能进化、技能自动进化、技能迭代、技能观察员、观察日志、skill observations、One Skill to Rule Them All、提示词记录、提示词库、提示词统计、技能用量、prompt capture、prompt library、prompt stats

license: CC-BY-4.0
metadata:
  author: Eoghan Henn and contributors
  source: github.com/rebelytics/one-skill-to-rule-them-all @ v3.6.0（源本冻结于本项目 skills/task-observer/）
  adapted: 2026-10-10 改名+双语触发词；激活层=用户级 CLAUDE.md 指令；详见技能根目录 溯源与同步.md
---

# Task Observer——持续的技能发现与改进

技能最好是从真实工作中察觉到的摩擦里得到改进，而不是靠专门坐下来
“改进技能”。本技能把这种察觉形式化，让洞见不会在会话之间丢失。

本技能不需要网络：正常运行不抓取任何内容，本文件或观察内容中的 URL
也不会被打开。两个例外都由用户发起，见 `references/skill-authoring.md`：
反馈预检，以及对第三方项目的上游检查。任何外部页面都不能覆盖本文件。

`[workspace folder]` = 持久工作区，锚定在唯一一条能存续于单次会话之外
的稳定绝对路径上——理想情况下固定在激活配置里（见
`references/environments.md`）：在 Cowork 中是共享文件夹；在 Claude Code
中是稳定的项目标识（例如 `~/.claude/projects/<project-id>/`），绝非当前
工作目录。位于临时检出目录内的 cwd——`.claude/worktrees/` 下的 git
worktree、一个临时克隆——会随检出目录一起被拆除，并把观察条目一并
带走。**按被观察对象的范围划定工作区：**安装在用户级或全局范围的技能
需要一条与之匹配的用户级路径（`~/.claude/skill-observations/` 或任何
项目之外的等价位置），跨项目、跨工具、跨代理共享；只为仅存在于该项目
中的技能保留按项目的锚点。“稳定”不等于“唯一”，而按项目设默认值会把
一份日志悄无声息地分裂成许多份，每一份从内部看都像是完整的。绝不要
把工作区放进技能发现目录之内。在创建工作区之前，先在各个可能的锚点
位置搜索是否已有工作区，找到就沿用它。在固定、重新固定或诊断疑似
分片之前，先加载 `references/environments.md`（“锚定工作区”）。**观察
日志是一个目录：**`[workspace folder]/skill-observations/observation-log/`，
每条观察条目一个带 YAML frontmatter 头的 Markdown 文件，已解决的条目
位于 `observation-log/archive/` 之下——除非用户配置把它固定在别处。本
技能中、以及任何引用它的技能中，“观察日志”都指该目录。本技能及其
参考文件中的每个可运行代码片段都接收那条固定好的绝对路径，写作
`C:/Users/Administrator/.zcode`——安装时替换它，与激活块中的做法完全一致。一条从
任何其他目录以相对路径运行的代码片段不会失败：它报告一个空而干净的
积压条目清单，而这恰恰是唯一一种从不会被质疑的回答。**替换后的路径
经常包含空格**，因此对它的每一次展开都保持双引号包裹，任何代码片段
都不会让它经过分词。**这里的每个代码片段都是 bash，而不是 POSIX
`sh`**：显式用 bash 调用这些代码片段。两种情况的原因见
`references/observation-log.md`（“代码片段接收带空格的路径并以 bash
运行”）。

## 参考文件——按需加载，而非预先加载

每个指针都注明其触发条件。这些加载是强制性的：当某个情景触发时，先
加载对应文件——绝不要从这份核心文件即兴发挥该情景；一次情景在未加载
其参考文件的情况下被处理，本身就是一条观察条目。**清单中的某个文件
未出现在本文件旁边，即为不完整的安装：**告诉用户缺了哪个，并说明完整
捆包来自“关于本技能的反馈”一节所指向的仓库（某些上传途径只保留
`SKILL.md`）；其情景不会运行。

- `references/weekly-review.md`——全面评审流程、审批策略、更新后技能的
  交付与暂存。**在评审触发或用户要求评审时加载。**
- `references/skill-authoring.md`——分类法、结构、许可、署名、保密分层、
  活文件编辑、迁移检查。**在编写任何 `SKILL.md` 或技能文件之前加载，
  设置工作也不例外。**
- `references/observation-log.md`——存储布局、frontmatter 字段、辅助
  代码片段、归档细节，以及各条规则背后的推理。**在首次搭建日志时、
  归档时、id 或 frontmatter 看起来不对时、或在改变任何读取日志的方式
  之前加载**——以及下文任何指针点名它的地方。
- `references/signals.md`——什么值得记录、什么不值得。**在不确定某事
  是否算观察条目、或在整理大量候选时加载。**
- `references/environments.md`——激活与配置设置、压缩行为、捆包清单、
  面向无存储环境的交接文档模式。**在有设置问题时、在压缩或恢复之后
  （会话启动协议届时会重新运行）、或没有文件系统时加载。**
- `references/migration.md`——对 3.0 之前单文件 `log.md` 的一次性脚本化
  转换。**仅在会话启动协议检测到遗留日志时加载。**全新安装从不读取它。
- `references/starter-principles.md`——一组可选的、已剥离出处信息的通用
  横切原则种子集。**仅在启动集对账到期时加载**（会话启动第 1 步：
  `starter-principles-reviewed.txt` 标记文件缺失，或其中所写启动集版本
  较旧）——绝不在普通会话启动时加载。

## 会话启动协议

1. **存储。**对 `skill-observations/` 的存在性检查同时也是工作区挂载
   探针——对固定路径的一次 `ls`，搭载在会话第一批工具调用**之内**；
   会话启动的技能加载搭载在同一批次里，绝不提前到更早的批次
   （`references/environments.md`，“探针搭载在第一批次调用内”）。如果
   它失败，第一反应是环境的文件夹选择工具（在 Cowork 中是
   `request_cowork_directory`；其他环境用其等价物），而不是走“无文件
   系统”分支：交接文档模式（`references/environments.md`）是为完全没有
   文件系统的环境准备的，而当一次挂载缺失被误读为“无文件系统”时，
   就会太轻易地走进这条分支。权限分类器对这一请求的拒绝（它会点名
   分类器并给出方括号内的原因；用户的主动拒绝则不会）归入**如何记录**
   的拒绝规则：至多重试一次完全相同的请求、告知用户、绝不再换用别的
   工具。绝不要凭环境标志、上下文中是否存在某个配置文件、或对早前
   轮次的记忆，来断言挂载的状态，无论断言已连接还是未连接：这种断言
   需要同一轮次内的探针。**探针成功并不意味着激活配置已触发。**在
   第 1 轮，一个仅仅迟到的配置与一个缺失的配置无法区分：直接加载会话
   启动技能，而不是假设它已触发；如果挂载解析成功但其内容不在上下文
   中，就亲自读取配置文件。为什么这道防线只是备用手段、主防线应放在
   哪里，见 `references/environments.md`（“激活配置——迟到、间歇性
   失灵，以及该防线为何不能内置于其中”）——在设置或诊断激活时加载
   它。在创建或写入任何东西之前：如果解析出的工作区位于临时路径之下
   （`.claude/worktrees/`、一个临时克隆），发出警告并重新锚定到稳定的
   项目路径——写在那里的状态会在拆除时丢失；在没有任何路径可解析的
   地方（一次性 worker），使用报告回传模式：
   `references/environments.md`（“Claude Code Projects”）。然后**运行**
   `references/observation-log.md`（“工作区创建”）中的那一条幂等命令：
   它创建四个工作区工件并逐一断言，且拒绝 3.0 之前的 `log.md` 布局
   （加载 `references/migration.md` 并先完成转换）——绝不要照着清单
   逐项手工创建它们。然后进行**启动集对账**，凡是
   `skill-observations/starter-principles-reviewed.txt` 缺失、或其中记录
   的启动集版本旧于 `references/starter-principles.md` 中的版本时到期
   ——全新安装、升级到附带该文件的捆包、以及该集合此后的每一次扩充
   都会使其到期。加载该文件并遵循其**对账（Reconciliation）**一节：
   按实质匹配、用一行文字提议一次、只导入采用者所选的内容，然后把随
   捆包发行的版本写入标记文件，使该提议在集合变化之前绝不重复。绝不
   默默预填。在启动行中报出所加载技能 frontmatter 的 `version:`——从
   文件读取，绝不联网抓取。
2. **扫描。**只读取 `observation-log/` 中每个文件的 frontmatter——即
   前两条 `---` 行之间的头部块，绝不读正文——并从 `status`、`skill`、
   `proposes_skill` 和 `title`，以及扫描所打印的活跃原则标题（检查点行
   中的 `principles=`）建立感知。把它们保持在感知中，不要未经提示就
   呈报。只读 frontmatter 正是每文件一档格式的全部意义所在：一旦存在
   数百条观察条目，扫描依然保持低廉。

   **本扫描不能满足逐技能检查**（即激活块所规定的、每次技能加载时的
   那条 grep）；当那条 grep 显得多余时，加载
   `references/observation-log.md`（“会话启动扫描为何不能满足逐技能
   检查”）。

   **对已知非空的日志得到空扫描结果，在证明并非如此之前就是一条损坏
   的命令**——脚本的防线会在这一点上中止。当防线触发时、或在改造
   扫描之前，加载 `references/observation-log.md`（“对非空日志的空扫描
   是一条损坏的命令”）。

   ```bash
   bash "<skill directory>/scripts/session-start-scan.sh" "C:/Users/Administrator/.zcode"
   ```

   `scripts/session-start-scan.sh` 就是这个扫描（`<skill directory>`：
   存放本文件的那个目录）；在那里逐行审查它运行和打印的内容。

   **只有打印这一步可能被拒绝，因此它被放在最后运行**——被拒绝的
   打印绝不等于空日志：在改动其中任何一半之前，加载
   `references/observation-log.md`（“被拒绝的打印不是空日志”）。
3. **评审触发。**读取 `skill-observations/last-review-date.txt`。其值
   承载事实：日期 = 上次评审实际运行的时间；`never` = 尚未运行过任何
   评审。文件缺失属于异常（第 1 步会创建它）——用 `never` 重建它，
   不要编造日期。已存在的 `skill-observations/review-started.txt` 内容
   不是 `completed`，或已注册的调度器报告了更晚的上次运行时间，都表示
   一次没有完成任何评审的运行：说“已于 YYYY-MM-DD 触发，未记录评审”，
   并把评审视为到期。如果该值为 `never` 或已过去 7 天及以上，且存在
   OPEN（开放）状态的观察条目：在交互式会话中，用一行提议评审，然后
   继续用户的任务，除非用户选择加入；绝不要把他们的工作拦在评审上。
   让提议的**内容**随积压条目规模伸缩，而绝不改变其频率：开放观察
   条目不超过约 15 条时，提议完整评审（“积压条目[N 天内／至今]未经
   评审——N 条开放；现在运行，还是继续？”）；超过这个数，提议一个
   工作量单位随积压增长保持恒定的有界切片——“评审最旧的 10 条”、
   “只评审指向<被点名最多的技能>的那些”——并同时报出两个数字：
   多少条开放、它们大致代表多少条独立发现（按你刚扫描到的 `title`
   与 `skill` 字段聚类；原因见 `references/weekly-review.md`）。只有
   计划任务／自主运行才会加载 `references/weekly-review.md` 并不经
   提示地运行评审；输出通道由调用方持有的会话两者都不做：
   `references/environments.md`（“输出通道由调用方持有的会话”）。
4. **激活。**每会话一次：如果不存在本技能的 CLAUDE.md（或等价物）激活
   指令，简短建议添加一条（见 `references/environments.md`）。已配置则
   跳过。要清楚这一步是什么：它只在技能被调用之后运行，因此它验证的
   是一个已能工作的设置，在结构上无法检测缺失的设置——它不是从未
   激活安装的安全网；来自运行时之外的检查在 `references/environments.md`
   中。
5. **并发。**不存在需要守护的共享日志文件：每条观察条目都是独立文件，
   创建一条绝不会与另一会话的条目冲突；在改变某条的*状态*之前重新
   读取它（见“如何记录”）。
6. **目标与暂存工作。**将扫描到的 frontmatter 中每个不同的 `skill:` 值
   对照已安装技能集进行解析，并用一行提及任何不再能解析的——以及
   任何能解析但无法运行的，因为出现在清单里不等于具备能力
   （`references/skill-authoring.md`，“运行时前提条件”）。被删除的技能
   会在无人察觉中积累观察条目；失效的技能更是如此。说明你是对照什么
   进行解析的（这份检出、这套安装）：一个未解析的目标是关于你在哪里
   查找的事实，而不是关于世界的事实。如果 `skill-updates/` 中有任何
   内容，先对账再宣布——安装发生在任何会话之外，因此没有会话观察到
   它，而读到该台账的会话负责它的清理。对每份暂存副本与活文件运行
   `diff -rq` 并加以分类（一句干巴巴的“有差异”不是裁定：活文件会合法
   地继续演进），并点名每个没有清单条目覆盖的目录。各情形见
   `references/weekly-review.md`（“暂存条目对账闸门”）——在裁定任何
   条目之前加载它。然后用一行说“N 项暂存更新待评审”。
7. **首次运行，或用户点名的过往会话。**如果日志为空而项目有历史（交接
   或决策文档、提交历史、测试脚本、笔记或记忆目录、已存在的
   CLAUDE.md），提议对这些工件做一次一次性回填；当用户点名某个已结束
   的会话时，对它限定范围运行同样的回填。条目在 `session_context` 中
   引用的是持久工件（文件与章节），绝不引用某个会话。流程见
   `references/environments.md`（“首次运行回填”）。

## 何时观察

在整个任务会话期间保持活跃——执行、任务后反馈、评审讨论、关于技能
或方法论的元讨论，以及关于工作应当如何开展的战略对话。**当对话从做
工作转向讨论工作时，观察心态并不关闭**；评审阶段的反馈往往是信号最强
的输入。只在闲聊和不涉及工具或交付物的快速事实问答中不活跃。

## 观察什么

**新技能：**可复用的多步骤工作流、用户讲解过而没有任何技能承载的方法
论、反复出现的任务类型、用户描述为“我一直都是这么做的”的流程。
**改进技能：**代理违反了已成文的规则（技能需要的是强制执行，而不是
更大声的规则）；用户的纠正暴露出缺失的规则或边界情况；出现了比技能
所推荐的更好的工作流或技术；一个错误假设；新工具让某个步骤过时；一条
同样适用于其他技能的原则。**简化技能：**许多会话中从不相关的章节、
来自单条未经验证观察条目的规则、互相矛盾的规则、代理始终无法遵守的
规则——转为结构性强制或删除。带示例的完整目录：
`references/signals.md`。

**未解决的缺陷是一个有界时点上的观察条目。**当一个本身并非交付物的
缺陷需要第二个假设时，加载 `references/signals.md`（“未解决的缺陷是
一个有界时点上的观察条目”），并记录已有证据支撑的问题报告，而不是
第五次探查。

**不要记录：**无法泛化的一次性纠正；技能中已捕获的偏好；与方法论无关
的工具缺陷；需要专有客户信息才能在开源技能中发挥作用的观察（除非内部
技能才是合适的归属）。不确定时，运行 `references/signals.md`（“可泛化
性测试”）：多数答案为否 → 属于任务上下文，不是观察条目。在铸造
`proposes_skill` 名称之前，先复用合适的现有候选——为同一技能独立记录
的多条提案很少恰好同名。

**写入前先检查是否为重述。**创建文件之前，列出指向同一目标技能的开放
观察条目（会话启动的扫描已持有它们的标题；否则运行
`find observation-log -name '*.md' -exec grep -l "skill:.*<bare-name>" {} +`）
并读取这些标题。如果这条发现是同一条发现的重述——同一条规则、同一
种失败形态、只是不同的例子——就改为扩展现有条目：把新实例追加到其
正文，把该会话加入 `session_context`，拓宽 `title:` 使其覆盖它。重复
只有在聚合中才可见（在一份日志上实测：九十一个开放条目中约四十条是
同一条发现的重述），而一条近似重复的条目在每个会话都要付出一次捕获、
每次评审都要付出一次分诊的代价。

**在写入时验证目标。**`skill:` 命名一个现在就存在、且执行“问题
（Issue）”所描述操作的技能，写为其裸名（仅在两个技能同名时才用
`plugin:name`）。如果合适的归属不是技能——一份指令文件、一条记忆
笔记、某个例程读取的登记表——就把该路径写进 `target_file:`，而不是
就近塞给某个技能；尚未构建的技能写入 `proposes_skill:`。

**在写入时检查目标技能的同族技能，并记录你已检查。**写入之前，将目标
对照家族登记表（`skill-observations/skill-families.md`）解析，对每个
同族技能要么把它加入 `skill:`，要么在正文中说明它为何不适用。快速
测试：**这句话去掉工具名或主体名之后还能成立吗？**若能，它就属于每一
个同族技能。把结果记录在必填的 `siblings_checked:` 字段中，包括
“已检查——属实例特有，不传播”这一裁定：只有一项的 `skill:` 列表，
无论同族技能被认真评估过还是从未被考虑，在字节上都完全相同，只有被
记录下来的字段才能让该判断的*缺席*可见。登记表规范、一致性模型，以及
无登记表时的回退方案，见 `references/observation-log.md`（“技能家族与
同族检查”）。

**记录你自己的违规。**违反一条由技能或项目指令文件成文记录的规则，
是一条一等公民的观察条目，不是该绕过去的难堪事：它是规则的*强制执行*
过弱的唯一证据，而且除了代理没有人能看到它。在同一轮内记录它，并
点名当时实际生效的是哪种保护——已成文、已加载进上下文、还是有检查
点兜底。上面的重述检查会在早前条目存在时将其呈报出来，因此计数无需
额外工作即可得到。

**同一规则第二次违规：停止提议文字。**一条规则在两次失守之间没有任何
`actioned` 修复，说明它有的是保护问题，而不是措辞问题。从第二次发生
起，提议的改进必须是结构屏障——拒绝该调用的钩子、一条 lint 规则、
一个让错误路径不可用的默认值——绝不是更清晰的句子、更醒目的警告、
或把同一条规则挪到更显眼的位置。在提议两者之一以前，加载
`references/signals.md`（“第二次违规——为何需要屏障而非改写措辞”）。

## 如何记录

**在同一轮或下一轮内写入观察条目文件，不打断用户的任务**——绝不要
心里攒着等以后批量写；写入这个动作本身就是强制执行机制。

**每完成第 3 个待办项后的强制检查点。**在把第 3、6、9（以此类推）项
标记为完成之后，你必须**写入磁盘**——而不是仅仅自问是否有待写内容。
写入所有待写的观察条目文件，或向 `skill-observations/checkpoints.log`
追加一行 `no observations` 确认。要求的动作是一次具体的写入；一句
记得的“问问有没有”不构成强制执行。大致每三次完成一次即是规则；计数
不必精确。（按写入计费工作区的例外：`references/environments.md`。）

**被拒绝或失败的写入并不代表日志是只读的。**瞬时故障（I/O 错误、
超时、不含权限裁决的工具错误）重试一次。权限或分类器的拒绝是权威性
的：用一行告诉用户什么被拒绝了、这次写入为何重要，然后以报告回传或
交接模式携带观察条目（`references/environments.md`）。对分类器拒绝至多
保留一次完全相同的重试，并向用户说明这是对概率性误判的一次复核——
绝不换用别的工具。

**交付物事件冲刷。**每当一个工作单元被宣布对人类完成——交付一个
文件、一次渲染、一份暂存的技能文件、一条完成通知、一份最终报告、
一批完成的待办——就在此刻写入所有待写的观察条目文件。这些检查点本来
就涉及工具调用，因此冲刷搭载在你反正要做的工作之上。（为什么两个
检查点都是写入而不是提问：`references/observation-log.md`。）

**对外部系统写入失败本身就是独立的冲刷触发器**——一条携带
`permission stream closed`、`permission denied` 或宿主中断的工具结果。
它不是完成，却具备冲刷所需的两个属性：它是工具记录中的字面字符串，
而不是对“此刻是否够格”的判断；并且它恰好落在一次运行刚发现值得报告
的东西、也最可能就此停下的地方。在对失败做任何其他处理之前先冲刷，
包括决定拿它怎么办。（实测观察：一次无人值守的运行完成了每一步，在
第一次对外写入时遇到权限错误，最终既没有报告也没有记录任何观察
条目。）

**这对组合仍然留下两个缺口：**“第 3 项完成”检查点在不使用待办的会话
中是惰性的，而“这算不算主要交付物？”是一次自我评估——因此交付物
冲刷是仅存的强制手段，必须有意识地执行。在新增或修改任何强制触发器
之前，加载 `references/observation-log.md`（“检查点组合仍然留下的两个
缺口——以及两者背后的规则”）。

**id 与文件名。**每条观察条目是 `NNNN-short-slug.md`（零填充 id + 由
标题生成的 kebab-case slug）。id 是三个值中的最大者再加一：
`observation-log/` 中最大的数字前缀、`observation-log/archive/` 中最大
的数字前缀，以及 `observation-log/archive/.id-floor` 中的数字（有史以来
签发过的最大 id——每当你签发超过它的 id 就更新它，这样当活跃目录为
空时计数器绝不会从 1 重新开始）。同一条命令会先用 `mv` 把陈旧的已解决
文件从 `observation-log/` 移入 `archive/`——归档是推导 id 的副作用，
不是一项独立职责（见“写入时归档”）：

```bash
d="C:/Users/Administrator/.zcode/skill-observations/observation-log"   # the pinned workspace path, never relative to the cwd; it may contain a space, so keep it quoted; bash, not sh
today=$(date +%F)          # archival rides inside this command (see below):
n_files=$(find "$d" -maxdepth 1 -name '[0-9]*.md' ! -empty | wc -l | tr -d ' ')   # a zero-byte file gives awk no line to count
seen=$(cd "$d" && awk 'FNR==1 {n++; nextfile} END {print n+0}' [0-9]*.md 2>/dev/null)   # files the sweep's glob reaches, counted apart from the sweep
[ "$n_files" -gt 0 ] && [ "${seen:-0}" -eq 0 ] && { echo "ARCHIVAL SWEEP BROKEN — $n_files files present, 0 examined"; exit 1; }
( cd "$d" && LC_ALL=C awk -v today="$today" 'FNR==1 {st=""; r=""; sub(/^\357\273\277/, ""); fm=/^---[[:space:]]*$/; if (!fm) nextfile; next}
    fm && /^---[[:space:]]*$/ {if (st ~ /^(actioned|declined|superseded)$/ && r ~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/ && r < today) print FILENAME; nextfile}
    fm && /^status:/ {st=$2}
    fm && /^resolved:/ {r=$2}' [0-9]*.md 2>/dev/null | while IFS= read -r x; do mv -n "$x" archive/ 2>/dev/null; if [ -e "$x" ]; then echo "NOTE: $x not archived — archive/$x exists or the move failed"; fi; done )   # one awk for the set, one mv per stale resolved file, never over an archived one; bash
floor=$(sed '1!d; s/[^0-9]//g' "$d/archive/.id-floor" 2>/dev/null); floor=$((10#${floor:-0}))   # digits only: a CRLF or padded floor still reads
ids=$(for p in "$d"/[0-9]*.md "$d"/archive/[0-9]*.md; do [ -e "$p" ] && printf '%s\n' "${p##*/}"; done | grep -oE '^[0-9]+')   # globs and builtins: no `ls` a profile alias can rebind
[ "$(printf '%s' "$ids" | grep -c .)" -eq "$(find "$d" "$d/archive" -maxdepth 1 -name '[0-9]*.md' | wc -l)" ] || { echo "ID COMMAND BROKEN — the listing and find disagree on the prefixed files"; exit 1; }
hi=$(printf '%s\n' "$ids" | sort -n | tail -1); hi=$((10#${hi:-0}))   # from the files alone; 10#: a zero-padded prefix is not octal
[ "$hi" -lt "$floor" ] && echo "NOTE: highest file id $hi is below .id-floor $floor — ids issued without a file; the new id goes above the floor"
next_id=$(( (hi > floor ? hi : floor) + 1 ))      # never below the floor, whatever the listing saw
f="$d/$(printf '%04d' "$next_id")-<slug>.md"      # the target path, built from the id just derived
[ -n "$(find "$d" -maxdepth 2 -name "$(printf '%04d' "$next_id")-*.md")" ] && { echo "COLLISION — id $next_id already used; re-derive"; exit 1; }   # guard the id PREFIX across active + archive, not the path
(set -C; : > "$f") || exit 1                        # noclobber: create, never truncate an existing file
printf '%s\n' "$next_id" > "$d/archive/.id-floor"   # AFTER the create: an id check that writes no file never moves the floor
```

清单防线区分“日志为零”与“我读不到日志”，清扫计数对归档循环做同样的
事，前缀防线拒绝任何 slug 之下已被占用的编号，`noclobber` 创建拒绝
已存在的路径——只有在那次创建成功之后才写入正文，用编辑工具，或在
命令需原样送达之处用加了引号的 heredoc（绝不使用不加引号的）：
`references/observation-log.md`（“编辑已存在的观察条目”）。当其中任何
一道防线触发时，加载 `references/observation-log.md`（“防线行、清扫
计数与 noclobber 创建”）。

**在每一次写入之前立即运行代码片段，包括会话中第一次也是唯一的一次
写入**——更早读取过日志不能替代它，会话启动扫描打印出的 id 绝不是
写入的输入。在能运行辅助脚本的地方，`bash scripts/new-observation.sh <slug>` 是唯一的写入路径：它执行这整个片段并打印创建的路径，因此
推导不会偏离创建（这正是第二次违规规则所要求的结构屏障）。当跳过显得
合理、或发现两个文件共用一个 id 时，加载
`references/observation-log.md`（“每次写入前立即运行代码片段”）。

**在每个 id 自己的写入时点解析它**——在每个文件之前运行片段，绝不
预先计算一段区间，并把片段打印的值同时写进文件名和 `id:` 字段。在
批量或并行之前，加载 `references/observation-log.md`（“在每个 id 自己
的写入时点解析”）。

**每个工具都获得同样的防线：在独立探针证明总体确为空之前，空结果或
零结果都只是关于该工具的断言。**在编写任何针对日志的新扫描、计数、
grep 或查询之前，加载 `references/observation-log.md`（“每个工具都获得
同样的防线”）。

**结构探针在先前有内容之处返回为空，是停止信号而不是创建指令**——
立即停下并重新探查；绝不让一次追加去重建缺失的目标。在此类探针之后
写入任何内容之前，加载 `references/observation-log.md`（“结构探针返回
为空是停止信号”）。

**文件格式。**YAML frontmatter（每次扫描读取的元数据），其后是
“问题 → 改进 → 原则”的正文。**frontmatter 是必填的；创建时必须写
`status: open` 和非空的 `siblings_checked:`**——缺少 `status` 字段的
观察条目会被评审当作 OPEN（开放）处理，绝不当作不存在；缺少
`siblings_checked:` 的条目视为未做同族检查就已记录。

```markdown
---
id: 0
title: "Short descriptive title"
status: open            # open | actioned | declined | superseded | parked
type: open-source       # open-source | internal
skill: [skill-a, skill-b]        # existing skills this improves —
                                 # always a list, first entry primary, may be
                                 # empty: []; quote an entry holding a colon
proposes_skill: []               # new skills this argues for, by working
                                 # name; an observation can fill either
                                 # list or both
target_file: []                  # when the right home is not a skill at all:
                                 # the path the fix will be written to
siblings_checked: "family-name: a, b — a added; b excluded (b/SKILL.md §2)"
                                 # MANDATORY, never blank: the family name,
                                 # each member's verdict — every exclusion
                                 # names the section read in it, or the
                                 # literal assumed; none only where the
                                 # target belongs to no family
area: "which part of the skill or workflow"
date: YYYY-MM-DD
session_context: "what task was being worked on"
parked_until:           # MANDATORY when status is parked, empty otherwise:
                        #   one line naming the condition that unparks it
resolved:               # date resolved; leave empty while OPEN
resolution:             # what was done — set only when actioned/declined/superseded
reference:              # optional — path to saved session-local evidence
commands_verified:      # MANDATORY when the body quotes a command — each
                        #   `run` with its result, or `NOT RUN` with why; else none
---

**Issue:** [What happened — specific enough to understand weeks later
without the original conversation.]

**Suggested improvement:** [Concrete change. For existing skills, name the
section or rule; for new skills, scope and key components.]

**Principle:** [The generalisable takeaway — the most important field.]
```

**每一个散文值都要加双引号，含有冒号的列表项同样如此。**`title`、
`siblings_checked`、`area`、`session_context`、`resolution`、
`parked_until` 和 `reference` 承载自由文本，而自由文本最常见的情形就是
含 `: `；不加引号时它就是无效的 YAML——扫描会把 `key: a: b` 标记为
可疑；每一个真正去解析它的消费者都会抛错。`[]` 列表中的插件作用域名
（`[plugin:name]`）在一种 YAML 解析器下能加载、在另一种下会失败：给
它加引号（`"…"`，内部 `"` 写作 `\"`）；裸 kebab-case 名称、日期和状态词
保持裸写。关于漂移的详情，加载 `references/observation-log.md`
（“frontmatter 字段”）。

**`parked` 意为已决，而非待定：**合理但被外部前提条件阻塞、已移出
工作队列、永不归档，`parked_until:` 必填且必须点名一个确实可能发生的
条件。在设置、评审或解除搁置状态之前，加载
`references/observation-log.md`（“`parked` 状态——已决而非待定”）。

**上下文保全：**如果一条观察条目依赖会话本地数据，先把它保存进工作
区，并把 `reference:` 设为新会话能解析的持久路径。在设置 `reference:`
时，加载 `references/observation-log.md`（“上下文保全——`reference:`
字段”）。

**记录时的保密：**对 `type: open-source` 的观察条目，“问题／改进”字段
可以为交代背景而引用具体信息，但“原则”必须完全泛化——不留客户名、
域名或可追溯到真实项目的细节。完整保密分层见
`references/skill-authoring.md`。

**修改已存在的观察条目：**重新读取该文件，只编辑你要改的 frontmatter
字段（`status`、`parked_until`、`resolved`、`resolution`），绝不批量重写
整个目录。归档就是一次普通的 `mv`。

## 引用观察条目

引用观察条目时使用其 frontmatter 中的 `id` 字段（= `NNNN-` 文件名前
缀），绝不使用 `grep -n` 的行号——那些是位置性元数据，不是标识符。
被引用的 id 必须落在 `observation-log/`、`archive/` 与 `.id-floor` 共同
界定的范围之内；远在该范围之外的 id 几乎可以肯定是把行号误读成了 id。

## 分类法（速览版）

**开源（open-source）**——与客户无关、方法论驱动、对其他从业者有用。
**内部（internal）**——含有用户／客户／项目的具体信息或个人偏好。两可
之时默认开源，剥离具体信息。这条边界同时也是保密边界，而两种错误并不
对称——误分为内部只损失触达面，误分为开源可能造成泄露——因此在真正
不确定时，先归为内部，日后再提升。完整要求（署名、许可、结构）见
`references/skill-authoring.md`。


## 提示词记录（融合自 prompt-capture · 2026-10-10）

一个全局 UserPromptSubmit 钩子把每条提交的提示词追加到
`<项目>/.prompts/<日期-项目-会话短id>.md`（每会话一文件、逐条时间戳；2026-10-10 v3 起 `.prompts` 锚定项目根——`.prompts/.root` 哨兵＋向上查找，不随会话内 shell cd 漂移，历史散落记录已归并至各项目根；2026-10-20 起（#0046）向上查找在任何含 `.prompts` 的最近一层截断——哨兵有无均可，无哨兵的容器在首次写入时补建，攀升绝不越过已有容器而在更深处另起新容器）。
它是本技能观察体系的原始证据流，与观察条目分工：提示词记录「用户说了
什么」（全量、被动），观察条目提炼「什么值得改」（信号、主动）。

**运行时与权威源**：钩子命令指向 `C:/Users/Administrator/.claude/hooks/save-prompt.js`
（ZCode 与 Claude Code 两侧 config 均已注册）；该脚本的权威源与配套的
`build-library.js`（近重复聚类＋自动标签 PRD/建模/原型/调试/工具/协作＋
生成 library.md）在本技能 `scripts/` 下。改脚本改权威源，hooks/ 是部署副本。

**降噪与脱敏**：短确认（如「继续」）与裸斜杠命令不记；sk-/gh_/bearer/
key=value/bigmodel 类令牌写入前替换。纪律与保密层级一致：.prompts/
含项目原话，外发前脱敏。

**用量报表工作流（#0009）**：何时跑——用户问提示词统计／技能用量，或
周期评审第 1 步。对每个含近期 `.prompts` 的项目目录运行
`node <技能>/scripts/build-library.js <项目目录>`——参数是**项目目录本身**，
不是 `.prompts` 子目录（缺省才落到当前目录）。脚本聚合该项目全部会话
文件，做近重复聚类并按 PRD/建模/原型/调试/工具/协作自动打标签，在该
项目 `.prompts/` 下生成/更新 `library.md`。读法：大簇＝同一请求形态反复
出现（`proposes_skill` 候选或既有技能的摩擦信号）；标签分布＝该项目
任务类型构成；终端输出的簇数/近重复数可作评审呈报的量化开头。

**观察联动（评审必做）**：周期评审交叉核对观察条目时，全文检索本周期
各会话的 .prompts/ 文件——同一请求形态反复出现＝`proposes_skill` 的
新技能候选或既有技能的摩擦信号；写观察条目时可直接引用 .prompts/
路径入 `reference:` 字段作为原始证据。

## 写入时归档

归档不是一项要在写入前记住的前置职责——它搭载在上面那个 id 推导片段
内部：计算下一个 id 的同一条命令会先用 `mv` 把已解决的文件从
`observation-log/` 移入 `observation-log/archive/`，因此清扫随每一次
id 签发而运行，除非让写入失败，否则无法跳过它。（散文形式——“每次
写入，先归档”——会欠触发：作为前置附加到另一个动作上的职责，不会
继承那个动作的任何强制力。如果某个步骤必须始终伴随某次工具调用，就把
它放进同一条命令。）定期评审同样会在其第 1 步进行归档，作为独立的
兜底。“已解决”从文件自身的 frontmatter 读取：`status: actioned`、
`declined` 或 `superseded`，**且** `resolved:` 日期早于**今天**。今天
解决的文件留到下一天，无论它们是被哪个会话解决的——宽限期活在文件
里，绝不活在会话记忆里。已解决但没有可读 `resolved:` 日期的文件不
归档，而是把今天的日期写入该字段（片段会跳过它；单独完成那一处单
字段编辑）。每次 `mv` 一个文件，不重写其他任何内容；清扫之外的批量
移动要以守恒方式验证：`references/observation-log.md`（“归档”）。

## 呈报协议

默认：在会话结束时，以分组摘要形式——改进按技能分组，新技能候选单独
列出；每项一句话加建议类型；询问对哪几项采取行动。当一条观察条目需要
用户输入才算完整、当某个技能正在持续产生错误输出、或当观察条目聚集于
一个技能时，提前呈报。

**推迟还有第二副伪装：不是承诺，而是论证**（“我们先多收集些数据”）。
在把任何“以后再说”写进建议之前，加载 `references/signals.md`（“伪装成
审慎的推迟”），并点名哪一条具体观察条目会改变决定、它何时可能到来。

**默认记录并推迟。**呈报一条观察条目不是对它采取行动的邀请：声明它已
记录、留待下次评审，然后停止。会话内应用严格保留给“处置观察条目”一节
所列的触发条件。不要例行提供“现在就应用还是留给下次评审”的二选一；
对运行定期评审的用户，这种提议是不受欢迎的摩擦，而如果用户说过他们
总是推迟，就完全不再提出。

**记录并推迟意味着这条观察条目是该变更的唯一承载者**，而把洞见应用到
眼前的工作上并不是同一个动作。让一条开放观察条目改变你在本任务中的
做法，正是日志的意义所在。把规则写到任何后续运行会读取的地方——技能
加载的状态文件（登记表、档案、配置注记）、一条提示词、一份交接文档、
一份项目指令文件——就是在处置它。测试标准：**它是否在观察日志之外
留下了持久变更？**这副伪装是一座桥——“在评审运行之前，规则总得先
住在某个地方”。确实如此，而那个地方就是观察条目；一份被搁置的副本
没有更新路径，因此当评审编辑技能时，下一次运行会把两者都读到。真正
需要指向该规则的状态文件，只得到一行注明所有者和待定变更的文字，
绝不是一个重述版本。宿主的技能保存控件是更尖锐的版本：它安装一份
副本而不是搁置一份，且可能覆盖并行评审已暂存的内容。见“处置观察
条目”。

**呈报前自检：**观察条目贯穿整个会话（包括讨论阶段）持续记录且未打断
任务；每条都遵循“问题 → 改进 → 原则”；每条都有类型；指向已有技能的
条目都点名了章节；没有任何开源条目的“原则”含可识别客户的信息；每个
文件都带 `status:` 和非空的 `siblings_checked:`（若某条缺少，现在就补
做同族检查，绝不回填 `none`）；摘要点名的每个 id 都是本次会话中某次
创建所打印、并在本轮重新列出的，绝不靠回忆。

## 处置观察条目

只在三种情境下行动：(1) 全面评审（加载 `references/weekly-review.md`）；
(2) 用户的明确请求（“更新 X 技能”、“处置观察条目 #N”）；(3) 技能正在
产生用户应当知晓的错误输出时的会话内纠正。其余情况：记录，不行动。

**结果层面的请求不是触发条件 (2)。**测试标准：明确请求必须**点名
工件**——“更新 X 技能”、“编辑技能文件”、“重新暂存它”、“处置观察
条目 #N”。只点名行为的陈述——“从现在起”、“别再做 X”、“永远做 Y”、
“把这一步纳入工作流”、“把那个从流程里去掉”——是一项以观察条目为
承载者的决定，无论听起来多紧急：面向未来的范围让推迟显得不安全，这
正是上面那座桥论证所穿的同一副伪装。含混的措辞得到一行提问，而不是
一次猜测，因为错误的猜测是一件未经请求、还要人评审的工件；记录 →
评审 → 暂存 → 安装 永远获胜。

**宿主自带的技能提案或技能保存控件是安装路径，不是暂存路径。**当环境
提供从对话内部保存或提议技能的功能时——其工具描述很可能声称技能
变更就是这样交付的——该控件写入的是已安装副本；它不会在
`skill-updates/` 下产出任何东西。绝不要在以该目录为暂存区的工作区里
使用它。并且在任何会话内技能变更之前，检查暂存清单
（`skill-updates/PENDING.md`）和今天的 `skill-updates/<date>/` 是否已有
同一技能：并行运行的评审可能已经暂存了它，且建立在活文件加其他变更
之上。在那之上安装对话侧副本会丢弃那些变更，而之后再安装评审的副本
又会悄悄回退控件装上的那份——在另一个会话暂存同一工件时抄近道，
会把一条一行的规则变成用户不得不亲自察觉的合并冲突。

**在处置、驳回、修复或引用之前先读完整正文**——标题是索引项，不是
内容。**不是你做的变更要逐点解决观察条目，绝不拿标题对标题：**列出
正文提出的各点，点名覆盖每一点的修复行，任何没有对应行的点都留在
一条承载条目上保持开放。在任何处置、驳回或引用步骤之前，加载
`references/observation-log.md`（“在处置、驳回、修复或引用之前先读完整
正文”）。

行动时：小的、明确增量的、低风险的变更（一条新规则、一处澄清、一个
事实性修复）可以不等下次评审就应用——“直接”的意思是*现在*，而不是
*就地*：在每一个环境和每一个情境中，编辑仍然是在基于对活文件的全新
读取所做的暂存副本上进行，并交给用户安装。仅暂存没有交互式例外；一个
要用户记住的例外，就是一扇迟早被忘关的闸门。重大变更（重构、新能力、
方法论变更）以及所有新技能创建：先加载 `references/skill-authoring.md`
并遵循其编辑与暂存规则。适用于技能整体的原则进入横切原则文件（同一
参考文件）。

**在你行动的同一轮设置状态。**会话内处置过的观察条目必须在轮次结束
前更新其 frontmatter——`status: actioned`、`resolved: YYYY-MM-DD`、
`resolution: what was done, and where it now lives`——。工作与记账是
两个动作，而被丢掉的总是第二个；一条陈旧的 `open` 条目随后会诱使人在
一个早已前行的章节上重做已完成的工作。写入即强制，与记录时完全一致。
**“已处置”包括以普通工作形式落地的修复**——规则被写进了指令文件、
代码被改正——当时并未想着这条观察条目；而后来的会话发现补救已经
就位时，也以同样方式关闭该条目。两者看起来都不像是在处置观察条目，
这正是两者都被漏掉的原因（在第一次评审中实测：27 条里有 10 条在保持
`open` 的状态下早已被应用）。

**只处置了一条多技能观察条目 `skill:` 列表的子集？**两种简单标记都不
诚实——留作 `open`，已完成的部分会被另一个会话重新应用；标成
`actioned`，未完成的部分会悄悄离开此后每一个队列。使用承载条目模式：
把该观察条目标为 `actioned`，并在 `resolution:` 中点名已应用的部分，
然后记录一条承载条目持有剩余部分，其 `skill:` 列表只含未完成的技能。
完整流程见 `references/observation-log.md`。

## 关于本技能的反馈

如果用户有方法论反馈，主动提出为
github.com/rebelytics/one-skill-to-rule-them-all 起草一份报告，先运行
`references/skill-authoring.md` 中的反馈预检；如果问题出在代理没有遵守
技能的规则，则改为承认并纠正它。

## 速查表

| 问题 | 答案 |
|----------|--------|
| 我何时观察？ | 整个会话，包括反馈与复盘阶段 |
| 我如何记录？ | 立即记录，不打断用户的任务，每条观察条目一个文件，命名为 `NNNN-slug.md`；id = max(active, archive, `.id-floor`) + 1，通过在每次写入前立即运行代码片段推导——出于任何其他目的更早读过日志都不能替代它；在能运行辅助脚本的地方，`bash scripts/new-observation.sh <slug>` 是唯一的写入路径 |
| 状态字段？ | 每条新观察条目都必须有 `status: open` 的 frontmatter；评审把缺失状态当作 OPEN，绝不当作不存在。五个取值：`open`、`actioned`、`declined`、`superseded`、`parked`——`parked` = 已决定但被外部前提条件阻塞，因此它离开队列、要求 `parked_until:`、且永不归档 |
| 目标技能有同族技能吗？ | 写入**之前**先对照 `skill-observations/skill-families.md` 解析；把洞见适用的每个同族技能加进 `skill:`，并把裁定记录在必填的 `siblings_checked:` 字段中——包括“已检查，不传播” |
| 扫描或查询返回为空？ | 两种可能，只有一种算发现：为每个旨在防止重复工作的检索加一道独立存在性检查的防线，并把对已知内容的空输出当作一条损坏的命令 |
| 小修复还是重大变更？ | 增量 → 直接应用；重构／新技能 → `references/skill-authoring.md` |
| 同一规则违反了两次？ | 修复必须是结构屏障（钩子、lint、默认值）——绝不是第三次改写措辞 |
| 修改观察条目（状态／归档）？ | 重新读取该文件，只编辑其 frontmatter，或把它 `mv` 到 `observation-log/archive/`——不重写共享文件 |

Task Observer: Eoghan Henn and contributors | CC BY 4.0
