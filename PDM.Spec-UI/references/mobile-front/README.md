# 移动端前台 规范 v1

> 状态：**v1 已建**（2026-10-06）。溯源：骨架提炼自 `prototype-design` 技能 miniprogram-components（329 行实战规范）＋ 5-A05 小程序 69 页实战校准（`5-A05-小程序/css/common.css`）；色彩已参数化去项目化（苏银豆红渐变仅作历史示例）。开工前先读 [../style-direction.md](../style-direction.md) 定调。

## 一、画框与骨架（固定值，勿改）

```
┌────────────────────┐
│ 状态栏 44px（预留）  │  padding-top 预留，浅底深字/深底白字
│ 导航栏 44px         │  标题17px居中 + 返回钮32px左置
├────────────────────┤
│                    │
│ 内容区（可滚动）     │  padding-bottom: 60px 给 Tab 让位
│                    │
├────────────────────┤
│ Tab栏 56px 底部固定 │  ≤5 个入口；吸底操作栏同高体系
└────────────────────┘
```

- 画框宽 **375px**（`.phone-frame`），页面背景 `#f5f5f5`，卡片白底
- 吸底元素 `padding-bottom: calc(8px + env(safe-area-inset-bottom))`
- 卡片圆角 12px；按钮全圆角 22px（胶囊式）

## 二、色彩（参数化）

| 令牌 | 默认值 | 说明 |
|---|---|---|
| `--primary` | `#1677ff`（ui-spec 通则主色） | Tab 选中、主按钮、链接 |
| `--price` | 项目定 | 价格/金额强调色（A05 用红 `#ee0a24`——品牌位，**由项目覆盖，不进默认**） |
| `--success/--warning/--error/--info` | 沿用 pc-admin styles.md 状态色 | 成功/警示/错误/信息 |
| 文字三级 | `#333 / #666 / #999` | 主/次/弱 |

## 三、字号与触控

- 层级：Tab 文字 10px ／辅助 12px ／正文 14px ／导航标题 17px ／价格 15–17px 等宽（`tabular-nums`）
- 触控目标 ≥44×44px；`touch-action: manipulation`；文字与控件合成同一命中区

## 四、组件族（结构要点；完整代码去源文件取）

| 组件 | 要点 | 代码源 |
|---|---|---|
| 底部 Tab 栏 | ≤5 入口、图标+10px 文字、选中态主色、角标徽标（红底白字 14px 高） | prototype-design `components/miniprogram-components.md` |
| 商品/内容网格卡 | 双列 grid 间隙 8px、图 `aspect-ratio:1`、标题 2 行截断、价格强调 | 同上 |
| 吸底操作栏 | 主操作胶囊钮＋合计/说明左置，56px 高＋安全区 | A05 实战页（如 `pages/cart.html`） |
| 半屏弹层 | 底部滑入、圆角顶部 12px、拖动关闭条、`overscroll-behavior: contain` | 同上 |
| 导航栏 | 返回钮左置 32px、标题居中、深底白字场景加 `.dark` | miniprogram-components |

## 五、页面组合（A05 69 页实证场景）

**首页**＝导航＋搜索＋Banner＋宫格入口＋推荐流；**列表页**＝筛选条＋网格卡流；**详情页**＝图集＋参数＋吸底操作栏；**表单页**（地址/售后申请）＝分组卡片＋底部提交；**结果页**＝状态图标＋主操作＋次操作。

## 六、完工自检

1. [../common-checklist.md](../common-checklist.md) 的 ⚠ 移动端条目全过
2. 375px 无横向溢出；吸底栏带安全区
3. 跨端同名业务对象词汇与 PC 后台一致（只变布局不变词汇）

## 素材库指针

- `prototype-design` 技能安装目录（用户级 skills 下，随宿主环境而定，**勿写死本机绝对路径**）：miniprogram-components.md / miniprogram-template.md（组件代码与页面模板）
- `5-A05-小程序\`：common.css 令牌全表＋69 页实战
- 5-A06 客服小程序（14 页）、5-A07 小程序商城/电影票/积分卡券（同类参照）
- `3-弹药库\知识-axure元件库-小程序app\`：4 套移动元件库（含微信/支付宝官方组件库）
