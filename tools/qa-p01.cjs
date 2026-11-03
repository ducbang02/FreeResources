/* Browser journeys against actual Astro/workerd+D1. Pass an already installed Playwright Core path. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.argv[2]||'playwright-core');
const base=(process.argv[3]||'http://127.0.0.1:4321').replace(/\/$/,''),out=path.resolve(process.argv[4]||'qa/p01/local');
fs.mkdirSync(out,{recursive:true});
const report={base,date:'2026-11-03',runtime:'Chromium, real HTTP application; database selected by target runtime',checks:[],screenshots:[],errors:[],expectedErrors:[],limitations:['Viewport emulation, not physical mobile/software keyboard/screen reader.','503 and delay injected only by QA request interception; no fake product endpoint.']};
async function check(name,fn){try{const detail=await fn();report.checks.push({name,status:'PASS',detail:detail??null});}catch(e){report.checks.push({name,status:'FAIL',message:e.message});throw e;}}
async function ready(p){await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});}
async function layout(p){return p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}));}
async function shot(p,name,fullPage=false){const file=name+'.png';await p.screenshot({path:path.join(out,file),fullPage,animations:'disabled'});report.screenshots.push(file);}
async function state(p,s){await p.waitForFunction(s=>document.getElementById('search-dialog')?.dataset.state===s,s);}
(async()=>{let browser;try{
  browser=await chromium.launch({headless:true});report.browser=browser.version();
  for(const width of [1440,768,390]){
    const ctx=await browser.newContext({viewport:{width,height:width===390?844:width===768?1024:900}}),p=await ctx.newPage();let expected=false;
    p.on('pageerror',e=>report.errors.push({width,type:'pageerror',message:e.message}));
    p.on('console',m=>{if(m.type()==='error')(expected?report.expectedErrors:report.errors).push({width,type:'console',message:m.text()});});
    const response=await p.goto(base+'/');await ready(p);
    await check(`${width}: SSR Home, useful full-width feature, real images/fonts`,async()=>{
      assert.equal(response.status(),200);assert.equal(await p.locator('main h1').count(),1);assert.ok(await p.locator('.a-curated-grid article').count()<=4);assert.equal(await p.locator('.rating').count(),0);
      const h=await p.locator('.a-feature').boundingBox();assert.equal(h.x,0);assert.equal(h.width,width);
      const lines=await p.locator('main h1').evaluate(el=>el.getBoundingClientRect().height/parseFloat(getComputedStyle(el).lineHeight));assert.ok(Math.abs(lines-2)<.05);
      assert.ok(await p.evaluate(()=>[...document.fonts].filter(f=>f.family==='Noto Sans').every(f=>f.status==='loaded')));
      const metric=await layout(p);assert.equal(metric.overflow,false);assert.deepEqual(metric.broken,[]);await shot(p,`home-${width}`);await shot(p,`home-${width}-full`,true);return metric;
    });
    await p.locator('#a-home-search').focus();await state(p,'default');
    await check(`${width}: Focus opens default search, bounded preview and keyboard trap`,async()=>{
      assert.equal(await p.evaluate(()=>document.activeElement.id),'search-preview-input');assert.ok(await p.locator('.search-preview-result').count()<=4);assert.ok(await p.locator('.search-preview-result').count()>0);
      for(let i=0;i<16;i++){await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('#search-dialog')),true);}await p.keyboard.press('Shift+Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('#search-dialog')),true);await shot(p,`search-default-${width}`);
    });
    const input=p.locator('#search-preview-input');await input.fill('file');await state(p,'results');
    await check(`${width}: Actual D1 search and accent-insensitive matching`,async()=>{
      assert.ok((await p.locator('#search-preview-content').innerText()).includes('LocalSend'));assert.ok(await p.locator('.search-preview-result').count()<=4);await shot(p,`search-results-${width}`);
      await input.fill('vẽ sơ đồ');await state(p,'results');assert.ok((await p.locator('#search-preview-content').innerText()).includes('Excalidraw'));
    });
    await input.fill('zzzz-no-match');await state(p,'empty');
    await check(`${width}: Empty state`,async()=>{assert.equal(await p.locator('.search-preview-result').count(),0);if(width===1440)await shot(p,'search-empty-1440');});
    let fail=true;await p.route('**/api/search?*',async route=>{if(fail){fail=false;return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'QA injected availability failure'})});}return route.continue();});expected=true;await input.fill('file');await state(p,'error');
    await check(`${width}: Real HTTP failure handling and retry`,async()=>{assert.equal(await p.locator('[data-search-retry]').count(),1);if(width===1440)await shot(p,'search-error-1440');await p.locator('[data-search-retry]').click();await state(p,'results');assert.ok((await p.locator('#search-preview-content').innerText()).includes('LocalSend'));});await p.unroute('**/api/search?*');expected=false;
    await check(`${width}: Escape closes and restores without reopening`,async()=>{await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#search-dialog').open&&document.activeElement.id==='a-home-search');await p.waitForTimeout(180);assert.equal(await p.locator('#search-dialog').evaluate(d=>d.open),false);});
    await p.locator('#a-home-search').click();await state(p,'default');await input.fill('file');await input.press('Enter');
    await check(`${width}: Enter opens full server-rendered results`,async()=>{await p.waitForURL(/\/explore\?q=file/);assert.ok((await p.locator('#a-catalog-results').innerText()).includes('LocalSend'));assert.equal(await p.locator('#search-dialog').evaluate(d=>d.open),false);});
    await p.goto(base+'/explore');await ready(p);
    await check(`${width}: Explore pagination, no overflow and initial8`,async()=>{assert.equal(await p.locator('#a-catalog-results article').count(),8);assert.equal((await layout(p)).overflow,false);await shot(p,`explore-${width}`);await p.locator('.a-pagination a').last().click();await p.waitForURL(/page=2/);assert.equal(await p.locator('#a-catalog-results article').count(),5);});
    await p.goto(base+'/explore');if(width===390)await p.locator('.a-filters summary').click();await p.locator('select[name=category]').selectOption('van-phong');await p.locator('select[name=type]').selectOption('application');await p.locator('select[name=platform]').selectOption('Windows');await p.locator('[data-filters] button[type=submit]').click();
    await check(`${width}: DB taxonomy/filter, sorting and list view`,async()=>{await p.waitForURL(/platform=Windows/);assert.ok((await p.locator('#a-catalog-results').innerText()).includes('LocalSend'));await p.getByRole('link',{name:'Xem dạng danh sách',exact:true}).click();await p.locator('.a-catalog-list').waitFor();if(width===390)await p.locator('.a-filters summary').click();await p.locator('select[name=sort]').selectOption('name');await p.locator('[data-filters] button[type=submit]').click();await p.waitForURL(/sort=name/);assert.equal((await layout(p)).overflow,false);assert.ok(p.url().includes('category=van-phong'));});
    const detail=await p.goto(base+'/resources/localsend');await ready(p);
    await check(`${width}: Detail source/platform/license, unique SEO and genuine links`,async()=>{assert.equal(detail.status(),200);assert.equal(await p.locator('main h1').innerText(),'LocalSend');assert.ok((await p.locator('main').innerText()).includes('Apache'));assert.ok((await p.getByRole('link',{name:/nguồn chính thức/i}).first().getAttribute('href')).startsWith('https://localsend.org'));assert.equal((await layout(p)).overflow,false);assert.deepEqual((await layout(p)).broken,[]);await shot(p,`detail-${width}`);});
    if(width<850){await p.locator('[data-navtoggle]').click();await check(`${width}: Menu click/Escape`,async()=>{assert.equal(await p.locator('[data-navtoggle]').getAttribute('aria-expanded'),'true');await p.keyboard.press('Escape');assert.equal(await p.locator('[data-navtoggle]').getAttribute('aria-expanded'),'false');});}
    await check(`${width}: Contribution clearly deferred and modal Escape`,async()=>{await p.locator('[data-contribute]').first().click();await p.locator('#contribution-dialog').waitFor({state:'visible'});assert.ok((await p.locator('#contribution-dialog').innerText()).includes('giai đoạn sau'));await p.keyboard.press('Escape');assert.equal(await p.locator('#contribution-dialog').evaluate(d=>d.open),false);});
    await p.goto(base+'/credits');await ready(p);await check(`${width}: Attribution/licenses route`,async()=>{const text=await p.locator('main').innerText();for(const term of ['Noto Sans','viewBox','CC BY','Apache','MIT'])assert.ok(text.includes(term),term);assert.equal((await layout(p)).overflow,false);});
    await p.emulateMedia({reducedMotion:'reduce'});await check(`${width}: Reduced motion`,async()=>assert.equal(await p.locator('.button').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s'));
    await ctx.close();
  }
  const ctx=await browser.newContext(),p=await ctx.newPage();
  await check('HTTP integration: API limits, invalid query, unknown routes and indexing',async()=>{
    const normal=await p.request.get(base+'/api/search?q=file');assert.equal(normal.status(),200);const body=await normal.json();assert.ok(body.items.some(i=>i.slug==='localsend'));assert.ok(body.items.length<=4);
    assert.equal((await p.request.get(base+'/api/search?q='+'x'.repeat(161))).status(),400);
    assert.equal((await p.request.get(base+'/resources/no-such-resource')).status(),404);assert.equal((await p.request.get(base+'/admin')).status(),404);assert.equal((await p.request.post(base+'/api/resources',{data:{title:'should not write'}})).status(),404);
    const robots=await p.request.get(base+'/robots.txt');assert.ok((await robots.text()).includes('Disallow: /'));const map=await p.request.get(base+'/sitemap.xml');assert.equal(map.status(),200);assert.ok((await map.text()).includes('/resources/localsend'));
    const home=await p.request.get(base+'/');assert.ok(home.headers()['x-robots-tag'].includes('noindex'));assert.equal(home.headers()['x-content-type-options'],'nosniff');
  });
  await p.goto(base+'/');await p.locator('#a-home-search').focus();await state(p,'default');await p.route('**/api/search?*',async route=>{await new Promise(r=>setTimeout(r,300));await route.continue();});await p.locator('#search-preview-input').fill('file');
  await check('Search loading/cancellation/latest query wins',async()=>{assert.equal(await p.locator('#search-dialog').getAttribute('data-state'),'loading');await p.locator('#search-preview-input').fill('vẽ sơ đồ');await state(p,'results');const text=await p.locator('#search-preview-content').innerText();assert.ok(text.includes('Excalidraw'));assert.ok(!text.includes('LocalSend'));await p.keyboard.press('Escape');assert.equal(await p.locator('#search-dialog').evaluate(d=>d.open),false);});await ctx.close();
  const nojs=await browser.newContext({javaScriptEnabled:false}),np=await nojs.newPage();await np.goto(base+'/');await check('Progressive enhancement: search without client JavaScript',async()=>{assert.equal(await np.locator('main h1').count(),1);await np.locator('#a-home-search').fill('file');await np.locator('#a-home-search').press('Enter');await np.waitForURL(/\/explore\?q=file/);assert.ok((await np.locator('#a-catalog-results').innerText()).includes('LocalSend'));});await nojs.close();
  await check('Normal journeys have zero console/page errors',()=>assert.deepEqual(report.errors,[]));
}catch(e){report.failure=e.message;process.exitCode=1;}finally{if(browser)await browser.close();report.status=report.failure?'FAIL':'PASS';fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.length,failed:report.checks.filter(c=>c.status==='FAIL'),screenshots:report.screenshots.length,errors:report.errors,report:path.join(out,'results.json')},null,2));}})();
