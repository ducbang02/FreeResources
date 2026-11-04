/** Test-process-only HTTPS/DNS mocks. Application CLI has no mock/network-bypass flags. */
import dns from 'node:dns/promises';import https from 'node:https';import fs from 'node:fs';
import {EventEmitter} from 'node:events';import {Readable} from 'node:stream';
import {githubFixture} from './editorial.mjs';
const api=githubFixture();
dns.lookup=async()=>[{address:'93.184.216.34',family:4}];
https.request=(url,options,callback)=>{
  const req=new EventEmitter();let body='';req.write=value=>body+=value;req.destroy=error=>{if(error)req.emit('error',error);req.emit('close');};
  req.end=()=>queueMicrotask(async()=>{
    try{
      if(process.env.P02_FIXTURE_LOG)fs.appendFileSync(process.env.P02_FIXTURE_LOG,JSON.stringify({url:String(url),method:options.method})+'\n');
      let response;
      if(url.hostname==='generativelanguage.googleapis.com'){
        const mode=JSON.parse(JSON.parse(body).contents[0].parts[0].text).mode;
        const result={summary_vi:'Mô tả do AI fixture đề xuất, chưa xác minh thật.',primary_category:'van-phong',tags:['chuyen-file'],target_users:[],unknowns:['Fixture cần reviewer'],source_references:[{field:'summary_vi',evidence_ids:['repository']},{field:'primary_category',evidence_ids:['repository']},{field:'tags',evidence_ids:['repository']}],claims:[],confidence:'low'};
        if(mode==='deep'){result.description_vi='Mô tả chuyên sâu từ fixture, không phải security audit.';result.source_references.push({field:'description_vi',evidence_ids:['readme']});}
        response={status:200,headers:{},body:JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result)}]}}],modelVersion:'synthetic-cli-fixture',usageMetadata:{promptTokenCount:100,candidatesTokenCount:100,totalTokenCount:200}})};
      }else if(url.hostname==='api.github.com')response=await api.request(url.href,options);
      else response={status:200,headers:{'content-type':'text/html'},body:'<head><title>Synthetic app fixture</title><meta name="description" content="Metadata fixture; not verified free"></head>'};
      const res=Readable.from([Buffer.from(response.body)]);res.statusCode=response.status;res.headers=response.headers;res.on('end',()=>req.emit('close'));callback(res);
    }catch(e){req.emit('error',e);req.emit('close');}
  });return req;
};
