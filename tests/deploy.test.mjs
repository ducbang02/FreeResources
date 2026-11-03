import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {validateTarget,validateConfig,validateCi,deploymentPlan} from '../scripts/preview.mjs';

const target={approved:true,accountId:'4ca521c6746d874c049fd829121ab59e',workerName:'digital-resource-hub-staging',databaseName:'digital-resource-hub-staging',databaseId:'01345678-90ab-4def-8123-456789abcdef',repository:'ducbang02/FreeResources',branch:'develop',previewName:'develop'};
const binding={binding:'DB',database_name:target.databaseName,database_id:target.databaseId,migrations_dir:'../migrations',remote:false};
const config={name:target.workerName,account_id:target.accountId,main:'@astrojs/cloudflare/entrypoints/server',workers_dev:false,assets:{binding:'ASSETS',directory:'../dist'},d1_databases:[binding],vars:{APP_ENV:'staging'},previews:{vars:{APP_ENV:'staging'},d1_databases:[structuredClone(binding)]}};
const sha='a'.repeat(40),environment={WORKERS_CI:'1',WORKERS_CI_BRANCH:'develop',WORKERS_CI_COMMIT_SHA:sha};
const git={head:sha,remoteHead:sha,origin:'https://github.com/'+target.repository+'.git'};

test('Unapproved template, placeholders, wrong resources and production names fail closed',()=>{
  assert.throws(()=>validateTarget(JSON.parse(fs.readFileSync(new URL('../deploy/staging-target.json.example',import.meta.url),'utf8'))),/not approved/);
  for(const change of [t=>t.approved=false,t=>t.accountId='',t=>t.databaseId='00000000-0000-0000-0000-000000000001',t=>t.workerName='production-staging',t=>t.databaseName='digital-resource-hub',t=>t.branch='main',t=>t.previewName='feature',t=>t.repository='OWNER/repo',t=>t.token='must-not-be-logged']){const t=structuredClone(target);change(t);assert.throws(()=>validateTarget(t));}
  assert.equal(validateTarget(target).databaseId,target.databaseId); // A valid UUID may start with zero.
});
test('Local/production Worker IDs and D1 mismatches are rejected on source and generated config',()=>{
  for(const generated of [false,true])for(const change of [c=>c.name='digital-resource-hub-local',c=>c.account_id='b'.repeat(32),c=>c.d1_databases[0].database_id='99999999-9999-4999-8999-999999999999',c=>c.previews.d1_databases[0].database_name='production',c=>c.previews.d1_databases=[],c=>c.d1_databases[0].preview_database_id=target.databaseId,c=>c.d1_databases[0].remote=true,c=>c.workers_dev=true,c=>delete c.previews]){const c=structuredClone(config);change(c);assert.throws(()=>validateConfig(c,target,{generated}));}
  assert.equal(validateConfig(config,target).name,target.workerName);
  for(const change of [c=>c.main='../other-project/worker.js',c=>c.assets.directory='../../other-project/assets',c=>c.d1_databases[0].migrations_dir='../../other-project/migrations']){const c=structuredClone(config);change(c);assert.throws(()=>validateConfig(c,target));}
});
test('Extra resources, routes, secrets and hidden Preview bindings are forbidden',()=>{
  for(const change of [c=>c.kv_namespaces=[{binding:'SESSION',id:'namespace'}],c=>c.images={binding:'IMAGES'},c=>c.services=[{binding:'PROD',service:'production'}],c=>c.routes=['example.com/*'],c=>c.env={production:{name:'production'}},c=>c.previews.r2_buckets=[{binding:'R2',bucket_name:'other-project'}],c=>c.previews.secrets={required:['TOKEN']},c=>c.vars.TOKEN='secret',c=>c.previews.vars.APP_ENV='production']){const c=structuredClone(config);change(c);assert.throws(()=>validateConfig(c,target,{generated:true}));}
  const c=structuredClone(config);c.r2_buckets=[];c.durable_objects={bindings:[]};assert.ok(validateConfig(c,target,{generated:true}));
});
test('Only trusted Workers Builds develop HEAD may deploy; branch name alone is insufficient',()=>{
  validateCi(environment,target,git);
  for(const e of [{}, {...environment,WORKERS_CI_BRANCH:'main'}, {...environment,WORKERS_CI_BRANCH:'release'}, {...environment,WORKERS_CI_BRANCH:'feature/test'}, {...environment,WORKERS_CI_COMMIT_SHA:'b'.repeat(40)}, {...environment,GITHUB_EVENT_NAME:'pull_request_target'}, {...environment,CI_PULL_REQUEST:'https://github.com/pull/1'}])assert.throws(()=>validateCi(e,target,git));
  for(const g of [{...git,origin:'https://github.com/fork/repo.git'}, {...git,remoteHead:'b'.repeat(40)}])assert.throws(()=>validateCi(environment,target,g));
});

