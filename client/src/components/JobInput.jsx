import React, { useState } from 'react';
import { scrapeJob } from '../api/client';

export default function JobInput({ onJobDescription }) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState('');

  async function handleScrape() {
    if (!url.trim()) return;
    setScraping(true);
    setError('');
    try {
      const jobText = await scrapeJob(url.trim());
      setText(jobText);
      onJobDescription(jobText);
    } catch (err) {
      setError('Failed to scrape URL. Paste the job description manually below.');
    } finally {
      setScraping(false);
    }
  }

  function handleTextChange(e) {
    setText(e.target.value);
    onJobDescription(e.target.value);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Job Description</h2>

      <div style={styles.urlRow}>
        <input
          type="url"
          placeholder="Paste job URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={styles.urlInput}
        />
        <button onClick={handleScrape} disabled={scraping || !url.trim()} style={styles.scrapeBtn}>
          {scraping ? 'Fetching…' : 'Fetch'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <textarea
        placeholder="Or paste the job description here…"
        value={text}
        onChange={handleTextChange}
        rows={10}
        style={styles.textarea}
      />
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 8 },
  heading: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  urlRow: { display: 'flex', gap: 8 },
  urlInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  },
  scrapeBtn: {
    padding: '8px 16px',
    background: '#374151',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
  },
  error: { fontSize: 13, color: '#dc2626' },
};
