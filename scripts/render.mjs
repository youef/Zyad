import {readFile,writeFile,mkdir,readdir,rm} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname,resolve,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import QRCode from 'qrcode';
import {chromium} from 'playwright';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const config=JSON.parse(await readFile(join(root,'data/config.json'),'utf8'));
const tz='Asia/Riyadh';
const dateParts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
const today=process.env.CARD_DATE||`${dateParts.year}-${dateParts.month}-${dateParts.day}`;
if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw Error('Invalid CARD_DATE');
await mkdir(join(root,'images'),{recursive:true});
if(config.card?.qrUrl&&config.settings?.showQr!==false){
  try{const u=new URL(config.card.qrUrl);if(!['https:','http:'].includes(u.protocol))throw Error('Invalid QR scheme');await QRCode.toFile(join(root,'assets/qr.png'),u.toString(),{width:320,margin:1,errorCorrectionLevel:'M',color:{dark:'#064b43',light:'#ffffffff'}});}catch(e){console.warn('QR generation skipped:',e.message);}
}
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{
  const path=decodeURI(new URL(req.url,'http://localhost').pathname);
  let target=resolve(root,'.'+path);
  if(!target.startsWith(root+sep)&&target!==root){res.writeHead(403);return res.end('Forbidden');}
  if(path==='/'||path.endsWith('/'))target=join(target,'index.html');
  const body=await readFile(target);res.setHeader('Content-Type',MIME[extname(target)]||'application/octet-stream');res.end(body);
}catch{res.writeHead(404);res.end('Not Found');}});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const port=server.address().port;
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:2200},deviceScaleFactor:1});
  page.on('console',m=>{if(m.type()==='error')console.log('Browser console error:',m.text());});
  await page.goto(`http://127.0.0.1:${port}/?date=${today}`,{waitUntil:'networkidle',timeout:90000});
  const ok=await page.evaluate(()=>window.__posterReady);
  if(!ok)throw Error('Card initialization failed');
  const png=await page.locator('#poster').evaluate(async canvas=>{
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  const buffer=Buffer.from(png);
  await writeFile(join(root,'images',`${today}.png`),buffer);
  await writeFile(join(root,'images','latest.png'),buffer);
  const histPath=join(root,'data/history.json');
  let records=[];try{records=JSON.parse(await readFile(histPath,'utf8'));}catch{}
  records=records.filter(x=>x.date!==today);
  records.push({date:today,path:`images/${today}.png`});
  records.sort((a,b)=>b.date.localeCompare(a.date));
  const retention=Number(config.settings?.archiveDays)||0;
  if(retention>0){const cut=new Date(today+'T12:00:00Z');cut.setUTCDate(cut.getUTCDate()-retention);const cutoff=cut.toISOString().slice(0,10);for(const old of records.filter(x=>x.date<cutoff)){try{await rm(join(root,old.path));}catch{}}records=records.filter(x=>x.date>=cutoff);}
  await writeFile(histPath,JSON.stringify(records,null,2)+'\n');
  console.log(`Generated ${today}: ${buffer.byteLength} bytes; saved ${records.length} days.`);
}finally{if(browser)await browser.close();await new Promise(ok=>server.close(ok));}
