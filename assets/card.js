import {renderPremium} from './design.js?v=20261104r4';
import {presetInfo} from './templates.js';
import {renderCalendar} from './calendar-design.js';
import {renderListCalendar} from './list-calendar.js';
import {drawDailyPanel} from './daily-panel.js';
import {resolveContent} from './daily.js';
import {fontStack,loadTypeface} from './typography.js';
import './vendor/qrcode.js';
/* Shared pure card renderer: no user text is inserted into HTML. */
const W = 1080, H = 1920;
const imageCache = new Map();
const FONT = '"Cairo", "Noto Naskh Arabic", Tahoma, Arial, sans-serif';

export function saToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Riyadh', year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(v => [v.type,v.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function isoAdd(iso, days) {
  const [y,m,d] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(y,m-1,d+days,12)).toISOString().slice(0,10);
}
export function daysBetween(a,b) {
  const u = v => {const [y,m,d] = v.split('-').map(Number);return Date.UTC(y,m-1,d);};
  return Math.round((u(b)-u(a))/86400000);
}
export function remaining(item, iso) {
  if (!item || item.enabled === false) return null;
  if (item.mode === 'manual') return Math.max(0,Math.floor(Number(item.value)||0));
  if (item.mode === 'hijri') {
    const month=Math.max(1,Math.min(12,Math.floor(Number(item.hijriMonth)||9)));
    const day=Math.max(1,Math.min(30,Math.floor(Number(item.hijriDay)||1)));
    try {
      const fmt=new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura',{timeZone:'Asia/Riyadh',month:'numeric',day:'numeric'});
      for(let d=0;d<=375;d++){
        const candidate=new Date(isoAdd(iso,d)+'T12:00:00Z');
        const parts=Object.fromEntries(fmt.formatToParts(candidate).map(p=>[p.type,p.value]));
        if(Number(parts.month)===month && Number(parts.day)===day) return d;
      }
    }catch(e){console.warn('Hijri calendar calculation unavailable',e);}
    return 0;
  }

  if (item.mode === 'monthly') {
    const [y,m,d] = iso.split('-').map(Number);
    const day = Math.min(31,Math.max(1,Math.floor(Number(item.day)||1)));
    const candidate = (year,month) => {
      const actual = Math.min(day,new Date(Date.UTC(year,month,0)).getUTCDate());
      return `${year}-${String(month).padStart(2,'0')}-${String(actual).padStart(2,'0')}`;
    };
    let target=candidate(y,m);
    if (target < iso) {const next=new Date(Date.UTC(y,m,1));target=candidate(next.getUTCFullYear(),next.getUTCMonth()+1);}
    return Math.max(0,daysBetween(iso,target));
  }
  if (item.mode === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(item.date||'')) {
    let target=item.date;
    if (item.repeat === 'yearly') {
      const year=Number(iso.slice(0,4)),monthDay=target.slice(5);
      for(let n=0;n<=8;n++){const candidate=`${year+n}-${monthDay}`;if(candidate>=iso&&isRealDate(candidate)){target=candidate;break;}}
    }
    return Math.max(0,daysBetween(iso,target));
  }
  return 0;
}
function isRealDate(value) {return !Number.isNaN(new Date(value+'T12:00:00Z').getTime()) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
export function hijriDate(iso, cfg) {
  if (iso===saToday() && cfg?.settings?.hijriOverride?.trim()) return cfg.settings.hijriOverride.trim();
  const offset=Math.max(-3,Math.min(3,Number(cfg?.settings?.hijriOffset)||0));
  const d=new Date(isoAdd(iso,offset)+'T12:00:00Z');
  try { return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{year:'numeric',month:'long',day:'numeric', timeZone:'Asia/Riyadh'}).format(d).replace(/\s*هـ\s*$/,'') + ' هـ'; }
  catch { return 'التاريخ الهجري'; }
}
function hijriPanel(iso,cfg) {
  const override=iso===saToday()?cfg?.settings?.hijriOverride?.trim():'';
  if(override)return {number:override,label:'التاريخ الهجري'};
  const offset=Math.max(-3,Math.min(3,Number(cfg?.settings?.hijriOffset)||0));
  const date=new Date(isoAdd(iso,offset)+'T12:00:00Z');
  try {
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura',{year:'numeric',month:'numeric',day:'numeric',timeZone:'Asia/Riyadh'}).formatToParts(date).map(p=>[p.type,p.value]));
    const month=new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{month:'long',timeZone:'Asia/Riyadh'}).format(date);
    return {number:`${parts.year}/${parts.month}/${parts.day} هـ`,label:month};
  }catch {return {number:hijriDate(iso,cfg),label:'هجري'};}
}
function weekday(iso) {
  const d=new Date(iso+'T12:00:00Z');
  return new Intl.DateTimeFormat('ar-SA',{weekday:'long',timeZone:'Asia/Riyadh'}).format(d);
}
function roundedRect(ctx,x,y,w,h,r,fill,stroke=null,lineWidth=1) {
  const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,rr);
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
}
function centralText(ctx,text,x,y,size,color,weight='700',maxWidth) {
  ctx.save();ctx.direction='rtl';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${ctx.zyadFont||FONT}`;
  if(maxWidth){while(ctx.measureText(String(text)).width>maxWidth&&size>13){size-=1;ctx.font=`${weight} ${size}px ${ctx.zyadFont||FONT}`;}}
  ctx.fillText(String(text),x,y);ctx.restore();
}
function linesFor(ctx,raw,maxWidth,fontSize,maxLines=3) {
  ctx.font=`700 ${fontSize}px ${ctx.zyadFont||FONT}`;
  const words=String(raw||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  const result=[];let line='';
  for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>maxWidth&&line){result.push(line);line=word;}else{line=next;}}
  if(line)result.push(line);
  if(result.length>maxLines){const first=result.slice(0,maxLines);const rest=result.slice(maxLines-1).join(' ');first[maxLines-1]=rest;while(ctx.measureText(first[maxLines-1]).width>maxWidth&&first[maxLines-1].length>2) first[maxLines-1]=first[maxLines-1].slice(0,-2);first[maxLines-1]=first[maxLines-1].trim()+'…';return first;}
  return result;
}
function polyOrnament(ctx,cx,cy,rx,ry,fill,stroke) {
  ctx.save();ctx.beginPath();const segments=32;
  for(let i=0;i<=segments;i++){
    const a=i/segments*2*Math.PI-Math.PI/2;
    const wobble = 1+0.053*Math.cos(8*a);
    const x=cx+rx*wobble*Math.cos(a),y=cy+ry*wobble*Math.sin(a);
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=5;ctx.stroke();ctx.restore();
}
function pattern(ctx,gold,ink) {
  ctx.save();ctx.globalAlpha=.07;ctx.strokeStyle=ink;ctx.lineWidth=1.5;
  for(let y=-80;y<H+100;y+=92)for(let x=-80;x<W+100;x+=92){
    ctx.beginPath();ctx.moveTo(x+46,y+3);ctx.lineTo(x+89,y+46);ctx.lineTo(x+46,y+89);ctx.lineTo(x+3,y+46);ctx.closePath();ctx.stroke();
    ctx.beginPath();ctx.arc(x+46,y+46,21,0,2*Math.PI);ctx.stroke();
  }
  ctx.globalAlpha=.045;ctx.strokeStyle=gold;
  for(let y=15;y<H;y+=184)for(let x=15;x<W;x+=184){ctx.strokeRect(x,y,151,151);}
  ctx.restore();
}
function drawHeritageTrim(ctx, gold, ink) {
  ctx.save();
  ctx.strokeStyle='rgba(190,145,58,.63)';ctx.lineWidth=4;ctx.strokeRect(13,13,1054,1894);
  ctx.strokeStyle='rgba(190,145,58,.29)';ctx.lineWidth=2;ctx.strokeRect(26,26,1028,1868);
  for(const x of [65,1015])for(const y of [65,1855]){
    ctx.save();ctx.translate(x,y);
    ctx.strokeStyle=gold;ctx.lineWidth=2;
    for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.ellipse(0,19,8,20,0,0,Math.PI*2);ctx.stroke();}
    ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fillStyle=gold;ctx.fill();ctx.restore();
  }
  ctx.globalAlpha=.16;ctx.strokeStyle=ink;ctx.lineWidth=2;
  for(let y=460;y<1650;y+=174)for(let x=47;x<1070;x+=174){
    ctx.save();ctx.translate(x,y);for(let a=0;a<4;a++){
      ctx.rotate(Math.PI/2);ctx.strokeRect(17,17,28,28);
    }ctx.restore();
  }
  ctx.restore();
}
function drawLantern(ctx,x,y,gold,green){
  ctx.save();ctx.strokeStyle=gold;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,y-51);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-15,y-51);ctx.lineTo(x+15,y-51);ctx.lineTo(x+29,y-11);ctx.lineTo(x+13,y+42);ctx.lineTo(x-13,y+42);ctx.lineTo(x-29,y-11);ctx.closePath();
  ctx.fillStyle='rgba(202,159,68,.20)';ctx.fill();ctx.stroke();
  ctx.fillStyle=green;ctx.beginPath();ctx.arc(x,y+2,11,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawBadge(ctx,x,y,value,label,radius,color,gold,cream) {
  const grad=ctx.createRadialGradient(x-15,y-radius*.3,10,x,y,radius*1.5);
  grad.addColorStop(0,'#25805f');grad.addColorStop(.7,color);grad.addColorStop(1,'#06352f');
  ctx.save();ctx.shadowColor='rgba(35,38,19,.18)';ctx.shadowBlur=9;ctx.shadowOffsetY=5;
  polyOrnament(ctx,x,y,radius*.9,radius,grad,gold);ctx.restore();
  centralText(ctx,String(value).padStart(2,'0'),x,y+5,Math.max(30,radius*.68),'#fff','800',radius*1.54);
  const pillY=y+radius+12;roundedRect(ctx,x-111,pillY,222,53,15,color,'#b9cba6',1.5);
  centralText(ctx,label,x,pillY+26,28,'#fff','800',208);
}
function fetchImage(src) {
  if(!src)return Promise.resolve(null);
  if(imageCache.has(src))return imageCache.get(src);
  const promise=new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{imageCache.delete(src);resolve(null);};img.src=src;});
  imageCache.set(src,promise);if(imageCache.size>12)imageCache.delete(imageCache.keys().next().value);return promise;
}
function deepGet(o,p) {return p.split('.').reduce((acc,k)=>acc?.[k],o);}
export function cloneConfig(config) {return JSON.parse(JSON.stringify(config));}
export async function renderPoster(canvas, config, iso=saToday(), options={}) {
  if(!canvas||!config)throw Error('لا توجد إعدادات صالحة للبطاقة');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso=saToday();
  config=resolveContent(config,iso);await loadTypeface(config.design?.fontFamily);
  await (document.fonts?.ready ?? Promise.resolve());
  const root=options.rootPrefix || 'assets/';
  const imageSrc=String(config.brand?.logo||'');
  const safeLogo=/^data:image\/(?:png|jpeg|webp);base64,/i.test(imageSrc) || /^assets\/[\w./-]+\.(?:png|webp|jpg)$/i.test(imageSrc);
  const definition=presetInfo(config.design?.preset),art=options.preview?definition.calendar?.background:definition.calendar?.original;
  const qrImage=async()=>{if(config.settings?.showQr===false)return null;if(config.card?.qrUrl){const u=new URL(config.card.qrUrl);if(!['http:','https:'].includes(u.protocol))throw Error('رابط QR غير صالح');const cv=document.createElement('canvas');await globalThis.ZyadQR.toCanvas(cv,u.href,{width:320,margin:1,errorCorrectionLevel:'M'});return cv;}return fetchImage(root+'qr.png');};
  const [logo, qr, background]=await Promise.all([safeLogo?fetchImage(imageSrc.startsWith('assets/')?(options.basePrefix||'')+imageSrc:imageSrc):null,qrImage(),art?fetchImage(new URL('../'+art,import.meta.url).href):null]);
  if(art&&!background)throw Error('تعذر تحميل خلفية القالب. تحقق من الاتصال وأعد المحاولة.');
  const scale=options.preview?Math.min(1,Math.max(.15,Number(options.scale)||.5)):([1,2,3].includes(Number(options.scale))?Number(options.scale):1);
  const ctx=canvas.getContext('2d',{alpha:false});canvas.width=W*scale;canvas.height=H*scale;
  ctx.scale(scale,scale);
  ctx.zyadFont=fontStack(config.design?.fontFamily);
  if(definition.calendar?.layout==='list'){renderListCalendar(ctx,config,iso,{logo,qr,background,remaining,hijriDate},definition);return canvas;}
  if(definition.calendar){renderCalendar(ctx,config,iso,{logo,qr,background,remaining,hijriDate},definition);return canvas;}
  const c=config.theme||{},green=c.green||'#064b43',soft=c.greenLight||'#37765e',gold=c.gold||'#c99a42',cream=c.cream||'#f8f5ea',ink=c.ink||'#103f38';
  if((config.design?.preset||'royal')!=='heritage') { renderPremium(ctx,config,iso,{logo,qr,remaining,hijriDate}); return canvas; }
  ctx.fillStyle=cream;ctx.fillRect(0,0,W,H);pattern(ctx,gold,ink);drawHeritageTrim(ctx,gold,ink);
  drawLantern(ctx,89,351,gold,green);drawLantern(ctx,991,351,gold,green);
  // Header: ornamental calendar plaques and central heraldic medallion.
  ctx.save();ctx.shadowColor='rgba(2,58,45,.25)';ctx.shadowBlur=23;ctx.shadowOffsetY=6;
  polyOrnament(ctx,540,198,204,184,green,gold);ctx.restore();
  polyOrnament(ctx,540,198,193,172,null,gold);
  ctx.lineWidth=3;ctx.strokeStyle=gold;ctx.beginPath();ctx.arc(540,198,153,0,Math.PI*2);ctx.stroke();
  if(logo){ctx.save();ctx.beginPath();ctx.arc(540,102,34,0,Math.PI*2);ctx.clip();ctx.drawImage(logo,506,68,68,68);ctx.restore();}
  else centralText(ctx,'✦',540,103,54,gold);
  centralText(ctx,weekday(iso),540,204,94,'white','800',375);
  centralText(ctx,config.brand?.subtitle||'بطاقتك اليومية',540,272,27,'#e6d6a4','700',340);
  roundedRect(ctx,26,147,312,109,22,soft,gold,4);
  roundedRect(ctx,742,147,312,109,22,soft,gold,4);
  centralText(ctx,iso.replaceAll('-','/'),182,187,46,'#fff','800',295);
  centralText(ctx,'ميلادي',182,236,27,'#f7e0a2');
  const hijri=hijriPanel(iso,config);
  centralText(ctx,hijri.number,898,187,46,'#fff','800',295);
  centralText(ctx,hijri.label,898,236,29,'#f7e0a2','800',280);
  // Elegant brand bar.
  roundedRect(ctx,285,380,510,61,18,'rgba(204,157,67,.14)',gold,2);
  centralText(ctx,config.brand?.name||'البطاقة اليومية',540,409,36,ink,'800',485);
  // Quote block.
  if(config.settings?.showQuote!==false&&config.daily){drawDailyPanel(ctx,config,55,468,970,254,{gold,ink});}
  else if(config.settings?.showQuote!==false){
    ctx.save();ctx.direction='rtl';ctx.textAlign='center';
    let fontSize=39;let lines=linesFor(ctx,config.card?.quote||'',935,fontSize,4);
    while(lines.length>3 && fontSize>30){fontSize-=2;lines=linesFor(ctx,config.card?.quote||'',935,fontSize,4);}
    lines=lines.slice(0,3);const spacing=57, start=501;
    lines.forEach((line,i)=>centralText(ctx,line,540,start+i*spacing,fontSize,ink,'800',947));ctx.restore();
    if(config.card?.attribution)centralText(ctx,config.card.attribution,540,693,23,soft,'700',760);
  }else{centralText(ctx,'مواعيدك اليومية',540,570,64,ink,'800',850);}
  // Dedicated, readable public-services promotion above the timetable.
  ctx.save();ctx.strokeStyle=gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(65,733);ctx.lineTo(1015,733);ctx.stroke();ctx.restore();
  if(config.settings?.showContact!==false){
    roundedRect(ctx,210,742,660,84,18,'rgba(248,237,210,.91)',gold,2);
    centralText(ctx,'الخدمات العامة',540,763,27,ink,'800',570);
    centralText(ctx,config.card?.servicePhone||'0538243481',540,799,42,green,'800',570);
  }
  // Countdown region with automatic compact layout.
  const counters=(config.counters||[]).filter(item=>item.enabled!==false).slice(0,24);
  const rows=Math.max(1,Math.ceil(counters.length/4));
  const available=810;const rowH=Math.min(197,available/rows);const firstY=885;
  const medalR=Math.min(66,rowH*.32);
  roundedRect(ctx,42,844,996,Math.max(195,rows*rowH+31),23,'rgba(228,213,173,.26)',gold,1.5);
  counters.forEach((item,index)=>{
    const col=index%4,row=Math.floor(index/4);
    // The first tile appears on the right, matching RTL reading order.
    const x=934-col*262;
    const y=firstY+row*rowH;
    drawBadge(ctx,x,y,remaining(item,iso),item.label||'موعد',medalR,green,gold,cream);
  });
  const bottomBase=Math.max(1535,Math.min(1640,885+rows*rowH+42));
  // Illustrated gold dunes inspired by traditional Saudi card motifs.
  ctx.save();ctx.beginPath();ctx.moveTo(0,bottomBase+180);ctx.bezierCurveTo(210,bottomBase-36,440,bottomBase+245,640,bottomBase+80);ctx.bezierCurveTo(820,bottomBase-35,960,bottomBase+120,1080,bottomBase+155);ctx.lineTo(1080,H);ctx.lineTo(0,H);ctx.closePath();let hill=ctx.createLinearGradient(0,bottomBase,0,H);hill.addColorStop(0,'#e6a92f');hill.addColorStop(1,'#c38b25');ctx.fillStyle=hill;ctx.fill();ctx.restore();
  // Heritage subscription plaque with a machine-readable WhatsApp QR (not a decorative placeholder).
  roundedRect(ctx,278,1644,743,179,23,'rgba(255,251,242,.97)',gold,3);
  centralText(ctx,config.card?.promo||'اشترك معنا مجانًا',647,1683,36,green,'800',700);
  centralText(ctx,'واتساب  '+(config.card?.phone||'0558930532'),647,1731,31,green,'800',690);
  centralText(ctx,'سناب شات  '+(config.card?.social||'z32.y'),647,1773,29,soft,'800',680);
  centralText(ctx,'امسح الرمز للاشتراك عبر الواتساب',647,1804,19,ink,'700',680);
  if(config.settings?.showQr!==false){
    roundedRect(ctx,62,1637,202,202,13,'#fff',gold,5);
    if(qr){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(qr,75,1650,176,176);ctx.restore();}
    else{centralText(ctx,'QR',163,1725,55,green);centralText(ctx,'واتساب',163,1783,25,green);}
  }
  ctx.fillStyle=green;ctx.beginPath();ctx.moveTo(0,1844);ctx.bezierCurveTo(355,1820,690,1815,1080,1844);ctx.lineTo(1080,1920);ctx.lineTo(0,1920);ctx.closePath();ctx.fill();
  centralText(ctx,'إعلان الخدمات العامة • '+(config.card?.servicePhone||'0538243481'),540,1876,31,'#ead08d','800',995);
  centralText(ctx,config.card?.disclaimer||'المواعيد تقديرية وتُراجع رسميًا',540,1910,18,'#fff','700',1000);
  return canvas;
}
export function downloadFile(name,blob){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
export async function getPngBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('تعذر إنشاء الصورة')),'image/png'));}
export function updateDeep(obj,path,value){const keys=path.split('.');let cursor=obj;for(const key of keys.slice(0,-1))cursor=cursor[key];cursor[keys.at(-1)]=value;}
export function currentValue(obj,path){return deepGet(obj,path);}
