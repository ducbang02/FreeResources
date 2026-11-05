import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import {createAdminServer} from '../scripts/admin/server.mjs';
import {editorFixture} from './helpers/editorial.mjs';
async function fixture(t){const f=editorFixture(t),server=createAdminServer({editor:f.editor});await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{server.closeAllConnections();server.close();});const base='http://127.0.0.1:'+server.address().port;
 const state=await(await fetch(base+'/admin/api/state')).json();
 async function action(body,expected=200){const r=await fetch(base+'/admin/api/action',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','X-Admin-CSRF':state.csrf},body:JSON.stringify(body)});assert.equal(r.status,expected);return(await r.json()).result??null;}
 return{...f,server,base,state,action};}
const patch=url=>({editorial:{title:'[Fixture Admin] Công cụ',summary:'Nội dung kiểm thử, chưa phải tài nguyên thật.',description:'Mô tả fixture dành riêng cho kiểm thử local.',categories:['van-phong'],tags:['chuyen-file'],pricing:'Miễn phí theo fixture'},policy:{groups:['free_apps'],freeModel:'freeware',licenseStatus:'unknown',officialSourceVerified:true,freeEvidenceUrl:url,freeLimitations:''},verifiedSources:[{url,label:'Nguồn fixture được người kiểm thử đối chiếu',fields:['summary','canonicalUrl','pricing']}]});
test('Admin local security rejects hostile Host/Origin/Fetch Metadata, CSRF, traversal and non-JSON writes',async t=>{
 const f=await fixture(t);const before=fs.readFileSync(f.catalog,'utf8');
 for(const headers of [{Origin:'https://evil.example'},{'Sec-Fetch-Site':'cross-site'},{Origin:'null'}])assert.equal((await fetch(f.base+'/admin/api/state',{headers})).status,403);
 const hostStatus=await new Promise(resolve=>{const req=http.request(f.base+'/admin/api/state',{headers:{Host:'evil.example'}},r=>{r.resume();resolve(r.statusCode);});req.end();});assert.equal(hostStatus,403);
 for(const headers of [{Origin:f.base},{Origin:f.base,'X-Admin-CSRF':'f'.repeat(64)},{'X-Admin-CSRF':f.state.csrf}])assert.equal((await fetch(f.base+'/admin/api/action',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:'{}'})).status,403);
 assert.equal((await fetch(f.base+'/admin/api/action',{method:'POST',headers:{Origin:f.base,'X-Admin-CSRF':f.state.csrf,'Content-Type':'text/plain'},body:'{}'})).status,415);
 for(const url of ['/scripts/admin/server.mjs','/.env','/admin/assets/../../.env','/admin/api/action'])assert.ok((await fetch(f.base+url)).status>=400);
 const page=await fetch(f.base+'/admin/resources');assert.equal(page.status,200);assert.ok(page.headers.get('content-security-policy').includes("frame-ancestors 'none'"));assert.equal(page.headers.get('access-control-allow-origin'),null);assert.equal(page.headers.get('cache-control'),'no-store');
 assert.equal(fs.readFileSync(f.catalog,'utf8'),before);assert.equal(f.calls.length,0);
});
test('Admin HTTP imports, rules, edits, reviews and explicitly exports through the shared Editor',async t=>{
 const f=await fixture(t),before=fs.readFileSync(f.catalog,'utf8'),d=await f.action({action:'import',url:'https://github.com/fixture-org/tool'});assert.equal(d.finalReview,null);assert.equal((await f.action({action:'rules',id:d.id})).categories[0],'van-phong');
 await f.action({action:'export',id:d.id},400);assert.equal(fs.readFileSync(f.catalog,'utf8'),before);
 let next=await f.action({action:'edit',id:d.id,revision:d.revision,patch:patch(d.identity.canonicalUrl)});
 next=await f.action({action:'review',id:d.id,revision:next.revision,status:'suitable',by:'Admin fixture'});
 next=await f.action({action:'approve',id:d.id,revision:next.revision,by:'Admin fixture'});
 const plan=await f.action({action:'export',id:d.id});assert.equal(fs.readFileSync(f.catalog,'utf8'),before);await f.action({action:'export',id:d.id,apply:true,expect:'stale'},409);
 const receipt=await f.action({action:'export',id:d.id,apply:true,expect:plan.planId});assert.equal(receipt.applied,true);assert.equal(JSON.parse(fs.readFileSync(f.catalog)).resources.length,14);
 let state=await(await fetch(f.base+'/admin/api/state')).json();assert.equal(state.drafts[0].status,'exported');
 next=await f.action({action:'edit',id:d.id,revision:next.revision,patch:{editorial:{summary:'Sửa sau Export'}}});assert.equal(next.finalReview,null);
 next=await f.action({action:'review',id:d.id,revision:next.revision,status:'suitable',by:'Admin fixture'});next=await f.action({action:'approve',id:d.id,revision:next.revision,by:'Admin fixture'});
 state=await(await fetch(f.base+'/admin/api/state')).json();assert.equal(state.drafts[0].status,'approved','Old receipt must not label newly edited content exported');
 const duplicate=await f.action({action:'import',url:'https://github.com/fixture-org/tool.git'});assert.equal(duplicate.duplicate,true);assert.equal(f.editor.store.list().length,1);
});
test('Admin rejects malformed/oversize bodies, arbitrary actions and paths; failed imports preserve a reviewable draft',async t=>{
 const f=await fixture(t);for(const body of [{action:'shell',command:'whoami'},{action:'import',url:'not-a-url'},{action:'import',url:'https://127.0.0.1/'},{action:'edit',id:'../../.env',revision:1,patch:{}}])await f.action(body,400);
 assert.equal((await fetch(f.base+'/admin/api/action',{method:'POST',headers:{Origin:f.base,'X-Admin-CSRF':f.state.csrf,'Content-Type':'application/json'},body:JSON.stringify({action:'import',url:'x'.repeat(132000)})})).status,413);
 f.overrides.all={status:404,headers:{},body:''};const d=await f.action({action:'import',url:'https://github.com/fixture-org/missing'});assert.equal(d.lastRefresh.state,'failed');assert.equal(d.source.evidence.length,0);await f.action({action:'export',id:d.id},400);
});
test('Admin and CLI stale edits/reviews reject inside the existing writer lock without losing data',async t=>{
 const f=await fixture(t),d=await f.editor.importUrl('https://github.com/fixture-org/tool');await f.editor.edit(d.id,{editorial:{summary:'Sửa từ CLI trước'}});
 for(const body of [{action:'edit',patch:{editorial:{summary:'Ghi đè cũ'}}},{action:'review',status:'suitable',by:'Old tab'},{action:'approve',by:'Old tab'}])await f.action({...body,id:d.id,revision:d.revision},409);
 assert.equal(f.editor.store.draft(d.id).editorial.summary,'Sửa từ CLI trước');assert.equal(f.editor.store.draft(d.id).preliminary.status,'pending');
});
test('Admin concurrent import is bounded; duplicate clicks never create two drafts',async t=>{
 const f=await fixture(t),request=f.editor.request;let release,started;const entered=new Promise(r=>started=r),gate=new Promise(r=>release=r);
 f.editor.request=async(...args)=>{started();await gate;return request(...args);};const first=f.action({action:'import',url:'https://github.com/fixture-org/tool'});await entered;
 await f.action({action:'import',url:'https://github.com/fixture-org/tool'},409);release();await first;assert.equal(f.editor.store.list().length,1);
});
test('Admin Gemini disabled uses no key; errors and API state never expose server credentials',async t=>{
 const f=await fixture(t),d=await f.action({action:'import',url:'https://github.com/fixture-org/tool'});await f.action({action:'analyze',id:d.id,mode:'quick'},400);assert.equal(f.calls.filter(c=>c.url.includes('googleapis')).length,0);
 const key='synthetic-admin-secret-not-a-real-key-000000',old=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY=key;t.after(()=>{if(old===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=old;});
 const response=await fetch(f.base+'/admin/api/state'),text=await response.text();assert.ok(!text.includes(key));assert.ok(!text.includes('keyFingerprint'));assert.ok(!text.includes('freeTierConfirmation'));
 assert.equal(JSON.parse(text).ai.ready,false);assert.equal(JSON.parse(text).usage.used,0);
 // Treat source text as untrusted even when it echoes a credential.
 const saved=f.editor.store.draft(d.id);saved.editorial.summary=key;f.editor.store.save(saved);assert.ok(!(await(await fetch(f.base+'/admin/api/draft/'+d.id)).text()).includes(key));
});
