import {safeRequest,identify} from './network.mjs';
import {digest} from './store.mjs';
const origin='https://api.github.com';
export class ImportError extends Error{constructor(code,nextAttemptAt=null){super(code);this.nextAttemptAt=nextAttemptAt;}}
const clean=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').slice(0,max):'';
const count=v=>Number.isSafeInteger(v)&&v>=0?v:null;
export async function githubJson(endpoint,{store,request=safeRequest,force=false,now=()=>new Date(),ttl=6*3600000}={}){
  if(!endpoint.startsWith('/repos/')||/[\r\n]/.test(endpoint))throw Error('GITHUB_ENDPOINT_INVALID');
  const url=origin+endpoint,key='github-cache/'+digest(url+'|2022-11-28|json|public-anonymous')+'.json',cached=store.read(key,null),time=now().getTime();
  if(cached&&!force&&time<Date.parse(cached.expiresAt))return cached.data;
  const rate=store.read('github-rate.json',{});if(Date.parse(rate.nextAttemptAt)>time)throw new ImportError('GITHUB_RATE_LIMIT',rate.nextAttemptAt);
  const response=await request(url,{allowedHost:'api.github.com',headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(cached?.etag?{'If-None-Match':cached.etag}:{})}});
  const h=response.headers??{};
  if(h['x-ratelimit-remaining']==='0'||response.status===429||response.status===403){
    const retry=Number(h['retry-after']),reset=Number(h['x-ratelimit-reset']);
    const until=Number.isFinite(retry)&&retry>0?time+retry*1000:h['x-ratelimit-remaining']==='0'&&reset>0?reset*1000:time+60000;
    const nextAttemptAt=new Date(Math.max(time+1000,until)).toISOString();store.write('github-rate.json',{nextAttemptAt});
    if(response.status===403||response.status===429)throw new ImportError(response.status===403&&h['x-ratelimit-remaining']!=='0'&&!h['retry-after']?'GITHUB_FORBIDDEN_OR_SECONDARY_LIMIT':'GITHUB_RATE_LIMIT',nextAttemptAt);
  }
  let data;
  if(response.status===304){if(!cached||cached.data==null)throw Error('GITHUB_304_WITHOUT_CACHE');data=cached.data;}
  else if(response.status===404)data=null;
  else if(response.status===200){try{data=JSON.parse(response.body);}catch{throw Error('GITHUB_INVALID_JSON');}if(!data||typeof data!=='object'||Array.isArray(data))throw Error('GITHUB_INVALID_RESPONSE');if(data.private===true||data.visibility&&data.visibility!=='public')throw Error('GITHUB_PUBLIC_ONLY');}
  else throw Error('GITHUB_HTTP_'+response.status);
  store.write(key,{data,etag:h.etag??cached?.etag??null,checkedAt:now().toISOString(),expiresAt:new Date(time+(data===null?600000:ttl)).toISOString()});return data;
}
function document(data,url,id,observedAt){
  if(!data)return null;
  if(data.type!=='file'||data.encoding!=='base64'||typeof data.content!=='string'||! /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(data.sha??'')||count(data.size)===null||data.size>256*1024||!/^[A-Za-z0-9+/=\s]*$/.test(data.content))throw Error('GITHUB_DOCUMENT_INVALID_OR_TOO_LARGE');
  const bytes=Buffer.from(data.content,'base64');if(bytes.length>256*1024||bytes.length!==data.size)throw Error('GITHUB_DOCUMENT_INVALID_OR_TOO_LARGE');
  const content=bytes.toString('utf8');if(content.includes('\uFFFD'))throw Error('GITHUB_DOCUMENT_ENCODING');
  return{id,url,origin:'repository_author',observedAt,sha:data.sha,content:clean(content,256*1024)};
}
export async function importGithub(identity,options){
  const observedAt=(options.now?.()??new Date()).toISOString(),repo=await githubJson('/repos/'+identity.fullName,options);
  if(!repo)throw Error('GITHUB_UNAVAILABLE_OR_PRIVATE');
  if(repo.private!==false||!Number.isSafeInteger(repo.id)||repo.id<=0||typeof repo.full_name!=='string'||typeof repo.default_branch!=='string')throw Error('GITHUB_REPOSITORY_INVALID');
  const canonical=identify('https://github.com/'+repo.full_name);if(identify(repo.html_url).canonicalUrl!==canonical.canonicalUrl)throw Error('GITHUB_IDENTITY_MISMATCH');
  if(typeof repo.owner?.login!=='string'||repo.owner.login.toLowerCase()!==canonical.fullName.split('/')[0]||typeof repo.name!=='string'||repo.name.toLowerCase()!==canonical.fullName.split('/')[1])throw Error('GITHUB_OWNER_NAME_INVALID');
  const resolved={...canonical,githubId:String(repo.id),aliases:[...new Set([...(identity.aliases??[]),identity.canonicalUrl].filter(u=>u!==canonical.canonicalUrl))]};
  const metadata={title:clean(repo.name,120),authorDescription:clean(repo.description,1000),owner:clean(repo.owner?.login,100),topics:Array.isArray(repo.topics)?repo.topics.filter(t=>typeof t==='string').slice(0,50).map(t=>clean(t,100)):[],language:clean(repo.language,100)||null,stars:count(repo.stargazers_count),forks:count(repo.forks_count),updatedAt:repo.updated_at??null,pushedAt:repo.pushed_at??null,defaultBranch:clean(repo.default_branch,200),licenseSpdx:repo.license?.spdx_id&&repo.license.spdx_id!=='NOASSERTION'?clean(repo.license.spdx_id,100):null,licenseVerification:'unreviewed',observedAt};
  const evidence=[{id:'repository',url:resolved.canonicalUrl,origin:'github_api_and_author_fields',observedAt,content:JSON.stringify({title:metadata.title,description:metadata.authorDescription,topics:metadata.topics,language:metadata.language})}],issues=[];
  for(const [endpoint,id] of [['readme','readme'],['license','license']]){
    try{const data=await githubJson('/repos/'+resolved.fullName+'/'+endpoint,options);const doc=document(data,resolved.canonicalUrl+(data?.path?'/blob/'+encodeURIComponent(metadata.defaultBranch)+'/'+data.path.split('/').map(encodeURIComponent).join('/'):'') ,id,observedAt);if(doc)evidence.push(doc);else issues.push(id+':missing');}catch(e){issues.push(id+':'+e.message);}
  }
  if(options.releases)try{const release=await githubJson('/repos/'+resolved.fullName+'/releases/latest',options);if(release){metadata.latestRelease=clean(release.tag_name,100);evidence.push({id:'release',url:resolved.canonicalUrl+'/releases',origin:'repository_author',observedAt,content:clean(release.body,12000)});}}catch(e){issues.push('release:'+e.message);}
  return{identity:resolved,metadata,evidence,issues,state:issues.length?'partial':'complete'};
}
export async function githubDocument(identity,file,options){
  if(!/^(?:[a-zA-Z0-9_-]+\/){0,6}[a-zA-Z0-9_.-]+\.(?:md|txt|rst|json|toml|yaml|yml)$/i.test(file)||file.split('/').some(p=>p==='..'||p==='.')||/(?:^|\/)(?:\.env|secrets?|credentials?|id_rsa)/i.test(file))throw Error('DOCUMENT_PATH_NOT_ALLOWED');
  // Re-check visibility even when adding selected documentation to an older draft.
  const repo=await githubJson('/repos/'+identity.fullName,{...options,force:true});if(!repo||repo.private!==false||String(repo.id)!==identity.githubId)throw Error('GITHUB_IDENTITY_OR_VISIBILITY_CHANGED');
  const data=await githubJson('/repos/'+identity.fullName+'/contents/'+file.split('/').map(encodeURIComponent).join('/')+'?ref='+encodeURIComponent(repo.default_branch),{...options,force:true});
  const doc=document(data,identity.canonicalUrl+'/blob/'+encodeURIComponent(repo.default_branch)+'/'+file,'file-'+digest(file).slice(0,12),(options.now?.()??new Date()).toISOString());if(!doc)throw Error('DOCUMENT_NOT_FOUND');return doc;
}
