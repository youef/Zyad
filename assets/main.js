import {SOCIAL_SIZES,getSocialSize,adaptPoster,exportBlob,socialControls} from './social-sizes.js?v=1';
import {presetName,presetDescription,translate,getLanguage} from './locale.js?v=i18n4';
import {CARD_PRESETS,validPreset,duplicateForPreset} from './templates.js?v=social3';
import {mountPlanner} from './planner.js?v=calendar-ui1';
import {saToday,isoAdd,renderPoster,getPngBlob,downloadFile} from './card.js?v=social3';
import {dailyTemplate} from './daily.js?v=i18n4';
import {get,validateDesign} from './storage.js';
const $=sel=>document.querySelector(sel);
const canvas=$('#poster'),dateInput=$('#chosen-date'),status=$('#page-status');
const socialPanel=socialControls();
document.querySelector('#poster-section .action-buttons')?.before(socialPanel);
const socialSize=()=>document.getElementById('social-output-size')?.value||'whatsapp';
const socialFormat=()=>document.getElementById('social-output-format')?.value||'png';
async function socialCanvas(cfg,date,quality=1){
 const original=document.createElement('canvas');
 await renderPoster(original,cfg,date,{scale:quality===2?2:1});
 return adaptPoster(original,socialSize(),{quality});
}
async function socialDownload(cfg,date,preset,quality=1){
 const output=await socialCanvas(cfg,date,quality),format=socialFormat();
 downloadFile('calendar-'+date+'-'+preset+'-'+socialSize()+(quality>1?'-HD':'')+'.'+format,await exportBlob(output,format));
}
document.addEventListener('zyad-social-size-change',()=>{if(config){renderGallery();void refresh();}});

