#!/usr/bin/env node
// reconcile.mjs — Fix JobID discrepancies between batch-state.tsv and actual reports on disk.
//
// What it does:
// 1. Scans all reports/*.md headers → builds URL→{num,score,filename} map (disk truth)
// 2. Loads batch-input.tsv → all queued URLs
// 3. Loads batch-state.tsv → what state thinks happened
// 4. Reconciles: corrects state entries that point to wrong report numbers
// 5. Outputs summary + clean [!] list (URLs queued but with no valid report on disk)
//
// Usage: node batch/reconcile.mjs [--fix]  (--fix actually writes corrected state file)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const reportsDir = path.join(projectDir, 'reports');
const batchDir = path.join(projectDir, 'batch');
const stateFile = path.join(batchDir, 'batch-state.tsv');
const inputFile = path.join(batchDir, 'batch-input.tsv');

const FIX = process.argv.includes('--fix');

// ── 1. Scan reports on disk ─────────────────────────────────────────────────
console.log('Scanning reports on disk...');
const diskMap = new Map(); // url → {num, score, filename, internalNum}
const duplicateNums = new Map(); // num → [filename, ...]

for (const fname of fs.readdirSync(reportsDir).sort()) {
  if (!fname.endsWith('.md')) continue;
  const filenameNum = fname.match(/^(\d+)/)?.[1];
  if (!filenameNum) continue;

  const content = fs.readFileSync(path.join(reportsDir, fname), 'utf8');
  const lines = content.split('\n').slice(0, 30); // only header

  const urlMatch = lines.find(l => l.startsWith('**URL:**'))?.replace('**URL:**', '').trim();
  const scoreMatch = lines.find(l => l.startsWith('**Score:**'))?.replace('**Score:**', '').trim();
  const internalNumMatch = lines.find(l => l.startsWith('**#:**'))?.replace('**#:**', '').trim();

  if (!urlMatch) continue; // no URL in header → skip

  const url = urlMatch.replace(/[.,;]+$/, '');
  const score = scoreMatch?.match(/[\d.]+/)?.[0] ?? '-';
  const internalNum = internalNumMatch ?? filenameNum;

  // Track duplicate filename numbers
  if (!duplicateNums.has(filenameNum)) duplicateNums.set(filenameNum, []);
  duplicateNums.get(filenameNum).push(fname);

  // For same URL seen multiple times, prefer higher score or later report number
  if (diskMap.has(url)) {
    const existing = diskMap.get(url);
    const existScore = parseFloat(existing.score) || 0;
    const newScore = parseFloat(score) || 0;
    if (newScore > existScore || parseInt(filenameNum) > parseInt(existing.num)) {
      diskMap.set(url, { num: filenameNum, score, filename: fname, internalNum });
    }
  } else {
    diskMap.set(url, { num: filenameNum, score, filename: fname, internalNum });
  }
}

console.log(`  Found ${diskMap.size} unique URLs across ${fs.readdirSync(reportsDir).filter(f => f.endsWith('.md')).length} report files`);

// Report duplicate filename numbers
const dupes = [...duplicateNums.entries()].filter(([, v]) => v.length > 1);
if (dupes.length) {
  console.log(`\n⚠️  DUPLICATE REPORT NUMBERS ON DISK:`);
  for (const [num, files] of dupes) {
    console.log(`  #${num}: ${files.join(', ')}`);
  }
}

// ── 2. Load batch-input.tsv ─────────────────────────────────────────────────
function readTSV(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim());
  return lines.slice(1).map(l => l.split('\t'));
}

const inputRows = readTSV(inputFile).map(r => ({
  id: r[0], url: (r[1] || '').replace(/[.,;]+$/, ''), source: r[2] || '', notes: r[3] || ''
})).filter(r => r.id && r.url);

console.log(`\nBatch input: ${inputRows.length} URLs`);

// ── 3. Load batch-state.tsv ─────────────────────────────────────────────────
const stateRows = readTSV(stateFile).map(r => ({
  id: r[0], url: (r[1] || '').replace(/[.,;]+$/, ''),
  status: r[2], started: r[3], completed: r[4],
  reportNum: r[5], score: r[6], error: r[7],
  retries: parseInt(r[8] || '0', 10)
})).filter(r => r.id);

console.log(`Batch state: ${stateRows.length} rows (${stateRows.filter(r => r.status === 'completed').length} completed, ${stateRows.filter(r => r.status === 'failed').length} failed)`);

// ── 4. Reconcile ────────────────────────────────────────────────────────────
console.log('\n── RECONCILIATION ──────────────────────────────────────────────');

const corrected = [];
const noReport = [];   // URLs in input with no report on disk
const stateWrong = []; // state entries where report num doesn't match disk

// Build state map by URL
const stateByUrl = new Map(stateRows.map(r => [r.url, r]));

