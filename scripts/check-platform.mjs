import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve,root} from './serve.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {CARD_PRESETS} from '../assets/templates.js';
import {SOCIAL_SIZES} from '../assets/social-sizes.js';
import {familyFor,CARD_FAMILIES} from '../assets/card-style-families.js';
// This project is visitor-only; studio/library/settings URLs intentionally redirect to the public app.
const server=await serve(),origin='http://127.0.0.1:'+server.address().port;
const target=join(root,'images/verification');await mkdir(target,{recursive:true});
const browser=await chromium.launch({headless:true});const verified=[];
try{
 for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
  const context=await browser.newContext({viewport,acceptDownloads:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/?date=2026-11-13');
  await page.waitForFunction(()=>Boolean(window.__posterReady));
  assert(await page.evaluate(()=>window.__posterReady),'Card renderer initialization failed');
  assert.equal(await page.locator('.visitor-tabs a.native-tab-link').count(),5);
  assert.equal(await page.locator('.public-template-card').count(),CARD_PRESETS.length);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Horizontal home overflow');
  // Visual selections must respect exact social size rather than squeezing a tall poster.
  const result=await page.evaluate(async()=>{
   const {renderPoster}=await import('/assets/card.js');
   const {SOCIAL_SIZES}=await import('/assets/social-sizes.js');
   const cfg=await(await fetch('/data/config.json',{cache:'no-store'})).json();
   const result=[];
   for(const id of ['whatsapp','instagram-post','instagram-square','facebook','x-post']){
    const preset=SOCIAL_SIZES.find(x=>x.id===id),canvas=document.createElement('canvas');
    await renderPoster(canvas,cfg,'2026-11-13',{preview:true,scale:.25,dimensions:[preset.width,preset.height]});
    result.push({id,pixels:[canvas.width,canvas.height],expected:[Math.round(preset.width*.25),Math.round(preset.height*.25)]});
   }
   return result;
  });
  for(const entry of result)assert.deepEqual(entry.pixels,entry.expected,'Incorrect canvas dimensions: '+entry.id);
  assert.equal(SOCIAL_SIZES.length,13);
  await page.evaluate(()=>location.hash='#template-gallery');
  await page.locator('#template-gallery').waitFor({state:'visible'});
  assert.equal(await page.locator('.public-template-card').count(),CARD_PRESETS.length);
  const supported=CARD_FAMILIES.filter(f=>CARD_PRESETS.some(p=>familyFor(p)===f));
  assert.equal(await page.locator('#gallery-family-filters button[data-family]').count(),supported.length+1);
  await page.locator('#gallery-family-filters button[data-family="heritage"]').click();
  assert.equal(await page.locator('.public-template-card:visible').count(),
   CARD_PRESETS.filter(p=>familyFor(p)==='heritage').length,'Heritage shape filter');
  await page.locator('#gallery-family-filters button[data-family="all"]').click();
  assert.equal(await page.locator('.public-template-card:visible').count(),CARD_PRESETS.length,'Reset shape filter');
  await page.evaluate(()=>location.hash='#today-app');
  await page.locator('#today-app').waitFor({state:'visible'});
  await page.locator('#social-output-size').selectOption('instagram-square');
  await page.waitForFunction(()=>{const c=document.querySelector('#poster');return c?.width>0&&c?.width===c?.height;});
  const preview=await page.locator('#poster').evaluate(c=>[c.width,c.height]);
  assert.equal(preview[0],preview[1],'Square preview is stretched');
  await page.screenshot({path:join(target,'visitor-responsive-'+viewport.width+'.png')});
  for(const slug of ['studio','library','settings']){
   await page.goto(origin+'/'+slug+'/');
   await page.waitForURL(url=>url.pathname==='/'&&url.hash==='#today-app',{timeout:12000});
   assert.equal(await page.locator('.visitor-tabs a.native-tab-link').count(),5,slug+' is not visitor-only');
   verified.push(slug+' redirect '+viewport.width);
  }
  assert.deepEqual(errors,[],'Visitor browser errors at '+viewport.width+': '+errors.join(' | '));
  verified.push('responsive cards '+viewport.width);
  await context.close();
 }
 await writeFile(join(target,'test-results.json'),JSON.stringify({status:'passed',verified},null,2));
 console.log('PASS: Visitor-only pages, square preview, five real-size renders, 45 public cards and mobile/desktop layout.');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
