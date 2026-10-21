# 迁移 3.0 之前的单文件日志

仅用于升级。3.0.0 之前的版本把每一条观察条目都保存在同一个文件
`skill-observations/log.md` 里，以 `### Observation N:` 作标题。3.0.0 版
改为在 `skill-observations/observation-log/` 之下，为每条观察条目单独存
一个文件。本参考文档用于借助随附脚本，把前者一次性转换成后者。全新安装的
3.0 永远用不到它；只有当会话启动协议（Session Start Protocol）发现存在
`log.md` 而不存在 `observation-log/` 目录时，才会加载它。

这次转换之所以做成脚本而不是操作流程，理由只有一条：脚本可以对已有的每一个
日志以 check-only（仅检查）模式运行并核验其输出，而且重新运行会得到同样的
结果。由代理执行的散文式指令无法以同样的方式核验。

## 脚本做了什么

`scripts/migrate-log.py` 解析每一个 `### Observation N:` 块，并写入带 YAML
frontmatter 的 `observation-log/NNNN-<slug>.md`：

| 旧版字段 | Frontmatter |
|---|---|
| `### Observation N: Title` | `id`、`title` 以及文件名前缀 |
| `**Status:** OPEN` | `status: open`；任何尾随文本成为 `status_note` |
| `**Status:** ACTIONED (date) — note` | `status: actioned`、`resolved: date`、`resolution: note`（DECLINED 同理） |
| `**Date:**` | `date` |
| `**Skill:** a; b (section)` | `skill: ["a", "b"]` —— 恒为列表；逐技能的限定词进入 `skill_qualifiers` |
| `**Skill:** New skill candidate: name` | `proposes_skill: ["name"]`；除非该条目还点出某个它可扩展的既有技能，否则 `skill` 保持为空 |
| `**Type:**`、`**Phase/Area:**`、`**Session context:**`、`**Reference file:**` | `type`、`area`、`session_context`、`reference` |
| 其余一切 | 逐字保留在正文中 —— 只有上表列出的标签会被提取 |

两条规则保护着那些该格式正是为使其可靠而存在的字段：

- **解决日期只从 em-dash（长破折号）之前的标记区域读取**，绝不从其后的
  自由文本读取。解决说明里经常含有并非解决日期的日期（"applied in review
  2026-03-04"，即"已在 2026-03-04 的评审中应用"）；在测试中，读取整行的
  做法曾为数百条归档条目捏造出错误的 `resolved:` 值。
- **歧义会被标记，绝不被猜测。** 解析器没有把握的任何东西——缺失的状态、
  无法解析的技能名、既可能作用于单个名字也可能作用于整个分组的限定词——
  都会以 `migration_note: "needs review: …"` 写入文件并列进报告。这些
  条目你可以手工解决；更好的办法是通过 overrides 文件解决，这样整次运行
  保持可复现。

它还会写入编号地板文件 `observation-log/archive/.id-floor`，内容是它见过的
最大 id（统计范围涵盖被转换的日志以及任何 `--id-floor-from` 目录），使
计数器从单文件日志停下的地方继续编号。

## 操作步骤

在工作区文件夹中运行。要求 Python 3.8+，无其他依赖。下文中的
`<skill directory>` 指所安装技能自身的目录（即包含 `SKILL.md` 的那个
目录）；在 `python3` 并非真实解释器的地方（在 Windows 上它可能是
Microsoft Store 的别名），改用 `py -3`。

1. **确保没有别的写入者。** 关闭并行会话，并检查接下来一小时内是否有到期的
   排定评审。转换只读取 `log.md` 一次；在那之后追加的条目会从新布局中丢失。
   要清楚这一探查的局限：它抓得住"现在正在写入"的会话，抓不住那些抱着过期
   布局模型、"以后才会写入"的会话——一个几小时前向 `log.md` 追加过内容、
   在迁移时刻处于空闲的长期运行会话，对任何存活性检查都不可见，而它的下一
   次追加可能重建旧文件（`cat >>` 会创建缺失的目标）。因此第 7 步的重命名
   也是一道防线：它让过期追加在其编号预检中响亮地失败——前提是各追加方把
   空探测/缺失探测当作停止信号，而不是直接给计数器取默认值（见 SKILL.md
   中的日志写入安全规则）。迁移之后，在任何已知的长期运行会话下次写入之前，
   先警告它。
