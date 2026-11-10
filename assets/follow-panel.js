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
  showTitle:f.showTitle!==false,showQr:f.showQr!==false&&cfg.settings?.showQr!==false,
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
 const bg=mode==='custom'?f.backgroundColor:mode==='light'?'#fbfaf4':mode==='dark'?green:darkArt?green:pale;
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
function followBlock(c,cfg,qr,r,kind){
 const f=resolveFollow(cfg);if(!f.enabled)return;
 const {x,y,w,h}=r,p=palette(cfg,f,kind),unit=Math.min(w/956,h/163);
 c.save();
 rect(c,x,y,w,h,f.radius*unit,p.bg,p.border,Math.max(1.2,unit*2));
 const padding=13*unit;
 const showQR=Boolean(f.showQr&&qr);
 const qrSize=showQR?Math.min(h-48*unit,116*unit):0;
 const qrX=x+15*unit,qrY=y+10*unit;
 if(showQR){
  rect(c,qrX-3*unit,qrY-3*unit,qrSize+6*unit,qrSize+6*unit,10*unit,'#ffffff');
  c.imageSmoothingEnabled=false;c.drawImage(qr,qrX,qrY,qrSize,qrSize);c.imageSmoothingEnabled=true;
  if(f.qrCaption)line(c,f.qrCaption,qrX+qrSize/2,y+h-13*unit,10*unit,p.accent,qrSize+17*unit,650);
 }
 const contentX=x+(showQR?qrSize+43*unit:25*unit),contentW=w-(showQR?qrSize+68*unit:50*unit);
 const right=contentX+contentW,mid=contentX+contentW/2;
 if(f.showTitle){
  line(c,f.title,mid,y+32*unit,26*unit,p.fg,contentW-12*unit,850);
  if(f.subtitle&&h>=115*unit)line(c,f.subtitle,mid,y+58*unit,13*unit,p.accent,contentW-12*unit,600);
 }
 const channels=[];
 if(f.showWhatsapp&&f.whatsapp)channels.push([f.whatsappLabel,f.whatsapp]);
 if(f.showSnapchat&&f.snapchat)channels.push([f.snapchatLabel,f.snapchat]);
 const buttonTop=y+(f.showTitle?77:18)*unit;
 const availableHeight=Math.max(40*unit,y+h-buttonTop-12*unit);
 if(channels.length){
  const gap=12*unit,bw=(contentW-gap*(channels.length-1))/channels.length;
  channels.forEach(([label,value],i)=>{
   const bx=contentX+i*(bw+gap),bh=Math.min(availableHeight,71*unit);
   rect(c,bx,buttonTop,bw,bh,12*unit,p.chip,p.border,1*unit);
   line(c,label,bx+bw/2,buttonTop+Math.min(19*unit,bh*.30),15*unit,p.accent,bw-10*unit,750);
   line(c,value,bx+bw/2,buttonTop+bh*.72,24*unit,p.fg,bw-10*unit,850,'center','ltr');
  });
 }else if(!showQR){
  line(c,f.subtitle||'تابع بطاقاتنا اليومية',mid,buttonTop+18*unit,18*unit,p.fg,contentW-12*unit);
 }
 c.restore();
}
export function footerGeometry(dimensions,kind='calendar'){
 const [w,h]=dimensions;
 if(w===1080&&h===1920)return {x:39,y:1532,w:1002,h:371,ad:{x:119,y:1544,w:842,h:168},follow:{x:64,y:1720,w:952,h:161},noteY:1903};
 const landscape=w/h>1.4;
 const footerH=h*(landscape?.30:h<=1350?.255:.192);
 const y=h-footerH,outerX=w*.033,outerW=w*.934;
 const margin=Math.min(16,h*.012),bannerH=Math.min(footerH*.48,outerW*.83/5);
 const adW=bannerH*5,adX=(w-adW)/2;
 const followY=y+margin+bannerH+Math.max(8,h*.009),followH=h-followY-Math.max(10,h*.012);
 return {x:outerX,y,w:outerW,h:footerH,ad:{x:adX,y:y+margin,w:adW,h:bannerH},
  follow:{x:outerX+w*.015,y:followY,w:outerW-w*.03,h:followH},noteY:null};
}
export function drawCombinedFooter(c,cfg,banner,qr,{kind='calendar',dimensions=[1080,1920]}={}){
 const f=resolveFollow(cfg),hasBanner=cfg.advertising?.enabled!==false&&!!banner;
 const g=footerGeometry(dimensions,kind),p=palette(cfg,f,kind);
 c.save();
 // This region is part of the image itself and shares the template palette.
 rect(c,g.x,g.y,g.w,g.h,Math.min(f.radius+6,26),p.dark?'rgba(2,41,33,.91)':'rgba(255,253,247,.96)',p.border,1.5);
 if(hasBanner){
  // The advertised 5:1 artwork preserves its exact ratio and never obscures the QR.
  bannerInside(c,banner,g.ad.x,g.ad.y,g.ad.w,g.ad.h,12);
 }
 if(f.enabled)followBlock(c,cfg,qr,g.follow,kind);
 if(g.noteY)line(c,cfg.card?.disclaimer||'المواعيد تقديرية؛ راجع الجهة الرسمية',dimensions[0]/2,g.noteY,15,p.fg,dimensions[0]*.88,500);
 c.restore();
 return g;
}
