# Local Patches — career-ops-dml Divergence from Upstream

This directory tracks local modifications to **system-layer files** (files that `update-system.mjs apply` would otherwise overwrite on upstream releases of [santifer/career-ops](https://github.com/santifer/career-ops)).

**Purpose:** When a new upstream release lands, review each patch here to decide whether to (1) re-apply it against the new file, (2) accept that upstream merged or replaced the change, or (3) retire the patch.

**This file itself is user-layer** — `update-system.mjs` does not touch `patches/`.

---

## Scope

Use this directory **only** for changes to system-layer files where no user-layer override path exists, or where the override path has known weaknesses (e.g., residue bias from "linguistic momentum" when both layers are in context).

Changes that belong in `modes/_profile.md`, `config/profile.yml`, `article-digest.md`, or other user-layer files should go there, not here.

## Re-apply workflow

After running `node update-system.mjs apply`:

1. For each patch below, open the corresponding file in the fresh update.
2. Compare the incoming version of the patched section against the old and new contents documented here.
3. Decide:
   - **Re-apply**: upstream hasn't addressed the issue; reapply our change.
   - **Merge**: upstream partially addressed it; reconcile.
   - **Retire**: upstream fixed the issue our patch was addressing; drop the patch.
4. Update this file to reflect the decision and date.

**Critical analysis tip:** `update-system.mjs apply` fetches `upstream/main` HEAD, which can be ahead of the latest tagged release. When measuring "what upstream actually changed," diff `v{old}..upstream/main`, NOT `v{old}..v{new}`. The latter understates upstream's changes by missing post-tag commits. (Discovered during the v1.6.0 upgrade — `upstream/main` was 4 commits past v1.6.0, including a writing-samples folder feature.)

---

## Upgrade History

### 2026-05-01 — v1.3.0 → v1.6.0 (actually upstream/main HEAD past v1.6.0)

**Process:** Surgical patch (Option C) rather than full restore. Per-file diff of `v1.3.0..upstream/main` separated upstream churn from fork customization-revert noise, then layered fork customizations onto post-upgrade upstream where genuine improvements existed.

| Patch | Verdict | Notes |
|-------|---------|-------|
| #1 Archetype taxonomy | **Re-applied** | Upstream's 6-archetype AI taxonomy still in place; no override mechanism shipped. |
| #2 Dashboard JobID column | **Retired** | Upstream's `renderAppLine` now ships tracker IDs natively as first column with bold-blue `#NNN` styling — superior to our patch in every dimension. See "Retired patches" section below. |
| #3 `**#:**` report header | **Re-applied** | No upstream equivalent. Inline drift fix: `**JobID:**` in batch-prompt template was renamed to `**#:**` for consistency with `add-report-number.mjs` and reports on disk. |
| #4 CV `.job` page-break | **Re-applied** | `templates/cv-template.html` had no upstream changes; `fill-template.mjs` was untouched. Patch survived intact via Category A bulk restore. |
| #5 dml-* file rename + article-digest split | **Re-applied** | USER_PATHS additions re-added to update-system.mjs (upstream rewrote that file with 80+/20- improvements but didn't include fork-only files). |

**New patches discovered during this upgrade** (previously undocumented divergences): see entries #6-#11 below.

**Discovery worth flagging:** `patches/README.md` was incomplete pre-upgrade. At least 6 system-layer files had fork divergences that weren't tracked here, so the v1.6.0 upgrade silently clobbered them. They have all been documented now and re-applied. **Going forward: any time we modify a system-layer file, add an entry to this README *immediately*.** The `update-system.mjs apply` flow has no other safety net.

---

## Active patches

### 1. `modes/_shared.md` — Archetype Detection replaced

- **Applied:** 2026-04-22
- **File:** `modes/_shared.md`
- **Section:** "Archetype Detection" (heading `## Archetype Detection`)

**What was replaced:**
santifer's default 6-archetype AI-engineering taxonomy (AI Platform/LLMOps, Agentic/Automation, Technical AI PM, AI Solutions Architect, AI Forward Deployed, AI Transformation).

**Why:**
Those archetypes are IC-AI-flavored and reflect santifer's own career targets. For Daniel's executive search (CTO, CIO, CDO, transformation, and advisory archetypes), retaining the original table caused measurable classification drift: even when `_profile.md` overrides were present, the original taxonomy remained in context and biased classification via linguistic-momentum / primacy effects. Evaluations silently rounded JDs toward IC-AI framings that didn't fit.

**Replacement:**
Daniel's 8-archetype executive taxonomy:
1. Chief Technology Officer
2. Chief Information Officer / Head of IT
3. Head of Data / Chief Data Officer / VP Data
4. Chief Transformation Officer / Digital Transformation
5. AI Transformation Lead *(substance-check required)*
6. Enterprise Technology Strategy *(VP/Director)*
7. Chief of Staff to CEO / Technology Chief of Staff
8. Fractional / Advisory CTO

Each archetype has JD signals and "what they're buying" framing appropriate to Daniel's seat-shape preferences. The AI Transformation Lead archetype includes an explicit substance-check rubric distinguishing genuine AI-adoption mandates from trend-chasing theater.

The patched section is marked in `_shared.md` with an HTML comment (`<!-- LOCAL PATCH... -->`) for visibility.

**Re-apply after upstream update:**
1. Open the incoming `modes/_shared.md` and locate the "Archetype Detection" section.
2. If upstream has NOT canonicalized a taxonomy-override mechanism: replace their section with ours (see the `## Archetype Detection` block in our `modes/_shared.md`).
3. If upstream HAS added an override mechanism (e.g., a way to reference a user-layer taxonomy from `_shared.md`): consider migrating to that pattern instead of patching. Update this entry to "Retired."

**Upstream action worth considering:**
PR upstream to add a taxonomy-override mechanism in `_shared.md` so this kind of customization doesn't require file patching. Most career-ops users will want their own archetype set.

---

### 3. Report header — `**#:**` tracker-number field

- **Applied:** 2026-04-22
- **Files:** `batch/batch-prompt.md`, `modes/_shared.md` (rule #10), existing reports in `reports/*.md`

**What was changed:**
Every evaluation report now begins (after the H1 title) with a `**#:** {tracker_number}` line before the existing header fields (`**Company:**`, `**Role:**`, `**Score:**`, etc.). This makes reports self-describing — the tracker number that identifies the application is now visible in the report body, in the Go dashboard's viewer, in any markdown preview, and greppable via `^\*\*#:\*\*`.

**Why:**
When opening a report in the Go dashboard viewer, the header shown to the user did not include the tracker number even though the filename encodes it. Rather than teaching the viewer to extract and overlay the number (code change, rebuild required), the cleaner approach is to make the report file self-describing. The viewer's existing `styleLine` function already handles `**Label:** value` lines, so zero Go code changes are required — the new line renders automatically.

**Implementation components:**
1. `batch/batch-prompt.md` — Step 3 report template updated to include `**#:** {{REPORT_NUM}}` as the first field after the H1.
2. `modes/_shared.md` rule #10 — expanded from "Include `**URL:**` in every report header" to canonicalize the full header field order and include `**#:**`.
3. `batch/add-report-number.mjs` — one-off idempotent migration script that inserts `**#:** N` into every existing report in `reports/*.md` (parses N from the filename). Safe to re-run; skips reports that already have the line.

**Re-apply after upstream update:**
1. Check `batch/batch-prompt.md` and `modes/_shared.md` — if upstream canonicalized a report-header spec that includes a tracker-number field, migrate to that. Otherwise restore our changes.
2. The migration script (`batch/add-report-number.mjs`) is idempotent and can be re-run safely after any prompt-template change to ensure existing reports remain conformant.

**Upstream action worth considering:**
PR upstream to canonicalize a report-header schema across all modes (oferta.md currently has a stale Spanish template that doesn't match what the system actually generates — this is a systemic drift issue worth fixing in the mainline).

---

### 4. CV page-break behavior — `.job` blocks flow across pages

- **Applied:** 2026-04-28
- **Files:** `templates/cv-template.html` (CSS) + `fill-template.mjs` (HTML output)
- **Sections:** `/* === PAGE BREAK CONTROL === */` block in template (around line 349); `buildExperience()` function in `fill-template.mjs` (around line 88)

**What was changed:**

**`templates/cv-template.html`** — upstream's CSS lists `.job` alongside `.avoid-break, .project, .edu-item, .cert-item` under `break-inside: avoid` / `page-break-inside: avoid`. We removed `.job` from that list and replaced it with finer-grained rules:

- `.job li { break-inside: avoid }` — individual bullets stay whole; bullets never split mid-sentence.
- `.job-header, .job-role { break-after: avoid }` — company / period / role headers don't strand at the bottom of a page without at least one bullet attached.
- `.job` itself is now free to flow across pages between bullets.

The patched section is marked in `cv-template.html` with an HTML comment (`/* LOCAL PATCH (2026-04-28): ... */`) for visibility.

**`fill-template.mjs`** — `buildExperience()` was emitting `<div class="job avoid-break">` for each job. The `avoid-break` class kept matching even after the CSS change, so the fix had no effect until this dual-class was simplified to just `<div class="job">`. (The header `<div class="header avoid-break">` and section divs still carry `avoid-break` — that's intentional; only the per-job divs were changed.)

**Why:**
With `.job` in the always-avoid list, any experience block too tall to fit in the remaining space on a page got pushed wholesale to the next page — wasting up to 1/4 of a page in whitespace. For Daniel's CV the MMI block is the long one (8-9 substantive bullets covering 14 years as CTO of a 501(c)(3) nonprofit). A long-format CV with several substantive bullets per role hits this constantly. Letting bullets flow across the boundary while keeping individual bullets and the company-header line whole gives back the lost whitespace without the awkward "company name with no bullets under it at page bottom" failure mode.

This was discovered building Daniel's Great Minds CV (3-page output where 2 was achievable with proper page utilization).

**Re-apply after upstream update:**
1. Open the incoming `templates/cv-template.html` and locate the page-break-control CSS block.
2. If upstream still has `.job` in the always-avoid list:
   - Remove `.job` from the comma-separated selector list under `break-inside: avoid`.
   - Add the three rules above (`.job li`, `.job-header, .job-role`).
   - Restore the `LOCAL PATCH` comment for visibility.
3. Open the incoming `fill-template.mjs` and locate `buildExperience()`. If upstream still emits `<div class="job avoid-break">`, change it to `<div class="job">` (the CSS change alone has no effect while `avoid-break` is still applied).
4. If upstream has changed the page-break approach altogether (e.g., switched to a different CSS strategy or made `.job` configurable): evaluate whether their approach achieves the same goal (long blocks flow, headers stay attached, bullets stay whole). If yes, retire this patch.

**Upstream action worth considering:**
PR upstream to relax `.job` from always-avoid by default and add the bullet/header rules. The "experience block must stay whole on one page" assumption breaks down for any CV with substantive bullets per role — this affects most senior CVs, not just Daniel's.

---

### 5. User-layer file rename + article-digest split

- **Applied:** 2026-04-30
- **Files:** `cv-generic.md` → `dml-cv-generic.md` (rename); `article-digest.md` (trimmed) + new `dml-experience.md` (split); `modes/_shared.md`, `batch/batch-prompt.md`, `cv-sync-check.mjs`, `update-system.mjs` (reference updates).

**What was changed:**

1. **Renamed** `cv-generic.md` → `dml-cv-generic.md` via `git mv` (preserves blame).
2. **Split** `article-digest.md`:
   - `article-digest.md` (kept, trimmed): LinkedIn writing summaries + Consulting Project published case study.
   - `dml-experience.md` (new): MMI Contact Center, MMI Enterprise Platform, DMLCo Operating Profile — first-hand experience proof points.
3. **System-file reference updates:**
   - `modes/_shared.md`: added `dml-experience.md` row to Sources of Truth table; added precedence rule for first-hand experience metrics; extended the "ALWAYS read before evaluating" rule and the Read tools list.
   - `batch/batch-prompt.md`: same — Sources of Truth row, precedence rule, Domain Surfacing Pre-Check column header.
   - `cv-sync-check.mjs`: freshness check (>30 days) now iterates `['article-digest.md', 'dml-experience.md']`.
   - `update-system.mjs`: added both `dml-experience.md` and `dml-cv-generic.md` to `USER_PATHS`.

**Why:**

The fork accumulated several user-layer files with mixed provenance — some upstream-shipped (`cv.md`, `article-digest.md`, `portals.yml`), some fork-created (`cv-generic.md`, the experience proof-point sections that had been appended to `article-digest.md` on 2026-04-30 reconciliation). Visual inspection of the project root couldn't distinguish them, and `article-digest.md` had drifted from its original purpose (portfolio writing proof points) to become a hybrid file mixing published writing with first-hand experience material.

The principle adopted: **the `dml-` prefix marks fork-divergence from upstream.** Files that ship upstream with canonical names keep those names — minimizing the merge tax across files that change frequently in upstream. Fork-created files get the `dml-` prefix, signaling provenance and grouping them visually in the root listing.

This left `cv-generic.md` (fork-only) for renaming, and the experience material (fork-only addition to `article-digest.md`) for extraction into a new fork-named file. The post-split `article-digest.md` is closer to its upstream-intended scope than the bundled hybrid was.

**Re-apply after upstream update:**

1. Confirm `cv.md`, `article-digest.md`, `config/profile.yml`, `modes/_profile.md`, and `portals.yml` still exist with canonical names in the incoming update. If any have been renamed upstream, evaluate whether to follow.
2. Re-verify `dml-experience.md` and `dml-cv-generic.md` are still present in `USER_PATHS` of the incoming `update-system.mjs`. The updater should never have written to them, but check the diff.
3. In `modes/_shared.md` and `batch/batch-prompt.md`: if the incoming version has restructured the Sources of Truth table or the ALWAYS rules, re-add `dml-experience.md` rows / references.
4. Confirm `cv-sync-check.mjs` freshness check still iterates both files. Upstream may have rewritten the check entirely; if so, re-thread the array.
5. If upstream has introduced its own concept of a separate experience-proof-points file, evaluate whether to migrate `dml-experience.md` content there and retire this patch.

**Upstream action worth considering:**

Two PRs:
- Add a clearer user-layer convention that distinguishes "files everyone is expected to have" (cv.md, profile.yml, portals.yml) from "fork-/user-extension files" (separate proof-point banks per career stage, role family, or evidence type). Most senior users will accumulate multiple proof-point corpora.
- Add a `--check-user-paths` flag to `update-system.mjs` that lists everything currently treated as user-layer, so forks can confirm their custom files are protected without reading the source.

---

### 6. `batch/batch-prompt.md` — English translation + Sources of Truth additions

- **Applied:** 2026-04-22 (originally applied during commit `47cde27` "Large commit of various customizations"; re-discovered and documented during the v1.6.0 upgrade on 2026-05-01)
- **File:** `batch/batch-prompt.md`

**What was changed:**
1. **Translated end-to-end from Spanish to English.** Upstream ships this file in Spanish; the fork uses English throughout (headings, instructions, rules, table headers, prose).
2. Sources of Truth table extended with `dml-experience.md` and `article-digest.md` (with description "LinkedIn writing, published case studies"), plus precedence rules for first-hand experience metrics.
3. Report template's first field renamed to `**#:** {{REPORT_NUM}}` (previously `**JobID:** {{REPORT_NUM}}`, fixed during the v1.6.0 upgrade to align with `add-report-number.mjs` and reports on disk).
4. Companion explanatory note canonicalizing `**#:**` as the tracker-number reference, with Batch ID called out as internal-orchestration-only.

**Why:**
The English translation predates documented patches. It was applied silently during heavy customization work and never tracked here, so the v1.6.0 upgrade silently overwrote it back to Spanish. The Sources of Truth additions plumb the fork-only `dml-experience.md` file (split out from `article-digest.md` on 2026-04-30) into the batch-mode workflow.

**Re-apply after upstream update:**
1. Diff `v{old}..upstream/main` for `batch/batch-prompt.md`. If upstream churn is zero (was the case for v1.3.0 → v1.6.0): bulk-restore from the pre-upgrade backup branch.
2. If upstream churn exists: take the new upstream version, translate to English, then re-add fork-specific content (Sources of Truth rows, precedence rules, `**#:**` report template, dml-experience.md references).
3. Verify no `**JobID:**` references remain (replaced with `**#:**`).

**Upstream action worth considering:**
PR upstream to add an English version of `batch/batch-prompt.md`, and document a process for forks to opt into translated batch prompts.

---

### 7. `modes/oferta.md` — fork customizations

- **Applied:** various (fork divergences accumulated; documented during the v1.6.0 upgrade on 2026-05-01)
- **File:** `modes/oferta.md`

**What was changed:**
~30 lines of fork customizations on top of v1.3.0 baseline. Specifics not enumerated here — the canonical record is `git diff v{old}..backup-pre-update-{old}` for the file, which will reproduce the fork-only delta.

**Why:**
Daniel-specific framing for evaluation Block A-G output, integration of fork-only proof-point files (`dml-experience.md`), and minor language tightening.

**Re-apply after upstream update:**
1. Diff `v{old}..upstream/main` for `modes/oferta.md` to determine real upstream churn.
2. If zero: bulk-restore from backup.
3. If non-zero: surgical merge — take upstream, layer fork delta from `git diff v{old}..backup-pre-update-{old}`.

---

### 8. `modes/pipeline.md` — fork customizations

- **Applied:** various (fork divergences accumulated; documented during the v1.6.0 upgrade on 2026-05-01)
- **File:** `modes/pipeline.md`

**What was changed:**
~16 lines of fork customizations on top of v1.3.0 baseline. Includes the inaccessible-JD handling spec (commit `5d3de66` "Inaccessible-JD handling spec") that tightened the `[!]` flow so an inaccessible URL reserves a sequential REPORT_NUM, writes a `- [!]` line to pipeline.md, and explicitly forbids generating a score/report/PDF/tracker entry until `jds/NNN.txt` is provided.

**Why:**
The `[!]` workflow handles JDs whose URLs are dead, geo-blocked, or behind a wall — the system reserves the slot but doesn't pretend to evaluate without the JD text.

**Re-apply after upstream update:**
1. Diff `v{old}..upstream/main` for `modes/pipeline.md`.
2. If upstream changed the inaccessible-JD section: surgically merge.
3. Otherwise: bulk-restore from backup.

---

### 9. `cv-sync-check.mjs` — fork customizations

- **Applied:** various (documented during the v1.6.0 upgrade on 2026-05-01)
- **File:** `cv-sync-check.mjs`

**What was changed:**
~9 lines of fork customizations. Most importantly: freshness check (>30 days) extended to iterate `['article-digest.md', 'dml-experience.md']` instead of only `article-digest.md`.

**Why:**
The 2026-04-30 user-layer file split moved first-hand experience proof points out of `article-digest.md` into `dml-experience.md`. The freshness check needed to cover both.

**Re-apply after upstream update:**
1. Confirm freshness-check array still iterates both files.
2. If upstream rewrote the check: re-thread `dml-experience.md` into the file array.

---

### 10. `merge-tracker.mjs` and `dedup-tracker.mjs` — corporate-suffix-aware company normalization + Needs JD state

- **Applied:** various (documented during the v1.6.0 upgrade on 2026-05-01)
- **Files:** `merge-tracker.mjs`, `dedup-tracker.mjs`

**What was changed:**

`merge-tracker.mjs`:
1. `'Needs JD'` added to `CANONICAL_STATES` — supports the inaccessible-JD workflow from Patch #8.
2. Status aliases: `'needs jd'`, `'pending jd'`, `'jd unfetchable'`, `'unfetchable'` → `Needs JD`.
3. `COMPANY_SUFFIXES` constant + rewritten `normalizeCompany` to strip trailing corporate suffixes (`LLP`, `LLC`, `Inc`, `Ltd`, `Corp`, `GmbH`, etc.) recursively before matching.
4. `extractReportNum` used for new-entry tracker row number — collapses the dual-numbering system (tracker row # ↔ report #) so they always match.

`dedup-tracker.mjs`:
1. Same `COMPANY_SUFFIXES` constant + rewritten `normalizeCompany` (mirrors merge-tracker for cross-script consistency).
2. (`ROLE_STOPWORDS` and `LOCATION_STOPWORDS` were ALSO independently added by upstream in 1.5.0 / 1.6.0 — see changelog #248. Both versions are functionally equivalent. No fork action required.)

**Why:**
"Acme LLP" and "Acme Corp" should dedupe to the same company key. Upstream's version doesn't strip suffixes, so the fork sees them as distinct. The `Needs JD` state supports Patch #8's `[!]` workflow.

**Re-apply after upstream update:**
1. Diff `v{old}..upstream/main` for both files. Layer fork additions onto upstream's improvements.
2. If upstream introduces its own corporate-suffix-aware normalization: retire the COMPANY_SUFFIXES portion.
3. If upstream introduces `Needs JD` (or equivalent) as a canonical state: retire that portion.

**Upstream action worth considering:**
PR upstream to add a `Needs JD` state for the inaccessible-JD workflow, and corporate-suffix-aware company dedup. Both are universally useful.

---

### 11. `.github/workflows/*.yml` — fork-specific CI tweaks

- **Applied:** various (documented during the v1.6.0 upgrade on 2026-05-01)
- **Files:** `.github/workflows/codeql.yml`, `labeler.yml`, `release.yml`, `test.yml`, `welcome.yml`

**What was changed:**
Small fork-specific tweaks to each (e.g., repository references, action versions, labels). Specifics intentionally not enumerated — the canonical record is `git diff v{old}..backup-pre-update-{old} -- .github/workflows/*.yml`.

**Why:**
The fork hosts its own GitHub Actions setup (`mknnmknn/career-ops-dml`) with workflow tweaks tailored to the fork's needs — labels, branch names, action pinning policy, etc. Upstream's workflows assume `santifer/career-ops` provenance and labels.

**Re-apply after upstream update:**
1. Diff `v{old}..upstream/main` for each workflow.
2. If upstream changed any: surgically merge with fork's repository references / action versions.
3. If upstream churn is zero: bulk-restore from backup.

---

## Retired patches

### 2. `dashboard/internal/ui/screens/pipeline.go` — JobID shown as first column

- **Originally applied:** before 2026-04-22
- **Retired:** 2026-05-01 (during v1.6.0 → upstream/main upgrade)
- **File:** `dashboard/internal/ui/screens/pipeline.go`
- **Function:** `renderAppLine`

**What our patch did:**
Added an "ID" column showing `app.Number` as the leftmost column of each pipeline row. Column widths: `idW := 4`, rendered with `idStyle.Render(fmt.Sprintf("%d", app.Number))`, styled in muted Subtext color. Format: bare digits (e.g., `123`).

**Why retired:**
Upstream's v1.6.0+ `renderAppLine` now ships tracker IDs natively as the leftmost column with **superior styling**:

| Aspect | Our patch | Upstream |
|--------|-----------|----------|
| Column width | 4 | 5 (handles 3-digit numbers cleanly) |
| Format | `123` | `#123` (hash prefix for visual clarity) |
| Style | Subtext (muted gray) | Bold Blue (eye-catching) |
| Empty case | Uninitialized | `#—` placeholder |

Upstream's implementation is better on every dimension. No remaining gap to patch.

**Discoverability:**
Upstream tracker-IDs feature shipped in 1.6.0 changelog as "show tracker IDs in pipeline list" (also "show dates in pipeline list" in 1.5.0).

**If a future divergence emerges:**
Confirm the column ordering, styling, and empty-case behavior still meet our needs. If upstream removes or significantly changes the column, reconsider patching.