2. **备份。** `cp skill-observations/log.md skill-observations/log.md.bak`
3. **对已有的一切做 check-only（仅检查）遍历**，包括你不打算转换的归档
   日志：

   ```bash
   python3 "<skill directory>/scripts/migrate-log.py" --check skill-observations/log.md
   find skill-observations/archive -maxdepth 1 -name '*.md' -exec \
     python3 "<skill directory>/scripts/migrate-log.py" --check {} +
   ```

   分成两次调用，而不是合成一个 glob：归档目录可能不存在，而在 zsh 下没有
   匹配到任何文件的 `*.md` 是硬错误——这会把现行日志的检查也一并拖垮，只
   因为缺了从来只是可选的那些文件。

   归档是免费的测试覆盖：它们含有当前条目已不再出现的格式漂移，也会走到
   现行日志走不到的解析器路径。读一读各标记的计数。`needs human review`
   是将会带有 `migration_note` 的条目数。
4. **为被标记的现行条目编写 overrides**（若有）。这是一个以 id 为键的 JSON
   文件；每个值列出它解决的标记以及要设置的字段：

   ```json
   {
     "812": {
       "_resolves": ["skill-missing"],
       "_reason": "proposes a new skill and could extend an existing one",
       "skill": ["existing-skill"],
       "proposes_skill": ["candidate-name"]
     }
   }
   ```

   以 `_` 开头的键是簿记信息；其余每个键都会覆盖对应的那个 frontmatter
   字段。`_reason` 会作为 `migration_override` 记录进文件，使这个决定得以
   留存。
5. **转换现行日志：**

   ```bash
   python3 "<skill directory>/scripts/migrate-log.py" --convert skill-observations/log.md \
     --out skill-observations/observation-log \
     --id-floor-from skill-observations/archive \
     --overrides overrides.json
   ```

6. **验证两次：先验源保真度，再验目标符合度。** 报告中的文件数必须等于
   `log.md` 中 `### Observation` 标题的个数：

   ```bash
   grep -c '^### Observation' skill-observations/log.md
   find skill-observations/observation-log -maxdepth 1 -name '*.md' | wc -l
   ```

   抽取三个文件与原件对照检查，其中包括一条已解决过的条目和一条带限定词的
   条目。然后阅读报告的 `target conformance` 块，并从文件本身加以确认：
   一组已转换的文件忠实于一个从未有过 `siblings_checked` 的源，因此每个
   文件都缺这个字段，而且除下一次评审的兄弟回填外，没有任何东西会把它补
   上。字段清单要从目标自身的定义（SKILL.md 的 File format 一节）枚举，
   绝不要从上面的映射表枚举——表中缺失的字段与 schema 中缺失的字段无从
   分辨：

   ```bash
   o="skill-observations/observation-log"
   n=$(find "$o" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')
   for field in status siblings_checked; do
     have=$(find "$o" -maxdepth 1 -name '*.md' -exec grep -l "^$field:" {} + | wc -l | tr -d ' ')
     echo "$field: $have/$n"
   done
   ```

   `siblings_checked` 低于 `n` 个属于预期，也正是第一次评审会清除的状态；
   `status` 低于 `n` 个则是转换器缺陷——请上报。
