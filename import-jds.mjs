#!/usr/bin/env node
/**
 * import-jds.mjs — Bulk JD import adapter
 *
 * Workflow:
 *   1. User pastes N JDs into data/pipeline_import.md, separated by lines of "---"
 *   2. Run: node import-jds.mjs
 *   3. Script splits on ---, writes each block to jds/{next-id}.txt,
 *      and appends a `- [ ] local:jds/{id}.txt | Company | Role | found via pipeline_import {date}`
 *      line to the Pendientes section of data/pipeline.md
 *   4. After success, data/pipeline_import.md is archived to
 *      data/pipeline_import-archive/{YYYY-MM-DD}-{HHMMSS}.md and cleared
 *
 * Heuristic company/role extraction per block:
 *   - Looks for common patterns at the top of each block
 *   - Falls back to "unknown" for company and "pasted JD {id}" for role if extraction fails
 *   - User can manually edit pipeline.md entries after import if the heuristic missed
 *
 * The actual evaluation step (during /career-ops pipeline) reads the full JD text
 * from jds/{id}.txt, so precise company/role in pipeline.md is a nice-to-have, not required.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, renameSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMPORT_FILE = resolve(__dirname, 'data/pipeline_import.md');
const PIPELINE_FILE = resolve(__dirname, 'data/pipeline.md');
const JDS_DIR = resolve(__dirname, 'jds');
const REPORTS_DIR = resolve(__dirname, 'reports');
const ARCHIVE_DIR = resolve(__dirname, 'data/pipeline_import-archive');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function timestampSuffix() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function nextId() {
  // Max of existing jds/*.txt IDs AND reports/NNN-*.md IDs, plus 1.
  // Keeps ids monotonic across channels.
  let max = 0;
  if (existsSync(JDS_DIR)) {
    for (const f of readdirSync(JDS_DIR)) {
      const m = f.match(/^(\d+)\.txt$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  if (existsSync(REPORTS_DIR)) {
    for (const f of readdirSync(REPORTS_DIR)) {
      const m = f.match(/^(\d+)-/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return max + 1;
}

/**
 * Heuristic extraction of company + role from a pasted JD block.
 * Patterns to try (in order):
 *   1. "Role Title at Company" (common LinkedIn format)
 *   2. "Role Title via Indeed (saved)" + next non-empty line is role again, line after is company
 *   3. "Role Title\nCompany\nCity, ST • Remote" (Indeed raw paste pattern)
 *   4. Markdown-ish: first # or ## heading is role, first **Company:** is company
 * Falls back to { company: 'unknown', role: 'pasted JD' }.
 */
