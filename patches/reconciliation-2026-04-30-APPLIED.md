# DNA Reconciliation — 2026-04-30

**Purpose:** Single review doc consolidating (1) Pass 1 + Pass 2 notes that were never applied, (2) live conflicts surfaced by cross-reading every "DNA" file in this session, and (3) missing-from-everywhere facts that exist in `cv-generic.md` but haven't propagated.

**How to use:** Walk top to bottom. Each change has `Source:` showing whether it's deferred Pass 1/2 work, an inter-file conflict, or new this pass. Three statuses: `[ ] APPROVE` / `[ ] REJECT` / `[ ] OPEN-Q` (needs Daniel's call before action). Section E is the only block that requires input before any application.

**Files in scope:**
- `cv.md` — canonical role-targeted CV (source of truth for tailored runs)
- `cv-generic.md` — new generic-positioning CV (added on `main`)
- `config/profile.yml` — structured profile
- `modes/_profile.md` — narrative, archetypes, positioning rules
- `article-digest.md` — proof points
- Memory files (`~/.claude/.../memory/*.md`)

---

## Summary by section

| Section | What | Items | Risk if skipped |
|---|---|---|---|
| **A** | Live evaluation accuracy (active falsehoods/inconsistencies in files being read by every eval) | 6 | Every batch run carries the wrong framing |
| **B** | CV polish — voice + structural fixes to cv.md and cv-generic.md | 7 | CVs read inconsistently against memory rules |
| **C** | Proof-point depth — new substance added to `_profile.md` and `article-digest.md` | 5 | Evaluations under-surface real strengths |
| **D** | Memory / index hygiene | 4 | Stale memory contradicts files |
| **E** | Open questions (need your call) | 5 | Apply prematurely → re-litigate later |

Total: **22 changes** plus 5 open questions. Most are "apply Pass 1/2 deferred work" — surprisingly few brand-new findings.

---

## Section A — Live evaluation accuracy (active falsehoods/inconsistencies)

### A1. MMI counselor headcount: 300+ vs 400–500

**Source:** Conflict between memory + Pass 2 notes.

- `user_mmi_cc_facts.md` (line 13): *"300+ dedicated call-center staff — not 'hundreds of CSRs' loosely; 300+ is the floor"*
- `cv-generic.md` (Pass 2-applied): *"400-500 person counselor workforce"*
- Pass 2 confirmed in session: *"Counselor headcount averaged around 400-500 during most of my tenure, with about 2/3 of those in one of 5 (then 4, then 3, then 2) major call centers and the rest remote."*

**Action:** Update `user_mmi_cc_facts.md` to "400–500 counselor workforce, ~2/3 in major regional centers (5 → 4 → 3 → 2 over tenure), remainder remote." Drop the "~100 remote agents" line — it's either an early-tenure number or imprecise.

**Status:** [ ] APPROVE / [ ] REJECT

---

### A2. PM Positioning section in `modes/_profile.md` still has rejected framings (Pass 1 deferred)

**Source:** Pass 1 §1.A.1, §1.A.2, §1.A.3 — deferred and unapplied. Pass 2 §1.A reinforced.

Three substantive replacements in `modes/_profile.md` lines ~152–194:

**(a) Line ~161–162 — drop the four-axis parenthetical:**
- Before: *"Multi-factor prioritization model — ROI × user satisfaction × efficiency × cross-departmental equity; the equity mechanism prevented any single function from dominating or being ignored sprint-over-sprint"*
- After: *"Stakeholder-balanced prioritization model — recalibrated sprint-over-sprint between the dominant operations stakeholder and the broader organization to balance new feature demand against technical debt remediation; governance ran across 12+ executive and operations stakeholders."*

**(b) Line ~167 — drop "single → multi-product":**
- Before: *"Platform-product thinking: architected migration from single-product platform to variable multi-product financial platform with differentiated requirements, fees, and support per product"*
- After: *"Platform-architecture thinking: drove the homegrown enterprise platform's transformation from reactive, point-solution code to abstracted, pattern-based architecture; consolidated MMI's full counseling activity range (debt management plans, housing counseling, bankruptcy counseling, financial education) onto a single central system."*

