#!/usr/bin/env node
// archive-pipeline.mjs — move processed entries from data/pipeline.md into data/pipeline-archive.md.
//
// Scope: only the `## Procesadas` section. Heading + italic preamble are preserved; HTML comment
// dividers and `- [x]` entries underneath are moved. Inbox, Pendientes, and Needs Manual JD Fetch
// sections are never touched.
//
// Usage:
//   node batch/archive-pipeline.mjs           # archive and write
//   node batch/archive-pipeline.mjs --dry-run # show what would move, do not write
//
// Idempotent: a second run on the same day exits "nothing to archive" because Procesadas is empty.

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const projectDir = path.resolve(import.meta.dirname, '..');
const pipelinePath = path.join(projectDir, 'data', 'pipeline.md');
const archivePath = path.join(projectDir, 'data', 'pipeline-archive.md');

if (!fs.existsSync(pipelinePath)) {
  console.error(`ERROR: ${pipelinePath} not found.`);
  process.exit(1);
}
if (!fs.existsSync(archivePath)) {
  console.error(`ERROR: ${archivePath} not found. Cannot archive without target file.`);
  process.exit(1);
}

const pipeline = fs.readFileSync(pipelinePath, 'utf8');
const lines = pipeline.split('\n');

// Find `## Procesadas` heading
let procHeadingIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '## Procesadas') {
    procHeadingIdx = i;
    break;
  }
}
if (procHeadingIdx === -1) {
  console.error('ERROR: No `## Procesadas` heading found in pipeline.md.');
  process.exit(1);
}

// Section ends at next `## ` heading (any depth-2 heading), or EOF
let sectionEndIdx = lines.length;
for (let i = procHeadingIdx + 1; i < lines.length; i++) {
  if (lines[i].startsWith('## ')) {
    sectionEndIdx = i;
    break;
  }
}

// First archivable line: HTML comment or `- [x]` entry inside the section
let firstArchiveIdx = -1;
for (let i = procHeadingIdx + 1; i < sectionEndIdx; i++) {
  const trimmed = lines[i].trim();
  if (trimmed.startsWith('<!--') || /^- \[x\]/.test(trimmed)) {
    firstArchiveIdx = i;
    break;
  }
}

if (firstArchiveIdx === -1) {
  console.log('No `[x]` entries found in `## Procesadas`. Nothing to archive.');
  process.exit(0);
}

// Block to move: everything from firstArchiveIdx through end of section
const archiveLines = lines.slice(firstArchiveIdx, sectionEndIdx);
const archiveBlock = archiveLines.join('\n').replace(/\n+$/, ''); // trim trailing blanks

const xCount = archiveLines.filter(l => /^- \[x\]/.test(l.trim())).length;
const today = new Date().toISOString().slice(0, 10);

// Compose new archive content
let archive = fs.readFileSync(archivePath, 'utf8').replace(/\n+$/, '');
const archiveSection = `\n\n## Cleanup pass ${today}\n\n${archiveBlock}\n`;

// Compose new pipeline content: keep heading + preamble (everything before firstArchiveIdx),
// then everything after the section (next section onward).
const before = lines.slice(0, firstArchiveIdx).join('\n').replace(/\n+$/, '');
const after = lines.slice(sectionEndIdx).join('\n');
const newPipeline = after
  ? `${before}\n\n${after}`
  : `${before}\n`;

if (DRY_RUN) {
  console.log(`[dry-run] Would archive ${xCount} [x] entries to data/pipeline-archive.md.`);
  console.log(`[dry-run] Archive section header: ## Cleanup pass ${today}`);
  console.log(`[dry-run] First archived line:  ${archiveLines[0]}`);
  const lastNonEmpty = archiveLines.filter(l => l.trim()).pop();
  console.log(`[dry-run] Last archived line:   ${lastNonEmpty}`);
  console.log(`[dry-run] pipeline.md size: ${pipeline.length} → ${newPipeline.length} bytes`);
  console.log(`[dry-run] pipeline-archive.md size: ${archive.length} → ${(archive + archiveSection).length} bytes`);
  console.log(`[dry-run] No files written.`);
  process.exit(0);
}

fs.writeFileSync(archivePath, archive + archiveSection, 'utf8');
fs.writeFileSync(pipelinePath, newPipeline, 'utf8');

console.log(`Archived ${xCount} entries to data/pipeline-archive.md under "## Cleanup pass ${today}".`);
console.log(`Cleared ## Procesadas body in data/pipeline.md (heading + empty-state preamble retained).`);
