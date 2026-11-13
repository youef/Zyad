import assert from 'node:assert/strict';import {chromium} from 'playwright';import {serve,root} from './serve.mjs';import {dailyContent,dailyTemplate,resolveContent,CONTENT_LIBRARY} from '../assets/daily.js';import {CARD_PRESETS} from '../assets/templates.js';import {isoAdd} from '../assets/card.js';import {readFile,writeFile,mkdir} from 'node:fs/promises';import {join} from 'node:path';import jsQR from 'jsqr';
const config=JSON.parse(await readFile(join(root,'data/config.json'),'utf8')),output=join(root,'images/app-verification');await mkdir(output,{recursive:true});assert.equal(CONTENT_LIBRARY.hadiths.length,24);assert.equal(CONTENT_LIBRARY.duas.length,40);assert(CARD_PRESETS.length>=42);assert.equal(config.card.qrUrl,'https://wa.me/966558930532');assert.equal(config.advertising?.phone||config.card.servicePhone,'0538243481','Service contact is published in the advertisement settings');for(const item of CONTENT_LIBRARY.hadiths){assert(item.url?.startsWith('https:'));assert(item.reference);assert(item.excerpt);}let previous;for(let n=0;n<500;n++){const date=isoAdd('2026-11-05',n),daily=dailyContent(config,date),template=dailyTemplate(config,date,CARD_PRESETS);assert.deepEqual(daily,dailyContent(config,date));if(previous){if(previous.daily.hadith&&daily.hadith)assert.notEqual(previous.daily.hadith.id,daily.hadith.id);if(previous.daily.dua&&daily.dua)assert.notEqual(previous.daily.dua.id,daily.dua.id);if(config.design?.autoRotate!==false){const pinned=(config.smartRules||[]).some(r=>r.enabled!==false&&r.templateId===template);if(!pinned)assert.notEqual(previous.template,template);}else assert.equal(template,config.design.preset);}previous={daily,template};}assert.equal(dailyTemplate({...config,smartRules:[{weekday:'any',templateId:'blue-agenda',priority:9,enabled:true}]},'2026-11-05',CARD_PRESETS),'blue-agenda');assert.equal(resolveContent(config,'2026-11-05').daily.date,'2026-11-05');assert(!config.daily,'Source config must not be mutated');assert.equal(resolveContent({...config,content:{mode:'manual'}},'2026-11-05').card.quote,config.card.quote);

const server=await serve(),base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch();
 for(const viewport of [{width:390,height:844},{width:1440,height:1100}]){
  const context=await browser.newContext({viewport});
  const p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/?date=2026-11-05');
  assert(await p.evaluate(()=>window.__posterReady));
  await p.locator('.event-row').first().waitFor();
  assert.equal(await p.locator('.public-template-card').count(),CARD_PRESETS.length);
  assert.equal(await p.locator('.visitor-tabs a.native-tab-link').count(),5);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  const expected=(config.content?.showHadith===false?0:1)+(config.content?.showDua===false?0:1);
  assert.equal(await p.locator('.daily-tile').count(),expected);
  await p.evaluate(()=>location.hash='#more');
  await p.locator('#more').waitFor({state:'visible'});
  await p.locator('.vs-more-link[href="#settings"]').click();
  await p.locator('#settings').waitFor({state:'visible'});
  await p.locator('input[name="visitor-language"][value="en"]').check({force:true});
  await p.waitForFunction(()=>document.documentElement.lang==='en'&&document.documentElement.dir==='ltr');
  assert.equal((await p.locator('.visitor-tabs a[href="#more"] .tab-label').textContent()).trim(),'More');
  assert.equal((await p.locator('#app-view-title').textContent()).trim(),'Settings');
  const langDetails=await p.evaluate(async()=>{
   const {localizedConfig,getLanguage,localeDate,presetName}=await import('/assets/locale.js');
   const {CARD_PRESETS}=await import('/assets/templates.js');
   const cfg=await(await fetch('/data/config.json')).json();
   const {renderPoster}=await import('/assets/card.js');
   const canvas=document.createElement('canvas');
   await renderPoster(canvas,cfg,'2026-11-05');
   return {language:getLanguage(),first:localizedConfig(cfg).counters[1].label,
    card:[canvas.width,canvas.height],date:localeDate('2026-11-05',{month:'long'}),
    preset:presetName(CARD_PRESETS.find(x=>x.id==='blue-agenda'))};
  });
  assert.equal(langDetails.language,'en');
  assert.equal(langDetails.first,'Salary');
  assert.deepEqual(langDetails.card,[1080,1920]);
  assert(langDetails.date.includes('November'));
  assert.equal(langDetails.preset,'Blue Agenda');
  await p.evaluate(()=>location.hash='#smart-planner');
  await p.locator('#smart-planner').waitFor({state:'visible'});
  assert.equal((await p.locator('#planner-days .planner-weekday').first().textContent()).trim(),'Sunday');
  await p.evaluate(()=>location.hash='#template-gallery');
  await p.locator('#template-gallery').waitFor({state:'visible'});
  assert((await p.locator('[data-preset="blue-agenda"]').first().textContent()).includes('Blue Agenda'));
  await p.evaluate(()=>location.hash='#settings');
  await p.locator('#settings').waitFor({state:'visible'});
  await p.locator('input[name="visitor-language"][value="ar"]').check({force:true});
  await p.waitForFunction(()=>document.documentElement.lang==='ar'&&document.documentElement.dir==='rtl');
  assert.equal((await p.locator('.visitor-tabs a[href="#more"] .tab-label').textContent()).trim(),'المزيد');
  await p.locator('input[name="visitor-language"][value="en"]').check({force:true});
  await p.reload();
  assert(await p.evaluate(()=>window.__posterReady));
  await p.waitForFunction(()=>document.documentElement.lang==='en'&&document.documentElement.dir==='ltr');
  assert.equal((await p.locator('.visitor-tabs a[href="#more"] .tab-label').textContent()).trim(),'More');
  await p.screenshot({path:join(output,'language-'+viewport.width+'.png')});
  assert.deepEqual(errors,[],'Browser errors in '+viewport.width+': '+errors.join(' | '));
  await context.close();
 }
 console.log('PASS: Visitor app, dynamic English/Arabic switching, LTR/RTL navigation, 42 designs, calendar dates, localized poster export and saved language.');
}finally{
 await browser?.close();await new Promise(r=>server.close(r));
}
