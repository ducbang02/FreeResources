import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
const baselineResourceCount=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).resources.length;
import {spawnSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {DatabaseSync} from 'node:sqlite';
import {sandbox} from './helpers/editorial.mjs';import {digest} from '../scripts/editorial/store.mjs';
const preload=pathToFileURL(path.resolve('tests/helpers/editorial-preload.mjs')).href;
function cli(f,args,{mock=false,key='',ok=true}={}){
  const result=spawnSync(process.execPath,[...(mock?['--import',preload]:[]),'scripts/catalog.mjs',...args,'--state-dir',f.stateDir,'--catalog',f.catalog],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024,env:{...process.env,GEMINI_API_KEY:key,P02_FIXTURE_LOG:path.join(f.dir,'requests.jsonl')}});
  if(ok)assert.equal(result.status,0,result.stderr);else assert.notEqual(result.status,0,'Expected command failure');
  return{...result,value:result.stdout.trim()?JSON.parse(result.stdout):null};
}
function editFile(f,draft){const file=path.join(f.dir,'patch.json');fs.writeFileSync(file,JSON.stringify({editorial:{title:'CLI fixture, không phải tài nguyên thật',summary:'Tóm tắt do reviewer fixture viết.',description:'Nội dung tổng hợp dùng kiểm thử CLI, không phải xác minh tài nguyên.',categories:['van-phong'],tags:['chuyen-file'],pricing:'Miễn phí theo fixture'},policy:{groups:['free_apps'],freeModel:'freeware',licenseStatus:'unknown',officialSourceVerified:true,freeEvidenceUrl:draft.identity.canonicalUrl,freeLimitations:''},verifiedSources:[{url:draft.identity.canonicalUrl,label:'Nguồn fixture được reviewer giả lập',fields:['summary','canonicalUrl','pricing']}]}));return file;}
test('P02 real CLI processes: manual app→edit→preliminary→final→plan/apply→validate/generate→local SQLite',t=>{
  const f=sandbox(t),original=fs.readFileSync(f.catalog,'utf8'),d=cli(f,['import','https://example.org/app','--manual']).value;
  assert.equal(cli(f,['list']).value.length,1);assert.equal(cli(f,['show',d.id]).value.id,d.id);cli(f,['analyze',d.id,'quick'],{ok:false});assert.equal(cli(f,['ai-usage']).value.used,0);
  cli(f,['edit',d.id,editFile(f,d)]);cli(f,['review',d.id,'suitable','--by','CLI fixture editor']);cli(f,['approve',d.id,'--by','CLI fixture editor']);
  const plan=cli(f,['export',d.id]).value;assert.equal(fs.readFileSync(f.catalog,'utf8'),original);cli(f,['export',d.id,'--apply','--expect',plan.planId]);assert.equal(cli(f,['import','https://example.org/app/','--manual']).value.duplicate,true);
  const sql=path.join(f.dir,'seed.sql');for(const args of [['validate',f.catalog],['generate',f.catalog,sql]]){const r=spawnSync(process.execPath,['scripts/catalog.mjs',...args],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);}
  const database=path.join(f.dir,'local.sqlite'),db=new DatabaseSync(database);try{db.exec(fs.readFileSync('migrations/0001_catalog.sql','utf8'));db.exec(fs.readFileSync(sql,'utf8'));assert.equal(db.prepare('SELECT count(*) n FROM resources').get().n,baselineResourceCount+1);}finally{db.close();}
  assert.equal(cli(f,['projection-check',database]).value.status,'PASS');const changed=new DatabaseSync(database);changed.exec("UPDATE resources SET summary='DB-only edit' WHERE id='localsend'");changed.close();assert.equal(cli(f,['projection-check',database],{ok:false}).value.status,'FAIL');assert.equal(fs.existsSync(path.join(f.dir,'requests.jsonl')),false);
});
test('P02 real CLI mock transport: GitHub→quick→explicit apply→preliminary→deep, shared durable five-call cap',t=>{
  const f=sandbox(t),key='synthetic-cli-key-not-real-000000000000',options={mock:true,key},d=cli(f,['import','https://github.com/fixture-org/tool'],options).value,now=Date.now();
  fs.writeFileSync(path.join(f.stateDir,'config.json'),JSON.stringify({schemaVersion:1,enabled:true,projectId:'fixture-project',model:'gemini-fixture-flash-lite',maxOutputTokens:2000,freeTierConfirmation:{projectId:'fixture-project',model:'gemini-fixture-flash-lite',keyFingerprint:digest(key),billingTier:'free',billingEnabled:false,accessConfirmed:true,verifiedBy:'CLI fixture',verifiedAt:new Date(now-60000).toISOString(),expiresAt:new Date(now+86400000).toISOString()}}));
  cli(f,['analyze',d.id,'deep'],{...options,ok:false});assert.equal(cli(f,['analyze',d.id,'quick'],options).value.status,'complete');assert.equal(cli(f,['analyze',d.id,'quick'],options).value.cacheHit,true);
  const plan=cli(f,['apply-ai',d.id,'quick'],options).value;cli(f,['apply-ai',d.id,'quick','--apply','--expect',plan.planId],options);cli(f,['review',d.id,'suitable','--by','CLI fixture'],options);assert.equal(cli(f,['analyze',d.id,'deep'],options).value.status,'complete');
  for(let i=0;i<3;i++)cli(f,['analyze',d.id,'quick','--force'],options);const fail=cli(f,['analyze',d.id,'deep','--force'],{...options,ok:false});assert.match(fail.stderr,/DAILY_LIMIT/);assert.equal(cli(f,['ai-usage'],options).value.used,5);
  const requests=fs.readFileSync(path.join(f.dir,'requests.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(requests.filter(r=>r.url.includes('googleapis')).length,5);assert.ok(!fs.readFileSync(path.join(f.dir,'requests.jsonl'),'utf8').includes(key));
  const before=cli(f,['show',d.id],options).value.editorial;cli(f,['refresh',d.id],options);assert.deepEqual(cli(f,['show',d.id],options).value.editorial,before);assert.equal(cli(f,['ai-usage'],options).value.used,5);
});
