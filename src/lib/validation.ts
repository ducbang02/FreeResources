/** Shared by offline catalog CLI and the read-only query module. No network or cloud SDK. */
export type Term = { slug: string; name: string };
export type Source = { url: string; label: string; fields: string[]; verifiedAt: string };
export type CatalogRecord = {
  id: string; slug: string; title: string; summary: string; description: string; type: string;
  canonicalUrl: string; platforms: string[]; license: string | null; pricing: string | null;
  icon: string | null; image: string | null; mobileImage: string | null; heroTitle: string | null;
  mediaAlt: string | null; mediaCredit: string | null; mediaKind: 'screenshot' | 'artwork' | null;
  status: 'draft' | 'published' | 'archived'; featuredRank: number | null; curatedRank: number | null;
  categories: string[]; tags: string[]; sources: Source[]; createdAt: string; updatedAt: string;
};
export type CatalogSeed = { types: Term[]; categories: Term[]; tags: Term[]; resources: CatalogRecord[] };
const types = ['repository','application','online_tool','learning_resource','game','operating_system_resource','collection'];
export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
}
export function canonicalUrl(value: string): string {
  const url = new URL(value);
  // Catalog links must use domain names. URL normalizes decimal/octal IPv4 first;
  // rejecting every literal also covers unspecified/link-local/mapped addresses.
  const host = url.hostname.replace(/\.$/, '');
  if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.') || host.includes(':') || /^\d+(?:\.\d+){3}$/.test(host) || /(?:^|\.)(?:localhost|local|internal|invalid|test)$/.test(host)) throw Error('URL must be a public HTTPS domain URL without credentials or IP literals');
  url.hash = '';
  return url.href;
}
function object(value: unknown, label: string): Record<string,unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error(`${label}: expected object`);
  return value as Record<string,unknown>;
}
function text(value: unknown, label: string, max=240): string {
  if(typeof value !== 'string' || !value.trim() || value.trim().length>max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw Error(`${label}: invalid text`);
  return value.trim().normalize('NFC');
}
function optional(value: unknown, label: string, max=240): string|null { return value == null ? null : text(value,label,max); }
function slug(value:unknown,label:string):string {const s=text(value,label,90);if(!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(s))throw Error(`${label}: invalid slug`);return s;}
function list(value:unknown,label:string,max=30):unknown[]{if(!Array.isArray(value)||value.length>max)throw Error(`${label}: invalid array`);return value;}
function strings(value:unknown,label:string):string[]{const a=list(value,label).map(v=>text(v,label,80));if(new Set(a).size!==a.length)throw Error(`${label}: duplicates`);return a;}
function timestamp(value:unknown,label:string):string {const s=text(value,label,40),date=new Date(s);if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(s)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,19)!==s.slice(0,19))throw Error(`${label}: invalid UTC timestamp`);return s;}
function rank(value:unknown,label:string):number|null {if(value==null)return null;if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||value>10000)throw Error(`${label}: invalid rank`);return value;}
function media(value:unknown,label:string):string|null {const s=optional(value,label);if(s&&!/^\/assets\/[a-zA-Z0-9_./-]+$/.test(s))throw Error(`${label}: expected local /assets/ path`);if(s?.split('/').includes('..'))throw Error(`${label}: invalid path`);return s;}
function unique(values:string[],label:string){if(new Set(values).size!==values.length)throw Error(`${label}: duplicates`);}
export function validateCatalog(value:unknown):CatalogSeed {
  const input=object(value,'catalog');
  function terms(key:string):Term[]{const a=list(input[key],key,100).map(v=>{const o=object(v,key);return {slug:slug(o.slug,key),name:text(o.name,key,80)};});unique(a.map(t=>t.slug),key);return a;}
  const seed:CatalogSeed={types:terms('types'),categories:terms('categories'),tags:terms('tags'),resources:[]};
  for(const t of seed.types)if(!types.includes(t.slug))throw Error('Unsupported resource type: '+t.slug);
  for(const entry of list(input.resources,'resources',200)){
    const r=object(entry,'resource'),id=slug(r.id,'id');
    const out:CatalogRecord={id,slug:slug(r.slug,'slug'),title:text(r.title,'title',120),summary:text(r.summary,'summary'),description:text(r.description,'description',2400),type:text(r.type,'type',40),canonicalUrl:canonicalUrl(text(r.canonicalUrl,'canonicalUrl',1000)),platforms:strings(r.platforms??[],'platforms'),license:optional(r.license,'license'),pricing:optional(r.pricing,'pricing'),icon:media(r.icon,'icon'),image:media(r.image,'image'),mobileImage:media(r.mobileImage,'mobileImage'),heroTitle:optional(r.heroTitle,'heroTitle',100),mediaAlt:optional(r.mediaAlt,'mediaAlt'),mediaCredit:optional(r.mediaCredit,'mediaCredit',500),mediaKind:r.mediaKind==null?null:r.mediaKind as CatalogRecord['mediaKind'],status:r.status as CatalogRecord['status'],featuredRank:rank(r.featuredRank,'featuredRank'),curatedRank:rank(r.curatedRank,'curatedRank'),categories:strings(r.categories,'categories'),tags:strings(r.tags,'tags'),sources:[],createdAt:timestamp(r.createdAt,'createdAt'),updatedAt:timestamp(r.updatedAt,'updatedAt')};
    if(!['draft','published','archived'].includes(out.status))throw Error('Invalid status: '+id);
    if(!seed.types.some(t=>t.slug===out.type))throw Error('Unknown type: '+id);
    if(out.mediaKind&&!['screenshot','artwork'].includes(out.mediaKind))throw Error('Invalid mediaKind: '+id);
    if(out.image&&(!out.mediaAlt||!out.mediaCredit||!out.mediaKind))throw Error('Image needs alt, credit and kind: '+id);
    if(out.mobileImage&&!out.image)throw Error('Mobile image needs primary image: '+id);
    if(out.heroTitle&&out.heroTitle.split('\n').length>2)throw Error('Hero title must have at most two lines: '+id);
    if(out.featuredRank!==null&&(!out.heroTitle||!out.image))throw Error('Featured resource needs hero title and image: '+id);
    if(out.categories.length===0||out.categories.some(s=>!seed.categories.some(c=>c.slug===s)))throw Error('Unknown/missing category: '+id);
    if(out.tags.some(s=>!seed.tags.some(t=>t.slug===s)))throw Error('Unknown tag: '+id);
    out.sources=list(r.sources,'sources',12).map(v=>{const s=object(v,'source');return {url:canonicalUrl(text(s.url,'source.url',1000)),label:text(s.label,'source.label',120),fields:strings(s.fields,'source.fields'),verifiedAt:timestamp(s.verifiedAt,'source.verifiedAt')};});
    unique(out.sources.map(s=>s.url),'sources');
    const evidenced=(field:string)=>out.sources.some(s=>s.fields.includes(field));
    if(out.status==='published'&&(!out.sources.length||!evidenced('summary')||!evidenced('canonicalUrl')))throw Error('Published resource needs summary/URL evidence: '+id);
    for(const field of ['license','pricing'] as const)if(out[field]&&!evidenced(field))throw Error(`Missing ${field} evidence: ${id}`);
    if(out.platforms.length&&!evidenced('platforms'))throw Error('Missing platform evidence: '+id);
    if(Date.parse(out.updatedAt)<Date.parse(out.createdAt))throw Error('updatedAt precedes createdAt: '+id);
    seed.resources.push(out);
  }
  for(const key of ['id','slug','canonicalUrl'] as const)unique(seed.resources.map(r=>r[key]),key);
  return seed;
}
