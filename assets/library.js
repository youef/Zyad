import {getAll,get,saveDesign,put} from './storage.js';
import {renderDesign,exportImage,download} from './engine.js';
import {templates,createDesign} from './catalog.js';
import {toast} from './common.js';
import {copyLegacyDrafts} from './migration.js';
await copyLegacyDrafts();
let tab='التصاميم';const grid=document.getElementById('library-grid');
const node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e;};
async function show(){grid.replaceChildren();let rows=await getAll();if(tab==='المفضلة'){const ids=(await get('favorites','settings'))?.ids||[];rows=templates.filter(t=>ids.includes(t.id)).map(t=>createDesign(t.id));}else if(tab==='الصور')rows=await getAll('assets');else rows=rows.filter(d=>tab==='الأرشيف'?d.status==='archived':tab==='سلة المحذوفات'?d.status==='trash':tab==='المسودات'?d.status==='draft':!['archived','trash'].includes(d.status));rows.sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
 for(const d of rows){const card=node('article','','design-card'),art=node('div','','art');if(tab==='الصور'){const img=node('img');img.src=d.src;img.alt=d.name;art.append(img);card.append(art,node('h3',d.name));grid.append(card);continue;}const c=node('canvas');art.append(c);card.append(art,node('h3',d.name),node('p',(d.updatedAt?new Date(d.updatedAt).toLocaleDateString('ar-SA'):'قالب مفضل')+' · '+d.dimensions.join('×')));const actions=node('div','','button-row');const open=node('a','فتح وتعديل','button primary');open.href=tab==='المفضلة'?'../studio/?template='+d.templateId:'../studio/?design='+d.id;actions.append(open);
 const button=(title,fn)=>{const b=node('button',title);b.onclick=async()=>{b.disabled=true;try{await fn();}catch(e){toast(e.message);}finally{b.disabled=false;}};actions.append(b);};button('تنزيل',async()=>download(await exportImage(d)));button('تكرار',async()=>{await saveDesign({...d,id:crypto.randomUUID(),name:d.name+' — نسخة',status:'draft'});await show();});card.append(actions);
 const states=node('div','','button-row');if(tab!=='المفضلة')for(const [title,status]of [['أرشفة','archived'],['استعادة','draft'],['إلى السلة','trash']]){if(status===d.status||(!['archived','trash'].includes(d.status)&&status==='draft'))continue;const b=node('button',title);b.onclick=async()=>{try{await saveDesign({...d,status});await show();toast('تم تحديث حالة التصميم');}catch(e){toast(e.message);}};states.append(b);}card.append(states);grid.append(card);renderDesign(c,d).catch(e=>toast(e.message));}
 if(!rows.length)grid.append(node('p','لا توجد عناصر هنا بعد. ابدأ بقالب، واحفظ أول تصميم لك.','empty-message'));
}
for(const t of ['التصاميم','المسودات','المفضلة','الصور','الأرشيف','سلة المحذوفات']){const b=node('button',t,t===tab?'active':'');b.onclick=()=>{tab=t;document.querySelectorAll('#library-filters button').forEach(x=>x.classList.toggle('active',x===b));show();};document.getElementById('library-filters').append(b);}
show().catch(e=>toast(e.message));
