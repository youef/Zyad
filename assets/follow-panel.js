/* Shared Saudi Calendar footer: image advertisement ABOVE editable follow-up block.
 * Drawn into the source canvas before any export, never an HTML overlay. */
import './vendor/qrcode.js';
import {validBannerSource} from './advertising.js';

export const FOLLOW_DEFAULTS=Object.freeze({
 enabled:true,title:'للاشتراك والمتابعة بالبطاقة اليومية',
 subtitle:'تابع جديد البطاقات يوميًا',
 showTitle:true,showQr:true,qrCaption:'امسح للمتابعة',
 qrUrl:'',showWhatsapp:true,whatsappLabel:'واتساب',whatsapp:'0558930532',
 showSnapchat:true,snapchatLabel:'سناب شات',snapchat:'z32.y',
 colorMode:'auto',backgroundColor:'#073f34',textColor:'#ffffff',
 accentColor:'#e9c77c',radius:20
});
const clean=(v,f,n)=>String(v??f).replace(/[\x00-\x1f]+/g,' ').trim().slice(0,n);
const validColor=s=>/^#[0-9a-f]{6}$/i.test(s||'');
const defaultUrl='https://wa.me/966558930532';
export function resolveFollow(cfg={}){
 const f=cfg.follow||{},c=cfg.card||{},base=FOLLOW_DEFAULTS;
 return {
  enabled:f.enabled!==false,
  title:clean(f.title,base.title,90),subtitle:clean(f.subtitle,base.subtitle,100),
  showTitle:f.showTitle!==false,showQr:f.showQr==null?cfg.settings?.showQr!==false:f.showQr!==false,
  qrCaption:clean(f.qrCaption,base.qrCaption,34),
  qrUrl:clean(f.qrUrl||c.qrUrl||defaultUrl,defaultUrl,350),
  showWhatsapp:f.showWhatsapp!==false,
  whatsappLabel:clean(f.whatsappLabel,base.whatsappLabel,30),
  whatsapp:clean(f.whatsapp,c.phone||base.whatsapp,30),
  showSnapchat:f.showSnapchat!==false,
  snapchatLabel:clean(f.snapchatLabel,base.snapchatLabel,30),
  snapchat:clean(f.snapchat,c.social||base.snapchat,40),
  colorMode:['auto','light','dark','custom'].includes(f.colorMode)?f.colorMode:'auto',
  backgroundColor:validColor(f.backgroundColor)?f.backgroundColor:base.backgroundColor,
  textColor:validColor(f.textColor)?f.textColor:base.textColor,
  accentColor:validColor(f.accentColor)?f.accentColor:base.accentColor,
  radius:Math.min(35,Math.max(8,Number(f.radius)||base.radius))
 };
}
function validateUrl(raw){
 let u;try{u=new URL(raw);}catch{throw Error('رابط متابعة QR غير صالح');}
 if(!['https:','http:'].includes(u.protocol)||raw.length>350)throw Error('رابط متابعة QR غير صالح');
 return u.href;
}
export function validateFollow(f){
 if(!f)return true;
 if(typeof f!=='object'||Array.isArray(f))throw Error('إعدادات الاشتراك غير صالحة');
 for(const [key,max]of Object.entries({title:90,subtitle:100,qrCaption:34,whatsappLabel:30,whatsapp:30,snapchatLabel:30,snapchat:40,qrUrl:350})){
  if(f[key]!=null&&(typeof f[key]!=='string'||f[key].length>max))throw Error('حقل المتابعة طويل جدًا: '+key);
 }
 if(f.qrUrl)validateUrl(f.qrUrl);
 if(f.colorMode&&!['auto','light','dark','custom'].includes(f.colorMode))throw Error('وضع ألوان المتابعة غير صالح');
 for(const k of ['backgroundColor','textColor','accentColor'])if(f[k]!=null&&!validColor(f[k]))throw Error('لون المتابعة غير صالح');
 if(f.radius!=null&&(!Number.isFinite(Number(f.radius))||Number(f.radius)<8||Number(f.radius)>35))throw Error('انحناء الزوايا غير صالح');
 return true;
}
export async function buildFollowQr(cfg={}){
 const f=resolveFollow(cfg);
 if(!f.enabled||!f.showQr)return null;
 const link=validateUrl(f.qrUrl);
 if(!globalThis.ZyadQR?.toCanvas)throw Error('مكتبة رمز QR غير جاهزة');
 const q=document.createElement('canvas');
 await globalThis.ZyadQR.toCanvas(q,link,{width:350,margin:2,errorCorrectionLevel:'H'});
 return q;
}
let publicFollow;
export async function getPublishedFollow(){
 if(!publicFollow)publicFollow=fetch(new URL('../data/config.json',import.meta.url),{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('تعذر تحميل إعدادات المتابعة');return r.json();})
  .then(c=>({follow:c.follow||{},card:c.card||{},settings:c.settings||{},theme:c.theme||{},design:c.design||{}}))
  .catch(()=>({follow:{},card:{},settings:{},theme:{},design:{}}));
 return publicFollow;
}
const luminance=hex=>{
 const a=(hex.match(/[\da-f]{2}/gi)||['12','3a','30']).slice(0,3).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return a[0]*.2126+a[1]*.7152+a[2]*.0722;
};
function palette(cfg,f,kind){
 const theme=cfg.theme||{};
 const green=validColor(theme.green)?theme.green:'#064f3e';
 const gold=validColor(theme.gold)?theme.gold:'#d7b777';
 const pale=validColor(theme.cream)?theme.cream:'#f8f4e9';
 const darkArt=kind==='heritage'||kind==='premium'||kind==='night'||(validColor(pale)&&luminance(pale)<.16);
 const mode=f.colorMode;
 const bg=mode==='custom'?f.backgroundColor:mode==='light'?'#fbfaf4':mode==='dark'?(luminance(green)<.34?green:'#073f34'):darkArt?green:pale;
 const dark=luminance(bg)<.35;
 return {bg,fg:mode==='custom'?f.textColor:dark?'#ffffff':'#173f35',
  accent:mode==='custom'?f.accentColor:dark?gold:green,
  chip:dark?'rgba(255,255,255,.13)':'rgba(7,81,63,.075)',
  border:dark?'rgba(240,221,166,.48)':'rgba(24,97,76,.22)',dark};
}
function rect(c,x,y,w,h,r,fill,stroke,lw=1){
 c.beginPath();c.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2)));
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
}
function line(c,t,x,y,size,color,maxWidth,weight=700,align='center',dir='rtl'){
 const value=String(t||'');if(!value)return;
 c.save();c.direction=dir;c.textBaseline='middle';c.textAlign=align;c.fillStyle=color;
 let n=size;do{c.font=weight+' '+n+'px '+(c.zyadFont||'"Cairo",Tahoma,Arial,sans-serif');
 if(c.measureText(value).width<=maxWidth||n<=10)break;n-=1;}while(n>10);
 c.fillText(value,x,y,maxWidth);c.restore();
}
function bannerInside(c,img,x,y,w,h,r=12){
 if(!img)return;
 const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
 if(!iw||!ih)return;
 const scale=Math.min(w/iw,h/ih),bw=iw*scale,bh=ih*scale;
 c.save();rect(c,x,y,w,h,r,null,null);c.clip();
 c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 c.drawImage(img,x+(w-bw)/2,y+(h-bh)/2,bw,bh);c.restore();
}
/* Compact RTL, three-zone footer: RIGHT = subscription, CENTER = stacked
 * WhatsApp / Snapchat, LEFT = a readable QR. Every position is canvas-space. */
