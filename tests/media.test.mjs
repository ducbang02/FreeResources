import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Catalog product images have verified intrinsic dimensions available before image loading',()=>{
  const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(new URL('../public/assets/manifest.json',import.meta.url),'utf8'));
  const paths=new Set(catalog.resources.flatMap(r=>[r.image,r.mobileImage]).filter(Boolean));
  assert.ok(paths.size>0);
  for(const path of paths){
    const metadata=manifest.find(entry=>'/assets/'+entry.file===path);
    assert.ok(metadata,'Missing media metadata: '+path);
    assert.ok(Number.isInteger(metadata.width)&&metadata.width>0,'Missing image width: '+path);
    assert.ok(Number.isInteger(metadata.height)&&metadata.height>0,'Missing image height: '+path);
    assert.ok(fs.existsSync(new URL('../public'+path,import.meta.url)),'Missing local product image: '+path);
  }
});
