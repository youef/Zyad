import {templates,createDesign} from './catalog.js';
import {put,get,getAll,saveDesign} from './storage.js';
import {exportImage,download,renderDesign} from './engine.js';
import {toast} from './common.js';
import {saToday} from './card.js';
const root=new URL('../',import.meta.url),link=(path)=>new URL(path,root).href;
const grid=document.getElementById('smart-template-grid');let search='',category='الكل';
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
async function action(button,fn){button.disabled=true;try{await fn();}catch(e){toast(e.message);}finally{button.disabled=false;}}
const favorite=async id=>{const r=await get('favorites','settings')||{id:'favorites',ids:[]};r.ids=r.ids.includes(id)?r.ids.filter(x=>x!==id):[...r.ids,id];await put(r,'settings');return r.ids.includes(id);};
async function preview(id){const dialog=node('dialog'),close=node('button','إغلاق'),canvas=node('canvas'),use=node('a','تخصيص هذا التصميم','button primary');close.onclick=()=>{dialog.close();dialog.remove();};use.href=link('studio/?template='+id);dialog.append(close,canvas,use);document.body.append(dialog);dialog.showModal();await renderDesign(canvas,createDesign(id,saToday()));}
export async function mountGallery(){if(!grid)return;grid.replaceChildren();const fav=(await get('favorites','settings'))?.ids||[];
 let items=templates.filter(t=>(category==='الكل'||category===t.category||category==='المفضلة'&&fav.includes(t.id))&&(!search||(t.name+' '+t.category+' '+t.description).includes(search)));if(grid.dataset.limit)items=items.slice(0,Number(grid.dataset.limit));
 for(const t of items){const article=node('article','','design-card'),art=node('a','','art');art.href=link('studio/?template='+t.id);const img=node('img');img.src=link('images/catalog/'+t.id+'.webp');img.alt=t.name;img.loading='lazy';art.append(img);const heart=node('button',fav.includes(t.id)?'♥':'♡','favorite-button');heart.setAttribute('aria-label','إضافة '+t.name+' للمفضلة');heart.setAttribute('aria-pressed',String(fav.includes(t.id)));heart.onclick=()=>action(heart,async()=>{const v=await favorite(t.id);heart.textContent=v?'♥':'♡';heart.setAttribute('aria-pressed',String(v));toast(v?'أُضيف إلى المفضلة':'أُزيل من المفضلة');});const row=node('div','','button-row'),row2=node('div','','button-row');const use=node('a','استخدام','button primary');use.href=art.href;const custom=node('a','تخصيص','button');custom.href=art.href;const view=node('button','معاينة');view.onclick=()=>action(view,()=>preview(t.id));const save=node('button','حفظ نسخة');save.onclick=()=>action(save,async()=>{await saveDesign(createDesign(t.id,saToday()));toast('حُفظت نسخة في مكتبتي');});const dl=node('button','↓ تنزيل');dl.onclick=()=>action(dl,async()=>{download(await exportImage(createDesign(t.id,saToday())));toast('اكتمل تجهيز الصورة');});row.append(use,view,custom);row2.append(save,dl);article.append(art,heart,node('h3',t.name),node('p',t.category+' / '+t.description),row,row2);grid.append(article);}
 if(!items.length)grid.append(node('p','لا توجد قوالب مطابقة. جرّب بحثًا آخر.','empty-message'));
}
if(document.getElementById('template-search'))document.getElementById('template-search').oninput=e=>{search=e.target.value;mountGallery();};
const filters=document.getElementById('template-filters');if(filters)for(const c of ['الكل','المفضلة',...new Set(templates.map(t=>t.category))]){const b=node('button',c,c==='الكل'?'active':'');b.onclick=()=>{category=c;filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));mountGallery();};filters.append(b);}
mountGallery().catch(e=>toast(e.message));
