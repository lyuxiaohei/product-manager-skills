---
name: video-to-markdown
description: 视频转Markdown技能。当用户提供视频链接（B站/YouTube/抖音等）并要求转录、提取文字稿、转文字时自动触发。一键完成：下载音频 → Whisper转录 → 生成Markdown思维导图格式，输出三个同名文件（m4a音频、txt原始转录、md思维导图）。触发场景：转录视频、视频转文字、提取视频内容、视频笔记、视频文字稿、把视频变成文字等。
---

# 视频转文字稿技能

一键将视频转换为三个成果文件：音频 + 原始转录 + Markdown思维导图。

---

## 触发场景

用户提供视频链接后，使用以下指令触发：
- "转录这个视频"
- "把视频转成文字"
- "提取视频内容"
- "视频笔记"
- "视频文字稿"
- "解析此视频"

---

## 工具路径

| 工具 | 路径 |
|------|------|
| yt-dlp | `/c/Users/ldy/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe/yt-dlp.exe` |
| Python | `/c/Users/ldy/AppData/Local/Programs/Python/Python312/python.exe` |
| ffmpeg | `/c/Users/ldy/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-N-123074-g4e32fb4c2a-win64-gpl/bin` |

---

## 执行流程

```
视频链接 → 下载音频 → Whisper转录 → 生成Markdown笔记
```

---

## Step 1：下载音频 + 获取标题

下载完成后可使用 Emoji 提示用户，如：`✅ 音频下载完成 (X MB)`

### Bash命令

```bash
# 下载音频（合并export和yt-dlp命令）
export PATH="/c/Users/ldy/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-N-123074-g4e32fb4c2a-win64-gpl/bin:$PATH" && /c/Users/ldy/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe/yt-dlp.exe -x --audio-format m4a --audio-quality 0 --ffmpeg-location "/c/Users/ldy/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-N-123074-g4e32fb4c2a-win64-gpl/bin" -o "C:/Users/ldy/Downloads/_temp_audio.%(ext)s" "视频链接"

# 获取视频标题（并行执行）
/c/Users/ldy/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe/yt-dlp.exe --get-filename -o "%(title)s" "视频链接"
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `-x` | 仅提取音频 |
| `--audio-format m4a` | 输出m4a格式 |
| `--audio-quality 0` | 最佳音频质量 |
| `--ffmpeg-location` | ffmpeg路径 |
| `-o` | 输出路径，使用临时文件名 |
| `--get-filename` | 获取视频标题用于重命名 |

### 输出

| 文件 | 路径 |
|------|------|
| 临时音频 | `C:/Users/ldy/Downloads/_temp_audio.m4a` |
| 视频标题 | 用于最终文件命名 |

---

## Step 2：Whisper转录音频

### Bash命令

```bash
# Whisper转录（合并export和whisper命令）
export PATH="/c/Users/ldy/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-N-123074-g4e32fb4c2a-win64-gpl/bin:$PATH" && /c/Users/ldy/AppData/Local/Programs/Python/Python312/python.exe -m whisper "C:/Users/ldy/Downloads/_temp_audio.m4a" --model base --language zh --output_format txt --output_dir "C:/Users/ldy/Downloads/"
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `--model base` | 使用base模型（推荐） |
| `--language zh` | 中文转录 |
| `--output_format txt` | 输出txt格式 |
| `--output_dir` | 输出目录 |
| `timeout` | 建议600000ms（10分钟） |

### 输出

| 文件 | 路径 |
|------|------|
| 转录文件 | `C:/Users/ldy/Downloads/_temp_audio.txt` |

---

## Step 3：生成Markdown思维导图

### 流程

1. **读取转录文件**：`Read _temp_audio.txt`
2. **LLM生成结构化md**：根据转录内容生成思维导图格式
3. **写入md文件**：`Write [视频标题].md`

---

### 写作风格要求

**去AI味指南**：
- 避免使用：~"本文将介绍"、"值得注意的是"、"总而言之"、"首先...其次...最后"等套话
- 避免使用：~"让我们来看看"、"接下来"、"综上所述"等过渡词
- 避免使用：~过度使用"非常"、"极其"、"重要"等形容词
- 使用具体数据和事实替代模糊描述
- 像给同事做笔记一样写，不要像写教材或教程
- 可以使用口语化表达，但要简洁
- 直接陈述观点，不需要铺垫

**Emoji使用规范**：

区分两个场景：

**执行过程提示**（可以使用）：
- 进度提示可使用 Emoji 增强可读性
- 如：`📥 下载音频`、`🎤 转录中`、`📝 生成笔记`、`✅ 完成`

