/* Developer-only QA. Uses an already installed Playwright Core; never installs packages/browsers. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const corePath=process.argv[2]||'playwright-core';
const {chromium}=require(corePath);
const output=path.resolve(process.argv[4]||path.join(__dirname,'../qa/p002')),base=process.argv[3]||'http://127.0.0.1:4175/index.html';
fs.mkdirSync(output,{recursive:true});
const report={phase:process.argv[5]||'P00.2',date:'2026-11-03',runtime:'Playwright Core local, fresh isolated Chromium contexts',browser:null,checks:[],screenshots:[],errors:[],limitations:['Headless Chromium, not physical iOS/Android keyboard or assistive technology.','Local prototype fixtures; no production backend/auth/AI/cloud integration.']};
async function check(name,fn){try{const detail=await fn();report.checks.push({name,status:'PASS',detail:detail??null});}catch(error){report.checks.push({name,status:'FAIL',error:error.message});throw error;}}
async function ready(page){await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});}
async function layout(page,scope='document'){return page.evaluate(scope=>{const box=scope==='document'?document.documentElement:document.querySelector(scope);return {width:innerWidth,height:innerHeight,scrollWidth:box.scrollWidth,clientWidth:box.clientWidth,overflow:box.scrollWidth>box.clientWidth+1,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src'))};},scope);}
async function shot(page,name,fullPage=false){const file=name+'.png';await page.screenshot({path:path.join(output,file),fullPage,animations:'disabled'});report.screenshots.push(file);}
async function state(page,value){await page.waitForFunction(value=>document.getElementById('search-dialog').dataset.state===value,value);}
(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});report.browser=browser.version();
    for(const width of [1440,768,390]){
      const context=await browser.newContext({viewport:{width,height:width===390?844:width===768?1024:900},reducedMotion:'no-preference'}),page=await context.newPage();
      page.on('pageerror',error=>report.errors.push({width,type:'pageerror',message:error.message}));
      page.on('console',message=>{if(message.type()==='error')report.errors.push({width,type:'console',message:message.text()});});
      await page.goto(base+'#/A/home');await ready(page);
      await check(`${width}: Home hierarchy, first useful feature, images and overflow`,async()=>{
        assert.equal(await page.locator('main h1').count(),1);assert.equal(await page.locator('main .a-feature').count(),1);assert.ok([2,3,4].includes(await page.locator('main .a-curated-grid article').count()));
        assert.equal(await page.locator('main .rating').count(),0);assert.equal(await page.locator('main .resource-facts').count(),0);
        const metric=await layout(page);assert.equal(metric.overflow,false);assert.deepEqual(metric.brokenImages,[]);
        const feature=await page.locator('.a-feature').boundingBox();if(width===1440)assert.ok(feature.y<500);await shot(page,`home-${width}`);await shot(page,`home-${width}-full`,true);return {...metric,featureTop:feature.y};
      });
      await page.locator('#a-home-search').focus();await page.locator('#search-dialog').waitFor({state:'visible'});
      await check(`${width}: Search focus/default and bounded preview`,async()=>{assert.equal(await page.evaluate(()=>document.activeElement.id),'search-preview-input');assert.equal(await page.locator('#search-dialog .search-preview-result').count(),2);assert.equal((await layout(page,'.search-surface')).overflow,false);await shot(page,`search-default-${width}`);});
      await check(`${width}: Native modal Tab/Shift+Tab remains inside`,async()=>{for(let i=0;i<16;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#search-dialog')),true);}await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#search-dialog')),true);});
      const input=page.locator('#search-preview-input');
      await input.fill('file');
      await check(`${width}: Search loading/results and max4`,async()=>{assert.equal(await page.locator('#search-dialog').getAttribute('data-state'),'loading');await state(page,'results');assert.ok(await page.locator('#search-dialog .search-preview-result').count()<=4);assert.ok((await page.locator('#search-preview-content').innerText()).includes('LocalSend'));assert.equal((await layout(page,'.search-surface')).overflow,false);await shot(page,`search-results-${width}`);});
      await input.fill('zzzzz-no-result');await state(page,'empty');
      await check(`${width}: Empty state`,async()=>{assert.equal(await page.locator('#search-dialog .search-preview-result').count(),0);if(width===1440)await shot(page,'search-empty-1440');});
      await page.evaluate(()=>window.HUB_SEARCH_TEST.failNext());await input.fill('PDF');await state(page,'error');
      await check(`${width}: Explicit simulated error and retry`,async()=>{if(width===1440)await shot(page,'search-error-1440');await page.locator('[data-search-retry]').click();await state(page,'results');assert.ok((await page.locator('#search-preview-content').innerText()).includes('Stirling'));});
      await input.fill('PDF');await input.fill('sơ đồ');await state(page,'results');
      await check(`${width}: Latest query wins`,async()=>{assert.ok(!(await page.locator('#search-preview-content').innerText()).includes('Stirling'));});
      await page.keyboard.press('Escape');
      await check(`${width}: Escape closes/restores focus without reopening`,async()=>{await page.waitForFunction(()=>!document.getElementById('search-dialog').open&&document.activeElement.id==='a-home-search');await page.waitForTimeout(210);assert.equal(await page.locator('#search-dialog').evaluate(d=>d.open),false);});
      await page.locator('#a-home-search').click();await page.locator('#search-dialog').waitFor({state:'visible'});await input.fill('file');await input.press('Enter');
      await check(`${width}: Enter to full search and close`,async()=>{await page.waitForURL(/#\/A\/discover\?q=file/);assert.equal(await page.locator('#search-dialog').evaluate(d=>d.open),false);assert.ok((await page.locator('.a-results').innerText()).includes('LocalSend'));});
      await page.goto(base+'#/A/discover');await ready(page);
      await check(`${width}: Explore responsive and initial8`,async()=>{assert.equal(await page.locator('#a-catalog-results article').count(),8);const metric=await layout(page);assert.equal(metric.overflow,false);await shot(page,`explore-${width}`);return metric;});
      await page.locator('[data-more]').click();await page.waitForFunction(()=>document.querySelectorAll('#a-catalog-results article').length===16);await page.locator('[data-more]').click();await page.waitForFunction(()=>document.querySelectorAll('#a-catalog-results article').length===19);
      await check(`${width}: Load more appends/ends`,async()=>{assert.equal(await page.locator('[data-more]').count(),0);assert.equal(await page.locator('#a-catalog-results article').count(),19);});
      if(width===390)await page.locator('.a-filters summary').click();
      await page.locator('[data-filters] select[name=platform]').selectOption('Windows');await page.locator('[data-filters] select[name=kind]').selectOption('app');await page.locator('[data-filters] button[type=submit]').click();
      await check(`${width}: Combined filters, grid/list and sort`,async()=>{await page.waitForURL(/platform=Windows/);assert.ok((await page.locator('.a-results').innerText()).includes('LocalSend'));await page.getByRole('link',{name:'Xem dạng danh sách',exact:true}).click();await page.locator('.a-catalog-list').waitFor();await page.locator('[data-sort]').selectOption('name');await page.waitForURL(/sort=name/);assert.ok(page.url().includes('platform=Windows'));assert.equal((await layout(page)).overflow,false);});
      await page.goto(base+'#/A/detail/localsend');await ready(page);
      await check(`${width}: Detail facts/source and no fake rating`,async()=>{const metric=await layout(page);assert.equal(metric.overflow,false);assert.equal(await page.locator('.a-detail-reading .resource-facts').count(),1);assert.equal(await page.locator('.rating').count(),0);assert.ok((await page.getByRole('link',{name:/Đến nguồn chính thức/}).getAttribute('href')).startsWith('https://localsend.org'));await shot(page,`detail-${width}`);return metric;});
      if(width<850){await page.locator('[data-navtoggle]').click();await check(`${width}: Mobile/tablet menu click/Escape`,async()=>{assert.equal(await page.locator('[data-navtoggle]').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('[data-navtoggle]').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('[data-navtoggle]').getAttribute('aria-label'),'Mở điều hướng');});}
      await page.emulateMedia({reducedMotion:'reduce'});
      await check(`${width}: Reduced motion applied`,async()=>assert.equal(await page.locator('.button').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s'));
      await context.close();
    }
    await check('All viewports: no pageerror or console error',async()=>assert.deepEqual(report.errors,[]));
  }catch(error){report.failure=error.message;process.exitCode=1;}
  finally{if(browser)await browser.close();report.status=report.failure?'FAIL':'PASS';fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,browser:report.browser,checks:report.checks.length,failed:report.checks.filter(c=>c.status==='FAIL'),errors:report.errors,screenshots:report.screenshots.length,report:path.join(output,'results.json')},null,2));}
})();
