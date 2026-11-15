/* Awan Saudi visitor experience: accessible quick actions, responsive browsing,
   visual state feedback. No changes to templates, event data or export canvases. */
(() => {
 'use strict';
 const $ = selector => document.querySelector(selector);
 const text = (ar,en) => document.documentElement.lang === 'en' ? en : ar;
 const preferenceKey = 'awan-gallery-density-v1';
 const routes = [
  {href:'#poster-section',glyph:'✦',ar:'بطاقة اليوم',en:'Daily card',hintAr:'عرض البطاقة وحفظها',hintEn:'View and save'},
  {href:'#smart-planner',glyph:'▦',ar:'التقويم',en:'Calendar',hintAr:'المواعيد والمناسبات',hintEn:'Dates and events'},
  {href:'#template-gallery',glyph:'◈',ar:'التصاميم',en:'Designs',hintAr:'قوالب مميزة',hintEn:'Explore templates'},
  {href:'#archive',glyph:'◷',ar:'الأرشيف',en:'Archive',hintAr:'بطاقات الأيام السابقة',hintEn:'Previous cards'}
 ];
 const intro = $('.ios-home-intro');
 let rail;
 if(intro && !$('.awan-quick-rail')){
  rail = document.createElement('nav');
  rail.className = 'awan-quick-rail';
  rail.setAttribute('aria-label',text('تنقل سريع','Quick navigation'));
  for(const option of routes){
   const link=document.createElement('a');
   link.className='awan-quick-action';
   link.href=option.href;
   const symbol=document.createElement('span');symbol.className='awan-quick-icon';symbol.textContent=option.glyph;symbol.setAttribute('aria-hidden','true');
   const copy=document.createElement('span');copy.className='awan-quick-copy';
   const title=document.createElement('strong');title.dataset.ar=option.ar;title.dataset.en=option.en;
   const hint=document.createElement('small');hint.dataset.ar=option.hintAr;hint.dataset.en=option.hintEn;
   copy.append(title,hint);link.append(symbol,copy);rail.append(link);
  }
  intro.after(rail);
 }
 function refreshLanguage(){
  const en=document.documentElement.lang==='en';
  rail?.setAttribute('aria-label',en?'Quick navigation':'تنقل سريع');
  rail?.querySelectorAll('[data-ar][data-en]').forEach(el=>{el.textContent=en?el.dataset.en:el.dataset.ar;});
  const title=$('.awan-gallery-display-label');if(title)title.textContent=en?'Gallery layout':'طريقة العرض';
  const spacious=$('[data-awan-density="spacious"]');if(spacious)spacious.textContent=en?'Comfortable':'مريح';
  const compact=$('[data-awan-density="compact"]');if(compact)compact.textContent=en?'Compact':'مضغوط';
 }
 function updateNav(){
  const hash=location.hash||'#today-app';
  rail?.querySelectorAll('a').forEach(a=>{
   const current=hash===a.hash;
   if(current)a.setAttribute('aria-current','page');
   else a.removeAttribute('aria-current');
  });
 }
 let density='spacious';
 try{if(localStorage.getItem(preferenceKey)==='compact')density='compact';}catch{}
 function applyDensity(){
  document.body.classList.toggle('awan-compact-gallery',density==='compact');
  document.querySelectorAll('[data-awan-density]').forEach(btn=>{
   btn.setAttribute('aria-pressed',String(btn.dataset.awanDensity===density));
  });
 }
 const controls=$('.gallery-controls');
 if(controls && !$('.awan-gallery-display')){
  const row=document.createElement('div');row.className='awan-gallery-display';
  const label=document.createElement('span');label.className='awan-gallery-display-label';
  const options=document.createElement('div');options.className='awan-density-options';
  options.setAttribute('role','group');options.setAttribute('aria-label',text('حجم عرض البطاقات','Gallery card density'));
  for(const mode of ['spacious','compact']){
   const button=document.createElement('button');
   button.type='button';button.dataset.awanDensity=mode;
   button.onclick=()=>{
    density=mode;
    try{localStorage.setItem(preferenceKey,density);}catch{}
    applyDensity();
   };
   options.append(button);
  }
  row.append(label,options);controls.append(row);
 }
 const panel=$('#poster-section');
 const status=$('#page-status');
 if(panel&&status){
  const read=()=>{
   const message=status.textContent||'';
   panel.dataset.awanState=/تعذر|فشل|error|failed/i.test(message)?'error':/جارٍ|تحميل|preparing|loading/i.test(message)?'loading':'ready';
  };
  new MutationObserver(read).observe(status,{subtree:true,childList:true,characterData:true});
  read();
 }
 // Keep this visual layer consistent with route and language changes from the app.
 window.addEventListener('hashchange',updateNav);
 window.addEventListener('zyad-route-updated',updateNav);
 window.addEventListener('zyad-language-change',refreshLanguage);
 refreshLanguage();applyDensity();updateNav();
})();
