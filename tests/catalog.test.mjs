// SQLite integration verifies SQL/query behavior; root separately verifies real local D1/workerd.
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {validateCatalog,canonicalUrl,normalize} from '../src/lib/validation.ts';
import {listResources,getResource,getHome,getTaxonomy,searchResources,searchExpression} from '../src/lib/catalog.ts';
import {catalogSql,validateMediaFiles} from '../scripts/catalog.mjs';
const input=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(input);
function setup(){
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec(fs.readFileSync(new URL('../migrations/0001_catalog.sql',import.meta.url),'utf8'));
  sqlite.exec(catalogSql(input));
  const db={prepare(sql){const query=sqlite.prepare(sql);let bindings=[];return {bind(...values){bindings=values;return this;},async first(){return query.get(...bindings)??null;},async all(){return {success:true,results:query.all(...bindings)};}};}};
  return {sqlite,db};
}
test('Seed validates the published catalog and represents all seven types',()=>{
  const data=validateCatalog(input);assert.equal(data.resources.length,input.resources.length);assert.equal(new Set(data.resources.map(r=>r.type)).size,7);
  assert.equal(data.resources.find(r=>r.id==='libreoffice').license,null);
  assert.deepEqual(data.resources.find(r=>r.id==='godot').platforms,[]);
  assert.ok(data.resources.every(r=>r.sources.length>0));
});
test('Reject invalid URLs, credential URLs, local hosts and unsafe asset paths',()=>{
  for(const url of ['http://example.org/','https://name:secret@example.org/','https://127.0.0.1/','https://10.2.3.4/','https://0.0.0.0/','https://169.254.169.254/','https://2130706433/','https://0x7f000001/','https://[::1]/','https://[::ffff:127.0.0.1]/','https://preview.localhost/','https://preview.internal/','javascript:alert(1)'])assert.throws(()=>canonicalUrl(url),url);
  const data=clone();data.resources[0].image='/assets/../private.svg';assert.throws(()=>validateCatalog(data),/invalid path/);
  assert.equal(canonicalUrl('https://EXAMPLE.org/path?b=2&a=1#part'),'https://example.org/path?b=2&a=1');
});
test('Reject missing evidence, invalid taxonomy, overlong fields and fake status',()=>{
  const cases=[r=>r.sources=[],r=>{r.license='License claim without evidence';r.sources=r.sources.filter(s=>!s.fields.includes('license'));},r=>r.categories=['missing'],r=>{r.platforms=['Platform claim without evidence'];for(const s of r.sources)s.fields=s.fields.filter(f=>f!=='platforms');},r=>r.summary='x'.repeat(241),r=>r.status='pending',r=>r.heroTitle='a\nb\nc',r=>r.updatedAt='2026-02-30T00:00:00Z'];
  for(const change of cases){const data=clone();change(data.resources[1]);assert.throws(()=>validateCatalog(data));}
});
test('Reject duplicate stable IDs, slugs and canonical URLs in import',()=>{
  for(const key of ['id','slug','canonicalUrl']){const data=clone();data.resources[1][key]=data.resources[0][key];assert.throws(()=>validateCatalog(data),/duplicates/);}
});
test('Offline import rejects missing media instead of publishing broken images',()=>{
  validateMediaFiles(validateCatalog(input));
  const data=clone();data.resources[0].icon='/assets/missing-import-icon.svg';
  assert.throws(()=>validateMediaFiles(validateCatalog(data)),/Missing local icon/);
});
test('Migrate, seed and re-import are idempotent; multi-category and source evidence persist',async()=>{
  const {sqlite,db}=setup();try{
    sqlite.exec(catalogSql(input));assert.equal(sqlite.prepare('SELECT count(*) AS n FROM resources').get().n,input.resources.length);
    const r=await getResource(db,'excalidraw');assert.equal(r.categories.length,2);assert.equal(r.sources.length,2);assert.equal(r.license,'MIT cho mã nguồn');
    assert.ok(r.sources[0].fields.includes('summary'));assert.ok(r.tags.some(t=>t.slug==='ve-so-do'));
  }finally{sqlite.close();}
});
test('Stable ID upsert changes slug/URL and reindexes search without replacing createdAt',async()=>{
  const {sqlite,db}=setup();try{
    const data=clone();data.resources=data.resources.filter(r=>r.id==='localsend');data.resources[0].slug='localsend-updated';data.resources[0].canonicalUrl='https://localsend.org/download';data.resources[0].title='Công cụ thử reindex';data.resources[0].createdAt='2026-11-04T00:00:00Z';data.resources[0].updatedAt='2026-11-04T00:00:00Z';
    sqlite.exec(catalogSql(data));assert.equal(await getResource(db,'localsend'),null);const r=await getResource(db,'localsend-updated');assert.equal(r.id,'localsend');assert.equal(r.createdAt,'2026-11-03T00:00:00Z');assert.equal(r.canonicalUrl,'https://localsend.org/download');
    assert.equal((await searchResources(db,'reindex'))[0].id,'localsend');
  }finally{sqlite.close();}
});
test('Database unique constraints reject collisions against existing IDs',()=>{
  const {sqlite}=setup();try{
    for(const key of ['slug','canonicalUrl']){const data=clone();data.resources=data.resources.filter(r=>r.id==='localsend');data.resources[0].id='different-stable-id';if(key==='slug')data.resources[0].canonicalUrl='https://example.org/new';else data.resources[0].slug='different-slug';assert.throws(()=>sqlite.exec(catalogSql(data)),/UNIQUE constraint failed/);}
    assert.equal(sqlite.prepare("SELECT count(*) AS n FROM resources WHERE id='localsend'").get().n,1);
  }finally{sqlite.close();}
});
test('Vietnamese normalization, file alias and FTS token quoting work without injection',async()=>{
  const {sqlite,db}=setup();try{
    assert.equal(normalize('Đúng công cụ'),'dung cong cu');
    for(const q of ['chuyển file','chuyen file','ChUyEn FiLe'])assert.equal((await searchResources(db,q))[0].id,'localsend');
    for(const q of ['vẽ sơ đồ','ve so do'])assert.equal((await searchResources(db,q))[0].id,'excalidraw');
    assert.equal(searchExpression('file" OR 1=1 --'), '"file"* AND "or"* AND "1"* AND "1"*');
    assert.equal((await searchResources(db,'💠💠')).length,0);assert.equal((await searchResources(db,'" OR 1=1 --')).length,0);
    assert.equal((await listResources(db,new URLSearchParams({q:"';DROP TABLE resources;--"}))).total,0);
    assert.equal(sqlite.prepare('SELECT count(*) AS n FROM resources').get().n,input.resources.length);
  }finally{sqlite.close();}
});
test('Search, category/type/platform facets combine and taxonomy comes from database',async()=>{
  const {sqlite,db}=setup();try{
    const list=await listResources(db,new URLSearchParams({q:'file',category:'van-phong',type:'application',platform:'Windows'}));assert.equal(list.total,1);assert.equal(list.items[0].id,'localsend');
    assert.equal((await listResources(db,new URLSearchParams({type:'game'}))).items[0].id,'openttd');
    assert.equal((await listResources(db,new URLSearchParams({category:"' OR 1=1--"}))).total,0);
    sqlite.exec("INSERT INTO categories(slug,name) VALUES('from-db','From database')");const taxonomy=await getTaxonomy(db);assert.ok(taxonomy.categories.some(c=>c.slug==='from-db'));assert.equal(taxonomy.types.length,7);assert.ok(taxonomy.platforms.includes('Windows'));
  }finally{sqlite.close();}
});

