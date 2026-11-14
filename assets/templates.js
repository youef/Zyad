/* A single source of truth for the template gallery and its palette controls. */
import {CALENDAR_PRESETS,CLASSIC_COMPOSITIONS} from './calendar-catalog.js';
import {LIST_PRESETS} from './list-presets.js';
export const CARD_PRESETS=Object.freeze([
 {id:'royal',name:'الملكي السعودي',description:'أخضر زمردي مع زخارف ذهبية',symbol:'✦',theme:{green:'#064b43',greenLight:'#37765e',gold:'#c99a42',cream:'#f8f5ea',ink:'#103f38'}},
 {id:'modern',name:'العصري',description:'مساحات نقية وتباين واضح',symbol:'▦',theme:{green:'#116b60',greenLight:'#539c89',gold:'#c0a15b',cream:'#f2f8f5',ink:'#123d35'}},
 {id:'night',name:'الليلي',description:'درجات عميقة وإضاءة ذهبية',symbol:'☾',theme:{green:'#123d36',greenLight:'#356e62',gold:'#e0b55b',cream:'#102a26',ink:'#edf3e7'}},
 {id:'desert',name:'الصحراء الملكية',description:'هوية رملية ولمسات نحاسية',symbol:'◆',theme:{green:'#693f30',greenLight:'#9a6945',gold:'#bd9259',cream:'#fbf0df',ink:'#5d3d2c'}},
 {id:'pearl',name:'اللؤلؤة',description:'عاجي ونفحات نعناع',symbol:'◇',theme:{green:'#166d5b',greenLight:'#4d9e86',gold:'#bc9555',cream:'#fffdf8',ink:'#155947'}},
 {id:'heritage',name:'التراثي',description:'المدالية الكلاسيكية والزخرفة الأصيلة',symbol:'❖',theme:{green:'#064b43',greenLight:'#37765e',gold:'#c99a42',cream:'#f8f5ea',ink:'#103f38'}}
].map(p=>({...p,category:'التقويم الكلاسيكي',calendar:CLASSIC_COMPOSITIONS[p.id]})).concat(CALENDAR_PRESETS,LIST_PRESETS,[
 {id:'inspire-sadu',name:'سدو نجد',nameEn:'Najdi Sadu',description:'نسيج نجدي بزخارف هندسية وألوان دافئة',descriptionEn:'Warm tones and Najdi textile geometry',category:'بطاقات يومية فاخرة',symbol:'❖',theme:{green:'#75372e',greenLight:'#a46551',gold:'#9c592e',cream:'#faf0e3',ink:'#492724'},fontFamily:'tajawal',inspiration:'sadu'},
 {id:'inspire-dawn',name:'فجر الشمال',nameEn:'Northern Dawn',description:'أفق صحراوي عند الفجر بدرجات الخزامى',descriptionEn:'A lavender desert horizon at dawn',category:'بطاقات يومية فاخرة',symbol:'◒',theme:{green:'#55466f',greenLight:'#85739f',gold:'#8c5c70',cream:'#f6eef8',ink:'#37294c'},fontFamily:'tajawal',inspiration:'dawn'},
 {id:'inspire-coast',name:'ساحل اللؤلؤ',nameEn:'Pearl Coast',description:'طبقات مائية وتموّجات بلون البحر',descriptionEn:'Layered teal waves and a pearl palette',category:'بطاقات يومية فاخرة',symbol:'≈',theme:{green:'#135969',greenLight:'#428b94',gold:'#407687',cream:'#effbfa',ink:'#143f49'},fontFamily:'tajawal',inspiration:'coast'},
 {id:'inspire-olive',name:'ورق الزيتون',nameEn:'Olive Leaf',description:'ورق عاجي وأغصان مرسومة بأسلوب تحريري',descriptionEn:'Ivory paper and illustrated olive branches',category:'بطاقات يومية فاخرة',symbol:'✦',theme:{green:'#3c5837',greenLight:'#77906b',gold:'#746038',cream:'#f7f4e8',ink:'#2c402b'},fontFamily:'tajawal',inspiration:'olive'},
 {id:'inspire-botanical',name:'إشراقة الورد',description:'بطاقة يومية إيمانية بالورود والزخارف الهادئة',category:'بطاقات يومية فاخرة',symbol:'❀',theme:{green:'#07564f',greenLight:'#4c8b83',gold:'#bc9857',cream:'#fffaf1',ink:'#173e3b'},inspiration:'botanical'},
 {id:'inspire-royal',name:'الرسالة الملكية',description:'تصميم زمردي بإطار ذهبي ورسالة اليوم',category:'بطاقات يومية فاخرة',symbol:'✦',theme:{green:'#083f39',greenLight:'#286b62',gold:'#d6ad64',cream:'#fff8e9',ink:'#103a36'},inspiration:'royal'},
 {id:'inspire-pearl',name:'يوم من نور',description:'بطاقة عاجية عصرية برسالة ومواعيد اليوم',category:'بطاقات يومية فاخرة',symbol:'◇',theme:{green:'#287268',greenLight:'#75aaa1',gold:'#c3a677',cream:'#fffdf8',ink:'#244c48'},inspiration:'pearl'}
]));
const byId=new Map(CARD_PRESETS.map(item=>[item.id,item]));
export const validPreset=id=>byId.has(id);
export const presetInfo=id=>byId.get(id)||CARD_PRESETS[0];
export const presetTheme=id=>({...presetInfo(id).theme});
export function applyPreset(config,id,{updateColors=true}={}){
 if(!validPreset(id))throw Error('قالب غير معروف');
 config.design={pattern:true,patternStrength:.07,highlightNext:true,showUnit:true,density:'comfortable',...(config.design||{}),preset:id};
 config.design.fontFamily=presetInfo(id).fontFamily||['cairo','tajawal','kufi','amiri'][Math.max(0,CARD_PRESETS.findIndex(p=>p.id===id))%4];
 if(updateColors)config.theme={...config.theme,...presetTheme(id)};
 return config;
}
export function duplicateForPreset(config,id){
 const copy=JSON.parse(JSON.stringify(config));
 return applyPreset(copy,id,{updateColors:true});
}
