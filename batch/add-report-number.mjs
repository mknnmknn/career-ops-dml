#!/usr/bin/env node
// add-report-number.mjs — Insert `**#:** N` into every report in reports/
//
// Migrates existing reports to include the tracker number as the first field
// after the H1 title. Parses N from the filename ({num}-{slug}-{date}.md).
// Idempotent — skips files that already have a `**#:**` line.
//
// Usage:
//   node batch/add-report-number.mjs            # dry-run, prints plan
//   node batch/add-report-number.mjs --apply    # actually writes changes

import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/danie/Dropbox/claudeCodex/JobSearch/career-ops-dml';
const REPORTS_DIR = path.join(ROOT, 'reports');
const APPLY = process.argv.includes('--apply');

const stats = {
  total: 0,
  alreadyHasField: 0,
  willInsert: 0,
  skippedNoH1: 0,
  skippedBadFilename: 0,
  skippedError: 0,
};

const plan = [];   // { file, num, action }
const skips = [];  // { file, reason }

const files = fs.readdirSync(REPORTS_DIR)
  .filter(f => f.endsWith('.md'))
  .sort();

for (const filename of files) {
  stats.total++;
  const filePath = path.join(REPORTS_DIR, filename);

  // Parse number from filename: {num}-{slug}-{YYYY-MM-DD}.md
  const match = filename.match(/^(\d{1,4})-.+\.md$/);
  if (!match) {
    stats.skippedBadFilename++;
    skips.push({ file: filename, reason: 'filename does not match ^(\\d+)-.+\\.md$' });
    continue;
  }
  const num = parseInt(match[1], 10);

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    stats.skippedError++;
    skips.push({ file: filename, reason: `read error: ${e.message}` });
    continue;
  }

  // Already has the field? Skip.
  if (/^\*\*#:\*\*\s/m.test(content)) {
    stats.alreadyHasField++;
    continue;
  }

  // Find the H1 line. Expect it near the top.
  const lines = content.split('\n');
  const h1Idx = lines.findIndex(l => /^#\s+\S/.test(l));
  if (h1Idx === -1) {
    stats.skippedNoH1++;
    skips.push({ file: filename, reason: 'no H1 heading found' });
    continue;
  }

  // Decide insertion index: after the H1, preserving one blank line.
  // If the line after H1 is already blank, insert on line h1Idx + 2 with no extra blank.
  // If the line after H1 is non-blank (e.g. H1 + fields stacked), insert on h1Idx + 1 preceded by blank logic.
  let insertIdx, insertLines;
  const newField = `**#:** ${num}`;
  if (lines[h1Idx + 1] === undefined || lines[h1Idx + 1] === '') {
    // Blank line after H1 — insert `newField` on h1Idx+2, keep trailing blank before existing fields.
    // Target shape:
    //   # Title
    //   <blank>
    //   **#:** N
    //   **Company:** ...
    // Means: splice at h1Idx+2 with [newField]
    insertIdx = h1Idx + 2;
    insertLines = [newField];
  } else {
    // No blank after H1 — fields begin immediately. Insert newField at h1Idx+1.
    // Target:
    //   # Title
    //   **#:** N
    //   **Company:** ...
    insertIdx = h1Idx + 1;
    insertLines = [newField];
  }

  const newLines = [...lines.slice(0, insertIdx), ...insertLines, ...lines.slice(insertIdx)];
  const newContent = newLines.join('\n');

  stats.willInsert++;
  plan.push({ file: filename, num, insertIdx, preview: `${lines[h1Idx]} → insert "**#:** ${num}"` });

  if (APPLY) {
    try {
      fs.writeFileSync(filePath, newContent, 'utf8');
    } catch (e) {
      stats.skippedError++;
      stats.willInsert--;
      skips.push({ file: filename, reason: `write error: ${e.message}` });
    }
  }
}

console.log(JSON.stringify({
  mode: APPLY ? 'APPLY (writes committed)' : 'DRY RUN (no writes)',
  stats,
  samplePlan: plan.slice(0, 8),
  totalToInsert: plan.length,
  skips: skips.slice(0, 20),
  totalSkips: skips.length,
}, null, 2));
