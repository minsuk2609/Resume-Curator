const express = require('express');
const multer = require('multer');
const { parseResume } = require('../services/parser');
const { scrapeJob } = require('../services/scraper');
const { tailorResumeAndGenerateQuestions } = require('../services/openai');
const { generateDiff } = require('../services/diff');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Parse uploaded resume file → plain text
router.post('/parse', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const text = await parseResume(req.file);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scrape job description from URL
router.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const text = await scrapeJob(url);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate tailored resume + diff
router.post('/tailor', async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: 'resumeText and jobDescription are required' });
  }

  try {
    const {
      tailoredResume,
      behavioralQuestions,
      technicalQuestions,
      behavioralAnswers,
      technicalAnswers,
      skillsExperienceLookFors,
      projectIdeas,
    } =
      await tailorResumeAndGenerateQuestions(resumeText, jobDescription);
    const diff = generateDiff(resumeText, tailoredResume);
    res.json({
      original: resumeText,
      tailored: tailoredResume,
      diff,
      interviewQuestions: {
        behavioral: behavioralQuestions.map((question, idx) => ({
          question,
          answer: behavioralAnswers[idx] || '',
        })),
        technical: technicalQuestions.map((question, idx) => ({
          question,
          answer: technicalAnswers[idx] || '',
        })),
      },
      jobFitInsights: {
        skillsExperienceLookFors,
        projectIdeas,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
