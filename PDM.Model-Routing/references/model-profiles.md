# 模型画像（官网锚定）

> 加载触发：重设落点、核对画像、评估新模型或通道变化时读本文件。
> 全部条目 2026-10-20 逐官网核对；来源清单见文末。口碑与官方标签分开标注。

## GLM 系（智谱开放文档）

**glm-5.3** — docs.bigmodel.cn/cn/guide/models/text/glm-5.3
- 官方定位："智谱最新旗舰模型，复杂软件工程与 Agent 任务能力全面进阶""在复杂编程和长程任务方面表现更加出色"。
- 长程：SAO＋上下文压缩，"能力增益在长程任务中持续体现"；Terminal-Bench 3.0 4.6→28.3、DeepSWE 46.2→66.9。
- 编程：内部 Z.ai Code Bench 较 5.2 +50%；High 档 31.4% 超 Claude Opus 4.8（29.5%）且输出 token 仅其 40%，Max 档 34.5%；官方明示落后 Claude Fable 5（39.5%）。
- **仅文本**（官方原句）；1M 上下文／出 128K；思考不可关，low/high/max 三档默认 max。

**glm-5.3-flash / FlashX** — docs.bigmodel.cn/cn/guide/models/vlm/glm-5.3-flash
- 官方定位："GLM-5 系列首个原生多模态模型"；320B 总参/18B 激活，稀疏＋线性注意力混合架构（注意力计算 -3.01×、KV 缓存 -4.44×）。
- 视觉原生融入 Coding 循环（主动观察界面/渲染/交互反馈）；AA 指数 57 分与 Opus 4.8 持平；定价为 5.3 的 1/10。
- 套餐事实：Flash 额度＝5.3 的 **3 倍**；**FlashX 套餐暂未开放**；非高峰时段（含周末全天）50% 积分。
- 思考仅可开（官方推荐 max）；支持图片/视频/文件输入；可交付 PPTX/PDF/DOCX/XLSX 成品。

**glm-5-turbo** — docs.bigmodel.cn/cn/guide/models/text/glm-5-turbo
- 官方定位："面向 OpenClaw 龙虾场景深度优化的基座模型"——工具调用精准、复杂指令拆解、**定时与持续性任务长任务不中断**、高吞吐长链路；200K／出 128K。

**glm-4.7**：上代，编码被 GLM-5 系全面超越；仅应急备份。

## DeepSeek 系（api-docs.deepseek.com）

**deepseek-v4-flash**
- 1M 上下文／出 384K；思考/非思考可切（默认思考）；并发 2500；支持 JSON Output/Tool Calls/FIM。
- 价格（每百万）：命中 ¥0.02／未命中 ¥1／输出 ¥2；思考档 low/high/max。
- **峰谷定价（2026-08-17 起）：闲时＝高峰一半**——批量排夜间的依据。

**deepseek-v4-pro**（news260813 正式版公告）
- 官方定位："Agent 能力大幅提升，生产环境性能提升尤为显著"；原生 Responses API＋Codex 适配。
- 价格：命中 ¥0.025／未命中 ¥3／输出 ¥6；并发 500。
- 注："中文逻辑推理强"是 V2/V3 时代社区口碑，官网 V4 未以此为主标签——选型作参考不作依据。

**deepseek-flash (V4.1-Flash)**：2026-09-10 有公告（最小尺寸、原生视觉），但当前 pricing 页模型名仅剩 v4-flash/v4-pro——**不引入**。

## Kimi 系（kimi.com/news/kimi-k3，2026-07-17）

**Kimi-K3**
- 官方定位："面向长程编程、知识工作和推理等前沿智能场景而设计"；2.8 万亿参数、原生视觉、1M 上下文、KDA 混合线性注意力。
- **前端**（双重官方确认）：Kimi 官网"擅长结合软件工程与视觉推理的任务，利用截图和视觉反馈，优化游戏开发、前端和 CAD"，视觉闭环 vision in the loop；WorkBuddy 官方简介"前端开发能力突出"。
- 长程自主：48 小时自主 Agent 芯片设计；极少监督长工程任务。
- API 直连：输入 ¥20（命中 ¥2）／**输出 ¥100** 每百万（V4-Pro 输出的 16 倍）；编程场景 Mooncake 缓存命中率超 90%。
- **官方局限（用法直接受约束）**：①过于主动——小问题/意图模糊时会替用户做非预期决定 → 任务书必须带硬边界；②对历史思考内容敏感 → 独立会话跑完，禁中途切入。

## WorkBuddy 平台（workbuddy.cn 官方文档）

- 三档模式官方口径：快速＝日常问答/格式转换/小段代码；均衡＝写文档/分析数据/多文件代码；极致＝跨模块重构/多步骤推理。
- 官方提醒：上下文默认 200K 够用（"开到 1M 不会让模型变聪明，只会让每轮消耗成倍增加"）；Max 模式保持关闭。
- **能力标记与官网矛盾，疑似标反**：WorkBuddy 给 GLM-5.3 标图片输入、给原生多模态的 Flash 反而没标——以各模型官网为准，跑视觉任务前实测。
- 自定义模型官方途径：models.json 本地保存；接入 Coding Plan（腾讯云/智谱/Kimi）与自定义 API——内置 GLM/DeepSeek 改绑自有 Key 后费用走第三方、不耗积分。

## 来源

- GLM-5.3：https://docs.bigmodel.cn/cn/guide/models/text/glm-5.3
- GLM-5.3-Flash/FlashX：https://docs.bigmodel.cn/cn/guide/models/vlm/glm-5.3-flash
- GLM-5-Turbo：https://docs.bigmodel.cn/cn/guide/models/text/glm-5-turbo
- DeepSeek 模型&价格：https://api-docs.deepseek.com/zh-cn/quick_start/pricing
- DeepSeek V4-Pro 公告：https://api-docs.deepseek.com/zh-cn/news/news260813
- Kimi K3：https://www.kimi.com/news/kimi-k3
- WorkBuddy 模型配置：https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model
