/* Transparent official mark with a subtle hanging-corner treatment, never a white tile. */
export function drawHangingLogo(ctx,img,{x=65,y=26,width=200,height=112,light=false}={}){
 if(!img)return false;
 const iw=Number(img.naturalWidth||img.width),ih=Number(img.naturalHeight||img.height);if(!iw||!ih)return false;
 ctx.save();
 // A slender metal pin and hanging cord make the brand feel like a clipped sticker.
 const cx=x+width*.48;
 ctx.strokeStyle=light?'rgba(249,224,164,.9)':'rgba(135,107,55,.85)';
 ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,y-16);ctx.lineTo(cx,y+12);ctx.stroke();
 ctx.beginPath();ctx.arc(cx,y-17,7,0,Math.PI*2);
 ctx.fillStyle=light?'#ebd09a':'#bb9854';ctx.fill();
 ctx.translate(cx,y+height*.49);ctx.rotate(-Math.PI/46);ctx.translate(-cx,-(y+height*.49));
 const s=Math.min((width-10)/iw,(height-17)/ih),w=iw*s,h=ih*s;
 ctx.shadowColor='rgba(0,0,0,.32)';ctx.shadowBlur=13;ctx.shadowOffsetX=0;ctx.shadowOffsetY=6;
 // A sticker-like die-cut shadow follows the transparent pixels of the actual mark.
 ctx.filter=light?'drop-shadow(0px 3px 5px rgba(0,0,0,.27)) brightness(0) invert(1)':'drop-shadow(0px 3px 5px rgba(0,0,0,.20))';
 ctx.drawImage(img,cx-w/2,y+height/2-h/2,w,h);
 ctx.restore();return true;
}
export function brandStamp(ctx,img,x,y,w,h,opts={}){
 return drawHangingLogo(ctx,img,{x,y,width:w,height:h,light:Boolean(opts.filter&&opts.filter!=='none')});
}
