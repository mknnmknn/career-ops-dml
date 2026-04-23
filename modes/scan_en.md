# Mode: scan — Portal Scanner (Offer Discovery)

*English translation of `modes/scan.md` with practice-vs-spec annotations. This file is user-layer (not in `update-system.mjs` SYSTEM_PATHS), so it persists across upstream updates. If `scan.md` is updated upstream, re-sync this file manually.*

Scans configured job portals, filters by title relevance, and adds new offers to the pipeline for later evaluation.

## Recommended execution

Run as a sub-agent so as not to consume main context:

```
Agent(
    subagent_type="general-purpose",
    prompt="[contents of this file + specific data]",
    run_in_background=True
)
```

## Configuration

Read `portals.yml`, which contains:

- `search_queries`: List of WebSearch queries with `site:` filters per portal (broad discovery)
- `tracked_companies`: Specific companies with `careers_url` for direct navigation
- `title_filter`: Positive/negative/seniority_boost keywords for title filtering

## Discovery strategy (3 levels)

### Level 1 — Direct Playwright (labeled PRINCIPAL in spec)

**For each company in `tracked_companies`:** Navigate to its `careers_url` using Playwright (`browser_navigate` + `browser_snapshot`), read ALL visible job listings, and extract title + URL. This is the most reliable method in principle because:

- Sees the page in real time (not Google-cached results)
- Works with SPAs (Ashby, Lever, Workday)
- Detects new offers instantly
- Doesn't depend on Google indexing

**Every company MUST have `careers_url` in portals.yml.** If missing, find it once, save it, and use in future scans.

> **Practice note (2026-04-22):** Daniel's `scan-history.tsv` shows L1 Playwright contributes ~17% of pipeline additions despite being labeled PRINCIPAL. This is because L1 requires an interactive Claude session with browser tools and is slow (sequential, high context cost). In practice L3 WebSearch is the larger volume contributor. L1 remains the most real-time and highest-fidelity method when actually run.

### Level 2 — ATS APIs / Feeds (COMPLEMENTARY)

For companies with public APIs or structured feeds, use the JSON/XML response as a fast complement to Level 1. Faster than Playwright, reduces visual-scraping errors, **zero LLM tokens** (pure HTTP fetch).

**Current support (variables in `{}`):**

- **Greenhouse:** `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
- **Ashby:** `https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams`
- **BambooHR:** list `https://{company}.bamboohr.com/careers/list`; single posting detail `https://{company}.bamboohr.com/careers/{id}/detail`
- **Lever:** `https://api.lever.co/v0/postings/{company}?mode=json`
- **Teamtailor:** `https://{company}.teamtailor.com/jobs.rss`
- **Workday:** `https://{company}.{shard}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs`

**Parsing conventions by provider:**

- `greenhouse`: `jobs[]` → `title`, `absolute_url`
- `ashby`: GraphQL `ApiJobBoardWithTeams` with `organizationHostedJobsPageName={company}` → `jobBoard.jobPostings[]` (`title`, `id`; build public URL if not in payload)
- `bamboohr`: list `result[]` → `jobOpeningName`, `id`; build detail URL `https://{company}.bamboohr.com/careers/{id}/detail`; for full JD, GET the detail and use `result.jobOpening` (`jobOpeningName`, `description`, `datePosted`, `minimumExperience`, `compensation`, `jobOpeningShareUrl`)
- `lever`: root array `[]` → `text`, `hostedUrl` (fallback: `applyUrl`)
- `teamtailor`: RSS items → `title`, `link`
- `workday`: `jobPostings[]`/`jobPostings` (depending on tenant) → `title`, `externalPath` or URL built from host

> **Practice note:** L2 has the highest precision of any broad-coverage method in Daniel's history — 74% pass rate (39 added / 53 seen). When a company has a public API endpoint, what comes back is overwhelmingly relevant. Zero token cost makes this the lowest-overhead scanner to run on schedule.

### Level 3 — WebSearch queries (BROAD DISCOVERY, labeled last resort in spec)

The `search_queries` with `site:` filters cover portals transversally (all Ashby postings, all Greenhouse, etc.). Useful for discovering NEW companies not yet in `tracked_companies`, but results can be stale.

**Execution priority (per spec):**

1. Level 1: Playwright → all `tracked_companies` with `careers_url`
2. Level 2: API → all `tracked_companies` with `api:` endpoint
3. Level 3: WebSearch → all `search_queries` with `enabled: true`

