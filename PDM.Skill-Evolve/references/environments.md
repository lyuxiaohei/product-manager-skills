# 环境、激活设置与交接文档模式

遇到设置问题、压缩/恢复行为问题，或在没有文件系统访问权的环境中运行时，
加载本文件。

## 目录

- 推荐的激活设置
  - 激活块
  - 工作区锚定
  - 会话启动钩子（Claude Code 及类似宿主）
  - 停止钩子——作为宿主事件的逐任务兜底
  - 在新会话中验证激活——安装会话自身无法证明
  - 激活配置——迟到、间歇性，以及守卫为何不能内置于其中
  - 探针搭载在首个批量调用之内
  - 安装布局风险——技能悄然失效的三种方式
  - 两种阻断协议而非破坏协议的宿主行为
  - 若 CLAUDE.md（或等效配置）受治理保护
  - 第三类拒绝：自动内容分类器
  - 委托出去的设置步骤，未经亲自观察不算完成
  - 跨边界交接的路径要从远端解析
  - Windows 宿主：什么会到达 shell 与文件
- 环境映射
- Git 作为可选的暂存介质
- Claude Code Projects——一次性线程、无本地技能、无固定路径
  （依据平台文档，尚未经实地检验）
- 输出通道归调用方所有的会话
- 首次运行回填
- 存储体制
- 包清单
- 压缩行为
- 面向用户的文档
- 仓库/维护者会话——写入前验证提交身份
- 交接文档模式（无持久存储）
- 交接文档分析（收到时）

## 推荐的激活设置

激活层级共有四层，只有最强的一层是被强制执行的。要明知而选；不要以为居中
的任何一层是保证。

1. **描述匹配**（最弱）。技能 frontmatter 里的 description 与所有其他技能的
   description 一起，围绕与开场消息的相关性竞争。它最常在以下情形落败：
   简短的、读起来像提问的工具型请求（"列出这个仓库里的文件"）；以一个小而
   范围明确的请求开场、随后不断生长的会话；以及任何领域技能与开场消息高度
   匹配的时候——与主题匹配的技能曾在常载技能被跳过的同一回合内完成加载。
   在没有钩子机制的平台上，这是唯一能在配置文件未挂载或不可达时幸存的层级，
   这正是 description 本身携带会话启动触发条件的原因。
2. **用户级偏好**（与文件夹无关，仍是概率性的）。由用户控制、注入每个会话
   系统提示的代理设置，无论连接了哪个文件夹、甚至没有连接任何文件夹
   （Cowork 中是应用设置里的 personal-preferences 字段；其他代理的等价物）。
   这里是一行式"先探针后请求"触发条件的正确归宿——"会话的第一次工具调用是
   一个批量调用，其中包含对工作区路径的一次 `ls` 以及对<会话启动技能，按
   名称：task-observer、……>的加载；若 `ls` 失败，调用文件夹选择器工具；
   未经该探针，绝不陈述文件夹是否已连接"（措辞为何关乎调用的内容而非顺序：
   见下文"探针搭载在首个批量调用之内"）——因为工作区文件夹内的配置文件
   恰恰在它所针对的情形下无法生效：没有文件夹连接时，配置文件根本不存在。
   请用一个无文件夹的会话逐字引用其偏好块，以此对该通道做一次验证；一行
   到不了代理手里的文字算不上一个层级。
3. **配置指令**（更好，仍是概率性的）。一个 CLAUDE.md 或项目指令块，如下
   所示。经验上，它与层级 1 在相同条件下可被跳过；且当它所在的文件不在
   上下文中时（未挂载工作区文件夹、会话在项目之外启动），它会悄然缺席。
   未挂载的工作区是可恢复的，不是终局：在环境提供文件夹选择器工具的地方
   （Cowork 的 `request_cowork_directory`），文件夹仍可应请求在会话中途
   挂载，而会话启动协议（Session Start Protocol）应在挂载完成的那一刻运行
   ——只有挂载之前的那部分会话丢了。要尽早询问，但不要把一次被拒绝或被
   跳过的文件夹选择当作不可逆。如果工具面中存在 `allow_cowork_file_delete`
   或类似的本地文件系统权限工具，说明会话运行在用户的机器上、配置可达；
   在工具面经过盘点之前，把"本会话运行在云端，所以配置没有被加载"当作
   未验证的说法——反方向也一样对待：一个声称已选择文件夹的环境标志只是
   提示，同一回合内对路径的探针才是证据。
4. **宿主钩子**（唯一被强制的选项）。一个会话启动钩子，在每个会话把指令
   ——理想情况下还有日志状态——注入上下文，例如 Claude Code 的
   `SessionStart` 钩子返回 `hookSpecificOutput.additionalContext`。即便是
   钩子也只能注入一段提示；是否调用技能仍是模型的决策。Cowork 没有钩子
   机制；在那里，层级 1 到 3 就是全部。

**触发条件要用机械的方式表述，不要诉诸判断。**"面向任务的会话"要求代理在
第一个回合、在它尚不知道会话将如何展开之前就给会话分类，于是简短的、貌似
事实性的请求被分类出局。下面的块改为以工具使用为准：任何将涉及工具调用的
回合都算。而且激活必须先于*规划*，而不只是先于执行——在工作流先提出计划
等待批准的地方，一份未加载相关技能就写下的计划会把未经斟酌的决策带过评审
关卡，而批准会把它们锁死。在探索、研究或起草计划之前加载技能：两者皆然，
技能在先。

**这个块有按会话计的成本，要明知地支付。**它覆盖的每个会话都会完整加载
SKILL.md（由其 frontmatter 中的 `core_max_lines` 约束；references 按需
加载）并运行会话启动协议，无论该会话是否记录任何东西。收窄这一范围是采纳
者自己的取舍，做在采纳者自己的配置里，绝不是代理对开场消息的判断。收窄后
的规则必须携带再触发条件，否则它恰好在覆盖要紧之处失去覆盖：*若被跳过的
会话演变为多步工作，或用户纠正你的工作方式，就在那一刻、在下一次写入之前
调用技能。*

**按决策选择，不按产物选择。**选择与加载是两个分离的步骤，而选择步骤有它
自己的失败方式：它是针对用户交来的东西——要读的文件、一个链接、一张
截图——运行的，所以每当请求的表面形态是一项没有任何技能认领的活动时，
所有 description 点名某个*主题*的技能都会被漏掉。在回答之前，先说出用户
正在做的决策（DECISION），并拿已安装的 description 与之匹配（"交付物是
关于 X 的建议"→ 加载 description 点名 X 的技能），哪怕请求是以一份待评审
文档的形式到来的。高风险形态是附件加一个开放问题——"这里有两个文件，
你怎么看？"——它表现为阅读任务，把自己的领域藏了起来；据观察，这样的
会话带着未加载的领域技能连跑四个实质回合的领域建议，而会话启动技能倒是
正确加载了。这正是它区别于激活配置失败之处：机制正常工作，却仍选错了
集合。这种失败在构造上就是静默的，因为一个从未加载的技能无法宣告自己曾经
相关，所以这项检查属于核对清单，而不属于处置环节。

### 激活块

```text
Before the first tool call of any session — and before writing or
proposing a plan, not merely before executing one — invoke the
task-observer skill AND execute its Session Start Protocol (storage
check, frontmatter scan, review trigger). Loading the skill and running
the protocol are separate steps; a session that loads the file and stops
has activated nothing. Any turn that will involve a tool call counts; do
not classify the session as "too simple" from its opening message.

Select skills on the DECISION the request is about, not on the artefact it
arrived as. Name what the user is deciding, then match the installed skill
descriptions against that — a request handed over as a file to review
still needs the skill whose description names its subject.

After completing each task, list the observation records written this
session in the same turn and report a one-line summary from that listing
(ids and titles, or "none logged and why") — never from memory of
writing them. This is the activation backstop: it forces a look at the log,
so a session that silently skipped the protocol is discovered at the
first task boundary instead of never.

Loading a skill is not complete until you have queried the observation
log for OPEN observations naming it and read their bodies:
  find "C:/Users/Administrator/.zcode/skill-observations/observation-log" -maxdepth 1 \
    -name '*.md' -exec grep -l "skill:.*<skill-name>" {} +
(<skill-name> is the bare name: drop a plugin: prefix, up to the last
colon. A qualified pattern misses every entry filed under the bare name
and reports a clean zero; the bare one matches both spellings.)
(Use find, not a bare *.md glob. Under zsh an unmatched glob is an error,
so on an empty log the command never runs and the enclosing block aborts —
and 2>/dev/null does not help, because the redirection belongs to a
command that never starts. This is the first thing that fires on a fresh
install, in every session, for as long as the log is empty.)
Apply their insights to the current work — meaning: let them change what
you do in THIS task. Editing the skill file, or writing the rule into any
other file a later session reads, is acting on the observation and waits
for the review. See "Log, don't act" in SKILL.md: the test is whether the
action leaves a durable change outside the observation log. Run this at every skill load, however many skills load
in one session. The session-start scan does not cover it: that is a
frontmatter sweep over every observation at session start, this is a
body-level lookup for one skill at the moment its rules are applied.

The converse holds too: the grep, and any checkpoint line recording the
load, run only in the same batch as the Skill invocation, and take the
skill name from a load that has actually happened — never from a list of
skills you built to load. A checkpoint line written without the load is a
false record. Before writing to any file a skill reads at run time (a
state file), load that skill: a state file that describes itself is not a
substitute for the skill that owns it.

Where scripts run, the lookup and its checkpoint line are one command:
  bash "<skill directory>/scripts/skill-load.sh" "C:/Users/Administrator/.zcode" <skill-name>
The Skill invocation and that call are ONE batch — emit them together,
one call per skill loaded, never the call in a later batch.

The task-observer workspace for this project is:
  C:/Users/Administrator/.zcode
Every path the skill uses derives from that root and nothing else:
  C:/Users/Administrator/.zcode/skill-observations/observation-log/   (the log)
  C:/Users/Administrator/.zcode/skill-observations/cross-cutting-principles.md
  C:/Users/Administrator/.zcode/skill-updates/                        (staging root)
  C:/Users/Administrator/.zcode/skill-updates/PENDING.md              (staging manifest)
Never resolve any of them from the current working
directory — a cwd inside an ephemeral checkout (a git worktree, a temporary
clone) is torn down and takes the log with it. Never place the workspace
inside a skills-discovery directory or any path linked into one. If this
environment mints a separate project identity per checkout, or more than
one agent works this project, the pinned path above is the single shared
location; do not derive one per session, tool or project.

The user's repositories live under:
  [PROJECTS ROOT]
(the root the sibling check sweeps before declaring a skill absent;
observation-log.md, "Skill families and the sibling check").

A subagent dispatched by a session that already runs this protocol does
not run it again and does not write to the log. The controller observes,
because only it sees the whole task and its review; a subagent that
notices something worth logging says so in its final report, and the
controller writes it, running the id snippet per write. A start-up rule
in a project file reaches every agent the project ever dispatches.

An observation file comes into being only through
  bash "<skill directory>/scripts/new-observation.sh" <slug> "C:/Users/Administrator/.zcode"
which prints the path to write into. Never by copying another file's
header or counting a listing — including on the turn after a
compaction, when the skill body is out of context.
```

