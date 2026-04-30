# Generic CV — Pass 1 Change Notes

**Date:** 2026-04-29
**Source session:** Initial drafting of `cv-generic.md` (broad-based technology-leader resume for blind recruiter outreach + LinkedIn refresh)
**Status:** PENDING consolidation. Do not apply piecemeal. Subsequent generic-CV sessions will surface overlapping changes; consolidate before formal commit.

---

## Purpose

This document captures concrete changes to the career-ops system that surfaced during the initial `cv-generic.md` drafting session. The intent is to defer application until additional generic-CV sessions complete, then apply as a batch with overlap resolved.

The changes fall into three tiers:
- **Tier 1** — Corrections to framings currently live in `modes/_profile.md` that this session identified as inaccurate or rejected. These affect every evaluation, batch run, and tailored CV until applied.
- **Tier 2** — New knowledge surfaced this session that should be preserved in the system for future evaluation, cover-letter, and CV work.
- **Tier 3** — System hygiene: file references, calibration log, voice notes.

---

## Files affected (preview)

| File | Tier | Nature of change |
|------|------|------------------|
| `modes/_profile.md` | 1 | Rewrite stale framings in PM Positioning section |
| `modes/_profile.md` | 1 | Extend Proof-Point Anchors items 1 and 7; add new item 11 |
| `article-digest.md` | 2 | Add "MMI — Enterprise Platform (Anonymized)" section |
| `article-digest.md` | 2 | Add "DMLCo — Operating Profile" section |
| `modes/_profile.md` | 2 | Add "Generic Positioning Principles" section |
| `MEMORY.md` + `feedback_voice_anti_ai_smell.md` | 3 | Append voice calibrations from session |
| `CLAUDE.md` | 3 | Add `cv-generic.md` row to Main Files table |
| `cv.md` | 3 | Optional — add Financial Transaction Core bullet for tailored runs |
| `patches/PLAYBOOK.md` | 3 | Note this calibration in the divergence log |

---

# Tier 1 — Live evaluation accuracy

These corrections fix framings currently being read by every evaluation. Apply first when consolidation runs.

## 1.A `modes/_profile.md` — PM Positioning section (lines ~152–194)

### Issue 1: Multi-factor parenthetical (lines 161–162)

**Current text:**
> - **Multi-factor prioritization model** — ROI × user satisfaction × efficiency × cross-departmental equity; the equity mechanism prevented any single function from dominating or being ignored sprint-over-sprint

**Proposed replacement:**
> - **Stakeholder-balanced prioritization model** — recalibrated sprint-over-sprint between the dominant operations stakeholder and the broader organization to balance new feature demand against technical debt remediation; governance ran across 12+ executive and operations stakeholders.

**Rationale:** User explicitly rejected the four-axis parenthetical (ROI × satisfaction × efficiency × equity) as buzzy and not earning its space in resume/positioning voice. The actual operating reality was a **constant recalibration** between MMI's single dominant operations stakeholder and the rest of the organization. The four-axis framing was a system-introduced phrase that emerged in a prior session without grounding. Note: the four-axis model may have been a real artifact during MMI portfolio governance; the rejection is specifically about **how it's used in positioning materials**, not about whether the model existed. Cross-departmental equity remains valid as one input. Decide during consolidation whether to keep the four axes documented as backstory in `_profile.md` while removing them from positioning text.

### Issue 2: "Single-product to multi-product" framing (line 167)

**Current text:**
> - Platform-product thinking: architected migration from single-product platform to variable multi-product financial platform with differentiated requirements, fees, and support per product

**Proposed replacement:**
> - Platform-architecture thinking: drove the homegrown enterprise platform's transformation from reactive, point-solution code to abstracted, pattern-based architecture; consolidated MMI's full counseling activity range (debt management plans, housing counseling, bankruptcy counseling, financial education) onto a single central system.

**Rationale:** User explicitly rejected the single-product → multi-product framing. The platform was not single-product at start in the sense the original phrasing implies. The actual architectural transformation was: from **reactive code built around specific business needs** (resulting in massive redundancy across similar features) to **abstracted architectural patterns supporting all "X-shaped" needs**. The functional consolidation was: bringing the full range of counseling activities under one system, where they had previously been served by mixed dedicated and bolt-on tools. User's exact words: *"INDY was reactively built to address biz need. The transformation was architectural: instead of building around specific need X (the historical pattern), we would abstract into architectural patterns that would allow us to support all needs that were vaguely X shaped."*

