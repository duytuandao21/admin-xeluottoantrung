import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const apiRoot = resolve('../api-xeluottoantrung'), apiRequire = createRequire(resolve(apiRoot, 'package.json'));
apiRequire('reflect-metadata');
const { PGlite } = apiRequire('@electric-sql/pglite'), { drizzle } = apiRequire('drizzle-orm/pglite');
const { Global, Module, ValidationPipe, UnauthorizedException } = apiRequire('@nestjs/common');
const { APP_GUARD, NestFactory } = apiRequire('@nestjs/core'), { FastifyAdapter } = apiRequire('@nestjs/platform-fastify');
const load = file => import(pathToFileURL(resolve(apiRoot, '.test-dist/src', file)).href);
const schema = await load('database/schema/index.js');
const { ValuationModule } = await load('modules/valuation/valuation.module.js');
const { DatabaseService } = await load('database/database.service.js');
const { DEFAULT_DISCLAIMER } = await load('modules/valuation/defaults.js');
const { VALUATION_PERMISSIONS } = await load('modules/valuation/domain.js');
const { valuationFixture } = await import(pathToFileURL(resolve(apiRoot, '.test-dist/test/valuation-fixture.js')).href);
const { JwtAuthGuard } = await load('modules/auth/jwt-auth.guard.js'), { JwtVerifierService } = await load('modules/auth/jwt-verifier.service.js');
const { PermissionsGuard } = await load('modules/auth/permissions.guard.js'), { AdminAccessService } = await load('modules/auth/admin-access.service.js');
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const env = await readFile('.env', 'utf8');
const authUrl = env.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)?.[1]; assert(authUrl, 'Admin Supabase public URL required; no real auth request is sent');
const storageKey = `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token`, userId = '49332fa0-8244-4b20-a8d0-9793b72ef689';
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url'), expires = Math.floor(Date.now() / 1000) + 3600;
const session = { access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: expires, role: 'authenticated' })}.fixture`, refresh_token: 'fixture', token_type: 'bearer', expires_at: expires, expires_in: 3600, user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {} } };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
// Every API/auth request is intercepted and sent to an isolated PGlite/Nest fixture.
// No production credentials, network database writes or real authentication are used.
try {
  for (const width of [1440, 1024, 768, 430, 390, 360]) {
    const pg = new PGlite(); let app;
    try {
      for (const file of (await readdir(resolve(apiRoot, 'drizzle'))).filter(file => file.endsWith('.sql')).sort()) await pg.exec((await readFile(resolve(apiRoot, 'drizzle', file), 'utf8')).replaceAll('--> statement-breakpoint', ''));
      const db = drizzle(pg, { schema });
      const [profile] = await db.insert(schema.profiles).values({ authUserId: userId, fullName: 'Valuation fixture', email: 'fixture@example.test' }).returning();
      await db.insert(schema.valuationSettings).values({ id: 1, disclaimer: DEFAULT_DISCLAIMER, ctaLabel: 'Đăng ký kiểm định xe' });
      const [brand] = await db.insert(schema.brands).values({ name: 'Toyota', slug: 'toyota' }).returning();
      const [model] = await db.insert(schema.carModels).values({ name: 'Fortuner', slug: 'fortuner', brandId: brand.id }).returning();
      const [variant] = await db.insert(schema.carVersions).values({ name: '2.8L AT 4WD phiên bản có tên dài để kiểm tra hiển thị', slug: 'fortuner-at', modelId: model.id }).returning();
      const [color] = await db.insert(schema.carColors).values({ name: 'Trắng', slug: 'white' }).returning();
      let reader = false, historyReader = false;
      const permissions = () => historyReader ? ['valuation.read', 'valuation.history.read'] : reader ? ['valuation.read'] : VALUATION_PERMISSIONS;
      class FixtureModule {}
      Global()(FixtureModule);
      Module({ imports: [ValuationModule], providers: [
        { provide: DatabaseService, useValue: { db } },
        { provide: JwtVerifierService, useValue: { verify: async token => { if (token !== session.access_token) throw new UnauthorizedException(); return { id: userId }; } } },
        { provide: AdminAccessService, useValue: { forAuthUser: async () => ({ profile, roles: ['ADMIN'], permissions: permissions() }) } },
        { provide: APP_GUARD, useClass: JwtAuthGuard }, { provide: APP_GUARD, useClass: PermissionsGuard },
      ], exports: [DatabaseService] })(FixtureModule);
      app = await NestFactory.create(FixtureModule, new FastifyAdapter(), { logger: false });
      app.setGlobalPrefix('api/v1'); app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
      await app.init(); await app.getHttpAdapter().getInstance().ready();
      const server = app.getHttpAdapter().getInstance(), page = await browser.newPage({ viewport: { width, height: 950 } }), errors = [], failedMutations = [], traces = [];
      page.setDefaultTimeout(15000);
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ storageKey, session }) => localStorage.setItem(storageKey, JSON.stringify(session)), { storageKey, session });
      await page.route('**/api/v1/admin/**', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.pathname.endsWith('/admin/me')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ profile, roles: ['ADMIN'], permissions: permissions() }) });
        const response = await server.inject({ method: request.method(), url: `${url.pathname}${url.search}`, ...(request.postData() ? { payload: request.postData() } : {}), headers: { authorization: `Bearer ${session.access_token}`, 'content-type': 'application/json' } });
        if (url.pathname.includes('/valuation')) traces.push({ method: request.method(), path: `${url.pathname}${url.search}`, status: response.statusCode, body: response.statusCode >= 400 || url.pathname.endsWith('/reference-prices') ? response.json() : undefined });
        if (request.method() !== 'GET' && response.statusCode >= 400) failedMutations.push({ path: url.pathname, status: response.statusCode, message: response.json().message });
        await route.fulfill({ status: response.statusCode, contentType: 'application/json', body: response.body });
      });
      await page.route(`${authUrl}/**`, route => route.abort());
      const { seedValuation } = await load('database/seed/valuation.js'); await seedValuation(db);
      await page.goto(`${process.env.ADMIN_TEST_URL ?? 'http://localhost:3001'}/tien-ich/dinh-gia-xe`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.getByRole('heading', { name: 'Bộ quy tắc định giá chung', exact: true }).waitFor();
      for (const name of ['Tạo phiên bản', 'Phiên bản', 'Xuất bản cấu hình', 'Nhân bản để chỉnh sửa']) assert.equal(await page.getByRole('button', {name,exact:true}).count(),0);
      assert.equal(await page.getByLabel('Phiên bản đang quản lý',{exact:true}).count(),0);
      await page.getByRole('button', { name: 'Giá xe tham chiếu', exact: true }).first().click();
      await page.getByRole('button', { name: 'Thêm giá tham chiếu', exact: true }).click();
      await page.getByLabel('Hãng xe', { exact: true }).selectOption(brand.id); await page.getByLabel('Dòng xe', { exact: true }).selectOption(model.id); await page.getByLabel('Phiên bản', { exact: true }).selectOption(variant.id);
      await page.locator('input[name="modelYear"]').fill('2022'); await page.locator('input[name="originalMsrp"]').fill('979000000');
      await page.locator('input[name="source"]').fill('Synthetic fixture — không phải nguồn giá thực'); await page.locator('input[name="effectiveFrom"]').fill('2026-01-01');
      await page.locator('input[name="reason"]').fill('Kiểm thử giá tham chiếu');
      await page.getByRole('button',{name:'Lưu giá tham chiếu',exact:true}).click(); await page.getByText('979.000.000 đ',{exact:true}).waitFor();
      await page.getByRole('button',{name:'Cấu hình chung',exact:true}).click();
      await page.getByLabel('Hiển thị tiện ích trên website',{exact:true}).selectOption('true'); await page.locator('input[name="confirmed"]').check(); await page.locator('input[name="reason"]').fill('Bật trực tiếp cấu hình chung fixture');
      await page.getByRole('button',{name:'Bật tiện ích và lưu',exact:true}).click(); await page.getByRole('button',{name:'Lưu cấu hình chung',exact:true}).waitFor();
      await page.getByRole('button',{name:'Giá xe tham chiếu',exact:true}).first().click(); await page.getByText('979.000.000 đ',{exact:true}).waitFor();
      await page.getByRole('button',{name:'Chỉnh sửa',exact:true}).click(); await page.locator('input[name="originalMsrp"]').fill('989000000'); await page.locator('input[name="reason"]').fill('Sửa giá đang áp dụng trực tiếp');
      await page.getByRole('button',{name:'Lưu giá tham chiếu',exact:true}).click(); await page.getByText('989.000.000 đ',{exact:true}).waitFor();
      assert.equal((await db.select().from(schema.valuationReferencePrices))[0].originalMsrp,989000000);
      await page.getByRole('button',{name:'Khấu hao',exact:true}).click();
      const ageRow=page.getByRole('row').filter({hasText:'4 đến dưới 5 năm'});
      await ageRow.getByRole('button',{name:'Chỉnh sửa',exact:true}).click(); await page.locator('input[name="adjustmentPercent"]').fill('-35'); await page.locator('input[name="reason"]').fill('Sửa khấu hao đang áp dụng');
      await page.getByRole('button',{name:'Lưu quy tắc',exact:true}).click(); await ageRow.getByText('-35%',{exact:true}).waitFor();
      await page.getByRole('button',{name:'ODO',exact:true}).click(); await page.getByRole('button',{name:'Cấu hình km/năm & giới hạn',exact:true}).click();
      await page.locator('input[name="expectedKmPerYear"]').fill('18000'); await page.locator('input[name="reason"]').fill('Áp dụng ODO kỳ vọng fixture'); await page.getByRole('button',{name:'Lưu và áp dụng',exact:true}).click();
      await page.getByRole('button',{name:'Cấu hình km/năm & giới hạn',exact:true}).waitFor();
      await page.getByRole('button',{name:'Màu xe',exact:true}).click(); await page.getByRole('button',{name:'Thêm quy tắc',exact:true}).click();
      await page.getByLabel('Màu xe',{exact:true}).selectOption(color.id); await page.locator('input[name="label"]').fill('Màu trắng fixture'); await page.locator('input[name="adjustmentPercent"]').fill('1.5'); await page.locator('input[name="reason"]').fill('Thêm hệ số màu trực tiếp');
      await page.getByRole('button',{name:'Lưu quy tắc',exact:true}).click(); await page.getByText('Màu trắng fixture',{exact:true}).waitFor();
      assert.equal((await db.select().from(schema.valuationPolicies)).length,1,'All edits use one shared configuration');
      const current=(await db.select().from(schema.valuationPolicies))[0]; assert.equal(current.config.expectedKmPerYear,18000); assert.equal(current.validatedRevision,current.revision);
      assert.equal((await db.select().from(schema.valuationSettings))[0].isEnabled,true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}px configuration overflow`);
      await page.screenshot({path:`.next/valuation-admin-${width}.png`,fullPage:true});
      // Phase 4: enable only this in-memory fixture, then exercise real history APIs through the browser.
      await db.update(schema.valuationSettings).set({ isEnabled: true });
      const estimateInput = { ...valuationFixture().input, brandId: brand.id, modelId: model.id, variantId: variant.id, colorId: color.id, modelYear: 2022 };
      const estimate = await server.inject({ method: 'POST', url: '/api/v1/valuation/estimate', payload: estimateInput });
      assert.equal(estimate.statusCode, 200, estimate.body);
      const result = estimate.json(), recordBefore = (await db.select().from(schema.valuationRecords))[0];
      const contact = await server.inject({ method: 'POST', url: `/api/v1/valuation/records/${result.recordId}/lead`, payload: { leadToken: result.leadToken, name: 'Khách kiểm thử lịch sử', phone: '0901 234 567', city: 'TP. Hồ Chí Minh', note: 'Hẹn kiểm định sau định giá.', consent: true } });
      assert.equal(contact.statusCode, 200, contact.body);
      for (let index = 0; index < 11; index++) assert.equal((await server.inject({ method: 'POST', url: '/api/v1/valuation/estimate', payload: estimateInput })).statusCode, 200);
      await page.getByRole('button', { name: 'Lịch sử định giá', exact: true }).click();
      await page.getByText('Hiển thị 1-10 / 12', { exact: true }).waitFor();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByText('Hiển thị 11-12 / 12', { exact: true }).waitFor();
      const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
      await page.getByLabel('Từ ngày', { exact: true }).fill(today); await page.getByLabel('Đến ngày', { exact: true }).fill(today);
      await page.getByLabel('Hãng xe', { exact: true }).selectOption(brand.id); await page.getByLabel('Dòng xe', { exact: true }).selectOption(model.id);
      await page.getByLabel('Trạng thái lead', { exact: true }).selectOption('NEW');
      await page.getByLabel('Giá từ (VND)', { exact: true }).fill(String(recordBefore.estimatedMarketValue - 1)); await page.getByLabel('Giá đến (VND)', { exact: true }).fill(String(recordBefore.estimatedMarketValue + 1));
      await page.getByRole('button', { name: 'Lọc lịch sử', exact: true }).click(); await page.waitForFunction(() => document.querySelectorAll('.tt-valuation button[aria-label="Xem chi tiết"]').length === 1);
      await page.getByPlaceholder('Tìm tên xe, khách hàng hoặc số điện thoại…').fill('0901234567');
      await page.waitForResponse(response => response.url().includes('search=0901234567') && response.status() === 200);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${width}px history overflow`);
      await page.screenshot({ path: `.next/valuation-history-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Xem chi tiết', exact: true }).click();
      await page.getByRole('heading', { name: 'Breakdown tại thời điểm định giá', exact: true }).waitFor();
      await page.getByText('TP. Hồ Chí Minh', { exact: false }).waitFor();
      await page.getByLabel('Trạng thái xử lý', { exact: true }).selectOption('CONTACTED'); await page.getByLabel('Lý do cập nhật', { exact: true }).fill('Đã gọi trao đổi và hẹn kiểm định.');
      await page.getByRole('button', { name: 'Lưu trạng thái', exact: true }).click(); await page.getByText('Trạng thái: Đã liên hệ', { exact: true }).waitFor();
      const stored = (await db.select().from(schema.valuationRecords)).find(row => row.id === result.recordId);
      assert.equal(stored.leadStatus, 'CONTACTED'); assert.deepEqual(stored.snapshot, recordBefore.snapshot);
      assert.equal((await db.select().from(schema.leads))[0].status, 'read');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${width}px breakdown overflow`);
      await page.screenshot({ path: `.next/valuation-history-detail-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Quay lại lịch sử', exact: true }).click();
      await page.getByLabel('Trạng thái lead', { exact: true }).selectOption('CONTACTED'); await page.getByRole('button', { name: 'Lọc lịch sử', exact: true }).click();
      await page.waitForFunction(() => document.querySelectorAll('.tt-valuation button[aria-label="Xem chi tiết"]').length === 1);
      historyReader = true; await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByRole('button', { name: 'Lịch sử định giá', exact: true }).click();
      await page.getByPlaceholder('Tìm tên xe, khách hàng hoặc số điện thoại…').fill('0901234567'); await page.waitForFunction(() => document.querySelectorAll('.tt-valuation button[aria-label="Xem chi tiết"]').length === 1);
      await page.getByRole('button', { name: 'Xem chi tiết', exact: true }).click(); await page.getByRole('heading', { name: 'Breakdown tại thời điểm định giá', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Lưu trạng thái', exact: true }).count(), 0, 'Read-only history users cannot change status');
      assert.deepEqual(failedMutations, []); assert.deepEqual(errors, []); historyReader = false;
      reader = true; await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByRole('heading', { name: 'Bộ quy tắc định giá chung', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Tạo phiên bản', exact: true }).count(), 0);
      assert.equal(await page.getByRole('button', { name: 'Lịch sử định giá', exact: true }).count(), 0);
      console.log(`PASS ${width}px: configuration CRUD, history pagination/filter/search/detail/status, immutable snapshot, lead integration, RBAC, no overflow or JS errors.`);
      await page.close();
    } finally { if (app) await app.close(); await pg.close(); }
  }
} finally { await browser.close(); }