7. **把旧版归档移入新布局之下**，让一个目录容纳全部历史，并让旧文件退役，
   使再没有东西扫描它：

   ```bash
   find skill-observations/archive -maxdepth 1 -name '*.md' \
     -exec mv {} skill-observations/observation-log/archive/ \;
   rmdir skill-observations/archive 2>/dev/null
   mv skill-observations/log.md skill-observations/log.md.migrated
   ```

   再次使用 `find`，原因与第 6 步相同，另加一条它自己的原因：什么都没有
   匹配到的裸 `mv …/*.md` 在 bash 下会把字面模式原样传给 `mv`，后者随即
   以一条令人困惑的 "No such file" 报错；而在 zsh 下，它在 `mv` 根本还没
   运行之前就中止了。`rmdir` 允许失败：一个里面还留着东西的目录是值得去
   看一眼的信号，而不是停下迁移的理由。

   旧版归档保持其单体格式不变。它们写于几经变更的约定之下；转换它们会
   捏造出这些记录从未有过的精确性，而且在正常回合中没有任何东西会读取
   它们。

8. **在把迁移记录到任何地方之前，先枚举这台机器上的其他工作区。** 以上
   各步恰好只转换一个工作区文件夹。当技能以用户/全局作用域安装时，其他
   工作区可能持有各自的 `skill-observations/` 锚点，且仍停留在旧版布局
   上。在你的工作区文件夹可能锚定的任何地方搜索——两种受支持的布局都要
   搜：身份根目录，以及其下的受管持久化目录（`references/environments.md`）；
   这也正是该搜索不设深度上限的原因。例如在 Claude Code 中：

   ```bash
   find ~/.claude/projects -name log.md -path '*/skill-observations/*'
   ```

   **在转换任何一处命中之前，先问作用域问题。** 多份观察着同一批全局安装
   技能的旧版日志并不是多个作用域；它们正是本技能警告过的那种静默分叉
   （"globally installed skills need one path shared across projects,
   tools and agents"，即"全局安装的技能需要一条为项目、工具和代理所共享
   的路径"）。把它们就地逐个转换只会延续这个分叉，还留下两个早已冲突的
   id 空间。先把这些日志合并到同一个锚点上——按照
   `references/environments.md` 中 "Before creating a log, search for
   one"（创建日志之前，先搜索是否已有日志）一条执行，并在每个废弃位置
   留下一个指针文件——然后只对幸存的那份日志运行一次本流程。只有真正互
   不相同的被观察作用域才分别迁移。

   **每一份现存的 `log.md` 都需要核对，包括与 `observation-log/` 并存的
   那一份。** 这样一对东西并不是已转换的工作区：它是一次停在第 7 步之前
   的转换，或是一个重建了退役文件的过期 3.0 前会话。没有别的机制能抓住
   它——会话启动协议只在 `observation-log/` 缺失时才执行迁移——因此该
   文件独有的条目永远不会被导入，也永远不会被扫描。对它跑一遍 check-only
   遍历，转换该目录所缺的内容，并按第 7 步让文件退役；或者把它明确列为
   待处理。

   一个干净未转换的工作区（有 `log.md` 而无 `observation-log/`）即便跳过
   也不会丢数据——会话启动协议仍会在那边的下一个会话里惰性地抓住这种
   情况——但"惰性"可能意味着好几天，且在此期间没有任何东西把它标记为
   未转换。

   同一条作用域规则也适用于迁移的记录：写进一份覆盖面超出单一工作区的
   文档——机器级全局的 CLAUDE.md、团队运行手册——的完成备注，必须点名它
   所覆盖的工作区，因为全局文档里的"迁移完成"在每一位未来读者眼里都等于
   "处处已完成"。

9. **复查一切提到旧路径的东西。** 其他技能、CLAUDE.md、定时任务或评审模板
   可能点名 `skill-observations/log.md`。把它们改指向目录即可；"the
   observation log"（观察日志）这一说法本身依然正确。

## 回滚

执行 `mv skill-observations/log.md.migrated skill-observations/log.md`，
并重新安装上一个版本的技能。逐文件目录可以留下；3.0 之前的技能会忽略它。
切换之后记录的任何内容只以文件形式存在，因此如果你是在实际使用之后才回滚，
需要手工把那些条目追加进 `log.md`。
