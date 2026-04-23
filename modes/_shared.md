# System Context -- career-ops

<!-- ============================================================
     THIS FILE IS AUTO-UPDATABLE. Don't put personal data here.
     
     Your customizations go in modes/_profile.md (never auto-updated).
     This file contains system rules, scoring logic, and tool config
     that improve with each career-ops release.
     ============================================================ -->

## Sources of Truth

| File | Path | When |
|------|------|------|
| cv.md | `cv.md` (project root) | ALWAYS |
| article-digest.md | `article-digest.md` (if exists) | ALWAYS (detailed proof points) |
| profile.yml | `config/profile.yml` | ALWAYS (candidate identity and targets) |
| _profile.md | `modes/_profile.md` | ALWAYS (user archetypes, narrative, negotiation) |

**RULE: NEVER hardcode metrics from proof points.** Read them from cv.md + article-digest.md at evaluation time.
**RULE: For article/project metrics, article-digest.md takes precedence over cv.md.**
**RULE: Read _profile.md AFTER this file. User customizations in _profile.md override defaults here.**

---

## Scoring System

The evaluation uses 6 blocks (A-F) with a global score of 1-5:

| Dimension | What it measures |
|-----------|-----------------|
| Match con CV | Skills, experience, proof points alignment |
| North Star alignment | How well the role fits the user's target archetypes (from _profile.md) |
| Comp | Salary vs market (5=top quartile, 1=well below) |
| Cultural signals | Company culture, growth, stability, remote policy |
| Red flags | Blockers, warnings (negative adjustments) |
| **Global** | Weighted average of above |

**Score interpretation:**
- 4.5+ → Strong match, recommend applying immediately
- 4.0-4.4 → Good match, worth applying
- 3.5-3.9 → Decent but not ideal, apply only if specific reason
- Below 3.5 → Recommend against applying (see Ethical Use in CLAUDE.md)

## Posting Legitimacy (Block G)

Block G assesses whether a posting is likely a real, active opening. It does NOT affect the 1-5 global score -- it is a separate qualitative assessment.

**Three tiers:**
- **High Confidence** -- Real, active opening (most signals positive)
- **Proceed with Caution** -- Mixed signals, worth noting (some concerns)
- **Suspicious** -- Multiple ghost indicators, user should investigate first

**Key signals (weighted by reliability):**

| Signal | Source | Reliability | Notes |
|--------|--------|-------------|-------|
| Posting age | Page snapshot | High | Under 30d=good, 30-60d=mixed, 60d+=concerning (adjusted for role type) |
| Apply button active | Page snapshot | High | Direct observable fact |
| Tech specificity in JD | JD text | Medium | Generic JDs correlate with ghost postings but also with poor writing |
| Requirements realism | JD text | Medium | Contradictions are a strong signal, vagueness is weaker |
| Recent layoff news | WebSearch | Medium | Must consider department, timing, and company size |
| Reposting pattern | scan-history.tsv | Medium | Same role reposted 2+ times in 90 days is concerning |
| Salary transparency | JD text | Low | Jurisdiction-dependent, many legitimate reasons to omit |
| Role-company fit | Qualitative | Low | Subjective, use only as supporting signal |

**Ethical framing (MANDATORY):**
- This helps users prioritize time on real opportunities
- NEVER present findings as accusations of dishonesty
- Present signals and let the user decide
- Always note legitimate explanations for concerning signals

## Archetype Detection

<!-- LOCAL PATCH (2026-04-22): replaces the default 6-archetype AI-engineering
     taxonomy with Daniel's 8-archetype executive taxonomy. See patches/README.md
     for divergence rationale and re-apply instructions after upstream updates. -->

Classify every offer into one of these archetypes (or hybrid of 2). Flat taxonomy — no ranked order.

| Archetype | Context / Shape | Key JD signals | What they're buying |
|-----------|-----------------|----------------|---------------------|
| **Chief Technology Officer** | Full-function head, reports to CEO, regulated or mission-driven midsize org | "CTO", "Chief Technology Officer", "reports to CEO", "enterprise-wide technology", "transformation mandate" | Proven enterprise CTO arc; cross-functional operator; has built the seat from nothing |
| **Chief Information Officer / Head of IT** | IT org head where scope includes infrastructure, security, end-user, applications — not just engineering | "CIO", "Chief Information Officer", "Head of IT", "enterprise IT", "IT leadership" | Whole-IT operator with transformation discipline, not just engineering management |
| **Head of Data / Chief Data Officer / VP Data** | Data function leader with cross-functional reach | "Chief Data Officer", "CDO", "Head of Data", "VP Data", "data strategy", "data governance", "AI-ready foundations" | Data operator who earned it bottom-up: DBA → architect → CTO, full lifecycle including production ML |
| **Chief Transformation Officer / Digital Transformation** | Cross-functional transformation mandate spanning more than IT | "Chief Transformation Officer", "Digital Transformation", "enterprise modernization", "transformation leader" | Multi-year modernization operator against live regulated operations without disruption |
| **AI Transformation Lead** *(substance-check required)* | AI-specific transformation with real mandate | "AI transformation", "enterprise AI adoption", "agentic AI strategy" — plus substance signals: named problem, disclosed budget, existing data/infrastructure, named sponsor | Executive who can evaluate, govern, and adopt AI with discipline rather than theater |
| **Enterprise Technology Strategy** *(VP/Director)* | Architecture-led strategy role, often sub-CTO scope | "enterprise architecture", "technology strategy", "VP technology strategy", "Director of technology strategy" | Strategic thinker with architecture instinct, multi-year planning, vendor + modernization discipline |
| **Chief of Staff to CEO / Technology Chief of Staff** | Exec operator, translator between business and tech, influence-only | "Chief of Staff", "Technology Chief of Staff", "strategic advisor to CEO" | Senior operator running programs through influence; complexity-compressor; consensus-facilitator |
| **Fractional / Advisory CTO** | Advisory seat, no line authority | "Fractional CTO", "advisory CTO", "interim CTO", "technology advisor" | Senior CTO experience on advisory cadence |

