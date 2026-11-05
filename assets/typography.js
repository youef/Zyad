export const FONT_OPTIONS=[['cairo','Cairo — عصري'],['tajawal','تجوال — خفيف وواضح'],['kufi','كوفي — هندسي'],['amiri','أميري — نسخي']];
export const fontStack=key=>({cairo:'"Cairo",Tahoma,Arial,sans-serif',tajawal:'"Tajawal",Tahoma,Arial,sans-serif',kufi:'"Noto Kufi Arabic",Tahoma,Arial,sans-serif',amiri:'"Amiri",Georgia,serif',serif:'Georgia,serif'}[key]||'"Cairo",Tahoma,Arial,sans-serif');
export async function loadTypeface(key='cairo'){if(typeof document==='undefined')return;await document.fonts.load('700 32px '+fontStack(key),'بطاقتي الذكية');}
