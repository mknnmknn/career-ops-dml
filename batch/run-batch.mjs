#!/usr/bin/env node
// Node orchestrator for batch evaluation.
// Replaces flaky bash batch-runner.sh on Windows MSYS.
//
// Reads batch-input.tsv + batch-state.tsv, runs claude -p workers concurrently,
// updates state safely (single-process write, no lock races).
//
// Usage: node batch/run-batch.mjs [--parallel N] [--max-retries N] [--start-from ID]

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const batchDir = path.join(projectDir, 'batch');
const reportsDir = path.join(projectDir, 'reports');
const logsDir = path.join(batchDir, 'logs');
const trackerDir = path.join(batchDir, 'tracker-additions');
const inputFile = path.join(batchDir, 'batch-input.tsv');
const stateFile = path.join(batchDir, 'batch-state.tsv');
const promptFile = path.join(batchDir, 'batch-prompt.md');

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const PARALLEL = parseInt(args.parallel ?? '3', 10);
const MAX_RETRIES = parseInt(args['max-retries'] ?? '1', 10);
const START_FROM = parseInt(args['start-from'] ?? '0', 10);

// Read input
function readTSV(file, hasHeader = true) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim());
  const rows = lines.map(l => l.split('\t'));
  return hasHeader ? rows.slice(1) : rows;
}

const inputRows = readTSV(inputFile).map(r => ({ id: r[0], url: r[1], source: r[2] || '', notes: r[3] || '' }));

// Build state map
const state = new Map();
for (const r of readTSV(stateFile)) {
  if (!r[0]) continue;
  state.set(r[0], { id: r[0], url: r[1], status: r[2], started: r[3], completed: r[4], reportNum: r[5], score: r[6], error: r[7], retries: parseInt(r[8] || '0', 10) });
}

