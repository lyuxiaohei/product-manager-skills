---
name: logic-list-spec
description: "业务逻辑清单生成技能。支持双模式：Draft模式从需求正向生成草案，Extract模式从源码逆向提取。功能用例覆盖交互场景，数据来源和业务问题附建议答案。适用于电商、审批、内容管理等各功能模块。"
risk: low
source: project
date_added: "2026-04-21"
version: "2.0"
changes:
  - V2.0: 新增Draft模式，深度融合idea-refine方法论；模板支持草案版与正式版；新增状态标记体系
  - V1.1: 新增登录拦截章节、状态流转表、截图脚本
  - V1.0: Extract模式基础功能
---

# 业务逻辑清单生成技能 V2.0

双模式支持：**Draft模式**（需求正向生成草案）+ **Extract模式**（源码逆向提取）。

---

## 双模式说明

| 模式 | 输入来源 | 适用场景 | 输出文件 |
|------|----------|----------|----------|
| **Draft** | 需求描述 + codebase扫描 | 无原型页面，首次设计 | `业务逻辑清单_V{版本}-草案.md` |
| **Extract** | HTML源码逆向提取 | 有原型页面 | `业务逻辑清单_V{版本}.md` |

---

## 模式自动检测规则

1. **用户指定** `--mode=draft` 或 `--mode=extract`
2. **检测页面存在**：`index.md` 中页面文件存在 → Extract模式
3. **用户口述**："没有原型"/"首次设计"/"新功能"/"草案" → Draft模式
4. **默认**：Extract模式

---

## 一、Draft模式流程（深度融合idea-refine）

适用于无原型HTML的首次设计场景。

### 阶段一：需求收集（Understand & Expand）

参考 `rules/requirement-collection.md`，深度融合 idea-refine Phase 1 方法：

#### 1.1 问题重述（How Might We）

将用户的原始需求重述为 HMW 问题陈述：

```
"How might we {问题描述}？"
```

**要点：**
- 双端视角（小程序端 + 后台端）
- 核心动词（发起、审核、处理、闭环）
- 价值目标（便捷、高效、完整）

#### 1.2 澄清问题（Sharpening Questions）

使用 `AskUserQuestion` 工具，限制5个问题：

| # | 问题 | 目的 |
|---|------|------|
| 1 | 用户是谁？ | 明确用户画像 |
| 2 | 成功标准是什么？ | 定义验收指标 |
| 3 | 技术约束是什么？ | 识别现有架构限制 |
| 4 | 尝试过什么？ | 了解现有能力 |
| 5 | 为什么现在做？ | 理解业务驱动 |

**不进入下一阶段，直到：用户画像 + 成功标准已明确**

#### 1.3 变体生成（Idea Variations）

复用 idea-refine 的7种视角，聚焦页面/功能维度：

| 视角 | 应用示例 |
|------|----------|
| Inversion | 用户端申请 vs 商家端主动退款 |
| Constraint removal | 无审核流程 vs 三级审批 |
| Audience shift | 用户自助 vs 客服代操作 |
| Combination | 售后+投诉+评价联动 |
| Simplification | 仅退款 vs 退换货一体化 |
| 10x version | AI自动化审核 |
| Expert lens | 售后专家如何设计状态机 |

**生成规则：不超过8个变体，每个变体有明确理由**

#### 1.4 上下文扫描（Codebase-Aware）

使用 `Glob`、`Grep`、`Read` 扫描现有代码库：

| 扫描维度 | 识别内容 |
|----------|----------|
| 现有相关页面 | 可参考的结构 |
| 状态流转定义 | 可复用的状态机 |
| 表单/弹窗组件 | 可复用的UI组件 |
| 后台审批模式 | 可复用的流程 |

**输出：可复用组件表 + 现有约束表**

---

### 阶段二：页面收敛（Evaluate & Converge）

参考 `rules/draft-generation.md`，深度融合 idea-refine Phase 2 方法：

