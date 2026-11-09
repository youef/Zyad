/* Keep the complete official logo visible in every card without cropping it. */
export function brandStamp(ctx,img,x,y,width,height,{background=null,border=null,radius=16,padding=1,filter='none'}={}){
  if(!img)return false;
  const iw=Number(img.naturalWidth||img.width),ih=Number(img.naturalHeight||img.height);
  if(!iw||!ih)return false;
  ctx.save();
  ctx.filter=filter;
  ctx.shadowColor='rgba(0,32,26,.14)';
  ctx.shadowBlur=12;ctx.shadowOffsetY=4;
  ctx.beginPath();ctx.roundRect(x,y,width,height,radius);
  if(background){ctx.fillStyle=background;ctx.fill();}
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  if(border){ctx.strokeStyle=border;ctx.lineWidth=2;ctx.stroke();}
  const availW=Math.max(1,width-padding*2),availH=Math.max(1,height-padding*2);
  const s=Math.min(availW/iw,availH/ih);
  const dw=iw*s,dh=ih*s;
  ctx.beginPath();ctx.roundRect(x+3,y+3,width-6,height-6,Math.max(2,radius-3));ctx.clip();
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(img,x+(width-dw)/2,y+(height-dh)/2,dw,dh);
  ctx.restore();
  return true;
}
