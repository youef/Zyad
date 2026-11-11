// Central visitor localization for interactive UI and exported card artwork.
// English labels for published events are explicit; custom user text is never
// silently replaced by a meaningless automatic translation.
const names={
 ramadan:'Ramadan',salary:'Salary',uni:'University Stipend',
 retirement:'Pension',social:'Social Security',citizen:'Citizen Account',
 hafez:'Hafiz Allowance',rehab:'Rehabilitation Allowance',
 insurance:'Social Insurance',housing:'Housing Support',
 farming:'Agricultural Support',tamheer:'Tamheer Stipend',
 summer:'Summer',winter:'Midyear School Holiday',autumn:'Autumn Holiday',spring:'Spring'
};
const map={
 'المواعيد والعدّادات':'Events & Countdowns','المواعيد والعدادات':'Events & Countdowns',
 'المواعيد القادمة':'Upcoming Events','مواعيدك القادمة':'Upcoming Events',
 'الأقرب: ':'Next: ','الأقرب':'Next','الأقرب:':'Next:',
 'موعد':'Event','موعد جديد':'New Event','مواعيد':'Events','يوم':'Days','اليوم':'Today','غدًا':'Tomorrow','قيمة':'Value',
 'لا توجد مواعيد مضافة':'No events added','لا توجد مواعيد في هذا القسم.':'No events here.',
 'لا توجد أحداث مطابقة في هذا الشهر.':'No matching events this month.',
 'اضغط لعرض الموعد والتفاصيل':'Tap to view event details',
 'كل المواعيد':'All Events','الكل':'All','المفضلة':'Favorites','الاستحقاقات':'Payments',
 'مواعيدك اليومية':'Your Daily Schedule','مواعيدك… على مهل':'Your Dates, at Your Pace',
 'بطاقتك اليومية':'Your Daily Card','بطاقة اليوم':'Daily Card','رزنامة السعودية':'Saudi Calendar',
 'بطاقات منشورة للجميع':'Public Cards','بطاقتك اليومية':'Daily Card',
 'الأحد':'Sunday','الإثنين':'Monday','الاثنين':'Monday','الثلاثاء':'Tuesday','الأربعاء':'Wednesday','الخميس':'Thursday','الجمعة':'Friday','السبت':'Saturday',
 'يناير':'January','فبراير':'February','مارس':'March','أبريل':'April','مايو':'May','يونيو':'June',
 'يوليو':'July','أغسطس':'August','سبتمبر':'September','أكتوبر':'October','نوفمبر':'November','ديسمبر':'December',
 'محرم':'Muharram','صفر':'Safar','ربيع الأول':'Rabi I','ربيع الآخر':'Rabi II','جمادى الأولى':'Jumada I','جمادى الآخرة':'Jumada II',
 'رجب':'Rajab','شعبان':'Shaban','رمضان':'Ramadan','شوال':'Shawwal','ذو القعدة':'Dhu al-Qadah','ذو الحجة':'Dhu al-Hijjah',
 'هجري':'Hijri','ميلادي':'Gregorian','تقديري':'Estimated','الأقرب:':'Next:',
 'مكافأة الجامعة':'University Stipend','الراتب':'Salary','التقاعد':'Pension','الضمان':'Social Security',
 'حساب المواطن':'Citizen Account','حافز':'Hafiz Allowance','التأهيل':'Rehabilitation Allowance',
 'التأمينات':'Social Insurance','الدعم السكني':'Housing Support',
 'الدعم الزراعي':'Agricultural Support','تمهير':'Tamheer Stipend',
 'الصيف':'Summer','إجازة منتصف العام الدراسي':'Midyear School Holiday','إجازة الخريف':'Autumn Holiday','الربيع':'Spring',
 'متى الراتب':'Salary Date','مواعيد الصرف':'Payment Dates',
 'المواعيد تقديرية؛ راجع الجهة الرسمية':'Dates are estimates; verify with official sources',
 'المواعيد تقديرية؛ التفاصيل ومصدر الموعد في كل حدث.':'Dates are estimates. Check each event source.',
 'المواعيد تقديرية وتراجع مع الجهات الرسمية':'Estimated dates; check official sources',
 'المواعيد التقديرية تُراجع مع الجهات الرسمية':'Estimated dates; check official sources',
 'امسح للمتابعة':'Scan to Follow','تابع جديد البطاقات يوميًا':'New Cards Every Day',
 'للاشتراك والمتابعة بالبطاقة اليومية':'Subscribe & Follow Daily Cards',
 'واتساب':'WhatsApp','سناب شات':'Snapchat',
 'لا يوجد':'None','مخصص':'Custom','شهري':'Monthly','سنوي':'Yearly','مرة واحدة':'One-time',
 'التكرار':'Repeat','المتبقي':'Remaining','المنطقة الزمنية':'Time Zone','حالة الموعد':'Event Status',
 'التاريخ':'Date','الجهة / المكان':'Organization / Place','ملاحظات':'Notes',
 'المواعيد المقبلة':'Upcoming Dates','تفاصيل هذا الحدث':'Event Details',
 'تُحفظ الخيارات تلقائيًا على هذا الجهاز.':'Preferences are saved on this device.',
 'التصاميم':'Designs','المزيد':'More','الإعدادات':'Settings',
 'الموافق':'Due','تطبيق الرزنامة':'Calendar App','كل يوم، بداية جميلة':'Every day, a fresh start',
 'مواعيدك، بكل وضوح.':'Your dates, made clear.',
 'عند انتهاء':'At the End','يوم':'Day','يومان':'Two Days'
};
const byLabel=Object.fromEntries(Object.entries(names).map(([id,n])=>[id,n]));
export function getLanguage(){
 try{return typeof localStorage!=='undefined'&&localStorage.getItem('zyad-language')==='en'?'en':'ar';}
 catch{return 'ar';}
}
export const isEnglish=()=>getLanguage()==='en';
export function translate(value,lang=getLanguage()){
 if(lang!=='en'||value==null)return value;
 const s=String(value),trimmed=s.trim();
 if(Object.prototype.hasOwnProperty.call(map,trimmed))return s.replace(trimmed,map[trimmed]);
 const next=s.match(/^الأقرب:\s*(.+)$/);
 if(next)return 'Next: '+translate(next[1],lang);
 const due=s.match(/^بعد\s+(\d+)\s+يوم$/);
 if(due)return 'In '+due[1]+' days';
 const estimated=s.match(/^(.*)\s+·\s+تقديري$/);
 if(estimated)return translate(estimated[1],lang)+' · Estimated';
 return s;
}
export function eventLabel(item,lang=getLanguage()){
 if(lang!=='en')return item.label||'موعد';
 if(typeof item.labelEn==='string'&&item.labelEn.trim())return item.labelEn.trim();
 return byLabel[item.id]||translate(item.label||'Event',lang);
}
export function localizedConfig(config,lang=getLanguage()){
 if(lang!=='en'||!config)return config;
 const c={...config,brand:{...config.brand},card:{...config.card},follow:{...config.follow}};
 c.counters=(config.counters||[]).map(i=>({
  ...i,label:eventLabel(i,'en'),
  summary:i.summaryEn||translate(i.summary||'','en'),
  details:i.detailsEn||translate(i.details||'','en')
 }));
 c.brand.name=c.brand.nameEn||'Saudi Calendar';
 c.brand.subtitle=c.brand.subtitleEn||'Your daily calendar';
 c.card.quote=c.card.quoteEn||'Find meaning in each new day.';
 c.card.attribution=c.card.attributionEn||'';
 c.card.footer=c.card.footerEn||'Daily Card';
 c.card.promo=c.card.promoEn||'Your Daily Calendar';
 c.card.disclaimer=c.card.disclaimerEn||'Estimated dates; verify with official sources';
 c.follow.title=c.follow.titleEn||'Subscribe & Follow';
 c.follow.subtitle=c.follow.subtitleEn||'New Cards Every Day';
 c.follow.qrCaption=c.follow.qrCaptionEn||'Scan to Follow';
 return c;
}
export function localeDate(iso,opts={dateStyle:'long'},calendar='gregory',lang=getLanguage()){
 return new Intl.DateTimeFormat(lang==='en'?'en-US-u-ca-'+calendar:'ar-SA-u-ca-'+(calendar==='gregory'?'gregory':'islamic-umalqura'),
 {...opts,timeZone:'Asia/Riyadh'}).format(new Date(iso+'T12:00:00Z'));
}
export function localizeVisible(root=document){
 if(getLanguage()!=='en')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  if(node.parentElement?.closest('script,style,textarea,svg,[data-no-translate]'))continue;
  const changed=translate(node.nodeValue,'en');
  if(changed!==node.nodeValue)node.nodeValue=changed;
 }
}
