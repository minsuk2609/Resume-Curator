const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RESUME_LENGTH = 4000;
const MAX_JOB_LENGTH = 3000;

async function tailorResume(resumeText, jobDescription) {
  console.log("=== tailorResume CALLED ===");
  console.log("Resume length:", resumeText?.length);
  console.log("Job length:", jobDescription?.length);

  const trimmedResume = resumeText.slice(0, MAX_RESUME_LENGTH);
  const trimmedJob = jobDescription.slice(0, MAX_JOB_LENGTH);

  try {
    console.log("Sending request to OpenAI...");

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

STRICT RULES:
- DO NOT add new sections (no Summary, Additional Information, etc.)
- DO NOT change section titles
- DO NOT invent experience, skills, or achievements
- ONLY rewrite existing bullet points to better match the job description
- ONLY inject relevant keywords from the job description into existing content
- KEEP the exact same structure and order
- KEEP formatting simple plain text
- DO NOT add explanations or commentary

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

    console.log("OpenAI response received");

    const result = response.choices?.[0]?.message?.content?.trim();

    console.log("Result length:", result?.length);

    return result;
  } catch (err) {
    console.error("OPENAI ERROR:", err);
    throw err;
  }
}

module.exports = { tailorResume };