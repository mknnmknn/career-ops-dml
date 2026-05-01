# career-ops-dml — Local Operations Playbook

This document is the authoritative reference for **local divergences, custom tools, and weekly workflow** in Daniel's fork of career-ops. Future Claude sessions should read this file when asked about "what tools do we have", "what to run each week", or "how does the scanner work here specifically".

Related files:
- `patches/README.md` — record of modifications to upstream system-layer files (archetype taxonomy, report header, Go UI, scan-api-portals Workday adapter)
- `modes/_profile.md` — user-layer personalization (archetypes, proof-points, operating model, anti-patterns)
- `modes/scan_en.md` — English translation of `modes/scan.md` with practice-vs-spec annotations
- `DATA_CONTRACT.md` — which files are system-layer vs. user-layer (maintained upstream)
- `cv.md` — canonical role-targeted CV (source of truth for tailored runs)
- `dml-cv-generic.md` — generic-positioning resume for blind recruiter outreach and LinkedIn refresh; distinct from `cv.md` (role-targeted). See "Generic Positioning Principles" in `modes/_profile.md` for framing guardrails. Renamed from `cv-generic.md` on 2026-04-30 (fork-only file; `dml-` prefix marks fork-divergence from upstream).
- `article-digest.md` — LinkedIn writing summaries and the Consulting Project published case study. Used for intellectual-positioning proof points.
- `dml-experience.md` — first-hand experience proof points (MMI Contact Center, MMI Enterprise Platform, DMLCo Operating Profile). Split out from `article-digest.md` on 2026-04-30 because the two corpora have different update cadences and serve different framing needs.

---

## Local toolset

All scripts live in `batch/` (user-layer, safe from upstream updates).

### `batch/scan-api-portals.mjs` — zero-token L2 scanner

Hits Greenhouse, Ashby, Lever, and Workday APIs directly for every `enabled: true` company in `portals.yml` that has either an explicit `api:` field or an inferable ATS from `careers_url`. Applies `title_filter` + US-location filter + defense-contractor deal-breaker + dedup against `scan-history.tsv` / `pipeline.md` / `applications.md`. Writes candidates to `batch/scan-candidates-{YYYY-MM-DD}.tsv`.

- **Providers supported**: Greenhouse (`boards-api`), Ashby (`posting-api`), Lever (`/v0/postings`), Workday (`wday/cxs/{tenant}/{site}/jobs`).
- **Workday quirks**: limit must be ≤20 (API returns HTTP 400 otherwise); `total` only present on first response; pagination pages dedup internally by `externalPath`.
- **Run**: `node batch/scan-api-portals.mjs`

### `batch/recon-portals.mjs` — ATS fingerprinting + drift detection

For each enabled tracked company, probes its `careers_url`, fingerprints the ATS from URL and body patterns (Greenhouse / Ashby / Lever / Workday / Jobvite / BambooHR / Teamtailor / iCIMS / SmartRecruiters / Taleo / Workable / SuccessFactors / Recruitee / Rippling), and proposes `portals.yml` patches for missing `api:` fields or dead URLs. Zero LLM tokens.

- **Diagnosis buckets**: `ok_l2`, `ok_manual`, `promote_to_L2`, `workday_api_available`, `bamboohr_available`, `known_ats_no_api`, `unknown_ats`, `drift`, `dead`, `no_url`.
- **Run**: `node batch/recon-portals.mjs --pretty` (console) or `node batch/recon-portals.mjs` (JSON to stdout, also writes `batch/recon-portals-latest.json`).
- **Filter**: `--company=NAME` to probe a single company; `--limit=N` for testing.

### `batch/analyze-scan-history.mjs` — performance + silent-failure audit

Reads `data/scan-history.tsv` and `portals.yml`. Reports overall status mix, per-method pass rates (L1 Playwright vs L2 ATS API vs L3 WebSearch vs MCP), top contributors, and — most importantly — **tracked companies that have ZERO scan-history entries** ("never scanned"), broken down by `scan_method`. This is how silent failures surface.

- **Run**: `node batch/analyze-scan-history.mjs` (pretty) or `--json` (structured). `--stale-days=N` tunes freshness threshold.

### `batch/manual-scan-status.mjs` — weekly manual checklist

Reads `portals.yml` for companies with `scan_method: manual`, generates one file per ISO week in `data/manual-scans/` (filename `{YYMMDD}-week{##}-manual.md`, where YYMMDD is the Monday of that week). Auto-creates the current week's file if missing. Prints completion status.

