'use client';
import { useState } from 'react';
import { Button, DataTable, Input, Select } from '@/components/ui';
import { api, json } from '@/lib/api/client';
import { base, classificationLabels, purposeLabels, type Purpose, type Simulation, type Version } from '@/lib/auspicious-date';
import { Field } from './Editor';

export default function Simulator({ versions, selectedId }: { versions: Version[]; selectedId: string }) {
  const [versionId, setVersionId] = useState(selectedId), [compareId, setCompareId] = useState('');
  const [birthDate, setBirthDate] = useState(''), [targetDate, setTargetDate] = useState(''), [gender, setGender] = useState('');
  const [result, setResult] = useState<Simulation | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const version = versions.find(item => item.id === versionId);
  const options = versions.filter(item => item.purpose === version?.purpose);
  return <div className="space-y-5">
    <form className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6" onSubmit={async e => {
      e.preventDefault(); if (busy || !version) return; setBusy(true); setError(''); setResult(null);
      try { setResult(await api<Simulation>(`${base}/simulate`, json('POST', { birthDate, targetDate, purpose: version.purpose, ruleSetId: versionId, ...(gender ? { gender } : {}), ...(compareId ? { compareRuleSetId: compareId } : {}) }))); }
      catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể kiểm thử.'); } finally { setBusy(false); }
    }}>
      <h2 className="text-xl font-bold sm:col-span-2">Kiểm thử engine</h2>
      <Field label="Ngày sinh"><Input type="date" name="birthDate" required min="1900-01-01" max="2099-12-31" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></Field>
      <Field label="Ngày cần kiểm tra"><Input type="date" name="targetDate" required min="1900-01-01" max="2099-12-31" value={targetDate} onChange={e => setTargetDate(e.target.value)} /></Field>
      <Field label="Phiên bản"><Select name="ruleSetId" required value={versionId} onChange={e => { setVersionId(e.target.value); setCompareId(''); setResult(null); }}>{versions.map(item => <option key={item.id} value={item.id}>{purposeLabels[item.purpose]} · {item.version} ({item.status})</option>)}</Select></Field>
      <Field label="So sánh với phiên bản khác"><Select name="compareRuleSetId" value={compareId} onChange={e => setCompareId(e.target.value)}><option value="">Không so sánh</option>{options.filter(item => item.id !== versionId).map(item => <option key={item.id} value={item.id}>{item.version}</option>)}</Select></Field>
      <Field label="Giới tính (không bắt buộc)"><Select name="gender" value={gender} onChange={e => setGender(e.target.value)}><option value="">Không cung cấp</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></Select></Field>
      <p className="self-center text-[var(--muted-fg)]">Mục đích: {purposeLabels[version?.purpose as Purpose] ?? 'Chọn phiên bản'}</p>
      <div className="sm:col-span-2"><Button disabled={busy || !version}>{busy ? 'Đang kiểm thử…' : 'Chạy kiểm thử'}</Button></div>
      {error && <p role="alert" className="text-red-600 sm:col-span-2">{error}</p>}
    </form>
    {result && [result.primary, result.comparison].filter(item => item !== null).map(item => <section key={item.rulesetVersion} className="space-y-4">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5"><h3 className="font-bold text-lg">{item.rulesetVersion} · {classificationLabels[item.classification]}</h3><p>Điểm: {item.score} · Vi phạm nghiêm trọng: {item.criticalViolations}</p></div>
      <details className="rounded-xl border border-[var(--border-color)] p-4" open><summary className="font-semibold cursor-pointer">Dữ liệu lịch và thuộc tính</summary><pre className="mt-3 overflow-auto max-h-96 text-sm">{JSON.stringify({ calendar: item.calendar, almanac: item.almanac }, null, 2)}</pre></details>
      <DataTable data={item.trace} columns={[{ key: 'code', label: 'Quy tắc' }, { key: 'priority', label: 'Ưu tiên' }, { key: 'status', label: 'Kết quả' }, { key: 'matched', label: 'Khớp', render: row => row.matched ? 'Có' : 'Không' }, { key: 'effect', label: 'Hiệu ứng' }, { key: 'scoreDelta', label: 'Điểm' }, { key: 'hardExclusion', label: 'Loại trừ', render: row => row.hardExclusion ? 'Có' : 'Không' }]} />
    </section>)}
  </div>;
}
