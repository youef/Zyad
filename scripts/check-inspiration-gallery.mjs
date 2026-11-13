import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
// Regression: the old image badge hid the Saudi title and a cached preview
// covered the reflection with an advertising banner.
const server=await serve(),browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?date=2026-11-13#template-gallery');
 await page.waitForFunction(()=>Boolean(window.__posterReady),{timeout:30000});
 await page.locator('#template-gallery').waitFor({state:'visible'});
 const category=page.locator('#gallery-categories [data-category="بطاقات يومية فاخرة"]');
 await category.click();
 for(const id of ['inspire-botanical','inspire-royal','inspire-pearl']){
  const card=page.locator('[data-preset="'+id+'"]');
  await card.scrollIntoViewIfNeeded();
  await page.waitForFunction(id=>document.querySelector('[data-preset="'+id+'"]')?.dataset.previewState==='ready',id,{timeout:60000});
  const report=await card.evaluate(element=>{
   const frame=element.querySelector('.gallery-card-frame'),badge=element.querySelector('.gallery-card-badge');
   const art=element.querySelector('canvas.public-template-art'),fr=frame.getBoundingClientRect(),br=badge.getBoundingClientRect();
   return {canvas:[art.width,art.height],badgeBelow:br.top>=fr.bottom,
    badgeInsideFrame:frame.contains(badge),hidden:art.hidden,
    staleSrc:element.querySelector('img.gallery-template-image')?.getAttribute('src')||''};
  });
  assert(!report.hidden,'Live preview never painted '+id);
  assert(!report.badgeInsideFrame&&report.badgeBelow,'Category label covers poster '+id);
  assert(!report.staleSrc,'Outdated image is still used '+id);
  assert(report.canvas[0]>300&&report.canvas[1]>500,'Invalid canvas preview '+id);
 }
 const box=await page.evaluate(()=>{
  document.documentElement.style.scrollBehavior='auto';
  window.scrollTo(0,document.documentElement.scrollHeight);
  const cards=[...document.querySelectorAll('.public-template-card:not([hidden])')];
  const last=cards.at(-1).getBoundingClientRect(),dock=document.querySelector('.app-tabs.visitor-tabs').getBoundingClientRect();
  return {lastBottom:last.bottom,dockTop:dock.top,viewport:innerHeight};
 });
 assert(box.lastBottom<box.dockTop-8,'Bottom card is covered by navigation: '+JSON.stringify(box));
 assert.deepEqual(errors,[],'Gallery JavaScript errors');
 console.log('PASS: Three live inspiration previews, badge below artwork, no obsolete images, safe bottom navigation.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