`<skill directory>` 是所安装技能自身的目录（即持有 `SKILL.md` 的那个），
在安装时与 `C:/Users/Administrator/.zcode` 一样被替换；在宿主无法运行脚本的地方，删去
两段脚本段落、保留其余——此时 SKILL.md 里的内联 id 代码片段就是写入路径，
上面的 `find … grep` 就是查询路径，其检查点行由人工在同一批次中写下。

### 工作区锚定

SKILL.md 的 `[workspace folder]` 定义陈述了规则；本节讲的是把它固定在
哪里、一个稳定的锚点如何仍会走向多份、以及哪一种多份情形是正当的。

安装时填入路径。固定把锚定变成一次性决策，而不是代理每个会话都要重新
争辩、且每次都有新机会出错的决策。固定根（ROOT），并列出派生路径：一个
只点名观察日志目录的固定——脑裂最早被注意到的地方——会把暂存根、清单和
原则文件留给每个会话去重新推导，并行会话会各自言之成理却互不相同地解析
它们（据观察：两个会话把暂存内容放在日志旁边的
`skill-observations/skill-updates/` 之下，而第三个放在根部的
`skill-updates/` 之下——三个写入者、两个暂存根、一份只看到一半工作的
清单）。让工作区的范围与被观察的对象相称：全局安装的技能是从每个项目被
观察的，所以它们的日志必须是跨项目、跨工具共享的一个绝对路径——按项目
或按工具的工作区会把关于全局技能的观察条目散落到用户接触的每个项目，而
在其中一个项目里运行的评审永远看不到其余的。在环境于项目身份之下提供
受管持久化目录（每个会话都加载的记忆目录）的地方，该目录与身份根都算
"稳定"；存在受管目录时锚定在受管目录之内，否则锚定在身份根上——绝不
同时锚定两者。

**范围与安装范围相称。**以用户级或全局范围安装的技能是从每个项目被观察
的，所以它们的日志是一条被每个项目、工具和代理共享的用户级路径；按项目
锚定只对存在于单一项目中的技能是对的。稳定的锚点仍可能是多份的——在
Claude Code 中，身份派生自会话启动时所在的目录，于是按子文件夹的习惯
会把日志分片成若干个各自看起来都像唯一锚点的稳定锚点。在安装时一次性
决定范围，并固定下来。**有一种多份情形是正当的、不是分片：**有意分开
保管的日志，因为其观察条目正文携带不随任务迁移的任务上下文，而其对应的
技能却仍全局安装、因而共享。在合并任何东西之前先读 `weekly-review.md`
的多日志块——它定义了那种情形以及服务于它的汇总评审。在这个段落就停下
的读者，会把一套本应保持分离的日志合并掉。

**通常表述的分叉规则描述的是无害情形。**"在已有内容的日志旁边出现的
第二个**空**日志是静默分叉"——但空日志会自我暴露：第一次扫描一无所获，
没人相信零积压。有破坏性的分叉是已经积累了自身条目的那个。从它内部看去，
它与一个正常工作的日志一模一样：扫描返回文件、评审找到工作、每个仪表都
报告健康。它内部没有任何东西能揭示自己是一个分片。

而且固定并不能了结这件事。据观察：一个固定在已接线的会话启动钩子里的
工作区，配置正确，与第二个已有内容的工作区并行运行了三天并产生相互冲突
的 id。固定约束的是读到它的那些会话；对一个在固定生效之前、或经由其他
途径解析了自己锚点的会话，它无能为力。

因此检测必须是主动的，而且它几乎免费：会话启动扫描结束时，代理手里已经
握着每个条目的 `skill:` 值。一个其目标绝大多数是**用户级**技能、而日志
本身却坐落在**按项目**路径之下的日志，已经自行宣告了这种错配——两次
`ls` 加一次比较。当锚点是按项目而目标不是时，就运行它；报告候选分片，
而不是凭自己的判断去合并，因为有一种多份情形是正当的（见
`weekly-review.md` 的多日志块）。

**会话启动扫描每次运行都会列出邻居。**扫描（`scripts/session-start-scan.sh`）
的一行会在固定根的父目录下至多三层内找出每个
`skill-observations/observation-log/`，并连同其文件数逐个打印——
`logs under the parent (…): /a/proj=157  /a/other=19`。一条记录是寻常
情形。多条要么是分片、要么是正当的多份情形，而这一行无法区分：用一行
报告它，转往 `weekly-review.md` 的"一台机器上的多个观察日志"，绝不要凭
扫描结果直接合并。该探针以父目录的三层深度树为界，而不以任何日志的大小
为界；输出为空行意味着探针读不了父目录，因为被固定的日志本身总在它
之下。

**创建日志之前，先搜一个出来。**检查所有合理的锚点候选——固定路径、
项目身份根、环境受管的持久化目录、共享文件夹、另一个代理的等价物——看
是否已存在 `skill-observations/` 工作区。"固定路径"不止一个来源：指令
文件，以及任何已注册的会话启动钩子。在宿主设置和已安装插件的钩子清单中
grep 技能名，然后读出每个钩子脚本推导出的路径——一个在别处统计观察条目
的钩子就是一次固定，无论指令文件是否点名它（据观察：指令文件里没有固定，
一个用户级钩子从主目录推导出工作区，探针只查了文档记载的默认位置，在
真正的工作区建立十五分钟后创建了第二个工作区；钩子继续在原处计数，于是
写到新路径的每条观察条目对它都不可见）。在一个系统已经在读或写状态的地方，
那个位置是权威的，文档记载的默认位置只是后备；只对默认位置做存在性探针，
会为每一个偏离默认的安装报告"未找到"。在钩子或配置点名另一个根时，绝不
要创建工作区：先对账。每个始终加载的指令文件都是一个固定来源（一份
CLAUDE.md 和一份为另一个代理工具分叉出的 AGENTS.md 就是两个）：对每一个
grep 工作区根。两个不同的根是分叉，不是变体：停下来、先对账再写入，并把
固定保留在两个工具都加载的同一个文件里。如果已存在，就采纳它，或与用户
有意地合并。在已有内容的日志旁边新建一个空日志是静默分叉：两者独立生长、
id 冲突、每个会话只看到一半历史。合并一个分片是机械操作：只搬运仍为
`open` 的条目——它已 `actioned` 的条目会作为重复项重新导入，而目标日志
可能也持有那些工作——从目标日志自己的计数器逐个重新签发 id（用代码片段，
一次一写，绝不预计算区间），把每个来源条目标记为 `actioned` 并附上点名
目标 id 的处置说明，然后在被弃用的位置留下一个指针文件，让锚定在那里的
会话被重定向，而不是重新制造分叉。

**重新锚定移动的是根，而不只是日志。**会话启动第 1 步的"临时转稳定"
重新锚定与分片合并，要搬迁固定所辖的每一件产物（上面激活块中列出的派生
路径），而不只搬迁日志：`skill-updates/` 连同 `PENDING.md` 与每个带日期的
暂存目录、`cross-cutting-principles.md` 与 `skill-families.md`（目标处
已有自己的版本时按实质合并）、`last-review-date.txt`（保留较晚的日期）、
`starter-principles-reviewed.txt`（保留较新的版本），以及作为历史的
`reviews/` 与 `checkpoints.log`。第 6 步只读当前根下的 `skill-updates/`，
于是留在旧根下的暂存工作不可见，而缺失的 `PENDING.md` 会被读作"没有
暂存"（据观察：数轮暂存更新在被弃用的根下搁置多日无人落地，只在一次无关
的文件系统清查中才浮出水面）。把暂存目录整体搬迁；在新根处它们像任何
其他条目一样经过暂存对账（`weekly-review.md`，"暂存工作对账闸门"）。在
搬迁不安全的地方——可能仍有会话在旧根写入——用一行向用户列明旧根的
`skill-updates/` 里有什么，而不是悄悄把它丢在身后。

