---
name: openclaw-install
description: OpenClaw安装技能（Windows）。帮助用户在Windows上安装OpenClaw多渠道AI网关。自动检查环境依赖（Node.js、Git）、切换国内镜像源加速下载、执行NPM全局安装、配置AI模型提供商、启动Gateway服务、诊断故障。触发场景：安装OpenClaw、配置OpenClaw、OpenClaw环境搭建、OpenClaw报错等。
---

# openclaw-install

帮助用户在 **Windows** 上快速安装和配置 OpenClaw 多渠道 AI 网关。

---

## 触发场景

- "安装 OpenClaw"
- "帮我配置 OpenClaw"
- "OpenClaw 环境搭建"
- "安装 openclaw"
- "OpenClaw 报错"
- "OpenClaw Dashboard 打不开"

---

## 什么是 OpenClaw

OpenClaw 是一个多渠道 AI 网关，支持多种消息平台集成（WhatsApp、飞书、企业微信等），可通过插件扩展功能。

**官网**: https://openclaw.io
**NPM包名**: `openclaw`

---

## 完整安装流程

```
环境检查 → 切换镜像源 → NPM安装 → 安装依赖 → 配置模型 → 启动Gateway → 打开Dashboard
```

---

## Step 1：环境检查

### 检查 Node.js

```bash
node --version
```

**期望输出**: `v18.x.x` 或更高

**未安装**:
1. 访问 https://nodejs.org
2. 下载 LTS 版本安装程序
3. 运行安装向导
4. 重新打开终端验证

### 检查 Git

```bash
git --version
```

**期望输出**: `git version 2.x.x`

**未安装**:
1. 访问 https://git-scm.com/download/win
2. 下载安装程序
3. 运行安装向导
4. 重新打开终端验证

---

## Step 2：切换国内镜像源

### 查看当前源

```bash
npm config get registry
```

### 切换到国内镜像

```bash
npm config set registry https://registry.npmmirror.com
```

**镜像源选项**:

| 源 | 地址 | 说明 |
|---|------|------|
| 淘宝镜像 | https://registry.npmmirror.com | 推荐 |
| 腾讯镜像 | https://mirrors.cloud.tencent.com/npm/ | 备选 |
| 官方源 | https://registry.npmjs.org | 国外使用 |

---

## Step 3：安装 OpenClaw

### 安装命令

```bash
npm install -g openclaw@latest --verbose
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `-g` | 全局安装，所有目录可用 |
| `@latest` | 安装最新版本 |
| `--verbose` | 显示详细日志（可选） |

### 安装时长

- 国内镜像：约 2-5 分钟
- 官方源：约 5-15 分钟

---

## Step 4：安装缺失依赖

部分插件可能需要额外依赖，如遇到插件加载错误：

```bash
# AWS SDK（用于 Amazon Bedrock 插件）
npm install -g @aws-sdk/client-bedrock
```

---

## Step 5：验证安装

### 检查版本

```bash
openclaw --version
```

**成功输出**: `OpenClaw 2026.x.x (xxxxxxx)`

### 查看帮助

```bash
openclaw --help
```

---

## Step 6：配置 AI 模型

### 非交互式配置（推荐）

使用命令行参数直接配置，无需交互：

```bash
openclaw onboard --non-interactive --accept-risk --mode local \
  --flow quickstart \
  --skip-channels --skip-skills --skip-search --skip-health --skip-ui \
  --modelstudio-api-key-cn "<YOUR_API_KEY>"
