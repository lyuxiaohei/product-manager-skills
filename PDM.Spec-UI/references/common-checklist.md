# 四端通用 · 页面合规自检清单

> 溯源：提炼自 Vercel Web Interface Guidelines（vercel-labs/web-interface-guidelines·0926 版规则），按本项目「纯 HTML/CSS 单文件原型」语境改写裁剪；原技能按需审查代码，此处作为四端页面完工前的通用自检基线。pc-admin 的 page-check.md 管结构配平，本清单管**交互与可访问性**，两者互补。

## 用法

页面完工（或修订）后逐类过一遍；发现问题按 `文件名:行号 - 问题` 记录。带 ⚠ 的条目对移动端（mobile-front / mobile-admin）额外强制。

## 可访问性

- 纯图标按钮加 `aria-label`；表单控件有 `<label>`（点击 label 聚焦控件）
- 动作用 `<button>`、导航用 `<a>`——不给 `<div>`/`<span>` 挂 onclick
- 图片有 `alt`（装饰性图 `alt=""`＋`aria-hidden="true"`）
- 标题层级 `h1→h6` 不跳级
- 异步反馈（提示条/校验结果）容器加 `aria-live="polite"`

## 焦点态

- 可交互元素有可见焦点环（`:focus-visible`；不用 `:focus` 以免点击闪环）
- 禁止 `outline: none` 而不补焦点样式
- 吸顶/吸底栏不遮挡被聚焦元素

## 表单

- 输入框用对 `type`（email/tel/url/number）＋ `name`；`<img>` 一律写 `width`/`height`
- 提交按钮保持可点，请求中转 spinner；错误信息内联在字段旁，提交失败焦点落到第一个错误
- placeholder 以 `…` 结尾并给示例格式
- 有未保存改动离开页面前弹确认
- ⚠ 触控目标 ≥44×44px；checkbox/radio 的文字与控件合成同一命中区

## 动效

- 全部动效响应 `prefers-reduced-motion`（禁用或降级）
- 只动 `transform`/`opacity`；禁止 `transition: all`（列明属性）
- 动画可被打断——用户中途操作时立即响应

## 排版与文案

- 省略号用 `…` 不用 `...`；中文引号「」、西文弯引号 “”
- 数字列/金额用 `font-variant-numeric: tabular-nums`
- 标题 `text-wrap: balance` 防孤字换行
- 按钮写具体动作（「保存配置」不是「继续」）；错误提示带下一步怎么办
- 空状态有占位文案，不渲染破 UI；长内容有 `line-clamp`/`break-words` 兜底

## 触控与手势（移动端）⚠

- `touch-action: manipulation` 消双击缩放延迟
- 弹层/抽屉容器 `overscroll-behavior: contain` 防滚动穿透
- 全出血布局留 `env(safe-area-inset-bottom)`（吸底操作栏）
- 手势动作（滑动删除等）必须有等价的点按/键盘路径

## 主题与状态

- 深色主题 `<html>` 加 `color-scheme: dark`；`<meta name="theme-color">` 与页底同色
- 按钮/链接有 hover 态，且 hover/active/focus 的对比度高于静止态

## 反模式速查（见即改）

`user-scalable=no` ｜ `onPaste`+preventDefault ｜ `transition: all` ｜ 无焦点替代的 outline:none ｜ div onclick 当按钮 ｜ 无尺寸 img ｜ 无 label 输入框 ｜ 无 aria-label 图标钮 ｜ 手势专属操作无点按替代
