---
name: K3简历复刻 (K3 Resume Replica)
description: 把 ReportLab 生成的 PDF 投递版简历 100% 复刻为单文件 HTML。触发词：复刻简历、HTML 还原 PDF 简历、resume replica、PDF to HTML resume。当用户要求"生成一份 XX 简历 HTML、100% 复刻 XX 简历效果"时使用。
agent_created: true
---

# K3简历复刻 · PDF 简历 → HTML 100% 还原

目标：产出单文件 HTML，浏览器打开即 A4 纸张效果，`Ctrl+P` 可直接打印/另存 PDF，版式与 ReportLab 生成的 PDF 逐参数一致。

## 一、版式参数来源（按优先级）

1. **build_resume.py**（如有）：ReportLab 脚本内含全部真值——字号、行高、间距、色板、边距。逐行抄录，不要猜。
2. **PDF 渲染截图**（resume_p1.png 等）：用于无脚本时目测反推 + 最终视觉比对。
3. **简历 md 母版**：内容真值源（文字、顺序、口径），版式不看 md。

本项目锚点文件：
- 脚本：`个人主页-产品经理/build_resume.py`
- 截图：`个人主页-产品经理/resume_p1.png ~ p3.png`
- 母版：`*_吕道远_15323869060.md`

## 二、ReportLab → CSS 换算表（核心）

ReportLab 单位是 **pt**，HTML 直接用 `pt` 即可 1:1 映射；纸张与边距用 `mm/cm`：

| ReportLab | CSS | 本项目值 |
|---|---|---|
| A4 210×297mm | `.page{width:210mm;min-height:297mm}` | — |
| topMargin/bottomMargin 1.6cm | `padding:1.6cm 1.7cm` | — |
| fontSize / leading | `font-size / line-height` | 同名同值 |
| spaceBefore / spaceAfter | `margin-top / margin-bottom` | 同名同值 |
| leftIndent（bullet） | `padding-left` | 12pt |
| HRFlowable(thickness=0.9) | `hr{border-top:0.9pt solid}` | — |
| HexColor('#5f563e') 等 | CSS 变量 | 见色板 |

### 本项目色板（build_resume.py palette）

```
TEXT_PRIMARY  #181715   正文/姓名/章节标题
HEADER_FILL   #5f563e   求职意向/项目子标题/分隔线
TEXT_MUTED    #817f77   联系方式/公司元信息
纸张           #ffffff    屏幕灰底 #e6e6e3 衬托
```

### 本项目字号阶梯（pt）

| 元素 | 字号 | 字重 | 颜色 | 间距 |
|---|---|---|---|---|
| 姓名 | 24 | bold | primary | 居中，mb 2 |
| 求职意向 | 11 | regular | fill | 居中，mb 3 |
| 联系方式 | 10 | regular | muted | 居中，mb 6 |
| 章节标题 | 13 | bold | primary | mt 18 + 0.9pt 线 |
| 职位行 | 11.5 | bold | primary | mt 9（可调大拉公司间距） |
| 公司元信息 | 10 | regular | muted | mb 3 |
| 项目子标题 | 10.5 | bold | fill | mt 6（可调大拉项目间距） |
| bullet/正文 | 10.5 | regular | primary | lh 16，缩进 12 |

## 三、骨架模板

```html
<div class="page">
  <div class="name">…</div>
  <div class="intent">…</div>
  <div class="contact">…</div>
  <div class="section">个人优势</div><hr class="section-rule">
  <div class="bullet">• <b>标签：</b>…</div>
  <div class="section">工作经历</div><hr class="section-rule">
  <div class="job-title">职位 | 公司</div>
  <div class="job-meta">时间 | 公司描述</div>
  <div class="job-meta">项目关键词：…</div>
  <div class="proj">项目名</div>
  <div class="bullet">• …</div>
  …教育背景 / 专业技能（body-line）…
</div>
```

打印必备：

```css
@page{size:A4;margin:0}
@media print{body{background:#fff;padding:0}.page{box-shadow:none;width:auto;min-height:auto}}
```

## 四、执行步骤

1. 读 build_resume.py，把 2 张表（色板、字号阶梯）抄成 CSS 变量与类。
2. 读简历 md 母版，按 story 顺序填内容，**一字不改**（含草稿提示行），bullet 前缀 `• `。
3. 写骨架 HTML，字体栈 `"Microsoft YaHei","微软雅黑",sans-serif`。
4. present_files 预览，与 resume_p*.png 截图逐屏比对：字号阶梯、分隔线颜色、缩进。
5. 用户调整间距时只改 margin：公司间距改 `.job-title{margin-top}`，项目间距改 `.proj{margin-top}`；教育背景紧跟章节线，用 `.section-rule + .job-title{margin-top:2pt}` 覆盖。

## 五、坑

- **别把作品集风格当简历**：`个人主页-产品经理/index.html` 是展示页，不是投递简历。"复刻简历"= PDF 版式。
- pt 不要换算成 px，浏览器原生支持 pt，直接写。
- 内容改字必须回写 md 母版（母版是事实源），HTML 与 md 保持一致。
- CJK 换行：ReportLab 用 wordWrap='CJK'，浏览器默认即可，无需特殊处理。
