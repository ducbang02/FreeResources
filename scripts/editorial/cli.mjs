import {parseArgs} from 'node:util';
import {Editor} from './workflow.mjs';
import {readJson} from './store.mjs';
import {usage,publicConfig} from './gemini.mjs';
export async function main(argv){
  const {values,positionals}=parseArgs({args:argv,allowPositionals:true,options:{'state-dir':{type:'string'},catalog:{type:'string'},manual:{type:'boolean'},releases:{type:'boolean'},by:{type:'string'},apply:{type:'boolean'},expect:{type:'string'},force:{type:'boolean'}}});
  const [command,arg,extra]=positionals,editor=new Editor({stateDir:values['state-dir'],catalog:values.catalog});let result;
  switch(command){
    case 'import':result=await editor.importUrl(arg,{manual:values.manual,releases:values.releases});break;
    case 'refresh':result=await editor.importUrl(null,{refreshId:arg,releases:values.releases});break;
    case 'checkout':result=await editor.checkout(arg);break;
    case 'edit':result=await editor.edit(arg,readJson(extra));break;
    case 'review':result=await editor.preliminary(arg,extra,values.by);break;
    case 'approve':result=await editor.approve(arg,values.by);break;
    case 'export':result=await editor.exportDraft(arg,{apply:values.apply,expect:values.expect});break;
    case 'document':result=await editor.addDocument(arg,extra);break;
    case 'rules':result=editor.store.draft(arg).rules??{note:'No deterministic rule. Edit manually.'};break;
    case 'analyze':result=await editor.analyze(arg,extra,{force:values.force});if(result.status!=='complete')process.exitCode=1;break;
    case 'apply-ai':result=await editor.applyAnalysis(arg,extra,{apply:values.apply,expect:values.expect});break;
    case 'ai-usage':result=usage(editor.store,editor.now());break;
    case 'ai-config':result=publicConfig(editor.store);break;
    case 'projection-check':{
      const {DatabaseSync}=await import('node:sqlite'),{projectionCheck}=await import('./projection.mjs');const db=new DatabaseSync(arg,{readOnly:true});try{result=projectionCheck(db,editor.seed());}finally{db.close();}if(result.status==='FAIL')process.exitCode=1;break;
    }
    case 'show':result=editor.store.draft(arg);break;
    case 'list':result=editor.store.list().map(d=>({id:d.id,source:d.identity.canonicalUrl,title:d.editorial.title,metadata:d.lastRefresh.state,preliminary:d.preliminary.status,approved:Boolean(d.finalReview)}));break;
    case 'help':result={commands:['import <url> [--manual] [--releases]','list','show <draft-id>','refresh <draft-id>','checkout <resource-id>','edit <draft-id> <patch.json>','rules <draft-id>','document <draft-id> <selected/github/file.md>','review <draft-id> suitable|unsuitable|needs_check --by <editor>','approve <draft-id> --by <editor>','export <draft-id> [--apply --expect <planId>]','analyze <draft-id> quick|deep [--force]','apply-ai <draft-id> quick|deep [--apply --expect <planId>]','ai-usage','ai-config','projection-check <local-d1.sqlite> --catalog <pre-change-baseline.json>'],note:'Local drafts only. No automatic AI, Git push, D1 mutation or deployment.'};break;
    default:throw Error('UNKNOWN_EDITORIAL_COMMAND: use node scripts/catalog.mjs help');
  }
  console.log(JSON.stringify(result,null,2));if(result?.lastRefresh?.state==='failed')process.exitCode=1;
}
