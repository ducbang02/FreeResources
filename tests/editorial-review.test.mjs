import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {editorFixture,sandbox} from './helpers/editorial.mjs';import {Editor} from '../scripts/editorial/workflow.mjs';
import {catalogSql} from '../scripts/catalog.mjs';import {validateCatalog} from '../src/lib/validation.ts';
import {projectionCheck} from '../scripts/editorial/projection.mjs';
export function completedPatch(draft,freeModel='freeware'){
  const verifiedSources=structuredClone(draft.verifiedSources??[]),existing=verifiedSources.find(s=>s.url===draft.identity.canonicalUrl);
  if(existing)existing.fields=[...new Set([...existing.fields,'summary','canonicalUrl','pricing'])];else verifiedSources.push({url:draft.identity.canonicalUrl,label:'Nguồn kiểm thử tổng hợp, không phải xác minh thật',fields:['summary','canonicalUrl','pricing']});
  return{editorial:{title:'Fixture tool — nội dung kiểm thử',summary:'Mô tả tiếng Việt do người kiểm thử biên tập.',description:'Fixture tổng hợp để kiểm thử quy trình, không phải tài nguyên đã xác minh thật.',categories:['van-phong'],tags:['chuyen-file'],pricing:'Miễn phí theo nguồn fixture'},policy:{groups:['free_apps',...(draft.identity.kind==='github'?['github']:[])],freeModel,licenseStatus:'unknown',officialSourceVerified:true,freeEvidenceUrl:draft.identity.canonicalUrl,freeLimitations:freeModel==='freemium'?'Giới hạn Free đã được reviewer fixture đối chiếu':''},verifiedSources};
}
async function reviewed(f){let d=await f.editor.importUrl('https://github.com/fixture-org/tool');d=await f.editor.edit(d.id,completedPatch(d));await f.editor.preliminary(d.id,'suitable','Fixture editor');return f.editor.approve(d.id,'Fixture editor');}
test('P02 rules, preliminary/final approval, export plan/apply and SQL are idempotent without AI',async t=>{
  const f=editorFixture(t),original=fs.readFileSync(f.catalog,'utf8');let d=await f.editor.importUrl('https://github.com/fixture-org/tool');assert.deepEqual(d.rules.categories,['van-phong']);assert.deepEqual(d.editorial.tags,['chuyen-file']);
  await assert.rejects(f.editor.exportDraft(d.id),/FINAL_APPROVAL/);await assert.rejects(f.editor.approve(d.id,'Fixture'),/PRELIMINARY/);
  await f.editor.edit(d.id,completedPatch(d));await f.editor.preliminary(d.id,'suitable','Fixture');await f.editor.approve(d.id,'Fixture');
  const plan=await f.editor.exportDraft(d.id);assert.equal(plan.action,'create');assert.equal(fs.readFileSync(f.catalog,'utf8'),original);await assert.rejects(f.editor.exportDraft(d.id,{apply:true,expect:'wrong'}),/PLAN_CHANGED/);
  await f.editor.exportDraft(d.id,{apply:true,expect:plan.planId});const saved=validateCatalog(JSON.parse(fs.readFileSync(f.catalog,'utf8')));assert.equal(saved.resources.length,14);assert.equal(saved.resources.at(-1).id,'gh-987654321');
  const repeat=await f.editor.exportDraft(d.id);assert.equal(repeat.action,'unchanged');const bytes=fs.readFileSync(f.catalog,'utf8');await f.editor.exportDraft(d.id,{apply:true,expect:repeat.planId});assert.equal(fs.readFileSync(f.catalog,'utf8'),bytes);
  const db=new DatabaseSync(':memory:');try{db.exec(fs.readFileSync('migrations/0001_catalog.sql','utf8'));db.exec(catalogSql(saved));db.exec(catalogSql(saved));assert.equal(db.prepare('SELECT count(*) AS n FROM resources').get().n,14);assert.equal(db.prepare('SELECT title FROM resources WHERE id=?').get('gh-987654321').title,plan.after.title);}finally{db.close();}
  assert.equal(f.calls.filter(c=>c.url.includes('google')).length,0);
});
test('P02 edits/source changes invalidate approval, stars-only refresh does not invoke AI or overwrite edits',async t=>{
  const f=editorFixture(t),d=await reviewed(f);f.repository.stargazers_count++;
  const unchanged=await f.editor.importUrl(null,{refreshId:d.id});assert.ok(unchanged.finalReview);assert.equal(unchanged.editorial.summary,d.editorial.summary);
  f.repository.description='Changed meaning';const changed=await f.editor.importUrl(null,{refreshId:d.id});assert.equal(changed.finalReview,null);assert.equal(changed.preliminary.status,'pending');
  await f.editor.preliminary(d.id,'suitable','Fixture');await f.editor.approve(d.id,'Fixture');await f.editor.edit(d.id,{editorial:{summary:'Sửa tay sau khi duyệt'}});await assert.rejects(f.editor.exportDraft(d.id),/FINAL_APPROVAL/);
  await assert.rejects(f.editor.edit(d.id,{finalReview:{digest:'forged'}}),/PATCH_INVALID/);
});
test('P02 trial/paid/unknown, unknown official source, missing free/OSS evidence cannot pass final review',async t=>{
  for(const model of ['trial','paid','unknown','open_source']){
    const f=editorFixture(t),d=await f.editor.importUrl('https://github.com/fixture-org/tool');await f.editor.edit(d.id,completedPatch(d,model));await f.editor.preliminary(d.id,'suitable','Fixture');await assert.rejects(f.editor.approve(d.id,'Fixture'),/FREE_POLICY|OSS_LICENSE/);
  }
  const f=editorFixture(t),d=await f.editor.importUrl('https://github.com/fixture-org/tool');await f.editor.preliminary(d.id,'suitable','Fixture');await assert.rejects(f.editor.approve(d.id,'Fixture'),/OFFICIAL_SOURCE/);await f.editor.preliminary(d.id,'unsuitable','Fixture');await assert.rejects(f.editor.exportDraft(d.id),/FINAL_APPROVAL/);
});
test('P02 website freeware/freemium can be reviewed/exported with manual evidence while AI off',async t=>{
  for(const model of ['freeware','freemium']){
    const f=sandbox(t),editor=new Editor({...f,request:async()=>{throw Error('must not fetch');}}),d=await editor.importUrl('https://example.org/tool',{manual:true});await editor.edit(d.id,completedPatch(d,model));await editor.preliminary(d.id,'suitable','Fixture');await editor.approve(d.id,'Fixture');const plan=await editor.exportDraft(d.id);assert.equal(plan.after.sourceIdentity.kind,'website');if(model==='freemium')assert.ok(plan.after.pricing.includes('Giới hạn Free'));assert.equal(plan.after.license,null);
  }
});
test('P02 checkout preserves media/ID/createdAt, detects catalog conflict and cannot export stale plan',async t=>{
  const f=editorFixture(t);const d=await f.editor.checkout('localsend'),patch=completedPatch(d);await f.editor.edit(d.id,patch);await f.editor.preliminary(d.id,'suitable','Fixture');await f.editor.approve(d.id,'Fixture');const plan=await f.editor.exportDraft(d.id);assert.equal(plan.after.id,'localsend');assert.equal(plan.after.createdAt,d.originalRecord.createdAt);assert.equal(plan.after.image,d.originalRecord.image);
  const data=JSON.parse(fs.readFileSync(f.catalog,'utf8'));data.resources.find(r=>r.id==='localsend').summary='Concurrent Git editor';fs.writeFileSync(f.catalog,JSON.stringify(data));await assert.rejects(f.editor.exportDraft(d.id,{apply:true,expect:plan.planId}),/CATALOG_CONFLICT/);
  const rebase=await f.editor.rebase(d.id);assert.equal(rebase.currentGit.summary,'Concurrent Git editor');await f.editor.rebase(d.id,{apply:true,expect:rebase.planId});assert.equal(f.editor.store.draft(d.id).editorial.summary,patch.editorial.summary);await assert.rejects(f.editor.exportDraft(d.id),/FINAL_APPROVAL/);await f.editor.preliminary(d.id,'suitable','Fixture');await f.editor.approve(d.id,'Fixture');assert.equal((await f.editor.exportDraft(d.id)).action,'update');
});
test('P02 projection drift guard detects DB-only edits before seed and never changes data',t=>{
  const {catalog}=sandbox(t),seed=validateCatalog(JSON.parse(fs.readFileSync(catalog,'utf8'))),db=new DatabaseSync(':memory:');try{
    db.exec(fs.readFileSync('migrations/0001_catalog.sql','utf8'));db.exec(catalogSql(seed));assert.equal(projectionCheck(db,seed).status,'PASS');db.exec("UPDATE resources SET summary='DB-only human edit' WHERE id='localsend'");const result=projectionCheck(db,seed);assert.equal(result.status,'FAIL');assert.ok(result.drift.some(d=>d.id==='localsend'&&d.field==='summary'));assert.equal(db.prepare("SELECT summary FROM resources WHERE id='localsend'").get().summary,'DB-only human edit');
  }finally{db.close();}
});