// Compute next report number
function nextReportNum() {
  let max = 0;
  if (fs.existsSync(reportsDir)) {
    for (const f of fs.readdirSync(reportsDir)) {
      const m = f.match(/^(\d{3})/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  // Also check pipeline.md and pipeline-archive.md for [!] reservations
  for (const p of [path.join(projectDir, 'data', 'pipeline.md'), path.join(projectDir, 'data', 'pipeline-archive.md')]) {
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8');
    for (const m of text.matchAll(/[\[!\]x]\s*#(\d+)/g)) {
      max = Math.max(max, parseInt(m[1], 10));
    }
  }
  // And state file
  for (const s of state.values()) {
    const n = parseInt(s.reportNum || '0', 10);
    if (!isNaN(n)) max = Math.max(max, n);
  }
  return max + 1;
}

// Build pending list
const pending = [];
const reservedNums = new Set();
for (const row of inputRows) {
  if (parseInt(row.id, 10) < START_FROM) continue;
  const s = state.get(row.id);
  if (s && (s.status === 'completed' || s.status === 'skipped')) continue;
  if (s && s.status === 'failed' && s.retries >= MAX_RETRIES) continue;
  pending.push(row);
}

console.log(`=== Node batch orchestrator ===`);
console.log(`Input: ${inputRows.length} | Pending: ${pending.length} | Parallel: ${PARALLEL}`);

if (pending.length === 0) {
  console.log('Nothing to do.');
  process.exit(0);
}

[reportsDir, logsDir, trackerDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// State write (single-threaded — only this process writes)
function writeState() {
  const header = 'id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries\n';
  const rows = [...state.values()]
    .sort((a, b) => parseInt(a.id) - parseInt(b.id))
    .map(s => `${s.id}\t${s.url}\t${s.status}\t${s.started}\t${s.completed}\t${s.reportNum}\t${s.score}\t${s.error}\t${s.retries}`);
  fs.writeFileSync(stateFile, header + rows.join('\n') + '\n');
}

const date = new Date().toISOString().slice(0, 10);
const isoNow = () => new Date().toISOString().slice(0, 19) + 'Z';

function resolvePrompt(reportNum, jdFile, id, url) {
  const template = fs.readFileSync(promptFile, 'utf8');
  return template
    .replace(/\{\{URL\}\}/g, url)
    .replace(/\{\{JD_FILE\}\}/g, jdFile)
    .replace(/\{\{REPORT_NUM\}\}/g, reportNum)
    .replace(/\{\{DATE\}\}/g, date)
    .replace(/\{\{ID\}\}/g, id);
}

async function processOne(row) {
  const id = row.id;
  const url = row.url;
  const prev = state.get(id);
  const retries = (prev?.retries ?? 0);
  let reportNum;
  do {
    reportNum = String(nextReportNum()).padStart(3, '0');
  } while (reservedNums.has(reportNum));
  reservedNums.add(reportNum);

  const jdFile = `/tmp/batch-jd-${id}.txt`;
  const startedAt = isoNow();
  state.set(id, { id, url, status: 'processing', started: startedAt, completed: '-', reportNum, score: '-', error: '-', retries });
  writeState();

  console.log(`[${id}] -> processing (report ${reportNum}, attempt ${retries + 1})`);

  // Resolve prompt
  const resolvedPromptPath = path.join(batchDir, `.resolved-prompt-${id}.md`);
  fs.writeFileSync(resolvedPromptPath, resolvePrompt(reportNum, jdFile, id, url));

  const logFile = path.join(logsDir, `${reportNum}-${id}.log`);
  const logFd = fs.openSync(logFile, 'w');

  const userPrompt = `Procesa esta oferta de empleo. Ejecuta el pipeline completo: evaluación A-F + report .md + PDF + tracker line. URL: ${url} JD file: ${jdFile} Report number: ${reportNum} Date: ${date} Batch ID: ${id}`;

  const claudeArgs = ['-p', '--dangerously-skip-permissions', '--append-system-prompt-file', resolvedPromptPath, userPrompt];

  return new Promise(resolve => {
    const proc = spawn('claude', claudeArgs, {
      cwd: projectDir,
      stdio: ['ignore', logFd, logFd],
      shell: true
    });
    proc.on('exit', code => {
      fs.closeSync(logFd);
      try { fs.unlinkSync(resolvedPromptPath); } catch {}

      const completedAt = isoNow();
      let score = '-';
      try {
        const log = fs.readFileSync(logFile, 'utf8');
        const m = log.match(/"score"\s*:\s*([0-9.]+)/);
        if (m) score = m[1];
      } catch {}

      if (code === 0) {
        state.set(id, { id, url, status: 'completed', started: startedAt, completed: completedAt, reportNum, score, error: '-', retries });
        console.log(`[${id}] OK score=${score} report=${reportNum}`);
      } else {
        state.set(id, { id, url, status: 'failed', started: startedAt, completed: completedAt, reportNum, score: '-', error: `exit=${code}`, retries: retries + 1 });
        console.log(`[${id}] FAIL exit=${code}`);
      }
      writeState();
      resolve();
    });
    proc.on('error', err => {
      fs.closeSync(logFd);
      try { fs.unlinkSync(resolvedPromptPath); } catch {}
      state.set(id, { id, url, status: 'failed', started: startedAt, completed: isoNow(), reportNum, score: '-', error: err.message.slice(0, 200), retries: retries + 1 });
      console.log(`[${id}] ERROR ${err.message}`);
      writeState();
      resolve();
    });
  });
}

// Concurrent worker pool
async function runPool(items, n) {
  let i = 0;
  const workers = Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++;
      await processOne(items[idx]);
    }
  });
  await Promise.all(workers);
}

await runPool(pending, PARALLEL);

console.log('\n=== Done ===');
const final = [...state.values()];
const completed = final.filter(s => s.status === 'completed').length;
const failed = final.filter(s => s.status === 'failed').length;
console.log(`Total: ${final.length} | Completed: ${completed} | Failed: ${failed}`);
