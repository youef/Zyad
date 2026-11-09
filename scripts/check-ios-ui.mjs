import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {join} from 'node:path';
const read=p=>readFile(join(process.cwd(),p),'utf8');
const style=await read('assets/ios-native.css');
for(const term of ['safe-area-inset-bottom','backdrop-filter','prefers-reduced-motion','native-tab-link','personal-form','--ios-text'])assert(style.includes(term),'Missing iOS design contract '+term);
for(const path of ['index.html','studio/index.html','studio/calendar.html','library/index.html','templates/index.html','settings/index.html','admin/index.html']){
 const c=await read(path);assert(c.includes('native-ui'),'Missing native page style '+path);assert(c.includes('ios-native.css'),'Missing native stylesheet '+path);
 if(path!=='admin/index.html')assert(c.includes('native-tab-link'),'Missing consistent tab bar '+path);
}
const main=await read('index.html');assert.equal((main.match(/class="native-tab-link/g)||[]).length,5);
const sw=await read('sw.js');assert(sw.includes('assets/ios-native.css'));
console.log('PASS: iOS-first visual tokens, mobile safe areas, tab bars, page coverage and accessibility.');
