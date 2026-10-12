// Real admin form, intercepted auth/API fixtures; never writes to a live database.
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
const enc = v => Buffer.from(JSON.stringify(v)).toString('base64url'), exp = Math.floor(Date.now() / 1000) + 3600;
const session = { access_token: `${enc({ alg: 'HS256' })}.${enc({ sub: userId, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} } };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const week = 604800000;
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 950 } });
    page.setDefaultTimeout(20000);
    await page.clock.install();
    await page.addInitScript(({ storageKey, session }) => { localStorage.setItem(storageKey, JSON.stringify(session)); localStorage.setItem('admin-sidebar', 'false'); }, { storageKey, session });
    const errors = [], writes = [];
    page.on('pageerror', e => errors.push(e.message));
    const now = Date.now();
    const baseCar = { brand: { id: 'brand', name: 'Toyota', slug: 'toyota' }, model: { id: 'model', name: 'Vios', slug: 'vios' }, version: 'G', year: 2024, price: 458000000, mileage: 55000, seatCount: 5, status: 'active', fuel: 'Xăng', color: 'Đen', colorId: 'color', transmissionId: 'gear', transmission: 'Số tự động', featured: false, installment: false, media: [], updatedAt: new Date(now).toISOString() };
    const cars = [
      { ...baseCar, id: 'fresh', name: 'Toyota Vios Fresh', slug: 'fresh', createdAt: new Date(now - 86400000).toISOString(), newArrival: true },
      { ...baseCar, id: 'expired', name: 'Toyota Vios Expired', slug: 'expired', createdAt: new Date(now - week - 1000).toISOString(), newArrival: true },
      { ...baseCar, id: 'expiring', name: 'Toyota Vios Expiring', slug: 'expiring', createdAt: new Date(now - week + 120000).toISOString(), newArrival: true },
    ];
    const paged = data => ({ data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } });
    const lookups = { 'car-versions': [{ id: 'version', modelId: 'model', name: 'G', status: 'active' }], 'body-styles': [{ id: 'style', name: 'Sedan', status: 'active' }], transmissions: [{ id: 'gear', name: 'Số tự động', status: 'active' }], 'car-colors': [{ id: 'color', name: 'Đen', colorCode: '#000000', status: 'active' }], branches: [] };
    await page.route(`${authUrl}/**`, route => route.abort());
    await page.route('**/api/v1/**', async route => {
      const request = route.request(), path = new URL(request.url()).pathname.replace('/api/v1', '');
      let body;
      if (path === '/admin/me') body = { profile: { id: userId, fullName: 'Arrival fixture', status: 'active' }, roles: ['ADMIN'], permissions: ['car.read', 'car.create', 'car.update', 'car.publish'] };
      else if (path === '/admin/brands') body = [{ id: 'brand', name: 'Toyota', slug: 'toyota', status: 'active' }];
      else if (path === '/admin/car-models') body = [{ id: 'model', brandId: 'brand', name: 'Vios', slug: 'vios', bodyStyleId: 'style', status: 'active' }];
      else if (path.startsWith('/admin/lookups/')) body = paged(lookups[path.split('/').at(-1)] || []);
      else if (path === '/admin/cars' && request.method() === 'GET') body = paged(cars);
      else if (path === '/admin/cars' && request.method() === 'POST') { const payload = request.postDataJSON(); writes.push({ method: 'POST', payload }); body = { id: 'created', ...payload }; }
      else if (/\/admin\/cars\/[^/]+$/.test(path)) {
        const car = cars.find(c => c.id === path.split('/').at(-1));
        assert(car, `Unknown fixture car ${path}`);
        if (request.method() === 'PATCH') { const payload = request.postDataJSON(); writes.push({ method: 'PATCH', payload }); Object.assign(car, payload); }
        body = car;
      } else body = { ...paged([]), notifications: [] };
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(`${process.env.ADMIN_TEST_URL || 'http://127.0.0.1:3102'}/san-pham`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('button', { name: 'Thêm xe', exact: true }).waitFor();
    if (width < 900 && await page.locator('main').evaluate(el => el.getBoundingClientRect().x > 100)) {
      await page.locator('header button').first().click();
      await page.waitForFunction(() => document.querySelector('main').getBoundingClientRect().x < 100);
    }
    const edit = id => page.getByRole('row').filter({ has: page.getByRole('switch', { name: `Nổi bật: ${cars.find(c => c.id === id).name}`, exact: true }) }).getByRole('button', { name: 'Chỉnh sửa', exact: true }).click();
    const checkbox = () => page.getByRole('checkbox', { name: 'Xe mới về', exact: true });
    const label = () => checkbox().locator('..');
    const save = async () => { await page.getByRole('button', { name: 'Cập nhật', exact: true }).click(); await checkbox().waitFor({ state: 'detached' }); };
    await edit('fresh'); await checkbox().waitFor();
    assert.equal(await checkbox().isChecked(), true); assert.equal(await checkbox().isEnabled(), true);
    assert.equal(await label().locator('time').getAttribute('datetime'), cars[0].createdAt);
    await checkbox().uncheck(); assert.match(await label().innerText(), /Đang tắt/);
    await save(); assert.equal(writes.at(-1).payload.newArrival, false);
    await edit('fresh'); assert.equal(await checkbox().isChecked(), false);
    await checkbox().check(); await save(); assert.equal(writes.at(-1).payload.newArrival, true);
    await edit('expired'); assert.equal(await checkbox().isChecked(), false); assert.equal(await checkbox().isDisabled(), true);
    assert.match(await label().innerText(), /Hết thời hạn/);
    await save(); assert.equal('newArrival' in writes.at(-1).payload, false, 'Expired checkbox must not interfere with other edits');
    await page.getByRole('button', { name: 'Thêm xe', exact: true }).click(); await checkbox().waitFor();
    assert.equal(await checkbox().isChecked(), true); assert.equal(await checkbox().isDisabled(), true); assert.match(await label().innerText(), /Mặc định bật/);
    // Complete the real create form to verify the disabled default is explicitly submitted.
    await page.locator('input[name="name"]').fill('Toyota Vios Created');
    await page.locator('select[name="brand"]').selectOption('Toyota'); await page.locator('select[name="model"]').selectOption('Vios'); await page.locator('select[name="version"]').selectOption('G');
    await page.locator('input[name="year"]').fill('2024'); await page.locator('input[name="price"]').fill('458000000');
    await page.locator('input[name="seatCount"]').fill('5'); await page.locator('select[name="transmissionId"]').selectOption('gear'); await page.locator('select[name="color"]').selectOption('Đen');
    await page.getByRole('button', { name: 'Thêm mới', exact: true }).click(); await checkbox().waitFor({ state: 'detached' });
    assert.equal(writes.at(-1).method, 'POST'); assert.equal(writes.at(-1).payload.newArrival, true);
    await edit('expiring'); assert.equal(await checkbox().isEnabled(), true);
    const remaining = await page.evaluate(expiry => expiry - Date.now(), Date.parse(cars[2].createdAt) + week);
    assert(remaining > 0); await page.clock.fastForward(remaining + 1);
    await page.waitForFunction(() => document.querySelector('input[name="newArrival"]')?.disabled);
    assert.equal(await checkbox().isChecked(), false); assert.match(await label().innerText(), /Đã khóa/);
    await checkbox().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `../toi-uu-hieu-suat-website/car-new-arrival/admin-${width}.png`, fullPage: true });
    assert.equal(await label().evaluate(el => el.scrollWidth > el.clientWidth), false,
      JSON.stringify(await label().evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, children: [...el.querySelectorAll('span')].map(s => ({ text: s.textContent, width: s.clientWidth, scroll: s.scrollWidth, whiteSpace: getComputedStyle(s).whiteSpace })) }))));
    await save(); assert.equal('newArrival' in writes.at(-1).payload, false);
    assert.deepEqual(errors, []);
    console.log(`PASS admin ${width}px: creation enabled, persisted toggles, entry date, expired lock, boundary while form open and other-field save`);
    await page.close();
  }
} finally { await browser.close(); }