test('CI checkout credentials and GitHub URL variants preserve exact repository identity',()=>{
  for(const origin of [
    'https://x-access-token:fixture-only@github.com/ducbang02/FreeResources.git',
    'https://fixture-only@github.com/ducbang02/FreeResources',
    'https://github.com/ducbang02/freeresources.git/',
    'git@github.com:ducbang02/FreeResources.git',
    'ssh://git@github.com:22/ducbang02/FreeResources.git',
  ])assert.doesNotThrow(()=>validateCi(environment,target,{...git,origin}));
  for(const origin of [
    'https://github.com.evil.example/ducbang02/FreeResources.git',
    'https://github.com@evil.example/ducbang02/FreeResources.git',
    'https://fixture-only@github.com/fork/FreeResources.git',
    'https://github.com/ducbang02/FreeResources-evil.git',
    'http://github.com/ducbang02/FreeResources.git',
    'https://github.com:8443/ducbang02/FreeResources.git',
    'https://github.com/ducbang02/FreeResources.git?token=fixture-only',
    'file:///opt/buildhome/repo',
  ])assert.throws(()=>validateCi(environment,target,{...git,origin}),error=>
    error.message.includes('Origin is not the approved repository')&&!error.message.includes('fixture-only'));
  const origin='https://x-access-token:fixture-only@github.com/ducbang02/FreeResources.git';
  assert.throws(()=>validateCi(environment,target,{...git,origin,remoteHead:'b'.repeat(40)}),/Commit must equal/);
  assert.throws(()=>validateCi({...environment,WORKERS_CI_BRANCH:'main'},target,{...git,origin}),/on develop/);
});
test('Preview command plan can only mutate staging D1 and Preview, never production deploy',()=>{
  const commands=deploymentPlan(target);assert.equal(commands.length,3);assert.equal(commands[0][0],'d1');assert.ok(commands[0].includes('--remote'));assert.ok(commands[1].includes('--file'));assert.equal(commands[2][0],'preview');assert.ok(commands[2].includes('--ignore-base-config'));assert.equal(commands[2][commands[2].indexOf('--worker-name')+1],target.workerName);assert.ok(commands.every(c=>!c.includes('deploy')&&!c.includes('versions')&&!c.includes('create')));
});
test('Production command is harmless and exits successfully for branch control',()=>{
  const result=spawnSync(process.execPath,['scripts/no-production.mjs'],{encoding:'utf8'});assert.equal(result.status,0);assert.equal(JSON.parse(result.stdout).status,'BLOCKED');assert.equal(result.stderr,'');
});
test('Common Builds command skips main and rejects local or unapproved branches',()=>{
  const local=spawnSync(process.execPath,['scripts/build-worker.mjs'],{encoding:'utf8',env:{...process.env,WORKERS_CI:''}});assert.notEqual(local.status,0);
  const main=spawnSync(process.execPath,['scripts/build-worker.mjs'],{encoding:'utf8',env:{...process.env,WORKERS_CI:'1',WORKERS_CI_BRANCH:'main'}});assert.equal(main.status,0);assert.ok(main.stdout.includes('intentionally skipped'));
  const feature=spawnSync(process.execPath,['scripts/build-worker.mjs'],{encoding:'utf8',env:{...process.env,WORKERS_CI:'1',WORKERS_CI_BRANCH:'feature/not-approved'}});assert.notEqual(feature.status,0);
});

test('Confirmed account is independent of login email; wrong Ctcm target cannot be re-approved',()=>{
  for(const accountId of ['4873c68031c0fc5e0284943a9119dac2','a'.repeat(32)])assert.throws(()=>validateTarget({...target,accountId}),/user-confirmed account/);
  assert.throws(()=>validateTarget({...target,repository:'other-owner/FreeResources'}),/user-confirmed/);
  assert.equal(validateTarget(target).accountId,'4ca521c6746d874c049fd829121ab59e');
});
