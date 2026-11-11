import {publicBannerSource,loadBanner,DEFAULT_BANNER} from './advertising.js?v=working24';

const home=document.getElementById('today-app');
const workspace=home?.querySelector('.day-workspace');
if(workspace){
  const section=document.createElement('section');
  section.className='home-advertisement app-panel';
  section.setAttribute('aria-label','الإعلان');
  section.hidden=true;
  section.innerHTML='<div class="home-advertisement-header"><h2>الإعلان</h2></div><div class="home-advertisement-image"><img alt="صورة الإعلان المنشورة على البطاقة اليومية" decoding="async" loading="lazy"></div>';
  workspace.insertAdjacentElement('afterend',section);
  const image=section.querySelector('img');
  const refresh=async()=>{
    try{
      const src=await publicBannerSource();
      if(!src){section.hidden=true;image.removeAttribute('src');return;}
      let banner;
      try{banner=await loadBanner(src);}
      catch{banner=await loadBanner(DEFAULT_BANNER);}
      image.src=banner.src;
      section.hidden=false;
    }catch(error){section.hidden=true;console.warn('تعذر عرض إعلان الرئيسية',error);}
  };
  refresh();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
}
