/* Awan card families — deliberate composition, not a different tint of the same card.
   All drawing operates in caller-provided canvas coordinates for story, square and landscape. */
import {fitText,formatCounter} from './text-layout.js?v=2';
import {drawIconBadge} from './card-icons.js?v=awan1';

const MAP={
 royal:'royal',crown:'royal',crest:'royal',laurel:'royal','inspire-royal':'royal',
 modern:'modern',swiss:'modern',statement:'modern',brand:'modern',
 heritage:'heritage',najdi:'heritage',roots:'heritage',dome:'heritage',
 night:'night',moon:'night',eclipse:'night',frost:'night',
 desert:'desert',dunes:'desert',landscape:'desert',polaroid:'desert',
 pearl:'botanical',invitation:'botanical',cloud:'botanical','inspire-botanical':'botanical','inspire-pearl':'botanical',
 geometry:'geometric',flag:'geometric',celebration:'geometric',sun:'geometric',sunburst:'geometric',
 lantern:'ramadan',arch:'ramadan',ramadan:'ramadan',
 editorial:'editorial',ledger:'editorial',notebook:'editorial',spotlight:'editorial',
 ribbon:'journal',notepad:'journal',notebook2:'journal',week:'journal',
};
const LIST={
 blue:'modern',mint:'botanical',brush:'geometric',saudi:'heritage',table:'editorial',
 timeline:'timeline',columns:'editorial',week:'journal',tickets:'journal',mono:'modern',
 notes:'botanical',sand:'desert'
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rgba(hex,opacity){
 const value=/^#[0-9a-f]{6}$/i.test(String(hex||''))?hex:'#114c3f';
 return 'rgba('+[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)).join(',')+','+opacity+')';
}
function box(c,x,y,w,h,r,fill,stroke=null,lw=1.3){
 if(!(w>0&&h>0))return;
 c.beginPath();c.roundRect(x,y,w,h,Math.min(Math.max(0,r),w/2,h/2));
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
}
function rule(c,x,y,xx,yy,color,width=1.3){
 c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function circ(c,x,y,r,fill,stroke=null,lw=1.4){
 c.beginPath();c.arc(x,y,r,0,Math.PI*2);
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
}
function polygon(c,x,y,w,h,sides,fill,stroke,notch=0){
 c.beginPath();const cx=x+w/2,cy=y+h/2;
 for(let k=0;k<sides;k++){
  const a=-Math.PI/2+2*Math.PI*k/sides;
  const factor=k%2?1-notch:1;
  const px=cx+Math.cos(a)*w*.5*factor,py=cy+Math.sin(a)*h*.5*factor;
  if(k)c.lineTo(px,py);else c.moveTo(px,py);
 }
 c.closePath();if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=1.8;c.stroke();}
}
function arch(c,x,y,w,h,fill,stroke){
 c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+h*.34);
 c.quadraticCurveTo(x,y+h*.07,x+w*.5,y);
 c.quadraticCurveTo(x+w,y+h*.07,x+w,y+h*.34);
 c.lineTo(x+w,y+h);c.closePath();
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=1.6;c.stroke();}
}
function heading(c,label,x,y,w,h,size,color,{en=false,weight=820,align='center',maxLines=2,minSize=12}={}){
 return fitText(c,label,{x,y,w,h,size,minSize,maxLines,weight,color,align,direction:en?'ltr':'rtl'});
}
export function familyFor(def){
 const id=String(def?.id||''),head=String(def?.calendar?.header||''),list=def?.calendar?.listStyle;
 if(id==='friday'||id==='ramadan'||id==='remembrance')return 'ramadan';
 if(list)return LIST[list]||'timeline';
 return MAP[id]||MAP[head]||'geometric';
}
export const CARD_FAMILIES=Object.freeze(['royal','modern','heritage','night','desert','botanical','geometric','ramadan','editorial','journal','timeline']);
export function familyColumns(f,count){
 // Preserve all 24 events while allowing wide editorial rows for smaller sets.
 return (f==='editorial'||f==='timeline'||f==='journal')&&count<=18?3:4;
}
export function familyPalette(p,f){
 const q={...p};
 if(f==='night'){
  q.paper='#0e2d36';q.sage='#0b252e';q.ivory='#173944';q.ink='#f7f2e7';
  q.secondary='#c4d8cf';q.main='#0b665e';q.deep='#064b49';q.gold='#d5bc83';
 }else if(f==='desert'){
  q.paper='#fbf2df';q.sage='#f0d8b4';q.ivory='#fffaf0';q.ink='#684b34';q.secondary='#86684a';
  q.main='#8c6042';q.deep='#6f482c';q.gold='#c59a5a';
 }else if(f==='modern'){
  q.paper='#fcfcfa';q.sage='#e8f0ed';q.ivory='#ffffff';q.ink='#173c3b';q.secondary='#66817f';
 }else if(f==='botanical'){
  q.paper='#fffaf6';q.sage='#e3ede4';q.ivory='#fffcf7';q.ink='#305c50';q.secondary='#709184';
 }else if(f==='editorial'){
  q.paper='#fdfaf3';q.sage='#e9e8df';q.ivory='#fdfcf8';q.ink='#293f3b';q.secondary='#63736f';
 }else if(f==='geometric'){
  q.paper='#f8f5ed';q.sage='#cbdcd1';q.ivory='#fffdf6';
 }else if(f==='journal'){
  q.paper='#fff9ed';q.sage='#ede2cf';q.ivory='#fffdf7';
 }
 return q;
}
export function familyBackdrop(c,f,{x,y,w,h,p}){
 c.save();const dark=f==='night';
 if(dark){const grad=c.createLinearGradient(x,y,x+w,y+h);grad.addColorStop(0,p.sage);grad.addColorStop(1,'#091d25');box(c,x,y,w,h,Math.min(34,w*.06),grad,rgba(p.gold,.28));}
 if(f==='modern'||f==='editorial'){
  box(c,x,y,w,h,Math.min(15,w*.02),p.paper,rgba(p.main,.12));
  rule(c,x+13,y+11,x+w-13,y+11,rgba(p.main,.17),2);
 }
 if(f==='heritage'){
  for(let i=0;i<7;i++){
   const xx=x+w*(i+.5)/7;rule(c,xx,y+10,xx,y+27,rgba(p.gold,.43),2);
  }
  rule(c,x+12,y+32,x+w-12,y+32,rgba(p.gold,.32),1.5);
 }
 if(f==='desert'){
  for(let i=0;i<3;i++){
   const yy=y+h*.18+i*h*.065;
   c.beginPath();c.moveTo(x+10,yy);c.bezierCurveTo(x+w*.29,yy-30,x+w*.57,yy+38,x+w-10,yy-9);
   c.strokeStyle=rgba(p.main,.09+i*.055);c.lineWidth=11;c.stroke();
  }
 }
 if(f==='botanical'){
  for(const side of [-1,1]){
   const cx=side===-1?x+37:x+w-37,cy=y+43;
   for(let k=0;k<5;k++){
    c.save();c.translate(cx,cy);c.rotate(k*Math.PI/5);
    c.beginPath();c.ellipse(0,14,5,16,0,0,Math.PI*2);c.fillStyle=rgba(p.main,.12);c.fill();c.restore();
   }
  }
 }
 if(f==='geometric'||f==='ramadan'){
  for(let k=0;k<6;k++){
   const xx=x+w*(k+.5)/6;
   polygon(c,xx-12,y+11,24,21,8,null,rgba(p.gold,.21),.16);
  }
 }
 if(f==='journal'){
  for(let xx=x+20;xx<x+w-20;xx+=88){
   rule(c,xx,y+11,xx+15,y+11,rgba(p.gold,.30),2);
  }
 }
 if(f==='timeline'){
  rule(c,x+24,y+28,x+24,y+h-28,rgba(p.gold,.55),3);
  for(let n=0;n<5;n++)circ(c,x+24,y+49+(h-98)*n/4,4,p.gold);
 }
 c.restore();
}
export function familyHeader(c,f,{x,y,w,h,day,greg,hijri,p,en=false}){
 const dateH=clamp(h*.24,25,67),gap=clamp(h*.03,3,12);
 const headH=h-dateH-gap,top=y;
 const ink=p.ink,light='#fffaf0',accent=p.gold,dark=p.deep;
 let titleColor=light,titleX=x+w*.22,titleW=w*.56;
 c.save();
 switch(f){
 case 'royal':
  polygon(c,x+w*.21,top,w*.58,headH,6,dark,accent,.04);
  circ(c,x+w*.5,top+6,Math.min(18,headH*.15),accent);
  for(const dx of [.13,.87]){rule(c,x+w*dx,top+headH*.25,x+w*dx,top+headH*.74,accent,2);}
  break;
 case 'modern':
  box(c,x,top,w,headH,7,p.ivory,rgba(dark,.18));
  box(c,x+w*.76,top,w*.24,headH,5,dark);
  titleColor=dark;titleX=x+w*.08;titleW=w*.64;
  rule(c,x+w*.06,top+headH*.85,x+w*.69,top+headH*.85,accent,2);
  break;
 case 'heritage':
  box(c,x+w*.08,top+12,w*.84,headH-15,6,dark,accent,2);
  for(let j=0;j<9;j++)box(c,x+w*.08+j*w*.84/9,top+2,w*.84/10,Math.min(25,headH*.14),2,dark,accent,.8);
  break;
 case 'night':
  box(c,x,top,w,headH,Math.min(40,headH*.38),'#12333b',rgba(accent,.62),2);
  circ(c,x+w*.17,top+headH*.47,Math.min(headH*.29,72),accent);
  circ(c,x+w*.215,top+headH*.32,Math.min(headH*.275,68),'#12333b');
  titleX=x+w*.37;titleW=w*.56;
  break;
 case 'desert':
  box(c,x,top,w,headH,Math.min(25,headH*.2),'#f7e7c7',rgba(accent,.53));
  for(let j=0;j<3;j++){
   c.beginPath();c.moveTo(x+9,top+headH*(.61+j*.10));
   c.bezierCurveTo(x+w*.24,top+headH*(.32+j*.13),x+w*.55,top+headH*(.93-j*.07),x+w-9,top+headH*(.48+j*.06));
   c.strokeStyle=rgba(p.main,.17+j*.09);c.lineWidth=11;c.stroke();
  }
  titleColor=dark;break;
 case 'botanical':
  c.beginPath();c.ellipse(x+w*.5,top+headH*.5,w*.38,headH*.45,0,0,Math.PI*2);
  c.fillStyle=p.ivory;c.fill();c.strokeStyle=accent;c.lineWidth=2;c.stroke();
  for(const n of [-1,1])for(let j=0;j<5;j++){
   c.save();c.translate(x+w*(n<0?.1:.9),top+headH*.54);
   c.rotate(j*.42*(n<0?-1:1));
   c.beginPath();c.ellipse(n*13,(j-2)*11,7,17,0,0,Math.PI*2);
   c.fillStyle=rgba(p.main,.20);c.fill();c.restore();
  }
  titleColor=dark;break;
 case 'geometric':
  polygon(c,x+w*.22,top,w*.56,headH,8,dark,accent,.03);
  for(const factor of [.10,.90]){
   polygon(c,x+w*factor-w*.035,top+headH*.38,w*.07,headH*.24,8,null,accent,.15);
  }
  break;
 case 'ramadan':
  arch(c,x+w*.23,top+3,w*.54,headH-4,dark,accent);
  rule(c,x+w*.17,top+headH*.07,x+w*.17,top+headH*.44,accent,1.8);
  rule(c,x+w*.83,top+headH*.07,x+w*.83,top+headH*.44,accent,1.8);
  for(const k of [.17,.83])polygon(c,x+w*k-w*.022,top+headH*.40,w*.044,headH*.23,6,null,accent,.0);
  break;
 case 'editorial':
  rule(c,x+12,top+6,x+w-12,top+6,dark,3);
  rule(c,x+12,top+headH-9,x+w-12,top+headH-9,accent,2);
  titleColor=ink;titleX=x+w*.23;titleW=w*.71;
  box(c,x+w*.08,top+headH*.15,w*.08,headH*.64,0,accent);
  break;
 case 'journal':
  box(c,x+w*.11,top+10,w*.78,headH-14,2,'#fffdf7',rgba(p.main,.33),2);
  box(c,x+w*.19,top+2,w*.15,Math.min(23,headH*.18),2,rgba(accent,.55));
  box(c,x+w*.68,top+2,w*.15,Math.min(23,headH*.18),2,rgba(accent,.55));
  titleColor=dark;break;
 case 'timeline':
  box(c,x,top,w,headH,Math.min(28,headH*.25),p.ivory,rgba(p.main,.27));
  box(c,x+w*.74,top,w*.26,headH,Math.min(25,headH*.2),dark);
  rule(c,x+w*.11,top+headH*.7,x+w*.63,top+headH*.7,accent,2);
  titleColor=ink;titleX=x+w*.04;titleW=w*.65;
  break;
 default:box(c,x+w*.2,top,w*.6,headH,25,dark,accent);
 }
 const minFont=clamp(headH*.27,15,43);
 const mainSize=clamp(headH*.54,29,96);
 heading(c,day,titleX,top+headH*.13,titleW,headH*.72,mainSize,titleColor,{en,weight:900,maxLines:1,minSize:minFont});
 // Dates have deliberately distinct fields: not inside the title's drawing region.
 const dateY=top+headH+gap,half=w*.49;
 if(f==='modern'||f==='editorial'||f==='timeline'){
  rule(c,x,dateY+dateH*.12,x+w,dateY+dateH*.12,rgba(p.main,.35));
 }else{
  box(c,x+w*.10,dateY,w*.80,dateH,Math.min(22,dateH*.4),p.ivory,rgba(accent,.42));
 }
 heading(c,greg,x+w*.50,dateY+2,half*.84,dateH-4,clamp(dateH*.42,14,27),ink,{en,weight:760,maxLines:2,minSize:12});
 heading(c,hijri,x+w*.06,dateY+2,half*.84,dateH-4,clamp(dateH*.40,13,25),ink,{en,weight:660,maxLines:2,minSize:11});
 c.restore();
}
export function familyQuote(c,f,rows,{x,y,w,h,p,en=false}){
 if(!rows.length||h<=0)return;
 const edge=rgba(p.gold,.58),r=clamp(h*.12,8,25),dark=f==='night';
 c.save();
 if(f==='royal'||f==='ramadan')arch(c,x,y,w,h,p.ivory,edge);
 else if(f==='modern'||f==='editorial'){
  box(c,x,y,w,h,5,p.ivory,null);
  box(c,x+w-8,y,8,h,1,p.main);rule(c,x+10,y+h-3,x+w-12,y+h-3,edge,2);
 }else if(f==='geometric')polygon(c,x,y,w,h,8,p.ivory,edge,.025);
 else if(f==='journal'){
  box(c,x+5,y+8,w-10,h-10,3,p.ivory,edge);
  box(c,x+w*.10,y+1,w*.17,Math.min(16,h*.09),2,rgba(p.gold,.45));
  box(c,x+w*.72,y+1,w*.17,Math.min(16,h*.09),2,rgba(p.gold,.45));
 }else if(f==='night'){box(c,x,y,w,h,25,'#24444a',edge);circ(c,x+w*.9,y+h*.21,Math.min(h*.16,24),null,edge);}
 else if(f==='botanical')box(c,x,y,w,h,Math.min(45,h*.32),p.ivory,edge);
 else if(f==='heritage'){box(c,x,y,w,h,2,p.ivory,edge,2);rule(c,x+15,y+14,x+w-15,y+14,edge);}
 else if(f==='timeline')box(c,x,y,w,h,15,p.ivory,edge);
 else box(c,x,y,w,h,r,p.ivory,edge);
 const two=rows.length>1,slots=two?2:1,rowH=h/slots,small=h<130;
 rows.slice(0,slots).forEach((row,i)=>{
  const yy=y+i*rowH;
  const tagH=clamp(rowH*.18,17,31);
  heading(c,row.heading,x+w*.17,yy+2,w*.66,tagH,clamp(tagH*.78,13,20),p.gold,{weight:820,en,maxLines:1,minSize:11});
  const sourceH=row.reference?clamp(rowH*.14,14,23):0;
  heading(c,row.body,x+w*.07,yy+tagH+3,w*.86,Math.max(23,rowH-tagH-sourceH-11),
    clamp(rowH*(small?.23:.25),16,39),p.ink,{weight:760,en,maxLines:rowH>125?3:2,minSize:12});
  if(row.reference)heading(c,row.reference,x+w*.23,yy+rowH-sourceH-5,w*.54,sourceH,clamp(sourceH*.82,10,16),p.secondary,{weight:550,en,maxLines:1,minSize:10});
  if(two&&i===0)rule(c,x+w*.08,yy+rowH,x+w*.92,yy+rowH,edge,1);
 });
 c.restore();
}
export function familyTile(c,f,item,n,{x,y,w,h},{p,featured=false,en=false,showIcons=true,showUnit=true,iconStyle='duotone'}={}){
 if(!(w>16&&h>28))return;
 const isDark=f==='night',edge=featured?p.gold:rgba(p.main,.25),ink=p.ink;
 const small=h<88,mid=h<115;
 c.save();
 c.shadowColor=isDark?'rgba(0,0,0,.23)':'rgba(24,58,46,.09)';c.shadowBlur=small?4:9;c.shadowOffsetY=small?2:3;
 switch(f){
 case 'modern':
  box(c,x,y,w,h,4,p.ivory,edge);box(c,x+w-6,y,6,h,1,p.main);break;
 case 'heritage':
  polygon(c,x+2,y+2,w-4,h-4,8,p.ivory,edge,.025);break;
 case 'night':
  box(c,x+2,y+2,w-4,h-4,Math.min(h*.42,44),p.ivory,edge);
  circ(c,x+w*.5,y+h*.37,Math.min(h*.26,w*.21),null,rgba(p.gold,.38));
  break;
 case 'desert':
  box(c,x+7,y+5,w-9,h-6,Math.min(11,h*.14),rgba(p.gold,.35));
  box(c,x,y,w-9,h-9,Math.min(12,h*.14),p.ivory,edge);
  break;
 case 'botanical':
  box(c,x,y,w,h,Math.min(h*.36,48),p.ivory,edge);
  circ(c,x+16,y+16,5,rgba(p.main,.24));circ(c,x+w-17,y+h-16,5,rgba(p.gold,.42));
  break;
 case 'geometric':
  polygon(c,x+1,y+1,w-2,h-2,8,p.ivory,edge,.025);break;
 case 'ramadan':
  arch(c,x+4,y+1,w-8,h-2,p.ivory,edge);break;
 case 'editorial':
  box(c,x,y,w,h,2,p.ivory,edge);
  rule(c,x+w*.34,y+8,x+w*.34,y+h-9,rgba(p.main,.33),2);break;
 case 'journal':
  box(c,x+4,y+5,w-8,h-6,4,p.ivory,edge);
  box(c,x+w*.35,y+2,w*.30,Math.max(5,Math.min(13,h*.1)),2,rgba(p.gold,.49));
  break;
 case 'timeline':
  box(c,x,y,w,h,13,p.ivory,edge);
  rule(c,x+15,y+8,x+15,y+h-8,rgba(p.gold,.65),2.2);
  circ(c,x+15,y+h*.5,4,p.gold);break;
 default:
  box(c,x,y,w,h,Math.min(20,h*.20),p.ivory,edge);
 }
 c.restore();
 if(featured)box(c,x+w*.30,y+3,w*.40,Math.min(4,h*.036),2,p.gold);
 const badge=clamp(h*.33,small?19:23,41);
 if(showIcons){
  drawIconBadge(c,item,x+w-(small?22:32),y+Math.max(18,h*.27),badge,{
   style:iconStyle,accent:p.gold,contrast:isDark?p.gold:p.deep,light:isDark,featured
  });
 }
 const horizontal=f==='editorial'||f==='modern'||f==='timeline';
 let numX=x+8,numW=w*.68,numY=y+h*.09,numH=h*.39;
 let labelY=y+h*.67,labelH=h*.28,labelX=x+9,labelW=w-18;
 if(horizontal&&h>90){
  numX=x+w*.04;numW=w*.44;numY=y+h*.19;numH=h*.48;
  labelX=x+w*.49;labelW=w*.46;labelY=y+h*.35;labelH=h*.42;
 }else if(f==='geometric'||f==='heritage'||f==='ramadan'){
  numX=x+w*.14;numW=w*.60;labelX=x+w*.13;labelW=w*.74;labelY=y+h*.68;labelH=h*.27;
 }
 const number=Number.isFinite(Number(n))?formatCounter(n):'—';
 heading(c,number,numX,numY,numW,numH,clamp(h*.38,22,52),f==='night'?p.gold:p.deep,
   {weight:900,maxLines:1,minSize:small?16:20});
 if(showUnit&&h>70){
  const unit=n===0?(en?'Today':'اليوم'):item.mode==='manual'?(en?'Value':'قيمة'):(en?'days':'يوم');
  heading(c,unit,x+10,y+h*.46,w*.58,h*.18,clamp(h*.14,11,17),p.secondary,{weight:550,en,maxLines:1,minSize:10});
 }
 if(f!=='editorial'&&f!=='modern'&&f!=='timeline'){
  const bg=f==='night'?rgba(p.gold,.14):f==='desert'?rgba(p.gold,.14):rgba(p.main,.045);
  box(c,labelX-3,labelY,labelW+6,Math.min(labelH,h-(labelY-y)-3),Math.min(11,h*.11),bg);
 }
 heading(c,item.label||'موعد',labelX,labelY,labelW,Math.max(16,Math.min(labelH,h-(labelY-y)-2)),
   clamp(h*.185,14,24),ink,{weight:760,en,maxLines:2,minSize:11});
}
