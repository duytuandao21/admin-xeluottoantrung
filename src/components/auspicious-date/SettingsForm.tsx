'use client';
import { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { Field } from './Editor';
import { purposeLabels, type Purpose, type Settings } from '@/lib/auspicious-date';

export default function SettingsForm({ initial, busy, canEdit, save }: { initial: Settings; busy: boolean; canEdit: boolean; save: (values: Record<string, unknown>) => Promise<boolean> }) {
  const [form, setForm] = useState(initial), [reason, setReason] = useState('');
  const toggles = { isEnabled: 'Bật tiện ích', showLunarDate: 'Hiển thị âm lịch', showCanChi: 'Hiển thị Can Chi', showGoodHours: 'Hiển thị giờ tham khảo', showExplanation: 'Hiển thị giải thích', showScore: 'Hiển thị điểm' } as const;
  return <form className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6 grid gap-5 sm:grid-cols-2" onSubmit={async event => {
    event.preventDefault(); const keys = ['isEnabled', 'name', 'maxSearchDays', 'defaultPurpose', 'supportedPurposes', ...Object.keys(toggles).filter(key => key !== 'isEnabled'), 'disclaimer', 'ctaLabel', 'seoTitle', 'seoDescription'];
    if (await save({ ...Object.fromEntries(keys.map(key => [key, form[key]])), reason })) setReason('');
  }}>
    <div className="sm:col-span-2"><h2 className="font-bold text-xl">Cấu hình tiện ích</h2><p className="mt-1 text-[var(--muted-fg)]">Chỉ bật sau khi có bộ quy tắc đã xác minh và xuất bản. Giờ tham khảo cần nguồn riêng trong quy tắc GOOD_HOURS.</p></div>
    <fieldset disabled={!canEdit || busy} className="contents">
      <Field label="Tên tiện ích"><Input name="name" value={form.name} maxLength={100} required onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Khoảng ngày tối đa (tính cả hai đầu)"><Input name="maxSearchDays" type="number" min={1} max={90} value={form.maxSearchDays} required onChange={e => setForm({ ...form, maxSearchDays: Number(e.target.value) })} /></Field>
      <Field label="Mục đích mặc định"><Select name="defaultPurpose" value={form.defaultPurpose} onChange={e => setForm({ ...form, defaultPurpose: e.target.value as Purpose })}>{Object.entries(purposeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
      <fieldset className="space-y-2"><legend className="font-semibold mb-2">Mục đích hỗ trợ</legend>{Object.entries(purposeLabels).map(([value, label]) => <label key={value} className="flex items-center gap-2"><input type="checkbox" checked={form.supportedPurposes.includes(value as Purpose)} onChange={e => setForm({ ...form, supportedPurposes: e.target.checked ? [...form.supportedPurposes, value as Purpose] : form.supportedPurposes.filter(item => item !== value) })} />{label}</label>)}</fieldset>
      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">{Object.entries(toggles).map(([key, label]) => <label key={key} className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] p-3"><input type="checkbox" name={key} checked={Boolean(form[key])} onChange={e => setForm({ ...form, [key]: e.target.checked })} />{label}</label>)}</div>
      <Field label="Nút dẫn đến danh sách xe"><Input name="ctaLabel" value={form.ctaLabel} maxLength={150} required onChange={e => setForm({ ...form, ctaLabel: e.target.value })} /></Field>
      <Field label="SEO title"><Input name="seoTitle" value={form.seoTitle} maxLength={160} onChange={e => setForm({ ...form, seoTitle: e.target.value })} /></Field>
      <div className="sm:col-span-2"><Field label="Lưu ý luôn hiển thị trong kết quả"><Textarea name="disclaimer" rows={3} value={form.disclaimer} minLength={10} maxLength={2000} required onChange={e => setForm({ ...form, disclaimer: e.target.value })} /></Field></div>
      <div className="sm:col-span-2"><Field label="SEO description"><Textarea name="seoDescription" rows={2} value={form.seoDescription} maxLength={320} onChange={e => setForm({ ...form, seoDescription: e.target.value })} /></Field></div>
      <div className="sm:col-span-2"><Field label="Lý do thay đổi"><Input name="reason" value={reason} minLength={3} maxLength={1000} required onChange={e => setReason(e.target.value)} /></Field></div>
      {canEdit && <div className="sm:col-span-2"><Button disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu cấu hình'}</Button></div>}
    </fieldset>
  </form>;
}
