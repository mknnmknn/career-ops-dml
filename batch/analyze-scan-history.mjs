#!/usr/bin/env node
// analyze-scan-history.mjs — Scan performance + silent-failure audit
//
// Reads data/scan-history.tsv + portals.yml, produces:
//   1. Overall performance table (totals, pass rates by method)
//   2. Per-portal breakdown
//   3. Top contributors
//   4. Silent-failure audit (tracked companies with zero or stale history)
//
// Usage:
//   node batch/analyze-scan-history.mjs                  # pretty table to stdout
//   node batch/analyze-scan-history.mjs --json           # raw JSON
//   node batch/analyze-scan-history.mjs --stale-days=30  # adjust staleness threshold

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = 'C:/Users/danie/Dropbox/claudeCodex/JobSearch/career-ops-dml';
const HISTORY = path.join(ROOT, 'data/scan-history.tsv');
const PORTALS = path.join(ROOT, 'portals.yml');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const staleArg = args.find(a => a.startsWith('--stale-days='));
const STALE_DAYS = staleArg ? parseInt(staleArg.split('=')[1], 10) : 30;

// --- Load scan-history ---
if (!fs.existsSync(HISTORY)) {
  console.error(`scan-history.tsv not found at ${HISTORY}`);
  process.exit(1);
}
// Normalize line endings (file has mixed CRLF/LF)
const rawHistory = fs.readFileSync(HISTORY, 'utf8').replace(/\r\n?/g, '\n');
const historyLines = rawHistory.split('\n').filter(Boolean);
const header = historyLines[0].split('\t'); // url, first_seen, portal, title, company, status
const entries = historyLines.slice(1).map(line => {
  const [url, first_seen, portal, title, company, status] = line.split('\t').map(f => (f || '').trim());
  return { url, first_seen, portal, title, company, status };
});

// --- Load portals.yml ---
const portals = yaml.load(fs.readFileSync(PORTALS, 'utf8'));
const tracked = (portals.tracked_companies || []).filter(c => c.enabled !== false);

// --- Classify each entry by method ---
function classifyMethod(portal) {
  if (!portal) return 'unknown';
  if (portal.startsWith('tracked-')) return 'L1 Playwright (tracked)';
  if (portal.includes('-api-')) return 'L2 ATS API';
  if (portal.startsWith('websearch-')) return 'L3 WebSearch';
  if (portal.startsWith('workday-')) return 'L1 Playwright (Workday)';
  if (portal.includes('mcp')) return 'MCP scraper';
  // Heuristic: bare platform prefixes without -api- are WebSearch queries
  if (/^(greenhouse|ashby|lever|dice|indeed)-/.test(portal)) return 'L3 WebSearch';
  return 'other';
}

const byMethod = {};
for (const e of entries) {
  const m = classifyMethod(e.portal);
  if (!byMethod[m]) byMethod[m] = { added: 0, skipped_title: 0, skipped_dup: 0, skipped_expired: 0, total: 0 };
  byMethod[m][e.status] = (byMethod[m][e.status] || 0) + 1;
  byMethod[m].total++;
}

// --- Overall totals ---
const totals = { added: 0, skipped_title: 0, skipped_dup: 0, skipped_expired: 0, total: entries.length };
for (const e of entries) totals[e.status] = (totals[e.status] || 0) + 1;

// --- Per-portal breakdown ---
const byPortal = {};
for (const e of entries) {
  if (!byPortal[e.portal]) byPortal[e.portal] = { added: 0, total: 0 };
  byPortal[e.portal].total++;
  if (e.status === 'added') byPortal[e.portal].added++;
}

// --- Top contributors (companies) ---
const byCompany = {};
for (const e of entries.filter(x => x.status === 'added')) {
  byCompany[e.company] = (byCompany[e.company] || 0) + 1;
}
const topCompanies = Object.entries(byCompany).sort((a, b) => b[1] - a[1]).slice(0, 10);

// --- Silent-failure audit ---
// Normalize company names for matching
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}
const companiesSeen = new Set();
const companyLastSeen = {};
for (const e of entries) {
  if (!e.company) continue;
  const n = norm(e.company);
  companiesSeen.add(n);
  if (!companyLastSeen[n] || e.first_seen > companyLastSeen[n]) {
    companyLastSeen[n] = e.first_seen;
  }
}

const today = new Date();
function daysAgo(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return Math.floor((today - d) / (1000 * 60 * 60 * 24));
}

const audit = {
  never_scanned: [],    // tracked_companies with ZERO entries in history
  stale: [],            // last entry > STALE_DAYS ago
  active: [],           // seen within STALE_DAYS
};

