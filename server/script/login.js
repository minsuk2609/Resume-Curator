const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { getLinkedInStorageStatePath } = require('../src/services/linkedinAuth');

const SUCCESS_URL_PATTERN = /linkedin\.com\/(feed|mynetwork|jobs)\/?/i;
const LOGIN_TIMEOUT_MS = 10 * 60 * 1000;

function isSuccessfulLinkedInUrl(url) {
  return SUCCESS_URL_PATTERN.test(url);
}

async function hasLinkedInAuthCookie(context) {
  const cookies = await context.cookies('https://www.linkedin.com');
  return cookies.some((cookie) => cookie.name === 'li_at' && cookie.value);
}

async function waitForSuccessfulLogin(context, initialPage) {
  const pendingPages = new Set([initialPage]);

  const addPage = (page) => {
    pendingPages.add(page);
    page.once('close', () => {
      pendingPages.delete(page);
    });
  };

  context.pages().forEach(addPage);
  context.on('page', addPage);

  const start = Date.now();
  while (Date.now() - start < LOGIN_TIMEOUT_MS) {
    const pages = [...pendingPages].filter((page) => !page.isClosed());

    for (const page of pages) {
      try {
        if (isSuccessfulLinkedInUrl(page.url())) {
          return page;
        }
      } catch {
        // Page can detach while navigating; ignore and continue polling.
      }
    }

    if (await hasLinkedInAuthCookie(context)) {
      return initialPage;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `Login timed out after ${LOGIN_TIMEOUT_MS / 1000}s. Ensure you completed LinkedIn login in one of the browser tabs.`
  );
}

(async () => {
  const storageStatePath = getLinkedInStorageStatePath();
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

    console.log('Please log in manually in the opened browser window.');
    console.log('The script will continue when LinkedIn auth is detected.');

    const loggedInPage = await waitForSuccessfulLogin(context, page);
    await loggedInPage.waitForLoadState('domcontentloaded').catch(() => {});

    await context.storageState({ path: storageStatePath });
    console.log(`Logged in successfully. Saved auth state to: ${storageStatePath}`);
  } finally {
    await browser.close();
  }
})();
