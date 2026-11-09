import {CARD_PRESETS,presetInfo,applyPreset,duplicateForPreset} from './templates.js?v=20261104r4';
import {prepareBanner,compactBanner} from './advertising.js?v=banner25';
import {saToday,renderPoster,cloneConfig,downloadFile,getPngBlob,updateDeep,currentValue} from './card.js?v=banner25';
const $=s=>document.querySelector(s);
const canvas=$('#poster'),dateField=$('#admin-date'),draftStatus=$('#draft-status'),pubStatus=$('#publish-status');
const REPO='youef/Zyad',CONFIG_PATH='data/config.json',DRAFT_KEY='zyad-card-draft-v4';
window.zyadAdmin={getConfig:()=>config,changed:()=>changed(),tab:name=>tab(name),refresh:()=>{syncFields();buildCounters();syncTemplate();changed();}};
let config=null,published=null,timer=0;
dateField.value=saToday();
const syncBanner=()=>{const image=config?.advertising?.image||'',preview=$('#admin-banner-preview'),status=$('#admin-banner-state');if(!preview)return;preview.hidden=!image;if(image)preview.src=image.startsWith('assets/')?'../'+image:image;else preview.removeAttribute('src');status.textContent=image?'صورة الإعلان جاهزة للمعاينة • احفظ وانشر ليشاهدها الجميع':'لم تُرفع صورة حتى الآن';};
const syncFields=()=>{document.querySelectorAll('[data-bind]').forEach(el=>{const value=currentValue(config,el.dataset.bind);if(el.type==='checkbox')el.checked=Boolean(value);else el.value=value??'';});syncBanner();};
const setStatus=(msg,good=true)=>{pubStatus.textContent=msg;pubStatus.style.color=good?'#126847':'#b05245';};
const setDirty=()=>{try{localStorage.setItem(DRAFT_KEY,JSON.stringify(config));draftStatus.textContent='مسودة محفوظة في هذا المتصفح • غير منشورة';}catch{draftStatus.textContent='تعديلات غير منشورة';}};
let previewSeq=0;
const syncPreview=()=>{
 clearTimeout(timer);const seq=++previewSeq;
 const label=$('#template-preview-state');if(label)label.textContent='جارٍ توليد المعاينة...';
 timer=setTimeout(async()=>{
  try{
    const temp=document.createElement('canvas'),snapshot=cloneConfig(config);
    await renderPoster(temp,snapshot,dateField.value,{rootPrefix:'../assets/',basePrefix:'../'});
    if(seq!==previewSeq)return;
    canvas.width=temp.width;canvas.height=temp.height;canvas.getContext('2d').drawImage(temp,0,0);
    if(label)label.textContent='المعاينة جاهزة: '+presetInfo(snapshot.design?.preset).name;
  }catch(err){console.error('Preview failed',err);if(label)label.textContent='تعذر تحديث المعاينة: '+err.message;}
 },80);
};
const changed=()=>{setDirty();syncPreview();};
function syncTemplate(){
 const active=presetInfo(config.design?.preset).id;
 document.querySelectorAll('[data-preset]').forEach(el=>{const yes=el.dataset.preset===active;el.classList.toggle('selected',yes);el.setAttribute('aria-pressed',String(yes));});
 const header=$('#selected-template-label');if(header)header.textContent='القالب النشط: '+presetInfo(active).name;
}
function initTemplates(){
 const grid=$('#admin-templates');
 const note=document.createElement('p');note.className='calendar-admin-note';note.textContent=`${CARD_PRESETS.length} قالب تقويم كامل — تظهر القوالب نفسها للمشاهدين في مكتبة التصاميم. اختيار القالب يغيّر البطاقة الفعلية والملف المصدّر.`;
 const search=document.createElement('label');search.className='field';search.textContent='البحث في قوالب التقويم';const input=document.createElement('input');input.type='search';input.placeholder='اسم القالب أو المناسبة';input.oninput=()=>{const q=input.value.trim();grid.querySelectorAll('.template-choice').forEach(button=>button.hidden=Boolean(q&&!button.textContent.includes(q)));};search.append(input);grid.before(note,search);
 const back=document.createElement('a');back.href='#admin-templates';back.className='btn secondary full calendar-back';back.textContent='عودة إلى قوالب التقويم ↑';$('.admin-preview').append(back);
 const reveal=()=>{if(matchMedia('(max-width:760px)').matches)$('.admin-preview').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});};
 for(const {id,name,description} of CARD_PRESETS){
  const button=document.createElement('button');
  button.type='button';button.className='template-choice';button.dataset.preset=id;
  const preview=document.createElement('canvas');
  preview.width=540;preview.height=960;preview.className='admin-template-art';
  preview.setAttribute('aria-hidden','true');
  const title=document.createElement('strong');title.textContent=name;
  const detail=document.createElement('small');detail.textContent=description;
  button.append(preview,title,detail);
  button.addEventListener('click',()=>{
   if(config.design?.preset===id){reveal();return;}
   applyPreset(config,id);syncFields();syncTemplate();changed();reveal();
  });
  grid.append(button);
 }
 syncTemplate();
 const restore=$('#reset-preset-palette');
 if(restore)restore.addEventListener('click',()=>{applyPreset(config,presetInfo(config.design?.preset).id);syncFields();syncTemplate();changed();});
 initNamedDesigns();
}
function redrawSavedDesigns(){
 const select=$('#saved-layouts');if(!select)return;
 const chosen=select.value;select.replaceChildren();
 const empty=document.createElement('option');empty.value='';empty.textContent='اختر تصميمًا محفوظًا...';select.append(empty);
 for(const item of config.savedDesigns||[]){
  const opt=document.createElement('option');opt.value=item.id;opt.textContent=item.name;select.append(opt);
 }
 if((config.savedDesigns||[]).some(item=>item.id===chosen))select.value=chosen;
}
function initNamedDesigns(){
 redrawSavedDesigns();
 $('#save-layout').addEventListener('click',()=>{
  const input=$('#layout-name'),name=input.value.trim().slice(0,60);
  if(!name){input.focus();return;}
  config.savedDesigns ||= [];
  if(config.savedDesigns.length>=12){alert('الحد الأقصى 12 تصميمًا محفوظًا. احذف واحدًا قبل الإضافة.');return;}
  const item={id:'layout-'+Date.now(),name,design:cloneConfig(config.design),theme:cloneConfig(config.theme)};
  config.savedDesigns.push(item);redrawSavedDesigns();$('#saved-layouts').value=item.id;input.value='';changed();
 });
 $('#load-layout').addEventListener('click',()=>{
  const item=(config.savedDesigns||[]).find(d=>d.id===$('#saved-layouts').value);if(!item)return;
  config.design=cloneConfig(item.design);config.theme=cloneConfig(item.theme);
  syncFields();syncTemplate();changed();
 });
 $('#delete-layout').addEventListener('click',()=>{
  const id=$('#saved-layouts').value;if(!id)return;
  config.savedDesigns=(config.savedDesigns||[]).filter(d=>d.id!==id);
  redrawSavedDesigns();changed();
 });
}
let galleryRevision=0;
async function renderGallery(){
 const revision=++galleryRevision, date=dateField.value, snapshot=cloneConfig(config);
 const work=document.createElement('canvas');
 for(const button of document.querySelectorAll('#admin-templates button')){
  try{
   await renderPoster(work,duplicateForPreset(snapshot,button.dataset.preset),date,{rootPrefix:'../assets/',basePrefix:'../',preview:true,scale:.5});
   if(revision!==galleryRevision)return;
   const thumb=button.querySelector('canvas');
   thumb.getContext('2d').drawImage(work,0,0,thumb.width,thumb.height);
  }catch(error){console.warn('Template thumbnail failed',error);}
 }
}
async function exportCard(scale){
 const date=dateField.value;
 const copy=document.createElement('canvas');
 await renderPoster(copy,cloneConfig(config),date,{rootPrefix:'../assets/',basePrefix:'../',scale});
 downloadFile('card-'+date+(scale===2?'-4k':'')+'.png',await getPngBlob(copy));
}

