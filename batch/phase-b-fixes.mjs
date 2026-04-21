import { readFile, writeFile } from 'fs/promises';

const BASE = process.argv[2];

const SUMMARIES = {
  'thrive': 'Technology executive with fourteen years as CTO and eight years of product roadmap ownership for all dimensions of an internal enterprise platform, growing a single-service system into a multi-product platform with differentiated requirements per offering. Combines platform-product thinking, strategic prioritization, and technical-debt management with deep operator experience across managed services, cybersecurity, cloud migration, software development, and data and AI services. Trusted partner to executive teams on portfolio strategy, margin discipline via platform consolidation, and AI-era capability integration. Builds and governs the product function through methodology, multi-factor prioritization, and teams-of-teams delivery, providing continuity from the executive function through product-portfolio leadership.',

  'capital-one': 'Technology executive with fourteen years as CTO and eight years of product roadmap ownership for an enterprise platform in regulated fintech -- multi-site operations, credit counseling, and security and compliance at scale. Grew a single-service system into a variable multi-product platform with differentiated requirements, fees, and support per product line. Combines platform-product thinking, strategic prioritization, and technical-debt management with deep operator experience across cloud migration, AI-ready data foundations, application-system modernization, and SDLC governance. Trusted partner to executive teams on translating business strategy into AI-powered services and cloud-native internal tooling at enterprise scale. Builds and governs the product function through methodology, multi-factor prioritization, and teams-of-teams delivery, providing continuity from the executive function through senior product leadership.',

  'confidential-dir-pm': 'Technology executive with fourteen years as CTO and eight years of product roadmap ownership for an internal enterprise platform, growing a single-service system into a variable multi-product platform with differentiated requirements per product line. Combines platform-product thinking, strategic prioritization, and technical-debt management with deep operator experience across infrastructure modernization, software development, data and analytics, and enterprise architecture. Trusted partner to executive teams on portfolio strategy, multi-persona platform decisions, and revenue-relevant roadmap prioritization that balances sales-driven demand with engineering capacity. Builds and governs the product function through methodology, multi-factor prioritization, and teams-of-teams delivery, providing continuity from the executive function through product-portfolio leadership.',

  'recidiviz': 'Technology executive with fourteen years leading technology at a national nonprofit serving people in financial distress -- credit counseling, debt relief, and vulnerable populations under strict compliance regimes. Eight years of product roadmap ownership for the internal enterprise platform, growing a single-service system into a multi-product platform with differentiated requirements per offering. Combines platform-product thinking, strategic prioritization, and technical-debt management with deep people-system leadership -- career ladders, coaching ICs toward management, transparency-first culture, and highest-retention outcomes across the organization. Trusted partner to executive teams on operating in ambiguity, balancing mission and excellence, and embedding AI-assisted workflows into product practice. Builds and governs the product function through methodology, multi-factor prioritization, and teams-of-teams delivery -- carrying nonprofit operator context into mission-driven product leadership.',

  'leverage': 'Technology leader with a DBA-to-CTO arc: fourteen years leading enterprise technology at a national nonprofit, and eight years of product roadmap ownership for an internal enterprise platform that grew from a single-service system into a multi-product platform. Owned data governance, production ML deployment via DataRobot, and MSSQL / MPP-class warehousing -- SQL strong, not elite, grounded in a DBA foundation. Combines platform-product thinking, strategic prioritization, and technical-debt management with hands-on AI-assisted development practice (Claude, Copilot, agentic-AI evaluation frameworks) and operator-level fluency in SQL and Python. Trusted partner to executive teams on data product strategy, ambiguity-to-structure translation, and vendor / tool selection. Builds and governs the product function through methodology, multi-factor prioritization, and team-and-contractor orchestration -- carrying nonprofit operator context into mission-driven data product leadership.',
};

const CONSULTING_ENTRY_BASE = {
  company: 'Independent Consultant',
  period: 'Nov 2024 - Present',
  role: 'Technology Consultant',
  location: 'Houston, TX',
  bullets: [
    'Designed a structured, repeatable methodology to evaluate and compare generative AI architectures, with primary emphasis on agentic systems and their enterprise suitability.',
    'Engineered algorithmic evaluation frameworks to assess AI software platforms, integrated solutions, and standalone tools for regulated enterprise environments.',
  ],
};

