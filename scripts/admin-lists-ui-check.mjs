// Production UI with isolated auth/API fixtures. No real API, database or storage writes.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const env = await readFile('.env', 'utf8');
const authUrl = env.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)?.[1]; assert(authUrl);
const origin = process.env.ADMIN_TEST_URL || 'http://127.0.0.1:3102';
const storageKey = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`;
const userId = '49332fa0-8244-4b20-a8d0-9793b72ef689';
const enc = value => Buffer.from(JSON.stringify(value)).toString('base64url'), exp = Math.floor(Date.now() / 1000) + 3600;
const session = { access_token: `${enc({ alg: 'HS256' })}.${enc({ sub: userId, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', expires_at: exp, expires_in: 3600,
  token_type: 'bearer', user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} } };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 950 } });
    const page = await context.newPage(); page.setDefaultTimeout(20000);
    await page.addInitScript(({ storageKey, session }) => { localStorage.setItem(storageKey, JSON.stringify(session)); localStorage.setItem('admin-sidebar', 'false'); }, { storageKey, session });
    const errors = [], requests = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    const brands = Array.from({ length: 17 }, (_, i) => ({ id: `brand-${i}`, name: `Brand ${String(i).padStart(3, '0')}`, slug: `brand-${i}`, status: 'active', count: 1 }));
    const models = Array.from({ length: 176 }, (_, i) => ({ id: `model-${i}`, name: `Model ${i}`, slug: `model-${i}`, brandId: brands[i % 17].id, status: 'active' }));
    const versions = Array.from({ length: 664 }, (_, i) => ({ id: `version-${i}`, name: `Version ${String(i).padStart(3, '0')}`, slug: `version-${i}`, modelId: models[i % 176].id, status: 'active', count: 1 }));
    const car = { id: 'car', name: 'Fixture car', slug: 'fixture-car', brand: brands[0], model: models[0], version: 'Version 000', price: 500000000, mileage: 1000, status: 'active', createdAt: new Date().toISOString() };
    const paged = (rows, url) => {
      const search = url.searchParams.get('search') || '';
      rows = rows.filter(row => String(row.name ?? row.title ?? '').toLowerCase().includes(search.toLowerCase()));
      const key = url.searchParams.get('sortBy'), direction = url.searchParams.get('sortDirection') === 'desc' ? -1 : 1;
      if (key) rows = [...rows].sort((a, b) => String(a[key]).localeCompare(String(b[key])) * direction);
      const page = Number(url.searchParams.get('page') || 1), limit = Number(url.searchParams.get('limit') || 10);
      return { data: rows.slice((page - 1) * limit, page * limit), meta: { page, limit, total: rows.length, totalPages: Math.ceil(rows.length / limit) } };
    };
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url()), method = req.method();
      if (!url.pathname.startsWith('/api/v1/')) return url.origin === new URL(origin).origin ? route.continue() : route.abort();
      const path = url.pathname.replace('/api/v1', ''); requests.push({ path, query: url.search, method });
      if (method !== 'GET') writes.push(path);
      let body;
      if (path === '/admin/brands' && url.searchParams.get('search') === 'failure') return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Fixture unavailable' }) });
      if (path === '/admin/me') body = { profile: { id: userId, fullName: 'Fixture admin', status: 'active' }, roles: ['ADMIN'], permissions: ['car.read', 'car.update', 'car.publish', 'brand.read', 'brand.delete', 'brand.update', 'model.read', 'version.read', 'version.update', 'content.read', 'lead.read', 'lead.update'] };
      else if (path === '/admin/leads/counts') body = { sell: 1, trade_in: 2, callback: 0 };
      else if (path === '/admin/brands') body = url.searchParams.has('page') ? paged(brands, url) : brands;
      else if (path === '/admin/car-models') body = models;
      else if (path === '/admin/lookups/car-versions') {
        let rows = versions;
        if (url.searchParams.get('modelId')) rows = rows.filter(row => row.modelId === url.searchParams.get('modelId'));
        if (url.searchParams.get('brandId')) rows = rows.filter(row => models.find(model => model.id === row.modelId)?.brandId === url.searchParams.get('brandId'));
        body = paged(rows, url);
      } else if (path === '/admin/cars') body = paged([car], url);
      else if (path.startsWith('/admin/brands/') && method === 'DELETE') { brands.splice(brands.findIndex(row => row.id === path.split('/').at(-1)), 1); body = {}; }
      else if (path === '/admin/leads') {
        const term = url.searchParams.get('search') || '';
        if (term === 'slow') await new Promise(resolve => setTimeout(resolve, 900));
        body = paged([{ id: 'lead', name: term ? `result-${term}` : 'Customer', phone: '0900000000', status: 'unread', createdAt: new Date().toISOString() }], new URL(`${origin}?page=1`));
      } else if (path.startsWith('/admin/leads/') && method === 'PATCH') body = {};
      else if (path === '/admin/collections/articles') body = paged([{ id: 'article', title: 'Article', categoryId: 'category', status: 'published' }], url);
      else if (path === '/admin/collections/articles/article') body = { id: 'article', title: 'Article', categoryId: 'category', content: '<p>Full detail preserved</p>', status: 'published' };
      else if (path === '/admin/collections/article-categories') body = paged([{ id: 'category', name: 'Category' }], url);
      else body = paged([], url);
      try { return await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) }); } catch { /* Request may have been aborted intentionally. */ }
    });
    const go = async path => { requests.length = 0; await page.goto(origin + path, { waitUntil: 'domcontentloaded' }); };
    const rows = page.locator('tbody tr');
    await go('/san-pham/phien-ban'); await page.getByText('Version 000', { exact: true }).waitFor();
    assert.equal(await rows.count(), 10);
    assert.equal(requests.filter(req => req.path === '/admin/lookups/car-versions').length, 1);
    assert.equal(requests.filter(req => req.path === '/admin/brands').length, 1);
    assert.equal(requests.filter(req => req.path === '/admin/car-models').length, 1);
    console.log(JSON.stringify({ width, route: 'versions', totalRequests: requests.length, versionReads: 1, firstPageRows: 10 }));
    await page.getByRole('button', { name: 'Phiên bản', exact: true }).click();
    await page.waitForTimeout(500);
    assert(requests.some(req => req.query.includes('sortBy=name')));
    const filters = page.locator('main select');
    await filters.first().selectOption('brand-0'); await page.waitForTimeout(500);
    assert(requests.some(req => req.query.includes('brandId=brand-0')));
    await go('/san-pham'); await page.getByText('Brand 000 Model 0 Version 000', { exact: false }).first().waitFor();
    assert.equal(requests.filter(req => req.path === '/admin/cars').length, 1);
    assert.equal(requests.filter(req => req.path === '/admin/lookups/car-versions').length, 0);
    console.log(JSON.stringify({ width, route: 'cars', totalRequests: requests.length, carsReads: 1, eagerVersionReads: 0 }));
    await go('/thu/ban-xe'); await page.getByText('Customer', { exact: true }).waitFor();
    const search = page.getByPlaceholder('Tìm kiếm theo tên, SĐT...'); requests.length = 0;
    await search.pressSequentially('abcdef', { delay: 70 }); await page.getByText('result-abcdef', { exact: true }).waitFor();
    assert.equal(requests.filter(req => req.path === '/admin/leads').length, 1);
    assert.equal(requests.filter(req => req.path === '/admin/leads/counts').length, 0);
    await search.fill('slow'); await page.waitForTimeout(400); await search.fill('fast');
    await page.getByText('result-fast', { exact: true }).waitFor(); await page.waitForTimeout(1000);
    assert.equal(await page.getByText('result-slow', { exact: true }).count(), 0);
    console.log(JSON.stringify({ width, mailSearchRequests: 1, headerReadsDuringSearch: 0, staleResponseIgnored: true }));
    assert.deepEqual(errors, []); assert.deepEqual(writes, []);
    brands.push(...Array.from({ length: 4 }, (_, i) => ({ ...brands[0], id: `extra-${i}`, name: `Extra ${i}` })));
    await go('/san-pham/hang-xe'); await page.getByText('Brand 000', { exact: true }).waitFor();
    const brandSearch = page.locator('main input[type="text"]').first();
    await brandSearch.fill('failure'); await page.getByRole('alert').filter({ hasText: 'Fixture unavailable' }).waitFor();
    assert.equal(await page.getByText('Brand 000', { exact: true }).count(), 1, 'Keep prior rows after a failed GET');
    await brandSearch.fill(''); await page.getByRole('main').getByRole('button', { name: '3', exact: true }).click();
    await page.getByText('Extra 3', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Xóa', exact: true }).click();
    await page.getByRole('button', { name: 'Xóa', exact: true }).last().click();
    await page.getByText('Extra 2', { exact: true }).waitFor();
    assert(requests.some(req => req.path === '/admin/brands' && req.query.includes('page=2')), 'Clamp to last valid page after deleting last row');
    assert.equal(writes.length, 1);
    await go('/quan-ly/tin-tuc'); await page.getByText('Article', { exact: true }).waitFor();
    assert.equal(requests.filter(req => req.path.endsWith('/articles/article')).length, 0, 'Do not fetch article detail before editing');
    await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).click();
    await page.getByText('Full detail preserved', { exact: true }).waitFor();
    assert.equal(requests.filter(req => req.path.endsWith('/articles/article')).length, 1);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ width, failedGetPreservesRows: true, deleteLastPageClamped: true, articleDetailLazy: true }));
    await context.close();
  }
} finally { await browser.close(); }
