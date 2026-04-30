# Generic CV — Pass 2 Change Notes

**Date:** 2026-04-29
**Source session:** Fresh-eyes critical review and bullet-by-bullet rewrite of `cv-generic.md` (summary, role paragraph, MMI bullets) for blind recruiter outreach + LinkedIn refresh
**Status:** PENDING consolidation. Pass 1 notes (`patches/generic-cv-pass-1-notes.md`, dated 2026-04-29) remain unapplied; Pass 2 reinforces several Pass 1 Tier 1 items and adds new ones. **Consolidation pass should treat Pass 1 + Pass 2 together.**

---

## Purpose

This document captures changes from the second pass on `cv-generic.md`. The session produced canonical bullet text, summary text, and role paragraph text through bullet-by-bullet iteration with the user. **Critically, `cv-generic.md` itself was not updated during this session** — all iteration was paste-back text. Application of Pass 2 outputs to the actual file is itself a Tier 3 hygiene task for the consolidation pass.

The changes fall into three tiers:
- **Tier 1** — New corrections to framings currently live in `modes/_profile.md`, plus reinforcement of Pass 1 Tier 1 items that remain unapplied.
- **Tier 2** — New knowledge surfaced this session: voice calibrations, structural framings, and the canonical Pass 2 bullet/summary/role-paragraph text itself.
- **Tier 3** — System hygiene including applying Pass 2 outputs to `cv-generic.md`, voice calibration appendix, calibration log.

---

## Files affected (preview)

| File | Tier | Nature of change |
|------|------|------------------|
| `modes/_profile.md` | 1 | Update capex framing in Proof-Point Anchors Item 1 |
| `modes/_profile.md` | 1 | Refine CC scope in Proof Point #6 + CC domain credibility section |
| `modes/_profile.md` | 1 | Extend Proof Point #3 (architecture progression) |
| `modes/_profile.md` | 1 | Refine Proof Point #8 (NPS specificity) |
| `MEMORY.md` → `user_mmi_cc_facts.md` | 1 | Reconcile counselor headcount (300+ vs. 400–500) |
| `modes/_profile.md` | 1 | (REINFORCED FROM PASS 1) PM Positioning rewrite still pending |
| `cv-generic.md` | 3 | Apply Pass 2 polished summary, role paragraph, MMI bullets |
| `feedback_voice_anti_ai_smell.md` | 3 | Append Pass 2 voice calibrations |
| `patches/PLAYBOOK.md` | 3 | Add Pass 2 calibration log entry |

---

# Tier 1 — Live evaluation accuracy

These corrections should be applied first when consolidation runs. They affect every evaluation, batch run, and tailored CV until applied.

## 1.A Pass 1 Tier 1 items remain unapplied (REINFORCED)

Before introducing new Tier 1 items, note that **the following Pass 1 Tier 1 items remain unapplied as of this session, and Pass 2 confirms each of them:**