- **Run**: `node batch/manual-scan-status.mjs`
- **Flags**: `--new-week` (force-recreate this week's file; existing one backed up to `.bak`), `--prune=N` (keep only most recent N week files).
- **Predecessor**: `data/manual-scan-log.md` (rolling-log format, retained as historical archive — no longer written to).

### `batch/archive-pipeline.mjs` — move processed entries to the archive

Drains `## Procesadas` from `data/pipeline.md` into `data/pipeline-archive.md` under a new `## Cleanup pass YYYY-MM-DD` section. Heading + italic empty-state preamble in pipeline.md are retained; HTML comment dividers and `- [x]` entries underneath are moved. Inbox, Pendientes, and Needs Manual JD Fetch sections are never touched. URL-level dedup keeps working because `scan-api-portals.mjs` and `build-input.mjs` read both files.

- **Run:** `node batch/archive-pipeline.mjs` (live) or `node batch/archive-pipeline.mjs --dry-run` (preview).
- **Idempotent:** a second run on the same day exits with "Nothing to archive" because Procesadas is empty.
- **When to run:** monthly hygiene, or whenever `pipeline.md` gets visually noisy. Replaces the manual cut-and-paste pattern used on 2026-04-26.

### `batch/add-report-number.mjs` — report header migration (one-off, applied)

Idempotent script that inserts `**#:** N` into each `reports/*.md` file, parsing N from the filename. Already applied to all existing reports on 2026-04-22. Safe to re-run any time (skips files that already have the field).

---

## Weekly workflow

A rough cadence. Not all of these need to run every week — pick based on what's useful.

### Mondays (or whenever starting a new week)

1. **`node batch/manual-scan-status.mjs`** — auto-generate this week's manual-scan checklist. Print any uncompleted items from prior week so you know what rolled over.
2. **`node batch/scan-api-portals.mjs`** — zero-token sweep of ~18 L2-reachable companies. Review `batch/scan-candidates-{today}.tsv`; merge any genuinely new candidates into `data/pipeline.md` for evaluation.

### Mid-week (if actively searching)

3. **Process `data/pipeline.md`** via `/career-ops pipeline` — evaluates each pending URL, generates tailored CV, writes report.
4. **Check off manual scans** as you do them — edit `data/manual-scan-log.md` directly, ticking `- [ ]` → `- [x]` and adding notes inline.

### Monthly

5. **`node batch/analyze-scan-history.mjs`** — performance snapshot, check for stale or silent-failure companies.
6. **`node batch/recon-portals.mjs --pretty`** — ATS drift check, propose any new `portals.yml` patches.
7. **`node batch/archive-pipeline.mjs --dry-run`** then `node batch/archive-pipeline.mjs` — move processed entries from `pipeline.md` Procesadas into `pipeline-archive.md` to keep the active queue scannable.

### Whenever `portals.yml` is touched

7. Run `recon-portals.mjs` against the added/edited companies to verify they're reachable and correctly classified.

---

## Scan methods — at-a-glance

Full details in `modes/scan_en.md`. Short version with real-world precision data (from a historical sample of 258 scan entries as of 2026-04-22):

| Method | How | Token cost | Pass rate | Notes |
|---|---|---|---|---|
| **L1 Playwright** | `browser_navigate` + `browser_snapshot` on `careers_url` | Moderate (snapshot reading) | ~35% | Labeled PRINCIPAL in spec; in practice less-run because it needs interactive Claude + Playwright |
| **L2 ATS API** | JSON fetch from public ATS endpoints (Greenhouse / Ashby / Lever / Workday) | **Zero** | **~74%** | Highest precision; highest ROI for automation |
| **L3 WebSearch** | `site:ats-host.com "Director"` etc. | Small per query | ~53% | Actual historical volume leader; ~10% of results are stale/expired |
| **MCP scraper** | Indeed / Dice via MCP servers | Small | ~94% | Niche but precise |

Our 19 L2-reachable companies as of 2026-04-27: Twilio, Glean, Celonis, Airtable, NerdWallet, Deel, NTT DATA, Five9, RingCentral, Genesys, FIS Global, Evolent Health, Shell, Ryan LLC, Norton Rose Fulbright, Harris Central Appraisal District, Colliers International Houston, BakerTilly, Netsmart Technologies *(promoted 2026-04-27)*.

Dropped from tracking 2026-04-22 (dead URLs, low priority): CB&A Realtors, Fairway Home Mortgage, Central Bank (Houston), Preferred Technologies.

Still flagged for investigation (can't fingerprint ATS automatically; may need Playwright DOM inspection): Salesforce, Microsoft, IBM, Accenture, Deloitte, KPMG, PwC, Fiserv, Jack Henry & Associates, United Airlines, Memorial Hermann, Etsy, Dialpad, Depop, ServiceNow.

---

## Local divergences from upstream

See `patches/README.md` for the authoritative record. Summary as of 2026-04-22:

1. **`modes/_shared.md`** — Archetype Detection taxonomy replaced with Daniel's 8-archetype executive set.
2. **`modes/_shared.md` + `batch/batch-prompt.md`** — Report header canonicalized with `**#:**` tracker number as the first field after H1.
3. **`dashboard/internal/ui/screens/pipeline.go`** — JobID rendered as leftmost column of pipeline rows.
4. **`batch/scan-api-portals.mjs`** — new local tool (not upstream); adds Workday adapter + dedup + pagination fix.
5. **`templates/cv-template.html` + `fill-template.mjs`** — `.job` removed from always-avoid page-break list (CSS) and `avoid-break` class no longer applied to per-job divs (fill-template); bullets flow across pages while individual bullets / company headers stay grouped. Recovers wasted whitespace on long-bulleted experience blocks.

All other scripts in `batch/` (recon-portals, analyze-scan-history, manual-scan-status, add-report-number, archive-pipeline) are local-only; they don't exist upstream.

---

## Known rough edges / future work

- **Workday location filter** — passes "Manchester UK" because `LOC_REJECT` in `scan-api-portals.mjs` doesn't have a bare `"uk"` token. Easy tweak when it matters.
- **Workday pagination safety break** — at 2000 jobs, loop aborts with a flag. Hasn't been hit since the `reportedTotal` capture was added, but retained as defensive.
- **Recon false-negative for Celonis** — Celonis's Greenhouse careers URL (`job-boards.greenhouse.io/celonis`) 302-redirects to `careers.celonis.com` (their own domain), so the recon fingerprinter sees an unknown ATS. The API scan still works correctly because the `api:` field is explicit. No action needed.
- **High-value unknown_ats** — Salesforce, Microsoft, IBM, Big 4 consultancies use custom/enterprise ATSes. Recon's HTTP-only fingerprinting can't see inside JS-rendered pages. Playwright-based deep inspection could unlock some; others are genuinely manual-only.
- **Dead URL remediation for the 4 disabled companies** — CB&A Realtors / Fairway / Central Bank / Preferred Technologies were disabled rather than deleted. Reversible by flipping `enabled: true` if you later find working URLs.
- **Scan-history silent failures** — `scan-history.tsv` only records URLs *seen*. A scan that ran successfully but returned zero title-filter matches looks identical to a scan that never ran. Adding per-scan-attempt logging (company, provider, fetched_count, filtered_count, date) would close that gap.

---

## When to read what

- **"How does scanning work?"** → `modes/scan_en.md` + this file's "Scan methods" section.
- **"What should I run this week?"** → this file's "Weekly workflow" section.
- **"Why does archetype classification behave this way?"** → `patches/README.md` entry 1, then `modes/_shared.md`.
- **"Who's silently not being scanned?"** → run `node batch/analyze-scan-history.mjs`.
- **"Which companies could be promoted to L2?"** → run `node batch/recon-portals.mjs --pretty`.
- **"What's in my manual queue this week?"** → `data/manual-scan-log.md` or run `node batch/manual-scan-status.mjs`.

---

## Calibration log

### 2026-04-30 — DNA reconciliation pass (Pass 1 + Pass 2 + new findings)

Consolidation pass following two cv-generic.md drafting sessions on 2026-04-29. Applied Pass 1, Pass 2, and additional cross-file conflicts found in this session. See `patches/generic-cv-pass-1-notes-APPLIED.md`, `patches/generic-cv-pass-2-notes-APPLIED.md`, and `patches/reconciliation-2026-04-30-APPLIED.md` for full detail.

**Key changes:**
- `modes/_profile.md`: PM Positioning rewrite (dropped four-axis parenthetical, dropped single→multi-product framing, replaced Flagship Story #1); CC scope wording made more honest (dropped "owned end-to-end" overclaim); Proof-Point Anchors items 1, 3, 7, 8 extended; new "Generic Positioning Principles" section.
- `cv.md`: summary block replaced with cv-generic.md's polished version; flat-list Areas of Expertise → 6×3 table (de-buzzworded per generic-CV principles); consultant role broadened from contact-center-only to architecture-and-AI-platforms; consultant date November 2024 → January 2025; Tech Proficiencies restructured to match cv-generic.md (with Genesys/NICE in Skills row, vendor-naming rule refined); MMI digital bullet polished (dropped "industry-leading"); MMI ERP/CRM bullet rewritten to architectural-transformation framing.
- `cv-generic.md`: AE simplified ("AI Architecture & Vendor Evaluation" → "AI Architecture"; dropped "(Budget, P&L, Capex)" parenthetical); date November 2024 → January 2025.
- `article-digest.md`: new sections "MMI — Enterprise Platform" (financial transaction core $1M/day @ 4 9s, Genesys → NICE durability, modernization arc) and "DMLCo — Operating Profile" (operating scale, business mix evolution, anti-framing on back-office sale).
- `feedback_voice_anti_ai_smell.md`: appended resume-voice calibrations (canonical phrases that earned their place; patterns to avoid; structural defaults; linguistic-momentum failure mode).
- `user_mmi_cc_facts.md`: corrected counselor scale (300+ → 400-500 with 2/3-in-centers framing); refined vendor-naming rule (OK in Skills row, not in transition narrative).
- "Homegrown" → "proprietary" globally for the MMI enterprise platform.

### 2026-04-30 — User-layer file rename + article-digest split

Restructured fork-specific user-layer files for clearer provenance. **Principle:** the `dml-` prefix marks files that are fork-specific (not shipped by upstream). Files that exist upstream with canonical names (`cv.md`, `portals.yml`, `article-digest.md`, `config/profile.yml`, `modes/_profile.md`) keep those names to minimize upstream-merge friction.

**Changes:**
- `cv-generic.md` → `dml-cv-generic.md` (renamed via `git mv`; fork-only file).
- `article-digest.md` split into two files by purpose:
  - `article-digest.md` (kept): now contains only LinkedIn writing summaries and the Consulting Project published case study. This is closer to the file's original upstream-intended purpose (portfolio proof points from published material).
  - `dml-experience.md` (new): MMI Contact Center, MMI Enterprise Platform, and DMLCo Operating Profile — first-hand experience proof points that were previously bundled in `article-digest.md`.

**Rationale for the split:** the two corpora have genuinely different update cadences (LinkedIn writing changes when Daniel publishes; experience proof points change when calibration finds gaps) and serve different framing needs (intellectual positioning vs. domain-match credentials). Bundling them obscured both purposes. The split preserves `article-digest.md`'s upstream-canonical role while giving experience material a clearly fork-specific home.

**Reference updates applied:**
- `modes/_shared.md` — added `dml-experience.md` to the Sources of Truth table, the "ALWAYS read before evaluating" rule, the Read tools list; added a precedence rule for first-hand experience metrics.
- `batch/batch-prompt.md` — added `dml-experience.md` to the Sources of Truth table and the Domain Surfacing Pre-Check column header; added the precedence rule.
- `cv-sync-check.mjs` — extended the freshness check (>30 days) to cover both `article-digest.md` and `dml-experience.md`.
- `update-system.mjs` — added `dml-experience.md` and `dml-cv-generic.md` to `USER_PATHS` so future updates never overwrite them.
- `patches/README.md` — Patch #5 documents the rename + split for upstream-merge re-application.

**Not updated (deliberate):** `modes/_profile.template.md`, `CLAUDE.md`, `README.md`, `DATA_CONTRACT.md`, `AGENTS.md`, `docs/*.md`, and the de/fr/ja `_shared.md` files. These are upstream-shipped or unmaintained-in-this-fork; their references to `article-digest.md` remain correct (the file still exists with its narrower scope), and adding `dml-experience.md` references in them would create unnecessary upstream-merge churn.

**Historical APPLIED docs left intact:** `patches/generic-cv-pass-1-notes-APPLIED.md`, `patches/generic-cv-pass-2-notes-APPLIED.md`, and `patches/reconciliation-2026-04-30-APPLIED.md` reference `cv-generic.md` and the pre-split `article-digest.md` content. These are immutable records of what was applied at their respective dates; updating them would falsify the history.

### 2026-05-01 — v1.3.0 → v1.6.0 upstream upgrade (surgical-merge methodology established)

First major upstream upgrade since fork divergence. Skipped two intermediate releases (v1.4.0, v1.5.0). Captured upstream improvements without losing fork customizations, **and used the upgrade as the moment to discover and document undocumented patches.** Full verdicts in `patches/README.md` "Upgrade History" section.

**Process invented (now codified):** Surgical-merge methodology in three steps:

1. **Run `update-system.mjs apply` and let it overwrite system-layer files.** Backup branch + rollback are the safety net.
2. **Per-file diff to separate signal from noise:**
   - `git diff v{old}..upstream/main -- <file>` = real upstream churn (signal)
   - `git diff backup-pre-update-{old}..HEAD -- <file>` = total upgrade churn (signal + noise)
   - The gap = how much our patches were silently overwritten
3. **Three categories emerge:**
   - **Pure customization revert** (upstream churn = 0, total churn > 0) → `git checkout backup -- <file>`. Mechanical. Single bulk commit.
   - **Pure upstream improvement** (no fork customization) → leave it. Free upgrade.
   - **Mixed** (both upstream and fork changed it) → surgical merge per file, one commit each.

**Critical correction discovered mid-upgrade:** `update-system.mjs apply` fetches `upstream/main` HEAD, NOT the latest tagged release. `upstream/main` was 4 commits ahead of `v1.6.0` tag, including a writing-samples folder feature (`9ae201d`). My initial analysis using `v1.3.0..v1.6.0` understated upstream's changes and would have caused me to clobber real upstream content. Always diff against `upstream/main`. (Now codified in patches/README.md re-apply workflow.)

**Verdict summary (Patches #1-5):**
- #1 Archetype taxonomy → Re-applied
- #2 Dashboard JobID column → **Retired** (upstream's `renderAppLine` now ships tracker IDs natively as bold-blue `#NNN`, superior to ours)
- #3 `**#:**` report header → Re-applied + drift fix (`**JobID:**` in batch-prompt template was inconsistent with reports on disk; renamed to `**#:**`)
- #4 CV `.job` page-break → Re-applied (zero upstream churn in cv-template.html or fill-template.mjs)
- #5 dml-* files + USER_PATHS → Re-applied

**Six new patches discovered and documented (#6-#11):** `batch/batch-prompt.md` English translation (silently translated in commit `47cde27` "Large commit of various customizations" with no patch entry); `modes/oferta.md` and `modes/pipeline.md` customizations; `cv-sync-check.mjs` `dml-experience.md` integration; `merge-tracker.mjs` + `dedup-tracker.mjs` corporate-suffix-aware normalization + Needs JD state + report-num-as-tracker-row logic; `.github/workflows/*.yml` fork-specific CI tweaks.

**Key files touched (committed in sequence):**
1. `dd87802` Category A bulk restore (10 files: batch-prompt.md, oferta.md, pipeline.md, cv-template.html, cv-sync-check.mjs, 5 workflows + JobID→#: drift fix)
2. `af8e32f` `modes/_shared.md` surgical merge (Patches #1, #3, #5 layered on upstream's writing-samples + Writing Style Calibration)
3. `d791394` `update-system.mjs` USER_PATHS additions (Patch #5)
4. `74614c9` `merge-tracker.mjs` surgical merge
5. `b001586` `dedup-tracker.mjs` COMPANY_SUFFIXES merge
6. `337c595` Dashboard binary rebuild
7. `2f6b0c9` `patches/README.md` major update (Upgrade History + Patches #6-#11 + Patch #2 retirement)
8. (this commit) PLAYBOOK calibration entry

**Smoke tests passed:** `verify-pipeline.mjs` (0 errors / 0 warnings, 284 entries), `cv-sync-check.mjs` (all checks passed), `merge-tracker.mjs --dry-run` (existing 284 entries detected, max #386).

**Meta-finding (most important):** `patches/README.md` was incomplete pre-upgrade. At least 6 system-layer files had fork divergences not tracked there, so the upgrade silently clobbered them. **Going forward: any time we modify a system-layer file, add an entry to `patches/README.md` immediately.** `update-system.mjs apply` has no other safety net — uncommitted changes in a SYSTEM_PATH file are silently lost on `git checkout FETCH_HEAD --`. The backup branch only protects committed history, not undocumented divergences.

**Practice insight:** The upgrade itself was bounded (90 minutes elapsed, ~10 commits). The bulk of the work was *understanding* what changed and why, not mechanical patching. Treating each upstream upgrade as a calibration opportunity (re-discovering and documenting undocumented patches) is the right cadence; the documentation cost amortizes across all future upgrades.
