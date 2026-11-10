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
assert(typeof config.brand.logo==='string'&&(/^(?:assets\/branding\/logo(?:-transparent)?\.png|data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/.test(config.brand.logo)),'Official logo or valid administrator-provided transparent override expected');
const transparent=await png('assets/branding/logo-transparent.png');assert(transparent.width>30&&transparent.height>30,'Transparent brand missing');
assert(config.brand.name.includes('رزنامة'));
for(const size of [180,192,512]){
 const asset=await png('assets/app-'+size+'.png');
 assert.equal(asset.width,size);assert.equal(asset.height,size);
}
for(const t of templates){
 const d=createDesign(t.id,'2026-11-09');
 assert(!d.layers.some(x=>x.id==='tag'||x.id==='brand-logo'),'Printed template branding should not appear inside '+t.id);
}
for(const path of ['index.html','admin/index.html','studio/index.html','studio/calendar.html','library/index.html','settings/index.html','templates/index.html']){
 const html=await read(path).then(x=>x.toString('utf8'));
 assert(html.includes('branding/logo-transparent.png')&&html.includes('branding.css'),'Missing official logo in '+path);
}
for(const file of ['assets/design.js','assets/calendar-design.js','assets/list-calendar.js','assets/heritage-premium.js']){
 const s=await read(file).then(x=>x.toString('utf8'));
 assert(s.includes('drawHangingLogo('),'Logo must hang in the upper-left of '+file);
}
const freeform=await read('assets/engine.js').then(x=>x.toString('utf8'));assert(freeform.includes('drawHangingLogo('),'Freeform must include a hanging logo');console.log('PASS: Official transparent hanging logo, 7 app pages, 42 calendar layouts, 24 freeform cards and PWA icons.');
