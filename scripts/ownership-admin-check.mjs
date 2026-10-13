// Real production Admin UI and Nest guards, with a disposable PGlite database.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
const adminRoot = process.cwd(), apiRoot = resolve('../api-xeluottoantrung');
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const { ownershipFixture } = await import(pathToFileURL(resolve(apiRoot, '.test-dist/test/fixtures/ownership.js')).href);
process.chdir(apiRoot); const f = await ownershipFixture(); process.chdir(adminRoot);
let browser, child; const artifacts = resolve(apiRoot, '.test-dist/ownership-admin-ui'); await mkdir(artifacts, { recursive: true });
let authUrl = '';
async function findAuth(dir) { for (const item of await readdir(dir, { withFileTypes: true })) { const path = resolve(dir, item.name); if (item.isDirectory()) await findAuth(path); else if (item.name.endsWith('.js') && !authUrl) authUrl = (await readFile(path, 'utf8')).match(/https:\/\/[a-z0-9-]+\.supabase\.co/)?.[0] || ''; } }
await findAuth('.next/static/chunks'); assert(authUrl, 'Built bundle must contain configured public auth URL; no .env is read');
const storageKey = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`;
const userId = crypto.randomUUID(), enc = v => Buffer.from(JSON.stringify(v)).toString('base64url'), exp = Math.floor(Date.now() / 1000) + 3600;
const session = { access_token: `${enc({ alg: 'HS256' })}.${enc({ sub: userId, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} } };
try {
  child = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'start', '--port', '3005'], { cwd: adminRoot, windowsHide: true, stdio: 'ignore' });
  for (let attempt = 0; ; attempt++) { try { const response = await fetch('http://127.0.0.1:3005/tien-ich/chi-phi-su-dung-xe'); if (response.ok) break; } catch {} if (attempt > 40) throw new Error('Isolated Admin server unavailable'); await new Promise(r => setTimeout(r, 500)); }
  const config = (await f.server.inject({ method: 'GET', url: `/api/v1/cars/${f.car.id}/ownership-config` })).json();
  for (let i = 0; i < 23; i++) { const response = await f.server.inject({ method: 'POST', url: `/api/v1/cars/${f.car.id}/ownership-calculate`, remoteAddress: `192.0.2.${i + 1}`, payload: { interactionId: crypto.randomUUID(), requestId: crypto.randomUUID(), capability: 'a'.repeat(48), expectedRevision: 0, answers: { ...config.defaults, monthlyKm: 1000 + i * 100, ...(i % 2 ? { financed: true, ...config.loanDefaults } : {}) } } }); assert.equal(response.statusCode, 200, response.body); }
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 950 } }); page.setDefaultTimeout(20000); const errors = []; let mode = 'admin', acceptDialogs = true;
    const permissions = () => mode === 'admin' ? ['ownership.read', 'ownership.settings.update', 'ownership.profiles.update'] : ['ownership.read'];
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => acceptDialogs ? d.accept() : d.dismiss());
    await page.addInitScript(({ storageKey, session }) => { localStorage.setItem(storageKey, JSON.stringify(session)); localStorage.setItem('admin-sidebar', 'false'); }, { storageKey, session });
    await page.route('**/*', async route => {
      const r = route.request(), u = new URL(r.url());
      if (u.pathname.startsWith('/api/v1/admin/')) {
        if (u.pathname.endsWith('/admin/me')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ profile: { id: userId, fullName: 'Kiểm thử Admin', status: 'active' }, roles: ['ADMIN'], permissions: permissions() }) });
        if (!u.pathname.startsWith('/api/v1/admin/ownership')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 }, notifications: [] }) });
        assert.equal(r.headers().authorization, `Bearer ${session.access_token}`);
        const response = await f.server.inject({ method: r.method(), url: u.pathname + u.search, headers: { authorization: `Bearer ownership-${mode}`, ...(r.postData() ? { 'content-type': 'application/json' } : {}) }, ...(r.postData() ? { payload: r.postData() } : {}) });
        return route.fulfill({ status: response.statusCode, contentType: 'application/json', body: response.body });
      }
      if (!['localhost', '127.0.0.1'].includes(u.hostname)) return route.abort(); return route.continue();
    });
    await page.goto('http://127.0.0.1:3005/tien-ich/chi-phi-su-dung-xe', { waitUntil: 'networkidle' });
    await page.getByText('Khảo sát hoàn tất', { exact: true }).waitFor();
    await page.screenshot({ path: `${artifacts}/${width}-overview.png` });
    await page.getByRole('button', { name: 'Lịch sử khảo sát', exact: true }).click();
    await page.getByText('23 lượt phù hợp bộ lọc.', { exact: true }).waitFor();
    await page.getByRole('button', { name: '2', exact: true }).click(); await page.getByText('Hiển thị 21-23 / 23', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Chi tiết', exact: true }).first().click(); await page.getByRole('heading', { name: 'Chi tiết lượt tính', exact: true }).waitFor();
    await page.screenshot({ path: `${artifacts}/${width}-detail.png` });
    await page.getByRole('button', { name: 'Quay lại lịch sử', exact: true }).click();
    await page.getByLabel('Thanh toán', { exact: true }).selectOption('loan'); await page.getByRole('button', { name: 'Áp dụng bộ lọc', exact: true }).click(); await page.getByText('11 lượt phù hợp bộ lọc.', { exact: true }).waitFor();
    await page.screenshot({ path: `${artifacts}/${width}-surveys.png` });
    await page.getByRole('button', { name: 'Cấu hình chi phí', exact: true }).click();
    await page.getByRole('button', { name: /Nhiên liệu & tiêu hao/ }).click();
    await page.getByLabel('Giá xăng (VNĐ/lít)', { exact: true }).fill(String(25000 + width));
    acceptDialogs = false; await page.getByRole('button', { name: 'Lịch sử khảo sát', exact: true }).click(); acceptDialogs = true;
    assert.equal(await page.getByLabel('Giá xăng (VNĐ/lít)', { exact: true }).inputValue(), String(25000 + width), 'Canceling tab navigation preserves the draft');
    await page.getByLabel('Hao hụt sạc xe điện (%)', { exact: true }).fill('12');
    await page.getByRole('button', { name: /Khảo sát mặc định/ }).click();
    await page.getByLabel('Km/tháng mặc định', { exact: true }).fill('-1');
    await page.getByRole('button', { name: /Nhiên liệu & tiêu hao/ }).click();
    await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click();
    await page.getByLabel('Km/tháng mặc định', { exact: true }).waitFor({ state: 'visible' });
    assert.equal(await page.getByRole('dialog').count(), 0, 'Invalid hidden fields reveal their section instead of saving');
    await page.getByLabel('Km/tháng mặc định', { exact: true }).fill('1700');
    await page.getByRole('button', { name: /Nhiên liệu & tiêu hao/ }).click();
    assert.equal(await page.getByLabel('Giá xăng (VNĐ/lít)', { exact: true }).inputValue(), String(25000 + width));
    await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click();
    await page.getByRole('button', { name: 'Lưu và áp dụng', exact: true }).click();
    await page.getByText('Đã lưu cấu hình hiện hành.', { exact: true }).first().waitFor();
    const current = (await f.server.inject({ method: 'GET', url: `/api/v1/cars/${f.car.id}/ownership-config` })).json(); assert.equal(current.defaults.energyPrice, 25000 + width); assert.equal(current.chargingLoss, .12); assert.equal(current.defaults.monthlyKm, 1700);
    await page.screenshot({ path: `${artifacts}/${width}-settings.png` });
    await page.getByRole('button', { name: /Phí & bảo hiểm/ }).click();
    await page.getByRole('button', { name: 'Thêm khoản phí', exact: true }).click();
    await page.locator('.tt-ownership-rule[open]').getByLabel('Tên phí', { exact: true }).fill('Phí thử giao diện');
    assert.equal(await page.locator('.tt-ownership-rule[open]').getByLabel('Tên phí', { exact: true }).isVisible(), true, 'Editing a new fee must not collapse its card');
    await page.locator('.tt-ownership-rule[open]').getByLabel('Tiền cố định (VNĐ)', { exact: true }).fill('100000');
    await page.getByRole('button', { name: /Bảo dưỡng & khấu hao/ }).click();
    await page.screenshot({ path: `${artifacts}/${width}-maintenance.png` });
    await page.getByRole('button', { name: /Phí & bảo hiểm/ }).click();
    assert.equal(await page.locator('.tt-ownership-rule[open]').getByLabel('Tiền cố định (VNĐ)', { exact: true }).inputValue(), '100000');
    await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click(); await page.getByRole('button', { name: 'Lưu và áp dụng', exact: true }).click();
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Lưu cấu hình' && button.disabled));
    await page.getByRole('button', { name: /Phí & bảo hiểm/ }).click();
    await page.locator('summary').filter({ hasText: 'Phí thử giao diện' }).click();
    await page.getByRole('button', { name: 'Bỏ khoản phí', exact: true }).click();
    await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).click(); await page.getByRole('button', { name: 'Lưu và áp dụng', exact: true }).click();
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Lưu cấu hình' && button.disabled));
    await page.getByRole('button', { name: 'Định mức theo xe', exact: true }).click(); await page.getByRole('button', { name: 'Thêm định mức', exact: true }).click();
    await page.getByLabel('Tên định mức', { exact: true }).fill(`Định mức riêng ${width}`); await page.getByLabel('Đối tượng áp dụng', { exact: true }).selectOption(f.car.id);
    await page.getByLabel('Xăng (lít/100 km)', { exact: true }).fill('6.5'); await page.getByRole('button', { name: 'Lưu định mức', exact: true }).click(); await page.getByText('Đã lưu định mức.', { exact: true }).first().waitFor();
    assert.equal((await f.server.inject({ method: 'GET', url: `/api/v1/cars/${f.car.id}/ownership-config` })).json().consumption, 6.5);
    await page.screenshot({ path: `${artifacts}/${width}-profiles.png` });
    await page.getByRole('button', { name: `Xóa định mức Định mức riêng ${width}`, exact: true }).click(); await page.getByRole('button', { name: 'Xóa định mức', exact: true }).click();
    await page.getByText(`Định mức riêng ${width}`, { exact: true }).waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Thêm định mức', exact: true }).click(); await page.getByLabel('Tên định mức', { exact: true }).fill('Lịch bảo dưỡng');
    await page.getByLabel('Đối tượng áp dụng', { exact: true }).selectOption(f.car.id);
    await page.getByRole('button', { name: 'Bảo dưỡng & khấu hao', exact: true }).click();
    await page.getByLabel('Phương pháp dự toán', { exact: true }).selectOption('scheduled');
    await page.getByRole('button', { name: 'Lưu định mức', exact: true }).click(); await page.getByText('Đã lưu định mức.', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: 'Xóa định mức Lịch bảo dưỡng', exact: true }).click(); await page.getByRole('button', { name: 'Xóa định mức', exact: true }).click();
    await page.getByText('Lịch bảo dưỡng', { exact: true }).waitFor({ state: 'hidden' });
    mode = 'reader'; await page.reload({ waitUntil: 'networkidle' }); await page.getByRole('button', { name: 'Cấu hình chi phí', exact: true }).click(); assert.equal(await page.getByRole('button', { name: 'Lưu cấu hình', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: /Nhiên liệu & tiêu hao/ }).click(); assert.equal(await page.getByLabel('Giá xăng (VNĐ/lít)', { exact: true }).isDisabled(), true);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'No page horizontal overflow');
    assert.deepEqual(errors, []); console.log(`Ownership Admin ${width}px passed: overview/history, section drafts, percent conversion, fees, profiles, maintenance and read-only permissions.`); await page.close();
  }
} finally { await browser?.close(); if (child) child.kill(); await f.close(); }
