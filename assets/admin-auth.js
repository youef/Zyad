const BASE='https://zyad-five.vercel.app/api/zyad';
const KEY='zyad-secure-admin-session-v1',form=document.querySelector('#zyad-login-form'),status=document.querySelector('#zyad-auth-status'),submit=document.querySelector('#zyad-login-button');
let token=sessionStorage.getItem(KEY)||'',started=false;
function notice(msg,good=false){status.textContent=msg;status.style.color=good?'#14805d':'#b54743';}
async function request(action,opt={}){
 const headers={...(opt.body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})};
 let response;
 try{response=await fetch(BASE+'?action='+encodeURIComponent(action),{...opt,headers,cache:'no-store',mode:'cors'});}catch{throw Error('تعذر الاتصال بخادم الإدارة.');}
 const type=response.headers.get('content-type')||'';
 if(!type.includes('application/json'))throw Error('خادم Vercel لم يعرض واجهة الإدارة البرمجية /api/zyad. تأكد أن مجلد api منشور وأن Root Directory هو جذر المشروع.');
 const result=await response.json().catch(()=>null);
 if(!result||typeof result.ok!=='boolean')throw Error('رد خادم الإدارة غير صالح. أعد نشر أحدث نسخة من فرع main في Vercel.');
 if(!response.ok){if(response.status===401&&action!=='login'){token='';sessionStorage.removeItem(KEY);}throw Error(result.error||('فشل الطلب '+response.status));}
 return result;
}
window.zyadAdminClient={request,logout:()=>{sessionStorage.removeItem(KEY);location.reload();}};
async function unlock(){
 if(started)return;
 await request('session');
 await request('config');
 started=true;
 document.body.classList.remove('zyad-locked');
 document.querySelector('#zyad-private').removeAttribute('aria-hidden');
 document.querySelector('#zyad-auth-screen').hidden=true;
 try{
  await import('../assets/admin.js?v=i18n4');
  await window.__adminReady;
  await import('../assets/admin-plus.js?v=secure-20261109');
  await import('../assets/admin-settings.js?v=secure-20261109');
  await import('../assets/admin-dashboard.js?v=secure-20261109');
 }catch(err){console.error(err);document.querySelector('#draft-status').textContent='فشل تشغيل الإدارة: '+err.message;}
}
document.querySelector('#zyad-logout').onclick=window.zyadAdminClient.logout;
form.onsubmit=async e=>{
 e.preventDefault();submit.disabled=true;submit.textContent='جارٍ التحقق...';notice('');
 try{
  const username=form.elements.namedItem('username').value.trim(),password=form.elements.namedItem('password').value;
  const result=await request('login',{method:'POST',body:JSON.stringify({username,password})});
  token=result.token;sessionStorage.setItem(KEY,token);
  form.elements.namedItem('password').value='';await unlock();
 }catch(err){notice(err.message);}
 finally{submit.disabled=false;submit.textContent='دخول لوحة الإدارة';}
};
async function checkBackend(){
 try{
  const info=await request('status');
  if(!info.ready)notice('الخادم متصل ولكن بيانات المصادقة غير مكتملة. تأكد من ZYAD_ADMIN_PASSWORD (8 أحرف فأكثر)، ومن ZYAD_SESSION_SECRET (32 حرفًا فأكثر) أو ZYAD_GITHUB_TOKEN في Vercel، ثم أعد النشر.');
  else if(token){try{await unlock();}catch{token='';sessionStorage.removeItem(KEY);notice('انتهت الجلسة، سجّل دخولك مجددًا.');}}
  else if(!info.publishReady)notice('تسجيل الدخول متاح. النشر يحتاج متغير ZYAD_GITHUB_TOKEN على الخادم.',true);
  else notice('الخادم جاهز. أدخل حساب المدير لتسجيل الدخول.',true);
 }catch(err){notice(err.message);}
 // Do not permanently disable login based on a transient status check.
 // A retry via the login button will show the exact server response.
}
void checkBackend();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!started&&!submit.disabled)void checkBackend();});
