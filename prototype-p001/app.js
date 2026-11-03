/* Route and session-only interactions. No fetch, auth, database or AI request. */
(function(){
  'use strict';
  const H=window.H, app=document.getElementById('app');
  let toastTimer,dialogOpener;
  function parseRoute(){
    const match=location.hash.match(/^#\/(A|B|C)\/([^?]*)(?:\?(.*))?$/);
    const concept=match?match[1]:'A',page=match?(match[2]||'home'):'home',params=new URLSearchParams(match?.[3]||'');
    const query=(params.get('q')||'').slice(0,160).trim();
    let filtered=H.searchMatches(query);
    if(concept==='A'&&params.get('sort')==='rating')params.set('sort','editorial');
    for(const key of ['category','kind','price']){const value=params.get(key);if(value&&value!=='all')filtered=filtered.filter(r=>r[key]===value);}
    const platform=params.get('platform');if(platform&&platform!=='all')filtered=filtered.filter(r=>r.platforms.includes(platform));
    if(params.get('sort')==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name,'vi'));
    if(params.get('sort')==='rating'){const score=r=>r.rating?(r.rating.score*r.rating.count+4*20)/(r.rating.count+20):-1;filtered.sort((a,b)=>score(b)-score(a));}
    return {concept,page,params,query,filtered};
  }
  function basic(title,lead,content){return `${H.header('hybrid')}<main id="main" tabindex="-1" class="basic-page"><p class="eyebrow">NẾP · THƯ VIỆN SỐ</p><h1>${H.escape(title)}</h1><p class="lead">${H.escape(lead)}</p>${content}</main>${H.footer()}`;}
  function credits(){return basic('Mỗi hình ảnh đều có một nguồn.','Icon và hình sản phẩm được dùng để mô tả tài nguyên trong prototype local. Nếp không có liên kết hoặc sự bảo trợ từ các dự án này.',`<div class="credits-list"><article><img src="assets/localsend.png" alt="Icon LocalSend"><h2>LocalSend</h2><p>Icon: Tien Do Nam / LocalSend contributors. Screenshot desktop và mobile: Tien Nam Do / LocalSend contributors. Tệp ảnh giữ nguyên; bố cục hiển thị có thể thay đổi kích thước bằng CSS.</p><p>Apache-2.0. Hình có khung thiết bị/hệ điều hành của nguồn; không suy ra quyền dùng nhãn hiệu cho quảng bá khác.</p><a href="https://github.com/localsend/localsend" target="_blank" rel="noopener noreferrer">Nguồn icon</a> · <a href="https://github.com/localsend/website" target="_blank" rel="noopener noreferrer">Nguồn screenshot</a><p><a href="assets/LICENSE-LocalSend-Apache-2.0.txt">Apache-2.0 · app</a> / <a href="assets/LICENSE-LocalSend-Website-Apache-2.0.txt">Apache-2.0 · website</a></p></article><article><img src="assets/godot.svg" alt="Icon Godot"><h2>Godot Engine</h2><p>Icon: Andrea Calabro / Godot contributors. Screenshot editor TPS demo: Godot Engine contributors. CC BY 4.0; tệp nguồn không chỉnh sửa, chỉ đổi kích thước hiển thị.</p><a href="https://godotengine.org/press/" target="_blank" rel="noopener noreferrer">Press kit</a> · <a href="https://github.com/godotengine/godot-design" target="_blank" rel="noopener noreferrer">Nguồn screenshot</a><p><a href="assets/LICENSE-Godot-CC-BY-4.0.txt">License CC BY 4.0</a></p></article><article><img src="${H.state.concept==='A'?'assets/excalidraw-responsive.svg':'assets/excalidraw.svg'}" alt="Icon Excalidraw"><h2>Excalidraw</h2><p>Icon favicon và artwork từ Excalidraw contributors, kho chính thức theo MIT. Artwork giới thiệu được ghi nhãn riêng, không gọi là screenshot. ${H.state.concept==='A'?'Icon A thêm viewBox để scale responsive; giữ nguyên đường nét và màu, bản nguồn vẫn lưu kèm. Artwork không chỉnh sửa.':'Tệp nguồn không chỉnh sửa.'}</p><a href="https://github.com/excalidraw/excalidraw" target="_blank" rel="noopener noreferrer">Kho nguồn</a><p><a href="assets/LICENSE-Excalidraw-MIT.txt">License MIT và copyright</a></p></article>${H.state.concept==='A'?`<article><h2>Noto Sans</h2><p>Copyright 2022 The Noto Project Authors. Font Latin và tiếng Việt tự host, normal 400–700, SIL Open Font License 1.1. Không cài font vào hệ điều hành.</p><a href="https://fonts.google.com/noto/specimen/Noto+Sans" target="_blank" rel="noopener noreferrer">Nguồn chính thức</a><p><a href="assets/fonts/OFL.txt">OFL / copyright đầy đủ</a> · <a href="assets/fonts/manifest.json">Nguồn / SHA-256</a></p></article>`:''}<article><h2>Những hình nguyên bản của Nếp</h2><p>Biểu tượng thương hiệu, line icons theo công năng và sơ đồ tác vụ được tạo riêng cho prototype. Category tile không phải logo chính thức của ứng dụng. Không sử dụng hình hoặc branding Apple, Setapp hay Raycast.</p><a href="../docs/PHASE001_ASSETS.md">Báo cáo asset và các lựa chọn bị loại</a><p><a href="assets/manifest.json">Manifest nguồn / SHA-256</a></p></article></div>`);}
  function otherPage(s){
    if(s.page==='about')return basic('Một địa chỉ cho những điều hữu ích.','Nếp giúp người đọc tiếng Việt khám phá phần mềm, công cụ web, mã nguồn và tài nguyên học tập theo công việc muốn làm.',`<div class="editorial-article"><section><h2>Chọn lọc có cơ sở</h2><p>Hồ sơ cần có nguồn chính thức, mô tả công dụng, nền tảng và điều kiện sử dụng. Miễn phí không đồng nghĩa mã nguồn mở. Có trên GitHub không tự cấp quyền phân phối mọi asset.</p></section><section><h2>Đây là một vòng thiết kế</h2><p>Toàn bộ nội dung và điểm số đang là fixture UI. Chưa có tài khoản, đánh giá cộng đồng hay AI thật. Dấu lưu chỉ giữ trong phiên đang mở; đề xuất trong form không được gửi đi.</p></section><section><h2>Ý kiến của bạn giúp chọn hướng</h2><p>So sánh A/B/C bằng thanh concept. Kiểm việc tìm tài nguyên và đọc thông tin, bên cạnh cảm giác thị giác. Tên “Nếp” chưa được chốt làm thương hiệu.</p><a class="text-link" href="review.html">Mở bảng review ${H.symbol('arrow')}</a></section></div>`);
    if(s.page==='contribute')return basic('Một đường dẫn. Thêm một khả năng.','Bạn biết công cụ hữu ích cho học tập hoặc công việc? Thử luồng gửi đề xuất trong bản mẫu.',`<button class="button" type="button" data-open="contribute">Mở form đề xuất ${H.symbol('plus')}</button><p class="fixture-rating-note">Luồng demo không gửi thông tin, không lưu dữ liệu và không xuất bản. Không nhập thông tin riêng tư.</p>`);
    if(s.page==='saved'){const list=H.data.filter(r=>H.saved.has(r.id));return basic('Để dành cho lúc cần.','Các mục đã lưu chỉ tồn tại trong phiên prototype đang mở; đóng hoặc tải lại trang sẽ mất danh sách.',list.length?`<div class="cards-grid">${list.map(r=>H.card(r)).join('')}</div><button type="button" class="button secondary" data-clear-saved>Xóa dấu lưu trong phiên</button>`:`<div class="empty-state">${H.symbol('bookmark')}<h2>Chưa có tài nguyên được lưu.</h2><p>Dùng nút dấu trang trên thẻ tài nguyên để để dành một lựa chọn.</p><a class="button" href="${H.url('discover')}">Khám phá thư viện ${H.symbol('arrow')}</a></div>`);}
    if(s.page==='credits')return credits();
    if(s.page.startsWith('collection/')){const c=window.HUB_COLLECTIONS.find(c=>c.id===s.page.slice(11));if(c)return basic(c.title,c.summary,`<p class="eyebrow">${H.escape(c.label)} · ${c.ids.length} TÀI NGUYÊN MẪU</p><div class="cards-grid">${H.pick(c.ids).map(r=>H.card(r)).join('')}</div><section class="related-section">${H.sectionHead('Một nhu cầu khác?')}${H.collections()}</section>`);}
    return basic('Đường dẫn này chưa có trong thư viện.','Bạn có thể quay lại khám phá hoặc thử một từ khóa khác.',`<a class="button" href="${H.url('discover')}">Về thư viện ${H.symbol('arrow')}</a>`);
  }
  function render(focus=false,preserveScroll=false){
    const previousScroll=window.scrollY||0;
    window.HUB_SEARCH?.close(false);
    const s=parseRoute();H.state=s;
    const concept=window.Concepts[s.concept];
    let html;
    if(s.page==='home')html=concept.home(H,s);
    else if(s.page==='discover')html=concept.discover(H,s);
    else if(s.page.startsWith('detail/')){const r=H.get(s.page.slice(7));html=r?concept.detail(H,r,s):otherPage(s);}
    else html=otherPage(s);
    app.innerHTML=`<div class="concept-${s.concept.toLowerCase()}">${html}</div>`;
    document.getElementById('concept-switch').value=s.concept;
    document.title=`${s.page==='home'?'Khám phá':s.page==='discover'?'Thư viện':s.page.startsWith('detail/')?(H.get(s.page.slice(7))?.name||'Tài nguyên'):'Nếp'} · Concept ${s.concept} · ${s.concept==='A'?'P00.3':'P00.1'}`;
    syncSaves();
    const filters=document.querySelector('.a-filters');if(filters&&typeof window.matchMedia==='function')filters.open=!window.matchMedia('(max-width:600px)').matches;
    window.scrollTo(0,preserveScroll?previousScroll:0);
    if(focus)document.getElementById('main').focus({preventScroll:true});
  }
  function syncSaves(){
    document.querySelectorAll('[data-saved-count]').forEach(el=>el.textContent=H.saved.size);
    document.querySelectorAll('[data-save]').forEach(button=>{
      const id=button.dataset.save,r=H.get(id),saved=H.saved.has(id);button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',`${saved?'Bỏ lưu':'Lưu'} ${r?.name||'tài nguyên'} trong phiên`);
      if(!button.classList.contains('save-button'))button.innerHTML=`${H.symbol('bookmark')} ${saved?'Đã lưu trong phiên':'Lưu trong phiên'}`;
    });
  }
  function notify(message){const box=document.getElementById('toast');box.textContent=message;box.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.classList.remove('show'),4200);}
  function openContribution(opener){
    dialogOpener=opener;
    const dialog=document.getElementById('contribution-dialog');
    document.getElementById('contribution-status').textContent='';
    document.getElementById('contribution-form').reset();
    if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');dialog.querySelector('input').focus();}
  }
  function closeContribution(){const dialog=document.getElementById('contribution-dialog');if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');dialogOpener?.focus();}
  function updateParams(p){location.hash=H.url('discover',Object.fromEntries(p));}
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(form.matches('[data-search]')){event.preventDefault();const p=new URLSearchParams(H.state.page==='discover'?H.state.params:undefined),q=String(new FormData(form).get('q')||'').trim().slice(0,160);q?p.set('q',q):p.delete('q');p.delete('limit');window.HUB_SEARCH?.remember(q);updateParams(p);}
    if(form.matches('[data-filters]')){event.preventDefault();const p=new URLSearchParams(H.state.params);for(const [key,value] of new FormData(form)){value==='all'?p.delete(key):p.set(key,value);}p.delete('limit');updateParams(p);}
    if(form.id==='contribution-form'){
      event.preventDefault();const status=document.getElementById('contribution-status'),data=new FormData(form);status.textContent='';
      let url;try{url=new URL(String(data.get('url')||''));}catch{status.textContent='Nhập đường dẫn hợp lệ, bắt đầu bằng https://.';return;}
      if(url.protocol!=='https:'||url.username||url.password){status.textContent='Dùng URL https không chứa thông tin đăng nhập. Chưa gửi thông tin.';return;}
      const reason=String(data.get('reason')||'').trim();if(reason.length<8){status.textContent='Mô tả thêm một chút về công dụng (ít nhất 8 ký tự).';return;}
      status.textContent=`Đã tạo đề xuất minh họa cho ${url.hostname}.\nNội dung: ${reason}\nChưa gửi, lưu hoặc xuất bản thông tin nào.`;
    }
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='concept-switch'){const s=H.state;location.hash=`#/${event.target.value}/${s.page}${s.params.toString()?'?'+s.params:''}`;}
    if(event.target.matches('[data-sort]')){const p=new URLSearchParams(H.state.params);p.set('sort',event.target.value);p.delete('limit');updateParams(p);}
  });
  document.addEventListener('click',event=>{
    const target=event.target;
    if(target.closest('.skip-link')){event.preventDefault();document.getElementById('main')?.focus();return;}
    const toggle=target.closest('[data-navtoggle]');if(toggle){const nav=document.getElementById('primary-nav'),open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Đóng điều hướng':'Mở điều hướng');}
    const save=target.closest('[data-save]');if(save){const id=save.dataset.save;if(!H.get(id))return;H.saved.has(id)?H.saved.delete(id):H.saved.add(id);syncSaves();notify(`${H.saved.has(id)?'Đã lưu':'Đã bỏ lưu'} ${H.get(id).name} · chỉ trong phiên`);if(H.state.page==='saved')render();}
    if(target.closest('[data-clear-saved]')){H.saved.clear();render(true);notify('Đã xóa dấu lưu trong phiên.');}
    if(target.closest('[data-open="contribute"]'))openContribution(target.closest('button,a'));
    if(target.closest('[data-close]'))closeContribution();
    const more=target.closest('[data-more]');if(more&&H.state.concept==='A'){const p=new URLSearchParams(H.state.params);p.set('limit',more.dataset.more);updateParams(p);}
    const report=target.closest('[data-report]');if(report)notify('Báo cáo minh họa đã được ghi nhận trong giao diện. Chưa gửi thông tin.');
    const quick=target.closest('[data-quick]');if(quick){const key=quick.dataset.quick;let list=H.data;if(key==='rating')list=H.data.filter(r=>r.rating).sort((a,b)=>(b.rating.score*b.rating.count+80)/(b.rating.count+20)-(a.rating.score*a.rating.count+80)/(a.rating.count+20));else if(key==='repo'||key==='learn')list=list.filter(r=>r.kind===key);else if(key==='office')list=list.filter(r=>r.category==='Văn phòng');else list=H.pick(['localsend','excalidraw','godot','anki','powertoys','phet']);document.getElementById('quick-results').innerHTML=list.slice(0,6).map(r=>H.row(r)).join('');document.querySelectorAll('[data-quick]').forEach(b=>b.setAttribute('aria-pressed',String(b===quick)));}
    const scroll=target.closest('[data-scroll]');if(scroll){event.preventDefault();const section=scroll.dataset.scroll==='source'?document.querySelector('.source-note'):document.getElementById('detail-overview');if(section){section.setAttribute('tabindex','-1');section.scrollIntoView({behavior:'auto',block:'start'});section.focus({preventScroll:true});}}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const nav=document.getElementById('primary-nav');if(nav?.classList.contains('open')){nav.classList.remove('open');const button=document.querySelector('[data-navtoggle]');button?.setAttribute('aria-expanded','false');button?.setAttribute('aria-label','Mở điều hướng');button?.focus();}}});
  window.addEventListener('hashchange',()=>{const next=parseRoute(),keep=next.concept==='A'&&H.state.concept==='A'&&next.page==='discover'&&H.state.page==='discover'&&next.params.get('limit')!==H.state.params.get('limit')&&Number(next.params.get('limit'))>Number(H.state.params.get('limit'));render(!keep,keep);if(keep)document.querySelector('[data-more], [data-result-summary]')?.focus({preventScroll:true});});
  window.HUB_DEMO={parseRoute,render};
  render();
})();
