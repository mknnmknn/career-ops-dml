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

## Retired patches

*(none yet)*