for (const row of inputRows) {
  const url = row.url;
  const diskEntry = diskMap.get(url);
  const stateEntry = stateByUrl.get(url);

  if (!diskEntry) {
    // No report found on disk for this URL
    noReport.push({ id: row.id, url, stateStatus: stateEntry?.status ?? 'missing', stateNum: stateEntry?.reportNum ?? '-', notes: row.notes });
    continue;
  }

  // We have a report on disk
  if (stateEntry) {
    const stateNum = stateEntry.reportNum;
    const diskNum = diskEntry.num;

    if (stateNum !== diskNum) {
      stateWrong.push({
        id: row.id, url,
        stateNum, diskNum,
        diskScore: diskEntry.score,
        filename: diskEntry.filename,
        oldStatus: stateEntry.status
      });
      // Fix state entry
      corrected.push({
        ...stateEntry,
        status: 'completed',
        reportNum: diskNum,
        score: diskEntry.score,
        error: '-'
      });
    } else if (stateEntry.status !== 'completed') {
      // State says failed/processing but disk has a report
      stateWrong.push({
        id: row.id, url,
        stateNum, diskNum,
        diskScore: diskEntry.score,
        filename: diskEntry.filename,
        oldStatus: stateEntry.status
      });
      corrected.push({
        ...stateEntry,
        status: 'completed',
        reportNum: diskNum,
        score: diskEntry.score,
        error: '-'
      });
    } else {
      corrected.push(stateEntry); // already correct
    }
  } else {
    // In input but not in state at all, but has a disk report — add to state
    stateWrong.push({
      id: row.id, url,
      stateNum: '(none)', diskNum: diskEntry.num,
      diskScore: diskEntry.score,
      filename: diskEntry.filename,
      oldStatus: '(not in state)'
    });
    corrected.push({
      id: row.id, url,
      status: 'completed',
      started: '-', completed: '-',
      reportNum: diskEntry.num,
      score: diskEntry.score,
      error: '-', retries: 0
    });
  }
}

// State entries for rows NOT in current input (shouldn't normally happen, keep as-is)
for (const s of stateRows) {
  if (!inputRows.find(r => r.url === s.url)) {
    corrected.push(s);
  }
}

// ── 5. Report findings ──────────────────────────────────────────────────────
console.log(`\nState corrections needed: ${stateWrong.length}`);
if (stateWrong.length) {
  for (const w of stateWrong) {
    console.log(`  [${w.id}] #${w.stateNum} → #${w.diskNum} (was ${w.oldStatus}) score=${w.diskScore} → ${w.filename}`);
  }
}

console.log(`\nURLs with NO report on disk: ${noReport.length}`);
for (const n of noReport) {
  console.log(`  [${n.id}] state=${n.stateStatus}/num=${n.stateNum} — ${n.url.slice(0, 80)}`);
  if (n.notes) console.log(`         notes: ${n.notes}`);
}

// ── 6. [!] list — URLs that genuinely need processing ──────────────────────
console.log('\n\n══ CLEAN [!] LIST — NEEDS JD OR RE-PROCESSING ══════════════════');
// Check if these are already flagged as [!] in pipeline.md
const pipelineText = fs.existsSync(path.join(projectDir, 'data', 'pipeline.md'))
  ? fs.readFileSync(path.join(projectDir, 'data', 'pipeline.md'), 'utf8')
  : '';

const jdsDir = path.join(projectDir, 'jds');
const availableJDs = fs.existsSync(jdsDir)
  ? new Set(fs.readdirSync(jdsDir).map(f => f.replace('.txt', '')))
  : new Set();

let bangCount = 0;
for (const n of noReport) {
  const isPipelineBang = pipelineText.includes(`[!]`) && pipelineText.split('\n').some(l => l.includes('[!]') && l.includes(n.url));
  const jdNum = [...availableJDs].find(k => pipelineText.split('\n').some(l => l.includes(`#${k}`) && l.includes(n.url)));
  const hasJD = jdNum ? `✅ jds/${jdNum}.txt` : '❌ no JD';

  console.log(`[${n.id}] ${hasJD} | ${isPipelineBang ? '[!] already in pipeline' : 'NEEDS PROCESSING'} | ${n.url.slice(0, 90)}`);
  bangCount++;
}

if (bangCount === 0) console.log('  (none — all batch URLs have reports on disk)');

// ── 7. Write corrected state (if --fix) ─────────────────────────────────────
if (FIX) {
  const header = 'id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries\n';
  // Sort corrected by numeric id, with corrected entries merged properly
  const seen = new Set();
  const deduped = corrected.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  }).sort((a, b) => parseInt(a.id) - parseInt(b.id));

  const rows = deduped.map(s =>
    `${s.id}\t${s.url}\t${s.status}\t${s.started}\t${s.completed}\t${s.reportNum}\t${s.score}\t${s.error}\t${s.retries}`
  );
  fs.writeFileSync(stateFile, header + rows.join('\n') + '\n');
  console.log(`\n✅ Written corrected state to ${stateFile} (${deduped.length} rows)`);
} else {
  console.log('\n(Run with --fix to apply corrections to batch-state.tsv)');
}
