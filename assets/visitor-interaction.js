/* Native-like public UI: block webpage pinch/double-tap zoom, preserve scrolling & inputs. */
(()=>{
 if(!document.body.classList.contains('visitor-only'))return;
 const editable=target=>!!target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]');
 for(const type of ['contextmenu','dragstart','selectstart']){
  document.addEventListener(type,event=>{if(!editable(event.target))event.preventDefault();},{capture:true});
 }
 // iOS Safari supports non-standard gesture events; suppress as early as possible.
 for(const target of [window,document]){
  for(const type of ['gesturestart','gesturechange','gestureend']){
   target.addEventListener(type,event=>{if(event.cancelable)event.preventDefault();},{capture:true,passive:false});
  }
 }
 document.addEventListener('touchstart',event=>{
  if(event.touches.length>1&&event.cancelable)event.preventDefault();
 },{capture:true,passive:false});
 document.addEventListener('touchmove',event=>{
  if(event.touches.length>1&&event.cancelable)event.preventDefault();
 },{capture:true,passive:false});
 // Prevent the fast double-tap browser zoom without intercepting normal taps.
 let lastTapAt=0,lastTapTarget=null;
 document.addEventListener('touchend',event=>{
  if(event.changedTouches.length!==1||editable(event.target))return;
  const now=performance.now();
  if(now-lastTapAt<310&&lastTapTarget===event.target&&event.cancelable)event.preventDefault();
  lastTapAt=now;lastTapTarget=event.target;
 },{capture:true,passive:false});
 document.addEventListener('wheel',event=>{
  if((event.ctrlKey||event.metaKey)&&event.cancelable)event.preventDefault();
 },{passive:false});
})();
