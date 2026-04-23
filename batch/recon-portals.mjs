#!/usr/bin/env node
// recon-portals.mjs — ATS fingerprinting + portals.yml drift detection
//
// For each enabled company in portals.yml, probes its careers_url,
// fingerprints the ATS from URL and body, and proposes portals.yml
// changes where the configured ATS differs from what's detected.
//
// Usage:
//   node batch/recon-portals.mjs                # dry-run, JSON report
//   node batch/recon-portals.mjs --pretty       # dry-run, pretty-printed
//   node batch/recon-portals.mjs --limit=5      # probe only first N (for testing)
//   node batch/recon-portals.mjs --company=BDO  # probe single company (substring)
//
// Zero LLM tokens; pure HTTP. ~10s timeout per request.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = 'C:/Users/danie/Dropbox/claudeCodex/JobSearch/career-ops-dml';
const PORTALS = path.join(ROOT, 'portals.yml');
const OUT_JSON = path.join(ROOT, 'batch/recon-portals-latest.json');

const args = process.argv.slice(2);
const pretty = args.includes('--pretty');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const companyArg = args.find(a => a.startsWith('--company='));
const COMPANY_FILTER = companyArg ? companyArg.split('=')[1].toLowerCase() : null;

// --- Fingerprint definitions ---
const ATS_FINGERPRINTS = [
  { name: 'greenhouse', urlPattern: /(job-boards\.)?greenhouse\.io/i, bodyPattern: /boards-api\.greenhouse\.io|gh_jid=|greenhouse-iframe/i },
  { name: 'ashby',      urlPattern: /jobs\.ashbyhq\.com/i,            bodyPattern: /ashbyhq|ashby-job/i },
  { name: 'lever',      urlPattern: /jobs\.lever\.co/i,               bodyPattern: /jobs\.lever\.co|lever-job/i },
  { name: 'workday',    urlPattern: /myworkdayjobs\.com/i,            bodyPattern: /myworkdayjobs|wday\/cxs/i },
  { name: 'jobvite',    urlPattern: /jobvite\.com|jobvite\.net/i,     bodyPattern: /jobvite/i },
  { name: 'bamboohr',   urlPattern: /bamboohr\.com\/careers/i,        bodyPattern: /bamboohr\.com/i },
  { name: 'teamtailor', urlPattern: /teamtailor\.com/i,               bodyPattern: /teamtailor/i },
  { name: 'icims',      urlPattern: /icims\.com/i,                    bodyPattern: /icims/i },
  { name: 'smartrecruiters', urlPattern: /smartrecruiters\.com/i,     bodyPattern: /smartrecruiters/i },
  { name: 'taleo',      urlPattern: /taleo\.net/i,                    bodyPattern: /taleo/i },
  { name: 'workable',   urlPattern: /workable\.com/i,                 bodyPattern: /apply\.workable/i },
  { name: 'successfactors', urlPattern: /successfactors\.com/i,       bodyPattern: /successfactors/i },
  { name: 'recruitee',  urlPattern: /recruitee\.com/i,                bodyPattern: /recruitee/i },
  { name: 'rippling',   urlPattern: /ats\.rippling\.com/i,            bodyPattern: /ats\.rippling/i },
];

function fingerprint(finalUrl, body) {
  // URL-based detection first (cheaper, more reliable)
  for (const ats of ATS_FINGERPRINTS) {
    if (ats.urlPattern.test(finalUrl)) return { name: ats.name, matched: 'url' };
  }
  // Body-based detection
  if (body) {
    for (const ats of ATS_FINGERPRINTS) {
      if (ats.bodyPattern.test(body)) return { name: ats.name, matched: 'body' };
    }
  }
  return { name: 'unknown', matched: null };
}

