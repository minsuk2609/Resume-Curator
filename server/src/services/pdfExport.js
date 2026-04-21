const { chromium } = require('playwright');

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(d) {
  if (!d) return '';
  // Accept YYYY-MM or YYYY
  const parts = String(d).split('-');
  if (parts.length === 2) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const m = parseInt(parts[1], 10) - 1;
    return `${months[m] || ''} ${parts[0]}`;
  }
  return String(d);
}

function dateRange(start, end) {
  const s = formatDate(start);
  const e = end && String(end).toLowerCase() !== 'present' ? formatDate(end) : (end ? 'Present' : '');
  if (s && e) return `${s} – ${e}`;
  if (s) return s;
  return '';
}

function jsonResumeToHtml(resume) {
  const b = resume.basics || {};
  const loc = b.location || {};

  const locationStr = [loc.city, loc.region, loc.countryCode].filter(Boolean).join(', ');
  const contactItems = [
    b.email ? `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : '',
    b.phone ? esc(b.phone) : '',
    locationStr ? esc(locationStr) : '',
    b.url ? `<a href="${esc(b.url)}">${esc(b.url)}</a>` : '',
    ...(Array.isArray(b.profiles) ? b.profiles.map(p =>
      p.url ? `<a href="${esc(p.url)}">${esc(p.network || p.username)}</a>` : esc(p.network || p.username)
    ) : []),
  ].filter(Boolean);

  function section(title, content) {
    if (!content) return '';
    return `
      <section>
        <h2>${esc(title)}</h2>
        ${content}
      </section>`;
  }

  function item({ title, subtitle, date, summary, highlights, keywords }) {
    return `
      <div class="item">
        <div class="item-header">
          <div>
            <span class="item-title">${title || ''}</span>
            ${subtitle ? `<span class="item-subtitle"> · ${subtitle}</span>` : ''}
          </div>
          ${date ? `<span class="item-date">${date}</span>` : ''}
        </div>
        ${summary ? `<div class="item-summary">${esc(summary)}</div>` : ''}
        ${Array.isArray(highlights) && highlights.length ? `<ul class="highlights">${highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        ${Array.isArray(keywords) && keywords.length ? `<div class="keywords">${keywords.map(k => `<span class="keyword">${esc(k)}</span>`).join(' ')}</div>` : ''}
      </div>`;
  }

  const workHtml = Array.isArray(resume.work) && resume.work.length
    ? section('Experience', resume.work.map(w => item({
        title: esc(w.position),
        subtitle: esc(w.name),
        date: dateRange(w.startDate, w.endDate),
        summary: w.summary,
        highlights: w.highlights,
      })).join(''))
    : '';

  const educationHtml = Array.isArray(resume.education) && resume.education.length
    ? section('Education', resume.education.map(e => item({
        title: esc([e.studyType, e.area].filter(Boolean).join(' in ')),
        subtitle: esc(e.institution),
        date: dateRange(e.startDate, e.endDate),
        summary: e.score ? `GPA: ${e.score}` : '',
        highlights: e.courses,
      })).join(''))
    : '';

  const skillsHtml = Array.isArray(resume.skills) && resume.skills.length
    ? section('Skills', `<div class="skills-grid">${resume.skills.map(s => `
        <div class="skill-group">
          <span class="skill-name">${esc(s.name)}</span>
          ${Array.isArray(s.keywords) && s.keywords.length ? `<span class="skill-keywords">${s.keywords.map(k => esc(k)).join(', ')}</span>` : ''}
        </div>`).join('')}</div>`)
    : '';

  const projectsHtml = Array.isArray(resume.projects) && resume.projects.length
    ? section('Projects', resume.projects.map(p => item({
        title: p.url ? `<a href="${esc(p.url)}">${esc(p.name)}</a>` : esc(p.name),
        subtitle: '',
        date: dateRange(p.startDate, p.endDate),
        summary: p.description,
        highlights: p.highlights,
        keywords: p.keywords,
      })).join(''))
    : '';

  const awardsHtml = Array.isArray(resume.awards) && resume.awards.length
    ? section('Awards', resume.awards.map(a => item({
        title: esc(a.title),
        subtitle: esc(a.awarder),
        date: formatDate(a.date),
        summary: a.summary,
      })).join(''))
    : '';

  const certsHtml = Array.isArray(resume.certificates) && resume.certificates.length
    ? section('Certificates', resume.certificates.map(c => item({
        title: esc(c.name),
        subtitle: esc(c.issuer),
        date: formatDate(c.date),
      })).join(''))
    : '';

  const volunteerHtml = Array.isArray(resume.volunteer) && resume.volunteer.length
    ? section('Volunteer', resume.volunteer.map(v => item({
        title: esc(v.position),
        subtitle: esc(v.organization),
        date: dateRange(v.startDate, v.endDate),
        summary: v.summary,
        highlights: v.highlights,
      })).join(''))
    : '';

  const languagesHtml = Array.isArray(resume.languages) && resume.languages.length
    ? section('Languages', `<div class="skills-grid">${resume.languages.map(l => `
        <div class="skill-group">
          <span class="skill-name">${esc(l.language)}</span>
          ${l.fluency ? `<span class="skill-keywords">${esc(l.fluency)}</span>` : ''}
        </div>`).join('')}</div>`)
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11.5px;
    color: #1a1a1a;
    background: #fff;
    padding: 32px 40px;
    line-height: 1.5;
  }
  a { color: #2563eb; text-decoration: none; }
  header { margin-bottom: 20px; }
  header h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 3px; }
  header .label { font-size: 13px; color: #4b5563; margin-bottom: 8px; font-weight: 500; }
  header .contact {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-size: 11px;
    color: #6b7280;
  }
  header .contact span::before { content: ''; }
  .divider { border: none; border-top: 1.5px solid #2563eb; margin: 14px 0; }
  section { margin-bottom: 16px; }
  section h2 {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #2563eb;
    margin-bottom: 8px;
    padding-bottom: 3px;
    border-bottom: 1px solid #e5e7eb;
  }
  .summary { font-size: 11.5px; color: #374151; line-height: 1.6; }
  .item { margin-bottom: 10px; }
  .item:last-child { margin-bottom: 0; }
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  .item-title { font-weight: 600; font-size: 12px; }
  .item-subtitle { color: #6b7280; font-size: 11.5px; }
  .item-date { font-size: 10.5px; color: #9ca3af; white-space: nowrap; flex-shrink: 0; }
  .item-summary { margin-top: 3px; color: #4b5563; font-size: 11px; }
  ul.highlights { margin-top: 4px; padding-left: 14px; }
  ul.highlights li { margin-bottom: 2px; font-size: 11px; color: #374151; }
  .keywords { margin-top: 5px; display: flex; flex-wrap: wrap; gap: 4px; }
  .keyword {
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 3px;
    padding: 1px 6px;
    font-size: 10px;
  }
  .skills-grid { display: flex; flex-direction: column; gap: 4px; }
  .skill-group { display: flex; gap: 6px; align-items: baseline; }
  .skill-name { font-weight: 600; font-size: 11.5px; min-width: 100px; }
  .skill-keywords { color: #6b7280; font-size: 11px; }
</style>
</head>
<body>
  <header>
    <h1>${esc(b.name) || 'Resume'}</h1>
    ${b.label ? `<div class="label">${esc(b.label)}</div>` : ''}
    ${contactItems.length ? `<div class="contact">${contactItems.map(c => `<span>${c}</span>`).join('')}</div>` : ''}
  </header>
  <hr class="divider" />
  ${b.summary ? section('Summary', `<div class="summary">${esc(b.summary)}</div>`) : ''}
  ${workHtml}
  ${educationHtml}
  ${skillsHtml}
  ${projectsHtml}
  ${awardsHtml}
  ${certsHtml}
  ${volunteerHtml}
  ${languagesHtml}
</body>
</html>`;
}

async function exportToPdf(jsonResume) {
  const html = jsonResumeToHtml(jsonResume);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

module.exports = { exportToPdf };