# Manual Scans Checklist

Companies in `portals.yml` that require manual / browser-based fetch.
These are tagged `scan_method: manual` and skipped by the API and WebSearch subagents.

**Use during Monday hunt.** For each interesting role:
1. Copy JD text
2. Paste into `data/pipeline_import.md` separated by `---`
3. Run `node import-jds.mjs` to inject into pipeline.md

**Last updated:** 2026-04-20 (30 entries)

---

## By ATS type — scanner feasibility

| ATS | Count | Scanner status |
|---|---|---|
| Oracle HCM | 2 | Not built — build `scan-oracle-hcm.mjs` when count hits 3+ |
| Salesforce Sites | 1 | Not built — build when count hits 3+ |
| ADP | 1 | Not built — build when count hits 3+ |
| UltiPro | 1 | Not built — build when count hits 3+ |
| ApplicantPro | 1 | Not built — build when count hits 3+ |
| Idealist (aggregator) | 1 | Playwright-only; manual for now |
| Custom careers pages | 23 | Always manual (each is bespoke) |
| **Total** | **30** | |

---

## Oracle HCM (2) — *2 away from warranting a scanner*

- [BDO USA](https://ebqb.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/BDOExperiencedCareers) — consulting, Houston presence
- [Rice University](https://emdz.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001) — Houston, academic

## Salesforce Sites (1)

- [Slalom](https://slalom.my.salesforce-sites.com/careers) — consulting

## ADP Recruiting (1)

- [Audubon Companies](https://myjobs.adp.com/auduboncorporatecareers/cx) — Houston, energy/consulting

## UltiPro (1)

- [LJA Engineering](https://recruiting2.ultipro.com/LJA1000LIAE/JobBoard/d412e071-8074-41d9-90fd-4429decd075e/) — Houston engineering services

## ApplicantPro (1)

- [University of St. Thomas](https://stthom.applicantpro.com/jobsearch/?job_board_classification=Staff_Professional) — Houston, academic

## Aggregator — Idealist (1) — nonprofit sector

- [Idealist (nonprofits, narrowed filter)](https://www.idealist.org/en/jobs?functions=TECHNOLOGY_IT&functions=STRATEGY_PLANNING&functions=DATA_EVALUATION_ANALYSIS&functions=OPERATIONS&functions=PROGRAM_MANAGEMENT&professionalLevel=DIRECTOR&professionalLevel=EXECUTIVE&jobType=FULL_TIME&orgType=NONPROFIT&locale=en&radius=100000)

---

## Custom careers pages (23)

### Contact center & comms vendors (5)

- [Five9](https://www.five9.com/company/careers)
- [Talkdesk](https://www.talkdesk.com/about/careers)
- [Dialpad](https://www.dialpad.com/about/careers)
- [Avaya](https://www.avaya.com/en/about-avaya/careers)
- [RingCentral](https://www.ringcentral.com/us/en/careers.html)

### Consulting & professional services (2)

- [Improving](https://www.improving.com/careers/open-positions/#openpositions)
- [Netsmart Technologies](https://www.ntst.com/careers) — health IT

### Job aggregator — tech-focused (1)

- [TechJobsForGood](https://www.techjobsforgood.com/jobs/?job_function=Software+Engineering&job_function=Data+%2B+Analytics&job_function=Product&job_function=Information+Technology&job_function=Other&q=)

### Houston regional employers (14) — *highest target relevance*

- [Fairway Home Mortgage](https://www.fairwayindependentmc.com/about/careers) — residential lending
- [Camden Property Trust](https://www.camdenliving.com/about/careers) — multifamily REIT
- [Hunton Group](https://www.huntongroup.com/careers) — HVAC distribution
- [Harris Central Appraisal District](https://hcad.org/about/employment) — county government IT
- [Central Bank](https://www.centralbank.net/about/careers) — regional bank
- [DataVox](https://www.datavox.net/careers) — AV / collaboration IT
- [Magnolia Oil & Gas](https://www.magnoliaoilgas.com/careers) — upstream E&P
- [Ally Medical ER](https://www.allymedical.com/careers) — emergency healthcare
- [PCCA](https://www.pccarx.com/careers) — pharmacy / compounding
- [Colliers International Houston](https://www.colliers.com/en-us/careers) — commercial real estate
- [EEPB](https://www.eepb.com/careers) — accounting / advisory
- [Enverus](https://www.enverus.com/career-opportunities/) — energy software / SaaS

### Other (1)

- [Qubika](https://qubika.com/careers/#job-openings-anchor) — nearshore software services

---

## Triggers to build a new scanner

When the count in any single ATS group reaches **3 or more**, evaluate building a dedicated scanner (following the `scan-workday.mjs` pattern):

- **Oracle HCM** → 2 today (BDO, Rice). One more Oracle HCM company triggers it.
- **Salesforce Sites** → 1 today (Slalom).
- **ADP** → 1 today (Audubon).
- **UltiPro** → 1 today (LJA). Note: LJA uses a per-job-board GUID URL; selectors likely more stable than "recruiting2.ultipro.com" in general.
- **ApplicantPro** → 1 today (USt Thomas).

Track new additions via `node classify-careers.mjs` — the classifier reports ATS type, so when two+ companies share an ATS, the signal is obvious.
