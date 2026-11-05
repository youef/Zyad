import {templates} from './catalog.js';
// Every entry specifies a different calendar composition, not only a palette.
const compositions=[
 ['arch','medallion',4,500,'قوس معماري وعدادات ميدالية'],
 ['crown','diamonds',4,470,'تاج ملكي وعدادات ألماسية'],
 ['geometry','stars',4,440,'شبكة هندسية ونجوم ثمانية'],
 ['editorial','columns',3,450,'صفحة تحريرية وأعمدة أرقام'],
 ['moon','orbits',4,490,'قمر مضيء ومدارات ليلية'],
 ['dunes','waves',3,460,'طبقات رملية وأشرطة منحنية'],
 ['najdi','battlements',4,470,'بوابة نجدية وأبراج تراثية'],
 ['flag','chevrons',4,450,'راية ممتدة ومسارات صاعدة'],
 ['roots','stamps',4,500,'نافذة تراثية وأختام ورقية'],
 ['lantern','lanterns',4,500,'مشكاة رمضان وفوانيس للمواعيد'],
 ['ribbon','gifts',4,460,'شريط احتفال وبطاقات هدايا'],
 ['dome','arches',4,500,'محراب هادئ وأقواس للمواعيد'],
 ['statement','minimal',3,430,'تكوين طباعي نقي ومواعيد مفتوحة'],
 ['ledger','ledger',3,440,'دفتر مواعيد وصفوف مالية'],
 ['notebook','notebook',4,460,'ورقة مدرسية وفواصل دفترية'],
 ['laurel','badges',4,490,'إكليل إنجاز ودروع المواعيد'],
 ['invitation','petals',4,500,'دعوة أنيقة وتفاصيل زهرية'],
 ['cloud','clouds',4,470,'غيمة ناعمة ومواعيد مستديرة'],
 ['celebration','rays',4,460,'وسام نجاح وأشعة احتفال'],
 ['brand','mono',3,430,'هوية تجارية ووحدات هندسية'],
 ['frost','glass',4,490,'نافذة شتوية وبطاقات زجاجية'],
 ['sun','sunburst',4,460,'قرص شمس ومواعيد مشعة'],
 ['spotlight','rings',4,500,'موعد بارز وحلقات تنازلية'],
 ['polaroid','frames',4,490,'قصاصة يومية وإطارات للذكريات']
];
const darkIds=new Set(['saudi-emerald','royal-gold','midnight','national-day','ramadan','salary','graduation','success','countdown']);
export const CALENDAR_PRESETS=templates.map((t,i)=>{const [header,grid,columns,headerHeight,description]=compositions[i],dark=darkIds.has(t.id),accent=dark?t.background.color:t.layers[0].color;return {
 id:t.id,name:t.name,description,category:t.category,symbol:'✦',
 theme:{green:accent,greenLight:dark?'#96bba9':'#778a76',gold:i===4||i===20?'#b4c7d5':'#b99255',cream:dark?t.background.color:'#f8f3e7',ink:dark?'#f4e7ce':t.layers[0].color},
 calendar:{header,grid,columns,headerHeight,dark,background:t.background.asset,original:t.assets[0],index:i,version:3}
};});
export const CLASSIC_COMPOSITIONS={
 royal:{header:'crest',grid:'royal',columns:4,headerHeight:490,dark:false,index:24,version:3},
 modern:{header:'swiss',grid:'swiss',columns:3,headerHeight:450,dark:false,index:25,version:3},
 night:{header:'eclipse',grid:'eclipse',columns:4,headerHeight:490,dark:true,index:26,version:3},
 desert:{header:'landscape',grid:'terraces',columns:4,headerHeight:470,dark:false,index:27,version:3},
 pearl:{header:'pearl',grid:'pearls',columns:4,headerHeight:480,dark:false,index:28,version:3}
};
