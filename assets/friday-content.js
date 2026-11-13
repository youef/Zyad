/* Friday-only rotation: general remembrance is not claimed as Friday-specific Sunnah. */
export const FRIDAY_HADITHS=Object.freeze([
 {id:'fj-h01',text:'خير يوم طلعت عليه الشمس يوم الجمعة',textEn:'The best day on which the sun has risen is Friday.',reference:'صحيح مسلم 854a',referenceEn:'Sahih Muslim 854a',url:'https://sunnah.com/muslim:854a',excerpt:true},
 {id:'fj-h02',text:'فأكثروا علي من الصلاة فيه فإن صلاتكم معروضة علي',textEn:'Send more blessings upon me on Friday, for your blessings are presented to me.',reference:'سنن أبي داود 1047 — صحيح',referenceEn:'Sunan Abi Dawud 1047 — Sahih',url:'https://sunnah.com/abudawud:1047',excerpt:true},
 {id:'fj-h03',text:'إذا قلت لصاحبك يوم الجمعة أنصت والإمام يخطب فقد لغوت',textEn:'If you tell someone to be quiet while the Friday sermon is being delivered, you have engaged in idle talk.',reference:'صحيح البخاري 934',referenceEn:'Sahih al-Bukhari 934',url:'https://sunnah.com/bukhari:934',excerpt:true},
 {id:'fj-h04',text:'من صلى علي واحدة صلى الله عليه عشرا',textEn:'Whoever sends one blessing upon me, Allah sends ten blessings upon him.',reference:'صحيح مسلم 408',referenceEn:'Sahih Muslim 408',url:'https://sunnah.com/muslim:408',excerpt:true}
]);
export const FRIDAY_DHIKR=Object.freeze([
 {id:'fj-z01',text:'سبحان الله وبحمده',textEn:'Glory and praise be to Allah.'},
 {id:'fj-z02',text:'أستغفر الله وأتوب إليه',textEn:'I seek Allah’s forgiveness and repent to Him.'},
 {id:'fj-z03',text:'لا حول ولا قوة إلا بالله',textEn:'There is no power nor strength except through Allah.'},
 {id:'fj-z04',text:'سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر',textEn:'Glory be to Allah, praise be to Allah, none is worthy of worship but Allah, and Allah is greatest.'},
 {id:'fj-z05',text:'سبحان الله العظيم، سبحان الله وبحمده',textEn:'Glory be to Allah the Magnificent; glory and praise be to Allah.'},
 {id:'fj-z06',text:'لا إله إلا الله وحده لا شريك له',textEn:'None is worthy of worship but Allah alone, without partner.'}
]);
export const FRIDAY_SALAWAT=Object.freeze([
 {id:'fj-s01',text:'اللهم صل وسلم على نبينا محمد',textEn:'O Allah, send blessings and peace upon our Prophet Muhammad.'},
 {id:'fj-s02',text:'اللهم صل على محمد وعلى آل محمد',textEn:'O Allah, bless Muhammad and the family of Muhammad.'},
 {id:'fj-s03',text:'اللهم صل وسلم وبارك على محمد',textEn:'O Allah, bless Muhammad and grant him peace and blessings.'},
 {id:'fj-s04',text:'اللهم صل وسلم على رسول الله محمد',textEn:'O Allah, send blessings and peace upon the Messenger Muhammad.'}
]);
export const FRIDAY_DUAS=Object.freeze([
 {id:'fj-d01',text:'اللهم اغفر لنا وارحمنا واهدنا لما تحب وترضى',textEn:'O Allah, forgive us, have mercy on us and guide us to what pleases You.'},
 {id:'fj-d02',text:'اللهم ارزقنا الطمأنينة وحسن الخاتمة وتقبل منا صالح الأعمال',textEn:'O Allah, grant us peace of heart, a good end, and accept our good deeds.'},
 {id:'fj-d03',text:'اللهم أصلح قلوبنا ويسر أمورنا وبارك لنا في أوقاتنا',textEn:'O Allah, make our hearts sound, ease our affairs and bless our time.'},
 {id:'fj-d04',text:'اللهم اجعلنا من أهل الذكر والشكر وحسن العبادة',textEn:'O Allah, make us among those who remember and thank You and worship You well.'}
]);
const mod=(n,d)=>(n%d+d)%d;
export function isFridayDate(iso){return /^\d{4}-\d{2}-\d{2}$/.test(iso)&&new Date(iso+'T12:00:00Z').getUTCDay()===5;}
export function fridayContent(iso,offset=0,excludedIds=[]){
 if(!isFridayDate(iso))return null;
 const week=Math.floor(Date.parse(iso+'T12:00:00Z')/604800000),seed=Math.trunc(Number(offset)||0);
 const excluded=new Set(excludedIds),hadithPool=FRIDAY_HADITHS.filter(item=>!excluded.has(item.id));
 const pick=(items,step)=>items.length?items[mod(week+seed+step,items.length)]:null;
 const hadith=pick(hadithPool,0),dhikr=pick(FRIDAY_DHIKR,1),salawat=pick(FRIDAY_SALAWAT,2),supplication=pick(FRIDAY_DUAS,3);
 const dua={id:'fj-combined-'+dhikr.id+'-'+salawat.id,type:'friday',text:dhikr.text+' • '+salawat.text,textEn:dhikr.textEn+' • '+salawat.textEn,reference:'ذكر عام • صلاة على النبي ﷺ',referenceEn:'General remembrance • Blessings on the Prophet'};
 return {special:'friday',hadith,dhikr,salawat,supplication,dua};
}
