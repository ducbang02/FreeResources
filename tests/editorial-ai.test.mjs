import test from 'node:test';import assert from 'node:assert/strict';
import {editorFixture} from './helpers/editorial.mjs';import {digest} from '../scripts/editorial/store.mjs';
import {usage,vietnamDay,publicConfig} from '../scripts/editorial/gemini.mjs';
const env={GEMINI_API_KEY:'synthetic-fixture-not-a-real-key-00000000'};
function valid(mode='quick'){
  const result={summary_vi:'Tóm tắt tiếng Việt từ fixture, chưa được xác minh thật.',primary_category:'van-phong',tags:['chuyen-file'],target_users:['Người dùng fixture'],unknowns:['Cần reviewer xác minh'],source_references:[{field:'summary_vi',evidence_ids:['repository']},{field:'primary_category',evidence_ids:['repository']},{field:'tags',evidence_ids:['repository']},{field:'target_users',evidence_ids:['readme']}],claims:[{field:'purpose',text:'Công dụng được gợi ý từ fixture.',evidence_ids:['readme']}],confidence:'low'};
  if(mode==='deep'){result.description_vi='Phân tích fixture có dẫn chứng, không phải security audit.';result.source_references.push({field:'description_vi',evidence_ids:['readme']});result.claims.push({field:'installation',text:'Đọc hướng dẫn chính thức trước khi cài đặt.',evidence_ids:['readme']});}return result;
}
async function aiFixture(t){
  const f=editorFixture(t),d=await f.editor.importUrl('https://github.com/fixture-org/tool');let clock=new Date('2026-11-05T03:00:00Z'),response=null,calls=0;f.editor.now=()=>clock;
  const config={schemaVersion:1,enabled:true,projectId:'fixture-project',model:'gemini-fixture-flash-lite',maxOutputTokens:2000,freeTierConfirmation:{projectId:'fixture-project',model:'gemini-fixture-flash-lite',keyFingerprint:digest(env.GEMINI_API_KEY),billingTier:'free',billingEnabled:false,accessConfirmed:true,verifiedBy:'Fixture editor',verifiedAt:'2026-11-05T00:00:00Z',expiresAt:'2026-11-08T00:00:00Z'}};
  f.editor.store.write('config.json',config);
  const request=f.request;f.editor.request=async(url,options)=>{
    if(!url.includes('generativelanguage.googleapis.com'))return request(url,options);calls++;assert.equal(new URL(url).search,'');assert.equal(options.headers['x-goog-api-key'],env.GEMINI_API_KEY);const body=JSON.parse(options.body),input=JSON.parse(body.contents[0].parts[0].text);assert.equal(body.tools,undefined);assert.equal(body.generationConfig.responseMimeType,'application/json');assert.ok(body.generationConfig.responseJsonSchema);assert.ok(Buffer.byteLength(options.body)<=32768);
    if(response instanceof Error)throw response;if(response)return response;
    return{status:200,headers:{},body:JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(valid(input.mode))}]}}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:80,thoughtsTokenCount:10,cachedContentTokenCount:0,totalTokenCount:190},modelVersion:'fixture-v1',responseId:'fixture-response'})};
  };
  return{...f,d,config,setClock:value=>clock=new Date(value),setResponse:value=>response=value,calls:()=>calls};
}
test('P02 AI defaults off, missing key and unconfirmed/mismatched paid project fail before network',async t=>{
  const f=await aiFixture(t);f.editor.store.write('config.json',{...f.config,enabled:false});await assert.rejects(f.editor.analyze(f.d.id,'quick',{env}),/DISABLED/);
  f.editor.store.write('config.json',f.config);await assert.rejects(f.editor.analyze(f.d.id,'quick',{env:{}}),/KEY_MISSING/);
  for(const confirmation of [null,{...f.config.freeTierConfirmation,billingEnabled:true},{...f.config.freeTierConfirmation,model:'other'},{...f.config.freeTierConfirmation,keyFingerprint:'wrong'},{...f.config.freeTierConfirmation,expiresAt:'2026-11-04T00:00:00Z'}]){f.editor.store.write('config.json',{...f.config,freeTierConfirmation:confirmation});await assert.rejects(f.editor.analyze(f.d.id,'quick',{env}),/CONFIRMATION/);}
  assert.equal(f.calls(),0);assert.equal(usage(f.editor.store,f.editor.now()).used,0);assert.ok(!JSON.stringify(publicConfig(f.editor.store,env)).includes(env.GEMINI_API_KEY));
});
test('P02 manual quick/deep return one structured response, cache hit costs no request, apply is explicit',async t=>{
  const f=await aiFixture(t),before=JSON.stringify(f.d.editorial);await assert.rejects(f.editor.analyze(f.d.id,'deep',{env}),/PRELIMINARY/);
  const first=await f.editor.analyze(f.d.id,'quick',{env});assert.equal(first.status,'complete');assert.equal(first.usage.used,1);assert.equal(JSON.stringify(f.editor.store.draft(f.d.id).editorial),before);
  const cached=await f.editor.analyze(f.d.id,'quick',{env});assert.equal(cached.cacheHit,true);assert.equal(f.calls(),1);assert.equal(cached.usage.used,1);
  const plan=await f.editor.applyAnalysis(f.d.id,'quick');assert.equal(JSON.stringify(f.editor.store.draft(f.d.id).editorial),before);await assert.rejects(f.editor.applyAnalysis(f.d.id,'quick',{apply:true,expect:'stale'}),/PLAN_CHANGED/);await f.editor.applyAnalysis(f.d.id,'quick',{apply:true,expect:plan.planId});assert.equal(f.editor.store.draft(f.d.id).preliminary.status,'pending');
  await f.editor.preliminary(f.d.id,'suitable','Fixture');const deep=await f.editor.analyze(f.d.id,'deep',{env});assert.equal(deep.status,'complete');assert.ok(deep.analysis.result.description_vi);assert.equal(deep.usage.used,2);assert.equal(deep.analysis.requires_review,true);assert.equal(f.editor.store.draft(f.d.id).finalReview,null);
});
test('P02 both modes share five durable requests, sixth rejected, cache still available and Vietnam midnight resets',async t=>{
  const f=await aiFixture(t);await f.editor.preliminary(f.d.id,'suitable','Fixture');
  for(const mode of ['quick','deep','quick','deep','quick'])assert.equal((await f.editor.analyze(f.d.id,mode,{env,force:true})).status,'complete');
  await assert.rejects(f.editor.analyze(f.d.id,'deep',{env,force:true}),/DAILY_LIMIT/);assert.equal(f.calls(),5);assert.equal((await f.editor.analyze(f.d.id,'quick',{env})).cacheHit,true);assert.equal(usage(f.editor.store,f.editor.now()).used,5);
  assert.equal(vietnamDay(new Date('2026-11-05T16:59:59Z')),'2026-11-05');f.setClock('2026-11-05T17:00:00Z');assert.equal(usage(f.editor.store,f.editor.now()).used,0);assert.equal((await f.editor.analyze(f.d.id,'deep',{env,force:true})).status,'complete');assert.equal(f.calls(),6);
});
test('P02 bad schema, fabricated evidence, unsupported rights, truncated output and failures consume attempts without retry',async t=>{
  for(const output of [{...valid(),extra:'not allowed'},{...valid(),claims:[{field:'purpose',text:'claim',evidence_ids:['invented-source']}]},{...valid(),source_references:[]},{...valid(),summary_vi:'Phần mềm an toàn tuyệt đối'}]){
    const f=await aiFixture(t);f.setResponse({status:200,headers:{},body:JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(output)}]}}]})});const result=await f.editor.analyze(f.d.id,'quick',{env});assert.equal(result.status,'invalid');assert.equal(result.usage.used,1);assert.equal(f.calls(),1);assert.deepEqual(f.editor.store.draft(f.d.id).editorial,f.d.editorial);
  }
  const truncated=await aiFixture(t);truncated.setResponse({status:200,headers:{},body:JSON.stringify({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{}'}]}}]})});assert.equal((await truncated.editor.analyze(truncated.d.id,'quick',{env})).status,'failed');assert.equal(truncated.calls(),1);
  const f=await aiFixture(t);f.setResponse(new Error('NETWORK_TIMEOUT '+env.GEMINI_API_KEY));const result=await f.editor.analyze(f.d.id,'quick',{env});assert.equal(result.status,'failed');assert.equal(result.usage.used,1);assert.ok(!JSON.stringify(result).includes(env.GEMINI_API_KEY));assert.equal(result.analysis.usage,null);
});
test('P02 provider rate limit saves cooldown; source changes stale cache but stars do not',async t=>{
  const f=await aiFixture(t);await f.editor.analyze(f.d.id,'quick',{env});f.repository.stargazers_count++;await f.editor.importUrl(null,{refreshId:f.d.id});assert.equal((await f.editor.analyze(f.d.id,'quick',{env})).cacheHit,true);
  f.repository.description='Meaningful new metadata';await f.editor.importUrl(null,{refreshId:f.d.id});await assert.rejects(f.editor.applyAnalysis(f.d.id,'quick'),/STALE/);assert.equal((await f.editor.analyze(f.d.id,'quick',{env})).cacheHit,false);
  f.setResponse({status:429,headers:{'retry-after':'120'},body:'do not persist raw provider error'});const result=await f.editor.analyze(f.d.id,'quick',{env,force:true});assert.equal(result.status,'quota_wait');const calls=f.calls();await assert.rejects(f.editor.analyze(f.d.id,'quick',{env,force:true}),/RATE_WAIT/);assert.equal(f.calls(),calls);
});
test('P02 selected deep documents invalidate preliminary review and unsupported files never execute',async t=>{
  const f=await aiFixture(t);await f.editor.preliminary(f.d.id,'suitable','Fixture');await f.editor.addDocument(f.d.id,'docs/install.md');assert.equal(f.editor.store.draft(f.d.id).preliminary.status,'pending');await assert.rejects(f.editor.analyze(f.d.id,'deep',{env}),/PRELIMINARY/);await f.editor.preliminary(f.d.id,'suitable','Fixture');assert.equal((await f.editor.analyze(f.d.id,'deep',{env})).status,'complete');
});
