import {mountPlanner} from './planner.js';
import {saToday,isoAdd,renderPoster,getPngBlob,downloadFile} from './card.js';
const $=sel=>document.querySelector(sel);
const canvas=$('#poster'),dateInput=$('#chosen-date'),status=$('#page-status');
let config=null,renderId=0;
const params=new URLSearchParams(location.search);
const selected=params.get('date');dateInput.value=/^\d{4}-\d{2}-\d{2}$/.test(selected||'')?selected:saToday();
$('#year').textContent=String(new Date().getFullYear());
function say(msg){status.textContent=msg;}
async function refresh(){if(!config)return;const id=++renderId;try{await renderPoster(canvas,config,dateInput.value);mountPlanner(config,dateInput.value);if(id===renderId)say('البطاقة جاهزة للتنزيل والمشاركة.');}catch(e){console.error(e);say('تعذر عرض البطاقة. جرّب تحديث الصفحة.');}}
function setDate(v){dateInput.value=v;history.replaceState(null,'',location.pathname+(v===saToday()?'':`?date=${v}`)+location.hash);refresh();}
$('#prev').addEventListener('click',()=>setDate(isoAdd(dateInput.value,-1)));
$('#next').addEventListener('click',()=>setDate(isoAdd(dateInput.value,1)));
$('#today').addEventListener('click',()=>setDate(saToday()));
dateInput.addEventListener('change',()=>{if(dateInput.value)setDate(dateInput.value);});
$('#download').addEventListener('click',async()=>{try{const blob=await getPngBlob(canvas);downloadFile(`calendar-${dateInput.value}.png`,blob);say('تم تجهيز الصورة للتنزيل.');}catch(e){say(e.message);}});
$('#share').addEventListener('click',async()=>{try{const blob=await getPngBlob(canvas);const file=new File([blob],`calendar-${dateInput.value}.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:config.brand?.name||'بطاقتي اليومية'});}else if(navigator.share){await navigator.share({title:config.brand?.name||'بطاقتي اليومية',url:location.href});}else{await navigator.clipboard.writeText(location.href);say('تم نسخ رابط البطاقة.');}}catch(e){if(e.name!=='AbortError')say('المشاركة غير متاحة على هذا المتصفح، استخدم تنزيل PNG.');}});
async function loadArchive(){try{const r=await fetch('data/history.json?nocache='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('not found');const list=await r.json();const grid=$('#archive-grid');if(!Array.isArray(list)||!list.length)return;grid.replaceChildren();for(const rec of list.slice(0,24)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(rec.date)||!/^images\/[\w.-]+\.png$/.test(rec.path))continue;
  const a=document.createElement('a');a.className='archive-item';a.href=rec.path;a.download=`calendar-${rec.date}.png`;const img=document.createElement('img');img.src=rec.path;img.alt='بطاقة يوم '+rec.date;img.loading='lazy';const caption=document.createElement('span');caption.textContent=rec.date+'  ↓';a.append(img,caption);grid.append(a);
}}catch(e){console.warn('No archived card yet',e);}}
window.__posterReady=(async()=>{try{const r=await fetch('data/config.json?nocache='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('فشل تحميل إعدادات البطاقة');config=await r.json();$('#brand-title').textContent=config.brand?.name||'بطاقتي اليومية';$('#footer-brand').textContent=config.brand?.name||'بطاقتي اليومية';document.title=(config.brand?.name||'بطاقتي اليومية')+' | التقويم والمواعيد';await refresh();await loadArchive();return true;}catch(e){console.error(e);say(e.message);return false;}})();