for (const c of tracked) {
  const n = norm(c.name);
  const methodLabel = c.api ? 'L2 API' : (c.scan_method === 'playwright' ? 'L1 Playwright' : c.scan_method === 'manual' ? 'manual' : 'unspecified');
  if (!companiesSeen.has(n)) {
    audit.never_scanned.push({ company: c.name, scan_method: methodLabel, careers_url: c.careers_url });
  } else {
    const age = daysAgo(companyLastSeen[n]);
    if (age > STALE_DAYS) {
      audit.stale.push({ company: c.name, scan_method: methodLabel, last_seen: companyLastSeen[n], days_ago: age });
    } else {
      audit.active.push({ company: c.name, scan_method: methodLabel, last_seen: companyLastSeen[n], days_ago: age });
    }
  }
}

// --- Report ---
if (asJson) {
  console.log(JSON.stringify({ totals, byMethod, byPortal, topCompanies, audit }, null, 2));
  process.exit(0);
}

// Pretty-print
const pct = (n, d) => d ? ((n / d) * 100).toFixed(0) + '%' : '–';

console.log('\n━━━ SCAN PERFORMANCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Generated: ${today.toISOString().slice(0, 10)}  |  Stale threshold: ${STALE_DAYS} days`);
console.log(`Total history entries: ${totals.total}\n`);

console.log('OVERALL STATUS:');
console.log(`  added:            ${String(totals.added).padStart(4)}  (${pct(totals.added, totals.total)})`);
console.log(`  skipped_title:    ${String(totals.skipped_title).padStart(4)}  (${pct(totals.skipped_title, totals.total)})`);
console.log(`  skipped_dup:      ${String(totals.skipped_dup).padStart(4)}  (${pct(totals.skipped_dup, totals.total)})`);
console.log(`  skipped_expired:  ${String(totals.skipped_expired).padStart(4)}  (${pct(totals.skipped_expired, totals.total)})`);

console.log('\nPER-METHOD BREAKDOWN:');
console.log('  Method                          |  Added  |  Total  |  Pass-rate');
console.log('  ' + '─'.repeat(70));
for (const [method, stats] of Object.entries(byMethod).sort((a, b) => b[1].total - a[1].total)) {
  const rate = pct(stats.added, stats.total);
  console.log(`  ${method.padEnd(32)}|  ${String(stats.added).padStart(5)}  |  ${String(stats.total).padStart(5)}  |  ${rate.padStart(6)}`);
}

console.log('\nTOP 10 CONTRIBUTORS (companies by pipeline additions):');
for (const [co, count] of topCompanies) {
  console.log(`  ${String(count).padStart(3)}  ${co}`);
}

console.log('\n━━━ SILENT-FAILURE AUDIT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Tracked companies in portals.yml: ${tracked.length}`);
console.log(`Active (seen within ${STALE_DAYS}d):   ${audit.active.length}`);
console.log(`Stale (not seen in ${STALE_DAYS}d):    ${audit.stale.length}`);
console.log(`NEVER SCANNED:                         ${audit.never_scanned.length}  ← silent-failure candidates\n`);

// Break never_scanned by scan_method — most actionable view
const neverByMethod = {};
for (const e of audit.never_scanned) {
  if (!neverByMethod[e.scan_method]) neverByMethod[e.scan_method] = [];
  neverByMethod[e.scan_method].push(e);
}

console.log('NEVER-SCANNED BREAKDOWN BY METHOD:');
for (const [method, list] of Object.entries(neverByMethod).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n  [${method}] — ${list.length} companies`);
  for (const c of list) {
    const hint = method === 'manual' ? '(requires human browsing)'
      : method === 'L1 Playwright' ? '(needs Playwright scan run)'
      : method === 'L2 API' ? '(⚠ has API endpoint but zero matches — check filter or config)'
      : '';
    console.log(`    · ${c.company}  ${hint}`);
  }
}

if (audit.stale.length > 0) {
  console.log('\nSTALE (last seen > ' + STALE_DAYS + ' days ago):');
  for (const c of audit.stale.sort((a, b) => b.days_ago - a.days_ago).slice(0, 15)) {
    console.log(`  ${String(c.days_ago).padStart(3)}d ago  ${c.company.padEnd(30)} [${c.scan_method}]`);
  }
  if (audit.stale.length > 15) console.log(`  ... and ${audit.stale.length - 15} more`);
}

console.log('\n━━━ INTERPRETIVE GUIDE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`
L2 API "never scanned" is the most suspicious signal — if a company
has a public API endpoint and yet has ZERO history entries, either:
  (a) the scan has never been run against it (configuration gap), or
  (b) the scan ran but 100% of returns failed the title filter, or
  (c) the scan ran but errored silently.
The existing scan-history format doesn't distinguish these; adding
per-scan-attempt logging would close the gap.

Manual and L1-Playwright "never scanned" is expected to be large:
these methods require human-in-loop or interactive Claude sessions.
Not a silent failure — just work that hasn't been done.
`);
