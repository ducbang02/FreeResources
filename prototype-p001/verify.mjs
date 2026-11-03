// Reproducible local logic/template checks. DOM stubs are NOT a browser or a layout/a11y audit.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const elements=new Map(),handlers={},windowHandlers={},nodeHandlers={};
function element(id){
  if(!elements.has(id)){
    const classes=new Set();
    elements.set(id,{id,innerHTML:'',textContent:'',value:'',dataset:{},attrs:{},open:false,
      classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle(k,force){const next=force===undefined?!classes.has(k):force;next?classes.add(k):classes.delete(k);return next;}},
      setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},focus(){this.focused=true;},reset(){this.didReset=true;},
      showModal(){this.open=true;},close(){this.open=false;},scrollIntoView(){this.scrolled=true;},
      querySelector:s=>element(id+':'+s),addEventListener(k,f){nodeHandlers[id+':'+k]=f;}
    });
  }
  return elements.get(id);
}
class FormDataStub {
  constructor(form){this.fields=form.fields||[];}
  get(name){return this.fields.find(([k])=>k===name)?.[1]??null;}
  [Symbol.iterator](){return this.fields[Symbol.iterator]();}
}
const context={console,URL,URLSearchParams,FormData:FormDataStub,location:{hash:'#/C/home'},setTimeout:()=>1,clearTimeout(){},
  document:{getElementById:element,querySelector:s=>element(s),querySelectorAll:()=>[],addEventListener:(k,f)=>handlers[k]=f,title:''},
  scrollTo(){},addEventListener:(k,f)=>windowHandlers[k]=f,
  fetch(){throw Error('Unexpected network request in local prototype');}
};
context.window=context;vm.createContext(context);
for(const file of ['data.js','helpers.js','concepts/a.js','concepts/b.js','concepts/c.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const H=context.H,checks=[];
function check(name,fn){fn();checks.push(name);}
function setRoute(hash){context.location.hash=hash;return context.HUB_DEMO.parseRoute();}
function click(selector,node={}){const target={...node,closest:s=>s===selector?node:null};handlers.click({target,preventDefault(){}});}
function form(fields,kind){return {fields,id:kind==='contribution'?'contribution-form':'',matches:s=>s===`[data-${kind}]`};}
function submit(target){handlers.submit({target,preventDefault(){}});}

check('All 3 concepts render home, discovery and all 19 detail fixtures with real helpers',()=>{
  for(const concept of ['A','B','C']){
    H.state=setRoute(`#/${concept}/home`);
    const templates=[context.Concepts[concept].home(H,H.state),context.Concepts[concept].discover(H,{...H.state,page:'discover'}),...H.data.map(r=>context.Concepts[concept].detail(H,r,H.state))];
    for(const html of templates){
      assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${concept}: H1`);
      assert.equal((html.match(/<main(?:\s|>)/g)||[]).length,1,`${concept}: main`);
      assert.ok(!html.includes('undefined'),`${concept}: undefined`);
      assert.ok(!/href=["'](?:#|javascript:)["']/i.test(html),`${concept}: dummy href`);
      const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`${concept}: duplicate ID`);
      for(const m of html.matchAll(/(?:aria-labelledby|aria-controls)="([^"]+)"/g))for(const id of m[1].split(/\s+/))assert.ok((ids.includes(id)||id==='search-dialog'),`${concept}: dangling ${id}`);
      for(const m of html.matchAll(/src="([^"]+)"/g))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);
      for(const m of html.matchAll(/href="(#\/[^\"]+)"/g)){
        const href=m[1],route=href.split('?')[0].slice(4);
        if(route.startsWith('detail/'))assert.ok(H.get(route.slice(7)),href);
        if(route.startsWith('collection/'))assert.ok(context.HUB_COLLECTIONS.some(c=>c.id===route.slice(11)),href);
      }
    }
  }
});
check('Accents, d and natural file alias search',()=>{
  assert.equal(H.normalize('\u0110\u00e1nh gi\u00e1'),'danh gia');
  const s=setRoute('#/C/discover?q=chuyen+file');assert.ok(s.filtered.some(r=>r.id==='localsend'));
  assert.ok(setRoute('#/A/discover?q=PDF').filtered.some(r=>r.id==='stirling'));
});
check('Combined category/platform/price/type facets',()=>{
  const params=new URLSearchParams({category:H.get('localsend').category,platform:'Windows',price:H.get('localsend').price,kind:'app'});
  const s=setRoute('#/B/discover?'+params);assert.ok(s.filtered.some(r=>r.id==='localsend'));assert.ok(s.filtered.every(r=>r.category===H.get('localsend').category&&r.platforms.includes('Windows')&&r.kind==='app'));
});
check('Empty and escaped malicious query in all discovery templates',()=>{
  const p=new URLSearchParams({q:'<script>alert(1)</script>'});
  for(const c of ['A','B','C']){const s=setRoute(`#/${c}/discover?${p}`);H.state=s;assert.equal(s.filtered.length,0);const html=context.Concepts[c].discover(H,s);assert.ok(!html.includes('<script>alert(1)'));assert.ok(html.includes('&lt;script&gt;'));}
});
check('B and C grid/list preserve query and render different structures',()=>{
  for(const c of ['B','C']){const s=setRoute(`#/${c}/discover?view=list&q=file`);H.state=s;assert.ok(context.Concepts[c].discover(H,s).includes('resource-row'));assert.ok(!context.Concepts[c].discover(H,s).includes('class="resource-card '));}
});
check('Hash deep links, repeated render, unknown detail and unknown page',()=>{
  for(const hash of ['#/A/detail/localsend','#/B/detail/godot','#/C/discover?platform=Web','#/C/detail/missing','#/A/missing']){
    setRoute(hash);context.HUB_DEMO.render();assert.ok(element('app').innerHTML.includes('id="main"'));context.HUB_DEMO.render();assert.ok(!element('app').innerHTML.includes('undefined'));
  }
});
check('Search submit retains active facets/view and replaces query',()=>{
  H.state=setRoute('#/B/discover?platform=Windows&view=list');submit(form([['q','file']],'search'));const p=new URLSearchParams(context.location.hash.split('?')[1]);assert.equal(p.get('q'),'file');assert.equal(p.get('platform'),'Windows');assert.equal(p.get('view'),'list');
});
check('Filter submit preserves query and sort, removes all-valued facet',()=>{
  H.state=setRoute('#/C/discover?q=file&sort=name&kind=app');submit(form([['kind','all'],['platform','Windows']],'filters'));const p=new URLSearchParams(context.location.hash.split('?')[1]);assert.equal(p.get('q'),'file');assert.equal(p.get('sort'),'name');assert.equal(p.get('platform'),'Windows');assert.equal(p.has('kind'),false);
});
check('Sort change preserves current filters',()=>{
  H.state=setRoute('#/B/discover?platform=Windows');handlers.change({target:{value:'rating',matches:s=>s==='[data-sort]'}});const p=new URLSearchParams(context.location.hash.split('?')[1]);assert.equal(p.get('platform'),'Windows');assert.equal(p.get('sort'),'rating');
});
check('Concept switch keeps page and query',()=>{
  H.state=setRoute('#/A/detail/localsend?q=file');handlers.change({target:{id:'concept-switch',value:'B',matches:()=>false}});assert.equal(context.location.hash,'#/B/detail/localsend?q=file');
});
check('Session bookmark toggles and clear gives feedback',()=>{
  H.state=setRoute('#/C/home');click('[data-save]',{dataset:{save:'localsend'}});assert.ok(H.saved.has('localsend'));click('[data-save]',{dataset:{save:'localsend'}});assert.ok(!H.saved.has('localsend'));H.saved.add('godot');click('[data-clear-saved]');assert.equal(H.saved.size,0);assert.ok(element('toast').textContent);
});
check('Contribution dialog opens/resets/closes and returns focus',()=>{
  const opener={focus(){this.focused=true;}};const target={closest:s=>s==='[data-open="contribute"]'||s==='button,a'?opener:null};handlers.click({target});assert.equal(element('contribution-dialog').open,true);assert.equal(element('contribution-form').didReset,true);click('[data-close]');assert.equal(element('contribution-dialog').open,false);assert.equal(opener.focused,true);
});
check('Contribution errors, credentials rejected, valid URL yields text-only preview',()=>{
  for(const url of ['invalid','http://example.org','https://user:password@example.org']){submit(form([['url',url],['reason','Useful fixture tool']],'contribution'));assert.ok(element('contribution-status').textContent);assert.ok(!element('contribution-status').textContent.includes('example.org.\n'));}
  const reason='<img src=x onerror=alert(1)> a useful tool';submit(form([['url','https://example.org/tool'],['reason',reason]],'contribution'));assert.ok(element('contribution-status').textContent.includes(reason));assert.equal(element('contribution-status').innerHTML,'');
});
check('Menu opens, Escape closes and returns focus',()=>{
  const button={setAttribute(k,v){this[k]=v;}};click('[data-navtoggle]',button);assert.equal(element('primary-nav').classList.contains('open'),true);handlers.keydown({key:'Escape'});assert.equal(element('primary-nav').classList.contains('open'),false);assert.equal(element('[data-navtoggle]').focused,true);
});
check('Quick groups and reports produce local feedback',()=>{
  click('[data-quick]',{dataset:{quick:'repo'}});assert.ok(element('quick-results').innerHTML.includes('Godot'));click('[data-report]',{dataset:{report:'godot'}});assert.ok(element('toast').textContent);
});
check('Detail section links scroll and focus content',()=>{
  click('[data-scroll]',{dataset:{scroll:'source'}});assert.equal(element('.source-note').scrolled,true);assert.equal(element('.source-note').focused,true);
});
check('No fetch/XHR/WebSocket or remote runtime dependency',()=>{
  for(const file of ['data.js','helpers.js','app.js','concepts/a.js','concepts/b.js','concepts/c.js'])assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(fs.readFileSync(path.join(root,file),'utf8')),file);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g))assert.ok(!m[1].includes('://')&&fs.existsSync(path.join(root,m[1])),m[1]);
});
check('Asset hashes match source manifest and credits/licenses are retained',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/manifest.json'),'utf8'));for(const entry of manifest){const file=fs.readFileSync(path.join(root,'assets',entry.file));assert.equal(file.length,entry.bytes,entry.file);assert.equal(crypto.createHash('sha256').update(file).digest('hex'),entry.sha256,entry.file);}
});
check('Review selector renders all concepts and validates viewport/route inputs',()=>{
  const callbacks={},form={elements:{concept:{},screen:{},width:{}},addEventListener:(k,f)=>callbacks['form:'+k]=f},host={innerHTML:''};
  const review={URLSearchParams,location:{hash:'#concept=all&screen=detail/godot&width=390'},innerWidth:1200,document:{getElementById:id=>id==='review-controls'?form:host,querySelectorAll:()=>[]},addEventListener:(k,f)=>callbacks[k]=f};review.window=review;vm.createContext(review);vm.runInContext(fs.readFileSync(path.join(root,'review.js'),'utf8'),review);
  assert.equal((host.innerHTML.match(/<iframe /g)||[]).length,3);assert.equal((host.innerHTML.match(/data-width="390"/g)||[]).length,3);assert.ok(host.innerHTML.includes('index.html#/A/detail/godot'));
  review.location.hash='#concept=invalid&screen=%3Cscript%3E&width=100';callbacks.hashchange();assert.ok(!host.innerHTML.includes('<script>'));assert.ok(host.innerHTML.includes('data-width="1440"'));assert.ok(host.innerHTML.includes('index.html#/A/home'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,templates:3*(H.data.length+2),resources:H.data.length,scope:'Node VM / DOM stubs / template + local assets. NOT browser, layout, responsive, console or keyboard QA.',cases:checks},null,2));