### Issue 3: Flagship PM Story #1 (lines ~191–192)

**Current text:**
> 1. **Expansion / platform-product story (LEAD):** Architected roadmap to convert the platform from a single-product tool to a variable multi-product financial platform, each product with its own matrix of requirements, fees, and support. Platform-product thinking, extensibility architecture, forward-looking roadmap design.

**Proposed replacement:**
> 1. **Architectural-transformation story (LEAD):** Drove the homegrown enterprise platform's transformation from reactive, point-solution code to abstracted, pattern-based architecture, consolidating MMI's full counseling activity range onto a single central system. Multi-year roadmap ownership, extensibility-by-design architecture, governance through stakeholder recalibration between dominant operations stakeholder and broader organization.

**Rationale:** Same as Issue 2 — the single→multi-product framing was rejected. Replacement preserves the "lead" status of the platform-architecture story but reframes accurately around abstraction-for-pattern-support and counseling-activity consolidation.

### Issue 4: Flagship PM Story #2 — Recovery story

**Current text (lines ~192–193):**
> 2. **Recovery story:** Stepped into the IT lead role after a disastrous platform launch. Led operational recovery. Platform's core function — daily movement of client funds — ran at 100% accuracy year over year thereafter. Existential-reliability outcome.

**Proposed enhancement (additive, not replacement):** Add specifics surfaced this session. Replacement text:
> 2. **Recovery / financial-core hardening story:** Joined as Senior DBA shortly after a rough 3rd-generation platform launch (downtime, errors, reactive architecture). Partnered with the lead Development DBA to architect and harden the platform's daily financial transaction core — approximately $1M moved daily on behalf of thousands of consumers to hundreds of creditors. The core ran at four-nines uptime and accuracy through the decade-plus that followed. Existential-reliability outcome built into the architecture from the early hardening forward.

**Rationale:** Adds the specific scale ($1M/day, thousands of consumers, hundreds of creditors) and reliability claim (four-nines uptime AND accuracy) that the user confirmed this session. Provides hands-on contribution credit ("partnered with the lead Development DBA") without ego-grandstanding. Replaces vague "100% accuracy year over year" with the more precise "four-nines."

---

## 1.B `modes/_profile.md` — Proof-Point Anchors (lines ~34–47)

### Item 1 (Scale at MMI) — extend

**Current text (line 38):**
> 1. **Scale at MMI.** Fourteen years at MMI, with eight of those as the first CTO in the organization's 45+ year history. 35+ direct / 75+ extended staff. $15M+ IT operating budget within $30–50M total IT spend. Reporting trajectory: CTO → CEO (~8 years); VP IT → CFO (~2–3 years); prior seats within IT leadership.

**Proposed addition (extend the same item):**
> Organization size: 400+ person national consumer financial services nonprofit operating across multiple sites with hundreds of remote agents. Member of MMI's senior executive team (4–7 person cabinet) across the CTO tenure; primary technology voice in enterprise strategy and key contributing voice in long-range strategic planning. Most major enterprise initiatives during the period were technology-led, requiring cross-cabinet consensus and integrated execution.

**Rationale:** User confirmed organizational headcount (400+, not 300+ as some materials show). User confirmed senior-exec-team size (4–7 person, peer to COO, CFO, Counsel, CRO — these specific peer-roles are interview-only, do NOT externalize). User confirmed "most major enterprise initiatives were technology-led" as a defensible claim. Extending Item 1 keeps the existing structure intact while landing the enterprise-strategic-role precision.

### Item 7 (Board-level exposure) — extend

**Current text (line 44):**
> 7. **Board-level exposure.** 4–5 board engagements per year over the CTO tenure: presentations on major initiatives plus free-flowing updates.

**Proposed replacement:**
> 7. **Board-level exposure and capital ownership.** Sole technology voice to the Board across 4–5 meetings annually over the CTO tenure: presentations on major initiatives plus free-flowing Q&A on technology matters. Owned annual technology capital planning end-to-end — stakeholder consensus, financial rationale and ROI models, multi-year roadmap, and Board advocacy through required annual approval. Successfully led technology integration across every M&A transaction during the tenure.

