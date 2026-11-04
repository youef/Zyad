
import {isoAdd,daysBetween,hijriDate,saToday} from './card.js?v=20261104r4';

const re=/^\d{4}-\d{2}-\d{2}$/;
const pad=n=>String(n).padStart(2,'0');
const monthKey=iso=>iso.slice(0,7);
function monthPlus(key,n){const [y,m]=key.split('-').map(Number);const d=new Date(Date.UTC(y,m-1+n,1,12));return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1);}
function real(iso){if(!re.test(iso))return false;const d=new Date(iso+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===iso;}
const maxDay=(y,m)=>new Date(Date.UTC(y,m,0)).getUTCDate();
export const dayLabel=iso=>new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Riyadh'}).format(new Date(iso+'T12:00:00Z'));
export const monthLabel=key=>new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{month:'long',year:'numeric',timeZone:'Asia/Riyadh'}).format(new Date(key+'-01T12:00:00Z'));
export const eventType=i=>i.mode==='monthly'?'شهري':i.mode==='hijri'?'هجري':i.mode==='manual'?'يدوي':i.repeat==='yearly'?'سنوي':'مرة واحدة';
export const remainingLabel=n=>n===0?'اليوم':n===1?'غدًا':'بعد '+n+' يوم';
export function nextEventDates(item,fromIso,months=12){
  if(!item||item.enabled===false||item.mode==='manual'||!real(fromIso))return [];
  const end=monthPlus(monthKey(fromIso),months)+'-01',found=[];
  if(item.mode==='monthly'){
    for(let k=0;k<months;k++){
      const ym=monthPlus(monthKey(fromIso),k),[y,m]=ym.split('-').map(Number);
      const d=Math.min(maxDay(y,m),Math.max(1,Math.floor(Number(item.day)||1))),date=ym+'-'+pad(d);
      if(date>=fromIso&&date<end)found.push(date);
    }
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
  for(const item of cfg.counters||[]){
    for(const date of nextEventDates(item,fromIso,months)){
      out.push({item,date,month:monthKey(date),days:daysBetween(fromIso,date),title:item.label||'موعد',category:item.category||eventType(item)});
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
  for(const [k,v]of [['الميلادي',dayLabel(record.date)],['الهجري',hijriDate(record.date,data)],['المتبقي',remainingLabel(record.days)],['التكرار',eventType(item)]]){
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
  view.onclick=()=>{dialog.close();const input=document.getElementById('chosen-date');if(input){input.value=record.date;input.dispatchEvent(new Event('change'));}document.getElementById('poster-section')?.scrollIntoView({behavior:'smooth'});};
  actions.append(view);
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
  const href=validHref(item.link);if(href){const link=elem('a','btn secondary','رابط الجهة');link.href=href;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);}
  attach(dialog,close,hero,facts,body,future,actions);
  dialog.showModal();
}
function renderCalendar(){
  const grid=container.querySelector('#planner-days');grid.replaceChildren();
  const [y,m]=chosenMonth.split('-').map(Number),start=new Date(Date.UTC(y,m-1,1)).getUTCDay(),count=maxDay(y,m);
  for(const day of ['ح','ن','ث','ر','خ','ج','س'])grid.append(elem('span','planner-weekday',day));
  for(let k=0;k<start;k++)grid.append(elem('span','planner-spacer'));
  const grouped=new Map();
  for(const r of rows.filter(e=>e.month===chosenMonth))grouped.set(r.date,(grouped.get(r.date)||0)+1);
  for(let d=1;d<=count;d++){
    const date=chosenMonth+'-'+pad(d),btn=elem('button','planner-day',String(d));btn.type='button';
    if(date===saToday())btn.classList.add('today');if(date===chosenDate)btn.classList.add('chosen');
    if(grouped.has(date)){btn.classList.add('eventful');btn.title=String(grouped.get(date))+' حدث';}
    btn.onclick=()=>{chosenDate=chosenDate===date?'':date;render();};
    grid.append(btn);
  }
}
function render(){
  container.querySelector('#planner-current-month').textContent=monthLabel(chosenMonth);
  const current=rows.filter(e=>e.month===chosenMonth);
  container.querySelector('#planner-month-count').textContent=String(current.length)+' أحداث';
  const rail=container.querySelector('#planner-months');rail.replaceChildren();
  for(let k=0;k<horizon;k++){
    const ym=monthPlus(monthKey(fromDate),k),count=rows.filter(r=>r.month===ym).length,btn=elem('button','planner-month');
    btn.type='button';if(ym===chosenMonth)btn.classList.add('active');
    attach(btn,elem('strong','',monthLabel(ym)),elem('small','',String(count)+' أحداث'));
    btn.onclick=()=>{chosenMonth=ym;chosenDate='';render();};rail.append(btn);
  }
  const q=search.toLocaleLowerCase('ar'),list=container.querySelector('#planner-list');list.replaceChildren();
  const matches=current.filter(e=>(!chosenDate||e.date===chosenDate)&&(kind==='الكل'||e.category===kind)&&(!q||[e.title,e.category,e.item.summary,e.item.details,e.item.notes].filter(Boolean).join(' ').toLocaleLowerCase('ar').includes(q)));
  for(const record of matches){
    const btn=elem('button','planner-event');btn.type='button';
    attach(btn,attach(elem('div','planner-event-line'),elem('strong','',record.title),elem('span','',remainingLabel(record.days))),
      elem('small','',dayLabel(record.date)+' · '+eventType(record.item)),
      elem('p','',record.item.summary||'اضغط على الحدث لمعرفة المزيد'));
    btn.onclick=()=>detail(record);list.append(btn);
  }
  if(!matches.length)list.append(elem('p','planner-empty','لا توجد أحداث مطابقة في هذا الشهر.'));
  const next=rows[0];container.querySelector('#planner-next-title').textContent=next?next.title:'لا يوجد';
  container.querySelector('#planner-next-time').textContent=next?remainingLabel(next.days):'—';
  container.querySelector('#planner-total').textContent=String(rows.length);
  container.querySelector('#planner-clear').hidden=!chosenDate;
  renderCalendar();
}
export function mountPlanner(config,selected=saToday()){
  data=config;fromDate=selected;horizon=[6,12,24].includes(Number(config.settings?.plannerMonths))?Number(config.settings.plannerMonths):12;rows=futureEvents(data,fromDate,horizon);
  container=document.getElementById('smart-planner');
  if(!container)return;
  if(!container.dataset.initialized){
    const heading=elem('div','planner-heading');
    const h=elem('div');attach(h,elem('span','eyebrow','تقويم ذكي'),elem('h2','','شهورك القادمة في مكان واحد'),elem('p','','تقويم تفاعلي للشهور الاثني عشر المقبلة، مع تفاصيل كل حدث والعد التنازلي.'));
    const stats=elem('div','planner-stat-row');
    for(const [title,id] of [['أقرب حدث','planner-next-title'],['المتبقي','planner-next-time'],['مجموع المواعيد','planner-total']]){
      const wrap=elem('div','planner-stat');attach(wrap,elem('small','',title),elem('strong','',title==='مجموع المواعيد'?'0':'—'));wrap.querySelector('strong').id=id;stats.append(wrap);
    }
    attach(heading,h,stats);
    const range=elem('label','planner-range','مدى عرض المستقبل');
    const rangePicker=elem('select');rangePicker.setAttribute('aria-label','عدد الأشهر القادمة');
    for(const n of [6,12,24]){const option=elem('option','',n+' شهرًا');option.value=String(n);rangePicker.append(option);}
    rangePicker.value=String(horizon);
    rangePicker.onchange=()=>{horizon=Number(rangePicker.value);rows=futureEvents(data,fromDate,horizon);chosenMonth=monthKey(fromDate);chosenDate='';render();};
    range.append(rangePicker);
    const months=elem('div','planner-months');months.id='planner-months';
    const content=elem('div','planner-content'),aside=elem('aside','planner-calendar'),right=elem('div','planner-results');
    const top=elem('div','planner-calendar-head');const title=elem('h3');title.id='planner-current-month';
    const counter=elem('small');counter.id='planner-month-count';
    const clear=elem('button','planner-reset','عرض كامل الشهر');clear.type='button';clear.id='planner-clear';
    clear.onclick=()=>{chosenDate='';render();};
    attach(top,attach(elem('div'),title,counter),clear);aside.append(top);
    const days=elem('div','planner-days');days.id='planner-days';attach(aside,days,elem('p','planner-hint','الأيام المميزة تحتوي على مواعيد.'));
    const filters=elem('div','planner-filters');
    const searchBox=elem('label','planner-field','بحث');const input=elem('input');input.type='search';input.placeholder='ابحث باسم الحدث...';
    input.oninput=()=>{search=input.value;render();};searchBox.append(input);
    const categoryBox=elem('label','planner-field','الفئة');const select=elem('select');
    let choices=['الكل',...new Set((data.counters||[]).filter(c=>c.enabled!==false&&c.mode!=='manual').map(c=>c.category||eventType(c)))];
    for(const choice of choices){const op=elem('option','',choice);op.value=choice;select.append(op);}
    select.onchange=()=>{kind=select.value;render();};categoryBox.append(select);
    attach(filters,searchBox,categoryBox);right.append(filters);
    const list=elem('div','planner-list');list.id='planner-list';right.append(list);
    attach(content,aside,right);attach(container,heading,range,months,content);
    dialog=elem('dialog','planner-dialog');document.body.append(dialog);
    container.dataset.initialized='true';
  }
  if(!chosenMonth||chosenMonth<monthKey(fromDate)||chosenMonth>=monthPlus(monthKey(fromDate),horizon))chosenMonth=monthKey(fromDate);
  const rangeSelect=container.querySelector('.planner-range select');if(rangeSelect)rangeSelect.value=String(horizon);
  chosenDate='';render();
}
