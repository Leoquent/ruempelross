const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
let now=0, nextFrame, events={}, windowEvents={};
const classes=new Set();
const strip={classList:{contains:x=>classes.has(x),toggle(x,on){on=on===undefined?!classes.has(x):on;on?classes.add(x):classes.delete(x);return on;},add:x=>classes.add(x),remove:x=>classes.delete(x)}};
const viewport={scrollLeft:0,clientWidth:390,setAttribute(){},setPointerCapture(){},addEventListener(k,f){events[k]=f;}};
const button={addEventListener(){},setAttribute(){}};
const group={getBoundingClientRect:()=>({width:3848}),querySelectorAll:()=>[],cloneNode:()=>({setAttribute(){},querySelectorAll:()=>[]})};
const track={children:[group],appendChild(c){this.children.push(c);}};group.parentElement=track;
strip.querySelector=x=>({'.work-group':group,'.work-pause':button,'.work-window':viewport}[x]);
vm.runInNewContext(readFileSync('site/js/enhancements.js','utf8'),{document:{documentElement:{lang:'de'},querySelectorAll:x=>x==='.work-strip'?[strip]:[],querySelector:()=>null,hidden:false},window:{innerWidth:390,matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(k,f){windowEvents[k]=f;}},performance:{now:()=>now},getComputedStyle:()=>({columnGap:'16'}),ResizeObserver:class{observe(){}},requestAnimationFrame:f=>(nextFrame=f,1),cancelAnimationFrame(){}});
function frame(){now+=16;nextFrame(now);assert(viewport.scrollLeft>=3864&&viewport.scrollLeft<7728,'loop remains inside repeated sequence');}
function pointer(type,x,id=1){now+=8;const e={type,pointerId:id,pointerType:'touch',isPrimary:true,clientX:x,button:0,preventDefault(){}};(events[type]||windowEvents[type])(e);}
setImmediate(()=>{
 for(let i=0;i<40;i++){
  pointer('pointerdown',350);pointer('pointermove',i%2?-30000:30000);pointer('pointerup',0);
  frame();let previous=viewport.scrollLeft;frame();let movement=Math.abs(viewport.scrollLeft-previous);movement=Math.min(movement,3864-movement);assert(movement<=32.1,'inertia capped at 2 px/ms');
 }
 for(let i=0;i<160;i++)frame();
 const before=viewport.scrollLeft;for(let i=0;i<10;i++)frame();assert.notEqual(viewport.scrollLeft,before,'autoplay resumes');
 pointer('pointerdown',350);pointer('pointermove',20);pointer('pointercancel',20);frame();const canceled=viewport.scrollLeft;for(let i=0;i<10;i++)frame();assert.notEqual(viewport.scrollLeft,canceled,'vertical gesture cancellation cannot leave slider stuck');
 assert(!classes.has('is-dragging'));
 console.log('PASS: 40 rapid alternating swipes, loop boundaries, capped inertia, autoplay recovery and pointer cancellation');
});
