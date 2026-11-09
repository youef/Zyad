/* Saudi Calendar · embedded, text-only sponsorship.
   Never paint a white card or overwrite a template's native background/QR.
   The same editorial footer is used on every calendar/freeform export. */
export const DEFAULT_AD=Object.freeze({
  enabled:true,label:'إعلان',title:'الخدمات العامة',phone:'0538243481',
  whatsapp:'0558930532',snapchat:'z32.y',style:'text',position:'inside'
});
const plain=(v,fallback='',max=72)=>String(v??fallback).replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
export function adSettings(config={}){
  const source=config.advertising||{},old=config.card||{};
  return {
    enabled:source.enabled!==false,
    label:plain(source.label,DEFAULT_AD.label,24),
    title:plain(source.title,DEFAULT_AD.title,50),
    phone:plain(source.phone,old.servicePhone||DEFAULT_AD.phone,25),
    whatsapp:plain(source.whatsapp,old.phone||DEFAULT_AD.whatsapp,25),
    snapchat:plain(source.snapchat,old.social||DEFAULT_AD.snapchat,40),
    style:'text',position:'inside'
  };
}
function caption(ad){
  const parts=[ad.label||'إعلان'];
  if(ad.title||ad.phone)parts.push([ad.title,ad.phone].filter(Boolean).join(' '));
  if(ad.whatsapp)parts.push('واتساب '+ad.whatsapp);
  if(ad.snapchat)parts.push('سناب '+ad.snapchat);
  return parts.join('  ·  ');
}
function rgbaFromLuma(ctx,x,y){
  // Inspect the actual pixels of the card, not its theme tokens. The background
  // of each of the 42 art layouts can be dark, light or photographic.
  try {
    const scale=ctx.getTransform().a||1;
    const px=Math.round(x*scale),py=Math.round(y*scale);
    const img=ctx.getImageData(Math.max(0,px-2),Math.max(0,py-2),5,5).data;
    let brightness=0,count=0;
    for(let i=0;i<img.length;i+=4){brightness+=.2126*img[i]+.7152*img[i+1]+.0722*img[i+2];count++;}
    return brightness/Math.max(1,count)>145;
  }catch{return true;}
}
function drawLine(ctx,text,x,y,maxWidth,size){
  const light=rgbaFromLuma(ctx,x,y+3);
  ctx.save();
  ctx.direction='rtl';ctx.textAlign='center';ctx.textBaseline='middle';
  let fontSize=size;
  do{ctx.font='700 '+fontSize+'px "Cairo",Tahoma,Arial,sans-serif';
    if(ctx.measureText(text).width<=maxWidth||fontSize<=14)break;
    fontSize-=1;
  }while(fontSize>14);
  ctx.fillStyle=light?'rgba(29,67,53,.90)':'rgba(250,250,241,.94)';
  ctx.shadowColor=light?'rgba(255,255,255,.60)':'rgba(0,0,0,.45)';
  ctx.shadowBlur=light?1:2;
  ctx.fillText(text,x,y,maxWidth);
  ctx.restore();
}
export function drawCalendarAdvertisement(ctx,config,_qr,{kind='calendar'}={}){
  const ad=adSettings(config);if(!ad.enabled)return;
  // All drawings are INSIDE the original 1080×1920 artwork. QR and existing
  // footer graphics remain unmodified. The heritage layout reserves a separate
  // breathing space between the counters and subscription footer.
  const y=kind==='heritage'?1654:kind==='premium'?1874:1880;
  const x=540,width=kind==='heritage'?900:950;
  drawLine(ctx,caption(ad),x,y,width,kind==='heritage'?23:20);
}
export function drawFreeformAdvertisement(ctx,design){
  const ad=adSettings(design);if(!ad.enabled)return;
  const [w,h]=design.dimensions;
  const margin=Math.max(20,Math.round(w*.038));
  const y=h-Math.max(23,Math.round(h*.028));
  // No panel, shadowed badge or rectangular overlay. This is a literal footer
  // line inside the artwork, with contrast chosen from the underlying colors.
  drawLine(ctx,caption(ad),w/2,y,w-margin*2,Math.max(15,Math.min(27,Math.round(w*.020))));
}
