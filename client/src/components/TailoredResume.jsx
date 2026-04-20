import React, { useMemo, useState } from 'react';

function buildJsonResumeTemplate(tailoredText) {
  const now = new Date().toISOString();

  return {
    basics: {
      name: '',
      label: '',
      email: '',
      phone: '',
      location: {
        city: '',
        region: '',
        countryCode: '',
      },
      summary: tailoredText,
      profiles: [],
    },
    work: [],
    volunteer: [],
    education: [],
    awards: [],
    certificates: [],
    publications: [],
    skills: [],
    languages: [],
    interests: [],
    references: [],
    projects: [],
    meta: {
      canonical: '',
      version: 'v1.0.0',
      lastModified: now,
    },
  };
}

export default function TailoredResume({ text }) {
  const [copied, setCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const jsonResumeDraft = useMemo(() => buildJsonResumeTemplate(text), [text]);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyJson() {
    navigator.clipboard.writeText(JSON.stringify(jsonResumeDraft, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  }

  function handleDownloadJson() {
    const jsonBlob = new Blob([JSON.stringify(jsonResumeDraft, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tailored-resume.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleOpenJsonResume() {
    window.open('https://jsonresume.org/', '_blank', 'noopener,noreferrer');
  }

  return (
    <div style={styles.container}>
      <div style={styles.actions}>
        <button onClick={handleCopy} style={styles.secondaryBtn}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={handleCopyJson} style={styles.secondaryBtn}>
          {jsonCopied ? 'JSON Copied!' : 'Copy JSON'}
        </button>
        <button onClick={handleDownloadJson} style={styles.secondaryBtn}>
          Download JSON
        </button>
        <button onClick={handleOpenJsonResume} style={styles.primaryBtn}>
          Open JSON Resume
        </button>
      </div>

      <p style={styles.helperText}>
        Optional: download or copy the JSON draft, then use JSON Resume to create themed HTML and
        export to PDF.
      </p>

      <pre style={styles.pre}>{text}</pre>
    </div>
  );
}

const styles = {
  container: { position: 'relative' },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  primaryBtn: {
    padding: '6px 12px',
    fontSize: 12,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '6px 12px',
    fontSize: 12,
    background: '#374151',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  helperText: {
    margin: '4px 0 12px',
    color: '#6b7280',
    fontSize: 12,
  },
  pre: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'inherit',
    fontSize: 14,
    lineHeight: 1.6,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '16px 16px 16px 16px',
    minHeight: 200,
  },
};
