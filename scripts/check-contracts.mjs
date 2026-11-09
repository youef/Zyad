import assert from 'node:assert/strict';import {templates,createDesign,SIZES} from '../assets/catalog.js';import {selectTemplate} from '../assets/rules.js';import {remaining} from '../assets/card.js';
assert.equal(templates.length,24);assert.equal(new Set(templates.map(t=>t.id)).size,24);
for(const t of templates){for(const k of ['id','name','description','category','version','updatedAt','supportedSizes','background','layers','safeAreas','defaultValues','assets'])assert(k in t);assert.equal(t.supportedSizes.length,4);assert(t.layers.length>=4);assert(t.layers.some(l=>l.id==='title'),'Every template needs a real content title');assert(!t.layers.some(l=>['tag','brand-logo'].includes(l.id)),'Template names and built-in logo layers must not print inside cards');const d=createDesign(t.id,'2026-11-04');assert.equal(d.templateId,t.id);assert.notEqual(d.id,createDesign(t.id).id);}
assert.equal(remaining({mode:'date',date:'2024-02-29',repeat:'yearly'},'2025-03-01'),1095);
assert.equal(remaining({mode:'monthly',day:31},'2028-02-01'),28);
assert.equal(selectTemplate([{enabled:true,weekday:'any',priority:1,templateId:'ivory-modern'},{enabled:true,weekday:'3',priority:9,templateId:'midnight'}],'2026-11-04'),'midnight');
assert.equal(selectTemplate([{enabled:false,weekday:'any',priority:10,templateId:'midnight'}],'2026-11-04'),'saudi-emerald');
console.log('PASS: 24 template contracts, sizes, unique IDs, leap years, priority and disabled rules.');
