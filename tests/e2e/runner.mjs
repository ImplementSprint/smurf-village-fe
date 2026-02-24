const { Builder, By, until } = await import('selenium-webdriver');
const chrome = await import('selenium-webdriver/chrome.js');

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

const options = new chrome.Options();
options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');

const driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();

try {
  await driver.get(baseUrl);

  await driver.wait(until.elementLocated(By.css('body')), 10000);
  const title = await driver.getTitle();

  if (!title || title.trim().length === 0) {
    throw new Error('Page title is empty.');
  }

  console.log(`✅ E2E passed at ${baseUrl}`);
  console.log(`✅ Page title: ${title}`);
} catch (error) {
  console.error('❌ E2E failed:', error.message);
  process.exitCode = 1;
} finally {
  await driver.quit();
}
