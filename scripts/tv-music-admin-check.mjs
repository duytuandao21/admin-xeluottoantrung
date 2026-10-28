// Production Admin UI + real Nest controllers + disposable PGlite/R2 substitute.
// Build with the dummy public config in docs/tv-music.md first. No real credentials or uploads.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';

const adminRoot = process.cwd(), apiRoot = resolve('../api-xeluottoantrung');
const { chromium } = createRequire(resolve('../web-xeluottoantrung/package.json'))('playwright');
const { tvMusicFixture } = await import(pathToFileURL(resolve(apiRoot, '.test-dist/test/fixtures/tv-music.js')).href);
process.chdir(apiRoot); const fixture = await tvMusicFixture(); process.chdir(adminRoot);
const artifacts = resolve(apiRoot, '.test-dist/tv-music-admin-ui'); await mkdir(artifacts, { recursive: true });
const exp = Math.floor(Date.now() / 1000) + 3600, userId = crypto.randomUUID();
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const session = { access_token: `${encode({ alg: 'HS256' })}.${encode({ sub: userId, exp, role: 'authenticated' })}.dummy`, refresh_token: 'dummy',
  expires_at: exp, expires_in: 3600, token_type: 'bearer', user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'dummy@example.test', app_metadata: {}, user_metadata: {} } };
let child, browser;
try {
  child = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'start', '--port', '3005'], {
    cwd: adminRoot, windowsHide: true, stdio: 'ignore', env: { ...process.env, NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4019',
      NEXT_PUBLIC_SUPABASE_URL: 'https://tv-fixture.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy-test-key', NEXT_TELEMETRY_DISABLED: '1' },
  });
  for (let attempt = 0; ; attempt++) {
    try { if ((await fetch('http://127.0.0.1:3005/tv-display')).ok) break; } catch {}
    if (attempt > 40) throw new Error('Local dummy Admin server unavailable');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); page.setDefaultTimeout(20000);
  const errors = []; page.on('pageerror', error => errors.push(error.message)); page.on('dialog', dialog => dialog.accept());
  await page.addInitScript(({ session }) => {
    localStorage.setItem('sb-tv-fixture-auth-token', JSON.stringify(session)); localStorage.setItem('admin-sidebar', 'false');
  }, { session });
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.pathname.startsWith('/api/v1/admin/')) {
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': 'Authorization,Content-Type' } });
      if (url.pathname === '/api/v1/admin/me') return route.fulfill({ json: { profile: { id: userId, fullName: 'TV fixture', status: 'active' }, roles: ['ADMIN'], permissions: ['content.read', 'content.update'] } });
      if (url.pathname === '/api/v1/admin/content') return route.fulfill({ json: [] });
      if (!/\/admin\/(tv-music|site-settings)\//.test(url.pathname)) return route.fulfill({ json: { data: [], notifications: [] } });
      const payload = request.postDataBuffer();
      const response = await fixture.server.inject({ method: request.method(), url: url.pathname + url.search,
        headers: { authorization: 'Bearer admin', ...(payload ? { 'content-type': request.headers()['content-type'] || 'application/json' } : {}) },
        ...(payload ? { payload } : {}) });
      return route.fulfill({ status: response.statusCode, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: response.body });
    }
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
    return route.continue();
  });
  await page.goto('http://127.0.0.1:3005/tv-display', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Nhạc nền trình chiếu' }).waitFor();
  async function pick(button, name) {
    const chooser = page.waitForEvent('filechooser'); await button.click();
    await (await chooser).setFiles({ name: `${name}.mp3`, mimeType: 'audio/mpeg', buffer: Buffer.from('ID3dummy-audio') });
    await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).waitFor({ state: 'visible' });
  }
  const getMusic = async () => JSON.parse((await fixture.content.settings('tv-display')).find(row => row.key === 'config').value).music;
  const waitFor = async predicate => { for (let i = 0; i < 100; i++) { if (await predicate()) return; await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error('Fixture condition timed out'); };
  await pick(page.getByRole('button', { name: 'Thêm bài MP3', exact: true }), 'Bài nhạc đầu');
  await page.getByRole('textbox', { name: 'Tên bài 1', exact: true }).waitFor();
  await page.getByRole('checkbox', { name: 'Bật nhạc nền', exact: true }).check();
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await waitFor(async () => (await getMusic()).tracks.length === 1);
  const first = (await getMusic()).tracks[0]; assert(fixture.objects.has(`tv/music/${first.id}.mp3`));
  await pick(page.getByRole('button', { name: 'Thay bài 1', exact: true }), 'Bài thay thế');
  await waitFor(async () => (await page.getByRole('textbox', { name: 'Tên bài 1', exact: true }).inputValue()) === 'Bài thay thế');
  assert(!fixture.objects.has(`tv/music/${first.id}.mp3`), 'Replacing a saved track deletes the old R2 object');
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await waitFor(async () => (await getMusic()).tracks[0]?.name === 'Bài thay thế');
  await page.getByRole('button', { name: 'Xóa bài 1', exact: true }).click();
  await waitFor(async () => (await getMusic()).tracks.length === 0);
  await waitFor(() => fixture.objects.size === 0);

  const tracks = [];
  for (let index = 0; index < 10; index++) {
    const ticket = await fixture.music.reserve(`Bản nhạc tiếng Việt số ${index + 1} — tên dài để kiểm tra bố cục`, 3, fixture.audit);
    tracks.push(await fixture.music.upload(ticket.id, Readable.from([Buffer.from('ID3')]), 3, fixture.audit, new AbortController().signal));
  }
  const rows = await fixture.content.settings('tv-display'), config = JSON.parse(rows.find(row => row.key === 'config').value);
  config.music = { ...config.music, enabled: true, tracks };
  await fixture.content.upsertSetting('tv-display', 'config', { valueType: 'json', value: JSON.stringify(config) }, fixture.audit);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('textbox', { name: 'Tên bài 10', exact: true }).waitFor();
  assert(await page.getByRole('button', { name: 'Thêm bài MP3', exact: true }).isDisabled());
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const editor = page.locator('section[aria-labelledby="tv-music-title"]'); await editor.scrollIntoViewIfNeeded();
    const fit = await editor.evaluate(element => ({ width: element.clientWidth, content: element.scrollWidth, left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right }));
    await editor.screenshot({ path: `${artifacts}/${width}-music.png` });
    const overflowing = await editor.evaluate(element => { const box = element.getBoundingClientRect(); return [...element.querySelectorAll('*')].filter(item => item.getBoundingClientRect().right > box.right + 1).map(item => ({ tag: item.tagName, className: item.className, text: item.textContent?.slice(0, 60) })).slice(0, 10); });
    assert(fit.content <= fit.width + 1 && fit.left >= -1 && fit.right <= width + 1, JSON.stringify({ width, fit, overflowing }));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Đưa bài 2 lên', exact: true }).click();
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await waitFor(async () => (await getMusic()).tracks[0].id === tracks[1].id);
  assert.deepEqual(errors, []); console.log('PASS: Admin upload/save/replace/delete/reorder, 10-track cap, R2 cleanup and 1440/768/390/320px layout.');
} finally { await browser?.close(); child?.kill(); await fixture.close(); }
