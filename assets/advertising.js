/* One banner image for Saudi Calendar posters. All uploads are stored as
   compact data: URLs in the published configuration; no external image host. */
export const BANNER_SIZE=Object.freeze({width:2000,height:400,ratio:5});
export const DEFAULT_BANNER='assets/advertising/default.svg';
export const DEFAULT_AD=Object.freeze({enabled:true,image:DEFAULT_BANNER,fit:'contain',kind:'image'});
const SAFE=/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i;
const PATH=/^assets\/advertising\/[\w.-]+\.(?:png|jpe?g|webp|svg)$/i;
export const validBannerSource=src=>typeof src==='string'&&src.length<=750000&&(SAFE.test(src)||PATH.test(src));
const images=new Map();
export function bannerPath(config){
 if(config?.advertising?.enabled===false)return null;
 const choice=config?.advertising?.image;
 return validBannerSource(choice)?choice:DEFAULT_BANNER;
}
export function hasBanner(config){return !!bannerPath(config);}
export async function bannerForPoster(config){
 const path=bannerPath(config);if(!path)return null;
 try{return await loadBanner(path);}
 catch(error){
  if(path===DEFAULT_BANNER)throw error;
  console.warn('تعذر تحميل الإعلان المخصص، سيتم عرض الإعلان الافتراضي.',error);
  return loadBanner(DEFAULT_BANNER);
 }
}
export async function loadBanner(src){
 if(!validBannerSource(src))return null;
 if(images.has(src))return images.get(src);
 const p=new Promise((resolve,reject)=>{
  const img=new Image();img.decoding='async';
  img.onload=()=>resolve(img);img.onerror=()=>{images.delete(src);reject(Error('تعذر تحميل صورة الإعلان'));};
  img.src=src.startsWith('assets/')?new URL('../'+src,import.meta.url).href:src;
 });images.set(src,p);if(images.size>5)images.delete(images.keys().next().value);
 return p;
}
let publicConfigPromise;
export async function publicBannerSource(){
 if(!publicConfigPromise){
  publicConfigPromise=fetch(new URL('../data/config.json',import.meta.url),{cache:'no-store'})
   .then(r=>{if(!r.ok)throw Error('تعذر قراءة إعداد الإعلان');return r.json();})
   .then(cfg=>bannerPath(cfg))
   .catch(()=>DEFAULT_BANNER);
 }
 return publicConfigPromise;
}
export async function bannerForDesign(design){
 if(design.advertising?.enabled===false)return null;
 const own=design.advertising?.image;
 const path=validBannerSource(own)?own:await publicBannerSource();
 if(!path)return null;
 try{return await loadBanner(path);}
 catch(error){
  if(path===DEFAULT_BANNER)throw error;
  console.warn('تعذر تحميل الإعلان المخصص، سيتم استخدام الافتراضي.',error);
  return loadBanner(DEFAULT_BANNER);
 }
}
export async function prepareBanner(file){
 if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024)
   throw Error('اختر PNG أو JPG أو WebP بحجم لا يتجاوز 8 ميغابايت');
 const im=await createImageBitmap(file);
 try{
  if(im.width<200||im.height<40||im.width*im.height>30000000)throw Error('الصورة غير مناسبة؛ استخدم إعلانًا أفقيًا واضحًا');
  const canvas=document.createElement('canvas');canvas.width=2000;canvas.height=400;
  const c=canvas.getContext('2d'),factor=Math.min(2000/im.width,400/im.height),w=im.width*factor,h=im.height*factor;
  c.clearRect(0,0,2000,400);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(im,(2000-w)/2,(400-h)/2,w,h);
  for(const quality of [.86,.76,.66,.56,.46]){
   const data=canvas.toDataURL('image/webp',quality);
   if(data.length<=650000)return {src:data,originalWidth:im.width,originalHeight:im.height,width:2000,height:400};
  }
  throw Error('الإعلان يحوي تفاصيل كثيرة؛ استخدم صورة أبسط أو WebP بحجم أصغر');
 }finally{im.close?.();}
}
/** Fallback for an older administration API without asset-upload support.
 * Stored WebP stays below the legacy GitHub JSON publishing size limit. */
export async function compactBanner(data,maxChars=92000){
 if(!validBannerSource(data))throw Error('صورة الإعلان غير صالحة');
 const img=await loadBanner(data);
 for(const width of [2000,1600,1400,1200,1000,800]){
  const c=document.createElement('canvas');c.width=width;c.height=width/5;
  const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,width,width/5);
  for(const quality of [.76,.64,.52,.42,.32,.23]){
   const result=c.toDataURL('image/webp',quality);
   if(result.startsWith('data:image/webp;base64,')&&result.length<=maxChars)return result;
  }
 }
 throw Error('تعذر ضغط صورة الإعلان؛ جرّب صورة أبسط أو بصيغة WebP.');
}
function contain(c,img,x,y,w,h){
 const k=Math.min(w/img.naturalWidth,h/img.naturalHeight),cw=img.naturalWidth*k,ch=img.naturalHeight*k;
 c.save();c.beginPath();c.roundRect(x,y,w,h,10);c.clip();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 c.drawImage(img,x+(w-cw)/2,y+(h-ch)/2,cw,ch);c.restore();
}
export function drawCalendarAdvertisement(c,cfg,banner,{kind='calendar'}={}){
 if(cfg.advertising?.enabled===false||!banner)return;
 const rect=kind==='heritage'?[136,1540,808,162]:kind==='premium'?[271,1655,752,150]:kind==='list'?[221,1716,793,159]:[227,1690,793,159];
 contain(c,banner,...rect);
}
export function drawFreeformAdvertisement(c,design,banner){
 if(design.advertising?.enabled===false||!banner)return;
 const [w,h]=design.dimensions, maxWidth=w*.84,maxHeight=h*.145;
 const bw=Math.min(maxWidth,maxHeight*5),bh=bw/5;
 const left=(w-bw)/2,top=h-bh-Math.max(25,h*.026);
 contain(c,banner,left,top,bw,bh);
}
