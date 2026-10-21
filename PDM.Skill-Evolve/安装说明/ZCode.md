# ZCode 安装步骤

通用内容（前置条件、路径替换、部署位置、验证、附录）见 [README.md](README.md)。完整序列：

## 1. 复制技能本体

```
C:\Users\<用户>\.zcode\skills\PDM.Skill-Evolve\
```

（正本在项目 `5-A34-AI项目工程化技能/skills/`，先落正本再装 agent，三份一致。）

## 2. 路径替换（新机器必做）

见 [README.md · 路径替换](README.md#路径替换新机器必做)。

## 3. 部署钩子脚本

见 [README.md · 共用部署位置](README.md#共用部署位置两个-agent-相同不随-agent-变)：`session-start-hook.sh` → `C:/Users/<用户>/.zcode/hooks/`、`save-prompt.js` → `C:/Users/<用户>/.claude/hooks/`。

## 4. 注册会话启动钩子（唯一强制激活层）

命令格式（bash 完整路径 + 脚本路径）：

```
"<bash完整路径>" "C:/Users/<用户>/.zcode/hooks/session-start-hook.sh"
```

写入 `C:\Users\<用户>\.zcode\cli\config.json`：

```json
"hooks": {
  "enabled": true,
  "events": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "<上述命令>" } ] }
    ]
  }
}
```

## 5. 提示词钩子（融合件）

save-prompt.js 已按第 3 步部署到 `C:/Users/<用户>/.claude/hooks/`（两 agent 共用此部署位置）。在**同一 config.json** 的 `hooks.events` 下注册 `UserPromptSubmit` 事件（格式同上节，事件名换 `UserPromptSubmit`）：

```json
"hooks": {
  "enabled": true,
  "events": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "<上述命令>" } ] }
    ],
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "\"<node完整路径>\" \"C:/Users/<用户>/.claude/hooks/save-prompt.js\"" } ] }
    ]
  }
}
```

## 6. 安装验证

新开会话，按 [README.md · 安装验证](README.md#安装验证新开会话三问) 三问＋客观文件验证。
