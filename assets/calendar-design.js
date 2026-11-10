// Print-resolution calendar art. Dates, quotes, counters, branding and QR stay live.
import {drawHangingLogo} from './brand-art.js';
import {hasCardMessage} from './daily.js';
import {hasBanner} from './advertising.js?v=img1';
import {drawDailyPanel} from './daily-panel.js';
import {footerGeometry} from './follow-panel.js?v=glass20261110';
const W=1080,H=1920,FONT='"Cairo",Tahoma,Arial,sans-serif';
const rgba=(hex,a)=>{const s=/^#[a-f\d]{6}$/i.test(hex)?hex:'#174c3d';return `rgba(${parseInt(s.slice(1,3),16)},${parseInt(s.slice(3,5),16)},${parseInt(s.slice(5,7),16)},${a})`;};
function box(c,x,y,w,h,r,fill,stroke,lw=1){c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function text(c,str,x,y,size,color,width=900,align='center',weight=700){c.save();c.direction='rtl';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;let s=size;do{c.font=`${weight} ${s}px ${c.zyadFont||FONT}`;if(c.measureText(String(str||'')).width<=width)break;s--;}while(s>14);c.fillText(String(str||''),x,y,width);c.restore();}
function poly(c,x,y,rx,ry,n,fill,stroke,indent=1){c.beginPath();for(let i=0;i<n;i++){const a=i*Math.PI*2/n-Math.PI/2,r=i%2?indent:1,px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function line(c,x,y,xx,yy,color,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function circle(c,x,y,r,fill,stroke,width=2){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function arch(c,x,y,w,h,fill,stroke){c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.bezierCurveTo(x,y+w*.13,x+w*.32,y+w*.08,x+w/2,y);c.bezierCurveTo(x+w*.68,y+w*.08,x+w,y+w*.13,x+w,y+w/2);c.lineTo(x+w,y+h);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function imageCover(c,im){const scale=Math.max(W/im.width,H/im.height);c.drawImage(im,(W-im.width*scale)/2,(H-im.height*scale)/2,im.width*scale,im.height*scale);}
function wrap(c,value,width,size){c.font=`600 ${size}px ${c.zyadFont||FONT}`;const out=[];let acc='';for(const word of String(value||'').split(/\s+/)){const next=acc?acc+' '+word:word;if(acc&&c.measureText(next).width>width){out.push(acc);acc=word;}else acc=next;}if(acc)out.push(acc);return out;}
function paragraph(c,value,x,y,width,height,color,preferred=36,min=22){let size=preferred,lines;do{lines=wrap(c,value,width,size);if(lines.length*size*1.65<=height)break;size--;}while(size>min);const max=Math.max(1,Math.floor(height/(size*1.65)));if(lines.length>max){lines=lines.slice(0,max);lines[max-1]=lines[max-1].slice(0,-2)+'…';}const step=size*1.65;lines.forEach((s,i)=>text(c,s,x,y+(i-(lines.length-1)/2)*step,size,color,width,'center',600));}
function header(c,cfg,iso,tools,p,s){
 const {green,gold,ink,cream}=p,kind=s.header,hh=s.headerHeight,dark=s.dark;
 const d=new Date(iso+'T12:00:00Z'),day=new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{weekday:'long',timeZone:'Asia/Riyadh'}).format(d),num=new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{day:'numeric',timeZone:'Asia/Riyadh'}).format(d),month=new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{month:'long',year:'numeric',timeZone:'Asia/Riyadh'}).format(d);
 const pale='#f8edcf',surface=dark?rgba(green,.88):rgba(cream,.94);let tx=540,ty=205,ts=94,number=false;
 
 drawHangingLogo(c,tools.logo,{x:67,y:25,width:189,height:119,light:dark});
 switch(kind){
 case 'arch':arch(c,300,124,480,260,rgba(green,.9),gold);tx=540;ty=257;text(c,day,tx,ty,94,pale,440);break;
 case 'crown':poly(c,540,256,353,148,8,green,gold);poly(c,540,256,328,130,8,null,gold);text(c,'✦   ✦   ✦',540,126,29,gold);text(c,day,540,251,99,pale,600);break;
 case 'geometry':for(let j=0;j<5;j++)poly(c,165+j*188,250,85,85,16,null,rgba(gold,.38),.72);box(c,290,159,500,178,0,surface,gold,2);text(c,day,540,241,93,ink,460);break;
 case 'editorial':text(c,num,260,240,226,green,350,'center',800);text(c,day,974,193,89,ink,490,'right');text(c,month,972,291,35,ink,460,'right',500);line(c,490,143,490,347,gold,3);number=true;break;
 case 'swiss':box(c,845,133,167,218,2,green);text(c,num,929,245,151,pale,145);text(c,day,784,220,126,ink,690,'right');text(c,month,784,316,30,ink,680,'right',400);line(c,72,139,72,347,gold,6);number=true;break;
 case 'moon':circle(c,319,259,146,green,gold);circle(c,365,216,118,cream);text(c,day,930,254,96,ink,540,'right');for(let i=0;i<6;i++)circle(c,690+i*42,144+Math.sin(i)*14,3,gold);break;
 case 'eclipse':circle(c,540,251,143,rgba(gold,.13),gold);circle(c,540,251,158,null,rgba(gold,.3));box(c,222,197,636,110,14,cream);text(c,day,540,243,110,ink,610);for(const x of [126,954])poly(c,x,247,28,28,8,null,gold);break;
 case 'dunes':for(let i=0;i<3;i++){c.beginPath();c.moveTo(35,355+i*26);c.bezierCurveTo(320,212+i*60,680,470-i*28,1045,275+i*34);c.lineTo(1045,hh);c.lineTo(35,hh);c.closePath();c.fillStyle=rgba(green,.1+i*.08);c.fill();}text(c,day,540,223,110,ink);text(c,month,540,315,29,ink);break;
 case 'landscape':circle(c,250,240,115,rgba(gold,.22));for(let i=0;i<3;i++){c.beginPath();c.moveTo(64,334+i*15);c.bezierCurveTo(360,280+i*24,780,363+i*15,1016,285+i*29);c.lineTo(1016,375);c.lineTo(64,375);c.closePath();c.fillStyle=rgba(green,.09+i*.045);c.fill();}text(c,num,250,238,144,green,210);text(c,day,955,196,98,ink,550,'right');text(c,month,955,290,29,ink,550,'right',400);number=true;break;
 case 'najdi':box(c,129,142,822,218,3,surface,gold,3);for(let j=0;j<9;j++)poly(c,166+j*94,144,25,25,3,green);text(c,day,540,255,103,ink,740);break;
 case 'roots':box(c,185,133,710,229,3,surface,green,4);box(c,204,152,672,191,1,null,gold,2);for(const x of [117,963])for(let j=0;j<3;j++)poly(c,x,197+j*45,13,17,4,green);text(c,'من جذورنا… إلى يومنا',540,176,22,ink);text(c,day,540,270,106,ink,630);break;
 case 'flag':c.beginPath();c.moveTo(47,145);c.lineTo(1033,145);c.lineTo(969,324);c.lineTo(540,369);c.lineTo(47,324);c.closePath();c.fillStyle=green;c.fill();line(c,80,127,1000,127,gold,3);text(c,day,540,247,109,pale);break;
 case 'lantern':for(const x of [160,920]){line(c,x,110,x,176,gold);poly(c,x,233,48,67,6,rgba(gold,.2),gold);line(c,x-20,310,x+20,310,gold);}arch(c,285,120,510,263,green,gold);text(c,day,540,267,92,pale,470);break;
 case 'ribbon':box(c,220,170,640,158,8,green,gold);poly(c,182,249,78,69,4,gold);poly(c,898,249,78,69,4,gold);text(c,day,540,246,99,pale,590);break;
 case 'celebration':poly(c,540,243,237,131,32,rgba(gold,.13),gold,.89);box(c,273,201,534,85,18,green);text(c,day,540,242,94,pale,510);for(let i=0;i<6;i++){poly(c,130+i*164,130+(i%2)*215,6,11,4,gold);}break;
 case 'dome':for(const [x,w]of [[80,220],[324,432],[780,220]])arch(c,x,153,w,222,rgba(green,x===324?.12:.05),gold);text(c,day,540,278,89,ink,410);break;
 case 'invitation':c.beginPath();c.ellipse(540,254,333,113,0,0,Math.PI*2);c.fillStyle=surface;c.fill();c.strokeStyle=gold;c.lineWidth=2;c.stroke();for(const x of [146,934]){for(let a=0;a<6;a++)circle(c,x+Math.cos(a*Math.PI/3)*18,254+Math.sin(a*Math.PI/3)*18,10,null,gold);circle(c,x,254,5,gold);}text(c,day,540,245,110,ink,610);break;
 case 'statement':text(c,day,540,207,139,ink,930,'center',800);text(c,cfg.brand?.subtitle||'مواعيدك… على مهل',540,314,29,ink,800,'center',400);line(c,370,349,710,349,gold);break;
 case 'ledger':box(c,64,135,952,202,9,surface,gold);for(let y=174;y<330;y+=39)line(c,84,y,996,y,rgba(gold,.18));text(c,num,247,233,151,ink,290);text(c,day,950,207,82,ink,500,'right');text(c,month,950,289,27,ink,500,'right');number=true;break;
 case 'notebook':box(c,175,142,730,218,14,surface,gold,2);for(let x=235;x<900;x+=90){box(c,x,119,14,48,7,gold);circle(c,x+7,168,9,null,gold);}text(c,day,540,259,106,ink,670);break;
 case 'crest':c.beginPath();c.moveTo(270,150);c.lineTo(810,150);c.lineTo(810,299);c.lineTo(540,365);c.lineTo(270,299);c.closePath();c.fillStyle=green;c.fill();c.strokeStyle=gold;c.lineWidth=3;c.stroke();poly(c,540,152,34,29,8,gold);for(const x of [160,920]){line(c,x,182,x,319,gold,3);poly(c,x,250,31,31,8,null,gold);}text(c,day,540,251,103,pale,485);break;
 case 'laurel':poly(c,540,257,203,135,32,green,gold);for(const side of [-1,1])for(let j=0;j<8;j++){const a=(j-3.5)*.18;c.save();c.translate(540+side*(241-Math.abs(j-3.5)*11),255+(j-3.5)*29);c.rotate(side*a);c.beginPath();c.ellipse(0,0,25,9,side*.7,0,Math.PI*2);c.fillStyle=gold;c.fill();c.restore();}text(c,day,540,250,89,pale,370);break;
 case 'cloud':for(const [x,y,r]of [[330,256,82],[437,213,112],[567,225,128],[701,254,83]])circle(c,x,y,r,surface);box(c,280,245,520,104,40,surface);text(c,day,540,260,104,ink,540);break;
 case 'brand':line(c,90,140,420,140,gold,5);line(c,660,350,990,350,gold,5);text(c,day,540,230,122,ink);break;
 case 'frost':box(c,180,142,720,215,48,rgba(cream,.82),rgba(gold,.8),2);line(c,212,169,866,169,'#ffffffaa');text(c,day,540,244,112,ink,650);break;
 case 'sun':for(let i=0;i<32;i++){const a=i*Math.PI/16;line(c,540+Math.cos(a)*153,257+Math.sin(a)*108,540+Math.cos(a)*174,257+Math.sin(a)*124,gold,2);}circle(c,540,257,134,rgba(gold,.15),gold);text(c,day,540,250,100,ink,390);break;
 case 'spotlight':{const next=(cfg.counters||[]).filter(i=>i.enabled!==false&&i.mode!=='manual').map(i=>({i,n:tools.remaining(i,iso)})).sort((a,b)=>a.n-b.n)[0];text(c,day,900,166,65,ink,570,'right');text(c,String(next?.n??0).padStart(2,'0'),278,253,183,gold,340);text(c,next?'يومًا إلى '+next.i.label:'مواعيدك المهمة',936,280,35,ink,540,'right');line(c,470,153,470,349,gold);break;}
 case 'polaroid':c.save();c.translate(540,252);c.rotate(-.035);box(c,-335,-112,670,233,8,surface,gold,2);box(c,-295,-89,590,149,2,rgba(green,.1));text(c,day,0,-15,103,ink,550);text(c,'تفاصيل يوم تستحق أن تُحفظ',0,93,22,ink,580,'center',400);c.restore();break;
 case 'pearl':circle(c,540,244,151,cream,rgba(gold,.7),2);circle(c,540,244,137,null,gold);for(const x of [290,790])circle(c,x,244,28,rgba(gold,.2),gold);text(c,day,540,238,100,ink,400);break;
 default:text(c,day,tx,ty,ts,ink);
 }
 // Date treatment varies between compositions while always including both calendars.
 const greg=number?iso:new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{dateStyle:'long',timeZone:'Asia/Riyadh'}).format(d),hijri=tools.hijriDate(iso,cfg),y=hh-69;
 if(['editorial','swiss','ledger','brand'].includes(kind)){
  line(c,66,y-34,1014,y-34,gold);text(c,greg,1000,y,29,ink,440,'right',600);text(c,hijri,80,y,27,ink,450,'left',600);
 }else if(['arch','dome','lantern','invitation','laurel','crest','pearl'].includes(kind)){
  text(c,greg,540,y-11,29,ink,890,'center',600);text(c,hijri,540,y+32,27,ink,890,'center',500);
 }else{
  const fill=dark?rgba(green,.83):rgba(cream,.87);box(c,64,y-31,466,78,14,fill,rgba(gold,.6));box(c,550,y-31,466,78,14,fill,rgba(gold,.6));text(c,greg,297,y+7,29,ink,434);text(c,hijri,783,y+7,27,ink,434);
 }
}
function tile(c,item,n,r,p,s,nearest,cfg){
 const {x,y,w,h}=r,style=s.grid,{ink,green,gold,cream}=p,dark=s.dark,best=cfg.design?.highlightNext!==false&&item.mode!=='manual'&&n===nearest;
 const fill=dark?rgba('#071c21',.77):rgba('#fffef9',.95),edge=best?gold:rgba(gold,.42),cx=x+w/2,cy=y+h/2;let ny=y+h*.38,ly=y+h*.79,numberSize=Math.min(66,h*.36),unit=true;
 c.save();c.lineWidth=best?3:1.4;
 switch(style){
 case 'medallion':case 'royal':poly(c,cx,cy,w*.47,h*.47,16,fill,edge,.94);break;
 case 'diamonds':poly(c,cx,cy,w*.49,h*.48,8,fill,edge);break;
 case 'stars':poly(c,cx,cy,w*.49,h*.49,16,fill,edge,.82);numberSize*=.88;break;
 case 'columns':line(c,x+w,y+8,x+w,y+h-8,edge,2);line(c,x+15,y+h-2,x+w-15,y+h-2,edge);ny=y+h*.33;ly=y+h*.77;break;
 case 'swiss':box(c,x,y,w,h,0,fill);box(c,x,y,7,h,0,green);text(c,String(n).padStart(2,'0'),x+24,y+h*.37,numberSize,green,w*.5,'left',800);text(c,item.label,x+w-22,y+h*.81,22,ink,w*.83,'right',500);c.restore();return;
 case 'orbits':box(c,x+4,y+2,w-8,h-4,h*.45,fill,edge);circle(c,x+w-24,y+24,5,gold);break;
 case 'eclipse':box(c,x,y,w,h,16,fill,edge);circle(c,x+23,y+23,13,rgba(gold,.45));circle(c,x+30,y+18,12,fill);break;
 case 'waves':box(c,x,y,w,h,8,fill);c.beginPath();c.moveTo(x+10,y+h-15);c.bezierCurveTo(x+w*.3,y+h-33,x+w*.7,y+h+3,x+w-10,y+h-15);c.strokeStyle=edge;c.lineWidth=3;c.stroke();break;
 case 'terraces':box(c,x+7,y+6,w-7,h-6,5,rgba(gold,.17));box(c,x+3,y+2,w-7,h-6,5,rgba(gold,.28));box(c,x,y,w-7,h-6,5,fill,edge);break;
 case 'battlements':box(c,x,y+14,w,h-14,3,fill,edge);for(let j=0;j<5;j++)box(c,x+12+j*(w-30)/5,y+5,(w-40)/5,17,1,green);ny+=6;break;
 case 'chevrons':c.beginPath();c.moveTo(x,y);c.lineTo(x+w-16,y);c.lineTo(x+w,y+h/2);c.lineTo(x+w-16,y+h);c.lineTo(x,y+h);c.lineTo(x+16,y+h/2);c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=edge;c.stroke();break;
 case 'stamps':box(c,x+6,y+6,w-12,h-12,2,fill,edge);c.setLineDash([3,6]);box(c,x+1,y+1,w-2,h-2,3,null,gold,2);c.setLineDash([]);break;
 case 'lanterns':arch(c,x+8,y+4,w-16,h-8,fill,edge);ny=y+h*.47;ly=y+h*.83;numberSize*=.85;unit=false;break;
 case 'gifts':box(c,x,y,w,h,18,fill,edge);line(c,x+17,y+10,x+17,y+h-10,gold,3);line(c,x+8,y+h*.67,x+w-8,y+h*.67,rgba(gold,.4));break;
 case 'arches':arch(c,x+6,y+3,w-12,h-6,fill,edge);ny=y+h*.45;ly=y+h*.83;unit=false;break;
 case 'minimal':line(c,cx-24,y+8,cx+24,y+8,gold,3);ny=y+h*.39;numberSize*=1.1;break;
 case 'ledger':box(c,x,y,w,h,4,fill,edge);line(c,x+w*.58,y+12,x+w*.58,y+h-12,rgba(gold,.45));text(c,String(n).padStart(2,'0'),x+w*.28,y+h*.45,numberSize,ink,w*.48);paragraph(c,item.label,x+w*.77,y+h*.49,w*.36,h*.7,ink,22,16);c.restore();return;
 case 'notebook':box(c,x,y,w,h,4,fill,edge);for(let yy=y+32;yy<y+h;yy+=28)line(c,x+8,yy,x+w-8,yy,rgba(gold,.15));line(c,x+w-20,y+5,x+w-20,y+h-5,rgba(green,.35));break;
 case 'badges':poly(c,cx,cy,w*.49,h*.48,6,fill,edge);numberSize*=.9;break;
 case 'petals':box(c,x,y,w,h,Math.min(w,h)*.32,fill,edge);for(const [xx,yy]of [[x+19,y+19],[x+w-19,y+h-19]]){circle(c,xx,yy,8,null,gold);circle(c,xx+9,yy,5,null,gold);}break;
 case 'clouds':box(c,x,y+12,w,h-12,h*.3,fill,edge);circle(c,cx,y+20,20,fill);break;
 case 'rays':poly(c,cx,cy,w*.49,h*.49,24,fill,edge,.93);break;
 case 'mono':box(c,x,y,w,h,0,fill);box(c,x+w-15,y,15,15,0,gold);line(c,x,y+h,x+w,y+h,green,4);break;
 case 'glass':box(c,x,y,w,h,24,dark?rgba(cream,.1):rgba('#ffffff',.7),edge);line(c,x+18,y+11,x+w-18,y+11,'#ffffffbb');break;
 case 'sunburst':circle(c,cx,cy,Math.min(w,h)*.47,fill,edge);numberSize*=.83;unit=false;ly=y+h*.76;break;
 case 'rings':box(c,x,y,w,h,22,fill);circle(c,cx,y+h*.38,h*.27,null,edge);ny=y+h*.38;numberSize*=.8;unit=false;ly=y+h*.83;break;
 case 'frames':box(c,x,y,w,h,1,fill,edge);box(c,x+10,y+9,w-20,h*.57,1,rgba(green,.09));ny=y+h*.34;ly=y+h*.8;unit=false;break;
 case 'pearls':box(c,x+2,y+2,w-4,h-4,32,fill,edge);circle(c,x+18,y+17,4,gold);circle(c,x+w-18,y+h-17,4,gold);break;
 default:box(c,x,y,w,h,18,fill,edge);
 }
 if(best)circle(c,x+w-19,y+19,4,gold);
 text(c,String(n??0).padStart(2,'0'),cx,ny,numberSize,dark?ink:green,w*.79,'center',800);
 if(unit&&h>133&&cfg.design?.showUnit!==false)text(c,item.mode==='manual'?'قيمة':n===0?'اليوم':'يوم',cx,y+h*.61,16,dark?ink:p.greenLight,w*.8,'center',500);
 text(c,item.label||'موعد',cx,ly,Math.min(24,h*.155),ink,w*.82,'center',700);c.restore();
}
export function renderCalendar(c,cfg,iso,tools,definition){
 const s=definition.calendar,p={...cfg.theme},dark=s.dark;for(const [k,v]of Object.entries({green:'#174c3d',greenLight:'#6e8675',gold:'#b99255',cream:'#f8f3e7',ink:'#153c33'}))p[k]||=v;
 c.fillStyle=p.cream;c.fillRect(0,0,W,H);
 if(tools.background)imageCover(c,tools.background);
 else {const grad=c.createLinearGradient(0,0,1080,1920);grad.addColorStop(0,p.cream);grad.addColorStop(1,rgba(p.green,.15));c.fillStyle=grad;c.fillRect(0,0,W,H);if(cfg.design?.pattern!==false)for(let yy=20;yy<H;yy+=120)for(let xx=20;xx<W;xx+=120)poly(c,xx,yy,26,26,8,null,rgba(p.gold,.11));}
 // A quiet translucent reading field preserves contrast without covering the artwork edges.
 const field=dark?rgba(p.cream,.79):rgba(p.cream,.87);
 // Align the paper panel's bottom edge with the bottom of the advertisement.
 // The transparent subscription strip remains outside the paper panel.
 const ad=footerGeometry([W,H],'calendar').ad;
 const paperBottom=Math.round(ad.y+ad.h+14);
 box(c,33,103,1014,paperBottom-103,28,field);
 header(c,cfg,iso,tools,p,s);
 const visible=hasCardMessage(cfg),quoteY=s.headerHeight+30,quoteH=visible?(cfg.daily?294:244):0;
 const quoteFill=dark?rgba('#081e20',.68):rgba('#fffef8',.94);
 if(visible){
   if(['editorial','statement','brand','swiss'].includes(s.header)){
     line(c,74,quoteY,1006,quoteY,p.gold,2);line(c,74,quoteY+quoteH,1006,quoteY+quoteH,p.gold,2);
   }else box(c,64,quoteY,952,quoteH,s.header==='notebook'?6:24,quoteFill,rgba(p.gold,.4));
   if(!drawDailyPanel(c,cfg,64,quoteY,952,quoteH,p)){
     paragraph(c,cfg.card?.quote||'',540,quoteY+quoteH*.5,838,quoteH-75,p.ink,35);
     if(cfg.card?.attribution)text(c,cfg.card.attribution,540,quoteY+quoteH-23,21,p.ink,830,'center',500);
   }
 }
 const items=(cfg.counters||[]).filter(i=>i.enabled!==false).slice(0,24),timed=items.filter(i=>i.mode!=='manual'),values=timed.map(i=>tools.remaining(i,iso)),nearest=values.length?Math.min(...values):null,next=timed.find(i=>tools.remaining(i,iso)===nearest);
 const titleY=quoteY+quoteH+48; text(c,'المواعيد والعدّادات',1001,titleY,31,p.ink,620,'right');
 if(next&&cfg.design?.highlightNext!==false)text(c,'الأقرب: '+next.label,78,titleY,19,p.ink,350,'left',500);
 const start=titleY+42,end=1508,cols=s.columns,rows=Math.max(1,Math.ceil(items.length/cols)),gap=s.grid==='ledger'?10:14,tw=(952-(cols-1)*gap)/cols,th=Math.min(cfg.design?.density==='compact'?143:186,(end-start-(rows-1)*gap)/rows);
 items.forEach((item,i)=>tile(c,item,tools.remaining(item,iso),{x:64+(cols-1-i%cols)*(tw+gap),y:start+Math.floor(i/cols)*(th+gap),w:tw,h:th},p,s,nearest,cfg));
 if(!items.length)text(c,'لا توجد مواعيد مضافة',540,start+160,40,p.ink);
 // Shared transparent footer is rendered once after this calendar template.
 }
 export {box,text,paragraph,line,circle,rgba};