**(c) Lines ~191–192 — replace Flagship Story #1:**
- Before: *"Expansion / platform-product story (LEAD): Architected roadmap to convert the platform from a single-product tool to a variable multi-product financial platform..."*
- After: *"Architectural-transformation story (LEAD): Drove the homegrown enterprise platform's transformation from reactive, point-solution code to abstracted, pattern-based architecture, consolidating MMI's full counseling activity range onto a single central system. Multi-year roadmap ownership, extensibility-by-design architecture, governance through stakeholder recalibration between dominant operations stakeholder and broader organization."*

**Why critical:** This file is read by every evaluation. The current text propagates a framing you explicitly rejected twice ("This line is nonsense").

**Status:** [ ] APPROVE / [ ] REJECT (recommend approve all three together)

---

### A3. cv.md still has the same rejected "single-product → multi-product" framing

**Source:** New finding this pass — Pass 1/2 only flagged `_profile.md`.

`cv.md` line 71 (DMLCo bullet — wrong, this is actually MMI bullet):

Looking at `cv.md` line 58: *"Owned product roadmap and strategic prioritization for MMI's homegrown enterprise platform (ERP/CRM) over eight years, directing a 45–50 person delivery organization across BA, QA, and software development; **architected the platform's evolution from a single-product tool to a variable multi-product financial platform**, and operated a multi-factor prioritization model (ROI × user satisfaction × efficiency × cross-departmental equity) governing sprint-over-sprint decisions across 12+ executive and operations stakeholders."*

**Both rejected framings live here too** — the single→multi-product *and* the four-axis parenthetical. Tailored CVs read `cv.md` as source of truth, so they propagate this.

**Action — replace the bolded clause with `cv-generic.md`'s Pass 2 polished version:**
*"...drove the platform's transformation to a unified pattern-based architecture, consolidating MMI's full counseling activity range onto a single core system, including entities acquired through periodic M&A; recalibrated priorities sprint-over-sprint between the dominant operations stakeholder and the broader organization, balancing new-feature demand against technical-debt remediation across 12+ executive and operations stakeholders."*

**Status:** [ ] APPROVE / [ ] REJECT

---

### A4. cv.md MMI role paragraph: framing implies 14 years as CTO

**Source:** New finding — `cv.md` ↔ `cv-generic.md` divergence.

`cv.md` MMI role intro (line 50) opens with *"Directed enterprise-wide technology strategy and execution across..."* — no mention of progression. Then bullet 1 (line 52) names the climb: *"Advanced through progressive leadership roles from Front-End Technologist (DBA / SQL Architect) to IT Manager, Vice President of IT, and appointment as the first Chief Technology Officer..."*

`cv-generic.md` opens the role with the climb explicitly: *"Progressed from DBA / SQL Architect through IT Manager and Vice President of IT before appointment as the organization's first Chief Technology Officer in its 45-year history; served in that role for 8 years."*

**Why this matters:** Pass 1 Open/Deferred #2 flagged this as needing alignment. Tailored CVs derive from `cv.md` and may inherit the implicit-14-years-CTO framing.

**Action — replace `cv.md`'s MMI role intro paragraph with the climb-then-context version (matching cv-generic.md).**

**Status:** [ ] APPROVE / [ ] REJECT

---

### A5. CCaaS scope wording in `modes/_profile.md` overclaims

**Source:** Pass 2 §1.C — deferred and unapplied.

`modes/_profile.md` line ~293 (Call-Center / Contact-Center Domain Credibility section):
- Before: *"Owned the contact-center platform end-to-end (selection, integration, daily ops, multi-channel routing) for a multi-site distributed operation (~6 locations + hundreds of remote agents)"*
- After: *"Anchored operations, uptime, and configuration of the contact-center platform stack (selection, integration, daily ops, multi-channel routing, agent desktop, supervisor dashboards) supporting a 400–500 person counselor workforce. Site topology evolved over tenure: from 5 major call centers down through 4, 3, and ultimately 2; approximately 2/3 of counselors in major sites with the remainder as independent remote counselors. Software architecture decisions had to accommodate both topologies (latency, distributed access, resilience)."*

