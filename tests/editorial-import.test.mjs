import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {editorFixture,githubFixture,sandbox,doc} from './helpers/editorial.mjs';
import {Editor} from '../scripts/editorial/workflow.mjs';
import {Store} from '../scripts/editorial/store.mjs';
import {githubJson} from '../scripts/editorial/github.mjs';
const url='https://github.com/fixture-org/tool';
test('P02 GitHub API creates a durable unreviewed draft without AI or catalog mutation',async t=>{
  const f=editorFixture(t),before=fs.readFileSync(f.catalog,'utf8'),draft=await f.editor.importUrl(url);
  assert.equal(draft.identity.githubId,'987654321');assert.equal(draft.source.metadata.licenseVerification,'unreviewed');assert.equal(draft.editorial.license,null);assert.equal(draft.policy.freeModel,'unknown');assert.equal(draft.preliminary.status,'pending');assert.equal(draft.finalReview,null);assert.equal(draft.source.evidence.length,3);assert.equal(f.calls.length,3);assert.ok(f.calls.every(c=>new URL(c.url).hostname==='api.github.com'&&!c.options.headers.Authorization));assert.equal(fs.readFileSync(f.catalog,'utf8'),before);
  const restarted=new Editor({...f,request:f.request});assert.equal(restarted.store.draft(draft.id).identity.githubId,'987654321');
  const duplicate=await restarted.importUrl(url+'.git');assert.equal(duplicate.duplicate,true);assert.equal(f.calls.length,3);
  const saved=f.editor.store.draft(draft.id);saved.editorial.summary='Manually edited Vietnamese fixture';f.editor.store.save(saved);
  f.repository.description='Changed author description';const refreshed=await restarted.importUrl(null,{refreshId:draft.id});assert.equal(refreshed.editorial.summary,saved.editorial.summary);assert.deepEqual(refreshed.analyses,{});assert.equal(f.editor.store.list().length,1);
});
test('P02 missing README/license stay unknown/partial; bad documents cannot be evidence',async t=>{
  const f=editorFixture(t,{'/repos/fixture-org/tool/readme':{status:404,headers:{},body:''},'/repos/fixture-org/tool/license':{status:200,headers:{},body:JSON.stringify({...doc(),size:999999})}});
  f.repository.license=null;const d=await f.editor.importUrl(url);assert.equal(d.source.metadata.licenseSpdx,null);assert.equal(d.source.state,'partial');assert.equal(d.source.evidence.length,1);assert.equal(d.editorial.license,null);assert.ok(d.source.issues.some(s=>s.includes('TOO_LARGE')));
});
test('P02 unavailable/private repositories create blocked local drafts and never cache private data',async t=>{
  for(const response of [{status:404,headers:{},body:''},{status:200,headers:{},body:JSON.stringify({private:true,description:'not-public'})},{status:200,headers:{},body:'not JSON'}]){
    const f=editorFixture(t,{all:response}),d=await f.editor.importUrl(url);assert.equal(d.lastRefresh.state,'failed');assert.equal(d.source.evidence.length,0);assert.equal(f.calls.length,1);assert.ok(!JSON.stringify(f.editor.store.list()).includes('not-public'));
  }
});
test('P02 ETag cache hit/304, negative cache and rate-limit deferral are bounded',async t=>{
  const f=sandbox(t),store=new Store(f.stateDir),api=githubFixture();let clock=new Date('2026-11-05T01:00:00Z');const options={store,request:api.request,now:()=>clock};
  await githubJson('/repos/fixture-org/tool',options);await githubJson('/repos/fixture-org/tool',options);assert.equal(api.calls.length,1);
  api.overrides.all={status:304,headers:{etag:'"fixture-v1"'},body:''};clock=new Date('2026-11-06T01:00:00Z');const data=await githubJson('/repos/fixture-org/tool',options);assert.equal(data.id,987654321);assert.equal(api.calls[1].options.headers['If-None-Match'],'"fixture-v1"');
  await assert.rejects(githubJson('/repos/fixture-org/missing',options),/304_WITHOUT_CACHE/);
  api.overrides.all={status:429,headers:{'retry-after':'120'},body:''};await assert.rejects(githubJson('/repos/fixture-org/limited',options),/RATE_LIMIT/);const calls=api.calls.length;await assert.rejects(githubJson('/repos/fixture-org/other',options),/RATE_LIMIT/);assert.equal(api.calls.length,calls);assert.equal(store.read('github-rate.json').nextAttemptAt,'2026-11-06T01:02:00.000Z');
});
test('P02 API rename resolves stable identity and selected docs cannot request executable/secrets paths',async t=>{
  const f=editorFixture(t);f.repository.full_name='fixture-org/renamed';f.repository.name='renamed';f.repository.html_url='https://github.com/fixture-org/renamed';const d=await f.editor.importUrl(url);assert.equal(d.identity.canonicalUrl,f.repository.html_url);assert.deepEqual(d.identity.aliases,[url]);
  const {githubDocument}=await import('../scripts/editorial/github.mjs');for(const file of ['../README.md','.env','install.exe','secret.json','x/credentials.json'])await assert.rejects(githubDocument(d.identity,file,{store:f.editor.store,request:f.request}),/PATH_NOT_ALLOWED/);
});
