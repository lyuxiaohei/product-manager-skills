# PDM.Skill-Evolve 安装说明（v3.6.0 · 分 agent 文件）

> task-observer v3.6.0 中文适配版＋prompt-capture 融合。本技能 = 观察条目（主动提炼信号）＋提示词记录（全量证据流）＋周期评审（人工拍板）。
> **分 agent 安装**：本体相同，技能目录与钩子注册位置不同——按你用的 agent 打开对应文件。装完必须做各文件中的第 3–5 步，缺一步不生效。

## 导航

| 你用的 agent | 安装文件 |
|---|---|
| ZCode | [ZCode.md](ZCode.md) |
| Claude Code | [Claude-Code.md](Claude-Code.md) |

各 agent 文件是完整安装序列；前置条件、路径替换、部署位置、验证与附录都在本 README，agent 文件内会回引。

## 正本与副本

- **正本**：项目 `D:\工作台-吕道远\5-A34-AI项目工程化技能\skills\PDM.Skill-Evolve\`
- **安装副本**：ZCode 侧 `~\.zcode\skills\` 与 Claude Code 侧 `~\.claude\skills\`
- **改动纪律**：先落正本，再同步两侧，三份内容必须一致（`diff -r` 零差异为验收标准）。

## 通用前置条件

- **Git Bash**：钩子解释器。⚠️ Windows 下 `where bash` 前两个命中是 WSL/System32 与 Store 占位符（跑不了钩子），必须用真路径。本机为 `D:\software\Git\usr\bin\bash.exe`；新机器用 `cygpath -w /usr/bin/bash` 查。
- **Node.js**：save-prompt.js / build-library.js 需要。
- frontmatter 的 `name` 必须裸值 `PDM.Skill-Evolve`——**带引号会被技能清单拒载**（真实踩坑，装后清单里没有先查这个）。

## 路径替换（新机器必做）

包内文件共 35+ 处写死 `C:/Users/Administrator/.zcode`（含钩子脚本）。新机器上对 SKILL.md、全部 references、`scripts/session-start-hook.sh` **全局替换 `Administrator` → 你的用户名** 即可（所有路径同一字符串，无需逐处核对）。

## 共用部署位置（两个 agent 相同，不随 agent 变）

| 脚本 | 部署位置 | 注册事件 |
|---|---|---|
| `scripts/session-start-hook.sh` | `C:/Users/<用户>/.zcode/hooks/`（目录不存在则新建） | SessionStart |
| `scripts/save-prompt.js` | `C:/Users/<用户>/.claude/hooks/` | UserPromptSubmit |

部署即复制文件到位；**注册**（把命令挂进 agent 配置）见各 agent 文件。注册生效后，每条提交的提示词自动落 `<当前项目>/.prompts/<日期-项目-会话短id>.md`（短确认与裸斜杠命令自动跳过；密钥类自动脱敏）。

## 安装验证（新开会话，三问）

1. 问「现在几点」→ 开场应自跑会话启动协议（探针 `skill-observations/` ＋报 frontmatter 版本号）
2. 问「技能清单里有没有 prompt-capture」→ 应**没有**；PDM.Skill-Evolve 的 description 应含「提示词记录、prompt capture」
3. 说「整理一下我最近的提示词有没有值得沉淀的模式」→ 应命中本技能并读取 `.prompts/` 做分析

客观文件验证（不依赖模型表现）：新会话发任意非寒暄提示词后——

```bash
ls .prompts/                                                      # 应出现当日记录文件
tail -3 C:/Users/<用户>/.zcode/skill-observations/checkpoints.log  # 应有本次会话新行
```

## 附录 A：session-start-hook.sh 全文（备查）

```bash
#!/bin/sh
# SessionStart hook: inject PDM.Skill-Evolve activation + review state as additionalContext.
d="C:/Users/Administrator/.zcode/skill-observations"
open=$(find "$d/observation-log" -maxdepth 1 -name '*.md' -exec grep -l '^status: open$' {} + 2>/dev/null | wc -l | tr -d ' ')
last=$(cat "$d/last-review-date.txt" 2>/dev/null || echo never)
msg="Before the FIRST tool call of any turn that will involve tools, invoke the skill PDM.Skill-Evolve (task-observer; 中文别名：技能进化/技能观察员/观察日志) and run its Session Start Protocol / 会话启动协议: probe the workspace at C:/Users/Administrator/.zcode/skill-observations/ (create via its idempotent Workspace creation command if absent), then scan per its SKILL.md. Observation files are created only by scripts/new-observation.sh in the skill directory, never by copying a header."
if [ "$open" -gt 0 ]; then
  msg="$msg $open open observations; last review: $last."
  cutoff=$(date -d '7 days ago' +%F 2>/dev/null || date -v-7d +%F)
  case "$last" in
    (never) msg="$msg Offer the review." ;;
    (*) [ "$(printf '%s\n%s\n' "$last" "$cutoff" | sort | head -1)" = "$last" ] && msg="$msg Offer the review." ;;
  esac
fi
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$msg"
```

## 附录 B：日常使用速查

- 观察条目：任何会话中发现摩擦/纠正/重复做法，技能自动落条目于 `~/.zcode/skill-observations/observation-log/`
- 周期评审：观察攒批后（≥7 天或你点名）逐条裁决，批准→暂存→确认后安装；说「跑评审」即触发
- 提示词库：`node scripts/build-library.js <项目目录>` 生成/刷新该项目的 `library.md`（聚类＋打标）
- 同步上游：见《[溯源与同步.md](../溯源与同步.md)》（8 条改造清单＋锚点 commit，同步前必读）
