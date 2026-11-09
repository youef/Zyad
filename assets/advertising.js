/* One professional, readable advertisement contract shared by ALL exported cards.
   The ad is clearly labeled and uses the published contact details.
   This draws only into the reserved bottom 230px of calendar posters. */
export const DEFAULT_AD=Object.freeze({
 enabled:true,label:'إعلان',title:'الخدمات العامة',phone:'0538243481',
 whatsapp:'0558930532',snapchat:'z32.y'
});
export function adSettings(config={}){
 const src=config.advertising||{};
 const old=config.card||{};
 const val=(k,oldValue)=>String(src[k]??oldValue??DEFAULT_AD[k]??'').trim().slice(0,72);
 return {enabled:src.enabled!==false,
   label:val('label',DEFAULT_AD.label),title:val('title',DEFAULT_AD.title),
   phone:val('phone',old.servicePhone),whatsapp:val('whatsapp',old.phone),
   snapchat:val('snapchat',old.social)};
}
const drawText=(c,text,x,y,size,color,maxWidth,weight='800',align='right',font='"Cairo",Tahoma,Arial,sans-serif')=>{
 c.save();c.direction='rtl';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;
 c.font=weight+' '+size+'px '+font;
 c.fillText(String(text),x,y,maxWidth);c.restore();
};
export function drawCalendarAdvertisement(c,config,qr){
 const ad=adSettings(config);if(!ad.enabled)return;
 c.save();
 // No counter is rendered below y=1675 by any calendar layout.
 c.fillStyle='#f8faf6';c.fillRect(0,1680,1080,240);
 c.fillStyle='#116a50';c.fillRect(0,1680,1080,6);
 c.beginPath();c.roundRect(36,1693,1008,214,23);c.fillStyle='#ffffff';c.fill();
 c.strokeStyle='#dbe7df';c.lineWidth=2;c.stroke();
 c.fillStyle='#e7f3ec';c.beginPath();c.roundRect(743,1712,269,36,16);c.fill();
 drawText(c,ad.label+' · '+ad.title,991,1731,25,'#116a50',231,'800');
 drawText(c,ad.phone,988,1798,57,'#073e31',710,'900','right','Arial,Tahoma,sans-serif');
 drawText(c,'للاستفسارات والخدمات',984,1832,21,'#59695e',500,'700');
 c.strokeStyle='#e2e9e2';c.lineWidth=2;c.beginPath();c.moveTo(243,1850);c.lineTo(995,1850);c.stroke();
 drawText(c,'واتساب: '+ad.whatsapp,992,1873,23,'#116a50',430,'800');
 drawText(c,'سناب: '+ad.snapchat,480,1873,23,'#495b50',245,'800');
 // QR stays in the same 140×140 test/scan region used by all 42 templates.
 if(config.settings?.showQr!==false&&qr){
   c.beginPath();c.roundRect(67,1697,140,140,11);c.fillStyle='#fff';c.fill();
   c.imageSmoothingEnabled=false;c.drawImage(qr,75,1705,124,124);c.imageSmoothingEnabled=true;
   drawText(c,'امسح للاشتراك',139,1866,16,'#496457',174,'700','center');
 }else{
   drawText(c,'رزنامة السعودية',137,1771,21,'#116a50',155,'800','center');
 }
 drawText(c,config.card?.disclaimer||'المواعيد تقديرية وتراجع لدى الجهات الرسمية',540,1909,15,'#6b7970',1008,'500','center');
 c.restore();
}
export function drawFreeformAdvertisement(c,design){
 const ad=adSettings(design);if(!ad.enabled)return;
 const [w,h]=design.dimensions;const margin=Math.max(14,Math.round(w*.025));
 const height=Math.max(84,Math.min(158,Math.round(h*.103)));
 const top=h-height-margin,wide=w-margin*2;
 c.save();
 c.beginPath();c.roundRect(margin,top,wide,height,Math.max(13,Math.round(height*.17)));
 c.fillStyle='rgba(255,255,255,.96)';c.fill();
 c.lineWidth=Math.max(1,w/1080);c.strokeStyle='rgba(16,102,74,.18)';c.stroke();
 const right=w-margin-16, left=margin+16;
 const fs=Math.max(13,Math.min(30,w*.027));
 drawText(c,ad.label+' | '+ad.title,right,top+height*.29,fs*.72,'#116a50',wide*.79,'800');
 drawText(c,ad.phone,right,top+height*.65,fs*1.45,'#073e32',wide*.68,'900','right','Arial,Tahoma,sans-serif');
 drawText(c,'واتساب '+ad.whatsapp+'  •  سناب '+ad.snapchat,left,top+height*.77,Math.max(11,fs*.63),'#5f7067',wide*.44,'700','left');
 c.restore();
}
