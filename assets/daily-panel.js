import {getLanguage} from './locale.js?v=i18n4';
import {fitText,formatCounter} from './text-layout.js?v=2';
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
  fitText(c,r.title,{x:x+22,y:top+5,w:w-44,h:24,size:18,minSize:13,maxLines:1,weight:750,color:p.gold,direction:en?'ltr':'rtl'});
  fitText(c,r.text,{x:x+31,y:top+32,w:w-62,h:Math.max(19,rh-54),size:Math.min(30,rh*.26),minSize:16,maxLines:3,weight:650,color:p.ink,direction:en?'ltr':'rtl'});
  fitText(c,r.type==='general'?(en?'General supplication':'غير منسوب إلى حديث'):(r.reference||''),{x:x+34,y:top+rh-22,w:w-68,h:17,size:14,minSize:11,maxLines:1,weight:500,color:p.ink,direction:en?'ltr':'rtl'});
  if(index<rows.length-1){c.beginPath();c.moveTo(x+45,top+rh);c.lineTo(x+w-45,top+rh);c.strokeStyle=p.gold+'66';c.lineWidth=1;c.stroke();}
 });
 c.restore();return true;
}
