import React, { useState } from 'react';

export default function TailoredResume({ text }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={styles.container}>
      <button onClick={handleCopy} style={styles.copyBtn}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre style={styles.pre}>{text}</pre>
    </div>
  );
}

const styles = {
  container: { position: 'relative' },
  copyBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: '4px 12px',
    fontSize: 12,
    background: '#374151',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
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