export function followLayout(region,{showQr=true}={}){
 const {x,y,w,h}=region,unit=Math.min(1.35,w/952,h/126);
 const pad=14*unit,gap=13*unit,qrSize=showQr?Math.min(h-28*unit,106*unit):0;
 const qrZone=showQr?Math.max(qrSize+18*unit,w*.145):0;
 const titleZone=Math.min(w*.315,Math.max(w*.265,284*unit));
 const centerWidth=w-pad*2-qrZone-titleZone-(showQr?gap*2:gap);
 const qr={x:x+pad+5*unit,y:y+(h-qrSize)/2-6*unit,size:qrSize};
 const middle={x:x+pad+qrZone+(showQr?gap:0),y:y+10*unit,w:centerWidth,h:h-20*unit};
 const title={x:middle.x+middle.w+gap,y:y+9*unit,w:titleZone,h:h-18*unit};
 return {qr,middle,title,unit};
}
function titleLines(c,phrase,maxWidth,initialSize,limit=2){
 const words=String(phrase||'').trim().split(/\s+/).filter(Boolean);if(!words.length)return {lines:[],size:initialSize};
 let size=initialSize,lines=[];
 do{
  c.font='800 '+size+'px '+(c.zyadFont||'"Cairo",Tahoma,Arial,sans-serif');
  lines=[];let current='';
  for(const word of words){
   const candidate=current?current+' '+word:word;
   if(current&&c.measureText(candidate).width>maxWidth){lines.push(current);current=word;}
   else current=candidate;
  }if(current)lines.push(current);
  if(lines.length<=limit&&lines.every(s=>c.measureText(s).width<=maxWidth))break;
  size-=1;
 }while(size>12);
 if(lines.length>limit){lines=lines.slice(0,limit);lines[limit-1]+='…';}
 return {lines,size};
}
function followBlock(c,cfg,qr,r,kind){
 const f=resolveFollow(cfg);if(!f.enabled)return;
 const {x,y,w,h}=r,p=palette(cfg,f,kind),layout=followLayout(r,{showQr:Boolean(f.showQr&&qr)});
 const {qr:q,middle,title,unit}=layout;
 c.save();
 rect(c,x,y,w,h,f.radius*unit,p.bg,p.border,Math.max(1.1,1.4*unit));
 // QR on the far LEFT, with its own quiet zone for reliable scanning.
 if(q.size>0){
   rect(c,q.x-4*unit,q.y-4*unit,q.size+8*unit,q.size+8*unit,7*unit,'#ffffff');
   c.imageSmoothingEnabled=false;c.drawImage(qr,q.x,q.y,q.size,q.size);c.imageSmoothingEnabled=true;
   if(f.qrCaption)line(c,f.qrCaption,q.x+q.size/2,y+h-9*unit,10*unit,p.accent,q.size+16*unit,650);
 }
 // The CENTER has two low-profile rows, not two large side-by-side boxes.
 const channels=[];
 if(f.showWhatsapp&&f.whatsapp)channels.push([f.whatsappLabel,f.whatsapp]);
 if(f.showSnapchat&&f.snapchat)channels.push([f.snapchatLabel,f.snapchat]);
 if(channels.length){
   const rowGap=6*unit,rowHeight=Math.min(43*unit,(middle.h-rowGap*(channels.length-1))/channels.length);
   const used=channels.length*rowHeight+(channels.length-1)*rowGap;
   const top=middle.y+(middle.h-used)/2;
   channels.forEach(([label,value],i)=>{
      const ry=top+i*(rowHeight+rowGap),cy=ry+rowHeight/2;
      rect(c,middle.x,ry,middle.w,rowHeight,10*unit,p.chip,p.border,1*unit);
      const labelMax=Math.min(middle.w*.31,148*unit);
      line(c,label,middle.x+middle.w-10*unit,cy,14*unit,p.accent,labelMax,780,'right');
      line(c,value,middle.x+12*unit,cy,20*unit,p.fg,middle.w-labelMax-38*unit,850,'left','ltr');
   });
 }
 // The RIGHT title is at most two lines, with optional small subheading.
 if(f.showTitle&&f.title){
   const max=title.w-18*unit,setting=titleLines(c,f.title,max,22*unit,2),rows=setting.lines;
   const lineHeight=Math.max(20*unit,setting.size*1.33);
   const hasSubtitle=Boolean(f.subtitle),headingH=rows.length*lineHeight;
   const anchorY=title.y+(title.h-headingH-(hasSubtitle?19*unit:0))/2+lineHeight/2;
   rows.forEach((row,i)=>line(c,row,title.x+title.w-5*unit,anchorY+i*lineHeight,setting.size,p.fg,max,850,'right'));
   if(hasSubtitle)line(c,f.subtitle,title.x+title.w-5*unit,anchorY+headingH-1*unit,
     10*unit,p.accent,max,600,'right');
 }else if(f.subtitle){
   line(c,f.subtitle,title.x+title.w-5*unit,title.y+title.h/2,15*unit,p.fg,title.w-15*unit,700,'right');
 }
 c.restore();
}
export function footerGeometry(dimensions,kind='calendar'){
 const [w,h]=dimensions,landscape=w/h>1.4;
 // Everything shares one inset grid: no footer card may extend past the
 // main poster's inside edge, regardless of export aspect ratio.
 const inset=Math.max(16,Math.round(w*(landscape?.035:.038)));
 const outerX=inset,outerW=w-inset*2;
 const noteY=h-Math.max(25,Math.round(h*.025));
 const followHeight=landscape?Math.max(74,Math.min(110,h*.16)):
   Math.max(92,Math.min(126,h*.084));
 const bottomAir=Math.max(24,Math.min(55,h*.03));
 const followY=noteY-bottomAir-followHeight;
 const adHeight=landscape?Math.max(66,Math.min(125,h*.18)):
   Math.max(86,Math.min(150,h*.083));
 const between=Math.max(19,Math.min(27,h*.014));
 const adY=followY-between-adHeight;
 const followInset=Math.max(10,Math.min(19,w*.016));
 const followW=outerW-2*followInset;
 const adW=Math.min(adHeight*5,followW);
 return {
  x:outerX,y:adY,w:outerW,h:h-adY,
  ad:{x:(w-adW)/2,y:adY,w:adW,h:adHeight},
  follow:{x:(w-followW)/2,y:followY,w:followW,h:followHeight},
  noteY
 };
}
function existingPaperColor(c,x,y){
 // Pick up the template's existing paper, not an unrelated white box.
 // Sampling the open right-hand gutter avoids the text and table cells.
 try{
  const d=c.getImageData(Math.round(x),Math.round(y),1,1).data;
  if(d[3]>245)return `rgb(${d[0]},${d[1]},${d[2]})`;
 }catch{}
 return '#f3f5ef';
}
export function drawCombinedFooter(c,cfg,banner,qr,{kind='calendar',dimensions=[1080,1920]}={}){
 const f=resolveFollow(cfg),hasBanner=cfg.advertising?.enabled!==false&&!!banner;
 const g=footerGeometry(dimensions,kind);
 if(!hasBanner&&!f.enabled)return g;
 const [w,h]=dimensions;
 c.save();
 const top=hasBanner?g.ad.y-9:g.follow.y-13;
 const paper=existingPaperColor(c,g.x+15,Math.max(38,top-23));
 // Cover only the former footer content. No extra outer rounded rectangle:
 // the poster's native frame stays visible, with a continuous paper surface.
 c.fillStyle=paper;
 c.fillRect(g.x,top,g.w,h-top-Math.max(10,h*.012));
 // A fine divider gives the advertisement a clear start, without making it
 // look like a second card pasted over the main calendar.
 c.strokeStyle='rgba(111,119,99,.21)';
 c.lineWidth=Math.max(1,w/1080);
 c.beginPath();c.moveTo(g.x+12,top+1);c.lineTo(g.x+g.w-12,top+1);c.stroke();
 if(hasBanner)bannerInside(c,banner,g.ad.x,g.ad.y,g.ad.w,g.ad.h,Math.min(12,g.ad.h*.1));
 if(f.enabled)followBlock(c,cfg,qr,g.follow,kind);
 const p=palette(cfg,f,kind);
 line(c,cfg.card?.disclaimer||'المواعيد تقديرية؛ راجع الجهة الرسمية',
   w/2,g.noteY,Math.max(10,Math.min(15,w*.013)),p.dark?'#ffffff':'#2b4b42',
   g.follow.w*.9,500);
 c.restore();
 return g;
}
