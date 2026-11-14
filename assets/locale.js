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

// Public catalogue: English names for every built-in daily and list template.
export const ENGLISH_PRESET_NAMES=Object.freeze({
 royal:'Saudi Royal',modern:'Modern',night:'Night',desert:'Royal Desert',pearl:'Pearl',heritage:'Heritage',
 'saudi-emerald':'Saudi Emerald','royal-gold':'Royal Gold','islamic-geometry':'Harmony',
 'ivory-modern':'Ivory Modern','midnight':'After Dark','desert-sands':'Sand & Light',
 najdi:'Najdi Story','national-day':'Our Homeland','founding-day':'Deep Roots',
 ramadan:'Ramadan Nights',eid:'Eid Joy',friday:'Friday Light',remembrance:'Reflection',
 salary:'Your Next Date',school:'Learning Journey',graduation:'A Dream Achieved',
 wedding:'A Beautiful Promise',newborn:'Welcome Little One',success:'Achievement',
 business:'Brand Signature',winter:'Winter Warmth',summer:'Sunny Days',
 countdown:'Countdown Moment','personal-story':'Daily Journal',
 'blue-agenda':'Blue Agenda','mint-schedule':'Mint Schedule','rainbow-brush':'Colors of the Day',
 'saudi-list':'Saudi Schedule','financial-table':'Payments Ledger','metro-timeline':'Events Timeline',
 'magazine-columns':'Daily Window','week-journal':'Weekly Journal','postcard-calendar':'Daily Postcard',
 'mono-calendar':'Ink & Numbers','lilac-agenda':'Lilac Agenda','desert-journal':'Desert Journal',
 'inspire-botanical':'Floral Inspiration','inspire-royal':'Royal Message','inspire-pearl':'A Day of Light'
});
Object.assign(map,{
 'يومك بين يديك':'Your Day at a Glance','تقويمك… كل المواعيد':'Calendar · All Events',
 'من حديث النبي ﷺ':'From the Prophet’s Hadith',
 'دعاء مأثور':'Reported Supplication','دعاء عام':'General Supplication',
 'دعاء عام غير منسوب إلى حديث':'General Supplication (not attributed to a hadith)',
 'كلمة اليوم':'Thought of the Day','رسالة اليوم':'Today’s Message',
 'لحظة إلهام وطمأنينة':'A Moment of Inspiration',
 'حديث ودعاء يتجددان مع تاريخ البطاقة.':'A daily hadith and supplication for your selected date.',
 'نسخ':'Copy','نُسخ النص مع مصدره':'Text and source copied',
 'لا توجد مواعيد مضافة بعد':'No events added yet',

 'تصميم لكل يوم':'A Design for Every Day','أرشيف بطاقاتك':'Card Archive',
 'تصاميمي المفضلة':'Favorite Designs','التصميم المختار حاليًا':'Selected Design',
 'جاهز للعرض والحفظ':'Ready to View & Save',
 'تصفح التصاميم، اختر المفضل لديك، واحفظه مباشرة دون حساب.':'Browse and save your favorite designs without signing in.',
 'بطاقات منشورة للجميع':'Public Cards','اختر تصميمك من المعرض، ثم احفظ الصورة أو أضف التصميم للمفضلة. لا يلزم حساب.':'Choose a design, save it or mark it as a favorite. No account required.',
 'يمكنك الاطلاع على البطاقات وحفظ نسخة منها على جهازك، دون تعديل المحتوى المنشور.':'Browse and save published cards to your device.',
 'متبقي':'Remaining','اليوم':'Today','غدًا':'Tomorrow','موعد':'Event',
 'مواعيدك المفضلة':'Favorite Events','المواعيد القادمة':'Upcoming Events',
 'مواعيدك المفضلة':'Favorite Events','المواعيد المقبلة':'Upcoming Dates',
 'يوميات':'Journal','العدد':'Count','مواعيد الشهر':'Events This Month',
 'أقرب موعد':'Next Event','القادم في تقويمك':'Next on Your Calendar',
 'الكل':'All','المفضلة':'Favorites','الاستحقاقات':'Payments',
 'لا توجد مواعيد قادمة':'No Upcoming Events',
 'تُعرض المواعيد المنشورة عند توفرها':'Published events will appear here',
 'يتم تحديث المواعيد وفق تاريخ اليوم':'Events are updated for today',
 'اضغط على البطاقة لاختيارها':'Tap a card to select',
 'التصاميم المتاحة':'Available Designs','حسب الاسم':'By Name',
 'الافتراضي':'Default','ترتيب':'Sort',
 'المفضلة أولاً':'Favorites First',
 'إضافة إلى المفضلة':'Add to Favorites','إزالة من المفضلة':'Remove from Favorites',
 'اختيار تصميم':'Choose Design',
 'بطاقة اليوم':'Daily Card','عرض البطاقة':'View Card',
 'تحميل المواعيد...':'Loading Events…','جارٍ تجهيز بطاقة يومك…':'Preparing Your Daily Card…',
 'جارٍ توليد البطاقة...':'Rendering Card…',
 'لا توجد أحداث مطابقة في هذا الشهر.':'No matching events this month.',
 'الموعد القادم':'Next Event','الوقت المتبقي':'Time Remaining',
 'تُحفظ على هذا الجهاز ويظهر في التقويم.':'Saved on this device and shown in your calendar.',
 'أضف موعدًا يخصك':'Add Your Event','تعديل موعدك':'Edit Event',
 'اسم الموعد':'Event Name','تاريخ الموعد':'Event Date','تفاصيل الموعد':'Event Details',
 'حفظ الموعد':'Save Event','إلغاء':'Cancel','حذف موعد':'Delete Event',
 'مشاركة الحدث':'Share Event','رابط الجهة / المصدر':'Official Source',
 'إضافة إلى التقويم':'Add to Calendar',
 'الأيام المميزة تحتوي على مواعيد.':'Highlighted dates have events.',
 'الفترة المعروضة':'Displayed Period','اختيار الشهر':'Select Month',
 'اختر الموعد لعرض التفاصيل':'Select an event to see details',
 'الكل':'All','الفئة':'Category','ملخص':'Summary',
 'يوميات الرمل':'Desert Journal','دفتر الاستحقاق':'Benefits Ledger',
 'مسار يومك':'Your Timeline','بريد اليوم':'Daily Postcard',
 'يومك في أرقام':'Your Day in Numbers',
 'تفاصيل كثيرة.':'Many Details.','يوم واحد.':'One Day.',
 'مفكرة المواعيد':'Event Notebook',
 'تستحق أن تتذكّرها.':'Worth Remembering.',
 'باقي الأيام… بألوانها':'Colorful Days Ahead',
 'مواعيدك… أقرب مما تظن':'Your Dates Are Nearer Than You Think'
});
Object.assign(map,{
 'حكمة اليوم':'Thought of the Day','اشترك معنا مجانًا':'Subscribe for Free',
 'يومًا إلى':'Days Until','مواعيدك المهمة':'Important Events',
 'مقتطف من حديث صحيح':'Authentic Hadith Excerpt',
 'يدوي':'Manual','الميلادي':'Gregorian','الهجري':'Hijri',
 'إغلاق':'Close','الوصف':'Description',
 'سياسة عطلة الأسبوع':'Weekend Payment Rule',
 'بدون تعديل':'No Adjustment',
 'راجع المصدر المرفق':'Check the Linked Source',
 'تقديري — راجع الجهة المختصة':'Estimated — Check the Official Provider',
 'لا يوجد وصف إضافي بعد.':'No Additional Description Yet',
 'غير محدد':'Not Specified','لا توجد ملاحظات':'No Notes',
 'موعد منفرد':'One-time Event',
 'عرض بطاقة يوم الحدث':'View Event-Day Card',
 'تعذرت المشاركة':'Unable to Share',
 'إضافة إلى تقويم الجوال':'Add to Phone Calendar',
 'عدد الأشهر القادمة':'Number of Upcoming Months',
 'شهرًا':'Months','استعرض الشهور':'Browse Months',
 'اختر الشهر الذي تريده':'Choose a Month',
 'ابحث باسم الحدث...':'Search by Event Name…',
 'البحث في المواعيد':'Search Events',
 'حدث':'Event','أحداثي':'My Events',
 'المفضلة:':'Favorite:','متبقّي':'Remaining',
 'حذف الموعد':'Delete Event','حُذف الموعد من أحداثك':'Event Deleted',
 'حُفظ موعدك':'Event Saved','الحد الأقصى 100 موعد شخصي':'Limit: 100 Personal Events',
 'تعذر النسخ على هذا الجهاز':'Copy is Unavailable on This Device',
 '✦ تصميم يومي متجدد':'✦ Daily Rotating Design',
 '✦ تفعيل التصميم اليومي':'✦ Enable Daily Design',
 'باقي الأيام… بألوانها':'Days Ahead in Color',
 'مواعيدك… أقرب مما تظن':'Your Events Are Closer Than You Think',
 'المواعيد القادمة':'Upcoming Events',
 'برامج الدعم':'Support Programs','التقاعد':'Pension',
 'المواعيد التقديرية تخضع للجهات الرسمية':'Estimated Dates; Verify With Official Providers',
 'العدد':'Number',
 'رابط متابعة QR غير صالح':'Invalid Follow QR Link',
 'إعدادات الاشتراك غير صالحة':'Invalid Subscription Settings',
 'مكتبة رمز QR غير جاهزة':'QR Library Not Ready',
 'تعذر تحميل إعدادات المتابعة':'Unable to Load Follow Settings',
 'التقويم':'Calendar','الرئيسية':'Home'
});
export function presetName(p,lang=getLanguage()){
 return lang==='en'?(p?.nameEn||ENGLISH_PRESET_NAMES[p?.id]||translate(p?.name||'',lang)):p?.name||'';
}
export function presetDescription(p,lang=getLanguage()){
 if(lang!=='en')return p?.description||'';
 if(p?.descriptionEn)return p.descriptionEn;
 return ({
  royal:'Emerald green with gold details',modern:'Clean shapes and clear contrast',
  night:'Deep colors with golden accents',desert:'Sandy tones with copper details',
  pearl:'Ivory and mint palette',heritage:'Classic medallions and heritage motifs'
 })[p?.id]||'A beautifully composed daily calendar card';
}
Object.assign(map,{
 'المواعيد القادمة':'Upcoming Dates','الأيام المتبقية':'Days Remaining',
 'الأيام المميزة تحتوي على مواعيد.':'Highlighted days contain events.',
 'الفترة المعروضة':'Displayed Period','مواعيد الشهر':'Events This Month',
 'اختر الموعد لعرض التفاصيل':'Select an event to view its details',
 'عرض كامل الشهر':'Show Full Month','ابحث عن موعد':'Search Events','الفئة':'Category',
 'إجمالي المواعيد':'Total Events','الموعد القادم':'Next Event','الوقت المتبقي':'Time Remaining',
 'تقويمك، كل المواعيد':'Your Calendar, All Events',
 'تابع المناسبات والاستحقاقات في تقويم واضح، واعرف ما ينتظرك يومًا بيوم.':'Track dates, payments and events in one clear calendar.',
 'رزنامة السعودية · المواعيد':'Saudi Calendar · Events',
 'مواعيدك المفضلة':'Favorite Events','المواعيد القادمة':'Upcoming Events',
 'المواعيد التقديرية تخضع للجهات الرسمية':'Estimated dates; check official sources',
 'الأيام المتبقية':'Days Left','الأيام':'Days',
 'لا توجد مواعيد مضافة بعد':'No events yet',
 'التاريخ الهجري':'Hijri Date','التقويم الهجري':'Hijri Calendar',
 'يومًا إلى ':'Days to ','مواعيدك المهمة':'Important Events',
 'من جذورنا… إلى يومنا':'From Our Roots to Today',
 'تفاصيل يوم تستحق أن تُحفظ':'A day worth remembering',
 'تقويمك ومواعيدك على مدار العام':'Your Calendar Throughout the Year',
 'المواعيد تقديرية، ويُرجع للجهات الرسمية للتأكد من مواعيد الصرف':'Dates are estimates; verify with official sources',
 'الراعي':'Sponsor','إعلان':'Advertisement',
 'رزنامة السعودية':'Saudi Calendar','بطاقات منشورة للجميع':'Public Cards',
 'تاريخ اليوم':'Today’s Date','تاريخ البطاقة':'Card Date',
 'بطاقتك اليومية':'Daily Card','التقويم الكامل':'Full Calendar',
 'أرشيف البطاقات':'Card Archive','المفضلة':'Favorites',
 'الحفظ':'Save','حفظ الصورة ↓':'Save Image ↓','جارٍ الحفظ…':'Saving…',
 'معاينة التصميم':'Design Preview','جاهز للعرض':'Ready to View',
 'المختار':'Selected','✓ المختار':'✓ Selected',
 'التقويم الكلاسيكي':'Classic Calendar','قوائم وأجندات':'Lists & Agendas',
 'سعودي':'Saudi','ملكي':'Royal','إسلامي':'Islamic','عصري':'Modern',
 'ليلي':'Night','صحراوي':'Desert','تراث':'Heritage','وطني':'National',
 'تأسيس':'Founding Day','رمضان':'Ramadan','عيد':'Eid','جمعة':'Friday',
 'عبارات':'Quotes','مدرسة':'School','تخرج':'Graduation','زواج':'Wedding',
 'مولود':'Newborn','نجاح':'Success','تجاري':'Business','شتاء':'Winter',
 'صيف':'Summer','عد تنازلي':'Countdown','شخصي':'Personal'
});

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
  details:i.detailsEn||translate(i.details||'','en'),
  notes:i.notesEn||translate(i.notes||'','en'),
  category:i.categoryEn||translate(i.category||'','en')
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
