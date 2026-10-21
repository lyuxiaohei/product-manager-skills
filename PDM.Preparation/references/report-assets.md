# 报告标记资产 — 三态徽章（v1，随 v1.7.0 引入）

> 用途：功能-菜单总表 / 竞品矩阵 / 任何需要三态状态标记的报告表格。**加载触发条件：生成含竞品覆盖标记的表格之前必读**；改本文件前先在真实报告里渲染验证。
>
> 设计约束：单一渲染机制（全部 CSS data-URI SVG，无字符依赖）、矢量可缩放（原型页面可直接复用同一套图标）、色盲友好度由形状差异（对勾/问号/横线）承载，颜色仅辅助。

## 三态语义（固定，不改措辞）

| 态 | 语义 | 填写规则 |
|---|---|---|
| ✓（check-circle） | 公开资料可证 | 官网/产品手册/产品文有明文，报告标注来源 |
| ?（help-circle） | 待查证 | 公开资料未见——诚实标注，禁止把推断升格为有据 |
| —（minus-circle） | 公开资料明确无 / 不适用 | 仅在有明确证据时使用 |

## 浅色主题（浅底报告，色值 #1a7f37 / #b07500 / #9aa0a6）

```css
.icx{display:inline-block;width:16px;height:16px;background-size:contain;background-repeat:no-repeat;background-position:center;vertical-align:-3px;}
.icx-y{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a7f37' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='8 12.5 11 15.5 16 9.5'/%3E%3C/svg%3E");}
.icx-q{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b07500' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5'/%3E%3Cline x1='12' y1='17.5' x2='12' y2='17.6'/%3E%3C/svg%3E");}
.icx-n{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239aa0a6' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='8' y1='12' x2='16' y2='12'/%3E%3C/svg%3E");}
```

## 深色主题（report-template.html 暗色面板，用其 --ok/--warn/--muted 同族色 #34c77b / #e8a33d / #9aa0a6）

```css
.icx{display:inline-block;width:16px;height:16px;background-size:contain;background-repeat:no-repeat;background-position:center;vertical-align:-3px;}
.icx-y{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2334c77b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='8 12.5 11 15.5 16 9.5'/%3E%3C/svg%3E");}
.icx-q{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e8a33d' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5'/%3E%3Cline x1='12' y1='17.5' x2='12' y2='17.6'/%3E%3C/svg%3E");}
.icx-n{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239aa0a6' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='8' y1='12' x2='16' y2='12'/%3E%3C/svg%3E");}
```

## 用法

```html
<!-- 单元格 -->
<td class="ck"><span class="icx icx-y" title="公开资料可证"></span></td>
<!-- 图例（表头说明内） -->
<span class="icx icx-y"></span>＝公开资料可证　<span class="icx icx-q"></span>＝待查证　<span class="icx icx-n"></span>＝公开资料明确无
.ck{ text-align:center; width:50px; }  /* 复选框列居中窄列 */
```

## 纪律

1. 三态语义措辞不改、不增第四态（需要新态＝先改本文件并渲染验证）
2. 禁止 emoji（✅/⚠️/❌）与字符标记混排——emoji 自带底色且跨平台渲染不一致
3. 本文件是标记的唯一权威源；报告里直接内联上述 CSS，不外链本文件（报告要单文件可分享）
4. 原型页面（PDM.Preparation-Prototype 等）可直接复用本套 SVG（viewBox 24 网格、1.8px 描边，与主流线稿图标库同规格）
