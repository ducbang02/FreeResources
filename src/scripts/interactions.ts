// Native progressive enhancement: ordinary GET forms remain usable without JavaScript.
export {};
const searchDialog = document.querySelector<HTMLDialogElement>('#search-dialog');
const input = document.querySelector<HTMLInputElement>('#search-preview-input');
const content = document.querySelector<HTMLElement>('#search-preview-content');
const status = document.querySelector<HTMLElement>('#search-preview-status');
const allLink = document.querySelector<HTMLAnchorElement>('#search-all-link');
const contribution = document.querySelector<HTMLDialogElement>('#contribution-dialog');
const nav = document.querySelector<HTMLElement>('#primary-nav');
const menu = document.querySelector<HTMLButtonElement>('[data-navtoggle]');
let opener: HTMLElement | null = null, contributionOpener: HTMLElement | null = null, suppressedFocus: HTMLElement | null = null;
let timer: ReturnType<typeof setTimeout> | undefined, controller: AbortController | undefined, revision = 0;
const recent: string[] = [];
type PreviewItem = { slug:string; title:string; summary:string; icon:string|null };
type Category = { slug:string; name:string };

function element<K extends keyof HTMLElementTagNameMap>(tag:K, className='', text=''):HTMLElementTagNameMap[K] {
  const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;
}
// Workers HTMLRewriter merges an incompatible Element.append signature into server types.
// appendChild keeps this browser module on the native DOM Node contract.
function appendNodes(parent:Node,...children:Node[]){for(const child of children)parent.appendChild(child);}
function arrow(){const span=element('span','','→');span.setAttribute('aria-hidden','true');return span;}
function closeMenu(restore=false){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Mở điều hướng');if(restore)menu?.focus();}
function exploreUrl(query:string){
  const url=new URL('/explore',location.origin),form=opener?.closest('form');
  for(const name of ['category','type','platform','sort','view']){const field=form?.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`);if(field?.value)url.searchParams.set(name,field.value);}
  if(query.trim())url.searchParams.set('q',query.trim().slice(0,160));return url.pathname+url.search;
}
function remember(query:string){const q=query.trim().slice(0,160);if(!q)return;const index=recent.indexOf(q);if(index>=0)recent.splice(index,1);recent.unshift(q);recent.splice(3);}
function setState(state:string,message:string){if(!searchDialog||!content||!status)return;searchDialog.dataset.state=state;status.textContent=message;content.setAttribute('aria-busy',String(state==='loading'));}
function closeSearch(restore=true){
  clearTimeout(timer);controller?.abort();revision++;
  if(!searchDialog?.open)return;
  suppressedFocus=opener;searchDialog.close();document.body.classList.remove('search-open');
  if(restore&&opener?.isConnected)opener.focus({preventScroll:true});
  setTimeout(()=>{suppressedFocus=null;},0);
}
function openSearch(source:HTMLElement){
  if(!searchDialog||!input||searchDialog.open)return;
  opener=source;input.value=source instanceof HTMLInputElement?source.value:'';closeMenu();
  searchDialog.showModal();document.body.classList.add('search-open');input.focus();input.setSelectionRange(input.value.length,input.value.length);update(0);
}
function queryButton(query:string){const button=element('button','',query);button.type='button';button.dataset.query=query;return button;}
function result(item:PreviewItem){
  const link=element('a','search-preview-result');link.href='/resources/'+encodeURIComponent(item.slug);
  const icon=element('span','app-icon icon-sm');
  if(item.icon&&/^\/assets\/[a-zA-Z0-9_./-]+$/.test(item.icon)&&!item.icon.split('/').includes('..')){const image=element('img');image.src=item.icon;image.alt='';image.width=image.height=40;appendNodes(icon,image);}else{icon.textContent='◇';icon.setAttribute('aria-hidden','true');}
  const copy=element('span');appendNodes(copy,element('strong','',item.title),element('small','',item.summary));appendNodes(link,icon,copy,arrow());return link;
}
function feedback(title:string,message:string,retry=false){
  if(!content)return;const box=element('div','search-feedback');appendNodes(box,element('h3','',title),element('p','',message));
  const button=element('button','button secondary',retry?'Thử lại':'Xem lại gợi ý');button.type='button';if(retry)button.dataset.searchRetry='';else button.dataset.query='';appendNodes(box,button);content.replaceChildren(box);
}
function renderDefault(items:PreviewItem[],categories:Category[]){
  if(!content)return;content.replaceChildren();
  if(recent.length){const section=element('section','search-history'),heading=element('div'),clear=element('button','','Xóa');clear.type='button';clear.dataset.clearSearchHistory='';appendNodes(heading,element('h3','','Vừa tìm trong phiên'),clear);const chips=element('div','search-chips');appendNodes(chips,...recent.map(queryButton));appendNodes(section,heading,chips);appendNodes(content,section);}
  const columns=element('div','search-suggestion-columns'),intents=element('section'),queries=element('div','search-intents');appendNodes(intents,element('h3','','Bắt đầu bằng một việc'));appendNodes(queries,...['chuyển file','vẽ sơ đồ','học lập trình'].map(queryButton));appendNodes(intents,queries);appendNodes(columns,intents);
  if(categories.length){const section=element('section'),chips=element('div','search-chips');appendNodes(section,element('h3','','Khám phá theo nhu cầu'));for(const category of categories.slice(0,3)){const a=element('a','',category.name);a.href='/explore?'+new URLSearchParams({category:category.slug});appendNodes(chips,a);}appendNodes(section,chips);appendNodes(columns,section);}
  appendNodes(content,columns);if(items.length){const section=element('section','search-featured');appendNodes(section,element('h3','','Công cụ để bắt đầu'),...items.slice(0,2).map(result));appendNodes(content,section);}
}
function parsePayload(value:unknown):{items:PreviewItem[];categories:Category[]}{
  if(!value||typeof value!=='object')throw Error('Invalid search response');const payload=value as Record<string,unknown>;
  if(!Array.isArray(payload.items))throw Error('Invalid search results');
  const items=payload.items.slice(0,4).map((value:unknown)=>{if(!value||typeof value!=='object')throw Error('Invalid result');const r=value as Record<string,unknown>;if(typeof r.slug!=='string'||!/^[a-z0-9_-]{1,90}$/.test(r.slug)||typeof r.title!=='string'||typeof r.summary!=='string'||(r.icon!==null&&typeof r.icon!=='string'))throw Error('Invalid result');return {slug:r.slug,title:r.title.slice(0,120),summary:r.summary.slice(0,240),icon:r.icon};});
  const categories:Category[]=[];if(Array.isArray(payload.categories))for(const value of payload.categories.slice(0,3)){if(!value||typeof value!=='object')continue;const c=value as Record<string,unknown>;if(typeof c.slug==='string'&&/^[a-z0-9_-]{1,90}$/.test(c.slug)&&typeof c.name==='string')categories.push({slug:c.slug,name:c.name.slice(0,80)});}
  return {items,categories};
}
function update(delay=160){
  if(!input||!content||!allLink)return;clearTimeout(timer);controller?.abort();const current=++revision,query=input.value.trim().slice(0,160);allLink.href=exploreUrl(query);allLink.replaceChildren(document.createTextNode(query?'Xem kết quả đầy đủ ':'Xem tất cả tài nguyên '),arrow());
  setState('loading','Đang tìm tài nguyên…');const skeleton=element('div','search-skeleton');skeleton.setAttribute('aria-hidden','true');appendNodes(skeleton,element('span'),element('span'),element('span'));content.replaceChildren(skeleton);
  timer=setTimeout(async()=>{
    const requestController=new AbortController();controller=requestController;let timedOut=false;
    const timeout=setTimeout(()=>{timedOut=true;requestController.abort();},10000);
    try{
      const response=await fetch('/api/search?'+new URLSearchParams({q:query}),{signal:requestController.signal,headers:{Accept:'application/json'}});if(!response.ok)throw Error('Search unavailable');const payload=parsePayload(await response.json());
      if(current!==revision||!searchDialog?.open)return;
      if(!query){setState('default','');renderDefault(payload.items,payload.categories);}
      else if(!payload.items.length){setState('empty','Không có kết quả phù hợp.');feedback('Thử một cách tìm khác.','Dùng từ khóa ngắn hơn hoặc mở trang khám phá để lọc tài nguyên.');}
      else{setState('results',`Xem trước ${payload.items.length} kết quả.`);const results=element('div','search-preview-results');appendNodes(results,...payload.items.map(result));content?.replaceChildren(results);}
    }catch(error){if(current!==revision||!searchDialog?.open||(error instanceof DOMException&&error.name==='AbortError'&&!timedOut))return;setState('error','Chưa thể tải gợi ý.');feedback('Thử lại một lần nữa?','Kết nối có thể đang gián đoạn. Bạn vẫn có thể mở trang khám phá.',true);}
    finally{clearTimeout(timeout);}
  },delay);
}
function trapTab(event:KeyboardEvent,dialog:HTMLDialogElement){
  if(event.key!=='Tab')return;const focusable=[...dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled])')].filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
}
document.addEventListener('focusin',event=>{const target=event.target;if(target===suppressedFocus){suppressedFocus=null;return;}if(target instanceof HTMLElement&&target.matches('[data-search-trigger]'))openSearch(target);});
document.addEventListener('click',event=>{
  if(!(event.target instanceof Element))return;const target=event.target;
  const mobile=target.closest<HTMLElement>('[data-mobile-search]');if(mobile){event.preventDefault();openSearch(mobile);}
  const form=target.closest<HTMLFormElement>('.hub-search');if(form&&!target.closest('button')){const source=form.querySelector<HTMLInputElement>('[data-search-trigger]');if(source)openSearch(source);}
  if(target.closest('[data-search-close]'))closeSearch();
  const query=target.closest<HTMLElement>('[data-query]');if(query&&input){input.value=query.dataset.query||'';input.focus();update();}
  if(target.closest('[data-search-retry]'))update(0);
  if(target.closest('[data-clear-search-history]')){recent.length=0;update(0);input?.focus();}
  if(searchDialog?.open&&target.closest('#search-dialog a')){remember(input?.value||'');closeSearch(false);}
  if(target===searchDialog)closeSearch();
  if(target.closest('[data-navtoggle]')){const open=menu?.getAttribute('aria-expanded')!=='true';nav?.classList.toggle('open',open);menu?.setAttribute('aria-expanded',String(open));menu?.setAttribute('aria-label',open?'Đóng điều hướng':'Mở điều hướng');}
  if(target.closest('#primary-nav a'))closeMenu();
  const contribute=target.closest<HTMLElement>('[data-contribute]');if(contribute&&contribution){contributionOpener=contribute;closeMenu();contribution.showModal();}
  if(target.closest('[data-contribute-close]')||target===contribution){contribution?.close();contributionOpener?.focus();}
});
input?.addEventListener('input',()=>update());
document.querySelector<HTMLFormElement>('#search-preview-form')?.addEventListener('submit',event=>{event.preventDefault();const query=input?.value||'',href=exploreUrl(query);remember(query);closeSearch(false);location.assign(href);});
searchDialog?.addEventListener('cancel',event=>{event.preventDefault();closeSearch();});
searchDialog?.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeSearch();}else trapTab(event,searchDialog);});
contribution?.addEventListener('cancel',event=>{event.preventDefault();contribution.close();contributionOpener?.focus();});
contribution?.addEventListener('keydown',event=>trapTab(event,contribution));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){event.preventDefault();closeMenu(true);}});
// Match the native breakpoint once at startup; ordinary form submission still works without JS.
if(matchMedia('(max-width:600px)').matches){const filters=document.querySelector<HTMLDetailsElement>('.a-filters');if(filters)filters.open=false;}
