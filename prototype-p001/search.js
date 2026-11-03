/* A-only local search preview. Native dialog, bounded results, no network or persistence. */
(function(){
  'use strict';
  const H=window.H,dialog=document.getElementById('search-dialog'),input=document.getElementById('search-preview-input'),content=document.getElementById('search-preview-content'),status=document.getElementById('search-preview-status'),allLink=document.getElementById('search-all-link');
  let opener,suppressedFocus,timer,revision=0,failNext=false;
  const history=[];
  function setState(name,message){dialog.dataset.state=name;status.textContent=message;content.setAttribute('aria-busy',String(name==='loading'));}
  function remember(query){const q=query.trim().slice(0,160);if(!q)return;const index=history.indexOf(q);if(index>=0)history.splice(index,1);history.unshift(q);history.splice(3);}
  function result(r){return `<a class="search-preview-result" data-preview-result href="${H.url('detail/'+r.id)}">${H.icon(r,'sm')}<span><strong>${H.escape(r.name)}</strong><small>${H.escape(r.summary)}</small></span>${H.symbol('arrow')}</a>`;}
  function defaults(){
    setState('default','');
    allLink.href=H.url('discover');allLink.innerHTML=`Xem tất cả tài nguyên ${H.symbol('arrow')}`;
    content.innerHTML=`${history.length?`<section class="search-history"><div><h3>Vừa tìm trong phiên</h3><button type="button" data-clear-search-history>Xóa</button></div><div class="search-chips">${history.map(q=>`<button type="button" data-query="${H.escape(q)}">${H.escape(q)}</button>`).join('')}</div></section>`:''}<div class="search-suggestion-columns"><section><h3>Bắt đầu bằng một việc</h3><div class="search-intents">${['chuyển file','vẽ sơ đồ','học lập trình'].map(q=>`<button type="button" data-query="${q}">${H.symbol('search')}${q}${H.symbol('arrow')}</button>`).join('')}</div></section><section><h3>Khám phá theo nhu cầu</h3><div class="search-chips">${['Học tập','Văn phòng','Sáng tạo'].map(category=>`<a href="${H.url('discover',{category})}">${category}</a>`).join('')}</div></section></div><section class="search-featured"><h3>Hai công cụ để bắt đầu</h3>${H.pick(['localsend','excalidraw']).map(result).join('')}</section>`;
  }
  function update(){
    clearTimeout(timer);const current=++revision,query=input.value.trim().slice(0,160);
    if(!query){defaults();return;}
    setState('loading','Đang tìm trong dữ liệu mẫu…');
    allLink.href=H.url('discover',{q:query});allLink.textContent='Xem kết quả đầy đủ →';
    content.innerHTML='<div class="search-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>';
    timer=setTimeout(()=>{
      if(current!==revision||!dialog.open)return;
      if(failNext){failNext=false;setState('error','Chưa thể hiển thị gợi ý.');content.innerHTML=`<div class="search-feedback"><h3>Thử lại một lần nữa?</h3><p>Đây là trạng thái lỗi mô phỏng của prototype.</p><button type="button" class="button secondary" data-search-retry>Thử lại ${H.symbol('arrow')}</button></div>`;return;}
      const matches=H.searchMatches(query);
      allLink.innerHTML=`Xem tất cả ${matches.length} kết quả ${H.symbol('arrow')}`;
      if(!matches.length){setState('empty','Không có kết quả phù hợp trong dữ liệu mẫu.');content.innerHTML='<div class="search-feedback"><h3>Thử một cách tìm khác.</h3><p>Dùng từ khóa ngắn hơn, như “file” hoặc “sơ đồ”.</p><button type="button" class="button secondary" data-query="">Xem lại gợi ý</button></div>';return;}
      setState('results',`Xem trước ${Math.min(4,matches.length)} / ${matches.length} kết quả.`);
      content.innerHTML=`<div class="search-preview-results">${matches.slice(0,4).map(result).join('')}</div>`;
    },160);
  }
  function open(source){
    if(H.state.concept!=='A'||dialog.open||typeof dialog.showModal!=='function')return;
    opener=source;input.value=source?.value||'';failNext=failNext||H.state.params.get('qa')==='search-error';
    document.getElementById('primary-nav')?.classList.remove('open');
    const menu=document.querySelector('[data-navtoggle]');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Mở điều hướng');
    dialog.showModal();document.body.classList.add('search-open');input.focus();input.setSelectionRange(input.value.length,input.value.length);update();
  }
  function close(restore=true){
    clearTimeout(timer);revision++;
    if(!dialog.open)return;
    suppressedFocus=opener;
    dialog.close();document.body.classList.remove('search-open');
    if(restore&&opener?.isConnected)opener.focus({preventScroll:true});
    setTimeout(()=>{suppressedFocus=null;},0);
  }
  function submit(query){remember(query);close(false);location.hash=H.url('discover',query.trim()?{q:query.trim().slice(0,160)}:{});}
  document.addEventListener('focusin',event=>{
    if(event.target===suppressedFocus){suppressedFocus=null;return;}
    if(event.target.matches('[data-search-trigger]'))open(event.target);
  });
  document.addEventListener('click',event=>{
    const target=event.target;
    const trigger=target.closest('.hub-search');if(trigger&&H.state.concept==='A'&&!target.closest('button'))open(trigger.querySelector('input'));
    if(target.closest('[data-search-close]'))close();
    const query=target.closest('[data-query]');if(query){input.value=query.dataset.query;input.focus();update();}
    if(target.closest('[data-search-retry]'))update();
    if(target.closest('[data-clear-search-history]')){history.length=0;defaults();input.focus();}
    if(dialog.open&&target.closest('#search-dialog a')){remember(input.value);close(false);}
    if(target===dialog)close();
  });
  input.addEventListener('input',update);
  document.getElementById('search-preview-form').addEventListener('submit',event=>{event.preventDefault();submit(input.value);});
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
    if(event.key!=='Tab')return;
    const focusable=[...dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')].filter(el=>el.getClientRects().length);
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  });
  window.HUB_SEARCH={open,close,remember};
  // Explicit QA seam: a single simulated local failure, never a production request.
  window.HUB_SEARCH_TEST={failNext(){failNext=true;},get state(){return dialog.dataset.state;}};
})();
