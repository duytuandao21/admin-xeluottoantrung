// Production UI regression, isolated local browser fixtures only. No real login or mutations.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const output = resolve('../.tmp/cloudflare-analytics/ui'); await mkdir(output, { recursive: true });
let authUrl = '';
async function findAuth(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, item.name);
    if (item.isDirectory()) await findAuth(path);
    else if (item.name.endsWith('.js') && !authUrl) authUrl = (await readFile(path, 'utf8')).match(/https:\/\/[a-z0-9-]+\.supabase\.co/)?.[0] || '';
  }
}
await findAuth('.next/static/chunks'); assert(authUrl, 'Production build needs public Supabase URL');
const key = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`;
const id = crypto.randomUUID(), enc = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const exp = Math.floor(Date.now() / 1000) + 3600;
const session = { access_token: `${enc({ alg: 'HS256' })}.${enc({ sub: id, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user: { id, email: 'analytics@example.test', app_metadata: {}, user_metadata: {} } };
const unavailable = { reason: 'Dataset không được cấp quyền hoặc không khả dụng trên gói/token Cloudflare hiện tại.', limits: null };
const fixture = {
  hostname: 'toantrungxeluot.io.vn', generatedAt: '2026-10-20T00:00:00Z', expiresAt: '2026-10-20T00:10:00Z',
  period: { range: '24h', from: '2026-10-18T23:55:00Z', to: '2026-10-19T23:55:00Z', lagSeconds: 300 },
  availableRanges: [{ id: '1h', label: '1 giờ qua' }, { id: '24h', label: '24 giờ qua' }, { id: '7d', label: '7 ngày qua' }],
  http: { requests: 1234, bytes: 2097152, visits: 19, sampleInterval: 1.5, reason: null, limits: null,
    trend: [{ name: '2026-10-19T00:00:00Z', count: 1234 }], countries: [{ name: 'VN', count: 1234 }],
    paths: [{ name: '/san-pham', count: 1234 }], cache: [{ name: 'hit', count: 617 }, { name: 'miss', count: 617 }], cacheHitRatio: 0.5 },
  webAnalytics: { pageViews: 222, visits: 18, uniqueVisitors: null, reason: null, limits: null,
    bucket: 'hour', trend: [{ name: '2026-10-19T00:00:00Z', count: 90, visits: 10 }, { name: '2026-10-19T01:00:00Z', count: 82, visits: 5 }, { name: '2026-10-19T03:00:00Z', count: 50, visits: 3 }],
    devices: [{ name: 'mobile', count: 200 }, { name: 'desktop', count: 22 }], countries: [{ name: 'VN', count: 222 }],
    pages: [{ name: '/toyota-vios-2025', count: 150 }, { name: '/', count: 72 }],
    cars: [{ name: 'Toyota Vios 2025', path: '/toyota-vios-2025', count: 150 }], carsReason: null, pathsLimited: false, pathsLimit: 1000 },
  security: { ...unavailable, events: null, actions: null },
};
let browser, child;
const cases = [];
try {
  child = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'start', '--port', '3006', '--hostname', '127.0.0.1'], {
    cwd: root, env: { ...process.env, API_URL: 'http://127.0.0.1:9' }, windowsHide: true, stdio: 'ignore',
  });
  for (let attempt = 0; ; attempt++) {
    try { if ((await fetch('http://127.0.0.1:3006/thong-ke')).ok) break; } catch { /* startup */ }
    if (child.exitCode !== null || attempt > 90) throw Error('Isolated Next server did not start');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 950 }, hasTouch: width === 390, isMobile: width === 390 });
    page.setDefaultTimeout(20000);
    let mode = 'data', analyticsCalls = 0;
    const errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ key, session }) => { localStorage.setItem(key, JSON.stringify(session)); localStorage.setItem('admin-sidebar', 'false'); }, { key, session });
    await page.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.hostname === 'api.cloudflare.com') external.push(url.hostname);
      if (url.pathname.endsWith('/api/v1/admin/me')) return route.fulfill({ json: { profile: { id, fullName: 'Kiểm thử thống kê', status: 'active' }, roles: ['ADMIN'], permissions: mode === 'denied' ? ['dashboard.read'] : ['dashboard.read', 'analytics.read'] } });
      if (url.pathname.endsWith('/api/v1/admin/dashboard/analytics')) {
        analyticsCalls++; assert.equal(request.headers().authorization, `Bearer ${session.access_token}`);
        if (mode === 'error') return route.fulfill({ status: 503, json: { message: 'Không lấy được thống kê lúc này.' } });
        const data = structuredClone(fixture); data.period.range = url.searchParams.get('range') || '24h';
        if (mode === 'dense') { data.webAnalytics = { ...data.webAnalytics, pageViews: 61, visits: 18, bucket: 'minute',
          trend: Array.from({ length: 61 }, (_, index) => ({ name: new Date(Date.UTC(2026, 9, 19, 0, index)).toISOString(), count: 1, visits: index < 18 ? 1 : 0 })),
          devices: [{ name: 'mobile', count: 61 }], countries: [{ name: 'VN', count: 61 }], pages: [{ name: '/', count: 61 }], cars: [] }; }
        if (mode === 'daily') data.webAnalytics = { ...data.webAnalytics, bucket: 'day', trend: [{ name: '2026-10-19', count: 90, visits: 10 }, { name: '2026-10-20', count: 132, visits: 8 }] };
        if (mode === 'missing-visits') data.webAnalytics = { ...data.webAnalytics, visits: null, trend: [{ name: '2026-10-19T00:00:00Z', count: 222, visits: null }] };
        if (mode === 'zero-visits') data.webAnalytics = { ...data.webAnalytics, visits: 0, trend: data.webAnalytics.trend.map(row => ({ ...row, visits: 0 })) };
        if (mode === 'empty') { data.http = { ...data.http, requests: 0, bytes: 0, visits: 0, countries: [], paths: [], cache: [], trend: [], cacheHitRatio: null }; data.webAnalytics = { ...data.webAnalytics, pageViews: null, visits: null, trend: [], devices: [], countries: [], pages: [], cars: [], reason: 'Chưa có dữ liệu Web Analytics.' }; }
        return route.fulfill({ json: data, headers: { 'Cache-Control': 'private, no-store' } });
      }
      if (url.pathname.endsWith('/api/v1/admin/dashboard')) return route.fulfill({ json: { cars: 15, unreadLeads: 2, customers: 7 } });
      if (url.pathname.endsWith('/api/v1/admin/leads')) return route.fulfill({ json: { data: [{ id: 'fixture-lead', name: 'Khách thử tổng quan', phone: '0900000000', carName: 'Xe liên hệ kiểm thử', createdAt: '2026-10-20T00:00:00Z', status: 'unread' }], meta: { total: 1 } } });
      if (url.pathname.endsWith('/api/v1/admin/cars')) return route.fulfill({ json: { data: [{ id: 'fixture-car', slug: 'xe-noi-bat-kiem-thu', name: 'Xe nổi bật kiểm thử', brand: { id: 'brand', name: 'Toyota', slug: 'toyota' }, model: { id: 'model', name: 'Vios', slug: 'vios' }, year: 2025, price: 500000000, status: 'active', featured: true }], meta: { total: 1 } } });
      if (url.pathname.startsWith('/api/v1/admin/')) return route.fulfill({ json: {} });
      if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
      return route.continue();
    });
    await page.goto('http://127.0.0.1:3006/thong-ke', { waitUntil: 'networkidle' });
    await page.locator('.stagger-children').getByText('18', { exact: true }).waitFor();
    assert.equal(await page.locator('.stagger-children').getByText('222', { exact: true }).count(), 1);
    await page.getByText('Toyota Vios 2025', { exact: true }).waitFor();
    await page.getByText('Điện thoại', { exact: true }).waitFor();
    await page.getByText('Chưa có dữ liệu', { exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Xu hướng HTTP requests', exact: true }).count(), 0);
    assert.equal(await page.getByText('HTTP requests (gồm tài nguyên và bot)', { exact: true }).isVisible(), false);
    assert.equal(await page.getByText('Trang chủ (/)', { exact: true }).count(), 1);
    const chart = page.getByRole('group', { name: 'Xu hướng lượt xem trang và lượt truy cập', exact: true });
    const yAxis = page.getByRole('group', { name: 'Trục số lượt', exact: true });
    const xAxis = page.getByRole('group', { name: 'Trục thời gian', exact: true });
    await yAxis.getByText('0', { exact: true }).waitFor();
    await yAxis.getByText('100', { exact: true }).waitFor();
    await xAxis.getByText('07:00', { exact: true }).waitFor();
    assert.equal(await chart.getByRole('button').count(), 3, 'Missing hour remains a gap, not a synthetic zero');
    const point = chart.getByRole('button');
    const showPoint = async target => width === 390 ? target.tap() : target.hover();
    await showPoint(point.first());
    const tooltip = page.getByRole('tooltip');
    await tooltip.waitFor();
    assert.match(await tooltip.textContent(), /07:00.*19\/10\/2026/);
    assert.equal(await tooltip.getByText('90', { exact: true }).count(), 1);
    assert.equal(await tooltip.getByText('10', { exact: true }).count(), 1);
    const tooltipBox = await tooltip.boundingBox(), plotBox = await page.locator('[data-traffic-plot]').boundingBox();
    assert(tooltipBox.x >= plotBox.x && tooltipBox.x + tooltipBox.width <= plotBox.x + plotBox.width + 1, 'Tooltip stays inside chart width');
    await page.screenshot({ path: resolve(output, `${width}-chart-tooltip.png`), fullPage: true });
    if (width === 390) await page.getByRole('heading', { name: 'Thống kê', exact: true }).tap();
    else await page.getByRole('heading', { name: 'Thống kê', exact: true }).hover();
    await tooltip.waitFor({ state: 'hidden' });
    await point.last().focus();
    await tooltip.getByText('50', { exact: true }).waitFor();
    await point.last().press('ArrowLeft');
    await tooltip.getByText('82', { exact: true }).waitFor();
    await point.nth(1).press('Escape');
    await tooltip.waitFor({ state: 'hidden' });
    await page.screenshot({ path: resolve(output, `${width}-business.png`), fullPage: true });
    await page.locator('summary').filter({ hasText: 'Thông tin kỹ thuật' }).click();
    await page.getByText('HTTP requests (gồm tài nguyên và bot)', { exact: true }).waitFor();
    await page.getByText(/N\/A — Dataset không được cấp quyền/).waitFor();
    assert.equal(await page.locator('[aria-busy] section').count(), 7);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No horizontal overflow at ${width}`);
    await page.screenshot({ path: resolve(output, `${width}-data.png`), fullPage: true });
    await page.getByLabel('Thời gian', { exact: true }).selectOption('1h');
    await page.waitForFunction(() => document.querySelector('select')?.value === '1h' && document.querySelector('[aria-busy="false"]'));
    assert.equal(await page.locator('.stagger-children').getByText('18', { exact: true }).count(), 1);
    mode = 'dense'; await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
    await page.locator('.stagger-children').getByText('61', { exact: true }).waitFor();
    assert.equal(await chart.getByRole('button').count(), 61);
    assert.equal(await chart.evaluate(element => element.scrollWidth > element.clientWidth), false, 'Dense minute chart has no horizontal overflow');
    await showPoint(chart.getByRole('button').last());
    await tooltip.getByText('0', { exact: true }).waitFor();
    assert.equal(await yAxis.getByText('1', { exact: true }).count(), 1, 'Small integer count scale has no fractional ticks');
    mode = 'daily'; await page.getByLabel('Thời gian', { exact: true }).selectOption('7d');
    await page.locator('.stagger-children').getByText('222', { exact: true }).waitFor();
    await xAxis.getByText(/^20[/-]10$/).waitFor();
    await showPoint(chart.getByRole('button').last());
    assert.match(await tooltip.textContent(), /20\/10\/2026/);
    mode = 'missing-visits'; await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
    await page.locator('.stagger-children').getByText('N/A', { exact: true }).waitFor();
    await showPoint(chart.getByRole('button').first());
    await tooltip.getByText('Chưa có dữ liệu', { exact: true }).waitFor();
    mode = 'empty'; await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
    await page.getByText(/Web Analytics: N\/A — Chưa có dữ liệu/).waitFor();
    assert.equal(await page.getByText('0', { exact: true }).count(), 1, 'Real zero request count survives; no fabricated page view zero');
    mode = 'error'; await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Không lấy được thống kê lúc này.' }).waitFor();
    mode = 'denied'; const before = analyticsCalls; await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('alert').filter({ hasText: 'Bạn chưa được cấp quyền quản trị thống kê' }).waitFor();
    assert.equal(analyticsCalls, before, 'No statistics request without permission');
    assert.equal(await page.getByRole('link', { name: 'Thống kê', exact: true }).count(), 0);
    // The overview shares the analytics permission and backend snapshot, not dashboard.read.
    await page.goto('http://127.0.0.1:3006/', { waitUntil: 'networkidle' });
    await page.getByText('Bạn chưa được cấp quyền xem thống kê truy cập.', { exact: true }).waitFor();
    await page.locator('.stagger-children').getByText('15', { exact: true }).waitFor();
    assert.equal(analyticsCalls, before, 'Overview must not fetch analytics for dashboard-only accounts');
    assert.equal(await page.getByRole('link', { name: 'Xem chi tiết', exact: true }).count(), 0);
    mode = 'data'; await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Tổng quan', exact: true }).waitFor();
    await page.locator('.stagger-children').getByText('18', { exact: true }).waitFor();
    for (const value of ['15', '2', '7']) assert.equal(await page.locator('.stagger-children').getByText(value, { exact: true }).count(), 1);
    await page.getByText('Khách thử tổng quan', { exact: true }).waitFor();
    await page.getByText('Xe nổi bật kiểm thử', { exact: true }).waitFor();
    assert.equal(await page.locator('.stagger-children').getByText('222', { exact: true }).count(), 0, 'Overview card is RUM visits, not page views');
    await page.getByRole('group', { name: 'Trục số lượt', exact: true }).waitFor();
    await showPoint(chart.getByRole('button').first());
    await tooltip.getByText('90', { exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Xem chi tiết', exact: true }).getAttribute('href'), '/thong-ke');
    await page.getByLabel('Thời gian truy cập', { exact: true }).selectOption('1h');
    await page.getByText('Lượt truy cập (1 giờ qua)', { exact: true }).waitFor();
    await page.screenshot({ path: resolve(output, `${width}-overview.png`), fullPage: true });
    mode = 'error'; await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Không lấy được thống kê lúc này.' }).waitFor();
    assert.equal(await page.locator('.stagger-children').getByText('15', { exact: true }).count(), 1, 'Cloudflare failure leaves business counts intact');
    // Next's route announcer also has role=alert; only the dashboard content is relevant.
    assert.equal(await page.locator('main').getByRole('alert').count(), 0, 'Analytics failure is isolated from business summary');
    mode = 'empty'; await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Chưa có dữ liệu Web Analytics.' }).waitFor();
    assert.equal(await page.locator('.stagger-children').getByText('N/A', { exact: true }).count(), 1);
    mode = 'zero-visits'; await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
    await page.locator('.stagger-children').getByText('0', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overview has no horizontal overflow at ${width}`);
    assert.deepEqual(external, []); assert.deepEqual(errors, []);
    cases.push({ width, states: ['business-data', 'axes', 'hover-or-touch-tooltip', 'keyboard-tooltip', 'technical-collapsed-expanded', 'range', 'dense-minute', 'daily', 'missing-visits', 'empty', 'error', 'denied', 'overview-data', 'overview-permission', 'overview-range', 'overview-error-isolation', 'overview-empty-zero'], pageErrors: errors.length, directCloudflareCalls: external.length });
    await page.close();
  }
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ passed: true, cases }, null, 2));
  console.log(JSON.stringify({ passed: true, cases }));
} finally { if (browser) await browser.close(); if (child && child.exitCode === null) child.kill(); }
