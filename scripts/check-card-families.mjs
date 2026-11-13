import assert from 'node:assert/strict';
import {CARD_PRESETS} from '../assets/templates.js';
import {CARD_FAMILIES,familyFor,familyPalette,familyHeader,familyQuote,familyTile,familyColumns} from '../assets/card-style-families.js';
const found=new Set(CARD_PRESETS.map(familyFor));
assert(CARD_PRESETS.length>=45,'Presets unexpectedly removed');
assert(found.size>=10,'Design library must expose at least ten visibly different shape systems');
for(const p of CARD_PRESETS)assert(CARD_FAMILIES.includes(familyFor(p)),p.id+' has an unknown layout family');
assert.equal(familyFor(CARD_PRESETS.find(p=>p.id==='royal')),'royal');
assert.equal(familyFor(CARD_PRESETS.find(p=>p.id==='modern')),'modern');
assert.equal(familyFor(CARD_PRESETS.find(p=>p.id==='night')),'night');
assert.equal(familyFor(CARD_PRESETS.find(p=>p.id==='heritage')),'heritage');
assert.equal(familyFor(CARD_PRESETS.find(p=>p.id==='desert')),'desert');
assert.equal(familyFor(CARD_PRESETS.find(p=>p.id==='friday')),'ramadan');
assert.equal(familyFor(CARD_PRESETS.find(p=>p.id==='metro-timeline')),'timeline');
function mock(width,height){
 const ops=[],texts=[];
 const context={
  font:'',save(){},restore(){},
  beginPath(){ops.push('begin')},closePath(){},moveTo(){ops.push('move')},lineTo(){},
  quadraticCurveTo(){ops.push('curve')},bezierCurveTo(){ops.push('bezier')},
  roundRect(x,y,w,h,r){ops.push('rounded:'+Math.round(r))},
  arc(x,y,r){ops.push('arc:'+Math.round(r))},
  ellipse(){ops.push('ellipse')},
  translate(){},rotate(){},fill(){},stroke(){},clip(){},
  rect(x,y,w,h){assert(x>=0&&y>=0&&x+w<=width+1&&y+h<=height+1,'Text region crosses edge')},
  createLinearGradient(){return {addColorStop(){}}},
  fillRect(){},fillText(v,x,y){assert(x>=0&&x<=width+1&&y>=0&&y<=height+1,'Paint outside canvas');texts.push(String(v))},
  measureText(value){const size=Number(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1]||18);return {width:Array.from(String(value)).length*size*.56}}
 };
 return {context,ops,texts};
}
const p0={main:'#165c4b',deep:'#0e4136',gold:'#bf9d5e',sage:'#dbe6dc',ivory:'#fffdf8',paper:'#f9f7ef',ink:'#173d33',secondary:'#507466'};
const distinct=new Set();
for(const family of CARD_FAMILIES){
 for(const [width,height] of [[1080,1920],[1080,566]]){
  const {context:c,ops,texts}=mock(width,height),p=familyPalette(p0,family);
  const compact=height<700,hh=compact?106:330;
  familyHeader(c,family,{x:100,y:compact?10:135,w:compact?880:850,h:hh,day:'الجمعة',greg:'14 نوفمبر 2026',hijri:'4 جمادى الآخرة 1448',p,en:false});
  familyQuote(c,family,[{heading:'مقتطف من حديث صحيح',body:'ما نقصت صدقة من مال',reference:'صحيح مسلم 2588'}],
   {x:100,y:compact?133:490,w:850,h:compact?78:240,p,en:false});
  familyTile(c,family,{label:'إجازة منتصف العام الدراسي',mode:'date'},17,
   {x:100,y:compact?250:775,w:220,h:compact?83:123},{p,showIcons:false,featured:true});
  assert(texts.some(t=>t.includes('الجمعة')),'Weekday missing '+family);
  assert(texts.some(t=>t.includes('17')),'Counter missing '+family);
  assert(texts.some(t=>t.includes('ما نقصت')),'Quote missing '+family);
  assert(ops.length>6,'Shapes missing '+family);
  if(!compact)distinct.add(family+':'+ops.filter(x=>x!=='begin').join(','));
 }
 assert(familyColumns(family,24)===4,'24 counters must use four columns for readability');
}
assert.equal(distinct.size,CARD_FAMILIES.length,'Families must draw genuinely separate shape systems');
console.log('PASS:',CARD_PRESETS.length,'live designs across',found.size,'layout families; headings, hadith, long names, numbers and two aspect ratios');
