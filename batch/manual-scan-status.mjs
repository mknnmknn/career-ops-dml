#!/usr/bin/env node
// manual-scan-status.mjs — Weekly checklist for manual-scan companies
//
// Reads portals.yml for companies with scan_method: manual,
// maintains data/manual-scan-log.md with a rolling weekly checklist.
//
// Usage:
//   node batch/manual-scan-status.mjs             # show current week status, add week section if missing
//   node batch/manual-scan-status.mjs --new-week  # force-append a new week (idempotent if already exists)
//   node batch/manual-scan-status.mjs --prune=20  # keep only the most recent N weeks
//
// Idempotent: safe to run any time. Weekly section keyed by ISO week.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = 'C:/Users/danie/Dropbox/claudeCodex/JobSearch/career-ops-dml';
const PORTALS = path.join(ROOT, 'portals.yml');
const LOG = path.join(ROOT, 'data/manual-scan-log.md');

const args = process.argv.slice(2);
const forceNewWeek = args.includes('--new-week');
const pruneArg = args.find(a => a.startsWith('--prune='));
const PRUNE_KEEP = pruneArg ? parseInt(pruneArg.split('=')[1], 10) : null;

// --- ISO week key (e.g., "2026-W17") ---
function isoWeekKey(d = new Date()) {
  // Thursday-of-week trick: make week belong to the year of its Thursday
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function mondayOfIsoWeek(key) {
  const [y, wPart] = key.split('-W');
  const year = parseInt(y, 10);
  const week = parseInt(wPart, 10);
  // ISO week: Monday = day 1, week 1 contains Jan 4
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const target = new Date(week1Monday);
  target.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return target.toISOString().slice(0, 10);
}

// --- Load manual companies from portals.yml ---
const portals = yaml.load(fs.readFileSync(PORTALS, 'utf8'));
const manualCompanies = (portals.tracked_companies || [])
  .filter(c => c.enabled !== false && c.scan_method === 'manual')
  .map(c => ({ name: c.name, careers_url: c.careers_url, notes: c.notes || '' }))
  .sort((a, b) => a.name.localeCompare(b.name));

// --- Load existing log or initialize ---
let logContent = '';
if (fs.existsSync(LOG)) {
  logContent = fs.readFileSync(LOG, 'utf8');
} else {
  logContent = `# Manual Scan Log

Weekly checklist for \`scan_method: manual\` companies in \`portals.yml\`. These are companies whose careers pages aren't scannable via the L1/L2 automated paths (custom ATSes, SPA-heavy sites, no public API). Each week, check off companies after you've browsed their careers page; add notes in the same line.

Run \`node batch/manual-scan-status.mjs\` to see current week progress and auto-generate the current week's section if missing.

---

`;
}

// --- Check whether current week section exists ---
const currentWeek = isoWeekKey();
const currentWeekHeader = `## Week of ${mondayOfIsoWeek(currentWeek)} (${currentWeek})`;

if (!logContent.includes(currentWeekHeader) || forceNewWeek) {
  // Build a new week section
  const weekSection = [
    currentWeekHeader,
    '',
    ...manualCompanies.map(c => `- [ ] ${c.name}`),
    '',
    '',
  ].join('\n');

  // Insert after the header/separator block, before any existing week sections
  const separator = '\n---\n\n';
  const sepIdx = logContent.indexOf(separator);
  if (sepIdx >= 0) {
    const after = sepIdx + separator.length;
    logContent = logContent.slice(0, after) + weekSection + logContent.slice(after);
  } else {
    // No separator found — append
    logContent += '\n' + weekSection;
  }

  fs.writeFileSync(LOG, logContent, 'utf8');
  console.log(`Added new week section: ${currentWeekHeader}`);
}

// --- Optional pruning ---
if (PRUNE_KEEP && PRUNE_KEEP > 0) {
  const weekHeaderRegex = /^## Week of \d{4}-\d{2}-\d{2} \(\d{4}-W\d{2}\)/gm;
  const matches = [...logContent.matchAll(weekHeaderRegex)];
  if (matches.length > PRUNE_KEEP) {
    const cutoffMatch = matches[PRUNE_KEEP];
    logContent = logContent.slice(0, cutoffMatch.index).trimEnd() + '\n';
    fs.writeFileSync(LOG, logContent, 'utf8');
    console.log(`Pruned to most recent ${PRUNE_KEEP} weeks.`);
  }
}

// --- Report current-week status ---
const weekStart = logContent.indexOf(currentWeekHeader);
let weekCompleted = 0;
let weekTotal = 0;
if (weekStart >= 0) {
  const nextHeader = logContent.indexOf('\n## ', weekStart + currentWeekHeader.length);
  const weekBody = logContent.slice(weekStart, nextHeader === -1 ? undefined : nextHeader);
  for (const line of weekBody.split('\n')) {
    if (line.match(/^- \[ \]/)) weekTotal++;
    else if (line.match(/^- \[[xX]\]/)) { weekTotal++; weekCompleted++; }
  }
}

const pct = weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0;
console.log('');
console.log(`Manual-scan log:    ${LOG}`);
console.log(`Current week:       ${currentWeek}  (${mondayOfIsoWeek(currentWeek)})`);
console.log(`Manual companies:   ${manualCompanies.length} tracked`);
console.log(`This week progress: ${weekCompleted}/${weekTotal} done (${pct}%)`);
console.log('');
if (weekCompleted < weekTotal) {
  console.log('Not yet checked this week:');
  if (weekStart >= 0) {
    const nextHeader = logContent.indexOf('\n## ', weekStart + currentWeekHeader.length);
    const weekBody = logContent.slice(weekStart, nextHeader === -1 ? undefined : nextHeader);
    for (const line of weekBody.split('\n')) {
      const m = line.match(/^- \[ \] (.+)$/);
      if (m) console.log('  ·', m[1]);
    }
  }
}
