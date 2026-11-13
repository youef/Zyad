/* Awan Saudi 2026: unified, print-resolution premium daily card.
 * Header, date, hadith, counters and contacts follow a protected RTL grid.
 * This file draws live content; it does not bake in names, dates or countdowns.
 */
import {fitText,formatCounter} from './text-layout.js?v=2';
import {drawIconBadge,drawCardFiligree} from './card-icons.js?v=awan1';
import {drawHangingLogo} from './brand-art.js';
import {footerGeometry} from './follow-panel.js?v=layout3';
import {getLanguage,localeDate} from './locale.js?v=i18n4';
import {hasCardMessage} from './daily.js?v=friday1';
import {familyFor,familyPalette,familyBackdrop,familyHeader,familyQuote,familyTile,familyColumns} from './card-style-families.js?v=1';

const WIDTH=1080,HEIGHT=1920;
const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
const color=(value,fallback)=>/^#[a-f0-9]{6}$/i.test(String(value||''))?value:fallback;
const rgb=hex=>[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16));
function alpha(hex,opacity){return 'rgba('+rgb(color(hex,'#0b513f')).join(',')+','+opacity+')';}
function blend(one,two,amount){
 const a=rgb(color(one,'#124e40')),b=rgb(color(two,'#124e40'));
 return '#'+a.map((v,i)=>Math.round(v*(1-amount)+b[i]*amount).toString(16).padStart(2,'0')).join('');
}
function rounded(c,x,y,w,h,r,fill,edge=null,stroke=1){
 if(w<=0||h<=0)return;
 c.beginPath();c.roundRect(x,y,w,h,Math.min(Math.max(0,r),w/2,h/2));
 if(fill){c.fillStyle=fill;c.fill();}
 if(edge){c.strokeStyle=edge;c.lineWidth=stroke;c.stroke();}
}
function line(c,x,y,xx,yy,ink,width=1.5){
 c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=ink;c.lineWidth=width;c.stroke();
}
function circle(c,x,y,r,fill,edge=null,width=1){
 c.beginPath();c.arc(x,y,r,0,Math.PI*2);
 if(fill){c.fillStyle=fill;c.fill();}
 if(edge){c.strokeStyle=edge;c.lineWidth=width;c.stroke();}
}
function blockText(c,words,x,y,w,h,size,ink,{weight=800,align='center',lines=2,en=false,min=13}={}){
 return fitText(c,words,{x,y,w,h,size,minSize:min,maxLines:lines,color:ink,weight,align,direction:en?'ltr':'rtl'});
}
function seedFor(id){return Array.from(String(id||'royal')).reduce((seed,ch)=>(seed*33+ch.codePointAt(0))>>>0,5381);}
function palette(cfg,definition){
 const custom=cfg.theme||{},base=definition?.theme||{},main=color(custom.green||base.green,'#0c5745');
 const gold=color(custom.gold||base.gold,'#c6a15c'),deep=blend(main,'#043c32',.31);
 return {main,deep,gold,ink:'#163e33',secondary:'#587466',paper:'#faf8f1',ivory:'#fffdf8',sage:'#dce6da',line:alpha(gold,.49)};
}
function background(c,p,g,variant,seed){
 const gradient=c.createLinearGradient(0,0,WIDTH,HEIGHT);
 gradient.addColorStop(0,blend(p.sage,'#ffffff',.34));
 gradient.addColorStop(.48,p.sage);
 gradient.addColorStop(1,blend(p.sage,p.main,.13));
 c.fillStyle=gradient;c.fillRect(0,0,WIDTH,HEIGHT);
 // Calm Islamic geometry: very low contrast, wholly behind the reading field.
 c.save();c.strokeStyle=alpha(p.gold,.105);c.lineWidth=1.1;
 const offset=(seed%28);
 for(let yy=20+offset;yy<HEIGHT;yy+=130){
  for(let xx=25+(Math.round(yy/130)%2)*57;xx<WIDTH;xx+=115){
   c.beginPath();
   for(let n=0;n<8;n++){
    const t=n*Math.PI/4,px=xx+18*Math.cos(t),py=yy+18*Math.sin(t);
    if(n)c.lineTo(px,py);else c.moveTo(px,py);
   }
   c.closePath();c.stroke();
  }
 }
 c.restore();
 c.save();c.shadowColor='rgba(25,61,48,.13)';c.shadowBlur=19;c.shadowOffsetY=7;
 rounded(c,25,26,1030,1854,44,'rgba(250,248,241,.49)',alpha('#ffffff',.86),5);
 c.restore();
 const paperBottom=g.ad.y+g.ad.h+19;
 c.save();c.shadowColor='rgba(30,51,37,.095)';c.shadowBlur=16;c.shadowOffsetY=4;
 rounded(c,53,92,974,paperBottom-92,36,p.paper,alpha(p.gold,.32),1.6);
 c.restore();
 drawCardFiligree(c,53,92,974,paperBottom-92,{gold:p.gold,opacity:.21,large:true});
 // A single discreet ornament distinguishes each selected catalogue design.
 c.save();c.strokeStyle=alpha(p.main,.13);c.lineWidth=1.3;
 for(let i=0;i<4+(seed%9);i++){
  const yy=100+i*22;
  if(yy>350)break;
  line(c,58,yy,70+(i%3)*7,yy,alpha(p.gold,.18),1.1);
 }
 if(variant===1||variant===4){
  rounded(c,70,108,940,5,2,alpha(p.gold,.20));
 }else if(variant===2){
  circle(c,950,152,46,alpha(p.gold,.09),alpha(p.gold,.25),1.2);
 }else if(variant===3){
  line(c,97,150,291,150,alpha(p.gold,.37),2);
  line(c,789,150,982,150,alpha(p.gold,.37),2);
 }
 c.restore();
 // Banner sits in the main paper field, contact panel on the sage surface.
 rounded(c,g.ad.x-10,g.ad.y-5,g.ad.w+20,g.ad.h+11,17,p.ivory,alpha(p.gold,.30),1.35);
}
function header(c,cfg,iso,tools,p,seed){
 const en=getLanguage()==='en',day=localeDate(iso,{weekday:'long'});
 const headerGradient=c.createLinearGradient(290,144,790,352);
 headerGradient.addColorStop(0,blend(p.deep,'#006549',.07));
 headerGradient.addColorStop(1,blend(p.deep,'#071f25',.10));
 // Raised green title plaque with a small Saudi-inspired gold crown.
 c.save();c.shadowColor='rgba(9,51,38,.18)';c.shadowBlur=17;c.shadowOffsetY=8;
 rounded(c,281,148,518,209,43,headerGradient,p.gold,3.2);
 c.restore();
 circle(c,540,148,31,p.deep,p.gold,2.6);
 circle(c,540,148,9,p.gold);
 line(c,321,350,759,350,alpha(p.gold,.42),1.4);
 blockText(c,day,310,191,460,123,109,'#fffbee',{weight:900,lines:1,en,min:51});
 // Gold separators keep the composition balanced even for short weekday names.
 for(const x of [240,840]){
  line(c,x,228,x,314,p.gold,2);
  circle(c,x,272,11,null,p.gold,1.7);
  line(c,x-16,272,x,246,p.gold,1);
  line(c,x,246,x+16,272,p.gold,1);
 }
 if(tools.logo)drawHangingLogo(c,tools.logo,{x:86,y:131,width:140,height:111,light:false});
 const dateY=378;
 rounded(c,177,dateY,726,79,28,'#fffdf8',alpha(p.gold,.59),1.8);
 line(c,540,dateY+14,540,dateY+65,alpha(p.gold,.60),2);
 const greg=localeDate(iso,{day:'numeric',month:'long',year:'numeric'});
 const hijri=tools.hijriDate(iso,cfg);
 const rightX=en?189:548,leftX=en?548:189;
 blockText(c,en?hijri:greg,rightX,dateY+9,340,60,29,p.ink,{weight:740,lines:2,en,min:17});
 blockText(c,en?greg:hijri,leftX,dateY+9,340,60,28,p.ink,{weight:690,lines:2,en,min:17});
 // Fine inner lines echo the reference without another competing date box.
 circle(c,891,417,8,null,p.gold,1.7);
}
function contentRows(cfg,en){
 if(!hasCardMessage(cfg))return [];
 const daily=cfg.daily,friday=daily?.special==='friday';
 if(daily&&(daily.hadith||daily.dua)){
  const rows=[];
  if(daily.hadith&&cfg.content?.showHadith!==false)rows.push({
   heading:friday?(en?'Friday hadith':'حديث الجمعة'):(en?'Authentic hadith':'مقتطف من حديث صحيح'),
   body:daily.hadith.text||'',reference:daily.hadith.reference||''
  });
  if(daily.dua&&(friday?cfg.content?.fridayReminders!==false:cfg.content?.showDua!==false))rows.push({
   heading:friday?(en?'Remembrance and salawat':'ذكر وصلاة على النبي ﷺ'):(en?'Supplication':'دعاء اليوم'),
   body:daily.dua.text||'',reference:daily.dua.reference||''
  });
  if(rows.length)return rows;
 }
 if(cfg.card?.quote)return [{heading:en?'Today’s thought':'رسالة اليوم',body:cfg.card.quote,reference:cfg.card.attribution||''}];
 return [];
}
function message(c,cfg,rows,y,h,p){
 const en=getLanguage()==='en';
 c.save();c.shadowColor='rgba(51,72,52,.10)';c.shadowBlur=13;c.shadowOffsetY=6;
 rounded(c,75,y,930,h,28,p.ivory,alpha(p.gold,.65),1.7);c.restore();
 // Deliberate outer quotes, decorative only.
 c.save();c.font='bold 72px Georgia,serif';c.fillStyle=alpha(p.gold,.82);
 c.fillText('“',105,y+94);c.fillText('”',952,y+94);c.restore();
 if(rows.length===1){
  const r=rows[0];
  rounded(c,375,y+10,330,36,17,p.gold,null);
  blockText(c,r.heading,392,y+12,296,32,21,'#ffffff',{weight:800,lines:1,en,min:14});
  blockText(c,r.body,144,y+57,792,h-109,42,p.ink,{weight:800,lines:4,en,min:21});
  if(r.reference){
   rounded(c,339,y+h-46,402,30,15,'#f3eedf');
   blockText(c,r.reference,356,y+h-44,368,26,18,p.secondary,{weight:610,lines:1,en,min:12});
  }
 }else{
  const gap=11,rowY=y+13,rowH=(h-25-gap)/2;
  rows.slice(0,2).forEach((r,index)=>{
   const top=rowY+index*(rowH+gap);
   rounded(c,381,top+1,318,30,14,index?p.deep:p.gold);
   blockText(c,r.heading,397,top+3,286,26,18,'#fffef8',{weight:800,lines:1,en,min:12});
   blockText(c,r.body,124,top+35,833,rowH-62,29,p.ink,{weight:760,lines:3,en,min:16});
   if(r.reference)blockText(c,r.reference,290,top+rowH-23,500,20,15,p.secondary,{weight:550,lines:1,en,min:11});
   if(!index)line(c,132,top+rowH+5,948,top+rowH+5,alpha(p.gold,.34),1);
  });
 }
}
function eventTile(c,item,value,bounds,{p,featured=false,compact=false,showIcons=true,showUnit=true,iconStyle='duotone',en=false}={}){
 const {x,y,w,h}=bounds;
 c.save();c.shadowColor='rgba(23,53,43,.105)';c.shadowBlur=9;c.shadowOffsetY=4;
 rounded(c,x,y,w,h,20,p.ivory,featured?p.gold:alpha(p.main,.17),featured?2.3:1.3);c.restore();
 if(featured)rounded(c,x+w*.28,y+3,w*.44,3,2,p.gold);
 const badge=Math.min(48,Math.max(29,h*.345));
 if(showIcons)drawIconBadge(c,item,x+w-37,y+Math.max(26,h*.27),badge,{
  style:iconStyle,accent:p.gold,contrast:p.deep,light:false,featured
 });
 const n=formatCounter(value);
 const valueSize=clamp(h*.335,29,56);
 blockText(c,n,x+14,y+h*.105,w*.69,h*.38,valueSize,p.deep,{weight:900,lines:1,en:false,min:23});
 const unit=value===0?(en?'Today':'اليوم'):(item.mode==='manual'?(en?'Value':'قيمة'):(en?'days':'يوم'));
 if(showUnit)blockText(c,unit,x+17,y+h*.445,w*.67,h*.15,clamp(h*.135,12,19),p.secondary,{weight:600,lines:1,en,min:11});
 // The label is *below* the number; it can never enter the icon/number zone.
 const stripY=y+h*.695,stripH=Math.max(24,h*.27);
 rounded(c,x+6,stripY,w-12,Math.min(stripH,h-(stripY-y)-5),12,'#f2f1e9');
 blockText(c,item.label|| (en?'Event':'موعد'),x+10,stripY+2,w-20,Math.max(20,Math.min(stripH,h-(stripY-y)-4)-3),
  clamp(h*.18,15,25),p.ink,{weight:750,lines:2,en,min:12});
}
function events(c,cfg,iso,tools,p,startY,endY,family){
 const en=getLanguage()==='en';
 const all=(cfg.counters||[]).filter(item=>item.enabled!==false).slice(0,24);
 const items=all.map(item=>({item,n:tools.remaining(item,iso)}));
 const current=items.filter(v=>v.item.mode!=='manual'&&Number.isFinite(v.n))
  .sort((a,b)=>a.n-b.n)[0];
 const nearest=current?.n;
 blockText(c,en?'Upcoming dates & counters':'المواعيد والعدّادات',531,startY,470,45,36,p.ink,{weight:900,align:'right',en,min:23,lines:1});
 if(current&&cfg.design?.highlightNext!==false){
  blockText(c,(en?'Next: ':'الأقرب: ')+current.item.label,82,startY+2,335,43,20,p.secondary,{weight:600,align:'left',en,min:13,lines:1});
 }
 const cols=familyColumns(family,items.length),gap=13,rows=Math.max(1,Math.ceil(items.length/cols)),gridY=startY+57,available=endY-gridY;
 const cardW=(932-(cols-1)*gap)/cols,cardH=(available-(rows-1)*gap)/rows;
 const limitedH=clamp(cardH,73,168);
 items.forEach(({item,n},i)=>{
  const column=en?i%cols:cols-1-i%cols,row=Math.floor(i/cols);
  familyTile(c,family,item,n,{
   x:74+column*(cardW+gap),y:gridY+row*(limitedH+gap),w:cardW,h:limitedH
  },{p,featured:cfg.design?.highlightNext!==false&&item.mode!=='manual'&&n===nearest,
   showIcons:cfg.design?.showIcons!==false,
   showUnit:cfg.design?.showUnit!==false,iconStyle:cfg.design?.iconStyle||'duotone',en});
 });
 if(!items.length)blockText(c,en?'No events added yet':'لا توجد مواعيد مضافة',140,gridY+30,800,100,38,p.secondary,{en,weight:730,lines:1});
}
export function renderAwanPremiumCard(c,cfg,iso,tools,definition){
 const family=familyFor(definition),p=familyPalette(palette(cfg,definition),family);
 const g=footerGeometry([WIDTH,HEIGHT],'calendar');
 const id=definition?.id||cfg.design?.preset||'royal',seed=seedFor(id),variant=seed%6;
 background(c,p,g,variant,seed);
 familyBackdrop(c,family,{x:53,y:92,w:974,h:g.ad.y+g.ad.h+19-92,p});
 const en=getLanguage()==='en';
 familyHeader(c,family,{
  x:111,y:138,w:858,h:326,day:localeDate(iso,{weekday:'long'}),
  greg:localeDate(iso,{day:'numeric',month:'long',year:'numeric'}),
  hijri:tools.hijriDate(iso,cfg),p,en
 });
 if(tools.logo)drawHangingLogo(c,tools.logo,{x:75,y:95,width:114,height:102,light:family==='night'});
 const rows=contentRows(cfg,en),reading=rows.length>0;
 const quoteY=502,quoteH=reading?(rows.length>1?267:238):0;
 if(reading)familyQuote(c,family,rows,{x:75,y:quoteY,w:930,h:quoteH,p,en});
 const sectionY=reading?quoteY+quoteH+32:513;
 events(c,cfg,iso,tools,p,sectionY,g.ad.y-18,family);
 return {background:p.sage,footerInk:p.ink,footerGeometry:g,variant,family};
}
