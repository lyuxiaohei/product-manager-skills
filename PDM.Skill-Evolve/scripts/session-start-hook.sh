#!/bin/sh
# SessionStart hook: inject PDM.Skill-Evolve activation + review state as additionalContext.
# 源自 task-observer environments.md 钩子模板，本地化：工作区锚定 + 双语指令 + 中技能名
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
