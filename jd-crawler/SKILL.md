---
name: jd-crawler
description: "岗位JD爬取与调研数据采集。从猎聘、Boss直聘批量抓取职位JD落盘为结构化JD库+总表+统计底稿。当用户要求扒岗位/爬JD/抓招聘数据/岗位市场调研/收集职位描述时加载。依赖 browser-use 技能（node_repl js 工具）驱动浏览器。"
version: 0.1.1
core_max_lines: 62
metadata:
  author: lyuxiaohei
  type: internal
requires:
  - binary: python
---

# 岗位JD爬取（猎聘 / Boss直聘）

从招聘平台批量采集岗位JD，产出「JD库（逐份md）+ 总表csv + 统计底稿json」，供岗位市场分析与简历对照使用。全部平台机制知识来自 2026-10-19/20 两次真实采集（67+16帖），未实测的路径在参考文件中逐项标注。

## 运行前提

- **browser-use:control-browser 技能**（提供 `mcp__node_repl__js` 工具）——本技能的浏览器驱动层，采数前先加载它并按其规范操作标签页。
- **python 3.8+**（整合脚本）。
- 输出目录由调用方指定（三容器：关键词、目标岗位、输出路径都在调用提示词/参数里，本技能只承载流程）。

## 流水线总览（两平台同构）

```
① 搜索列表/种子页 → 卡片URL池（scripts/<平台>/search-cards 或 list-cards）
② 逐详情页提取 → 批次落盘 _raw/batchN.json（scripts/<平台>/detail-extract）
③ 整合去重统计 → JD库/ 总表.csv _stats.json（scripts/<平台>/consolidate.py）
```

浏览器脚本（.mjs）不直接执行，在 `mcp__node_repl__js` 中 bootstrap 后 import 调用：

```js
// 每个 js cell 的固定前奏（详见 browser-use 技能），然后：
const { collectCards } = await import(
  pathToFileURL("<本技能目录>/scripts/liepin/search-cards.mjs").href);
const out = await collectCards(tab, ["目标岗位词", "相邻词1", "相邻词2"]);
```

## 每次采集都生效的纪律

1. **批次≤8-10页、每批立即落盘**（node REPL 无文件系统能力，结果必须当批经 Write 工具写盘，防会话中断丢失）。
2. **限速**：页间等待 0.7-1.5s + 每页 domcontentloaded 后 1.5-2.5s，勿并发。
3. **墙检测立即停批**：页面标题含「注册登录」/「安全验证」或正文长度骤降 → 停止本轮，报告用户，绝不换参数暴力重试。
4. **相关性双条件**：卡片标题须同时命中（领域词 ∧ 产品词），如 `(供应链|物流|仓储|采购|计划|履约|WMS|SRM|TMS|OMS)` ∧ `产品`——单条件会把计划经理/采购业务岗放进来。
5. **按JD正文去重，不按URL去重**：同一岗位多城市/多猎头多帖是常态（实测一岗5帖）；维护 variant→canonical 映射，重复帖在canonical文件里注记。
6. **错标剔除**：标题挂「产品经理」、正文实为采购/保理/选品等业务岗的帖子，**标注剔除备注保留在原始数据里**（保统计可审计），不静默删除。
7. **跨平台同文**：同一岗位会在两平台同文发布（猎聘匿名猎头帖 ↔ Boss具名帖），跨平台对照前按「公司+岗位」再并一轮。
8. **起飞前检查**：交付数据前重读上面 1-7 条核对产出（批次都落盘了？墙检测跑了吗？去重映射更新了吗？）。

## 输出契约

- **JD库/NNN-公司-岗位.md**：元信息头（公司/城市/薪资/经验/学历/行业/来源URL/抓取日期/多帖注记）+ `## 职位介绍` 全文。
- **总表.csv**（utf-8-sig）：编号/职位/公司/城市/薪资/月薪上下限/年薪中值/经验/学历/行业/URL。
- **_stats.json**：city/exp/edu/industry/keywords 词频 + 薪资分位。关键词表放输出目录 `keywords.txt`（一行一词），缺省用内置通用表。

## 参考文件（按平台加载）

- **采猎聘之前加载** `references/liepin.md`——免登录边界、翻页坑、详情全文机制、扩样策略。
- **采Boss之前加载** `references/boss.md`——未登录三重墙、登录态路径（标注未演练）、BFS备选路径及其偏差。

两平台的脚本分别在 `scripts/liepin/` 与 `scripts/boss/`，互不混用；机制差异大，勿把一个平台的等待策略/解析器复制给另一个。
