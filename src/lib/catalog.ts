import {normalize} from './validation.ts';
import type {Source,Term} from './validation.ts';
export type {Term,Source};
export type Resource = {
  id:string;slug:string;title:string;summary:string;description:string;type:string;typeName:string;canonicalUrl:string;
  platforms:string[];license:string|null;pricing:string|null;icon:string|null;image:string|null;mobileImage:string|null;
  heroTitle:string|null;mediaAlt:string|null;mediaCredit:string|null;mediaKind:'screenshot'|'artwork'|null;
  categories:Term[];tags:Term[];sources:Source[];featured:boolean;curated:boolean;createdAt:string;updatedAt:string;
};
type Row={id:string;slug:string;title:string;summary:string;description:string;type:string;type_name:string;canonical_url:string;platforms_json:string;license:string|null;pricing:string|null;icon:string|null;image:string|null;mobile_image:string|null;hero_title:string|null;media_alt:string|null;media_credit:string|null;media_kind:Resource['mediaKind'];categories_json:string;tags_json:string;sources_json:string;featured_rank:number|null;curated_rank:number|null;created_at:string;updated_at:string};
const select=`SELECT r.*, rt.name AS type_name,
 COALESCE((SELECT json_group_array(json_object('slug',c.slug,'name',c.name)) FROM categories c JOIN resource_categories rc ON c.slug=rc.category_slug WHERE rc.resource_id=r.id),'[]') AS categories_json,
 COALESCE((SELECT json_group_array(json_object('slug',t.slug,'name',t.name)) FROM tags t JOIN resource_tags x ON t.slug=x.tag_slug WHERE x.resource_id=r.id),'[]') AS tags_json,
 COALESCE((SELECT json_group_array(json_object('url',s.url,'label',s.label,'fields',json(s.fields_json),'verifiedAt',s.verified_at)) FROM sources s WHERE s.resource_id=r.id),'[]') AS sources_json
 FROM resources r JOIN resource_types rt ON rt.slug=r.type`;
function resource(r:Row):Resource{return {id:r.id,slug:r.slug,title:r.title,summary:r.summary,description:r.description,type:r.type,typeName:r.type_name,canonicalUrl:r.canonical_url,platforms:JSON.parse(r.platforms_json),license:r.license,pricing:r.pricing,icon:r.icon,image:r.image,mobileImage:r.mobile_image,heroTitle:r.hero_title,mediaAlt:r.media_alt,mediaCredit:r.media_credit,mediaKind:r.media_kind,categories:JSON.parse(r.categories_json),tags:JSON.parse(r.tags_json),sources:JSON.parse(r.sources_json),featured:r.featured_rank!==null,curated:r.curated_rank!==null,createdAt:r.created_at,updatedAt:r.updated_at};}
function integer(value:string|null,defaultValue:number,max:number):number{const n=Number(value);return value&&Number.isFinite(n)?Math.min(max,Math.max(1,Math.floor(n))):defaultValue;}
export function searchExpression(query:string):string {
  const tokens=normalize(query.slice(0,160)).match(/[\p{L}\p{N}]+/gu)?.slice(0,12)??[];
  return tokens.map(t=>`"${t.slice(0,40)}"*`).join(' AND ');
}
export async function listResources(db:D1Database,params:URLSearchParams){
  const bindings:(string|number)[]=[],clauses=["r.status='published'"],add=(value:string|number)=>{bindings.push(value);return '?'+bindings.length;};
  const query=(params.get('q')??'').trim().slice(0,160);
  if(query){const expression=searchExpression(query);clauses.push(expression?`r.rowid IN (SELECT rowid FROM resource_search WHERE resource_search MATCH ${add(expression)})`:'0');}
  const category=params.get('category');if(category&&category!=='all')clauses.push(`EXISTS(SELECT 1 FROM resource_categories rc WHERE rc.resource_id=r.id AND rc.category_slug=${add(category.slice(0,90))})`);
  const type=params.get('type');if(type&&type!=='all')clauses.push(`r.type=${add(type.slice(0,40))}`);
  const platform=params.get('platform');if(platform&&platform!=='all')clauses.push(`EXISTS(SELECT 1 FROM json_each(r.platforms_json) p WHERE p.value=${add(platform.slice(0,80))})`);
  const where=' WHERE '+clauses.join(' AND '),count=await db.prepare('SELECT count(*) AS total FROM resources r'+where).bind(...bindings).first<{total:number}>();
  const total=count?.total??0,pageSize=integer(params.get('limit'),8,24),page=Math.min(integer(params.get('page'),1,10000),Math.max(1,Math.ceil(total/pageSize)));
  const order=params.get('sort')==='name'?'r.title COLLATE NOCASE,r.id':params.get('sort')==='newest'?'r.updated_at DESC,r.id':'r.featured_rank IS NULL,r.featured_rank,r.curated_rank IS NULL,r.curated_rank,r.title COLLATE NOCASE,r.id';
  const result=await db.prepare(select+where+' ORDER BY '+order+` LIMIT ?${bindings.length+1} OFFSET ?${bindings.length+2}`).bind(...bindings,pageSize,(page-1)*pageSize).all<Row>();
  return {items:result.results.map(resource),total,page,pageSize};
}
export async function getResource(db:D1Database,slug:string):Promise<Resource|null>{if(slug.length>90)return null;const row=await db.prepare(select+" WHERE r.status='published' AND r.slug=?1").bind(slug).first<Row>();return row?resource(row):null;}
export async function getHome(db:D1Database):Promise<{featured:Resource|null;curated:Resource[]}>{
  const featured=await db.prepare(select+" WHERE r.status='published' AND r.featured_rank IS NOT NULL ORDER BY r.featured_rank,r.id LIMIT 1").first<Row>();
  const curated=await db.prepare(select+" WHERE r.status='published' AND r.curated_rank IS NOT NULL AND r.id<>?1 ORDER BY r.curated_rank,r.id LIMIT 4").bind(featured?.id??'').all<Row>();
  return {featured:featured?resource(featured):null,curated:curated.results.map(resource)};
}
export async function getTaxonomy(db:D1Database):Promise<{categories:Term[];types:Term[];platforms:string[]}>{
  const [categories,types,platforms]=await Promise.all([db.prepare('SELECT slug,name FROM categories ORDER BY name').all<Term>(),db.prepare('SELECT slug,name FROM resource_types ORDER BY name').all<Term>(),db.prepare("SELECT DISTINCT p.value AS platform FROM resources r,json_each(r.platforms_json) p WHERE r.status='published' ORDER BY platform").all<{platform:string}>()]);
  return {categories:categories.results,types:types.results,platforms:platforms.results.map(p=>p.platform)};
}
export async function searchResources(db:D1Database,query:string,limit=4):Promise<Resource[]>{
  const params=new URLSearchParams({q:query,limit:String(Math.min(4,Math.max(1,Number.isFinite(limit)?Math.floor(limit):4)))});
  return (await listResources(db,params)).items;
}