**Rationale:** User confirmed he was the **sole** (not "primary" — sole) technology voice to the Board. User confirmed capex ownership through annual Board approval. User confirmed multiple successful M&A integrations with the strong claim that all integrations were successful. This item becomes the exec-cabinet capital-and-Board credential anchor for archetype framing.

### NEW Item 11 — Financial Transaction Core

**Proposed new item, append to list:**
> 11. **Financial transaction core hardening.** As Senior DBA in partnership with the lead Development DBA, architected and hardened the daily financial transaction layer of MMI's homegrown enterprise platform. The subsystem processed approximately $1M daily on behalf of thousands of consumers to hundreds of creditors and ran at four-nines uptime and accuracy through the decade-plus that followed. Core proof of hands-on technical grounding underneath the executive trajectory.

**Rationale:** This is the early-career hands-on credential that anchors the DBA → CTO arc. User confirmed the scale ($1M/day) and reliability (4 9s uptime and accuracy). Honest framing per session: "partnered with the lead Development DBA" credits the partnership without ego-grandstanding. This proof point is the answer when an evaluation needs to defend "executive who can still get hands dirty" or "data-leadership credential" without leaning on the (lighter) DataRobot ML claim.

### Adaptive Framing table updates

The proof-point numbers change with the addition of Item 11. Audit the adaptive framing table (lines ~51–60) and add Item 11 to:
- **Chief Technology Officer:** add 11 (hands-on grounding underneath the seat)
- **Head of Data / CDO / VP Data:** add 11 (real production data work, not just executive governance)
- **Enterprise Technology Strategy:** add 11 (architectural discipline at the practitioner level)
- **Fractional / Advisory CTO:** add 11 (reinforces hands-on credibility)

---

# Tier 2 — Preserve session knowledge

These additions capture facts and framings that emerged this session and should inform future evaluations, cover letters, and tailored CVs.

## 2.A `article-digest.md` — Add "MMI — Enterprise Platform (Anonymized)" section

Following the existing pattern of the "MMI — Contact Center / Communications Platform Transformation" section.

**Proposed new section text:**

```markdown
---

## MMI — Enterprise Platform (Anonymized — never reference internal codename)

**What:** MMI's homegrown enterprise platform (ERP/CRM hybrid) was a 3rd-generation system launched shortly after Daniel joined the organization. Architecture at launch: n-tier, fat client, .NET + WinForms front-end, monolithic SQL Server back-end (designed and intended monolithic). Initial launch was rough — downtime, errors, reactive architecture. Daniel was hired as Senior DBA during this period; the platform stabilized and matured under his ownership through to his CTO tenure.

**Daniel's hands-on contribution:** As Senior DBA, partnered with the lead Development DBA to architect and harden the platform's daily financial transaction core. The subsystem processed approximately $1M daily on behalf of thousands of consumers to hundreds of creditors and ran at four-nines uptime and accuracy through the decade-plus that followed.

**Modernization arc (5-year roadmap delivered across 8 years through pandemic disruption):**
- Repeated rearchitecting and refactoring; transition to MVVM front-end patterns; ongoing transition toward microservices, established as the default pattern for new development.
- Approximately 24 services exposed via APIs.
- Enterprise data definitions, centralized data platforms and warehouses, managed self-service analytics — required sustained cross-organizational stakeholder engagement to land.
- Sitecore-based digital integration with real-time access to enterprise platform data, driving measurable conversion-rate gains on the consumer funnel.
- Core integration layer between the enterprise platform and contact center system survived intact through a subsequent contact center vendor replacement (Genesys → NICE).

**Governance model:** Multi-year platform roadmap ownership; stakeholder governance recalibrated sprint-over-sprint between the dominant operations stakeholder and the broader organization; balanced new feature demand against technical debt remediation; flexed annual tech-debt budget; Board-level engagement at significant moments.

**SDLC delivery:** Doubled software development throughput and reduced concept-to-deployment timelines up to 20% year-over-year through Agile adoption (SAFe 10-week → 2-week sprints).

**How to use:**
- Anonymize the platform always — never reference by internal codename.
- The financial transaction core scale and reliability ($1M/day, 4 9s) is the strongest single concrete proof point for hands-on technical grounding.
- The Genesys → NICE durability claim is the strongest single proof point for architectural quality.
- The "reactive point-solution → abstracted pattern-based architecture" framing is the canonical replacement for any "single-product to multi-product" framing in older materials.
```

