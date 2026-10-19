// Real production UI, intercepted auth/API/R2 fixtures only. No live writes.
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
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
const file = { name: 'replacement.png', mimeType: 'image/png', buffer: png };
const paged = data => ({ data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 950 } });
    const page = await context.newPage(); page.setDefaultTimeout(20000);
    await page.addInitScript(({ storageKey, session }) => { localStorage.setItem(storageKey, JSON.stringify(session)); localStorage.setItem('admin-sidebar', 'false'); }, { storageKey, session });
    const errors = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    const media = Array.from({ length: 10 }, (_, index) => ({ id: `media-${index}`, publicUrl: `https://images.fixture/${index}.png`, isCover: index === 0, sortOrder: index }));
    const car = { id: 'car', name: 'Toyota Vios', slug: 'vios', brand: { id: 'brand', name: 'Toyota', slug: 'toyota' }, model: { id: 'model', name: 'Vios', slug: 'vios' },
      version: 'G', year: 2024, price: 458000000, mileage: 10000, seatCount: 5, transmissionId: 'gear', transmission: 'Số tự động', colorId: 'color', color: 'Đen',
      status: 'active', fuel: 'Xăng', newArrival: true, createdAt: new Date().toISOString(), media };
    const accessory = { id: 'accessory', name: 'Camera', brandId: 'abrand', brand: 'Test', price: 100000, imageUrl: 'https://images.fixture/cover.png',
      imageUrls: ['https://images.fixture/a.png', 'https://images.fixture/b.png'], status: 'active' };
    const seo = { id: 'seo', routePath: '/san-pham', metaTitle: 'SEO fixture', ogImageUrl: 'https://images.fixture/seo.png', robotsIndex: true, robotsFollow: true };
    let logo = 'https://images.fixture/logo.png', uploadCount = 0;
    const lookups = { 'car-versions': [{ id: 'version', modelId: 'model', name: 'G', status: 'active' }], 'body-styles': [{ id: 'style', name: 'Sedan', status: 'active' }],
      transmissions: [{ id: 'gear', name: 'Số tự động', status: 'active' }], 'car-colors': [{ id: 'color', name: 'Đen', status: 'active' }], branches: [] };
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url()), method = req.method();
      if (url.host === 'images.fixture') return route.fulfill({ contentType: 'image/png', body: png });
      if (url.host === 'upload.fixture') return route.fulfill({ status: 200, body: '' });
      if (!url.pathname.startsWith('/api/v1/')) return url.origin === new URL(origin).origin ? route.continue() : route.abort();
      const path = url.pathname.replace('/api/v1', ''); let body;
      if (method !== 'GET') writes.push({ path, method, payload: req.postDataJSON() });
      if (path === '/admin/me') body = { profile: { id: userId, fullName: 'Image fixture', status: 'active' }, roles: ['ADMIN'], permissions: ['car.read', 'car.update', 'car.publish', 'content.update', 'content.delete', 'media.create', 'media.delete', 'seo.update'] };
      else if (path === '/admin/brands') body = [car.brand];
      else if (path === '/admin/car-models') body = [{ ...car.model, brandId: 'brand', bodyStyleId: 'style' }];
      else if (path.startsWith('/admin/lookups/')) body = paged(lookups[path.split('/').at(-1)] || []);
      else if (path.endsWith('/presign')) { uploadCount++; body = { uploadUrl: `https://upload.fixture/${uploadCount}`, publicUrl: `https://images.fixture/new-${uploadCount}.png`, storageKey: `new-${uploadCount}`, headers: { 'Content-Type': 'image/png' } }; }
      else if (path === '/admin/cars') body = paged([{ ...car, cover: media.find(item => item.isCover)?.publicUrl }]);
      else if (path === '/admin/cars/car') { if (method === 'PATCH') Object.assign(car, req.postDataJSON()); body = car; }
      else if (path.startsWith('/admin/cars/car/media/') && method === 'DELETE') { const index = media.findIndex(item => item.id === path.split('/').at(-1)); assert(index >= 0); media.splice(index, 1); body = {}; }
      else if (path === '/admin/cars/car/media' && method === 'POST') { assert(media.length < 10, 'Replacement must free selected slot before registering new media'); const payload = req.postDataJSON(); body = { id: `new-${uploadCount}`, publicUrl: `https://images.fixture/${payload.storageKey}.png`, isCover: payload.isCover, sortOrder: media.length }; media.push(body); }
      else if (path === '/admin/collections/accessory-brands') body = paged([{ id: 'abrand', name: 'Test' }]);
      else if (path === '/admin/collections/accessories') body = paged([accessory]);
      else if (path === '/admin/collections/accessories/accessory') { Object.assign(accessory, req.postDataJSON()); body = accessory; }
      else if (path === '/admin/site-settings/thiet-lap-logo') body = [{ key: 'logo', value: logo }];
      else if (path === '/admin/site-settings/thiet-lap-logo/logo') { logo = req.postDataJSON().value; body = { key: 'logo', value: logo }; }
      else if (path === '/admin/seo') { if (method === 'PUT') Object.assign(seo, req.postDataJSON()); body = method === 'GET' ? [seo] : seo; }
      else body = { ...paged([]), notifications: [] };
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
    });
    const go = async path => {
      await page.goto(`${origin}${path}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
      if (width < 900 && await page.locator('main').evaluate(el => el.getBoundingClientRect().x > 100)) await page.locator('header button').first().click();
    };
    const field = name => page.locator(`input[type="file"][name="${name}"]`).locator('..');
    await go('/san-pham'); await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).first().click();
    await page.locator('input[name="cover"]').waitFor({ state: 'attached' });
    assert(await page.locator('input[name="cover"]').isDisabled());
    await field('cover').getByRole('button', { name: 'Bỏ ảnh hiện tại 1' }).click();
    assert(await page.locator('input[name="cover"]').isEnabled()); assert.equal(writes.length, 0);
    await page.getByRole('button', { name: 'Quay lại danh sách', exact: true }).click();
    assert.equal(writes.length, 0, 'Cancel never deletes from storage');
    await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).first().click();
    await field('gallery').getByRole('button', { name: 'Bỏ ảnh hiện tại 1', exact: true }).click();
    await page.locator('input[name="gallery"]').setInputFiles(file);
    await page.getByRole('button', { name: 'Cập nhật', exact: true }).click();
    await page.locator('input[name="cover"]').waitFor({ state: 'detached' });
    assert.deepEqual(writes.filter(write => write.method === 'DELETE').map(write => write.path), ['/admin/cars/car/media/media-1']);
    assert.equal(media.length, 10); assert(media.some(row => row.id === 'media-0') && media.some(row => row.id === 'media-9'));
    writes.length = 0;
    await go('/phu-kien-o-to'); await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).first().click();
    await page.locator('input[name="imageUrl"]').waitFor({ state: 'attached' });
    assert(await page.locator('input[name="imageUrl"]').isDisabled());
    await field('imageUrl').getByRole('button', { name: 'Bỏ ảnh hiện tại 1', exact: true }).click();
    await page.locator('input[name="imageUrl"]').setInputFiles(file);
    await field('imageUrls').getByRole('button', { name: 'Bỏ ảnh hiện tại 2', exact: true }).click();
    assert.equal(writes.length, 0);
    await page.getByRole('button', { name: 'Cập nhật', exact: true }).click();
    await page.locator('input[name="imageUrl"]').waitFor({ state: 'detached' });
    const saved = writes.find(write => write.path === '/admin/collections/accessories/accessory').payload;
    assert.notEqual(saved.imageUrl, 'https://images.fixture/cover.png'); assert.deepEqual(saved.imageUrls, ['https://images.fixture/a.png']);
    writes.length = 0;
    await go('/thiet-lap/logo'); await page.locator('input[name="logo"]').waitFor({ state: 'attached' });
    assert(await page.locator('input[name="logo"]').isDisabled());
    await field('logo').getByRole('button', { name: 'Bỏ ảnh hiện tại 1', exact: true }).click();
    assert.equal(writes.length, 0);
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('input[name="logo__remove"]'));
    assert.equal(logo, ''); assert.equal(writes.length, 1);
    writes.length = 0;
    await go('/seo'); await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).first().click();
    await page.locator('input[name="ogImageUrl"]').fill('https://images.fixture/next-seo.png');
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await page.getByText('Nhấn dấu × ở ảnh hiện tại trước khi đổi đường dẫn ảnh.', { exact: true }).first().waitFor();
    assert.equal(writes.length, 0, 'Pasting a new SEO URL cannot delete the old image without explicit X');
    await field('ogImage').getByRole('button', { name: 'Bỏ ảnh hiện tại 1', exact: true }).click();
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await page.locator('input[name="ogImageUrl"]').waitFor({ state: 'detached' });
    assert.equal(writes.length, 1); assert.equal(seo.ogImageUrl, 'https://images.fixture/next-seo.png');
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px: explicit X, cancel, 10-image car replacement, preserve other photos, accessory cover/gallery, logo removal and SEO URL confirmation`);
    await context.close();
  }
} finally { await browser.close(); }
