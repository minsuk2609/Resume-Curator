import React from 'react';

function BulletSection({ title, items = [], emptyLabel }) {
  const cleanItems = items.filter(Boolean);

  return (
    <section style={styles.section}>
      <h3 style={styles.heading}>{title}</h3>
      {cleanItems.length ? (
        <ul style={styles.list}>
          {cleanItems.map((item, idx) => (
            <li key={`${title}-${idx}`} style={styles.item}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.empty}>{emptyLabel}</p>
      )}
    </section>
  );
}

export default function JobFitInsights({ jobFitInsights }) {
  return (
    <div style={styles.container}>
      <BulletSection
        title="Likely Skills & Experience Look-Fors"
        items={jobFitInsights?.skillsExperienceLookFors}
        emptyLabel="No skills/experience insights generated."
      />
      <BulletSection
        title="Resume-Boosting Project Ideas"
        items={jobFitInsights?.projectIdeas}
        emptyLabel="No project ideas generated."
      />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  section: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  heading: {
    margin: '0 0 10px 0',
    fontSize: 16,
    color: '#111827',
  },
  list: {
    margin: 0,
    paddingLeft: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  item: {
    lineHeight: 1.5,
    color: '#374151',
  },
  empty: {
    margin: 0,
    color: '#6b7280',
    fontSize: 14,
  },
};
