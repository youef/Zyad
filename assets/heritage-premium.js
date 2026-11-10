/* A clean, print-first Saudi heritage card. All content is live and editable. */
import {drawHangingLogo} from './brand-art.js';
import {drawDailyPanel} from './daily-panel.js';
import {hasCardMessage} from './daily.js';
const W=1080,H=1920;
const C={deep:'#073f34',deepest:'#032e29',green:'#0c624b',gold:'#c7a05b',goldLight:'#f4dfaa',paper:'#faf6ed',ivory:'#fffdf8',ink:'#173e35',muted:'#67796c',line:'#e3d5b7'};
const fallbackFont='"Cairo",Tahoma,Arial,sans-serif';

function rr(c,x,y,w,h,r,fill,stroke,lw=1){
  c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
}
function txt(c,v,x,y,size,color,max=920,weight='800',minSize=20,dir='rtl'){
  const s=String(v??'');
  c.save();c.direction=dir;c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;
  let fs=size;
  do{c.font=weight+' '+fs+'px '+(c.zyadFont||fallbackFont);if(c.measureText(s).width<=max||fs<=minSize)break;fs--;}while(fs>minSize);
  c.fillText(s,x,y,max);c.restore();
}
function star(c,x,y,r,col,opacity=1){
  c.save();c.translate(x,y);c.globalAlpha=opacity;c.strokeStyle=col;c.lineWidth=2;
  c.beginPath();for(let i=0;i<=16;i++){const a=i*Math.PI/8-Math.PI/2,rad=i%2?r*.55:r;i?c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad):c.moveTo(Math.cos(a)*rad,Math.sin(a)*rad);}c.closePath();c.stroke();c.restore();
}
function ornament(c,ink){
  c.save();c.strokeStyle=ink;c.globalAlpha=.055;c.lineWidth=2;
  for(let y=40;y<H;y+=140)for(const x of [44,1036]){
    c.beginPath();c.moveTo(x,y-29);c.lineTo(x+29,y);c.lineTo(x,y+29);c.lineTo(x-29,y);c.closePath();c.stroke();
    c.beginPath();c.arc(x,y,17,0,Math.PI*2);c.stroke();
  }
  c.restore();
}
function scallop(c,x,y,r,fill,stroke){
  c.save();c.beginPath();
  for(let i=0;i<=96;i++){
    const a=2*Math.PI*i/96-Math.PI/2,radius=r*(1+.065*Math.cos(8*a));
    const px=x+radius*Math.cos(a),py=y+radius*Math.sin(a);
    if(!i)c.moveTo(px,py);else c.lineTo(px,py);
  }
  c.closePath();c.fillStyle=fill;c.fill();c.lineWidth=3;c.strokeStyle=stroke;c.stroke();c.restore();
}
function centeredLines(c,src,maxWidth,size,maxLines){
  c.font='700 '+size+'px '+(c.zyadFont||fallbackFont);
  const words=String(src||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  const lines=[];let line='';
  for(const word of words){
    const next=line?line+' '+word:word;
    if(line&&c.measureText(next).width>maxWidth){lines.push(line);line=word;}else line=next;
  }
  if(line)lines.push(line);
  if(lines.length>maxLines){
    const clipped=lines.slice(0,maxLines);clipped[maxLines-1]=lines.slice(maxLines-1).join(' ');
    while(c.measureText(clipped[maxLines-1]+'…').width>maxWidth&&clipped[maxLines-1].length>3)
      clipped[maxLines-1]=clipped[maxLines-1].slice(0,-1);
    clipped[maxLines-1]=clipped[maxLines-1].trim()+'…';return clipped;
  }
  return lines;
}
function heading(c,config,iso,tools){
  c.save();c.shadowColor='rgba(3,43,36,.19)';c.shadowBlur=22;c.shadowOffsetY=11;
  const g=c.createLinearGradient(70,70,1008,355);g.addColorStop(0,C.deepest);g.addColorStop(.5,C.deep);g.addColorStop(1,'#096148');
  rr(c,45,45,990,321,39,g);c.restore();
  rr(c,58,57,964,295,30,null,'rgba(241,210,138,.8)',3);
  rr(c,71,70,938,269,24,null,'rgba(250,241,210,.22)',1);
  star(c,137,119,28,C.goldLight,.78);
  star(c,935,301,19,C.goldLight,.72);
  c.strokeStyle=C.gold;c.lineWidth=2;c.beginPath();c.moveTo(360,288);c.lineTo(497,288);c.moveTo(583,288);c.lineTo(720,288);c.stroke();
  star(c,540,288,18,C.goldLight,.9);
  const day=tools.weekday(iso);
  
  txt(c,day,540,216,113,'#ffffff',740,'900',85);
  txt(c,'تقويمك ومواعيدك على مدار العام',540,322,27,'#e9d5a9',800,'700');
  drawHangingLogo(c,tools.logo,{x:83,y:79,width:186,height:111,light:true});
}
function datePlaque(c,x,top,label,number,month){
  c.save();c.shadowColor='rgba(32,71,51,.07)';c.shadowBlur=10;c.shadowOffsetY=4;
  rr(c,x,382,468,111,20,C.ivory,C.line,2);c.restore();
  rr(c,x+10,392,448,91,14,null,'rgba(199,160,91,.25)',1);
  rr(c,x+170,391,128,29,13,C.deep);
  txt(c,label,x+234,405,21,'#ffffff',118,'700');
  txt(c,number,x+234,447,42,C.deep,427,'900',28,'ltr');
  txt(c,month,x+234,480,22,C.muted,420,'700');
}
function quote(c,cfg){
  c.save();c.shadowColor='rgba(52,57,31,.07)';c.shadowBlur=14;c.shadowOffsetY=5;
  rr(c,54,514,972,265,27,C.ivory,C.line,2);c.restore();
  rr(c,65,526,950,240,19,null,'rgba(199,160,91,.22)',1);
  if(cfg.daily&&drawDailyPanel(c,cfg,54,514,972,265,{gold:C.gold,ink:C.ink}))return;
  const content=cfg.card?.quote||'';
  const source=cfg.card?.attribution||'';
  const name='حكمة اليوم';
  rr(c,383,531,314,43,20,'#f3e9ce');
  txt(c,name,540,553,25,C.deep,290,'800');
  c.save();c.direction='rtl';
  let fs=42,lines;
  do{lines=centeredLines(c,content,864,fs,5);if(lines.length<=3)break;fs-=2;}while(fs>31);
  if(lines.length>3)lines=centeredLines(c,content,865,fs,3);
  const gap=fs*1.48,mid=655;
  lines.forEach((line,i)=>txt(c,line,540,mid+(i-(lines.length-1)/2)*gap,fs,C.ink,885,'800',30));
  c.restore();
  c.beginPath();c.moveTo(420,741);c.lineTo(483,741);c.moveTo(597,741);c.lineTo(660,741);c.strokeStyle=C.gold;c.lineWidth=2;c.stroke();
  star(c,540,741,13,C.gold,1);
  txt(c,source,540,763,20,C.muted,730,'600',17);
}
function medal(c,cx,cy,r,n,small){
  c.save();c.shadowColor='rgba(4,58,45,.17)';c.shadowBlur=8;c.shadowOffsetY=5;
  scallop(c,cx,cy,r+3,'#e9c77c','#b98e38');c.restore();
  const g=c.createLinearGradient(cx-r,cy-r,cx+r,cy+r);
  g.addColorStop(0,'#0e7056');g.addColorStop(.7,C.deep);g.addColorStop(1,'#032e2a');
  scallop(c,cx,cy,r-4,g,'#e5bf6b');
  txt(c,String(n??0).padStart(2,'0'),cx,cy-(small?3:6),small?42:61,'#ffffff',r*1.68,'900',29,'ltr');
  if(!small)txt(c,'يوم',cx,cy+31,16,'#efd9a3',100,'700');
}
function countdown(c,cfg,iso,remaining){
  const reading=hasCardMessage(cfg),headerY=reading?823:585,startY=reading?859:621;
  txt(c,'المواعيد القادمة',842,headerY,37,C.deep,385,'900');
  txt(c,'الأيام المتبقية',230,headerY,24,C.muted,335,'700');
  c.beginPath();c.moveTo(57,headerY+26);c.lineTo(1023,headerY+26);c.strokeStyle=C.line;c.lineWidth=2;c.stroke();
  const items=(cfg.counters||[]).filter(i=>i.enabled!==false).slice(0,24);
  const cols=4,rows=Math.max(4,Math.ceil(items.length/cols)),gap=11;
  const w=(972-3*gap)/cols, h=(1505-startY-(rows-1)*gap)/rows;
  const timed=items.filter(i=>i.mode!=='manual');
  const nearest=timed.length?Math.min(...timed.map(i=>remaining(i,iso)??999999)):null;
  items.forEach((item,i)=>{
    const col=i%cols,row=Math.floor(i/cols),x=54+(cols-1-col)*(w+gap),y=startY+row*(h+gap),cx=x+w/2;
    const best=cfg.design?.highlightNext!==false&&item.mode!=='manual'&&remaining(item,iso)===nearest;
    c.save();c.shadowColor='rgba(40,56,43,.065)';c.shadowBlur=7;c.shadowOffsetY=3;
    rr(c,x,y,w,h,17,best?'#fffcf3':'#fffefb',best?C.gold:C.line,best?3:1.5);c.restore();
    if(best){rr(c,x+20,y+10,w-40,4,2,C.gold);}
    const compact=h<145,r=compact?Math.min(44,h*.31):54;
    medal(c,cx,y+(compact?h*.38:h*.39),r,remaining(item,iso),compact);
    txt(c,item.label||'موعد',cx,y+h*(compact?.80:.82),compact?23:29,C.deep,w-15,'800',18);
  });
  if(!items.length)txt(c,'لا توجد مواعيد مضافة بعد',540,1120,43,C.muted,890,'800');
}
function socialPill(c,x,label,value){
  rr(c,x,1791,337,68,16,'rgba(255,255,255,.10)','rgba(232,204,136,.43)',1.5);
  txt(c,label,x+169,1810,18,C.goldLight,295,'700');
  txt(c,value,x+169,1839,30,'#fff',307,'900',22,'ltr');
}
function social(c,cfg,qr){
  rr(c,54,1716,972,159,25,C.deepest,C.gold,3);
  rr(c,67,1728,948,135,18,null,'rgba(252,224,162,.2)',1);
  if(cfg.settings?.showQr!==false){
    rr(c,73,1724,152,144,12,'#fff',null);
    if(qr){c.save();c.imageSmoothingEnabled=false;c.drawImage(qr,84,1731,130,130);c.restore();}
    else txt(c,'QR',148,1793,40,C.deep,130,'900');
  }
  txt(c,cfg.card?.promo||'اشترك معنا مجانًا',634,1756,36,C.goldLight,730,'900');
  socialPill(c,255,'واتساب',cfg.card?.phone||'0558930532');
  socialPill(c,616,'سناب شات',cfg.card?.social||'z32.y');
  txt(c,'المواعيد تقديرية، ويُرجع للجهات الرسمية للتأكد من مواعيد الصرف',540,1889,18,C.muted,990,'700',16);
}
/** Render one sharply structured printable card, including original scannable QR. */
export function renderHeritage(c,cfg,iso,tools){
  const paper=c.createLinearGradient(0,0,0,H);paper.addColorStop(0,'#fbf8ef');paper.addColorStop(1,'#f6f1e6');
  c.fillStyle=paper;c.fillRect(0,0,W,H);
  ornament(c,C.deep);
  rr(c,17,17,1046,1886,35,null,'#bd9852',4);
  rr(c,28,28,1024,1864,30,null,'rgba(187,151,86,.34)',1.3);
  heading(c,cfg,iso,tools);
  const hijri=tools.hijriPanel(iso,cfg);
  const month=new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{timeZone:'Asia/Riyadh',month:'long'}).format(new Date(iso+'T12:00:00Z'));
  datePlaque(c,54,382,'ميلادي',iso.replaceAll('-','/'),month);
  datePlaque(c,558,382,'هجري',hijri.number,hijri.label);
  if(hasCardMessage(cfg))quote(c,cfg);
  countdown(c,cfg,iso,tools.remaining);
  // A quiet breathing space between counters and subscription information.
  // The single text-only sponsor line is inserted here by advertising.js.
  // The shared renderer owns all footer content; do not draw a duplicate.
}
