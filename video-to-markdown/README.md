# video-to-markdown

> 🎬 Claude Code Skill - 视频一键转Markdown思维导图

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)]()
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-purple.svg)]()

一个用于 [Claude Code](https://claude.ai/code) 的 skill，一键将视频转换为 Markdown 思维导图笔记。

> ⚠️ **平台限制**：当前版本仅支持 Windows。macOS/Linux 支持计划在后续版本中添加。

---

## 📖 目录

- [功能特性](#功能特性)
- [安装方式](#安装方式)
- [触发场景](#触发场景)
- [系统要求](#系统要求)
- [使用示例](#使用示例)
- [输出文件](#输出文件)
- [支持的平台](#支持的平台)
- [Whisper模型选择](#whisper模型选择)
- [常见问题](#常见问题)
- [相关链接](#相关链接)
- [许可证](#许可证)

---

## 功能特性

| 特性 | 说明 |
|------|------|
| 🎥 多平台支持 | B站、YouTube、抖音、小红书等主流视频平台 |
| 🎤 本地转录 | 使用 Whisper 本地转录，隐私安全 |
| 📝 结构化输出 | 自动生成 Markdown 思维导图格式 |
| 📦 三合一输出 | 音频 + 原始转录 + Markdown笔记 |
| 🚀 一键完成 | 一条指令完成全部流程 |

---

## 安装方式

### 方式1：使用 findskill（推荐）

```bash
# 安装 findskill CLI
npm install -g findskill

# 安装此 skill
findskill install video-to-markdown
```

### 方式2：手动安装

```bash
# 克隆仓库到 Claude skills 目录
git clone https://github.com/lyuxiaohei/video-to-markdown.git ~/.claude/skills/video-to-markdown
```

### 方式3：手动复制

将 `SKILL.md` 复制到 Claude skills 目录：

**Windows**:
```
C:\Users\{用户名}\.claude\skills\video-to-markdown\SKILL.md
```

---

## 触发场景

在 Claude Code 中使用以下指令触发：

| 触发词 | 说明 |
|--------|------|
| `转录这个视频` | 完整转录流程 |
| `把视频转成文字` | 视频转文字 |
| `提取视频内容` | 提取视频核心内容 |
| `视频笔记` | 生成视频笔记 |
| `解析此视频` | 解析视频链接 |
| `视频文字稿` | 生成视频文字稿 |

---

## 系统要求

| 依赖 | 版本要求 | 安装方式 | 必需 |
|------|---------|----------|------|
| Node.js | v18+ | https://nodejs.org | ✅ 必需 |
| Python | 3.10+ | https://python.org | ✅ 必需 |
| yt-dlp | 最新版 | `winget install yt-dlp.yt-dlp` | ✅ 必需 |
| ffmpeg | 最新版 | `winget install yt-dlp.FFmpeg` | ✅ 必需 |
| Whisper | 最新版 | `pip install openai-whisper` | ✅ 必需 |

**Windows 特定要求**：
- Windows 10/11
- PowerShell 5.1+ 或 Git Bash

---

## 使用示例

### 基本使用

```
用户: https://www.bilibili.com/video/BV1xxP8zQEJe 解析此视频

Claude: 🎬 开始视频转录...

📥 [步骤1/3] 下载音频
   → 下载视频音频...
   → 保存为：_temp_audio.m4a (5.2 MB)

🎤 [步骤2/3] Whisper 转录
   → 加载 base 模型...
   → 处理音频文件...
   → 生成原始转录稿...

📝 [步骤3/3] 生成 Markdown
   → 分析内容结构...
   → 提取关键要点...
   → 转换思维导图格式...

📦 [步骤4/4] 重命名文件

✅ 完成！输出文件：
   📁 OpenClaw AI编程指南.m4a
   📁 OpenClaw AI编程指南.txt
   📁 OpenClaw AI编程指南.md
```

---

## 输出文件

完成后生成三个同名文件：

| 文件 | 格式 | 用途 |
|------|------|------|
| `[视频标题].m4a` | 音频 | 备份/二次处理 |
| `[视频标题].txt` | 文本 | 原始转录稿（完整录音） |
| `[视频标题].md` | Markdown | **结构化思维导图** |

**保存位置**：`C:\Users\{用户名}\Downloads\`

### Markdown 输出格式

输出风格：自然简洁，去AI味，克制使用Emoji。

```markdown
# [视频标题]

## 元信息
- 来源：B站视频转录
- 链接：[视频URL]
- 时间：2026-04-03
- 时长：约X分钟

---

## 概览

[2-3句话概括核心内容]

---

## 内容结构

### 1. [章节标题]

[直接陈述内容]

**要点：**
- [具体要点1]
- [具体要点2]

### 2. [章节标题]

[内容说明]

---

## 关键信息

- [核心信息1]
- [核心信息2]
```

### 写作风格

| 避免 | 推荐 |
|------|------|
| "本文将介绍..." | 直接陈述观点 |
| "值得注意的是..." | 用事实说明重要性 |
| "综上所述..." | 自然收尾，无需总结 |
| 过多Emoji装饰 | 仅在元信息区使用1-2个 |
| 模糊形容词 | 具体数据和事实 |

---

## 支持的平台

| 平台 | 状态 |
|------|------|
| Bilibili (B站) | ✅ 支持 |
| YouTube | ✅ 支持 |
| 抖音 | ✅ 支持 |
| TikTok | ✅ 支持 |
| 小红书 | ✅ 支持 |
| 其他 yt-dlp 支持的平台 | ✅ 支持 |

---

## Whisper模型选择

| 模型 | 速度 | 准确率 | 适用场景 |
|------|------|--------|----------|
| tiny | 最快 | 较低 | 快速预览 |
| base | 快 | 良好 | **推荐** |
| small | 中等 | 较高 | 高质量需求 |
| medium | 较慢 | 高 | 专业场景 |

---

## 常见问题

### 1. 下载失败

**原因**：网络问题或视频链接无效

**解决**：
- 检查视频链接是否有效
- 检查网络连接
- 更新 yt-dlp：`yt-dlp -U`

### 2. 转录准确率低

**原因**：音频质量差或模型太小

**解决**：
- 使用更大的模型（small/medium）
- 确保音频清晰

### 3. 中文乱码

**原因**：编码问题

**解决**：
- 确保使用 UTF-8 编码
- 使用临时文件名避免中文路径

### 4. 处理时间过长

**原因**：视频太长或模型太大

**解决**：
- 使用更小的模型（tiny/base）
- 耐心等待，长视频需要更多时间

---

## 相关链接

| 资源 | 链接 |
|------|------|
| Claude Code | https://claude.ai/code |
| yt-dlp | https://github.com/yt-dlp/yt-dlp |
| OpenAI Whisper | https://github.com/openai/whisper |
| ffmpeg | https://ffmpeg.org |

---

## 许可证

[MIT License](LICENSE)

---

## 作者

**lyuxiaohei**

- GitHub: https://github.com/lyuxiaohei
- Email: xiaohei.lyu@protonmail.com

---

---

# English Version

# video-to-markdown

> 🎬 Claude Code Skill - Convert Video to Markdown Mind Map in One Click

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)]()
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-purple.svg)]()

A skill for [Claude Code](https://claude.ai/code) that converts videos to Markdown mind map notes in one click.

> ⚠️ **Platform Limitation**: Current version only supports Windows. macOS/Linux support is planned for future releases.

---

## Features

| Feature | Description |
|---------|-------------|
| 🎥 Multi-platform | Bilibili, YouTube, TikTok, Xiaohongshu and more |
| 🎤 Local Transcription | Uses Whisper locally for privacy |
| 📝 Structured Output | Auto-generates Markdown mind map format |
| 📦 Three-in-one Output | Audio + Raw transcript + Markdown notes |
| 🚀 One Click | Complete workflow with single command |

---

## Installation

### Option 1: Using findskill (Recommended)

```bash
npm install -g findskill
findskill install video-to-markdown
```

### Option 2: Manual Installation

```bash
git clone https://github.com/lyuxiaohei/video-to-markdown.git ~/.claude/skills/video-to-markdown
```

---

## Trigger Scenarios

| Trigger | Description |
|---------|-------------|
| `转录这个视频` | Full transcription |
| `把视频转成文字` | Video to text |
| `提取视频内容` | Extract video content |
| `视频笔记` | Video notes |
| `解析此视频` | Parse this video |

---

## System Requirements

| Dependency | Version | Required |
|------------|---------|----------|
| Node.js | v18+ | ✅ |
| Python | 3.10+ | ✅ |
| yt-dlp | latest | ✅ |
| ffmpeg | latest | ✅ |
| Whisper | latest | ✅ |

---

## Output Files

| File | Format | Purpose |
|------|--------|---------|
| `[title].m4a` | Audio | Backup/Re-processing |
| `[title].txt` | Text | Raw transcript |
| `[title].md` | Markdown | **Structured mind map** |

---

## Supported Platforms

- Bilibili ✅
- YouTube ✅
- TikTok ✅
- Xiaohongshu ✅
- All yt-dlp supported platforms ✅

---

## License

[MIT License](LICENSE)

---

> 💡 If this skill helped you, please Star on GitHub!