#### 2.1 聚类页面结构（Cluster → Pages）

将共鸣的功能变体聚类为页面组：

**输出：**
- 小程序端页面列表
- 后台端页面列表
- 总页面数 ≤ 10

#### 2.2 压力测试（Stress-test）

每个页面评估三维度：

| 维度 | 评估问题 |
|------|----------|
| User Value | Painkiller or Vitamin？ |
| Feasibility | Low/Medium/High，可复用组件？ |
| Differentiation | 与现状差异？ |

**诚实评估原则：Vitamin功能明确标注，可行性Low建议排除**

#### 2.3 显性假设（Surface Assumptions）

每个页面标注三类假设：

| 假设类型 | 标记 | 含义 |
|----------|------|------|
| Must Be True | `[必验]` | 验证失败则流程不可行 |
| Could Kill | `[风险]` | 可能失败，需关注 |
| Ignoring | `[暂略]` | 当前版本有意排除 |

**每页至少2条假设，标注验证方式**

#### 2.4 Not Doing清单

明确排除的功能，排除项 ≥ Doing项的50%

| 排除项 | 排除理由 | 可能何时加入 |
|--------|----------|--------------|

---

### 阶段三：输出草案（Sharpen & Ship）

参考 `rules/draft-generation.md`，转换为清单模板：

#### 3.1 功能大纲 → 功能用例表

| 功能大纲项 | 映射到 |
|------------|--------|
| 用户动作 | 操作列 |
| 设计意图 | 预期结果列，标注 `[草案]` |

#### 3.2 数据需求 → 关键字段数据来源

| 数据需求 | 映射到 |
|----------|--------|
| 用户操作 | 直接填写 |
| 外部来源 | 标注 `[待确认]` |

#### 3.3 待确认规则 → 业务逻辑增强表

| 规则问题 | 映射到 |
|----------|--------|
| 假设清单 | 标注 `[必验]`/`[风险]` |
| 业务规则 | 标注 `[待确认]` |

#### 3.4 输出文件

- 路径：`doc/V{版本}/业务逻辑清单_V{版本}-草案.md`
- 截图：无（页面标注 `[待原型]`）
- 状态：用户确认后进入原型阶段

---

## 二、Extract模式流程（原有流程）

适用于有原型HTML的验证场景。

### 阶段一：材料收集与范围确认

1. **读取导航索引** — `index.md` 提取带版本标记的页面列表
2. **读取现有文档** — 避免重复/识别增量
3. **读取页面源码** — 按 `reference/material-checklist.md` 逐页读取
4. **制定文档计划** — 提交用户审阅

### 阶段二：逐页生成文档内容

5. **逐页生成三表**：
   - 功能用例表（从源码提取交互场景）
   - 关键字段数据来源
   - 业务逻辑增强（可选）
6. **生成全局章节**：
   - 跳转关系表
   - 返回导航
   - 登录拦截
   - 状态流转表

### 阶段三：截图与输出

7. **自动截图** — `scripts/screenshot.py` 为每个页面截图
8. **合并输出** — 插入截图路径，输出完整文档

---

## 三、输入参数

| 参数名称 | 参数说明 | 必填 |
|----------|----------|------|
| 模式 | `--mode=draft` 或 `--mode=extract` | 否（自动检测） |
| 版本号 | 目标版本号，如 V0.3 | 是 |
| 需求描述 | Draft模式的输入 | Draft模式必填 |
| 页面列表 | Extract模式覆盖范围 | Extract模式可选 |
| 输出路径 | 文档保存路径 | 否（默认 `doc/V{版本}/`） |

---

## 四、输出规范

### 输出文件

| 模式 | 文件名 | 截图 |
|------|--------|------|
| Draft | `业务逻辑清单_V{版本}-草案.md` | 无 |
| Extract | `业务逻辑清单_V{版本}.md` | `screenshots/*.png` |

### 草案→正式版转换规则

