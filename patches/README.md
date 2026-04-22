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

## Retired patches

*(none yet)*
