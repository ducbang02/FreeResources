'use strict';
const $=id=>document.getElementById(id);
let state,draft,dirty=false,busy=false;
const labels={draft:'Nháp',reviewed:'Đã duyệt sơ bộ',approved:'Đã duyệt cuối',exported:'Đã Export local',unsuitable:'Không phù hợp',pending:'Chờ đánh giá',suitable:'Phù hợp',needs_check:'Cần kiểm tra thêm'};
function el(tag,text,attrs={}){const e=document.createElement(tag);if(text!==null)e.textContent=text;for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
function notice(text,kind='info'){const n=$('notice');n.hidden=false;n.dataset.kind=kind;n.textContent=text;n.setAttribute('role',kind==='error'?'alert':'status');if(kind==='error')n.focus();}
async function api(path,body){const response=await fetch('/admin/api/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json','X-Admin-CSRF':state.csrf}:{},body:body?JSON.stringify(body):undefined});let data;try{data=await response.json();}catch{throw Error('Server không trả dữ liệu hợp lệ. Hãy kiểm tra Admin local còn chạy và tải lại.');}if(!response.ok)throw Error((data.code?data.code+' · ':'')+(data.message||'Không thể thực hiện.'));return data;}
const act=body=>api('action',body).then(r=>r.result);
function availability(){if(!draft||!state)return;$('quick-ai').disabled=busy||!state.ai.ready;$('deep-ai').disabled=busy||!state.ai.ready||draft.preliminary.status!=='suitable';}
async function task(label,fn,{saved=true}={}){
 if(busy)return;if(saved&&dirty){notice('Bạn có thay đổi chưa lưu. Lưu trước khi thực hiện thao tác này.','error');return;}
 busy=true;const controls=[...document.querySelectorAll('button,input,select,textarea')].filter(e=>!e.closest('dialog')).map(e=>[e,e.disabled]);controls.forEach(([e])=>e.disabled=true);document.querySelector('main').setAttribute('aria-busy','true');notice(label);
 try{await fn();}catch(e){notice(e.message||'Kết nối bị gián đoạn. Nội dung chưa lưu vẫn ở biểu mẫu; kiểm tra rồi thử lại.','error');}
 finally{busy=false;controls.forEach(([e,disabled])=>{if(e.isConnected)e.disabled=disabled;});document.querySelector('main').removeAttribute('aria-busy');availability();}
}
async function loadState(){state=await api('state');renderList();}
function renderList(){
 const query=$('list-search').value.toLocaleLowerCase('vi'),status=$('list-filter').value,list=$('draft-list');list.replaceChildren();
 const items=state.drafts.filter(d=>(!status||d.status===status)&&(!query||(d.title+' '+d.url).toLocaleLowerCase('vi').includes(query)));
 for(const d of items){const a=el('a',null,{href:'/admin/resources/'+d.id,class:'draft-card'}),icon=el('span',d.kind==='github'?'⌘':'↗',{class:'resource-icon','aria-hidden':'true'}),copy=el('span',null,{class:'draft-copy'});copy.append(el('strong',d.title),el('small',(d.kind==='github'?'GitHub':'Website')+' · '+d.url));a.append(icon,copy,el('span',labels[d.status]||d.status,{class:'pill'}),el('time',new Date(d.updatedAt).toLocaleDateString('vi-VN'),{datetime:d.updatedAt}));list.append(a);}
 if(!items.length){const box=el('div',null,{class:'empty'});box.append(el('strong',state.drafts.length?'Chưa tìm thấy nháp phù hợp':'Bắt đầu từ một đường dẫn'),el('p',state.drafts.length?'Thử từ khóa hoặc bộ lọc khác.':'Nhập GitHub hoặc website ở phía trên để tạo nháp đầu tiên.'));list.append(box);}
 const value=$('catalog-item').value;$('catalog-item').replaceChildren(...state.catalog.map(r=>el('option',r.title,{value:r.id})));if(state.catalog.some(r=>r.id===value))$('catalog-item').value=value;
}
function changed(){dirty=true;$('save-state').textContent='Chưa lưu';}
function field(parent,name,label,value,{kind='input',wide=false,options,max}={}){
 const box=el('label',label,{class:wide?'wide':''}),input=el(kind,null,{name});if(kind==='select'){for(const [v,l] of options)input.append(el('option',l,{value:v}));}else if(max)input.maxLength=max;
 input.value=value??'';box.append(input);parent.append(box);return input;
}
function choices(parent,name,label,options,selected){const box=el('fieldset',null,{class:'choices wide'}),grid=el('div',null,{class:'choices-grid'});box.append(el('legend',label),grid);for(const [value,text]of options){const label=el('label',null,{class:'check'}),input=el('input',null,{type:'checkbox',name,value});input.checked=selected.includes(value);label.append(input,document.createTextNode(text));grid.append(label);}parent.append(box);}
const sourceFields=['summary','description','canonicalUrl','license','pricing','platforms','usageRights','requirements'];
const sourceNames={summary:'Công dụng',description:'Mô tả',canonicalUrl:'URL chính thức',license:'Giấy phép',pricing:'Giá / Free',platforms:'Nền tảng',usageRights:'Quyền sử dụng',requirements:'Yêu cầu hệ thống'};
function sourceRow(source={url:'',label:'',fields:[]}){
 const row=el('div',null,{class:'source-row'});field(row,'source-url','URL nguồn',source.url);field(row,'source-label','Tên nguồn',source.label,{max:120});choices(row,'source-field','Trường đã đối chiếu',sourceFields.map(x=>[x,sourceNames[x]]),source.fields);
 const remove=el('button','Bỏ nguồn',{type:'button'});remove.addEventListener('click',()=>{row.remove();changed();});row.append(remove);$('verified-sources').append(row);
}
function evidenceRow(item={url:'',content:''}){const row=el('div',null,{class:'source-row'});field(row,'evidence-url','URL nguồn công khai',item.url);field(row,'evidence-content','Trích đoạn',item.content,{kind:'textarea',max:16000});const remove=el('button','Bỏ trích đoạn',{type:'button'});remove.addEventListener('click',()=>{row.remove();changed();});row.append(remove);$('manual-evidence').append(row);}
function renderDraft(){
 $('list-view').hidden=true;$('detail-view').hidden=false;$('page-title').textContent=draft.editorial.title||draft.source.metadata.title||'Bản nháp mới';$('page-description').textContent='Biên tập rõ ràng. Đối chiếu nguồn. Duyệt trước khi Export.';
 const d=state.drafts.find(d=>d.id===draft.id);$('detail-meta').replaceChildren(el('span',labels[d?.status]||'Nháp',{class:'pill'}),el('span',draft.identity.kind==='github'?'GitHub':'Website',{class:'pill'}));
 const source=el('a',draft.identity.canonicalUrl,{href:draft.identity.canonicalUrl,target:'_blank',rel:'noopener noreferrer'});$('detail-meta').append(source);
 const e=$('editor-fields');e.replaceChildren();const v=draft.editorial;
 field(e,'title','Tên tài nguyên',v.title,{wide:true,max:120});field(e,'summary','Công dụng ngắn',v.summary,{wide:true,max:240});field(e,'description','Mô tả tiếng Việt',v.description,{kind:'textarea',wide:true,max:2400});
 field(e,'type','Loại tài nguyên',v.type,{kind:'select',options:state.taxonomy.types.map(t=>[t.slug,t.name])});field(e,'slug','Đường dẫn ngắn (slug)',v.slug||'',{max:90});
 choices(e,'categories','Chuyên mục',state.taxonomy.categories.map(t=>[t.slug,t.name]),v.categories);choices(e,'tags','Chủ đề',state.taxonomy.tags.map(t=>[t.slug,t.name]),v.tags);
 field(e,'platforms','Nền tảng hỗ trợ, cách nhau bằng dấu phẩy',v.platforms.join(', '),{wide:true});field(e,'license','Giấy phép (để trống nếu chưa rõ)',v.license,{max:240});field(e,'pricing','Giá / điều kiện Free',v.pricing,{max:240});
 const p=$('policy-fields'),policy=draft.policy;p.replaceChildren();choices(p,'groups','Nhóm tài nguyên',[['free_apps','Ứng dụng/công cụ miễn phí'],['free_resources','Tài nguyên miễn phí'],['github','GitHub']],policy.groups);
 field(p,'freeModel','Mô hình sử dụng',policy.freeModel,{kind:'select',options:[['unknown','Chưa xác minh'],['freeware','Miễn phí sử dụng'],['open_source','Mã nguồn mở'],['freemium','Freemium, có phần miễn phí'],['free_resource','Tài nguyên miễn phí'],['trial','Chỉ dùng thử'],['paid','Trả phí']]});
 field(p,'licenseStatus','Kiểm chứng giấy phép',policy.licenseStatus,{kind:'select',options:[['unknown','Chưa rõ'],['author_claim','Tác giả công bố'],['verified','Đã đối chiếu nguồn']]});
 const verified=el('label',null,{class:'check wide'}),input=el('input',null,{type:'checkbox',name:'officialSourceVerified'});input.checked=policy.officialSourceVerified;verified.append(input,document.createTextNode('Tôi đã đối chiếu đây là nguồn chính thức'));p.append(verified);
 field(p,'freeEvidenceUrl','URL chứng minh điều kiện Free',policy.freeEvidenceUrl,{wide:true});field(p,'freeLimitations','Giới hạn của phần miễn phí',policy.freeLimitations,{kind:'textarea',wide:true,max:1000});field(p,'usageRights','Quyền sử dụng tài nguyên (khi cần)',policy.usageRights,{kind:'textarea',wide:true,max:1000});
 $('verified-sources').replaceChildren();draft.verifiedSources.forEach(sourceRow);$('manual-evidence').replaceChildren();(draft.manualEvidence||[]).forEach(evidenceRow);
 $('metadata').textContent=JSON.stringify(draft.source.metadata,null,2);$('source-health').textContent='Thu thập: '+draft.lastRefresh.state+(draft.lastRefresh.issues?.length?' · '+draft.lastRefresh.issues.join(', '):'');$('evidence').replaceChildren();
 for(const item of draft.source.evidence){const section=el('details'),summary=el('summary',item.id),pre=el('pre',item.content);section.append(summary,pre);$('evidence').append(section);}
 $('rules-result').textContent=JSON.stringify(draft.rules??{reason:'Chưa có quy tắc phù hợp; cần chọn thủ công.'},null,2);
 $('ai-quota').textContent=state.usage.used+'/'+state.usage.limit+' lượt';$('ai-state').textContent=state.ai.ready?'Sẵn sàng · '+state.ai.model:'Chưa sẵn sàng · '+(state.ai.reason||'Cần cấu hình');$('ai-guidance').textContent=state.ai.ready?'Chỉ chạy khi bạn bấm. Gợi ý không tự sửa nháp.':'Key/model và xác nhận Free Tier đặt trên server theo docs/PHASE02_CLI.md. Không nhập key vào trình duyệt.';
 $('ai-results').replaceChildren();for(const mode of ['quick','deep']){const a=draft.analyses[mode];if(!a)continue;const box=el('details'),summary=el('summary',(mode==='quick'?'Quick':'Deep')+' · '+a.status+(a.cacheHit?' · cache':'')),pre=el('pre',JSON.stringify(a.result??{error:a.errorCode},null,2));box.append(summary,pre);if(a.status==='complete'){const button=el('button','Xem gợi ý trước khi áp dụng',{type:'button'});button.addEventListener('click',()=>plan('apply-ai',{mode}));box.append(button);}$('ai-results').append(box);}
 $('review-state').textContent='Sơ bộ: '+(labels[draft.preliminary.status]||draft.preliminary.status)+' · Duyệt cuối: '+(draft.finalReview?'Có, bởi '+draft.finalReview.by:'Chưa có');$('review-status').value=draft.preliminary.status==='pending'?'needs_check':draft.preliminary.status;
 $('save-state').textContent='Đã tải · phiên bản '+draft.revision;dirty=false;availability();
}
async function openDraft(id,{push=false}={}){if(draft?.id!==id)$('export-receipt').hidden=true;draft=await api('draft/'+id);await loadState();renderDraft();if(push)history.pushState(null,'','/admin/resources/'+id);}
async function route(){const id=location.pathname.split('/')[3];await loadState();if(id)await openDraft(id);else{draft=null;dirty=false;$('list-view').hidden=false;$('detail-view').hidden=true;$('page-title').textContent='Tài nguyên của bạn';$('page-description').textContent='Từ một đường dẫn, đến nội dung đáng chia sẻ.';}}
function values(name){return[...$('edit-form').querySelectorAll('input[name="'+name+'"]:checked')].map(e=>e.value);}
function collectPatch(){
 const form=$('edit-form'),get=n=>form.elements.namedItem(n).value.trim(),editorial={};
 for(const n of ['title','summary','description','type','pricing','license'])editorial[n]=get(n)||(['license','pricing'].includes(n)?null:'');if(get('slug'))editorial.slug=get('slug');
 editorial.categories=values('categories');editorial.tags=values('tags');editorial.platforms=get('platforms').split(',').map(x=>x.trim()).filter(Boolean);
 const policy={groups:values('groups'),freeModel:get('freeModel'),licenseStatus:get('licenseStatus'),officialSourceVerified:form.elements.namedItem('officialSourceVerified').checked,freeEvidenceUrl:get('freeEvidenceUrl'),freeLimitations:get('freeLimitations'),usageRights:get('usageRights')};
 const verifiedSources=[...$('verified-sources').children].map(row=>({url:row.querySelector('[name=source-url]').value.trim(),label:row.querySelector('[name=source-label]').value.trim(),fields:[...row.querySelectorAll('[name=source-field]:checked')].map(e=>e.value)}));
 const manualEvidence=[...$('manual-evidence').children].map(row=>({url:row.querySelector('[name=evidence-url]').value.trim(),content:row.querySelector('[name=evidence-content]').value}));
 return{editorial,policy,verifiedSources,manualEvidence};
}
async function receive(result){
 if(result.duplicate){const match=result.matches[0];if(match.kind==='draft')await openDraft(match.id,{push:true});else{const d=await act({action:'checkout',id:match.id});await openDraft(d.id,{push:true});}notice('Đã nhận diện tài nguyên có sẵn, không tạo trùng.','success');return;}
 const manual=result.source?.issues?.includes('manual:metadata_not_fetched'),incomplete=!manual&&(result.lastRefresh?.state==='failed'||!result.source?.evidence?.length);
 await openDraft(result.id,{push:true});notice(incomplete?'Đã giữ nháp nhưng chưa lấy được nguồn. Xem dữ liệu nguồn và dùng “Lấy lại” khi đã xử lý lỗi.':manual?'Đã tạo nháp thủ công. Bổ sung nội dung và nguồn đã đối chiếu trước khi duyệt.':'Đã tạo/mở nháp. Nguồn và nội dung biên tập được giữ riêng.',incomplete?'error':'success');
}
async function confirmPlan(title,description,data){const dialog=$('confirm-dialog');$('confirm-title').textContent=title;$('confirm-description').textContent=description;$('confirm-data').textContent=JSON.stringify(data,null,2);dialog.returnValue='cancel';dialog.showModal();return new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='apply'),{once:true}));}
function plan(action,extra={}){task('Đang chuẩn bị bản xem trước…',async()=>{const id=draft.id,body={action,id,...extra},p=await act(body);if(await confirmPlan(action==='export'?'Xác nhận Export local':action==='rebase'?'Hợp nhất baseline':'Áp dụng gợi ý AI',action==='export'?'Chỉ ghi catalog JSON trên máy này. Website/D1 không tự cập nhật.':action==='rebase'?'So sánh previousBaseline/currentGit/yourEditorial. Chỉ xác nhận sau khi giữ các sửa cần thiết. Phải duyệt lại.':'Chỉ áp dụng các trường bên dưới. Nội dung sẽ cần duyệt lại.',p)){
 const r=await act({...body,apply:true,expect:p.planId});await openDraft(id);notice('Đã xác nhận '+(action==='export'?'Export local. Không seed/deploy.':action==='rebase'?'baseline mới; sửa tay được giữ và cần duyệt lại.':'gợi ý AI. Hãy đối chiếu và duyệt lại.'),'success');if(action==='export'){$('export-receipt').hidden=false;$('export-receipt-data').textContent=JSON.stringify(r,null,2);}
 }else notice('Đã hủy, không ghi thay đổi.');});}
