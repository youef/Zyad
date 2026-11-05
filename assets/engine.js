import {validImage} from './storage.js';
const cache=new Map();
const font='"Cairo",Tahoma,Arial,sans-serif';
export function assetUrl(src){return new URL('../'+src,import.meta.url).href;}
export function loadImage(src){
 if(!validImage(src))return Promise.reject(Error('صيغة صورة غير مسموحة'));
 if(cache.has(src))return cache.get(src);
 const p=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{cache.delete(src);reject(Error('تعذر تحميل الصورة'));};im.src=src.startsWith('data:')?src:assetUrl(src);});cache.set(src,p);if(cache.size>45)cache.delete(cache.keys().next().value);return p;
}
export function layerText(l,d){
 if(l.type==='gregorian'||l.type==='hijri')return new Intl.DateTimeFormat(l.type==='hijri'?'ar-SA-u-ca-islamic-umalqura':'ar-SA-u-ca-gregory',{dateStyle:'long',timeZone:'Asia/Riyadh'}).format(new Date(d.date+'T12:00:00Z'));
 if(l.type==='countdown'){if(!l.target)return 'حدد الموعد';return Math.max(0,Math.round((Date.parse(l.target+'T12:00:00Z')-Date.parse(d.date+'T12:00:00Z'))/86400000))+' يوم';}return String(l.text||'');
}
function cover(c,im,x,y,w,h,fit='cover'){const s=fit==='contain'?Math.min(w/im.width,h/im.height):Math.max(w/im.width,h/im.height);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.drawImage(im,x+(w-im.width*s)/2,y+(h-im.height*s)/2,im.width*s,im.height*s);c.restore();}
export async function renderDesign(canvas,d,{scale=1,guides=false,selection=null}={}){
 await document.fonts.ready;const [w,h]=d.dimensions;canvas.width=w*scale;canvas.height=h*scale;const c=canvas.getContext('2d');c.scale(scale,scale);
 c.fillStyle=d.background.color||'#f4eee1';c.fillRect(0,0,w,h);
 if(d.background.gradient){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,d.background.color);g.addColorStop(1,d.background.gradient);c.fillStyle=g;c.fillRect(0,0,w,h);}
 if(d.background.asset)cover(c,await loadImage(d.background.asset),0,0,w,h);
 const bounds=[];
 for(const l of d.layers){
  if(l.hidden)continue;c.save();c.globalAlpha=l.opacity??1;const x=l.x*w,y=l.y*h,bw=(l.width||.8)*w,bh=(l.height||.15)*h;
  c.fillStyle=l.color||'#123f35';c.strokeStyle=l.borderColor||l.color||'#123f35';c.lineWidth=l.border||0;
  if(l.shadow){c.shadowColor='#00000055';c.shadowBlur=15;c.shadowOffsetY=5;}
  let box={id:l.id,x:x-bw/2,y:y-bh/2,w:bw,h:bh};
  if(['image','logo','decoration'].includes(l.type)){
   if(l.src)cover(c,await loadImage(l.src),box.x,box.y,bw,bh,l.type==='decoration'?'contain':l.fit||'cover');
  }else if(l.type==='qr'){
   if(!globalThis.ZyadQR)throw Error('مكتبة QR غير جاهزة');const qr=document.createElement('canvas');await globalThis.ZyadQR.toCanvas(qr,l.text,{width:Math.round(bw),margin:2,errorCorrectionLevel:'M'});c.drawImage(qr,box.x,box.y,bw,bw);box.h=bw;
  }else if(l.type==='shape'){
   c.beginPath();if(l.shape==='circle')c.ellipse(x,y,bw/2,bh/2,0,0,Math.PI*2);else c.roundRect(box.x,box.y,bw,bh,16);c.fill();if(l.border)c.stroke();
  }else{
   c.direction='rtl';c.textBaseline='middle';c.textAlign=l.align||'center';let size=l.size*Math.min(w/1080,h/1350);const text=layerText(l,d),words=text.split(/\s+/);let lines=[];
   const wrap=()=>{lines=[];let line='';c.font=`${l.weight||700} ${size}px ${l.font==='serif'?'Georgia,serif':font}`;for(const word of words){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>bw){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);};
   wrap();while((lines.length>4||lines.length*size*(l.lineHeight||1.6)>h*.18||lines.some(s=>c.measureText(s).width>bw))&&size>14){size-=2;wrap();}
   const lineHeight=size*(l.lineHeight||1.6),th=Math.max(size,lines.length*lineHeight),tx=l.align==='right'?x+bw/2:l.align==='left'?x-bw/2:x;
   lines.forEach((s,i)=>c.fillText(s,tx,y+(i-(lines.length-1)/2)*lineHeight,bw));box={id:l.id,x:x-bw/2,y:y-th/2,w:bw,h:th};
  }
  bounds.push(box);c.restore();
 }
 if(guides){c.save();c.strokeStyle='#ffffff88';c.setLineDash([12,12]);c.lineWidth=2;for(const y of [.12,.88]){c.beginPath();c.moveTo(0,y*h);c.lineTo(w,y*h);c.stroke();}c.restore();}
 const b=bounds.find(b=>b.id===selection);if(b){c.save();c.strokeStyle='#42b696';c.lineWidth=3;c.strokeRect(b.x,b.y,b.w,b.h);c.fillStyle='#fff';c.fillRect(b.x+b.w-9,b.y+b.h-9,18,18);c.restore();}
 return bounds;
}
export async function exportImage(d,format='png',scale=1){if(!['png','jpeg','webp'].includes(format))throw Error('صيغة غير مدعومة');if(![1,2].includes(scale))throw Error('دقة غير مدعومة');const c=document.createElement('canvas');await renderDesign(c,d,{scale});const mime='image/'+format;const b=await new Promise(r=>c.toBlob(r,mime,.94));if(!b||b.type!==mime)throw Error('المتصفح لا يدعم الصيغة، اختر PNG');return new File([b],`zyad-${d.date}.${format}`,{type:mime});}
export function download(file){const u=URL.createObjectURL(file),a=document.createElement('a');a.href=u;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
export async function importImage(file){if(!file||file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('اختر PNG أو JPEG أو WebP بحجم لا يتجاوز 5 ميغابايت');const data=await new Promise((r,j)=>{const f=new FileReader();f.onload=()=>r(f.result);f.onerror=j;f.readAsDataURL(file);});const im=await loadImage(data);if(im.width*im.height>25000000)throw Error('الصورة كبيرة جدًا؛ قلّل أبعادها');return data;}
