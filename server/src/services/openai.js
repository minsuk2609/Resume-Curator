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
2) Behavioral interview questions and concise high-quality sample answers.
3) Technical interview questions and concise high-quality sample answers.
4) A short list of likely skills/experience areas this job posting is looking for.
5) Practical project ideas that could strengthen this candidate's resume for this job.

Return this JSON shape exactly:
{
  "tailoredResume": "string",
  "changeReasons": [
    {
      "originalText": "string",
      "updatedText": "string",
      "reason": "string"
    }
  ],
  "behavioralQuestions": ["string", "..."],
  "technicalQuestions": ["string", "..."],
  "behavioralAnswers": ["string", "..."],
  "technicalAnswers": ["string", "..."],
  "skillsExperienceLookFors": ["string", "..."],
  "projectIdeas": ["string", "..."]
}

Requirements:
- Tailored resume should keep core facts truthful.
- Generate 5-8 behavioral questions tied to role responsibilities and resume experiences.
- Generate 5-8 technical questions tied to job requirements and candidate background.
- Provide one answer for each question in the same order.
- Keep each answer to 2-4 sentences with concrete details from the resume/job description.
- Questions should be clear, specific, and interview-ready.
- Generate 5-8 concise bullets for skillsExperienceLookFors based on role expectations.
- Generate 4-6 concise bullets for projectIdeas tailored to this role and candidate context.
- Keep look-fors and project ideas specific, realistic, and action-oriented.
- Include 5-12 itemized changeReasons entries, each tied to a specific resume edit.
- For each changeReasons entry, keep originalText and updatedText short exact snippets from the resume.
- reason must explain why that exact change improves fit for the job description.

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
    const changeReasons = Array.isArray(parsed.changeReasons)
      ? parsed.changeReasons
          .map((item) => ({
            originalText: (item?.originalText || '').trim(),
            updatedText: (item?.updatedText || '').trim(),
            reason: (item?.reason || '').trim(),
          }))
          .filter((item) => item.originalText && item.updatedText && item.reason)
      : [];
    const behavioralQuestions = Array.isArray(parsed.behavioralQuestions)
      ? parsed.behavioralQuestions.filter(Boolean)
      : [];
    const technicalQuestions = Array.isArray(parsed.technicalQuestions)
      ? parsed.technicalQuestions.filter(Boolean)
      : [];
    const behavioralAnswers = Array.isArray(parsed.behavioralAnswers)
      ? parsed.behavioralAnswers.filter(Boolean)
      : [];
    const technicalAnswers = Array.isArray(parsed.technicalAnswers)
      ? parsed.technicalAnswers.filter(Boolean)
      : [];
    const skillsExperienceLookFors = Array.isArray(parsed.skillsExperienceLookFors)
      ? parsed.skillsExperienceLookFors.filter(Boolean)
      : [];
    const projectIdeas = Array.isArray(parsed.projectIdeas)
      ? parsed.projectIdeas.filter(Boolean)
      : [];

    if (!tailoredResume) {
      throw new Error('Model did not return a tailored resume.');
    }

    console.log('Tailored length:', tailoredResume.length);
    console.log('Change reasons:', changeReasons.length);
    console.log('Behavioral questions:', behavioralQuestions.length);
    console.log('Technical questions:', technicalQuestions.length);
    console.log('Behavioral answers:', behavioralAnswers.length);
    console.log('Technical answers:', technicalAnswers.length);
    console.log('Skills/experience look-fors:', skillsExperienceLookFors.length);
    console.log('Project ideas:', projectIdeas.length);

    return {
      tailoredResume,
      changeReasons,
      behavioralQuestions,
      technicalQuestions,
      behavioralAnswers,
      technicalAnswers,
      skillsExperienceLookFors,
      projectIdeas,
    };
  } catch (err) {
    console.error('OPENAI ERROR:', err);
    throw err;
  }
}

module.exports = { tailorResumeAndGenerateQuestions };
