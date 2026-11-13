import {getLanguage,translate} from './locale.js?v=i18n4';
import {fitText,formatCounter} from './text-layout.js?v=2';
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
 const value=String(translate(t)||'');if(!value)return;
 c.save();c.direction=getLanguage()==='en'?'ltr':dir;c.textBaseline='middle';c.textAlign=align;c.fillStyle=color;
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
// Subtle frosted-glass surfaces. Each card sits directly above the template
// artwork; no opaque parent panel or fake white backing is painted behind them.
function glassPanel(c,x,y,w,h,r,dark=false){
 if(w<=0||h<=0)return;
 c.save();
 c.shadowColor=dark?'rgba(0,0,0,.18)':'rgba(8,55,47,.11)';
 c.shadowBlur=12;
 c.shadowOffsetY=3;
 const gradient=c.createLinearGradient(x,y,x,y+h);
 gradient.addColorStop(0,dark?'rgba(255,255,255,.24)':'rgba(255,255,255,.72)');
 gradient.addColorStop(1,dark?'rgba(255,255,255,.09)':'rgba(255,255,255,.29)');
 rect(c,x,y,w,h,r,gradient,dark?'rgba(255,255,255,.35)':'rgba(255,255,255,.83)',1.3);
 c.restore();
 // A tiny highlight on the upper inner edge adds depth without clutter.
 c.save();
 c.strokeStyle=dark?'rgba(255,255,255,.24)':'rgba(255,255,255,.60)';
 c.lineWidth=.8;
 c.beginPath();c.moveTo(x+r,y+2);c.lineTo(x+w-r,y+2);c.stroke();
 c.restore();
}
function footerBackgroundIsDark(c,region,fallback=false){
 // Sample the underlying canvas artwork *before* painting any glass layer.
 // This ensures both pale and dark poster templates get legible typography.
 try{
  const sample=c.getImageData(Math.round(region.x+region.w/2),
    Math.round(region.y+region.h/2),1,1).data;
  if(sample[3]<180)return fallback;
  const brightness=(sample[0]*.2126+sample[1]*.7152+sample[2]*.0722)/255;
  return brightness<.49;
 }catch{return fallback;}
}
function drawWhatsAppIcon(c,cx,cy,size){
 c.save();c.translate(cx-size/2,cy-size/2);c.scale(size/40,size/40);
 rect(c,0,0,40,40,11,'#25D366','rgba(255,255,255,.6)',.9);
 // White chat bubble with a tail and an unmistakable telephone receiver.
 c.beginPath();c.arc(20.4,18.5,11.7,0,Math.PI*2);
 c.strokeStyle='#fff';c.lineWidth=2.5;c.stroke();
 c.beginPath();c.moveTo(11.7,26);c.lineTo(9.2,32.2);c.lineTo(15.6,29.5);
 c.strokeStyle='#fff';c.lineWidth=2.5;c.lineJoin='round';c.stroke();
 c.beginPath();
 c.moveTo(15.5,12.9);c.bezierCurveTo(14.1,13.1,13.9,15.3,14.8,17.4);
 c.bezierCurveTo(16.6,22.1,20.4,25.1,25,25.8);
 c.bezierCurveTo(27.3,26,28.2,23.1,26.5,22.4);
 c.lineTo(23.1,20.8);c.lineTo(21.4,22.7);
 c.bezierCurveTo(19.6,22,17.8,20.1,17,18.4);
 c.lineTo(18.5,16.5);c.lineTo(16.6,13);c.closePath();
 c.fillStyle='#fff';c.fill();c.restore();
}
function drawSnapchatIcon(c,cx,cy,size){
 c.save();c.translate(cx-size/2,cy-size/2);c.scale(size/40,size/40);
 rect(c,0,0,40,40,11,'#FFFC00','rgba(47,47,12,.18)',.9);
 // Crisp vector ghost, not a platform-dependent emoji.
 c.beginPath();
 c.moveTo(13.4,19.5);c.lineTo(13.4,15.5);
 c.bezierCurveTo(13.4,7.7,26.6,7.7,26.6,15.5);
 c.lineTo(26.6,19.5);
 c.bezierCurveTo(27.8,22.4,29.6,22.7,31.6,23.1);
 c.bezierCurveTo(33.4,23.6,31.6,25.5,28.5,26.4);
 c.bezierCurveTo(27.8,27.5,28.6,28.6,29.4,29.3);
 c.bezierCurveTo(27.3,29,26.3,29.9,25.1,31.3);
 c.bezierCurveTo(22.5,30.3,17.5,30.3,14.9,31.3);
 c.bezierCurveTo(13.7,29.9,12.7,29,10.6,29.3);
 c.bezierCurveTo(11.4,28.6,12.2,27.5,11.5,26.4);
 c.bezierCurveTo(8.4,25.5,6.6,23.6,8.4,23.1);
 c.bezierCurveTo(10.4,22.7,12.2,22.4,13.4,19.5);
 c.closePath();c.fillStyle='#fff';c.strokeStyle='#171717';c.lineWidth=1.55;
 c.lineJoin='round';c.fill();c.stroke();
 c.restore();
}
function followBlock(c,cfg,qr,r,kind){
 const f=resolveFollow(cfg);if(!f.enabled)return;
 const p=palette(cfg,f,kind),layout=followLayout(r,{showQr:Boolean(f.showQr&&qr)});
 const {qr:q,middle,title,unit}=layout;
 const dark=footerBackgroundIsDark(c,r,p.dark);
 const textColor=f.colorMode==='custom'?p.fg:dark?'#fff9eb':'#123f36';
 const subColor=f.colorMode==='custom'?p.accent:dark?'#e8d49c':'#3a6a5b';
 const radius=Math.min(f.radius*unit,15*unit);
 c.save();
 // QR: its white quiet zone is required for scanning. The area surrounding it
 // is translucent and independent of the rest of the footer.
 if(q.size>0){
  const qrBoxX=q.x-9*unit,qrBoxY=q.y-8*unit;
  const qrBoxW=q.size+18*unit,qrBoxH=q.size+26*unit;
  glassPanel(c,qrBoxX,qrBoxY,qrBoxW,qrBoxH,radius,dark);
  rect(c,q.x-3*unit,q.y-3*unit,q.size+6*unit,q.size+6*unit,6*unit,'#fff');
  c.imageSmoothingEnabled=false;c.drawImage(qr,q.x,q.y,q.size,q.size);
  c.imageSmoothingEnabled=true;
  if(f.qrCaption)line(c,f.qrCaption,q.x+q.size/2,qrBoxY+qrBoxH-9*unit,
    10*unit,subColor,qrBoxW-8*unit,650);
 }
 // Two individual glass rows: genuine vector logos at the right edge,
 // with phone number and Snapchat ID centered in the remaining visual space.
 const channels=[];
 if(f.showWhatsapp&&f.whatsapp)channels.push(['whatsapp',f.whatsapp]);
 if(f.showSnapchat&&f.snapchat)channels.push(['snapchat',f.snapchat]);
 if(channels.length){
  const gap=7*unit,rowHeight=Math.min(44*unit,(middle.h-gap*(channels.length-1))/channels.length);
  const used=channels.length*rowHeight+(channels.length-1)*gap;
  const top=middle.y+(middle.h-used)/2;
  channels.forEach(([type,value],i)=>{
   const ry=top+i*(rowHeight+gap),cy=ry+rowHeight/2;
   glassPanel(c,middle.x,ry,middle.w,rowHeight,Math.min(12*unit,radius),dark);
   const iconSize=Math.min(29*unit,rowHeight-8*unit);
   const iconX=middle.x+middle.w-12*unit-iconSize/2;
   if(type==='whatsapp')drawWhatsAppIcon(c,iconX,cy,iconSize);
   else drawSnapchatIcon(c,iconX,cy,iconSize);
   const freeRight=middle.x+middle.w-iconSize-24*unit;
   const valueCenter=(middle.x+7*unit+freeRight)/2;
   const valueWidth=Math.max(28,freeRight-(middle.x+18*unit));
   fitText(c,value,{x:valueCenter-valueWidth/2,y:ry+3*unit,w:valueWidth,h:rowHeight-6*unit,size:20*unit,minSize:10,maxLines:1,color:textColor,weight:850,direction:'ltr'});
  });
 }
 // Separate glass block for the subscription heading on the RIGHT.
 // Preserve the editing controls for title and subtitle visibility.
 if((f.showTitle&&f.title)||f.subtitle){
  glassPanel(c,title.x,title.y,title.w,title.h,radius,dark);
  const max=title.w-24*unit;
  if(f.showTitle&&f.title){
   const subtitleVisible=Boolean(f.subtitle),headHeight=subtitleVisible?title.h*.7:title.h*.92;
   fitText(c,f.title,{x:title.x+12*unit,y:title.y+3*unit,w:max,h:headHeight-3*unit,size:21*unit,minSize:11,maxLines:2,color:textColor,weight:850});
   if(subtitleVisible)fitText(c,f.subtitle,{x:title.x+12*unit,y:title.y+title.h*.72,w:max,h:title.h*.22,size:12*unit,minSize:9,maxLines:1,color:subColor,weight:600});
  }else{
   line(c,f.subtitle,title.x+title.w/2,title.y+title.h/2,
     15*unit,textColor,max,700,'center');
  }
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
 const followHeight=landscape?Math.max(78,Math.min(108,h*.14)):
   Math.max(92,Math.min(126,h*.084));
 const bottomAir=landscape?Math.max(12,Math.min(19,h*.025)):Math.max(24,Math.min(55,h*.03));
 const followY=noteY-bottomAir-followHeight;
 const adHeight=landscape?Math.max(48,Math.min(88,h*.10)):
   Math.max(86,Math.min(150,h*.083));
 const between=landscape?Math.max(12,Math.min(17,h*.016)):Math.max(19,Math.min(27,h*.014));
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
export function drawCombinedFooter(c,cfg,banner,qr,{kind='calendar',dimensions=[1080,1920]}={}){
 const f=resolveFollow(cfg),hasBanner=cfg.advertising?.enabled!==false&&!!banner;
 const g=footerGeometry(dimensions,kind),[w,h]=dimensions;
 c.save();
 // No background fill or border: preserve the underlying artwork and patterns.
 if(hasBanner)bannerInside(c,banner,g.ad.x,g.ad.y,g.ad.w,g.ad.h,Math.min(12,g.ad.h*.1));
 if(f.enabled)followBlock(c,cfg,qr,g.follow,kind);
 // One common disclaimer for every poster variant (legacy renderers omit theirs).
 const ink=cfg.theme?.ink||'#173f35';
 line(c,cfg.card?.disclaimer||'المواعيد تقديرية؛ راجع الجهة الرسمية',
   w/2,g.noteY,Math.max(10,Math.min(15,w*.013)),ink,g.follow.w*.9,500);
 c.restore();
 return g;
}
