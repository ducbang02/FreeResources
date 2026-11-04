import {safeRequest,identify} from './network.mjs';
import {digest} from './store.mjs';
function decode(text){return text.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt);/gi,(all,entity)=>{if(entity[0]==='#'){const n=parseInt(entity.slice(entity[1].toLowerCase()==='x'?2:1),entity[1].toLowerCase()==='x'?16:10);return n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):'';}return{amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'}[entity.toLowerCase()]??all;});}
const plain=(value,max)=>decode(value??'').replace(/<[^>]*>/g,'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
export function websiteMetadata(html){
  // Only bounded head metadata, never render HTML or retain scripts, links or download URLs.
  const head=html.slice(0,65536).split(/<\/head\s*>/i)[0].replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
  let title=plain(head.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1],120),description='';
  for(const match of head.matchAll(/<meta\b[^>]{0,4000}>/gi)){
    const attrs={};for(const a of match[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))attrs[a[1].toLowerCase()]=a[2]??a[3]??a[4];
    const name=(attrs.name??attrs.property??'').toLowerCase();if(name==='description'&&!description)description=plain(attrs.content,1000);if(name==='og:title'&&!title)title=plain(attrs.content,120);if(name==='og:description'&&!description)description=plain(attrs.content,1000);
  }
  return{title,authorDescription:description};
}
export async function importWebsite(identity,{store,request=safeRequest,force=false,manual=false,now=()=>new Date()}={}){
  const observedAt=now().toISOString(),base={identity,metadata:{title:new URL(identity.canonicalUrl).hostname,authorDescription:'',observedAt},evidence:[],issues:[],state:'partial'};
  if(manual)return{...base,issues:['manual:metadata_not_fetched']};
  try{
    const key='website-cache/'+digest(identity.canonicalUrl)+'.json',cached=store.read(key,null);
    if(cached&&!force&&Date.parse(cached.expiresAt)>now().getTime())return cached.source;
    const response=await request(identity.canonicalUrl,{maxBytes:256*1024,headers:{Accept:'text/html',...(cached?.etag?{'If-None-Match':cached.etag}:{})}});
    if(response.status===304){if(!cached)throw Error('WEBSITE_304_WITHOUT_CACHE');store.write(key,{...cached,expiresAt:new Date(now().getTime()+21600000).toISOString()});return cached.source;}
    if(response.status!==200)throw Error('WEBSITE_HTTP_'+response.status);
    if(! /^text\/html\b/i.test(response.headers?.['content-type']??''))throw Error('WEBSITE_HTML_REQUIRED');
    const final=identify(response.url??identity.canonicalUrl);if(final.kind!=='website')throw Error('WEBSITE_REDIRECT_USE_GITHUB_IMPORT');
    if(/cf-chl-|g-recaptcha|h-captcha|verify you are human|captcha/i.test(response.body.slice(0,65536)))throw Error('WEBSITE_ACCESS_RESTRICTED');
    const metadata={...websiteMetadata(response.body),observedAt},aliases=[...new Set([...(identity.aliases??[]),identity.canonicalUrl].filter(u=>u!==final.canonicalUrl))];
    const evidence=metadata.title||metadata.authorDescription?[{id:'website-metadata',url:final.canonicalUrl,origin:'website_author',observedAt,content:JSON.stringify({title:metadata.title,authorDescription:metadata.authorDescription})}]:[];
    const source={identity:{...final,aliases},metadata,evidence,issues:evidence.length?[]:['website:metadata_missing'],state:evidence.length?'complete':'partial'};
    store.write(key,{source,etag:response.headers?.etag??null,expiresAt:new Date(now().getTime()+21600000).toISOString()});return source;
  }catch(e){return{...base,issues:[e.message]};}
}
