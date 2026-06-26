---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* `CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## Project File Structure

For this project (OCS 商城客服系统), all PM documents live under `doc-pm/V1.0/`:

```
prototype-cs/
├── admin/                          PC管理端原型
├── user/                           移动用户端原型
└── doc-pm/
    └── V1.0/
        ├── CONTEXT.md              术语表（角色/单据/模块简称）
        ├── 业务建模_V0.3.md         主文档·四维框架
        ├── 业务建模_V0.2.md         V0.2·双视角实体模型
        ├── 业务建模_差异_V0.3.md     V0.3 vs 原型差异对比
        ├── PRD-后台-V0.5.md         后台功能规格（最新）
        ├── PRD-OCS-V1.0.md          原始全系统PRD
        ├── 业务逻辑清单_V1.0.md      完整用例表
        ├── PROTOTYPE-FLOWS.md       页面流程图
        └── docs/adr/0001~0012.md     12篇架构决策
```

## Business Modeling Framework (V0.3 四维框架)

When building or updating the domain model, follow this 4-dimension framework. Each dimension has a specific output format and target section in `业务建模_V0.3.md`.

### Dimension 1: 业务闭环 (Business Closure)

Start with a one-sentence summary of the business loop, then define scope boundaries.

**Output**: Scope table (In Scope / Out of Scope) + end-to-end Mermaid flowchart.

**Ask**: "Who solves what problem through which actions?" → narrow to "What is in 1期 MVP and what is deferred?"

### Dimension 2: 角色泳道 (Actor Swimlane)

Define all actors (C/A/S/SYSTEM) with role boundaries, then build the actor × phase matrix.

**Rules**:
- C=终端用户 (source=0), A=客服 (source=1), S=客服主管 (source=1,higher), SYSTEM=系统自动 (source=2)
- Every state transition must distinguish S (human click) vs SYSTEM (auto)
- A sees only own sessions; S sees all

**Output**: Role definition table + Actor × Phase matrix.

### Dimension 3: 单据实体模型 (Entity Model)

Build from entity list → ER diagram → aggregate boundaries → state machines.

**Entity type criteria**:
| Type | Criteria | Examples (OCS) |
|------|----------|----------------|
| Aggregate Root | Has ID + state machine + independent table + single entry point | Session, User, Knowledge |
| Entity | Has ID + independent lifecycle + persistent | Message, Transfer, Rating, FAQ, Script, BusinessCategory |
| Value Object | No ID, defined by attribute values | entry_tag, transfer reason, rating tags, member level |
| Singleton | Global single-row config | SystemSetting |
| View | No data produced, cross-entity aggregation | Todo, Dashboard |

**Output**: Mermaid ER diagram (field-level, 11 entities) + aggregate boundary diagram + state machines (Session/Transfer/Rating/Knowledge).

**ER writing rules**:
- Entity headers use plain IDs (e.g., `USER {`)
- Relationship lines use aliases for display: `USER["用户 User"] ||--o{ SESSION["会话 Session"] : "发起咨询"`
- Field comments must be ASCII only — Chinese descriptions go in a mapping table below the diagram
- Deleted tables: `customer_chat_leave_messages` / `customer_chat_leave_replies` (ADR 0012: Leave = Session offline state)

**State machine writing**:
- Only show the runtime entities with state machines: Session, Transfer, Rating, Knowledge
- Each state machine must include guard conditions and trigger roles
- Session state machine MUST include the `offline` state (ADR 0012)

### Dimension 4: 用例拆解·十字法 (Use Case Decomposition)

Cross-method: each actor × each scenario, normal cases + exception cases.

**Naming convention**: `UC-{Module}-{Number}` for normal cases, `UC-{Module}-E{Number}` for exceptions.

**Output**: Per-module tables (normal UCs + exception UCs) with ID numbering.

**Key invariants to reference**:
| INV | Constraint | Implementation |
|-----|-----------|----------------|
| INV-01 | cancel sessions don't generate rating tasks | State machine guard |
| INV-02 | pending state excluded from idle timeout | cron skips pending |
| INV-03 | User message priority over resume_at timer | WS interception |
| INV-04 | Message recall limited to 2 minutes | `data-sent-ts` check |
| INV-05 | 60s dedup for similar leave messages | Backend dedup |
| INV-06 | Transfer accept: admin_id + status in one transaction | DB transaction |
| INV-07 | Concurrent session grab: only first CAS succeeds | Optimistic lock |
| INV-08 | session_id + to_admin_id unique | DB constraint |
| INV-09 | Sensitive word library unavailable → fail-open | ADR-0008 |
| INV-10 | Staff capacity=0 skips auto-assignment (manual OK) | Routing logic |

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with documentation

When the user states how something works, check whether the docs agree. Reference `doc-pm/V1.0/PRD-后台-V0.5.md` for functional specs, `doc-pm/V1.0/CONTEXT.md` for terminology, and `doc-pm/V1.0/docs/adr/` for architectural decisions.

### Update 业务建模 inline

When a term, entity, state, or rule is resolved, update `业务建模_V0.3.md` in the corresponding section. Don't batch these up — capture them as they happen.

### Sync with PROTOTYPE

When changes are made to the business model, check `业务建模_差异_V0.3.md` to see if the change conflicts with the prototype. Mark any new discrepancies.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up — capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` should be totally devoid of implementation details. Do not treat `CONTEXT.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.
