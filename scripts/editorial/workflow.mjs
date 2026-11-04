import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCatalog} from '../../src/lib/validation.ts';
import {identify,findMatches} from './network.mjs';
import {Store,digest,readJson} from './store.mjs';
import {importGithub} from './github.mjs';
import {importWebsite} from './website.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export class Editor{
  constructor({stateDir=path.join(root,'.local/editorial'),catalog=path.join(root,'data/catalog.json'),request,now=()=>new Date()}={}){this.store=new Store(stateDir);this.catalog=path.resolve(catalog);this.request=request;this.now=now;}
  seed(){return validateCatalog(readJson(this.catalog));}
  matches(identity,exceptId){return findMatches(this.seed(),this.store.list().filter(d=>d.id!==exceptId),identity);}
  async importUrl(url,{refreshId=null,releases=false,manual=false}={}){
    return this.store.locked(async()=>{
      const identity=refreshId?this.store.draft(refreshId).identity:identify(url),existing=refreshId?[]:this.matches(identity);
      if(existing.length)return{duplicate:true,matches:existing.map(r=>({id:r.id,kind:r.matchKind,title:r.title??r.editorial?.title??''}))};
      const old=refreshId?this.store.draft(refreshId):null,id=old?.id??'draft-'+digest(identity.canonicalUrl).slice(0,16);
      let source;
      try{source=await (identity.kind==='github'?importGithub:importWebsite)(identity,{store:this.store,request:this.request,now:this.now,force:Boolean(refreshId),releases,manual});}catch(e){source={identity,metadata:{},evidence:[],issues:[e.message],state:'failed',nextAttemptAt:e.nextAttemptAt??null};}
      const draft=old??{schemaVersion:1,id,identity,createdAt:this.now().toISOString(),editorial:{title:source.metadata.title??'',summary:'',description:'',type:identity.kind==='github'?'repository':'application',categories:[],tags:[],platforms:[],license:null,pricing:null},policy:{groups:[],freeModel:'unknown',licenseStatus:'unknown',officialSourceVerified:false,freeEvidenceUrl:'',freeLimitations:''},verifiedSources:[],preliminary:{status:'pending'},finalReview:null,analyses:{},revision:0,baseResourceId:null,baseResourceDigest:null};
      if(source.state!=='failed'){
        const duplicates=this.matches(source.identity,id);
        if(!old&&duplicates.some(d=>((d.sourceIdentity??d.identity)?.githubId===source.identity.githubId&&source.identity.githubId)||(d.sourceIdentity??d.identity)?.canonicalUrl===source.identity.canonicalUrl||d.canonicalUrl===source.identity.canonicalUrl))return{duplicate:true,matches:duplicates.map(d=>({id:d.id,kind:d.matchKind}))};
        draft.possibleDuplicates=duplicates.map(d=>({id:d.id,kind:d.matchKind}));
        draft.identity=source.identity;draft.source=source;
      }else if(!old)draft.source=source;
      draft.lastRefresh={state:source.state,issues:source.issues,nextAttemptAt:source.nextAttemptAt??null,at:this.now().toISOString()};
      draft.revision++;draft.updatedAt=this.now().toISOString();this.store.save(draft);return draft;
    });
  }
}
