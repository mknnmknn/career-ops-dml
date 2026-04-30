#!/usr/bin/env node
// Extract URLs from data/pipeline.md (Inbox + Pendientes) and write batch-input.tsv

import fs from 'fs';
import path from 'path';

const projectDir = path.resolve(import.meta.dirname, '..');
const pipelinePath = path.join(projectDir, 'data', 'pipeline.md');
const inputPath = path.join(projectDir, 'batch', 'batch-input.tsv');
const archivePath = path.join(projectDir, 'data', 'pipeline-archive.md');
const applicationsPath = path.join(projectDir, 'data', 'applications.md');

const text = fs.readFileSync(pipelinePath, 'utf8');

// Build dedup set from archive + applications (URL-level)
const seenUrls = new Set();
for (const p of [archivePath, applicationsPath]) {
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  for (const m of t.matchAll(/https?:\/\/[^\s|)\]]+/g)) {
    seenUrls.add(m[0].replace(/[.,;]+$/, ''));
  }
}

// Parse pipeline.md
const lines = text.split('\n');
const entries = [];
let section = null;

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    const sec = trimmed.slice(3).toLowerCase();
    if (sec.startsWith('inbox')) section = 'inbox';
    else if (sec.startsWith('pendientes')) section = 'pendientes';
    else if (sec.startsWith('procesadas')) section = 'procesadas';
    else section = null;
    continue;
  }
  if (section === 'procesadas') continue;
  if (!trimmed || trimmed.startsWith('<!--') || trimmed.startsWith('#')) continue;

  // Inbox: bare URL or "URL | Company | role | notes"
  // Pendientes: "- [ ] URL | Company | role | notes"
  let payload = trimmed;
  if (section === 'pendientes') {
    if (!payload.startsWith('- [ ]')) continue;
    payload = payload.replace(/^- \[ \]\s*/, '');
  }

  // Find URL
  const urlMatch = payload.match(/https?:\/\/\S+/);
  if (!urlMatch) continue;
  const url = urlMatch[0].replace(/[.,;]+$/, '');
  if (seenUrls.has(url)) continue;
  seenUrls.add(url);

  // Skip LinkedIn URLs — pre-flagged as [!] (login-walled)
  if (url.includes('linkedin.com')) continue;

  const parts = payload.split('|').map(s => s.trim());
  const company = parts[1] || '';
  const role = parts[2] || '';
  const notes = parts.slice(3).join(' | ');
  entries.push({ url, company, role, source: section, notes });
}

// Write TSV
const header = 'id\turl\tsource\tnotes\n';
const rows = entries.map((e, i) => {
  const id = String(i + 1);
  const note = [e.company, e.role, e.notes].filter(Boolean).join(' / ');
  return `${id}\t${e.url}\t${e.source}\t${note}`;
}).join('\n');

fs.writeFileSync(inputPath, header + rows + '\n');
console.log(`Wrote ${entries.length} entries to ${inputPath}`);

// LinkedIn flagging: print which IDs are LinkedIn (likely to need [!])
const linkedinIds = entries
  .map((e, i) => ({ id: i + 1, url: e.url, company: e.company }))
  .filter(e => e.url.includes('linkedin.com'));
if (linkedinIds.length) {
  console.log(`\n${linkedinIds.length} LinkedIn URLs (high [!] risk):`);
  for (const e of linkedinIds) console.log(`  #${e.id}: ${e.company || '(no company)'}`);
}
