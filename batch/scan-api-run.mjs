#!/usr/bin/env node
// One-off API scanner for 2026-04-20 run — Daniel M. Levine
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/danie/Dropbox/claudeCodex/JobSearch/career-ops-dml';
const TODAY = '2026-04-20';

const COMPANIES = [
  { name: 'Twilio',   provider: 'greenhouse', slug: 'twilio',      tag: 'greenhouse-api-twilio' },
  { name: 'Glean',    provider: 'greenhouse', slug: 'gleanwork',   tag: 'greenhouse-api-glean' },
  { name: 'Celonis',  provider: 'greenhouse', slug: 'celonis',     tag: 'greenhouse-api-celonis' },
  { name: 'Airtable', provider: 'greenhouse', slug: 'airtable',    tag: 'greenhouse-api-airtable' },
  { name: 'NTT DATA (Americas)', provider: 'greenhouse', slug: 'nttdatausa', tag: 'greenhouse-api-nttdatausa' },
  { name: 'NerdWallet', provider: 'ashby',    slug: 'nerdwallet',  tag: 'ashby-api-nerdwallet' },
  { name: 'Deel',     provider: 'ashby',      slug: 'deel',        tag: 'ashby-api-deel' },
];

// Title filter from portals.yml
const POSITIVE = [
  "Chief Technology Officer","CTO","Chief Information Officer","CIO","VP of Technology","VP Technology",
  "VP of IT","VP IT","Vice President of Technology","Vice President of IT","SVP Technology","SVP of Technology",
  "Director of Technology","Director of IT","IT Director","Head of Technology","Head of IT","Technology Director",
  "Director of Enterprise Applications","Director of Enterprise Technology","Director of Information Technology",
  "Chief AI Officer","CAIO","VP of AI","VP AI","VP, AI","SVP, AI","SVP AI","Head of AI","Head of Artificial Intelligence",
  "AI Strategy","AI Transformation","Chief Digital Officer","CDO","Head of Digital","VP of Digital","Digital Transformation",
  "Director of AI","Director, AI","Director AI","Director of Artificial Intelligence","AI Program Director","AI Program","AI Leadership",
  "Enterprise Architect","Solutions Architect","Principal Architect","Chief Architect","Director of Architecture",
  "Head of Architecture","Practice Lead","Practice Director","Program Director","IT Architecture",
  "VP of Engineering","VP Engineering","SVP Engineering","SVP of Engineering","Director of Engineering","Head of Engineering",
  "Head of Software","VP of Software","VP Software","Chief Software Officer","Engineering Director",
  "VP, Engineering","VP, Technology","VP, Software","SVP, Engineering","SVP, Technology","Director, Engineering","Director, Technology",
  "Senior Director",
  "Chief Data Officer","VP of Data","VP Data","VP, Data","Head of Data","Director of Data","Director, Data",
  "VP of Analytics","VP Analytics","VP, Analytics","Head of Analytics","Director of Analytics","Director, Analytics",
  "Head of Data & Analytics","Head of Data Strategy","VP of Data & Analytics","Chief Data and Analytics","Director Analytics","Director Data",
];
const NEGATIVE = ["Junior","Intern"];

// Location reject list (clear non-US, non-remote, non-target)
const LOC_REJECT = [
  "london","paris","berlin","munich","amsterdam","dublin","barcelona","madrid","lisbon","stockholm","oslo","helsinki","copenhagen","zurich","geneva",
  "tokyo","osaka","kyoto","singapore","hong kong","seoul","beijing","shanghai","shenzhen","taipei","bangalore","bengaluru","mumbai","delhi","hyderabad","chennai","pune","kolkata",
  "sydney","melbourne","auckland","wellington",
  "dubai","abu dhabi","tel aviv","istanbul","moscow","warsaw","prague","vienna",
  "são paulo","sao paulo","rio de janeiro","mexico city","buenos aires","bogota","bogotá","lima","santiago",
  "cairo","johannesburg","cape town","lagos","nairobi",
  "toronto","vancouver","montreal","ottawa","calgary",
  "philippines","manila","malaysia","kuala lumpur","jakarta","bangkok","ho chi minh","hanoi",
  // EU/UK/APAC/AU/CA country-level
  "united kingdom","uk only","germany","france","italy","spain","netherlands","belgium","switzerland","sweden","norway","denmark","finland","ireland","portugal","poland","austria",
  "japan","india","china","australia","new zealand","brazil","mexico","canada","south africa","egypt","nigeria","argentina","colombia","chile",
  "emea","apac","latam","anz",
];

const DEFENSE = ["lockheed","raytheon","northrop","bae systems","general dynamics","l3harris","saic","booz allen","leidos","caci"];

