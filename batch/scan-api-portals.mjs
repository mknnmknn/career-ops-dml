#!/usr/bin/env node
// Portals-driven API scanner — zero-token pass
// Reads portals.yml tracked_companies, hits Greenhouse/Ashby/Lever APIs,
// filters by title + location + deal-breakers, dedups against history,
// writes candidates TSV.
//
// Infers API endpoint from careers_url when an explicit `api:` field is absent.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = 'C:/Users/danie/Dropbox/claudeCodex/JobSearch/career-ops-dml';
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// --- Load portals.yml ---
const portals = yaml.load(fs.readFileSync(path.join(ROOT, 'portals.yml'), 'utf8'));
const titleFilter = portals.title_filter || {};
const POSITIVE = titleFilter.positive || [];
const NEGATIVE = titleFilter.negative || ["Junior", "Intern"];

// --- Derive (provider, slug, api) for each tracked company ---
function deriveApi(entry) {
  // 1. Explicit api field wins
  if (entry.api) {
    if (entry.api.includes('greenhouse.io')) {
      const slug = entry.api.match(/\/boards\/([^/]+)\/jobs/)?.[1];
      return { provider: 'greenhouse', slug, api: entry.api };
    }
    if (entry.api.includes('ashbyhq.com')) {
      const slug = entry.api.match(/\/job-board\/([^?]+)/)?.[1];
      return { provider: 'ashby', slug, api: entry.api };
    }
    if (entry.api.includes('lever.co')) {
      const slug = entry.api.match(/\/postings\/([^?]+)/)?.[1];
      return { provider: 'lever', slug, api: entry.api };
    }
  }
  // 2. Infer from careers_url
  const url = entry.careers_url || '';
  if (url.includes('job-boards.greenhouse.io') || url.includes('boards.greenhouse.io')) {
    const slug = url.split('greenhouse.io/')[1]?.split(/[?#/]/)[0];
    if (slug) return { provider: 'greenhouse', slug, api: `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` };
  }
  if (url.includes('jobs.ashbyhq.com')) {
    const slug = url.split('ashbyhq.com/')[1]?.split(/[?#/]/)[0];
    if (slug) return { provider: 'ashby', slug, api: `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true` };
  }
  if (url.includes('jobs.lever.co')) {
    const slug = url.split('jobs.lever.co/')[1]?.split(/[?#/]/)[0];
    if (slug) return { provider: 'lever', slug, api: `https://api.lever.co/v0/postings/${slug}?mode=json` };
  }
  if (url.includes('myworkdayjobs.com')) {
    // https://{company}.{shard}.myworkdayjobs.com/{site}
    try {
      const parsed = new URL(url);
      const hostMatch = parsed.hostname.match(/^([^.]+)\.([^.]+)\.myworkdayjobs\.com$/);
      const pathMatch = parsed.pathname.match(/^\/([^/?#]+)/);
      if (hostMatch && pathMatch) {
        const [, company, shard] = hostMatch;
        const site = pathMatch[1];
        const api = `https://${company}.${shard}.myworkdayjobs.com/wday/cxs/${company}/${site}/jobs`;
        return { provider: 'workday', slug: `${company}-${site}`, api, workdayHost: `${company}.${shard}.myworkdayjobs.com` };
      }
    } catch { /* ignore */ }
  }
  return null; // Not API-scannable (manual or unrecognized ATS)
}

const tracked = (portals.tracked_companies || []).filter(c => c.enabled !== false);
const apiCompanies = [];
const nonApi = [];
for (const entry of tracked) {
  const derived = deriveApi(entry);
  if (derived) apiCompanies.push({ ...entry, ...derived, tag: `${derived.provider}-api-${derived.slug}` });
  else nonApi.push(entry.name);
}

// --- Filters ---
const LOC_REJECT = [
  "london","paris","berlin","munich","amsterdam","dublin","barcelona","madrid","lisbon","stockholm","oslo","helsinki","copenhagen","zurich","geneva",
  "tokyo","osaka","kyoto","singapore","hong kong","seoul","beijing","shanghai","shenzhen","taipei","bangalore","bengaluru","mumbai","delhi","hyderabad","chennai","pune","kolkata",
  "sydney","melbourne","auckland","wellington","dubai","abu dhabi","tel aviv","istanbul","moscow","warsaw","prague","vienna",
  "são paulo","sao paulo","rio de janeiro","mexico city","buenos aires","bogota","bogotá","lima","santiago",
  "cairo","johannesburg","cape town","lagos","nairobi","toronto","vancouver","montreal","ottawa","calgary",
  "philippines","manila","malaysia","kuala lumpur","jakarta","bangkok","ho chi minh","hanoi",
  "united kingdom","uk only","germany","france","italy","spain","netherlands","belgium","switzerland","sweden","norway","denmark","finland","ireland","portugal","poland","austria",
  "japan","india","china","australia","new zealand","brazil","mexico","canada","south africa","egypt","nigeria","argentina","colombia","chile",
  "emea","apac","latam","anz",
];

const DEFENSE = ["lockheed","raytheon","northrop","bae systems","general dynamics","l3harris","saic","booz allen","leidos","caci"];

function titlePasses(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  if (NEGATIVE.some(n => t.includes(n.toLowerCase()))) return false;
  return POSITIVE.some(p => t.includes(p.toLowerCase()));
}

function locationPasses(loc) {
  if (!loc) return true;
  const l = loc.toLowerCase();
  const usSignals = ["remote - us","remote, us","us-remote","us remote","remote us","united states","usa","u.s.","u.s.a","new york","nyc","ny metro","washington, dc","washington dc","houston","texas","tx","san francisco","los angeles","chicago","boston","atlanta","seattle","miami","denver","austin","americas","north america","anywhere","remote, united states","remote (us)"];
  if (usSignals.some(a => l.includes(a))) return true;
  if (LOC_REJECT.some(r => l.includes(r))) return false;
  if (l.includes("remote") || l.includes("global")) return true;
  return true;
}

function dealBreaker(company) {
  const c = company.toLowerCase();
  return DEFENSE.some(d => c.includes(d));
}

// --- Dedup sources ---
const histPath = path.join(ROOT, 'data/scan-history.tsv');
const pipePath = path.join(ROOT, 'data/pipeline.md');
const appsPath = path.join(ROOT, 'data/applications.md');

const histUrls = new Set();
if (fs.existsSync(histPath)) {
  for (const line of fs.readFileSync(histPath, 'utf8').split('\n').slice(1)) {
    const url = line.split('\t')[0];
    if (url) {
      histUrls.add(url);
      histUrls.add(url.endsWith('/') ? url.slice(0,-1) : url + '/');
    }
  }
}
const pipelineText = fs.existsSync(pipePath) ? fs.readFileSync(pipePath, 'utf8') : '';
const appsText = fs.existsSync(appsPath) ? fs.readFileSync(appsPath, 'utf8').toLowerCase() : '';

function inPipeline(url) {
  if (!pipelineText) return false;
  if (pipelineText.includes(url)) return true;
  if (url.endsWith('/') && pipelineText.includes(url.slice(0,-1))) return true;
  if (!url.endsWith('/') && pipelineText.includes(url + '/')) return true;
  return false;
}
function pairInApps(company, role) {
  if (!appsText) return false;
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
  const c = norm(company);
  const r = norm(role);
  for (const line of appsText.split('\n')) {
    if (line.includes(c) && line.includes(r)) return true;
  }
  return false;
}

// --- Fetch with timeout ---
async function fetchJson(url, label) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'career-ops-scanner/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      failures.push(`${label}: HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    failures.push(`${label}: ${e.message}`);
    return null;
  }
}

// --- Workday-specific: POST with pagination ---
async function fetchWorkdayJobs(apiUrl, host, label) {
  const all = [];
  const LIMIT = 20; // Workday tenants reject limit > 20 with HTTP 400
  let offset = 0;
  let totalSeen = 0;
  let reportedTotal = null; // captured from first response; subsequent responses have total=0
  try {
    while (true) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'career-ops-scanner/1.0',
        },
        body: JSON.stringify({ appliedFacets: {}, limit: LIMIT, offset, searchText: '' }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        failures.push(`${label}: HTTP ${res.status} (offset=${offset})`);
        return all.length ? all : null;
      }
      const data = await res.json();
      // Capture reported total from the FIRST response only — subsequent pages return total:0
      if (reportedTotal === null && typeof data.total === 'number' && data.total > 0) {
        reportedTotal = data.total;
      }
      const postings = data.jobPostings || [];
      if (postings.length === 0) break;
      all.push(...postings);
      totalSeen += postings.length;
      offset += LIMIT;
      // Primary exit: last page is typically a partial page
      if (postings.length < LIMIT) break;
      // Secondary exit: total known and reached
      if (reportedTotal !== null && offset >= reportedTotal) break;
      // Guard against runaway loops
      if (totalSeen > 2000) {
        failures.push(`${label}: pagination safety break at ${totalSeen} jobs`);
        break;
      }
    }
    // Dedup by externalPath — Workday pagination overlaps when job order shifts
    const byPath = new Map();
    for (const p of all) {
      const key = p.externalPath || p.title;
      if (!byPath.has(key)) byPath.set(key, p);
    }
    return [...byPath.values()];
  } catch (e) {
    failures.push(`${label}: ${e.message}`);
    return all.length ? all : null;
  }
}

const failures = [];
const stats = { attempted: 0, raw: 0, afterTitle: 0, afterLoc: 0, afterDealbreak: 0, afterDedup: 0 };
const perCompanyRaw = {};
const candidates = [];

// --- Main scan loop ---
for (const c of apiCompanies) {
  stats.attempted++;

  let data = null;
  let jobs = [];
  if (c.provider === 'workday') {
    const postings = await fetchWorkdayJobs(c.api, c.workdayHost, `${c.name} (workday)`);
    if (!postings) continue;
    jobs = postings;
  } else {
    data = await fetchJson(c.api, `${c.name} (${c.provider})`);
    if (!data) continue;
    if (c.provider === 'greenhouse') jobs = data.jobs || [];
    else if (c.provider === 'ashby') jobs = data.jobs || [];
    else if (c.provider === 'lever') jobs = Array.isArray(data) ? data : [];
  }

  perCompanyRaw[c.name] = jobs.length;
  stats.raw += jobs.length;

  for (const j of jobs) {
    let title, jobUrl, locStr;
    if (c.provider === 'greenhouse') {
      title = j.title;
      jobUrl = j.absolute_url;
      locStr = j.location?.name || '';
    } else if (c.provider === 'ashby') {
      title = j.title;
      jobUrl = j.jobUrl;
      const locParts = [];
      if (j.location) locParts.push(j.location);
      if (j.secondaryLocations && Array.isArray(j.secondaryLocations)) {
        for (const sl of j.secondaryLocations) locParts.push(sl.location || sl);
      }
      if (j.isRemote) locParts.push('Remote');
      locStr = locParts.filter(Boolean).join(', ');
    } else if (c.provider === 'lever') {
      title = j.text;
      jobUrl = j.hostedUrl || j.applyUrl;
      locStr = j.categories?.location || '';
    } else if (c.provider === 'workday') {
      title = j.title;
      // externalPath is like "/job/.../FOO_R12345"; build full URL
      if (j.externalPath) jobUrl = `https://${c.workdayHost}${j.externalPath}`;
      else jobUrl = null;
      locStr = j.locationsText || j.primaryLocation || '';
    }

    if (!titlePasses(title)) continue;
    stats.afterTitle++;
    if (!locationPasses(locStr)) continue;
    stats.afterLoc++;
    if (dealBreaker(c.name)) continue;
    stats.afterDealbreak++;

    // Dedup
    if (histUrls.has(jobUrl) || histUrls.has(jobUrl + '/') || histUrls.has(jobUrl?.replace(/\/$/,''))) continue;
    if (inPipeline(jobUrl)) continue;
    if (pairInApps(c.name, title)) continue;
    stats.afterDedup++;

    candidates.push({ url: jobUrl, company: c.name, role: title, location: locStr || 'Unspecified', tag: c.tag });
  }
}

// --- Write TSV ---
const outPath = path.join(ROOT, `batch/scan-candidates-${TODAY}.tsv`);
const tsvLines = candidates.map(c => [c.url, c.company, c.role, c.location, c.tag, TODAY].join('\t'));
fs.writeFileSync(outPath, tsvLines.join('\n') + (tsvLines.length ? '\n' : ''), 'utf8');

// --- Report ---
console.log(JSON.stringify({
  date: TODAY,
  apiCompaniesScanned: apiCompanies.length,
  nonApiCompaniesSkipped: nonApi.length,
  stats,
  candidateCount: candidates.length,
  candidates,
  perCompanyRaw,
  failures,
  outputFile: outPath,
  nonApiSkipped: nonApi,
}, null, 2));
