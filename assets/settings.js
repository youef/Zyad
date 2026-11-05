import {applyAppearance,toast} from './common.js';
import {getAll,get,put,validateDesign,validImage} from './storage.js';
import {download} from './engine.js';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}};
const s=document.getElementById('appearance');
s.value=localStorage.getItem('zyad-appearance')||'system';
s.onchange=()=>{localStorage.setItem('zyad-appearance',s.value);applyAppearance();};
const panel=document.querySelector('.settings-panel');
for(const [key,label,options]of [
 ['zyad-start-view','عند فتح التطبيق',[['','حسب اختيار الإدارة'],['today-app','اليوم والمواعيد'],['smart-planner','التقويم'],['template-gallery','مكتبة التصاميم']]],
 ['zyad-default-filter','المواعيد التي تظهر أولًا',[['','حسب اختيار الإدارة'],['all','كل المواعيد'],['wallet','الاستحقاقات'],['favorites','المفضلة'],['personal','أحداثي']]],
 ['zyad-template-mode','اختيار تصميم البطاقة',[['auto','تصميم مختلف كل يوم'],['manual','الاحتفاظ بالقالب الذي اخترته']]]
]){
 const wrap=document.createElement('label');wrap.textContent=label;const select=document.createElement('select');
 for(const [value,title]of options){const option=document.createElement('option');option.value=value;option.textContent=title;select.append(option);}
 select.value=localStorage.getItem(key)||options[0][0];select.onchange=()=>{select.value?localStorage.setItem(key,select.value):localStorage.removeItem(key);toast('حُفظ اختيارك لهذا الجهاز');};wrap.append(select);panel.insertBefore(wrap,s.parentElement.nextSibling);
}
document.getElementById('backup').onclick=async()=>{try{
 const personal={events:read('zyad-custom-events',[]),favorites:read('zyad-event-favorites',[]),preferences:Object.fromEntries(['zyad-appearance','zyad-start-view','zyad-default-filter','zyad-template-mode','zyad-public-template'].map(k=>[k,localStorage.getItem(k)]))};
 const backup={version:3,designs:await getAll(),assets:await getAll('assets'),settings:await getAll('settings'),personal};
 download(new File([JSON.stringify(backup)],'zyad-library-backup.json',{type:'application/json'}));toast('صُدّرت التصاميم والمواعيد الشخصية والمفضلة والإعدادات');
}catch(e){toast(e.message);}};
document.getElementById('restore').onchange=async e=>{try{
 const file=e.target.files[0];if(file.size>50*1024*1024)throw Error('النسخة كبيرة جدًا');const data=JSON.parse(await file.text());
 if(![2,3].includes(data.version)||!Array.isArray(data.designs)||data.designs.length>500||!Array.isArray(data.assets)||data.assets.length>500)throw Error('نسخة غير صالحة');
 const validated=data.designs.map(validateDesign);for(const asset of data.assets)if(!validImage(asset.src))throw Error('صورة غير صالحة في النسخة');
 const personal=data.personal||{},events=personal.events||[],favorites=personal.favorites||[];
 if(!Array.isArray(events)||events.length>100||events.some(x=>!x||typeof x.id!=='string'||typeof x.label!=='string'||x.label.length>100||!['date','monthly','hijri'].includes(x.mode)))throw Error('المواعيد الشخصية غير صالحة');
 if(!Array.isArray(favorites)||favorites.length>1000||favorites.some(id=>typeof id!=='string'||id.length>100))throw Error('مفضلة غير صالحة');
 for(const design of validated){design.id=crypto.randomUUID();await put(design);}for(const asset of data.assets)await put({...asset,id:crypto.randomUUID()},'assets');
 const libraryFavorites=data.settings?.find(x=>x.id==='favorites');if(libraryFavorites&&Array.isArray(libraryFavorites.ids)){const old=await get('favorites','settings');await put({id:'favorites',ids:[...new Set([...(old?.ids||[]),...libraryFavorites.ids.filter(id=>typeof id==='string'&&/^[\w-]+$/.test(id))])]},'settings');}
 const merged=new Map(read('zyad-custom-events',[]).map(x=>[x.id,x]));for(const event of events)if(!merged.has(event.id)&&merged.size<100)merged.set(event.id,{...event,custom:true,enabled:true});
 localStorage.setItem('zyad-custom-events',JSON.stringify([...merged.values()]));localStorage.setItem('zyad-event-favorites',JSON.stringify([...new Set([...read('zyad-event-favorites',[]),...favorites])]));
 const allowed={'zyad-appearance':['system','light','dark'],'zyad-start-view':['today-app','smart-planner','template-gallery'],'zyad-default-filter':['all','wallet','favorites','personal'],'zyad-template-mode':['auto','manual']};
 for(const [key,values]of Object.entries(allowed)){const value=personal.preferences?.[key];if(values.includes(value))localStorage.setItem(key,value);}s.value=localStorage.getItem('zyad-appearance')||'system';applyAppearance();toast('استُعيدت التصاميم والمواعيد والمفضلة؛ لم تُحذف بياناتك الحالية');
}catch(e){toast(e.message);}};
