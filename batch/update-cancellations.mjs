// Update applications.md + stub reports for 15 cancellations from 2026-04-20 batch.
// Status changes Needs JD → Discarded (closed) or SKIP (location/function dealbreaker).

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';

const cancellations = [
  { id: 208, status: 'Discarded', role: 'unknown',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 214, status: 'Discarded', role: 'Chief Technology Officer (K-12 SaaS)',
    note: 'Duplicate of #213 Quekto AI (same underlying posting via aggregator).',
    reportStatus: 'Discarded — duplicate of #213.' },
  { id: 215, status: 'Discarded', role: 'Principal Application Modernization Architect',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 218, status: 'Discarded', role: 'Director of Platform Engineering',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 219, status: 'Discarded', role: 'Head of Engineering',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 221, status: 'Discarded', role: 'Director of Engineering',
    note: 'Posting closed / 404 (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 222, status: 'Discarded', role: 'Director of Data',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 224, status: 'Discarded', role: 'VP, Data & Analytics',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 225, status: 'Discarded', role: 'Director / VP of Engineering',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 226, status: 'Discarded', role: 'Sr Director, Data Engineering and Analytics',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 227, status: 'Discarded', role: 'VP, Data',
    note: 'Posting closed (confirmed 2026-04-20).',
    reportStatus: 'Discarded — posting closed.' },
  { id: 230, status: 'SKIP', role: 'AI Transformation Engagement Lead',
    note: 'Location dealbreaker — São Paulo, Brazil.',
    reportStatus: 'SKIP — Brazil location, not a target market.' },
  { id: 231, status: 'SKIP', role: 'Director HR, LATAM',
    note: 'Location + function dealbreaker — São Paulo, Brazil + HR function.',
    reportStatus: 'SKIP — Brazil location + HR function.' },
  { id: 233, status: 'SKIP', role: 'Federal Income Tax - Director or Senior Manager',
    note: 'Function dealbreaker — tax consulting, not technology leadership.',
    reportStatus: 'SKIP — tax consulting function, not a tech leadership role.' },
  { id: 235, status: 'SKIP', role: 'Director, State & Local Tax - Indirect Tax',
    note: 'Function dealbreaker — tax consulting, not technology leadership.',
    reportStatus: 'SKIP — tax consulting function, not a tech leadership role.' },
];

// 1. Update applications.md rows
let apps = readFileSync('data/applications.md', 'utf8');
let rowsUpdated = 0;
for (const c of cancellations) {
  const idStr = String(c.id).padStart(3, '0');
  // Find the row for this ID
  const lineRe = new RegExp(`(^\\| ${c.id} \\| 2026-04-20 \\| [^|]+ \\| )unknown( \\| 0\\.0/5 \\| )Needs JD( \\| ❌ \\| \\[${c.id}\\][^|]+ \\| )[^|]+(\\|)$`, 'm');
  const replacement = `$1${c.role} $2${c.status} $3${c.note} $4`;
  if (lineRe.test(apps)) {
    apps = apps.replace(lineRe, replacement);
    rowsUpdated++;
    console.log(`  ✓ applications.md row #${idStr} → ${c.status}`);
  } else {
    console.log(`  ⚠️  applications.md row #${idStr} NOT MATCHED (may already be updated)`);
  }
}
writeFileSync('data/applications.md', apps, 'utf8');

// 2. Update each stub report
let reportsUpdated = 0;
const reportsDir = 'reports';
const allReports = readdirSync(reportsDir);
for (const c of cancellations) {
  const idStr = String(c.id).padStart(3, '0');
  const matches = allReports.filter((f) => f.startsWith(`${idStr}-`) && f.endsWith('-2026-04-20.md'));
  if (matches.length === 0) {
    console.log(`  ⚠️  No report found for ID ${idStr}`);
    continue;
  }
  const reportPath = `${reportsDir}/${matches[0]}`;
  let content = readFileSync(reportPath, 'utf8');
  // Replace Status line
  const newContent = content
    .replace(/^\*\*Status:\*\* JD UNFETCHABLE — manual fetch required.*$/m,
             `**Status:** ${c.reportStatus}`)
    .replace(/## Note\n\nJD could not be retrieved.+$/s,
             `## Note\n\n${c.reportStatus} Confirmed by user on 2026-04-20. No further action needed.\n`);
  if (newContent !== content) {
    writeFileSync(reportPath, newContent, 'utf8');
    reportsUpdated++;
    console.log(`  ✓ report ${matches[0]} updated`);
  } else {
    console.log(`  ⚠️  report ${matches[0]} unchanged (may be non-stub)`);
  }
}

console.log(`\n✅ Cancellations: ${rowsUpdated} applications.md rows updated, ${reportsUpdated} reports updated.`);
