import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
const server=await serve(),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1024,height:800}});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 const results=await page.evaluate(async()=>{
  const [{renderPoster},{duplicateForPreset},{createDesign},{renderDesign},{prepareBanner}]=await Promise.all([
   import('/assets/card.js'),import('/assets/templates.js'),import('/assets/catalog.js'),
   import('/assets/engine.js'),import('/assets/advertising.js')
  ]);
  const cfg=await(await fetch('/data/config.json')).json();
  const artwork=document.createElement('canvas');artwork.width=2000;artwork.height=400;
  const a=artwork.getContext('2d');a.fillStyle='#0b5b49';a.fillRect(0,0,2000,400);
  a.fillStyle='#ffcc77';a.fillRect(50,60,260,280);a.fillStyle='#ffffff';a.font='bold 160px Arial';a.fillText('AD',520,250);
  const blob=await new Promise(resolve=>artwork.toBlob(resolve,'image/png'));
  const prepared=await prepareBanner(new File([blob],'test-banner.png',{type:'image/png'}));
  const diff=(on,off,cutoff)=>{
   const aa=on.getContext('2d').getImageData(0,0,on.width,on.height).data;
   const bb=off.getContext('2d').getImageData(0,0,off.width,off.height).data;
   let change=0,early=0;
   for(let y=0;y<on.height;y++)for(let x=0;x<on.width;x++){
    const i=(y*on.width+x)*4;
    if(Math.abs(aa[i]-bb[i])+Math.abs(aa[i+1]-bb[i+1])+Math.abs(aa[i+2]-bb[i+2])>30){
     change++;if(y<on.height*cutoff)early++;
    }
   }
   return {change,early,fraction:change/(on.width*on.height)};
  };
  const iso='2026-11-09',calendar=[],freeform=[];
  for(const id of ['heritage','royal','night','saudi-emerald','blue-agenda','salary','magazine-columns']){
   const yes=duplicateForPreset(cfg,id),no=structuredClone(yes);
   yes.advertising={enabled:true,image:prepared.src};no.advertising={enabled:false,image:prepared.src};
   const on=document.createElement('canvas'),off=document.createElement('canvas');
   await renderPoster(on,yes,iso,{preview:true,scale:.4});
   await renderPoster(off,no,iso,{preview:true,scale:.4});
   calendar.push({id,...diff(on,off,.76)});
  }
  for(const dimensions of [[1080,1920],[1080,1080],[1080,1350],[1920,1080]]){
   const yes=createDesign('ivory-modern',iso),no=structuredClone(yes);
   yes.dimensions=dimensions;no.dimensions=dimensions;
   yes.advertising={enabled:true,image:prepared.src};no.advertising={enabled:false,image:prepared.src};
   const on=document.createElement('canvas'),off=document.createElement('canvas');
   await renderDesign(on,yes,{scale:.4});await renderDesign(off,no,{scale:.4});
   freeform.push({dimensions,...diff(on,off,.71)});
  }
  const content=duplicateForPreset(cfg,'heritage');
  content.content={...(content.content||{}),mode:'daily',showHadith:false,showDua:false};
  const lines=[];const sample=document.createElement('canvas'),ctx=sample.getContext('2d'),original=ctx.fillText;
  ctx.fillText=function(s,...args){lines.push(String(s));return original.call(this,s,...args);};
  await renderPoster(sample,content,iso,{preview:true,scale:.4});
  return {calendar,freeform,prepared:{length:prepared.src.length,width:prepared.width,height:prepared.height,format:prepared.src.slice(0,22)},lines};
 });
 assert.equal(results.calendar.length,7);assert.equal(results.freeform.length,4);
 for(const item of [...results.calendar,...results.freeform]){
  assert(item.change>500,'Image banner missing: '+JSON.stringify(item));
  assert(item.early===0,'Banner modified card content above reserved footer: '+JSON.stringify(item));
  assert(item.fraction<.25,'Banner is too invasive: '+JSON.stringify(item));
 }
 assert.equal(results.prepared.width,2000);assert.equal(results.prepared.height,400);
 assert(results.prepared.length<650000,'Banner compression limit');
 for(const hidden of ['مقتطف من حديث صحيح','دعاء مأثور','دعاء عام','حكمة اليوم']){
  assert(!results.lines.includes(hidden),'A hidden religious heading is still printed: '+hidden);
 }
 assert(!results.lines.includes('رزنامة السعودية'),'Brand/template name still printed in artwork');
 console.log('PASS: image upload 2000x400, 7 calendar placements, 4 export ratios, clean top content, independent hadith/dua hiding and no printed template names.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
