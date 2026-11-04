import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
export function stable(value){return JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);}
export const digest=value=>createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');
export function readJson(file,fallback){try{const stat=fs.statSync(file);if(stat.size>10*1024*1024)throw Error('LOCAL_FILE_TOO_LARGE');return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT'&&fallback!==undefined)return structuredClone(fallback);throw e;}}
export function atomicJson(file,value){
  fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.'+randomUUID()+'.tmp';let fd;
  try{fd=fs.openSync(temp,'wx',0o600);fs.writeFileSync(fd,JSON.stringify(value,null,2)+'\n');fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;fs.renameSync(temp,file);}finally{if(fd!==undefined)fs.closeSync(fd);if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
export class Store{
  constructor(root='.local/editorial'){this.root=path.resolve(root);}
  file(name){if(!/^[a-zA-Z0-9_./-]+$/.test(name)||name.split('/').includes('..'))throw Error('LOCAL_PATH_INVALID');return path.join(this.root,name);}
  read(name,fallback){return readJson(this.file(name),fallback);}
  write(name,value){atomicJson(this.file(name),value);}
  draft(id){if(!/^draft-[a-f0-9]{16}$/.test(id))throw Error('DRAFT_ID_INVALID');const draft=this.read('drafts/'+id+'.json');if(draft.schemaVersion!==1||draft.id!==id)throw Error('DRAFT_INVALID');return draft;}
  save(draft){this.draftId(draft.id);this.write('drafts/'+draft.id+'.json',draft);}
  draftId(id){if(!/^draft-[a-f0-9]{16}$/.test(id))throw Error('DRAFT_ID_INVALID');}
  list(){const dir=this.file('drafts');return fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>/^draft-[a-f0-9]{16}\.json$/.test(f)).map(f=>this.draft(f.slice(0,-5))):[];}
  async locked(action){
    fs.mkdirSync(this.root,{recursive:true});const lock=this.file('editor.lock');let fd;
    try{fd=fs.openSync(lock,'wx',0o600);}catch(e){if(e.code==='EEXIST')throw Error('EDITOR_BUSY: another command is active; inspect editor.lock after a crash, never delete an active lock');throw e;}
    try{fs.writeFileSync(fd,JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));fs.fsyncSync(fd);return await action();}finally{fs.closeSync(fd);fs.unlinkSync(lock);}
  }
}