const failures = [];

async function fetchJson(url, label) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'career-ops-scanner/1.0' } });
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

function titlePasses(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  const neg = NEGATIVE.some(n => t.includes(n.toLowerCase()));
  if (neg) return false;
  return POSITIVE.some(p => t.includes(p.toLowerCase()));
}

function locationPasses(loc) {
  if (!loc) return true; // unspecified → include
  const l = loc.toLowerCase();
  // US-specific signals (bare "remote" is NOT enough — "Remote - Brazil" must fail)
  const usSignals = ["remote - us","remote, us","us-remote","us remote","remote us","united states","usa","u.s.","u.s.a","new york","nyc","ny metro","washington, dc","washington dc","houston","texas","tx","san francisco","los angeles","chicago","boston","atlanta","seattle","miami","denver","austin","americas","north america","anywhere","remote, united states","remote (us)"];
  const hasUS = usSignals.some(a => l.includes(a));
  const hasReject = LOC_REJECT.some(r => l.includes(r));
  if (hasUS) return true;            // US present → keep regardless of other regions
  if (hasReject) return false;       // non-target region without US signal → reject
  // Bare "remote" with no geography signal → include (ambiguous)
  if (l.includes("remote") || l.includes("global")) return true;
  return true; // truly ambiguous → include
}

function dealBreaker(company) {
  const c = company.toLowerCase();
  return DEFENSE.some(d => c.includes(d));
}

// Load dedup sources
const histPath = path.join(ROOT, 'data/scan-history.tsv');
const pipePath = path.join(ROOT, 'data/pipeline.md');
const appsPath = path.join(ROOT, 'data/applications.md');

const histUrls = new Set();
for (const line of fs.readFileSync(histPath, 'utf8').split('\n').slice(1)) {
  const url = line.split('\t')[0];
  if (url) {
    histUrls.add(url);
    histUrls.add(url.endsWith('/') ? url.slice(0,-1) : url + '/');
  }
}
const pipelineText = fs.readFileSync(pipePath, 'utf8');
const appsText = fs.readFileSync(appsPath, 'utf8').toLowerCase();

function inPipeline(url) {
  // match URL or URL w/wo trailing slash
  if (pipelineText.includes(url)) return true;
  if (url.endsWith('/') && pipelineText.includes(url.slice(0,-1))) return true;
  if (!url.endsWith('/') && pipelineText.includes(url + '/')) return true;
  return false;
}
function pairInApps(company, role) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
  const c = norm(company);
  const r = norm(role);
  // The apps table is "| # | date | company | role | ..." — check if both tokens appear on same line
  for (const line of appsText.split('\n')) {
    if (line.includes(c) && line.includes(r)) return true;
  }
  return false;
}

// Counters
const stats = { attempted: 0, raw: 0, afterTitle: 0, afterLoc: 0, afterDealbreak: 0, afterDedup: 0 };
const perCompanyRaw = {};
const candidates = []; // { url, company, role, location, tag }

for (const c of COMPANIES) {
  stats.attempted++;
  let url;
  if (c.provider === 'greenhouse') url = `https://boards-api.greenhouse.io/v1/boards/${c.slug}/jobs`;
  else if (c.provider === 'ashby') url = `https://api.ashbyhq.com/posting-api/job-board/${c.slug}?includeCompensation=true`;
  const data = await fetchJson(url, `${c.name} (${c.provider})`);
  if (!data) continue;

  let jobs = [];
  if (c.provider === 'greenhouse') jobs = data.jobs || [];
  else if (c.provider === 'ashby') jobs = data.jobs || [];

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
    }

    if (!titlePasses(title)) continue;
    stats.afterTitle++;

    if (!locationPasses(locStr)) continue;
    stats.afterLoc++;

    if (dealBreaker(c.name)) continue;
    stats.afterDealbreak++;

    // Dedup
    if (histUrls.has(jobUrl) || histUrls.has(jobUrl + '/') || histUrls.has(jobUrl.replace(/\/$/,''))) continue;
    if (inPipeline(jobUrl)) continue;
    if (pairInApps(c.name, title)) continue;
    stats.afterDedup++;

    candidates.push({ url: jobUrl, company: c.name, role: title, location: locStr || 'Unspecified', tag: c.tag });
  }
}

// Write TSV
const outPath = path.join(ROOT, 'batch/scan-candidates-api.tsv');
const lines = candidates.map(c => [c.url, c.company, c.role, c.location, c.tag, TODAY].join('\t'));
fs.writeFileSync(outPath, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');

// Emit report JSON to stdout
console.log(JSON.stringify({ stats, perCompanyRaw, candidates, failures }, null, 2));
