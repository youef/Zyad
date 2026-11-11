/* Visitor settings: persisted local preferences, no login required. */
const KEY_THEME='zyad-appearance',KEY_LANG='zyad-language';
const settingsRoot=document.getElementById('settings');
const dictionary={
 ar:{
  settings:'الإعدادات',settingsDesc:'خصّص طريقة عرض رزنامة السعودية على جهازك.',
  appearance:'المظهر',appearanceDesc:'اختر الوضع المناسب لك أو استخدم إعدادات الجهاز.',
  light:'فاتح',dark:'داكن',system:'تلقائي',language:'اللغة',
  languageDesc:'اختر لغة واجهة التطبيق.',arabic:'العربية',english:'English',
  saved:'تُحفظ الخيارات تلقائيًا على هذا الجهاز.',local:'إعدادات خاصة بهذا الجهاز',
  display:'العرض والقراءة',calendarInfo:'مواعيد الصرف والأحداث تُعرض بتوقيت السعودية.',
  home:'الرئيسية',calendar:'التقويم',designs:'التصاميم',favorites:'المفضلة',gallery:'مكتبة التصاميم',
  archive:'أرشيف البطاقات',today:'اليوم',brand:'رزنامة السعودية',poster:'بطاقتك اليومية',
  todayTitle:'يومك بين يديك',plannerTitle:'تقويمك… كل المواعيد',galleryTitle:'تصميم لكل يوم',
  archiveTitle:'أرشيف بطاقاتك',favoritesTitle:'تصاميمي المفضلة',
  save:'حفظ البطاقة',share:'مشاركة',highQuality:'جودة عالية 4K',
  greeting:'كل يوم، بداية جميلة',introTag:'رزنامتك اليومية',introTitle:'مواعيدك، بكل وضوح.',introDesc:'اطّلع على المواعيد والمناسبات والبطاقات المنشورة، دون الحاجة إلى إنشاء حساب.',galleryIntro:'تصفح التصاميم، اختر المفضل لديك، واحفظه مباشرة دون حساب.',galleryPick:'اختر بطاقتك',calendarAll:'التقويم الكامل',upcoming:'مواعيدك القادمة',archiveDesc:'صورة كل يوم محفوظة للرجوع إليها.',spotlight:'أقرب موعد',selectedDesign:'التصميم المختار حاليًا',searchDesign:'ابحث باسم التصميم أو المناسبة',favoriteFirst:'المفضلة أولاً',
  search:'ابحث عن موعد…',all:'الكل',dues:'الاستحقاقات',
  hint:'يتم حفظ اللغة والمظهر في هذا المتصفح، ولا يتغير تصميم البطاقة المنشورة.',
  titleNote:'اللغة الإنجليزية متاحة لواجهة التطبيق. أسماء المناسبات والنصوص المنشورة تبقى بلغتها الأصلية.'
 },
 en:{
  settings:'Settings',settingsDesc:'Personalize Saudi Calendar on this device.',
  appearance:'Appearance',appearanceDesc:'Choose a theme or follow your device settings.',
  light:'Light',dark:'Dark',system:'System',language:'Language',
  languageDesc:'Select the app interface language.',arabic:'العربية',english:'English',
  saved:'Preferences are saved automatically on this device.',local:'Device preferences',
  display:'Display and reading',calendarInfo:'Payment dates and events use Saudi Arabia time.',
  home:'Home',calendar:'Calendar',designs:'Designs',favorites:'Favorites',gallery:'Design gallery',
  archive:'Card archive',today:'Today',brand:'Saudi Calendar',poster:'Daily card',
  todayTitle:'Your day at a glance',plannerTitle:'Your calendar · All events',galleryTitle:'A design for every day',
  archiveTitle:'Your card archive',favoritesTitle:'Favorite designs',
  save:'Save card',share:'Share',highQuality:'High quality 4K',
  greeting:'Every day, a fresh start',introTag:'Your daily calendar',introTitle:'Your schedule, made clear.',introDesc:'Explore upcoming payments, events and public cards without creating an account.',galleryIntro:'Browse designs, choose a favorite and save it instantly without an account.',galleryPick:'Choose your card',calendarAll:'Full calendar',upcoming:'Upcoming events',archiveDesc:'Browse and revisit cards from earlier days.',spotlight:'Next event',selectedDesign:'Currently selected design',searchDesign:'Search designs or occasions',favoriteFirst:'Favorites first',
  search:'Search events…',all:'All',dues:'Payments',
  hint:'Language and theme are stored in this browser. Published card artwork is unchanged.',
  titleNote:'English covers the app interface. Published event names and card content remain in their original language.'
 }
};
const localized=[
 ['.side-links a[href="#today-app"] span:last-child','home'],
 ['.side-links a[href="#smart-planner"] span:last-child','calendar'],
 ['.side-links a[href="#template-gallery"] span:nth-child(2)','gallery'],
 ['.side-links a[href="#archive"] span:last-child','archive'],
 ['.side-links a[href="#settings"] span:last-child','settings'],
 ['.visitor-tabs a[href="#today-app"] .tab-label','home'],
 ['.visitor-tabs a[href="#smart-planner"] .tab-label','calendar'],
 ['.visitor-tabs a[href="#template-gallery"] .tab-label','designs'],
 ['.visitor-tabs a[href="#favorites"] .tab-label','favorites'],
 ['.visitor-tabs a[href="#settings"] .tab-label','settings'],
 ['#brand-title','brand'],
 ['#app-greeting','greeting'],
 ['.ios-home-intro-copy .ios-overline','introTag'],
 ['.ios-home-intro-copy h2','introTitle'],
 ['.ios-home-intro-copy p','introDesc'],
 ['#template-gallery .gallery-head-copy p','galleryIntro'],
 ['#template-gallery .gallery-head h2','galleryPick'],
 ['.agenda-panel .panel-title h2','upcoming'],
 ['#archive .section-head p','archiveDesc'],
 ['#spotlight-caption','spotlight'],
 ['.gallery-selected-copy small','selectedDesign'],
 ['#calendar-search','searchDesign'],
 ['#gallery-sort option[value="favorites"]','favoriteFirst'],
 ['#today','today'],
 ['#poster-section .panel-title h2','poster'],

 ['#archive .section-head h2','archive'],
 ['#agenda-search','search'],
 ['.ios-home-view-calendar','calendarAll'],
 ['#agenda-filters [data-filter="all"]','all'],
 ['#agenda-filters [data-filter="wallet"]','dues'],
 ['#agenda-filters [data-filter="favorites"]','favorites'],
 ['#download','save'],['#share','share'],['#download-4k','highQuality']
];
const pageTitles={
 'today-app':'todayTitle','poster-section':'poster','smart-planner':'plannerTitle',
 'template-gallery':'galleryTitle','favorites':'favoritesTitle',
 'archive':'archiveTitle','settings':'settings'
};
function preference(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}}
function setPreference(key,value){try{localStorage.setItem(key,value)}catch{}}
function applyTheme(theme){
 const dark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
 document.documentElement.dataset.theme=dark?'dark':'light';
 document.documentElement.dataset.appearance=theme;
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.content=dark?'#10231c':'#f5f5f7';
 document.querySelectorAll('[name="visitor-theme"]').forEach(node=>{node.checked=node.value===theme});
}
function setTitle(lang){
 const key=location.hash.substring(1)||'today-app';
 const h=document.querySelector('#app-view-title');
 if(h&&pageTitles[key])h.textContent=dictionary[lang][pageTitles[key]];
}
function applyLanguage(lang){
 const t=dictionary[lang];
 document.documentElement.lang=lang;
 document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.body.classList.toggle('visitor-english',lang==='en');
 for(const node of document.querySelectorAll('[data-visitor-i18n]')){
   const key=node.dataset.visitorI18n;
   if(t[key])node.textContent=t[key];
 }
 for(const [selector,key]of localized){
  const node=document.querySelector(selector);if(!node||!t[key])continue;
  if(node instanceof HTMLInputElement)node.placeholder=t[key];
  else if(selector==='#download'||selector==='#share'){
   // Preserve their decorative SVG icons.
   const textNode=[...node.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
   if(textNode)textNode.textContent=' '+t[key];else node.append(document.createTextNode(' '+t[key]));
  }else node.textContent=t[key];
 }
 document.querySelectorAll('[name="visitor-language"]').forEach(node=>{node.checked=node.value===lang});
 setTitle(lang);
 document.title=(lang==='ar'?'رزنامة السعودية':'Saudi Calendar')+' | Zyad';
 window.dispatchEvent(new CustomEvent('zyad-language-change',{detail:{language:lang}}));
}
if(settingsRoot){
 settingsRoot.querySelectorAll('[name="visitor-theme"]').forEach(node=>node.addEventListener('change',()=>{
  if(!node.checked)return;setPreference(KEY_THEME,node.value);applyTheme(node.value);
 }));
 settingsRoot.querySelectorAll('[name="visitor-language"]').forEach(node=>node.addEventListener('change',()=>{
  if(!node.checked)return;setPreference(KEY_LANG,node.value);applyLanguage(node.value);
 }));
}
const initialTheme=preference(KEY_THEME,'system'),initialLang=preference(KEY_LANG,'ar');
applyTheme(['light','dark','system'].includes(initialTheme)?initialTheme:'system');
applyLanguage(['ar','en'].includes(initialLang)?initialLang:'ar');
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{
 if(preference(KEY_THEME,'system')==='system')applyTheme('system');
});
window.addEventListener('hashchange',()=>setTitle(preference(KEY_LANG,'ar')));
window.addEventListener('zyad-calendar-updated',()=>setTitle(preference(KEY_LANG,'ar')));