// --- Propose action from current config + detected ATS ---
function extractSlug(url, ats) {
  // Extract the slug from common ATS URL patterns
  try {
    const u = new URL(url);
    if (ats === 'greenhouse') {
      // https://job-boards.greenhouse.io/{slug} or boards.greenhouse.io/{slug}
      const m = u.pathname.match(/^\/([^/]+)/);
      return m ? m[1] : null;
    }
    if (ats === 'ashby') {
      // https://jobs.ashbyhq.com/{slug}
      const m = u.pathname.match(/^\/([^/]+)/);
      return m ? m[1] : null;
    }
    if (ats === 'lever') {
      // https://jobs.lever.co/{slug}
      const m = u.pathname.match(/^\/([^/]+)/);
      return m ? m[1] : null;
    }
    if (ats === 'workday') {
      // https://{company}.{shard}.myworkdayjobs.com/{site}
      const hostMatch = u.hostname.match(/^([^.]+)\.([^.]+)\.myworkdayjobs\.com$/);
      const pathMatch = u.pathname.match(/^\/([^/]+)/);
      if (hostMatch && pathMatch) return `${hostMatch[1]}|${hostMatch[2]}|${pathMatch[1]}`;
    }
    if (ats === 'bamboohr') {
      const m = u.hostname.match(/^([^.]+)\.bamboohr\.com$/);
      return m ? m[1] : null;
    }
  } catch { /* ignore */ }
  return null;
}

function proposeAction(entry, detected, finalUrl) {
  const configured = {
    api: !!entry.api,
    scan_method: entry.scan_method || null,
  };

  // Case 1: Unreachable / dead URL
  if (detected.status === 'dead') {
    return { diagnosis: 'dead', proposal: `Verify careers_url still valid; consider updating or disabling.` };
  }

  // Case 2: No careers_url configured
  if (!entry.careers_url) {
    return { diagnosis: 'no_url', proposal: `Add careers_url to portals.yml; cannot probe.` };
  }

  const atsName = detected.ats?.name || 'unknown';

  // Case 3: Unknown/unrecognized ATS
  if (atsName === 'unknown') {
    if (configured.scan_method === 'manual') {
      return { diagnosis: 'ok_manual', proposal: null };
    }
    return { diagnosis: 'unknown_ats', proposal: `ATS not fingerprinted. Keep scan_method: manual or inspect HTML manually.` };
  }

  // Case 4: Known ATS with constructable API — propose promotion to L2
  const slug = extractSlug(finalUrl, atsName);
  if (atsName === 'greenhouse' && slug && !entry.api) {
    return {
      diagnosis: 'promote_to_L2',
      proposal: `Add: api: https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`,
      patch: { api: `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` },
    };
  }
  if (atsName === 'ashby' && slug && !entry.api) {
    return {
      diagnosis: 'promote_to_L2',
      proposal: `Add: api: https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`,
      patch: { api: `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true` },
    };
  }
  if (atsName === 'lever' && slug && !entry.api) {
    return {
      diagnosis: 'promote_to_L2',
      proposal: `Add: api: https://api.lever.co/v0/postings/${slug}?mode=json`,
      patch: { api: `https://api.lever.co/v0/postings/${slug}?mode=json` },
    };
  }
  if (atsName === 'workday' && slug) {
    const [co, shard, site] = slug.split('|');
    const proposed = `https://${co}.${shard}.myworkdayjobs.com/wday/cxs/${co}/${site}/jobs`;
    // Workday needs the adapter in scan-api-portals.mjs; flag separately
    return {
      diagnosis: 'workday_api_available',
      proposal: `Detected Workday. Propose: api: ${proposed} (POST JSON) — requires Workday adapter in scan-api-portals.mjs`,
      patch: { api: proposed, provider: 'workday' },
    };
  }
  if (atsName === 'bamboohr' && slug) {
    return {
      diagnosis: 'bamboohr_available',
      proposal: `Detected BambooHR. Public list endpoint: https://${slug}.bamboohr.com/careers/list — requires BambooHR adapter.`,
      patch: { api: `https://${slug}.bamboohr.com/careers/list`, provider: 'bamboohr' },
    };
  }

  // Case 5: Known ATS, API already configured and matches
  if (entry.api && entry.api.includes(atsName === 'greenhouse' ? 'greenhouse.io' : atsName)) {
    return { diagnosis: 'ok_l2', proposal: null };
  }

  // Case 6: Drift — configured ATS doesn't match detected
  if (entry.api) {
    return {
      diagnosis: 'drift',
      proposal: `Configured api suggests one ATS but fingerprint shows ${atsName}. Verify and possibly replace.`,
    };
  }

  // Case 7: ATS known but no slug extractable (Jobvite, iCIMS, etc.)
  return {
    diagnosis: 'known_ats_no_api',
    proposal: `Detected ${atsName} but no reliable public API pattern. Keep scan_method: playwright or manual.`,
  };
}

