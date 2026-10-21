---
name: software-copyright-docs
description: 生成中国计算机软件著作权登记申请材料——操作手册(.docx)和申请表"主要功能和技术特点"栏目。阶段A基于已有HTML原型截图(paseo视口/playwright长图)+python-docx生成图文操作手册;阶段B用验证过的提示词从手册提炼申请表栏目。适用于电商/客服/SaaS等系统的软著申报。触发词:软著、软件著作权、操作手册、申请表、主要功能和技术特点、软著材料生成。
---

# 软著文档生成

两阶段:A 操作手册 → B 申请表。先 A,再用 A 的产物做 B。详细流程与踩坑见 [references/manual-workflow.md](references/manual-workflow.md)。

## 1. 阶段0 准备(确认后不改)
1. 软著名称:全流程(申请表/手册/源代码)一字不差;命名 `{软著名称}操作手册.docx`(注意是否去"CS商城"等前缀)。
2. 命题+核心功能:从《软著申请材料汇总.md》取命题,列出核心功能(据此筛选页面);若该汇总文件不存在,与用户讨论确定命题(软件名称、核心功能清单、面向领域)。
3. 原型目录(如 `prototype-cs/admin/`);命题文件夹 `5-A14-软著任务\{软著名称}{YYYYMMDD}\`。

## 2. 阶段A 操作手册(详细见 manual-workflow.md)
0. **页面准备(无则自动生成)**:盘点命题核心功能是否有对应原型页;**缺失必须自动开发**(基于骨架页复用 styles.css + 布局)。原型常只有基础功能,AI/调度等核心多缺失——这是阶段A 第一步,不能跳过。
1. **命题切合**:只选相关页,剔除占位页(源码标"3期·待开发")和无关页,别凑页数。
2. **截图**:`scripts/screenshot_heights.py` 量高度,>1250 用长图。短页 paseo 视口(返回 CDN url,curl 下载);长页 playwright fullPage(paseo fullPage 长页 15s 超时)。
3. **演示交互页**(输入→按钮→结果):预填示例 + 触发分析后再截。
4. **生成 docx**:`scripts/create_manual_template.py`,**禁用 Word 自动编号**(标题/步骤用普通段落+加粗,序号硬编码文本)。
5. 门槛:操作手册 ≥10 页(项目惯例,非官方硬性)、图文、真实。

## 3. 阶段B 申请表"主要功能和技术特点"
用 [references/form-prompt.md](references/form-prompt.md) 的提示词(已验证,勿改)+ 操作手册 + 参考样例,输出纯文本(主要功能 ≤700 字、技术特点 ≤100 字符)。

## 4. 资源
1. [manual-workflow.md](references/manual-workflow.md) — 详细流程 + 常见坑速查
2. [form-prompt.md](references/form-prompt.md) — 申请表提示词(勿改)
3. scripts/screenshot_heights.py — 量高度判长图
4. scripts/create_manual_template.py — 手册生成模板(无自动编号)
5. scripts/fix_listnumber.py — 修已生成 docx 的双序号