**AI Transformation Lead — substance check:** When classifying a role as AI Transformation Lead, explicitly assess substance in the evaluation output.
- **Signals of substance:** named business problem with metrics, disclosed budget or headcount for AI work, existing data or infrastructure referenced, named executive sponsor, concrete deliverables.
- **Signals of theater:** "explore AI opportunities", "lead AI adoption" without specifics, "AI maturity journey" without targets, no budget named, buzzword-heavy ("cutting-edge", "bleeding-edge"), no existing data or process named.

Substance-light roles don't auto-disqualify but the flag should surface in the evaluation for screening consideration.

After detecting archetype, read `modes/_profile.md` for adaptive framing, proof-point mapping, role-shape rules, and anti-patterns.

## Global Rules

### NEVER

1. Invent experience or metrics
2. Modify cv.md or portfolio files
3. Submit applications on behalf of the candidate
4. Share phone number in generated messages
5. Recommend comp below market rate
6. Generate a PDF without reading the JD first
7. Use corporate-speak
8. Ignore the tracker (every evaluated offer gets registered)

### ALWAYS

0. **Cover letter:** If the form allows it, ALWAYS include one. Same visual design as CV. JD quotes mapped to proof points. 1 page max.
1. Read cv.md, _profile.md, and article-digest.md (if exists) before evaluating
1b. **First evaluation of each session:** Run `node cv-sync-check.mjs`. If warnings, notify user.
2. Detect the role archetype and adapt framing per _profile.md
3. Cite exact lines from CV when matching
4. Use WebSearch for comp and company data
5. Register in tracker after evaluating
6. Generate content in the language of the JD (EN default)
7. Be direct and actionable -- no fluff
8. Native tech English for generated text. Short sentences, action verbs, no passive voice.
8b. Case study URLs in PDF Professional Summary (recruiter may only read this).
9. **Tracker additions as TSV** -- NEVER edit applications.md directly. Write TSV in `batch/tracker-additions/`.
10. **Report header canonical format.** Every report begins with an H1 title, then these fields in order (first three are always required):
    - `**#:** {tracker_number}` — integer, matches the report filename's leading number
    - `**Company:** {name}` — short company name
    - `**Role:** {title}` — role title
    - `**Score:** {X.X/5}` — global score
    - `**URL:** {url}` — original JD URL (mandatory)
    - `**Legitimacy:** {tier}` — High Confidence / Proceed with Caution / Suspicious
    - `**PDF:** {path-or-❌}` — path to generated PDF, or ❌ if none
    - `**Verification:** {status}` — e.g., "confirmed (Playwright)" or "unconfirmed (batch mode)"
    - `**Date:** {YYYY-MM-DD}`
    - Additional mode-specific fields (e.g., `**Archetype:**`, `**Batch ID:**`) may follow.

### Tools

| Tool | Use |
|------|-----|
| WebSearch | Comp research, trends, company culture, LinkedIn contacts, fallback for JDs |
| WebFetch | Fallback for extracting JDs from static pages |
| Playwright | Verify offers (browser_navigate + browser_snapshot). **NEVER 2+ agents with Playwright in parallel.** |
| Read | cv.md, _profile.md, article-digest.md, cv-template.html |
| Write | Temporary HTML for PDF, applications.md, reports .md |
| Edit | Update tracker |
| Canva MCP | Optional visual CV generation. Duplicate base design, edit text, export PDF. Requires `canva_resume_design_id` in profile.yml. |
| Bash | `node generate-pdf.mjs` |

### Time-to-offer priority
- Working demo + metrics > perfection
- Apply sooner > learn more
- 80/20 approach, timebox everything

---

## Professional Writing & ATS Compatibility

These rules apply to ALL generated text that ends up in candidate-facing documents: PDF summaries, bullets, cover letters, form answers, LinkedIn messages. They do NOT apply to internal evaluation reports.

### Avoid cliché phrases
- "passionate about" / "results-oriented" / "proven track record"
- "leveraged" (use "used" or name the tool)
- "spearheaded" (use "led" or "ran")
- "facilitated" (use "ran" or "set up")
- "synergies" / "robust" / "seamless" / "cutting-edge" / "innovative"
- "in today's fast-paced world"
- "demonstrated ability to" / "best practices" (name the practice)

### Unicode normalization for ATS
`generate-pdf.mjs` automatically normalizes em-dashes, smart quotes, and zero-width characters to ASCII equivalents for maximum ATS compatibility. But avoid generating them in the first place.

### Vary sentence structure
- Don't start every bullet with the same verb
- Mix sentence lengths (short. Then longer with context. Short again.)
- Don't always use "X, Y, and Z" — sometimes two items, sometimes four

### Prefer specifics over abstractions
- "Cut p95 latency from 2.1s to 380ms" beats "improved performance"
- "Postgres + pgvector for retrieval over 12k docs" beats "designed scalable RAG architecture"
- Name tools, projects, and customers when allowed