**Rationale:** Mirrors the existing "MMI — Contact Center" section's structure. Centralizes platform proof points in the file evaluation modes already read. The "How to use" section gives explicit guardrails so future evaluation runs apply the framings consistently.

## 2.B `article-digest.md` — Add "DMLCo — Operating Profile" section

**Proposed new section text:**

```markdown
---

## DMLCo — Operating Profile

**What:** Web and IT consulting firm founded and run by Daniel from January 1996 to January 2012 (17 years). Full P&L ownership; direct executive responsibility for financial management, hiring, talent development, sales/marketing, client delivery, partnerships, branding, and operations.

**Operating scale:**
- Peak headcount: 12 people, including 8 technical employees (4 infrastructure, 4 development).
- Peak annual revenue: $4M+.
- Client portfolio: approximately 50 active clients across legal, tax, manufacturing, national nonprofits, national baseball research organization, and small-business miscellaneous verticals. Several clients sustained relationships of 12+ years.

**Business mix evolution:**
- Initial phase (~1996 – early 2000s): genuine 50/50 split between small-business back-office services (NT 4.0 / Microsoft Small Business Server installation and maintenance, desktop software support, network configuration, file access, backups, internet connectivity) and software development.
- Sold the back-office services line in early 2000s. **Important framing note:** the back-office business was booming at the time of the sale; the exit was NOT market prescience. Do NOT frame this as adaptive market-reading. The decision was about concentration of effort, not signal-reading.
- Post-sale: exclusively web and software development, increasingly dominated by content management system (CMS) work.
- Architected and launched a proprietary, commercial-grade ColdFusion-based CMS that supported dozens of content-driven client websites and frequently served as clients' first digital presence.

**Daniel's role:** Founder, salesperson, architect, hiring manager, financial owner, client lead. Hands-on across infrastructure, development, and business operations.

**Wind-down:** Wound down intentionally as focus shifted to graduate work and the enterprise technology arc at MMI.

**How to use:**
- Use as the entrepreneurial-operator credential when relevant: founded and ran a real business with real P&L for 17 years.
- The 50-client portfolio across diverse verticals is a portfolio-thinking and cross-vertical-exposure credential.
- The CMS architecture is the longest-running architectural-discipline proof point in Daniel's career.
- The 12+ year client relationships demonstrate durable trust-building.
- DO NOT frame the back-office sale as market prescience or adaptive strategy. It was concentration, not signal-reading.
```

**Rationale:** DMLCo is currently underweight in `article-digest.md` (only mentioned in `_profile.md` Item 9, which is one paragraph). Adding a dedicated section gives evaluation modes more material to draw on for fractional/advisory roles, founder-credibility framing, and entrepreneur-track positions. The "How to use" subsection includes the explicit anti-framing guardrail (no market-prescience claim) so future runs don't accidentally introduce it.

## 2.C `modes/_profile.md` — Add "Generic Positioning Principles" section

**Proposed placement:** Insert as a new section immediately before the existing "Cross-cutting Advantage" section (around line 74). Reasoning: it's a positioning frame that informs the cross-cutting advantage rather than the other way around.

**Proposed new section text:**

