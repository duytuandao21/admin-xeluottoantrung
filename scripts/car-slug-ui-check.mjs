// Real Admin UI with intercepted auth, API and uploads. No production writes.
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const env = await readFile('.env', 'utf8');
const authUrl = env.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)?.[1];
assert(authUrl);
const baseUrl = process.env.ADMIN_TEST_URL || 'http://127.0.0.1:3102';
const storageKey = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`;
const userId = '49332fa0-8244-4b20-a8d0-9793b72ef689', exp = Math.floor(Date.now() / 1000) + 3600;
const enc = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const session = { access_token: `${enc({ alg: 'HS256' })}.${enc({ sub: userId, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} } };
const paged = data => ({ data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } });
const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fixture = resolve('scripts/fixtures/image-metadata/still.png');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const artifacts = process.env.ADMIN_ARTIFACT_DIR || '../.tmp/car-slug-ui';
await mkdir(artifacts, { recursive: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 950 } }), page = await context.newPage();
    page.setDefaultTimeout(25000);
    await page.addInitScript(({ storageKey, session }) => { localStorage.setItem(storageKey, JSON.stringify(session)); localStorage.setItem('admin-sidebar', 'false'); }, { storageKey, session });
    const errors = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    const name = 'Toyota Vios G 2025', baseSlug = slugify(name);
    const base = { brand: { id: 'brand', name: 'Toyota', slug: 'toyota' }, model: { id: 'model', name: 'Vios', slug: 'vios' }, version: 'G', versionId: 'version', year: 2025, price: 458000000, seatCount: 5, status: 'inactive', transmissionId: 'gear', transmission: 'Số tự động', colorId: 'color', color: 'Đen', fuel: 'Xăng', newArrival: true, media: [], createdAt: new Date().toISOString(), publishedAt: null };
    const cars = [{ ...base, id: 'old', name, slug: baseSlug }], taken = new Set([baseSlug, `${baseSlug}-2`]);
    let failGeneric = false, sequence = 0;
    const lookups = { 'car-versions': [{ id: 'version', modelId: 'model', name: 'G', status: 'active' }], 'body-styles': [{ id: 'style', name: 'Sedan', status: 'active' }], transmissions: [{ id: 'gear', name: 'Số tự động', status: 'active' }], 'car-colors': [{ id: 'color', name: 'Đen', colorCode: '#000000', status: 'active' }], branches: [] };
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url()), method = request.method();
      const respond = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
      if (url.hostname === 'r2.fixture.invalid') { writes.push({ method, path: '/mock-r2' }); return respond({}); }
      if (!url.pathname.startsWith('/api/v1/')) return url.origin === new URL(baseUrl).origin ? route.continue() : route.abort();
      const path = url.pathname.replace('/api/v1', '');
      if (method !== 'GET') writes.push({ method, path, payload: request.postDataJSON() });
      if (path === '/admin/me') return respond({ profile: { id: userId, fullName: 'Slug fixture', status: 'active' }, roles: ['ADMIN'], permissions: ['car.read', 'car.create', 'car.update', 'car.publish'] });
      if (path === '/admin/brands') return respond([{ id: 'brand', name: 'Toyota', slug: 'toyota', status: 'active' }]);
      if (path === '/admin/car-models') return respond([{ id: 'model', brandId: 'brand', name: 'Vios', slug: 'vios', bodyStyleId: 'style', status: 'active' }]);
      if (path.startsWith('/admin/lookups/')) return respond(paged(lookups[path.split('/').at(-1)] || []));
      if (path === '/admin/cars' && method === 'GET') return respond(paged(cars));
      if (path === '/admin/cars' && method === 'POST') {
        const payload = request.postDataJSON(), requested = slugify(payload.name);
        assert(!('slug' in payload), 'API assigns the authoritative slug');
        if (failGeneric) { failGeneric = false; return respond({ message: 'Fixture lỗi mã xe' }, 409); }
        if (taken.has(requested) && payload.confirmDuplicateSlug !== true) return respond({ statusCode: 409, message: 'URL đã được sử dụng', details: { code: 'CAR_SLUG_CONFIRMATION_REQUIRED', slug: requested } }, 409);
        let slug = requested, n = 2; while (taken.has(slug)) slug = `${requested}-${n++}`;
        taken.add(slug);const row = { ...base, ...payload, id: `created-${++sequence}`, slug };
        cars.push(row);if (payload.confirmDuplicateSlug) await new Promise(done => setTimeout(done, 300));
        return respond(row, 201);
      }
      if (path === '/admin/media/presign') return respond({ storageKey: `cars/mock/${writes.length}.png`, uploadUrl: 'https://r2.fixture.invalid/put', headers: {}, publicUrl: 'https://r2.fixture.invalid/image.png' });
      if (/^\/admin\/cars\/[^/]+\/media$/.test(path)) return respond({ id: 'media', publicUrl: 'https://r2.fixture.invalid/image.png' }, 201);
      if (/\/(publish|unpublish)$/.test(path)) return respond({});
      if (/^\/admin\/cars\/[^/]+$/.test(path)) { const car = cars.find(c => c.id === path.split('/').at(-1));assert(car);if (method === 'PATCH') Object.assign(car, request.postDataJSON());return respond(car); }
      return respond({ ...paged([]), notifications: [] });
    });
    await page.goto(baseUrl + '/san-pham', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('button', { name: 'Thêm xe', exact: true }).waitFor();
    const open = async () => {
      await page.getByRole('button', { name: 'Thêm xe', exact: true }).click();
      await page.locator('input[name=name]').fill(name);
      for (const [field, value] of [['brand', 'Toyota'], ['model', 'Vios'], ['version', 'G'], ['transmissionId', 'gear'], ['color', 'Đen']]) await page.locator(`select[name=${field}]`).selectOption(value);
      await page.locator('input[name=year]').fill('2025');await page.locator('input[name=price]').fill('458000000');await page.locator('input[name=seatCount]').fill('5');
    };
    const submit = () => page.getByRole('button', { name: 'Thêm mới', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Xác nhận thêm xe trùng tên' });
    await open();
    await page.locator('input[type=file][name=cover]').setInputFiles(fixture);await page.locator('input[type=file][name=gallery]').setInputFiles(fixture);
    await submit();await dialog.waitFor();
    assert.equal(sequence, 0);assert.equal(writes.length, 1, 'No upload or publish before confirmation');
    assert.equal(await dialog.evaluate(el => el.getBoundingClientRect().width <= innerWidth - 30), true);
    await dialog.screenshot({ path: resolve(artifacts, `confirm-${width}.png`) });
    await dialog.getByRole('button', { name: 'Quay lại đổi tên', exact: true }).click();await dialog.waitFor({ state: 'hidden' });
    assert.equal(writes.length, 1);assert.equal(await page.locator('input[name=name]').inputValue(), name);
    for (const field of ['cover', 'gallery']) assert.equal(await page.locator(`input[type=file][name=${field}]`).evaluate(el => el.files[0]?.name), 'still.png');
    const renamed = `${name} xe xanh`;await page.locator('input[name=name]').fill(renamed);await submit();
    await page.locator('input[name=name]').waitFor({ state: 'detached' });
    assert.equal(cars.at(-1).slug, slugify(renamed));assert.equal(writes.filter(w => w.path === '/mock-r2').length, 2, 'Selected images survive cancellation');
    await open();await submit();await dialog.waitFor();await page.keyboard.press('Escape');await dialog.waitFor({ state: 'hidden' });
    await submit();await dialog.waitFor();
    await dialog.getByRole('button', { name: 'Xác nhận thêm xe', exact: true }).evaluate(button => { button.click();button.click(); });
    await page.locator('input[name=name]').waitFor({ state: 'detached' });
    const confirmed = writes.filter(w => w.path === '/admin/cars' && w.payload.confirmDuplicateSlug);
    assert.equal(confirmed.length, 1, 'Rapid confirmation creates one car only');
    assert.equal(confirmed[0].payload.name, name);assert.equal(cars.at(-1).slug, `${baseSlug}-3`, 'Final slug can advance past a competing creator');
    assert.equal(cars[0].slug, baseSlug);assert.equal(cars[0].status, 'inactive');
    await open();failGeneric = true;await submit();await page.getByText('Fixture lỗi mã xe', { exact: true }).waitFor();
    assert.equal(await dialog.isVisible(), false, 'Other conflicts must not offer slug bypass');
    assert.equal(await page.locator('input[name=name]').inputValue(), name);
    await page.getByRole('button', { name: 'Hủy', exact: true }).click();
    await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).first().click();
    const preview = page.getByRole('textbox', { name: 'Slug tự tạo', exact: true });assert.equal(await preview.inputValue(), baseSlug);
    await page.locator('input[name=name]').fill('Tên xe đã đổi');assert.equal(await preview.inputValue(), baseSlug);
    await page.getByRole('button', { name: 'Cập nhật', exact: true }).click();await page.locator('input[name=name]').waitFor({ state: 'detached' });
    const edited = writes.find(w => w.path === '/admin/cars/old' && w.method === 'PATCH');assert(edited);assert(!('slug' in edited.payload));assert(!('confirmDuplicateSlug' in edited.payload));
    assert.equal(cars[0].slug, baseSlug);assert.deepEqual(errors, []);
    await context.close();console.log(`PASS ${width}px: confirmation, cancel/rename/files, Escape, numbered URL, duplicate-click lock, generic 409 and stable edit URL`);
  }
} finally { await browser.close(); }
