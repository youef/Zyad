import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve();
const browser=await chromium.launch({headless:true});
const base='http://127.0.0.1:'+server.address().port;
try{
 const page=await browser.newPage({viewport:{width:1024,height:820}});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__posterReady,{timeout:30000});
 const result=await page.evaluate(async()=>{
  const [{CARD_PRESETS,duplicateForPreset},{templates,createDesign},{renderPoster},{renderDesign},
         {bannerForPoster,bannerForDesign,loadBanner,DEFAULT_BANNER}]=await Promise.all([
    import('/assets/templates.js'),import('/assets/catalog.js'),import('/assets/card.js'),
    import('/assets/engine.js'),import('/assets/advertising.js')
  ]);
  const cfg=await(await fetch('/data/config.json',{cache:'no-store'})).json();
  const source=await fetch('/'+DEFAULT_BANNER,{cache:'no-store'});
  if(!source.ok)throw Error('Default banner HTTP '+source.status);
  const image=await loadBanner(DEFAULT_BANNER);
  const legacy=await bannerForPoster({advertising:{enabled:true,image:''}});
  const freeLegacy=await bannerForDesign({advertising:{enabled:true,image:''}});
  const disabled=await bannerForPoster({advertising:{enabled:false,image:''}});
  const compare=(a,b)=>{
   if(a.width!==b.width||a.height!==b.height)throw Error('Mismatched canvas sizes');
   const p=a.getContext('2d').getImageData(0,0,a.width,a.height).data;
   const q=b.getContext('2d').getImageData(0,0,b.width,b.height).data;
   let bannerArea=0,topArea=0;
   const cutoff=Math.floor(a.height*.76);
   for(let y=0;y<a.height;y++)for(let x=0;x<a.width;x++){
    const i=(y*a.width+x)*4;
    if(Math.abs(p[i]-q[i])+Math.abs(p[i+1]-q[i+1])+Math.abs(p[i+2]-q[i+2])>55){
     if(y>=cutoff)bannerArea++;else topArea++;
    }
   }
   return {bannerArea,topArea,width:a.width,height:a.height};
  };
  const date='2026-11-09',calendar=[],freeform=[];
  for(const t of CARD_PRESETS){
   const a=duplicateForPreset(cfg,t.id),b=structuredClone(a);
   a.advertising={enabled:true,image:''}; // Legacy saved cards must inherit the published banner.
   b.advertising={enabled:false,image:''};
   const ca=document.createElement('canvas'),cb=document.createElement('canvas');
   await renderPoster(ca,a,date,{preview:true,scale:.24});
   await renderPoster(cb,b,date,{preview:true,scale:.24});
   calendar.push({id:t.id,...compare(ca,cb)});
  }
  for(const t of templates){
   const a=createDesign(t.id,date),b=structuredClone(a);
   a.advertising={enabled:true,image:''};b.advertising={enabled:false,image:''};
   const ca=document.createElement('canvas'),cb=document.createElement('canvas');
   await renderDesign(ca,a,{scale:.25});await renderDesign(cb,b,{scale:.25});
   freeform.push({id:t.id,...compare(ca,cb)});
  }
  const formats=[];
  for(const size of [[1080,1920],[1080,1350],[1080,1080],[1920,1080]]){
   const a=createDesign('ivory-modern',date),b=structuredClone(a);a.dimensions=size;b.dimensions=size;
   a.advertising={enabled:true,image:''};b.advertising={enabled:false,image:''};
   const ca=document.createElement('canvas'),cb=document.createElement('canvas');
   await renderDesign(ca,a,{scale:.25});await renderDesign(cb,b,{scale:.25});
   formats.push({size,...compare(ca,cb)});
  }
  return {calendar,freeform,formats,defaultBanner:DEFAULT_BANNER,
   sourceType:source.headers.get('content-type'),nativeSize:[image.naturalWidth,image.naturalHeight],
   legacyLoaded:!!legacy,freeformLegacyLoaded:!!freeLegacy,disabledLoaded:!!disabled};
 });
 assert.equal(result.calendar.length,42,'All 42 calendar cards must be checked');
 assert.equal(result.freeform.length,24,'All 24 editable card templates must be checked');
 assert.equal(result.formats.length,4);
 assert.deepEqual(result.nativeSize,[2000,400],'Banner must be 2000×400');
 assert(result.legacyLoaded && result.freeformLegacyLoaded,'Old saved cards must inherit default banner');
 assert.equal(result.disabledLoaded,false,'Explicitly disabled advertising must stay hidden');
 for(const t of [...result.calendar,...result.freeform,...result.formats]){
  assert(t.bannerArea>150,'Banner missing in '+JSON.stringify(t));
  assert(t.topArea<250,'Banner modified unrelated card content '+JSON.stringify(t));
 }
 assert.deepEqual(errors,[],'No browser errors allowed');
 console.log('PASS: Default banner loads (2000x400), all 42 calendar layouts, all 24 freeform templates, four export sizes, enabled/disabled modes and legacy saved-card fallback.');
 console.log('Verified '+JSON.stringify({calendar:result.calendar.length,freeform:result.freeform.length,formats:result.formats.length,sourceType:result.sourceType,banner:result.defaultBanner}));
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
