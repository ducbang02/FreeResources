/** Local-only UI adapter. Never imported by src/, Astro, Worker or the build pipeline. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {parseArgs} from 'node:util';
import {Editor} from '../editorial/workflow.mjs';
import {configurationStatus,usage} from '../editorial/gemini.mjs';
import {rulesFor,candidate,contentDigest} from '../editorial/review.mjs';
import {digest} from '../editorial/store.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const staticFiles=new Map([['/admin/admin.js',[path.join(here,'ui/admin.js'),'text/javascript']],['/admin/admin.css',[path.join(here,'ui/admin.css'),'text/css']],...['noto-sans.css','noto-sans-v42-latin-wght-400-700.woff2','noto-sans-v42-vietnamese-wght-400-700.woff2'].map(name=>['/admin/assets/'+name,[path.join(root,'public/assets/fonts',name),name.endsWith('.css')?'text/css':'font/woff2']])]);
staticFiles.set('/admin/assets/favicon.svg',[path.join(root,'public/favicon.svg'),'image/svg+xml']);
const codes={FORBIDDEN:'Truy cập bị từ chối. Mở đúng địa chỉ local và tải lại trang.',BODY_TOO_LARGE:'Dữ liệu quá lớn (tối đa128KiB).',INVALID_BODY:'Yêu cầu không hợp lệ.',EDITOR_BUSY:'Một thao tác khác đang chạy. Chờ rồi thử lại.',DRAFT_CHANGED:'Nháp đã thay đổi ở phiên khác. Tải lại nháp trước khi sửa hoặc duyệt.',AI_DISABLED:'AI đang tắt. Các thao tác khác vẫn dùng được.',GEMINI_KEY_MISSING_OR_INVALID:'Chưa có Gemini key hợp lệ trên server.',FREE_TIER_CONFIRMATION_REQUIRED:'Cần xác nhận Free Tier còn hiệu lực trên server.',DEEP_PRELIMINARY_APPROVAL_REQUIRED:'Duyệt sơ bộ Phù hợp trước khi chạy Deep.',CURRENT_FINAL_APPROVAL_REQUIRED:'Cần duyệt cuối bản nháp hiện tại trước khi Export.',CURRENT_PRELIMINARY_APPROVAL_REQUIRED:'Cần duyệt sơ bộ Phù hợp trên bản nháp hiện tại.',CATALOG_CONFLICT:'Catalog đã thay đổi. Dùng chức năng hợp nhất baseline trước khi duyệt lại.',EXPORT_PLAN_CHANGED:'Nháp/catalog đã đổi. Xem lại bản Export mới.',AI_APPLY_PLAN_CHANGED:'Gợi ý/nháp đã đổi. Xem lại trước khi áp dụng.',AI_DAILY_LIMIT:'Đã hết5 lượt AI hôm nay. Không thử lại để né hạn mức.'};
function statusOf(d,seed){
  if(d.finalReview?.digest===contentDigest(d,seed)){
    try{const item=candidate(d,seed,d.finalReview.by,d.finalReview.at),current=seed.resources.find(r=>r.id===item.id);if(d.exported&&current&&digest(current)===digest(item))return 'exported';}catch{/* Invalid policy still cannot bypass the domain gate. */}
    return 'approved';
  }
  return d.preliminary.status==='suitable'&&d.preliminary.digest===contentDigest(d,seed)?'reviewed':d.preliminary.status==='unsuitable'?'unsuitable':'draft';
}
function fault(code,status=400){return Object.assign(Error(code),{status});}
function errorInfo(e){
  const raw=String(e?.message??''),code=raw==='Invalid URL'?'URL_INVALID':raw.match(/^[A-Z][A-Z_0-9]+(?=:|$)/)?.[0]??(e?.code==='ENOENT'?'NOT_FOUND':'INVALID_INPUT');
  return{code,message:codes[code]??(code.includes('URL')?'URL phải là HTTPS công khai, không credentials/IP hoặc đường dẫn repo con.':code==='NOT_FOUND'?'Không tìm thấy dữ liệu.':code.startsWith('AI_')?'Không thể phân tích AI. Kiểm tra quota/cấu hình và nguồn; không tự retry.':code.includes('EVIDENCE')||code.includes('REVIEW')||code.includes('POLICY')?'Chưa đủ thông tin/nguồn để duyệt. Kiểm tra điều kiện Free, giấy phép và các nguồn đã đối chiếu.':'Không thể hoàn tất. Kiểm tra dữ liệu hoặc tải lại; nội dung chưa lưu vẫn ở biểu mẫu.')};
}
async function readBody(req){
  if(req.headers['content-type']!=='application/json')throw fault('INVALID_BODY',415);
  const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>131072)throw fault('BODY_TOO_LARGE',413);chunks.push(chunk);}
  try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw fault('INVALID_BODY');}
}
export function createAdminServer({editor=new Editor()}={}){
  const csrf=randomBytes(32).toString('hex');let busy=false;
  const server=http.createServer({requestTimeout:15000,headersTimeout:10000,maxHeaderSize:8192},async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    // Only this exact loopback authority; no forwarded headers, tunnels or open CORS.
    const origin='http://127.0.0.1:'+server.address()?.port;
    const send=(status,data)=>{const key=process.env.GEMINI_API_KEY;let text=JSON.stringify(data);if(key)text=text.split(key).join('[hidden]');res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(text);};
    try{
      if(req.socket.remoteAddress!=='127.0.0.1'||req.headers.host!==origin.slice(7)||req.headers.origin&&req.headers.origin!==origin||req.headers['sec-fetch-site']&&!['same-origin','none'].includes(req.headers['sec-fetch-site']))throw fault('FORBIDDEN',403);
      if(!req.url?.startsWith('/')||req.url.startsWith('//'))throw fault('FORBIDDEN',403);
      const url=new URL(req.url,origin);
      if(req.method==='GET'){
        if(url.pathname==='/admin/api/state'){
          const seed=editor.seed(),ai=configurationStatus(editor.store),u=usage(editor.store);
          return send(200,{csrf,ai,usage:{used:u.used,remaining:u.remaining,limit:u.limit,resetAt:u.resetAt},catalogLabel:path.basename(editor.catalog),catalog:seed.resources.map(r=>({id:r.id,title:r.title})),taxonomy:{types:seed.types,categories:seed.categories,tags:seed.tags},drafts:editor.store.list().map(d=>({id:d.id,title:d.editorial.title||d.source.metadata.title||'Chưa có tên',kind:d.identity.kind,url:d.identity.canonicalUrl,updatedAt:d.updatedAt,metadata:d.lastRefresh.state,status:statusOf(d,seed)}))});
        }
        const match=url.pathname.match(/^\/admin\/api\/draft\/(draft-[a-f0-9]{16})$/);if(match)return send(200,editor.store.draft(match[1]));
        let file=staticFiles.get(url.pathname);
        if(/^\/admin\/resources(?:\/draft-[a-f0-9]{16})?\/?$/.test(url.pathname))file=[path.join(here,'ui/index.html'),'text/html'];
        if(!file)return send(404,{code:'NOT_FOUND',message:'Trang không tồn tại.'});
        const bytes=fs.readFileSync(file[0]);res.writeHead(200,{'Content-Type':file[1]+'; charset=utf-8'});return res.end(bytes);
      }
      if(req.method!=='POST'||url.pathname!=='/admin/api/action')return send(405,{code:'METHOD_NOT_ALLOWED',message:'Thao tác không được hỗ trợ.'});
      const token=req.headers['x-admin-csrf'];if(req.headers.origin!==origin||typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||!timingSafeEqual(Buffer.from(token),Buffer.from(csrf)))throw fault('FORBIDDEN',403);
      const body=await readBody(req);
      if(busy)throw fault('EDITOR_BUSY',409);
      busy=true;
      try{
        const {action,id,patch,by,status,mode,expect,apply,revision,url:inputUrl,manual}=body;let result;
        if(Object.keys(body).some(k=>!['action','id','patch','by','status','mode','expect','apply','revision','url','manual'].includes(k)))throw fault('INVALID_BODY');
        const options={expectedRevision:revision};
        if(['edit','review','approve'].includes(action)&&!Number.isSafeInteger(revision))throw fault('INVALID_BODY');
        if(apply!==undefined&&typeof apply!=='boolean'||manual!==undefined&&typeof manual!=='boolean')throw fault('INVALID_BODY');
        switch(action){
          case 'import':if(typeof inputUrl!=='string'||inputUrl.length>2000)throw fault('INVALID_BODY');result=await editor.importUrl(inputUrl,{manual});break;
          case 'checkout':result=await editor.checkout(id);break;
          case 'refresh':result=await editor.importUrl(null,{refreshId:id});break;
          case 'rules':{const d=editor.store.draft(id);result=rulesFor(d.source,editor.seed());break;}
          case 'edit':result=await editor.edit(id,patch,options);break;
          case 'review':result=await editor.preliminary(id,status,by,options);break;
          case 'approve':result=await editor.approve(id,by,options);break;
          case 'analyze':result=await editor.analyze(id,mode);break;
          case 'apply-ai':result=await editor.applyAnalysis(id,mode,{apply,expect});break;
          case 'export':result=await editor.exportDraft(id,{apply,expect});break;
          case 'rebase':result=await editor.rebase(id,{apply,expect});break;
          default:throw fault('INVALID_BODY');
        }
        return send(200,{result});
      }finally{busy=false;}
    }catch(e){return send(e.status??(/BUSY|CHANGED|CONFLICT/.test(e.message)?409:400),errorInfo(e));}
  });
  return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const {values}=parseArgs({options:{port:{type:'string',default:'4325'},catalog:{type:'string'},'state-dir':{type:'string'}}});
  const port=Number(values.port);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local port');
  const server=createAdminServer({editor:new Editor({catalog:values.catalog,stateDir:values['state-dir']})});
  server.on('error',()=>{console.error('Không thể mở Admin local. Kiểm tra cổng hoặc quyền truy cập.');process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log('Admin LOCAL ONLY: http://127.0.0.1:'+port+'/admin/resources — Export chỉ ghi catalog local, không seed/deploy.'));
}
