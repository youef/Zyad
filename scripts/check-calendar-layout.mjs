import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve();
const root='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch();
 for(const width of [320,390,430,1440]){
  const context=await browser.newContext({viewport:{width,height:width<800?844:1000}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(root+'/#smart-planner');
  assert(await page.evaluate(()=>window.__posterReady),'Poster app did not finish loading');
  await page.locator('#smart-planner .planner-month').first().waitFor({state:'visible'});
  const data=await page.evaluate(()=>{
   const get=s=>document.querySelector(s);
   const visible=s=>{const node=get(s);return !!node&&getComputedStyle(node).display!=='none';};
   const box=s=>get(s).getBoundingClientRect();
   const hero=box('#smart-planner .planner-heading');
   const months=box('#smart-planner .planner-months-section');
   const content=box('#smart-planner .planner-content');
   const calendar=box('#smart-planner .planner-calendar');
   const events=box('#smart-planner .planner-results');
   return {
    scrollWidth:document.documentElement.scrollWidth, viewport:innerWidth,
    view:document.body.dataset.activeView,
    header:visible('.app-header'),dateStrip:visible('.app-date-strip'),
    duplicateStats:document.querySelectorAll('#smart-planner .planner-stat').length,
    duplicateHint:document.querySelectorAll('#smart-planner .planner-hint').length,
    rangeNested:!!get('#smart-planner .planner-months-heading .planner-range'),
    hero: {top:hero.top,bottom:hero.bottom},
    months:{top:months.top,bottom:months.bottom},
    content:{top:content.top,bottom:content.bottom},
    calendar:{top:calendar.top,bottom:calendar.bottom,right:calendar.right,left:calendar.left},
    events:{top:events.top,bottom:events.bottom,right:events.right,left:events.left},
    daysDirection:getComputedStyle(get('.planner-days')).direction,
    dock:visible('.app-tabs.visitor-tabs')
   };
  });
  assert.equal(data.view,'smart-planner');
  assert.equal(data.header,false,'Redundant global header visible in calendar');
  assert.equal(data.dateStrip,false,'Daily date picker duplicated in calendar');
  assert.equal(data.duplicateStats,0,'Redundant calendar hero stats remain');
  assert.equal(data.duplicateHint,0,'Redundant calendar hint remains');
  assert(data.rangeNested,'Month range picker must live inside months section');
  assert(data.scrollWidth<=data.viewport+2,'Horizontal overflow '+width+': '+JSON.stringify(data));
  assert(data.months.top-data.hero.bottom>=16,'Hero/months need breathing room '+width);
  assert(data.content.top-data.months.bottom>=16,'Months/calendar need breathing room '+width);
  if(width<=900)assert(data.events.top-data.calendar.bottom>=14,'Calendar/list cards touch '+width);
  else assert(data.calendar.right<=data.events.left+2||data.events.right<=data.calendar.left+2,'Desktop cards overlap');
  if(width<=800)assert(data.dock,'Floating dock missing '+width);
  await page.evaluate(()=>location.hash='#today-app');
  await page.locator('#today-app').waitFor({state:'visible'});
  assert(await page.locator('.app-date-strip').isVisible(),'Date picker missing on daily home');
  assert(await page.locator('.app-header').isVisible(),'Home identity header missing');
  await page.evaluate(()=>location.hash='#template-gallery');
  await page.locator('#template-gallery').waitFor({state:'visible'});
  assert(await page.locator('.app-date-strip').isHidden(),'Date picker duplicated in design gallery');
  await page.evaluate(()=>location.hash='#settings');
  await page.locator('#settings').waitFor({state:'visible'});
  await page.locator('input[name="visitor-language"][value="en"]').check({force:true});
  await page.waitForFunction(()=>document.documentElement.dir==='ltr');
  await page.evaluate(()=>location.hash='#smart-planner');
  await page.locator('#smart-planner').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('.planner-weekday')?.textContent==='Sunday');
  assert.equal(await page.locator('.planner-days').evaluate(e=>getComputedStyle(e).direction),'ltr','English calendar has wrong direction');
  await page.evaluate(()=>location.hash='#settings');
  await page.locator('#settings').waitFor({state:'visible'});
  await page.locator('input[name="visitor-language"][value="ar"]').check({force:true});
  await page.waitForFunction(()=>document.documentElement.dir==='rtl');
  await page.evaluate(()=>location.hash='#smart-planner');
  await page.locator('#smart-planner').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('.planner-weekday')?.textContent==='الأحد');
  assert.equal(await page.locator('.planner-days').evaluate(e=>getComputedStyle(e).direction),'rtl','Arabic calendar has wrong direction');
  assert.deepEqual(errors,[],'Browser errors '+width+': '+errors.join(' | '));
  await context.close();
 }
 console.log('PASS: cleaned calendar layout, page-specific date controls, separated native cards, dock and Arabic/English calendar directions at 320/390/430/1440px.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
