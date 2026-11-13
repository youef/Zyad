/* Premium icon styling for Canvas posters, backed by locally bundled Lucide SVG vectors.
 * All icon graphics render into the exported PNG/JPEG/WebP; no network is used at render time.
 */
import {drawLucideIcon,hasLucideIcon,LUCIDE_CARD_NAMES} from './vendor/lucide-canvas.js?v=awan1';
export const CARD_ICON_NAMES=LUCIDE_CARD_NAMES;
export const CARD_ICON_STYLES=Object.freeze(['glass','royal','duotone','outline']);
const rules=[
 [/ramadan|رمضان|هلال|صيام|الهجري|محرم|عاشور|شعبان|ليلة القدر/, 'moon-star'],
 [/eid|عيد|الفطر|الأضحى|اضحى|تهنئة/, 'gift'],
 [/friday|الجمعة|صلاة|دعاء|ذكر|قرآن|quran/, 'moon-star'],
 [/salary|راتب|الراتب|payroll|معاش|تقاعد|pension/, 'wallet'],
 [/insurance|تأمينات|ضمان|حساب المواطن|دعم|استحقاق|مستحق/, 'banknote'],
 [/uni|جامعة|مكافأة|graduat|تخرج|graduation|شهادة/, 'graduation-cap'],
 [/school|تعليم|مدرس|طلاب|طالب|امتحان|اختبار|الدراسة|دراسي/, 'book-open'],
 [/national|وطن|السعودية|تأسيس|اليوم الوطني|flag/, 'flag'],
 [/winter|شتاء|برد|ثلج/, 'snowflake'],
 [/summer|صيف|حر|مشمس/, 'sun'],
 [/rain|مطر|أمطار|غيم/, 'cloud-rain'],
 [/spring|ربيع|زهور|ورود|flower/, 'flower-2'],
 [/housing|سكن|منزل|بيت|عقار/, 'house'],
 [/wedding|زواج|عقد قران|حب|خطوبة/, 'heart'],
 [/baby|مولود|ولادة|طفل/, 'baby'],
 [/success|نجاح|إنجاز|فوز|بطولة|دوري|sport/, 'trophy'],
 [/holiday|إجازة|اجازة|عطلة|احتفال/, 'party-popper'],
 [/security|أمن|سلامة|حماية/, 'shield-check'],
 [/meeting|عمل|دوام|وظيفة|مكتب/, 'briefcase-business'],
 [/family|عائلة|أصدقاء|أقارب/, 'users'],
 [/palms|نخيل|تمور|نخل/, 'tree-palm'],
 [/finance|مالي|دين|فاتورة|سداد/, 'coins'],
 [/birthday|ميلاد|مناسبة|birthday/, 'gift'],
 [/time|موعد|بداية|نهاية|event/, 'calendar-days']
];
export function eventGlyph(item){
 const custom=String(item?.icon||'').trim();
 if(hasLucideIcon(custom))return custom;
 const searchable=[item?.id,item?.label,item?.category,item?.summary].filter(Boolean).join(' ').toLowerCase();
 for(const [pattern,name]of rules)if(pattern.test(searchable))return name;
 return 'calendar-days';
}
function colorToRgb(hex){
 const value=String(hex||'').replace(/^#/,'');
 if(!/^[0-9a-f]{6}$/i.test(value))return [24,90,70];
 return [0,2,4].map(i=>parseInt(value.slice(i,i+2),16));
}
export const tint=(hex,opacity)=>{const rgb=colorToRgb(hex);return `rgba(${rgb.join(',')},${Math.max(0,Math.min(1,Number(opacity)||0))})`;};
export function drawIconBadge(c,item,cx,cy,diameter,{style='glass',accent='#b99255',contrast='#154d40',featured=false,light=false}={}){
 // The Node-only geometry unit test provides a stub context without Path2D.
 if(typeof Path2D==='undefined'||typeof c.arc!=='function')return;
 const d=Math.max(16,Math.min(78,Number(diameter)||30)),r=d/2,variant=CARD_ICON_STYLES.includes(style)?style:'glass';
 c.save();c.translate(cx,cy);
 if(variant!=='outline'){
  c.shadowBlur=d>30?d*.29:0;c.shadowOffsetY=d>30?d*.08:0;c.shadowColor=featured?tint(accent,.30):'rgba(0,0,0,.12)';
  const gradient=c.createLinearGradient(-r,-r,r,r);
  if(variant==='royal'){
   gradient.addColorStop(0,featured?accent:contrast);gradient.addColorStop(1,featured?contrast:accent);
  }else if(variant==='duotone'){
   gradient.addColorStop(0,tint(accent,.30));gradient.addColorStop(1,tint(accent,.09));
  }else{
   gradient.addColorStop(0,light?'rgba(255,255,255,.25)':'rgba(255,255,255,.95)');
   gradient.addColorStop(1,light?'rgba(255,255,255,.06)':tint(accent,.13));
  }
  c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fillStyle=gradient;c.fill();
  c.shadowBlur=0;c.shadowOffsetY=0;
 }
 c.beginPath();c.arc(0,0,r-1.2,0,Math.PI*2);
 c.strokeStyle=variant==='royal'?tint('#ffffff',.55):tint(accent,featured?.9:.48);c.lineWidth=Math.max(.8,d*.018);c.stroke();
 if(d>=29&&variant==='glass'){
  c.beginPath();c.arc(0,0,r-4.3,Math.PI*1.14,Math.PI*1.68);c.strokeStyle=light?'rgba(255,255,255,.6)':'rgba(255,255,255,.95)';c.lineWidth=1.35;c.stroke();
 }
 const ink=variant==='royal'?'#ffffff':variant==='duotone'?contrast:light?'#fff7e8':contrast;
 drawLucideIcon(c,eventGlyph(item),-d*.30,-d*.30,d*.60,{color:ink,strokeWidth:featured?2.15:1.9});
 c.restore();
}
export function drawCardFiligree(c,x,y,w,h,{gold='#b99255',opacity=.25,large=false}={}){
 if(typeof Path2D==='undefined'||typeof c.arc!=='function')return;
 c.save();c.globalAlpha=Math.min(.45,Math.max(.04,opacity));c.strokeStyle=gold;c.lineWidth=large?2:1.3;
 const inset=Math.min(26,w*.05,h*.08),r=large?30:18;
 for(const [cx,cy,dirX,dirY]of [[x+inset,y+inset,1,1],[x+w-inset,y+inset,-1,1],[x+inset,y+h-inset,1,-1],[x+w-inset,y+h-inset,-1,-1]]){
  c.beginPath();c.moveTo(cx,cy+dirY*r);c.quadraticCurveTo(cx,cy,cx+dirX*r,cy);c.stroke();
  c.beginPath();c.arc(cx,cy,large?3.5:2,0,Math.PI*2);c.fillStyle=gold;c.fill();
 }
 c.restore();
}
