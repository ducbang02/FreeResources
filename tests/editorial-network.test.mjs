import test from 'node:test';
import assert from 'node:assert/strict';
import {identify,findMatches,publicAddress,resolvePublic,pinnedLookup,safeRequest} from '../scripts/editorial/network.mjs';
import {validateCatalog} from '../src/lib/validation.ts';
import fs from 'node:fs';
test('P02 URL identity folds GitHub aliases and rejects unsafe inputs',()=>{
  for(const url of ['https://github.com/Owner/Repo','https://www.github.com/owner/repo.git/','https://github.com/OWNER/REPO?tab=readme#top'])assert.equal(identify(url).canonicalUrl,'https://github.com/owner/repo');
  for(const url of ['http://example.org','https://u:p@example.org','https://127.1/','https://[::1]/','https://0x7f000001','https://localhost/','https://tool.home/','https://example.org:444/','https://github.com/a/b/tree/main','https://github.com/a%2fb/c','https://github.com/a/%2e%2e','https://github.com.evil.local/a/b','https://example.org/\\x'])assert.throws(()=>identify(url),url);
  assert.equal(identify('https://EXAMPLE.org/app/?utm_source=x#top').canonicalUrl,'https://example.org/app');
  assert.equal(identify('https://example.org/?b=2&a=1').canonicalUrl,'https://example.org/?a=1&b=2');
});
test('P02 DNS boundary denies internal, mixed DNS and IPv6 transition ranges',async()=>{
  for(const ip of ['0.0.0.0','10.0.1.1','100.64.0.1','127.0.0.1','169.254.169.254','172.31.1.1','192.168.1.1','198.18.0.1','224.0.0.1','::1','::ffff:8.8.8.8','fe80::1','fc00::1','2001:db8::1','2002:0808:0808::1'])assert.equal(publicAddress(ip),false,ip);
  for(const ip of ['8.8.8.8','1.1.1.1','2606:4700::1111','2001:4860:4860::8888'])assert.equal(publicAddress(ip),true,ip);
  await assert.rejects(resolvePublic('example.org',async()=>[{address:'8.8.8.8',family:4},{address:'10.0.0.1',family:4}]),/SSRF/);
  const result=await resolvePublic('example.org',async()=>[{address:'8.8.8.8',family:4}]);let pinned;pinnedLookup(result)('example.org',{all:true},(_err,addresses)=>pinned=addresses);assert.deepEqual(pinned,[result]);
  await assert.rejects(resolvePublic('example.org',()=>new Promise(()=>{}),5),/DNS_TIMEOUT/);
  await assert.rejects(safeRequest('https://example.org',{resolver:async()=>[{address:'127.0.0.1',family:4}],transport:()=>{throw Error('Must not connect');}}),/SSRF/);
  await assert.rejects(safeRequest('https://example.org',{allowedHost:'api.github.com'}),/HOST_BLOCKED/);
});
test('P02 stable identity metadata round-trips without changing P01 IDs or SQL fields',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')),resource=data.resources[0];
  const identity={kind:'github',canonicalUrl:'https://github.com/example/tool',aliases:['https://github.com/example/old'],githubId:'123',fullName:'example/tool'};
  resource.sourceIdentity=identity;assert.deepEqual(validateCatalog(data).resources[0].sourceIdentity,identity);
  assert.equal(findMatches(data,[],{...identify('https://github.com/example/old.git'),githubId:'123'}).length,1);
  assert.equal(findMatches(data,[{id:'draft-a',identity:identify('https://example.org/app')}],identify('https://example.org/app/')).length,1);
  const bad=structuredClone(data);bad.resources[1].sourceIdentity=identity;assert.throws(()=>validateCatalog(bad),/GitHub IDs/);
  resource.editorial={groups:['github','free_apps'],freeModel:'freemium',licenseStatus:'unknown',freeEvidenceUrl:'https://example.org/pricing',freeLimitations:'Free tier có giới hạn đã đối chiếu',reviewedBy:'Fixture editor',reviewedAt:resource.updatedAt};
  assert.deepEqual(validateCatalog(data).resources[0].editorial,resource.editorial);resource.editorial.freeModel='trial';assert.throws(()=>validateCatalog(data),/classification/);
});
