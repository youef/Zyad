const layouts=[
 ['blue-agenda','الأجندة الزرقاء','قائمة زرقاء وأيقونات وعدادات جانبية','#2b71bd','#eef5fc','blue','tajawal'],
 ['mint-schedule','مواعيد بالنعناع','بطاقات مواعيد هادئة وتاريخان لكل حدث','#237c66','#edf6f1','mint','cairo'],
 ['rainbow-brush','ألوان اليوم','مسحات لونية وأيقونات أصلية للمواعيد','#087c69','#fffaf0','brush','tajawal'],
 ['saudi-list','جدول الدار','قائمة سعودية بأيقونات دائرية وتفاصيل واضحة','#116548','#f5f8f1','saudi','kufi'],
 ['financial-table','دفتر الاستحقاق','جدول مالي بالأيام والتواريخ والأرقام','#2a505f','#f1f5f6','table','cairo'],
 ['metro-timeline','مسار المواعيد','خط زمني مترابط لكل موعد','#686194','#f5f2fa','timeline','tajawal'],
 ['magazine-columns','نافذة يومية','عمودان تحريريّان وتوقيع طباعي','#233f37','#faf7ed','columns','amiri'],
 ['week-journal','مفكرة الأسبوع','ترويسة أسبوعية ومواعيد بأسلوب الدفتر','#527d73','#f0f5ec','week','cairo'],
 ['postcard-calendar','بريد اليوم','قصاصات وتذاكر متوازنة للموعد','#ae704f','#fcf1e5','tickets','amiri'],
 ['mono-calendar','حبر وأرقام','أبيض وأسود وتباين طباعي عالٍ','#212529','#faf9f5','mono','kufi'],
 ['lilac-agenda','أجندة بنفسجية','ملاحظات لونية ودبابيس رقمية','#7e5b96','#f8f2fa','notes','tajawal'],
 ['desert-journal','يوميات الرمل','دفتر دافئ بخط نسخي وأيقونات نحاسية','#8c6340','#fbf2df','sand','amiri']
];
export const LIST_PRESETS=layouts.map(([id,name,description,green,cream,style,fontFamily],i)=>({id,name,description,category:'قوائم وأجندات',symbol:'▤',fontFamily,theme:{green,cream,greenLight:green,gold:i===9?'#808780':'#b99858',ink:i===9?'#212529':green},calendar:{header:id+'-header',grid:id+'-rows',columns:style==='columns'?2:1,headerHeight:400,dark:false,index:30+i,version:4,layout:'list',listStyle:style}}));
