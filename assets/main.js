import {CARD_PRESETS,validPreset,duplicateForPreset} from './templates.js?v=20261104r4';
import {mountPlanner} from './planner.js?v=pay2';
import {saToday,isoAdd,renderPoster,getPngBlob,downloadFile} from './card.js?v=glass20261110';
import {dailyTemplate} from './daily.js';
import {get,validateDesign} from './storage.js';
const $=sel=>document.querySelector(sel);
const canvas=$('#poster'),dateInput=$('#chosen-date'),status=$('#page-status');
let config=null,publishedConfig=null,activePreset='',renderId=0;
let automatic=localStorage.getItem('zyad-template-mode')!=='manual';
let galleryObserver=null,galleryRevision=0;
let gallerySearch='';
const favKey='zyad-visitor-template-favorites';
const readFavorites=()=>{try{return JSON.parse(localStorage.getItem(favKey)||'[]').filter(validPreset)}catch{return []}};
const isFavorite=id=>readFavorites().includes(id);
function favoriteTemplate(id){const set=new Set(readFavorites());if(set.has(id))set.delete(id);else set.add(id);try{localStorage.setItem(favKey,JSON.stringify([...set]));}catch{}document.querySelectorAll('.public-template-card').forEach(card=>{const button=card.querySelector('.visitor-template-fav');if(!button)return;const saved=set.has(card.dataset.preset);button.textContent=saved?'♥':'♡';button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',saved?'إزالة من المفضلة':'إضافة إلى المفضلة');});filterCalendarGallery();document.dispatchEvent(new CustomEvent('zyad-favorites-updated'));say(set.has(id)?'أُضيف التصميم إلى المفضلة':'أُزيل التصميم من المفضلة');}
window.addEventListener('hashchange',()=>{filterCalendarGallery();});

function filterCalendarGallery(){document.querySelectorAll('.public-template-card').forEach(card=>{const p=CARD_PRESETS.find(t=>t.id===card.dataset.preset);card.hidden=Boolean((location.hash==='#favorites'&&!isFavorite(p.id))||(gallerySearch&&!`${p.name} ${p.description} ${p.category}`.includes(gallerySearch)));});const empty=document.getElementById('visitor-gallery-empty');if(empty){empty.hidden=[...document.querySelectorAll('.public-template-card')].some(card=>!card.hidden);empty.textContent=location.hash==='#favorites'?'لم تضف تصاميم إلى المفضلة بعد. اختر القلب من معرض التصاميم.':'لا توجد تصاميم مطابقة للبحث.';}}
$('#calendar-search').addEventListener('input',e=>{gallerySearch=e.target.value.trim();filterCalendarGallery();});
const params=new URLSearchParams(location.search);
const selected=params.get('date');dateInput.value=/^\d{4}-\d{2}-\d{2}$/.test(selected||'')?selected:saToday();
$('#year').textContent=String(new Date().getFullYear());
function say(msg){status.textContent=msg;}
function quickDate(n){if(n!==30)return isoAdd(saToday(),n);const [y,m,d]=saToday().split('-').map(Number),a=new Date(Date.UTC(y,m,1)),last=new Date(Date.UTC(a.getUTCFullYear(),a.getUTCMonth()+1,0)).getUTCDate();a.setUTCDate(Math.min(d,last));return a.toISOString().slice(0,10);}function syncQuickDays(){document.querySelectorAll('[data-quick-day]').forEach(button=>{
 const target=quickDate(Number(button.dataset.quickDay));
 button.classList.toggle('active',dateInput.value===target);
 button.setAttribute('aria-pressed',String(dateInput.value===target));
});}
document.querySelectorAll('[data-quick-day]').forEach(button=>button.addEventListener('click',()=>{
 setDate(quickDate(Number(button.dataset.quickDay)));
}));
function activeConfig(preset){
 const id=validPreset(preset)?preset:publishedConfig.design?.preset||'royal';
 return id===(publishedConfig.design?.preset||'royal')?JSON.parse(JSON.stringify(publishedConfig)):duplicateForPreset(publishedConfig,id);
}
function updateUrl(){
 const url=new URL(location.href);
 if(dateInput.value===saToday())url.searchParams.delete('date');else url.searchParams.set('date',dateInput.value);
 if(automatic||activePreset===(publishedConfig.design?.preset||'royal'))url.searchParams.delete('template');else url.searchParams.set('template',activePreset);
 history.replaceState(null,'',url.pathname+url.search+url.hash);
}
async function exportPreset(id){
 const snapshot=activeConfig(id),cv=document.createElement('canvas'),iso=dateInput.value;
 await renderPoster(cv,snapshot,iso);
 downloadFile('calendar-'+iso+'-'+id+'.png',await getPngBlob(cv));
 say('تم تنزيل بطاقة '+CARD_PRESETS.find(x=>x.id===id).name+'.');
}
function renderGallery(){
 const revision=++galleryRevision;galleryObserver?.disconnect();
 const grid=$('#public-template-grid');if(!grid)return;grid.replaceChildren();
 // Static WebP previews load immediately. Only missing previews are rendered on demand.
 const queue=[];let working=false;
 async function processQueue(){
  if(working)return;working=true;
  while(queue.length&&revision===galleryRevision){
   const card=queue.shift();
   if(!card?.isConnected||card.hidden||card.dataset.previewState==='ready')continue;
   const image=card.querySelector('img');
   if(image.complete&&image.naturalWidth){card.dataset.previewState='ready';continue;}
   try{
    const art=card.querySelector('.public-template-art');
    await renderPoster(art,activeConfig(card.dataset.preset),dateInput.value,{preview:true,scale:.35});
    if(revision!==galleryRevision)break;
    art.hidden=false;image.hidden=true;card.querySelector('.public-template-fallback').hidden=true;
    card.querySelector('.preview-date').textContent='معاينة البطاقة';
    card.dataset.previewState='ready';
   }catch(error){
    card.querySelector('.preview-date').textContent='معاينة بديلة متاحة';
    card.dataset.previewState='fallback';
   }
   // Return control to Safari between expensive canvas renders.
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  working=false;
 }
 galleryObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   const card=entry.target;galleryObserver.unobserve(card);
   if(card.dataset.previewState==='ready')continue;
   const image=card.querySelector('img');
   if(image.complete&&!image.naturalWidth){queue.push(card);void processQueue();}
   else if(image.complete&&image.naturalWidth){card.dataset.previewState='ready';}
   else{
    image.addEventListener('error',()=>{if(revision===galleryRevision){queue.push(card);void processQueue();}},{once:true});
   }
  }
 },{rootMargin:'120px'});
 for(const preset of CARD_PRESETS){
  const item=document.createElement('article');item.className='public-template-card';item.dataset.preset=preset.id;
  if(preset.id===activePreset)item.classList.add('active');
  const select=document.createElement('button');select.type='button';select.className='public-template-select';
  select.setAttribute('aria-pressed',String(preset.id===activePreset));select.setAttribute('aria-label','عرض '+preset.name);
  const img=document.createElement('img');img.src='images/templates/'+preset.id+'.webp';img.loading='lazy';img.alt='بطاقة قالب '+preset.name;
  img.addEventListener('error',()=>{img.hidden=true;});
  const fallback=document.createElement('span');fallback.className='public-template-fallback '+preset.id;fallback.style.setProperty('--template-primary',preset.theme?.green||'#0a5947');fallback.style.setProperty('--template-gold',preset.theme?.gold||'#b99355');fallback.innerHTML='<span class="visitor-preview-emblem">'+preset.symbol+'</span><span class="visitor-preview-brand">رزنامة السعودية</span><span class="visitor-preview-date">بطاقة اليوم</span><span class="visitor-preview-ornament">✦ ❖ ✦</span>';
  img.addEventListener('load',()=>{fallback.hidden=true;item.dataset.previewState='ready';});const art=document.createElement('canvas');art.className='public-template-art';art.width=540;art.height=960;art.hidden=true;art.setAttribute('aria-label','معاينة '+preset.name+' بتاريخ '+dateInput.value);
  const heading=document.createElement('strong');heading.textContent=preset.name;
  const desc=document.createElement('small');desc.textContent=preset.description;
  const previewDate=document.createElement('small');previewDate.className='preview-date';previewDate.textContent='جارٍ تجهيز تاريخ '+dateInput.value;
  select.append(img,fallback,art,heading,desc,previewDate);
  select.onclick=async()=>{automatic=false;activePreset=preset.id;try{localStorage.setItem('zyad-public-template',activePreset);localStorage.setItem('zyad-template-mode','manual');}catch{}config=activeConfig(activePreset);updateUrl();grid.querySelectorAll('.public-template-card').forEach(node=>{const yes=node.dataset.preset===activePreset;node.classList.toggle('active',yes);node.querySelector('.public-template-select').setAttribute('aria-pressed',String(yes));});await refresh();say('تم اختيار تصميم '+preset.name+'، يمكنك عرضه وحفظه من بطاقة اليوم.');};
  const actions=document.createElement('div');actions.className='visitor-template-actions';const favorite=document.createElement('button');favorite.className='visitor-template-fav';favorite.type='button';favorite.textContent=isFavorite(preset.id)?'♥':'♡';favorite.setAttribute('aria-label',isFavorite(preset.id)?'إزالة من المفضلة':'إضافة إلى المفضلة');favorite.setAttribute('aria-pressed',String(isFavorite(preset.id)));favorite.onclick=()=>favoriteTemplate(preset.id);const download=document.createElement('button');download.className='public-template-download';download.type='button';download.textContent='حفظ الصورة ↓';
  download.onclick=async()=>{download.disabled=true;download.textContent='جارٍ التوليد...';try{await exportPreset(preset.id);}catch(e){say('فشل التوليد: '+e.message);}finally{download.disabled=false;download.textContent='تنزيل هذا التصميم';}};
  actions.append(download,favorite);item.append(select,actions);grid.append(item);galleryObserver.observe(item);
 }
 const empty=document.createElement('p');empty.id='visitor-gallery-empty';empty.className='visitor-gallery-empty';empty.hidden=true;grid.append(empty);filterCalendarGallery();
}
async function refresh(){
 if(!config)return;const id=++renderId;syncQuickDays();say('جارٍ توليد البطاقة...');
 try{
  const temp=document.createElement('canvas'),snapshot=JSON.parse(JSON.stringify(config));
  await renderPoster(temp,snapshot,dateInput.value,{preview:true,scale:.65});
  if(id!==renderId)return;
  canvas.width=temp.width;canvas.height=temp.height;canvas.getContext('2d').drawImage(temp,0,0);
  mountPlanner(config,dateInput.value);
  window.dispatchEvent(new CustomEvent('zyad-calendar-updated',{detail:{config:JSON.parse(JSON.stringify(config)),date:dateInput.value,automatic}}));
  say('بطاقة '+CARD_PRESETS.find(x=>x.id===activePreset)?.name+' جاهزة للتنزيل والمشاركة.');
 }catch(e){console.error(e);say('تعذر عرض البطاقة: '+e.message);}
}
function setDate(v){dateInput.value=v;if(automatic&&(publishedConfig.design?.autoRotate||publishedConfig.smartRules?.some(r=>r.enabled!==false))){activePreset=dailyTemplate(publishedConfig,v,CARD_PRESETS);config=activeConfig(activePreset);}updateUrl();renderGallery();refresh();}
$('#prev').addEventListener('click',()=>setDate(isoAdd(dateInput.value,-1)));
$('#next').addEventListener('click',()=>setDate(isoAdd(dateInput.value,1)));
$('#today').addEventListener('click',()=>setDate(saToday()));
dateInput.addEventListener('change',()=>{if(dateInput.value)setDate(dateInput.value);});
function exportAction(id,action){$(id).addEventListener('click',async()=>{const button=$(id);if(button.disabled||!config)return;button.disabled=true;const snapshot=JSON.parse(JSON.stringify(config)),iso=dateInput.value,preset=activePreset;try{await action(snapshot,iso,preset);}catch(e){if(e.name!=='AbortError')say('تعذر تجهيز البطاقة: '+e.message);}finally{button.disabled=false;}});}
exportAction('#download',async(snapshot,iso,preset)=>{const c=document.createElement('canvas');await renderPoster(c,snapshot,iso);downloadFile(`calendar-${iso}-${preset}.png`,await getPngBlob(c));say('تم تجهيز الصورة للتنزيل.');});
exportAction('#download-4k',async(snapshot,iso,preset)=>{const c=document.createElement('canvas');await renderPoster(c,snapshot,iso,{scale:2});downloadFile(`calendar-${iso}-${preset}-4k.png`,await getPngBlob(c));say('تم تجهيز الصورة بالدقة المضاعفة 2160 × 3840.');});
exportAction('#share',async(snapshot,iso,preset)=>{const c=document.createElement('canvas');await renderPoster(c,snapshot,iso);const file=new File([await getPngBlob(c)],`calendar-${iso}-${preset}.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:snapshot.brand?.name||'بطاقتي الذكية'});}else{downloadFile(file.name,file);say('تم تنزيل صورة البطاقة؛ مشاركة الملفات غير متاحة على هذا الجهاز.');}});
window.zyadVisitorFavorites={read:readFavorites,toggle:favoriteTemplate};window.zyadCalendar={getConfig:()=>config?JSON.parse(JSON.stringify(config)):null,getDate:()=>dateInput.value,setDate,automatic:()=>automatic,rotate:()=>{automatic=true;localStorage.setItem('zyad-template-mode','auto');setDate(dateInput.value);}};
async function loadArchive(){try{const r=await fetch('data/history.json?nocache='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('not found');const list=await r.json();const grid=$('#archive-grid');if(!Array.isArray(list)||!list.length)return;grid.replaceChildren();for(const rec of list.slice(0,24)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(rec.date)||!/^images\/[\w.-]+\.png$/.test(rec.path))continue;
  const a=document.createElement('a');a.className='archive-item';a.href=rec.path;a.download=`calendar-${rec.date}.png`;const img=document.createElement('img');img.src=rec.path;img.alt='بطاقة يوم '+rec.date;img.loading='lazy';const caption=document.createElement('span');caption.textContent=rec.date+'  ↓';a.append(img,caption);grid.append(a);
}}catch(e){console.warn('No archived card yet',e);}}
window.__posterReady=(async()=>{try{const r=await fetch('data/config.json?nocache='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('فشل تحميل إعدادات البطاقة');publishedConfig=await r.json();if(params.get('project')){const project=validateDesign(await get(params.get('project')));if(project.kind==='calendar'){publishedConfig=project.config;dateInput.value=/^\d{4}-\d{2}-\d{2}$/.test(selected||'')?selected:project.date;automatic=false;}}const requested=new URLSearchParams(location.search).get('template');let saved='';try{saved=localStorage.getItem('zyad-public-template')||'';}catch{}if(validPreset(requested))automatic=false;activePreset=validPreset(requested)?requested:automatic&&(publishedConfig.design?.autoRotate||publishedConfig.smartRules?.some(r=>r.enabled!==false))?dailyTemplate(publishedConfig,dateInput.value,CARD_PRESETS):params.has('project')?(publishedConfig.design?.preset||'royal'):validPreset(saved)?saved:(publishedConfig.design?.preset||'royal');config=activeConfig(activePreset);renderGallery();$('#brand-title').textContent=config.brand?.name||'بطاقتي اليومية';$('#footer-brand').textContent=config.brand?.name||'بطاقتي اليومية';document.title=(config.brand?.name||'بطاقتي اليومية')+' | التقويم والمواعيد';await refresh();await loadArchive();return true;}catch(e){console.error(e);say(e.message);return false;}})();

const connectionNote = $('#connection-note');
function showConnection() {
 connectionNote.hidden = navigator.onLine;
}
window.addEventListener('online', showConnection);
window.addEventListener('offline', showConnection);
showConnection();
if ('serviceWorker' in navigator) {
 window.addEventListener('load', () => {
  navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Offline setup failed', error));
 });
}