You said in Pass 2: ownership was "operations and uptime and system config; partnered on functionality exploitation and feature modification." The "owned end-to-end" framing overclaims slightly.

**Status:** [ ] APPROVE / [ ] REJECT

---

### A6. Genesys / NICE listed in `cv-generic.md` Tech Proficiencies

**Source:** Conflict between memory guidance and `cv-generic.md`. Pass 2 Open/Deferred #6.

- `user_mmi_cc_facts.md`: *"Vendor names (Genesys, NICE) are interview-only. CV uses generic terms ('major enterprise CC platform,' 'led the 2024 transformation') and lets the conversation surface specifics."*
- `cv-generic.md` line 88 currently lists them: *"...Workforce management, Genesys, NICE"*
- Same in `cv.md` line 88.

**Action:** Strip Genesys/NICE from both `cv.md` and `cv-generic.md` Contact Center proficiencies row. Replace with generic terms (e.g., "enterprise CCaaS platforms"). The just-generated PDF already contains them — would need re-render after fix.

**Status:** [ ] APPROVE / [ ] REJECT

---

## Section B — CV polish (cv.md, cv-generic.md)

### B1. cv.md tagline "Solving the challenges where people and technology meet"

**Source:** Pass 2 §3.A — deferred. Plus you separately confirmed cutting it from cv-generic.md.

Both `cv.md` and `cv-generic.md` open with this tagline (line 2). Pass 2 explicitly cut it from cv-generic.md as "dead." It survives in `cv.md` as inertia.

**Action:** Cut tagline from both files. Replace with the Pass 2 title line *"Chief Technology Officer / Chief Information Officer"* on `cv-generic.md` (already on line 9). For `cv.md`, decide if it needs an analogous title line or just a clean header.

**Status:** [ ] APPROVE / [ ] REJECT

---

### B2. cv-generic.md Areas of Expertise grid still has filler

**Source:** Pass 2 Open/Deferred #3 — flagged but not implemented.

Currently lists 18 items. Flagged as redundant or filler:
- "Software Engineering & SDLC" + "Cloud Migration & Modernization" + "Legacy Platform Modernization" — three overlapping "modernization" entries
- (cv.md adds "Executive Stakeholder Engagement" + "Cross-Functional Team Leadership" — both filler)

Pass 2 suggested replacements: M&A Integration, Business Continuity / DR, Enterprise Risk Management, Build-vs-Buy / SaaS Procurement, IT Governance.

**Action:** Replace 2–4 redundant/filler entries with substantive ones. Specific list to be decided — see Section E #1.

