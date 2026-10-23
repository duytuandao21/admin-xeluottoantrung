// Production Admin UI; all auth/API/upload requests intercepted locally.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const env = await readFile('.env', 'utf8');
const authUrl = env.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)?.[1];
assert(authUrl);
const storageKey = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`;
const userId = '49332fa0-8244-4b20-a8d0-9793b72ef689', exp = Math.floor(Date.now() / 1000) + 3600;
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const session = { access_token: `${encode({ alg: 'HS256' })}.${encode({ sub: userId, exp, role: 'authenticated' })}.fixture`,
  refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer',
  user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} } };
const base = 'http://127.0.0.1:3102';
const log = [];
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3102', '-H', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', data => log.push(String(data))); server.stderr.on('data', data => log.push(String(data)));
const directory = '../.tmp/tv-display-admin';
await mkdir(directory, { recursive: true });
let browser;
const results = [];
try {
  for (let i = 0; i < 100; i++) {
    try { await fetch(`${base}/dang-nhap`); break; } catch {
      if (server.exitCode !== null) throw new Error(log.join(''));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const width of [1440, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 950 }, serviceWorkers: 'block' });
    await context.addInitScript(({ storageKey, session, width }) => {
      localStorage.setItem(storageKey, JSON.stringify(session)); localStorage.setItem('admin-sidebar', width > 1000 ? 'true' : 'false');
    }, { storageKey, session, width });
    let saved = null, fail = true, readOnly = false, uploadCount = 0;
    const writes = [], errors = [];
    const logo = await readFile('scripts/fixtures/image-metadata/still.png');
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      const reply = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
      if (url.hostname === 'upload.fixture.invalid') { uploadCount++; return reply({}); }
      if (url.hostname === 'cdn.fixture.invalid') return route.fulfill({ contentType: 'image/png', body: logo });
      if (!url.pathname.startsWith('/api/v1/')) return url.origin === base ? route.continue() : route.abort();
      const path = url.pathname.slice('/api/v1'.length);
      if (path === '/admin/me') return reply({ profile: { id: userId, fullName: 'TV admin', status: 'active' }, roles: ['ADMIN'], permissions: readOnly ? ['content.read'] : ['content.read', 'content.update', 'media.upload'] });
      if (path === '/admin/site-settings/tv-display/config') {
        assert.equal(request.method(), 'PUT'); writes.push(request.postDataJSON());
        if (fail) { fail = false; return reply({ message: 'Lỗi lưu thử nghiệm' }, 503); }
        saved = JSON.parse(writes.at(-1).value); return reply({ key: 'config', value: JSON.stringify(saved) });
      }
      if (path === '/admin/site-settings/tv-display') return reply(saved ? [{ key: 'config', value: JSON.stringify(saved) }] : []);
      if (path === '/admin/site-settings/thiet-lap-logo') return reply([{ key: 'logo', value: '/images/logo-gold.png' }]);
      if (path === '/admin/content') return reply([
        { title: 'Sale HCM', phone: '0777262607', body: '(Tư vấn bán hàng HCM)', status: 'active' },
        { title: 'Sale Gia Lai', phone: '0777393913', body: '(Tư Vấn Bán Hàng Gia Lai)', status: 'active' },
        { title: 'Thu mua', phone: '0922325679', body: '(Thu mua)', status: 'active' },
        { title: 'Hidden', phone: '0777262609', body: '(Tư vấn bán hàng)', status: 'inactive' },
      ]);
      if (path === '/admin/media/assets/presign') return reply({ storageKey: 'assets/logo.png', uploadUrl: 'https://upload.fixture.invalid/logo',
        publicUrl: 'https://cdn.fixture.invalid/logo.png', headers: { 'Content-Type': 'image/png' } });
      assert.equal(request.method(), 'GET', `Unexpected mutation ${path}`);
      return reply({ data: [], meta: { total: 0, page: 1, totalPages: 0 }, notifications: [] });
    });
    const page = await context.newPage(); page.setDefaultTimeout(25000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.goto(`${base}/tv-display`);
    await page.getByLabel('Tiêu đề bảng giá', { exact: true }).waitFor();
    assert.equal(await page.locator('a[href="/tv-display"]').count(), 1);
    assert.equal(await page.locator('#tv-car-seconds').inputValue(), '15');
    assert.equal(await page.locator('#tv-phone-seconds').inputValue(), '5');
    assert.equal(await page.getByText('Sale HCM', { exact: true }).count(), 1);
    assert.equal(await page.getByText('Thu mua', { exact: true }).count(), 0);
    assert.equal(await page.getByText('Hidden', { exact: true }).count(), 0);
    await page.locator('input[type="checkbox"]').uncheck();
    assert.equal(await page.locator('#tv-number-0').inputValue(), '0777262607');
    await page.getByRole('button', { name: 'Đưa số 2 lên', exact: true }).click();
    assert.equal(await page.locator('#tv-number-0').inputValue(), '0777393913');
    await page.getByRole('button', { name: 'Thêm hotline', exact: true }).click();
    await page.locator('#tv-number-2').fill('0777393913');
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await page.getByText('Danh sách hotline bị trùng số.', { exact: true }).waitFor();
    assert.equal(writes.length, 0);
    await page.locator('#tv-number-2').fill('0901234567');
    await page.locator('#tv-title').fill('Bảng giá tại showroom');
    await page.locator('#tv-hotline-title').fill('Tư vấn bán hàng');
    await page.locator('#tv-car-seconds').fill('20'); await page.locator('#tv-phone-seconds').fill('7');
    await page.locator('input[type="file"][name="logo"]').setInputFiles(resolve('scripts/fixtures/image-metadata/still.png'));
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await page.getByText('Lỗi lưu thử nghiệm', { exact: true }).waitFor();
    assert.equal(await page.locator('#tv-title').inputValue(), 'Bảng giá tại showroom');
    assert.equal(await page.locator('input[type="file"]').evaluate(input => input.files.length), 1);
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await page.getByText(/Đã lưu TV Display\./).waitFor();
    assert.equal(uploadCount, 1, 'Retry uses the completed upload instead of uploading twice');
    assert.equal(saved.hotlines.length, 3); assert.equal(saved.hotlines[0].phone, '0777393913');
    assert.equal(saved.carIntervalSeconds, 20); assert.equal(saved.hotlineIntervalSeconds, 7);
    assert.equal(saved.logoUrl, 'https://cdn.fixture.invalid/logo.png');
    await page.reload(); await page.locator('#tv-number-0').waitFor();
    assert.equal(await page.locator('#tv-car-seconds').inputValue(), '20');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false);
    await page.screenshot({ path: `${directory}/settings-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Bỏ ảnh hiện tại 1', exact: true }).click();
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
    await page.getByText(/Đã lưu TV Display\./).waitFor();
    assert.equal(saved.logoUrl, '', 'Explicit remove clears only the TV logo override');
    readOnly = true;
    await page.reload(); await page.locator('#tv-title').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).count(), 0);
    assert.equal(await page.locator('#tv-title').isDisabled(), true);
    assert.deepEqual(errors, []);
    results.push({ width, loadSaveReload: 'PASS', salesOnly: 'PASS', reorder: 'PASS', duplicates: 'PASS',
      failedSaveRetainsFormAndUpload: 'PASS', explicitLogoRemoval: 'PASS', readOnly: 'PASS', overflow });
    await context.close();
  }
  await writeFile(`${directory}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close(); server.kill();
  if (server.exitCode === null) await Promise.race([once(server, 'exit'), new Promise(resolve => setTimeout(resolve, 3000))]);
  await writeFile(`${directory}/server.log`, log.join(''));
}
