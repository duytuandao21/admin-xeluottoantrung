'use client';
import { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { Field } from '@/components/auspicious-date/Editor';
import { categoryLabels, dateValue, effectiveDate, optionCategories, scopeLabels, type Catalog, type Category, type ConditionOption, type Row } from '@/lib/valuation';
export default function RuleForm({ initial, defaultCategory, catalog, options, busy, onSave, onClose }: { initial?: Row; defaultCategory: Category; catalog: Catalog; options: ConditionOption[]; busy: boolean; onSave: (value: Record<string, unknown>) => Promise<boolean>; onClose: () => void }) {
  const currentVariant = catalog.variants.find(row => row.id === initial?.variantId), currentModel = catalog.models.find(row => row.id === initial?.modelId || row.id === currentVariant?.modelId);
  const [category, setCategory] = useState<Category>((initial?.category as Category) ?? defaultCategory);
  const [scope, setScope] = useState<keyof typeof scopeLabels>((initial?.scope as keyof typeof scopeLabels) ?? 'GLOBAL');
  const [brandId, setBrand] = useState(String(initial?.brandId ?? currentModel?.brandId ?? '')), [modelId, setModel] = useState(String(initial?.modelId ?? currentModel?.id ?? '')), [variantId, setVariant] = useState(String(initial?.variantId ?? ''));
  const [optionId, setOption] = useState(String(initial?.optionId ?? '')), [colorId, setColor] = useState(String(initial?.colorId ?? ''));
  const [error, setError] = useState('');
  const isRange = ['AGE', 'ODO', 'OWNERS'].includes(category), categorical = optionCategories.includes(category);
  const requiresInspection = options.find(row => row.id === optionId)?.requiresInspection ?? false;
  return <form className="tt-valuation__form rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6" onSubmit={async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const minValue = isRange ? Number(form.get('minValue')) : null, maxValue = isRange && form.get('maxValue') !== '' ? Number(form.get('maxValue')) : null;
    if (minValue !== null && maxValue !== null && minValue >= maxValue) { setError('Giá trị đến phải lớn hơn giá trị từ.'); return; }
    const from = effectiveDate(form.get('effectiveFrom')), to = effectiveDate(form.get('effectiveTo'));
    if (to && (!from || new Date(to) <= new Date(from))) { setError('Ngày kết thúc cần ngày bắt đầu và phải sau ngày bắt đầu.'); return; }
    setError('');
    await onSave({ category, scope, brandId: scope === 'BRAND' ? brandId : null, modelId: scope === 'MODEL' ? modelId : null, variantId: scope === 'VARIANT' ? variantId : null, optionId: categorical ? optionId : null, colorId: category === 'COLOR' ? colorId : null, minValue, maxValue,
      adjustmentPercent: Number(form.get('adjustmentPercent')), manualInspectionRequired: requiresInspection || form.get('manualInspectionRequired') === 'true', active: form.get('active') === 'true', label: form.get('label'), note: form.get('note'), effectiveFrom: from, effectiveTo: to, reason: form.get('reason') });
  }}>
    <h2 className="tt-valuation__wide text-xl font-bold">{initial ? 'Sửa quy tắc' : 'Thêm quy tắc'}</h2>
    <div className="tt-valuation__wide tt-valuation__note">Ưu tiên: Phiên bản → Dòng xe → Hãng xe → Toàn bộ xe. Các khoảng là từ (bao gồm) đến (không bao gồm). Khấu hao là tỷ lệ tích lũy theo tuổi; ODO là % lệch so với kỳ vọng.</div>
    <Field label="Nhóm quy tắc"><Select value={category} disabled={busy} onChange={e => { setCategory(e.target.value as Category); setOption(''); setColor(''); }}>
      {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></Field>
    <Field label="Phạm vi áp dụng"><Select value={scope} disabled={busy} onChange={e => { setScope(e.target.value as keyof typeof scopeLabels); setBrand(''); setModel(''); setVariant(''); }}>{Object.entries(scopeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></Field>
    {scope !== 'GLOBAL' && <Field label="Hãng xe"><Select value={brandId} required disabled={busy} onChange={e => { setBrand(e.target.value); setModel(''); setVariant(''); }}><option value="">Chọn hãng</option>{catalog.brands.filter(row => row.status === 'active' || row.id === brandId).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field>}
    {['MODEL', 'VARIANT'].includes(scope) && <Field label="Dòng xe"><Select value={modelId} required disabled={busy || !brandId} onChange={e => { setModel(e.target.value); setVariant(''); }}><option value="">Chọn dòng xe</option>{catalog.models.filter(row => row.brandId === brandId && (row.status === 'active' || row.id === modelId)).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field>}
    {scope === 'VARIANT' && <Field label="Phiên bản"><Select value={variantId} required disabled={busy || !modelId} onChange={e => setVariant(e.target.value)}><option value="">Chọn phiên bản</option>{catalog.variants.filter(row => row.modelId === modelId && (row.status === 'active' || row.id === variantId)).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field>}
    {categorical && <Field label="Tình trạng / lựa chọn"><Select value={optionId} required disabled={busy} onChange={e => setOption(e.target.value)}><option value="">Chọn tình trạng</option>{options.filter(row => row.category === category).map(row => <option key={row.id} value={row.id}>{row.label}{!row.active ? ' (đang tắt)' : ''}</option>)}</Select></Field>}
    {category === 'COLOR' && <Field label="Màu xe"><Select value={colorId} required disabled={busy} onChange={e => setColor(e.target.value)}><option value="">Chọn màu</option>{catalog.colors.filter(row => row.status === 'active' || row.id === colorId).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field>}
    {isRange && <><Field label={category === 'ODO' ? 'Lệch ODO từ (%)' : category === 'OWNERS' ? 'Số chủ từ' : 'Tuổi xe từ (năm)'}><Input key={`min-${category}`} name="minValue" type="number" min={category === 'ODO' ? -100 : category === 'OWNERS' ? 1 : 0} max={20000000} step={category === 'OWNERS' ? 1 : 0.01} required defaultValue={initial?.category === category ? Number(initial.minValue) : category === 'ODO' ? -100 : category === 'OWNERS' ? 1 : 0} disabled={busy} /></Field><Field label="Đến (để trống: không giới hạn)"><Input key={`max-${category}`} name="maxValue" type="number" step={category === 'OWNERS' ? 1 : 0.01} max={20000000} defaultValue={initial?.category === category && initial?.maxValue !== null ? Number(initial?.maxValue) : ''} disabled={busy} /></Field></>}
    <Field label="Tên quy tắc"><Input name="label" required maxLength={180} defaultValue={String(initial?.label ?? '')} disabled={busy} /></Field>
    <Field label="Điều chỉnh (%) — số âm giảm, số dương tăng"><Input name="adjustmentPercent" type="number" required min={-95} max={100} step={0.01} defaultValue={Number(initial?.adjustmentPercent ?? 0)} disabled={busy} /></Field>
    <Field label="Kiểm tra trực tiếp"><Select key={String(requiresInspection)} name="manualInspectionRequired" defaultValue={String(requiresInspection || initial?.manualInspectionRequired || false)} disabled={busy || requiresInspection}><option value="false">Không bắt buộc</option><option value="true">Bắt buộc kiểm định thực tế</option></Select></Field>
    <Field label="Trạng thái"><Select name="active" defaultValue={String(initial?.active ?? true)} disabled={busy}><option value="true">Hoạt động</option><option value="false">Tạm ngừng</option></Select></Field>
    <Field label="Hiệu lực từ (trống: luôn áp dụng)"><Input name="effectiveFrom" type="date" defaultValue={dateValue(initial?.effectiveFrom)} disabled={busy} /></Field>
    <Field label="Đến ngày (trống: không giới hạn)"><Input name="effectiveTo" type="date" defaultValue={dateValue(initial?.effectiveTo)} disabled={busy} /></Field>
    <div className="tt-valuation__wide"><Field label="Ghi chú"><Textarea name="note" maxLength={3000} defaultValue={String(initial?.note ?? '')} disabled={busy} /></Field></div>
    <Field label="Lý do thay đổi"><Input name="reason" required minLength={3} maxLength={1000} disabled={busy} /></Field>
    {error && <p role="alert" className="tt-valuation__wide text-red-600">{error}</p>}
    <div className="tt-valuation__wide flex gap-3"><Button type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu quy tắc'}</Button><Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Hủy</Button></div>
  </form>;
}
