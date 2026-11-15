import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
const server=await serve(),browser=await chromium.launch();
try{
 for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
  const page=await browser.newPage({viewport}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?date=2026-11-13');
  assert(await page.evaluate(()=>window.__posterReady));
  await page.locator('#awan-global-search').click();
  await page.locator('#awan-command-dialog[open]').waitFor();
  await page.locator('#awan-command-input').fill('واحة');
  await page.locator('[data-command-type="template"][data-command-id="inspire-oasis"]').click();
  await page.locator('#card-preview[open]').waitFor();
  await page.locator('#preview-use').click();
  await page.waitForFunction(()=>window.zyadCalendar?.getConfig?.()?.design?.preset==='inspire-oasis');
  assert(await page.locator('#awan-card-context').isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await page.keyboard.press('Control+k');
  await page.locator('#awan-command-dialog[open]').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#awan-command-dialog').waitFor({state:'hidden'});
  await page.evaluate(()=>location.hash='#template-gallery');
  await page.locator('#template-gallery').waitFor({state:'visible'});
  await page.locator('[data-awan-density="compact"]').click();
  assert(await page.evaluate(()=>document.body.classList.contains('awan-compact-gallery')));
  await page.reload();
  assert(await page.evaluate(()=>document.body.classList.contains('awan-compact-gallery')));
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('PASS: Legendary command dialog, template selection, keyboard dismissal, card state, responsive and persisted density.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
