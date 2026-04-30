#!/usr/bin/env node
// patch-state.mjs — Apply final manual corrections after reconcile.mjs --fix
// Run: node batch/patch-state.mjs [--dry-run]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const reportsDir = path.join(projectDir, 'reports');
const batchDir = path.join(projectDir, 'batch');
const stateFile = path.join(batchDir, 'batch-state.tsv');
const inputFile = path.join(batchDir, 'batch-input.tsv');

const DRY = process.argv.includes('--dry-run');

const log = (...a) => console.log(...a);
const action = (msg, fn) => {
  log(DRY ? `[DRY] ${msg}` : `  ✅ ${msg}`);
  if (!DRY) fn();
};

// ── Load state ──────────────────────────────────────────────────────────────
function readTSV(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n')
    .filter(l => l.trim())
    .slice(1)
    .map(l => l.split('\t'));
}

const stateRows = readTSV(stateFile).map(r => ({
  id: r[0], url: (r[1] || ''), status: r[2], started: r[3], completed: r[4],
  reportNum: r[5], score: r[6], error: r[7], retries: parseInt(r[8] || '0', 10)
}));

const inputRows = readTSV(inputFile).map(r => ({ id: r[0], url: r[1] || '', notes: r[3] || '' }));
const inputById = new Map(inputRows.map(r => [r.id, r]));

// Build state map by id
const stateById = new Map(stateRows.map(r => [r.id, { ...r }]));

// ── 1. Fix bogus scores (report numbers leaked into score field) ─────────────
log('\n── 1. Fix bogus scores ──');
const bogusFixes = [
  { id: '17', correctReportNum: '322', correctScore: '3.0' }, // Dassault → real report 322
  { id: '33', correctReportNum: '325', correctScore: '2.0' }, // Slalom AxYbIAK → real report 325
];
for (const fix of bogusFixes) {
  const s = stateById.get(fix.id);
  if (!s) { log(`  SKIP [${fix.id}] not in state`); continue; }
  log(`  [${fix.id}] reportNum: ${s.reportNum} → ${fix.correctReportNum}, score: ${s.score} → ${fix.correctScore}`);
  action(`patch ID ${fix.id}`, () => {
    s.reportNum = fix.correctReportNum;
    s.score = fix.correctScore;
    stateById.set(fix.id, s);
  });
}

// ── 2. Fix HCLTech report number (259 → 374, collision with Crowe) ────────────
log('\n── 2. Fix HCLTech report collision ──');
const hclState = stateById.get('14');
if (hclState) {
  log(`  [14] HCLTech reportNum: 259 → 374`);
  action('patch HCLTech ID 14 reportNum', () => {
    hclState.reportNum = '374';
    stateById.set('14', hclState);
  });
}