**Status:** OPEN-Q (deferred to Section E #1)

---

### B3. cv.md Areas of Expertise has buzzword stack

**Source:** Pass 1 §2.C generic-positioning principles — applies retroactively to cv.md too.

`cv.md` lines 17–32 list:
- "AI-Ready Architecture"
- "Predictive Analytics Enablement"
- "Metadata Model Development"

Pass 1 calls these "cargo-cult expertise items" / "buzzword stacks." They survived because Pass 1's principle was framed as "for generic positioning" — but the same logic applies to `cv.md` since tailored runs read it.

**Action:** Replace these three (and possibly more) with substantive entries. Specific list deferred to Section E #2.

**Status:** OPEN-Q (deferred to Section E #2)

---

### B4. cv.md current consultant role paragraph too narrow

**Source:** New finding — conflict with `feedback_cover_letter_craft.md`.

`cv.md` line 40: *"Deliver specialized AI consulting focused on enterprise-grade generative and agentic AI solutions for call center and customer communications platforms."*

`feedback_cover_letter_craft.md`: *"Daniel's edit: 'I'm currently consulting on AI architecture for enterprise contact center clients' → 'I'm currently consulting on AI architecture, automation, and implementation.' ... Pinning to 'enterprise contact center clients' narrows the practice unnecessarily."*

`cv-generic.md` uses the broader framing: *"Advisory work on enterprise technology architecture and AI-platform decisions, with current concentration on AI architecture for customer communication platforms."*

**Action:** Replace `cv.md`'s narrow framing with the broader version (preserving the "current concentration" qualifier so the contact-center anchor isn't lost). Recommended exact text:
*"Advisory work on enterprise technology architecture and AI-platform decisions, with current concentration on AI architecture and implementation for customer communication platforms."*

**Status:** [ ] APPROVE / [ ] REJECT

---

### B5. Apply Pass 2 polished MMI bullets to `cv-generic.md`

**Source:** Pass 2 §3.A — flagged as the highest-priority Tier 3 task. **Most of this appears to already be in `cv-generic.md`** — Pass 2 polish landed in the file even though Pass 2 notes describe it as "drafts produced; application to file deferred."

Verified against the locked Pass 2 bullets: cv-generic.md MMI bullets match Pass 2 except for one omission and one addition:

- **Already-applied bullets:** Digital, CC, ERP/CRM, Talent (Item 4), Cloud, Data/BI, SDLC, ePMO ✓
- **Possible deviation:** cv-generic.md has a **separate "Ran the infrastructure function..."** bullet (line 53) AND a **"Moved the InfoSec audit function out of IT..."** bullet (line 58). Pass 2's locked bullets included infrastructure (Pass 2 line 217: *"Ran the infrastructure function as an operational discipline..."*) but the wording diverges. Pass 2 simpler version vs. current detailed version — this is fine, current is better.
- **Bullet not in Pass 2 lock:** cv-generic.md line 58 InfoSec audit bullet — this is good content not in Pass 2's nine bullets. Keep.

**Net:** No action needed in `cv-generic.md` — Pass 2 effectively applied. Mark as already-done.

**Status:** [x] ALREADY-APPLIED (verify)

---

### B6. Apply Pass 2 summary text to `cv-generic.md` capex framing

**Source:** Pass 2 Open/Deferred #1 — needed your selection. Compared current state.

`cv-generic.md` line 11 currently uses Option B-ish phrasing: *"$15M+ annual operating budget plus annual capex up to $12M+, 35+ direct (75+ extended) technology organization, member of the executive team with quarterly Board reporting and engagement."*

This matches Pass 2's Option B (you preferred this in chat earlier). Effectively-applied.

**However** the same phrasing has NOT propagated to:
- `cv.md` line 50 — still says *"annual operating budgets exceeding $15M. Managed IT budgeting, projections, variance analysis, and executive financial reporting within an overall organizational spend range of $30–50M annually."* ← mathematically ambiguous per Pass 2 §1.B
- `modes/_profile.md` Item 1 (line ~38) — still *"$15M+ IT operating budget within $30–50M total IT spend"* ← same ambiguity

**Action:** Apply Option B phrasing consistently to both. For `_profile.md` Item 1, slightly more precision is OK: *"$15M+ annual operating budget plus annual capex up to $12M+, peak in modernization years (range $1.2M–$12M+)."*

**Status:** [ ] APPROVE / [ ] REJECT

---

### B7. cv.md MMI role bullet 3 (digital transformation) lacks Pass 2 metrics

**Source:** New observation — cv.md ↔ cv-generic.md divergence.

`cv.md` line 54: *"Orchestrated digital transformation that delivered industry-leading digital experiences and drove record revenue and service levels. Increased SEO and digital acquisition performance by over 200%."*

`cv-generic.md` has more specifics: *"...SEO and digital acquisition grew over 200%, conversion through digital channels more than tripled, and digital interactions rose to surpass counselor interactions."*

Plus `cv.md` opens with "industry-leading digital experiences" which is buzzword-heavy per voice memory.

**Action:** Align `cv.md` bullet to use cv-generic.md's specifics; cut "industry-leading."

**Status:** [ ] APPROVE / [ ] REJECT

---

## Section C — Proof-point depth additions

### C1. `modes/_profile.md` Item 1 — extend with org/cabinet context

**Source:** Pass 1 §1.B Item 1 — deferred.

Append to current Item 1: *"Organization size: 400+ person national consumer financial services nonprofit operating across multiple sites with hundreds of remote agents. Member of MMI's senior executive team (4–7 person cabinet) across the CTO tenure; primary technology voice in enterprise strategy and key contributing voice in long-range strategic planning. Most major enterprise initiatives during the period were technology-led, requiring cross-cabinet consensus and integrated execution."*

(Note: peer-role names — COO, CFO, Counsel, CRO — are interview-only per Pass 1.)

**Status:** [ ] APPROVE / [ ] REJECT

---

### C2. `modes/_profile.md` Item 7 — Board exposure + capital ownership + M&A

**Source:** Pass 1 §1.B Item 7 — deferred.

- Before: *"Board-level exposure. 4–5 board engagements per year over the CTO tenure: presentations on major initiatives plus free-flowing updates."*
- After: *"Board-level exposure and capital ownership. Sole technology voice to the Board across 4–5 meetings annually over the CTO tenure: presentations on major initiatives plus free-flowing Q&A on technology matters. Owned annual technology capital planning end-to-end — stakeholder consensus, financial rationale and ROI models, multi-year roadmap, and Board advocacy through required annual approval. Successfully led technology integration across every M&A transaction during the tenure."*

**Status:** [ ] APPROVE / [ ] REJECT

---

### C3. `modes/_profile.md` Item 3 — extend with SOA-skip context

**Source:** Pass 2 §1.D — deferred.

- Before: *"Legacy modernization at continuous scale. .NET N-Tier → microservice(ish) architecture at MMI, delivered as a staged multi-year transformation while keeping critical data functions rock-solid — never an outage-driven rewrite."*
- After: *"Legacy modernization at continuous scale. .NET N-Tier → microservices at MMI, delivered as a staged multi-year transformation while keeping critical data functions rock-solid — never an outage-driven rewrite. The transition skipped a service-oriented architecture intermediate stage, deemed too expensive at the time over Daniel's objections; the eventual N-Tier-to-microservices jump was harder as a result. Decomposition was selective rather than wholesale: edge services were straightforward, but key load-bearing functions (especially around reporting consistency and not adding ops burden) were massively complex, so the transition went only as far as service-decomposition benefits justified against operational complexity."*

(SOA-skip detail is interview-only on the surface; lives in proof-points for evaluation runs that probe architecture-leadership judgment.)

**Status:** [ ] APPROVE / [ ] REJECT

---

### C4. `modes/_profile.md` Item 8 — NPS specificity + design-problems framing

**Source:** Pass 2 §1.E — deferred.

- Before: *"Highest retention and satisfaction at MMI. Sustained outcome across the 14-year tenure; symptom of the consensus / earned-veto / conflict-competent operating model."*
- After: *"Highest retention and NPS engagement scores at MMI. Across MMI's organization-wide annual NPS scoring (~5–7 years), the technology organization ranked first in the company on retention and engagement year over year. Outcome of the leadership-development practice (hands-on coaching of emerging leaders, active succession planning) and the structural-design approach to organizational properties: cross-team handoffs, information access, and team and individual behavior treated as design problems rather than soft skills. Dual touchstones underneath: collaboration (engineered handoffs and decision contracting) and transparency (institutional information access, including unusually open practices like department-wide salary visibility — surface as interview narrative only)."*

**Status:** [ ] APPROVE / [ ] REJECT

---

### C5. `article-digest.md` — add MMI Enterprise Platform + DMLCo Operating Profile sections

**Source:** Pass 1 §2.A and §2.B — deferred.

Two new sections appending to `article-digest.md`:

**(a) MMI — Enterprise Platform (Anonymized).** Captures the .NET N-tier → microservices arc, the financial transaction core hardening ($1M/day, 4 9s), the Sitecore digital integration, the Genesys → NICE durability claim, and the "reactive point-solution → abstracted pattern-based architecture" canonical framing. Full text in `patches/generic-cv-pass-1-notes.md` §2.A.

**(b) DMLCo — Operating Profile.** Captures peak headcount (12 incl. 8 technical), $4M+ revenue, 50-client portfolio, business mix evolution (back-office sale early 2000s — explicit anti-framing: NOT market prescience), CMS architecture, intentional wind-down. Full text in `patches/generic-cv-pass-1-notes.md` §2.B.

These give evaluation modes more material for fractional/advisory framing, founder-credibility, and architecture-leadership stories.

**Status:** [ ] APPROVE / [ ] REJECT

---

## Section D — Memory / index hygiene

### D1. Update `user_mmi_cc_facts.md` with corrected scale numbers

**Source:** A1 above (cascade).

Replace "300+ dedicated call-center staff" and "~100 individual remote agents" with: *"400–500 counselor workforce during most of the CTO tenure; approximately 2/3 in major regional centers (5 → 4 → 3 → 2 over time), remainder as independent remote counselors."*

Verify with you whether 300+ was an early-tenure figure (worth noting as historical) or just imprecise.

**Status:** [ ] APPROVE / [ ] REJECT

---

### D2. Append voice calibrations to `feedback_voice_anti_ai_smell.md`

**Source:** Pass 1 §3.A + Pass 2 §2.A — deferred.

Two calibration blocks (provisional flag) capturing patterns surfaced during cv-generic drafting:
- "Sole" beats "primary" when accurate
- "Every" beats "across multiple" when defensible
- Drop list-parentheticals tucked into bullets
- Avoid "transformation" as silhouette word
- Be careful with "led" claims when work was partnered
- "Treating X as design problems rather than soft skills" — keeper phrase
- "Going as far as X benefits justified against Y complexity" — keeper phrase
- "Single-cutover transition with no parallel-run option" — keeper phrase
- Two-sentence bullets default; verb variety at openings; CTO/CIO "/" framing
- Linguistic-momentum failure mode (the worker's "post-financial-crisis recovery" hallucination)
- "Load-bearing" overuse calibration

Full block text in `patches/generic-cv-pass-1-notes.md` §3.A and `patches/generic-cv-pass-2-notes.md` §2.A.

**Status:** [ ] APPROVE / [ ] REJECT

---

### D3. Add `cv-generic.md` row to `CLAUDE.md` Main Files table

**Source:** Pass 1 §3.B — deferred.

Insert in Main Files table after `cv.md` row:
> | `cv-generic.md` | Generic-positioning resume for blind recruiter outreach and LinkedIn refresh; distinct from `cv.md` (role-targeted). See "Generic Positioning Principles" in `modes/_profile.md` for framing guardrails. |

Note: `CLAUDE.md` is system-layer (per `reference_local_toolset.md`: *"Never edit CLAUDE.md — it's system-layer, auto-updated, overwrites on release"*). So this addition lives in a custom CLAUDE.md fork OR as a `patches/` divergence note instead. **Recommend** adding to `patches/PLAYBOOK.md` as a local convention rather than risking auto-update overwrite.

**Status:** [ ] APPROVE / [ ] REJECT (with above modification)

---

### D4. Add Generic Positioning Principles section to `modes/_profile.md`

**Source:** Pass 1 §2.C — deferred.

New section before "Cross-cutting Advantage" capturing:
- Through-line: range × depth × duration (not vertical specialty)
- Anchor credibility: DBA → CTO arc
- ML/AI as capability, not headline (DataRobot is build-vs-buy decision, not domain claim)
- Honest leadership-posture: contact center was ops-led with massive IT involvement (NOT IT-led)
- Anti-framings: buzzword stacks, cargo-cult expertise, single-product → multi-product

Full text in `patches/generic-cv-pass-1-notes.md` §2.C.

**Status:** [ ] APPROVE / [ ] REJECT

---

## Section E — Open questions (need Daniel's call before any application)

### E1. cv-generic.md Areas of Expertise — which entries to swap?

The current 18 are listed in `cv-generic.md` lines 23–28. Pass 2 flagged these as candidates to drop:
- "Software Engineering & SDLC" (overlap with two adjacent items)
- "Cloud Migration & Modernization"
- "Legacy Platform Modernization"

Pass 2 also flagged "Cross-Functional Team Leadership" and "Executive Stakeholder Engagement" as filler (these are in cv.md, not cv-generic).

**Pass 2 replacement candidates:**
- M&A Integration ✓ (already there: "M&A Technology Integration")
- Business Continuity / DR ✓ (already there: "Business Continuity & DR")
- Enterprise Risk Management — NEW
- Build-vs-Buy / SaaS Procurement / Vendor Strategy — partial overlap with current "Vendor & Strategic Sourcing"
- IT Governance — could replace one of the modernization entries

**Question:** Drop the three overlapping modernization entries? If yes, replace with what?

---

### E2. cv.md Areas of Expertise — same question, different file

cv.md lines 17–32 list 15 items. Buzzword candidates flagged:
- "AI-Ready Architecture"
- "Predictive Analytics Enablement"
- "Metadata Model Development"
- "Executive Stakeholder Engagement"
- "Cross-Functional Team Leadership"

**Question:** Apply same de-buzzwording pass to cv.md? Replace with the substantive entries from cv-generic.md (or a different set tuned for tailored-CV use)?

---

### E3. Adjunct Professor entry — keep or cut?

In both cv.md and cv-generic.md:
> Rice University & University of Houston Clear Lake | 2008 – 2012
> - Delivered undergraduate and graduate-level courses centered on global perspectives in literature, culture, and religion.

Pass 1 Open/Deferred #3 flagged this as "earns its space?" question. Arguments:

- **Keep**: signals teaching/explanation skill; humanities-in-tech differentiator; small space cost; surfaced authentically in Great Minds cover letter as load-bearing.
- **Cut**: chronologically distant; not load-bearing for tech roles; Pass 2 didn't reaffirm; LinkedIn/About sections can carry it instead.

**Question:** Keep, cut, or move to LinkedIn-only?

---

### E4. AWS in cv-generic.md Tech Proficiencies — add advisory mention or stay silent?

`feedback_aws_thin.md`: thin experience; don't claim depth; flag honestly.

cv-generic.md (and cv.md) currently have Azure-only — no AWS mention.

Pass 2 Open/Deferred #5: *"generic positioning may want a one-line 'AWS (advisory level)' mention for ATS surface."*

**Question:** Add "AWS (advisory level)" to the Cloud row, or leave the absence (which is honest given Azure was the operational stack)?

---

### E5. "homegrown" vs "proprietary" platform — pick one globally?

Pass 2 Open/Deferred #7. cv-generic.md uses "proprietary" (your edit). `_profile.md` PM Positioning section uses "homegrown." `article-digest.md` (proposed new section) uses "homegrown." `cv.md` line 58 uses "homegrown."

**Question:** Standardize on "proprietary" everywhere (the Pass 2 voice) or keep "homegrown" in interview/proof-point material as more honest framing? Or vary by audience: "proprietary" for CVs (more polished), "homegrown" for proof-points (more honest)?

---

## Application order (recommended)

If the bulk approves:
1. **Section A** first — corrects active inaccuracies in evaluation runs
2. **Section E** — resolve open questions
3. **Section B** — propagate CV polish (tied to E1, E2, E4, E5 outcomes)
4. **Section C + D** — proof-point depth + memory hygiene

After application, archive `patches/generic-cv-pass-1-notes.md` and `patches/generic-cv-pass-2-notes.md` (rename `-APPLIED.md` per their own instructions). Update `patches/PLAYBOOK.md` calibration log with this consolidation entry.

---

## Did NOT find inconsistency

A handful of things I checked that turned out to be already-aligned, FYI:
- Phone format (`713.504.7452`) — consistent in all three sources
- Email (`daniel@dmlco.com`) — consistent
- LinkedIn URL — consistent
- Education entries (PhD Religious Studies / BA English) — consistent and matches OD-PhD memory rule
- DataRobot framing — consistent (production ML for credit and servicing; not "data science career")
- Defense contractor deal-breaker — consistent across profile.yml, _profile.md, memory
- Comp floor ($180K / $150K mission exception) — consistent across profile.yml and _profile.md
