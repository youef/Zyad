import {renderPremium} from './design.js';
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
      let year=Number(iso.slice(0,4));
      const monthDay=target.slice(5);
      target=`${year}-${monthDay}`;
      if (target < iso || !isRealDate(target)) target=`${year+1}-${monthDay}`;
      if (!isRealDate(target)) target=`${year+2}-${monthDay}`;
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
  try { return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{year:'numeric',month:'long',day:'numeric', timeZone:'Asia/Riyadh'}).format(d) + ' هـ'; }
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
  ctx.save();ctx.direction='rtl';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${FONT}`;
  if(maxWidth){while(ctx.measureText(String(text)).width>maxWidth&&size>13){size-=1;ctx.font=`${weight} ${size}px ${FONT}`;}}
  ctx.fillText(String(text),x,y);ctx.restore();
}
function linesFor(ctx,raw,maxWidth,fontSize,maxLines=3) {
  ctx.font=`700 ${fontSize}px ${FONT}`;
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
  const promise=new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;});
  imageCache.set(src,promise);return promise;
}
function deepGet(o,p) {return p.split('.').reduce((acc,k)=>acc?.[k],o);}
export function cloneConfig(config) {return JSON.parse(JSON.stringify(config));}
export async function renderPoster(canvas, config, iso=saToday(), options={}) {
  if(!canvas||!config)throw Error('لا توجد إعدادات صالحة للبطاقة');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso=saToday();
  await (document.fonts?.ready ?? Promise.resolve());
  const root=options.rootPrefix || 'assets/';
  const imageSrc=String(config.brand?.logo||'');
  const safeLogo=/^data:image\/(?:png|jpeg|webp);base64,/i.test(imageSrc) || /^assets\/[\w./-]+\.(?:png|webp|jpg)$/i.test(imageSrc);
  const [logo, qr]=await Promise.all([safeLogo?fetchImage(imageSrc.startsWith('assets/')?(options.basePrefix||'')+imageSrc:imageSrc):null,config.settings?.showQr?fetchImage(root+'qr.png'):null]);
  const scale=[1,2,3].includes(Number(options.scale))?Number(options.scale):1;
  const ctx=canvas.getContext('2d',{alpha:false});canvas.width=W*scale;canvas.height=H*scale;
  ctx.scale(scale,scale);
  const c=config.theme||{},green=c.green||'#064b43',soft=c.greenLight||'#37765e',gold=c.gold||'#c99a42',cream=c.cream||'#f8f5ea',ink=c.ink||'#103f38';
  if((config.design?.preset||'royal')!=='heritage') { renderPremium(ctx,config,iso,{logo,qr,remaining,hijriDate}); return canvas; }
  ctx.fillStyle=cream;ctx.fillRect(0,0,W,H);pattern(ctx,gold,ink);
  // Header: ornamental calendar plaques and central heraldic medallion.
  polyOrnament(ctx,540,198,204,184,green,gold);
  ctx.lineWidth=3;ctx.strokeStyle=gold;ctx.beginPath();ctx.arc(540,198,162,0,Math.PI*2);ctx.stroke();
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
  if(config.settings?.showQuote!==false){
    ctx.save();ctx.direction='rtl';ctx.textAlign='center';
    let fontSize=39;let lines=linesFor(ctx,config.card?.quote||'',935,fontSize,4);
    while(lines.length>3 && fontSize>30){fontSize-=2;lines=linesFor(ctx,config.card?.quote||'',935,fontSize,4);}
    lines=lines.slice(0,3);const spacing=57, start=501;
    lines.forEach((line,i)=>centralText(ctx,line,540,start+i*spacing,fontSize,ink,'800',947));ctx.restore();
    if(config.card?.attribution)centralText(ctx,config.card.attribution,540,693,23,soft,'700',760);
  }else{centralText(ctx,'مواعيدك اليومية',540,570,64,ink,'800',850);}
  // Contact stripe.
  ctx.save();ctx.strokeStyle=gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(65,734);ctx.lineTo(1015,734);ctx.stroke();ctx.restore();
  if(config.settings?.showContact!==false){
    centralText(ctx,config.card?.promo||'اشترك معنا',540,764,33,green,'800',950);
    const contact=[config.card?.phone,config.card?.social].filter(Boolean).join('     •     ');
    if(contact)centralText(ctx,contact,540,805,33,soft,'800',895);
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
  // Bottom publication information and QR.
  roundedRect(ctx,280,1644,720,122,25,'rgba(249,246,232,.96)',gold,2);
  centralText(ctx,config.card?.footer||'بطاقة تتجدد يوميًا',638,1685,29,green,'800',690);
  centralText(ctx,config.card?.disclaimer||'',638,1735,22,soft,'700',680);
  if(config.settings?.showQr!==false){
    roundedRect(ctx,68,1635,194,194,12,'#fff',gold,3);
    if(qr){ctx.drawImage(qr,78,1645,174,174);}else{
      centralText(ctx,'QR',165,1710,55,green);
      centralText(ctx,'للاشتراك',165,1764,23,green);
    }
  }
  ctx.fillStyle=green;ctx.beginPath();ctx.moveTo(0,1832);ctx.bezierCurveTo(355,1815,690,1785,1080,1830);ctx.lineTo(1080,1920);ctx.lineTo(0,1920);ctx.closePath();ctx.fill();
  centralText(ctx,config.card?.promo||'بطاقتك اليومية',540,1870,38,'#e9c475','800',1000);
  centralText(ctx,`${weekday(iso)}  •  ${iso}`,540,1906,22,'#fff','700',990);
  return canvas;
}
export function downloadFile(name,blob){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
export async function getPngBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('تعذر إنشاء الصورة')),'image/png'));}
export function updateDeep(obj,path,value){const keys=path.split('.');let cursor=obj;for(const key of keys.slice(0,-1))cursor=cursor[key];cursor[keys.at(-1)]=value;}
export function currentValue(obj,path){return deepGet(obj,path);}
