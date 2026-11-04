import {CARD_PRESETS,validPreset,duplicateForPreset} from './templates.js';
import {mountPlanner} from './planner.js';
import {saToday,isoAdd,renderPoster,getPngBlob,downloadFile} from './card.js';
const $=sel=>document.querySelector(sel);
const canvas=$('#poster'),dateInput=$('#chosen-date'),status=$('#page-status');
let config=null,publishedConfig=null,activePreset='',renderId=0;
const params=new URLSearchParams(location.search);
const selected=params.get('date');dateInput.value=/^\d{4}-\d{2}-\d{2}$/.test(selected||'')?selected:saToday();
$('#year').textContent=String(new Date().getFullYear());
function say(msg){status.textContent=msg;}
function activeConfig(preset){
 const id=validPreset(preset)?preset:publishedConfig.design?.preset||'royal';
 return id===(publishedConfig.design?.preset||'royal')?JSON.parse(JSON.stringify(publishedConfig)):duplicateForPreset(publishedConfig,id);
}
function updateUrl(){
 const url=new URL(location.href);
 if(dateInput.value===saToday())url.searchParams.delete('date');else url.searchParams.set('date',dateInput.value);
 if(activePreset===(publishedConfig.design?.preset||'royal'))url.searchParams.delete('template');else url.searchParams.set('template',activePreset);
 history.replaceState(null,'',url.pathname+url.search+url.hash);
}
async function exportPreset(id){
 const snapshot=activeConfig(id),cv=document.createElement('canvas');
 await renderPoster(cv,snapshot,dateInput.value);
 downloadFile('calendar-'+dateInput.value+'-'+id+'.png',await getPngBlob(cv));
 say('تم تنزيل بطاقة '+CARD_PRESETS.find(x=>x.id===id).name+'.');
}
function renderGallery(){
 const grid=$('#public-template-grid');if(!grid)return;grid.replaceChildren();
 for(const preset of CARD_PRESETS){
  const item=document.createElement('article');item.className='public-template-card';item.dataset.preset=preset.id;
  if(preset.id===activePreset)item.classList.add('active');
  const select=document.createElement('button');select.type='button';select.className='public-template-select';
  select.setAttribute('aria-pressed',String(preset.id===activePreset));select.setAttribute('aria-label','عرض '+preset.name);
  const img=document.createElement('img');img.src='images/templates/'+preset.id+'.webp';img.loading='lazy';img.alt='بطاقة قالب '+preset.name;
  img.addEventListener('error',()=>{img.hidden=true;});
  const fallback=document.createElement('span');fallback.className='public-template-fallback '+preset.id;fallback.textContent=preset.symbol;
  const heading=document.createElement('strong');heading.textContent=preset.name;
  const desc=document.createElement('small');desc.textContent=preset.description;
  select.append(img,fallback,heading,desc);
  select.onclick=async()=>{activePreset=preset.id;localStorage.setItem('zyad-public-template',activePreset);config=activeConfig(activePreset);updateUrl();renderGallery();await refresh();};
  const download=document.createElement('button');download.className='public-template-download';download.type='button';download.textContent='تنزيل هذا التصميم';
  download.onclick=async()=>{download.disabled=true;download.textContent='جارٍ التوليد...';try{await exportPreset(preset.id);}catch(e){say('فشل التوليد: '+e.message);}finally{download.disabled=false;download.textContent='تنزيل هذا التصميم';}};
  item.append(select,download);grid.append(item);
 }
}
async function refresh(){
 if(!config)return;const id=++renderId;
 try{
  const temp=document.createElement('canvas'),snapshot=JSON.parse(JSON.stringify(config));
  await renderPoster(temp,snapshot,dateInput.value);
  if(id!==renderId)return;
  canvas.width=temp.width;canvas.height=temp.height;canvas.getContext('2d').drawImage(temp,0,0);
  mountPlanner(config,dateInput.value);
  say('بطاقة '+CARD_PRESETS.find(x=>x.id===activePreset)?.name+' جاهزة للتنزيل والمشاركة.');
 }catch(e){console.error(e);say('تعذر عرض البطاقة: '+e.message);}
}
function setDate(v){dateInput.value=v;updateUrl();refresh();}
$('#prev').addEventListener('click',()=>setDate(isoAdd(dateInput.value,-1)));
$('#next').addEventListener('click',()=>setDate(isoAdd(dateInput.value,1)));
$('#today').addEventListener('click',()=>setDate(saToday()));
dateInput.addEventListener('change',()=>{if(dateInput.value)setDate(dateInput.value);});
$('#download').addEventListener('click',async()=>{try{const blob=await getPngBlob(canvas);downloadFile(`calendar-${dateInput.value}-${activePreset}.png`,blob);say('تم تجهيز الصورة للتنزيل.');}catch(e){say(e.message);}});
$('#download-4k').addEventListener('click',async()=>{try{const big=document.createElement('canvas');await renderPoster(big,config,dateInput.value,{scale:2});const blob=await getPngBlob(big);downloadFile('calendar-'+dateInput.value+'-4k.png',blob);say('تم تجهيز صورة 4K بالدقة الأصلية.');}catch(e){say('تعذر تجهيز الصورة الكبيرة: '+e.message);}});
$('#share').addEventListener('click',async()=>{try{const blob=await getPngBlob(canvas);const file=new File([blob],`calendar-${dateInput.value}.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:config.brand?.name||'بطاقتي اليومية'});}else if(navigator.share){await navigator.share({title:config.brand?.name||'بطاقتي اليومية',url:location.href});}else{await navigator.clipboard.writeText(location.href);say('تم نسخ رابط البطاقة.');}}catch(e){if(e.name!=='AbortError')say('المشاركة غير متاحة على هذا المتصفح، استخدم تنزيل PNG.');}});
async function loadArchive(){try{const r=await fetch('data/history.json?nocache='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('not found');const list=await r.json();const grid=$('#archive-grid');if(!Array.isArray(list)||!list.length)return;grid.replaceChildren();for(const rec of list.slice(0,24)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(rec.date)||!/^images\/[\w.-]+\.png$/.test(rec.path))continue;
  const a=document.createElement('a');a.className='archive-item';a.href=rec.path;a.download=`calendar-${rec.date}.png`;const img=document.createElement('img');img.src=rec.path;img.alt='بطاقة يوم '+rec.date;img.loading='lazy';const caption=document.createElement('span');caption.textContent=rec.date+'  ↓';a.append(img,caption);grid.append(a);
}}catch(e){console.warn('No archived card yet',e);}}
window.__posterReady=(async()=>{try{const r=await fetch('data/config.json?nocache='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('فشل تحميل إعدادات البطاقة');publishedConfig=await r.json();const requested=new URLSearchParams(location.search).get('template');const saved=localStorage.getItem('zyad-public-template');activePreset=validPreset(requested)?requested:validPreset(saved)?saved:(publishedConfig.design?.preset||'royal');config=activeConfig(activePreset);renderGallery();$('#brand-title').textContent=config.brand?.name||'بطاقتي اليومية';$('#footer-brand').textContent=config.brand?.name||'بطاقتي اليومية';document.title=(config.brand?.name||'بطاقتي اليومية')+' | التقويم والمواعيد';await refresh();await loadArchive();return true;}catch(e){console.error(e);say(e.message);return false;}})();
