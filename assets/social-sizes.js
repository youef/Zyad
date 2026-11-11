/* Social media output presets. Never crop a calendar, text or advertisement. */
export const SOCIAL_SIZES=Object.freeze([
 {id:'whatsapp',name:'ستوري واتساب',width:1080,height:1920},
 {id:'snapchat',name:'ستوري سناب',width:1080,height:1920},
 {id:'instagram-story',name:'ستوري إنستقرام',width:1080,height:1920},
 {id:'instagram-post',name:'بوستر إنستقرام',width:1080,height:1350},
 {id:'instagram-square',name:'إنستقرام مربع',width:1080,height:1080},
 {id:'instagram-landscape',name:'إنستقرام أفقي',width:1080,height:566},
 {id:'tiktok',name:'تيك توك',width:1080,height:1920},
 {id:'reels',name:'ريلز',width:1080,height:1920},
 {id:'youtube-short',name:'يوتيوب شورتس',width:1080,height:1920},
 {id:'facebook',name:'منشور فيسبوك',width:1200,height:630},
 {id:'x-post',name:'منشور X',width:1600,height:900},
 {id:'pinterest',name:'بنترست',width:1000,height:1500},
 {id:'poster',name:'بوستر عمودي',width:1414,height:2000}
]);
export const getSocialSize=id=>SOCIAL_SIZES.find(x=>x.id===id)||SOCIAL_SIZES[0];
export function adaptPoster(source,preset,{quality=1}={}){
 const {width,height}=getSocialSize(preset);
 const output=document.createElement('canvas');output.width=width*quality;output.height=height*quality;
 const ctx=output.getContext('2d',{alpha:false});ctx.scale(quality,quality);
 const W=width,H=height,ratio=source.width/source.height;
 const gradient=ctx.createLinearGradient(0,0,W,H);
 gradient.addColorStop(0,'#fdf9f1');gradient.addColorStop(1,'#e8f0eb');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
 const frame=Math.max(8,Math.min(W,H)*.016);
 const availableW=W-frame*2,availableH=H-frame*2;
 const scale=Math.min(availableW/source.width,availableH/source.height);
 const w=source.width*scale,h=source.height*scale,x=(W-w)/2,y=(H-h)/2;
 ctx.save();ctx.shadowColor='#193c3527';ctx.shadowBlur=Math.min(22,W*.02);ctx.shadowOffsetY=6;
 ctx.fillStyle='#fff';ctx.fillRect(x,y,w,h);ctx.restore();
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(source,x,y,w,h);
 return output;
}
export function exportBlob(canvas,format='png'){
 const mime={png:'image/png',jpeg:'image/jpeg',webp:'image/webp'}[format]||'image/png';
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('تعذر تصدير الصورة')),mime,.94));
}
export function socialControls(){
 const wrap=document.createElement('div');wrap.className='social-export-controls';
 const label=document.createElement('strong');label.textContent='مقاس البطاقة للسوشال ميديا';
 const size=document.createElement('select');size.id='social-output-size';size.setAttribute('aria-label','مقاس البطاقة');
 SOCIAL_SIZES.forEach(p=>{const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name+' · '+p.width+'×'+p.height;size.append(opt);});
 const format=document.createElement('select');format.id='social-output-format';format.setAttribute('aria-label','صيغة الصورة');
 [['png','PNG'],['jpeg','JPEG'],['webp','WebP']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;format.append(o);});
 const dimensions=document.createElement('small');dimensions.className='social-export-dimensions';
 try{const saved=localStorage.getItem('zyad-social-size');if(SOCIAL_SIZES.some(x=>x.id===saved))size.value=saved;}catch{}
 const update=()=>{const p=getSocialSize(size.value);dimensions.textContent=p.width+' × '+p.height+' بكسل · بدون قص النصوص أو الإعلان';try{localStorage.setItem('zyad-social-size',size.value);}catch{}document.dispatchEvent(new CustomEvent('zyad-social-size-change'));};
 size.addEventListener('change',update);wrap.append(label,size,format,dimensions);update();return wrap;
}