const CONSULTING_THIRD_BULLETS = {
  'akumin':        'Advised enterprise healthcare leaders on HIPAA-aligned AI platform evaluation, data governance, and patient-privacy-preserving AI adoption decisions.',
  'alliantgroup':  'Advised enterprise leaders on AI adoption within regulated professional services, including managed-services integration, Center of Excellence design, and multi-site AI rollout sequencing.',
  'evolve-search': 'Advised enterprise leaders on technology modernization, AI adoption methodology, and vendor-selection decisions across diverse industries.',
  'incline':       'Advised regulated financial services and insurance leaders on data and AI platform evaluation, governance frameworks, and agentic-system suitability under regulatory scrutiny.',
  'logicmonitor':  'Advised enterprise leaders on AI-ready BI platform evaluation, data-platform consolidation strategy, and GenAI-enabled analytics vendor selection.',
  'marathon':      'Advised enterprise leaders on responsible AI governance, generative-AI evaluation methodology, and risk-managed AI adoption in regulated industrial contexts.',
};

const RICE_REPLACE_FROM = ' -- long personal connection to the institution. Houston-based; comfortable';
const RICE_REPLACE_TO   = '. Comfortable';

const LEVERAGE_PROJECTS = [
  {
    title: 'about-mknn',
    badge: 'Umbrella',
    desc: 'Personal landing page for public technical and AI work -- bio, active projects, tech stack, and posture. Links to the projects below. <a href="https://github.com/mknnmknn/about-mknn">github.com/mknnmknn/about-mknn</a>',
    tech: 'Portfolio + narrative'
  },
  {
    title: 'career-ops-dml',
    badge: 'Fork + Daily Use',
    desc: 'Running my executive job search on an open-source AI pipeline I forked and customized (github.com/mknnmknn/career-ops-dml). Live infrastructure, not an experiment -- evaluations, tailored CVs, and portal scans orchestrated through a Claude Code workflow.',
    tech: 'Node.js, Playwright, Claude, Markdown, YAML'
  },
  {
    title: 'Alemi Spells',
    badge: 'Full-Stack + Data',
    desc: 'Members-only web application for D&D 5e spell-card management and PDF generation. Complex import pipeline from Word documents into SQLite, dynamic multi-card text-overflow detection, Playwright-driven PDF generation, DigitalOcean deployment. End-to-end product from vision through public usage.',
    tech: 'Python, Flask, SQLite, Playwright, Jinja2, JavaScript'
  },
  {
    title: 'WBL -- Whirled Baseball League',
    badge: 'LLM Architecture',
    desc: 'Cross-era baseball simulation with an LLM co-commissioner system. Architecting LLM knowledge boundaries -- separating in-game knowledge from external historical data -- addresses system-memory architecture and on-demand data fetching for LLM context management.',
    tech: 'Python, LLM orchestration, simulation'
  },
  {
    title: 'i9s.org',
    badge: 'Public Data Project',
    desc: 'Negro Leagues historical statistical projection project -- humanities depth with rigorous data work, custom import engine, enhanced data displays, data-quality tooling and admin suite.',
    tech: 'Python, SQL, WordPress/Pods, Statistical Modeling'
  }
];

const results = [];

for (const [slug, summary] of Object.entries(SUMMARIES)) {
  const path = `${BASE}/${slug}.json`;
  const j = JSON.parse(await readFile(path, 'utf-8'));
  j.summary_text = summary;
  await writeFile(path, JSON.stringify(j, null, 2), 'utf-8');
  results.push(`Summary rewritten: ${slug}`);
}

for (const [slug, thirdBullet] of Object.entries(CONSULTING_THIRD_BULLETS)) {
  const path = `${BASE}/${slug}.json`;
  const j = JSON.parse(await readFile(path, 'utf-8'));
  const entry = {
    ...CONSULTING_ENTRY_BASE,
    bullets: [...CONSULTING_ENTRY_BASE.bullets, thirdBullet],
  };
  j.experience.unshift(entry);
  await writeFile(path, JSON.stringify(j, null, 2), 'utf-8');
  results.push(`Consulting entry prepended: ${slug}`);
}

{
  const path = `${BASE}/rice-university.json`;
  const j = JSON.parse(await readFile(path, 'utf-8'));
  const before = j.summary_text;
  j.summary_text = before.replace(RICE_REPLACE_FROM, RICE_REPLACE_TO);
  if (j.summary_text === before) {
    results.push('Rice edit: NO MATCH FOUND -- inspect manually');
  } else {
    await writeFile(path, JSON.stringify(j, null, 2), 'utf-8');
    results.push('Rice surgical edit applied');
  }
}

{
  const path = `${BASE}/leverage.json`;
  const j = JSON.parse(await readFile(path, 'utf-8'));
  j.projects = LEVERAGE_PROJECTS;
  await writeFile(path, JSON.stringify(j, null, 2), 'utf-8');
  results.push('Leverage projects enriched (5 projects incl. about-mknn umbrella)');
}

console.log(results.join('\n'));
