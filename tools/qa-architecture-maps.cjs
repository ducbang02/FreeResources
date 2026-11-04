/* Real Chrome/file:// documentation QA. Reuses caller-provided Playwright Core. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.argv[2]||'playwright-core');
const folder=path.resolve('docs/architecture-maps'),out=path.resolve('qa/architecture-maps/browser');
fs.mkdirSync(out,{recursive:true});
const report={date:new Date().toISOString(),checks:[],errors:[],network:[],screenshots:[],downloads:[],limitations:['Chrome viewport emulation, not physical mobile or screen-reader certification.','Source metadata/link targets are checked locally; GitHub source contents require network when opened.','Clipboard/WebM exports are outside the requested image-export checks.']};
const url=file=>pathToFileURL(path.join(folder,file)).href;
async function check(name,fn){try{report.checks.push({name,status:'PASS',detail:await fn()??null});}catch(e){report.checks.push({name,status:'FAIL',error:e.message});}}
async function shot(p,file){await p.screenshot({path:path.join(out,file),fullPage:true,animations:'disabled'});report.screenshots.push(file);}
async function ready(p){await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(80);}
async function noOverflow(p){assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
(async()=>{let browser;try{
  const chrome=process.argv[3]||'C:/Program Files/Google/Chrome/Application/chrome.exe';
  browser=await chromium.launch({headless:true,...(fs.existsSync(chrome)?{executablePath:chrome}:{})});report.browser=browser.version();
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
  await context.route(/^https?:/,route=>{report.network.push(route.request().url());return route.abort();});
  const p=await context.newPage();
  p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  for(const width of [1440,768,390])await check('Index '+width+': four routes, keyboard and containment',async()=>{
    await p.setViewportSize({width,height:900});await p.goto(url('index.html'));await ready(p);await noOverflow(p);assert.equal(await p.locator('.map h2 a').count(),4);await p.locator('.map h2 a').first().focus();assert.equal(await p.locator('.map h2 a').first().evaluate(e=>e===document.activeElement),true);await p.keyboard.press('Enter');await p.waitForURL(url('01-system.html'));await p.goto(url('index.html'));await shot(p,'index-'+width+'.png');
  });
  for(const file of ['01-system.html','02-cicd.html','03-data.html','04-search.html']){
    for(const width of [1440,768,390])await check(file+' '+width+': offline render and containment',async()=>{
      await p.setViewportSize({width,height:1000});await p.goto(url(file));await ready(p);await noOverflow(p);assert.ok(await p.locator('svg [data-node-id]').count()>0);assert.equal(await p.locator('html').getAttribute('lang'),'vi');assert.ok((await p.locator('h1').innerText()).includes(file.slice(0,2)));await shot(p,file.replace('.html','')+'-'+width+'.png');
    });
    await p.setViewportSize({width:1440,height:1000});await p.goto(url(file));await ready(p);
    const first=p.locator('svg g[data-node-id]').first();
    await check(file+': keyboard focus, explanation, relationships and pinned sources',async()=>{
      await first.focus();await p.keyboard.press('Enter');await p.locator('#focus-chip').waitFor({state:'visible'});assert.equal(await first.getAttribute('aria-pressed'),'true');assert.ok((await p.locator('#focus-label').innerText()).trim());assert.ok((await p.locator('#focus-summary').innerText()).length>0);
      const sourceFile=fs.readdirSync(path.join(folder,'sources')).find(name=>name.startsWith(file.slice(0,2)+'-')&&name.endsWith('.json')),spec=JSON.parse(fs.readFileSync(path.join(folder,'sources',sourceFile),'utf8'));
      const evidence=await p.locator('#archify-source-evidence-data').textContent(),data=JSON.parse(evidence);assert.equal(data.verified,true);assert.equal(data.repository.revision,spec.meta.repository.revision);
      const links=await p.locator('#focus-evidence-links a').evaluateAll(as=>as.map(a=>({href:a.href,target:a.target,rel:a.rel})));
      if(spec.meta.repository.link_mode==='local-only'){assert.equal(data.repository.linkMode,'local-only');assert.equal(links.length,0);assert.ok((await p.locator('#focus-evidence').innerText()).includes(spec.nodes[0].sources[0].path));}
      else{assert.ok(links.length);for(const a of links){assert.ok(a.href.startsWith('https://github.com/ducbang02/FreeResources/blob/'+data.repository.revision+'/'));assert.equal(a.target,'_blank');assert.ok(a.rel.includes('noopener'));}}
      await shot(p,file.replace('.html','')+'-focus.png');await p.keyboard.press('Escape');await p.locator('#focus-chip').waitFor({state:'hidden'});return{sourceReferences:data.referenceCount,links};
    });
    await check(file+': zoom, drag and reset',async()=>{
      const read=p.locator('[data-view=reset]'),initial=await read.textContent();await p.locator('[data-view=in]').click();await p.locator('[data-view=in]').click();assert.notEqual(await read.textContent(),initial);
      const svg=p.locator('svg:has(g[data-node-id])').first(),box=await svg.evaluate(e=>{const r=(e.closest('.diagram-panel')||e.parentElement).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}),before=await first.boundingBox();
      // Use the visible panel, not the zoomed SVG bounds that may extend off-canvas.
      const dragX=Math.min(1400,box.x+box.width-25),dragY=Math.max(120,box.y+25);
      await p.mouse.move(dragX,dragY);await p.mouse.down();await p.mouse.move(dragX-45,dragY+30,{steps:8});await p.mouse.up();const after=await first.boundingBox();assert.ok(Math.abs(before.x-after.x)>1||Math.abs(before.y-after.y)>1,'Canvas did not pan');
      await read.click();assert.ok((await read.textContent()).includes('100%'));return{before,after};
    });
    for(const format of ['png','svg'])await check(file+': '+format.toUpperCase()+' export',async()=>{
      await p.keyboard.press('Escape');await p.locator('#btn-export').click();const downloadPromise=p.waitForEvent('download');await p.locator('button[data-format='+format+']').click();const download=await downloadPromise;assert.equal(await download.failure(),null);const output=file.replace('.html','')+'.'+format;await download.saveAs(path.join(out,output));const bytes=fs.readFileSync(path.join(out,output));assert.ok(bytes.length>100);if(format==='png')assert.equal(bytes.subarray(1,4).toString(),'PNG');else assert.ok(bytes.toString().includes('<svg'));report.downloads.push(output);return{bytes:bytes.length};
    });
    await check(file+': light/dark, guide and Escape',async()=>{
      const before=await p.locator('html').getAttribute('data-theme');await p.locator('#btn-theme').click();assert.notEqual(await p.locator('html').getAttribute('data-theme'),before);await p.locator('#btn-theme').click();await p.locator('#btn-diagram-guide').click();await p.keyboard.press('Escape');await noOverflow(p);
    });
  }
  await check('No automatic HTTP requests, page exceptions or console errors',()=>{assert.deepEqual(report.network,[]);assert.deepEqual(report.errors,[]);});
  await context.close();
  await check('Index works with JavaScript disabled',async()=>{const c=await browser.newContext({javaScriptEnabled:false}),p=await c.newPage();try{await p.goto(url('index.html'));assert.equal(await p.locator('.map h2 a').count(),4);await p.locator('.map h2 a').last().click();await p.waitForURL(url('04-search.html'));}finally{await c.close();}});
}catch(e){report.failure=e.message;}finally{if(browser)await browser.close();report.status=report.failure||report.checks.some(c=>c.status==='FAIL')?'FAIL':'PASS';fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,passed:report.checks.filter(c=>c.status==='PASS').length,failed:report.checks.filter(c=>c.status==='FAIL'),failure:report.failure,screenshots:report.screenshots.length,downloads:report.downloads.length,report:path.join(out,'results.json')},null,2));if(report.status==='FAIL')process.exitCode=1;}})();
