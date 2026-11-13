/* Native social compositions: square, 4:5 and landscape — never a shrunken 9:16 poster. */
import {fitText,formatCounter} from './text-layout.js?v=2';
import {footerGeometry,drawCombinedFooter} from './follow-panel.js?v=layout3';
import {getLanguage,localeDate} from './locale.js?v=i18n4';
function luminance(hex){
 if(!/^#[0-9a-f]{6}$/i.test(hex||''))return .5;
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
}
function panel(c,x,y,w,h,r,fill,border){
 c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));c.fillStyle=fill;c.fill();
 if(border){c.strokeStyle=border;c.lineWidth=1.4;c.stroke();}
}
export function renderResponsiveCard(c,cfg,iso,{dimensions,remaining,hijriDate,banner,qr}={}){
 const [w,h]=dimensions;
 const ratio=w/h,wide=ratio>1.4,small=h<750,en=getLanguage()==='en';
 const p=cfg.theme||{},dark=luminance(p.cream||'#f8f4e8')<.25;
 const green=p.green||'#145746',gold=p.gold||'#ba995d';
 const bg=dark?(p.cream||'#173e38'):'#f7f5ee',ink=dark?'#fff9ec':'#173f35',muted=dark?'#e4dbc5':'#537164';
 const tileBg=dark?'rgba(255,255,255,.10)':'#ffffff',border=dark?'rgba(229,198,133,.45)':'rgba(21,86,70,.18)';
 const margin=Math.max(22,Math.min(58,w*.041)),g=footerGeometry([w,h],'calendar');
 const contentEnd=g.ad.y-Math.max(9,Math.round(h*.012));
 const headerH=wide?Math.max(95,Math.min(138,contentEnd*.27)):Math.max(125,Math.min(164,contentEnd*.22));
 const quoteEnabled=cfg.settings?.showQuote!==false&&Boolean(cfg.daily?.hadith||cfg.daily?.dua||cfg.card?.quote?.trim());
 const quoteH=quoteEnabled?Math.max(72,Math.min(175,contentEnd*.19)):0;
 const gap=small?10:14,sectionH=small?29:39;
 const qY=headerH+gap,qEnd=qY+quoteH;
 const gridTop=qEnd+(quoteEnabled?gap:0)+sectionH;
 const gridH=Math.max(50,contentEnd-gridTop);
 const grad=c.createLinearGradient(0,0,w,h);grad.addColorStop(0,bg);grad.addColorStop(1,dark?'#102c2a':'#e7eee5');c.fillStyle=grad;c.fillRect(0,0,w,h);
 panel(c,margin*.42,margin*.30,w-margin*.84,headerH-margin*.22,Math.min(28,headerH*.2),dark?'rgba(255,255,255,.08)':green,null);
 const day=localeDate(iso,{weekday:'long'}),greg=localeDate(iso,{day:'numeric',month:'long',year:'numeric'});
 const hijri=hijriDate(iso,cfg),brand=en?(cfg.brand?.nameEn||'Awan Saudi'):(cfg.brand?.name||'أوان السعودية');
 const innerY=margin*.30+9,innerH=headerH-margin*.22-18;
 const white='#ffffff',warm='#f5dfb1';
 if(wide){
  const leftW=w*.33,rightW=w*.31;
  fitText(c,brand,{x:w-margin-rightW,y:innerY+2,w:rightW,h:innerH*.62,size:small?28:39,minSize:17,maxLines:2,color:white,align:en?'left':'right',direction:en?'ltr':'rtl',weight:850});
  fitText(c,day,{x:w*.36,y:innerY+2,w:w*.28,h:innerH*.67,size:small?47:60,minSize:23,maxLines:1,color:white,weight:900,direction:en?'ltr':'rtl'});
  fitText(c,greg,{x:margin+12,y:innerY,w:leftW-20,h:innerH*.50,size:small?21:28,minSize:14,maxLines:2,color:white,align:en?'left':'right',direction:en?'ltr':'rtl',weight:650});
  fitText(c,hijri,{x:margin+12,y:innerY+innerH*.51,w:leftW-20,h:innerH*.46,size:small?17:24,minSize:13,maxLines:2,color:warm,align:en?'left':'right',direction:en?'ltr':'rtl',weight:550});
 }else{
  fitText(c,brand,{x:w*.52,y:innerY,w:w*.40-margin,h:innerH*.55,size:37,minSize:21,maxLines:2,color:white,align:en?'left':'right',direction:en?'ltr':'rtl',weight:900});
  fitText(c,day,{x:margin+16,y:innerY,w:w*.43,h:innerH*.55,size:56,minSize:25,maxLines:1,color:white,weight:900,direction:en?'ltr':'rtl'});
  fitText(c,greg,{x:w*.52,y:innerY+innerH*.58,w:w*.40-margin,h:innerH*.36,size:23,minSize:14,maxLines:1,color:warm,align:en?'left':'right',direction:en?'ltr':'rtl',weight:600});
  fitText(c,hijri,{x:margin+16,y:innerY+innerH*.58,w:w*.43,h:innerH*.36,size:22,minSize:13,maxLines:1,color:warm,weight:600,direction:en?'ltr':'rtl'});
 }
 if(quoteEnabled){
  panel(c,margin,qY,w-2*margin,quoteH,Math.min(20,quoteH*.20),tileBg,border);
  const item=cfg.daily?.hadith||cfg.daily?.dua;
  const quote=item?.text||cfg.card?.quote||'',source=cfg.daily?.hadith?.reference||cfg.card?.attribution||'';
  fitText(c,cfg.daily?.special==='friday'?(en?'Friday remembrance':'أنوار الجمعة'):(en?'Today’s inspiration':'رسالة اليوم'),{x:margin+12,y:qY+5,w:w-2*margin-24,h:25,size:small?15:20,minSize:12,maxLines:1,color:gold,weight:850});
  fitText(c,quote,{x:margin+25,y:qY+28,w:w-2*margin-50,h:Math.max(24,quoteH-56),size:wide?(small?25:32):33,minSize:15,maxLines:small?2:3,color:ink,weight:700,direction:en?'ltr':'rtl'});
  if(source)fitText(c,source,{x:margin+18,y:qEnd-22,w:w-2*margin-36,h:18,size:small?13:16,minSize:11,maxLines:1,color:muted,weight:500,direction:en?'ltr':'rtl'});
 }
 const items=(cfg.counters||[]).filter(x=>x.enabled!==false).map((item,index)=>({item,index,value:remaining(item,iso)}));
 const ordered=items.sort((a,b)=>(a.value??1e12)-(b.value??1e12)||a.index-b.index);
 const cols=wide&&w>1250?5:4,minTile=small?108:118;
 const rows=Math.min(6,Math.max(1,Math.floor((gridH+gap)/(minTile+gap))));
 const capacity=Math.max(cols,rows*cols),chosen=ordered.slice(0,capacity);
 const extra=ordered.length-chosen.length;
 const heading=en?'Upcoming dates':extra>0?'أقرب المواعيد':'المواعيد والعدّادات';
 const countText=extra>0?(en?`Showing ${chosen.length} of ${ordered.length}`:`عرض ${chosen.length} من ${ordered.length} موعدًا`):'';
 fitText(c,heading,{x:w*.48,y:gridTop-sectionH+2,w:w*.45-margin,h:sectionH-4,size:small?23:31,minSize:17,maxLines:1,color:ink,align:en?'left':'right',direction:en?'ltr':'rtl'});
 if(countText)fitText(c,countText,{x:margin,y:gridTop-sectionH+2,w:w*.39,h:sectionH-4,size:small?14:18,minSize:11,maxLines:1,color:muted,align:en?'right':'left',direction:en?'ltr':'rtl',weight:550});
 const colGap=Math.max(8,Math.min(16,w*.011)),rowGap=Math.max(8,Math.min(13,h*.009));
 const tileW=(w-2*margin-colGap*(cols-1))/cols;
 const countRows=Math.max(1,Math.ceil(chosen.length/cols)),tileH=Math.max(46,(gridH-rowGap*(countRows-1))/countRows);
 const closest=ordered.find(x=>x.item.mode!=='manual');
 chosen.forEach((entry,i)=>{
  const row=Math.floor(i/cols),col=en?i%cols:cols-1-i%cols;
  const x=margin+col*(tileW+colGap),y=gridTop+row*(tileH+rowGap);
  const best=entry===closest;
  panel(c,x,y,tileW,tileH,Math.min(18,tileH*.19),tileBg,best?gold:border);
  if(best){c.fillStyle=gold;c.fillRect(x+tileW*.32,y+4,tileW*.36,3);}
  const value=entry.item.mode==='manual'?formatCounter(entry.value):entry.value===0?(en?'Today':'اليوم'):formatCounter(entry.value);
  fitText(c,value,{x:x+10,y:y+tileH*.12,w:tileW-20,h:tileH*.49,size:Math.min(small?42:53,tileH*.41),minSize:20,maxLines:1,color:best?gold:ink,weight:900,direction:/^\d/.test(value)?'ltr':'rtl'});
  fitText(c,entry.item.label||'موعد',{x:x+9,y:y+tileH*.59,w:tileW-18,h:tileH*.37,size:Math.min(24,tileH*.23),minSize:14,maxLines:2,color:ink,weight:730,direction:en?'ltr':'rtl'});
 });
 if(!items.length)fitText(c,en?'No upcoming dates':'لا توجد مواعيد مضافة',{x:margin,y:gridTop+10,w:w-2*margin,h:Math.min(110,gridH),size:32,minSize:20,color:ink});
 drawCombinedFooter(c,cfg,banner,qr,{kind:'calendar',dimensions:[w,h]});
 return {size:dimensions,visible:chosen.length,total:ordered.length,columns:cols,rows:countRows};
}
