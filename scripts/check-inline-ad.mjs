import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {createDesign} from '../assets/catalog.js';

const server=await serve();
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const iso='2026-11-09';
try{
  const page=await browser.newPage({viewport:{width:1024,height:860}});
  await page.goto(origin+'/?date='+iso,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>window.__posterReady);
  const result=await page.evaluate(async date=>{
    const {renderPoster}=await import('/assets/card.js');
    const {duplicateForPreset}=await import('/assets/templates.js');
    const {createDesign}=await import('/assets/catalog.js');
    const {renderDesign}=await import('/assets/engine.js');
    const cfg=await(await fetch('/data/config.json')).json();
    const difference=(on,off,startFraction)=>{
      const a=on.getContext('2d').getImageData(0,0,on.width,on.height).data;
      const b=off.getContext('2d').getImageData(0,0,off.width,off.height).data;
      let changed=0,early=0;
      const cutoff=Math.floor(on.height*startFraction);
      for(let y=0;y<on.height;y++)for(let x=0;x<on.width;x++){
        const i=(y*on.width+x)*4;
        if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>15){
          changed++;if(y<cutoff)early++;
        }
      }
      return {changed,early,ratio:changed/(on.width*on.height)};
    };
    const calendar=[];
    for(const id of ['heritage','royal','night','saudi-emerald','blue-agenda','salary','magazine-columns']){
      const c=duplicateForPreset(cfg,id),off=structuredClone(c);
      c.advertising={...cfg.advertising,enabled:true};
      off.advertising={...cfg.advertising,enabled:false};
      const onCanvas=document.createElement('canvas'),offCanvas=document.createElement('canvas');
      await renderPoster(onCanvas,c,date,{preview:true,scale:.5});
      await renderPoster(offCanvas,off,date,{preview:true,scale:.5});
      const delta=difference(onCanvas,offCanvas,id==='heritage'?0.81:0.95);
      calendar.push({id,...delta});
    }
    const designs=[];
    for(const dimensions of [[1080,1920],[1080,1080],[1080,1350],[1920,1080]]){
      const d=createDesign('ivory-modern',date);d.dimensions=dimensions;
      const disabled=structuredClone(d);disabled.advertising.enabled=false;
      const onCanvas=document.createElement('canvas'),offCanvas=document.createElement('canvas');
      await renderDesign(onCanvas,d,{scale:.5});
      await renderDesign(offCanvas,disabled,{scale:.5});
      designs.push({dimensions,...difference(onCanvas,offCanvas,.88)});
    }
    return {calendar,designs};
  },iso);
  for(const entry of [...result.calendar,...result.designs]){
    assert(entry.changed>45,'Text ad missing: '+JSON.stringify(entry));
    assert(entry.early<15,'Advertisement invaded card content: '+JSON.stringify(entry));
    assert(entry.ratio<.035,'Advertisement looks like a giant panel: '+JSON.stringify(entry));
  }
  assert.equal(result.calendar.length,7);
  assert.equal(result.designs.length,4);
  console.log('PASS: text-only advertisement stays inside the original poster footer, without giant panels or covering QR, in seven calendar layouts and four image ratios.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
