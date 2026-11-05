export function selectTemplate(rules,date,fallback='saudi-emerald'){
 const weekday=String(new Date(date+'T12:00:00Z').getUTCDay());return [...(rules||[])].filter(r=>r.enabled!==false&&(r.date?r.date===date:r.weekday==='any'||String(r.weekday)===weekday)).sort((a,b)=>Number(b.priority||0)-Number(a.priority||0))[0]?.templateId||fallback;
}
