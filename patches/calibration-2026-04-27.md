# Calibration — 2026-04-27

Bottom-up calibration review of the 36 EVALUATED rows from the week's batch. The user walked through ~12 low-score rows (1.5–2.9) explaining why each was kept off SKIP, surfacing 17 distinct calibration insights. This document records the changes applied.

## Source rows discussed

| Tracker # | Report # | Company | Score | Insight |
|-----------|----------|---------|-------|---------|
| 282 | 282 | Jacobs | 1.5 | Comp inferred from WebFetch was wrong; JD had $165-185K explicit |
| 332 | 367 | Murmuration | 1.8 | Mission-alignment boost not applied |
| 297 | 297 | Arcadis | 2.0 | Domain barrier softer than scored; large pool |
| 269 | 269 | Duolingo | 2.0 | CS-degree hard filter; dead URL not short-circuited |
| 250 | 250 | SitusAMC | 2.1 | AI theater detection burning score |
| 359 | 361 | Great Minds | 2.2 | CMS/SiteCore/PM experience not surfaced |
| 304 | 279 | RingCentral AI Process | 2.6 | Theater + buyer-side proxy missed |
| 296 | 296 | Enbridge | 2.6 | Title step-down at meaningful-scale org |
| 366 | 347 | NerdWallet (Wealth Ops) | 2.6 | Data leadership undersold (also #205 Director PM Data) |
| 305 | 283 | RingCentral AI PS | 2.3 | Same buyer-side proxy issue |
| 260 | 259 | Crowe | 2.7 | Duplicate of #084 — dedup missed "Crowe LLP" vs "Crowe" |
| 277 | 277 | BairesDev | 2.8 | Buyer-side / nearshore-strategy proxy |
| 372 | 372 | Five9 PM Outbound CC | 2.8 | Call-center domain credibility missed |
| 342 | 319 | Evidence Action | 2.8 | Mission boost + theater eating cycles |
| 374 | 340 | Five9 IT Business Apps | 2.9 | Stability concerns silently deducted from fit score |
| 205 | 205 | NerdWallet Director PM Data | 2.8 | Data leadership not surfaced |

## Calibration items (17)

| # | Insight | Status |
|---|---------|--------|
| 1 | Conversation-Seed pathway (≥2.5 if large pool + close-comp + low-effort + functional ≥3.0) | ✅ `_profile.md`, `batch-prompt.md`, memory `feedback_conversation_seed.md` |
| 2 | Worker surfaces hiring pool size, apply effort, named-contact opportunity in Block C | ✅ `batch-prompt.md` |
| 3 | JD-explicit comp/location/level is authoritative; never override with WebFetch | ✅ `batch-prompt.md` (HARD rule) |
| 4 | Mission-alignment boost +0.3 to +0.5 for progressive/civic orgs | ✅ `_profile.md` |
| 5 | CS-degree requirement is soft signal (max -0.2), not hard filter | ✅ `batch-prompt.md` Block B rules |
| 6 | Dead URL → DISCARD short-circuit; skip Blocks B-F | ✅ `batch-prompt.md`, `oferta.md` Block G |
| 7 | Block G theater detection moved to interview-prep; Block G is freshness/legitimacy only | ✅ `oferta.md`, `batch-prompt.md` |
| 8 | Surface CMS/SiteCore/PM experience for CMS-adjacent JDs | ✅ `batch-prompt.md` Domain Surfacing Pre-Check |
| 9 | Fix link-text/file-number mismatches in applications.md | ✅ `fix-tracker-links.mjs` (one-time, 23 rows fixed) |
| 10 | Rename `**#:**` → `**JobID:**` in report headers | ✅ `batch-prompt.md` template |
| 11 | Director-equivalency generalized to ≥5K-employee enterprises | ✅ `_profile.md`, memory `feedback_director_equivalency.md` |
| 12 | Buyer-side ↔ delivery-side proxy at 0.7× weight for consulting/PS roles | ✅ `_profile.md`, memory `feedback_buyer_side_proxy.md` |
| 13 | Data leadership consistently surfaced for data-PM/data-platform JDs | ✅ `batch-prompt.md` Domain Surfacing Pre-Check (existing memory `feedback_data_leadership.md` referenced) |
| 14 | Dedup: strip company suffixes (LLP, Inc, LLC, etc.) before normalizing | ✅ `dedup-tracker.mjs`, `merge-tracker.mjs` |
| 15 | Tracker row # ↔ report # collapsed (use report num as tracker num) | ✅ `merge-tracker.mjs` (going forward; existing rows use link-text fix) |
| 16 | Call-center domain credibility (MMI as CC operator + CC consulting overlap) | ✅ `_profile.md`, `batch-prompt.md`, memory `feedback_call_center_domain.md` |
| 17 | Company stability/culture concerns → "Verify Before Applying" flag, not score deduction | ✅ `_profile.md`, `oferta.md` Block G, memory `feedback_stability_flag_not_deduction.md` |

## Files modified

### User-layer (safe from upstream updates)
- `modes/_profile.md` — added 6 new sections (Conversation-Seed, Mission-Alignment, Director-Equivalency Generalized, Buyer-Side Proxy, Call-Center Domain, Stability-Flag Rule)
- `data/applications.md` — flipped Crowe #260 to Discarded (duplicate of #084); 23 link-text/file mismatches fixed via `fix-tracker-links.mjs`

### System-layer (fork divergence — track here)
- `batch/batch-prompt.md` — added JD Source-of-Truth Rule, Dead-URL Short-Circuit, Domain Surfacing Pre-Check, Soft-Filter Rules, Conversation-Seed Pathway, surfacing requirements; rename `**#:**` → `**JobID:**` in report header template
- `modes/oferta.md` — Block G simplified (theater detection removed; freshness/legitimacy only); Verify-Before-Applying flag mechanism added; Dead-URL short-circuit codified
- `dedup-tracker.mjs` — `normalizeCompany()` now strips corporate suffixes
- `merge-tracker.mjs` — `normalizeCompany()` now strips corporate suffixes; tracker row # = report # going forward

### Memory files (auto-loaded)
- `feedback_director_equivalency.md` — generalized from F500/Big Tech only to any ≥5K-employee org
- `feedback_buyer_side_proxy.md` — NEW
- `feedback_call_center_domain.md` — NEW
- `feedback_conversation_seed.md` — NEW
- `feedback_stability_flag_not_deduction.md` — NEW

### One-off tooling
- `fix-tracker-links.mjs` — NEW (utility; idempotent; safe to re-run)

## Verification

- `node verify-pipeline.mjs` → 0 errors, 0 warnings (283 entries clean)

## Expected impact next week

- **Bottom-quartile scores** (currently 1.5–2.5) will rise where Domain Surfacing Pre-Check applies — call-center, CMS, data-leadership, nearshore JDs should land 0.3–0.7 higher
- **Conversation-Seed flag** will surface on ~30-40% of borderline rows (2.5–3.4) at large enterprises, giving Daniel explicit apply/skip decision points instead of silent SKIPs
- **Block G** will run faster (theater analysis removed) and produce actionable Verify flags rather than score noise
- **Dead-URL roles** will short-circuit instead of fabricating archetype scores from inferred JDs (the 327/371 fabrication failure should not recur)
- **Dedup misses** like "Crowe LLP" vs "Crowe" should now be caught automatically

## Items NOT addressed in this calibration

- **#371 BDO** — user explicitly held for separate discussion as a special case
- **3.0+ tier validation** — score-validation conversation deferred until next week's run uses the new logic
- **Microsoft #377 (AI Ecosystem Readiness)** — URL disappeared; logged as SKIP, can be revisited if posting reappears
