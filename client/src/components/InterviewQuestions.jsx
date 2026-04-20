import React from 'react';

function normalizeQuestionItem(item) {
  if (typeof item === 'string') {
    return { question: item, answer: '' };
  }
  if (item && typeof item === 'object') {
    return {
      question: item.question || '',
      answer: item.answer || '',
    };
  }
  return { question: '', answer: '' };
}

function QuestionSection({ title, questions = [] }) {
  const normalizedQuestions = questions.map(normalizeQuestionItem).filter((item) => item.question);

  return (
    <section style={styles.section}>
      <h3 style={styles.heading}>{title}</h3>
      {normalizedQuestions.length ? (
        <ol style={styles.list}>
          {normalizedQuestions.map((item, idx) => (
            <li key={`${title}-${idx}`} style={styles.item}>
              <p style={styles.question}>{item.question}</p>
              {item.answer && <p style={styles.answer}>{item.answer}</p>}
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
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  question: {
    margin: 0,
    fontWeight: 600,
    color: '#1f2937',
  },
  answer: {
    margin: 0,
    color: '#4b5563',
    fontSize: 14,
  },
  empty: {
    margin: 0,
    color: '#6b7280',
    fontSize: 14,
  },
};