```

**注意**: 将 `<YOUR_API_KEY>` 替换为你的实际 API Key。

### 支持的模型提供商参数

| 提供商 | 参数 | 说明 |
|--------|------|------|
| 阿里百炼（中国） | `--modelstudio-api-key-cn` | 推荐国内用户 |
| 阿里百炼（国际） | `--modelstudio-api-key` | 国际版 |
| 百度千帆 | `--qianfan-api-key` | 有免费额度 |
| DeepSeek | `--deepseek-api-key` | 价格便宜 |
| OpenAI | `--openai-api-key` | GPT模型 |
| Gemini | `--gemini-api-key` | Google模型 |
| Anthropic | `--anthropic-api-key` | Claude模型 |

### 阿里百炼可用模型

配置成功后，默认可用以下模型：

| 模型ID | 说明 | 上下文长度 |
|--------|------|-----------|
| `qwen3.5-plus` | 默认模型，推荐 | 1M tokens |
| `qwen3-max-2026-01-23` | 高性能模型 | 256K tokens |
| `qwen3-coder-next` | 编程专用 | 256K tokens |
| `qwen3-coder-plus` | 编程增强 | 1M tokens |
| `MiniMax-M2.5` | 推理模型 | 1M tokens |
| `glm-5` / `glm-4.7` | 智谱模型 | 200K tokens |
| `kimi-k2.5` | 月之暗面 | 256K tokens |

### 交互式配置

如需交互式配置，运行：

```bash
openclaw configure
```

---

## Step 7：启动 Gateway

### 前台运行

```bash
openclaw gateway run
```

### 后台运行

```bash
# 在后台运行
openclaw gateway run &

# 或安装为系统服务
openclaw gateway install
```

### 查看状态

```bash
openclaw gateway status
```

**期望输出**:
```
Gateway: bind=loopback (127.0.0.1), port=18789
Listening: 127.0.0.1:18789
RPC probe: ok
```

---

## Step 8：打开 Dashboard

### 正确打开方式

**方式1：命令行打开（推荐）**

```bash
openclaw dashboard
```

此命令会自动在 URL 中携带 Token，直接打开可用。

**方式2：手动打开**

1. 浏览器访问：http://127.0.0.1:18789/
2. 在设置中粘贴 Gateway Token

### 获取 Gateway Token

```bash
# 方法1：从配置文件获取
cat ~/.openclaw/openclaw.json | grep -A2 '"token"'

# 方法2：直接打开 Dashboard（Token 会自动带在 URL 中）
openclaw dashboard
```

### Dashboard URL 格式

```
http://127.0.0.1:18789/#token=<YOUR_GATEWAY_TOKEN>
```

---

## 设备配对

### 查看设备状态

```bash
openclaw devices list
```

**输出说明**:
- `Pending`: 待批准的配对请求
- `Paired`: 已配对的设备

### 批准配对请求

```bash
# 列出待处理请求
openclaw devices list

# 批准指定请求（用实际的 Request ID 替换）
openclaw devices approve <request-id>
```

### 配对成功标志

- `Pending` 列表为空
- `Paired` 列表显示设备
- Dashboard 正常显示，无报错

---

## 故障诊断

### 诊断命令

```bash
# 运行完整诊断
openclaw doctor

# 查看日志
openclaw logs

# 查看 Gateway 状态
openclaw gateway status

# 查看设备配对状态
openclaw devices list
```

### 常见错误与解决方案

#### 1. Dashboard 报错 "unauthorized: gateway token missing"

**症状**: 打开 Dashboard 显示未授权错误

**原因**: Dashboard 未携带 Gateway Token

**解决方案**:
```bash
# 使用命令打开（推荐）
openclaw dashboard

# 或手动获取 Token 并在 Dashboard 设置中输入
cat ~/.openclaw/openclaw.json | grep -A2 '"token"'
```

#### 2. 报错 "pairing required"

**症状**: CLI 命令失败，提示需要配对

**原因**: 设备未完成配对流程

**解决方案**:
```bash
# 查看待处理请求
openclaw devices list

