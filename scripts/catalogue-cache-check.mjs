import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile('src/lib/api/catalogue-cache.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const cache = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('catalogue reuse, TTL, rejection, mutation epochs and account isolation', async () => {
  const originalNow = Date.now; let now = originalNow(); Date.now = () => now;
  let loads = 0;
  const load = async () => { loads++; return [loads]; };
  try {
    cache.scopeCatalogues('account-a');
    assert.deepEqual(await Promise.all([cache.cachedCatalogue('brands', load), cache.cachedCatalogue('brands', load)]), [[1], [1]]);
    assert.equal(loads, 1);
    now += 30001; assert.deepEqual(await cache.cachedCatalogue('brands', load), [2]);
    cache.invalidateCatalogues(); assert.deepEqual(await cache.cachedCatalogue('brands', load), [3]);
    await assert.rejects(cache.cachedCatalogue('fail', async () => { throw new Error('offline'); }));
    assert.deepEqual(await cache.cachedCatalogue('fail', load), [4]);
    let finish; const old = cache.cachedCatalogue('pending', () => new Promise(resolve => { finish = resolve; }));
    cache.invalidateCatalogues(); finish(['old']); await assert.rejects(old, /Danh mục/);
    assert.deepEqual(await cache.cachedCatalogue('pending', load), [5]);
    cache.scopeCatalogues('account-b'); assert.deepEqual(await cache.cachedCatalogue('brands', load), [6]);
    cache.scopeCatalogues(undefined); cache.scopeCatalogues('account-a');
    assert.deepEqual(await cache.cachedCatalogue('brands', load), [7]);
  } finally { Date.now = originalNow; cache.invalidateCatalogues(); }
});