**回报模式——当任何固定路径都解析不出来。**当解析出的工作区坐落在临时
检出之下时，会话启动守卫会告警并重新锚定。这假定了存在一个可供重新锚定的
稳定路径。在一次性工作者中——一个 Claude Code Projects 线程、任何一个
唯一可写位置是"任务结束即被拆除的克隆"的代理——不存在这样的路径，而硬
往克隆里写只会产生随它一起消失的观察条目，同时每次写入都报告成功。所以
该分支是：不要写进克隆；把每条观察条目完整地放进交给工作协调方的最终
报告里，或通过 PR 提交到一个专门的观察仓库，并在报告中说明走了哪条路线。
安装、激活与日志路由的后果见下文"Claude Code Projects"。

**授权只点名路径，不创建路径。**在写白名单沙盒下（Claude Code 带
`sandbox.filesystem.allowWrite` 的 Bash 沙盒，或任何只把白名单内路径挂载为
可写的宿主），白名单内的路径只有在已存在时才能被挂载为可写；而当它的父
目录在白名单之外时，沙盒内没有任何东西能创建它：对日志的第一次
`mkdir -p` 以 `Read-only file system` 失败，尽管授权在场且正确（据观察：
`~/.claude` 下的用户级工作区，`skill-observations` 与 `skill-updates`
都在白名单内，创建仍被拒绝，直到一个在沙盒外运行的设置脚本建好了这两个
目录）。在这样的宿主中，授权与路径的存在是两个安装前提：在安装时、从沙盒
之外——由用户或某个安装步骤——创建工作区根的 `skill-observations/` 与
暂存根 `skill-updates/`，然后才依赖会话去创建其下的所有东西。文件夹
选择器和"失败写入仅重试一次"规则在这里帮不上忙：同一沙盒内的每个接口
看到的都是同一个只读挂载。失败时刻的诊断见 `observation-log.md`
（"工作区创建"）。

**配置探测（每会话一次）：**在具备文件系统访问权时，检查工作区根的
CLAUDE.md（或等价物）是否有 task-observer 激活指令——若没有，建议添加。
**只建议，不代建。**若配置文件根本不存在，提议新建一个并让用户点头：
创建一个被版本跟踪的项目文件会改变此后每个会话的行为，而下文的受治理
保护后备方案之所以存在，正是因为写共享配置不是一个无代价的动作。
SKILL.md 第 4 步说的是"建议"，而这两处会被顺序阅读，所以它们绝不能互相
矛盾。在没有文件系统访问权时，检查系统提示/项目指令，并建议用户把指令
加在那里。建议控制在一两句话。上面的块就是用来传播的产物：整体地建议它，
包括锚定段，因为只住在 SKILL.md 里的约束，会在它们本该约束的决策之后
才到达。

**加载不是激活。**块的措辞所防的失败，来自真实使用的报告：代理按配置
指令加载了技能，然后停下——会话启动协议（日志文件、扫描、评审触发条件）
从未运行，也没有任何东西让这一遗漏浮出水面，因为"已加载但不作为"的技能
在用户看来与激活的技能一模一样。只有当用户明确问"你执行会话启动协议了
吗？"它才动起来。因此有了上面两条保险：指令按名称要求协议，而不只是加载；
任务后总结行让静默的不作为在第一个任务边界处可见。如果只采纳块中的一行，
就采纳任务后检查——实地使用中，它把一个间歇性激活的安装变成了稳定记录的
安装。

那道检查是与它所守护的规则同处一个文件的散文，因而与规则一同失败：凡是
让会话跳过块第一段的因素，也会让它跳过第三段（据观察：两个已配置层级
均已触发、七个任务边界、上百次工具调用，协议与兜底都没运行，直到会话
中途另一个模型读了同一个块才激活）。写在它所守护规则的同一介质里的兜底
是一层，不是两层。第二层必须挂在宿主抛出的事件上，而不是挂在代理重读
指令上：在宿主提供停止或回合结束钩子的地方，客观检查很便宜——会话用过
工具，且它启动以来 `observation-log/` 或 `checkpoints.log` 之下没有任何
写入——就阻断一次，附一行指令，其余时候保持沉默。按每层强制机制运转
所需之物来给它分类：一次文件系统写入在任何会话类型中都能存续，一段散文
提醒只在散文正被遵行时才存续。

第三条保险在协议自身之内：它的扫描向 `checkpoints.log` 追加一行带日期的
记录（SKILL.md，会话启动协议第 2 步），于是协议留下自己的痕迹，跳过它的
会话在事后可被检测，而不是只在当下被察觉。这就是上面诊断缺失的另一半
——加载在转录记录中产出可见产物，而协议什么都不产出，于是"加载过技能"
的感觉顶替了"做过技能所要求之事"。把*已加载但未运行*当作一个独立的失败
原因，与技能缺席、被截断、在场却被跳过并列：它是四者中最可能的一个，
恰恰因为加载那可见的成功顶替了协议那不可见的缺席，而加重条件与产生跳过
加载的条件是同一个——一条小到让完整启动协议显得与它不相称的开场消息。

**反模式：**不要经由另一个技能链式激活——从配置独立加载 task-observer
与相关技能；断掉的链会让一切观察活动静默。写进项目文件的启动规则会到达
项目派出的每个代理，所以除非上面的块拦住工作者，控制器与其工作者就是
同一日志的并发写入者。

### 会话启动钩子（Claude Code 及类似宿主）

捕获由挂在工具调用上的检查点硬性强制；会话启动协议中的评审触发条件是个
软步骤——读一个文件、比较一个日期——它被跳过的方式与激活被跳过的方式
相同。这种失败会自我隐藏：捕获持续产出、日志看起来健康且在增长，而记录
这次遗漏的唯一产物是一个内容为 `never` 却无人去读的文件。把"评审触发
条件是否被结构性强制？"当作一项安装完整性检查；在宿主提供会话启动钩子的
地方，让钩子算好状态并注入，而不是让代理跑去看：

```bash
#!/bin/sh
# SessionStart hook: inject activation + review state as additionalContext.
d="$OBS_WORKSPACE/skill-observations"      # the pinned absolute path
open=$(find "$d/observation-log" -maxdepth 1 -name '*.md' -exec grep -l '^status: open$' {} + 2>/dev/null | wc -l | tr -d ' ')
last=$(cat "$d/last-review-date.txt" 2>/dev/null || echo never)
msg="Invoke the task-observer skill before the first tool call. Observation files are created only by scripts/new-observation.sh in the skill directory, never by copying a header."
if [ "$open" -gt 0 ]; then
  msg="$msg $open open observations; last review: $last."
  cutoff=$(date -d '7 days ago' +%F 2>/dev/null || date -v-7d +%F)   # GNU, then BSD/macOS
  case "$last" in
    (never) msg="$msg Offer the review." ;;
    (*) [ "$(printf '%s\n%s\n' "$last" "$cutoff" | sort | head -1)" = "$last" ] && msg="$msg Offer the review." ;;
  esac
fi
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$msg"
```

在原生 Windows 上，Claude Code 通过 Git Bash 运行钩子命令，在那里光秃秃的
`bash` 或 `python` 可能解析到 WSL 的 `System32\bash.exe` 或 `WindowsApps`
之下的 Microsoft Store 占位程序，两者都跑不了钩子。注册钩子时使用解释器的
完整路径（对 Python，`py -0p` 列出真实安装；跳过任何 `WindowsApps`
路径）。

计数针对 `status` 字段读作 `open` 的文件——不是目录里的文件数。已解决的
条目有意在 `observation-log/` 里留到被解决后的第二天（宽限期住在文件里，
不住在会话记忆里），而已停放的条目已有定论、出了工作队列，所以原始文件数
会在整整一天里、在每个会话中，把上次评审刚关闭的每条条目都多算进积压。在
`[ ]` 里比较日期不要用 `<`：ISO 日期按字典序排序，所以
`[ "$(printf '%s\n%s\n' "$last" "$cutoff" | sort | head -1)" = "$last" ]`
在 `$last` 不晚于 `$cutoff` 时为真，在任何 POSIX shell 中皆然（`\<` 是
bash/ksh 的扩展，zsh 拒绝它，`sh` 不认识它）。自己写一个时有两个要紧
细节：`grep -c` 在零匹配时退出码为 1 却仍打印 `0`，所以
`$(grep -c … || echo 0)` 会产出两个值——捕获输出、忽略退出码；并通过对
`never`、过期 30 天与过期 2 天的三组夹具运行钩子来证明提醒分支会触发，并
确认第三组保持沉默。从不响的提醒与该沉默时正确沉默的提醒，在一次通过的
运行看来一模一样。

### 停止钩子——作为宿主事件的逐任务兜底

激活块里的逐任务兜底是与它所守护规则同处一个文件的散文，因而与规则一同
失败：跳过了协议的会话，在每个任务边界也跳过了兜底。在宿主有停止事件的
地方，把检查改到那里运行：*本会话用过工具吗？它启动以来 `observation-log/`
或 `checkpoints.log` 之下有任何写入吗？*若没有，每会话阻断一次停止并附
一行指令；对纯对话、对已写入的会话、对连续第二次阻断、以及日志读不了的
时候，保持沉默。Node 编写，无依赖；`C:/Users/Administrator/.zcode` 与他处一样替换：

