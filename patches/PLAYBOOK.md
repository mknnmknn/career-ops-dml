# career-ops-dml — Local Operations Playbook

This document is the authoritative reference for **local divergences, custom tools, and weekly workflow** in Daniel's fork of career-ops. Future Claude sessions should read this file when asked about "what tools do we have", "what to run each week", or "how does the scanner work here specifically".

Related files:
- `patches/README.md` — record of modifications to upstream system-layer files (archetype taxonomy, report header, Go UI, scan-api-portals Workday adapter)
- `modes/_profile.md` — user-layer personalization (archetypes, proof-points, operating model, anti-patterns)
- `modes/scan_en.md` — English translation of `modes/scan.md` with practice-vs-spec annotations
- `DATA_CONTRACT.md` — which files are system-layer vs. user-layer (maintained upstream)

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

All other scripts in `batch/` (recon-portals, analyze-scan-history, manual-scan-status, add-report-number) are local-only; they don't exist upstream.

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
