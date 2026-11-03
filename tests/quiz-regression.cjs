// Run with node --test tests/quiz-regression.cjs. No network requests are made.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('site/js/quiz.js','utf8');
function setup(response={success:true}){
  const elements=new Map();
  function el(id){if(!elements.has(id))elements.set(id,{value:'',checked:true,style:{},textContent:'',innerHTML:'',children:[],focus(){this.focused=true;},checkValidity(){return !this.value || /^[^@]+@[^@]+\.[^@]+$/.test(this.value);},appendChild(x){this.children.push(x);},addEventListener(event,fn){this[event]=fn;}});return elements.get(id);}
  el('name').value='Test Person';el('tel').value='07111234567';el('email').value='test@example.com';el('submitBtn').textContent='Anfragen';
  let sent,shown;
  const state={objekt:'Wohnung',groesse:'unter 50 m²',fuellgrad:'ca. halb voll',extras:[],plz:'70180',termin:'Flexibel',zugang:'Erdgeschoss'};
  const context={state,lang:'de',document:{getElementById:el,querySelector:()=>null,createElement:()=>el('new-'+Math.random())},storage:{setItem(){},removeItem(){}},save(){},updateAllWhatsAppLinks(){},show(i){shown=i;},order:['objekt','danke'],bar:{style:{}},MAIL_TO:'test@example.com',ENDPOINT:'test://disabled',AbortController,setTimeout,clearTimeout,fetch:async(url,options)=>{sent=JSON.parse(options.body);if(response instanceof Error)throw response;return{ok:true,json:async()=>response};}};
  vm.createContext(context);
  const translations=source.slice(source.indexOf('  var TRANSLATIONS'),source.indexOf('  /* ---------- WhatsApp'));
  const prices=source.slice(source.indexOf('  var ERWT'),source.indexOf('  /* ---------- State'));
  const calc=source.slice(source.indexOf('  function calcPrice'),source.indexOf('  /* ---------- Absenden'));
  const submit=source.slice(source.indexOf("  document.getElementById('quiz').addEventListener('submit'"),source.lastIndexOf("  overlay.querySelectorAll('[data-value]')"));
  vm.runInContext(translations+prices+calc+submit,context);
  return {context,el,state,get sent(){return sent;},get shown(){return shown;},async submit(){el('quiz').submit({preventDefault(){}});await new Promise(resolve=>setImmediate(resolve));}};
}
test('price is computed before submission, reply address included, success resets button',async()=>{
  const app=setup();await app.submit();assert.match(app.sent.Zusammenfassung,/1\.480 € – 1\.870 €/);assert.equal(app.sent._replyto,'test@example.com');assert.equal(app.shown,1);assert.equal(app.el('submitBtn').disabled,false);
});
test('provider rejection stays on form and presents retry',async()=>{
  const app=setup({success:false});await app.submit();assert.equal(app.shown,undefined);assert.equal(app.el('formError').style.display,'block');assert.equal(app.el('submitBtn').disabled,false);assert.equal(app.el('formError').focused,true);
});
test('network failure never reports success',async()=>{
  const app=setup(new Error('offline'));await app.submit();assert.equal(app.shown,undefined);assert.match(app.el('formError').innerHTML,/mailto:/);
});
test('invalid optional email prevents submission',async()=>{
  const app=setup();app.el('email').value='invalid';await app.submit();assert.equal(app.sent,undefined);assert.equal(app.el('formError').style.display,'block');
});
test('special cases use individual quote; existing matrix values remain intact',()=>{
  const app=setup();app.state.fuellgrad='Messie / Härtefall';assert.equal(app.context.calcPrice(),null);app.state.objekt='Gewerbe';app.state.fuellgrad='ca. halb voll';assert.equal(app.context.calcPrice(),null);app.state.objekt='Keller';app.state.groesse='unter 15 m²';app.state.fuellgrad='bis zu 1/4 voll';assert.equal(app.context.calcPrice().base,130);
});
