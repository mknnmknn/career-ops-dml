#!/usr/bin/env node
// fix-tracker-links.mjs — Normalize link text to match the actual report file number.
//
// Calibration item #9 (2026-04-27): applications.md has rows where the link
// display text says [N] but the file path is reports/M-... where N != M.
// This fix makes link text match the file the link points to. The leftmost
// tracker column (sequence ID) is left untouched.
//
// Usage: node fix-tracker-links.mjs [--dry-run]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const appsFile = path.join(projectDir, 'data', 'applications.md');
const DRY = process.argv.includes('--dry-run');

const content = fs.readFileSync(appsFile, 'utf8');
const lines = content.split('\n');

let fixed = 0;
const updated = lines.map((line, i) => {
  // Match: | ... | [linkText](reports/fileNum-...)
  const m = line.match(/\[(\d+)\]\(reports\/(\d+)-/);
  if (!m) return line;
  const linkText = m[1];
  const fileNum = m[2];
  if (linkText === fileNum) return line;

  fixed++;
  const newLine = line.replace(
    new RegExp(`\\[${linkText}\\]\\(reports/${fileNum}-`),
    `[${fileNum}](reports/${fileNum}-`
  );
  console.log(`  L${i + 1}: [${linkText}] → [${fileNum}]`);
  return newLine;
});

console.log(`\n${fixed} link-text/file mismatches found.`);

if (DRY) {
  console.log('(dry-run — no changes written)');
} else if (fixed > 0) {
  fs.writeFileSync(appsFile, updated.join('\n'));
  console.log(`✅ Written to ${appsFile}`);
} else {
  console.log('✅ Nothing to fix.');
}
