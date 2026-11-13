import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fitText,formatCounter} from '../assets/text-layout.js';
import {CARD_ICON_NAMES,eventGlyph,CARD_ICON_STYLES} from '../assets/card-icons.js';
import {SOCIAL_SIZES} from '../assets/social-sizes.js';
import {footerGeometry} from '../assets/follow-panel.js';
import {renderResponsiveCard} from '../assets/responsive-card.js';
import {remaining,hijriDate} from '../assets/card.js';
import {resolveContent} from '../assets/daily.js';
const config=JSON.parse(await readFile(new URL('../data/config.json',import.meta.url),'utf8'));
const date='2026-11-13';
const friday=resolveContent(config,date);
assert.equal(friday.daily?.special,'friday');
assert.equal(formatCounter(0),'00');
assert.equal(formatCounter(8),'08');
assert.equal(formatCounter(312),'312');
assert.equal(formatCounter(Number.NaN),'—');
function makeContext(w,h){
 const invalid=[],labels=[];
 const context={
  font:'',save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},rect(x,y,bw,bh){if(x<0||y<0||x+bw>w+1||y+bh>h+1)invalid.push({x,y,bw,bh})},
  roundRect(){},clip(){},fill(){},stroke(){},fillRect(){},strokeRect(){},
  createLinearGradient(){return {addColorStop(){}}},measureText(value){return {width:Array.from(String(value)).length*Number(this.font.match(/([\\d.]+)px/)?.[1]||24)*.53}},
  fillText(value,x,y,maxWidth){assert(Number.isFinite(x)&&Number.isFinite(y));assert(x>=-1&&x<=w+1);assert(y>=-1&&y<=h+1);if(maxWidth!=null)assert(maxWidth>0);labels.push(String(value));}
 };
 return {context,invalid,labels};
}
for(const phrase of ['إجازة منتصف العام الدراسي','منحة الجامعة للطلاب والطالبات','اسم طويللللللللللللللللللللللللللللللللللللل']){
 const {context,invalid}=makeContext(300,120);
 const t=fitText(context,phrase,{x:7,y:12,w:160,h:90,size:30,minSize:14,maxLines:2});
 assert(t.lines.length<=2);assert.equal(invalid.length,0);
}
assert.equal(CARD_ICON_NAMES.length,28,'All Lucide icons must remain locally bundled');
assert.equal(CARD_ICON_STYLES.length,4);
assert.equal(eventGlyph({label:'الراتب'}),'wallet');
assert.equal(eventGlyph({label:'شهر رمضان'}),'moon-star');
assert.equal(eventGlyph({label:'التخرج من الجامعة'}),'graduation-cap');
assert.equal(eventGlyph({label:'الإجازة الصيفية'}),'sun');
assert.equal(eventGlyph({label:'عيد الفطر'}),'gift');
assert.equal(eventGlyph({label:'موعد جديد',icon:'trophy'}),'trophy');
assert.equal(SOCIAL_SIZES.length,13);
for(const preset of SOCIAL_SIZES){
 const [w,h]=[preset.width,preset.height],g=footerGeometry([w,h],'calendar');
 assert(g.ad.y>h*.3&&g.follow.y>g.ad.y+g.ad.h,'No footer may cover header or event content');
 assert(g.follow.y+g.follow.h<h&&g.ad.x>=0&&g.follow.x>=0);
 const {context,invalid,labels}=makeContext(w,h);
 const details=renderResponsiveCard(context,{...friday,follow:{enabled:false},advertising:{enabled:false}},date,{
  dimensions:[w,h],remaining,hijriDate,banner:null,qr:null});
 assert(details.visible>0&&details.total>=details.visible);
 assert(details.columns>=4&&details.rows>=1);
 assert.equal(invalid.length,0,'Out-of-bounds text on '+preset.id);
 assert(labels.length>10);
}
console.log('PASS: 13 social dimensions, footer constraints, bounded labels and Friday card');