$('import-form').addEventListener('submit',event=>{event.preventDefault();task('Đang lấy thông tin nguồn…',async()=>receive(await act({action:'import',url:$('import-url').value.trim(),manual:$('import-manual').checked})));});
$('checkout-form').addEventListener('submit',event=>{event.preventDefault();task('Đang mở nháp…',async()=>receive(await act({action:'checkout',id:$('catalog-item').value})));});
$('edit-form').addEventListener('input',changed);$('edit-form').addEventListener('change',changed);
$('edit-form').addEventListener('submit',event=>{event.preventDefault();const patch=collectPatch();task('Đang lưu nội dung…',async()=>{await act({action:'edit',id:draft.id,revision:draft.revision,patch});await openDraft(draft.id);notice('Đã lưu. Mọi thay đổi cần được duyệt lại trước Export.','success');},{saved:false});});
$('add-source').onclick=()=>{sourceRow();changed();};$('add-evidence').onclick=()=>{evidenceRow();changed();};
$('run-rules').onclick=()=>task('Đang kiểm tra Rules…',async()=>{$('rules-result').textContent=JSON.stringify(await act({action:'rules',id:draft.id}),null,2);notice('Rules hoàn tất, không gọi AI hoặc ghi đè nội dung.','success');});
$('refresh-source').onclick=()=>task('Đang cập nhật nguồn…',async()=>{const r=await act({action:'refresh',id:draft.id});await openDraft(draft.id);const incomplete=r.lastRefresh.state==='failed'||!r.source?.evidence?.length;notice(incomplete?'Chưa lấy được nguồn. Nháp/sửa tay vẫn được giữ.':'Đã cập nhật nguồn, giữ nội dung sửa tay.',incomplete?'error':'success');});
for(const mode of ['quick','deep'])$(mode+'-ai').onclick=()=>task('Đang phân tích '+mode+'… Không tự retry.',async()=>{const r=await act({action:'analyze',id:draft.id,mode});await openDraft(draft.id);notice(r.status==='complete'?'Đã nhận gợi ý '+mode+(r.cacheHit?' từ cache.':'.')+' Nội dung chưa được tự áp dụng.':'AI chưa hoàn tất: '+(r.analysis?.errorCode||r.status),r.status==='complete'?'success':'error');});
function reviewer(){const by=$('reviewer').value.trim();if(!by)throw Error('Nhập tên người duyệt trước khi xác nhận.');return by;}
$('review').onclick=()=>task('Đang lưu đánh giá…',async()=>{await act({action:'review',id:draft.id,revision:draft.revision,status:$('review-status').value,by:reviewer()});await openDraft(draft.id);notice('Đã lưu đánh giá sơ bộ; chưa Export.','success');});
$('approve').onclick=()=>task('Đang kiểm tra điều kiện duyệt cuối…',async()=>{await act({action:'approve',id:draft.id,revision:draft.revision,by:reviewer()});await openDraft(draft.id);notice('Đã duyệt cuối. Xem bản Export để xác nhận ghi local.','success');});
$('export').onclick=()=>plan('export');$('rebase').onclick=()=>plan('rebase');
$('list-search').oninput=renderList;$('list-filter').onchange=renderList;
$('reload').onclick=()=>{if(!dirty||confirm('Bỏ nội dung chưa lưu và tải lại?'))task('Đang tải…',async()=>{await route();notice('Đã tải dữ liệu mới nhất.','success');},{saved:false});};
document.addEventListener('click',event=>{const a=event.target.closest('a');if(!a||!a.getAttribute('href')?.startsWith('/admin/resources')||event.ctrlKey||event.metaKey)return;event.preventDefault();if(busy)return;if(dirty&&!confirm('Bỏ nội dung chưa lưu và chuyển trang?'))return;history.pushState(null,'',a.getAttribute('href'));task('Đang mở…',async()=>{await route();$('notice').hidden=true;window.scrollTo(0,0);},{saved:false});});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
window.addEventListener('popstate',()=>{if(dirty&&!confirm('Bỏ nội dung chưa lưu và chuyển trang?')){history.pushState(null,'','/admin/resources/'+draft.id);return;}task('Đang mở…',route,{saved:false});});
task('Đang mở không gian biên tập…',async()=>{await route();$('notice').hidden=true;},{saved:false});
