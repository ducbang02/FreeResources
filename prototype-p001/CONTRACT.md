# Shared prototype contract — P00.1

Buildless classic scripts, no dependency/network/auth/backend. Research completed before HTML/CSS. Root owns shared shell/engine/data/base.css/c.js. Concept owners only edit their assigned `concepts/a.js,a.css` or `b.js,b.css`.

Register `window.Concepts.A = {home(H,s), discover(H,s), detail(H,r,s)}` (B analogous). Return HTML strings; functions run on navigation. Scope CSS to `.concept-a` / `.concept-b` root wrapper. Do not use modules/fetch; direct file opening must work. Root sets body dataset/concept and wraps template in `<div class="concept-a">…</div>`.

`s` = `{concept:'A', page:'home', params:URLSearchParams, filtered: Resource[], query:string}`; `r` is selected Resource. Root handles not-found.

Resource: `{id,name,summary,category,kind,platforms:string[],price,license,homepage,repo?,description,benefits:string[],cautions:string[],audience, color, icon?, screenshot?, screenshotAlt?, rating?:{score,count}}`. kind is `app|tool|repo|learn|game`; `rating` is explicitly fixture, not real. All resource metadata is demo, needs source review before publication. `category`: `Văn phòng|Học tập|Sáng tạo|Lập trình|Bảo mật|Giải trí`. `price`: `Miễn phí|Có gói miễn phí|Tùy nền tảng`.

H primitives (root implements; don't redefine):

- `H.data` all resources; `H.get(id)` lookup; `H.pick(ids)` existing resources in requested order.
- `H.url(page='home', params={})` preserves current concept. pages `home|discover|detail/ID|collection/ID|about|contribute|saved`. `H.url('discover',{category:'Học tập'})`; query parameter keys `q,category,kind,platform,price,sort`. IDs collections: `teach,office,create,developer`. Existing filter default `all`. Sort `editorial|name|rating`.
- `H.escape(value)`, `H.symbol(name)` accessible decorative SVG line icon; names `search,arrow,chevron,plus,bookmark,grid,list,code,book,work,spark,check,filter,external,close,menu,heart`.
- `H.header(mode='standard')` returns `<header class="hub-header">` original brand, nav, compact header search, contribute, mobile menu. mode `editorial|directory|hybrid` optional. Includes labeled interactive controls. Root handles nav and modal/menu. Can wrap inside your custom layout. Do not add other H1 in header.
- `H.footer()` local policy/about/asset credits links.
- `H.search(value='',id='hero-search',placeholder='Bạn muốn làm gì hôm nay?')` visible search form/input/submit; class `.hub-search`, `data-search`. Use unique ID if multiple on page; root header uses `header-search`.
- `H.icon(r,size='md')` actual local licensed icon where present; original labeled category tile fallback, no emoji pretending brand. sizes `sm|md|lg`.
- `H.preview(r)` actual local screenshot if available; otherwise original SVG workflow composition, with visible provenance caption. Do not call placeholder a screenshot. `.product-preview`.
- `H.card(r,options={})` `.resource-card` includes icon/name/purpose/category/platform/price/license/fixture rating or no-ratings state and clear detail CTA. `options.compact=true` suppresses decorative content only. Whole semantic article + title/detail link, not nested link/button; bookmark button has `data-save=ID`, root handles session saves.
- `H.row(r)` compact `.resource-row` with same facts and detail link. Root adds functional save.
- `H.sectionHead(title,subtitle,href?)` H2 + optional see-all anchor; escape passed strings automatically.
- `H.filters(s)` `<form data-filters class="filter-panel">` category/kind/platform/price native selects, submit button; no duplicate IDs across same page. Only call once. Root handles submit and clear.
- `H.resultsHead(s)` count/status and sort select; root change handles it. `H.empty(s)` empty state with reset link.
- `H.facts(r)` definition list price/platform/license/rating fixture/source date unknown; `H.article(r)` overview, benefits, caveats, source links and source honesty note, H2/H3 semantic sections.
- `H.related(r)` cards of 3 resources from related topic; includes section H2.
- `H.collections()` 4 actionable collection cards (teach/office/create/developer) leading to filtered collection detail page.

Functional attributes if needed: `<button type="button" data-save="localsend">…</button>`, `<button type="button" data-open="contribute">…</button>`, links H.url. Avoid dummy #/javascript links, fake download/rate/account controls. Every button must work. Use details/summary for mobile filters and FAQs. No auto carousel/autoplay, no huge generic hero. Mobile 390px, tablet768, desktop1440 CSS; first useful resource should begin before ~500px desktop (design target only, root cannot assert rendered fold without browser).

All templates must include H.header(), H.footer(), exactly one H1 and focusable `<main id="main" tabindex="-1">`. Root provides skip link and concept/review control bar outside. Max width target 1280px at 1440 viewport. A image-led editorial mosaic, B sidebar/index directory, C hybrid compact magazine masthead + feature and discovery tabs; do not just change colors/fonts.
