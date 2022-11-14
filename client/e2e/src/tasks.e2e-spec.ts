/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/tasks', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let userSession: UserSession;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    userSession = new UserSession(context);
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
    await context.close();
  });

  it('should render the title "Aufgaben"', async () => {
    await page.goto(config.clientUrl('/tasks'));
    const title = await page.textContent('app-tasks h1');
    expect(title).to.equal('Aufgaben');
  });

  it('should add a new tasks', async () => {
    await page.goto(config.clientUrl('/tasks'));
    await page.fill('app-tasks input', 'Testaufgabe 1');
    await page.keyboard.press('Enter');
    expect(await page.textContent('app-task span[slot="title"]')).to.equal('Testaufgabe 1');
  });

  it('should change the status of a task', async () => {
    await page.goto(config.clientUrl('/tasks'));
    await page.fill('app-tasks input', 'Testaufgabe 1');
    await Promise.all([page.waitForResponse('**'), await page.keyboard.press('Enter')]);
    expect(await page.locator('app-task .status').count()).to.equal(0); // grünes Häkchen nicht gesetzt
    await Promise.all([page.waitForResponse('**'), await page.click('app-task .toggle-status')]);
    expect(await page.locator('app-task .status').count()).to.equal(1); // grünes Häkchen gesetzt
  });

  it('should delete a task', async () => {
    await page.goto(config.clientUrl('/tasks'));
    await page.fill('app-tasks input', 'Testaufgabe 1');
    await page.keyboard.press('Enter');
    await page.waitForSelector('app-task');
    await page.hover('app-task');
    await Promise.all([page.waitForResponse('**'), await page.click('app-task .remove-task')]);
    expect(await page.locator('app-task').count()).to.equal(0);
  });
});