```js
// Stop hook: the per-task backstop as a harness event instead of prose.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const MIN_TOOL_USES = 3; // below this the turn is conversation, not work
const base = path.join('C:/Users/Administrator/.zcode', 'skill-observations'); // the pinned workspace
const block = (reason) => { fs.writeFileSync(marker, new Date().toISOString()); console.log(JSON.stringify({ decision: 'block', reason })); process.exit(0); };

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
if (input.stop_hook_active) process.exit(0);            // never chain a second block
const session = String(input.session_id || '').replace(/[^A-Za-z0-9_-]/g, '');
const transcript = input.transcript_path;
if (!session || !transcript) process.exit(0);

const marker = path.join(os.tmpdir(), `task-observer-backstop-${session}`);
if (fs.existsSync(marker)) process.exit(0);             // once per session

let started = 0, toolUses;
try {
  const st = fs.statSync(transcript), text = fs.readFileSync(transcript, 'utf8');
  toolUses = (text.match(/"type":\s*"tool_use"/g) || []).length;
  // Birth time is 0 where the filesystem has none and equals ctime where the
  // platform substitutes it; either would make every file read as untouched
  // or touched. Fall back to the transcript's first timestamp.
  if (st.birthtimeMs > 0 && st.birthtimeMs < st.ctimeMs) started = st.birthtimeMs;
  else { const m = text.match(/"timestamp":\s*"([^"]+)"/); if (m) started = Date.parse(m[1]) || 0; }
} catch { process.exit(0); }
if (toolUses < MIN_TOOL_USES) process.exit(0);

if (!(started > 0)) block('task-observer backstop: cannot tell when this session started (no birth time, no ' +
  'transcript timestamp), so it cannot check the log. Check by hand that this session wrote an observation ' +
  'or a checkpoints.log line, and report the one-line summary. Fires once per session.');

const files = [path.join(base, 'checkpoints.log')];
try {
  for (const n of fs.readdirSync(path.join(base, 'observation-log')))
    if (n.endsWith('.md')) files.push(path.join(base, 'observation-log', n));
} catch { process.exit(0); }                             // unreachable log: stay silent
const touched = files.some((f) => { try { return fs.statSync(f).mtimeMs > started; } catch { return false; } });
if (touched) process.exit(0);

block('task-observer backstop: this session used tools but wrote no observation file and no checkpoint line. ' +
  'If the skill was never invoked, invoke it now; then write pending observations or append a ' +
  '"no observations" line to checkpoints.log, and report the one-line summary. Fires once per session.');
```

**会话的启动时间是脆弱的输入。**在不记录创建时间的文件系统上，转录记录的
创建时间为 `0`，而某些平台会以变更时间顶替，后者随每次追加而移动；两者都
让比较失去意义，且前者让钩子永久沉默。所以只有当创建时间非零且早于变更
时间时它才作数；否则钩子读取转录记录中的第一个 `"timestamp"`；在两者都不
存在的地方，它阻断一次并请求人工检查，而不是陷入沉默。

它的已知局限：它比较的是修改时间，所以并行会话向同一日志的写入会被读作
本会话的写入（漏一次阻断，绝不误阻断）；它只对主代理触发，所以按激活块
本就不写任何东西的子代理永不会被阻断，而那种"为输出通道归调用方所有的
子代理运行该钩子"的宿主绝不能把它接在那里（"输出通道归调用方所有的
会话"）；并且与一切触发条件一样，只有匹配过真实事件之后它才算上了膛
——先拿一份有工具调用而无写入的转录记录运行它，再拿同一份追加了检查点
行、且转录记录在那之后又追加过的来运行（从变更时间读取启动时间的实现会
拦下那一种），然后才相信任一结果。

### 在新会话中验证激活——安装会话自身无法证明

配置文件在会话启动时读取，所以会话中途写下的指令只在下一个会话生效；而
在会热加载新装技能的宿主里，安装后技能立刻可调用并不能证明激活——那是
手工调用的。于是安装会话看到一切通过（包完整、技能在列、协议已跑、钩子
输出合法 JSON），而唯一要紧的东西未经测试，诱人的收尾是"已安装并测试"。
在新会话被看到自行调用该技能之前，把安装报告为**激活未验证**，并点名检查
内容：在下一个会话里、做任何工作之前，确认技能被调用过（而不只是在列）
且会话启动协议运行过——以调用的证据验证，而不是以手工调用也会产生的
副作用验证。若环境没有从安装会话另起新会话的办法（纯 GUI 宿主、无 CLI），
就把这项检查作为用户下一个会话的第一项交还给用户；一个无法验证的步骤
绝不能默默以"已测试"收场。

运行时无法诊断自身的缺席——会话启动第 4 步只有在激活已经成功之后才会
运行——所以能抓住被跳过安装步骤的是外部诊断：**若经过几个使用工具干活
的会话后 `skill-observations/observation-log/` 仍不存在，激活从未发生**；
检查配置中的激活块，或安装钩子。README 为从不读本文件的用户携带了同一
条诊断。

### 激活配置——迟到、间歇性，以及守卫为何不能内置于其中

SKILL.md 第 1 步携带该指令（第 1 回合直接加载会话启动技能，而不是假定
配置已加载；若挂载解析成功但其内容不在上下文中，则亲自去读配置）。这里是
它背后的推理，也是该指令只作为后备的原因。

在某些托管或桥接的会话类型中，激活配置——项目指令文件、会话启动钩子的
上下文——直到**第二个**用户回合才到达上下文，而它所在的工作区早已挂载
且探针干净。从第 1 回合内部看，一个仅仅迟到的配置与一个缺席的配置无法
区分，于是一整个实质回合可能在没有任何会话启动技能加载的情况下运行。
**一份在其所辖工作之后的回合才送达的配置，对那份工作而言等价于缺席。**

也观察到它**间歇性**出现，而不只是迟到：在某个桥接会话的第 2、3 回合
在场，到第 4 回合却被报告不再在场，工作区链接没有任何变化，会话也没有
做任何导致它的事。所以锚定在"一旦到达就一直在场"的规则，与锚定在"它
最先到达"的规则以同样方式失败。不要把更早回合的配置当作仍然有效。

**技能列表以同样方式滞后，缺席裁定也以同样方式过期。**指令可能在场并在
某个回合触发，而它点名的技能在宿主自己的可调用技能列表中尚且解析不出来
——恰在指令于会话中途添加之后，或在那种临近会话启动时一次性构建可用
技能列表的宿主里。那个回合上诚实的回应是一次磁盘检查加"未安装"，而该
裁定只对做出它的那个回合为真；没有东西会重新审视它，于是当列表赶上时，
其间每次工具调用都未被观察，而先前的断言未被更正（据观察：技能在裁定
之后第四个回合才出现在列表里，协议那时才首次运行）。所以"未安装"的裁定
要点明它来自哪种探针——列表查询，还是技能目录的磁盘检查——因为两者
恰恰在此处分歧，而且它只在一个回合内有效：在此后每个发起工具调用的回合
重新查列表，并在技能第一次解析成功时完整运行会话启动协议。

持久的形式：**针对激活配置加载失败的守卫，不能住在该配置所加载的东西
之内。**SKILL.md 第 1 步的守卫在 `task-observer` 里，而它之所以被加载，
*是因为*配置说要加载它——于是在配置缺席的回合，也没有任何东西把那道
守卫放进上下文。构造上它就不可能在第 1 回合触发。

因此主守卫属于第 1 回合经核实最早在场的通道——在多数宿主中是用户级
偏好或系统提示块，这一行

> 然后读取工作区配置，并在任何其他工作之前遵循它

就放在那里。见上面的激活层级：该通道是层级 2（用户级偏好），而第 1 步的
守卫是第 2 回合及以后、以及技能碰巧被直接加载的那些会话的后备。

**记录原因，而不只是记录未命中。**当一次会话启动加载被跳过时，修复取决
于它属于哪一种：*缺席*（配置不可达）、*在场但尚未注入*（迟到——记录它
到达的回合）、*在场但尚未可解析*（指令触发了而技能不在列表中——记录它
出现的回合）、*在场却被跳过*（注意力），或*已加载但未运行*（调用成功而
其内的协议从未执行）。只有前两种靠换通道修复，第三种靠重查列表；后两种
不是环境性的，否则先找到的环境性原因会吞掉全部解释。

### 探针搭载在首个批量调用之内

探针行可能在第 1 回合既在场又正确，却仍不首先触发。同一天在两个会话中
各观察到一次：偏好块逐字携带"在任何其他工具调用之前，对工作区路径
`ls`"，而会话的第一次工具调用是一批 `Skill` 调用；探针搭在第二个批次里。
两次都无损失——文件夹已挂载——而这正是要点：这种失败只会在毫无代价的
会话里被察觉，而在文件夹不在场、代理却断言它在场的会话里，它代价惨重。

原因是对同一个槽位的争夺。加载会话启动技能是唯一真正*先于*工作的动作，
于是它占据了探针所需要的那个"先于一切"位置，而且它以代理自身设置被
激活的身份到来，而不是以指令的身份——这感觉像准备、不像行动，于是
获胜。把先后关系说得更硬也改变不了这一点；在第二个实例中，代理已在
同一个第一批次里加载了携带该规则的技能，该规则仍未被觉察为被违反，因为
那次加载已经卸掉了那种履约感。

