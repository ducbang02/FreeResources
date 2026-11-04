/** Synthetic public-API fixtures; not verified real products or repository claims. */
import fs from 'node:fs';import path from 'node:path';
import {Editor} from '../../scripts/editorial/workflow.mjs';
const root=path.resolve('.cache');
export function sandbox(t){fs.mkdirSync(root,{recursive:true});const dir=fs.mkdtempSync(path.join(root,'p02-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const catalog=path.join(dir,'catalog.json');fs.copyFileSync('data/catalog.json',catalog);return{dir,catalog,stateDir:path.join(dir,'state')};}
export const doc=(content='Fixture README: transfer files. Not a real product claim.',name='README.md')=>({type:'file',encoding:'base64',sha:'a'.repeat(40),content:Buffer.from(content).toString('base64'),size:Buffer.byteLength(content),path:name});
export function githubFixture(overrides={}){
  const calls=[];
  const repository={id:987654321,private:false,visibility:'public',name:'Tool',full_name:'fixture-org/tool',html_url:'https://github.com/fixture-org/tool',default_branch:'main',owner:{login:'fixture-org'},description:'Synthetic fixture, not a real resource',topics:['file-transfer'],language:'Rust',stargazers_count:42,forks_count:3,updated_at:'2026-11-05T00:00:00Z',pushed_at:'2026-11-05T00:00:00Z',license:{spdx_id:'MIT'}};
  const request=async(url,options={})=>{calls.push({url,options});const endpoint=new URL(url).pathname;const special=overrides[endpoint]??overrides.all;if(special)return typeof special==='function'?special(url,options):structuredClone(special);let body;if(endpoint.endsWith('/readme'))body=doc();else if(endpoint.endsWith('/license'))body=doc('Fixture MIT license evidence','LICENSE');else if(endpoint.includes('/contents/'))body=doc('Fixture installation: read docs, do not execute.','docs/install.md');else body=repository;return{status:200,headers:{etag:'"fixture-v1"'},body:JSON.stringify(body)};};
  return{request,calls,repository,overrides};
}
export function editorFixture(t,overrides={}){const local=sandbox(t),api=githubFixture(overrides),editor=new Editor({...local,request:api.request});return{...local,...api,editor};}
