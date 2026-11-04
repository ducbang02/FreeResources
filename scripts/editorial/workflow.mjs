import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCatalog} from '../../src/lib/validation.ts';
import {identify,findMatches} from './network.mjs';
import {Store,digest,readJson,atomicJson,withLock} from './store.mjs';
import {importGithub} from './github.mjs';
import {importWebsite} from './website.mjs';
import {rulesFor,contentDigest,patchDraft,candidate} from './review.mjs';
import {githubDocument} from './github.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export class Editor{
  constructor({stateDir=path.join(root,'.local/editorial'),catalog=path.join(root,'data/catalog.json'),request,now=()=>new Date()}={}){this.store=new Store(stateDir);this.catalog=path.resolve(catalog);this.request=request;this.now=now;}
  seed(){return validateCatalog(readJson(this.catalog));}
  matches(identity,exceptId){return findMatches(this.seed(),this.store.list().filter(d=>d.id!==exceptId),identity);}
  async change(id,action){return this.store.locked(async()=>{
    const draft=this.store.draft(id),seed=this.seed(),before=contentDigest(draft,seed);await action(draft,seed);
    if(before!==contentDigest(draft,seed)){draft.preliminary={status:'pending'};draft.finalReview=null;}
    draft.revision++;draft.updatedAt=this.now().toISOString();this.store.save(draft);return draft;
  });}
  async edit(id,patch){return this.change(id,(draft,seed)=>patchDraft(draft,patch,seed,this.now().toISOString()));}
  async checkout(resourceId){return this.store.locked(async()=>{
    const seed=this.seed(),record=seed.resources.find(r=>r.id===resourceId);if(!record)throw Error('RESOURCE_NOT_FOUND');
    const identity=record.sourceIdentity??identify(record.canonicalUrl),matches=this.store.list().filter(d=>d.baseResourceId===resourceId);if(matches.length)return matches[0];
    const id='draft-'+digest('checkout:'+resourceId).slice(0,16),draft={schemaVersion:1,id,identity,createdAt:this.now().toISOString(),updatedAt:this.now().toISOString(),revision:1,baseResourceId:resourceId,baseResourceDigest:digest(record),originalRecord:record,editorial:Object.fromEntries(['title','summary','description','type','categories','tags','platforms','license','pricing','slug'].map(k=>[k,record[k]])),policy:{groups:record.editorial?.groups??[],freeModel:record.editorial?.freeModel??'unknown',licenseStatus:record.editorial?.licenseStatus??'unknown',officialSourceVerified:false,freeEvidenceUrl:record.editorial?.freeEvidenceUrl??'',freeLimitations:record.editorial?.freeLimitations??''},verifiedSources:record.sources,preliminary:{status:'pending'},finalReview:null,analyses:{},source:{identity,metadata:{title:record.title},evidence:[],issues:['checkout:refresh_or_supply_evidence'],state:'partial'},lastRefresh:{state:'partial',issues:[],at:this.now().toISOString()}};
    this.store.save(draft);return draft;
  });}
  async preliminary(id,status,by){
    if(!['suitable','unsuitable','needs_check'].includes(status)||typeof by!=='string'||!by.trim()||by.length>100)throw Error('PRELIMINARY_REVIEW_INVALID');
    return this.change(id,(draft,seed)=>{draft.preliminary={status,by,at:this.now().toISOString(),digest:contentDigest(draft,seed)};draft.finalReview=null;});
  }
  async approve(id,by){
    if(typeof by!=='string'||!by.trim()||by.length>100)throw Error('REVIEWER_REQUIRED');
    return this.change(id,(draft,seed)=>{const hash=contentDigest(draft,seed);if(draft.preliminary.status!=='suitable'||draft.preliminary.digest!==hash)throw Error('CURRENT_PRELIMINARY_APPROVAL_REQUIRED');candidate(draft,seed,by,this.now().toISOString());draft.finalReview={by,at:this.now().toISOString(),digest:hash};});
  }
  async addDocument(id,file){return this.change(id,async draft=>{
    if(draft.identity.kind!=='github')throw Error('GITHUB_DOCUMENT_ONLY');
    const evidence=await githubDocument(draft.identity,file,{store:this.store,request:this.request,now:this.now});
    const docs=draft.source.evidence.filter(e=>e.id!==evidence.id);if(docs.length>=10)throw Error('DOCUMENT_LIMIT');draft.source.evidence=[...docs,evidence];
  });}
  async exportDraft(id,{apply=false,expect=null}={}){return this.store.locked(()=>withLock(this.catalog+'.editor.lock',async()=>{
    const draft=this.store.draft(id),seed=this.seed(),review=draft.finalReview;
    if(!review||review.digest!==contentDigest(draft,seed)||draft.preliminary.status!=='suitable')throw Error('CURRENT_FINAL_APPROVAL_REQUIRED');
    const resource=candidate(draft,seed,review.by,review.at),before=seed.resources.find(r=>r.id===resource.id);
    if(before&&(!draft.baseResourceId||draft.baseResourceId!==before.id||draft.baseResourceDigest!==digest(before)))throw Error('CATALOG_CONFLICT: checkout/review the current record first');
    if(!before&&draft.baseResourceId)throw Error('CATALOG_RESOURCE_REMOVED');
    const collisions=this.matches(draft.identity,id).filter(r=>!(r.matchKind==='catalog'&&r.id===draft.baseResourceId));if(collisions.length)throw Error('SOURCE_DUPLICATE_REVIEW_REQUIRED');
    const raw=readJson(this.catalog),next={...raw,resources:before?raw.resources.map(r=>r.id===resource.id?resource:r):[...raw.resources,resource]};validateCatalog(next);
    const plan={action:before?digest(before)===digest(resource)?'unchanged':'update':'create',catalog:this.catalog,before:before??null,after:resource,catalogDigest:digest(raw)},planId=digest(plan);
    if(apply){
      if(expect!==planId)throw Error('EXPORT_PLAN_CHANGED: run export and pass its planId with --expect');
      // Every writer supported by this CLI holds the same local lock. Recheck the whole file immediately before replace.
      if(digest(readJson(this.catalog))!==plan.catalogDigest)throw Error('CATALOG_CHANGED');
      if(plan.action!=='unchanged')atomicJson(this.catalog,next);
      draft.baseResourceId=resource.id;draft.baseResourceDigest=digest(resource);draft.originalRecord=resource;draft.exported={planId,at:this.now().toISOString()};this.store.save(draft);
    }
    return{...plan,planId,applied:apply,note:'JSON only. No SQL execution, D1 mutation, Git push or deployment.'};
  }));}
  async importUrl(url,{refreshId=null,releases=false,manual=false}={}){
    return this.store.locked(async()=>{
      const identity=refreshId?this.store.draft(refreshId).identity:identify(url),existing=refreshId?[]:this.matches(identity);
      if(manual&&identity.kind==='github')throw Error('MANUAL_WEBSITE_ONLY: GitHub identity requires its public API');
      if(existing.length)return{duplicate:true,matches:existing.map(r=>({id:r.id,kind:r.matchKind,title:r.title??r.editorial?.title??''}))};
      const old=refreshId?this.store.draft(refreshId):null,id=old?.id??'draft-'+digest(identity.canonicalUrl).slice(0,16);
      let source;
      try{source=await (identity.kind==='github'?importGithub:importWebsite)(identity,{store:this.store,request:this.request,now:this.now,force:Boolean(refreshId),releases,manual});}catch(e){source={identity,metadata:{},evidence:[],issues:[e.message],state:'failed',nextAttemptAt:e.nextAttemptAt??null};}
      const draft=old??{schemaVersion:1,id,identity,createdAt:this.now().toISOString(),editorial:{title:source.metadata.title??'',summary:'',description:'',type:identity.kind==='github'?'repository':'application',categories:[],tags:[],platforms:[],license:null,pricing:null},policy:{groups:[],freeModel:'unknown',licenseStatus:'unknown',officialSourceVerified:false,freeEvidenceUrl:'',freeLimitations:''},verifiedSources:[],preliminary:{status:'pending'},finalReview:null,analyses:{},revision:0,baseResourceId:null,baseResourceDigest:null};
      if(source.state!=='failed'){
        const duplicates=this.matches(source.identity,id);
        if(!old&&duplicates.some(d=>((d.sourceIdentity??d.identity)?.githubId===source.identity.githubId&&source.identity.githubId)||(d.sourceIdentity??d.identity)?.canonicalUrl===source.identity.canonicalUrl||d.canonicalUrl===source.identity.canonicalUrl))return{duplicate:true,matches:duplicates.map(d=>({id:d.id,kind:d.matchKind}))};
        draft.possibleDuplicates=duplicates.map(d=>({id:d.id,kind:d.matchKind}));
        const previous=old?contentDigest(old,this.seed()):null;draft.identity=source.identity;draft.source=source;
        draft.rules=rulesFor(source,this.seed());if(!old){draft.editorial.categories=draft.rules.categories;draft.editorial.tags=draft.rules.tags;}
        if(old&&previous!==contentDigest(draft,this.seed())){draft.preliminary={status:'pending'};draft.finalReview=null;}
      }else if(!old)draft.source=source;
      draft.lastRefresh={state:source.state,issues:source.issues,nextAttemptAt:source.nextAttemptAt??null,at:this.now().toISOString()};
      draft.revision++;draft.updatedAt=this.now().toISOString();this.store.save(draft);return draft;
    });
  }
}