// Rename report file
const hclOld = path.join(reportsDir, '259-hcltech-2026-04-27.md');
const hclNew = path.join(reportsDir, '374-hcltech-2026-04-27.md');
if (fs.existsSync(hclOld)) {
  log(`  rename ${path.basename(hclOld)} → ${path.basename(hclNew)}`);
  action('rename HCLTech report file', () => {
    let content = fs.readFileSync(hclOld, 'utf8');
    content = content.replace(/^\*\*#:\*\* 259/m, '**#:** 374');
    fs.writeFileSync(hclNew, content);
    fs.unlinkSync(hclOld);
  });
} else {
  log(`  HCLTech file already renamed or missing: ${hclOld}`);
}

// ── 3. Add missing state entries (URL-mismatch cases that reconciler dropped) ─
log('\n── 3. Add missing state entries ──');
const missing = [
  { id: '32', url: 'https://jobs.slalom.com//#/post/a0hPh000005Sx3tIAC', reportNum: '365', score: '-', status: 'completed', note: 'Slalom [!] inaccessible' },
  { id: '57', url: 'https://jobs.careers.microsoft.com/global/en/job/1628757/', reportNum: '-', score: '-', status: 'failed', note: 'Microsoft Director AI Ecosystem Readiness — no report' },
  { id: '59', url: 'https://careers.microsoft.com/us/en/job/1182153/', reportNum: '267', score: '2.5', status: 'completed', note: 'Microsoft Senior Director C+AI Strategy' },
  { id: '61', url: 'https://careers.salesforce.com/en/jobs/jr329905/', reportNum: '272', score: '2.0', status: 'completed', note: 'Salesforce Director Workforce Innovation' },
  { id: '62', url: 'https://careers.salesforce.com/en/jobs/jr325700/', reportNum: '273', score: '2.3', status: 'completed', note: 'Salesforce Senior Director CSG Strategy' },
];
for (const m of missing) {
  if (stateById.has(m.id)) {
    log(`  [${m.id}] already in state — skip`);
    continue;
  }
  log(`  [${m.id}] ADD ${m.status} report=${m.reportNum} score=${m.score} (${m.note})`);
  action(`add state row ID ${m.id}`, () => {
    stateById.set(m.id, {
      id: m.id, url: m.url, status: m.status,
      started: '-', completed: '-',
      reportNum: m.reportNum, score: m.score,
      error: m.status === 'failed' ? 'no-report' : '-', retries: 0
    });
  });
}

// ── 4. Fix BDO report internal # (says 351 but should be 353) ────────────────
log('\n── 4. Fix BDO report internal number ──');
const bdoFile = path.join(reportsDir, '353-bdo-automation-infrastructure-lead-2026-04-27.md');
if (fs.existsSync(bdoFile)) {
  const content = fs.readFileSync(bdoFile, 'utf8');
  if (content.includes('**#:** 351')) {
    log(`  353-bdo: internal # 351 → 353`);
    action('fix BDO report internal #', () => {
      fs.writeFileSync(bdoFile, content.replace('**#:** 351', '**#:** 353'));
    });
  } else {
    log(`  353-bdo: already correct or different`);
  }
} else {
  log(`  353-bdo not found`);
}

// ── 5. Delete orphan/superseded reports ──────────────────────────────────────
log('\n── 5. Delete orphan/superseded reports ──');
const toDelete = [
  { file: '363-medidata-dassault-2026-04-27.md', reason: 'cross-ref duplicate → real report is 322' },
  { file: '366-slalom-2026-04-27.md', reason: 'cross-ref duplicate → real report is 325' },
  { file: '353-techsoup-global-2026-04-27.md', reason: 'superseded by 368-techsoup (score 4.1)' },
  { file: '242-burtch-works-pe-firm-2026-04-27.md', reason: 'superseded by 242-burtchworks-ai-enablement (score 4.1)' },
];
for (const d of toDelete) {
  const fp = path.join(reportsDir, d.file);
  if (fs.existsSync(fp)) {
    log(`  DELETE ${d.file} (${d.reason})`);
    action(`delete ${d.file}`, () => fs.unlinkSync(fp));
  } else {
    log(`  SKIP ${d.file} (already gone)`);
  }
}

// ── 6. Write corrected state ─────────────────────────────────────────────────
log('\n── 6. Write corrected state ──');
const allIds = new Set([...stateById.keys(), ...inputById.keys()]);
const finalRows = [...stateById.values()]
  .sort((a, b) => parseInt(a.id) - parseInt(b.id));

const header = 'id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries\n';
const rows = finalRows.map(s =>
  `${s.id}\t${s.url}\t${s.status}\t${s.started}\t${s.completed}\t${s.reportNum}\t${s.score}\t${s.error}\t${s.retries}`
);

log(`  Total state rows: ${finalRows.length} (completed: ${finalRows.filter(r => r.status === 'completed').length}, failed: ${finalRows.filter(r => r.status === 'failed').length})`);
action(`write ${stateFile}`, () => {
  fs.writeFileSync(stateFile, header + rows.join('\n') + '\n');
});

// ── 7. Final summary ──────────────────────────────────────────────────────────
log('\n══ SUMMARY ══════════════════════════════════════════════════════');
log(`Reports on disk (before delete): ${fs.readdirSync(reportsDir).filter(f => f.endsWith('.md')).length}`);
const completed = finalRows.filter(r => r.status === 'completed');
const failed = finalRows.filter(r => r.status === 'failed');
log(`State: ${finalRows.length} total | ${completed.length} completed | ${failed.length} failed`);
if (failed.length) {
  log(`\nFailed (need reprocessing):`);
  for (const f of failed) {
    const inp = inputById.get(f.id);
    log(`  [${f.id}] ${inp?.notes || f.url.slice(0, 70)}`);
  }
}
log(`\nDuplicate reports BEFORE cleanup:`);
for (const d of toDelete) {
  log(`  ${d.file} → ${d.reason}`);
}
if (DRY) log('\n(dry run — no files changed)');
