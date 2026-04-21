// One-shot: move 67 processed entries from pipeline.md Pendientes
// to Procesadas (Evaluated) or Needs Manual JD Fetch (Needs JD) sections.
//
// Reads: data/pipeline.md + batch/tracker-additions/merged/{NNN}-*.tsv
// Writes: data/pipeline.md (updated)

import { readFileSync, writeFileSync, readdirSync } from 'fs';

// Map ID → { status, score, slug, company, role, url_or_local }
// Use merged TSVs to determine status per ID.
const mergedDir = 'batch/tracker-additions/merged';
const idToStatus = {};
const idToNote = {};
for (const f of readdirSync(mergedDir)) {
  const m = f.match(/^(\d+)-(.+)\.tsv$/);
  if (!m) continue;
  const [, id, slug] = m;
  const idNum = parseInt(id, 10);
  if (idNum < 169 || idNum > 235) continue; // only this run's IDs
  const content = readFileSync(`${mergedDir}/${f}`, 'utf8').trim();
  const parts = content.split('\t');
  if (parts.length < 9) continue;
  const [nnn, date, company, role, status, score, pdf, link, note] = parts;
  idToStatus[idNum] = { status, score, slug, company, role, pdf, note };
}

console.log(`Loaded status for ${Object.keys(idToStatus).length} IDs`);

// Read pipeline.md
let text = readFileSync('data/pipeline.md', 'utf8');
const lines = text.split('\n');

// Find pending entries and their companies/URLs
const processedEntries = []; // for Procesadas (Evaluated)
const needsJDEntries = [];   // for Needs Manual JD Fetch
const linesToRemove = new Set();
let lineIdx = 0;
let pendingIdx = 0;

// Sort IDs chronologically: the pending [ ] entries in pipeline.md are in
// the same order they were added. Our ID assignment (169-235) maps to them
// in that same order via batch TSV construction. So we match index-by-index.
const pendingLineNums = [];
const pendingLineData = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^- \[ \] (\S+) \| ([^|]+?) \| ([^|]+?)(?:\s*\|.*)?\s*$/);
  if (m) {
    pendingLineNums.push(i);
    pendingLineData.push({ url: m[1], company: m[2].trim(), role: m[3].trim() });
  }
}
console.log(`Found ${pendingLineNums.length} pending [ ] lines in pipeline.md`);

// Build ID assignment in the same order used by batch construction script.
// For entries with local:jds/{id}.txt, ID = that id. For URLs, assign sequentially from 173.
let nextId = 173;
for (const d of pendingLineData) {
  const localMatch = d.url.match(/^local:jds\/(\d+)\.txt$/);
  const id = localMatch ? parseInt(localMatch[1], 10) : nextId;
  if (!localMatch) nextId++;
  const stat = idToStatus[id];
  const idStr = String(id).padStart(3, '0');
  if (!stat) {
    console.log(`  ⚠️  No TSV found for ID ${idStr} (${d.company})`);
    continue;
  }
  if (stat.status === 'Evaluated' || stat.status === 'SKIP' || stat.status === 'Discarded') {
    processedEntries.push(
      `- [x] #${idStr} | ${d.url} | ${d.company} | ${d.role} | ${stat.score} | PDF ❌`
    );
  } else if (stat.status === 'Needs JD') {
    const errMatch = (stat.note || '').match(/unfetchable — (.+)$/i);
    const err = errMatch ? errMatch[1] : (stat.note || 'JD fetch failed');
    needsJDEntries.push(
      `- [?] #${idStr} | ${d.url} | ${d.company} | reports/${idStr}-${stat.slug}-2026-04-20.md | Error: ${err}`
    );
  } else {
    console.log(`  ⚠️  Unknown status "${stat.status}" for ID ${idStr}`);
  }
  linesToRemove.add(pendingLineNums[pendingLineData.indexOf(d)]);
}

console.log(`To Procesadas: ${processedEntries.length}`);
console.log(`To Needs Manual JD Fetch: ${needsJDEntries.length}`);

// Rebuild pipeline.md: drop pending lines, insert processedEntries into Procesadas,
// insert needsJDEntries into Needs Manual JD Fetch.
const outLines = [];
let insertedProcesadas = false;
let insertedNeedsJD = false;

for (let i = 0; i < lines.length; i++) {
  if (linesToRemove.has(i)) continue;
  outLines.push(lines[i]);

  // After last existing [x] in Procesadas, insert our processed block
  // We detect by: current line matches "- [x] #XXX" and next non-matching line signals end of Procesadas
  // Simpler: insert our block immediately after the LAST existing "- [x] #" in Procesadas.
  // We'll do a post-pass to inject at the correct point.
}

// Simpler approach: string-based insertion.
let outText = outLines.join('\n');

// Insert processed entries into Procesadas, right before the blank line that
// precedes "## Needs Manual JD Fetch".
const procesadasMarker = '\n## Needs Manual JD Fetch\n';
const procIdx = outText.indexOf(procesadasMarker);
if (procIdx < 0) {
  console.error('❌ Cannot find ## Needs Manual JD Fetch header');
  process.exit(1);
}
// Walk back to find the last non-empty line before the marker
let insertPos = procIdx;
while (insertPos > 0 && /\s/.test(outText[insertPos - 1])) insertPos--;
const beforeProc = outText.slice(0, insertPos);
const afterProc = outText.slice(insertPos);
outText = beforeProc + '\n' + processedEntries.join('\n') + afterProc;

// Insert Needs JD entries into the Needs Manual JD Fetch section.
// The existing section currently has _(empty — all prior entries evaluated...)_ text.
// Replace that with our new entries.
const njdStart = outText.indexOf('## Needs Manual JD Fetch');
const njdEnd = outText.indexOf('\n## ', njdStart + 1);
if (njdStart < 0 || njdEnd < 0) {
  console.error('❌ Cannot locate Needs Manual JD Fetch section bounds');
  process.exit(1);
}
const njdHeader = `## Needs Manual JD Fetch

JDs that could not be retrieved via WebFetch in batch mode. Per policy, no inference from title/company. Fetch manually (browser + copy JD to \`jds/{id}.txt\`) then re-run evaluation — IDs will be reused.

${needsJDEntries.join('\n')}
`;
outText = outText.slice(0, njdStart) + njdHeader + outText.slice(njdEnd);

writeFileSync('data/pipeline.md', outText, 'utf8');

console.log('\n✅ pipeline.md updated.');
console.log(`   Procesadas +${processedEntries.length}`);
console.log(`   Needs Manual JD Fetch: ${needsJDEntries.length}`);
console.log(`   Pendientes: removed ${linesToRemove.size} processed entries`);
