/* Awan Saudi — three independent inspiration card designs.
 * Layout is measured against the shared advertisement/follow footer.
 * The message panels NEVER enter the banner, QR, or subscription area.
 */
import {fitText} from './text-layout.js?v=2';
import {footerGeometry} from './follow-panel.js?v=layout3';
import {drawCardFiligree,drawIconBadge} from './card-icons.js?v=awan1';
import {getLanguage,localeDate} from './locale.js?v=i18n4';

const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
function rounded(c,x,y,w,h,r,fill,edge=null,lw=1.4){
 if(!(w>0&&h>0))return;
 c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w*.5,h*.5));
 if(fill){c.fillStyle=fill;c.fill();}
 if(edge){c.strokeStyle=edge;c.lineWidth=lw;c.stroke();}
}
function rule(c,x,y,x2,y2,stroke,lw=1.6){
 c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();
}
function writing(c,words,bounds,{size=34,minSize=15,maxLines=2,weight=760,color='#164c3f',align='center',en=false}={}){
 if(!words)return;
 return fitText(c,words,{...bounds,size,minSize,maxLines,weight,color,align,direction:en?'ltr':'rtl',lineHeight:1.25});
}
function colors(preset,cfg){
 const options={
  botanical:{background:'#edf2e9',paper:'#fcfaf3',panel:'#fffefa',deep:'#125747',gold:'#b99755',soft:'#668376',quiet:'#e2ebe3',accent:'#daebe4'},
  royal:{background:'#d6e2d9',paper:'#f8f3e7',panel:'#fffdf6',deep:'#08483a',gold:'#bf9851',soft:'#607c67',quiet:'#eff0e6',accent:'#e4ebdf'},
  pearl:{background:'#eef3f0',paper:'#fffefa',panel:'#f6faf7',deep:'#286a61',gold:'#bea372',soft:'#6a8782',quiet:'#e5eee9',accent:'#e2f0eb'}
 };
 const p=options[preset]||options.botanical;
 const main=cfg.theme?.green;
 return {...p,deep:/^#[\da-f]{6}$/i.test(String(main||''))?main:p.deep};
}
export function inspirationLayout(dimensions=[1080,1920]){
 const [w,h]=dimensions,wide=w/h>1.4;
 const footer=footerGeometry(dimensions,'premium');
 const m=clamp(w*.044,22,58),gap=clamp(h*.014,12,26);
 const limit=footer.ad.y-gap;
 const header={x:m,y:m,w:w-2*m,h:wide?clamp(h*.18,78,134):clamp(h*.15,125,285)};
 const dates={x:m,y:header.y+header.h+gap,w:w-2*m,h:wide?44:clamp(h*.068,54,92)};
 const quoteY=dates.y+dates.h+gap;
 const available=limit-quoteY;
 const hasSecond=!wide&&available>=310;
 const secondaryHeight=hasSecond?clamp(available*.30,112,292):0;
 const quoteHeight=Math.max(70,available-(hasSecond?secondaryHeight+gap:0));
 const quote={x:m,y:quoteY,w:w-2*m,h:quoteHeight};
 const secondary=hasSecond?{x:m,y:quoteY+quoteHeight+gap,w:w-2*m,h:secondaryHeight}:null;
 return {w,h,m,gap,wide,header,dates,quote,secondary,footer,contentBottom:limit};
}
function bloom(c,cx,cy,r,p){
 c.save();c.strokeStyle=p.soft;c.lineWidth=Math.max(1.2,r*.08);
 c.beginPath();c.moveTo(cx,cy+r*.18);c.lineTo(cx,cy+r*1.45);c.stroke();
 for(let a=0;a<7;a++){
  const t=a*Math.PI*2/7;c.beginPath();
  c.ellipse(cx+Math.cos(t)*r*.53,cy+Math.sin(t)*r*.53,r*.22,r*.43,t,0,Math.PI*2);
  c.fillStyle=a%2?p.accent:'#f3dfb9';c.fill();
 }
 c.beginPath();c.arc(cx,cy,r*.2,0,Math.PI*2);c.fillStyle=p.gold;c.fill();c.restore();
}
function makeBackground(c,L,p,preset){
 const {w,h,m,footer}=L;
 const gradient=c.createLinearGradient(0,0,w,h);
 gradient.addColorStop(0,p.background);gradient.addColorStop(1,p.quiet);
 c.fillStyle=gradient;c.fillRect(0,0,w,h);
 const outer={x:m*.43,y:m*.52,w:w-m*.86,h:h-m*.9};
 rounded(c,outer.x,outer.y,outer.w,outer.h,clamp(m*.72,18,46),'rgba(255,255,255,.33)','rgba(255,255,255,.7)',2);
 const paperBottom=footer.ad.y+footer.ad.h+clamp(h*.012,8,23);
 rounded(c,m*.65,m*.78,w-m*1.3,paperBottom-m*.78,clamp(m*.52,17,39),p.paper,p.gold+'65',1.6);
 if(preset==='botanical'&&h>1100){
  drawCardFiligree(c,m*.65,m*.78,w-m*1.3,paperBottom-m*.78,{gold:p.gold,opacity:.09,large:true});
 }
 if(preset==='royal'){
  rounded(c,m*.73,m*.86,Math.max(4,m*.09),Math.max(15,paperBottom-m*1.3),2,p.gold);
 }else if(preset==='pearl'){
  rounded(c,m*.95,m*.96,w-m*1.90,3,2,p.gold);
 }
}
function header(c,L,p,preset,cfg,day,en){
 const r=L.header,wide=L.wide;
 const dark=preset==='royal',base=dark?p.deep:preset==='botanical'?p.accent:p.panel;
 rounded(c,r.x,r.y,r.w,r.h,clamp(r.h*.22,19,46),base,dark?p.gold:p.gold+'a5',dark?2.5:1.6);
 if(dark)rounded(c,r.x+7,r.y+7,r.w-14,r.h-14,clamp(r.h*.19,15,40),null,'rgba(242,221,167,.27)',1.2);
 // Native vector symbol, opt-in via the existing icon settings.
 // Keep it in the quiet outer corner, away from the Arabic weekday/title.
 if(cfg.design?.showIcons!==false&&!wide&&r.h>145){
  drawIconBadge(c,{icon:preset==='botanical'?'flower-2':preset==='royal'?'sparkles':'star'},
   r.x+r.w*.91,r.y+r.h*.24,Math.min(68,r.h*.28),
   {style:cfg.design?.iconStyle||'duotone',accent:p.gold,contrast:p.deep,featured:true});
 }
 const brand=cfg.brand?.[en?'nameEn':'name']|| (en?'Awan Saudi':'أوان السعودية');
 const mainColor=dark?'#fff9e9':p.deep,subColor=dark?'#e3cca0':p.soft;
 if(wide){
  writing(c,brand,{x:r.x+r.w*.53,y:r.y+r.h*.14,w:r.w*.40,h:r.h*.30},{size:clamp(r.h*.32,22,39),minSize:16,maxLines:1,color:mainColor,en,align:en?'left':'right',weight:850});
  writing(c,day,{x:r.x+r.w*.07,y:r.y+r.h*.20,w:r.w*.43,h:r.h*.61},{size:clamp(r.h*.58,37,70),minSize:25,maxLines:1,color:mainColor,en,weight:900});
 }else{
  writing(c,brand,{x:r.x+r.w*.16,y:r.y+r.h*.10,w:r.w*.68,h:r.h*.24},{size:clamp(r.h*.24,22,39),minSize:17,maxLines:1,color:subColor,en,weight:800});
  if(preset==='botanical'){
   const bloomSize=Math.min(31,r.h*.13);bloom(c,r.x+r.w*.12,r.y+r.h*.30,bloomSize,p);
  }else if(preset==='royal'){
   rule(c,r.x+r.w*.18,r.y+r.h*.36,r.x+r.w*.82,r.y+r.h*.36,'rgba(226,193,114,.65)',2);
  }else{
   rounded(c,r.x+r.w*.35,r.y+r.h*.35,r.w*.30,4,2,p.gold);
  }
  writing(c,day,{x:r.x+r.w*.13,y:r.y+r.h*.42,w:r.w*.74,h:r.h*.49},{size:clamp(r.h*.49,53,109),minSize:28,maxLines:1,color:mainColor,en,weight:900});
 }
}
function dates(c,L,p,iso,en){
 const r=L.dates,ink=p.deep;
 rounded(c,r.x,r.y,r.w,r.h,clamp(r.h*.28,12,25),p.panel,p.gold+'99',1.5);
 const greg=localeDate(iso,{day:'numeric',month:'long',year:'numeric'});
 const hijri=localeDate(iso,{day:'numeric',month:'long',year:'numeric'},'islamic-umalqura')+(en?' AH':' هـ');
 rule(c,r.x+r.w*.50,r.y+r.h*.20,r.x+r.w*.50,r.y+r.h*.80,p.gold,1.7);
 const pad=Math.max(7,r.w*.025),rw=r.w*.46;
 writing(c,greg,{x:r.x+r.w*.53,y:r.y+5,w:rw-pad,h:r.h-10},{size:clamp(r.h*.42,19,34),minSize:13,maxLines:2,color:ink,en,weight:750});
 writing(c,hijri,{x:r.x+pad,y:r.y+5,w:rw-pad,h:r.h-10},{size:clamp(r.h*.40,18,32),minSize:13,maxLines:2,color:ink,en,weight:730});
}
function chooseMessage(cfg,en,friday){
 const daily=cfg.daily;
 const hadith=cfg.content?.showHadith!==false&&daily?.hadith;
 const primary=hadith?daily.hadith.text:cfg.settings?.showQuote!==false?cfg.card?.quote:'';
 const source=hadith?daily.hadith.reference:cfg.card?.attribution||'';
 const second=friday
  ?[daily?.dhikr?.text,daily?.salawat?.text].filter(Boolean).join(' · ')
  :cfg.content?.showDua!==false&&daily?.dua?.text?daily.dua.text
   :(en?'A kind word leaves a lasting light.':'الكلمة الطيبة أثر جميل يبقى في القلوب');
 return {
  primary:primary||(friday?(en?'Send blessings upon the Prophet ﷺ':'أكثروا من الصلاة والسلام على النبي ﷺ'):(en?'A beautiful beginning for today':'اجعل يومك بدايةً لخير جميل')),
  source,
  heading:friday?(en?'Friday remembrance':'من هدي الجمعة'):(hadith?(en?'Authentic hadith':'مقتطف من حديث صحيح'):(en?'Daily inspiration':'رسالة اليوم')),
  second,
  secondTitle:friday?(en?'Remembrance & blessings':'ذكر وصلاة على النبي ﷺ'):(en?'Reflection of the day':'تأمل اليوم')
 };
}
function quote(c,L,p,preset,entry,en){
 const r=L.quote,short=r.h<215;
 rounded(c,r.x,r.y,r.w,r.h,clamp(r.h*.09,16,35),p.panel,p.gold+'b5',1.8);
 if(preset==='royal'){
  rounded(c,r.x+r.w*.28,r.y+11,r.w*.44,Math.min(10,r.h*.045),5,p.gold);
 }else if(preset==='pearl'){
  rounded(c,r.x+r.w*.90,r.y+24,r.w*.008,Math.max(19,r.h-48),3,p.gold);
 }
 const titleH=clamp(r.h*.16,21,43),headingY=r.y+clamp(r.h*.06,5,20);
 writing(c,entry.heading,{x:r.x+28,y:headingY,w:r.w-56,h:titleH},{size:clamp(r.h*.12,18,29),minSize:13,maxLines:1,color:p.gold,en,weight:850});
 const bottomSource=entry.source&&r.h>165?clamp(r.h*.14,22,43):0;
 const bodyY=headingY+titleH+clamp(r.h*.065,8,26),bodyH=Math.max(24,r.y+r.h-bodyY-bottomSource-18);
 const maxFont=clamp(r.h*.118,short?25:34,65);
 writing(c,entry.primary,{x:r.x+clamp(r.w*.055,17,52),y:bodyY,w:r.w-clamp(r.w*.11,34,104),h:bodyH},{size:maxFont,minSize:short?15:20,maxLines:short?3:5,color:p.deep,en,weight:850});
 if(bottomSource){
  writing(c,entry.source,{x:r.x+36,y:r.y+r.h-bottomSource-13,w:r.w-72,h:bottomSource},{size:clamp(r.h*.050,13,22),minSize:11,maxLines:1,color:p.soft,en,weight:550});
 }
}
function secondPanel(c,L,p,preset,entry,en){
 if(!L.secondary||!entry.second)return;
 const r=L.secondary;
 const fill=preset==='royal'?p.quiet:preset==='botanical'?'#f7faf4':p.accent;
 rounded(c,r.x,r.y,r.w,r.h,clamp(r.h*.12,16,30),fill,p.gold+'8d',1.4);
 const titleH=clamp(r.h*.22,22,43);
 writing(c,entry.secondTitle,{x:r.x+25,y:r.y+clamp(r.h*.045,5,12),w:r.w-50,h:titleH},{size:clamp(r.h*.16,18,34),minSize:14,maxLines:1,color:p.deep,en,weight:850});
 writing(c,entry.second,{x:r.x+33,y:r.y+titleH+clamp(r.h*.1,12,32),w:r.w-66,h:Math.max(25,r.h-titleH-clamp(r.h*.15,17,43))},{size:clamp(r.h*.16,23,42),minSize:16,maxLines:r.h>210?4:2,color:p.deep,en,weight:730});
}
export function drawInspirationCard(c,cfg,iso,preset,{dimensions=[1080,1920]}={}){
 const L=inspirationLayout(dimensions),p=colors(preset,cfg),en=getLanguage()==='en';
 const day=localeDate(iso,{weekday:'long'}),friday=cfg.daily?.special==='friday';
 makeBackground(c,L,p,preset);
 header(c,L,p,preset,cfg,day,en);
 dates(c,L,p,iso,en);
 const entry=chooseMessage(cfg,en,friday);
 quote(c,L,p,preset,entry,en);
 secondPanel(c,L,p,preset,entry,en);
 return L;
}
