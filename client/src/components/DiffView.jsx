import React from 'react';

export default function DiffView({ diff }) {
  return (
    <div style={styles.container}>
      <p style={styles.legend}>
        <span style={styles.addedSwatch} /> Added &nbsp;
        <span style={styles.removedSwatch} /> Removed
      </p>
      <div style={styles.pre}>
        {diff.map((part, i) => (
          <span
            key={i}
            style={
              part.added
                ? styles.added
                : part.removed
                ? styles.removed
                : styles.unchanged
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 8 },
  legend: { fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 },
  addedSwatch: {
    display: 'inline-block',
    width: 12,
    height: 12,
    background: '#bbf7d0',
    border: '1px solid #86efac',
    borderRadius: 2,
  },
  removedSwatch: {
    display: 'inline-block',
    width: 12,
    height: 12,
    background: '#fecaca',
    border: '1px solid #fca5a5',
    borderRadius: 2,
  },
  pre: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'inherit',
    fontSize: 14,
    lineHeight: 1.8,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
  },
  added: { background: '#bbf7d0', borderRadius: 2 },
  removed: {
    background: '#fecaca',
    textDecoration: 'line-through',
    borderRadius: 2,
  },
  unchanged: {},
};
