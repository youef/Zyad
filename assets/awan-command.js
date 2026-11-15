/* Legendary UI / Awan Saudi: functional global navigation and card status.
   UI-only: no configuration, export, authentication or poster logic is replaced. */
(()=>{
'use strict';
if(!document.body?.classList.contains('visitor-only'))return;
const $=s=>document.querySelector(s),make=(tag,cls='',value='')=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value)e.textContent=value;return e;};
const lang=()=>document.documentElement.lang==='en';
const tr=(ar,en)=>lang()?en:ar;
const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase().replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/[\u064b-\u065f\u0670]/g,'').trim();
const NAV=[
 ['today-app','⌂','الرئيسية','Home','مواعيد اليوم','Dates and events'],
 ['poster-section','✦','بطاقة اليوم','Daily card','حفظ ومشاركة البطاقة','Save and share'],
 ['smart-planner','▦','التقويم','Calendar','المناسبات والمواعيد','Calendar and events'],
 ['template-gallery','◈','التصاميم','Designs','قوالب البطاقات','Card templates'],
 ['favorites','♡','المفضلة','Favorites','تصاميمك المحفوظة','Saved designs'],
 ['archive','◷','الأرشيف','Archive','بطاقات الأيام السابقة','Previous daily cards'],
 ['more','⋯','المزيد','More','الإعدادات والخدمات','Settings and services']
];
const actions=$('.app-header .header-actions');
if(!actions||$('#awan-command-dialog'))return;
const launch=make('button','awan-global-search');launch.id='awan-global-search';launch.type='button';
const glyph=make('span','awan-search-icon','⌕');glyph.setAttribute('aria-hidden','true');
const launchLabel=make('span','awan-search-label');launch.append(glyph,launchLabel);
actions.prepend(launch);
const dialog=make('dialog','awan-command-dialog');dialog.id='awan-command-dialog';
dialog.setAttribute('aria-labelledby','awan-command-title');
const head=make('div','awan-command-head'),header=make('div','awan-command-headline');
const kicker=make('small','awan-command-kicker'),title=make('h2');title.id='awan-command-title';
header.append(kicker,title);
const close=make('button','awan-command-close','×');close.type='button';
head.append(header,close);
const field=make('label','awan-command-field');
const searchIcon=make('span','awan-search-icon','⌕');searchIcon.setAttribute('aria-hidden','true');
const input=make('input');input.id='awan-command-input';input.type='search';input.autocomplete='off';input.maxLength=90;
input.setAttribute('aria-controls','awan-command-results');
field.append(searchIcon,input);
const hint=make('p','awan-command-hint');
const results=make('div','awan-command-results');results.id='awan-command-results';results.setAttribute('role','group');
const footer=make('div','awan-command-footer');
const tally=make('span');tally.setAttribute('role','status');const keys=make('span');
footer.append(tally,keys);dialog.append(head,field,hint,results,footer);document.body.append(dialog);
let previousFocus=null,matches=[];
const records=()=>{
 const sections=NAV.map(r=>({kind:'route',id:r[0],icon:r[1],title:tr(r[2],r[3]),subtitle:tr(r[4],r[5]),keywords:r.join(' ')}));
 const templates=[...document.querySelectorAll('.public-template-card[data-preset]')].map(card=>{
 const id=card.dataset.preset, name=card.querySelector('.public-template-select strong')?.textContent?.trim()||id;
 const category=card.querySelector('.gallery-card-badge')?.textContent?.trim()||'';
 return {kind:'template',id,icon:'▣',title:name,subtitle:category,keywords:id+' '+name+' '+category};
 });
 return [...sections,...templates];
};
function activate(item){
 if(!item)return;
 dialog.close();
 if(item.kind==='route'){location.hash='#'+item.id;return;}
 const q=$('#calendar-search');if(q&&q.value){q.value='';q.dispatchEvent(new Event('input',{bubbles:true}));}
 $('#gallery-categories button[data-category="الكل"]')?.click();
 $('#gallery-family-filters [data-family="all"]')?.click();
 location.hash='#template-gallery';
 requestAnimationFrame(()=>{
  const card=[...document.querySelectorAll('.public-template-card')].find(e=>e.dataset.preset===item.id);
  const button=card?.querySelector('.public-template-select');
  if(button){button.scrollIntoView({block:'center',behavior:'instant'});button.click();}
 });
}
function render(){
 const query=normalize(input.value),all=records();
 matches=(query?all.filter(x=>normalize(x.title+' '+x.keywords+' '+x.subtitle).includes(query)):all.filter(x=>x.kind==='route')).slice(0,12);
 results.replaceChildren();
 if(!matches.length){
  const empty=make('div','awan-command-empty');
  empty.append(make('strong','',tr('ما لقينا نتيجة','No results found')),make('small','',tr('جرّب البحث باسم قسم أو تصميم آخر','Try another page or card design')));
  results.append(empty);
 }
 matches.forEach((item,i)=>{
  const button=make('button','awan-command-result');button.type='button';
  button.dataset.commandType=item.kind;button.dataset.commandId=item.id;
  const icon=make('span','awan-command-result-icon',item.icon);icon.setAttribute('aria-hidden','true');
  const copy=make('span','awan-command-result-copy');
  copy.append(make('strong','',item.title),make('small','',item.subtitle));
  const arrow=make('span','awan-command-result-arrow','↗');arrow.setAttribute('aria-hidden','true');
  button.append(icon,copy,arrow);
  button.addEventListener('click',()=>activate(item));
  button.addEventListener('keydown',event=>{
   if(!['ArrowDown','ArrowUp'].includes(event.key))return;
   event.preventDefault();
   const options=[...results.querySelectorAll('button')];
   options[(i+(event.key==='ArrowDown'?1:-1)+options.length)%options.length]?.focus();
  });
  results.append(button);
 });
 tally.textContent=tr('النتائج: ','Results: ')+matches.length;
}
function translateUI(){
 kicker.textContent=tr('تصفح سريع','QUICK SEARCH');title.textContent=tr('وش تبحث عنه؟','What are you looking for?');
 launchLabel.textContent=tr('بحث','Search');
 launch.setAttribute('aria-label',tr('بحث شامل في التطبيق','Search across the app'));
 close.setAttribute('aria-label',tr('إغلاق البحث','Close search'));
 input.setAttribute('aria-label',tr('البحث في التطبيق','Search the app'));
 input.placeholder=tr('ابحث عن قسم أو تصميم…','Search a page or design…');
 hint.textContent=tr('اختر قسمًا أو افتح معاينة بطاقة منشورة','Select a page or preview an available card');
 keys.textContent=tr('↑ ↓ للتنقل · Enter للفتح · Esc للإغلاق','↑ ↓ navigate · Enter open · Esc close');
 results.setAttribute('aria-label',tr('نتائج البحث','Search results'));
 if(dialog.open)render();
}
function open(){
 if(dialog.open){input.focus();return;}
 previousFocus=document.activeElement;input.value='';
 render();dialog.showModal();input.focus({preventScroll:true});
}
launch.addEventListener('click',open);
close.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
dialog.addEventListener('close',()=>{
 if(previousFocus?.isConnected&&typeof previousFocus.focus==='function')previousFocus.focus({preventScroll:true});
 previousFocus=null;
});
input.addEventListener('input',render);
input.addEventListener('keydown',event=>{
 if(event.key==='ArrowDown'){event.preventDefault();results.querySelector('button')?.focus();}
 if(event.key==='Enter'){event.preventDefault();activate(matches[0]);}
});
document.addEventListener('keydown',event=>{
 if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();open();return;}
 const target=event.target,typing=target instanceof HTMLElement&&(target.matches('input,textarea,select')||target.isContentEditable);
 if(event.key==='/'&&!typing&&!dialog.open&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();open();}
});
window.addEventListener('zyad-language-change',()=>queueMicrotask(translateUI));
window.addEventListener('zyad-calendar-updated',()=>{if(dialog.open)render();});
translateUI();