所以这条规则关乎**第一次调用的内容，而非顺序**：会话的第一次工具调用是
一个包含探针的单一批量调用，任何会话启动技能的加载都搭载在同一批次里
——绝不在更早的批次里。这消除了争夺而不是裁决争夺，宿主的并行调用指引
本就允许它，而且它可在事后从转录记录核查（两个"第一"动作之间的顺序
规则则不可）。SKILL.md 第 1 步就是这样表述的；上面层级 2 的偏好行措辞与
之相配；激活块的"第一次工具调用之前"由搭载*在*该调用内的加载满足。

**技能前层级的行要点名完整批次，而不只是探针。**凡是宿主在任何技能之前
读取的东西——Cowork 的用户偏好块、Claude Code 的用户级（全局）
CLAUDE.md、会话启动钩子注入的文本——都要携带完整的第一批次：工作区
探针与按名称点名的会话启动技能加载，同在一个批量调用里；上面层级 2 的
那行就是模板。一条必须在第一次工具调用上触发的规则不能只住在技能里，
因为在第 1 回合那个技能还没被读过；技能侧的副本（SKILL.md 第 1 步）是
第 2 回合的后备守卫。失败形态：一条只点名探针的行触发了探针，却把加载
留给迟到或间歇到达的项目配置，于是第一批次只载着探针，技能晚一个批次
加载。评审的激活回归检查遍会检查它（`weekly-review.md`，第 1 步）。

**被推迟的探针工具把探针挪到第 2 批次。**在桥接到用户电脑的云会话中，
设备工具在回合开始时可能仍在连接中、以推迟状态到达（只有名字、schema
未加载），于是探针无法搭在第 1 批次。第 1 批次于是载着推迟工具的加载
连同会话启动技能的加载；第 2 批次载着探针、会话启动扫描、以及第 1 批次
中每加载一个技能对应的一次 `skill-load.sh` 调用——这是"查询搭载在其
加载所属批次"的已记录唯一例外，因为该脚本经由同一个被推迟的工具运行。
把这次拆分记进启动行（"探针在第 2 批次：设备工具被推迟"），让读转录
记录的评审看到的是环境性顺序，而不是被跳过的规则。失败形态：一条点名
第 1 批次内容的规则，在其工具之一尚不存在时无法满足，而未加记录的变通
读起来与违规一模一样。

### 安装布局风险——技能悄然失效的三种方式

这三种情形都不留错误。技能干脆不再被提供，或某个激活层级不再触发，唯一
症状是会话启动协议不再运行——这与"运行了却一无所获"的会话无法区分。

**技能发现恰好只有一层深。**宿主读取 skills 目录并寻找
`<entry>/SKILL.md`。没有递归查找。在任何有点规模的技能库上，自然的组织
本能是把技能归入分类文件夹——`skills/seo/`、`skills/clients/`、
`skills/writing/`——而这样做会让**其中的每个技能不复存在**：没有错误、
没有通知、没有任何行为变化，只是技能不再被提供。没有可调试的东西，因为
"未找到"没有可报告的错误。这个布局不只是顺利路径；它就是规则，而且它
不会跟着六个月后重新组织目录的维护者走。让每个技能都直接位于 skills
目录之下。

**skills 目录里的备份会注册成一个竞争技能。**覆盖前备份技能的显眼做法——
`cp -r ~/.claude/skills/task-observer ~/.claude/skills/.task-observer-backup`
——把第二份副本放进了宿主查看的地方。开头的点号并不把它排除在发现之外。可用技能列表于是容纳了两个
description 几乎相同的条目，而备份仍在宣传旧（OLD）版本的触发条件，包括
其会话启动指令。这在唯一能在配置不可达时幸存的激活层级上击败了升级：
描述匹配现在有两个候选争抢同一触发条件，其中之一恰是升级刚替换掉的文件。
把备份放在 skills 目录**之外**。

**按脚本路径注册的钩子会随执行位丢失而死。**文档示例最自然的读法是直接
点名脚本：

```json
{ "type": "command", "command": "'/path/to/hooks/task-observer-activation.sh'" }
```

任何重写文件权限模式的操作——云盘在流式与镜像模式之间切换后的重新同步、
从归档恢复、在无权限位文件系统上的检出——都会把文件以 600 模式送回，
此后钩子在每个会话启动时以"permission denied"失败，且没有任何东西让错误
浮出水面。据观察：被强制的激活层级死了好几天。改为注册解释器
（`"command": "bash '/path/to/hooks/…'"`），它不依赖执行位；并把"会话
启动协议不再运行"当作检查钩子而非检查技能的提示。

### 两种阻断协议而非破坏协议的宿主行为

**命令形态守卫可能拒绝一次只读调用。**某些安装会运行一个前置工具钩子，
检查命令的字面文本中是否同时出现受管路径片段与写入指示符（`=`、`>`、
`cp`、`mv`），只要两者在字符串中任何位置出现就否决整次调用——不管该路径
是否真的在被写入。诊断前值得知道两个后果：先 `cd` 进受管目录、再调用只读
脚本，会被拒绝，尽管什么都没写；以及**仅仅被引用在观察条目正文里的被禁
命令**，在该正文经由 shell 写入时也会触发同一守卫。两者都不是目的端的
权限问题。在它咬人的地方，用绝对路径、不带 `cd` 地调用脚本，并用编辑
工具而非经由 shell 写观察条目正文。拒绝会话启动扫描本身的守卫用同样方式
处理——退化为扁平命令，绝不跳过该步骤（`observation-log.md`，"被拒绝的代码段是降级路径，绝不是被跳过的步骤"）。

**暂存一项宿主配置变更不同于暂存一个技能。**技能的 `SKILL.md` 由自身
读取；一份损坏的暂存副本解析失败，别无影响。宿主配置文件——连同其钩子
条目、拒绝清单与保护规则的 `settings.json`——由宿主读取，而且它通常在
被改之物之外**还载着其他保护**。配置变更的自然交付形态是片段："这是新
键，把它加到 `hooks` 之下"。在那里出错的手工合并不会响亮地失败；它产出
一份合法文件，而其他保护不见了。

所以：把配置变更交付为一份从用户当前文件构建的**完整替换文件**，绝不
交付为待拼接的片段；用一行说明该文件还载着什么，让用户能核实它们幸存；
并且在宿主支持的地方，宁可用独立文件，也不编辑共享文件。

### 若 CLAUDE.md（或等效配置）受治理保护

一些安装用 hooks 或文件保护规则守卫共享配置文件、拒绝代理编辑。若对配置的
编辑被拒绝，绝不盲目重试同一编辑，也绝不试图绕过守卫——拒绝是治理系统
按设计运转，而静默跳过同样糟糕（用户以为激活已就绪，实际只有描述级匹配
在起作用）。把拒绝呈现给用户，并按从轻到重提供这些后备：(a) 若拒绝来自
交互式权限系统而非硬守卫——拒绝消息给出批准途径、点名某条权限规则、或
以其他方式表明同意即可放行——请用户批准重试同一编辑；一次确认即可解决，
越过此步升级会把用户精力花在本来可恢复的事情上；(b) 请用户亲自把激活块
粘贴进文件；(c) 若用户环境提供自己的临时授权机制（标记文件、环境变量或
类似物），请用户通过该机制授权本次编辑、事后撤销；(d) 在平台支持不受
治理保护的项目级指令文件的地方，把激活指令加到那里。按"经同意可重试
还是一刀切"来分支：交互式权限提示靠询问即可解除，钩子或文件保护规则
不行，而把两者都折叠成"把任务交还用户"虽安全，却一贯过度升级。绝不
假设对共享或受治理跟踪配置的编辑不受限制——许多安装恰恰给这些文件设了
闸。

**同一形态适用于被阻断的钩子安装。**同段中的钩子选项写宿主的设置文件或
hooks 目录，而它们设闸的频率至少不亚于配置文件。被拒绝的钩子安装原封
不动地遵循上面的规则：绝不换工具或换路径重试同一安装，绝不绕过，把拒绝
呈现出来，然后从轻到重后退——若拒绝经同意可重试，先请求重试；请用户
亲自添加钩子条目（把确切的 JSON 或脚本交到他们手上）；存在临时授权机制
就用它；而若钩子根本装不上，退回到声明式配置指令，并明白说出：被强制的
层级不在位，在场的是概率性的那个。静默安装失败的钩子比没有钩子更糟：
用户会以为最强的层级在起作用。

### 第三类拒绝：自动内容分类器

上面的后备方案按两类拒绝分支：硬守卫（治理钩子、文件保护规则），以及
一次用户批准即可解除的交互式权限提示。还有第三类，而它两者都不像。

自动内容分类器可以此为由拒绝该编辑：激活块是**被写进用户级配置的第三方
指令文本**，将在那里操纵此后的每个会话。实地报告为
`Instruction Poisoning`，发生在向全局 Claude Code skills 目录的一次全新
安装中。

由此而来的推论：

- **改写措辞没有用。**反对针对的是来源与常驻范围，而不是措辞，所以不
  存在可供重试的更轻版本。缩短该块再试是显见的动作，而它会失败——这一
  尝试至多做一次，然后停止。
- **剩下的最便宜后备不在上面的清单里。**请用户更改权限模式，然后重试
  *同一*层级。在被报告的案例中，那堵墙是权限模式而非策略：用户一旦切出
  自动模式，钩子层级毫无摩擦地装上了。在把块交出去粘贴之前先试这个。
- **反对跟着内容走，不跟着文件走。**引用激活文本的文档页面可以以与配置
  编辑相同的理由被拒绝。只要配置或其说明文字尚未落地，就把安装报告为
  不完整，且不要为绕过分类器而改写两者中任何一个。