- **PM Positioning four-axis parenthetical** (`patches/generic-cv-pass-1-notes.md` Issue 1.A.1). Daniel re-encountered this in Pass 2 and explicitly confirmed: *"It's just seems to keep getting flagged each time. I'm trying to evaluate if it holds any recruiter / ATS weight. I don't _think_ it does."* Confirmed for removal from positioning text. Whether it remains documented as backstory is still deferred (see Open/Deferred #1).
- **Single-product → multi-product framing** (`patches/generic-cv-pass-1-notes.md` Issue 1.A.2 and 1.A.3). Daniel re-encountered this in Pass 2 reading from `_profile.md` and called it directly: *"This line is nonsense."* The architectural-transformation framing from Pass 1 ("reactive, point-solution code → abstracted, pattern-based architecture") is the right substitute. Pass 2 refined it slightly: in CV-bullet voice, "per-activity custom builds → unified pattern-based architecture" is the concrete-grounding version that avoids the cliché-stack risk of "abstracted, pattern-based" while preserving the substance.

**No new action needed** — Pass 1 already specified the correct replacement text. Apply during consolidation.

## 1.B `modes/_profile.md` Proof-Point Anchors — Item 1 (Scale at MMI), capex addition

### Current text (lines ~38):

> 1. **Scale at MMI.** Fourteen years at MMI, with eight of those as the first CTO in the organization's 45+ year history. 35+ direct / 75+ extended staff. $15M+ IT operating budget within $30–50M total IT spend. Reporting trajectory: CTO → CEO (~8 years); VP IT → CFO (~2–3 years); prior seats within IT leadership.

### Proposed replacement:

> 1. **Scale at MMI.** Fourteen years at MMI, with eight of those as the first CTO in the organization's 45+ year history. 35+ direct / 75+ extended staff. $15M+ annual operating budget plus annual capex ranging $1.2M–$12M+ (peak in modernization years). Reporting trajectory: CTO → CEO (~8 years); VP IT → CFO (~2–3 years); prior seats within IT leadership.

### Rationale:

The current "$15M+ IT operating budget within $30–50M total IT spend" is mathematically ambiguous (operating can't be both $15M+ AND $30–50M; the "$30–50M" was apparently total-spend including non-IT financial reporting that Daniel had visibility into, but the phrasing reads as a contradiction). User confirmed this session that capex was variable by year:

- Smallest year: ~$1.2M
- Largest year: $12M+
- $5M was representational, not minimum

The replacement is honest about the variability and surfaces both the steady-state operating commitment and the peak capital decision-making scale. **Note for consolidation:** the summary line in `cv-generic.md` may end up using a tighter form ("plus annual capex up to $12M+ in modernization years") — this is the proof-point-anchor version which can carry more precision.

## 1.C `modes/_profile.md` Contact Center scope — multiple sections

### Section: Proof Point #6 (Infrastructure leadership) — incidental
No direct change needed.

### Section: "Call-Center / Contact-Center Domain Credibility" (lines ~289–301)

**Current text (line 293):**
> - **Owned the contact-center platform** end-to-end (selection, integration, daily ops, multi-channel routing) for a multi-site distributed operation (~6 locations + hundreds of remote agents)

**Proposed replacement:**
> - **Owned operations, uptime, and configuration of the contact-center platform stack** (selection, integration, daily ops, multi-channel routing, agent desktop, supervisor dashboards) supporting a 400–500 person counselor workforce. Site topology evolved over tenure: from 5 major call centers down through 4, 3, and ultimately 2; approximately 2/3 of counselors in major sites with the remainder as independent remote counselors. Software architecture decisions had to accommodate both topologies (latency, distributed access, resilience).

**Rationale:** User confirmed this session:
- "Counselor headcount averaged around 400-500 during most of my tenure"
- "About 2/3 of those in one of 5 (then 4, then 3, then 2) major call centers and the rest remote"
- "All required support from IT, and all sw architecture choices had to take into account both setups (latency concerns spring to mind)"

The current "~6 locations + hundreds of remote agents" both undersells (6 vs. 5→4→3→2 progression — the consolidation arc itself is a CIO-scope signal) and overcounts remote-agent population (the older `user_mmi_cc_facts.md` says ~100, profile.md says "hundreds" — both potentially superseded by 400–500 total / 2/3 in centers / rest remote). User explicitly said don't dwell on the 5→4→3→2 progression in the CV, but the **proof-point file is exactly where that detail belongs** for evaluation runs that need to surface CC-domain credibility.

User clarification on ownership boundary, also from this session: ownership was "operations and uptime and system config; partnered on functionality exploitation and feature modification." The "owned end-to-end" framing in current `_profile.md` overclaims slightly. The replacement is more honest while preserving the strong scope signal.

### Section: `MEMORY.md` reference to `user_mmi_cc_facts.md`

The `MEMORY.md` index entry: *"[MMI CC operation facts](user_mmi_cc_facts.md) — Scale (300+ staff, multi-site, ~100 remote agents)"*

**Action required during consolidation:** Reconcile `user_mmi_cc_facts.md` with the 400–500 counselor / 2/3-in-centers / remote-the-rest framing from this session. The "300+ staff" and "~100 remote agents" figures are likely outdated or scoped differently. User's exact words this session: *"Counselor headcount averaged around 400-500 during most of my tenure, with about 2/3 of those in one of 5 (then 4, then 3, then 2) major call centers and the rest remote."* Verify with user during consolidation whether 300+ was a different time period (early CTO tenure?) or simply imprecise.

## 1.D `modes/_profile.md` Proof Point #3 (Legacy modernization) — extend

### Current text (line ~40):

> 3. **Legacy modernization at continuous scale.** .NET N-Tier → microservice(ish) architecture at MMI, delivered as a staged multi-year transformation while keeping critical data functions rock-solid — never an outage-driven rewrite.

### Proposed replacement:

> 3. **Legacy modernization at continuous scale.** .NET N-Tier → microservices at MMI, delivered as a staged multi-year transformation while keeping critical data functions rock-solid — never an outage-driven rewrite. The transition skipped a service-oriented architecture intermediate stage, deemed too expensive at the time over Daniel's objections; the eventual N-Tier-to-microservices jump was harder as a result. Decomposition was selective rather than wholesale: edge services were straightforward, but key load-bearing functions (especially around reporting consistency and not adding ops burden) were massively complex, so the transition went only as far as service-decomposition benefits justified against operational complexity.

### Rationale:

User explicitly described this session:

> "Q1. MMI skipped service-oriented, over my objections. Deemed too expensive at the time, so we had to jump straight from n-tier to microservice. Q2. [the live tradeoff] Decomposing the borderline / edge services was easy. Decomposing the key, central (one could even say load bearing) functions was massively complex, especially since both reporting consistency had to be maintained and additional burdens on ops couldn't be created. Q3. The judgement calls were constant — it had more to do with how far down the services oriented / microservice transition we went."

This is rich substance that the current "microservice(ish) architecture... delivered as a staged multi-year transformation" undersells. Adding the SOA-skip detail and the selective-decomposition reasoning gives evaluation runs better material for any role probing architecture judgment, modernization leadership, or decomposition discipline. The "(ish)" hedge in the current line can be dropped — the more honest framing is "selective decomposition went only as far as benefits justified."

**Caveat:** the SOA-skip-over-objections story is currently held interview-only (Daniel didn't surface it on the CV bullet to avoid score-settling tone). It belongs in `_profile.md` proof points but the surface rule should be: include in cover letters or interview narratives only when the role explicitly probes architecture-leadership judgment or technical-strategy dissent. Tag accordingly.

## 1.E `modes/_profile.md` Proof Point #8 (Highest retention and satisfaction) — refine

### Current text (line ~45):

> 8. **Highest retention and satisfaction at MMI.** Sustained outcome across the 14-year tenure; symptom of the consensus / earned-veto / conflict-competent operating model.

### Proposed replacement:

> 8. **Highest retention and NPS engagement scores at MMI.** Across MMI's organization-wide annual NPS scoring (~5–7 years), the technology organization ranked first in the company on retention and engagement year over year. Outcome of the leadership-development practice (hands-on coaching of emerging leaders, active succession planning) and the structural-design approach to organizational properties: cross-team handoffs, information access, and team/individual behavior treated as design problems rather than soft skills. Dual touchstones underneath: collaboration (engineered handoffs and decision contracting) and transparency (institutional information access, including unusually open practices like department-wide salary visibility — surface as interview narrative only).

### Rationale:

User confirmed this session:
- The instrument was NPS, run organization-wide annually for 5+ years
- The outcome was sustained year-over-year #1 ranking, not a single peak
- The two touchstones underneath ("collaboration" and "transparency") have specific structural meaning to Daniel — collaboration as engineered cross-team handoffs and decision contracting, transparency as structural information-access architecture (including the radical practice of department-wide salary clarity)
- The "design problems rather than soft skills" framing is the canonical positioning for this work — distinguishes it from generic "fostered a culture of collaboration" boilerplate

The current proof point is too vague. The expanded version gives evaluation runs the specific instrument (NPS), the period (5+ years), the comparison context (organization-wide), and the practitioner framing (design problems, not soft skills). The salary-clarity detail is interview-only — included here so it's available as proof-point depth, but the surface rule is explicit.

---

# Tier 2 — Preserve session knowledge

## 2.A Voice and structural framings surfaced this session — append to `feedback_voice_anti_ai_smell.md`

The following calibrations emerged in this session and are worth preserving for future generic-positioning, cover-letter, and CV-tailoring work. **Mark as provisional** — single-session phrasing decisions; consolidation should verify still preferred.

```markdown
## Calibrations from cv-generic.md Pass 2 (2026-04-29) — provisional

### Voice patterns that worked

- **"Treating X as design problems rather than soft skills"** — the canonical phrasing for surfacing the substance behind "collaboration" and "transparency" without the buzzword tax. The form *"treating [structural property A], [structural property B], and [structural property C] as design problems rather than soft skills"* signals practitioner-judgment and engineering-mindset framing for organizational design work. Survives "what do you actually mean?" challenges because the answer is right there in the framing.
- **"Going as far as X benefits justified against Y complexity"** — the canonical phrasing for surfacing architecture/decomposition judgment. Used for the microservices selective-decomposition framing. Argues judgment over fashion at architecture altitude without claiming "the hardest thing a [domain] org can do" (which reads braggy).
- **"Single-cutover transition with no parallel-run option"** — for CCaaS migration framing. Lets technically-literate readers recognize risk-uniqueness without the resume needing to assert it.
- **"Software architecture calibrated for [topology X] and [topology Y]"** — for surfacing architectural-sophistication signal in scope claims. Does not require listing the architectural decisions themselves.
- **"Per-activity custom builds → unified pattern-based architecture"** — concrete-grounding replacement for the "abstracted, pattern-based architecture models" jargon-stack. The "from X to Y" frame grounds "pattern-based" in concrete reality.

### Voice patterns to avoid

- **"Fostered a culture of collaboration and transparency"** family. Even when the substance is real, this *sentence form* drains the words. The fix is structural: frame as engineered/designed properties, not cultural attributes.
- **"Grew exponentially"** as an intensifier. Mathematical reads as overclaim (anything bounded can't grow exponentially indefinitely); colloquial reads as vague. Same family as "industry-leading" / "leading-edge."
- **List-parentheticals tucked into bullets** (e.g., "(ROI × satisfaction × efficiency × equity)"). Recruiters skip them; the standard items don't differentiate. Use only when the *internals themselves* are distinctive (e.g., specific operating mechanisms not the standard four-factor frameworks).
- **"Across the function" or similar scope-restating phrases.** When the surrounding text already establishes scope, these phrases pad without adding.
- **"Multi-year" as a default adjective.** Two instances per document is the upper limit; three is too many. Reserve for places where the sustained-program signal is the load-bearing claim.

### Structural patterns

- **Two-sentence bullets are the default.** Sentence 1 establishes the work; sentence 2 anchors the outcome. Three-sentence bullets work when the third sentence carries a distinctive third element (e.g., the prioritization-model sentence in the ERP/CRM bullet). One-sentence bullets work for tight, list-heavy claims (e.g., the infrastructure-as-discipline bullet).
- **Verb variety at bullet openings matters.** Resume bullets where 4 of 9 open with "Led" and 3 of 9 with "Owned" read as verbal monotony even when content is varied. Aim for distinct opening verbs across consecutive bullets.
- **The CTO/CIO "/" framing** ("Chief Technology Officer / Chief Information Officer") in the title line is more ATS-aggressive than parenthetical hedges like "(CIO-scope)." Both ATS and human readers benefit.
- **"$XM annual operating budget plus annual capex up to $YM+ in modernization years"** is a cleaner way to surface CIO-scope financial authority than "annual operating budget within total IT spend" framings, especially when capex is genuinely variable year-over-year.
```

## 2.B `cv-generic.md` canonical Pass 2 content — preserve as a snapshot

The following text was iterated to canonical form during this session and should be applied to `cv-generic.md` during consolidation. Save here verbatim so consolidation can paste cleanly.

### Title line

```markdown
**Chief Technology Officer / Chief Information Officer.** Owned full enterprise IT at a 400-person, $40M nonprofit; 17 years prior P&L as founder; current advisory on enterprise architecture and AI.
```

### Summary block

```markdown
Owned the full enterprise IT stack as CTO at Money Management International ($40M+ national consumer financial services nonprofit): infrastructure, information security, software development, business intelligence, contact center operations, helpdesk and end-user support, ePMO, and program delivery. CIO-scope responsibilities at SMB/midsize scale — $15M+ annual operating budget [+ CAPEX FRAMING — see Open/Deferred #1], 35+ direct (75+ extended) technology organization, member of the executive team with quarterly Board reporting and engagement.

Preceded by 17 years founding and operating an independent web/IT consultancy (12 employees, $4M+ peak annual revenue) with full P&L ownership: financial management, HR, talent development, sales, and client delivery across a 50-client portfolio.

Currently consulting on enterprise technology architecture and platform decisions, with concentration on AI architecture and implementation across customer communication platforms.
```

### MMI role paragraph

```markdown
Progressed from DBA / SQL Architect through IT Manager and Vice President of IT before appointment as the organization's first Chief Technology Officer in its 45-year history; served in that role for 8 years. Led the technology function through multi-year modernization and several full enterprise migrations, under continuous PCI-DSS, HIPAA, and CARD Act oversight.
```

(Note: user pushed back during the session on "Led the technology function" vs. "Led the organization" — accepting the more conservative phrasing while registering the disagreement. Daniel's exact words: *"I would push back that I was a true leader in the organization, visible and with impact far beyond IT."* The CV uses the function framing; cover letters and interview narratives can use organization framing where defensible.)

### MMI bullets (final polished, all 9)

```markdown
- Led the digital transformation across web and mobile properties: full web rebuild, multi-platform mobile applications, and real-time integration between the digital channel and the enterprise platform. Across the period, SEO and digital acquisition grew over 200%, conversion through digital channels more than tripled, and digital interactions surpassed counselor interactions by the end of the five-year period.

- Anchored operations, uptime, and configuration of the enterprise contact-center platform stack supporting a 400–500 person counselor workforce across major sites and remote agents, with software architecture calibrated for both topologies. Led the IT side of a CCaaS platform migration — a single-cutover transition with no parallel-run option — through day-one go-live with zero service disruption.

- Owned the multi-year roadmap and architectural direction for MMI's proprietary enterprise platform (ERP/CRM) over 8 years, leading a 45–50 person delivery organization (15 direct + ~30 offshore across BA, QA, and software development). Drove the platform's transformation to a unified pattern-based architecture, consolidating MMI's full counseling activity range onto a single core system, including entities acquired through periodic M&A. Operated a multi-factor prioritization model governing sprint-over-sprint decisions across a dozen executive and operations stakeholders.

- Built the technology leadership bench through hands-on coaching of emerging leaders and active succession planning. Across the function, by treating cross-team handoffs, information access, and team and individual behavior as design problems rather than soft skills, created a technology organization ranked first in the company on retention and annual NPS engagement scores year over year for five-plus years.

- Migrated all enterprise workloads to cloud across a multi-year program, while sustaining 100% audited PCI-DSS certification, full HIPAA and CARD Act compliance, and continuous audit posture across all 50 states and multiple federal bodies including the CFPB. The cloud foundation supported a distributed national workforce through pandemic-era demand volatility with zero related layoffs.

- Transformed the data and BI function from ad hoc reporting on disparate sources of truth to a modern data platform: enterprise data warehouse, cross-functional data governance with shared definitions and metric calculations, and end-to-end data consistency from digital channels through operational systems. Deployed production ML via DataRobot for credit and servicing use cases.

- Modernized SDLC through full Agile transformation (initially SAFe 10-week cycles, later 2-week sprints), doubling software development throughput and reducing concept-to-deployment timelines up to 20% year over year. Drove the platform's selective decomposition from .NET/N-Tier toward microservices, going as far as service-decomposition benefits justified against operational complexity.

- Ran the infrastructure function as an operational discipline: multi-generation end-user computing transitions, network security and InfoSec scanning/response operations, server and endpoint patching, and physical datacenter consolidation.

- Stood up MMI's Enterprise Project Management Organization (ePMO) from scratch — scope, governance, methodology, and measurement — consolidating non-IT projects under the IT-led framework. The ePMO drove a 25% improvement in project budget and time adherence.
```

## 2.C Linguistic-momentum failure mode — preserve as worker-self-discipline note

A failure mode emerged in this session that's worth documenting for future bullet-drafting work. Worth folding into `feedback_voice_anti_ai_smell.md` or a worker-discipline section of `modes/_shared.md`:

**Failure mode:** When drafting bullets while reading prior CV drafts (cv.md, prior cv-generic.md versions) for inspiration on framing/structure, the worker generates phrasing that drifts from source facts and gets reinforced through repetition. Example from this session: introduced "post-financial-crisis recovery" with no source basis, then repeated it across two subsequent draft variants until user caught it.

**Discipline rule:** When drafting bullets, distinguish between *reading source files for facts* (numbers, dates, named programs, technologies) vs. *reading source files for framing* (sentence structure, narrative shape, vocabulary). The first is necessary; the second is what causes drift. Especially: do **not** read prior CV drafts for inspiration on phrasing — those are exactly the documents being rewritten and contain the cliché-stack the rewrite is trying to escape.

**Self-check rule:** When proposing phrasing that uses words like "post-crisis," "regulatory expansion," "transformation imperative," "industry-leading," "leading-edge," or any phrase that could plausibly be in a generic executive-resume LinkedIn post — ask: *what's the specific source of this claim?* If the answer is "I generated it because it sounds plausible for someone of this profile," cut it.

User's exact words: *"We're hitting that weird linguistic momentum thing where you're losing touch with the bigger picture and its beginning to influence language in weird ways. I don't know where post-crisis recovery came from, and suddenly it's, as you like to say, load bearing."*

Also worth noting: user observed I overused "load-bearing" as a verbal tic. Calibration: reserve for structurally-supporting claims, not as a generic intensifier.

---

# Tier 3 — System hygiene

## 3.A `cv-generic.md` — apply Pass 2 polished content

This is the highest-priority Tier 3 task. The session produced canonical text but `cv-generic.md` itself was never updated. Application steps for consolidation:

1. **Title line** — replace existing tagline with the new "Chief Technology Officer / Chief Information Officer..." title line. Cuts the dead "Solving the challenges where people and technology meet" tagline.
2. **Summary block** — replace existing summary paragraphs with the three-paragraph version above (CTO scope + 17-year founder chapter + current advisory). Resolve capex framing per Open/Deferred #1.
3. **MMI role paragraph** — replace existing role paragraph with the new climb-then-context version.
4. **MMI bullets** — replace with all 9 polished bullets in the locked order: Digital → CC → ERP/CRM → Talent → Cloud → Data/BI → SDLC → Infrastructure → ePMO.
5. **Verify polish-pass changes are intact:**
   - "Anchored" replaces "Owned" on bullet 2
   - "Migrated" replaces "Led the multi-year cloud migration" on bullet 5
   - "Transformed" replaces "Owned... leading its transformation" on bullet 6
   - "Ran" replaces "Led" on bullet 8
   - M&A parenthetical added to bullet 3 ("including entities acquired through periodic M&A")
   - "team and individual behavior" (singular) on bullet 4, not "individual and team behaviors"
   - Bullet 1 dropped "multi-year" prefix (kept in bullets 3 and 5 only)

## 3.B `feedback_voice_anti_ai_smell.md` — append Pass 2 calibrations

Apply the calibration block from Tier 2.A above. Mark as provisional.

## 3.C `patches/PLAYBOOK.md` (or sibling calibration log) — Pass 2 entry

Add a paragraph entry:

> **2026-04-29 — Generic CV Pass 2 calibrations.** Bullet-by-bullet rewrite of MMI bullets in `cv-generic.md` (drafts produced; application to file deferred to consolidation). New voice patterns surfaced: "treating X as design problems rather than soft skills" (collaboration/transparency substance without buzzword tax), "going as far as X benefits justified against Y complexity" (architecture judgment), "single-cutover transition with no parallel-run option" (CCaaS migration risk-uniqueness). New facts confirmed for `_profile.md` updates: capex variability ($1.2M–$12M+), CC scope (400–500 counselors, 5→4→3→2 site progression), architecture progression (skipped SOA over objections; selective decomposition), NPS specificity (annual organization-wide, 5+ years, ranked first year over year). Linguistic-momentum failure mode documented. Pass 1 Tier 1 items remain unapplied; Pass 2 reinforces them. See `patches/generic-cv-pass-2-notes.md` for detail.

## 3.D Profile.md "Application Answer Language" section — consider extending

The "Application Answer Language" section of `_profile.md` (around lines ~440–460) catalogs Daniel's own voice-anchoring phrases. The new design-problems-not-soft-skills framing (Tier 2.A) earned its place this session and is the kind of phrase that recurs across cover-letter and application-answer work. **Consider** adding to that section during consolidation:

```markdown
**Leadership-shape framing for organizational properties:**
> "I treated cross-team handoffs, information access, and team and individual behavior as design problems rather than soft skills."
*(For application questions or cover letters that probe leadership style for technology organizations, especially when the role mentions culture, retention, or team-building. Earned its place in the cv-generic.md Pass 2 talent bullet.)*
```

Marked as a verbatim-anchor with surface rules so future sessions don't reinvent.

---

# Open / deferred

1. **Capex framing in summary line — pending Daniel's selection.** Three options proposed during this session:
   - **A:** "$15M+ annual operating budget plus annual capex of $1M–$12M+" (range)
   - **B:** "$15M+ annual operating budget plus annual capex up to $12M+ in modernization years" (peak emphasis with cycle context)
   - **C:** "$15M+ annual operating budget plus annual capex up to $12M+" (peak only, tightest)

   Worker recommendation was Option B; Daniel did not formally select before requesting this notes file. Resolve in next working pass on `cv-generic.md`. Affects: summary line in `cv-generic.md`, Proof Point #1 in `_profile.md` (Tier 1.B). The `_profile.md` proof-point version can carry slightly more precision (e.g., "annual capex ranging $1.2M–$12M+ (peak in modernization years)") even if the summary line takes a tighter form.

2. **Pass 1 Open/Deferred items still open** (carry forward from `patches/generic-cv-pass-1-notes.md`):
   - Whether the multi-factor PM model remains documented as backstory in `_profile.md` after positioning-text removal.
   - Whether to update `cv.md` to align with `cv-generic.md` framings.
   - Adjunct Professor entry — keep or cut.
   - PhD bullet (currently HTML-commented in `cv-generic.md`) — keep or cut once page-fit determined.
   - AWS handling in `cv-generic.md` Tech Proficiencies.
   - Genesys / NICE listing in `cv-generic.md` Tech Proficiencies (existing memory note flags these as interview-only).
   - LinkedIn refresh as deliverable.

3. **Areas of Expertise grid (cv-generic.md) — flagged for revision but not addressed this session.** The pre-Pass-2 review identified three "Modernization" entries as redundant ("Software Development & SDLC Modernization," "Cloud Platform Modernization," "Legacy Systems Modernization") and two filler entries ("Cross-Functional Team Leadership," "Executive Stakeholder Engagement"). Replacement candidates suggested: M&A Integration, Business Continuity / DR, Enterprise Risk Management, Build-vs-Buy / SaaS Procurement, IT Governance. Not implemented this session. Carry forward.

4. **Technical Proficiencies grid (cv-generic.md) — flagged for trim.** Items flagged as dated/filler: ColdFusion, SQLite, "C-family languages," HTML, CSS, DataRobot-as-sole-data-row anchor. Not addressed this session. Carry forward; verify with Daniel which to keep.

5. **Recovery story (Pass 1 Issue 1.A.4 — Senior DBA / financial transaction core).** Pass 1 proposed promoting the recovery story with $1M/day, four-nines detail. Pass 2 *cut* this content from the bullet block (Daniel's call: "leading with what I did as a DBA is bizarre for a CTO focused resume"). The $1M/day / four-nines detail still belongs in `_profile.md` proof points for interview / cover-letter material — but it should NOT appear in `cv-generic.md` per Pass 2 decision. **Consolidation note:** verify Pass 1's "Recovery story" enhancement still applies to `_profile.md` proof points (yes, it does — it's interview/proof-point material) but does NOT propagate to `cv-generic.md`. The two passes are aligned on this; just flagging to prevent confusion.

6. **`user_mmi_cc_facts.md` reconciliation.** Memory file says "300+ staff, ~100 remote agents" but Pass 2 confirmed 400–500 counselors with hundreds remote (depending on year). Verify with user during consolidation whether 300+ figure was an earlier-tenure scope or imprecise. Update memory file accordingly.

7. **The "homegrown" framing question.** Pass 2 resolved this by using "proprietary enterprise platform (ERP/CRM)" instead of "homegrown enterprise platform (ERP/CRM)" — Daniel's edit. Verify whether `_profile.md` Platform Architecture descriptions should switch from "homegrown" to "proprietary" globally, or whether the build-vs-buy nuance varies by context. Tag as voice-calibration to verify.

---

# Source notes

This pass derived from a single drafting session on 2026-04-29 — a fresh-eyes critical review of `cv-generic.md` followed by bullet-by-bullet rewriting. Primary inputs:
- The current `cv-generic.md` (read at session start; not modified during session).
- The current `cv.md` (read for source-of-truth facts, not framing).
- `modes/_profile.md` end-to-end (read mid-session for fact-anchoring).
- `MEMORY.md` and the `feedback_*.md` index (referenced for guardrails).
- `patches/generic-cv-pass-1-notes.md` (read for context on prior pending changes).
- User's iterative feedback during the session, with substantial pushback on multiple points (capex framing, M&A weighting, DBA-bullet placement, PM-positioning framing, voice clichés, "led the organization" semantic distinction, NPS specificity, contact-center scope, architecture progression).

For consolidation, future sessions should:
1. Read this document AND `patches/generic-cv-pass-1-notes.md` together — they are paired and Pass 2 reinforces several Pass 1 items.
2. Read the (by-then-applied) `cv-generic.md` to verify Pass 2's canonical content actually landed in the file.
3. Surface any additional changes from intervening sessions.
4. Apply Tier 1 first (corrects active inaccuracy in `_profile.md`), then Tier 2 (preserves voice/framing knowledge), then Tier 3 (file hygiene).
5. Resolve Open/Deferred #1 (capex framing) with Daniel before applying summary-line changes to `cv-generic.md`.
6. Move both Pass 1 and Pass 2 notes files to an `archive/` subdirectory or rename to `-APPLIED.md` once consolidation completes.
