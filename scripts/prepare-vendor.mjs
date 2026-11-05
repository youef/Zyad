import {build} from 'esbuild';import {copyFile} from 'node:fs/promises';
for(const [input,name,out]of [['qrcode/lib/browser.js','ZyadQR','qrcode'],['fflate/esm/browser.js','ZyadZip','fflate']])await build({entryPoints:['./node_modules/'+input],bundle:true,globalName:name,outfile:'assets/vendor/'+out+'.js',minify:true});
await copyFile('node_modules/@fontsource-variable/cairo/files/cairo-arabic-wght-normal.woff2','assets/fonts/cairo-arabic.woff2');
await copyFile('node_modules/@fontsource-variable/cairo/LICENSE','assets/fonts/OFL.txt');
await copyFile('node_modules/qrcode/license','assets/vendor/qrcode-LICENSE');
await copyFile('node_modules/fflate/LICENSE','assets/vendor/fflate-LICENSE');
