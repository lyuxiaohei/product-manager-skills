# 后台组件规范

适用于：素材库、页面装修、订单管理（运营侧）、售后审批等PC端运营工具。

### 系统名称

- **主名称**: 商城运营后台
- **副名称**: 运营管理系统

### 色彩规范

| 用途   | 色值      | CSS变量 | 使用场景 |
| ------ | --------- | ------- | -------- |
| 主色   | `#1677ff` | `--primary-color` | 主按钮、Logo、hover状态、链接（Ant Design v5） |
| 背景灰 | `#f0f2f5` | `--bg-color` | 页面背景 |
| 内容白 | `#ffffff` | `--card-bg` | 卡片、内容区背景 |
| 错误红 | `#ff4d4f` | `--error-color` | 错误状态、危险操作 |
| 成功绿 | `#52c41a` | `--success-color` | 成功状态 |
| 警告黄 | `#faad14` | `--warning-color` | 警告状态 |

### 布局规范

```
┌─────────────────────────────────────────────────────────┐
│                    Header (56px)                         │
│  Logo区域：供应链平台 / 运营管理系统                      │
├────────────┬────────────────────────────────────────────┤
│   Sider    │              Content                       │
│  (208px)   │           (padding: 20px)                  │
│  垂直菜单   │                                          │
└────────────┴────────────────────────────────────────────┘
```

| 参数 | 值 |
|------|-----|
| 最小宽度 | 1200px |
| Header高度 | 56px |
| Sider宽度 | 208px（可折叠为80px） |
| 内容区padding | 20px |
| 卡片圆角 | 8px |
| 按钮圆角 | 6px |

#### 按钮样式

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
}
.btn:hover { border-color: #1677ff; color: #1677ff; }
.btn-primary { background: #1677ff; border-color: #1677ff; color: #fff; }
.btn-danger { color: #ff4d4f; border-color: #ff4d4f; }
```

```html
<button class="btn btn-primary">确认</button>
<button class="btn">取消</button>
<button class="btn btn-danger">删除</button>
```

#### 素材网格

```css
.material-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.material-card { border-radius: 8px; overflow: hidden; }
.card-thumbnail { height: 100px; object-fit: cover; }
```

**重要：** 5列固定布局，100px固定高度。

#### 分页组件

```css
.page-btn { min-width: 36px; height: 36px; border-radius: 6px; }
.page-btn.active { background: #1677ff; color: #fff; }
```

#### 分类树

```css
.category-panel { width: 220px; }
.category-item { padding: 8px 16px; cursor: pointer; }
.category-item.active { background: #e6f4ff; color: #1677ff; }
```

### 后台开发检查清单

- [ ] 主色调使用 `#1677ff`（Ant Design v5）
- [ ] 背景色使用 `#f0f2f5`（页面）或 `#fff`（卡片）
- [ ] Header高度 56px，Sider宽度 208px
- [ ] 内容区 padding: 20px
- [ ] 弹窗居中显示，圆角 8px
- [ ] 系统名称使用"供应链平台"
- [ ] CSS使用变量管理颜色
- [ ] 图片设置 `object-fit: cover`
- [ ] 素材网格使用 5 列固定布局
- [ ] 分页器 36px 高度，6px 圆角
- [ ] Flex容器正确使用 `flex-shrink: 0` 和 `min-height: 0`
- [ ] 单文件可独立运行
- [ ] 菜单项/按钮/Tab仅使用纯文字或SVG图标（禁止Emoji）
