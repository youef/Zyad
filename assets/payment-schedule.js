/* Shared deterministic Gregorian payment scheduling. All calculations use UTC dates
 * (date-only, no device timezone). A provider's official override takes precedence. */
const pad=n=>String(n).padStart(2,'0');
export const PAYMENT_RULES=Object.freeze({
 none:'none',previous_thursday_next_sunday:'previous_thursday_next_sunday',
 previous_workday:'previous_workday',next_workday:'next_workday'
});
export const PAYMENT_RULE_LABELS=Object.freeze({
 none:'بدون تعديل تلقائي',
 previous_thursday_next_sunday:'الجمعة → الخميس، السبت → الأحد',
 previous_workday:'الجمعة والسبت → الخميس السابق',
 next_workday:'الجمعة والسبت → الأحد التالي'
});
// Platform-wide default for all recurring Gregorian monthly payments.
// This is a prediction, not proof of an official provider disbursement date.
// The administrator can set paymentRule:'none' or supply a monthly override.
export const DEFAULT_MONTHLY_PAYMENT_RULE='previous_thursday_next_sunday';
export const validIso=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export const addDate=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
export const monthDay=(y,m,day)=>`${y}-${pad(m)}-${pad(Math.min(new Date(Date.UTC(y,m,0)).getUTCDate(),Math.max(1,Math.floor(Number(day)||1))))}`;
export function paymentRule(item={}){
 const configured=item.paymentRule;
 if(configured&&Object.prototype.hasOwnProperty.call(PAYMENT_RULE_LABELS,configured))return configured;
 return item.mode==='monthly'?DEFAULT_MONTHLY_PAYMENT_RULE:'none';
}
export function adjustPaymentDate(date,rule='none'){
 if(!validIso(date))return date;
 const weekday=new Date(date+'T12:00:00Z').getUTCDay();
 if(weekday===5){
  if(rule==='previous_thursday_next_sunday'||rule==='previous_workday')return addDate(date,-1);
  if(rule==='next_workday')return addDate(date,2);
 }
 if(weekday===6){
  if(rule==='previous_thursday_next_sunday'||rule==='next_workday')return addDate(date,1);
  if(rule==='previous_workday')return addDate(date,-2);
 }
 return date;
}
export function paymentDate(item,year,month){
 const regular=monthDay(year,month,item.day);
 // Overrides are keyed by the original due month. Useful for official
 // holiday exceptions without altering the global weekend rule.
 const override=item.paymentOverrides?.[`${year}-${pad(month)}`];
 return validIso(override)?override:adjustPaymentDate(regular,paymentRule(item));
}
export function paymentOccurrences(item,fromIso,months=12){
 if(!validIso(fromIso)||item.mode!=='monthly')return [];
 const [y,m]=fromIso.split('-').map(Number);
 // Include preceding nominal month: day 1 can advance into prior month.
 // Include following nominal month: a day 1 Friday can move to Thursday
 // in the preceding month. Filter the actual occurrence date afterwards.
 const start=Date.UTC(y,m-2,1),end=Date.UTC(y,m-1+months,1);
 const dates=new Set();
 for(let k=-1;k<=months;k++){
  const d=new Date(Date.UTC(y,m-1+k,1));
  const actual=paymentDate(item,d.getUTCFullYear(),d.getUTCMonth()+1);
  const stamp=Date.parse(actual+'T00:00:00Z');
  if(stamp>=Date.parse(fromIso+'T00:00:00Z')&&stamp<end)dates.add(actual);
 }
 return [...dates].sort();
}
export function nextPaymentDate(item,fromIso){
 if(!validIso(fromIso))return null;
 return paymentOccurrences(item,fromIso,15)[0]||null;
}