Levels are additive — all execute, results merge and dedup.

> **Practice note:** Despite "last resort" framing, L3 is actually the single largest contributor to Daniel's pipeline (~47% of historical additions). Worth knowing because if Google indexing or WebSearch changes, the pipeline could quietly slow. Expiration rate: 10% of L3 results are dead on arrival (Google shows cached results for closed postings), hence the Playwright liveness verification in step 7.5 below.

## Workflow

1. **Read configuration:** `portals.yml`
2. **Read history:** `data/scan-history.tsv` → URLs already seen
3. **Read dedup sources:** `data/applications.md` + `data/pipeline.md`

4. **Level 1 — Playwright scan** (parallel in batches of 3–5):
   For each company in `tracked_companies` with `enabled: true` and a defined `careers_url`:
   a. `browser_navigate` to `careers_url`
   b. `browser_snapshot` to read all job listings
   c. If the page has filters/departments, navigate relevant sections
   d. For each listing extract: `{title, url, company}`
   e. If results are paginated, navigate additional pages
   f. Accumulate candidates
   g. If `careers_url` fails (404, redirect), try `scan_query` as fallback and note for URL update

5. **Level 2 — ATS APIs / feeds** (parallel):
   For each company in `tracked_companies` with `api:` defined and `enabled: true`:
   a. Fetch the API/feed URL
   b. If `api_provider` is defined, use its parser; otherwise infer from domain
   c. **Ashby:** POST with `operationName: ApiJobBoardWithTeams`, `variables.organizationHostedJobsPageName: {company}`, GraphQL query `jobBoardWithTeams` + `jobPostings { id title locationName employmentType compensationTierSummary }`
   d. **BambooHR:** list only has basic metadata. For each relevant item, GET `https://{company}.bamboohr.com/careers/{id}/detail`, extract JD from `result.jobOpening`. Use `jobOpeningShareUrl` if present; otherwise the detail URL
   e. **Workday:** POST JSON with at least `{"appliedFacets":{},"limit":20,"offset":0,"searchText":""}`, paginate by `offset` until exhausted
   f. Normalize each job: `{title, url, company}`
   g. Accumulate (dedup with Level 1)

6. **Level 3 — WebSearch queries** (parallel if possible):
   For each query in `search_queries` with `enabled: true`:
   a. Run WebSearch with the defined `query`
   b. Extract from each result: `{title, url, company}`
      - **title:** from the result title (before " @ " or " | ")
      - **url:** result URL
      - **company:** after " @ " in the title, or extracted from domain/path
   c. Accumulate (dedup with Level 1+2)

7. **Title filter** using `title_filter` from `portals.yml`:
   - At least 1 keyword from `positive` must appear in the title (case-insensitive)
   - 0 keywords from `negative` must appear
   - `seniority_boost` keywords give priority but aren't required

8. **Dedup** against 3 sources:
   - `scan-history.tsv` → exact URL already seen
   - `applications.md` → normalized company + role already evaluated
   - `pipeline.md` → exact URL already pending or processed

9. **Liveness verification for Level 3 results** — BEFORE adding to pipeline:

   WebSearch results can be stale (Google caches for weeks to months). Verify each new Level 3 URL with Playwright to avoid evaluating expired postings. Levels 1 and 2 are inherently real-time and don't require this verification.

   For each new Level 3 URL (sequential — NEVER Playwright in parallel):
   a. `browser_navigate` to the URL
   b. `browser_snapshot` to read content
   c. Classify:
      - **Active:** job title visible + role description + visible Apply/Submit control in main content. Don't count generic header/navbar/footer text.
      - **Expired** (any of these signals):
        - Final URL contains `?error=true` (Greenhouse redirects this way when closed)
        - Page contains: "job no longer available" / "no longer open" / "position has been filled" / "this job has expired" / "page not found"
        - Only navbar and footer visible, no JD content (content < ~300 chars)
   d. If expired: record in `scan-history.tsv` with status `skipped_expired` and discard
   e. If active: continue to step 10

   **Don't abort the whole scan if a URL fails.** If `browser_navigate` errors (timeout, 403, etc.), mark as `skipped_expired` and continue.

10. **For each new verified offer that passes filters:**
    a. Add to `pipeline.md` "Pending" section: `- [ ] {url} | {company} | {title}`
    b. Record in `scan-history.tsv`: `{url}\t{date}\t{query_name}\t{title}\t{company}\tadded`

