---
name: competitive-analysis
description: S2B2C / supply chain / e-commerce competitive analysis. Given a product design document for a supply chain system or e-commerce platform feature, systematically search competitor approaches, reason from industry best practices, compare key design decisions, and output a structured analysis report. Triggers on keywords like "竞品分析", "competitive analysis", "competitor", "how does X do it", "industry benchmark", "best practices", "行业对标", "benchmark".
---

# Competitive Analysis Skill V2.0

Industry benchmarking for **supply chain, e-commerce, and digital commerce system design**. Given a product design document (PRD, design spec, migration plan, etc.), this skill researches competitor approaches, **reasons from known industry best practices when specific competitor information is unavailable**, compares key design decisions, and produces a structured analysis report.

> **默认输出语言：中文** — 调用该 Skill 生成的竞品分析材料默认使用中文输出，除非用户明确要求使用其他语言。

**Applicable domains:**
- Physical e-commerce — 实物电商
- Virtual products / digital goods — 虚拟商品/数字权益
- Enterprise benefits marketplace — 企业福利商城
- Points mall — 积分商城
- Procurement platform — 采购平台
- S2B2C ecosystem — S2B2C 生态
- Marketplace platform — 平台型电商
- Supply chain middle platform — 供应链中台

**Core methodology:**
- First decompose the design document's key decisions, then search competitors, then compare — never the reverse
- Three phases: Extract design dimensions → Multi-channel competitor search + best-practice reasoning → Structured comparison output
- Output must be actionable: not just "what competitors do", but "what this means for our design"

---

## Step 0: Analysis Mode Selection

Before starting, determine the required depth:

| Mode | When to use | Scope | Output |
|------|------------|-------|--------|
| **A: Quick Benchmark** | Simple question, casual inquiry, early exploration | 3 competitors, key differences only | ~1 page summary, verbal only |
| **B: Product Review** (default) | PRD review, feature design evaluation, new function design | 9 dimensions, competitor comparison, design recommendations | Full report, 3-4 core dimensions deep + rest brief |
| **C: Architecture Review** | Migration plan, system redesign, platform architecture change | Data model, system boundary, process design, technical feasibility | Full report with architecture analysis |

**Auto-selection heuristic:**
- PRD / feature design doc → **Mode B**
- Migration / architecture / refactoring doc → **Mode C**
- Quick question / casual chat → **Mode A**

If uncertain, ask the user: "This looks like a [PRD / architecture doc / casual question] — I'll use Mode [B/C/A]. Does that work?"

---

## Step 1: Detect Input Context

**Auto-detect if a document is already available:**
- If the user has referenced, uploaded, or opened a document in the conversation → **automatically read it**, extract the product scope, and start analysis.
- If multiple documents are referenced → **ask which one to analyze**.
- If no document exists → **ask the user** to provide a PRD or design document path.

**Decision criteria:**

| User's response | Verdict | Action |
|----------------|---------|--------|
| Document already referenced in context | ✅ Auto-detect | Read the document, go to Step 2 |
| Provides a clear document path | ✅ Ready to proceed | Read the document, go to Step 2 |
| Describes a product idea but has no document | ⚠️ Idea but no doc | Suggest using `/prd-writer` first, then return for competitive analysis |
| Topic is unrelated to supply chain or e-commerce | ⚠️ Off-domain | This skill is specialized for supply chain / e-commerce / digital commerce systems. For other domains, the analysis may be less useful — proceed with caution |
| Vague direction, unsure what to analyze | ❌ Not a fit for this skill | Suggest clarifying the product or feature to analyze first |

---

## Step 2: Read and decompose the design document

1. Read the user's document (if the path is relative, resolve it from the project root)
2. Extract key design decisions and map them to the **9 supply chain / e-commerce dimensions**:

### Core dimensions (original 7)

