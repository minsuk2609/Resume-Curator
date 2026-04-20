import React, { useState } from 'react';
import JobInput from './components/JobInput';
import ResumeUpload from './components/ResumeUpload';
import TailoredResume from './components/TailoredResume';
import DiffView from './components/DiffView';
import InterviewQuestions from './components/InterviewQuestions';
import JobFitInsights from './components/JobFitInsights';
import { tailorResume } from './api/client';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tailored');

  const canGenerate = jobDescription.trim() && resumeText.trim() && !loading;

  async function handleGenerate() {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await tailorResume(resumeText, jobDescription);
      setResult(data);
      setActiveTab('tailored');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Resume Curator</h1>
        <p style={styles.subtitle}>Tailor your resume to any job description, ATS-optimized</p>
      </header>

      <main style={styles.main}>
        <div style={styles.inputs}>
          <JobInput onJobDescription={setJobDescription} />
          <ResumeUpload onResumeText={setResumeText} />
        </div>

        <div style={styles.actions}>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{ ...styles.generateBtn, opacity: canGenerate ? 1 : 0.5 }}
          >
            {loading ? 'Tailoring resume…' : 'Tailor Resume'}
          </button>
          {!resumeText && <p style={styles.hint}>Upload a resume to get started</p>}
          {resumeText && !jobDescription && (
            <p style={styles.hint}>Add a job description to continue</p>
          )}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {result && (
          <div style={styles.output}>
            <div style={styles.tabs}>
              <button
                style={{ ...styles.tab, ...(activeTab === 'tailored' ? styles.tabActive : {}) }}
                onClick={() => setActiveTab('tailored')}
              >
                Tailored Resume
              </button>
              <button
                style={{ ...styles.tab, ...(activeTab === 'diff' ? styles.tabActive : {}) }}
                onClick={() => setActiveTab('diff')}
              >
                Diff View
              </button>
              <button
                style={{ ...styles.tab, ...(activeTab === 'questions' ? styles.tabActive : {}) }}
                onClick={() => setActiveTab('questions')}
              >
                Interview Questions
              </button>
              <button
                style={{ ...styles.tab, ...(activeTab === 'insights' ? styles.tabActive : {}) }}
                onClick={() => setActiveTab('insights')}
              >
                Job Fit Insights
              </button>
            </div>

            <div style={styles.tabContent}>
              {activeTab === 'tailored' && <TailoredResume text={result.tailored} />}
              {activeTab === 'diff' && <DiffView diff={result.diff} />}
              {activeTab === 'questions' && (
                <InterviewQuestions interviewQuestions={result.interviewQuestions} />
              )}
              {activeTab === 'insights' && (
                <JobFitInsights jobFitInsights={result.jobFitInsights} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  header: {
    background: '#111827',
    color: '#fff',
    padding: '24px 32px',
    textAlign: 'center',
  },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#9ca3af' },
  main: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  inputs: { display: 'flex', flexDirection: 'column', gap: 24 },
  actions: { display: 'flex', alignItems: 'center', gap: 16 },
  generateBtn: {
    padding: '12px 28px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  hint: { fontSize: 13, color: '#6b7280' },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#dc2626',
    fontSize: 14,
  },
  output: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  tabs: { display: 'flex', borderBottom: '1px solid #e5e7eb' },
  tab: {
    flex: 1,
    padding: '14px',
    background: 'none',
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    color: '#6b7280',
    cursor: 'pointer',
  },
  tabActive: {
    color: '#111827',
    borderBottom: '2px solid #2563eb',
    background: '#f9fafb',
  },
  tabContent: { padding: 16 },
};
