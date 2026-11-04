/** Local admin network boundary. No browser execution, proxy, cookie jar or arbitrary redirects. */
import dns from 'node:dns/promises';
import https from 'node:https';
import {isIP,BlockList} from 'node:net';
import {canonicalUrl} from '../../src/lib/validation.ts';

export function identify(value){
  if(typeof value!=='string'||value.length>1000||/[\\\u0000-\u0020]|%2[ef]/i.test(value))throw Error('URL_INVALID');
  const url=new URL(canonicalUrl(value));
  if(url.port||url.hostname.endsWith('.')||/(?:^|\.)(?:lan|home|corp|localdomain)$/.test(url.hostname))throw Error('URL_INVALID');
  if(url.hostname.length>253||url.hostname.split('.').some(label=>! /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)))throw Error('URL_INVALID');
  url.hash='';
  for(const key of [...url.searchParams.keys()])if(/^(utm_|fbclid$|gclid$)/i.test(key))url.searchParams.delete(key);
  if(['github.com','www.github.com'].includes(url.hostname)){
    const parts=url.pathname.replace(/\/+$/,'').split('/').slice(1);
    if(parts.length!==2||! /^[a-z0-9](?:[a-z0-9-]{0,38})$/i.test(parts[0]))throw Error('GITHUB_URL_INVALID');
    const repo=parts[1].replace(/\.git$/i,'');
    if(!/^[a-z0-9_.-]{1,100}$/i.test(repo)||/^\.+$/.test(repo))throw Error('GITHUB_URL_INVALID');
    const fullName=(parts[0]+'/'+repo).toLowerCase();
    return{kind:'github',canonicalUrl:'https://github.com/'+fullName,fullName};
  }
  if(url.pathname!=='/')url.pathname=url.pathname.replace(/\/+$/,'');
  url.searchParams.sort();
  return{kind:'website',canonicalUrl:url.href};
}
export function findMatches(catalog,drafts,identity){
  const wanted=new Set([identity.canonicalUrl,...(identity.aliases??[])]);
  return [...catalog.resources.map(r=>({...r,matchKind:'catalog'})),...drafts.map(d=>({...d,matchKind:'draft'}))].filter(record=>{
    const source=record.sourceIdentity??record.identity;
    if(identity.githubId&&source?.githubId===identity.githubId)return true;
    const urls=[record.canonicalUrl,source?.canonicalUrl,...(source?.aliases??[]),...(record.sources??[]).map(s=>s.url)].filter(Boolean);
    return urls.some(value=>{try{return wanted.has(identify(value).canonicalUrl);}catch{return false;}});
  });
}
const denied=new BlockList();
for(const [ip,prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.88.99.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]])denied.addSubnet(ip,prefix,'ipv4');
const global6=new BlockList();global6.addSubnet('2000::',3,'ipv6');
for(const [ip,prefix] of [['2001::',23],['2001:db8::',32],['2002::',16],['3fff::',20]])denied.addSubnet(ip,prefix,'ipv6');
export function publicAddress(ip){const family=isIP(ip);return family===4?!denied.check(ip,'ipv4'):family===6&&global6.check(ip,'ipv6')&&!denied.check(ip,'ipv6');}
export async function resolvePublic(host,resolver=dns.lookup,timeoutMs=15000){
  let timer;
  try{
    const addresses=await Promise.race([resolver(host,{all:true,verbatim:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('DNS_TIMEOUT')),timeoutMs);})]);
    if(!Array.isArray(addresses)||!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw Error('SSRF_BLOCKED');
    return addresses[0];
  }finally{clearTimeout(timer);}
}
export function pinnedLookup(address){return(_host,options,callback)=>callback(null,options?.all?[address]:address.address,address.family);}
export async function safeRequest(input,{method='GET',headers={},body=null,maxBytes=768*1024,timeoutMs=15000,redirects=3,allowedHost=null,resolver=dns.lookup,transport=https.request}={}){
  const url=new URL(canonicalUrl(input));
  if(url.port||url.hostname.endsWith('.')||(allowedHost&&url.hostname!==allowedHost))throw Error('NETWORK_HOST_BLOCKED');
  identify(url.href); // Reject reserved domain names/unsafe syntax for every hop.
  const started=Date.now(),address=await resolvePublic(url.hostname,resolver,timeoutMs),remaining=Math.max(1,timeoutMs-(Date.now()-started));
  const response=await new Promise((resolve,reject)=>{
    const req=transport(url,{method,headers:{'User-Agent':'FreeResources-local-editor/0.2','Accept-Encoding':'identity',...headers},lookup:pinnedLookup(address),agent:false},res=>{
      if(res.headers['content-encoding']&&res.headers['content-encoding']!=='identity'){res.destroy();reject(Error('ENCODING_UNSUPPORTED'));return;}
      if(Number(res.headers['content-length'])>maxBytes){res.destroy();reject(Error('RESPONSE_TOO_LARGE'));return;}
      let size=0;const chunks=[];
      res.on('data',chunk=>{size+=chunk.length;if(size>maxBytes){res.destroy();reject(Error('RESPONSE_TOO_LARGE'));}else chunks.push(chunk);});
      res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString('utf8'),url:url.href}));
      res.on('error',()=>reject(Error('NETWORK_RESPONSE_FAILED')));
    });
    const timer=setTimeout(()=>req.destroy(Error('NETWORK_TIMEOUT')),remaining);
    req.on('close',()=>clearTimeout(timer));req.on('error',error=>reject(Error(error.message==='NETWORK_TIMEOUT'?'NETWORK_TIMEOUT':'NETWORK_FAILED')));
    if(body)req.write(body);req.end();
  });
  if([301,302,303,307,308].includes(response.status)){
    if(method!=='GET'||redirects<1||!response.headers.location)throw Error('REDIRECT_BLOCKED');
    const next=new URL(response.headers.location,url);identify(next.href);
    // Credentials stay on one explicitly allowed API host; website redirects carry none.
    return safeRequest(next.href,{method,headers,body,maxBytes,timeoutMs:Math.max(1,timeoutMs-(Date.now()-started)),redirects:redirects-1,allowedHost,resolver,transport});
  }
  return response;
}