| # | Dimension | What to ask | Typical concerns |
|---|-----------|-------------|-----------------|
| 1 | **Product & Catalog Model** | How are products defined? SPU/SKU structure? Multi-supplier sourcing? Product types? | Unified vs separate models, coding rules, multi-tenant isolation, category taxonomies |
| 2 | **Inventory & Asset Management** | What is the core asset? Lifecycle states? Accuracy and security? | Stock counting, allocation, lock/release, batch traceability, asset security, inventory visibility |
| 3 | **Order Fulfillment & Delivery** | How are orders fulfilled? Delivery modes? Automation level? | Wave picking, auto-fulfillment, physical vs digital, sync vs async, carrier integration, SLA |
| 4 | **Supplier & Sourcing** | How are goods sourced? Multi-supplier routing? Stockout mitigation? | Supplier onboarding, procurement models, price/cost priority, auto-degradation |
| 5 | **Notification & Customer Touch** | How are results communicated? Who owns the touchpoint? | B-side vs C-side separation, message templates, multi-channel delivery |
| 6 | **Reverse Logistics & Returns** | What happens on refund/return/cancellation? Asset recovery? | Refund timing, inventory return-flow, idempotency, condition checks |
| 7 | **System Boundary** | How does this feature relate to upstream/downstream systems? | Monolith vs microservice, API/webhook/async, multi-tenant isolation, consistency |

### New dimensions (V2.0)

| # | Dimension | What to ask | Typical concerns |
|---|-----------|-------------|-----------------|
| 8 | **Data Model & Data Asset** | What is the master data ownership? SKU/SPU model design? Data lifecycle? Data openness? | Master data ownership, data model design, data lifecycle management, API openness, data asset accumulation |
| 9 | **Operation Efficiency** | Configuration complexity? Manual operation cost? Automation level? Backend UX? | Setup steps, manual effort, degree of automation, admin panel UX, management efficiency |

3. **Prioritize dimensions for depth** — 9 dimensions x 2-3 competitors x side-by-side analysis generates extremely long output. To control token usage and maintain quality:
   - In **Mode A**: pick 1-2 dimensions only.
   - In **Mode B**: identify **3-4 core dimensions** that are most critical to the PRD's decisions. These get the full analysis (side-by-side, adopt table, reasoning, verdict). The remaining dimensions get a **brief paragraph** (3-5 sentences) or **N/A**.
   - In **Mode C**: focus on dimensions 7 (System Boundary), 8 (Data Model), and 3 (Fulfillment) for architecture depth.
   - **Present your prioritization to the user for confirmation** before proceeding.

4. **Present the extracted dimensions to the user for confirmation** — explain what you identified and let them supplement or adjust

> If a dimension is not applicable to the current feature, mark it as "N/A" with a reason. If the user wants to add other dimensions, follow their request.

---

## Step 3: Multi-channel competitor search + best-practice reasoning

Based on the confirmed dimensions, search for competitor and industry approaches for each dimension.

### 3.1 Search strategy

Search at least **2-3 relevant platforms** per dimension, in priority order:

1. **Supply chain / e-commerce SaaS platforms**: Youzan (有赞), Weimob (微盟), Shopify, Shopline, Shoplazza (店匠), JD VOP (京东企业购)
2. **Vertical supply chain representatives**: Choose based on the feature (e.g., virtual goods → Fulu 福禄 / Duiba 兑吧, procurement → JD VOP / 1688, retail → Youzan / Shangpai 商派)
3. **Industry solution providers**: Shushangyun (数商云), Baison (百胜软件), Comma (商派), LinkFlow
4. **Technical communities/documentation**: Developer docs, engineering blogs, industry analysis, e-commerce architecture patterns

### 3.2 Competitor selection strategy: two-tier approach

When selecting competitors for any given dimension, use a **two-tier approach**:

| Tier | Purpose | Example competitors | What to look for |
|------|---------|-------------------|------------------|
| **Tier 1: 🏛️ Horizontal baseline** | General UX/feature benchmarking from broad e-commerce/SaaS platforms. Validates "what's possible" at scale. | Shopify, Youzan, JD, Taobao/Tmall, Meituan | Feature design, UX patterns, architecture patterns, general market expectations |
| **Tier 2: 🎯 Vertical validation** | Direct model peers that share the same business model (S2B2C, B2B procurement, enterprise benefits). Validates "what's feasible in our specific scenario." | JD VOP, Fenxiang, Fulu, Duiba, Deli Jishi, Dingzan, Xiaoyang Yunshang | Business model alignment, process design, domain-specific constraints |

**Why two tiers matter**: A design might differ from Shopify (Tier 1) — that's fine, Shopify serves a different market. But if it differs from JD VOP (Tier 2), that's a red flag because they serve the same scenario. Always include at least 1-2 vertical validation competitors per dimension.

### 3.3 Competitor reference library

Use this curated list to select the most relevant competitors for each dimension. The list is organized by category — pick from the appropriate category depending on what dimension you're analyzing and which tier it belongs to.

**🛒 Comprehensive e-commerce & SaaS platforms** (horizontal baseline — best for general features, UX, business model)

