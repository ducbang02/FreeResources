import test from 'node:test';import assert from 'node:assert/strict';
import {Editor} from '../scripts/editorial/workflow.mjs';import {websiteMetadata} from '../scripts/editorial/website.mjs';import {sandbox} from './helpers/editorial.mjs';
test('P02 website metadata uses bounded text only; no scripts/download/license assumptions',async t=>{
  const local=sandbox(t);let calls=0;const editor=new Editor({...local,request:async()=>{calls++;return{status:200,headers:{'content-type':'text/html; charset=utf-8',etag:'"site"'},body:'<head><script>throw Error("must not execute");</script><!-- <title>wrong</title> --><title>Fixture &amp; Tool</title><meta name="description" content="A synthetic &quot;free&quot; claim, needs review"></head><a href="install.exe">Download</a>',url:'https://example.org/app'}}});
  const d=await editor.importUrl('https://example.org/app');assert.equal(d.source.metadata.title,'Fixture & Tool');assert.equal(d.source.evidence.length,1);assert.equal(d.policy.freeModel,'unknown');assert.equal(d.policy.officialSourceVerified,false);assert.equal(d.editorial.license,null);assert.ok(!JSON.stringify(d).includes('install.exe'));assert.ok(!JSON.stringify(d).includes('throw Error'));
  await editor.importUrl('https://example.org/app/');assert.equal(calls,1);
  assert.equal(websiteMetadata('<meta property="og:title" content="Title"><meta name=description content=Simple>').title,'Title');
});
test('P02 website network/redirect/CAPTCHA/missing metadata safely falls back to manual',async t=>{
  for(const response of [new Error('NETWORK_TIMEOUT'),{status:403,headers:{},body:''},{status:200,headers:{'content-type':'application/octet-stream'},body:'binary'},{status:200,headers:{'content-type':'text/html'},body:'<title>CAPTCHA</title>'},{status:200,headers:{'content-type':'text/html'},body:'<html></html>'}]){
    const editor=new Editor({...sandbox(t),request:async()=>{if(response instanceof Error)throw response;return response;}}),d=await editor.importUrl('https://example.org/app');assert.equal(d.source.state,'partial');assert.equal(d.source.evidence.length,0);assert.equal(d.finalReview,null);
  }
  const editor=new Editor({...sandbox(t),request:async()=>{throw Error('must not fetch');}}),d=await editor.importUrl('https://example.org/app',{manual:true});assert.deepEqual(d.source.issues,['manual:metadata_not_fetched']);
});
test('P02 website redirects retain source aliases and detect an existing draft',async t=>{
  const editor=new Editor({...sandbox(t),request:async()=>({status:200,headers:{'content-type':'text/html'},body:'<title>Fixture</title>',url:'https://example.net/tool'})});
  const d=await editor.importUrl('https://example.org/tool');assert.equal(d.identity.canonicalUrl,'https://example.net/tool');assert.deepEqual(d.identity.aliases,['https://example.org/tool']);const duplicate=await editor.importUrl('https://example.net/tool');assert.equal(duplicate.duplicate,true);
});
