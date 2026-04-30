#!/usr/bin/env node
// manual-scan-status.mjs — Per-week checklist for manual-scan companies
//
// Reads portals.yml for companies with scan_method: manual,
// generates one file per ISO week in data/manual-scans/.
//
// Usage:
//   node batch/manual-scan-status.mjs             # show this week's status; create week file if missing
//   node batch/manual-scan-status.mjs --new-week  # force-recreate this week's file (backs up existing as .bak)
//   node batch/manual-scan-status.mjs --prune=20  # keep only the most recent N week files
//
// Idempotent: safe to run any time. One file per ISO week.
//
// Filename format: data/manual-scans/{YYMMDD}-week{##}-manual.md
//   where YYMMDD is the Monday of the ISO week.

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = 'C:/Users/danie/Dropbox/claudeCodex/JobSearch/career-ops-dml';
const PORTALS = path.join(ROOT, 'portals.yml');
const SCAN_DIR = path.join(ROOT, 'data/manual-scans');

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

// Filename: 260427-week18-manual.md  (YYMMDD = Monday of ISO week)
function weekFilename(key) {
  const monday = mondayOfIsoWeek(key);                  // "2026-04-27"
  const yymmdd = monday.slice(2).replace(/-/g, '');     // "260427"
  const weekNum = key.split('-W')[1];                   // "18"
  return `${yymmdd}-week${weekNum}-manual.md`;
}

// --- Load manual companies from portals.yml ---
const portals = yaml.load(fs.readFileSync(PORTALS, 'utf8'));
const manualCompanies = (portals.tracked_companies || [])
  .filter(c => c.enabled !== false && c.scan_method === 'manual')
  .map(c => ({ name: c.name, careers_url: c.careers_url, notes: c.notes || '' }))
  .sort((a, b) => a.name.localeCompare(b.name));

// --- Ensure scan dir exists ---
if (!fs.existsSync(SCAN_DIR)) {
  fs.mkdirSync(SCAN_DIR, { recursive: true });
}

// --- This week's file ---
const currentWeek = isoWeekKey();
const monday = mondayOfIsoWeek(currentWeek);
const weekFile = path.join(SCAN_DIR, weekFilename(currentWeek));

function buildWeekFileContent() {
  return [
    `# Manual Scan — Week of ${monday} (${currentWeek})`,
    '',
    `Checklist for \`scan_method: manual\` companies in \`portals.yml\` — careers pages not scannable via L1/L2 automated paths. Tick \`- [ ]\` → \`- [x]\` after browsing each; add notes inline.`,
    '',
    ...manualCompanies.map(c => c.careers_url ? `- [ ] ${c.name} — ${c.careers_url}` : `- [ ] ${c.name}`),
    '',
  ].join('\n');
}

if (forceNewWeek && fs.existsSync(weekFile)) {
  const bak = weekFile + '.bak';
  fs.renameSync(weekFile, bak);
  console.log(`Backed up existing file: ${path.basename(bak)}`);
  fs.writeFileSync(weekFile, buildWeekFileContent(), 'utf8');
  console.log(`Recreated week file:     ${path.basename(weekFile)}`);
} else if (!fs.existsSync(weekFile)) {
  fs.writeFileSync(weekFile, buildWeekFileContent(), 'utf8');
  console.log(`Created week file:       ${path.basename(weekFile)}`);
}

// --- Optional pruning ---
if (PRUNE_KEEP && PRUNE_KEEP > 0) {
  const files = fs.readdirSync(SCAN_DIR)
    .filter(f => /^\d{6}-week\d{2}-manual\.md$/.test(f))
    .sort()      // YYMMDD prefix sorts chronologically
    .reverse();  // newest first
  if (files.length > PRUNE_KEEP) {
    const toDelete = files.slice(PRUNE_KEEP);
    for (const f of toDelete) {
      fs.unlinkSync(path.join(SCAN_DIR, f));
    }
    console.log(`Pruned ${toDelete.length} older week file(s); kept most recent ${PRUNE_KEEP}.`);
  }
}

// --- Report current-week status ---
const content = fs.existsSync(weekFile) ? fs.readFileSync(weekFile, 'utf8') : '';
let weekCompleted = 0;
let weekTotal = 0;
for (const line of content.split('\n')) {
  if (line.match(/^- \[ \]/)) weekTotal++;
  else if (line.match(/^- \[[xX]\]/)) { weekTotal++; weekCompleted++; }
}

const pct = weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0;
console.log('');
console.log(`Week file:          ${weekFile}`);
console.log(`Current week:       ${currentWeek}  (${monday})`);
console.log(`Manual companies:   ${manualCompanies.length} tracked`);
console.log(`This week progress: ${weekCompleted}/${weekTotal} done (${pct}%)`);
console.log('');
if (weekCompleted < weekTotal && content) {
  console.log('Not yet checked this week:');
  for (const line of content.split('\n')) {
    const m = line.match(/^- \[ \] (.+)$/);
    if (m) console.log('  ·', m[1]);
  }
}
