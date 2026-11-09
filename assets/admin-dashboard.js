import {CARD_PRESETS} from './templates.js';
await window.__adminReady;
const api=window.zyadAdmin;
if(api?.getConfig()){
 const nav=document.querySelector('.tab-list'),editor=document.querySelector('#editor-form');
 const tab=document.createElement('button');tab.type='button';tab.className='tab';tab.dataset.tab='overview';tab.textContent='نظرة عامة';nav.prepend(tab);
 const panel=document.createElement('div');panel.className='tab-content hidden admin-overview';panel.dataset.panel='overview';
 panel.innerHTML=`<div class="overview-welcome"><span class="eyebrow">لوحة التحكم · الإدارة</span><h2>صمّم يومًا أجمل لكل زائر</h2><p>ملخص حيّ لبيانات الرزنامة، مع وصول سريع للتحرير والنشر.</p><div class="overview-date"></div></div>
 <div class="overview-stats" aria-label="مؤشرات الإدارة"><div class="overview-stat"><small>المواعيد والعدّادات</small><strong id="ov-all">—</strong><span>كل المناسبات المضافة</span></div>
 <div class="overview-stat"><small>النشطة</small><strong id="ov-active">—</strong><span>تظهر للزوار</span></div>
 <div class="overview-stat"><small>القوالب</small><strong id="ov-templates">—</strong><span>تصاميم متاحة</span></div>
 <div class="overview-stat"><small>تصاميمي</small><strong id="ov-saved">—</strong><span>قوالب محفوظة</span></div></div>
 <div class="overview-group"><div><h3>إدارة سريعة</h3><p>اختر القسم الذي تريد تطويره اليوم.</p></div><div class="overview-links">
 <button type="button" data-open="counters"><span class="ov-icon">▦</span><span><strong>المواعيد والعدّادات</strong><small>إضافة المناسبات وتعديل التواريخ والأوصاف</small></span><b>‹</b></button>
 <button type="button" data-open="theme"><span class="ov-icon">◈</span><span><strong>القوالب والتصاميم</strong><small>الخطوط والألوان والمظهر النهائي</small></span><b>‹</b></button>
 <button type="button" data-open="content"><span class="ov-icon">✎</span><span><strong>محتوى البطاقة</strong><small>العناوين والرسائل وروابط التواصل</small></span><b>‹</b></button>
 <button type="button" data-open="identity"><span class="ov-icon">◎</span><span><strong>هوية المنصة</strong><small>الاسم والشعار والمعلومات الأساسية</small></span><b>‹</b></button>
 <button type="button" data-open="publish"><span class="ov-icon">↑</span><span><strong>الحفظ والنشر</strong><small>إرسال التعديلات إلى النسخة العامة</small></span><b>‹</b></button>
 </div></div>
 <div class="overview-guide"><strong>نصيحة لتحرير آمن</strong><p>تظهر التغييرات في المعاينة مباشرة، لكنها لا تصل إلى الزوار إلا بعد الضغط على «حفظ ونشر». يمكن تصدير نسخة احتياطية JSON من قسم النشر.</p></div>`;
 editor.prepend(panel);
 const today=new Date();
 panel.querySelector('.overview-date').textContent=new Intl.DateTimeFormat('ar-SA',{dateStyle:'full',timeZone:'Asia/Riyadh'}).format(today);
 const refresh=()=>{
  const c=api.getConfig();if(!c)return;
  panel.querySelector('#ov-all').textContent=(c.counters||[]).length.toLocaleString('ar-SA');
  panel.querySelector('#ov-active').textContent=(c.counters||[]).filter(x=>x.enabled!==false).length.toLocaleString('ar-SA');
  panel.querySelector('#ov-templates').textContent=CARD_PRESETS.length.toLocaleString('ar-SA');
  panel.querySelector('#ov-saved').textContent=(c.savedDesigns||[]).length.toLocaleString('ar-SA');
 };
 panel.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>api.tab(b.dataset.open));
 tab.onclick=()=>{refresh();api.tab('overview');};
 const changed=api.changed;api.changed=()=>{changed();refresh();};
 refresh();api.tab('overview');
}