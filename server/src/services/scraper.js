const { chromium } = require('playwright');
const {
  getLinkedInStorageStatePath,
  hasLinkedInStorageState,
} = require('./linkedinAuth');

const MAX_JOB_TEXT_LENGTH = 4000;

function extractJobId(url) {
  const match = url.match(/currentJobId=(\d+)|jobs\/view\/(\d+)/);
  return match ? (match[1] || match[2]) : null;
}

function buildJobUrl(jobId) {
  return `https://www.linkedin.com/jobs/view/${jobId}/`;
}

function cleanText(text) {
  return text
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function scrapeJob(url) {
  if (!hasLinkedInStorageState()) {
    throw new Error('LinkedIn login required. Run `npm run login` in /server first.');
  }

  const storageStatePath = getLinkedInStorageStatePath();
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext({ storageState: storageStatePath });
  const page = await context.newPage();

  try {
    console.log("Scraping:", url);

    const jobId = extractJobId(url);
    if (!jobId) throw new Error("Could not extract LinkedIn job ID");

    const jobUrl = buildJobUrl(jobId);
    console.log("Normalized job URL:", jobUrl);

    await page.goto(jobUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    const isBlocked = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();

      return (
        (text.includes('sign in') && text.includes('linkedin')) ||
        window.location.href.includes('login') ||
        window.location.href.includes('authwall') ||
        window.location.href.includes('checkpoint')
      );
    });

    if (isBlocked) {
      throw new Error('LinkedIn login required or session expired');
    }

    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')];

      buttons.forEach(b => {
        const t = (b.innerText || '').toLowerCase();
        if (t.includes('see more') || t.includes('show more')) {
          b.click();
        }
      });
    });

    await page.waitForTimeout(1500);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.waitForTimeout(1500);

    const text = await page.evaluate(() => {
      // Try structured LinkedIn JSON first
      const ldJson = document.querySelector('script[type="application/ld+json"]');

      if (ldJson) {
        try {
          const data = JSON.parse(ldJson.innerText);
          if (data && data.description) {
            return data.description;
          }
        } catch (e) {}
      }

      // Try embedded page state (backup)
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const s of scripts) {
        const t = s.textContent || '';
        if (t.includes('"description"') && t.includes('jobPosting')) {
          const match = t.match(/"description":"([\s\S]*?)"/);
          if (match && match[1]) {
            return match[1]
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"');
          }
        }
      }

      const el =
        document.querySelector('span[data-testid="expandable-text-box"]') ||
        document.querySelector('div.jobs-box__html-content') ||
        document.querySelector('div.jobs-description__content') ||
        document.querySelector('article');

      if (el && el.textContent) {
        return el.textContent;
      }

      return document.body.textContent;
    });

    return cleanText(text).slice(0, MAX_JOB_TEXT_LENGTH);

  } catch (err) {
    console.error("SCRAPER ERROR:", err.message);
    throw err;
  } finally {
    await context.close();
    await browser.close();
  }
}

module.exports = { scrapeJob };