const { chromium } = require('playwright');
const path = require('path');

const PROFILE_PATH = path.join(__dirname, '../../linkedin-profile');

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_PATH, {
    headless: false,
  });

  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login');

  console.log('Please log in manually');

  await page.waitForURL('https://www.linkedin.com/feed/', {
    timeout: 0,
  });

  console.log('Logged in successfully');

  await context.close();
})();