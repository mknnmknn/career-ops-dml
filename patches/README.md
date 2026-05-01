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

### 2. `dashboard/internal/ui/screens/pipeline.go` — JobID shown as first column

- **Applied:** before 2026-04-22 (documenting an existing local divergence)
- **File:** `dashboard/internal/ui/screens/pipeline.go`
- **Function:** `renderAppLine`

**What was changed:**
An "ID" column showing `app.Number` (the tracker application number) was added as the leftmost column of each pipeline row. Column widths: `idW := 4`, rendered with `idStyle.Render(fmt.Sprintf("%d", app.Number))`, styled in muted Subtext color.

Current column order in `renderAppLine`:
```
ID | Score | Company | Role | Status | Comp
```

**Why:**
Daniel uses the tracker number as the primary handle when referencing applications in-session and across tooling (e.g., "evaluate Celonis #188", "fix the Akumin CV, #138"). Upstream's layout without a JobID column forced visual correlation of Company+Role to find the tracker entry for a row, which is slower and more error-prone at scale.

**Re-apply after upstream update:**
1. Open the incoming `dashboard/internal/ui/screens/pipeline.go` and locate `renderAppLine`.
2. Confirm whether upstream has adopted a JobID column. If not:
   - Restore the `idW := 4` column width declaration
   - Restore the `idText := idStyle.Render(fmt.Sprintf("%d", app.Number))` rendering
   - Restore the leading `%s` in the row format string so `idText` is the first positional arg
   - Adjust the `roleW` remainder calculation to subtract `idW` (see current file for exact math)
3. Rebuild `dashboard/career-ops-dashboard.exe` via `go build` in the `dashboard/` directory.

**Upstream action worth considering:**
PR upstream to add the JobID column as a default. Most career-ops users will want tracker numbers visible in the pipeline view.

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

## Retired patches

*(none yet)*
