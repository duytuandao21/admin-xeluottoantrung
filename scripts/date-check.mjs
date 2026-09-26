import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/date.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } });
const { formatDate, parseDateInput } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
for (const zone of ['UTC', 'America/New_York', 'Asia/Ho_Chi_Minh']) {
  process.env.TZ = zone;
  assert.equal(formatDate('2026-09-26T18:30:00Z'), '27/09/2026 01:30');
  assert.equal(formatDate('2026-09-26 18:30:00.123456+00'), '27/09/2026 01:30');
  assert.equal(formatDate('2026-09-27T01:30:00+07:00'), '27/09/2026 01:30');
  assert.equal(formatDate('2026-09-26T18:30:00'), '27/09/2026 01:30');
  assert.equal(formatDate('2026-09-26'), '26/09/2026');
  assert.equal(formatDate(''), '');
  assert.equal(parseDateInput('26/09/2026'), '2026-09-26');
}
console.log('UTC+7 date display checks passed in three host time zones.');
