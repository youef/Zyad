/* Produce a transparent, tightly cropped brand mark, then app icons.
   Preserve the source file as uploaded. Browser canvas does the actual alpha matting. */
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=await readFile(resolve(root,'assets/branding/logo.png'));
if(source.length<200||source.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Official logo source must be a PNG');
const original='data:image/png;base64,'+source.toString('base64');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 const result=await page.evaluate(async src=>{
  const image=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Logo decoding failed'));im.src=src;});
  const w=image.naturalWidth,h=image.naturalHeight,total=w*h;if(total>32000000)throw Error('Logo exceeds pixel safety limit');
  const originalCanvas=document.createElement('canvas');originalCanvas.width=w;originalCanvas.height=h;
  const ctx=originalCanvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,w,h),a=pixels.data,visited=new Uint8Array(total),queue=new Int32Array(total);
  let head=0,tail=0,removed=0;
  const candidate=i=>{const k=i*4;if(a[k+3]<65)return false;const r=a[k],g=a[k+1],b=a[k+2];return Math.min(r,g,b)>=221 && Math.max(r,g,b)-Math.min(r,g,b)<=37;};
  function push(i){if(i<0||i>=total||visited[i])return;visited[i]=1;if(candidate(i))queue[tail++]=i;}
  for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}
  for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
  while(head<tail){
    const i=queue[head++];a[i*4+3]=0;removed++;
    const x=i%w,y=(i-x)/w;
    if(x>0)push(i-1);if(x<w-1)push(i+1);if(y>0)push(i-w);if(y<h-1)push(i+w);
  }
  // Some backgrounds are enclosed by a colored rectangle; remove near-white
  // fields only when edge-connected removal did not expose transparency.
  if(removed<total*.007){
    for(let i=0;i<total;i++)if(candidate(i)){a[i*4+3]=0;removed++;}
  }
  let xmin=w,ymin=h,xmax=0,ymax=0,visible=0,trans=0;
  for(let i=0;i<total;i++){
    if(a[i*4+3]<20){trans++;continue;}
    const x=i%w,y=(i-x)/w;
    xmin=Math.min(xmin,x);ymin=Math.min(ymin,y);xmax=Math.max(xmax,x);ymax=Math.max(ymax,y);visible++;
  }
  if(visible<total*.001)throw Error('Background removal erased the brand');
  ctx.putImageData(pixels,0,0);
  const cropW=xmax-xmin+1,cropH=ymax-ymin+1;
  const pad=Math.ceil(Math.max(cropW,cropH)*.035);
  const out=document.createElement('canvas');out.width=cropW+pad*2;out.height=cropH+pad*2;
  out.getContext('2d').drawImage(originalCanvas,xmin,ymin,cropW,cropH,pad,pad,cropW,cropH);
  return {sourceWidth:w,sourceHeight:h,width:out.width,height:out.height,removed,transparent:trans,base64:out.toDataURL('image/png').split(',')[1]};
 },original);
 const dest=resolve(root,'assets/branding/logo-transparent.png');
 await writeFile(dest,Buffer.from(result.base64,'base64'));
 console.log('Transparent official logo '+result.sourceWidth+'x'+result.sourceHeight+' → '+result.width+'x'+result.height+'; removed '+result.removed+' white pixels');
 const prepared='data:image/png;base64,'+result.base64;
 for(const size of [180,192,512]){
  const base64=await page.evaluate(async ({src,size})=>{
   const image=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Logo decode failed'));im.src=src;});
   const c=document.createElement('canvas');c.width=size;c.height=size;
   const p=c.getContext('2d');const unit=size/512;
   p.fillStyle='#f1f4f1';p.fillRect(0,0,size,size);
   // A modern app-icon surface—not a second rectangular backing to the mark.
   const sizeW=size*.77,sizeH=size*.72,ratio=Math.min(sizeW/image.naturalWidth,sizeH/image.naturalHeight);
   const dw=image.naturalWidth*ratio,dh=image.naturalHeight*ratio;
   p.imageSmoothingEnabled=true;p.imageSmoothingQuality='high';
   p.drawImage(image,(size-dw)/2,(size-dh)/2,dw,dh);
   return c.toDataURL('image/png').split(',')[1];
  },{src:prepared,size});
  await writeFile(resolve(root,'assets/app-'+size+'.png'),Buffer.from(base64,'base64'));
  console.log('Brand icon '+size+'x'+size);
 }
}finally{await browser.close();}