// --- HTTP probe ---
async function probe(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'career-ops-recon/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const finalUrl = res.url;
    const status = res.status;
    let body = '';
    if (status < 400) {
      try {
        body = (await res.text()).slice(0, 50000); // cap body size
      } catch { /* ignore */ }
    }
    return { status, finalUrl, body, error: null };
  } catch (e) {
    return { status: 0, finalUrl: null, body: '', error: e.name === 'AbortError' ? 'timeout' : e.message };
  }
}

// --- Main ---
const portals = yaml.load(fs.readFileSync(PORTALS, 'utf8'));
let tracked = (portals.tracked_companies || []).filter(c => c.enabled !== false);

if (COMPANY_FILTER) {
  tracked = tracked.filter(c => c.name.toLowerCase().includes(COMPANY_FILTER));
}
if (tracked.length > LIMIT) {
  tracked = tracked.slice(0, LIMIT);
}

const findings = [];
const summary = {
  total: tracked.length,
  ok_l2: 0,
  ok_manual: 0,
  promote_to_L2: 0,
  workday_api_available: 0,
  bamboohr_available: 0,
  known_ats_no_api: 0,
  unknown_ats: 0,
  drift: 0,
  dead: 0,
  no_url: 0,
};

console.error(`Probing ${tracked.length} companies...`);

let done = 0;
for (const entry of tracked) {
  done++;
  if (!entry.careers_url) {
    findings.push({
      name: entry.name,
      careers_url: null,
      configured: { api: entry.api || null, scan_method: entry.scan_method || null },
      probe: { status: null, final_url: null, error: 'no_url' },
      ats_detected: null,
      diagnosis: 'no_url',
      proposal: 'Add careers_url to portals.yml.',
    });
    summary.no_url++;
    continue;
  }

  const probed = await probe(entry.careers_url);
  let ats = null;
  let detected_status = 'reachable';
  if (probed.error || probed.status >= 400 || probed.status === 0) {
    detected_status = 'dead';
  } else {
    ats = fingerprint(probed.finalUrl, probed.body);
  }

  const detected = { status: detected_status, ats };
  const action = proposeAction(entry, detected, probed.finalUrl);

  findings.push({
    name: entry.name,
    careers_url: entry.careers_url,
    configured: { api: entry.api || null, scan_method: entry.scan_method || null },
    probe: { status: probed.status, final_url: probed.finalUrl, error: probed.error },
    ats_detected: ats,
    diagnosis: action.diagnosis,
    proposal: action.proposal,
    patch: action.patch || null,
  });
  summary[action.diagnosis] = (summary[action.diagnosis] || 0) + 1;

  if (done % 10 === 0) console.error(`  ${done}/${tracked.length}...`);
}

const report = {
  date: new Date().toISOString().slice(0, 10),
  summary,
  findings,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

if (pretty) {
  console.log('\n━━━ PORTALS RECON ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Date: ${report.date}  |  Tracked probed: ${summary.total}\n`);
  console.log('DIAGNOSIS SUMMARY:');
  for (const [k, v] of Object.entries(summary)) {
    if (k === 'total') continue;
    console.log(`  ${k.padEnd(24)}  ${String(v).padStart(3)}`);
  }
  console.log('\nACTIONABLE FINDINGS (proposals):');
  for (const f of findings) {
    if (!f.proposal) continue;
    console.log(`\n  [${f.diagnosis}] ${f.name}`);
    console.log(`    url:    ${f.careers_url || '(none)'}`);
    if (f.probe.final_url && f.probe.final_url !== f.careers_url) {
      console.log(`    final:  ${f.probe.final_url}`);
    }
    if (f.probe.status) console.log(`    status: ${f.probe.status}${f.probe.error ? ' ' + f.probe.error : ''}`);
    if (f.ats_detected) console.log(`    ats:    ${f.ats_detected.name} (via ${f.ats_detected.matched})`);
    console.log(`    →       ${f.proposal}`);
  }
  console.log(`\nFull report written to: ${OUT_JSON}`);
} else {
  console.log(JSON.stringify(report, null, 2));
}
