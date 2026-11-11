import {getLanguage,translate,localeDate,eventLabel,localizedConfig} from './locale.js?v=i18n4';
import {paymentOccurrences,paymentRule,PAYMENT_RULE_LABELS} from './payment-schedule.js?v=pay2';

import {isoAdd,daysBetween,hijriDate,saToday} from './card.js?v=i18n4';

const re=/^\d{4}-\d{2}-\d{2}$/;
const pad=n=>String(n).padStart(2,'0');
const monthKey=iso=>iso.slice(0,7);
function monthPlus(key,n){const [y,m]=key.split('-').map(Number);const d=new Date(Date.UTC(y,m-1+n,1,12));return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1);}
function real(iso){if(!re.test(iso))return false;const d=new Date(iso+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===iso;}
const maxDay=(y,m)=>new Date(Date.UTC(y,m,0)).getUTCDate();
export const dayLabel=iso=>localeDate(iso,{day:'numeric',month:'long',year:'numeric'});
export const monthLabel=key=>localeDate(key+'-01',{month:'long',year:'numeric'});
export const eventType=i=>translate(i.mode==='monthly'?'شهري':i.mode==='hijri'?'هجري':i.mode==='manual'?'يدوي':i.repeat==='yearly'?'سنوي':'مرة واحدة');
export const remainingLabel=n=>getLanguage()==='en'?(n===0?'Today':n===1?'Tomorrow':'In '+n+' days'):n===0?'اليوم':n===1?'غدًا':'بعد '+n+' يوم';
export function nextEventDates(item,fromIso,months=12){
  if(!item||item.enabled===false||item.mode==='manual'||!real(fromIso))return [];
  const end=monthPlus(monthKey(fromIso),months)+'-01',found=[];
  if(item.mode==='monthly'){
    found.push(...paymentOccurrences(item,fromIso,months));
  }else if(item.mode==='date'&&real(item.date)){
    if(item.repeat==='yearly'){
      const md=item.date.slice(5);
      for(let y=Number(fromIso.slice(0,4));y<=Number(end.slice(0,4))+1;y++){
        const date=y+'-'+md;if(real(date)&&date>=fromIso&&date<end)found.push(date);
      }
    }else if(item.date>=fromIso&&item.date<end)found.push(item.date);
  }else if(item.mode==='hijri'){
    const m=Number(item.hijriMonth),d=Number(item.hijriDay);
    if(m>=1&&m<=12&&d>=1&&d<=30){
      try{
        const f=new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura',{month:'numeric',day:'numeric',timeZone:'Asia/Riyadh'});
        for(let k=0,size=daysBetween(fromIso,end);k<size;k++){
          const date=isoAdd(fromIso,k),v=Object.fromEntries(f.formatToParts(new Date(date+'T12:00:00Z')).map(p=>[p.type,p.value]));
          if(Number(v.month)===m&&Number(v.day)===d)found.push(date);
        }
      }catch(e){console.warn('Islamic calendar unavailable',e);}
    }
  }
  return found;
}
export function futureEvents(cfg,fromIso,months=12){
  const out=[];
  for(const item of localizedConfig(cfg).counters||[]){
    for(const date of nextEventDates(item,fromIso,months)){
      out.push({item,date,month:monthKey(date),days:daysBetween(fromIso,date),title:eventLabel(item),category:translate(item.category||eventType(item))});
    }
  }
  return out.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'ar'));
}
const elem=(tag,cls='',value='')=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value)n.textContent=value;return n;};
const attach=(parent,...children)=>{parent.append(...children);return parent;};
const validHref=value=>{try{const u=new URL(value);return u.protocol==='https:'||u.protocol==='http:'?u.href:null;}catch{return null;}};
let data=null,fromDate='',rows=[],chosenMonth='',chosenDate='',search='',kind='الكل',dialog=null,horizon=12;
let container=null,viewDate=null;
function detail(record){
  const item=record.item;
  dialog.replaceChildren();
  const close=elem('button','planner-modal-close','×');close.type='button';close.setAttribute('aria-label','إغلاق');close.onclick=()=>dialog.close();
  const hero=elem('div','planner-modal-hero');
  attach(hero,elem('span','planner-chip',record.category),elem('h3','',record.title),elem('p','',item.summary||item.details||'تفاصيل هذا الحدث'));
  const facts=elem('div','planner-modal-facts');
  for(const [k,v]of [['الميلادي',dayLabel(record.date)],['الهجري',hijriDate(record.date,data)],['المتبقي',remainingLabel(record.days)],['التكرار',eventType(item)],...(item.mode==='monthly'?[['سياسة عطلة الأسبوع',PAYMENT_RULE_LABELS[paymentRule(item)]||'بدون تعديل']]:[]),['المنطقة الزمنية','Asia/Riyadh'],['حالة الموعد',item.custom?'مخصص':item.source?'راجع المصدر المرفق':'تقديري — راجع الجهة المختصة']]){
    attach(facts,attach(elem('div'),elem('small','',k),elem('strong','',v)));
  }
  const body=elem('div','planner-modal-body');
  for(const [k,v] of [['الوصف',item.details||item.description||item.summary||'لا يوجد وصف إضافي بعد.'],['الجهة / المكان',item.location||'غير محدد'],['ملاحظات',item.notes||'لا توجد ملاحظات']]){
    attach(body,attach(elem('section'),elem('h4','',k),elem('p','',v)));
  }
  const future=elem('section','planner-modal-future');
  attach(future,elem('h4','','المواعيد المقبلة'));
  const dates=elem('div','planner-date-chips');
  const opts=nextEventDates(item,record.date,24).slice(0,7);
  for(const date of opts)dates.append(elem('span','',dayLabel(date)));
  if(!opts.length)dates.append(elem('span','','موعد منفرد'));
  future.append(dates);
  const actions=elem('div','planner-modal-actions');
  const view=elem('button','btn primary','عرض بطاقة يوم الحدث');view.type='button';
  view.onclick=()=>{location.hash='poster-section';dialog.close();const input=document.getElementById('chosen-date');if(input){input.value=record.date;input.dispatchEvent(new Event('change'));}document.getElementById('poster-section')?.scrollIntoView({behavior:'smooth'});};
  actions.append(view);
  const share=elem('button','btn secondary','مشاركة الحدث');share.onclick=async()=>{try{const text=record.title+' — '+dayLabel(record.date);if(navigator.share)await navigator.share({title:record.title,text});else await navigator.clipboard.writeText(text);}catch(e){if(e.name!=='AbortError')share.textContent='تعذرت المشاركة';}};actions.append(share);
  const ics=elem('button','btn secondary','إضافة إلى تقويم الجوال');ics.type='button';
  ics.onclick=()=>{
    const escape=s=>String(s||'').replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
    const start=record.date.replaceAll('-',''),end=isoAdd(record.date,1).replaceAll('-','');
    const value=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Zyad//Saudi Calendar//AR','CALSCALE:GREGORIAN','BEGIN:VEVENT',
      'UID:zyad-'+encodeURIComponent(String(item.id||record.title))+'-'+start+'@calendar.local',
      'DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),
      'DTSTART;VALUE=DATE:'+start,'DTEND;VALUE=DATE:'+end,'SUMMARY:'+escape(record.title),
      'DESCRIPTION:'+escape(item.details||item.summary||''),'LOCATION:'+escape(item.location||''),
      'END:VEVENT','END:VCALENDAR'].join('\r\n')+'\r\n';
    const url=URL.createObjectURL(new Blob([value],{type:'text/calendar;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='zyad-event-'+record.date+'.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  };actions.append(ics);
  const href=validHref(item.source||item.link);if(href){const link=elem('a','btn secondary','رابط الجهة / المصدر');link.href=href;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);}
  attach(dialog,close,hero,facts,body,future,actions);
  dialog.showModal();
}
export function openPlannerEvent(record){if(dialog&&data)detail(record);}
function renderCalendar(){
  const grid=container.querySelector('#planner-days');grid.replaceChildren();
  const [y,m]=chosenMonth.split('-').map(Number),start=new Date(Date.UTC(y,m-1,1)).getUTCDay(),count=maxDay(y,m);
  for(const day of ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'])grid.append(elem('span','planner-weekday',translate(day)));
  for(let k=0;k<start;k++)grid.append(elem('span','planner-spacer'));
  const grouped=new Map();
  for(const r of rows.filter(e=>e.month===chosenMonth))grouped.set(r.date,(grouped.get(r.date)||0)+1);
  for(let d=1;d<=count;d++){
    const date=chosenMonth+'-'+pad(d),btn=elem('button','planner-day',String(d));btn.type='button';btn.setAttribute('aria-label',dayLabel(date));btn.setAttribute('aria-pressed',String(date===chosenDate));
    if(date===saToday())btn.classList.add('today');if(date===chosenDate)btn.classList.add('chosen');
    if(grouped.has(date)){btn.classList.add('eventful');btn.title=String(grouped.get(date))+' حدث';}
    btn.onclick=()=>{chosenDate=chosenDate===date?'':date;render();};
    grid.append(btn);
  }
}
function render(){
  container.querySelector('#planner-current-month').textContent=monthLabel(chosenMonth);
  const current=rows.filter(e=>e.month===chosenMonth);
  container.querySelector('#planner-month-count').textContent=String(current.length)+' '+translate('موعد');
  const rail=container.querySelector('#planner-months');rail.replaceChildren();
  for(let k=0;k<horizon;k++){
    const ym=monthPlus(monthKey(fromDate),k),count=rows.filter(r=>r.month===ym).length,btn=elem('button','planner-month');
    btn.type='button';if(ym===chosenMonth)btn.classList.add('active');
    attach(btn,elem('strong','',monthLabel(ym)),elem('small','',String(count)+' '+translate('موعد')));
    btn.setAttribute('aria-pressed',String(ym===chosenMonth));
    btn.onclick=()=>{chosenMonth=ym;chosenDate='';render();};rail.append(btn);
  }
  const q=search.toLocaleLowerCase('ar'),list=container.querySelector('#planner-list');list.replaceChildren();
  const matches=current.filter(e=>(!chosenDate||e.date===chosenDate)&&(kind==='الكل'||e.category===kind)&&(!q||[e.title,e.category,e.item.summary,e.item.details,e.item.notes].filter(Boolean).join(' ').toLocaleLowerCase('ar').includes(q)));
  for(const record of matches){
    const btn=elem('button','planner-event');btn.type='button';
    const badge=elem('span','planner-event-countdown',remainingLabel(record.days));
    const headline=elem('div','planner-event-line');headline.append(elem('strong','',record.title),badge);
    const dateRow=elem('div','planner-event-date');dateRow.append(elem('span','planner-event-day-number',String(Number(record.date.slice(-2)))),elem('span','planner-event-month-name',monthLabel(record.month)));
    const content=elem('div','planner-event-copy');content.append(headline,elem('small','planner-event-category',record.category+' · '+eventType(record.item)));
    btn.append(dateRow,content);
    btn.setAttribute('aria-label',record.title+'، '+dayLabel(record.date)+'، '+remainingLabel(record.days));
    btn.onclick=()=>detail(record);list.append(btn);
  }
  if(!matches.length)list.append(elem('p','planner-empty','لا توجد أحداث مطابقة في هذا الشهر.'));
  container.querySelector('#planner-clear').hidden=!chosenDate;
  renderCalendar();
}
export function mountPlanner(config,selected=saToday()){
  data={...config,counters:[...(config.counters||[])]};fromDate=selected;horizon=[1,3,6,12,24].includes(Number(config.settings?.plannerMonths))?Number(config.settings.plannerMonths):12;rows=futureEvents(data,fromDate,horizon);
  container=document.getElementById('smart-planner');
  if(!container)return;
  if(!container.dataset.initialized){
    const heading=elem('div','planner-heading');
    const h=elem('div','planner-hero-copy');attach(h,elem('span','eyebrow','رزنامة السعودية · المواعيد'),elem('h2','','تقويمك، كل المواعيد'),elem('p','','اختر شهرًا لمتابعة جميع المواعيد وتفاصيلها في مكان واحد.'));
    heading.append(h);
    const range=elem('label','planner-range');range.append(elem('span','planner-range-label','الفترة المعروضة'));
    const rangePicker=elem('select');rangePicker.setAttribute('aria-label','عدد الأشهر القادمة');
    for(const n of [1,3,6,12,24]){const option=elem('option','',n+' شهرًا');option.value=String(n);rangePicker.append(option);}
    rangePicker.value=String(horizon);
    rangePicker.onchange=()=>{horizon=Number(rangePicker.value);rows=futureEvents(data,fromDate,horizon);chosenMonth=monthKey(fromDate);chosenDate='';render();};
    range.append(rangePicker);
    const months=elem('div','planner-months');months.id='planner-months';months.setAttribute('aria-label','اختيار الشهر');
    const content=elem('div','planner-content'),aside=elem('aside','planner-calendar'),right=elem('div','planner-results');
    const top=elem('div','planner-calendar-head');const title=elem('h3');title.id='planner-current-month';
    const counter=elem('small');counter.id='planner-month-count';
    const clear=elem('button','planner-reset','عرض كامل الشهر');clear.type='button';clear.id='planner-clear';
    clear.onclick=()=>{chosenDate='';render();};
    attach(top,attach(elem('div'),title,counter),clear);aside.append(top);
    const days=elem('div','planner-days');days.id='planner-days';aside.append(days);
    const resultsHeading=elem('div','planner-results-heading');resultsHeading.append(elem('h3','','مواعيد الشهر'));right.append(resultsHeading);
    const filters=elem('div','planner-filters');
    const searchBox=elem('label','planner-field','ابحث عن موعد');const input=elem('input');input.type='search';input.placeholder='ابحث باسم الحدث...';
    input.setAttribute('aria-label','البحث في المواعيد');input.oninput=()=>{search=input.value;render();};searchBox.append(input);
    const categoryBox=elem('label','planner-field','الفئة');const select=elem('select');
    let choices=['الكل',...new Set((data.counters||[]).filter(c=>c.enabled!==false&&c.mode!=='manual').map(c=>c.category||eventType(c)))];
    for(const choice of choices){const op=elem('option','',choice);op.value=choice;select.append(op);}
    select.onchange=()=>{kind=select.value;render();};categoryBox.append(select);
    attach(filters,searchBox,categoryBox);right.append(filters);
    const list=elem('div','planner-list');list.id='planner-list';right.append(list);
    attach(content,aside,right);const sectionTitle=elem('div','planner-months-heading');sectionTitle.append(elem('h3','','الشهور'),range);const monthSection=elem('section','planner-months-section');monthSection.append(sectionTitle,months);attach(container,heading,monthSection,content);
    dialog=elem('dialog','planner-dialog');document.body.append(dialog);
    container.dataset.initialized='true';
  }
  if(!chosenMonth||chosenMonth<monthKey(fromDate)||chosenMonth>=monthPlus(monthKey(fromDate),horizon))chosenMonth=monthKey(fromDate);
  const rangeSelect=container.querySelector('.planner-range select');if(rangeSelect)rangeSelect.value=String(horizon);
  chosenDate='';render();
}