test('Search preview and full results share the current filter scope',async()=>{
  const {sqlite,db}=setup();try{
    for(const filters of [
      {type:'learning_resource'},
      {category:'van-phong',type:'application',platform:'Windows'},
      {category:"' OR 1=1--"},
    ]){
      const params=new URLSearchParams({q:'file',...filters});
      const preview=await searchResources(db,'file',4,params);
      const full=await listResources(db,params);
      assert.deepEqual(preview.map(r=>r.id),full.items.slice(0,4).map(r=>r.id));
      if(filters.type==='learning_resource')assert.deepEqual(preview,[]);
      if(filters.type==='application')assert.deepEqual(preview.map(r=>r.id),['localsend']);
    }
    assert.equal(sqlite.prepare('SELECT count(*) AS n FROM resources').get().n,input.resources.length);
  }finally{sqlite.close();}
});

test('Scoped preview preserves sorting but ignores page and caller limit overrides',async()=>{
  const {sqlite,db}=setup();try{
    for(const sort of ['name','newest']){
      const params=new URLSearchParams({sort,page:'2',limit:'100000',view:'list'});
      const preview=await searchResources(db,'',500,params);
      const first=await listResources(db,new URLSearchParams({sort}));
      assert.equal(preview.length,4);
      assert.deepEqual(preview.map(r=>r.id),first.items.slice(0,4).map(r=>r.id));
      assert.equal(params.get('page'),'2'); // Caller's form state is not mutated.
    }
    assert.equal((await searchResources(db,'',NaN,new URLSearchParams({type:'learning_resource'}))).length,3);
    assert.deepEqual(await searchResources(db,'" OR 1=1 --',4,new URLSearchParams({type:'application'})),[]);
  }finally{sqlite.close();}
});
test('Pagination is bounded and stable; invalid pages clamp; preview caps at4',async()=>{
  const {sqlite,db}=setup();try{
    const first=await listResources(db,new URLSearchParams({sort:'name'}));assert.equal(first.items.length,8);assert.equal(first.total,input.resources.length);
    const second=await listResources(db,new URLSearchParams({sort:'name',page:'2'}));assert.equal(second.items.length,input.resources.length-8);assert.ok(second.items.every(r=>!first.items.some(f=>f.id===r.id)));
    const invalid=await listResources(db,new URLSearchParams({limit:'100000',page:'99999999'}));assert.equal(invalid.pageSize,24);assert.equal(invalid.page,1);
    assert.equal((await searchResources(db,'',500)).length,4);
  }finally{sqlite.close();}
});
test('Home featured and curated resources are selected from database',async()=>{
  const {sqlite,db}=setup();try{
    let home=await getHome(db);assert.equal(home.featured.id,'localsend');assert.deepEqual(home.curated.map(r=>r.id),['excalidraw','godot']);
    sqlite.exec("UPDATE resources SET featured_rank=NULL WHERE id='localsend';UPDATE resources SET featured_rank=0 WHERE id='excalidraw'");home=await getHome(db);assert.equal(home.featured.id,'excalidraw');assert.ok(home.curated.every(r=>r.id!=='excalidraw'));
  }finally{sqlite.close();}
});
test('Draft/archived rows never leak through home/detail/list/search/platform facets',async()=>{
  const {sqlite,db}=setup();try{
    sqlite.exec("UPDATE resources SET status='draft',platforms_json='[\"SecretOS\"]' WHERE id='localsend';UPDATE resources SET status='archived' WHERE id='excalidraw'");
    assert.equal(await getResource(db,'localsend'),null);assert.equal(await getResource(db,'excalidraw'),null);assert.equal((await searchResources(db,'chuyen file')).length,0);assert.equal((await listResources(db,new URLSearchParams())).total,input.resources.length-2);
    const home=await getHome(db);assert.equal(home.featured,null);assert.ok(home.curated.every(r=>r.id!=='excalidraw'));assert.ok(!(await getTaxonomy(db)).platforms.includes('SecretOS'));
  }finally{sqlite.close();}
});

test('Published Remotion keeps conditional-free licensing and is searchable from D1',async()=>{
  const {sqlite,db}=setup();try{
    const resource=await getResource(db,'gh-274495425');
    assert.equal(resource.canonicalUrl,'https://github.com/remotion-dev/remotion');
    assert.equal(sqlite.prepare('SELECT status FROM resources WHERE id=?').get(resource.id).status,'published');
    assert.match(resource.pricing,/Company License/);
    assert.ok(resource.sources.some(s=>s.url==='https://github.com/remotion-dev/remotion/blob/main/LICENSE.md'&&s.fields.includes('license')&&s.fields.includes('pricing')));
    assert.equal((await searchResources(db,'remotion'))[0].id,resource.id);
  }finally{sqlite.close();}
});
