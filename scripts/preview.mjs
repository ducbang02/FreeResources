/** P01 Workers Builds only. Defaults fail closed; never calls wrangler deploy/versions upload. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const targetPath=path.join(root,'deploy/staging-target.json');
const sourcePath=path.join(root,'deploy/wrangler.staging.json');
const builtPath=path.join(root,'dist/server/wrangler.json');
const proofPath=path.join(root,'.cache/p01-preview-check.json');
const wrangler=path.join(root,'node_modules/wrangler/bin/wrangler.js');
const sourceKeys=new Set(['$schema','name','account_id','main','compatibility_date','compatibility_flags','workers_dev','assets','d1_databases','observability','vars','previews']);
const extraResources=['env','routes','route','triggers','migrations','kv_namespaces','r2_buckets','durable_objects','services','queues','workflows','containers','cloudchamber','images','browser','ai','vectorize','hyperdrive','send_email','unsafe','logpush','tail_consumers','streaming_tail_consumers','dispatch_namespaces','pipelines','k2','secrets_store_secrets','secrets','ratelimits','worker_loaders','vpc_services','vpc_networks','analytics_engine_datasets','artifacts','connect','ai_search','ai_search_namespaces','agent_memory','media','stream','analytics','mtls_certificates','unsafe_hello_world','flagship'];
const requireThat=(ok,message)=>{if(!ok)throw Error(message);};
const populated=value=>value!=null&&(Array.isArray(value)?value.length>0:typeof value==='object'?Object.values(value).some(populated):value!==false&&value!=='');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));

export function validateTarget(target){
  const keys=['approved','accountId','workerName','databaseName','databaseId','repository','branch','previewName'];
  requireThat(target&&typeof target==='object'&&Object.keys(target).every(k=>keys.includes(k)),'Unreviewed target field.');
  requireThat(target.approved===true,'Staging target is not approved. Confirm account/repository/resources first.');
  requireThat(/^[a-f0-9]{32}$/.test(target.accountId)&&!/^0+$/.test(target.accountId),'Invalid approved account ID.');
  requireThat(target.accountId==='4ca521c6746d874c049fd829121ab59e','P01 must use user-confirmed account 4ca521c6746d874c049fd829121ab59e; login email is not account identity.');
  requireThat(target.repository==='ducbang02/FreeResources','P01 repository must be the user-confirmed ducbang02/FreeResources.');
  requireThat(target.workerName==='digital-resource-hub-staging'&&target.databaseName==='digital-resource-hub-staging','P01 resource names must match the confirmed project.');
  requireThat(/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(target.databaseId)&&!/^00000000-0000-0000-0000-/.test(target.databaseId),'Invalid staging database ID or placeholder.');
  for(const key of ['workerName','databaseName'])requireThat(typeof target[key]==='string'&&/^[a-z0-9][a-z0-9-]*-staging$/.test(target[key])&&!/(^|-)(prod|production)(-|$)/.test(target[key]),'Worker and D1 must be explicit staging names.');
  requireThat(/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(target.repository)&&!target.repository.includes('OWNER'),'Invalid approved GitHub repository.');
  requireThat(target.branch==='develop'&&target.previewName==='develop','Only develop Preview is permitted in P01.');
  return target;
}
function database(bindings,target){
  requireThat(Array.isArray(bindings)&&bindings.length===1,'Exactly one staging D1 binding is required.');
  const db=bindings[0];
  requireThat(db.binding==='DB'&&db.database_id===target.databaseId&&db.database_name===target.databaseName,'D1 binding must match the approved staging database exactly.');
  requireThat(!('preview_database_id'in db)&&db.remote!==true,'Preview ID overrides and remote development bindings are forbidden.');
}
export function validateConfig(config,target,{generated=false}={}){
  validateTarget(target);
  requireThat(config.name===target.workerName&&config.account_id===target.accountId,'Worker/account do not match approved staging target.');
  requireThat(config.workers_dev===false,'Parent Worker public workers.dev deployment must stay disabled.');
  if(!generated){
    for(const key of Object.keys(config))requireThat(sourceKeys.has(key),'Unreviewed source config field: '+key);
    requireThat(config.main==='@astrojs/cloudflare/entrypoints/server'&&config.assets?.directory==='../dist','Source must build this Astro application and its dist assets.');
    requireThat(config.d1_databases?.[0]?.migrations_dir==='../migrations'&&config.previews?.d1_databases?.[0]?.migrations_dir==='../migrations','Migrations must come from this repository migrations directory.');
  }
  for(const key of extraResources)requireThat(!populated(config[key]),'Out-of-scope resource/config: '+key);
  requireThat(config.assets?.binding==='ASSETS','Static assets must use ASSETS.');
  requireThat(config.vars?.APP_ENV==='staging'&&Object.keys(config.vars).length===1,'Only APP_ENV=staging is permitted.');
  database(config.d1_databases,target);
  const preview=config.previews;
  requireThat(preview&&typeof preview==='object','Explicit Preview settings are required; no inheritance assumed.');
  for(const key of Object.keys(preview))requireThat(['d1_databases','vars'].includes(key)||!populated(preview[key]),'Out-of-scope Preview setting: '+key);
  database(preview.d1_databases,target);
  requireThat(preview.vars?.APP_ENV==='staging'&&Object.keys(preview.vars).length===1,'Preview must explicitly use APP_ENV=staging.');
  return config;
}
export function validateCi(environment,target,{head,remoteHead,origin}){
  requireThat(environment.WORKERS_CI==='1'&&environment.WORKERS_CI_BRANCH===target.branch,'Deployment requires Workers Builds on develop.');
  requireThat(!environment.GITHUB_EVENT_NAME||environment.GITHUB_EVENT_NAME==='push','Pull request/event deployment is forbidden.');
  requireThat(!environment.CI_PULL_REQUEST&&!environment.CHANGE_ID,'Pull request deployment is forbidden.');
  requireThat(/^[a-f0-9]{40}$/.test(head)&&environment.WORKERS_CI_COMMIT_SHA===head&&head===remoteHead,'Commit must equal the approved repository develop HEAD.');
  // CI may include checkout credentials in HTTPS remotes. Compare repository
  // identity, never the credential-bearing URL, and never print that URL.
  let repository;
  if(/^git@github\.com:/i.test(origin))repository=origin.slice('git@github.com:'.length);
  else {
    try {
      const url=new URL(origin);
      if(url.hostname==='github.com'&&!url.search&&!url.hash&&(
        (url.protocol==='https:'&&!url.port)||
        (url.protocol==='ssh:'&&url.username==='git'&&(!url.port||url.port==='22'))
      ))repository=url.pathname.slice(1);
    } catch { /* Reject unsupported transports without exposing checkout credentials. */ }
  }
  requireThat(repository?.replace(/\/$/,'').replace(/\.git$/i,'').toLowerCase()===target.repository.toLowerCase(),
    'Origin is not the approved repository (credentials omitted; require GitHub HTTPS or SSH and the exact owner/repo).');
}
export function deploymentPlan(target){
  validateTarget(target);
  return [
    ['d1','migrations','apply','DB','--remote','--config',sourcePath],
    ['d1','execute','DB','--remote','--config',sourcePath,'--file',path.join(root,'data/seed.sql')],
    ['preview','--config',builtPath,'--name',target.previewName,'--worker-name',target.workerName,'--ignore-base-config'],
  ];
}
function run(executable,args,options={}){
  const result=spawnSync(executable,args,{cwd:root,env:process.env,stdio:options.capture?'pipe':'inherit',encoding:'utf8',maxBuffer:2*1024*1024,timeout:options.capture?60000:undefined,...options});
  requireThat(!result.error&&result.status===0,'Command failed: '+path.basename(executable)+' '+args.slice(0,3).join(' '));
  return result.stdout?.trim()??'';
}
function git(args){return run('git',args,{capture:true});}
function ci(target){
  requireThat(process.env.WORKERS_CI==='1'&&process.env.WORKERS_CI_BRANCH===target.branch,'Only Workers Builds develop may run the staging pipeline.');
  const origin=git(['remote','get-url','origin']);
  // Read the approved branch from the approved remote: a fork named develop is insufficient.
  const remote=git(['ls-remote',`https://github.com/${target.repository}.git`,'refs/heads/develop']);
  const head=git(['rev-parse','HEAD']);
  validateCi(process.env,target,{head,remoteHead:remote.split(/\s/)[0],origin});
  requireThat(git(['status','--porcelain','--untracked-files=no'])==='','Tracked source must be clean before Preview deployment.');
  return head;
}
function fingerprint(){
  const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{const file=path.join(directory,entry.name);return entry.isDirectory()?walk(file):[file];});
  const files=[sourcePath,path.join(root,'package-lock.json'),path.join(root,'data/seed.sql'),...fs.readdirSync(path.join(root,'migrations')).filter(f=>f.endsWith('.sql')).sort().map(f=>path.join(root,'migrations',f)),...walk(path.join(root,'dist'))].sort();
  return digest(files.map(file=>file+':'+digest(fs.readFileSync(file))).join('\n'));
}
function main(){
  const command=process.argv[2]??'plan';
  requireThat(['plan','build','deploy'].includes(command),'Usage: node scripts/preview.mjs plan|build|deploy');
  const target=validateTarget(read(targetPath));
  validateConfig(read(sourcePath),target);
  if(command==='plan'){console.log(JSON.stringify({mode:'PLAN ONLY — no cloud call',target,commands:deploymentPlan(target)},null,2));return;}
  const sha=ci(target);
  if(command==='build'){
    requireThat(process.env.npm_execpath&&path.isAbsolute(process.env.npm_execpath)&&path.basename(process.env.npm_execpath)==='npm-cli.js','Use npm run ci:preview:build so the pinned package scripts run consistently on Windows/Linux.');
    for(const script of ['db:validate','db:migrate','db:seed','check','test'])run(process.execPath,[process.env.npm_execpath,'run',script]);
    run(process.execPath,[process.env.npm_execpath,'run','build'],{env:{...process.env,P01_STAGING_BUILD:'1'}});
    validateConfig(read(builtPath),target,{generated:true});
    fs.mkdirSync(path.dirname(proofPath),{recursive:true});fs.writeFileSync(proofPath,JSON.stringify({sha,target:digest(JSON.stringify(target)),fingerprint:fingerprint()}));
    console.log('PASS: local checks/build and staging artifact identity. No cloud mutation performed.');return;
  }
  validateConfig(read(builtPath),target,{generated:true});
  const proof=read(proofPath);
  requireThat(proof.sha===sha&&proof.target===digest(JSON.stringify(target))&&proof.fingerprint===fingerprint(),'Missing/current local-check proof. Run the guarded build command first.');
  if(process.env.CLOUDFLARE_ACCOUNT_ID)requireThat(process.env.CLOUDFLARE_ACCOUNT_ID===target.accountId,'Credential account override does not match staging.');
  const identity=JSON.parse(run(process.execPath,[wrangler,'whoami','--json'],{capture:true}));
  requireThat(identity.loggedIn&&identity.accounts?.some(a=>a.id===target.accountId),'Authenticated account is not the approved staging account.');
  const info=JSON.parse(run(process.execPath,[wrangler,'d1','info',target.databaseName,'--config',sourcePath,'--json'],{capture:true,env:{...process.env,CLOUDFLARE_ACCOUNT_ID:target.accountId}}));
  requireThat(info.uuid===target.databaseId&&info.name===target.databaseName,'Remote D1 identity differs from the approved staging database.');
  for(const args of deploymentPlan(target))run(process.execPath,[wrangler,...args],{env:{...process.env,CLOUDFLARE_ACCOUNT_ID:target.accountId}});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main();}catch(error){console.error('PREVIEW BLOCKED: '+error.message);process.exitCode=1;}
}
