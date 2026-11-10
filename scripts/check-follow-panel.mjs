import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import jsQR from 'jsqr';
import {readFile} from 'node:fs/promises';
import {serve,root} from './serve.mjs';
import {join} from 'node:path';
const server=await serve();
const browser=await chromium.launch({headless:true});
try {
 const base='http://127.0.0.1:'+server.address().port;
 const page=await browser.newPage({viewport:{width:1024,height:900}});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 const info=await page.evaluate(async()=>{
  const {renderPoster}=await import('/assets/card.js');
  const {renderDesign}=await import('/assets/engine.js');
  const {createDesign}=await import('/assets/catalog.js');
  const {duplicateForPreset}=await import('/assets/templates.js');
  const {footerGeometry,followLayout}=await import('/assets/follow-panel.js');
  const published=await(await fetch('/data/config.json')).json();
  const cfg=duplicateForPreset(published,'royal');
  cfg.follow={...published.follow,qrUrl:'https://example.com/subscribe',title:'متابعة البطاقات',whatsapp:'0558930532',snapchat:'z32.y'};
  const out={};
  const canvas=document.createElement('canvas');
  await renderPoster(canvas,cfg,'2026-11-10');
  const qrBox=followLayout(footerGeometry([1080,1920]).follow,{showQr:true}).qr;
  const scanSize=Math.ceil(qrBox.size+10);
  const region=document.createElement('canvas');region.width=scanSize;region.height=scanSize;
  region.getContext('2d').drawImage(canvas,Math.floor(qrBox.x-5),Math.floor(qrBox.y-5),scanSize,scanSize,0,0,scanSize,scanSize);
  out.qr=[...region.getContext('2d').getImageData(0,0,scanSize,scanSize).data];
  out.qrSize=scanSize;
  const spy=document.createElement('canvas'),ct=spy.getContext('2d'),original=ct.fillText,strings=[];
  ct.fillText=function(t,...args){strings.push(String(t));return original.call(this,t,...args);};
  await renderPoster(spy,cfg,'2026-11-10',{preview:true,scale:.3});
  out.strings=strings;
  const hidden=structuredClone(cfg);hidden.follow.enabled=false;
  await renderPoster(spy,hidden,'2026-11-10',{preview:true,scale:.3});
  out.region=footerGeometry([1080,1920],'calendar');
  out.sizes=[];
  for(const dimensions of [[1080,1920],[1080,1350],[1080,1080],[1920,1080]]){
   const d=createDesign('ivory-modern','2026-11-10');d.dimensions=dimensions;
   const x=document.createElement('canvas');
   await renderDesign(x,d,{scale:.25});
   out.sizes.push({dimensions,canvas:[x.width,x.height],footer:footerGeometry(dimensions,'freeform'),layout:followLayout(footerGeometry(dimensions,'freeform').follow,{showQr:true})});
  }
  return out;
 });
 assert.equal(jsQR(new Uint8ClampedArray(info.qr),info.qrSize,info.qrSize)?.data,'https://example.com/subscribe','The edited QR must remain scannable after export');
 assert(info.strings.includes('متابعة البطاقات'),'Follow title not drawn');
 assert(info.strings.includes('0558930532'),'WhatsApp contact missing');
 assert(info.strings.includes('z32.y'),'Snapchat contact missing');
 assert(info.region.ad.y+info.region.ad.h<info.region.follow.y,'Follow panel should be underneath banner');
 assert(info.region.follow.h<=130,'Follow bar must be compact');
 assert(info.region.noteY-info.region.follow.y-info.region.follow.h>=29,'Footer caption needs breathing room');
 for(const item of info.sizes){
  assert.deepEqual(item.canvas,[item.dimensions[0]/4,item.dimensions[1]/4]);
  assert(item.footer.follow.y>item.footer.ad.y+item.footer.ad.h,'Footer collision on '+item.dimensions);
  assert(item.footer.follow.y+item.footer.follow.h<=item.dimensions[1],'Panel outside image on '+item.dimensions);
  assert(item.layout.qr.x+item.layout.qr.size<item.layout.middle.x,'QR must remain in the LEFT column');
  assert(item.layout.middle.x+item.layout.middle.w<item.layout.title.x,'The stacked contact column must stay in the CENTER');
  assert(item.layout.title.x+item.layout.title.w<=item.footer.follow.x+item.footer.follow.w+1,'The title must stay in the RIGHT column');
  assert(item.footer.noteY-(item.footer.follow.y+item.footer.follow.h)>=27,'Keep space before the fine-print footer');
 }
 const cfg=JSON.parse(await readFile(join(root,'data/config.json'),'utf8'));
 assert(cfg.follow?.enabled&&cfg.follow?.showQr&&cfg.follow?.showWhatsapp&&cfg.follow?.showSnapchat);
 const html=await readFile(join(root,'admin/index.html'),'utf8');
 const js=await readFile(join(root,'assets/admin.js'),'utf8');
 for(const field of ['enabled','title','subtitle','showTitle','showQr','qrUrl','qrCaption','showWhatsapp','whatsapp','whatsappLabel','showSnapchat','snapchat','snapchatLabel','colorMode','backgroundColor','textColor','accentColor','radius']){
  assert(html.includes('data-bind="follow.'+field+'"'),'Missing administrator follow control '+field);
 }
 assert(js.includes('FOLLOW_DEFAULTS')&&js.includes("config.follow="),'Admin must initialize and reset follow settings');
 console.log('PASS: Compact QR-left, stacked contacts-center, title-right layout; editable settings, QR scanning, all four ratios and fine-print spacing.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
