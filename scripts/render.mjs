import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname,resolve,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import QRCode from 'qrcode';
import {chromium} from 'playwright';
import {CARD_PRESETS} from '../assets/templates.js';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const config=JSON.parse(await readFile(join(root,'data/config.json'),'utf8'));
const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
const today=process.env.CARD_DATE||[p.year,p.month,p.day].join('-');
if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw Error('Invalid date');
await mkdir(join(root,'images'),{recursive:true});
if(config.card?.qrUrl&&config.settings?.showQr!==false){
  try{
    const u=new URL(config.card.qrUrl);
    if(!['https:','http:'].includes(u.protocol))throw Error('Unsupported URL scheme');
    await QRCode.toFile(join(root,'assets/qr.png'),u.toString(),{width:320,margin:1,errorCorrectionLevel:'M'});
  }catch(e){console.warn('QR skipped:',e.message);}
}
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURI(new URL(req.url,'http://localhost').pathname);
    let target=resolve(root,'.'+pathname);
    if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403);return res.end('Forbidden');}
    if(pathname==='/'||pathname.endsWith('/'))target=join(target,'index.html');
    const bytes=await readFile(target);res.setHeader('Content-Type',types[extname(target)]||'application/octet-stream');res.end(bytes);
  }catch{res.writeHead(404);res.end('Not Found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1260,height:2150},deviceScaleFactor:1});
  page.on('pageerror',e=>console.warn('Page error:',e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?date='+today,{waitUntil:'networkidle',timeout:90000});
  const done=await page.evaluate(()=>window.__posterReady);
  if(!done)throw Error('Card initialization failed');
  // Verify the public planner is interactive and publish real UI previews.
  await page.evaluate(()=>location.hash='smart-planner');const planner=page.locator('#smart-planner');
  await planner.waitFor({state:'visible',timeout:15000});
  const months=await planner.locator('.planner-month').count();
  const expected=[6,12,24].includes(Number(config.settings?.plannerMonths))?Number(config.settings.plannerMonths):12;
  if(months!==expected)throw Error('Future planner month selector is incomplete: '+months+'/'+expected);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:join(root,'images/site-preview.png'),fullPage:false});
  await planner.screenshot({path:join(root,'images/planner-preview.png')});
  const eventCount=await planner.locator('.planner-event').count();
  if(eventCount){
    await planner.locator('.planner-event').first().click();
    const opened=await page.locator('dialog.planner-dialog').evaluate(el=>el.open);
    if(!opened)throw Error('Event detail modal did not open');
    await page.locator('.planner-modal-close').click();
  }


  // Each thumbnail is rendered from the same source renderer as the real PNG.
  const templateIds=CARD_PRESETS.map(t=>t.id);
  const cards=await page.evaluate(async({ids,date})=>{
    const {renderPoster}=await import('/assets/card.js');
    const {duplicateForPreset}=await import('/assets/templates.js');
    const original=await (await fetch('/data/config.json')).json();
    const output=[];
    for(const id of ids){
      const canvas=document.createElement('canvas');
      await renderPoster(canvas,duplicateForPreset(original,id),date);
      const thumb=document.createElement('canvas');thumb.width=540;thumb.height=960;
      thumb.getContext('2d',{alpha:false}).drawImage(canvas,0,0,540,960);
      const base64=thumb.toDataURL('image/webp',.94).split(',')[1];
      output.push({id,base64});
    }
    return output;
  },{ids:templateIds,date:today});
  if(new Set(cards.map(r=>r.base64)).size!==templateIds.length)throw Error('Template previews are visually identical');
  await mkdir(join(root,'images/templates'),{recursive:true});
  for(const card of cards){
    if(!templateIds.includes(card.id)||card.base64.length<2000)throw Error('Invalid template preview');
    await writeFile(join(root,'images/templates',card.id+'.webp'),Buffer.from(card.base64,'base64'));
  }
  // Real admin browser checks ensure buttons, palette controls, custom saves and preview work.
  const admin=await browser.newPage({viewport:{width:1365,height:950}});
  const runtimeErrors=[];
  admin.on('pageerror',e=>runtimeErrors.push(e.message));
  await admin.goto('http://127.0.0.1:'+server.address().port+'/admin/',{waitUntil:'networkidle',timeout:90000});
  await admin.locator('[data-tab="theme"]').click();
  const first=admin.locator('#poster');
  const colorAt=()=>first.evaluate(c=>{
    const sample=document.createElement('canvas');sample.width=36;sample.height=64;
    sample.getContext('2d').drawImage(c,0,0,36,64);
    const bytes=sample.getContext('2d').getImageData(0,0,36,64).data;
    let hash=2166136261;for(let i=0;i<bytes.length;i+=4){hash=Math.imul(hash^bytes[i],16777619);hash=Math.imul(hash^bytes[i+1],16777619);hash=Math.imul(hash^bytes[i+2],16777619);}
    return (hash>>>0).toString(16);
  });
  const checks=[];
  for(const id of templateIds){
    await admin.locator('[data-preset="'+id+'"]').click();
    await admin.waitForFunction(name=>document.querySelector('#template-preview-state')?.textContent?.includes('المعاينة جاهزة: '+name),
      CARD_PRESETS.find(t=>t.id===id).name,
      {timeout:15000});
    const pressed=await admin.locator('[data-preset="'+id+'"]').getAttribute('aria-pressed');
    if(pressed!=='true')throw Error('Admin preset was not activated: '+id);
    checks.push({id,pixel:await colorAt()});
  }
  console.log('Template sample signatures:',JSON.stringify(checks));
  if(new Set(checks.map(c=>c.pixel)).size!==templateIds.length)throw Error('Admin template selection did not change the actual Canvas');
  await admin.locator('[data-preset="desert"]').click();
  await admin.waitForFunction(()=>document.querySelector('#template-preview-state')?.textContent?.includes('المعاينة جاهزة: الصحراء الملكية'));
  const beforeColor=await colorAt();
  await admin.locator('[data-bind="theme.green"]').evaluate(el=>{el.value='#f63344';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await admin.waitForFunction(()=>document.querySelector('#template-preview-state')?.textContent?.includes('المعاينة جاهزة: الصحراء الملكية'));
  const afterColor=await colorAt();
  if(afterColor===beforeColor)throw Error('Color picker did not update desert Canvas');
  await admin.locator('#layout-name').fill('اختبار حفظ قالب');
  await admin.locator('#save-layout').click();
  if(await admin.locator('#saved-layouts option').count()<2)throw Error('Saving custom layout failed');
  await admin.locator('[data-preset="royal"]').click();
  await admin.locator('#saved-layouts').selectOption({label:'اختبار حفظ قالب'});
  await admin.locator('#load-layout').click();
  if(await admin.locator('[data-preset="desert"]').getAttribute('aria-pressed')!=='true')throw Error('Restoring saved layout failed');
  await admin.screenshot({path:join(root,'images/studio-preview.png'),fullPage:false});
  await admin.close();
  if(runtimeErrors.length)throw Error('Admin page JS errors: '+runtimeErrors.join(' | '));
  // Public template buttons must switch the actual image and preserve URL state.
  await page.evaluate(()=>location.hash='template-gallery');await page.locator('#template-gallery').waitFor({state:'visible'});await page.locator('#public-template-grid .public-template-select').nth(4).click();
  await page.waitForFunction(()=>new URLSearchParams(location.search).get('template')==='pearl');
  if(await page.locator('.public-template-card.active').count()!==1)throw Error('Public template selection failed');
  const publicSelection=await page.locator('.public-template-card.active').getAttribute('data-preset');
  if(publicSelection!=='pearl')throw Error('Public selected template does not match Canvas');
  await page.evaluate(()=>location.hash='poster-section');await page.locator('#poster-section').waitFor({state:'visible'});const shortcut=page.locator('[data-quick-day="7"]');
  await shortcut.click();
  await page.waitForFunction(()=>document.querySelector('#page-status')?.textContent?.includes('جاهزة'));
  const picked=await page.locator('#chosen-date').inputValue();
  const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+7);
  if(picked!==d.toISOString().slice(0,10))throw Error('Quick future-day card picker failed');
  await page.locator('[data-quick-day="0"]').click();
  await page.waitForFunction(()=>document.querySelector('#page-status')?.textContent?.includes('جاهزة'));
  // Return site to the published default for its daily generated image.
  await page.locator('#daily-style').click();
  await page.waitForFunction(()=>document.querySelector('#page-status')?.textContent?.includes('جاهزة'));

  const dataUrl=await page.locator('#poster').evaluate(canvas=>canvas.toDataURL('image/png'));
  if(!dataUrl.startsWith('data:image/png;base64,'))throw Error('PNG encoding failed');
  const bytes=Buffer.from(dataUrl.slice('data:image/png;base64,'.length),'base64');
  if(bytes.length<20000)throw Error('Unexpected empty poster');
  await writeFile(join(root,'images',today+'.png'),bytes);
  await writeFile(join(root,'images/latest.png'),bytes);
  const hpath=join(root,'data/history.json');let history=[];
  try{history=JSON.parse(await readFile(hpath,'utf8'));}catch{}
  history=history.filter(x=>x.date!==today);history.push({date:today,path:'images/'+today+'.png'});
  history.sort((a,b)=>b.date.localeCompare(a.date));
  const keep=Number(config.settings?.archiveDays)||0;
  if(keep>0){
    const cutoff=new Date(today+'T12:00:00Z');cutoff.setUTCDate(cutoff.getUTCDate()-keep);
    const limit=cutoff.toISOString().slice(0,10);
    for(const x of history.filter(x=>x.date<limit)){try{await rm(join(root,x.path));}catch{}}
    history=history.filter(x=>x.date>=limit);
  }
  await writeFile(hpath,JSON.stringify(history,null,2)+'\n');
  console.log('Generated '+today+' ('+bytes.length+' bytes), '+history.length+' archived images');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
