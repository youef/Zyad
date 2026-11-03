import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname,resolve,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import QRCode from 'qrcode';
import {chromium} from 'playwright';

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
  const planner=page.locator('#smart-planner');
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