**阶梯并不单调。**层级 4——本文件他处称之为唯一强制选项的会话启动钩子
——可能比层级 3 被阻断得*更硬*，且出于无关的原因。在同一次安装中，钩子
以 `Auto-Mode Bypass` 被拒绝：配置钩子会改变宿主自动执行的内容，而该权限
模式对此一刀切地不予放行，而非基于内容裁定。连只写钩子*脚本文件*、不接
任何东西，也以同样理由被拒绝。于是层级 3 与 4 因恰好重合的不同原因双双
失败，而被当作"配置编辑被阻断时的健壮后备"呈上的那个层级，恰恰是被挡
得最远的那个。不要把阶梯当作"若 3 失败，4 就行"呈现给用户。

### 委托出去的设置步骤，未经亲自观察不算完成

上面的每个后备都以向用户交出某物收尾：粘贴这个块、添加这个钩子条目、
授权这次编辑。指令是今天交接的终点，而这差一步。

在被报告的案例中，块交给了用户，用户说已粘贴，而实际没有。文件的 mtime
未变，`task-observer` 在会话自身转录记录之外无处出现。它浮出水面只是
因为有人手工运行会话启动协议来验证安装——否则这次安装会让双方都显得
完整，而没有任何激活层在位。这正是第 4 步在结构上检测不到的"从未激活"
安装。

**所以为每次交接配一道你亲自运行的检查**，在同一会话内，并报告结果：

- 对配置文件 `grep` 技能名；
- 把文件的 mtime 与你交出块的时刻比较；
- 对钩子，确认宿主把它列出来，而不只是文件存在。

"用户说他们粘贴了"是一条关于世界的断言。安装可以廉价地核查它，也应当在
宣布自己已配置之前核查。

**原则。**当某个设置步骤因代理无权执行而被委托给人，委托并不在指令交出
时完成——它在代理独立观察到结果状态时完成。未经验证的交接与被静默跳过
的步骤产出同一产物：一份双方都相信已完成的设置。

### 跨边界交接的路径要从远端解析

代理在自己的执行环境之内验证过的路径，证明不了同一字符串到用户手里会
怎样。三道边界，每道都在一次安装中观察过。**打包：**在 Windows 的商店
打包（MSIX）桌面应用内部，`%APPDATA%\<App>` 被透明重定向到
`%LOCALAPPDATA%\Packages\<App>_<id>\LocalCache\Roaming\<App>`，于是代理
运行的每项检查——bash、PowerShell、Python——都在那里找到配置文件，而
用户从资源管理器、在包外启动的脚本一无所获；从应用自带终端启动的进程随
应用一起消亡，所以"退出应用后再运行它"从内部也做不到。**同步重定向：**
一旦云盘重定向了已知文件夹，`%USERPROFILE%\Documents` 就不再是资源管理
器打开的那个"文档"文件夹；要用 shell 的已知文件夹查询
（`[Environment]::GetFolderPath('MyDocuments')`）解析用户文件夹，绝不要
用配置文件路径拼装它们。**shell 方言：**一条 Git Bash 盘符路径
（`/c/dev/<repo>`）在 Git Bash 里通过每项预检，在用户打开的 PowerShell
里失败（`fatal: cannot change to '/c/dev/<repo>'`）；`"C:/dev/<repo>"`
在 PowerShell、cmd 与 Git Bash 中都可用。插件边界上是同一形态：
`python plugins/<p>/scripts/x.py` 和"展示本仓库的 `docs/<file>.md`"在
作者的检出里正确，对每个消费者缺席，因为安装只复制插件自己的目录。所以：
在打包宿主上，把工作区与任何钩子脚本放在 `AppData` 之外；把交给用户的
每条路径——钩子脚本、配置、工作区——在交出之前从边界用户一侧解析一次；
并让那次解析成为绑定在交接上的步骤，而不是写作时参考的原则。上面的
第三个实例恰好发生在把该原则写下来的同一个会话里，这就是没有步骤的
规则的样子。

**一次安装本身就是跨同一边界交接的路径。**从打包应用内代理的 shell 为
用户安装的工具——全局 npm 安装、按用户的 pip 安装、任何写进被重定向
`AppData` 路径之下的东西——落进包的 `LocalCache`，而代理从内部运行的每项
检查都在预期位置找到它。从用户一侧安装（由本人用自己的终端运行的命令），
或在交接中说明该安装只在应用内部可见。并非每条 `AppData` 路径都被重定向
（`%TEMP%`，位于 `AppData\Local` 之下，在被观察的主机上就没有），所以
"在 AppData 之下"只是一阶近似；一次来自远端的检查才能裁定给定路径。
**进程状态同样不跨边界。**代理的 shell 可能携带进程级执行策略与自己的
`PATH`，于是内部预检证明不了用户的默认策略（Windows 客户端默认为
`Restricted`，除非被改过），也证明不了他们的终端找得到哪些命令：交付
npm 工具——包括 `npm` 与 `npx`——要用策略不管辖的 `.cmd` 形态，而不是
会被拒绝的 `.ps1` 垫片。应用自带的终端面板是打包应用的子进程、继承其
启动环境，所以它同样不是用户一侧。

### Windows 宿主：什么会到达 shell 与文件

两种 Windows 变换会改变内容且不作任何报告。

**经代理 Bash 工具的反斜杠。**在代理的 Bash 工具运行 Git for Windows
的 bash、并把整条命令当作单个 `-c` 参数交给它的地方，观察到连续反斜杠
在命令中任何位置都会减半到达——单引号内与带引号的 heredoc 内也一样
——只有紧跟双引号之前除外；单个反斜杠原样到达，同一条命令从文件运行
则一字不差。经由该 shell 写下的正文会从每个 `\\` 里丢掉一个反斜杠，而
携带 `\\` 的内联代码片段会被改变后运行：会话启动扫描的 `suspect` 程序
被减半后遭 gawk、mawk 与 BWK awk 拒绝，于是计数读作 0 且 stderr 报错
——这正是扫描以 `scripts/session-start-scan.sh` 交付的原因，其单行调用
不携带反斜杠。用 `printf '%s\n' 'a\\b' | od -c` 对宿主做一次测试：输出里
有两个反斜杠意味着传输精确。在不精确的地方，用编辑工具写观察条目正文与
任何含反斜杠的其他内容，并把携带 `\\` 的代码片段从用编辑工具写好的文件
运行（`bash <file>`）。同一传输上还报告过超长内联命令被截断，所以保持
内联命令简短、把长内容放进文件。

**来自 Windows PowerShell 的字节顺序标记。**PowerShell 5.1 写出的 UTF-8
带 BOM（`Set-Content -Encoding UTF8`、`Out-File -Encoding utf8`）。每个
头部读取器都测试第 1 行是否为 `---`，于是以该方式写下的条目从会话启动
扫描中脱落——`parsed` 比 `files` 少一，而其他头部正常解析、没有任何
提示——且归档清扫永远不会移动它。用编辑工具或辅助脚本写条目；在
PowerShell 7 中，用 `-Encoding utf8NoBOM`。

## 环境映射

本技能中的流程以能力来书写。这张表是产品专名唯一栖身之处；当某步骤说
"呈上暂存文件"或"登记评审"时，在这里查当前环境，而不是猜工具名。

**Cowork 执行模式——云端还是本地是用户设置。**Cowork 能以两种工具面
实质不同的模式运行会话，且平台默认已转向云端（于是从早期版本升级的安装
可能悄然变模式——用户体验为工具丢失能力）。开关：Settings → Cowork →
"Run new tasks in the cloud"（外加会话开始处的一个"Beta"按钮）。判据：
工具面中存在本地文件系统权限工具（`allow_cowork_file_delete`）⇒ 本地
会话；缺席 ⇒ 云端。差异如下：

| 能力 | 本地会话 | 云端会话 |
|---|---|---|
| 排定任务的编辑 | 桌面排定任务工具 | 只起草指令；由用户在 Scheduled tasks 页面应用 |
| 删除工作区文件 | 权限闸（`allow_cowork_file_delete`） | 无删除工具；只能改名移走 |
| 在挂载工作区上跑 git | 需带删除授权 | 绝不——改用沙盒克隆 |
| 本地安装的 MCP 服务器 | 可达 | 不可达，除非经桌面应用代理 |
| 工作文件留存 | 工作区文件夹留存 | 未交回的文件不被保留 |
| 计算机关机时能否运行 | 否 | 是 |

必须编辑排定任务、删除工作区文件（评审清理、留二修剪）或在共享文件夹里
跑 git 的步骤需要本地会话——把它当作这些步骤上的一行前置条件；在报告
受模式限制的能力时，同一口气点名模式与开关。

**桥接到用户机器的云会话在写入时刻通过设备 shell 写观察条目。**在桥接
会话中，代理运行在容器里，而日志住在设备上，经由远程 shell（`device_bash`）
与文件提交工具（`device_commit_files`）到达。观察条目在写入那一刻、由该
shell 在设备上运行 id 代码片段（SKILL.md，如何记录）——或在脚本可达
设备时运行 `scripts/new-observation.sh`——创建，其正文经由同一 shell 以
带引号的 heredoc 写入创建出的路径。绝不在容器里组好、事后提交。失败
形态：被提交的文件携带从更早的目录清单派生的 id，而前缀守卫从未运行，
因为它住在被提交绕过的那条命令里；滞后的 `.id-floor` 先现身，重复 id
在下次评审现身。

