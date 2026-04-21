import React, { useState } from 'react';
import { exportResumePdf } from '../api/client';

function formatDate(d) {
  if (!d) return '';
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
  if (s) return `${s} – Present`;
  return '';
}

function SectionHeader({ title }) {
  return <h3 style={styles.sectionHeader}>{title}</h3>;
}

function WorkItem({ item }) {
  return (
    <div style={styles.item}>
      <div style={styles.itemHeader}>
        <div>
          <span style={styles.itemTitle}>{item.position}</span>
          {item.name && <span style={styles.itemSubtitle}> · {item.name}</span>}
        </div>
        {(item.startDate || item.endDate) && (
          <span style={styles.itemDate}>{dateRange(item.startDate, item.endDate)}</span>
        )}
      </div>
      {item.summary && <div style={styles.itemSummary}>{item.summary}</div>}
      {Array.isArray(item.highlights) && item.highlights.length > 0 && (
        <ul style={styles.highlights}>
          {item.highlights.map((h, i) => <li key={i} style={styles.highlightItem}>{h}</li>)}
        </ul>
      )}
    </div>
  );
}

function EducationItem({ item }) {
  const degree = [item.studyType, item.area].filter(Boolean).join(' in ');
  return (
    <div style={styles.item}>
      <div style={styles.itemHeader}>
        <div>
          <span style={styles.itemTitle}>{degree || item.institution}</span>
          {degree && item.institution && <span style={styles.itemSubtitle}> · {item.institution}</span>}
        </div>
        {(item.startDate || item.endDate) && (
          <span style={styles.itemDate}>{dateRange(item.startDate, item.endDate)}</span>
        )}
      </div>
      {item.score && <div style={styles.itemSummary}>GPA: {item.score}</div>}
      {Array.isArray(item.courses) && item.courses.length > 0 && (
        <div style={styles.itemSummary}>{item.courses.join(', ')}</div>
      )}
    </div>
  );
}

function ProjectItem({ item }) {
  return (
    <div style={styles.item}>
      <div style={styles.itemHeader}>
        <span style={styles.itemTitle}>{item.name}</span>
        {(item.startDate || item.endDate) && (
          <span style={styles.itemDate}>{dateRange(item.startDate, item.endDate)}</span>
        )}
      </div>
      {item.description && <div style={styles.itemSummary}>{item.description}</div>}
      {Array.isArray(item.highlights) && item.highlights.length > 0 && (
        <ul style={styles.highlights}>
          {item.highlights.map((h, i) => <li key={i} style={styles.highlightItem}>{h}</li>)}
        </ul>
      )}
      {Array.isArray(item.keywords) && item.keywords.length > 0 && (
        <div style={styles.keywords}>
          {item.keywords.map((k, i) => <span key={i} style={styles.keyword}>{k}</span>)}
        </div>
      )}
    </div>
  );
}

