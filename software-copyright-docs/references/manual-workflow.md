# 操作手册生成详细流程

## 0. 页面准备:若命题核心功能无对应原型,先开发
原型常只有基础功能(订单列表/工单列表),命题里的 AI/调度/分析等核心功能往往没有专门页。**先盘点命题核心功能清单 → 逐条找对应原型页 → 缺失就开发。**

开发模式(参考命题6):
- **找骨架页**:选风格统一的现有页作骨架(商城运营后台骨架,如 `admin-ticket.html` / `商城运营后台订单模块.html`),复用其 `styles.css` / 公共 JS / 导航 / 表格卡片样式,保证整套原型视觉统一。
- **改造 or 新建**:命题核心功能页,可在基础页上改造(订单列表 → 加 AI 异常识别列/调度面板),也可新建(异常识别演示 / SLA监控 / 统计看板)。
- **必须含 mock 数据**:列表/图表/统计卡都要有示例数据,避免空页(空页截图不达标)。
- **演示交互页要有可交互逻辑**:输入→点按钮→出 AI 结果 这类,要有真实触发逻辑(截图时 prefill 触发);注意 JS 不要有语法错误(如 `const`/`let` 变量重复声明),否则按钮点不动。
- 命题6 实例:基于 `admin-ticket.html` → `admin-ticket-ai`(AI列表,加 AI分类/优先级/置信度列)、`admin-ai-classify`(分类演示)、`admin-ai-priority`(优先级评分)。

> 页面开发遵循项目原型规范(如 prototype-design / prototype-chat skill);本 skill 假设原型页最终齐全,再进入下面的截图→手册→申请表。

## 1. 筛选页面(命题切合——最易踩坑)
列出原型目录所有 HTML,逐页判断:
- **核心(必选)**:对应该命题的核心功能。先把命题的"核心功能清单"列出来,逐条找对应页面。
- **占位(剔除)**:源码含 `占位|待开发|尚未实现|3期` 或 `<div class="placeholder-card">`。软著忌"未实现功能",必剔除。
- **无关(剔除)**:与命题核心功能无关(例:命题是"工单AI分类",则订单/评价/售后/渠道/话术页无关)。别为凑页数堆无关页面——审核员对照命题说明逐条查,无关页会暴露主题涣散。

**grep 快速识别占位页**:`grep -l "占位\|待开发\|尚未实现" 原型目录/*.html`

## 2. 截图

### 2.1 起本地服务器
原型是静态 HTML,起 http server 供浏览器访问:
```bash
cd 原型目录的父目录
python -m http.server 8765 --bind 127.0.0.1   # 后台运行
```

### 2.2 判断哪些页需要长图
跑 `scripts/screenshot_heights.py`(playwright),扫描各页 `document.body.scrollHeight`:
- ≤1250:视口(1920×1080)截得全
- >1250:需长图(fullPage)

### 2.3 截图工具选择
- **视口(短页)**:paseo `browser_new_tab` → `browser_resize(1920,1080)` → `browser_screenshot`(默认视口,fullPage 不传或 false)。返回 CDN url,**必须 curl 下载**到本地(不写盘)。
- **长图(长页)**:paseo `browser_screenshot(fullPage=true)` 对长页会 **15s 超时**。改用 **playwright** `page.screenshot(full_page=True)`(无超时,直接写盘)。playwright 脚本示例见 `scripts/screenshot_heights.py` 的截图部分。

### 2.4 演示交互页(必填示例)
对"输入→点按钮→出 AI 结果"类页面(分类/优先级/分析类),默认结果区空白,必须:
1. `browser_snapshot` 拿输入框/按钮 ref
2. `browser_fill`/`browser_type` 预填示例(fill 无效则 type;都无效则 `browser_evaluate` 直接 `el.value=...; el.dispatchEvent(new Event('input',{bubbles:true}))`)
3. `browser_click` 触发分析;`browser_wait(text="结果关键词")` 等结果出现
4. 截图

> 注意:个别原型页 JS 可能有 bug(如变量重复声明导致 handler 失效),click 无反应时用 `browser_evaluate` 直接调 `document.getElementById('btn').click()` 或手动渲染结果。

### 2.5 文件命名
`{idx:02d}_{img_name}.png`,如 `01_01_投诉工单AI增强列表.png`。`img_name` 形如 `01_投诉工单AI增强列表`(带序号前缀)。截图存命题文件夹 `文档图片素材\`,并复制一份到生成脚本读取的 screenshots 目录。

## 3. 生成 docx
参考 `scripts/create_manual_template.py`。核心结构:
- `PAGES` 列表:`(img_name, title, entry, [steps], warning)`
- 封面 → 目录 → 系统功能概览(模块表)→ 业务流程 → 操作指南(循环 PAGES:标题+入口+步骤+截图+警告)

### 禁用 Word 自动编号(否则双序号)
- `add_heading`:用**普通段落 + 加粗**(set_font bold + 大字号),**不用** `doc.add_heading(level=)`(Heading 样式可能带自动号)
- `add_steps`:用**普通段落**,**不用** `style='List Number'`(steps 文本已硬编码 "1. 2.")
- 章节/步骤序号**硬编码在文本**:"1. 系统功能概览""3.1 投诉工单AI列表""1. 页面默认展示…"

### 不要删 `word/numbering.xml`
删它会让 .rels 引用悬空,docx 打不开报错 "There is no item named 'word/numbering.xml'"。正确:段落不引用编号即可(段落级 numPr=0)。

## 4. 命名与归档
- 操作手册:`{软著名称}操作手册.docx`(放命题文件夹,名称带"操作手册")
- 截图:`命题文件夹\文档图片素材\`
- 页数检查:**≥10 页**(项目惯例,非官方硬性,以代理要求为准;估算:段落+表格行+图×18,除以 30)

## 5. 交付前自查清单
- [ ] 截图真实(非占位、非空白)?
- [ ] 演示交互页是否预填示例(结果区非空)?
- [ ] 步骤是否双序号?(解析 docx,段落 `<w:numPr>` 应为 0)
- [ ] 软件名是否一致(无多余前缀如"CS商城")?
- [ ] 功能是否覆盖命题全部核心功能?
- [ ] 页数 ≥10?
- [ ] 是否含占位页/无关页?(应为否)

## 6. 常见坑速查(集中)
- **Word 双序号**:段落用 `style='List Number'`/`doc.add_heading()` 触发自动编号,叠加文本硬编码的"1."→双序号。改普通段落+加粗。已有 docx 用 `scripts/fix_listnumber.py` 修。
- **不要删 `word/numbering.xml`**(.rels 仍引用→docx 打不开);正确做法是段落 numPr=0。
- **文件名重复前缀**:`img_name` 已含 `NN_` 前缀时,只拼 `{idx:02d}_{img_name}.png`,别再多拼一层 `{idx}`。
- **paseo 截图不写盘**:`browser_screenshot` 返回 CDN url,需 curl 下载到本地。
- **Windows GBK 控制台**:设 `PYTHONIOENCODING=utf-8`,或脚本输出避免 ✓/⚠ 等 Unicode 字符。
- **软著名称一致性**:申请表、操作手册、源代码三处软件名一字不差。