// Data-derived context near actual card canvas, with a working retry action.
const poster=$('#poster-section'),shell=poster?.querySelector('.poster-shell'),status=$('#page-status');
if(shell&&poster){
 const context=make('div','awan-card-context');context.id='awan-card-context';context.setAttribute('aria-live','polite');
 const presetLabel=make('span','awan-card-context-chip'),sizeLabel=make('span','awan-card-context-chip');
 context.append(presetLabel,sizeLabel);shell.before(context);
 const sync=()=>{
  const config=window.zyadCalendar?.getConfig?.(),preset=config?.design?.preset;
  const name=[...document.querySelectorAll('.public-template-card')].find(e=>e.dataset.preset===preset)
    ?.querySelector('.public-template-select strong')?.textContent?.trim();
  const select=$('#social-output-size');
  presetLabel.textContent=tr('التصميم: ','Design: ')+(name||preset||tr('بطاقة اليوم','Daily card'));
  sizeLabel.textContent=tr('المقاس: ','Size: ')+(select?.selectedOptions[0]?.textContent?.trim()||tr('ستوري','Story'));
 };
 const retry=make('button','awan-card-retry');retry.type='button';retry.id='awan-card-retry';retry.hidden=true;
 retry.addEventListener('click',()=>{
  const api=window.zyadCalendar;
  if(api?.getConfig?.()&&api?.getDate?.())api.setDate(api.getDate());else location.reload();
 });
 status?.after(retry);
 const check=()=>{
  retry.textContent=tr('إعادة محاولة عرض البطاقة','Retry card preview');
  retry.hidden=!/تعذر|فشل|error|failed/i.test(status?.textContent||'');
 };
 if(status)new MutationObserver(check).observe(status,{subtree:true,childList:true,characterData:true});
 window.addEventListener('zyad-calendar-updated',sync);
 window.addEventListener('zyad-social-size-change',sync);
 document.addEventListener('change',event=>{if(event.target?.id==='social-output-size')sync();});
 window.addEventListener('zyad-language-change',()=>{sync();check();});
 window.__posterReady?.then(sync).catch(sync);
 sync();check();
}
// Do not leave the archive looking broken when no cards have been published.
const archive=$('#archive-grid');
if(archive){
 const empty=make('section','awan-archive-empty');empty.hidden=true;
 const icon=make('span','awan-archive-empty-icon','◷');icon.setAttribute('aria-hidden','true');
 const title=make('strong'),desc=make('p'),action=make('a');action.href='#poster-section';
 empty.append(icon,title,desc,action);archive.after(empty);
 const draw=()=>{
  empty.hidden=archive.children.length>0;
  title.textContent=tr('لا توجد بطاقات مؤرشفة حتى الآن','No archived cards yet');
  desc.textContent=tr('تظهر البطاقات هنا عندما تتوفر صور أيام سابقة منشورة.','Previous published daily cards will appear here.');
  action.textContent=tr('افتح بطاقة اليوم','Open today’s card');
 };
 window.__posterReady?.then(draw).catch(draw);
 window.addEventListener('zyad-language-change',draw);
}
})();