import {localizedConfig,localeDate,getLanguage,translate} from './locale.js?v=i18n4';
import {nextPaymentDate} from './payment-schedule.js?v=pay2';
import {renderPremium} from './design.js?v=layout3';
import {bannerForPoster} from './advertising.js?v=working24';
import {drawInspirationCard} from './inspiration-card.js?v=friday1';
import {buildFollowQr,drawCombinedFooter} from './follow-panel.js?v=layout3';
import {renderHeritage} from './heritage-premium.js?v=layout3';
import {presetInfo} from './templates.js';
import {renderCalendar} from './calendar-design.js?v=layout3';
import {renderListCalendar} from './list-calendar.js?v=layout3';
import {drawDailyPanel} from './daily-panel.js?v=layout3';
import {renderResponsiveCard} from './responsive-card.js?v=3';
import {resolveContent} from './daily.js?v=friday1';
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
    const target=nextPaymentDate(item,iso);
    return target?Math.max(0,daysBetween(iso,target)):0;
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
  try { return localeDate(isoAdd(iso,offset),{year:'numeric',month:'long',day:'numeric'},'islamic-umalqura')+(getLanguage()==='en'?' AH':' هـ'); }
  catch { return 'التاريخ الهجري'; }
}
function hijriPanel(iso,cfg) {
  const override=iso===saToday()?cfg?.settings?.hijriOverride?.trim():'';
  if(override)return {number:override,label:'التاريخ الهجري'};
  const offset=Math.max(-3,Math.min(3,Number(cfg?.settings?.hijriOffset)||0));
  const date=new Date(isoAdd(iso,offset)+'T12:00:00Z');
  try {
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura',{year:'numeric',month:'numeric',day:'numeric',timeZone:'Asia/Riyadh'}).formatToParts(date).map(p=>[p.type,p.value]));
    const month=localeDate(isoAdd(iso,offset),{month:'long'},'islamic-umalqura');
    return {number:`${parts.year}/${parts.month}/${parts.day} ${getLanguage()==='en'?'AH':'هـ'}`,label:month};
  }catch {return {number:hijriDate(iso,cfg),label:'هجري'};}
}
function weekday(iso) {
  const d=new Date(iso+'T12:00:00Z');
  return localeDate(iso,{weekday:'long'});
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
  config=localizedConfig(resolveContent(config,iso));await loadTypeface(config.design?.fontFamily);
  await (document.fonts?.ready ?? Promise.resolve());
  const root=options.rootPrefix || 'assets/';
  const imageSrc=String(config.brand?.logo||'');
  const safeLogo=/^data:image\/(?:png|jpeg|webp);base64,/i.test(imageSrc) || /^assets\/[\w./-]+\.(?:png|webp|jpg|svg)$/i.test(imageSrc);
  const dimensions=Array.isArray(options.dimensions)&&options.dimensions.length===2&&options.dimensions.every(x=>Number.isInteger(x)&&x>100&&x<6000)?options.dimensions:[W,H];
  const nativeSize=dimensions[0]!==W||dimensions[1]!==H;
  const definition=presetInfo(config.design?.preset),art=nativeSize?null:(options.preview?definition.calendar?.background:definition.calendar?.original);
  const [logo,qr,background,banner]=await Promise.all([
    safeLogo?fetchImage(imageSrc.startsWith('assets/')?(options.basePrefix||'')+imageSrc:imageSrc):null,
    buildFollowQr(config),art?fetchImage(new URL('../'+art,import.meta.url).href):null,bannerForPoster(config)]);
  if(art&&!background)throw Error('تعذر تحميل خلفية القالب. تحقق من الاتصال وأعد المحاولة.');
  const scale=options.preview?Math.min(1,Math.max(.15,Number(options.scale)||.5)):options.displayScale?Math.min(1,Math.max(.5,Number(options.displayScale)||1)):([1,2,3].includes(Number(options.scale))?Number(options.scale):1);
  const ctx=canvas.getContext('2d',{alpha:false});canvas.width=W*scale;canvas.height=H*scale;
  ctx.scale(scale,scale);
  ctx.zyadFont=fontStack(config.design?.fontFamily);ctx.zyadLocale=getLanguage();
  if(nativeSize){canvas.width=Math.round(dimensions[0]*scale);canvas.height=Math.round(dimensions[1]*scale);ctx.setTransform(canvas.width/dimensions[0],0,0,canvas.height/dimensions[1],0,0);ctx.zyadFont=fontStack(config.design?.fontFamily);ctx.zyadLocale=getLanguage();renderResponsiveCard(ctx,config,iso,{dimensions,remaining,hijriDate,banner,qr});return canvas;}
  if(definition.inspiration){drawInspirationCard(ctx,config,iso,definition.inspiration);}
  else if(definition.calendar?.layout==='list'){renderListCalendar(ctx,config,iso,{logo,qr,background,remaining,hijriDate},definition);}
  else if(definition.calendar){renderCalendar(ctx,config,iso,{logo,qr,background,remaining,hijriDate},definition);}
  else if((config.design?.preset||'royal')==='heritage'){renderHeritage(ctx,config,iso,{logo,qr,remaining,hijriDate,hijriPanel,weekday});}
  else {renderPremium(ctx,config,iso,{logo,qr,remaining,hijriDate});}
  const adKind=definition.calendar
    ?(definition.calendar.layout==='list'?'list':'calendar')
    :(config.design?.preset==='heritage'?'heritage':'premium');
  drawCombinedFooter(ctx,config,banner,qr,{kind:adKind,dimensions:[1080,1920]});
  return canvas;
}
export function downloadFile(name,blob){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
export async function getPngBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('تعذر إنشاء الصورة')),'image/png'));}
export function updateDeep(obj,path,value){const keys=path.split('.');let cursor=obj;for(const key of keys.slice(0,-1))cursor=cursor[key];cursor[keys.at(-1)]=value;}
export function currentValue(obj,path){return deepGet(obj,path);}
