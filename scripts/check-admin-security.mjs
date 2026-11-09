import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const read=async p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const html=await read('admin/index.html');
const auth=await read('assets/admin-auth.js');
const admin=await read('assets/admin.js');
const api=await read('api/zyad.js');
const sw=await read('sw.js');
assert(html.includes('id="zyad-login-form"'),'Admin entry requires login');
assert(html.includes('id="zyad-private"'),'Editor shell should be gated');
assert(html.includes('assets/admin-auth.js'),'Login module must load');
assert(!html.includes('id="github-token"'),'No GitHub token prompt may appear in browser');
assert(!html.includes('<script type="module" src="../assets/admin.js'),'Editor cannot boot before authentication');
assert(auth.includes("request('session')")&&auth.includes("request('config')"),'Server must validate session and repository');
assert(auth.includes("sessionStorage.setItem"),'Browser session should be tab-scoped');
assert(admin.includes("request('publish'"),'Publishing must use authenticated server');
assert(!admin.includes("'Authorization':'Bearer '+token"),'Do not use GitHub PAT in browser');
assert(api.includes("process.env.ZYAD_ADMIN_PASSWORD")&&api.includes("process.env.ZYAD_GITHUB_TOKEN"),'Secrets must be read server-side');
assert(api.includes("validSession(req)")&&api.includes("constantEqual"),'Server authorization and constant-time comparison expected');
assert(api.includes('JSON.stringify(latest.data)!==JSON.stringify(base)'),'Conflict protection must be enabled');
assert(sw.includes('assets/admin-auth.js'),'Service worker must have secure admin assets');
assert(!sw.includes('logo-transparent.png'),'Do not precache untracked branding paths');
for(const path of ['api/zyad.js','assets/admin-auth.js','assets/admin-dashboard.js','assets/admin.js']){
 execFileSync(process.execPath,['--check',new URL('../'+path,import.meta.url).pathname],{stdio:'pipe'});
}
console.log('PASS: admin authentication, GitHub token isolation, server-side publishing and source syntax.');