export default function TailoredResume({ jsonResume }) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  if (!jsonResume) return null;

  const b = jsonResume.basics || {};
  const loc = b.location || {};
  const locationStr = [loc.city, loc.region, loc.countryCode].filter(Boolean).join(', ');
  const contactParts = [b.email, b.phone, locationStr, b.url].filter(Boolean);
  if (Array.isArray(b.profiles)) {
    b.profiles.forEach(p => { if (p.url || p.username) contactParts.push(p.url || p.username); });
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(jsonResume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${b.name ? b.name.replace(/\s+/g, '-').toLowerCase() + '-' : ''}resume.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportPdf() {
    setExporting(true);
    setExportError('');
    try {
      const blob = await exportResumePdf(jsonResume);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${b.name ? b.name.replace(/\s+/g, '-').toLowerCase() + '-' : ''}resume.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError('PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  const hasWork = Array.isArray(jsonResume.work) && jsonResume.work.length > 0;
  const hasEducation = Array.isArray(jsonResume.education) && jsonResume.education.length > 0;
  const hasSkills = Array.isArray(jsonResume.skills) && jsonResume.skills.length > 0;
  const hasProjects = Array.isArray(jsonResume.projects) && jsonResume.projects.length > 0;
  const hasAwards = Array.isArray(jsonResume.awards) && jsonResume.awards.length > 0;
  const hasCerts = Array.isArray(jsonResume.certificates) && jsonResume.certificates.length > 0;
  const hasVolunteer = Array.isArray(jsonResume.volunteer) && jsonResume.volunteer.length > 0;
  const hasLanguages = Array.isArray(jsonResume.languages) && jsonResume.languages.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.actions}>
        <button onClick={handleDownloadJson} style={styles.secondaryBtn}>
          Download JSON
        </button>
        <button onClick={handleExportPdf} disabled={exporting} style={styles.primaryBtn}>
          {exporting ? 'Generating PDF…' : 'Export PDF'}
        </button>
      </div>
      {exportError && <p style={styles.exportError}>{exportError}</p>}

      <div style={styles.resumeCard}>
        {/* Header */}
        <div style={styles.resumeHeader}>
          {b.name && <h1 style={styles.name}>{b.name}</h1>}
          {b.label && <div style={styles.label}>{b.label}</div>}
          {contactParts.length > 0 && (
            <div style={styles.contact}>
              {contactParts.map((c, i) => (
                <span key={i} style={styles.contactItem}>{c}</span>
              ))}
            </div>
          )}
        </div>

        <hr style={styles.divider} />

        {/* Summary */}
        {b.summary && (
          <div style={styles.section}>
            <SectionHeader title="Summary" />
            <p style={styles.summary}>{b.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {hasWork && (
          <div style={styles.section}>
            <SectionHeader title="Experience" />
            {jsonResume.work.map((w, i) => <WorkItem key={i} item={w} />)}
          </div>
        )}

        {/* Education */}
        {hasEducation && (
          <div style={styles.section}>
            <SectionHeader title="Education" />
            {jsonResume.education.map((e, i) => <EducationItem key={i} item={e} />)}
          </div>
        )}

        {/* Skills */}
        {hasSkills && (
          <div style={styles.section}>
            <SectionHeader title="Skills" />
            <div style={styles.skillsGrid}>
              {jsonResume.skills.map((s, i) => (
                <div key={i} style={styles.skillGroup}>
                  <span style={styles.skillName}>{s.name}</span>
                  {Array.isArray(s.keywords) && s.keywords.length > 0 && (
                    <span style={styles.skillKeywords}>{s.keywords.join(', ')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {hasProjects && (
          <div style={styles.section}>
            <SectionHeader title="Projects" />
            {jsonResume.projects.map((p, i) => <ProjectItem key={i} item={p} />)}
          </div>
        )}

        {/* Volunteer */}
        {hasVolunteer && (
          <div style={styles.section}>
            <SectionHeader title="Volunteer" />
            {jsonResume.volunteer.map((v, i) => (
              <WorkItem key={i} item={{ ...v, name: v.organization, position: v.position }} />
            ))}
          </div>
        )}

        {/* Awards */}
        {hasAwards && (
          <div style={styles.section}>
            <SectionHeader title="Awards" />
            {jsonResume.awards.map((a, i) => (
              <div key={i} style={styles.item}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemTitle}>{a.title}</span>
                  {a.date && <span style={styles.itemDate}>{formatDate(a.date)}</span>}
                </div>
                {a.awarder && <div style={styles.itemSubtitle}>{a.awarder}</div>}
                {a.summary && <div style={styles.itemSummary}>{a.summary}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Certificates */}
        {hasCerts && (
          <div style={styles.section}>
            <SectionHeader title="Certificates" />
            {jsonResume.certificates.map((c, i) => (
              <div key={i} style={styles.item}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemTitle}>{c.name}</span>
                  {c.date && <span style={styles.itemDate}>{formatDate(c.date)}</span>}
                </div>
                {c.issuer && <div style={styles.itemSubtitle}>{c.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {hasLanguages && (
          <div style={styles.section}>
            <SectionHeader title="Languages" />
            <div style={styles.skillsGrid}>
              {jsonResume.languages.map((l, i) => (
                <div key={i} style={styles.skillGroup}>
                  <span style={styles.skillName}>{l.language}</span>
                  {l.fluency && <span style={styles.skillKeywords}>{l.fluency}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { position: 'relative' },
  actions: { display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  primaryBtn: {
    padding: '6px 14px',
    fontSize: 12,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 600,
  },
  secondaryBtn: {
    padding: '6px 14px',
    fontSize: 12,
    background: '#374151',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  exportError: { color: '#dc2626', fontSize: 12, marginBottom: 8 },
  resumeCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '24px 28px',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  resumeHeader: { marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 700, margin: '0 0 2px', color: '#111827' },
  label: { fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 500 },
  contact: { display: 'flex', flexWrap: 'wrap', gap: '2px 12px', fontSize: 11, color: '#9ca3af' },
  contactItem: {},
  divider: { border: 'none', borderTop: '1.5px solid #2563eb', margin: '12px 0' },
  section: { marginBottom: 16 },
  sectionHeader: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#2563eb',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 3,
    marginBottom: 10,
  },
  summary: { fontSize: 12, color: '#374151', lineHeight: 1.6, margin: 0 },
  item: { marginBottom: 10 },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  itemTitle: { fontWeight: 600, fontSize: 12, color: '#111827' },
  itemSubtitle: { fontSize: 11.5, color: '#6b7280' },
  itemDate: { fontSize: 10.5, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 },
  itemSummary: { marginTop: 2, fontSize: 11, color: '#4b5563' },
  highlights: { marginTop: 4, paddingLeft: 14, margin: '4px 0 0 14px' },
  highlightItem: { fontSize: 11, color: '#374151', marginBottom: 2, lineHeight: 1.5 },
  keywords: { marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 4 },
  keyword: {
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: 3,
    padding: '1px 6px',
    fontSize: 10,
  },
  skillsGrid: { display: 'flex', flexDirection: 'column', gap: 4 },
  skillGroup: { display: 'flex', gap: 6, alignItems: 'baseline' },
  skillName: { fontWeight: 600, fontSize: 11.5, minWidth: 100, color: '#111827' },
  skillKeywords: { fontSize: 11, color: '#6b7280' },
};