```markdown
## Generic Positioning Principles

For blind recruiter outreach, LinkedIn refresh, and broad introductions where no specific JD or archetype is in play. The generic positioning has two simultaneous goals: **(1)** make a recruiter want to learn more — "this person looks interesting" — and **(2)** make them able to read Daniel into a wide range of role shapes (CTO, CIO/Head of IT, transformation, head of digital, multi-domain VP/SVP) without squinting at first glance.

**Through-line: range × depth × duration.** Daniel's positioning asset is breadth × depth × duration, not vertical specialty. The credential is having actually run a technology org end-to-end at meaningful scale — apps, data, infrastructure, contact center, delivery, governance — and made the build/buy/hire/scale decisions across the whole stack. Lead with this silhouette.

**Anchor credibility: the DBA → CTO arc.** Daniel rose through hands-on technical roles (Front-End Technologist / DBA / SQL Architect → IT Manager → VP IT → first-ever CTO) over 14 years at MMI rather than being parachuted in. This is rare and load-bearing. Surface it in the summary and reinforce with the financial transaction core proof point (Anchor Item 11) when space allows.

**ML/AI framing for generic positioning:** AI is a capability in the toolkit, NOT the headline. Specific calls:
- The DataRobot ML work was a build-vs-buy decision pattern (~2.5 years using DataRobot vs. hiring a data science team), not a career-defining domain claim. It is a leadership-decision example, not a domain credential at the headline level.
- "AI-Ready Architecture," "Predictive Analytics Enablement," and similar trendy meta-categories are filler in generic positioning. Drop or de-emphasize.
- Current AI consulting work is real and worth mentioning, but should NOT define the silhouette in generic-positioning materials. Frame as current concentration, not identity.

**Honest leadership-posture claims:**
- The contact center transformation at MMI was **operations-led with massive IT involvement and partnership** — NOT IT-led. In generic positioning, frame as "partnered with operations leadership on the enterprise contact center transformation." Do NOT claim "led" without the partnership qualifier.
- The software development modernization at MMI was IT-driven with sophisticated stakeholder governance. "Led" is correct here.

**Anti-framings to avoid in generic positioning:**
- Buzzword stacks ("AI-ready data foundations," "agentic AI at enterprise scale," "modernization roadmaps").
- Cargo-cult expertise items ("Metadata Model Development," "AI-Ready Architecture," "Predictive Analytics Enablement") in Areas of Expertise grids.
- Single-product → multi-product platform-evolution framing — see Tier 1.A above; the actual arc was reactive point-solutions → abstracted pattern-based architecture.
- Hot-take openers, abstract-noun headers, aphoristic closes (per `feedback_voice_anti_ai_smell.md`).

**See also:** `cv-generic.md` is the canonical generic-positioning resume. Use it as the source-of-truth voice and structure for blind-outreach contexts.
```

**Rationale:** This section codifies the positioning logic worked out in this session. Without it, future generic-positioning work (additional resume passes, LinkedIn drafts, new-channel outreach) will relitigate the same questions. Pointing to `cv-generic.md` as canonical voice gives future sessions a reference document to anchor against.

---

# Tier 3 — System hygiene

## 3.A `MEMORY.md` + `feedback_voice_anti_ai_smell.md` — append voice calibrations

**Proposed appendix to `feedback_voice_anti_ai_smell.md`:**

```markdown
## Calibrations from cv-generic.md Pass 1 (2026-04-29) — provisional

These wordings landed in the initial generic-CV draft. Marked provisional; subsequent generic-CV sessions may refine.

- **"Sole" beats "primary" when accurate.** For Board engagement at MMI, "sole technology voice to the Board" is the correct framing — not "primary." Apply when the precise factual claim is sole rather than first-among-several.
- **"Every" carries credibility weight.** "Successfully led technology integration across every M&A transaction in this period" reads stronger than "across multiple" when the universal claim is true. Use when defensible.
- **Drop list-parentheticals in resume voice.** Phrases like "(ROI, user satisfaction, efficiency, cross-departmental equity)" tucked into bullets sound smart but don't earn the space — readers skip them, the standard items don't differentiate. Replace with the specific operating mechanism (e.g., "recalibrated between the dominant operations stakeholder and the broader organization") when the underlying point is worth making.
- **Avoid "transformation" as silhouette word in generic positioning.** It's a project type, not an identity. "Range × depth × duration" is more honest to Daniel's actual asset.
- **Be careful with "led" claims when the work was partnered.** The contact center transformation at MMI was ops-led with massive IT involvement; "Led" is overclaim, "Partnered with operations leadership" is honest.
```

**MEMORY.md update:** Add one line near existing `feedback_voice_anti_ai_smell.md` reference to indicate the file was extended with cv-generic-pass-1 calibrations. Or leave the existing one-line MEMORY.md entry as-is and let the dated heading in the file itself signal the additions.

## 3.B `CLAUDE.md` — Main Files table addition

**Proposed addition to the Main Files table (after the `cv.md`-related rows):**

| File | Function |
|------|----------|
| `cv-generic.md` | Generic-positioning resume for blind recruiter outreach and LinkedIn refresh; distinct from `cv.md` (role-targeted). See "Generic Positioning Principles" in `modes/_profile.md` for framing guardrails. |

**Rationale:** Without this, future sessions (and future contributors to the open-source upstream, if any of this gets shared back) won't know `cv-generic.md` exists or how it differs from `cv.md`.

## 3.C `cv.md` — optional Financial Transaction Core bullet

**Optional addition to `cv.md`** under MMI bullets — consider only if tailored CV runs need this proof point readily accessible:

