// One-shot: mark never-scanned companies as scan_method: manual in portals.yml.
// Safe to re-run; already-manual entries are no-ops.

import { readFileSync, writeFileSync } from 'fs';

const manualCompanies = [
  'Five9', 'Talkdesk', 'Dialpad', 'Avaya', 'RingCentral',
  'BDO USA', 'Improving', 'Slalom',
  'Netsmart Technologies',
  'Idealist (nonprofit aggregator)',
  'CB&A Realtors (Houston)', 'Fairway Home Mortgage (Houston)',
  'Camden Property Trust (Houston)', 'LJA Engineering (Houston)',
  'Hunton Group (Houston)', 'Harris Central Appraisal District',
  'Central Bank (Houston)', 'DataVox (Houston)',
  'Magnolia Oil & Gas (Houston)', 'Ally Medical ER (Houston)',
  'PCCA (Houston)', 'Preferred Technologies (Houston)',
  'Colliers International Houston', 'EEPB (Houston)',
  'TechJobsForGood', 'Enverus', 'Audubon Companies',
  'Rice University', 'University of St. Thomas', 'Qubika',
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let text = readFileSync('portals.yml', 'utf8');
let changed = 0;
let missing = [];

for (const company of manualCompanies) {
  const esc = escapeRegex(company);
  // Block: "- name: {company}" up to next "- name:" (or eof).
  // Match scan_method line inside the block and replace value.
  const reWithScan = new RegExp(
    `(^  - name: ${esc}\\s*\\n(?:(?!^  - name:)[\\s\\S])+?^    )scan_method: \\w+`,
    'm'
  );
  if (reWithScan.test(text)) {
    text = text.replace(reWithScan, '$1scan_method: manual');
    changed++;
    console.log(`  ✓ ${company}`);
    continue;
  }
  // No existing scan_method — insert one before notes
  const reAddBeforeNotes = new RegExp(
    `(^  - name: ${esc}\\s*\\n(?:(?!^  - name:)[\\s\\S])+?)(^    notes:)`,
    'm'
  );
  if (reAddBeforeNotes.test(text)) {
    text = text.replace(reAddBeforeNotes, '$1    scan_method: manual\n$2');
    changed++;
    console.log(`  ✓ ${company} (scan_method added)`);
    continue;
  }
  missing.push(company);
  console.log(`  ⚠️  NOT FOUND: ${company}`);
}

writeFileSync('portals.yml', text, 'utf8');
console.log(`\n${changed} / ${manualCompanies.length} updated.`);
if (missing.length) {
  console.log(`\nNot found (${missing.length}):`);
  for (const m of missing) console.log(`  - ${m}`);
}
