const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RESUME_LENGTH = 4000;
const MAX_JOB_LENGTH = 3000;

async function tailorResume(resumeText, jobDescription) {
  const trimmedResume = resumeText.slice(0, MAX_RESUME_LENGTH);
  const trimmedJob = jobDescription.slice(0, MAX_JOB_LENGTH);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a professional resume writer. Your job is to tailor resumes to specific job descriptions.',
      },
      {
        role: 'user',
        content: `Rewrite and tailor this resume to match the job description below.

Goals:
- Optimize for ATS systems by including relevant keywords from the job description
- Improve bullet points to highlight relevant experience
- Do NOT fabricate or invent any experience, skills, or accomplishments
- Keep the same overall structure and sections
- Output plain text only (no markdown, no asterisks, no special formatting)

JOB DESCRIPTION:
${trimmedJob}

RESUME:
${trimmedResume}

Output only the tailored resume text, nothing else.`,
      },
    ],
    temperature: 0.4,
    max_tokens: 2000,
  });

  return response.choices[0].message.content.trim();
}

module.exports = { tailorResume };
