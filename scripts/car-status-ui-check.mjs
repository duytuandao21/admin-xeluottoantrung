// Browser regression with intercepted auth/API only; never mutates a live database.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const env = await readFile('.env', 'utf8');
const authUrl = env.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)?.[1];
assert(authUrl);
const storageKey = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`;
const userId = '49332fa0-8244-4b20-a8d0-9793b72ef689';
const enc = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const exp = Math.floor(Date.now() / 1000) + 3600;
const session = { access_token: `${enc({ alg: 'HS256' })}.${enc({ sub: userId, exp, role: 'authenticated' })}.fixture`,
  refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer',
  user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} } };
const paged = data => ({ data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 950 } });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    await page.addInitScript(({ storageKey, session }) => {
      localStorage.setItem(storageKey, JSON.stringify(session));
      localStorage.setItem('admin-sidebar', 'false');
    }, { storageKey, session });
    const errors = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = { brand: { id: 'brand', name: 'Toyota', slug: 'toyota' }, model: { id: 'model', name: 'Vios', slug: 'vios' },
      version: 'G', versionId: 'version', year: 2024, price: 458000000, mileage: 55000, seatCount: 5,
      status: 'active', transmissionId: 'gear', transmission: 'Số tự động', colorId: 'color', color: 'Đen',
      fuel: 'Xăng', newArrival: true, media: [], createdAt: new Date().toISOString(), publishedAt: new Date().toISOString() };
    const cars = ['active', 'inactive', 'sold', 'deposit'].map((status, index) => ({ ...base, id: status,
      name: `Toyota Vios ${2024 - index}`, slug: status, status, year: 2024 - index,
      publishedAt: status === 'inactive' ? null : base.publishedAt }));
    const lookups = { 'car-versions': [{ id: 'version', modelId: 'model', name: 'G', status: 'active' }],
      'body-styles': [{ id: 'style', name: 'Sedan', status: 'active' }],
      transmissions: [{ id: 'gear', name: 'Số tự động', status: 'active' }],
      'car-colors': [{ id: 'color', name: 'Đen', colorCode: '#000000', status: 'active' }], branches: [] };
    let failureStatus = 0, delayWrite = false;
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === new URL(authUrl).origin) return route.abort();
      if (!url.pathname.startsWith('/api/v1/')) {
        if (url.origin !== new URL(process.env.ADMIN_TEST_URL || 'http://127.0.0.1:3102').origin) return route.abort();
        return route.continue();
      }
      const path = url.pathname.replace('/api/v1', '');
      const method = request.method();
      let body;
      if (method !== 'GET') {
        writes.push({ method, path, payload: request.postDataJSON() });
        if (delayWrite) await new Promise(resolve => setTimeout(resolve, 400));
        if (failureStatus) {
          const status = failureStatus; failureStatus = 0;
          return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ message: 'Fixture từ chối cập nhật' }) });
        }
      }
      if (path === '/admin/me') body = { profile: { id: userId, fullName: 'Status fixture', status: 'active' }, roles: ['ADMIN'], permissions: ['car.read', 'car.create', 'car.update', 'car.publish'] };
      else if (path === '/admin/brands') body = [{ id: 'brand', name: 'Toyota', slug: 'toyota', status: 'active' }];
      else if (path === '/admin/car-models') body = [{ id: 'model', brandId: 'brand', name: 'Vios', slug: 'vios', bodyStyleId: 'style', status: 'active' }];
      else if (path.startsWith('/admin/lookups/')) body = paged(lookups[path.split('/').at(-1)] || []);
      else if (path === '/admin/cars' && method === 'GET') body = paged(cars);
      else if (path === '/admin/cars' && method === 'POST') {
        body = { ...base, ...request.postDataJSON(), id: 'created', publishedAt: null };
        cars.push(body);
      } else if (path.endsWith('/publish') && method === 'POST') {
        body = cars.find(car => car.id === path.split('/').at(-2)); assert(body);
        body.status = body.status === 'inactive' ? 'active' : body.status;
        body.publishedAt ||= new Date().toISOString();
      } else if (/^\/admin\/cars\/[^/]+$/.test(path)) {
        body = cars.find(car => car.id === path.split('/').at(-1)); assert(body);
        if (method === 'PATCH') Object.assign(body, request.postDataJSON());
      } else body = { ...paged([]), notifications: [] };
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(`${process.env.ADMIN_TEST_URL || 'http://127.0.0.1:3102'}/san-pham`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    const toggle = (year, hide) => page.getByRole('button', { name: `${hide ? 'Ẩn xe' : 'Chuyển sang đang bán'}: Toyota Vios G ${year}`, exact: true });
    await toggle(2024, true).waitFor();
    if (width < 900 && await page.locator('main').evaluate(el => el.getBoundingClientRect().x > 100)) {
      await page.locator('header button').first().click();
      await page.waitForFunction(() => document.querySelector('main').getBoundingClientRect().x < 100);
    }
    await page.waitForFunction(() => !document.querySelector('button[title="Ẩn xe"]')?.disabled);
    assert.equal(await page.getByRole('button', { name: /Toyota Vios G 202[12]/ }).count(), 0, 'Sold/deposit remain noninteractive');
    delayWrite = true;
    await toggle(2024, true).evaluate(button => { button.click(); button.click(); button.click(); });
    await toggle(2024, false).waitFor();
    assert.equal(writes.length, 1, 'Repeated clicks submit only one mutation');
    assert.deepEqual(writes[0], { method: 'PATCH', path: '/admin/cars/active', payload: { status: 'inactive' } });
    assert.equal(cars[0].price, base.price);
    await toggle(2024, false).click(); await toggle(2024, true).waitFor();
    assert.equal(writes.at(-1).path, '/admin/cars/active/publish');
    assert.equal(cars[0].status, 'active');
    delayWrite = false;
    await toggle(2023, false).click(); await toggle(2023, true).waitFor();
    assert(cars[1].publishedAt, 'Restoring also publishes a previously unpublished car');
    failureStatus = 403;
    await toggle(2024, true).click();
    await page.getByText('Fixture từ chối cập nhật', { exact: true }).first().waitFor();
    await page.waitForFunction(() => !document.querySelector('button[title="Ẩn xe"]')?.disabled);
    assert.equal(cars[0].status, 'active');
    assert.equal(await toggle(2024, true).count(), 1, 'Rejected hide leaves persisted status visible');
    await toggle(2024, true).click(); await toggle(2024, false).waitFor();
    failureStatus = 503;
    await toggle(2024, false).click();
    await page.waitForFunction(() => !document.querySelector('button[title="Chuyển sang đang bán"]')?.disabled);
    assert.equal(cars[0].status, 'inactive');
    assert.equal(await toggle(2024, false).count(), 1, 'Failed publish does not optimistically show active');
    await toggle(2024, false).focus(); await page.keyboard.press('Enter'); await toggle(2024, true).waitFor();
    await page.reload({ waitUntil: 'domcontentloaded' }); await toggle(2024, true).waitFor();
    await page.getByRole('button', { name: 'Thêm xe', exact: true }).click();
    assert.equal(await page.locator('select[name="status"]').inputValue(), 'active');
    await page.locator('input[name="name"]').fill('Toyota Vios Created');
    await page.locator('select[name="brand"]').selectOption('Toyota');
    await page.locator('select[name="model"]').selectOption('Vios');
    await page.locator('select[name="version"]').selectOption('G');
    await page.locator('input[name="year"]').fill('2025');
    await page.locator('input[name="price"]').fill('458000000');
    await page.locator('input[name="seatCount"]').fill('5');
    await page.locator('select[name="transmissionId"]').selectOption('gear');
    await page.locator('select[name="color"]').selectOption('Đen');
    await page.getByRole('button', { name: 'Thêm mới', exact: true }).click();
    await page.locator('select[name="status"]').waitFor({ state: 'detached' });
    assert.equal(writes.find(write => write.path === '/admin/cars' && write.method === 'POST').payload.status, 'active');
    assert.equal(writes.at(-1).path, '/admin/cars/created/publish');
    assert(cars.at(-1).publishedAt);
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px: hide/restore, duplicate click lock, keyboard, 403/503, persisted reload, sold/deposit preserved, new car active + published`);
    await context.close();
  }
} finally { await browser.close(); }
