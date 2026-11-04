/** Local documentation only. No cloud calls, installation, or application build. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const folder=path.join(root,'docs/architecture-maps');
const lock=JSON.parse(fs.readFileSync(path.join(folder,'archify.lock.json'),'utf8'));
const skill=path.join(root,lock.installedPath),cli=path.join(skill,'bin/archify.mjs');
for(const [file,expected] of Object.entries(lock.files)){
  if(!fs.existsSync(path.join(skill,file)))throw Error('Missing project-local Archify. Follow docs/architecture-maps/README.md.');
  const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(skill,file))).digest('hex');
  if(actual!==expected)throw Error('Archify snapshot changed: '+file+'. Review/reinstall the pinned revision before building.');
}
const env={...process.env,ARCHIFY_UPDATE_CHECK_DISABLED:'1'};
// Scoped to these child processes; no global Git configuration is changed.
const configIndex=Number(env.GIT_CONFIG_COUNT||0);
env.GIT_CONFIG_COUNT=String(configIndex+1);
env['GIT_CONFIG_KEY_'+configIndex]='safe.directory';
env['GIT_CONFIG_VALUE_'+configIndex]=root.replaceAll('\\','/');
const only=process.argv[2];
if(only&&!/^0[1-4]$/.test(only))throw Error('Usage: node tools/architecture-maps.mjs [01|02|03|04]');
// Four purpose-based overviews. New phases/features update these; no phase-number discovery.
const maps=[['01-system.architecture.json','architecture','01-system.html'],['02-cicd.workflow.json','workflow','02-cicd.html'],['03-data.dataflow.json','dataflow','03-data.html'],['04-search.sequence.json','sequence','04-search.html']];
const extras=fs.readdirSync(path.join(folder,'sources')).filter(f=>f.endsWith('.json')&&!maps.some(([name])=>name===f));
if(extras.length)throw Error('Unregistered high-level maps: '+extras.join(', ')+'. Consolidate into the four overviews; a new independent subsystem requires explicit review.');
const run=new Date().toISOString().replace(/[:.]/g,'-');
let failed=false;
for(const [filename,type,output] of maps.filter(([name])=>!only||name.startsWith(only))){
  const input=path.join(folder,'sources',filename),data=JSON.parse(fs.readFileSync(input,'utf8'));
  if(data.diagram_type!==type||data.meta.output!=='docs/architecture-maps/'+output)throw Error('Map registry/type/output mismatch: '+filename);
  const outDir=path.join(root,'qa/architecture-maps/archify',filename.replace('.json',''),run);
  fs.mkdirSync(outDir,{recursive:true});
  const result=spawnSync(process.execPath,[cli,'finalize',data.diagram_type,input,path.join(root,data.meta.output),'--repo-root',root,'--quality','showcase','--out-dir',outDir,'--json'],{cwd:root,env,encoding:'utf8',timeout:180000,maxBuffer:12*1024*1024});
  fs.writeFileSync(path.join(outDir,'command.json'),result.stdout||'');
  if(result.stderr)fs.writeFileSync(path.join(outDir,'stderr.txt'),result.stderr);
  let receipt;try{receipt=JSON.parse(result.stdout);}catch{receipt={error:result.error?.message||result.stderr||'No JSON receipt'};}
  console.log(JSON.stringify({source:filename,exitCode:result.status,status:receipt.status,failedStage:receipt.failedStage,error:receipt.error,diagnostics:receipt.diagnostics?.map(d=>({code:d.code,severity:d.severity,message:d.message,subject:d.subject,evidence:d.severity==='error'?d.evidence:undefined})),evidence:receipt.evidence},null,2));
  if(result.status!==0)failed=true;
}
if(failed)process.exitCode=1;