| Platform | Positioning | Best for analyzing |
|----------|-------------|-------------------|
| **Shopify** | Global leading SaaS commerce platform | App ecosystem, theme marketplace, open payment/logistics integration, "platform + ecosystem" model |
| **Youzan (有赞)** | #1 Chinese private-domain commerce SaaS | Social commerce tools, membership system, WeChat/Douyin/Xiaohongshu deep integration |
| **Weimob (微盟)** | Chinese private-domain commerce SaaS (retail-focused) | Smart retail, offline-online integration, store management, CRM and marketing automation |
| **Taobao/Tmall (淘宝/天猫)** | China's largest centralized-commerce platform | Platform rules, traffic distribution, marketing tools, merchant backend (Qianniu) |
| **JD (京东)** | China's largest direct-retail + marketplace | Self-operated logistics, warehousing, fulfillment SLA, first-party vs third-party hybrid model |
| **Shoplazza (店匠)** | Cross-border e-commerce SaaS | Multi-currency, multi-language, global payment/shipping integration, DTC brand building |

**📦 Supply chain & ERP platforms** (vertical depth — best for sourcing, inventory, fulfillment, logistics)

| Platform | Positioning | Best for analyzing |
|----------|-------------|-------------------|
| **1688 (阿里巴巴)** | China's largest B2B sourcing platform | Dropship flow, supplier management, purchase order & inventory sync |
| **Guanyi (冠艺) / Wangdiantong (旺店通)** | Leading ERP service providers | Order processing, multi-platform inventory sync, intelligent warehouse assignment |
| **Fulu (福禄网络)** | Listed virtual goods supply chain aggregator | Digital goods API supply, 1000+ brand aggregation, batch fulfillment |
| **Duiba (兑吧)** | Points mall & user engagement platform | Virtual goods redemption, developer-hosted inventory, points-based checkout |

**🤝 S2B2C model platforms** (specific model benchmark — best for distribution, commission, B-end empowerment)

| Platform | Positioning | Best for analyzing |
|----------|-------------|-------------------|
| **Fenxiang (芬香)** | Social e-commerce S2B2C platform (JD-backed) | Distribution system, commission settlement, one-click product forwarding |
| **JD VOP (京东企业购)** | JD's enterprise supply chain open platform | API-based output of catalog, pricing, inventory and logistics — the canonical B2B2C model |
| **Shushangyun (数商云)** | S2B2C system solution provider | Dual-track product center, multi-tier distribution, AI-powered demand forecasting |

**💡 How to select competitors for a given dimension:**

| Analysis dimension | Recommended competitors to benchmark |
|-------------------|--------------------------------------|
| **Product & Catalog Model** | 1688, Shopify, Youzan |
| **Inventory & Asset Management** | Guanyi/Wangdiantong, JD VOP, Fulu |
| **Order Fulfillment & Delivery** | JD, Guanyi/Wangdiantong, Shopify Fulfillment, Youzan |
| **Supplier & Sourcing** | 1688, JD VOP, Fulu, Fenxiang |
| **Notification & Customer Touch** | Youzan, Shopify, Taobao |
| **Reverse Logistics & Returns** | JD, Youzan, Taobao |
| **System Boundary** | JD VOP, Shopify, Shushangyun |
| **Data Model & Data Asset** | Shopify (product model), JD VOP (API surface), Youzan (multi-type product) |
| **Operation Efficiency** | Youzan (low-code), Shopify (app store model), Taobao (Qianniu backend) |

> **Important**: This is a reference library, not a checklist. Pick the 2-3 most relevant competitors per dimension. Don't analyze all of them every time.

### 3.4 Competitor validation rules

Before selecting a competitor, verify:

1. **Company/platform exists** — is this a real, known entity?
2. **Business model matches** — does it operate in the same scenario as our analysis?
3. **Public information is available** — can we find reliable sources?
4. **Relevance to the current dimension** — does this competitor have a meaningful approach for this dimension?

**If verification fails:**
- Replace with a verified competitor from the reference library
- Or mark as "industry reference" instead of specific competitor (use 🟡 Reasoned)
- **Never use unknown vendors** unless the user provides them or public evidence exists

### 3.5 Competitor evidence rules (highest priority)

Every competitor statement must include an evidence type label. **Never describe 🟡 Reasoned or 🔴 Speculative conclusions as competitor facts.**

