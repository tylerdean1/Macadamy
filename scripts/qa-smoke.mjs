import { chromium } from 'playwright';

const baseUrl = process.env.QA_BASE_URL ?? 'https://macadamy.io';
const qaEmail = process.env.MACADAMY_QA_EMAIL ?? '';
const qaSecret = process.env.MACADAMY_QA_LOGIN_SECRET ?? '';
const runAuthenticatedChecks = qaEmail.trim().length > 0 && qaSecret.trim().length > 0;

const requiredPublicCopy = [
  'End-to-End',
  'Construction Intelligence',
  'Comprehensive Project Management',
];

const requiredProjectHubCopy = [
  'Project-centered command center',
  'Project Controls',
  'Procurement',
  'Document Control',
  'Cost Management',
  'Field Operations',
  'Closeout',
];

function logStep(message) {
  console.log(`[qa-smoke] ${message}`);
}

async function assertPageContains(page, expectedText) {
  const bodyText = await page.locator('body').innerText({ timeout: 15000 });
  if (!bodyText.includes(expectedText)) {
    throw new Error(`Expected page to include: ${expectedText}`);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: baseUrl });
  const page = await context.newPage();

  page.on('pageerror', (error) => {
    throw new Error(`Browser page error: ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      console.error(`[browser console:${message.type()}] ${message.text()}`);
    }
  });

  try {
    logStep(`opening ${baseUrl}`);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45000 });

    for (const copy of requiredPublicCopy) {
      await assertPageContains(page, copy);
    }
    logStep('public landing page smoke check passed');

    if (!runAuthenticatedChecks) {
      logStep('authenticated checks skipped because MACADAMY_QA_EMAIL and MACADAMY_QA_LOGIN_SECRET were not provided');
      return;
    }

    logStep('signing in with QA account from environment');
    await page.locator('#id').fill(qaEmail);
    await page.locator('#pwd').fill(qaSecret);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL((url) => {
      const path = url.pathname.toLowerCase();
      return path.includes('dashboard') || path.includes('onboarding') || path.includes('projects');
    }, { timeout: 60000 });

    logStep(`authenticated route reached: ${page.url()}`);

    await page.goto('/projects', { waitUntil: 'domcontentloaded', timeout: 45000 });
    for (const copy of requiredProjectHubCopy) {
      await assertPageContains(page, copy);
    }
    logStep('/projects PM hub smoke check passed');
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error('[qa-smoke] failed');
  console.error(error);
  process.exitCode = 1;
});