| 能力 | Claude Cowork | Claude Code | Web 聊天 / 无文件系统 |
|---|---|---|---|
| 持久工作区 | 共享文件夹 | 固定的绝对路径（见激活块） | 无——见下文交接文档模式 |
| 在线技能文件 | 只读挂载上的 `.claude/skills/{skill}/`（写入以 EROFS 失败） | `~/.claude/skills/{skill}/`，普通可写文件——无守卫 | 不适用 |
| 呈上暂存文件以供安装 | 文件呈示工具（`present_files`）及其上传按钮 | 无——在聊天中报告暂存路径与变更摘要 | 粘贴进交接文档 |
| 排定评审 | 应用的排定任务（云端默认：远程运行；旧文本地模式：在用户机器上运行、仅在其开机时——见上文执行模式说明） | cron / 宿主 `SessionStart` 钩子 / 能到达工作区的账户级调度器——无头调用需在任务定义中携带工作区授权（`--add-dir`） | 日历提醒 + 手动触发 |
| 会话启动钩子 | 无 | `SessionStart` 钩子（`hookSpecificOutput.additionalContext`） | 无 |
| 本地与云端的判据 | 存在 `allow_cowork_file_delete` ⇒ 本地会话 | 不适用 | 不适用 |

出现新环境时扩充此表；不要把它的工具名散落到各流程文件里。

**排定任务提示词中列出的第一个动作就是它的第一次工具调用。**会话启动
协议要求工作区探针（第 1 步）先于任何技能调用，而一条以"按此顺序调用：
……"开头的排定提示词会让第一次调用成为首个调用——据观察：一次排定运行
加载了它被要求加载的每个技能，探针优先规则也已加载且正确，探针却是
第三个运行的。想让某物先于列出的第一个动作的规则，必须出现在那个清单
里，而不是清单所加载的文本里：把每个排定提示词里的激活指引写成"先探
工作区文件夹（对其绝对路径做一次 `ls`），再调用 <skills>"，并把探针的
流程与失败处理留在技能里。

**列出的第二个动作留下启动标记。**探针之后，每条排定评审提示词把日期与
时间写入 `skill-observations/review-started.txt`，而评审的第 7 步用
`completed <date>` 覆写它：

```bash
printf '%s\n' "$(date '+%F %H:%M')" > "C:/Users/Administrator/.zcode/skill-observations/review-started.txt"
```

调度器的"succeeded"只说明任务启动过；标记说明它走到了哪一步。在下一次
会话启动时，内容不是 `completed` 的标记是一次中途死掉的运行，而调度器
最近运行晚于 `last-review-date.txt`、标记却原封未动，是一次触发过却从未
到达第二个动作的运行——两种不同的缺陷，哪一个都不是发生过的评审。标记
按内容裁断，绝不按 mtime：第 7 步在日期文件之后写它，所以完成运行的标记
总比日期文件新。会话启动第 3 步把两者都报告为"于 YYYY-MM-DD 触发，未
记录评审"并视为评审到期。

**访问授权属于任务定义，不属于路径。**排定会话运行在调度器创建的沙盒
里，而那个沙盒可以拒绝一条存在且在线的路径（据观察：一次由 OS 调度器
发起的无头运行被限制在用户配置文件内，被固定的工作区在另一块盘上，每个
接口都被拒绝——文件工具、两种 shell、连配置文件内的一个 junction 也被
拒，因为沙盒规范化了目标——直至技能自己的参考文件；该运行以离线策略的
一行跳过收场，一个穿着临时故障外衣的配置缺口）。因此登记排定评审要包含
宿主为工作区根所需的任何允许目录配置——对 Claude Code 无头运行，是在
调用上加 `--add-dir "C:/Users/Administrator/.zcode"`，或等价的权限规则——而且在某次
触发**从任务自身的执行环境之内**到达工作区之前，安装不算完成：交互式
测试证明不了调度器创建的沙盒，调度器列出的任务也不是一次成功的运行。
探针把这两种失败分开：路径不在场是离线工作区策略的情形
（`references/weekly-review.md`）；对存在路径的权限或沙盒错误是任何后续
触发都无法治愈的配置缺口，其跳过注记要点名缺失的授权。

**受管的 skills 目录（dotfile 管理器、同步工具）。**在 skills 目录由
chezmoi、GNU Stow、yadm、符号链接的 dotfiles 仓库或任何同步工具生成的
地方，在线路径不是事实来源：把暂存更新复制上去会成功、看起来已安装，并
在下一次 `apply` 时被悄然回滚——"我装上了"与"它仍在生效"变得不可区分。
在安装时侦测管理器（指向 dotfiles 检出的符号链接、`.chezmoi*` 标记、被
列进某个 Stow 包的目录）并记入激活配置。然后装进管理器的源（SOURCE），
而不是在线路径，让管理器应用它；或把 skills 目录排除在管理之外。"始终
从在线文件开始"（`references/skill-authoring.md`）对读取（READING）依然
成立——加载器加载的就是在线文件——但写回（WRITE-BACK）路径是管理器的
源。每周评审的暂存工作对账（`diff -rq` 暂存对在线）是抓住回滚安装的
检查：在受管目录上的任何安装之后的那次会话运行它。条目是符号链接时，
暂存前也要先解析它（`skill-authoring.md`，编辑规则 1）：以链接身份复制
的链接会让暂存路径变成在线路径。

## Git 作为可选的暂存介质

把技能更新暂存为一条由用户合并的分支或提交，给出与 `skill-updates/`
目录相同的保证——没有用户动作就没有东西上线——外加 diff、历史与回滚，
并且适合通过私有仓库同步技能的多设备布置。它是一个选项，不是对默认的
更改：评审仍写暂存清单，仍绝不编辑在线安装，仍把变更呈上以待决策。把
版本控制命令当作观察日志的一个变更面（见
`references/observation-log.md`）。

## Claude Code Projects

*依据平台文档，尚未经实地检验——欢迎报告。*在依赖下面每条说法之前，
对照现行 Claude Code 文档重新核实。

Claude Code Projects 把工作作为并行的云"线程"运行在一个协调会话之下。
按文档，线程不会从用户自己机器上的 Claude Code 设置捡起任何东西：技能
只从加入项目的仓库里的 `.claude/skills/` 加载，或从账户上启用的技能加载；
CLAUDE.md 只从项目的仓库加载；常设规则放进项目指令，每个新线程都会收到。
每个线程在自己的克隆里、在自己的分支上工作，而协调者看到的是线程回报的
东西，不是它们走的每一步。这同时打破三个安装假设：

- **安装。**用户级安装对线程不可见。把技能——连同其 `references/` 与
  `scripts/`——提交到一个加入项目的仓库，或把它启用为账户技能。
- **激活。**用户级激活行永远不会加载。把激活块的指令放进项目指令
  （首选：它到达每个线程与协调者，且在"不读取按仓库设置"的多仓库项目中
  依然成立）或放进仓库的 CLAUDE.md。
- **日志路由。**不存在固定的共享路径：比线程活得更久的写入只有已推送的
  分支或 PR、项目 Library 文件、或项目记忆。所以要么 (a) 线程在其给
  协调者的最终报告里**完整**携带每条观察条目，由协调者或某个排定项目
  例程把它们写进真正的日志；要么 (b) 观察条目经 PR 提交到一个专门的
  观察仓库——上面的"Git 作为可选的暂存介质"路径——并且绝不只留在工作
  分支上，因为未合并的分支会随其线程一起被拆除。在非代码项目中，
  Library 文件是载体。按条目的文件仍防止并行线程间的写入冲突；这里的
  问题是存活，不是并发。

当解析出的工作区是临时性的，会话启动守卫会告警并重新锚定；在线程里没有
稳定之物可供重新锚定，于是分支是**回报模式**（上文"工作区锚定"）：持久
的路线是该表面保证能存活下来的通道——工作者交给其协调者的报告、一次
已合并的提交——而不是工作者够得着并指望它比自己活得久的位置。

特征性失败是静默的：从未激活的安装与滞留在未合并分支上的观察条目都不
产生错误，所以问题报告会低估它。外部诊断：**几个线程的实际工作之后仍无
观察条目到达协调者，意味着技能未激活，或日志路由未接通。**检查项目指令
里有没有激活行、加入的仓库里有没有技能目录，然后报告找到了什么——那份
报告就是本节正在等待的实地测试。

## 输出通道归调用方所有的会话

子代理、非交互运行、带声明结果 schema 的工具式调用：会话有文件系统而
没有读者。从会话自身的契约侦测它——单一必需的结果调用、对自由文本回答
的禁令——绝不要靠某个标志。每个需要向人做自由文本答复的步骤在那里都
没有接收者：评审提议（会话启动第 3 步）、激活建议（第 4 步）、会话末
总结（呈报协议，Surfacing Protocol）以及激活块里的逐任务总结行。静默
跳过它们，且绝不把一次无法应答的提议计入已呈报。也绝不未经请求就运行
评审：第 3 步里的"自主"指的是其提示词请求评审的排定运行，而不是其调用
方另有所求的工作者。

记录会发生什么取决于调用方是谁。在调用方本身是运行本协议的会话的地方，
激活块的子代理规则适用：工作者什么都不写，值得记录的发现进入其结果中
schema 留给备注的那个字段，由控制器来写。在调用方不运行任何协议的地方
——脚本、CI 任务、另一个工具——记录完全有效，因为那次写入就是那里
唯一的报告：本会被呈报的任何东西都变成一个点名触发条件的观察条目文件，
让下一个交互式会话继承它；在 `session_context` 里点名调用方，且只记录
调用方看不到的东西。交接文档模式是相反情形（有读者、无处可写）；回报
模式（"工作区锚定"）是既无稳定路径也无读者的情形。（从两侧都观察到过：
一个带固定输出 schema 的子代理正确运行了协议、随后却发现四个汇报步骤
无处安放；一个一天派出八个子代理的编排器发现，每个子代理都在各自"任务
书未覆盖的决策"一节里、以不同方式自行解决了同一个冲突。）

