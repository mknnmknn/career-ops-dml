#!/usr/bin/env node
/**
 * classify-careers.mjs — Careers-page URL classifier
 *
 * Takes careers URLs, determines the underlying ATS, and recommends a
 * scan strategy. Outputs a ready-to-paste portals.yml snippet for each.
 *
 * Usage:
 *   node classify-careers.mjs                          # reads config/new-companies.txt
 *   node classify-careers.mjs <url> [company-name]     # classifies a single URL
 *
 * Input file format (one per line):
 *   <url>                        # company name will be extracted from URL
 *   <url>\t<company-name>        # with explicit company name
 *
 * Output:
 *   Prints a report to stdout with:
 *     - detected ATS type per URL
 *     - scan feasibility (api-capable / playwright-needed / manual-only)
 *     - suggested portals.yml YAML block
 *   Archives processed input to config/classified-{YYYY-MM-DD}.txt
 *
 * Classification is based purely on URL pattern (no network calls by default).
 * Pass --probe to issue a lightweight HEAD request for liveness check.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEW_COMPANIES_FILE = resolve(__dirname, 'config/new-companies.txt');
const ARCHIVE_DIR = resolve(__dirname, 'config/classified-archive');

const ATS_PATTERNS = [
  {
    ats: 'ashby',
    feasibility: 'api-capable',
    cost: 'zero-token',
    regex: /^https?:\/\/jobs\.ashbyhq\.com\/([^\/?#]+)/i,
    buildYaml: (name, url, m) => {
      const slug = m[1];
      return `  - name: ${name}
    careers_url: https://jobs.ashbyhq.com/${slug}
    notes: "ATS: Ashby (zero-token scan path). Added ${today()}."
    enabled: true`;
    },
  },
  {
    ats: 'greenhouse',
    feasibility: 'api-capable',
    cost: 'zero-token',
    regex: /^https?:\/\/(?:job-)?boards\.greenhouse\.io\/([^\/?#]+)/i,
    buildYaml: (name, url, m) => {
      const slug = m[1];
      return `  - name: ${name}
    careers_url: ${url}
    api: https://boards-api.greenhouse.io/v1/boards/${slug}/jobs
    notes: "ATS: Greenhouse (zero-token scan path). Added ${today()}."
    enabled: true`;
    },
  },
  {
    ats: 'lever',
    feasibility: 'api-capable',
    cost: 'zero-token',
    regex: /^https?:\/\/jobs\.lever\.co\/([^\/?#]+)/i,
    buildYaml: (name, url, m) => {
      const slug = m[1];
      return `  - name: ${name}
    careers_url: https://jobs.lever.co/${slug}
    notes: "ATS: Lever (zero-token scan path via api.lever.co/v0/postings/${slug}). Added ${today()}."
    enabled: true`;
    },
  },
  {
    ats: 'workday',
    feasibility: 'playwright-needed',
    cost: 'scan-workday.mjs (local, zero-LLM-token)',
    regex: /^https?:\/\/([a-z0-9_-]+)\.(wd[0-9]+)\.myworkdayjobs\.com\//i,
    buildYaml: (name, url, m) => {
      return `  - name: ${name}
    careers_url: ${url}
    scan_method: workday
    notes: "ATS: Workday (tenant: ${m[1]}.${m[2]}). Handled by scan-workday.mjs. Added ${today()}."
    enabled: true`;
    },
  },
  {
    ats: 'dayforce',
    feasibility: 'manual-only',
    cost: 'Monday-manual',
    regex: /^https?:\/\/jobs\.dayforcehcm\.com\//i,
    buildYaml: (name, url) => `  - name: ${name}
    careers_url: ${url}
    scan_method: manual
    notes: "ATS: Dayforce (JS shell, not scannable without browser session). Monday-manual. Added ${today()}."
    enabled: true`,
  },
  {
    ats: 'icims',
    feasibility: 'playwright-needed',
    cost: 'scan-icims.mjs (not yet built) or Monday-manual',
    regex: /icims\.com/i,
    buildYaml: (name, url) => `  - name: ${name}
    careers_url: ${url}
    scan_method: manual
    notes: "ATS: iCIMS (Playwright-needed; no local scanner yet). Monday-manual. Added ${today()}."
    enabled: true`,
  },
  {
    ats: 'phenom',
    feasibility: 'playwright-needed',
    cost: 'Monday-manual',
    regex: /phenom-feeds|phenompeople/i,
    buildYaml: (name, url) => `  - name: ${name}
    careers_url: ${url}
    scan_method: manual
    notes: "ATS: Phenom (Playwright-needed; no local scanner yet). Monday-manual. Added ${today()}."
    enabled: true`,
  },
  {
    ats: 'oracle-hcm',
    feasibility: 'manual-only',
    cost: 'Monday-manual',
    regex: /oraclecloud\.com|fa\.us2\.oraclecloud/i,
    buildYaml: (name, url) => `  - name: ${name}
    careers_url: ${url}
    scan_method: manual
    notes: "ATS: Oracle HCM (JS shell). Monday-manual. Added ${today()}."
    enabled: true`,
  },
  {
    ats: 'jobvite',
    feasibility: 'playwright-needed',
    cost: 'Monday-manual',
    regex: /jobs\.jobvite\.com/i,
    buildYaml: (name, url) => `  - name: ${name}
    careers_url: ${url}
    scan_method: manual
    notes: "ATS: Jobvite (Playwright-needed). Monday-manual. Added ${today()}."
    enabled: true`,
  },
  {
    ats: 'workable',
    feasibility: 'api-capable',
    cost: 'zero-token (Workable has public API, not yet wired)',
    regex: /apply\.workable\.com\/([^\/?#]+)/i,
    buildYaml: (name, url, m) => {
      return `  - name: ${name}
    careers_url: ${url}
    notes: "ATS: Workable (slug: ${m[1]}; API path not yet wired into scanner). Added ${today()}."
    enabled: true`;
    },
  },
  {
    ats: 'bamboohr',
    feasibility: 'api-capable',
    cost: 'zero-token (BambooHR has public API, not yet wired)',
    regex: /([a-z0-9_-]+)\.bamboohr\.com\/careers/i,
    buildYaml: (name, url, m) => `  - name: ${name}
    careers_url: ${url}
    notes: "ATS: BambooHR (slug: ${m[1]}). Added ${today()}."
    enabled: true`,
  },
  {
    ats: 'rippling',
    feasibility: 'playwright-needed',
    cost: 'Monday-manual',
    regex: /ats\.rippling\.com/i,
    buildYaml: (name, url) => `  - name: ${name}
    careers_url: ${url}
    scan_method: manual
    notes: "ATS: Rippling (Playwright-needed). Monday-manual. Added ${today()}."
    enabled: true`,
  },
  {
    ats: 'smartrecruiters',
    feasibility: 'api-capable',
    cost: 'zero-token (SmartRecruiters has public API, not yet wired)',
    regex: /smartrecruiters\.com\/([^\/?#]+)/i,
    buildYaml: (name, url, m) => `  - name: ${name}
    careers_url: ${url}
    notes: "ATS: SmartRecruiters (slug: ${m[1]}; API not yet wired). Added ${today()}."
    enabled: true`,
  },
  // Generic fallback: custom career pages
  {
    ats: 'custom',
    feasibility: 'manual-only',
    cost: 'Monday-manual',
    regex: /.+/,
    buildYaml: (name, url) => `  - name: ${name}
    careers_url: ${url}
    scan_method: manual
    notes: "Custom careers page. Monday-manual fetch. Added ${today()}."
    enabled: true`,
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function inferCompanyFromUrl(url) {
  // Walk known patterns first
  for (const p of ATS_PATTERNS.slice(0, -1)) {
    const m = url.match(p.regex);
    if (m && m[1]) {
      return titleCase(m[1].replace(/[-_]/g, ' '));
    }
  }
  // Generic host extraction
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const parts = host.split('.');
    // careers.nrgenergy.com → NRG Energy
    if (parts.length >= 2) {
      const brand = parts[parts.length - 2];
      return titleCase(brand.replace(/[-_]/g, ' '));
    }
    return host;
  } catch {
    return 'unknown';
  }
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function classify(url, company) {
  const resolvedCompany = company || inferCompanyFromUrl(url);
  for (const pattern of ATS_PATTERNS) {
    const m = url.match(pattern.regex);
    if (m) {
      return {
        ats: pattern.ats,
        feasibility: pattern.feasibility,
        cost: pattern.cost,
        yaml: pattern.buildYaml(resolvedCompany, url, m),
        company: resolvedCompany,
      };
    }
  }
  return null; // unreachable (generic fallback catches all)
}

function feasibilityIcon(f) {
  switch (f) {
    case 'api-capable':
      return '🟢';
    case 'playwright-needed':
      return '🟡';
    case 'manual-only':
      return '🔴';
    default:
      return '❓';
  }
}

function main() {
  const args = process.argv.slice(2);
  let inputs = [];

  if (args.length >= 1 && /^https?:\/\//i.test(args[0])) {
    // CLI mode: single URL (+ optional company)
    inputs.push({ url: args[0], company: args[1] || null });
  } else if (existsSync(NEW_COMPANIES_FILE)) {
    // File mode
    const lines = readFileSync(NEW_COMPANIES_FILE, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
    for (const line of lines) {
      const parts = line.split(/\t/);
      inputs.push({ url: parts[0], company: parts[1] || null });
    }
  } else {
    console.error(`No URL argument given and ${NEW_COMPANIES_FILE} does not exist.`);
    console.error('Usage:');
    console.error('  node classify-careers.mjs <url> [company]');
    console.error('  node classify-careers.mjs  # reads config/new-companies.txt');
    process.exit(1);
  }

  if (inputs.length === 0) {
    console.log('⚠️  config/new-companies.txt is empty. Nothing to classify.');
    process.exit(0);
  }

  console.log(`📋 Classifying ${inputs.length} URL(s)...\n`);

  const byFeasibility = { 'api-capable': [], 'playwright-needed': [], 'manual-only': [] };

  for (const { url, company } of inputs) {
    const r = classify(url, company);
    if (!r) continue;
    byFeasibility[r.feasibility].push({ url, ...r });

    console.log(`${feasibilityIcon(r.feasibility)} ${r.company}`);
    console.log(`   URL: ${url}`);
    console.log(`   ATS: ${r.ats} — ${r.feasibility} — ${r.cost}`);
    console.log(`   Suggested portals.yml entry:`);
    console.log(r.yaml.split('\n').map((l) => '     ' + l).join('\n'));
    console.log('');
  }

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('Summary:');
  console.log(`  🟢 api-capable:      ${byFeasibility['api-capable'].length}`);
  console.log(`  🟡 playwright-needed: ${byFeasibility['playwright-needed'].length}`);
  console.log(`  🔴 manual-only:       ${byFeasibility['manual-only'].length}`);
  console.log('');
  console.log('Next steps:');
  if (byFeasibility['api-capable'].length > 0) {
    console.log(`  1. Paste the 🟢 YAML snippets into portals.yml (tracked_companies section, appropriate category).`);
    console.log(`     Next weekly API scan will pick them up automatically.`);
  }
  if (byFeasibility['playwright-needed'].length > 0) {
    console.log(`  2. Paste 🟡 YAML snippets into portals.yml too — scan-workday.mjs handles Workday entries.`);
  }
  if (byFeasibility['manual-only'].length > 0) {
    console.log(`  3. 🔴 entries go into portals.yml with scan_method: manual; fetch during Monday hunt.`);
  }

  // Archive if file-mode
  if (args.length === 0 && existsSync(NEW_COMPANIES_FILE)) {
    mkdirSync(ARCHIVE_DIR, { recursive: true });
    const archivePath = resolve(ARCHIVE_DIR, `${today()}-${Date.now()}.txt`);
    renameSync(NEW_COMPANIES_FILE, archivePath);
    writeFileSync(NEW_COMPANIES_FILE, '', 'utf8');
    console.log(`\n📂 Archived input → ${archivePath.replace(__dirname, '.').replace(/\\/g, '/')}`);
  }
}

main();
