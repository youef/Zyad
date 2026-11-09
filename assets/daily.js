import {CONTENT_LIBRARY} from './content-library.js';
import {selectTemplate} from './rules.js';
export {CONTENT_LIBRARY};
export const dayNumber=iso=>Math.floor(Date.parse(iso+'T12:00:00Z')/86400000);
const mod=(n,d)=>(n%d+d)%d;
export function dailyContent(config,iso){const settings=config.content||{},excluded=new Set(settings.excludedIds||[]),seed=Math.trunc(Number(settings.offset)||0),day=dayNumber(iso);const hadiths=CONTENT_LIBRARY.hadiths.filter(h=>!excluded.has(h.id)),duas=[...CONTENT_LIBRARY.duas,...(settings.customDuas||[]).filter(d=>typeof d.text==='string'&&d.text.length<=250).map((d,i)=>({id:d.id||'custom-'+i,text:d.text,type:'general',reference:'دعاء عام — أضافه مدير المحتوى'}))].filter(d=>!excluded.has(d.id));
 return {date:iso,hadith:settings.showHadith===false||!hadiths.length?null:hadiths[mod(day+seed,hadiths.length)],dua:settings.showDua===false||!duas.length?null:duas[mod(day+seed+7,duas.length)]};
}
export function hasCardMessage(cfg){
 if(cfg.settings?.showQuote===false)return false;
 if(cfg.content?.mode==='daily')return Boolean(cfg.daily?.hadith||cfg.daily?.dua);
 return Boolean(String(cfg.card?.quote||'').trim());
}
export function resolveContent(config,iso){const cfg=structuredClone(config);if(cfg.content?.mode==='daily'){const daily=dailyContent(cfg,iso);cfg.daily=daily;cfg.card||={};cfg.card.quote=[daily.hadith?.text,daily.dua?.text].filter(Boolean).join(' • ');cfg.card.attribution=daily.hadith?daily.hadith.reference:'';}return cfg;}
export function dailyTemplate(config,iso,presets){const enabled=new Set(config.design?.rotationIds||[]),pool=presets.filter(p=>!enabled.size||enabled.has(p.id));const fallback=config.design?.autoRotate===false?config.design.preset:pool[mod(dayNumber(iso)+(Number(config.design?.rotationOffset)||0),pool.length)]?.id||config.design?.preset||'royal',selected=selectTemplate(config.smartRules,iso,fallback);return presets.some(p=>p.id===selected)?selected:fallback;}