| 草案标记 | 正式版替换 |
|----------|-----------|
| `[草案]` | 移除，替换为源码实现描述 |
| `[待原型]` | 移除，页面文件已存在 |
| `[待确认]` | 替换为确认结果或保留建议格式 |
| `[必验]`/`[风险]` | 标注验证结果 |

### 质量检查项

| 检查项 | Draft模式 | Extract模式 |
|--------|-----------|-------------|
| 标题编号连续 | ✓ | ✓ |
| 三表完整性 | ✓（标注草案） | ✓ |
| 截图引用 | 无 | ✓ |
| Not Doing清单 | ✓（≥Doing的50%） | 无 |
| 假设清单 | ✓（每页≥2条） | 无 |

---

## 五、模板与参考资料索引

### 模板

| 模板 | 说明 | 文件 |
|------|------|------|
| 文档骨架 | 正式版+草案版骨架 | [templates/doc-skeleton.md](templates/doc-skeleton.md) |
| 页面章节 | 正式版+草案版三表结构 | [templates/page-section.md](templates/page-section.md) |

### 规则

| 规则 | 说明 | 文件 |
|------|------|------|
| 需求收集 | Draft模式Phase 1流程（融合idea-refine） | [rules/requirement-collection.md](rules/requirement-collection.md) |
| 草案生成 | Draft模式Phase 2-3流程 | [rules/draft-generation.md](rules/draft-generation.md) |
| 文档结构 | 标题层级、编号规则 | [rules/document-structure.md](rules/document-structure.md) |
| 用例生成 | Extract模式从源码提取用例 | [rules/use-case-generation.md](rules/use-case-generation.md) |
| 流程图规则 | mermaid flowchart规范 | [rules/flowchart-rules.md](rules/flowchart-rules.md) |

### 参考资料

| 参考资料 | 说明 | 文件 |
|----------|------|------|
| 材料清单 | 双模式输入材料 | [reference/material-checklist.md](reference/material-checklist.md) |
| 草案示例 | 售后流程完整草案 | [reference/draft-example.md](reference/draft-example.md) |

### 脚本

| 脚本 | 说明 | 文件 |
|------|------|------|
| 截图脚本 | Chrome CDP自动截图 | [scripts/screenshot.py](scripts/screenshot.py) |

---

## 六、核心哲学（继承idea-refine）

1. **Simplicity is the ultimate sophistication** — 推向最简单的页面结构
2. **Start with the user experience, work backwards** — 先设计用户体验，再推导后台功能
3. **Say no to 1,000 things** — Not Doing清单是聚焦的核心
4. **Challenge every assumption** — 每条假设都需标注验证方式
5. **The parts you can't see should be as beautiful** — 后台流程设计需同样精细

---

## 七、Anti-patterns（反模式）

| 反模式 | 正确做法 |
|--------|----------|
| Draft模式不标注假设 | 每页必须标注假设清单（≥2条） |
| Draft模式无Not Doing | Not Doing ≥ Doing的50% |
| Draft模式预期结果模糊 | 具体到交互元素、颜色、页面名 |
| Draft模式跳过codebase扫描 | 必须扫描现有组件和约束 |
| Extract模式臆测未实现功能 | 每条用例必须在源码有对应 |
| 模式判断错误 | 优先用户指定，其次检测页面存在 |

---

## 八、验证清单

**Draft模式验证：**

- [ ] HMW问题陈述已写入头部
- [ ] 成功标准已定义
- [ ] Not Doing清单已列出（≥Doing的50%）
- [ ] 每个页面有假设清单（≥2条）
- [ ] 假设已区分 [必验]/[风险]/[暂略]
- [ ] 功能用例预期结果具体且标注 [草案]
- [ ] 跳转关系和状态流转已定义

**Extract模式验证：**

- [ ] 页面范围与版本标记一致
- [ ] 每条用例能在源码找到对应实现
- [ ] 截图已插入相对路径
- [ ] 跳转关系完整
- [ ] 标题编号连续