| Label | When to use | Allowed sources |
|-------|-------------|-----------------|
| 🟢 **Confirmed** | Found specific, reliable public information about a competitor's approach | Official documentation, public API docs, official product pages, public technical articles |
| 🟡 **Reasoned** | No specific competitor info found, but the approach follows well-known industry patterns | Industry standard inference, architecture pattern reasoning, your own domain knowledge |
| 🔴 **Speculative** | No info found and the approach is a genuine design choice with trade-offs, not a settled pattern | Hypothetical design assumption — explicitly call out that this is speculative |

> **Rule**: "Confirmed" = public evidence exists. "Reasoned" = logical inference from known patterns, clearly labeled. "Speculative" = guess, clearly labeled. Never present reasoned or speculative as confirmed.

### 3.6 Best-practice reasoning (when competitor info is unavailable)

**If a specific competitor's internal logic is not publicly documented, it is acceptable to reason from known industry best practices and first principles.** This is NOT fabrication — it is explicitly reasoning about what a well-designed system would do, based on:

- **Established e-commerce architecture patterns** (e.g., state machine design for orders, inventory lock/release patterns, payment reconciliation)
- **Known constraints** that any system in this domain must solve (e.g., concurrency safety for inventory, idempotency for payments, eventual consistency for cross-system order sync)
- **Published engineering practices** from tech companies (e.g., Meituan Tech Blog, Alibaba Cloud documentation, AWS e-commerce reference architecture)
- **Your own knowledge** of how similar systems are designed at scale

**For each dimension, always include the best-practice reasoning section**, even if you found specific competitor info. This gives the reader both the "what" and the "why".

