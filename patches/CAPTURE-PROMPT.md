# Session-End Capture Protocol

**Purpose:** Standing prompt for sessions that surface positioning, framing, factual, or voice changes which should outlive the session and integrate into the wider career-ops system. Invoke by saying *"follow `patches/CAPTURE-PROMPT.md`"* near the end of a session.

---

## The prompt

Capture session knowledge before closing.

This session has likely surfaced decisions, framings, factual corrections, or positioning principles that should outlive it and integrate into the wider career-ops system. Before we close, produce a notes file capturing what we landed on, so a future consolidation pass can apply it cleanly.

**When this applies:** any session where positioning, framing, voice, or facts about Daniel's career changed; especially when the working document is still being iterated and final application to system files is deliberately deferred.

**When to skip:** routine evaluations, pipeline runs, scan results, or sessions where nothing about positioning, framing, or system files changed. If you're unsure, ask.

**File path:** `patches/{topic-slug}-{passN-or-date}-notes.md`. Examples: `generic-cv-pass-2-notes.md`, `linkedin-refresh-pass-1-notes.md`, `cover-letter-voice-2026-05-15-notes.md`. Use a consistent topic slug across passes on the same workstream so a consolidation pass can find them all.

**Reference template:** `patches/generic-cv-pass-1-notes.md`. Match its structure unless you have a specific reason not to.

**Organize by tier:**

- **Tier 1 — Live evaluation accuracy.** Anything currently inaccurate or rejected in user-layer files (`modes/_profile.md`, `cv.md`, `article-digest.md`, `MEMORY.md`, `feedback_*.md`). These affect every evaluation, batch run, and tailored CV until applied. Surface them prominently; do not bury the urgency.
- **Tier 2 — New knowledge to preserve.** Facts, framings, proof points, anti-patterns, or positioning principles that emerged this session and should be available to future runs. Map each to the right existing system file.
- **Tier 3 — System hygiene.** File references, calibration log entries, voice notes, convention updates.

**For each change, include:**

- **Target file and section** (with line numbers when known).
- **Current text** verbatim, when replacing existing content.
- **Proposed text** verbatim, ready for the consolidation pass to paste.
- **Rationale** — what user feedback or session reasoning produced this change. Quote the user's exact words when they're load-bearing.

**Required sections:**

- **Files-affected preview table** at the top, scoped by tier.
- **Open / deferred section** — items raised but not resolved this session. Flag overlap risk with prior or anticipated sessions.
- **Source notes section** — what inputs informed this pass; closing instructions for the consolidation pass (read this, read the by-then-stabilized working doc, surface intervening changes, apply Tier 1 first).

**Rules:**

1. **Do not apply changes to system files in this session.** This is a notes file, not a commit. Application happens in a deliberate consolidation pass that synthesizes across multiple notes files.
2. **Map to existing system architecture before inventing a new home.** Read `modes/_shared.md` Sources of Truth section and `MEMORY.md` index before deciding where new knowledge belongs. Prefer extending an existing section over creating a new file. The career-ops system is intentionally tight; new files add maintenance burden.
3. **Mark provisional calls as provisional.** Voice calibrations and phrasing decisions from a single session may shift in subsequent ones. Tag them so the consolidation pass treats them as "verify still preferred" rather than "apply blindly."
4. **Push back if the notes-file approach doesn't fit this session.** If everything decided here can safely apply now (no overlap risk with anticipated sessions, nothing speculative), say so. The notes file is the right tool when batching is justified, not a default.
5. **Push back if a Tier 1 item is too time-sensitive to wait.** If active inaccuracy in `_profile.md` or similar would corrupt evaluations the user is about to run, recommend immediate application rather than deferral.

---

## Notes for maintainers

- This protocol was created 2026-04-29 alongside `patches/generic-cv-pass-1-notes.md`, the first artifact produced under it.
- The consolidation pass is itself a session type that reads all `*-notes.md` files in `patches/`, resolves overlap, and applies. That session should also follow this protocol if it surfaces additional decisions, but its primary job is application.
- If the notes-file naming convention or tier system evolves, update the reference template (`generic-cv-pass-1-notes.md` or its successor) and update this prompt to match.
