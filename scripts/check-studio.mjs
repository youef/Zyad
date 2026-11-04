import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const port = 18752;
const origin = 'http://127.0.0.1:' + port;
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1']);
let browser;
try {
  for (let attempt = 0; ; attempt++) {
    try { assert((await fetch(origin)).ok); break; }
    catch (error) {
      if (attempt === 30) throw error;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  browser = await chromium.launch({ executablePath: process.env.ZYAD_CHROMIUM_PATH });
  for (const viewport of [{width:390,height:844},{width:1280,height:900}]) {
    const context = await browser.newContext({viewport});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await page.reload();
    await page.locator('.app-tabs a[href="studio/"]').click();
    await page.waitForURL('**/studio/');
    const images = new Set();
    for (let i = 0; i < 20; i++) {
      await page.locator('#template').selectOption(String(i));
      images.add(await page.locator('#card').evaluate(canvas => canvas.toDataURL()));
    }
    assert.equal(images.size,20);
    await page.locator('#label').fill('بطاقة الاختبار');
    await page.locator('#label').press('Tab');
    await page.locator('#save').click();
    await page.waitForFunction(() => document.querySelector('#drafts').options.length === 1);
    await page.locator('#template').selectOption('0');
    await page.locator('#open').click();
    await page.waitForFunction(() => document.querySelector('#label').value === 'بطاقة الاختبار');
    const [download] = await Promise.all([
      page.waitForEvent('download'), page.locator('#download').click()
    ]);
    const png = await readFile(await download.path());
    assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[1080,1920]);
    await context.setOffline(true);
    await page.reload();
    await page.locator('#open').click();
    await page.waitForFunction(() => document.querySelector('#label').value === 'بطاقة الاختبار');
    assert.deepEqual(errors,[]);
    await context.close();
  }
  console.log('Studio passed desktop and mobile Chromium tests.');
} finally {
  await browser?.close();
  server.kill();
}
