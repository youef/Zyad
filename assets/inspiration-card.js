/* Premium daily inspiration cards: rendered as real, responsive canvas artwork. */
const round=(c,x,y,w,h,r=26)=>{c.beginPath();c.roundRect(x,y,w,h,r);};
function text(c,value,x,y,size,color,weight=700,max=900){
 c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';
 let n=size;c.font=weight+' '+n+'px "Cairo",Tahoma,Arial,sans-serif';
 while(c.measureText(value).width>max&&n>20){n-=2;c.font=weight+' '+n+'px "Cairo",Tahoma,Arial,sans-serif';}
 c.fillText(value,x,y,max);
}
function wrappedText(c,value,x,y,maxWidth=810,size=46,color='#173b38'){
 let fontSize=size,rows=[];
 const measure=()=>{c.font='800 '+fontSize+'px "Cairo",Tahoma,Arial,sans-serif';rows=[];let part='';for(const word of String(value||'').split(/\s+/)){const s=part?part+' '+word:word;if(part&&c.measureText(s).width>maxWidth){rows.push(part);part=word;}else part=s;}if(part)rows.push(part);};
 measure();while(rows.length>3&&fontSize>28){fontSize-=2;measure();}
 const gap=fontSize*1.55;rows.slice(0,3).forEach((line,i)=>text(c,line,x,y+(i-(Math.min(rows.length,3)-1)/2)*gap,fontSize,color,800,maxWidth));
}
function panel(c,x,y,w,h,fill,stroke,r=27){
 c.fillStyle=fill;round(c,x,y,w,h,r);c.fill();c.strokeStyle=stroke;c.lineWidth=2;c.stroke();
}
function bloom(c,x,y,color,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 c.strokeStyle='#75977b';c.lineWidth=5;c.beginPath();c.moveTo(0,35);c.lineTo(0,165);c.stroke();
 for(let j=0;j<5;j++){const dx=(j-2)*27,dy=(j%2)*30;c.save();c.translate(dx,-dy);for(let i=0;i<6;i++){c.rotate(Math.PI/3);c.fillStyle=i%2?'#b0ced3':color;c.beginPath();c.ellipse(0,-22,14,27,0,0,Math.PI*2);c.fill();}c.fillStyle='#e6c178';c.beginPath();c.arc(0,0,9,0,Math.PI*2);c.fill();c.restore();}
 c.restore();
}
export function drawInspirationCard(c,cfg,iso,preset){
 const palette={botanical:['#fffbf3','#07564f','#c59e5c'],royal:['#f9f1df','#073e38','#d3a94e'],pearl:['#fffdf8','#287168','#c8b080']}[preset]||['#fffbf3','#07564f','#c59e5c'];
 const [paper,green,gold]=palette,ink='#173b38';
 c.fillStyle=paper;c.fillRect(0,0,1080,1920);
 c.strokeStyle=gold;c.lineWidth=8;round(c,22,22,1036,1876,64);c.stroke();
 c.lineWidth=2;round(c,42,42,996,1834,52);c.stroke();
 const date=new Date(iso+'T12:00:00Z');
 const day=new Intl.DateTimeFormat('ar-SA',{weekday:'long',timeZone:'UTC'}).format(date);
 const hijri=new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date);
 const greg=new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date);
 panel(c,75,75,930,225,'#ffffffbc',gold,40);
 text(c,cfg.brand?.name||'أوان السعودية',540,135,61,green,900,830);
 text(c,'إشراقة يومك · مناسبات ورسائل ملهمة',540,213,32,gold,700,830);
 text(c,day,540,352,105,green,900,900);
 panel(c,85,430,910,134,'#ffffffdd',gold,28);
 text(c,'هجري  |  '+hijri,540,474,37,ink,700,830);
 text(c,'ميلادي  |  '+greg,540,529,33,ink,700,830);
 panel(c,85,605,910,575,'#ffffffc9',gold,37);
 text(c,cfg.daily?.special==='friday'?'✦ من هدي الجمعة ✦':'✦ رسالة اليوم ✦',540,690,49,green,900,800);
 c.strokeStyle=gold;c.lineWidth=2;c.beginPath();c.moveTo(235,750);c.lineTo(845,750);c.stroke();
 if(cfg.daily?.special==='friday'){
  wrappedText(c,cfg.daily.hadith?.text||'أكثروا من الصلاة على النبي ﷺ',540,911,805,53,ink);
  text(c,cfg.daily.hadith?.reference||'',540,1103,23,green,700,800);
 }else{
  text(c,'ازرع أثرًا جميلًا،',540,836,66,ink,900,810);
  text(c,'فالكلمة الطيبة تبقى',540,931,61,green,800,820);
  text(c,'والخير يزهر في القلوب',540,1030,52,ink,800,820);
 }
 if(preset!=='pearl'){bloom(c,180,1090,'#80b5ca',.68);bloom(c,910,1110,'#9ccbd5',.52);}
 panel(c,85,1240,910,300,'#ffffffc9',gold,37);
 if(cfg.daily?.special==='friday'){
  text(c,'❖ ذكر وصلاة على النبي ﷺ ❖',540,1310,43,green,900,840);
  text(c,cfg.daily.dhikr?.text||'',540,1400,38,ink,800,820);
  text(c,cfg.daily.salawat?.text||'',540,1472,35,green,700,830);
 }else{
  text(c,'❖ تأمل اليوم ❖',540,1310,46,green,900,800);
  text(c,'اجعل يومك بدايةً لخيرٍ جديد',540,1400,52,ink,800,820);
  text(c,'وتفاءل بما عند الله من جميل العطاء',540,1472,36,green,700,820);
 }
 panel(c,85,1590,910,165,green,green,38);
 text(c,'بطاقة يومية | '+day,540,1645,43,'#fff9e9',900,820);
 text(c,'حفظ ومشاركة · تصميم أوان السعودية',540,1712,28,'#fff9e9',600,830);
}
