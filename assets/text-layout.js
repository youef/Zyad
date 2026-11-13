/* Safe canvas typography for Arabic, dates, counters and captions. */
export function formatCounter(value,{pad=true}={}){
 const number=Number(value);if(!Number.isFinite(number))return '—';
 const str=String(Math.max(0,Math.floor(number)));return pad&&str.length===1?str.padStart(2,'0'):str;
}
function breakLines(c,source,maxWidth){
 const words=String(source).replace(/\s+/g,' ').trim().split(' ').filter(Boolean),tokens=[];
 for(const word of words){
  if(c.measureText(word).width<=maxWidth){tokens.push(word);continue;}
  let part='';
  for(const letter of Array.from(word)){if(part&&c.measureText(part+letter).width>maxWidth){tokens.push(part);part=letter;}else part+=letter;}
  if(part)tokens.push(part);
 }
 const lines=[];let current='';
 for(const word of tokens){const next=current?current+' '+word:word;if(current&&c.measureText(next).width>maxWidth){lines.push(current);current=word;}else current=next;}
 if(current)lines.push(current);return lines;
}
export function fitText(c,value,{x=0,y=0,w=100,h=30,size=26,minSize=13,maxLines=2,weight=800,color='#173f35',align='center',direction='rtl',font=null,lineHeight=1.22}={}){
 const content=String(value??'').replace(/\s+/g,' ').trim();
 if(!content||!(w>4)||!(h>4))return {lines:[],fontSize:0,clipped:false};
 const family=font||c.zyadFont||'"Cairo",Tahoma,Arial,sans-serif',width=Math.max(4,w),height=Math.max(4,h),smallest=Math.max(9,Math.min(size,minSize));
 c.save();c.direction=direction;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;
 let point=size,lines=[];
 while(point>=smallest){c.font=`${weight} ${point}px ${family}`;lines=breakLines(c,content,width-6);if(lines.length<=maxLines&&lines.length*point*lineHeight<=height-4)break;point--;}
 if(point<smallest){point=smallest;c.font=`${weight} ${point}px ${family}`;lines=breakLines(c,content,width-6);}
 const clipped=lines.length>maxLines;
 if(clipped){const keep=lines.slice(0,Math.max(1,maxLines)),last=keep.length-1,chars=Array.from(lines.slice(last).join(' '));while(chars.length&&c.measureText(chars.join('')+'…').width>width-6)chars.pop();keep[last]=(chars.join('').trim()||'')+'…';lines=keep;}
 c.beginPath();c.rect(x,y,width,height);c.clip();
 const step=point*lineHeight,mid=y+height/2,tx=align==='right'?x+width-4:align==='left'?x+4:x+width/2;
 lines.forEach((line,i)=>c.fillText(line,tx,mid+(i-(lines.length-1)/2)*step,width-6));
 c.restore();return {lines,fontSize:point,clipped};
}
