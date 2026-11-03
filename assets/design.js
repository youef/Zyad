
/* Saudi premium calendar templates rendered offline on Canvas. */
const FONT='"Cairo",Tahoma,Arial,sans-serif';
function rgba(hex,alpha){const c=/^#[a-f\d]{6}$/i.test(hex)?hex:'#064b43';return 'rgba('+[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)).join(',')+','+alpha+')';}
function round(c,x,y,w,h,r,fill,stroke=null,size=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=size;c.strokeStyle=stroke;c.stroke();}}
function label(c,value,x,y,sz,color,max=0,align='center',weight='800'){
 c.save();c.direction='rtl';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;
 while(true){c.font=weight+' '+sz+'px '+FONT;if(!max||c.measureText(String(value)).width<=max||sz<15)break;sz--;}
 c.fillText(String(value||''),x,y);c.restore();
}
function star(c,x,y,r,color,opacity=1){c.save();c.globalAlpha=opacity;c.translate(x,y);c.rotate(Math.PI/8);c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,v=i%2?r*.68:r;if(i)c.lineTo(Math.cos(a)*v,Math.sin(a)*v);else c.moveTo(Math.cos(a)*v,Math.sin(a)*v);}c.closePath();c.strokeStyle=color;c.lineWidth=2;c.stroke();c.restore();}
function mosaic(c,color,a){for(let y=28;y<1920;y+=116)for(let x=40+(Math.floor(y/116)%2)*58;x<1100;x+=116){star(c,x,y,30,color,a);}}
function wrap(c,src,width,size=35,cap=3){
 c.save();c.font='800 '+size+'px '+FONT;const words=String(src||'').split(/\s+/).filter(Boolean);let acc='',all=[];
 for(const word of words){const next=acc?acc+' '+word:word;if(acc&&c.measureText(next).width>width){all.push(acc);acc=word;}else acc=next;}
 if(acc)all.push(acc);c.restore();return all.slice(0,cap);
}
function clockText(iso){
 const day=new Date(iso+'T12:00:00Z');
 const fmt=(o)=>new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{timeZone:'Asia/Riyadh',...o}).format(day);
 return {weekday:fmt({weekday:'long'}),date:fmt({day:'numeric',month:'long',year:'numeric'})};
}
function counter(c,item,x,y,w,h,colors,n,nearest,compact,showUnit,highlight){
 const {green,gold,ink,soft,dark}=colors;const best=highlight&&n===nearest;
 c.save();c.shadowColor='rgba(5,44,33,.10)';c.shadowBlur=15;c.shadowOffsetY=5;
 round(c,x,y,w,h,18,dark?(best?'#285047':'#16352f'):(best?'#fff5df':'#ffffff'),best?gold:(dark?'#31564b':'#e4eadf'),best?2.5:1);c.restore();
 round(c,x+w-7,y+14,3,h-28,2,best?gold:soft);
 if(best)label(c,'✦',x+21,y+22,19,gold);
 label(c,String(n??0).padStart(2,'0'),x+w/2,y+h*(compact?.39:.40),compact?44:56,dark?'#fff7de':green,w-24,'center','900');
 if(showUnit&&!compact)label(c,n===0?'اليوم':'يوم',x+w/2,y+h*.63,16,best?gold:soft);
 c.fillStyle=dark?'#476458':'#e8ede8';c.fillRect(x+24,y+h*.74,w-48,1);
 label(c,item.label||'موعد',x+w/2,y+h*.86,compact?20:23,dark?'#e9efe5':ink,w-18);
}
export function renderPremium(ctx,cfg,iso,tools){
 const des=cfg.design||{},style=['royal','modern','night'].includes(des.preset)?des.preset:'royal';
 const dark=style==='night',modern=style==='modern',t=cfg.theme||{};
 const green=t.green||'#064b43',gold=t.gold||'#c99a42',soft=t.greenLight||'#37765e',ink=t.ink||'#103f38',paper=t.cream||'#f8f5ea';
 const color={green,gold,soft,ink,dark};
 ctx.fillStyle=dark?'#09251f':modern?'#f3f8f4':paper;ctx.fillRect(0,0,1080,1920);
 if(des.pattern!==false)mosaic(ctx,dark?gold:green,Math.max(0,Math.min(.22,Number(des.patternStrength??.07))));
 let grad=ctx.createLinearGradient(0,0,1080,476);grad.addColorStop(0,dark?'#1b4740':green);grad.addColorStop(1,dark?'#082c25':modern?soft:'#093b33');
 if(modern)round(ctx,39,36,1002,446,32,grad);else{ctx.fillStyle=grad;ctx.fillRect(0,0,1080,480);}
 ctx.lineWidth=2.5;ctx.strokeStyle=rgba(gold,.72);
 if(!modern){ctx.strokeRect(45,47,990,390);ctx.strokeRect(65,66,950,354);}
 else{ctx.beginPath();ctx.moveTo(95,450);ctx.lineTo(984,450);ctx.stroke();}
 for(const x of [137,942]){star(ctx,x,104,24,gold,.9);if(!modern)star(ctx,x,397,16,gold,.7);}
 label(ctx,cfg.brand?.name||'بطاقتي اليومية',540,90,36,'#f6e8ca',640);
 if(tools.logo){ctx.save();ctx.beginPath();ctx.arc(922,107,35,0,2*Math.PI);ctx.clip();ctx.drawImage(tools.logo,887,72,70,70);ctx.restore();}
 const date=clockText(iso);
 label(ctx,date.weekday,540,198,109,'#fff',785,'center','900');
 label(ctx,cfg.brand?.subtitle||'مواعيدك اليومية',540,272,28,'#ead7a6',785);
 for(const [x,title,value] of [[100,'ميلادي',date.date],[558,'هجري',tools.hijriDate(iso,cfg)]]){
  round(ctx,x,337,420,108,17,'rgba(255,255,255,.10)',rgba(gold,.85),2);
  label(ctx,title,x+210,367,23,'#edd39c');label(ctx,value,x+210,413,32,'#fff',401);
 }
 // Reading area with stable line wrapping and protected lower grid.
 round(ctx,58,527,964,260,23,dark?'#17372f':'#fffefa',rgba(gold,.34),2);
 ctx.fillStyle=gold;ctx.fillRect(79,561,5,177);
 label(ctx,'❝',540,567,43,gold);
 if(cfg.settings?.showQuote!==false){
  const quote=String(cfg.card?.quote||'');let fs=36,arr=wrap(ctx,quote,857,fs,4);
  while(arr.length>3&&fs>26){fs-=2;arr=wrap(ctx,quote,857,fs,4);}
  const first=arr.length===1?667:arr.length===2?640:610;
  arr.slice(0,3).forEach((s,i)=>label(ctx,s,540,first+i*51,fs,dark?'#f8f3e0':ink,860));
  if(cfg.card?.attribution)label(ctx,cfg.card.attribution,540,758,20,dark?'#cabf9e':soft,820);
 }else label(ctx,'كل مواعيدك المهمة',540,657,47,dark?'#fff':ink,880);
 label(ctx,'المواعيد والعدّادات',999,830,42,dark?'#fcf2e1':ink,730,'right','900');
 ctx.fillStyle=gold;ctx.fillRect(70,829,90,4);
 const items=(cfg.counters||[]).filter(item=>item.enabled!==false).slice(0,24);
 const nearest=items.length?Math.min(...items.map(i=>tools.remaining(i,iso)??99999)):null;
 const next=items.find(i=>tools.remaining(i,iso)===nearest);
 if(next&&des.highlightNext!==false)label(ctx,'الأقرب: '+next.label,72,830,20,dark?'#e3c68f':soft,444,'left');
 const rows=Math.max(1,Math.ceil(items.length/4)),compact=des.density==='compact'||rows>4;
 const h=Math.min(compact?116:155,Math.floor((1598-883)/rows)-11),space=compact?10:14;
 items.forEach((item,i)=>counter(ctx,item,780-i%4*240,885+Math.floor(i/4)*(h+space),220,h,color,tools.remaining(item,iso),nearest,compact,des.showUnit!==false,des.highlightNext!==false));
 if(!items.length)label(ctx,'لا توجد مواعيد مضافة',540,1170,46,dark?'#fff':soft);
 ctx.strokeStyle=rgba(gold,.8);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(58,1641);ctx.lineTo(1021,1641);ctx.stroke();
 label(ctx,cfg.card?.promo||'تابع البطاقة اليومية',604,1685,32,dark?'#f9e6bd':green,735);
 const contact=[cfg.card?.phone,cfg.card?.social].filter(Boolean).join(' • ');
 if(cfg.settings?.showContact!==false&&contact)label(ctx,contact,605,1731,26,dark?'#ddd3ae':soft,725);
 if(cfg.settings?.showQr!==false){
  round(ctx,64,1656,188,188,17,'#fff',gold,3);
  if(tools.qr)ctx.drawImage(tools.qr,77,1669,162,162);
  else label(ctx,'QR',157,1740,47,green);
 }
 label(ctx,cfg.card?.footer||'بطاقتك اليومية',604,1792,22,dark?'#d6ceb7':ink,730);
 ctx.fillStyle=dark?'#154b42':green;ctx.fillRect(0,1843,1080,77);
 label(ctx,cfg.card?.disclaimer||'المواعيد التقديرية تخضع للجهات الرسمية',540,1881,23,'#f6e8bb',1030);
}
