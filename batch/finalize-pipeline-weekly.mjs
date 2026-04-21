// Final weekly-run step: drain the Needs Manual JD Fetch section in pipeline.md.
// All 26 entries are now resolved (11 re-evaluated from manual JDs + 15 cancellations).
// Move them into Procesadas with their final status and score.
//
// Data source: applications.md rows (post-cancellation + post-subagent) for IDs 205-235
// where status ≠ Needs JD.

import { readFileSync, writeFileSync } from 'fs';

const apps = readFileSync('data/applications.md', 'utf8');
const pipeline = readFileSync('data/pipeline.md', 'utf8');

const resolvedIds = [205, 206, 207, 208, 213, 214, 215, 216, 217, 218, 219, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235];

// Collect data from applications.md for each resolved ID
const resolved = {};
for (const id of resolvedIds) {
  const rowRe = new RegExp(`^\\| ${id} \\| 2026-04-20 \\| ([^|]+) \\| ([^|]+) \\| ([0-9.]+)/5 \\| ([^|]+) \\| [^|]+ \\| \\[${id}\\]\\(([^)]+)\\) \\| ([^|]+?) \\|$`, 'm');
  const m = apps.match(rowRe);
  if (!m) {
    console.log(`⚠️  Could not parse applications.md row for #${id}`);
    continue;
  }
  resolved[id] = {
    company: m[1].trim(),
    role: m[2].trim(),
    score: m[3].trim(),
    status: m[4].trim(),
    reportPath: m[5].trim(),
    note: m[6].trim(),
  };
}

// Pull the URLs for these IDs from the existing Needs Manual JD Fetch section.
const njdStart = pipeline.indexOf('## Needs Manual JD Fetch');
const njdEnd = pipeline.indexOf('\n## ', njdStart + 1);
const njdBlock = pipeline.slice(njdStart, njdEnd);
const urlsById = {};
for (const ln of njdBlock.split('\n')) {
  const m = ln.match(/^- \[\?\] #(\d+) \| (\S+) \|/);
  if (m) urlsById[parseInt(m[1], 10)] = m[2];
}

// Build new Procesadas entries
const newProcesadasLines = [];
for (const id of resolvedIds) {
  const r = resolved[id];
  if (!r) continue;
  const url = urlsById[id] || '(URL not recovered)';
  const idStr = String(id).padStart(3, '0');
  const tag = r.status === 'Evaluated' ? '' : ` | ${r.status}`;
  newProcesadasLines.push(
    `- [x] #${idStr} | ${url} | ${r.company} | ${r.role} | ${r.score}/5 | PDF ❌${tag} | ${r.note}`
  );
}
console.log(`Built ${newProcesadasLines.length} new Procesadas entries.`);

// 1. Insert new entries into Procesadas (before ## Needs Manual JD Fetch)
const procesadasMarker = '\n## Needs Manual JD Fetch';
const procIdx = pipeline.indexOf(procesadasMarker);
// Find the last non-whitespace char before the marker
let insertPos = procIdx;
while (insertPos > 0 && /\s/.test(pipeline[insertPos - 1])) insertPos--;

let newPipeline = pipeline.slice(0, insertPos) +
  '\n' + newProcesadasLines.join('\n') +
  pipeline.slice(insertPos);

// 2. Replace Needs Manual JD Fetch body with empty-state message
const newNjdStart = newPipeline.indexOf('## Needs Manual JD Fetch');
const newNjdEnd = newPipeline.indexOf('\n## ', newNjdStart + 1);
const njdHeader = `## Needs Manual JD Fetch

_(empty — all 2026-04-20 entries resolved: 11 re-evaluated from manual JD fetch, 15 cancelled as closed/dup/SKIP)_
`;
newPipeline = newPipeline.slice(0, newNjdStart) + njdHeader + newPipeline.slice(newNjdEnd);

writeFileSync('data/pipeline.md', newPipeline, 'utf8');

console.log(`\n✅ pipeline.md finalized.`);
console.log(`   Moved ${newProcesadasLines.length} entries to Procesadas.`);
console.log(`   Needs Manual JD Fetch: empty.`);
