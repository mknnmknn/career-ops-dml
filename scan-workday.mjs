#!/usr/bin/env node
/**
 * scan-workday.mjs — Playwright scanner for Workday-hosted careers pages
 *
 * Iterates tracked_companies in portals.yml where careers_url matches
 * a Workday tenant pattern (*.wdN.myworkdayjobs.com/*), extracts the
 * job listings directly from the rendered DOM, filters by title_filter,
 * dedups against scan-history.tsv and data/pipeline.md, and writes
 * new candidates to batch/scan-candidates-workday.tsv.
 *
 * Zero LLM tokens at scan time (this is a local script). Invoke with:
 *   node scan-workday.mjs
 *   node scan-workday.mjs --company "FIS Global"   # scan only one tenant
 *   node scan-workday.mjs --headful                # show the browser (debug)
 *   node scan-workday.mjs --limit 3                # cap companies scanned
 *
 * After scanning, an import step similar to the weekly scan merges output
 * into pipeline.md + scan-history.tsv. (Manual for now — see tail of this file.)
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORTALS = resolve(__dirname, 'portals.yml');
const SCAN_HISTORY = resolve(__dirname, 'data/scan-history.tsv');
const PIPELINE = resolve(__dirname, 'data/pipeline.md');
const OUT_DIR = resolve(__dirname, 'batch');
const OUT_TSV = resolve(OUT_DIR, 'scan-candidates-workday.tsv');

const argHeadful = process.argv.includes('--headful');
const argCompanyIdx = process.argv.indexOf('--company');
const argCompany = argCompanyIdx >= 0 ? process.argv[argCompanyIdx + 1] : null;
const argLimitIdx = process.argv.indexOf('--limit');
const argLimit = argLimitIdx >= 0 ? parseInt(process.argv[argLimitIdx + 1], 10) : null;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function slugifyForSource(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

// Lightweight portals.yml parser — same approach as earlier classification scripts.
// (Avoids a yaml dep; reads only the fields we need.)
function parsePortals() {
  const text = readFileSync(PORTALS, 'utf8');
  const result = { title_positive: [], title_negative: [], tracked_companies: [] };

  // Title filter: find `positive:` / `negative:` anchors inside `title_filter:`,
  // then gather subsequent `- "..."` lines until we hit a same-or-lower-indent key.
  const tfStart = text.indexOf('title_filter:');
  if (tfStart >= 0) {
    // Only look at the title_filter block (stop at the next top-level key)
    const rest = text.slice(tfStart);
    const endIdx = rest.search(/\n[a-z_]+:/m);
    const tfBlock = endIdx > 0 ? rest.slice(0, endIdx) : rest;

    const extractList = (anchor) => {
      const idx = tfBlock.indexOf(`  ${anchor}:`);
      if (idx < 0) return [];
      const afterAnchor = tfBlock.slice(idx).split('\n').slice(1);
      const items = [];
      for (const line of afterAnchor) {
        // Stop when we hit a sibling key (`  negative:`, `  positive:`, etc.) at 2-space indent
        if (/^  [a-z_]+:/.test(line)) break;
        const m = line.match(/^\s*-\s*"?([^"]+?)"?\s*$/);
        if (m) items.push(m[1].trim());
      }
      return items;
    };
    result.title_positive = extractList('positive');
    result.title_negative = extractList('negative');
  }

  // tracked_companies — split on "  - name:"
  const tcStart = text.indexOf('tracked_companies:');
  if (tcStart < 0) return result;
  const body = text.slice(tcStart);
  const entries = body.split(/^  - name:/m).slice(1);
  for (const e of entries) {
    const nameMatch = e.match(/^\s*(.+?)\n/);
    const urlMatch = e.match(/careers_url:\s*(\S+)/);
    const enabledMatch = e.match(/enabled:\s*(true|false)/);
    const scanMethodMatch = e.match(/scan_method:\s*(\S+)/);
    if (!nameMatch || !urlMatch) continue;
    result.tracked_companies.push({
      name: nameMatch[1].trim(),
      careers_url: urlMatch[1].trim(),
      enabled: enabledMatch ? enabledMatch[1] === 'true' : false,
      scan_method: scanMethodMatch ? scanMethodMatch[1] : null,
    });
  }
  return result;
}

function loadDedupUrls() {
  const urls = new Set();
  if (existsSync(SCAN_HISTORY)) {
    const lines = readFileSync(SCAN_HISTORY, 'utf8').split(/\r?\n/).slice(1); // skip header
    for (const line of lines) {
      const url = line.split('\t')[0];
      if (url) urls.add(url.replace(/\/$/, ''));
    }
  }
  if (existsSync(PIPELINE)) {
    const text = readFileSync(PIPELINE, 'utf8');
    const matches = text.matchAll(/https?:\/\/\S+/g);
    for (const m of matches) {
      urls.add(m[0].replace(/[)\],|]*$/, '').replace(/\/$/, ''));
    }
  }
  return urls;
}

function matchesTitleFilter(title, positive, negative) {
  const lc = title.toLowerCase();
  const posOk = positive.some((p) => p && lc.includes(p.toLowerCase()));
  if (!posOk) return false;
  const negHit = negative.some((n) => n && lc.includes(n.toLowerCase()));
  return !negHit;
}

async function scanWorkdayTenant(page, company, careersUrl) {
  // Workday tenants typically expose:
  //   - a search page at {host}/{site} that renders a list of jobs
  //   - each job link has data-automation-id="jobTitle" and href="/job/..."
  //
  // Approach:
  //   1. Navigate to careersUrl
  //   2. Wait for any of: [data-automation-id="jobTitle"], [data-automation-id="jobResults"],
  //      or a generic listbox role.
  //   3. Extract {title, href, location} from each job card, paginating if a "next" button exists.
  //
  // Location: Workday wraps each list item with jobTitle, locationsAndTime (sometimes).
  // We extract via aria + data-automation-id attributes; these are stable across tenants.

  const candidates = [];
  try {
    await page.goto(careersUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    return { candidates, error: `Navigation failed: ${e.message}` };
  }

  // Accept cookies if present (doesn't error if absent).
  try {
    const btn = await page.$('button:has-text("Accept")');
    if (btn) await btn.click({ timeout: 2000 });
  } catch {}

  // Wait for either the jobList or a jobTitle anchor.
  const waited = await Promise.race([
    page.waitForSelector('[data-automation-id="jobTitle"]', { timeout: 20000 }).then(() => 'jobTitle').catch(() => null),
    page.waitForSelector('[data-automation-id="jobResults"]', { timeout: 20000 }).then(() => 'jobResults').catch(() => null),
    page.waitForSelector('[data-automation-id="jobFoundText"]', { timeout: 20000 }).then(() => 'jobFoundText').catch(() => null),
  ]);
  if (!waited) {
    // Debug: dump the DOM automation ids we DID see, to help tune selectors.
    try {
      const ids = await page.$$eval('[data-automation-id]', (els) =>
        Array.from(new Set(els.slice(0, 100).map((e) => e.getAttribute('data-automation-id'))))
      );
      console.log(`  [debug] data-automation-ids seen: ${ids.slice(0, 15).join(', ')}${ids.length > 15 ? '…' : ''}`);
    } catch {}
    return { candidates, error: 'Timed out waiting for job list selectors' };
  }
  // Extra settle time after first render.
  await page.waitForTimeout(1500);

  // Get total page count if available.
  let pageCount = 1;
  try {
    const info = await page.$eval('[data-automation-id="jobFoundText"]', (el) => el.textContent || '');
    // "Showing 1-20 of 237" → derive pages of 20
    const m = info.match(/of\s+([0-9,]+)/i);
    if (m) {
      const total = parseInt(m[1].replace(/,/g, ''), 10);
      pageCount = Math.min(Math.ceil(total / 20), 25); // cap 25 pages ≈ 500 results
    }
  } catch {}

  for (let p = 0; p < pageCount; p++) {
    // Extract listings on this page.
    const pageItems = await page.$$eval('[data-automation-id="jobTitle"]', (nodes) =>
      nodes.map((a) => ({
        title: a.textContent?.trim() || '',
        href: a.href || a.getAttribute('href') || '',
      }))
    );
    for (const it of pageItems) {
      if (!it.title || !it.href) continue;
      // Workday hrefs are absolute; normalize to full URL if a path
      let url = it.href;
      if (url.startsWith('/')) {
        const base = new URL(careersUrl);
        url = `${base.origin}${it.href}`;
      }
      candidates.push({ title: it.title, url, location: '' });
    }

    // Click "next" button if available.
    const nextBtn = await page.$('[data-automation-id="pagination-next-button"]:not([disabled])');
    if (!nextBtn) break;
    try {
      await nextBtn.click();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      break;
    }
  }

  // Pull locations in a second pass if available (Workday lists each job in an article; grab child text).
  // Skip for now — location filter is done against the title + URL context.

  return { candidates, error: null };
}

async function main() {
  const cfg = parsePortals();
  console.log(`📋 Loaded ${cfg.tracked_companies.length} tracked_companies`);
  console.log(`📋 Title filter: ${cfg.title_positive.length} positive, ${cfg.title_negative.length} negative`);

  const workdayRe = /\.wd[0-9]+\.myworkdayjobs\.com/i;
  let targets = cfg.tracked_companies.filter(
    (c) => c.enabled && workdayRe.test(c.careers_url || '')
  );
  if (argCompany) {
    targets = targets.filter((c) => c.name.toLowerCase().includes(argCompany.toLowerCase()));
  }
  if (argLimit) {
    targets = targets.slice(0, argLimit);
  }

  if (targets.length === 0) {
    console.log('⚠️  No enabled Workday tenants matched. Exiting.');
    process.exit(0);
  }

  console.log(`🎯 Scanning ${targets.length} Workday tenant(s):`);
  for (const t of targets) console.log(`    - ${t.name} → ${t.careers_url}`);

  const dedupUrls = loadDedupUrls();
  console.log(`🔍 Dedup source: ${dedupUrls.size} URLs known`);

  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: !argHeadful });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const outRows = [];
  const funnel = { raw: 0, afterTitle: 0, afterDedup: 0 };
  const failures = [];

  for (const t of targets) {
    console.log(`\n→ ${t.name}`);
    const { candidates, error } = await scanWorkdayTenant(page, t.name, t.careers_url);
    if (error) {
      failures.push({ company: t.name, error });
      console.log(`  ⚠️  ${error}`);
      continue;
    }
    console.log(`  raw jobs extracted: ${candidates.length}`);
    funnel.raw += candidates.length;

    const titleFiltered = candidates.filter((c) =>
      matchesTitleFilter(c.title, cfg.title_positive, cfg.title_negative)
    );
    funnel.afterTitle += titleFiltered.length;

    const deduped = titleFiltered.filter((c) => {
      const u = c.url.replace(/\/$/, '');
      return !dedupUrls.has(u);
    });
    funnel.afterDedup += deduped.length;

    console.log(`  after title filter: ${titleFiltered.length}`);
    console.log(`  after dedup: ${deduped.length}`);

    for (const c of deduped) {
      outRows.push([
        c.url,
        t.name,
        c.title,
        c.location || 'Workday (see posting)',
        `workday-${slugifyForSource(t.name)}`,
        today(),
      ].join('\t'));
      dedupUrls.add(c.url.replace(/\/$/, ''));
    }
  }

  await browser.close();

  if (outRows.length > 0) {
    writeFileSync(OUT_TSV, outRows.join('\n') + '\n', 'utf8');
  } else {
    writeFileSync(OUT_TSV, '', 'utf8');
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`Summary:`);
  console.log(`  Tenants scanned: ${targets.length} (${failures.length} failed)`);
  console.log(`  Raw jobs: ${funnel.raw}`);
  console.log(`  After title filter: ${funnel.afterTitle}`);
  console.log(`  After dedup: ${funnel.afterDedup}`);
  console.log(`  Written to: ${OUT_TSV.replace(__dirname, '.').replace(/\\/g, '/')}`);
  if (failures.length > 0) {
    console.log(`\nFailures:`);
    for (const f of failures) console.log(`  - ${f.company}: ${f.error}`);
  }
  if (outRows.length > 0) {
    console.log(`\nNext: review batch/scan-candidates-workday.tsv, then append to pipeline.md + scan-history.tsv.`);
    console.log(`      (Same merge pattern as other weekly scan outputs.)`);
  }
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
