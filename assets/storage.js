import {validateCalendar} from './calendar-project.js';
const db=new Promise((resolve,reject)=>{const q=indexedDB.open('zyad-library',1);q.onupgradeneeded=()=>{for(const s of ['designs','assets','settings'])q.result.createObjectStore(s,{keyPath:'id'});};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
export async function access(store,mode,fn){const d=await db;return new Promise((resolve,reject)=>{const t=d.transaction(store,mode),q=fn(t.objectStore(store));t.oncomplete=()=>resolve(q.result);t.onabort=t.onerror=()=>reject(t.error||Error('تعذر الحفظ المحلي'));});}
export const getAll=(s='designs')=>access(s,'readonly',s=>s.getAll());
export const get=(id,s='designs')=>access(s,'readonly',s=>s.get(id));
export const put=(r,s='designs')=>access(s,'readwrite',s=>s.put(structuredClone(r)));
export function validImage(src){return typeof src==='string'&&src.length<8*1024*1024&&(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)||(/^assets\/(backgrounds|decorations)\/[\w-]+\.(png|webp)$/.test(src)||(src==='assets/branding/logo.png'||src==='assets/branding/logo-transparent.png')));}
export function validateDesign(d){
 if(d?.kind==='calendar'&&d.version===3){if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date||''))throw Error('تاريخ غير صالح');return {...structuredClone(d),dimensions:[1080,1920],config:validateCalendar(d.config)};}
 if(!d||d.version!==2||!Array.isArray(d.layers)||d.layers.length>100||!Array.isArray(d.dimensions)||![[1080,1920],[1080,1080],[1080,1350],[1920,1080]].some(a=>a.join()===d.dimensions.join()))throw Error('ملف المشروع غير صالح أو إصداره غير مدعوم');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date||''))throw Error('تاريخ غير صالح');
 const kinds=['text','image','shape','decoration','logo','gregorian','hijri','countdown','qr','watermark'];
 for(const l of d.layers){if(!kinds.includes(l.type)||!Number.isFinite(l.x)||!Number.isFinite(l.y)||l.x<0||l.x>1||l.y<0||l.y>1||!Number.isFinite(l.size??30)||(l.size??30)<8||(l.size??30)>300)throw Error('طبقة غير صالحة');if(l.text&&String(l.text).length>2000)throw Error('النص طويل جدًا');if(l.src&&!validImage(l.src))throw Error('مصدر صورة غير آمن');if(l.type==='qr'){const u=new URL(l.text);if(!['https:','http:'].includes(u.protocol))throw Error('رابط QR غير صالح');}}
 if(d.background?.asset&&!validImage(d.background.asset))throw Error('خلفية غير صالحة');
 if(d.advertising?.image&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d.advertising.image)||d.advertising.image.length>750000))throw Error('ملف الإعلان غير صالح');
 return structuredClone(d);
}
export async function saveDesign(d){d.updatedAt=new Date().toISOString();await put(d);return d;}
