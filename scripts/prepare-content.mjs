import {readFile,writeFile} from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../data/content-library.json',import.meta.url),'utf8'));
await writeFile(new URL('../assets/content-library.js',import.meta.url),'export const CONTENT_LIBRARY='+JSON.stringify(data,null,2)+';\n');