# 批准配对请求
openclaw devices approve <request-id>
```

#### 3. 插件加载失败

**症状**: `PluginLoadFailureError: plugin load failed: amazon-bedrock`

**原因**: 缺少插件依赖

**解决方案**:
```bash
npm install -g @aws-sdk/client-bedrock
```

#### 4. 包名错误

**症状**: `404 Not Found` 或安装失败

| 错误包名 | 正确包名 |
|----------|----------|
| `opencode` ❌ | `openclaw` ✅ |
| `open-claw` ❌ | `openclaw` ✅ |
| `@anthropic-ai/claude-code` | 这是 Claude Code，不是 OpenClaw |

#### 5. 权限错误

**症状**: `EACCES permission denied`

**解决**: 以管理员身份运行终端

#### 6. 网络超时

**症状**: `ETIMEDOUT` 或下载极慢

**解决**: 切换国内镜像源
```bash
npm config set registry https://registry.npmmirror.com
```

#### 7. Gateway 无法启动

**解决方案**:
1. 检查端口是否被占用
2. 使用 `--force` 强制启动：`openclaw gateway run --force`
3. 查看日志：`openclaw logs`

#### 8. Memory search 警告

**症状**: `No API key found for provider "openai"`

**说明**: 这是可选功能，不影响基本使用

**解决**（可选）:
```bash
# 配置 embedding provider
openclaw configure --section model

# 或禁用 memory search
openclaw config set agents.defaults.memorySearch.enabled false
```

---

## 配置文件位置

| 文件 | 路径 |
|------|------|
| 主配置 | `~\.openclaw\openclaw.json` |
| 工作目录 | `~\.openclaw\workspace` |
| 会话目录 | `~\.openclaw\agents\main\sessions` |
| 日志目录 | `~\AppData\Local\Temp\openclaw\` |

---

## 配置文件示例

```json
{
  "agents": {
    "defaults": {
      "workspace": "C:\\Users\\{用户名}\\openclaw\\workspace",
      "model": {
        "primary": "modelstudio/qwen3.5-plus"
      }
    }
  },
  "gateway": {
    "mode": "local",
    "auth": {
      "mode": "token",
      "token": "<自动生成>"
    },
    "port": 18789,
    "bind": "loopback"
  },
  "models": {
    "providers": {
      "modelstudio": {
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
        "api": "openai-completions"
      }
    }
  }
}
```

---

## 常用命令速查

### 安装与配置

```bash
# 安装
npm install -g openclaw@latest

# 验证安装
openclaw --version

# 非交互式配置
openclaw onboard --non-interactive --accept-risk --mode local \
  --modelstudio-api-key-cn "<YOUR_API_KEY>"

# 交互式配置
openclaw configure
```

### Gateway 管理

```bash
# 前台运行
openclaw gateway run

# 查看状态
openclaw gateway status

# 安装后台服务
openclaw gateway install

# 启动/停止/重启
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
```

### Dashboard 与诊断

```bash
# 打开 Dashboard
openclaw dashboard

# 运行诊断
openclaw doctor

# 查看日志
openclaw logs

# 查看设备配对状态
openclaw devices list

# 批准配对请求
openclaw devices approve <request-id>
```

### 使用界面

```bash
# 终端界面
openclaw tui

# Web 控制台
openclaw dashboard

# 查看日志
openclaw logs
```

---

## 安装成功检查清单

| 检查项 | 命令 | 期望结果 |
|--------|------|----------|
| Node.js | `node --version` | v18+ |
| Git | `git --version` | 2.x.x |
| 镜像源 | `npm config get registry` | npmmirror.com |
| OpenClaw | `openclaw --version` | 2026.x.x |
| Gateway | `openclaw gateway status` | RPC probe: ok |
| 设备配对 | `openclaw devices list` | Paired 有设备，Pending 为空 |
| Dashboard | 浏览器访问 | 正常显示，无报错 |

---

## 卸载

```bash
# 卸载 OpenClaw
npm uninstall -g openclaw

# 重置配置（保留 CLI）
openclaw reset

# 完全卸载（包括配置）
openclaw uninstall
```

---

## 相关资源

- **官网**: https://openclaw.io
- **GitHub**: https://github.com/openclaw/openclaw
- **文档**: https://docs.openclaw.io
- **NPM**: https://www.npmjs.com/package/openclaw
- **Windows 指南**: https://docs.openclaw.ai/windows
- **故障排除**: https://docs.openclaw.ai/troubleshooting