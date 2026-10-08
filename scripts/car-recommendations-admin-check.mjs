// Real admin UI + real Nest guards/services + isolated PostgreSQL fixture. No live DB/auth writes.
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const apiRoot = resolve('../api-xeluottoantrung'), req = createRequire(resolve(apiRoot, 'package.json'));
req('reflect-metadata');
const { PGlite } = req('@electric-sql/pglite'), { drizzle } = req('drizzle-orm/pglite');
const { Global, Module, ValidationPipe, UnauthorizedException } = req('@nestjs/common');
const { APP_GUARD, NestFactory } = req('@nestjs/core'), { FastifyAdapter } = req('@nestjs/platform-fastify');
const load = file => import(pathToFileURL(resolve(apiRoot, '.test-dist/src', file)).href);
const schema = await load('database/schema/index.js'), { DatabaseService } = await load('database/database.service.js');
const { CarRecommendationsModule } = await load('modules/car-recommendations/module.js');
const { RecommendationService } = await load('modules/car-recommendations/service.js');
const { seedCarRecommendations } = await load('database/seed/car-recommendations.js');
const { JwtAuthGuard } = await load('modules/auth/jwt-auth.guard.js'), { JwtVerifierService } = await load('modules/auth/jwt-verifier.service.js');
const { PermissionsGuard } = await load('modules/auth/permissions.guard.js'), { AdminAccessService } = await load('modules/auth/admin-access.service.js');
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const env = await readFile('.env', 'utf8'), authUrl = env.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)?.[1];
assert(authUrl, 'Only public auth URL is required; auth traffic is blocked');
const storageKey = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`, userId = randomUUID();
const enc = v => Buffer.from(JSON.stringify(v)).toString('base64url'), exp = Math.floor(Date.now() / 1000) + 3600;
const session = { access_token: `${enc({ alg: 'HS256' })}.${enc({ sub: userId, exp, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', expires_at: exp, expires_in: 3600, token_type: 'bearer', user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} } };
const pg = new PGlite(), browser = await chromium.launch({ channel: 'chrome', headless: true }); let app;
const artifacts = resolve(apiRoot, '.test-dist/needs-admin-ui'); await mkdir(artifacts, { recursive: true });
try {
  await pg.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
  for (const f of (await readdir(resolve(apiRoot, 'drizzle'))).filter(f => f.endsWith('.sql')).sort()) await pg.exec((await readFile(resolve(apiRoot, 'drizzle', f), 'utf8')).replaceAll('--> statement-breakpoint', ''));
  const db = drizzle(pg, { schema });
  const [profile] = await db.insert(schema.profiles).values({ authUserId: userId, fullName: 'Needs UI fixture' }).returning();
  const [brand] = await db.insert(schema.brands).values({ name: 'Toyota', slug: 'toyota' }).returning();
  const [model] = await db.insert(schema.carModels).values({ brandId: brand.id, name: 'Vios', slug: 'vios' }).returning();
  const cars = await db.insert(schema.cars).values([300000000, 400000000].map((price, i) => ({ name: `Toyota Vios ${i + 1}`, slug: `fixture-${i}`, price, year: 2023, status: 'active', seatCount: 5, brandId: brand.id, modelId: model.id, publishedAt: new Date() }))).returning();
  await seedCarRecommendations(db);
  let mode = 'admin', failOverview = false;
  const permissions = () => mode === 'admin' ? ['car_recommendation.sessions.read', 'car_recommendation.settings.update', 'car_recommendation.profiles.update'] : mode === 'reader' ? ['car_recommendation.sessions.read'] : [];
  class FixtureModule {} Global()(FixtureModule); Module({ imports: [CarRecommendationsModule], providers: [
    { provide: DatabaseService, useValue: { db } },
    { provide: JwtVerifierService, useValue: { verify: async token => { if (token !== session.access_token) throw new UnauthorizedException(); return { id: userId }; } } },
    { provide: AdminAccessService, useValue: { forAuthUser: async () => ({ profile, roles: ['ADMIN'], permissions: permissions() }) } },
    { provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: PermissionsGuard },
  ], exports: [DatabaseService] })(FixtureModule);
  app = await NestFactory.create(FixtureModule, new FastifyAdapter(), { logger: false }); app.setGlobalPrefix('api/v1'); app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init(); await app.getHttpAdapter().getInstance().ready(); const server = app.getHttpAdapter().getInstance();
  const service = app.get(RecommendationService), answers = { purposes: ['family'], budget: { min: 200000000, max: 500000000 }, passengers: '3_5', requireSeats: false, environment: 'city', priorities: ['space'], technical: { required: [] } };
  let original;
  for (let i = 0; i < 13; i++) { const r = await service.submit({ requestId: randomUUID(), capability: 'x'.repeat(43), answers: i === 12 ? { ...answers, budget: { min: 0, max: 50000000 } } : answers, noticeAccepted: true, completionMs: 40000 }); original ||= r.sessionId; if (i === 0) await service.event(r.sessionId, { capability: 'x'.repeat(43), type: 'result_viewed' }); }
  for (const width of [1440, 768, 390, 360]) {
    const page = await browser.newPage({ viewport: { width, height: 950 } }), errors = [], calls = [];
    page.setDefaultTimeout(20000); page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(({ storageKey, session, width }) => { localStorage.setItem(storageKey, JSON.stringify(session)); if (width < 900) localStorage.setItem('admin-sidebar', 'false'); }, { storageKey, session, width });
    await page.route(`${authUrl}/**`, route => route.abort());
    await page.route('**/api/v1/admin/**', async route => {
      const r = route.request(), u = new URL(r.url());
      if (u.pathname.endsWith('/admin/me')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ profile, roles: ['ADMIN'], permissions: permissions() }) });
      if (!u.pathname.includes('/car-recommendations')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [], meta: { total: 0 }, notifications: [] }) });
      calls.push({ method: r.method(), query: u.search, path: u.pathname });
      if (failOverview && u.pathname.endsWith('/overview')) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Lỗi thống kê fixture' }) });
      assert.equal(r.headers().authorization, `Bearer ${session.access_token}`, 'UI sends its access token');
      const response = await server.inject({ method: r.method(), url: u.pathname + u.search, ...(r.postData() ? { payload: r.postData() } : {}), headers: { authorization: r.headers().authorization, 'content-type': 'application/json' } });
      if (u.pathname.endsWith('/overview') && response.statusCode === 200) { const data = response.json(); assert.equal(data.trend.reduce((n, d) => n + d.count, 0), data.total, 'daily totals equal cohort total'); }
      if (response.statusCode >= 400) console.log('API fixture error', u.pathname, response.statusCode, response.body);
      await route.fulfill({ status: response.statusCode, contentType: 'application/json', body: response.body });
    });
    const goto = async () => { await page.goto(`${process.env.ADMIN_TEST_URL || 'http://localhost:3001'}/tien-ich/mua-xe-theo-nhu-cau`, { waitUntil: 'domcontentloaded', timeout: 90000 }); await page.getByText('Khảo sát hoàn tất', { exact: true }).waitFor(); };
    const tab = name => page.getByRole('navigation', { name: 'Quản lý Mua xe theo nhu cầu' }).getByRole('button', { name, exact: true });
    await goto(); await page.waitForTimeout(400); assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= innerWidth + 2), true);
    const positions = await tab('Tổng quan').boundingBox(); await page.screenshot({ path: resolve(artifacts, `overview-${width}.png`), fullPage: true });
    assert(await page.locator('.tt-needs-trend span').evaluateAll(elements => elements.some(el => el.getBoundingClientRect().height > 20)), 'Nonzero daily totals produce a visible chart bar');
    assert(await page.locator('.tt-needs-trend').evaluate(el => el.scrollWidth <= el.clientWidth + 2), 'Default 30-day chart fits on mobile');
    await tab('Lịch sử khảo sát').click(); await page.getByRole('button', { name: 'Xem chi tiết', exact: true }).first().waitFor();
    const after = await tab('Tổng quan').boundingBox(); assert.equal(Math.round(positions.x), Math.round(after.x)); assert.equal(Math.round(positions.width), Math.round(after.width));
    await Promise.all([page.waitForResponse(r => r.url().includes('/sessions?') && r.url().includes('page=2') && r.status() === 200), page.getByRole('button', { name: '2', exact: true }).click()]);
    await page.getByLabel('Số xe được đề xuất', { exact: true }).fill('0'); await page.getByRole('button', { name: 'Lọc khảo sát', exact: true }).click(); await page.getByText('0 xe · —/100', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Đặt lại bộ lọc', exact: true }).click(); await page.getByRole('button', { name: 'Xem chi tiết', exact: true }).first().click(); await page.getByRole('heading', { name: 'Chi tiết khảo sát', exact: true }).waitFor(); await page.screenshot({ path: resolve(artifacts, `history-${width}.png`), fullPage: true });
    await tab('Cấu hình câu hỏi & thuật toán').click(); await page.getByRole('heading', { name: 'Cấu hình hiện hành', exact: true }).waitFor();
    if (width === 1440) {
      const first = page.locator('details.tt-needs-question').first(); await first.locator('summary').click(); await first.getByLabel('Tiêu đề câu hỏi', { exact: true }).fill('Mục đích mua xe của bạn?');
      await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click(); await page.getByText('Đã lưu cấu hình và áp dụng cho khảo sát mới.', { exact: true }).waitFor();
      const publicConfig = await service.config(); assert.equal(publicConfig.questions[0].title, 'Mục đích mua xe của bạn?'); const detail = await service.detail(original); assert.notEqual(detail.snapshot.questions[0].title, publicConfig.questions[0].title);
      await page.getByRole('button', { name: 'Khôi phục giá trị mặc định', exact: true }).click(); await page.getByRole('button', { name: 'Hủy', exact: true }).click();
      await page.getByRole('button', { name: 'Xem thử xếp hạng', exact: true }).click(); await page.getByText(/Toyota Vios 1 ·/).waitFor();
    }
    await page.screenshot({ path: resolve(artifacts, `settings-${width}.png`), fullPage: true });
    await tab('Đặc tính tư vấn xe').click(); await page.getByRole('button', { name: 'Xem chi tiết', exact: true }).first().waitFor();
    if (width === 1440) {
      await page.getByRole('row').filter({ hasText: 'Toyota Vios 2' }).getByRole('button', { name: 'Xem chi tiết', exact: true }).click();
      await page.getByLabel('Điểm Đưa đón gia đình', { exact: true }).selectOption('5'); await page.getByLabel('Căn cứ Đưa đón gia đình', { exact: true }).fill('Synthetic fixture inspection only');
      await page.getByRole('button', { name: 'Lưu đánh giá', exact: true }).click(); await page.getByText('Đã lưu đánh giá 1 xe.', { exact: true }).waitFor();
      await page.getByLabel('Chọn xe Toyota Vios 1', { exact: true }).check(); await page.getByLabel('Chọn xe Toyota Vios 2', { exact: true }).check(); await page.getByRole('button', { name: 'Đánh giá các xe đã chọn', exact: true }).click();
      await page.getByLabel('Điểm Trong đô thị', { exact: true }).selectOption('4'); await page.getByLabel('Căn cứ Trong đô thị', { exact: true }).fill('Synthetic road inspection of both fixture cars'); await page.getByText('Tôi đã đối chiếu các căn cứ đã nhập với từng xe được chọn.', { exact: true }).click(); await page.getByRole('button', { name: 'Lưu đánh giá', exact: true }).click(); await page.getByText('Đã lưu đánh giá 2 xe.', { exact: true }).waitFor();
    }
    await page.getByRole('button', { name: 'Xem chi tiết', exact: true }).first().click(); await page.getByLabel('Điểm Đưa đón gia đình', { exact: true }).waitFor(); await page.screenshot({ path: resolve(artifacts, `profile-${width}.png`), fullPage: true });
    assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= innerWidth + 2), true); assert.deepEqual(errors, []);
    if (width === 1440) {
      failOverview = true; await tab('Tổng quan').click(); await page.getByText('Lỗi thống kê fixture', { exact: true }).waitFor(); failOverview = false; await page.getByRole('button', { name: 'Thử lại', exact: true }).click(); await page.getByText('Khảo sát hoàn tất', { exact: true }).waitFor();
      await page.getByLabel('Từ ngày', { exact: true }).fill('2025-01-01'); await page.getByLabel('Đến ngày', { exact: true }).fill('2025-01-02'); await page.getByRole('button', { name: 'Xem thống kê', exact: true }).click(); await page.getByText('Chưa có khảo sát trong khoảng ngày này.', { exact: true }).waitFor();
      mode = 'reader'; await page.reload({ waitUntil: 'domcontentloaded' }); await tab('Cấu hình câu hỏi & thuật toán').click(); await page.getByRole('heading', { name: 'Cấu hình hiện hành', exact: true }).waitFor(); assert.equal(await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).count(), 0); assert.equal(await page.getByLabel('Ngân sách thấp nhất (đ)', { exact: true }).isDisabled(), true);
      mode = 'denied'; await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByText('Bạn không có quyền quản lý Mua xe theo nhu cầu.', { exact: true }).waitFor(); mode = 'admin';
    }
    assert(calls.some(c => c.query.includes('page=2'))); console.log(`PASS ${width}px: overview/history/settings/profiles, fixed tab layout, server pagination, no page overflow or JS errors.`); await page.close();
  }
} finally { if (app) await app.close(); await pg.close(); await browser.close(); }
