const el = id => document.getElementById(id);
const canvas = el('card');
const ctx = canvas.getContext('2d');
const themes = [
 ['تقويم سعودي','#064b43','#f7d693'],['ملكي','#142e25','#ffce76'],
 ['إسلامي','#2f2054','#ffe6a7'],['عصري','#f4eadb','#173b36'],
 ['ليلي','#10152b','#cfdafa'],['صحراء','#793f28','#fff1c9'],
 ['اليوم الوطني','#096342','#ffffff'],['رمضان','#22294b','#ffdb83'],
 ['العيد','#f7e0a4','#40272b'],['الجمعة','#1f4d60','#fff2ce'],
 ['حكمة','#e7d3c1','#352833'],['مواعيد الصرف','#263e54','#f4e8c5'],
 ['مدرستي','#183e76','#ffffff'],['مناسبة اجتماعية','#633450','#ffe4df'],
 ['إعلان','#272727','#f6e179'],['تهنئة','#633822','#f9deaa'],
 ['شتاء','#173344','#d7f1ff'],['صيف','#fff0b0','#603619'],
 ['عد تنازلي','#391e31','#ffccd6'],['ستوري','#23343a','#a8f2d4']
];
const day = new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{dateStyle:'full',timeZone:'Asia/Riyadh'});
const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{dateStyle:'long',timeZone:'Asia/Riyadh'});
const makeLayer = (text,y,size,color) => ({text,x:.5,y,size,color});
function makeDesign(index, dimensions = [1080,1920]) {
 const [name,background,color] = themes[index];
 return {version:1,index,dimensions,background,layers:[
  makeLayer(name,.38,94,color),makeLayer(day.format(),.53,55,color),
  makeLayer(hijri.format(),.63,48,color)
 ]};
}
let design = makeDesign(0);
let selected = 0;
let past = [], future = [];
function option(select,value,label) { select.add(new Option(label,value)); }
themes.forEach(([name],index) => option(el('template'),index,name));
function paint() {
 const [w,h] = design.dimensions;
 if(canvas.width !== w || canvas.height !== h) {canvas.width=w;canvas.height=h;}
 ctx.fillStyle=design.background;
 ctx.fillRect(0,0,w,h);
 ctx.strokeStyle=themes[design.index][2];
 ctx.lineWidth=3;
 const inset=w*.06;
 ctx.strokeRect(inset,h*.13,w-2*inset,h*.74);
 ctx.beginPath();
 const radius=Math.min(w,h)*(.08+design.index%5*.02);
 if(design.index%2) ctx.arc(w/2,h*.24,radius,0,2*Math.PI);
 else ctx.rect(w/2-radius,h*.24-radius,radius*2,radius*2);
 ctx.stroke();
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';
 for(const layer of design.layers) {
  ctx.fillStyle=layer.color;
  ctx.font='700 '+layer.size+'px system-ui';
  ctx.fillText(layer.text,w*layer.x,h*layer.y,w*.82);
 }
}
function sync() {
 el('template').value=design.index;
 el('size').value=design.dimensions.join(',');
 el('background').value=design.background;
 selected=Math.min(selected,design.layers.length-1);
 const layer=design.layers[selected];
 el('layers').replaceChildren();
 design.layers.forEach((item,i)=>option(el('layers'),i,item.text||'نص فارغ'));
 el('layers').value=selected;
 for(const [id,key] of [['label','text'],['color','color'],['font','size']]) {
  el(id).disabled=!layer;
  if(layer) el(id).value=layer[key];
 }
 el('remove').disabled=!layer;
 el('undo').disabled=!past.length;el('redo').disabled=!future.length;
 paint();
}
const snapshot=()=>JSON.stringify(design);
function remember() {past.push(snapshot());if(past.length>50)past.shift();future=[];}
function edit(action) {remember();action();sync();}
function restore(from,to) {if(!from.length)return;to.push(snapshot());design=JSON.parse(from.pop());sync();}
el('undo').onclick=()=>restore(past,future);
el('redo').onclick=()=>restore(future,past);
el('template').onchange=e=>edit(()=>{design=makeDesign(Number(e.target.value),design.dimensions);selected=0;});
el('size').onchange=e=>edit(()=>{design.dimensions=e.target.value.split(',').map(Number);});
el('background').onchange=e=>edit(()=>{design.background=e.target.value;});
el('layers').onchange=e=>{selected=Number(e.target.value);sync();};
for(const [id,key] of [['label','text'],['color','color'],['font','size']]) {
 el(id).onchange=e=>edit(()=>{design.layers[selected][key]=id==='font'?Number(e.target.value):e.target.value;});
}
el('add').onclick=()=>edit(()=>{design.layers.push(makeLayer('نص جديد',.73,56,themes[design.index][2]));selected=design.layers.length-1;});
el('remove').onclick=()=>edit(()=>{design.layers.splice(selected,1);selected=Math.max(0,selected-1);});
let drag=null;
function pointer(event) {
 const bounds=canvas.getBoundingClientRect();
 return {x:(event.clientX-bounds.left)/bounds.width,y:(event.clientY-bounds.top)/bounds.height};
}
canvas.onpointerdown=event=>{
 const p=pointer(event);
 const hit=design.layers.map((layer,index)=>({layer,index})).reverse().find(({layer})=>{
  ctx.font='700 '+layer.size+'px system-ui';
  const width=Math.min(ctx.measureText(layer.text).width,canvas.width*.82);
  return Math.abs(p.x-layer.x)<=width/(2*canvas.width)+.02 &&
   Math.abs(p.y-layer.y)<=layer.size/canvas.height;
 })?.index;
 if(hit===undefined)return;
 selected=hit;
 const layer=design.layers[hit];
 drag={id:event.pointerId,dx:layer.x-p.x,dy:layer.y-p.y,moved:false};
 canvas.setPointerCapture(event.pointerId);sync();
};
canvas.onpointermove=event=>{
 if(drag?.id!==event.pointerId)return;
 if(!drag.moved){remember();drag.moved=true;}
 const p=pointer(event);
 const layer=design.layers[selected];
 layer.x=Math.max(.12,Math.min(.88,p.x+drag.dx));
 layer.y=Math.max(.14,Math.min(.86,p.y+drag.dy));
 paint();
};
canvas.onlostpointercapture=()=>{drag=null;sync();};
const say=message=>{el('status').textContent=message;};
const db = new Promise((resolve,reject)=>{
 try{
  const request=indexedDB.open('zyad-studio',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('drafts',{keyPath:'id',autoIncrement:true});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 }catch(error){reject(error);}
});
async function access(mode,action) {
 const database=await db;
 return new Promise((resolve,reject)=>{
  const transaction=database.transaction('drafts',mode);
  const request=action(transaction.objectStore('drafts'));
  transaction.oncomplete=()=>resolve(request.result);
  transaction.onabort=()=>reject(transaction.error);
 });
}
async function refreshDrafts() {
 const rows=await access('readonly',store=>store.getAll());
 el('drafts').replaceChildren();
 rows.reverse().forEach(row=>option(el('drafts'),row.id,row.name+' · '+new Date(row.saved).toLocaleString('ar-SA')));
 el('open').disabled=!rows.length;
}
function run(id,action) {
 el(id).onclick=async()=>{
  el(id).disabled=true;
  try{await action();}catch(error){if(error.name!=='AbortError')say(error.message||'تعذّر إكمال العملية.');}
  finally{el(id).disabled=id==='open'&&!el('drafts').value;}
 };
}
run('save',async()=>{
 await access('readwrite',store=>store.add({name:design.layers[0]?.text||'بطاقة',saved:Date.now(),design}));
 await refreshDrafts();say('حُفظت نسخة على هذا الجهاز.');
});
run('open',async()=>{
 const row=await access('readonly',store=>store.get(Number(el('drafts').value)));
 if(!row)throw Error('المسودة غير متوفرة.');
 edit(()=>{design=row.design;selected=0;});say('فُتحت المسودة.');
});
async function imageFile() {
 const format=el('format').value;
 const mime='image/'+format;
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,mime,.94));
 if(!blob||blob.type!==mime)throw Error('هذه الصيغة غير متاحة. جرّب PNG.');
 return new File([blob],'zyad-card.'+format,{type:mime});
}
function download(file) {
 const url=URL.createObjectURL(file);
 const link=document.createElement('a');link.href=url;link.download=file.name;
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
 say('تم تجهيز الصورة للتنزيل.');
}
run('download',async()=>download(await imageFile()));
run('share',async()=>{
 const file=await imageFile();
 if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file]});
 else download(file);
});
sync();
refreshDrafts().catch(()=>{el('open').disabled=true;say('تعذّر الوصول إلى المسودات المحلية.');});