**生成的 Markdown 文件**（克制使用）：
- 全文最多 3-5 个 Emoji
- 仅在元信息区域和参考链接使用
- 正文、标题、要点中不使用装饰性 Emoji
- 禁止使用：✅ ❌ 📌 💡 🎯 📝 🚀 等装饰性Emoji

---

### Markdown输出模板

```markdown
# [视频标题]

## 元信息
- 来源：B站视频转录
- 链接：[视频URL]
- 时间：[YYYY-MM-DD]
- 时长：约X分钟

---

## 概览

[2-3句话概括视频核心内容，不要用"本视频介绍了"开头]

---

## 内容结构

### 1. [章节标题]

[直接陈述内容，不要用"本节讲了"开头]

**要点：**
- [具体要点1]
- [具体要点2]
- [具体要点3]

### 2. [章节标题]

[内容说明]

**要点：**
- [具体要点1]
- [具体要点2]

---

## 关键信息

[需要记住的核心信息，用列表或短句呈现]

- [信息1]
- [信息2]
- [信息3]

---

## 参考

- [相关链接1]
- [相关链接2]
```

---

### 示例对比

**AI味重（避免）：**
```markdown
# OpenClaw教程 - 思维导图

## 📖 目录
✅ 什么是OpenClaw
✅ 如何安装
✅ 使用方法

## 💡 核心概念

📌 OpenClaw是一个**非常强大**的AI网关工具
🎯 它的**重要特点**包括：
  ✅ 开源免费
  ✅ 功能强大
  ✅ 易于使用

综上所述，OpenClaw是一款值得推荐的工具。
```

**自然风格（推荐）：**
```markdown
# OpenClaw教程

## 概览

OpenClaw 是一个开源的 AI 网关，让多个 AI 代理协同工作。核心思路：一个主代理接收指令，自动分配任务给专业子代理执行。

## 内容结构

### 什么是OpenClaw

本地位运行的开源AI网关，可以协调多个AI代理同时工作。特点是：
- 无订阅费，本地运行
- 支持接入 Claude Code、Codex 等工具
- 可通过 Telegram/WhatsApp 控制

### 安装步骤

1. 克隆 GitHub 仓库
2. 安装 Go 或 Node.js 依赖
3. 配置 API Keys
4. 启动 Gateway

## 关键信息

- 主代理负责接收指令和分配任务
- 子代理专注特定领域（前端/后端）
- 支持 100万 tokens 上下文
- 2026.2.19 版本修复了凭证安全问题
```

---

## 成果文件表

完成后输出：

| 文件名 | 格式 | 说明 |
|--------|------|------|
| [视频标题].m4a | 音频 | 视频音频备份 |
| [视频标题].txt | 转录 | 原始转录稿 |
| [视频标题].md | Markdown | 结构化笔记 |

**保存位置**：`C:\Users\ldy\Downloads\`

---

## 权限配置（settings.json）

为避免每次运行询问权限，在 `~/.claude/settings.json` 中添加：

```json
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Read(**)",
      "Write(**)"
    ]
  }
}
```

| 配置 | 说明 |
|------|------|
| `Bash(*)` | 允许所有Bash命令 |
| `Read(**)` | 允许读取所有文件 |
| `Write(**)` | 允许写入所有文件 |

---

## 支持的视频平台

- Bilibili (B站)
- YouTube
- 抖音 / TikTok
- 小红书
- 其他主流视频平台

---

## Whisper模型选择

| 模型 | 速度 | 准确率 | 适用场景 |
|------|------|--------|----------|
| tiny | 最快 | 较低 | 快速预览 |
| base | 快 | 良好 | **推荐** |
| small | 中等 | 较高 | 高质量需求 |
| medium | 较慢 | 高 | 专业场景 |

---

## 注意事项

1. **音频质量**：清晰的录音效果更好
2. **转录时间**：取决于视频时长和模型大小
3. **隐私安全**：本地转录，数据不上传
4. **权限配置**：使用通配符避免频繁询问权限

---

## 完整执行示例

**用户输入**：
```
https://www.bilibili.com/video/BV1xxx 解析此视频
```

**执行过程**：
```
[Step 1/3] 下载音频
   音频下载完成 (X MB)

[Step 2/3] Whisper 转录
   转录完成

[Step 3/3] 生成 Markdown
   笔记已生成

---

## 完成

| 文件 | 格式 | 说明 |
|------|------|------|
| [视频标题].m4a | 音频 | 视频音频备份 |
| [视频标题].txt | 转录 | 原始转录稿 |
| [视频标题].md | Markdown | 结构化笔记 |

保存位置：C:\Users\ldy\Downloads\
```