**Use the following per-dimension analysis format** (inspired by the combo product analysis pattern — side-by-side comparison, adopt/don't-adopt decisions, and one-sentence verdict):

```
### Dimension: [Name]

#### Why this competitor
- (🏛️ Horizontal) [Competitor A]: [why chosen]
- (🎯 Vertical) [Competitor B]: [why chosen]
- (🎯 Vertical) [Competitor C]: [why chosen]

#### Competitor comparison

**Side-by-side with [Competitor A]:**
```
[Competitor A] approach                          | Our approach
─────────────────────────────────────────────────┼──────────────────────────────────
[Feature 1]: concise phrase                     | concise phrase
[Feature 2]: concise phrase                     | concise phrase
```
→ Adopt/Don't adopt: [✅ / ❌ / ⚠️ partial]
  Reason: [why]
  Evidence: [🟢 Confirmed / 🟡 Reasoned / 🔴 Speculative]

> ⚠️ **Table format rule**: Use concise phrases or bullet points inside table cells — **no long sentences**. Long text wraps badly in Markdown tables. Put detailed explanation in the "Reason" line below the table.

**Side-by-side with [Competitor B]:**
...
→ Adopt/Don't adopt: ...
  Evidence: [🟢 / 🟡 / 🔴]

#### Industry best-practice reasoning
In a typical [domain] system, [dimension] is designed around [core principle].
The standard approach is to [standard practice], because [reason].
Variations exist when [condition] — then systems tend to [alternative].

#### Adopt/Don't-adopt summary

| Competitor | Key difference | Decision | Evidence | Reason |
|------------|---------------|----------|----------|--------|
| [Competitor A] | [diff] | ✅/❌/⚠️ | 🟢/🟡/🔴 | [rationale] |
| [Competitor B] | [diff] | ✅/❌/⚠️ | 🟢/🟡/🔴 | [rationale] |

#### One-sentence verdict
> [Single sentence capturing the essence.]

#### 📌 Implications for Our Design
> [Actionable recommendation — change, keep, or monitor? Priority?]
```

### 3.7 Post-search summary

For each dimension, produce a one-paragraph summary:

- **Industry consensus**: most competitors do it this way → this is the "right way"
- **Divergent approaches**: some do A, some do B → this is a design choice with trade-offs
- **Innovation**: no competitor found doing the same thing → could be our innovation, or a risk
- **Reasoned gap**: no public info, but logically this is what they likely do → mark as 🟡 Reasoned

---

## Step 4: Output a structured analysis report

**Adaptive output:** Use the full template for Mode B/C. For Mode A (Quick Benchmark), use a condensed format: only Executive Summary + 3 key differences + verbal summary.

**Full template (Mode B/C):**

```
# [Product Name] — Competitive Analysis Report

## Executive Decision Summary

### Overall Conclusion
[One-sentence verdict — is this design sound?]

### Biggest Strength
[What our design does better than competitors]

### Biggest Risk
[What needs priority attention]

### Recommended Changes
1. [Change 1] — Priority: [High/Medium/Low]
2. [Change 2] — Priority: [High/Medium/Low]

### Final Score
| Dimension | Score (/10) | Notes |
|-----------|:-----------:|-------|
| Product Design Fit | /10 | |
| Industry Alignment | /10 | |
| Architecture Soundness | /10 | |
| Competitive Differentiation | /10 | |
| Implementation Risk | /10 | (lower = better) |
| **Overall** | **/10** | |

---

## 1. Competitor Landscape Overview

| Platform | Tier | Type | Positioning | Core Model | Relevance |
|----------|------|------|-------------|------------|-----------|
| [Competitor A] | 🏛️ | | | | |
| [Competitor B] | 🎯 | | | | |
| [Competitor C] | 🏛️ | | | | |

> 🏛️ Horizontal = broad e-commerce/SaaS benchmark. 🎯 Vertical = direct model peer.

---

## 2. Dimension-by-Dimension Comparison

### 2.1 [Dimension Name]

#### Why this competitor was chosen
- **Competitor A**: [what aspect they validate]
- **Competitor B**: [what aspect they validate]

#### Side-by-side comparison

**vs [Competitor A]:**
```
[Competitor A] approach                         | Our approach
────────────────────────────────────────────────┼───────────────────────────────────
[Feature 1]: concise phrase                     | concise phrase
[Feature 2]: concise phrase                     | concise phrase
```
→ **Adopt/Don't adopt**: [✅ / ❌ / ⚠️]
  Reason: [why]
  Evidence: [🟢 Confirmed / 🟡 Reasoned / 🔴 Speculative]

> ⚠️ **Table format rule**: Concise phrases only. No long sentences in table cells.

#### Adopt/Don't-adopt summary

| Competitor | Key difference | Decision | Evidence | Reason |
|------------|---------------|----------|----------|--------|
| [A] | [diff] | ✅/❌/⚠️ | 🟢/🟡/🔴 | [rationale] |

#### Industry best-practice reasoning
> [What a well-designed system would typically do for this dimension, and why.]

#### One-sentence verdict
> [Single sentence capturing the essence.]

#### 📌 Implications for Our Design
> [Actionable recommendation — change, keep, or monitor? Priority?]

### 2.2 [Dimension Name] — Brief
> [For non-core dimensions: 3-5 sentence summary, no side-by-side, no adopt table.]

---

## 3. Decision Matrix

For key design decisions, compare options:

| Option | Industry Maturity | Cost | Risk | Recommendation |
|--------|:-----------------:|:----:|:----:|:--------------:|
| [Option A] | High / Medium / Low | High / Medium / Low | High / Medium / Low | ✅ / ⚠️ / ❌ |
| [Option B] | High / Medium / Low | High / Medium / Low | High / Medium / Low | ✅ / ⚠️ / ❌ |

---

## 4. Architecture Impact (Mode C only)

| Aspect | Analysis |
|--------|----------|
| Domain Boundary | [Where does this feature's domain start and end?] |
| Service Ownership | [Which service owns this capability?] |
| Data Ownership | [Which system is the source of truth?] |
| API Dependency | [What APIs does this feature depend on/provide?] |
| Event Flow | [Key events and their consumers] |
| Consistency Strategy | [Strong consistency vs eventual consistency decisions] |

---

## 5. Business Impact Assessment

| Impact Dimension | Rating | Notes |
|-----------------|:------:|-------|
| Revenue Impact | High / Medium / Low | |
| Efficiency Impact | High / Medium / Low | |
| Risk Impact | High / Medium / Low | |
| User Experience Impact | High / Medium / Low | |

---

## 6. Cross-Competitor Synthesis

| Competitor | What they validate | What our design adds/changes |
|------------|-------------------|------------------------------|
| [Competitor A] | [base model validation] | [our differentiation] |
| [Competitor B] | [feasibility validation] | [our differentiation] |

> **One-sentence conclusion**: [Competitor A] validates [aspect], [Competitor B] confirms [aspect] — our design differentiates by [core differentiation]. Every decision is a deliberate choice for the [specific scenario] context.

---

## 7. Feasibility Conclusion

| # | Design Decision | Competitor Evidence | Feasibility |
|---|----------------|-------------------|:-----------:|
| 1 | [Decision] | [which competitor] | ✅ High / ⚠️ Medium / ❌ Low |
| 2 | [Decision] | [which competitor] | ✅ High / ⚠️ Medium / ❌ Low |

> ✅ High = multiple competitors confirm. ⚠️ Medium = mixed evidence. ❌ Low = no competitor does this.

---

## 8. Explicitly Not Adopted

| Approach / Feature | Why not adopted | When we may revisit |
|-------------------|----------------|-------------------|
| [Competitor approach] | [Reason: why competitor uses it, why our scenario differs, what risk we avoid] | [Condition — e.g., "if we expand to C-end self-service"] |
| [Competitor approach] | [Reason] | [Condition] |

> **Purpose**: Documents deliberate rejection decisions so they don't get re-raised. Every item was considered and rejected for a specific reason.

---

## 9. Overall Assessment

### Strengths (industry-leading or differentiated)
1. ...
2. ...

### Areas for Improvement
1. ...
2. ...

### Risks
1. ...
2. ...

### Confidence Summary
| Dimension | Confidence Level | Reason |
|-----------|-----------------|--------|
| [Dimension 1] | 🟢 / 🟡 / 🔴 | |

---

## 10. References

| Source | Link | Type |
|--------|------|------|
| [Source Name] | [URL] | Competitor doc / Industry article / Best-practice reasoning |
```

> **Report writing principles:**
> - Every conclusion must have a source or a clear reasoning chain. Label each as 🟢 Confirmed / 🟡 Reasoned / 🔴 Speculative
> - Be decisive in comparisons — say "our approach is better" or "the competitor's approach is better", don't be vague
> - Explain *why* differences exist (different product positioning, target users, development stage, scale requirements)
> - Implications must be *actionable* — not "worth watching" but "do this: [specific action], priority: [high/medium/low]"
> - Always include a "Confidence Summary" table so the reader knows which parts are well-researched vs. reasoned

---

## Step 5: Deliver to the user

**File generation rule:**
- **Default**: Return the analysis in chat (verbal summary + key findings in chat).
- **Write to file only when**: user explicitly requests a file, OR the output exceeds 5000 words, OR the analysis is part of a formal project archive, OR the user is doing a formal review cycle.

**Naming convention** (when writing to file): `[number].[document-name]-competitive-analysis.md`
- Place it in the same directory as the original document
- If the original is `XX.Product-Design-V1.0.md`, the analysis file is `XX.Product-Design-Competitive-Analysis.md`
- If the original has no number, use `[document-name]-competitive-analysis.md`

**Verbally summarize 3 core findings:**
1. Biggest strength: where our design leads or differentiates
2. Biggest risk: the design gap that needs priority attention
3. Most worth adopting: which competitor/best-practice approach we should borrow (and priority)

---

## Guiding Principles (review before every execution)

**1. Search first, reason second.** Always try to find specific competitor information through web search before resorting to best-practice reasoning. But when real information is unavailable, **reasoning from first principles is better than leaving a blank**.

**2. Label evidence types rigorously.** Every finding must be labeled 🟢 Confirmed / 🟡 Reasoned / 🔴 Speculative. Never describe reasoned or speculative conclusions as competitor facts. The reader needs to know how much to trust each conclusion.

**3. Validate competitors before using them.** Verify the company exists, the business model matches, and public information is available. Replace or flag as "industry reference" if verification fails.

**4. Dimensions are focused on supply chain & e-commerce.** The 9 dimensions are tuned for this domain. If a dimension genuinely doesn't apply, mark it "N/A" — don't force-fill it. If the user wants to add domain-specific dimensions, follow their request.

**5. Multiple data points per dimension.** Compare at least 2-3 data points per dimension — whether from specific competitors or reasoned best practices. Don't cite a single source as "industry consensus".

**6. Output must be actionable.** Every implication should answer: "Should we change? How? What priority?" — not "Competitors have this, we could consider it too."

**7. Control output length — prioritize depth over breadth.** 9 dimensions x 2-3 competitors x side-by-side analysis can easily exceed 10,000 words. In Mode B, identify 3-4 core dimensions for deep analysis; summarize the rest briefly. Adapt output to the mode selected in Step 0.

**8. Every rejected feature must explain 4 things:** why the competitor uses it, why our scenario differs, what risk we're avoiding, and when we may revisit it.

**9. Confirm with the user before writing to file.** Default is chat response. Write to file only when the user explicitly requests it, or the output exceeds 5000 words, or it's part of a formal project archive.