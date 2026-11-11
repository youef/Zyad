import {getLanguage,translate} from './locale.js?v=i18n4';
// Translate UI text added by the planner/gallery without permanently mutating
// source strings, so Arabic is always restored exactly when switched back.
const originalText=new WeakMap(),originalAttrs=new WeakMap();
const canTranslate=e=>e&&!e.closest('script,style,noscript,textarea,code,pre,svg,[data-visitor-i18n],[data-no-translate]');
function updateText(node,lang){
 const parent=node.parentElement;
 if(!canTranslate(parent))return;
 const value=node.nodeValue;
 if(!value||!value.trim())return;
 const prev=originalText.get(node);
 let source=prev?.source??value;
 if(prev&&value!==prev.translated&&value!==prev.source)source=value;
 const next=lang==='en'?translate(source,'en'):source;
 originalText.set(node,{source,translated:next});
 if(value!==next)node.nodeValue=next;
}
function updateAttrs(node,lang){
 if(!canTranslate(node))return;
 const attrs=['placeholder','aria-label','title','alt'];
 for(const name of attrs){
  if(!node.hasAttribute(name))continue;
  const value=node.getAttribute(name);
  let record=originalAttrs.get(node)||{};
  let prev=record[name];
  let source=prev?.source??value;
  if(prev&&value!==prev.translated&&value!==prev.source)source=value;
  const next=lang==='en'?translate(source,'en'):source;
  record[name]={source,translated:next};originalAttrs.set(node,record);
  if(value!==next)node.setAttribute(name,next);
 }
}
function updateAll(){
 if(!document.body)return;
 const lang=getLanguage();
 const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 let node=walk.currentNode;
 do{if(node.nodeType===Node.TEXT_NODE)updateText(node,lang);else if(node.nodeType===Node.ELEMENT_NODE)updateAttrs(node,lang);}while((node=walk.nextNode()));
}
let scheduled=false;
function schedule(){
 if(scheduled)return;scheduled=true;
 queueMicrotask(()=>{scheduled=false;updateAll()});
}
const observer=new MutationObserver(schedule);
observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','alt']});
window.addEventListener('zyad-language-change',schedule);
window.addEventListener('zyad-calendar-updated',schedule);
window.addEventListener('zyad-route-updated',schedule);
window.addEventListener('hashchange',schedule);
schedule();
