#!/usr/bin/env node

/**
 * fill-template.mjs -- JSON data -> filled HTML from cv-template.html
 *
 * Reads a JSON file with CV content (summary, competencies, experience, etc.),
 * reads config/profile.yml for static header fields, and fills the template.
 *
 * Usage:
 *   node fill-template.mjs <data.json> <output.html> [--format=letter|a4]
 *
 * The JSON data contract is documented in batch/batch-prompt.md.
 * This script eliminates the need for LLMs to generate full HTML -- they
 * output structured JSON (~1,500 tokens) instead of raw HTML (~8,700 tokens).
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
let jsonPath, outputPath, format = 'letter';

for (const arg of args) {
  if (arg.startsWith('--format=')) {
    format = arg.split('=')[1].toLowerCase();
  } else if (!jsonPath) {
    jsonPath = arg;
  } else if (!outputPath) {
    outputPath = arg;
  }
}

if (!jsonPath || !outputPath) {
  console.error('Usage: node fill-template.mjs <data.json> <output.html> [--format=letter|a4]');
  process.exit(1);
}

jsonPath = resolve(jsonPath);
outputPath = resolve(outputPath);

// ---------------------------------------------------------------------------
// Load profile.yml (simple key extraction, no YAML parser needed)
// ---------------------------------------------------------------------------
async function loadProfile() {
  const raw = await readFile(resolve(__dirname, 'config/profile.yml'), 'utf-8');
  const get = (key) => {
    const m = raw.match(new RegExp(`${key}:\\s*"([^"]+)"`));
    return m ? m[1] : '';
  };
  return {
    name: get('full_name'),
    email: get('email'),
    phone: get('phone'),
    linkedin: get('linkedin'),
    location: get('location'),
  };
}

// ---------------------------------------------------------------------------
// HTML fragment builders
// ---------------------------------------------------------------------------

function buildSubtitle(text) {
  if (!text) return '';
  return text;
}

function buildCompetencies(tags) {
  if (!tags || !tags.length) return '';
  return tags
    .map(t => `      <span class="competency-tag">${esc(t)}</span>`)
    .join('\n');
}

function buildExperience(jobs) {
  if (!jobs || !jobs.length) return '';
  return jobs.map(j => {
    const location = j.location ? `\n      <div class="job-location">${esc(j.location)}</div>` : '';
    const bullets = (j.bullets || [])
      .map(b => `        <li>${b}</li>`)
      .join('\n');
    return `    <div class="job">
      <div class="job-header">
        <span class="job-company">${esc(j.company)}</span>
        <span class="job-period">${esc(j.period)}</span>
      </div>
      <div class="job-role">${esc(j.role)}${j.location ? ' -- ' + esc(j.location) : ''}</div>
      <ul>
${bullets}
      </ul>
    </div>`;
  }).join('\n\n');
}

function buildProjects(projects) {
  if (!projects || !projects.length) return '';
  return projects.map(p => {
    const badge = p.badge ? `\n      <span class="project-badge">${esc(p.badge)}</span>` : '';
    const tech = p.tech ? `\n      <div class="project-tech">${esc(p.tech)}</div>` : '';
    return `    <div class="project avoid-break">
      <span class="project-title">${esc(p.title)}</span>${badge}
      <div class="project-desc">${p.desc || ''}</div>${tech}
    </div>`;
  }).join('\n\n');
}

function buildEducation(items) {
  if (!items || !items.length) return '';
  return items.map(e => {
    const loc = e.location ? `, ${esc(e.location)}` : '';
    return `    <div class="edu-item">
      <div class="edu-header">
        <span class="edu-title">${esc(e.title)} -- <span class="edu-org">${esc(e.org)}</span>${loc}</span>
      </div>
    </div>`;
  }).join('\n');
}

function buildCertifications(items) {
  if (!items || !items.length) return '';
  return items.map(c => {
    const year = c.year ? `\n        <span class="cert-year">${esc(c.year)}</span>` : '';
    return `    <div class="cert-item">
      <span class="cert-title">${esc(c.title)} -- <span class="cert-org">${esc(c.org)}</span></span>${year}
    </div>`;
  }).join('\n');
}

function buildSkills(rows) {
  if (!rows || !rows.length) return '';
  return rows
    .map(r => `      <tr><td>${esc(r.category)}</td><td>${esc(r.items)}</td></tr>`)
    .join('\n');
}

function esc(s) {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------------
// Section wrapper -- omits entire section if content is empty
// ---------------------------------------------------------------------------
function wrapSection(title, content, extraClass = '') {
  if (!content || !content.trim()) return '';
  const cls = extraClass ? `section ${extraClass}` : 'section';
  return `  <div class="${cls}">
    <div class="section-title">${esc(title)}</div>
${content}
  </div>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const [template, dataRaw, profile] = await Promise.all([
    readFile(resolve(__dirname, 'templates/cv-template.html'), 'utf-8'),
    readFile(jsonPath, 'utf-8'),
    loadProfile(),
  ]);

  const data = JSON.parse(dataRaw);

  // Page width from format
  const pageWidth = format === 'a4' ? '210mm' : '8.5in';

  // Build all HTML fragments
  const competenciesHtml = buildCompetencies(data.competencies);
  const experienceHtml = buildExperience(data.experience);
  const projectsHtml = buildProjects(data.projects);
  const educationHtml = buildEducation(data.education);
  const certificationsHtml = buildCertifications(data.certifications);
  const skillsHtml = buildSkills(data.skills);

  // Substitution map
  const subs = {
    '{{LANG}}': data.lang || 'en',
    '{{PAGE_WIDTH}}': pageWidth,
    '{{NAME}}': profile.name,
    '{{SUBTITLE}}': buildSubtitle(data.subtitle),
    '{{EMAIL}}': profile.email,
    '{{LINKEDIN_URL}}': profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`,
    '{{LINKEDIN_DISPLAY}}': profile.linkedin,
    '{{PHONE}}': profile.phone,
    '{{LOCATION}}': profile.location,
    '{{SECTION_SUMMARY}}': data.section_summary || 'Professional Summary',
    '{{SUMMARY_TEXT}}': data.summary_text || '',
    '{{SECTION_COMPETENCIES}}': data.section_competencies || 'Core Competencies',
    '{{COMPETENCIES}}': competenciesHtml,
    '{{SECTION_EXPERIENCE}}': data.section_experience || 'Professional Experience',
    '{{EXPERIENCE}}': experienceHtml,
    '{{SECTION_PROJECTS}}': data.section_projects || 'Key Projects',
    '{{PROJECTS}}': projectsHtml,
    '{{SECTION_EDUCATION}}': data.section_education || 'Education',
    '{{EDUCATION}}': educationHtml,
    '{{SECTION_CERTIFICATIONS}}': data.section_certifications || 'Certifications',
    '{{CERTIFICATIONS}}': certificationsHtml,
    '{{SECTION_SKILLS}}': data.section_skills || 'Technical Proficiencies',
    '{{SKILLS}}': skillsHtml,
  };

  // Apply substitutions
  let html = template;
  for (const [key, value] of Object.entries(subs)) {
    html = html.replaceAll(key, value);
  }

  // Remove empty sections (sections where content placeholder was empty)
  // Match section divs that contain only a section-title and whitespace
  html = html.replace(
    /\s*<!-- [A-Z]+ -->\s*<div class="section[^"]*">\s*<div class="section-title">[^<]*<\/div>\s*(?:<[^>]+>\s*)*<\/div>/g,
    (match) => {
      // Keep if there's actual content beyond the section-title
      const afterTitle = match.replace(/<div class="section-title">[^<]*<\/div>/, '');
      const hasContent = afterTitle.replace(/<\/?[^>]+>/g, '').trim().length > 0;
      return hasContent ? match : '';
    }
  );

  await writeFile(outputPath, html, 'utf-8');

  console.log(`✅ Template filled: ${outputPath}`);
  console.log(`📏 Format: ${format.toUpperCase()}`);
  console.log(`📦 Size: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error(`❌ fill-template failed: ${err.message}`);
  process.exit(1);
});
