import {parseArgs} from 'node:util';
import {Editor} from './workflow.mjs';
export async function main(argv){
  const {values,positionals}=parseArgs({args:argv,allowPositionals:true,options:{'state-dir':{type:'string'},catalog:{type:'string'},manual:{type:'boolean'},releases:{type:'boolean'}}});
  const [command,arg]=positionals,editor=new Editor({stateDir:values['state-dir'],catalog:values.catalog});let result;
  switch(command){
    case 'import':result=await editor.importUrl(arg,{manual:values.manual,releases:values.releases});break;
    case 'refresh':result=await editor.importUrl(null,{refreshId:arg,releases:values.releases});break;
    case 'show':result=editor.store.draft(arg);break;
    case 'list':result=editor.store.list().map(d=>({id:d.id,source:d.identity.canonicalUrl,title:d.editorial.title,metadata:d.lastRefresh.state,preliminary:d.preliminary.status,approved:Boolean(d.finalReview)}));break;
    case 'help':result={commands:['import <url> [--manual] [--releases]','list','show <draft-id>','refresh <draft-id>'],note:'Local drafts only. No automatic AI, Git push, D1 mutation or deployment.'};break;
    default:throw Error('UNKNOWN_EDITORIAL_COMMAND: use node scripts/catalog.mjs help');
  }
  console.log(JSON.stringify(result,null,2));if(result?.lastRefresh?.state==='failed')process.exitCode=1;
}
