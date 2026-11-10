/* Public app-style interaction guard. No changes to admin or design editors. */
(()=>{
 if(!document.body.classList.contains('visitor-only'))return;
 const editable=target=>!!target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]');
 document.addEventListener('contextmenu',event=>{
  if(!editable(event.target))event.preventDefault();
 },{capture:true});
 document.addEventListener('dragstart',event=>{
  if(!editable(event.target))event.preventDefault();
 },{capture:true});
 document.addEventListener('selectstart',event=>{
  if(!editable(event.target))event.preventDefault();
 },{capture:true});
 // Safari pinch gestures; leave standard one-finger scrolling intact.
 for(const type of ['gesturestart','gesturechange','gestureend']){
  document.addEventListener(type,event=>event.preventDefault(),{passive:false});
 }
 document.addEventListener('touchmove',event=>{
  if(event.touches.length>1)event.preventDefault();
 },{passive:false,capture:true});
 document.addEventListener('wheel',event=>{
  if(event.ctrlKey||event.metaKey)event.preventDefault();
 },{passive:false});
 // Avoid interfering with browser shortcuts used for accessibility.
})();
