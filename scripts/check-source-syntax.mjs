/* Fast parser gate: fail CI before opening browsers when a frontend module is malformed. */
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const files=[
 'assets/main.js','assets/home.js','assets/card.js','assets/engine.js',
 'assets/calendar-design.js','assets/list-calendar.js','assets/design.js',
 'assets/heritage-premium.js','assets/follow-panel.js','assets/daily-panel.js',
 'assets/responsive-card.js','assets/awan-premium-card.js','assets/text-layout.js','assets/card-icons.js',
 'assets/vendor/lucide-canvas.js','assets/inspiration-card.js',
 'assets/daily.js','sw.js'
];
for(const file of files){
 try{execFileSync(process.execPath,['--check',resolve(root,file)],{encoding:'utf8',stdio:['ignore','pipe','pipe']});}
 catch(error){throw Error('Invalid JavaScript in '+file+': '+String(error.stderr||error.message));}
}
console.log('PASS: Syntax of '+files.length+' core card renderers, app modules and service worker.');
