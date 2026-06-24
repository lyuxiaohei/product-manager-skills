# openclaw-install

> 🤖 Claude Code Skill - 自动化安装 OpenClaw 多渠道 AI 网关

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)]()
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-purple.svg)]()

一个用于 [Claude Code](https://claude.ai/code) 的 skill，帮助用户在 **Windows** 上快速安装和配置 OpenClaw 多渠道 AI 网关。

> ⚠️ **平台限制**：当前版本仅支持 Windows。macOS/Linux 支持计划在后续版本中添加。

---

## 📖 目录

- [安装方式](#安装方式)
- [触发场景](#触发场景)
- [功能特性](#功能特性)
- [系统要求](#系统要求)
- [使用示例](#使用示例)
- [支持的模型提供商](#支持的模型提供商)
- [故障诊断](#故障诊断)
- [相关链接](#相关链接)
- [贡献指南](#贡献指南)
- [更新日志](#更新日志)
- [许可证](#许可证)

---

## 安装方式

### 方式1：使用 findskill（推荐）

```bash
# 安装 findskill CLI
npm install -g findskill

# 搜索此 skill
findskill search openclaw

# 安装 skill
findskill install openclaw-install
```

### 方式2：手动安装

```bash
# 克隆仓库到 Claude skills 目录
git clone https://github.com/lyuxiaohei/openclaw-install.git ~/.claude/skills/openclaw-install
```

### 方式3：手动复制

将 `SKILL.md` 复制到 Claude skills 目录：

**Windows**:
```
C:\Users\{用户名}\.claude\skills\openclaw-install\SKILL.md
```

**macOS/Linux**（未来支持）:
```
~/.claude/skills/openclaw-install/SKILL.md
```

---

## 触发场景

在 Claude Code 中使用以下指令触发此 skill：

| 触发词 | 说明 |
|--------|------|
| `安装 OpenClaw` | 完整安装流程 |
| `帮我配置 OpenClaw` | 配置模型和 Gateway |
| `OpenClaw 环境搭建` | 环境检查和安装 |
| `安装 openclaw` | 安装命令 |
| `OpenClaw 报错` | 故障诊断 |
| `OpenClaw Dashboard 打不开` | Dashboard 问题排查 |
| `OpenClaw Gateway 启动失败` | Gateway 问题排查 |

---

## 功能特性

此 skill 提供以下自动化功能：

| 功能 | 说明 |
|------|------|
| ✅ 环境检查 | 自动检测 Node.js、Git 是否已安装 |
| ✅ 镜像源切换 | 切换国内镜像源加速下载（淘宝/腾讯镜像） |
| ✅ NPM 安装 | 执行全局安装 `npm install -g openclaw` |
| ✅ 依赖安装 | 自动安装缺失的插件依赖 |
| ✅ 模型配置 | 配置 AI 模型提供商（阿里百炼、DeepSeek 等） |
| ✅ Gateway 启动 | 启动本地 Gateway 服务 |
| ✅ Dashboard 打开 | 自动打开 Web 控制台 |
| ✅ 设备配对 | 完成设备配对流程 |
| ✅ 故障诊断 | 诊断常见错误并提供解决方案 |

---

## 系统要求

| 依赖 | 版本要求 | 安装方式 | 必需 |
|------|---------|----------|------|
| Node.js | v18+ | https://nodejs.org | ✅ 必需 |
| Git | 2.x.x | https://git-scm.com | ✅ 必需 |
| npm | 随 Node.js | - | ✅ 必需 |
| ffmpeg | 最新版 | https://ffmpeg.org | ⚪ 可选（部分插件需要） |

**Windows 特定要求**：
- Windows 10/11
- PowerShell 5.1+ 或 Git Bash
- 管理员权限（某些安装步骤可能需要）

---

## 使用示例

### 完整安装对话

```
用户: 安装 OpenClaw

Claude: 我来帮你安装 OpenClaw...

🔍 [Step 1/8] 环境检查
   → Node.js: v20.10.0 ✅
   → Git: 2.43.0 ✅
   → npm: 10.2.0 ✅

🌐 [Step 2/8] 切换镜像源
   → 当前源: https://registry.npmjs.org
   → 切换到: https://registry.npmmirror.com ✅

📦 [Step 3/8] 安装 OpenClaw
   → npm install -g openclaw@latest --verbose
   → 安装完成 (v2026.1.15)

✅ [Step 4/8] 验证安装
   → openclaw --version: OpenClaw 2026.1.15 ✅

⚙️ [Step 5/8] 配置模型
   → 请提供 API Key（阿里百炼推荐国内用户）

   用户: 我的 API Key 是 sk-xxx

   → 配置成功，默认模型: qwen3.5-plus

🚀 [Step 6/8] 启动 Gateway
   → openclaw gateway run
   → Gateway 已启动: 127.0.0.1:18789

📱 [Step 7/8] 设备配对
   → openclaw devices list
   → 检测到配对请求，请批准...

   用户: 批准配对

   → 配对成功 ✅

🌐 [Step 8/8] 打开 Dashboard
   → openclaw dashboard
   → Dashboard 已打开 ✅

✅ 安装完成！
```

### 故障诊断示例

```
用户: OpenClaw Dashboard 打不开，显示 unauthorized

Claude: 我来诊断问题...

🔍 诊断结果：
   → Gateway 状态: running ✅
   → Dashboard Token: 未设置 ❌

💡 解决方案：
   → 使用 openclaw dashboard 命令打开（自动携带 Token）
   → 或手动获取 Token: cat ~/.openclaw/openclaw.json

   执行: openclaw dashboard ✅
```

---

## 支持的模型提供商

此 skill 支持配置以下 AI 模型提供商：

| 提供商 | 参数 | 推荐场景 | 价格 |
|--------|------|----------|------|
| 阿里百炼（中国） | `--modelstudio-api-key-cn` | 🇨🇳 国内用户首选 | 低 |
| 阿里百炼（国际） | `--modelstudio-api-key` | 🌍 国际用户 | 低 |
| DeepSeek | `--deepseek-api-key` | 💰 价格最优 | 极低 |
| 百度千帆 | `--qianfan-api-key` | 🎁 有免费额度 | 中 |
| OpenAI | `--openai-api-key` | 🤖 GPT 模型 | 高 |
| Gemini | `--gemini-api-key` | 🔍 Google 模型 | 中 |
| Anthropic | `--anthropic-api-key` | 🧠 Claude 模型 | 高 |

### 阿里百炼可用模型

配置阿里百炼后，默认可用：

| 模型ID | 说明 | 上下文长度 |
|--------|------|-----------|
| `qwen3.5-plus` | 默认模型，推荐 | 1M tokens |
| `qwen3-max` | 高性能模型 | 256K tokens |
| `qwen3-coder` | 编程专用 | 256K tokens |
| `glm-5` | 智谱模型 | 200K tokens |
| `kimi-k2.5` | 月之暗面 | 256K tokens |

---

## 故障诊断

### 常见错误速查表

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `unauthorized: gateway token missing` | Dashboard 未携带 Token | 使用 `openclaw dashboard` 打开 |
| `pairing required` | 设备未配对 | `openclaw devices approve <id>` |
| `PluginLoadFailureError` | 缺少插件依赖 | `npm install -g @aws-sdk/client-bedrock` |
| `EACCES permission denied` | 权限不足 | 以管理员身份运行终端 |
| `ETIMEDOUT` | 网络超时 | 切换镜像源 `npm config set registry https://registry.npmmirror.com` |
| `404 Not Found` | 包名错误 | 正确包名是 `openclaw`（不是 `opencode`） |

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

---

## 相关链接

| 资源 | 链接 |
|------|------|
| OpenClaw 官网 | https://openclaw.io |
| OpenClaw GitHub | https://github.com/openclaw/openclaw |
| OpenClaw 文档 | https://docs.openclaw.io |
| OpenClaw NPM | https://www.npmjs.com/package/openclaw |
| Windows 安装指南 | https://docs.openclaw.ai/windows |
| 故障排除文档 | https://docs.openclaw.ai/troubleshooting |
| findskill CLI | https://npmjs.com/package/findskill |
| Claude Code | https://claude.ai/code |

---

## 贡献指南

欢迎贡献！以下是参与方式：

### 报告问题

在 [GitHub Issues](https://github.com/lyuxiaohei/openclaw-install/issues) 中提交：
- 问题描述
- 错误日志
- 系统环境信息

### 提交改进

1. Fork 仓库
2. 创建分支: `git checkout -b feature/improvement`
3. 提交更改: `git commit -m "Add improvement"`
4. 推送分支: `git push origin feature/improvement`
5. 创建 Pull Request

### 未来计划

- [ ] 支持 macOS 安装
- [ ] 支持 Linux 安装
- [ ] 添加自动更新检测
- [ ] 添加更多模型提供商配置

---

## 更新日志

### v1.0.0 (2026-04-03)

- ✅ 初始版本发布
- ✅ 支持 Windows 平台完整安装流程
- ✅ 支持阿里百炼、DeepSeek 等模型提供商配置
- ✅ 包含完整的故障诊断指南
- ✅ 支持设备配对流程

---

## 许可证

[MIT License](LICENSE) - 可自由使用、修改和分发。

---

## 作者

**lyuxiaohei**

- GitHub: https://github.com/lyuxiaohei
- Email: xiaohei.lyu@protonmail.com

---

> 💡 如果这个 skill 帮助了你，欢迎在 GitHub 上 Star 支持！

---

---

# English Version

# openclaw-install

> 🤖 Claude Code Skill - Automated OpenClaw Multi-channel AI Gateway Installation

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)]()
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-purple.svg)]()

A skill for [Claude Code](https://claude.ai/code) that helps users quickly install and configure OpenClaw multi-channel AI gateway on **Windows**.

> ⚠️ **Platform Limitation**: Current version only supports Windows. macOS/Linux support is planned for future releases.

---

## 📖 Table of Contents

- [Installation](#installation)
- [Trigger Scenarios](#trigger-scenarios)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Usage Example](#usage-example)
- [Supported Model Providers](#supported-model-providers)
- [Troubleshooting](#troubleshooting)
- [Related Links](#related-links)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

---

## Installation

### Option 1: Using findskill (Recommended)

```bash
# Install findskill CLI
npm install -g findskill

# Search for this skill
findskill search openclaw

# Install the skill
findskill install openclaw-install
```

### Option 2: Manual Installation

```bash
# Clone repository to Claude skills directory
git clone https://github.com/lyuxiaohei/openclaw-install.git ~/.claude/skills/openclaw-install
```

### Option 3: Manual Copy

Copy `SKILL.md` to Claude skills directory:

**Windows**:
```
C:\Users\{username}\.claude\skills\openclaw-install\SKILL.md
```

**macOS/Linux** (future support):
```
~/.claude/skills/openclaw-install/SKILL.md
```

---

## Trigger Scenarios

Use the following commands in Claude Code to trigger this skill:

| Trigger | Description |
|---------|-------------|
| `安装 OpenClaw` | Full installation flow |
| `帮我配置 OpenClaw` | Configure model and Gateway |
| `OpenClaw 环境搭建` | Environment check and installation |
| `安装 openclaw` | Installation command |
| `OpenClaw 报错` | Troubleshooting |
| `OpenClaw Dashboard 打不开` | Dashboard issue diagnosis |
| `OpenClaw Gateway 启动失败` | Gateway issue diagnosis |

---

## Features

This skill provides the following automation:

| Feature | Description |
|---------|-------------|
| ✅ Environment Check | Auto-detect Node.js, Git installation |
| ✅ Mirror Switch | Switch to China mirror for faster download |
| ✅ NPM Install | Execute global install `npm install -g openclaw` |
| ✅ Dependency Install | Auto-install missing plugin dependencies |
| ✅ Model Config | Configure AI model providers |
| ✅ Gateway Start | Start local Gateway service |
| ✅ Dashboard Open | Auto-open Web console |
| ✅ Device Pairing | Complete device pairing flow |
| ✅ Troubleshooting | Diagnose common errors and provide solutions |

---

## System Requirements

| Dependency | Version | Installation | Required |
|------------|---------|--------------|----------|
| Node.js | v18+ | https://nodejs.org | ✅ Required |
| Git | 2.x.x | https://git-scm.com | ✅ Required |
| npm | with Node.js | - | ✅ Required |
| ffmpeg | latest | https://ffmpeg.org | ⚪ Optional |

**Windows Specific**:
- Windows 10/11
- PowerShell 5.1+ or Git Bash
- Administrator privileges (may be needed for some steps)

---

## Usage Example

### Full Installation Flow

```
User: 安装 OpenClaw

Claude: Let me help you install OpenClaw...

🔍 [Step 1/8] Environment Check
   → Node.js: v20.10.0 ✅
   → Git: 2.43.0 ✅
   → npm: 10.2.0 ✅

🌐 [Step 2/8] Switch Mirror
   → Current: https://registry.npmjs.org
   → Switched to: https://registry.npmmirror.com ✅

📦 [Step 3/8] Install OpenClaw
   → npm install -g openclaw@latest --verbose
   → Installed (v2026.1.15)

✅ [Step 4/8] Verify Installation
   → openclaw --version: OpenClaw 2026.1.15 ✅

⚙️ [Step 5/8] Configure Model
   → Please provide API Key

   User: My API Key is sk-xxx

   → Configured, default model: qwen3.5-plus

🚀 [Step 6/8] Start Gateway
   → openclaw gateway run
   → Gateway started: 127.0.0.1:18789

📱 [Step 7/8] Device Pairing
   → openclaw devices list
   → Pairing request detected...

   User: Approve pairing

   → Paired successfully ✅

🌐 [Step 8/8] Open Dashboard
   → openclaw dashboard
   → Dashboard opened ✅

✅ Installation complete!
```

---

## Supported Model Providers

This skill supports configuring the following AI model providers:

| Provider | Parameter | Recommended For | Price |
|----------|-----------|-----------------|-------|
| Alibaba ModelStudio (China) | `--modelstudio-api-key-cn` | 🇨🇳 China users | Low |
| Alibaba ModelStudio (Global) | `--modelstudio-api-key` | 🌍 International | Low |
| DeepSeek | `--deepseek-api-key` | 💰 Best price | Very Low |
| Baidu Qianfan | `--qianfan-api-key` | 🎁 Free tier | Medium |
| OpenAI | `--openai-api-key` | 🤖 GPT models | High |
| Gemini | `--gemini-api-key` | 🔍 Google models | Medium |
| Anthropic | `--anthropic-api-key` | 🧠 Claude models | High |

---

## Troubleshooting

### Common Errors Quick Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `unauthorized: gateway token missing` | Dashboard missing Token | Use `openclaw dashboard` to open |
| `pairing required` | Device not paired | `openclaw devices approve <id>` |
| `PluginLoadFailureError` | Missing plugin dependency | `npm install -g @aws-sdk/client-bedrock` |
| `EACCES permission denied` | Insufficient permissions | Run terminal as administrator |
| `ETIMEDOUT` | Network timeout | Switch mirror `npm config set registry https://registry.npmmirror.com` |
| `404 Not Found` | Wrong package name | Correct name is `openclaw` (not `opencode`) |

### Diagnostic Commands

```bash
# Run full diagnosis
openclaw doctor

# View logs
openclaw logs

# Check Gateway status
openclaw gateway status

# Check device pairing status
openclaw devices list
```

---

## Related Links

| Resource | Link |
|----------|------|
| OpenClaw Website | https://openclaw.io |
| OpenClaw GitHub | https://github.com/openclaw/openclaw |
| OpenClaw Docs | https://docs.openclaw.io |
| OpenClaw NPM | https://www.npmjs.com/package/openclaw |
| Windows Guide | https://docs.openclaw.ai/windows |
| Troubleshooting | https://docs.openclaw.ai/troubleshooting |
| findskill CLI | https://npmjs.com/package/findskill |
| Claude Code | https://claude.ai/code |

---

## Contributing

Contributions welcome!

### Report Issues

Submit at [GitHub Issues](https://github.com/lyuxiaohei/openclaw-install/issues):
- Issue description
- Error logs
- System environment info

### Submit Improvements

1. Fork the repository
2. Create branch: `git checkout -b feature/improvement`
3. Commit changes: `git commit -m "Add improvement"`
4. Push branch: `git push origin feature/improvement`
5. Create Pull Request

### Future Plans

- [ ] macOS support
- [ ] Linux support
- [ ] Auto-update detection
- [ ] More model provider configurations

---

## Changelog

### v1.0.0 (2026-04-03)

- ✅ Initial release
- ✅ Windows platform full installation flow
- ✅ Model provider configuration (Alibaba, DeepSeek, etc.)
- ✅ Complete troubleshooting guide
- ✅ Device pairing flow support

---

## License

[MIT License](LICENSE) - Free to use, modify, and distribute.

---

## Author

**lyuxiaohei**

- GitHub: https://github.com/lyuxiaohei
- Email: xiaohei.lyu@protonmail.com

---

> 💡 If this skill helped you, please Star on GitHub!