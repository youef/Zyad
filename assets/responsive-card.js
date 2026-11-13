/* Native Saudi premium card for square, 4:5, landscape and tall poster exports.
 * Content reflows instead of letterboxing a 1080×1920 screenshot.
 */
import {fitText,formatCounter} from './text-layout.js?v=2';
import {drawIconBadge,drawCardFiligree} from './card-icons.js?v=awan1';
import {footerGeometry,drawCombinedFooter} from './follow-panel.js?v=layout3';
import {getLanguage,localeDate} from './locale.js?v=i18n4';
import {hasCardMessage} from './daily.js?v=friday1';
import {familyFor,familyPalette,familyBackdrop,familyHeader,familyQuote,familyTile,familyColumns} from './card-style-families.js?v=1';

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
export function renderResponsiveCard(c,cfg,iso,{dimensions,remaining,hijriDate,banner,qr,definition}={}){
 const [w,h]=dimensions,wide=w/h>1.4,compact=h<750,en=getLanguage()==='en';
 const family=familyFor(definition||{id:cfg.design?.preset});
 const raw=safeColor(cfg.theme?.green,'#115743'),rawGold=safeColor(cfg.theme?.gold,'#bf9952');
 const p=familyPalette({main:raw,deep:blend(raw,'#053b32',.32),gold:rawGold,ink:'#163e35',secondary:'#5a7567',ivory:'#fffdf7',paper:'#faf8f1',sage:'#dbe5d9'},family);
 const {main:green,gold,deep,ink,secondary:muted,ivory,sage}=p;
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
 panel(c,m*.60,m*.55,w-m*1.20,paperEnd-m*.55,Math.min(27,m*.58),p.paper,rgba(gold,.37),1.2);
 familyBackdrop(c,family,{x:m*.60,y:m*.55,w:w-m*1.20,h:paperEnd-m*.55,p});
 drawCardFiligree(c,m*.60,m*.55,w-m*1.20,paperEnd-m*.55,{gold,opacity:.19,large:!compact});
 familyHeader(c,family,{
  x:m+10,y:Math.max(6,h*.014),w:w-2*m-20,h:headH-Math.max(6,h*.014),
  day:localeDate(iso,{weekday:'long'}),
  greg:localeDate(iso,{day:'numeric',month:'long',year:'numeric'}),
  hijri:hijriDate(iso,cfg),p,en
 });
 if(reading.length)familyQuote(c,family,
  reading.map(row=>({heading:row.title,body:row.value,reference:row.source})),
  {x:m,y:quoteY,w:w-2*m,h:quoteH,p,en});
 const entries=(cfg.counters||[]).filter(i=>i.enabled!==false).map((item,index)=>({item,index,n:remaining(item,iso)}));
 const timed=entries.filter(v=>v.item.mode!=='manual'&&Number.isFinite(v.n)).sort((a,b)=>a.n-b.n)[0];
 const cols=wide&&w>1250?5:familyColumns(family,entries.length),minimumTile=compact?92:115;
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
  familyTile(c,family,item,n,{x,y,w:tileW,h:tileH},{
   p,featured:best,en,showIcons:cfg.design?.showIcons!==false,
   showUnit:cfg.design?.showUnit!==false,iconStyle:cfg.design?.iconStyle||'duotone'
  });
 });
 if(!visible.length)text(c,en?'No upcoming events':'لا توجد مواعيد مضافة',m,gridY,w-2*m,Math.min(120,gridH),33,muted,{weight:720,maxLines:1,en,minSize:17});
 panel(c,g.ad.x-6,g.ad.y-4,g.ad.w+12,g.ad.h+8,Math.min(17,g.ad.h*.17),ivory,rgba(gold,.35));
 drawCombinedFooter(c,{...cfg,theme:{...cfg.theme,ink}},banner,qr,{kind:'calendar',dimensions:[w,h]});
 return {size:dimensions,visible:visible.length,total:entries.length,columns:cols,rows};
}
