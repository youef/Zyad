import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
const server=await serve(),browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1180,height:870}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Boolean(window.__posterReady),{timeout:30000});
 const result=await page.evaluate(async()=>{
  const {renderPoster}=await import('/assets/card.js');
  const {duplicateForPreset}=await import('/assets/templates.js');
  const {CARD_ICON_NAMES,CARD_ICON_STYLES,eventGlyph}=await import('/assets/card-icons.js');
  const {LUCIDE_CARD_NAMES}=await import('/assets/vendor/lucide-canvas.js');
  const config=await(await fetch('/data/config.json',{cache:'no-store'})).json();
  const scan=(left,right)=>{
   const a=left.getContext('2d').getImageData(0,0,left.width,left.height).data;
   const b=right.getContext('2d').getImageData(0,0,right.width,right.height).data;
   let diff=0;for(let i=0;i<a.length;i+=4)
    if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>30)diff++;
   return diff;
  };
  const matrix=[
   ['royal',[1080,1920]],['salary',[1080,1920]],['heritage',[1080,1920]],
   ['blue-agenda',[1080,1920]],['inspire-botanical',[1080,1920]],
   ['royal',[1080,1350]],['royal',[1080,1080]],['royal',[1600,900]]
  ];
  const samples=[];
  for(const [id,dimensions]of matrix){
   const enabled=duplicateForPreset(config,id),disabled=structuredClone(enabled);
   enabled.design.showIcons=true;enabled.design.iconStyle='glass';disabled.design.showIcons=false;
   const a=document.createElement('canvas'),b=document.createElement('canvas');
   const settings={preview:true,scale:.25,dimensions};
   await renderPoster(a,enabled,'2026-11-13',settings);
   await renderPoster(b,disabled,'2026-11-13',settings);
   samples.push({id,dimensions,actual:[a.width,a.height],changedPixels:scan(a,b)});
  }
  const styles=[];
  for(const style of CARD_ICON_STYLES){
   const cfg=duplicateForPreset(config,'salary'),c=document.createElement('canvas');
   cfg.design.showIcons=true;cfg.design.iconStyle=style;
   await renderPoster(c,cfg,'2026-11-13',{preview:true,scale:.25});
   const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   const digest=await crypto.subtle.digest('SHA-256',pixels);
   styles.push({style,fingerprint:Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('')});
  }
  return {samples,styles,iconCount:LUCIDE_CARD_NAMES.length,uiCount:CARD_ICON_NAMES.length,salaryGlyph:eventGlyph({label:'الراتب'}),ramadanGlyph:eventGlyph({label:'رمضان'})};
 });
 assert.equal(result.iconCount,result.uiCount);
 assert(result.iconCount>=28,'Too few licensed vector icons');
 assert.equal(result.salaryGlyph,'wallet');assert.equal(result.ramadanGlyph,'moon-star');
 assert.equal(result.styles.length,4);assert.equal(new Set(result.styles.map(s=>s.fingerprint)).size,4,'Icon styles should be visually different');
 for(const sample of result.samples){
  assert(sample.changedPixels>50,'Missing in-poster Lucide graphics for '+sample.id+' '+sample.dimensions);
  assert.deepEqual(sample.actual,sample.dimensions.map(x=>Math.round(x*.25)),'Incorrect pixel size');
 }
 assert.deepEqual(errors,[],'Browser icon rendering failed: '+errors.join(' | '));
 console.log('PASS: '+result.iconCount+' locally bundled Lucide icons, all 4 styles, 8 preset/ratio exports and real pixel differences.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