function tab(name){
 document.querySelectorAll('.tab').forEach(el=>{
  const active=el.dataset.tab===name;
  el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));
 });
 document.querySelectorAll('.tab-content').forEach(el=>el.classList.toggle('hidden',el.dataset.panel!==name));
 if(name==='theme'&&config)void renderGallery();
}
document.querySelectorAll('.tab').forEach(el=>el.addEventListener('click',()=>tab(el.dataset.tab)));
function inputField(label,value,type='text',onChange){const box=document.createElement('label');box.className='field';box.append(document.createTextNode(label));const el=document.createElement('input');el.type=type;el.value=value??'';el.addEventListener('input',()=>onChange(type==='number'?Number(el.value):el.value));box.append(el);return box;}
function selectField(label,value,choices,onChange){const box=document.createElement('label');box.className='field';box.append(document.createTextNode(label));const select=document.createElement('select');for(const [key,label] of choices){const op=document.createElement('option');op.value=key;op.textContent=label;select.append(op);}select.value=value||choices[0][0];select.addEventListener('change',()=>onChange(select.value));box.append(select);return box;}
function buildCounters(){const root=$('#counter-list');root.replaceChildren();(config.counters||[]).forEach((item,i)=>{
  const article=document.createElement('div');article.className='counter-editor';
  const bar=document.createElement('div');bar.className='counter-top';const title=document.createElement('strong');title.textContent=`${i+1}. ${item.label||'موعد جديد'}`;
  const actions=document.createElement('div');actions.className='counter-top-actions';
  for(const [label,move] of [['↑',-1],['↓',1]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.title=move===-1?'تحريك لأعلى':'تحريك لأسفل';button.disabled=(i+move<0||i+move>=config.counters.length);button.addEventListener('click',()=>{[config.counters[i],config.counters[i+move]]=[config.counters[i+move],config.counters[i]];buildCounters();changed();});actions.append(button);}
  const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='حذف';del.addEventListener('click',()=>{if(!confirm('حذف هذا العدّاد من التصميم؟'))return;config.counters.splice(i,1);buildCounters();changed();});actions.append(del);
  bar.append(title,actions);article.append(bar);
  const fields=document.createElement('div');fields.className='counter-fields';
  fields.append(inputField('العنوان',item.label,'text',v=>{item.label=v.slice(0,35);title.textContent=`${i+1}. ${item.label}`;changed();}));
  fields.append(selectField('طريقة الحساب',item.mode,[['monthly','شهري'],['date','تاريخ محدد'],['hijri','هجري متكرر'],['manual','رقم يدوي']],v=>{item.mode=v;buildCounters();changed();}));
  if(item.mode==='monthly')fields.append(inputField('يوم الشهر (1–31)',item.day||1,'number',v=>{item.day=Math.max(1,Math.min(31,Math.floor(v)||1));changed();}));
  if(item.mode==='date'){
    fields.append(inputField('تاريخ الموعد',item.date||saToday(),'date',v=>{item.date=v;changed();}));
    fields.append(selectField('التكرار',item.repeat||'none',[['none','مرة واحدة'],['yearly','كل سنة ميلادية']],v=>{item.repeat=v;changed();}));
  }
  if(item.mode==='hijri'){
    fields.append(inputField('الشهر الهجري (1–12)',item.hijriMonth||9,'number',v=>{item.hijriMonth=Math.max(1,Math.min(12,Math.floor(v)||9));changed();}));
    fields.append(inputField('اليوم الهجري (1–30)',item.hijriDay||1,'number',v=>{item.hijriDay=Math.max(1,Math.min(30,Math.floor(v)||1));changed();}));
  }
  if(item.mode==='manual')fields.append(inputField('الرقم الظاهر',item.value||0,'number',v=>{item.value=Math.max(0,Math.floor(v)||0);changed();}));
  article.append(fields);
  const more=document.createElement('div');more.className='counter-detail-fields';
  for(const [key,title,limit] of [['category','الفئة',32],['summary','ملخص يظهر للزوار',120],['location','الجهة أو الموقع',120],['link','رابط الحدث',350]]){
    more.append(inputField(title,item[key]||'','text',v=>{item[key]=v.slice(0,limit);changed();}));
  }
  for(const [key,title,limit] of [['details','التفاصيل الكاملة',800],['notes','ملاحظات إضافية',400]]){
    const wrap=document.createElement('label');wrap.className='field';wrap.textContent=title;const area=document.createElement('textarea');
    area.rows=3;area.value=item[key]||'';area.maxLength=limit;area.addEventListener('input',()=>{item[key]=area.value;changed();});
    wrap.append(area);more.append(wrap);
  }
  const expander=document.createElement('details');expander.className='counter-details';const sum=document.createElement('summary');
  sum.textContent='إدارة تفاصيل الحدث والمعلومات الإضافية';expander.append(sum,more);article.append(expander);
const toggle=document.createElement('label');toggle.className='counter-toggle';const check=document.createElement('input');check.type='checkbox';check.checked=item.enabled!==false;check.addEventListener('change',()=>{item.enabled=check.checked;changed();});toggle.append(check,document.createTextNode('إظهار في البطاقة'));article.append(toggle);root.append(article);
});}
function setupForm(){document.querySelectorAll('[data-bind]').forEach(el=>el.addEventListener(el.type==='checkbox'?'change':'input',()=>{let val=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;updateDeep(config,el.dataset.bind,val);changed();}));
  $('#add-counter').addEventListener('click',()=>{if(config.counters.length>=24){alert('الحد الأقصى 24 عدّادًا للبطاقة الواحدة.');return;}config.counters.push({id:'custom_'+Date.now(),label:'موعد جديد',mode:'monthly',day:1,enabled:true,category:'حدث',summary:'',details:'',notes:'',location:'',link:''});buildCounters();changed();});
  $('#admin-banner-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;const status=$('#admin-banner-state');status.textContent='جارٍ تهيئة الإعلان بالمقاس 2000 × 400…';try{const result=await prepareBanner(file);config.advertising||={enabled:true};config.advertising.image=result.src;config.advertising.enabled=true;syncFields();changed();status.textContent='تم تجهيز الإعلان '+result.width+'×'+result.height+' • احفظ وانشر ليظهر للجميع';}catch(err){status.textContent=err.message;}finally{e.target.value='';}});
  $('#admin-banner-clear').addEventListener('click',()=>{config.advertising||={enabled:true};config.advertising.image='';syncFields();changed();});
  $('#clear-logo').addEventListener('click',()=>{config.brand.logo='';$('#logo-file').value='';changed();});
  $('#logo-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>4_000_000){alert('يُرجى اختيار صورة PNG أو JPG أو WebP أقل من 4 ميغابايت.');return;}try{const img=await createImageBitmap(file);const c=document.createElement('canvas');const size=Math.min(400,Math.max(img.width,img.height));c.width=size;c.height=size;const s=Math.min(size/img.width,size/img.height);c.getContext('2d').drawImage(img,(size-img.width*s)/2,(size-img.height*s)/2,img.width*s,img.height*s);const url=c.toDataURL('image/webp',.74);if(url.length>250000){alert('الشعار كبير بعد الضغط. استخدم صورة أصغر.');return;}config.brand.logo=url;changed();}catch(err){alert('تعذر قراءة الصورة.');}});
  dateField.addEventListener('input',()=>{
   if(!dateField.value)return;
   syncPreview();
   if(!document.querySelector('[data-panel="theme"]').classList.contains('hidden'))void renderGallery();
  });
  for(const [id,scale] of [['#admin-download',1],['#admin-download-4k',2]]){
   $(id).addEventListener('click',async()=>{
    $(id).disabled=true;
    try{await exportCard(scale);}catch(error){draftStatus.textContent='تعذّر التصدير: '+error.message;}
    finally{$(id).disabled=false;}
   });
  }
  initTemplates();
  tab($(".tab.active").dataset.tab);
  $('#export-json').addEventListener('click',()=>downloadFile('zyad-config.json',new Blob([JSON.stringify(config,null,2)],{type:'application/json;charset=utf-8'})));
  $('#restore-original').addEventListener('click',()=>{if(!confirm('هل تريد تجاهل تعديلاتك المحلية والعودة إلى النسخة المنشورة؟'))return;config=cloneConfig(published);localStorage.removeItem(DRAFT_KEY);syncFields();buildCounters();syncTemplate();redrawSavedDesigns();syncPreview();draftStatus.textContent='تمت استعادة النسخة المنشورة';});
  $('#publish-config').addEventListener('click',publish);
  $('#quick-save').addEventListener('click',()=>{tab('publish');void publish();});
}

let saving=false;
async function publish(){
 if(!config||saving)return;
 saving=true;
 const button=$('#publish-config');button.disabled=true;
 const label=button.textContent;button.textContent='جارٍ الحفظ...';
 setStatus('جارٍ التحقق من جلسة المدير وحفظ الإعدادات...');
 try{
  const uploadedImage=config.advertising?.image||'';
  if(/^data:image\/webp;base64,/.test(uploadedImage)){
    setStatus('جارٍ رفع الإعلان بشكل آمن...');
    try{
      const upload=await window.zyadAdminClient.request('upload-banner',{method:'POST',body:JSON.stringify({image:uploadedImage})});
      if(!upload.path||!/^assets\/advertising\/[\w.-]+\.webp$/.test(upload.path))throw Error('لم يؤكد الخادم مسار صورة الإعلان.');
      config.advertising.image=upload.path;
    }catch(error){
      if(!/مسار الإدارة غير معروف|فشل الطلب 404/.test(error.message||''))throw error;
      setStatus('خادم الإدارة القديم: جارٍ حفظ نسخة WebP مضغوطة ضمن الإعدادات...');
      config.advertising.image=await compactBanner(uploadedImage);
    }
  }
  let result;
  try{result=await window.zyadAdminClient.request('publish',{method:'POST',body:JSON.stringify({config,base:published})});}
  catch(error){if(uploadedImage.startsWith('data:image/'))config.advertising.image=uploadedImage;throw error;}
  published=cloneConfig(config);localStorage.removeItem(DRAFT_KEY);
  draftStatus.textContent='تم الحفظ على GitHub بنجاح';
  setStatus('نجح النشر في main. ستُحدّث GitHub Actions الموقع والبطاقات.'+(result.commit?' · '+result.commit.slice(0,7):''));
 }catch(error){setStatus('تعذر النشر: '+error.message,false);}
 finally{saving=false;button.disabled=false;button.textContent=label;}
}
window.__adminReady=(async function init(){try{const response=await window.zyadAdminClient.request('config');published=response.config;const draft=localStorage.getItem(DRAFT_KEY);const source=draft?JSON.parse(draft):cloneConfig(published);config={...cloneConfig(published),...source,design:{...published.design,...(source.design||{})},theme:{...published.theme,...(source.theme||{})},savedDesigns:Array.isArray(source.savedDesigns)?source.savedDesigns:published.savedDesigns||[]};syncFields();buildCounters();syncTemplate();setupForm();await renderPoster(canvas,config,dateField.value,{rootPrefix:'../assets/',basePrefix:'../'});syncPreview();draftStatus.textContent=draft?'مسودة محلية مستعادة • غير منشورة':'جاهز للتعديل';}catch(e){console.error(e);draftStatus.textContent='فشل تحميل لوحة الإدارة: '+e.message;}})();
