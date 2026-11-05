// Stable v2 templates: every preview and download uses engine.js.
export const SIZES = [[1080,1920],[1080,1080],[1080,1350],[1920,1080]];
const specs = [
 ['saudi-emerald','زمرد السعودية','سعودي','يومٌ يشبه طموحك','مساحة لأحلام كبيرة','#123f35','#f6e6c5','arch'],
 ['royal-gold','أثر ملكي','ملكي','للحظات التي تستحق','تفاصيل صغيرة، أثر لا يُنسى','#123e31','#f1d3a0','center'],
 ['islamic-geometry','تناغم','إسلامي','طمأنينة','اجعل للسكينة مكانًا في يومك','#193e45','#254951','top'],
 ['ivory-modern','مساحة بيضاء','عصري','بداية جديدة','كل يوم فرصة لصنع شيء جميل','#f4eee1','#304c43','editorial'],
 ['midnight','بعد المساء','ليلي','هدوء المساء','لحظة لك، بعيدًا عن ضجيج اليوم','#131d34','#efe2c6','center'],
 ['desert-sands','رمل وضياء','صحراوي','على مهل','للأشياء الجميلة وقتها','#e4c7a2','#523c2f','editorial'],
 ['najdi','حكاية نجد','تراث','من أرضنا','حكاية نعتز بها وتفاصيل تشبهنا','#a87853','#5c3a21','arch'],
 ['national-day','دارنا','وطني','لنا في الدار حكاية','فخر يمتد، وطموح يتجدد','#0b583d','#f8edce','top'],
 ['founding-day','جذور راسخة','تأسيس','جذورنا حكاية','اعتزاز بالماضي وشغف بالمستقبل','#765541','#533b26','editorial'],
 ['ramadan','ليالي رمضان','رمضان','رمضان مبارك','أيام تحمل النور والسكينة','#143c42','#ecd4a1','arch'],
 ['eid','بهجة العيد','عيد','عيدكم بهجة','كل عام وأنتم ومن تحبون بخير','#ede2c8','#365b48','center'],
 ['friday','نور الجمعة','جمعة','جمعة طيبة','أمنيات بالخير والطمأنينة لكم','#e9eee1','#2c5144','arch'],
 ['remembrance','لحظة تأمل','عبارات','الحمد لله','على النعم الصغيرة والأيام الجميلة','#eee5d8','#5a5546','center'],
 ['salary','موعدك القادم','مواعيد','موعد ننتظره','أضف موعدك وتابع الأيام المتبقية','#234b48','#fff1cc','countdown'],
 ['school','خطوة معرفة','مدرسة','عامٌ مليء بالاكتشاف','كل سؤال بداية لفكرة','#e8d9b5','#355745','top'],
 ['graduation','وصلتَ للحلم','تخرج','مبارك التخرج','فخورون بخطواتك، والقادم أجمل','#183b35','#f4d79b','portrait'],
 ['wedding','وعدٌ جميل','زواج','بارك الله لكما','بداية حكاية تجمع قلبين','#eee4d6','#6d6250','arch'],
 ['newborn','أهلًا بالصغير','مولود','أهلًا بالحياة','نور صغير، وفرحة تملأ البيت','#e3e9df','#4a665b','portrait'],
 ['success','فرحة إنجاز','نجاح','تستحق هذا الفرح','للجهد ثمرة، وللنجاح حكاية','#472f44','#f3dbbd','center'],
 ['business','توقيع العلامة','تجاري','تفاصيل تصنع الفرق','منتجك هنا • أضف وصفًا مختصرًا','#e9e2d5','#263e35','business'],
 ['winter','دفء الشتاء','شتاء','بردٌ ودفء','لحظات دافئة في أيام هادئة','#2f4a59','#304c5b','editorial'],
 ['summer','أيام الشمس','صيف','للصيف حكاية','ضوء، وخفة، وأيام جميلة','#f0d6a0','#735237','top'],
 ['countdown','لحظة اقتراب','عد تنازلي','نقترب من الفرح','كل يوم يقربنا من اللحظة','#263e3b','#f3ddaf','countdown'],
 ['personal-story','يوميات','شخصي','هذه لحظتي','تفاصيل اليوم التي أحب أن أتذكرها','#d4dfd2','#355143','portrait']
];
export const templates=specs.map(([id,name,category,title,subtitle,bg,ink,layout],i)=>({
 id,name,category,description:`${name} · تكوين ${layout==='arch'?'معماري':layout==='editorial'?'تحريري':'معاصر'} قابل للتحرير`,version:2,updatedAt:'2026-11-04',supportedSizes:SIZES,
 background:{color:bg,asset:`assets/backgrounds/${id}.webp`},layout,
 safeAreas:{top:.12,bottom:.12,sides:.08},defaultValues:{title,subtitle},assets:[`assets/backgrounds/${id}.png`],
 layers:[
  {id:'tag',type:'text',text:'بطاقتي الذكية',x:.5,y:.19,size:27,color:ink,weight:500,width:.8},
  {id:'title',type:'text',text:title,x:layout==='editorial'?.64:.5,y:layout==='top'?.32:.4,size:94,color:ink,weight:800,width:layout==='editorial'?.58:.8,align:layout==='editorial'?'right':'center'},
  {id:'subtitle',type:'text',text:subtitle,x:.5,y:.53,size:35,color:ink,weight:500,width:.78},
  ...(layout==='countdown'?[{id:'count',type:'countdown',text:'',target:'',x:.5,y:.64,size:132,color:ink,width:.8}]:[]),
  ...(['portrait','business'].includes(layout)?[{id:'photo',type:'shape',shape:'circle',x:.5,y:.65,width:.23,height:.16,color:ink,opacity:.12}]:[]),
  {id:'gregorian',type:'gregorian',x:.5,y:.76,size:28,color:ink,width:.8},
  {id:'hijri',type:'hijri',x:.5,y:.8,size:23,color:ink,width:.8},
  {id:'signature',type:'watermark',text:'ZYAD SMART CARDS',x:.5,y:.87,size:19,color:ink,width:.7}
 ]
}));
export const templateById=id=>templates.find(t=>t.id===id)||templates[0];
// Layouts are normalized, so changing ratio never stretches the text or photographs.
for(const [i,t]of templates.entries()){
 const by=id=>t.layers.find(l=>l.id===id),variation=(i%3-1)*.018;
 if(t.layout==='top'){by('title').y=.31+variation;by('subtitle').y=.44;by('tag').y=.18;}
 if(t.layout==='editorial'){for(const l of t.layers.filter(l=>['title','subtitle','tag','gregorian','hijri'].includes(l.id))){l.x=.59;l.align='right';l.width=.64;}by('title').y=.35+variation;by('subtitle').y=.5;}
 if(t.layout==='arch'){by('tag').y=.24;by('title').y=.405+variation;by('subtitle').y=.535;}
 if(t.layout==='center'){by('title').y=.41+variation;by('subtitle').y=.55;}
 if(['portrait','business'].includes(t.layout)){by('title').y=.32;by('subtitle').y=.43;by('photo').y=.61;by('photo').height=.17;by('photo').width=.29;}
 if(t.layout==='countdown'){by('title').y=.33;by('subtitle').y=.45;by('count').y=.61;}
}
export function createDesign(id=templates[0].id,date=new Date().toISOString().slice(0,10)){
 const t=structuredClone(templateById(id));
 const count=t.layers.find(l=>l.type==='countdown');if(count)count.target=new Date(Date.parse(date+'T12:00:00Z')+30*86400000).toISOString().slice(0,10);
 return {...t,id:crypto.randomUUID(),templateId:t.id,name:t.name,dimensions:[1080,1920],date,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'draft',version:2};
}