function extractMeta(block, fallbackId) {
  const rawLines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  // Skip leading URL-only lines (common when a paste starts with the posting link).
  const lines = rawLines.filter((l, idx) => !(idx < 3 && /^https?:\/\/\S+$/.test(l)));
  if (lines.length === 0) return { company: 'unknown', role: `pasted JD ${fallbackId}` };

  // Try "X at Y" or "X @ Y"
  for (const line of lines.slice(0, 5)) {
    const m = line.match(/^(.+?)\s+(?:at|@)\s+(.+?)$/i);
    if (m && !/\b(looking|skilled|expert|offered|based)\b/i.test(m[1])) {
      return { role: m[1].trim(), company: m[2].trim().replace(/\s+via\s+.+$/i, '') };
    }
  }

  // Indeed saved paste pattern: "Role via Indeed (saved)\n\nRole\nCompany\nCity, ST • Remote"
  // Second occurrence of role + next line as company
  const viaIndeedIdx = lines.findIndex((l) => /via Indeed/i.test(l));
  if (viaIndeedIdx >= 0 && lines.length >= viaIndeedIdx + 3) {
    return {
      role: lines[viaIndeedIdx + 1],
      company: lines[viaIndeedIdx + 2].replace(/\s+via\s+.+$/i, ''),
    };
  }

  // Markdown heading pattern
  const headingMatch = block.match(/^#+\s+(.+?)\s*(?:—|-|\||$)/m);
  const companyTag = block.match(/^\*\*Company:\*\*\s*(.+?)\s*$/m);
  if (headingMatch) {
    const role = headingMatch[1].trim();
    const company = companyTag ? companyTag[1].trim() : (lines[1] || 'unknown');
    return { role, company };
  }

  // Fallback: first line is role, second is company, else "unknown"
  return {
    role: lines[0] || `pasted JD ${fallbackId}`,
    company: lines[1] || 'unknown',
  };
}

function slugify(s) {
  return (s || 'unknown')
    .toLowerCase()
    .replace(/\b(inc|corp|llc|ltd|the|co|company)\b/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'unknown';
}

function main() {
  if (!existsSync(IMPORT_FILE)) {
    console.log('⚠️  data/pipeline_import.md does not exist. Nothing to do.');
    process.exit(0);
  }
  const text = readFileSync(IMPORT_FILE, 'utf8').trim();
  if (!text) {
    console.log('⚠️  data/pipeline_import.md is empty. Nothing to do.');
    process.exit(0);
  }

  // Split on lines that are just "---" (with optional whitespace).
  // Also accept leading/trailing whitespace-only blocks; discard empties.
  const blocks = text
    .split(/^\s*---\s*$/m)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    console.log('⚠️  No non-empty blocks found in pipeline_import.md.');
    process.exit(0);
  }

  console.log(`📥 Found ${blocks.length} JD block(s) to import.`);

  mkdirSync(JDS_DIR, { recursive: true });
  mkdirSync(ARCHIVE_DIR, { recursive: true });

  const dateStr = today();
  const pipelineLines = [];
  const firstId = nextId();
  let id = firstId;

  for (const block of blocks) {
    const currentId = String(id).padStart(3, '0');
    const { company, role } = extractMeta(block, currentId);
    const jdPath = resolve(JDS_DIR, `${currentId}.txt`);
    writeFileSync(jdPath, block + '\n', 'utf8');
    const line = `- [ ] local:jds/${currentId}.txt | ${company} | ${role} | found via pipeline_import ${dateStr}`;
    pipelineLines.push(line);
    console.log(`  → ${currentId}: ${company} | ${role}`);
    id++;
  }
  const lastId = id - 1;

  // Insert into pipeline.md before "## Procesadas" header.
  const pipelineText = readFileSync(PIPELINE_FILE, 'utf8');
  const anchor = '\n## Procesadas\n';
  const anchorIdx = pipelineText.indexOf(anchor);
  if (anchorIdx < 0) {
    console.error('❌ Could not locate "## Procesadas" header in pipeline.md. Aborting.');
    process.exit(1);
  }
  const before = pipelineText.slice(0, anchorIdx);
  const after = pipelineText.slice(anchorIdx);
  const newPipeline = before.replace(/\s*$/, '\n') + pipelineLines.join('\n') + '\n' + after;
  writeFileSync(PIPELINE_FILE, newPipeline, 'utf8');

  // Archive pipeline_import.md and clear it.
  const archivePath = resolve(ARCHIVE_DIR, `${dateStr}-${timestampSuffix()}.md`);
  renameSync(IMPORT_FILE, archivePath);
  writeFileSync(IMPORT_FILE, '', 'utf8');

  console.log(`\n✅ Imported ${blocks.length} JD(s). IDs assigned: ${String(firstId).padStart(3, '0')} → ${String(lastId).padStart(3, '0')}`);
  console.log(`📂 Archived pipeline_import.md → ${archivePath.replace(__dirname, '.').replace(/\\/g, '/')}`);
  console.log(`📝 Pipeline entries added to pipeline.md Pendientes.`);
  console.log(`\nNext: review heuristic company/role guesses in pipeline.md and edit if needed,`);
  console.log(`      then run /career-ops pipeline to evaluate.`);
}

main();