let config=null,publishedConfig=null,activePreset='',renderId=0;
let automatic=localStorage.getItem('zyad-template-mode')!=='manual';
let galleryObserver=null,galleryRevision=0;
let gallerySearch='',galleryCategory='الكل',gallerySort='default';
const favKey='zyad-visitor-template-favorites';
const readFavorites=()=>{try{const value=JSON.parse(localStorage.getItem(favKey)||'[]');return Array.isArray(value)?value.filter(validPreset):[]}catch{return []}};
const isFavorite=id=>readFavorites().includes(id);
const categories=['الكل',...new Set(CARD_PRESETS.map(p=>p.category||'تصاميم متنوعة'))];
function setupGalleryControls(){
 const root=$('#gallery-categories');
 if(!root)return;
 root.replaceChildren();
 for(const category of categories){
  const button=document.createElement('button');
  button.type='button';button.textContent=category==='الكل'?'الكل · '+CARD_PRESETS.length:category+' · '+CARD_PRESETS.filter(p=>(p.category||'تصاميم متنوعة')===category).length;button.dataset.category=category;
  button.className='gallery-category-chip'+(galleryCategory===category?' active':'');
  button.setAttribute('aria-pressed',String(galleryCategory===category));
  button.onclick=()=>{
   galleryCategory=category;
   root.querySelectorAll('button').forEach(node=>{const yes=node.dataset.category===category;node.classList.toggle('active',yes);node.setAttribute('aria-pressed',String(yes));});
   filterCalendarGallery();
  };
  root.append(button);
 }
 $('#gallery-total-count').textContent=String(CARD_PRESETS.length);
}
function favoriteTemplate(id){
 const set=new Set(readFavorites());
 if(set.has(id))set.delete(id);else set.add(id);
 try{localStorage.setItem(favKey,JSON.stringify([...set]));}catch{}
 document.querySelectorAll('.public-template-card').forEach(card=>{
  const button=card.querySelector('.visitor-template-fav');if(!button)return;
  const saved=set.has(card.dataset.preset);button.textContent=saved?'♥':'♡';
  button.setAttribute('aria-pressed',String(saved));
  button.setAttribute('aria-label',saved?'إزالة من المفضلة':'إضافة إلى المفضلة');
 });
 filterCalendarGallery();say(set.has(id)?'أُضيف التصميم إلى المفضلة':'أُزيل التصميم من المفضلة');
}
function filterCalendarGallery(){
 const favoriteMode=location.hash==='#favorites';
 const cards=[...document.querySelectorAll('.public-template-card')];
 const favoriteIds=readFavorites(),fav=new Set(favoriteIds);
 let visible=0;
 for(const card of cards){
  const p=CARD_PRESETS.find(t=>t.id===card.dataset.preset);
  if(!p)continue;
  const q=gallerySearch.toLocaleLowerCase('ar');
  const text=`${p.name} ${presetName(p)} ${p.description} ${presetDescription(p)} ${p.category||''}`.toLocaleLowerCase('ar');
  const show=(!favoriteMode||fav.has(p.id))&&(galleryCategory==='الكل'||(p.category||'تصاميم متنوعة')===galleryCategory)&&(!q||text.includes(q));
  card.hidden=!show;if(show)visible++;
 }
 const rank=card=>{
  const p=CARD_PRESETS.find(t=>t.id===card.dataset.preset);
  if(gallerySort==='name')return p?.name||'';
  return fav.has(card.dataset.preset)?'0':'1';
 };
 const grid=$('#public-template-grid');
 if(grid&&gallerySort!=='default'){
  const sorted=cards.slice().sort((a,b)=>gallerySort==='name'?rank(a).localeCompare(rank(b),'ar'):rank(a).localeCompare(rank(b))||CARD_PRESETS.findIndex(p=>p.id===a.dataset.preset)-CARD_PRESETS.findIndex(p=>p.id===b.dataset.preset));
  for(const card of sorted)grid.append(card);
 }else if(grid){
  for(const p of CARD_PRESETS){const card=cards.find(c=>c.dataset.preset===p.id);if(card)grid.append(card);}
 }
 const empty=$('#visitor-gallery-empty');
 if(empty){
  empty.hidden=visible>0;
  empty.textContent=favoriteMode&&!fav.size?'لا توجد تصاميم مفضلة بعد. اضغط على القلب في معرض التصاميم لحفظها.':'لا توجد تصاميم مطابقة. جرّب تصنيفًا أو كلمة بحث أخرى.';
 }
 const count=$('#gallery-visible-count');if(count)count.textContent=visible+' تصميم';
 const title=$('#template-gallery .gallery-head h2');if(title)title.textContent=favoriteMode?'المفضلة':'اختر بطاقتك';
 const label=$('#visitor-favorites-description');if(label)label.hidden=!favoriteMode;
 const selected=CARD_PRESETS.find(p=>p.id===activePreset);const selectedName=$('#gallery-selected-name');if(selectedName)selectedName.textContent=selected?.name||'بطاقة اليوم';const selectedCategory=$('#gallery-selected-category');if(selectedCategory)selectedCategory.textContent=selected?.category||'تصميم يومي';
}
setupGalleryControls();
$('#calendar-search').addEventListener('input',e=>{gallerySearch=e.target.value.trim();filterCalendarGallery();});
$('#gallery-sort')?.addEventListener('change',e=>{gallerySort=e.target.value;filterCalendarGallery();});
window.addEventListener('hashchange',filterCalendarGallery);
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
 await socialDownload(snapshot,iso,id);
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
   if(image.complete&&image.naturalWidth){image.classList.add('is-loaded');card.dataset.previewState='ready';continue;}
   try{
    const art=card.querySelector('.public-template-art');
    const temp=document.createElement('canvas');await renderPoster(temp,activeConfig(card.dataset.preset),dateInput.value,{preview:true,scale:.35});const adapted=adaptPoster(temp,socialSize());art.width=adapted.width;art.height=adapted.height;art.getContext('2d').drawImage(adapted,0,0);
    if(revision!==galleryRevision)break;
    art.hidden=false;image.classList.remove('is-loaded');image.classList.add('is-error');card.querySelector('.public-template-fallback').hidden=true;
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
   else if(image.complete&&image.naturalWidth){image.classList.add('is-loaded');card.dataset.previewState='ready';}
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
  const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.className='gallery-template-image';img.alt='بطاقة قالب '+preset.name;
  img.addEventListener('error',()=>{img.classList.remove('is-loaded');img.classList.add('is-error');previewDate.textContent='جارٍ تجهيز معاينة البطاقة';});
  const fallback=document.createElement('span');fallback.className='public-template-fallback '+preset.id;fallback.style.setProperty('--template-primary',preset.theme?.green||'#0a5947');fallback.style.setProperty('--template-gold',preset.theme?.gold||'#b99355');fallback.innerHTML='<span class="visitor-preview-emblem">'+preset.symbol+'</span><span class="visitor-preview-brand">'+translate('أوان السعودية')+'</span><span class="visitor-preview-date">'+translate('بطاقة اليوم')+'</span><span class="visitor-preview-ornament">✦ ❖ ✦</span>';
  img.addEventListener('load',()=>{img.classList.add('is-loaded');img.classList.remove('is-error');fallback.hidden=true;item.dataset.previewState='ready';previewDate.textContent='جاهز للعرض';});const art=document.createElement('canvas');art.className='public-template-art';art.width=540;art.height=960;art.hidden=true;art.setAttribute('aria-label','معاينة '+preset.name+' بتاريخ '+dateInput.value);
  const badge=document.createElement('span');badge.className='gallery-card-badge';badge.textContent=translate(preset.category||'تصميم');
  const chosen=document.createElement('span');chosen.className='gallery-card-chosen';chosen.textContent='✓ المختار';
  const heading=document.createElement('strong');heading.textContent=presetName(preset);
  const desc=document.createElement('small');desc.textContent=presetDescription(preset);
  const previewDate=document.createElement('small');previewDate.className='preview-date';previewDate.textContent='معاينة التصميم';img.src='images/templates/'+preset.id+'.webp';
  const frame=document.createElement('span');frame.className='gallery-card-frame';frame.append(img,fallback,art,badge,chosen);select.append(frame,heading,desc,previewDate);
  select.onclick=async()=>{automatic=false;activePreset=preset.id;try{localStorage.setItem('zyad-public-template',activePreset);localStorage.setItem('zyad-template-mode','manual');}catch{}config=activeConfig(activePreset);updateUrl();grid.querySelectorAll('.public-template-card').forEach(node=>{const yes=node.dataset.preset===activePreset;node.classList.toggle('active',yes);node.querySelector('.public-template-select').setAttribute('aria-pressed',String(yes));});filterCalendarGallery();await refresh();say('تم اختيار تصميم '+preset.name+'، يمكنك عرضه وحفظه من بطاقة اليوم.');};
  const actions=document.createElement('div');actions.className='visitor-template-actions';const favorite=document.createElement('button');favorite.className='visitor-template-fav';favorite.type='button';favorite.textContent=isFavorite(preset.id)?'♥':'♡';favorite.setAttribute('aria-label',isFavorite(preset.id)?'إزالة من المفضلة':'إضافة إلى المفضلة');favorite.setAttribute('aria-pressed',String(isFavorite(preset.id)));favorite.onclick=()=>favoriteTemplate(preset.id);const download=document.createElement('button');download.className='public-template-download';download.type='button';download.textContent='حفظ الصورة ↓';
  download.onclick=async()=>{download.disabled=true;download.textContent='جارٍ الحفظ…';try{await exportPreset(preset.id);}catch(e){say('تعذر حفظ التصميم: '+e.message);}finally{download.disabled=false;download.textContent='حفظ الصورة ↓';}};
  actions.append(download,favorite);item.append(select,actions);grid.append(item);galleryObserver.observe(item);
 }
 const empty=document.createElement('p');empty.id='visitor-gallery-empty';empty.className='visitor-gallery-empty';empty.hidden=true;grid.append(empty);filterCalendarGallery();
}
async function refresh(){
 if(!config)return;const id=++renderId;syncQuickDays();say('جارٍ توليد البطاقة...');
 try{
  const temp=document.createElement('canvas'),snapshot=JSON.parse(JSON.stringify(config));
  await renderPoster(temp,snapshot,dateInput.value,{displayScale:.65});const socialPreview=adaptPoster(temp,socialSize());
  if(id!==renderId)return;
  canvas.width=socialPreview.width;canvas.height=socialPreview.height;canvas.getContext('2d').drawImage(socialPreview,0,0);
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
exportAction('#download',async(snapshot,iso,preset)=>{await socialDownload(snapshot,iso,preset);say('تم تجهيز الصورة بالتنسيق والمقاس المختار.');});
exportAction('#download-4k',async(snapshot,iso,preset)=>{await socialDownload(snapshot,iso,preset,2);say('تم تجهيز الصورة بجودة عالية حسب المقاس المختار.');});
exportAction('#share',async(snapshot,iso,preset)=>{const c=await socialCanvas(snapshot,iso),format=socialFormat(),file=new File([await exportBlob(c,format)],`calendar-${iso}-${preset}-${socialSize()}.${format}`,{type:format==='jpeg'?'image/jpeg':'image/'+format});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:snapshot.brand?.name||'أوان السعودية'});}else{downloadFile(file.name,file);say('تم تنزيل صورة البطاقة؛ مشاركة الملفات غير متاحة على هذا الجهاز.');}});
function updateLanguageBrand(){
 const brand=getLanguage()==='en'?(config?.brand?.nameEn||'Awan Saudi'):(config?.brand?.name?.trim()||'أوان السعودية');
 const b=document.querySelector('#brand-title'),f=document.querySelector('#footer-brand');
 if(b)b.textContent=brand;if(f)f.textContent=brand;
 document.title=brand+' | '+(getLanguage()==='en'?'Calendar & Events':'التقويم والمواعيد');
}
window.addEventListener('zyad-language-change',()=>{if(!config)return;updateLanguageBrand();renderGallery();void refresh();});
window.zyadVisitorFavorites={read:readFavorites,toggle:favoriteTemplate};window.zyadCalendar={getConfig:()=>config?JSON.parse(JSON.stringify(config)):null,getDate:()=>dateInput.value,setDate,automatic:()=>automatic,rotate:()=>{automatic=true;localStorage.setItem('zyad-template-mode','auto');setDate(dateInput.value);}};
async function loadArchive(){try{const r=await fetch('data/history.json?nocache='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('not found');const list=await r.json();const grid=$('#archive-grid');if(!Array.isArray(list)||!list.length)return;grid.replaceChildren();for(const rec of list.slice(0,24)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(rec.date)||!/^images\/[\w.-]+\.png$/.test(rec.path))continue;
  const a=document.createElement('a');a.className='archive-item';a.href=rec.path;a.download=`calendar-${rec.date}.png`;const img=document.createElement('img');img.src=rec.path;img.alt='بطاقة يوم '+rec.date;img.loading='lazy';const caption=document.createElement('span');caption.textContent=rec.date+'  ↓';a.append(img,caption);grid.append(a);
}}catch(e){console.warn('No archived card yet',e);}}
window.__posterReady=(async()=>{try{const r=await fetch('data/config.json?nocache='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('فشل تحميل إعدادات البطاقة');publishedConfig=await r.json();if(params.get('project')){const project=validateDesign(await get(params.get('project')));if(project.kind==='calendar'){publishedConfig=project.config;dateInput.value=/^\d{4}-\d{2}-\d{2}$/.test(selected||'')?selected:project.date;automatic=false;}}const requested=new URLSearchParams(location.search).get('template');let saved='';try{saved=localStorage.getItem('zyad-public-template')||'';}catch{}if(validPreset(requested))automatic=false;activePreset=validPreset(requested)?requested:automatic&&(publishedConfig.design?.autoRotate||publishedConfig.smartRules?.some(r=>r.enabled!==false))?dailyTemplate(publishedConfig,dateInput.value,CARD_PRESETS):params.has('project')?(publishedConfig.design?.preset||'royal'):validPreset(saved)?saved:(publishedConfig.design?.preset||'royal');config=activeConfig(activePreset);renderGallery();updateLanguageBrand();await refresh();await loadArchive();return true;}catch(e){console.error(e);say(e.message);return false;}})();

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