## 首次运行回填

技能在被采纳的那一刻价值最低：日志为空，评审正确地报告无事可做，而最大
的一堆未被捕获的洞见——项目自身的历史——从未被触碰，因为没有流程说要
触碰它。会话启动第 7 步提供一次性的挖掘遍，覆盖交接、架构与决策文档、
自上个发布以来的提交历史、测试与验证脚本（它们高密度地编码来之不易的
纪律），以及既有的代理指令文件——后者大体上是用户不得不做出的纠正的
记录。一次这样的遍在七周历史上产出二十三条可执行的观察条目，其中十一条
是对既有技能的事实性修正。回填条目引用持久产物，一次批量写入即满足同
回合规则；该遍只运行一次，此后由排定评审接管。

**同一挖掘遍，范围限定到一个被点名的会话。**"回顾式地评审今天的会话"和
"我们做 X 的那一次"点名的是一个已结束的会话，不是项目的历史，而听到该
请求的会话手里没有它的转录记录。那不是一次实时观察，也不是首次运行
回填；它是把来源限定到一个时间窗内的回填遍。来源是项目保存的任何按
会话的持久记录——上面的几类是例子，不是清单：会话窗口内的提交历史与
diff、项目已跨会话维护的记忆或笔记系统（独立于指令文件另行建索引的按
日期文件目录很常见）、在其结束时写下的交接文档。每一个都在
`session_context` 中被引用，方式与回填条目引用 CLAUDE.md 完全相同——
产物加章节，绝不用会话 id，因为没有可供指点的会话。说明哪些来源读到了、
哪些不可用，让后来的读者能区分贫乏的会话与贫乏的记录。（据观察：一次
全新安装、日志为空、用户要求回顾当天；代理用 `git log` 与项目的笔记
目录重建了那一天，并记录了三条有据可查的观察条目——正确的动作，却是
临时发挥，因为没有东西说该去哪里找。）

## 存储体制

持久性是一个轴；写入的*价格*是另一个轴。三种体制：

1. **本地文件系统**——追加是免费的。完全按 SKILL.md 的规定写检查点
   标记；它们是检查发生过的唯一证据。
2. **共享或托管文档存储**（工作区解析为一个托管知识库或项目，其中每个
   "文件"是一篇文档，而每次写入都是一次使该工作区中所有其他会话的缓存
   上下文失效的变更操作）。在每个检查点保留强制的*检查*，但抑制*空*
   标记：把检查挂在反正要发生的写入上——交付事件与任务完成——来强制
   它，且只在有观察条目可记时才写。强制机制必须对照其环境计价；一条
   "即使为空也必须写"的规则，只在写入免费的地方才是免费的。
3. **无持久性**——即下文的交接文档模式。

## 包清单

本技能由 `SKILL.md`、它列出的参考文件（`weekly-review.md`、
`skill-authoring.md`、`environments.md`、`observation-log.md`、
`signals.md`、`migration.md`、`starter-principles.md`）以及
`scripts/migrate-log.py`、`scripts/new-observation.sh`、
`scripts/session-start-scan.sh`、`scripts/skill-load.sh` 与
`scripts/validate-skill-bundle.py` 组成。若有被引用的文件缺失，安装不
完整：按 `SKILL.md` 中的规则继续，告诉用户缺了哪些文件，并把他们指向
权威来源处的完整包（对已发布版本，即署名块中点名的仓库）。`SKILL.md`
陈述了同一条规则（"参考文件"），因为本文件正是可能缺失的文件之一：只
保留 `SKILL.md` 的上传路径产出的恰恰是那种安装，而只保存在这里的规则
在里面永远不会被读到。

## 压缩行为

**一次压缩就是一次会话启动。**交接文档的恢复与被重新调用的排定运行
亦然。每一个都是装着旧工作的新上下文，恰是会话启动协议为之存在的条件，
而在它们任何一个之后的第一回合，协议都要完整重跑——存储探针、
frontmatter 扫描、评审触发条件，以及为眼前任务所需每个技能的逐技能
grep。在 CLAUDE.md 结构性触发条件到达恢复上下文的地方，它会重新调用
技能；不要依赖它已经这样做——据观察：一个会话在任务中途被压缩，恢复
回合没跑探针、没跑扫描、也没跑逐技能 grep，因为没有东西把压缩点名为
触发条件。

**写入路径必须熬过压缩；技能正文不必。**据观察：压缩之后会话启动钩子
打印了它的提醒，而在技能被重新调用之前，一次交付物清写触发了——两条
观察条目是靠复制既有文件的 frontmatter、再从目录清单取下一个编号写下的。
id 代码片段从未运行，编号地板落后已签发 id 两个，而清扫、冲突守卫与
noclobber 创建全都未经演练。指向本节的指针住在技能正文里，而那恰是压缩
移除的东西。在压缩与技能重新调用之间，任何其他路线都不写任何东西：先
触发的清写要么运行 `scripts/new-observation.sh`（它不需要上下文中有技能
正文——slug 与工作区根是它仅有的输入），要么等那次调用，且绝不复制另
一个文件的头部。所以激活块把该脚本点名为观察条目文件得以问世的唯一
途径，钩子也打印同样的话：一条必须到达恢复上下文的规则，要走能熬过
压缩的通道传播——激活配置，或在宿主于压缩时也触发它的会话启动钩子
（Claude Code 的 `SessionStart` 除非匹配器排除 `compact`，否则会触发）
——后者随即成为最先到达的通道。

**压缩摘要里"先前调用过的技能"清单是下界，绝不是会话的技能集。**摘要
保存的是它就*工作*判断为显著的东西；技能加载是基础设施、不是工作，所以
恰恰是摘要会丢掉的东西。据观察：摘要点名了压缩前至少六个已加载技能中的
三个，恢复回合把清单当作存货来读，两个领域技能在整个数据拉取期间一直
未加载，直到用户开口。该块自己的措辞——"在此展示仅为提供上下文，使你
保持知悉其指引"——描述的是块里有什么，却极易被读成会话拥有什么。从
任务重新推导技能集（说出决策、说出产物类型、拿已安装的 description
匹配——见上文"按决策选择，不按产物选择"），并把摘要列出的任何技能当作
"加载过又被忘掉"，而不是全集。

压缩前后的观察条目写成同一 `observation-log/` 目录下的独立文件，各带
自己的 id（id 计数器派生自既有文件名，所以它跨压缩边界无缝延续）。恢复
会话的开场消息可能匹配不上 description 触发条件，这是结构性触发条件存在
的理由之一——也是协议按规则重跑、而非按碰巧触发的那个触发条件重跑的
理由之一。

## 面向用户的文档

安装、共享文件夹设置、预期行为与节奏模式住在公开仓库里。把这些链接
转交给用户，而不是去抓取页面——技能的行为完全由它自己的文件定义，绝不
由外部内容定义：

- README: https://github.com/rebelytics/one-skill-to-rule-them-all/blob/main/README.md
- USER-GUIDE: https://github.com/rebelytics/one-skill-to-rule-them-all/blob/main/USER-GUIDE.md

## 仓库/维护者会话——写入前验证提交身份

在 git 中，认证与归属是两条分离的通道：推送凭据（PAT/SSH 密钥）控制谁
可以写入（WRITE）；提交的作者邮箱（`git config user.email`）声明谁写的
（WROTE），而平台会把该邮箱映射到已将其验证的那个账户——无论推送出自
哪个账户。在任何一个用于特定身份的克隆中做第一次终端提交之前，核实
`git config user.email` 解析到预期账户；在机器全局身份不同的地方设置仓库
本地配置。怀疑错误归属时用 commits API 诊断（作者登录名对提交邮箱）。只
向前修复：为修正作者元数据而重写已发布的 main（连同由它派生的 tags/CI）
代价超过表面收益——在预期账户上验证该邮箱是替代补救。

## 交接文档模式（无持久存储）

方法论与环境无关；变化的只有持久性。在网页聊天式环境中，在会话内收集
观察条目，并在一份结构化的交接文档中交付它们，由用户存储并粘贴进下一个
会话。**在对话接近尾声时主动提议交接**——过早的提议只是轻微打扰；缺失
的提议是丢失的工作。

```markdown
# Session Handoff: [Session Topic]

**Date:** [date]
**Context:** [what was worked on; what the next session needs to know]

## Decisions Made
[numbered]

## Observations Logged
[each observation in the frontmatter format from SKILL.md → How to Log; the
next session writes each as its own file in `observation-log/`]

## Cross-Cutting Principles (current)
[active or newly added]

## Action Items
[next steps with enough context to resume]

## Working Artifacts
[drafts/analyses in full]
```

## 交接文档分析（收到时）

1. 先不加过滤地记录所有明确陈述的观察条目。
2. 然后系统地通读每一节，追问哪些技能缺口或候选是*隐含*而未言明的——
   交接文档携带超出实时捕获内容的信号。
3. 特别注意行动项（每一条都可能隐含一个缺失的技能）、开放问题（模糊性
   表明决策框架缺口）、已完成工作的叙述（模式可能揭示元技能）以及会话
   笔记。
4. 把派生的观察条目归因为来自交接文档分析，而非原始会话。
