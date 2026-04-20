const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RESUME_LENGTH = 4000;
const MAX_JOB_LENGTH = 3000;

async function tailorResumeAndGenerateQuestions(resumeText, jobDescription) {
  console.log('=== tailorResumeAndGenerateQuestions CALLED ===');
  console.log('Resume length:', resumeText?.length);
  console.log('Job length:', jobDescription?.length);

  const trimmedResume = resumeText.slice(0, MAX_RESUME_LENGTH);
  const trimmedJob = jobDescription.slice(0, MAX_JOB_LENGTH);

  try {
    console.log('Sending request to OpenAI...');

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a professional resume writer and interview coach. Return valid JSON only.',
        },
        {
          role: 'user',
          content: `Use the job description and resume to create:
1) A tailored resume.
2) Behavioral interview questions.
3) Technical interview questions.

Return this JSON shape exactly:
{
  "tailoredResume": "string",
  "behavioralQuestions": ["string", "..."],
  "technicalQuestions": ["string", "..."]
}

Requirements:
- Tailored resume should keep core facts truthful.
- Generate 5-8 behavioral questions tied to role responsibilities and resume experiences.
- Generate 5-8 technical questions tied to job requirements and candidate background.
- Questions should be clear, specific, and interview-ready.

JOB DESCRIPTION:
${trimmedJob}

RESUME:
${trimmedResume}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 2300,
    });

    console.log('OpenAI response received');

    const content = response.choices?.[0]?.message?.content?.trim();
    const parsed = JSON.parse(content || '{}');

    const tailoredResume = (parsed.tailoredResume || '').trim();
    const behavioralQuestions = Array.isArray(parsed.behavioralQuestions)
      ? parsed.behavioralQuestions.filter(Boolean)
      : [];
    const technicalQuestions = Array.isArray(parsed.technicalQuestions)
      ? parsed.technicalQuestions.filter(Boolean)
      : [];

    if (!tailoredResume) {
      throw new Error('Model did not return a tailored resume.');
    }

    console.log('Tailored length:', tailoredResume.length);
    console.log('Behavioral questions:', behavioralQuestions.length);
    console.log('Technical questions:', technicalQuestions.length);

    return { tailoredResume, behavioralQuestions, technicalQuestions };
  } catch (err) {
    console.error('OPENAI ERROR:', err);
    throw err;
  }
}

module.exports = { tailorResumeAndGenerateQuestions };
