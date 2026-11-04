import {canonicalUrl,validateCatalog} from '../../src/lib/validation.ts';
import {digest} from './store.mjs';
const editorFields={title:120,summary:240,description:2400,slug:90,type:40,license:240,pricing:240};
const groups=['free_resources','free_apps','github'];
const models=['unknown','freeware','open_source','freemium','free_resource','trial','paid'];
const fields=['title','summary','description','canonicalUrl','license','pricing','platforms','usageRights','requirements'];
function text(v,max,empty=true){if(typeof v!=='string'||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)||(!empty&&!v.trim()))throw Error('EDIT_TEXT_INVALID');return v.trim().normalize('NFC');}
function strings(v,allowed,max=30){if(!Array.isArray(v)||v.length>max||v.some(x=>typeof x!=='string'||x.length>80||(allowed&&!allowed.includes(x)))||new Set(v).size!==v.length)throw Error('EDIT_ARRAY_INVALID');return v;}
export function rulesFor(source,seed){
  const table=[['file-transfer','van-phong','chuyen-file'],['file-sharing','van-phong','chuyen-file'],['education','hoc-tap',null],['diagram','sang-tao','ve-so-do'],['drawing','sang-tao','ve-so-do'],['developer-tools','lap-trinh',null]];
  const match=table.find(([topic])=>source.metadata.topics?.includes(topic));
  return{version:'p02-rules-1',categories:match&&seed.categories.some(t=>t.slug===match[1])?[match[1]]:[],tags:match?.[2]&&seed.tags.some(t=>t.slug===match[2])?[match[2]]:[],evidenceIds:match?['repository']:[],reason:match?'Exact reviewed topic rule: '+match[0]:'No deterministic rule; manual category required'};
}
export function contentDigest(draft,seed){
  return digest({identity:draft.identity,editorial:draft.editorial,policy:draft.policy,verifiedSources:draft.verifiedSources,evidence:[...(draft.source?.evidence??[]),...(draft.manualEvidence??[])].map(e=>({id:e.id,url:e.url,sha:e.sha??null,content:e.content})),taxonomy:{types:seed.types,categories:seed.categories,tags:seed.tags}});
}
export function patchDraft(draft,patch,seed,now){
  if(!patch||typeof patch!=='object'||Array.isArray(patch)||Object.keys(patch).some(k=>!['editorial','policy','verifiedSources','manualEvidence'].includes(k)))throw Error('EDIT_PATCH_INVALID');
  for(const [key,value] of Object.entries(patch.editorial??{})){
    if(key in editorFields){draft.editorial[key]=value===null&&['license','pricing'].includes(key)?null:text(value,editorFields[key]);}
    else if(['categories','tags','platforms'].includes(key))draft.editorial[key]=strings(value,key==='platforms'?null:seed[key].map(t=>t.slug));
    else throw Error('EDIT_FIELD_NOT_ALLOWED');
  }
  if(!seed.types.some(t=>t.slug===draft.editorial.type))throw Error('EDIT_TYPE_INVALID');
  for(const [key,value] of Object.entries(patch.policy??{})){
    if(key==='groups')draft.policy[key]=strings(value,groups,3);
    else if(key==='freeModel'){if(!models.includes(value))throw Error('FREE_MODEL_INVALID');draft.policy[key]=value;}
    else if(key==='licenseStatus'){if(!['unknown','author_claim','verified'].includes(value))throw Error('LICENSE_STATUS_INVALID');draft.policy[key]=value;}
    else if(key==='officialSourceVerified'){if(typeof value!=='boolean')throw Error('OFFICIAL_SOURCE_INVALID');draft.policy[key]=value;}
    else if(key==='freeEvidenceUrl')draft.policy[key]=value?canonicalUrl(text(value,1000)):'';
    else if(key==='freeLimitations'||key==='usageRights')draft.policy[key]=text(value,1000);
    else throw Error('POLICY_FIELD_NOT_ALLOWED');
  }
  if(patch.verifiedSources!==undefined){
    if(!Array.isArray(patch.verifiedSources)||patch.verifiedSources.length>12)throw Error('SOURCES_INVALID');
    draft.verifiedSources=patch.verifiedSources.map(s=>({url:canonicalUrl(text(s.url,1000,false)),label:text(s.label,120,false),fields:strings(s.fields,fields),verifiedAt:now}));
  }
  if(patch.manualEvidence!==undefined){
    if(!Array.isArray(patch.manualEvidence)||patch.manualEvidence.length>8)throw Error('EVIDENCE_INVALID');
    draft.manualEvidence=patch.manualEvidence.map((e,i)=>({id:'manual-'+(i+1),url:canonicalUrl(text(e.url,1000,false)),origin:'human_supplied',content:text(e.content,16000,false),observedAt:now}));
  }
}
export function candidate(draft,seed,reviewer,at){
  const p=draft.policy;
  if(!p.officialSourceVerified)throw Error('OFFICIAL_SOURCE_REVIEW_REQUIRED');
  if(!['freeware','open_source','freemium','free_resource'].includes(p.freeModel))throw Error('FREE_POLICY_BLOCKED: trial/paid/unknown cannot be exported');
  if(!p.groups?.length||!p.freeEvidenceUrl||!draft.verifiedSources.some(s=>s.url===p.freeEvidenceUrl&&s.fields.includes('pricing')))throw Error('FREE_EVIDENCE_REQUIRED');
  if(p.freeModel==='freemium'&&!p.freeLimitations)throw Error('FREEMIUM_LIMITS_REQUIRED');
  if(p.freeModel==='free_resource'&&(!p.usageRights||!draft.verifiedSources.some(s=>s.fields.includes('usageRights'))))throw Error('USAGE_RIGHTS_REQUIRED');
  if(p.freeModel==='open_source'&&(p.licenseStatus!=='verified'||!draft.editorial.license))throw Error('OSS_LICENSE_REVIEW_REQUIRED');
  if(draft.lastRefresh.state==='failed')throw Error('SOURCE_REFRESH_REVIEW_REQUIRED');
  if(draft.identity.kind==='github'&&!draft.identity.githubId)throw Error('GITHUB_IDENTITY_REQUIRED');
  const old=draft.originalRecord,id=old?.id??(draft.identity.kind==='github'?'gh-'+draft.identity.githubId:'app-'+digest(draft.identity.canonicalUrl).slice(0,12));
  const result={...(old??{}),...draft.editorial,id,slug:draft.editorial.slug??old?.slug??id,canonicalUrl:draft.identity.canonicalUrl,sourceIdentity:draft.identity,editorial:{groups:p.groups,freeModel:p.freeModel,licenseStatus:p.licenseStatus,freeEvidenceUrl:p.freeEvidenceUrl,freeLimitations:p.freeLimitations??'',reviewedBy:reviewer,reviewedAt:at},status:'published',sources:draft.verifiedSources,createdAt:old?.createdAt??draft.createdAt,updatedAt:at,featuredRank:old?.featuredRank??null,curatedRank:old?.curatedRank??null};
  if(p.freeModel==='freemium')result.pricing='Freemium · Free: '+p.freeLimitations;
  const one=validateCatalog({...seed,resources:[result]}).resources[0];return one;
}
