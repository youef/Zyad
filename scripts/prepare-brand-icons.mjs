/* Generate installable app icons from the user's official PNG without distortion. */
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {chromium} from 'playwright';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const logo=await readFile(resolve(root,'assets/branding/logo.png'));
if(logo.length<200||logo.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Official logo PNG is missing or invalid');
const url='data:image/png;base64,'+logo.toString('base64');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 for(const size of [180,192,512]){
  const b64=await page.evaluate(async ({url,size})=>{
   const img=await new Promise((ok,fail)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>fail(Error('Could not load official logo'));im.src=url;});
   const c=document.createElement('canvas');c.width=c.height=size;
   const p=c.getContext('2d');const unit=size/512;
   p.fillStyle='#073f34';p.fillRect(0,0,size,size);
   const x=40*unit,y=40*unit,w=size-80*unit,h=w,r=104*unit;
   p.beginPath();p.roundRect(x,y,w,h,r);p.fillStyle='#fffaf0';p.fill();
   p.lineWidth=9*unit;p.strokeStyle='#c7a05b';p.stroke();
   p.strokeStyle='rgba(5,72,53,.17)';p.lineWidth=3*unit;
   p.beginPath();p.roundRect(x+16*unit,y+16*unit,w-32*unit,h-32*unit,r-14*unit);p.stroke();
   const maxW=356*unit,maxH=298*unit;
   const scale=Math.min(maxW/img.naturalWidth,maxH/img.naturalHeight);
   const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;
   p.imageSmoothingEnabled=true;p.imageSmoothingQuality='high';
   p.drawImage(img,(size-iw)/2,(size-ih)/2,iw,ih);
   return c.toDataURL('image/png').split(',')[1];
  },{url,size});
  await writeFile(resolve(root,'assets/app-'+size+'.png'),Buffer.from(b64,'base64'));
  console.log('Official brand icon: '+size+'×'+size);
 }
}finally{await browser.close();}
