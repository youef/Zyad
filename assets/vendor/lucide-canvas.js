/* Lucide SVG icons, ISC/MIT licensed, rendered offline on Canvas.
 * Upstream: https://github.com/lucide-icons/lucide
 * Full licenses: assets/vendor/LUCIDE-LICENSE.txt */
const ICON_DATA={"calendar-days":[["path",{"d":"M8 2v3"}],["path",{"d":"M16 2v3"}],["rect",{"x":"3","y":"3","width":"18","height":"18","rx":"2"}],["path",{"d":"M3 9h18"}],["path",{"d":"M8 13h.01"}],["path",{"d":"M12 13h.01"}],["path",{"d":"M16 13h.01"}],["path",{"d":"M8 17h.01"}],["path",{"d":"M12 17h.01"}],["path",{"d":"M16 17h.01"}]],"wallet":[["path",{"d":"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"}],["path",{"d":"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"}]],"banknote":[["rect",{"width":"20","height":"12","x":"2","y":"6","rx":"2"}],["circle",{"cx":"12","cy":"12","r":"2"}],["path",{"d":"M6 12h.01M18 12h.01"}]],"coins":[["path",{"d":"M13.744 17.736a6 6 0 1 1-7.48-7.48"}],["path",{"d":"M15 6h1v4"}],["path",{"d":"m6.134 14.768.866-.5 2 3.464"}],["circle",{"cx":"16","cy":"8","r":"6"}]],"graduation-cap":[["path",{"d":"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"}],["path",{"d":"M22 10v6"}],["path",{"d":"M6 12.5V16a6 3 0 0 0 12 0v-3.5"}]],"book-open":[["path",{"d":"M12 5v16"}],["path",{"d":"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"}]],"school":[["path",{"d":"M14 21v-3a2 2 0 0 0-4 0v3"}],["path",{"d":"M18 4.933V21"}],["path",{"d":"m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"}],["path",{"d":"m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"}],["path",{"d":"M6 4.933V21"}],["circle",{"cx":"12","cy":"9","r":"2"}]],"house":[["path",{"d":"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"}],["path",{"d":"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}]],"moon-star":[["path",{"d":"M18 5h4"}],["path",{"d":"M20 3v4"}],["path",{"d":"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"}]],"sun":[["circle",{"cx":"12","cy":"12","r":"4"}],["path",{"d":"M12 2v2"}],["path",{"d":"M12 20v2"}],["path",{"d":"m4.93 4.93 1.41 1.41"}],["path",{"d":"m17.66 17.66 1.41 1.41"}],["path",{"d":"M2 12h2"}],["path",{"d":"M20 12h2"}],["path",{"d":"m6.34 17.66-1.41 1.41"}],["path",{"d":"m19.07 4.93-1.41 1.41"}]],"cloud-rain":[["path",{"d":"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"}],["path",{"d":"M16 14v6"}],["path",{"d":"M8 14v6"}],["path",{"d":"M12 16v6"}]],"snowflake":[["path",{"d":"m10 20-1.25-2.5L6 18"}],["path",{"d":"M10 4 8.75 6.5 6 6"}],["path",{"d":"m14 20 1.25-2.5L18 18"}],["path",{"d":"m14 4 1.25 2.5L18 6"}],["path",{"d":"m17 21-3-6h-4"}],["path",{"d":"m17 3-3 6 1.5 3"}],["path",{"d":"M2 12h6.5L10 9"}],["path",{"d":"m20 10-1.5 2 1.5 2"}],["path",{"d":"M22 12h-6.5L14 15"}],["path",{"d":"m4 10 1.5 2L4 14"}],["path",{"d":"m7 21 3-6-1.5-3"}],["path",{"d":"m7 3 3 6h4"}]]};
export const LUCIDE_CARD_NAMES=Object.freeze(Object.keys(ICON_DATA));
export const hasLucideIcon=name=>Object.prototype.hasOwnProperty.call(ICON_DATA,name);
const cachedPaths=new Map();
export function drawLucideIcon(c,name,x,y,size=28,{color='#fff',strokeWidth=1.9,opacity=1}={}){
 const nodes=ICON_DATA[hasLucideIcon(name)?name:'calendar-days'];
 c.save();c.translate(x,y);c.scale(size/24,size/24);c.strokeStyle=color;c.lineWidth=strokeWidth;c.lineCap='round';c.lineJoin='round';c.globalAlpha*=Math.max(0,Math.min(1,opacity));
 for(const [tag,a] of nodes){
  if(tag==='path'){let shape=cachedPaths.get(a.d);if(!shape){shape=new Path2D(a.d);cachedPaths.set(a.d,shape);}c.stroke(shape);continue;}
  c.beginPath();const v=k=>Number(a[k]||0);
  if(tag==='circle')c.arc(v('cx'),v('cy'),v('r'),0,Math.PI*2);
  else if(tag==='line'){c.moveTo(v('x1'),v('y1'));c.lineTo(v('x2'),v('y2'));}
  else if(tag==='rect')c.roundRect(v('x'),v('y'),v('width'),v('height'),v('rx')||0);
  else if(tag==='ellipse')c.ellipse(v('cx'),v('cy'),v('rx'),v('ry'),0,0,Math.PI*2);
  else if(tag==='polyline'||tag==='polygon'){const points=(a.points||'').trim().split(/[\\s,]+/).map(Number);for(let i=0;i+1<points.length;i+=2)i?c.lineTo(points[i],points[i+1]):c.moveTo(points[i],points[i+1]);if(tag==='polygon')c.closePath();}
  c.stroke();
 }
 c.restore();
}
