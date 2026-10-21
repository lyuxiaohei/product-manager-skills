# 移动端后台 规范 v1（样式层）·载体待拍板

> 状态：**样式层 v1 已建**（2026-10-06，提炼自 AntD Mobile 38 组件体系＋Vant 令牌，来源 full-stack-skills 组织 antd-skills / vue-ui-skills 两包·下载提炼未安装）。**载体仍未拍板**（H5 管理页 vs 小程序管理员端）——本规范只定组件与样式，导航壳与授权按载体在开工时补拍；产出页面头部注明「mobile-admin 样式层 v1·载体未定」。

## 一、定位（与 mobile-front 的分界）

| | mobile-front（前台） | mobile-admin（本端） |
|---|---|---|
| 用户 | 消费者 | 管理员/现场人员 |
| 动线 | 浏览营销（Banner/宫格/推荐流） | **查得快、操作准**（搜索/筛选/表单/审批） |
| 信息架构 | 楼层式 | **与 PC 后台同构**：菜单、字段、状态词汇与 PC 完全一致，只换布局 |

## 二、骨架（375px）

```
┌──────────────────────────┐
│ 顶部导航：返回 + 标题 + 更多 │ 44px，替代前台 Tab 导航
├──────────────────────────┤
│ 搜索栏（吸顶）＋筛选标签行    │ 列表页标配
├──────────────────────────┤
│ 卡片流（列表/表单/审批卡）   │ 主内容区
├──────────────────────────┤
│ 吸底操作栏（可选）          │ 提交/批量操作＋safe-area
└──────────────────────────┘
```

管理入口 ≤4 个时可改底部 Tab（同 mobile-front 56px 体系）。

## 三、设计令牌（参数化·对齐全端通则）

| 令牌 | 值 | 参照 |
|---|---|---|
| `--primary` | `#1677ff`（通则主色） | Vant 默认 `#1989fa`、AntD `--adm-color-primary` 均为变量位，项目可覆盖 |
| 文字三级 | `#333 / #666 / #999` | Vant `#323233/#646566/#969799` 取整对齐本工作台惯例 |
| 状态色 | 成功 `#07c160`（微信绿·移动惯例）／警示 `#ff9800`／危险 `#ee0a24` | 两库通行值 |
| 行与间距 | 列表行高 ≥48px、横向 padding 16px、卡间隙 8px | Vant Cell 体系（正文 16px） |
| 圆角 | 卡片 12px、按钮 22px 胶囊（同 mobile-front） | 一致性 |

## 四、组件族（38 件清单按管理场景分组·结构要点）

**列表与导航**：列表组（Cell 行：图标+标题+值+箭头）｜SearchBar 搜索栏（吸顶）｜Tabs 标签页（状态切换：全部/待审/已审）｜SideBar 侧栏（多级菜单）｜IndexBar 索引（长通讯录式列表）
**表单与输入**：Form 分组表单｜Input/Textarea｜Checkbox/Radio｜Picker/DatePicker/Cascader 滚轮选择（替代 PC 下拉的移动式）｜Stepper 步进器（数量）｜Switch 开关｜**Uploader**（现场拍照上传·后台高频）｜VirtualInput 数字键盘
**反馈**：Dialog 确认框｜Toast 轻提示｜ActionSheet 动作面板（底部操作菜单）｜Popup 底部弹层（详情/筛选抽屉）｜NoticeBar 通知条｜Empty 空态｜ErrorBlock 错误态｜Loading
**后台行为**：PullToRefresh 下拉刷新｜InfiniteScroll 滚动加载｜Badge 徽标（待办数）｜Tag 状态标签（审批态·与 PC 同词汇）｜SafeArea 安全区
**组合模式**：审批卡＝Tag 状态＋申请人/时间＋关键金额（tabular-nums）＋操作钮行；筛选抽屉＝Popup＋Checkbox 组＋重置/确定吸底。

## 五、完工自检

1. [../common-checklist.md](../common-checklist.md) ⚠ 移动条目全过
2. 业务对象与状态词汇与 PC 后台逐字一致（只变布局不变词汇）
3. 高频操作单手可达：主操作在屏下半区或吸底

## 素材指针

- GitHub `full-stack-skills/antd-skills`（ant-design-mobile：38 组件示例与 API·含 theme-customization）
- GitHub `full-stack-skills/vue-ui-skills`（vant-vue3：Button/Cell/Form/Dialog/Toast/Popup 六件＋ConfigProvider 令牌）
- 原型实现语境为纯 HTML 单文件：以上组件按「结构要点」手写 HTML/CSS 等价物，不引框架
