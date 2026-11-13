import {getLanguage,translate,localeDate} from './locale.js?v=i18n4';
import {fitText,formatCounter} from './text-layout.js?v=2';
import {drawIconBadge,drawCardFiligree} from './card-icons.js?v=awan1';
import {drawListHeader} from './list-header.js';
import {drawHangingLogo} from './brand-art.js';
import {hasCardMessage} from './daily.js?v=friday1';
import {hasBanner} from './advertising.js?v=img1';
import {box,text,paragraph,line,circle,rgba} from './calendar-design.js?v=awan-icons1';import {EVENT_COLORS} from './event-icons.js';import {drawDailyPanel} from './daily-panel.js?v=friday1';
export function renderListCalendar(c,cfg,iso,tools,definition){const p=cfg.theme,s=definition.calendar,style=s.listStyle,items=(cfg.counters||[]).filter(i=>i.enabled!==false).slice(0,24),date=new Date(iso+'T12:00:00Z'),weekday=localeDate(iso,{weekday:'long'}),greg=localeDate(iso,{dateStyle:'long'}),hijri=tools.hijriDate(iso,cfg);c.fillStyle=p.cream;c.fillRect(0,0,1080,1920);
 drawListHeader(c,{cfg,style,p,iso,weekday,greg,hijri});drawHangingLogo(c,tools.logo,{x:48,y:20,width:172,height:114,light:['saudi','brush'].includes(style)});
 let top=367;if(hasCardMessage(cfg)){const h=cfg.daily?268:184;box(c,52,top,976,h,22,rgba('#ffffff',.85),rgba(p.gold,.4));if(!drawDailyPanel(c,cfg,52,top,976,h,p)){paragraph(c,cfg.card?.quote||'',540,top+h*.44,872,h-70,p.ink,29);text(c,cfg.card?.attribution||'',540,top+h-25,18,p.ink,860);}top+=h+28;}
 const columns=items.length>18?4:items.length>12?3:items.length>8?2:style==='columns'?2:1,gap=12,count=Math.ceil(items.length/columns),end=1510,rh=Math.max(57,Math.min(columns>=3?135:columns===2?146:133,(end-top-gap*(count-1))/Math.max(1,count))),rw=(976-(columns-1)*18)/columns;const timed=items.filter(i=>i.mode!=='manual').map(i=>tools.remaining(i,iso)),nearest=timed.length?Math.min(...timed):null;
 for(const [i,item]of items.entries()){const x=52+(getLanguage()==='en'?i%columns:columns-1-i%columns)*(rw+18),y=top+Math.floor(i/columns)*(rh+gap),n=tools.remaining(item,iso),color=style==='mono'?p.green:style==='brush'||style==='notes'?EVENT_COLORS[i%EVENT_COLORS.length]:p.green,best=cfg.design?.highlightNext!==false&&n===nearest&&item.mode!=='manual';let fill='#ffffff',radius=style==='saudi'?rh/2:style==='mono'||style==='table'?2:14;
  if(style==='brush'){c.beginPath();for(let j=0;j<30;j++){const xx=x+j*rw/29,yy=y+((j*7)%11);j?c.lineTo(xx,yy):c.moveTo(xx,yy);}for(let j=29;j>=0;j--)c.lineTo(x+j*rw/29,y+rh-((j*5)%9));c.closePath();c.fillStyle=rgba(color,.16);c.fill();}
  else if(style==='timeline'){line(c,x+rw-26,y-8,x+rw-26,y+rh+10,rgba(color,.5),3);box(c,x,y,rw-49,rh,14,fill,best?p.gold:rgba(color,.2));circle(c,x+rw-26,y+rh/2,12,color);}
  else{box(c,x+(style==='tickets'?5:0),y,rw-(style==='tickets'?10:0),rh,radius,style==='notes'?rgba(color,.1):fill,best?p.gold:rgba(color,.22),best?3:1);if(style==='tickets'){c.setLineDash([3,7]);line(c,x+rw*.23,y+6,x+rw*.23,y+rh-6,p.gold);c.setLineDash([]);}if(style==='notes'){circle(c,x+rw-18,y+12,5,p.gold);}if(style==='table')line(c,x+rw*.22,y,x+rw*.22,y+rh,rgba(color,.2));}
  if(style==='week')for(let j=0;j<4;j++)box(c,x+19+j*18,y-4,7,12,3,p.gold);
  const number=item.mode==='manual'?formatCounter(n):n===0?'اليوم':n===1?'غدًا':formatCounter(n);
  if(columns>=3){
   if(cfg.design?.showIcons!==false)drawIconBadge(c,item,x+rw-23,y+Math.min(23,rh*.25),Math.min(36,rh*.28),{style:cfg.design?.iconStyle||'glass',accent:p.gold,contrast:color,featured:best});
   fitText(c,number,{x:x+14,y:y+rh*.13,w:rw-28,h:rh*.45,size:Math.min(48,rh*.42),minSize:19,maxLines:1,color,weight:900});
   fitText(c,item.label||'موعد',{x:x+10,y:y+rh*.61,w:rw-20,h:rh*.36,size:Math.min(23,rh*.20),minSize:14,maxLines:2,color:p.ink,weight:750});
   continue;
  }
  const iconSize=Math.min(45,rh*.54),iconX=x+rw-57,iconY=y+rh/2-iconSize/2;
  if(cfg.design?.showIcons!==false)drawIconBadge(c,item,iconX+iconSize/2,iconY+iconSize/2,iconSize,{style:cfg.design?.iconStyle||'glass',accent:p.gold,contrast:color,featured:best});
  const labelX=style==='timeline'?x+rw-76:x+rw-85,labelWidth=columns===2?rw*.48:rw*.65;
  const hasDates=columns===1&&rh>=95&&cfg.design?.showEventDates!==false&&item.mode!=='manual';
  fitText(c,item.label||'موعد',{x:labelX-labelWidth,y:y+rh*(hasDates?.14:.23),w:labelWidth,h:rh*(hasDates?.44:.57),size:Math.min(31,rh*.32),minSize:15,maxLines:2,color:p.ink,align:'right'});
  fitText(c,number,{x:x+9,y:y+rh*.20,w:rw*.23,h:rh*.52,size:Math.min(49,rh*.48),minSize:20,maxLines:1,color,weight:900});
  if(n>1&&rh>=110&&cfg.design?.showUnit!==false)text(c,item.mode==='manual'?'قيمة':'يوم',x+rw*.115,y+rh*.80,17,color,rw*.18);
  if(hasDates){const next=new Date(date);next.setUTCDate(next.getUTCDate()+Number(n));fitText(c,localeDate(next.toISOString().slice(0,10),{dateStyle:'medium'})+' · تقديري',{x:labelX-labelWidth,y:y+rh*.66,w:labelWidth,h:rh*.25,size:18,minSize:13,maxLines:1,color:p.ink,align:'right',weight:500});}
 }
 if(!items.length)text(c,'لا توجد مواعيد مضافة',540,top+110,39,p.ink,900);
 // Shared transparent footer is rendered once after this list template.
}
