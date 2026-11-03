/* P00.3-specific visual/font checks. Reuses existing local Playwright, no installation. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require(process.argv[2]||'playwright-core');
const base=process.argv[3]||'http://127.0.0.1:4175/index.html',out=path.resolve('qa/p003');
const report={phase:'P00.3',date:'2026-11-03',browser:null,checks:[],errors:[],expectedBlockedFonts:[],screenshots:[]};
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function check(name,fn){try{report.checks.push({name,status:'PASS',detail:await fn()??null});}catch(e){report.checks.push({name,status:'FAIL',message:e.message});throw e;}}
async function ready(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});}
async function platformFonts(page,selector){const c=await page.context().newCDPSession(page);try{await c.send('DOM.enable');await c.send('CSS.enable');const {root}=await c.send('DOM.getDocument');const {nodeId}=await c.send('DOM.querySelector',{nodeId:root.nodeId,selector});return (await c.send('CSS.getPlatformFontsForNode',{nodeId})).fonts;}finally{await c.detach();}}
async function shot(page,file){await page.screenshot({path:path.join(out,file),fullPage:true,animations:'disabled'});report.screenshots.push(file);}
(async()=>{let browser;try{
  await check('P00 originals and B/C source unchanged',()=>{const hashes=JSON.parse(fs.readFileSync(path.join(out,'source-before.json'),'utf8'));for(const [file,expected] of Object.entries(hashes))assert.equal(hash(fs.readFileSync(file)),expected,file);return Object.keys(hashes);});
  await check('Font source manifest, OFL and local hashes',()=>{const root='prototype-p001/assets/fonts',m=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));assert.ok(fs.readFileSync(root+'/OFL.txt','utf8').includes('SIL OPEN FONT LICENSE'));const fonts=fs.readdirSync(root).filter(f=>f.endsWith('.woff2'));assert.equal(fonts.length,2);for(const name of fonts){const source=JSON.stringify(m);assert.ok(source.includes(hash(fs.readFileSync(root+'/'+name))),name);}return {fonts,bytes:fonts.reduce((n,f)=>n+fs.statSync(root+'/'+f).size,0)};});
  browser=await chromium.launch({headless:true});report.browser=browser.version();
  for(const width of [1440,768,390]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:width===768?1024:900}}),page=await context.newPage(),responses=[];
    page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
    page.on('response',r=>{if(/\.woff2(?:\?|$)/.test(r.url()))responses.push({url:r.url(),status:r.status(),type:r.headers()['content-type']});});
    await page.goto(base+'#/A/home');await ready(page);
    await check(`${width}: Full-width hero, two-line heading, max4 fully linked cards`,async()=>{
      const metric=await page.evaluate(()=>{const hero=document.querySelector('.a-feature').getBoundingClientRect(),h=document.querySelector('h1'),s=getComputedStyle(h);return {hero:{x:hero.x,width:hero.width},inner:document.querySelector('.a-feature-inner').getBoundingClientRect().width,headingLines:h.getBoundingClientRect().height/parseFloat(s.lineHeight),width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,body:getComputedStyle(document.querySelector('.concept-a')).fontSize,nav:getComputedStyle(document.querySelector('.hub-navigation>a')).fontSize};});
      assert.equal(metric.hero.x,0);assert.equal(metric.hero.width,width);assert.ok(metric.inner<=1240);assert.ok(Math.abs(metric.headingLines-2)<.05);assert.equal(metric.overflow,false);assert.equal(metric.body,'16px');assert.equal(metric.nav,'15px');const cards=page.locator('.a-curated-grid article');assert.ok(await cards.count()<=4);assert.equal(await page.locator('.a-spotlight-link').count(),await cards.count());assert.equal(await page.locator('.a-search-hint,.a-feature figcaption,.a-feature-copy>p,.a-intro').count(),0);return metric;
    });
    await check(`${width}: Product images preserve ratio, no broken image`,async()=>{
      const images=await page.evaluate(()=>[...document.images].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0,ratio:i.getBoundingClientRect().width/i.getBoundingClientRect().height,natural:i.naturalWidth/i.naturalHeight,fit:getComputedStyle(i).objectFit})));
      for(const i of images){assert.equal(i.ok,true,i.src);if(i.src.includes('localsend-'))assert.ok(Math.abs(i.ratio/i.natural-1)<.001,i.src);else assert.ok(i.fit==='contain'||Math.abs(i.ratio/i.natural-1)<.001,i.src);}return images;
    });
    await check(`${width}: Noto Sans actually rendered with local Latin/Vietnamese faces`,async()=>{
      const faces=await page.evaluate(()=>[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status})));
      assert.equal(faces.length,2);assert.ok(faces.every(f=>f.family==='Noto Sans'&&f.status==='loaded'&&f.weight==='400 700'));assert.equal(responses.length,2);assert.ok(responses.every(r=>r.status===200&&['font/woff2','application/octet-stream'].includes(r.type)&&r.url.startsWith('http://127.0.0.1:4175/')));
      const fonts=await platformFonts(page,'h1');assert.ok(fonts.some(f=>f.isCustomFont&&f.familyName==='Noto Sans'&&f.glyphCount>0));assert.ok(fonts.every(f=>f.isCustomFont));return {faces,responses,fonts};
    });
    if(width===1440)await check('Vietnamese glyphs render in Noto at 400/500/600/700',async()=>{
      const results=[];await page.evaluate(()=>{const p=document.createElement('p');p.id='qa-font-sample';p.textContent='Ti\u1ebfng Vi\u1ec7t: \u0110\u00fang c\u00f4ng c\u1ee5, nh\u1eb9 vi\u1ec7c h\u01a1n. \u1eae \u1ed8 \u1ee8 \u0111 \u20ab';p.style.cssText='font-family:"Noto Sans";font-size:16px';document.body.append(p);});
      try{for(const weight of [400,500,600,700]){await page.locator('#qa-font-sample').evaluate((p,w)=>p.style.fontWeight=w,weight);await page.evaluate(()=>document.fonts.ready);const fonts=await platformFonts(page,'#qa-font-sample');assert.ok(fonts.length>0&&fonts.every(f=>f.isCustomFont&&f.familyName==='Noto Sans'));results.push({weight,fonts});}}finally{await page.locator('#qa-font-sample').evaluate(p=>p.remove());}return results;
    });
    await check(`${width}: Excalidraw responsive SVG contains visible colored artwork`,async()=>{
      const pixels=await page.locator('img[src="assets/excalidraw-responsive.svg"]').evaluate(i=>{const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.drawImage(i,0,0,64,64);const d=ctx.getImageData(0,0,64,64).data;let colored=0;for(let n=0;n<d.length;n+=4)if(d[n+3]>0&&Math.max(d[n],d[n+1],d[n+2])-Math.min(d[n],d[n+1],d[n+2])>25)colored++;return colored;});assert.ok(pixels>500);return {coloredPixels:pixels,total:4096};
    });
    await check(`${width}: Featured card keyboard activation, Detail/credits attribution`,async()=>{
      await page.locator('.a-spotlight-link').first().focus();await page.keyboard.press('Enter');await page.waitForURL(/detail\/excalidraw/);await ready(page);assert.ok((await page.locator('.a-detail-visual figcaption').innerText()).includes('MIT'));
      await page.goto(base+'#/A/credits');await ready(page);const text=await page.locator('main').innerText();for(const term of ['viewBox','Noto Sans','CC BY 4.0','Apache-2.0'])assert.ok(text.includes(term),term);assert.equal(await page.locator('a[href="assets/fonts/OFL.txt"]').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    });
    if(width===390){await page.setViewportSize({width:390,height:480});await page.goto(base+'#/A/home');await ready(page);await page.locator('#a-home-search').focus();await page.locator('#search-dialog').waitFor({state:'visible'});await check('390x480: Low-height search scroll/keyboard access',async()=>{const m=await page.locator('.search-surface').evaluate(el=>({h:el.getBoundingClientRect().height,scroll:el.querySelector('.search-preview-content').scrollHeight>el.querySelector('.search-preview-content').clientHeight,overflow:el.scrollWidth>el.clientWidth}));assert.ok(m.h<=456);assert.equal(m.overflow,false);assert.equal(m.scroll,true);await page.locator('#search-all-link').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('[data-search-close]').evaluate(el=>el===document.activeElement),true);await shot(page,'search-low-height-390.png');return m;});}
    await context.close();
  }
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900}}),page=await context.newPage();
    await page.route('**/*.woff2',route=>{report.expectedBlockedFonts.push(route.request().url());return route.abort();});
    await page.goto(base+'#/A/home');await ready(page);
    await check(`${width}: Font failure retains readable fallback and two-line hero`,async()=>{const fonts=await platformFonts(page,'h1');assert.ok(fonts.every(f=>!f.isCustomFont));assert.ok(fonts.length>0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.ok(await page.locator('h1').isVisible());const lines=await page.locator('h1').evaluate(h=>h.getBoundingClientRect().height/parseFloat(getComputedStyle(h).lineHeight));assert.ok(Math.abs(lines-2)<.05);await shot(page,`fallback-${width}.png`);return fonts;});
    await context.close();
  }
  const fileContext=await browser.newContext({viewport:{width:390,height:844}}),filePage=await fileContext.newPage();
  await filePage.goto('file:///'+path.resolve('prototype-p001/index.html').replaceAll('\\','/')+'#/A/home');await ready(filePage);
  await check('Direct file:// prototype loads fonts, icons and search',async()=>{assert.ok((await platformFonts(filePage,'h1')).some(f=>f.familyName==='Noto Sans'&&f.isCustomFont));await filePage.locator('#a-home-search').click();await filePage.locator('#search-dialog').waitFor({state:'visible'});await filePage.locator('#search-preview-input').fill('file');await filePage.waitForFunction(()=>document.getElementById('search-dialog').dataset.state==='results');assert.ok((await filePage.locator('#search-preview-content').innerText()).includes('LocalSend'));});await fileContext.close();
  await check('Normal asset/font runs: zero console/page errors',()=>assert.deepEqual(report.errors,[]));
}catch(e){report.failure=e.message;process.exitCode=1;}finally{if(browser)await browser.close();report.status=report.failure?'FAIL':'PASS';fs.writeFileSync(path.join(out,'results-specific.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.length,failed:report.checks.filter(c=>c.status==='FAIL'),errors:report.errors,screenshots:report.screenshots},null,2));}})();
