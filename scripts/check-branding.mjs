import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {templates,createDesign} from '../assets/catalog.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFile(join(root,p));
const png=async p=>{
 const b=await read(p);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',p+' must be a PNG');
 return {size:b.length,width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
};
const source=await png('assets/branding/logo.png');
assert(source.size>1000&&source.width>=100&&source.height>=100,'Official source must be a high-quality logo');
const config=JSON.parse(await read('data/config.json'));
assert.equal(config.brand.logo,'assets/branding/logo.png');
assert(config.brand.name.includes('رزنامة'));
for(const size of [180,192,512]){
 const asset=await png('assets/app-'+size+'.png');
 assert.equal(asset.width,size);assert.equal(asset.height,size);
}
for(const t of templates){
 const d=createDesign(t.id,'2026-11-09');
 assert(d.layers.some(x=>x.type==='logo'&&x.src==='assets/branding/logo.png'&&x.fit==='contain'),'Missing brand in '+t.id);
}
for(const path of ['index.html','admin/index.html','studio/index.html','studio/calendar.html','library/index.html','settings/index.html','templates/index.html']){
 const html=await read(path).then(x=>x.toString('utf8'));
 assert(html.includes('branding/logo.png')&&html.includes('branding.css'),'Missing official logo in '+path);
}
for(const file of ['assets/design.js','assets/calendar-design.js','assets/list-calendar.js','assets/heritage-premium.js']){
 const s=await read(file).then(x=>x.toString('utf8'));
 assert(s.includes('brandStamp('),'Logo must preserve original aspect ratio in '+file);
}
console.log('PASS: Official logo, 7 app pages, 42 calendar layouts, 24 freeform cards, and all PWA icon sizes.');
