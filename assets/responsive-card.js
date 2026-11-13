/* Native Saudi premium card for square, 4:5, landscape and tall poster exports.
 * Content reflows instead of letterboxing a 1080×1920 screenshot.
 */
import {fitText,formatCounter} from './text-layout.js?v=2';
import {drawIconBadge,drawCardFiligree} from './card-icons.js?v=awan1';
import {footerGeometry,drawCombinedFooter} from './follow-panel.js?v=layout3';
import {getLanguage,localeDate} from './locale.js?v=i18n4';
import {hasCardMessage} from './daily.js?v=friday1';

const limit=(v,min,max)=>Math.max(min,Math.min(max,v));
const safeColor=(v,defaultValue)=>/^#[0-9a-f]{6}$/i.test(String(v||''))?v:defaultValue;
function rgba(hex,alpha){const h=safeColor(hex,'#0b513f');return 'rgba('+[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',')+','+alpha+')';}
function blend(a,b,ratio){
 const first=safeColor(a,'#145746'),last=safeColor(b,'#145746');
 return '#'+[1,3,5].map(i=>Math.round(parseInt(first.slice(i,i+2),16)*(1-ratio)+parseInt(last.slice(i,i+2),16)*ratio).toString(16).padStart(2,'0')).join('');
}
function panel(c,x,y,w,h,r,fill,stroke=null,width=1.2){
 if(w<=0||h<=0)return;
 c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function text(c,value,x,y,w,h,size,color,{align='center',weight=750,maxLines=2,en=false,minSize=12}={}){
 return fitText(c,value,{x,y,w,h,size,minSize,maxLines,weight,color,align,direction:en?'ltr':'rtl'});
}
function rowsFor(cfg,en){
 if(!hasCardMessage(cfg))return [];
 const daily=cfg.daily,friday=daily?.special==='friday',rows=[];
 if(daily?.hadith&&cfg.content?.showHadith!==false)rows.push({title:friday?(en?'Friday hadith':'حديث الجمعة'):(en?'Authentic hadith':'حديث صحيح'),value:daily.hadith.text,source:daily.hadith.reference});
 if(daily?.dua&&(friday?cfg.content?.fridayReminders!==false:cfg.content?.showDua!==false))rows.push({title:friday?(en?'Remembrance and salawat':'ذكر وصلاة على النبي ﷺ'):(en?'Supplication':'دعاء اليوم'),value:daily.dua.text,source:daily.dua.reference});
 if(!rows.length&&cfg.card?.quote)rows.push({title:en?'Today’s message':'رسالة اليوم',value:cfg.card.quote,source:cfg.card.attribution});
 return rows.slice(0,2);
}
export function renderResponsiveCard(c,cfg,iso,{dimensions,remaining,hijriDate,banner,qr}={}){
 const [w,h]=dimensions,wide=w/h>1.4,compact=h<750,en=getLanguage()==='en';
 const green=safeColor(cfg.theme?.green,'#115743'),gold=safeColor(cfg.theme?.gold,'#bf9952'),deep=blend(green,'#053b32',.32);
 const ink='#163e35',muted='#5a7567',ivory='#fffdf7',sage='#dbe5d9';
 const g=footerGeometry([w,h],'calendar'),m=Math.max(18,Math.min(55,w*.043));
 const gap=compact?9:13,contentBottom=g.ad.y-Math.max(10,h*.012);
 const headH=wide?limit(contentBottom*.265,90,159):limit(contentBottom*.225,130,186);
 const reading=rowsFor(cfg,en);
 const quoteH=reading.length?limit(contentBottom*.185,wide?68:104,wide?126:205):0;
 const headingH=compact?30:39,quoteY=headH+gap;
 const gridY=quoteY+quoteH+(quoteH?gap:0)+headingH;
 const gridBottom=contentBottom-4,gridH=Math.max(43,gridBottom-gridY);
 const gradient=c.createLinearGradient(0,0,w,h);
 gradient.addColorStop(0,'#eff2e9');gradient.addColorStop(1,blend(sage,green,.10));
 c.fillStyle=gradient;c.fillRect(0,0,w,h);
 const paperEnd=g.ad.y+g.ad.h+Math.max(8,h*.008);
 panel(c,m*.42,m*.34,w-m*.84,h-m*.68,Math.min(31,m*.65),'rgba(255,253,248,.42)','rgba(255,255,255,.75)',3);
 panel(c,m*.60,m*.55,w-m*1.20,paperEnd-m*.55,Math.min(27,m*.58),'#faf8f1',rgba(gold,.37),1.2);
 drawCardFiligree(c,m*.60,m*.55,w-m*1.20,paperEnd-m*.55,{gold,opacity:.19,large:!compact});
 const plaqueW=wide?w*.30:w*.48,plaqueH=wide?headH*.67:headH*.59,plaqueX=(w-plaqueW)/2,plaqueY=Math.max(8,h*.013);
 const glow=c.createLinearGradient(plaqueX,plaqueY,plaqueX+plaqueW,plaqueY+plaqueH);
 glow.addColorStop(0,deep);glow.addColorStop(1,blend(deep,'#0b6750',.18));
 c.save();c.shadowColor='rgba(12,66,52,.18)';c.shadowBlur=13;c.shadowOffsetY=4;
 panel(c,plaqueX,plaqueY,plaqueW,plaqueH,Math.min(27,plaqueH*.32),glow,gold,2.5);c.restore();
 const day=localeDate(iso,{weekday:'long'}),date=localeDate(iso,{day:'numeric',month:'long',year:'numeric'}),hijri=hijriDate(iso,cfg);
 text(c,day,plaqueX+8,plaqueY+7,plaqueW-16,plaqueH-14,wide?Math.min(53,plaqueH*.70):Math.min(71,plaqueH*.71),'#fffbec',{weight:900,maxLines:1,en,minSize:25});
 const dateHeight=wide?headH*.47:headH*.28,dateY=wide?plaqueY+plaqueH*.18:plaqueY+plaqueH+5;
 if(wide){
  text(c,date,m+5,dateY,w*.28,dateHeight,compact?21:27,ink,{weight:740,maxLines:2,en,minSize:14});
  text(c,hijri,w-w*.29-m,dateY,w*.29,dateHeight,compact?20:26,ink,{weight:680,maxLines:2,en,minSize:13});
 }else{
  panel(c,m,dateY,w-2*m,dateHeight,Math.min(17,dateHeight*.4),'#fffdf8',rgba(gold,.48));
  const half=(w-2*m)/2;
  text(c,date,m+half+9,dateY+3,half-14,dateHeight-6,compact?22:29,ink,{weight:720,maxLines:2,en,minSize:15});
  text(c,hijri,m+6,dateY+3,half-14,dateHeight-6,compact?21:28,ink,{weight:650,maxLines:2,en,minSize:15});
 }
 if(reading.length){
  panel(c,m,quoteY,w-2*m,quoteH,Math.min(22,quoteH*.17),ivory,rgba(gold,.58),1.5);
  const two=reading.length>1;
  if(two){
   const rh=quoteH/2;
   for(let i=0;i<2;i++){
    const item=reading[i],top=quoteY+i*rh;
    text(c,item.title,m+14,top+3,w-2*m-28,Math.min(24,rh*.24),compact?15:19,gold,{weight:830,maxLines:1,en,minSize:12});
    text(c,item.value,m+20,top+Math.min(27,rh*.28),w-2*m-40,Math.max(22,rh*.52),compact?19:27,ink,{weight:750,maxLines:compact?2:3,en,minSize:13});
    if(item.source&&rh>69)text(c,item.source,m+22,top+rh-21,w-2*m-44,17,compact?12:15,muted,{weight:500,maxLines:1,en,minSize:10});
    if(!i){c.beginPath();c.moveTo(m+30,top+rh);c.lineTo(w-m-30,top+rh);c.strokeStyle=rgba(gold,.29);c.lineWidth=1;c.stroke();}
   }
  }else{
   const item=reading[0];
   text(c,item.title,m+18,quoteY+5,w-2*m-36,Math.min(29,quoteH*.24),compact?15:21,gold,{weight:860,maxLines:1,en,minSize:12});
   text(c,item.value,m+20,quoteY+Math.min(32,quoteH*.28),w-2*m-40,Math.max(28,quoteH*.60),wide?23:32,ink,{weight:760,maxLines:compact?2:3,en,minSize:15});
   if(item.source&&quoteH>=90)text(c,item.source,m+20,quoteY+quoteH-24,w-2*m-40,19,compact?12:17,muted,{weight:550,maxLines:1,en,minSize:11});
  }
 }
 const entries=(cfg.counters||[]).filter(i=>i.enabled!==false).map((item,index)=>({item,index,n:remaining(item,iso)}));
 const timed=entries.filter(v=>v.item.mode!=='manual'&&Number.isFinite(v.n)).sort((a,b)=>a.n-b.n)[0];
 const cols=wide&&w>1250?5:4,minimumTile=compact?92:115;
 const possibleRows=Math.max(1,Math.min(6,Math.floor((gridH+gap)/(minimumTile+gap))));
 const capacity=Math.max(cols,possibleRows*cols),visible=entries.slice(0,capacity),extra=entries.length-visible.length;
 const gridTitle=extra?(en?'Nearest upcoming dates':'أقرب المواعيد'):(en?'Upcoming dates & counters':'المواعيد والعدّادات');
 text(c,gridTitle,w*.48,gridY-headingH+2,w*.45-m,headingH-4,compact?21:29,ink,{weight:850,maxLines:1,align:'right',en,minSize:15});
 const nextLabel=extra?(en?'Showing ':'عرض ')+visible.length+(en?' of ':' من ')+entries.length:timed?(en?'Next: ':'الأقرب: ')+timed.item.label:'';
 if(nextLabel)text(c,nextLabel,m,gridY-headingH+2,w*.40,headingH-4,compact?13:17,muted,{weight:560,maxLines:1,align:'left',en,minSize:10});
 const colGap=Math.max(8,Math.min(16,w*.011)),rowGap=compact?8:11;
 const tileW=(w-2*m-(cols-1)*colGap)/cols,rows=Math.max(1,Math.ceil(visible.length/cols));
 const tileH=Math.max(42,Math.min(192,(gridBottom-gridY-(rows-1)*rowGap)/rows));
 visible.forEach(({item,n},i)=>{
  const col=en?i%cols:cols-1-i%cols,row=Math.floor(i/cols);
  const x=m+col*(tileW+colGap),y=gridY+row*(tileH+rowGap);
  const best=cfg.design?.highlightNext!==false&&item.mode!=='manual'&&timed?.n===n;
  c.save();c.shadowColor='rgba(27,61,47,.105)';c.shadowBlur=8;c.shadowOffsetY=3;
  panel(c,x,y,tileW,tileH,Math.min(19,tileH*.19),ivory,best?gold:rgba(green,.16),best?2.1:1.2);c.restore();
  if(best)panel(c,x+tileW*.30,y+3,tileW*.40,3,1.5,gold);
  const badge=Math.min(46,Math.max(24,tileH*.33));
  if(cfg.design?.showIcons!==false)drawIconBadge(c,item,x+tileW-31,y+Math.max(21,tileH*.275),badge,
   {style:'duotone',accent:gold,contrast:deep,featured:best});
  text(c,formatCounter(n),x+8,y+tileH*.10,tileW*.68,tileH*.39,Math.min(52,tileH*.36),deep,{weight:900,maxLines:1,minSize:20});
  if(cfg.design?.showUnit!==false)text(c,n===0?(en?'Today':'اليوم'):(item.mode==='manual'?(en?'Value':'قيمة'):(en?'days':'يوم')),x+10,y+tileH*.445,tileW*.63,tileH*.17,Math.min(18,tileH*.13),muted,{weight:600,maxLines:1,minSize:10,en});
  const stripY=y+tileH*.70,stripH=Math.max(20,tileH*.275);
  panel(c,x+5,stripY,tileW-10,Math.min(stripH,tileH-(stripY-y)-4),Math.min(11,stripH*.42),'#f1f1e8');
  text(c,item.label|| (en?'Event':'موعد'),x+9,stripY+1,tileW-18,Math.max(18,Math.min(stripH,tileH-(stripY-y)-4)),Math.min(23,tileH*.18),ink,{weight:760,maxLines:2,minSize:12,en});
 });
 if(!visible.length)text(c,en?'No upcoming events':'لا توجد مواعيد مضافة',m,gridY,w-2*m,Math.min(120,gridH),33,muted,{weight:720,maxLines:1,en,minSize:17});
 panel(c,g.ad.x-6,g.ad.y-4,g.ad.w+12,g.ad.h+8,Math.min(17,g.ad.h*.17),ivory,rgba(gold,.35));
 drawCombinedFooter(c,{...cfg,theme:{...cfg.theme,ink}},banner,qr,{kind:'calendar',dimensions:[w,h]});
 return {size:dimensions,visible:visible.length,total:entries.length,columns:cols,rows};
}
