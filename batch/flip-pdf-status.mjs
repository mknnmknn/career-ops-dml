import { readFile, writeFile } from 'fs/promises';

const path = process.argv[2];
const targetNumsCsv = process.argv[3];
const targetNums = new Set(targetNumsCsv.split(',').map(s => parseInt(s.trim(), 10)));

const raw = await readFile(path, 'utf-8');
const lines = raw.split(/\r?\n/);

let flipped = 0;
let skipped = 0;

const out = lines.map(line => {
  // Only process table rows starting with | and having digits as first field
  const m = line.match(/^\|\s*(\d+)\s*\|/);
  if (!m) return line;

  const num = parseInt(m[1], 10);
  if (!targetNums.has(num)) return line;

  // The PDF column contains ❌ or ✅ — the 7th pipe-separated field
  const cols = line.split('|');
  // cols[0] is empty (leading |), cols[1] = num, 2=date, 3=company, 4=role, 5=score, 6=status, 7=pdf, 8=report, 9=notes, 10=empty
  if (cols.length < 8) return line;

  if (cols[7].includes('❌')) {
    cols[7] = cols[7].replace('❌', '✅');
    flipped++;
    return cols.join('|');
  } else if (cols[7].includes('✅')) {
    skipped++;
    return line;
  }
  return line;
});

await writeFile(path, out.join('\n'), 'utf-8');
console.log(`Rows flipped ❌ → ✅: ${flipped}`);
console.log(`Rows already ✅ (skipped): ${skipped}`);
console.log(`Target num count: ${targetNums.size}`);
