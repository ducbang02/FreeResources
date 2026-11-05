/** QA launcher only: fixture transport injected into the same Editor, never a product API flag. */
import fs from 'node:fs';import path from 'node:path';import {parseArgs} from 'node:util';
import {createAdminServer} from '../../scripts/admin/server.mjs';import {Editor} from '../../scripts/editorial/workflow.mjs';import {digest} from '../../scripts/editorial/store.mjs';import {githubFixture} from './editorial.mjs';
const {values}=parseArgs({options:{dir:{type:'string'},ai:{type:'boolean'}}});if(!values.dir)throw Error('--dir required');
const root=path.resolve(values.dir),stateDir=path.join(root,'editorial'),catalog=path.join(root,'catalog.json');fs.mkdirSync(root,{recursive:true});fs.mkdirSync(stateDir,{recursive:true});if(!fs.existsSync(catalog))fs.copyFileSync('data/catalog.json',catalog);
const api=githubFixture(),key='synthetic-browser-key-not-real-000000000000';let aiCalls=0;
if(values.ai){process.env.GEMINI_API_KEY=key;const now=Date.now();fs.writeFileSync(path.join(stateDir,'config.json'),JSON.stringify({schemaVersion:1,enabled:true,projectId:'fixture-project',model:'gemini-fixture-flash-lite',maxOutputTokens:2000,freeTierConfirmation:{projectId:'fixture-project',model:'gemini-fixture-flash-lite',keyFingerprint:digest(key),billingTier:'free',billingEnabled:false,accessConfirmed:true,verifiedBy:'Browser fixture only',verifiedAt:new Date(now-60000).toISOString(),expiresAt:new Date(now+86400000).toISOString()}}));}else process.env.GEMINI_API_KEY='';
const request=async(url,options)=>{
 await new Promise(r=>setTimeout(r,200));
 if(url.includes('googleapis')){aiCalls++;const input=JSON.parse(JSON.parse(options.body).contents[0].parts[0].text),deep=input.mode==='deep',result={summary_vi:'[Fixture AI] Gợi ý cần được người biên tập đối chiếu.',primary_category:'van-phong',tags:['chuyen-file'],target_users:[],unknowns:['Fixture, không phải API thật'],source_references:[{field:'summary_vi',evidence_ids:['repository']},{field:'primary_category',evidence_ids:['repository']},{field:'tags',evidence_ids:['repository']}],claims:[],confidence:'low'};if(deep){result.description_vi='[Fixture Deep] Nội dung tổng hợp cho kiểm thử.';result.source_references.push({field:'description_vi',evidence_ids:['readme']});}
  fs.writeFileSync(path.join(root,'ai-calls.json'),JSON.stringify({calls:aiCalls,transport:'mock, zero real API calls'}));return{status:200,headers:{},body:JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result)}]}}],modelVersion:'fixture-browser',usageMetadata:{totalTokenCount:100}})};
 }
 if(url.includes('/missing'))return{status:404,headers:{},body:''};
 if(url.includes('/timeout'))throw Error('NETWORK_TIMEOUT');
 if(url.startsWith('https://api.github.com/'))return api.request(url,options);
 return{status:200,headers:{'content-type':'text/html'},body:'<head><title>Website fixture for Admin QA</title><meta name="description" content="Unverified metadata fixture"></head>'};
};
const server=createAdminServer({editor:new Editor({catalog,stateDir,request})});server.listen(0,'127.0.0.1',()=>console.log(JSON.stringify({base:'http://127.0.0.1:'+server.address().port,catalog,stateDir})));
