/**
 * Zyad secure administration bridge.
 * Deploy as a Vercel Node.js Function; never publish admin credentials in GitHub Pages.
 * Required encrypted server variables for login: ZYAD_ADMIN_PASSWORD, ZYAD_SESSION_SECRET.
 * Optional: ZYAD_ADMIN_USERNAME (defaults to "admin").
 * GitHub publishing requires a separate encrypted ZYAD_GITHUB_TOKEN.
 */
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const REPO = 'youef/Zyad';
const PATH = 'data/config.json';
const BANNER_PATH = 'assets/advertising/active.webp';
const ALLOWED_ORIGINS = new Set(['https://youef.github.io']);
const MAX_BODY = 260_000;
const attempts = new Map();

function sessionMaterial() {
  // Prefer a dedicated secret; older deployments can derive a private key
  // from the server-only GitHub token until ZYAD_SESSION_SECRET is configured.
  if (process.env.ZYAD_SESSION_SECRET?.length >= 32) return process.env.ZYAD_SESSION_SECRET;
  if (process.env.ZYAD_GITHUB_TOKEN?.length >= 20) return 'github-token:' + process.env.ZYAD_GITHUB_TOKEN;
  return '';
}
function envReady() {
  return Boolean(process.env.ZYAD_ADMIN_PASSWORD?.length >= 8 && sessionMaterial());
}
function publishReady() {
  return Boolean(process.env.ZYAD_GITHUB_TOKEN?.length >= 20);
}
function secret() {
  return createHash('sha256').update('zyad-session-v3:' + process.env.ZYAD_ADMIN_PASSWORD + ':' + sessionMaterial()).digest();
}
function hmac(input) {
  return createHmac('sha256', secret()).update(input).digest('base64url');
}
function respond(res, code, payload) {
  return res.status(code).json(payload);
}
function fail(res, code, message) {
  return respond(res, code, { ok: false, error: message });
}
function constantEqual(a,b) {
  const aa = createHash('sha256').update(String(a)).digest();
  const bb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(aa,bb);
}
function issueSession() {
  const claims = Buffer.from(JSON.stringify({sub:'zyad-admin', exp:Math.floor(Date.now()/1000) + 8*3600, jti:randomBytes(12).toString('hex')})).toString('base64url');
  return claims + '.' + hmac(claims);
}
function validSession(req) {
  if (!envReady()) return false;
  const raw = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization||''))?.[1];
  if (!raw || raw.length > 2048) return false;
  const [claims, signature,extra] = raw.split('.');
  if (!claims || !signature || extra || !constantEqual(hmac(claims),signature)) return false;
  try {
    const data = JSON.parse(Buffer.from(claims,'base64url').toString('utf8'));
    return data.sub === 'zyad-admin' && Number.isInteger(data.exp) && data.exp > Date.now()/1000;
  } catch { return false; }
}
async function github(path, options={}) {
  if (options.method && options.method !== 'GET' && !publishReady()) {
    const error = new Error('النشر يحتاج ربط GitHub: أضف ZYAD_GITHUB_TOKEN بصلاحية Contents: Read and write في إعدادات Vercel.');
    error.status = 503;
    throw error;
  }
  const response = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + path, {
    ...options,
    headers: {
      Accept:'application/vnd.github+json',
      ...(publishReady() ? {Authorization:'Bearer ' + process.env.ZYAD_GITHUB_TOKEN} : {}),
      'X-GitHub-Api-Version':'2022-11-28',
      ...(options.body ? {'Content-Type':'application/json'} : {}),
    },
    cache:'no-store',
  });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) {
    const detail = response.status === 403
      ? 'الخادم لا يملك صلاحية Contents: Read and write في GitHub؛ تحقق من إعداد رمز الخدمة في Vercel.'
      : response.status === 409 ? 'حدث تعارض مع تحديث أحدث. أعد تحميل التعديلات.' : 'تعذر الاتصال بمستودع GitHub (HTTP '+response.status+').';
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }
  return data;
}
async function getConfig() {
  const file = await github(PATH + '?ref=main');
  const raw = Buffer.from(String(file.content||'').replace(/\s/g,''),'base64').toString('utf8');
  return { data:JSON.parse(raw), sha:file.sha };
}
function validateConfig(v) {
  if (!v || typeof v!=='object' || Array.isArray(v)) return false;
  if (typeof v.brand?.name!=='string' || v.brand.name.length > 80) return false;
  if (!v.card || typeof v.card !== 'object' || !v.theme || typeof v.theme !== 'object') return false;
  if (!Array.isArray(v.counters) || v.counters.length > 30) return false;
  if (v.savedDesigns && (!Array.isArray(v.savedDesigns)||v.savedDesigns.length>30)) return false;
  return true;
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Vary','Origin');
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
  }
  if (req.method==='OPTIONS') return res.status(origin&&ALLOWED_ORIGINS.has(origin)?204:403).end();
  if (origin && !ALLOWED_ORIGINS.has(origin)) return fail(res,403,'مصدر الطلب غير مسموح.');
  if (!['GET','POST'].includes(req.method)) return fail(res,405,'الطريقة غير مدعومة.');
  const action = String(req.query.action||'status');
  if (action === 'status' && req.method === 'GET') return respond(res,200,{ok:true,ready:envReady(),publishReady:publishReady(),apiVersion:'2026-11-09-auth-fix'});
  if (!envReady()) return fail(res,503,'إدارة رزنامة السعودية لم تُضبط بعد. يجب إعداد بيانات الخدمة المحمية على Vercel.');
  if (action === 'login' && req.method === 'POST') {
    const clientIp = String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
    const current = attempts.get(clientIp) || {count:0,until:0};
    if (current.until>Date.now()) return fail(res,429,'محاولات كثيرة. حاول لاحقًا.');
    const {username,password} = req.body||{};
    const expectedUser = process.env.ZYAD_ADMIN_USERNAME || 'admin';
    const success = constantEqual(username,expectedUser) && constantEqual(password,process.env.ZYAD_ADMIN_PASSWORD);
    if (!success) {
      const count = current.count+1;
      attempts.set(clientIp,{count,until:count>=5?Date.now()+60_000:0});
      return fail(res,401,'اسم المستخدم أو كلمة المرور غير صحيحين.');
    }
    attempts.delete(clientIp);
    return respond(res,200,{ok:true,token:issueSession(),expiresIn:28800});
  }
  if (!validSession(req)) return fail(res,401,'انتهت الجلسة أو لم تسجل الدخول.');
  if (action === 'session' && req.method === 'GET') return respond(res,200,{ok:true});
  if (action === 'config' && req.method === 'GET') {
    try { const file=await getConfig(); return respond(res,200,{ok:true,config:file.data}); }
    catch(error) { return fail(res,502,error.message); }
  }
  if (action === 'upload-banner' && req.method === 'POST') {
    if (!publishReady()) return fail(res,503,'رفع الإعلان غير مفعّل: راجع صلاحيات GitHub الآمنة على الخادم.');
    const input=req.body?.image;
    if(typeof input!=='string'||input.length>750_000||!/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(input))
      return fail(res,400,'صورة الإعلان غير صالحة أو كبيرة. ارفع WebP بالمقاس 2000×400.');
    const bytes=Buffer.from(input.slice('data:image/webp;base64,'.length),'base64');
    if(bytes.length>570_000||bytes.length<150||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')
      return fail(res,400,'الملف ليس صورة WebP صالحة.');
    try{
      let existing=null;
      try{existing=await github(BANNER_PATH+'?ref=main');}
      catch(error){if(error.status!==404)throw error;}
      const saved=await github(BANNER_PATH,{method:'PUT',body:JSON.stringify({
        message:'Publish Saudi Calendar advertisement banner',
        content:bytes.toString('base64'),
        ...(existing?.sha?{sha:existing.sha}:{}),
        branch:'main'
      })});
      return respond(res,200,{ok:true,path:BANNER_PATH,commit:saved.commit?.sha||null});
    }catch(error){return fail(res,[403,409,422].includes(error.status)?error.status:502,error.message);}
  }
  if (action === 'publish' && req.method === 'POST') {
    if (!publishReady()) return fail(res,503,'النشر غير مفعّل: أضف رمز GitHub للخادم في متغير ZYAD_GITHUB_TOKEN على Vercel.');
    const { config,base } = req.body||{};
    if (!validateConfig(config) || !validateConfig(base)) return fail(res,400,'بيانات الإعدادات غير صالحة.');
    const encoded=Buffer.from(JSON.stringify(config,null,2)+'\n','utf8').toString('base64');
    if (encoded.length>MAX_BODY*1.4) return fail(res,413,'البيانات كبيرة جدًا. قلّل حجم الصور المضمّنة.');
    try {
      const latest=await getConfig();
      if (JSON.stringify(latest.data)!==JSON.stringify(base)) {
        return fail(res,409,'توجد نسخة أحدث من إعدادات المنصة على GitHub؛ صدّر مسودتك ثم حدّث الصفحة قبل إعادة الحفظ.');
      }
      const saved=await github(PATH,{method:'PUT',body:JSON.stringify({
        message:'Publish Zyad administration updates',
        content:encoded,
        sha:latest.sha,
        branch:'main',
      })});
      return respond(res,200,{ok:true,commit:saved.commit?.sha||null});
    } catch(error) {
      return fail(res,[403,409,422].includes(error.status)?error.status:502,error.message);
    }
  }
  return fail(res,404,'مسار الإدارة غير معروف.');
}
