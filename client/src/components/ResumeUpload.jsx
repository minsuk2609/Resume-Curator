import React, { useRef, useState } from 'react';
import { parseResume } from '../api/client';

export default function ResumeUpload({ onResumeText }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }
    setError('');
    setFileName(file.name);
    setParsing(true);
    try {
      const text = await parseResume(file);
      onResumeText(text);
    } catch (err) {
      setError('Failed to parse resume. Please try another file.');
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Resume</h2>
      <div
        style={styles.dropzone}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {parsing ? (
          <p style={styles.hint}>Parsing resume…</p>
        ) : fileName ? (
          <p style={styles.fileName}>{fileName}</p>
        ) : (
          <p style={styles.hint}>
            Drop your PDF or DOCX here, or <span style={styles.link}>browse</span>
          </p>
        )}
      </div>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 8 },
  heading: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  dropzone: {
    border: '2px dashed #d1d5db',
    borderRadius: 8,
    padding: '32px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#fafafa',
    transition: 'border-color 0.2s',
  },
  hint: { fontSize: 14, color: '#6b7280' },
  fileName: { fontSize: 14, color: '#111827', fontWeight: 500 },
  link: { color: '#2563eb', textDecoration: 'underline' },
  error: { fontSize: 13, color: '#dc2626' },
};
