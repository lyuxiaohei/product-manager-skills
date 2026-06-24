# prototype-design

原型设计规范技能，支持双模式生成符合项目UI设计标准的纯HTML页面代码。

- 纯口述模式：支持直接口述需求快速生成原型
- 草案模式：支持 logic-list-spec 草案输入，精确映射功能用例到UI

包含后台管理系统（运营侧）和小程序（用户侧）两套设计体系。

## 技能链

本技能是产品规格技能链的一部分：

```
需求描述 → logic-list-spec → prototype-design → logic-list-spec Extract → prd-auto-generator
```

技能链协作指南详见 [技能链协作指南.md](技能链协作指南.md)

## 文件结构

```
SKILL.md                              主技能文件（路由+核心规范）
├── rules/                            模式识别与解析规则
│   ├── mode-detect.md                模式自动检测
│   ├── keyword-extractor.md          口述关键词提取
│   ├── page-type-inferencer.md       页面类型推断
│   └── draft-parser.md               草案解析
├── mappings/                         草案→UI映射规则
│   ├── use-case-to-component.md      功能用例→组件
│   ├── field-to-ui-element.md        字段→UI元素
│   ├── state-to-interaction.md       状态流转→交互
│   └── navigation-to-flow.md         页面导航→跳转
├── components/                       组件CSS规范
│   ├── backend-components.md         后台组件（按钮/网格/分页/分类树）
│   └── miniprogram-components.md     小程序组件（框架/导航/Tab/卡片/弹窗等）
├── templates/                        页面HTML模板
│   ├── backend-template.md           后台页面骨架
│   └── miniprogram-template.md       小程序页面骨架
├── validators/                       输入输出验证
│   ├── input-validator.md            输入验证
│   └── output-validator.md           输出HTML验证
├── reference/                        参考资料
│   ├── resources.md                  图标/图片素材网站推荐
│   ├── svg-icons.md                  小程序SVG图标代码库
│   └── draft-input-example.md        草案输入示例
├── reference.md                      口述模式参考页面
└── 技能链协作指南.md                   技能链协作说明
```

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| V0.50 | 2026-05-18 | SKILL.md重构为路由器架构（420→159行）；components文件自包含；版本号归零 |
| V0.40 | 2026-04-24 | 新增草案模式，支持logic-list-spec草案输入；重构为双模式并行架构；组件/模板拆分为独立文件 |
| V0.30 | 2026-04-24 | 禁用Emoji，新增资源推荐章节（Icon/图片网站），新增SVG图标代码库 |
| V0.20 | 2026-04-24 | 新增小程序设计规范章节，重构为双规范并行结构 |
| V0.10 | 2026-04-24 | 后台管理系统设计规范 |