```markdown
- Architected and hardened the platform's financial transaction core as Senior DBA in partnership with the lead Development DBA; the subsystem processed approximately $1M daily on behalf of thousands of consumers to hundreds of creditors and ran at four-nines uptime and accuracy through the decade-plus that followed.
```

**Rationale:** Tailored CV runs read `cv.md` as source of truth. If this proof point isn't in `cv.md`, tailored runs may underweight or miss the early-career hands-on credential when it's relevant. **Caveat for consolidation:** verify whether `cv.md` should mirror generic-CV bullet additions, or whether the source-of-truth role is intentionally narrower. Also check Item 11 in the proposed `_profile.md` Proof-Point Anchors update — there may be redundancy between the new anchor and a `cv.md` bullet that needs to be resolved with intent.

## 3.D `patches/PLAYBOOK.md` (or sibling calibration log)

Add a one-paragraph entry recording this calibration so future upstream merges don't accidentally restore the rejected framings:

> **2026-04-29 — Generic CV Pass 1 calibrations.** Removed the "single-product → multi-product platform" framing and the "(ROI × satisfaction × efficiency × equity)" parenthetical from `modes/_profile.md` PM Positioning. Added Generic Positioning Principles section to `modes/_profile.md`. Extended Proof-Point Anchors items 1 and 7; added new item 11 (Financial Transaction Core). Added two new sections to `article-digest.md` ("MMI — Enterprise Platform" and "DMLCo — Operating Profile"). See `patches/generic-cv-pass-1-notes.md` for full detail.

---

# Open / deferred

These items came up but were not resolved this session. Worth revisiting during consolidation or in subsequent generic-CV sessions.

1. **Whether the multi-factor PM model should remain documented as backstory in `_profile.md`** even after removing the parenthetical from positioning text. The four axes may have been a real artifact at MMI; the rejection is specifically about positioning voice, not factual existence. Decision deferred to user during consolidation.
2. **Whether to update `cv.md` to align with cv-generic.md framings.** Notably: 8-years-CTO-of-14-years-MMI clarity (vs. current cv.md framing of all 14 years as CTO); the financial transaction core bullet; the "DBA → CTO" progression as headline arc rather than buried bullet. Deferred until cv-generic.md stabilizes after fresh-eyes review.
3. **Whether the Adjunct Professor entry on `cv-generic.md` (and `cv.md`) earns its space** for blind recruiter outreach, or whether it's better held in reserve for interview / LinkedIn About sections only. Not addressed this session.
4. **PhD bullet (currently held as HTML comment in `cv-generic.md`) — keep or cut once page-fit is determined.**
5. **AWS handling.** Currently absent from `cv-generic.md` Tech Proficiencies after a prior edit. The "AWS hands-on experience: thin" guardrail in `_profile.md` (line 486) covers role-targeting, but generic positioning may want a one-line "AWS (advisory level)" mention for ATS surface. Deferred.
6. **Genesys / NICE listing in `cv-generic.md` Tech Proficiencies.** Listed in current cv-generic but the existing memory note (`user_mmi_cc_facts.md`) flagged these as "interview-only." Reconcile during consolidation.
7. **LinkedIn refresh as next deliverable.** The session ended before LinkedIn language was drafted. Open task.

---

# Source notes

This pass derived from a single drafting session of `cv-generic.md` on 2026-04-29. Primary inputs:
- The Feb 2026 generic resume PDF (`C:\Users\danie\Dropbox\DML\25Jobz\2602 DML Resume.pdf`).
- The current `cv.md`.
- The current `article-digest.md`.
- The current `modes/_profile.md`.
- User's iterative feedback during the session (rejected the multi-factor parenthetical, rejected single→multi-product framing, confirmed exec cabinet and Board specifics, confirmed financial transaction core scale and reliability, confirmed DMLCo operating mix and exit framing, confirmed M&A integration claim, confirmed pandemic stewardship company-wide).

For consolidation, future sessions should:
1. Read this document.
2. Read the (by-then-stabilized) `cv-generic.md`.
3. Surface any additional changes from intervening sessions.
4. Consolidate overlapping changes.
5. Apply Tier 1 first (corrects active inaccuracy), then Tier 2, then Tier 3.
6. Move this document to an `archive/` subdirectory or rename to indicate completion (e.g., `generic-cv-pass-1-notes-APPLIED.md`).
