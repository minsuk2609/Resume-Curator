const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RESUME_LENGTH = 6000;
const MAX_JOB_LENGTH = 10000;

function parseJsonSafely(rawContent) {
  if (!rawContent) return {};

  try {
    return JSON.parse(rawContent);
  } catch (initialError) {
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw initialError;
    }

    const candidate = rawContent.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (secondError) {
      const withoutTrailingCommas = candidate.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(withoutTrailingCommas);
    }
  }
}

function normalizeJsonResume(raw) {
  const r = raw || {};
  const b = r.basics || {};
  return {
    basics: {
      name: b.name || '',
      label: b.label || '',
      email: b.email || '',
      phone: b.phone || '',
      url: b.url || '',
      summary: b.summary || '',
      location: {
        address: b.location?.address || '',
        city: b.location?.city || '',
        region: b.location?.region || '',
        countryCode: b.location?.countryCode || '',
        postalCode: b.location?.postalCode || '',
      },
      profiles: Array.isArray(b.profiles)
        ? b.profiles
            .filter(p => p.url && p.url !== b.url)
            .filter((p, i, arr) => arr.findIndex(q => q.url === p.url) === i)
        : [],
    },
    work: Array.isArray(r.work) ? r.work : [],
    education: Array.isArray(r.education)
      ? r.education.map(e => {
          const entry = { ...e };
          if (!entry.score || /^(n\/a|none|null|-)$/i.test(String(entry.score).trim())) {
            delete entry.score;
          }
          return entry;
        })
      : [],
    skills: Array.isArray(r.skills) ? r.skills : [],
    projects: Array.isArray(r.projects) ? r.projects : [],
    awards: Array.isArray(r.awards) ? r.awards : [],
    certificates: Array.isArray(r.certificates) ? r.certificates : [],
    publications: Array.isArray(r.publications) ? r.publications : [],
    volunteer: Array.isArray(r.volunteer) ? r.volunteer : [],
    languages: Array.isArray(r.languages) ? r.languages : [],
    interests: Array.isArray(r.interests) ? r.interests : [],
    references: Array.isArray(r.references) ? r.references : [],
    meta: {
      version: 'v1.0.0',
      lastModified: new Date().toISOString(),
    },
  };
}

function jsonResumeToText(resume) {
  if (!resume) return '';
  const parts = [];

  const b = resume.basics || {};
  if (b.name) parts.push(b.name);
  if (b.label) parts.push(b.label);
  const contact = [b.email, b.phone].filter(Boolean).join(' | ');
  if (contact) parts.push(contact);
  if (b.summary) parts.push('\nSUMMARY\n' + b.summary);

  if (Array.isArray(resume.work) && resume.work.length) {
    parts.push('\nEXPERIENCE');
    for (const w of resume.work) {
      const header = [w.position, w.name, [w.startDate, w.endDate].filter(Boolean).join(' – ')].filter(Boolean).join(' | ');
      parts.push(header);
      if (w.summary) parts.push(w.summary);
      if (Array.isArray(w.highlights)) parts.push(...w.highlights.map(h => '• ' + h));
    }
  }

  if (Array.isArray(resume.education) && resume.education.length) {
    parts.push('\nEDUCATION');
    for (const e of resume.education) {
      const header = [e.studyType, e.area, e.institution, [e.startDate, e.endDate].filter(Boolean).join(' – ')].filter(Boolean).join(' | ');
      parts.push(header);
      if (e.score) parts.push('GPA: ' + e.score);
      if (Array.isArray(e.courses) && e.courses.length) parts.push(e.courses.join(', '));
    }
  }

  if (Array.isArray(resume.skills) && resume.skills.length) {
    parts.push('\nSKILLS');
    parts.push(resume.skills.map(s => s.name + (Array.isArray(s.keywords) && s.keywords.length ? ': ' + s.keywords.join(', ') : '')).join('\n'));
  }

  if (Array.isArray(resume.projects) && resume.projects.length) {
    parts.push('\nPROJECTS');
    for (const p of resume.projects) {
      parts.push(p.name || '');
      if (p.description) parts.push(p.description);
      if (Array.isArray(p.highlights)) parts.push(...p.highlights.map(h => '• ' + h));
    }
  }

  if (Array.isArray(resume.awards) && resume.awards.length) {
    parts.push('\nAWARDS');
    parts.push(resume.awards.map(a => [a.title, a.awarder].filter(Boolean).join(', ')).join('\n'));
  }

  if (Array.isArray(resume.certificates) && resume.certificates.length) {
    parts.push('\nCERTIFICATES');
    parts.push(resume.certificates.map(c => [c.name, c.issuer].filter(Boolean).join(', ')).join('\n'));
  }

  return parts.join('\n');
}

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
1) A tailored resume in JSON Resume format (jsonresume.org schema v1).
2) Behavioral interview questions and concise high-quality sample answers.
3) Technical interview questions and concise high-quality sample answers.
4) A short list of likely skills/experience areas this job posting is looking for.
5) Practical project ideas that could strengthen this candidate's resume for this job.

