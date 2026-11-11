import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CARD_PRESETS} from '../assets/templates.js';
import {CONTENT_LIBRARY} from '../assets/content-library.js';
import {dailyContent} from '../assets/daily.js';
import {getLanguage,translate,localizedConfig,eventLabel,localeDate,presetName,presetDescription} from '../assets/locale.js';

const config=JSON.parse(await readFile(new URL('../data/config.json',import.meta.url),'utf8'));
const storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
assert.equal(getLanguage(),'ar');
assert.equal(eventLabel({id:'salary',label:'الراتب'}),'الراتب');
storage.set('zyad-language','en');
assert.equal(getLanguage(),'en');
assert.equal(eventLabel({id:'salary',label:'الراتب'}),'Salary');
assert.equal(translate('الأحد'),'Sunday');
assert.match(localeDate('2026-11-11',{month:'long',day:'numeric'}),/November/);
assert.equal(CARD_PRESETS.length,42);
for(const p of CARD_PRESETS){
 assert(/[A-Za-z]/.test(presetName(p)),p.id+' has no English name');
 assert(presetDescription(p).length>0,p.id+' has no English description');
}
assert.equal(CONTENT_LIBRARY.hadiths.length,24);
assert.equal(CONTENT_LIBRARY.duas.length,40);
for(const item of [...CONTENT_LIBRARY.hadiths,...CONTENT_LIBRARY.duas]){
 assert(item.textEn&&/[A-Za-z]/.test(item.textEn),item.id+' missing English meaning');
 assert(item.referenceEn&&/[A-Za-z]/.test(item.referenceEn),item.id+' missing English source label');
}
const translated=localizedConfig(config);
assert.equal(translated.counters.length,config.counters.length);
for(const c of translated.counters){
 assert(/[A-Za-z]/.test(c.label),c.id+' English name missing');
 assert(/[A-Za-z]/.test(c.summary),c.id+' English description missing');
}
assert.equal(config.counters.find(x=>x.id==='salary').label,'الراتب','Arabic config changed unexpectedly');
assert.equal(translated.card.disclaimer,'Estimated dates; verify with official sources');
const day=dailyContent({...config,content:{...config.content,showHadith:true,showDua:true}},'2026-11-11');
assert(day.hadith?.textEn&&day.hadith.text===day.hadith.textEn);
assert(day.dua?.textEn&&day.dua.text===day.dua.textEn);
storage.set('zyad-language','ar');
assert.equal(getLanguage(),'ar');
assert.equal(eventLabel({id:'salary',label:'الراتب'}),'الراتب');
assert.match(localeDate('2026-11-11',{weekday:'long'}),/الأربعاء/);
console.log('PASS: Arabic and English names, descriptions, event dates, 42 templates, 64 daily readings and RTL restoration.');
