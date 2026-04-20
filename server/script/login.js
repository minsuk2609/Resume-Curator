const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { getLinkedInStorageStatePath } = require('../src/services/linkedinAuth');

(async () => {
  const storageStatePath = getLinkedInStorageStatePath();
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

  console.log('Please log in manually in the opened browser window.');

  await page.waitForURL(/linkedin\.com\/(feed|mynetwork|jobs)\/?/, {
    timeout: 0,
  });

  await context.storageState({ path: storageStatePath });
  console.log(`Logged in successfully. Saved auth state to: ${storageStatePath}`);

  await browser.close();
})();
