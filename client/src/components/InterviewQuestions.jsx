import React from 'react';

function QuestionSection({ title, questions = [] }) {
  return (
    <section style={styles.section}>
      <h3 style={styles.heading}>{title}</h3>
      {questions.length ? (
        <ol style={styles.list}>
          {questions.map((question, idx) => (
            <li key={`${title}-${idx}`} style={styles.item}>
              {question}
            </li>
          ))}
        </ol>
      ) : (
        <p style={styles.empty}>No questions generated.</p>
      )}
    </section>
  );
}

export default function InterviewQuestions({ interviewQuestions }) {
  return (
    <div style={styles.container}>
      <QuestionSection title="Behavioral Questions" questions={interviewQuestions?.behavioral} />
      <QuestionSection title="Technical Questions" questions={interviewQuestions?.technical} />
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
