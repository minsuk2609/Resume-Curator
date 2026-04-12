const axios = require('axios');
const cheerio = require('cheerio');

const MAX_JOB_TEXT_LENGTH = 4000;

async function scrapeJob(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 10000,
  });

  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script, style, nav, header, footer, iframe, img, svg').remove();

  // Try common job description containers first
  const selectors = [
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[class*="description"]',
    '[id*="job-description"]',
    'article',
    'main',
  ];

  let text = '';
  for (const selector of selectors) {
    const el = $(selector).first();
    if (el.length) {
      text = el.text();
      break;
    }
  }

  // Fallback to body text
  if (!text) text = $('body').text();

  return cleanText(text).slice(0, MAX_JOB_TEXT_LENGTH);
}

function cleanText(text) {
  return text
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { scrapeJob };
