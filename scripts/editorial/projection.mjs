/** Read-only check against a pre-change Git baseline; never repairs or seeds a database. */
import {digest} from './store.mjs';
export function projectionCheck(db,seed){
  const pairs={id:'id',slug:'slug',title:'title',summary:'summary',description:'description',type:'type',canonicalUrl:'canonical_url',license:'license',pricing:'pricing',icon:'icon',image:'image',mobileImage:'mobile_image',heroTitle:'hero_title',mediaAlt:'media_alt',mediaCredit:'media_credit',mediaKind:'media_kind',status:'status',featuredRank:'featured_rank',curatedRank:'curated_rank',createdAt:'created_at',updatedAt:'updated_at'},drift=[];
  const rows=db.prepare('SELECT * FROM resources').all();
  for(const record of seed.resources){
    const row=rows.find(r=>r.id===record.id);if(!row){drift.push({id:record.id,field:'missing'});continue;}
    for(const [field,column] of Object.entries(pairs))if((row[column]??null)!==(record[field]??null))drift.push({id:record.id,field});
    if(digest(JSON.parse(row.platforms_json))!==digest(record.platforms))drift.push({id:record.id,field:'platforms'});
    for(const [table,column,key] of [['resource_categories','category_slug','categories'],['resource_tags','tag_slug','tags']])if(digest(db.prepare(`SELECT ${column} AS slug FROM ${table} WHERE resource_id=? ORDER BY ${column}`).all(record.id).map(r=>r.slug))!==digest([...record[key]].sort()))drift.push({id:record.id,field:key});
    const sources=db.prepare('SELECT url,label,fields_json,verified_at FROM sources WHERE resource_id=? ORDER BY url').all(record.id).map(s=>({url:s.url,label:s.label,fields:JSON.parse(s.fields_json).sort(),verifiedAt:s.verified_at}));
    const expected=record.sources.map(s=>({...s,fields:[...s.fields].sort()})).sort((a,b)=>a.url<b.url?-1:a.url>b.url?1:0);if(digest(sources)!==digest(expected))drift.push({id:record.id,field:'sources'});
  }
  for(const row of rows)if(!seed.resources.some(r=>r.id===row.id))drift.push({id:row.id,field:'extra_record'});
  return{status:drift.length?'FAIL':'PASS',mode:'READ ONLY',drift,note:'Compare against the Git baseline BEFORE editing/export. On drift stop, preserve a copy and reconcile into Git; never overwrite DB to silence this check. Cloud requires a separate authorized readback.'};
}
