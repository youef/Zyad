/* Saudi Calendar icon library: a self-contained, offline-capable subset of
   Lucide-style 24px outline icons. Uses SVG paths, not emoji or icon fonts. */
const PATHS={
 'settings':'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l-1.6 1.6a2 2 0 0 0-2.2-.4l-1.2.5a2 2 0 0 0-1.2 1.8V22h-2.3v-1.3a2 2 0 0 0-1.2-1.8l-1.2-.5a2 2 0 0 0-2.2.4l-1.6-1.6a2 2 0 0 0 .4-2.2l-.5-1.2a2 2 0 0 0-1.8-1.2H2v-2.3h1.3a2 2 0 0 0 1.8-1.2l.5-1.2a2 2 0 0 0-.4-2.2l1.6-1.6a2 2 0 0 0 2.2.4l1.2-.5A2 2 0 0 0 11.4 2V1h2.3v1a2 2 0 0 0 1.2 1.8l1.2.5a2 2 0 0 0 2.2-.4l1.6 1.6a2 2 0 0 0-.4 2.2l.5 1.2a2 2 0 0 0 1.8 1.2H23v2.3h-1.3a2 2 0 0 0-1.8 1.2Z"/>',
 'moon':'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
 'chevron-left':'<path d="m15 18-6-6 6-6"/>',
 'chevron-right':'<path d="m9 18 6-6-6-6"/>',
 'calendar-days':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'download':'<path d="M12 3v12m0 0 5-5m-5 5-5-5M4 17v3h16v-3"/>',
 'share-2':'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.5-4.2M8.7 13.3l6.5 4.2"/>',
 'image':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 'grid-2x2':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 'archive':'<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 12h4"/>',
 'home':'<path d="m3 10 9-7 9 7v10H3V10Z"/><path d="M9 20v-7h6v7"/>',
 'pen-line':'<path d="m12 19 7-7 3 3-7 7-4 1zM3 21h6M15 6l3 3"/>',
 'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
 'phone':'<path d="M22 16.9v3a2 2 0 0 1-2.2 2A18 18 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.5 1.7L7.8 9.7a15 15 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.7-.5l3 .5a2 2 0 0 1 1.7 2Z"/>',
 'camera':'<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',
 'arrow-up-right':'<path d="M6 18 18 6M8 6h10v10"/>',
 'sparkles':'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8ZM19 19l.6 1.4L21 21l-1.4.6L19 23l-.6-1.4L17 21l1.4-.6Z"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'save':'<path d="M4 3h14l3 3v15H3V3zM7 3v6h10V3M7 21v-8h10v8"/>',
 'layers':'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>'
};
export function iconNode(name,size=22){
 const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width',String(size));svg.setAttribute('height',String(size));
 svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
 svg.setAttribute('class','ui-icon');svg.innerHTML=PATHS[name]||PATHS['calendar-days'];return svg;
}
export function renderIcons(scope=document){
 scope.querySelectorAll('[data-icon]:not([data-icon-ready])').forEach(e=>{
  const size=Number(e.dataset.iconSize)||22;
  e.replaceChildren(iconNode(e.dataset.icon,size));
  e.setAttribute('data-icon-ready','true');
 });
}
renderIcons();
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType===1){
 if(node.matches?.('[data-icon]'))renderIcons(node.parentElement||document);
 else if(node.querySelector?.('[data-icon]'))renderIcons(node);
}}}).observe(document.documentElement,{childList:true,subtree:true});
