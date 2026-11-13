import {getLanguage} from './locale.js?v=i18n4';
export function drawDailyPanel(c,cfg,x,y,w,h,p){
 if(!cfg.daily)return false;
 const en=getLanguage()==='en',friday=cfg.daily.special==='friday';
 const rows=[
  cfg.content?.showHadith!==false&&cfg.daily.hadith&&{...cfg.daily.hadith,title:friday?(en?'Friday hadith':'حديث الجمعة'):(en?'Hadith (English meaning)':'مقتطف من حديث صحيح')},
  (friday?cfg.content?.fridayReminders!==false:cfg.content?.showDua!==false)&&cfg.daily.dua&&{...cfg.daily.dua,title:friday?(en?'Remembrance & blessings upon the Prophet':'ذكر وصلاة على النبي ﷺ'):(en?'Supplication (English meaning)':cfg.daily.dua.type==='prophetic'?'دعاء مأثور':'دعاء عام')}
 ].filter(Boolean);
 if(!rows.length)return false;
 c.save();c.direction=en?'ltr':'rtl';c.textAlign='center';c.textBaseline='middle';
 const font=c.zyadFont||'Cairo',rh=h/rows.length;
 rows.forEach((r,index)=>{
  const top=y+index*rh;
  c.fillStyle=p.gold;c.font=`700 18px ${font}`;c.fillText(r.title,x+w/2,top+22,w-75);
  let fs=31,lines=[];
  const wrap=()=>{c.font=`600 ${fs}px ${font}`;lines=[];let acc='';
   for(const word of String(r.text||'').split(/\s+/)){const next=acc?acc+' '+word:word;if(acc&&c.measureText(next).width>w-84){lines.push(acc);acc=word;}else acc=next;}if(acc)lines.push(acc);};
  wrap();while(lines.length*fs*1.5>rh-62&&fs>21){fs--;wrap();}
  c.fillStyle=p.ink;const cy=top+rh*.52;
  lines.forEach((s,i)=>c.fillText(s,x+w/2,cy+(i-(lines.length-1)/2)*fs*1.5,w-80));
  c.font=`500 15px ${font}`;c.fillText(r.type==='general'?(en?'General supplication':'غير منسوب إلى حديث'):(r.reference||''),x+w/2,top+rh-17,w-80);
  if(index<rows.length-1){c.beginPath();c.moveTo(x+45,top+rh);c.lineTo(x+w-45,top+rh);c.strokeStyle=p.gold+'66';c.lineWidth=1;c.stroke();}
 });
 c.restore();return true;
}
