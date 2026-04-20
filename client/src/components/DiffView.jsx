import React from 'react';

export default function DiffView({ diff, changeReasons = [] }) {
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
      <div style={styles.reasonBox}>
        <h3 style={styles.reasonHeading}>Why each change was made</h3>
        {!changeReasons.length && (
          <p style={styles.emptyLabel}>No specific change reasons were returned.</p>
        )}
        {!!changeReasons.length && (
          <ol style={styles.reasonList}>
            {changeReasons.map((item, idx) => (
              <li key={`${item.originalText}-${idx}`} style={styles.reasonItem}>
                <p style={styles.reasonText}>
                  <strong>Before:</strong> {item.originalText}
                </p>
                <p style={styles.reasonText}>
                  <strong>After:</strong> {item.updatedText}
                </p>
                <p style={styles.reasonText}>
                  <strong>Reason:</strong> {item.reason}
                </p>
              </li>
            ))}
          </ol>
        )}
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
  reasonBox: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  reasonHeading: { margin: '0 0 8px 0', fontSize: 15, color: '#111827' },
  emptyLabel: { margin: 0, color: '#6b7280', fontSize: 13 },
  reasonList: { margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  reasonItem: { color: '#111827' },
  reasonText: { margin: '2px 0', fontSize: 13, lineHeight: 1.5 },
};