Return this JSON shape exactly:
{
  "jsonResume": {
    "basics": {
      "name": "string",
      "label": "string (professional title/role)",
      "email": "string",
      "phone": "string",
      "url": "string",
      "summary": "string (2-4 sentence tailored professional summary)",
      "location": { "city": "string", "region": "string", "countryCode": "string" },
      "profiles": [{ "network": "string", "username": "string", "url": "string" }] (only include profiles explicitly present in the resume - do not fabricate GitHub, LinkedIn, or any other profile links)
    },
    "work": [{
      "name": "string (company name)",
      "position": "string (job title)",
      "url": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or omit if current",
      "summary": "string (optional brief role description)",
      "highlights": ["string (bullet point - tailor to match job description keywords)"]
    }],
    "education": [{
      "institution": "string",
      "area": "string (field of study)",
      "studyType": "string (Bachelor, Master, PhD, etc.)",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "score": "string (GPA only if explicitly stated in resume - omit this field entirely if not present)",
      "courses": ["string (relevant courses if listed)"]
    }],
    "skills": [{ "name": "string (skill category)", "level": "string", "keywords": ["string"] }],
    "projects": [{
      "name": "string",
      "description": "string",
      "highlights": ["string"],
      "keywords": ["string"],
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "url": "string"
    }],
    "awards": [{ "title": "string", "date": "YYYY-MM", "awarder": "string", "summary": "string" }],
    "certificates": [{ "name": "string", "date": "YYYY-MM", "issuer": "string", "url": "string" }],
    "volunteer": [{
      "organization": "string", "position": "string",
      "startDate": "YYYY-MM", "endDate": "YYYY-MM",
      "summary": "string", "highlights": ["string"]
    }],
    "languages": [{ "language": "string", "fluency": "string" }]
  },
  "changeReasons": [
    {
      "originalText": "string (short exact snippet from original resume)",
      "updatedText": "string (short updated snippet)",
      "reason": "string (why this change improves fit)"
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
- Extract ALL information from the resume into the correct JSON Resume fields.
- Tailor work highlights and summary to match job description keywords and requirements.
- Keep all facts truthful - do not invent experience, skills, or achievements.
- Use YYYY-MM date format; omit fields that are not in the resume.
- Generate 5-8 behavioral questions tied to role responsibilities and resume experiences.
- Generate 5-8 technical questions tied to job requirements and candidate background.
- Provide one answer per question in the same order (2-4 sentences each, concrete details).
- Generate 5-8 concise bullets for skillsExperienceLookFors based on role expectations.
- Generate 4-6 concise bullets for projectIdeas tailored to this role and candidate.
- Include 5-12 itemized changeReasons, each tied to a specific resume edit.
- reason must explain why that change improves fit for the job description.

STRICT RULES:
- DO NOT invent experience, skills, or achievements not present in the resume.
- ONLY rewrite existing bullet points to better match the job description.
- ONLY inject relevant keywords into existing content.
- DO NOT add commentary or explanations outside the JSON structure.

JOB DESCRIPTION:
${trimmedJob}

RESUME:
${trimmedResume}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 6000,
    });

    console.log('OpenAI response received');
    const finishReason = response.choices?.[0]?.finish_reason;
    if (finishReason === 'length') {
      throw new Error(
        'Model output was truncated before completion. Please retry; if this persists, shorten resume/job description input.'
      );
    }

    const content = response.choices?.[0]?.message?.content?.trim();
    const parsed = parseJsonSafely(content || '{}');

    const jsonResume = normalizeJsonResume(parsed.jsonResume);

    if (!jsonResume.basics.name && !jsonResume.work.length && !jsonResume.education.length) {
      throw new Error('Model did not return a valid JSON Resume.');
    }

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

    console.log('JSON Resume basics.name:', jsonResume.basics.name);
    console.log('Work entries:', jsonResume.work.length);
    console.log('Education entries:', jsonResume.education.length);
    console.log('Change reasons:', changeReasons.length);
    console.log('Behavioral questions:', behavioralQuestions.length);
    console.log('Technical questions:', technicalQuestions.length);

    return {
      jsonResume,
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

module.exports = { tailorResumeAndGenerateQuestions, jsonResumeToText };