11. **Offers filtered by title:** record in `scan-history.tsv` with status `skipped_title`
12. **Duplicate offers:** record with status `skipped_dup`
13. **Expired offers (Level 3):** record with status `skipped_expired`

## Title/company extraction from WebSearch results

Results come in formats like `"Job Title @ Company"`, `"Job Title | Company"`, or `"Job Title — Company"`.

Per-portal extraction patterns:

- **Ashby:** `"Senior AI PM (Remote) @ EverAI"` → title: `Senior AI PM`, company: `EverAI`
- **Greenhouse:** `"AI Engineer at Anthropic"` → title: `AI Engineer`, company: `Anthropic`
- **Lever:** `"Product Manager - AI @ Temporal"` → title: `Product Manager - AI`, company: `Temporal`

Generic regex: `(.+?)(?:\s*[@|—–-]\s*|\s+at\s+)(.+?)$`

## Private URLs

If a URL is found that's not publicly accessible:

1. Save the JD to `jds/{company}-{role-slug}.md`
2. Add to pipeline.md as: `- [ ] local:jds/{company}-{role-slug}.md | {company} | {title}`

## Scan History

`data/scan-history.tsv` tracks ALL URLs seen:

```
url	first_seen	portal	title	company	status
https://...	2026-02-10	Ashby — AI PM	PM AI	Acme	added
https://...	2026-02-10	Greenhouse — SA	Junior Dev	BigCo	skipped_title
https://...	2026-02-10	Ashby — AI PM	SA AI	OldCo	skipped_dup
https://...	2026-02-10	WebSearch — AI PM	PM AI	ClosedCo	skipped_expired
```

**Silent-failure limitation:** scan-history only records URLs actually *seen*. A company whose scan silently returns zero results (wrong careers_url, broken API, stale query) produces no history entries — indistinguishable from "company has no relevant jobs right now." Use `batch/analyze-scan-history.mjs` to surface tracked companies with no scan-history entries as a silent-failure audit.

## Output summary

```
Portal Scan — {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Queries run: N
Offers found: N total
Filtered by title: N relevant
Duplicates: N (already evaluated or in pipeline)
Expired discarded: N (dead links, Level 3)
New added to pipeline.md: N

  + {company} | {title} | {query_name}
  ...

→ Run /career-ops pipeline to evaluate the new offers.
```

## Managing careers_url

Every company in `tracked_companies` should have `careers_url` — the direct link to its job listings. This avoids re-searching each time.

**Known patterns by platform:**

- **Ashby:** `https://jobs.ashbyhq.com/{slug}`
- **Greenhouse:** `https://job-boards.greenhouse.io/{slug}` or `https://job-boards.eu.greenhouse.io/{slug}`
- **Lever:** `https://jobs.lever.co/{slug}`
- **BambooHR:** list `https://{company}.bamboohr.com/careers/list`; detail `https://{company}.bamboohr.com/careers/{id}/detail`
- **Teamtailor:** `https://{company}.teamtailor.com/jobs`
- **Workday:** `https://{company}.{shard}.myworkdayjobs.com/{site}`
- **Custom:** The company's own URL (e.g., `https://openai.com/careers`)

**API/feed patterns by platform:**

- **Ashby API:** `https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams`
- **BambooHR API:** list `https://{company}.bamboohr.com/careers/list`; detail (`result.jobOpening`)
- **Lever API:** `https://api.lever.co/v0/postings/{company}?mode=json`
- **Teamtailor RSS:** `https://{company}.teamtailor.com/jobs.rss`
- **Workday API:** `https://{company}.{shard}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs`

**If `careers_url` doesn't exist** for a company:

1. Try the platform's known pattern
2. If that fails, run a quick WebSearch: `"{company}" careers jobs`
3. Navigate with Playwright to confirm it works
4. **Save the found URL to portals.yml** for future scans

**If `careers_url` returns 404 or redirects:**

1. Note in output summary
2. Try scan_query as fallback
3. Flag for manual update

## portals.yml maintenance

- **ALWAYS save `careers_url`** when adding a new company
- Add new queries as you discover portals or interesting roles
- Disable queries with `enabled: false` if they produce too much noise
- Adjust filter keywords as target roles evolve
- Add companies to `tracked_companies` when you want to follow them closely
- **Verify `careers_url` periodically** — companies change ATS platforms
