import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve,root} from './serve.mjs';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

const server=await serve();
const origin='http://127.0.0.1:'+server.address().port;
const output=join(root,'images/verification');
await mkdir(output,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const sizes=[320,375,390,430,768,1024,1440];
 for(const width of sizes){
  const context=await browser.newContext({viewport:{width,height:width<=430?844:960},deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>window.__posterReady);
  await page.waitForFunction(()=>document.querySelector('#spotlight-title')?.textContent!=='تحميل المواعيد...',{timeout:30000});
  const info=await page.evaluate(()=>{
   const tab=document.querySelector('.app-tabs'),tabs=[...document.querySelectorAll('.app-tabs .native-tab-link')],logo=document.querySelector('.app-header-logo'),spot=document.querySelector('#next-spotlight');
   return {
    scroll:document.documentElement.scrollWidth,viewport:innerWidth,
    tabs:tabs.length,tabWidth:tabs[0]?.getBoundingClientRect().width,
    tabHeight:tabs[0]?.getBoundingClientRect().height,
    visibleTab:tab?getComputedStyle(tab).display:'none',
    logoBg:logo?getComputedStyle(logo).backgroundColor:'',
    posterWidth:document.querySelector('#poster')?.getBoundingClientRect().width,
    spotVisible:!!spot && getComputedStyle(spot).display!=='none',
    spotLabel:document.querySelector('#spotlight-title')?.textContent
   };
  });
  assert(info.scroll<=info.viewport+2,'Horizontal overflow '+width+'px: '+JSON.stringify(info));
  assert.equal(info.tabs,5);
  assert(info.spotVisible && info.spotLabel,'Next-event spotlight must be present '+width);
  assert(info.posterWidth>100,'Card preview unreadable '+width);
  if(width<=800){
   assert(info.visibleTab!=='none','Mobile bottom navigation hidden '+width);
   assert(info.tabWidth>=43&&info.tabHeight>=44,'Mobile tab touch target too small '+width+': '+JSON.stringify(info));
   assert(['rgba(0, 0, 0, 0)','transparent'].includes(info.logoBg),'Header logo backing is not transparent '+width+': '+info.logoBg);
  }
  assert.equal(errors.length,0,'Browser errors '+width+': '+errors.join(' | '));
  await page.screenshot({path:join(output,'native-'+width+'.png'),fullPage:false});
  await page.close();await context.close();
 }
 const page=await browser.newPage();
 await page.goto(origin);
 const alpha=await page.evaluate(async()=>{
  const img=new Image();img.src='assets/branding/logo-transparent.png';
  await img.decode();
  const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const p=x.getImageData(0,0,c.width,c.height).data;
  let clear=0,visible=0;
  for(let i=3;i<p.length;i+=4){if(p[i]<8)clear++;if(p[i]>200)visible++;}
  return {clear,visible,total:c.width*c.height,corner:p[3]};
 });
 assert(alpha.visible>alpha.total*.01,'Brand content was lost');
 assert(alpha.clear>alpha.total*.035,'Transparent brand has insufficient alpha');
 assert.equal(alpha.corner,0,'Logo outer corner must be transparent');
 console.log('PASS: 7 responsive widths, 5 tabs, live spotlight, no overflow, transparent logo and browser console. '+JSON.stringify(alpha));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
