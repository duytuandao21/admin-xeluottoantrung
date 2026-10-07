'use client';
import { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import PriceInput from '@/components/PriceInput';
import { Field } from '@/components/auspicious-date/Editor';
import { baseTypeLabels, dateValue, effectiveDate, type Catalog, type Policy, type Row } from '@/lib/valuation';
export default function ReferenceForm({ initial, catalog, policy, busy, onSave, onClose }: { initial?: Row; catalog: Catalog; policy: Policy; busy: boolean; onSave: (value: Record<string, unknown>) => Promise<boolean>; onClose: () => void }) {
  const variant = catalog.variants.find(row => row.id === initial?.variantId), model = catalog.models.find(row => row.id === variant?.modelId);
  const [brandId, setBrand] = useState(model?.brandId ?? ''), [modelId, setModel] = useState(model?.id ?? ''), [variantId, setVariant] = useState(variant?.id ?? '');
  const [baseType, setBaseType] = useState(String(initial?.basePriceType ?? 'ORIGINAL_MSRP')), [error, setError] = useState('');
  return <form className="tt-valuation__form rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6" onSubmit={async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const price = (key: string) => { const digits = String(form.get(key) ?? '').replace(/\D/g, ''); return digits ? Number(digits) : null; };
    const originalMsrp = price('originalMsrp'), currentMsrp = price('currentMsrp'), marketReference = price('marketReference');
    const chosen = baseType === 'ORIGINAL_MSRP' ? originalMsrp : baseType === 'CURRENT_MSRP' ? currentMsrp : marketReference;
    if (!chosen || !Number.isSafeInteger(chosen) || [originalMsrp, currentMsrp, marketReference].some(value => value !== null && (!Number.isSafeInteger(value) || value <= 0))) { setError('Nhập giá hợp lệ cho loại giá nền đã chọn; giá phải là số nguyên dương.'); return; }
    const from = effectiveDate(form.get('effectiveFrom')), to = effectiveDate(form.get('effectiveTo'));
    if (from && to && new Date(to) <= new Date(from)) { setError('Ngày kết thúc phải sau ngày bắt đầu.'); return; }
    setError('');
    await onSave({ variantId, modelYear: Number(form.get('modelYear')), originalMsrp, currentMsrp, marketReference, basePriceType: baseType, source: form.get('source'), note: form.get('note'), active: form.get('active') === 'true', effectiveFrom: from, effectiveTo: to,
      referenceAgeYears: baseType === 'MARKET_REFERENCE' ? Number(form.get('referenceAgeYears')) : null, referenceOdometerKm: baseType === 'MARKET_REFERENCE' ? Number(form.get('referenceOdometerKm')) : null, basisNote: baseType === 'MARKET_REFERENCE' ? form.get('basisNote') : '', reason: form.get('reason') });
  }}>
    <h2 className="tt-valuation__wide text-xl font-bold">{initial ? 'Sửa giá tham chiếu' : 'Thêm giá tham chiếu'}</h2>
    <div className="tt-valuation__wide tt-valuation__note">Không tự lấy giá bán hoặc “giá cũ” của xe trong kho làm giá xe mới. Nhập nguồn đã kiểm tra. Cần thêm danh mục xe? Dùng mục Sản phẩm → Hãng xe / Dòng xe / Phiên bản xe.</div>
    <Field label="Hãng xe"><Select value={brandId} required disabled={busy} onChange={e => { setBrand(e.target.value); setModel(''); setVariant(''); }}><option value="">Chọn hãng xe</option>{catalog.brands.filter(row => row.status === 'active' || row.id === brandId).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field>
    <Field label="Dòng xe"><Select value={modelId} required disabled={busy || !brandId} onChange={e => { setModel(e.target.value); setVariant(''); }}><option value="">Chọn dòng xe</option>{catalog.models.filter(row => row.brandId === brandId && (row.status === 'active' || row.id === modelId)).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field>
    <Field label="Phiên bản"><Select value={variantId} required disabled={busy || !modelId} onChange={e => setVariant(e.target.value)}><option value="">Chọn phiên bản</option>{catalog.variants.filter(row => row.modelId === modelId && (row.status === 'active' || row.id === variantId)).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field>
    <Field label="Năm sản xuất"><Input name="modelYear" type="number" required min={Math.max(policy.config.minModelYear, new Date().getFullYear() - policy.config.maxVehicleAge)} max={new Date().getFullYear() + 1} step={1} defaultValue={Number(initial?.modelYear ?? new Date().getFullYear())} disabled={busy} /></Field>
    {(['originalMsrp', 'currentMsrp', 'marketReference'] as const).map((key, index) => <Field key={key} label={`${['Giá xe mới ban đầu', 'Giá xe mới hiện tại', 'Giá thị trường tham chiếu'][index]} (VNĐ)`}><PriceInput name={key} defaultValue={typeof initial?.[key] === 'number' ? initial[key] : undefined} /></Field>)}
    <Field label="Loại giá nền sử dụng"><Select value={baseType} onChange={e => setBaseType(e.target.value)} disabled={busy}>{Object.entries(baseTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
    {baseType === 'MARKET_REFERENCE' && <><div className="tt-valuation__wide tt-valuation__note">Ghi rõ tuổi và ODO của xe chuẩn tại ngày bắt đầu hiệu lực, cùng giả định tình trạng. Hệ thống điều chỉnh chênh lệch so với nền này để tránh khấu hao hai lần.</div><Field label="Tuổi xe chuẩn (năm)"><Input name="referenceAgeYears" type="number" required min={0} max={100} step={0.01} defaultValue={Number(initial?.referenceAgeYears ?? 0)} disabled={busy} /></Field><Field label="ODO xe chuẩn (km)"><Input name="referenceOdometerKm" type="number" required min={0} max={20000000} step={1} defaultValue={Number(initial?.referenceOdometerKm ?? 0)} disabled={busy} /></Field><div className="tt-valuation__wide"><Field label="Giả định tình trạng nền"><Textarea name="basisNote" required minLength={3} maxLength={2000} defaultValue={String(initial?.basisNote ?? '')} placeholder="Ví dụ: tình trạng tốt, không tai nạn/ngập, bảo dưỡng bình thường…" disabled={busy} /></Field></div></>}
    <Field label="Nguồn giá"><Input name="source" required minLength={3} maxLength={1000} defaultValue={String(initial?.source ?? '')} disabled={busy} /></Field>
    <Field label="Trạng thái"><Select name="active" defaultValue={String(initial?.active ?? true)} disabled={busy}><option value="true">Hoạt động</option><option value="false">Tạm ngừng</option></Select></Field>
    <Field label="Hiệu lực từ ngày (giờ Việt Nam)"><Input name="effectiveFrom" type="date" required defaultValue={dateValue(initial?.effectiveFrom) || new Date().toLocaleDateString('en-CA')} disabled={busy} /></Field>
    <Field label="Đến ngày (để trống: không giới hạn)"><Input name="effectiveTo" type="date" defaultValue={dateValue(initial?.effectiveTo)} disabled={busy} /></Field>
    <div className="tt-valuation__wide"><Field label="Ghi chú"><Textarea name="note" maxLength={3000} defaultValue={String(initial?.note ?? '')} disabled={busy} /></Field></div>
    <Field label="Lý do thay đổi"><Input name="reason" required minLength={3} maxLength={1000} disabled={busy} /></Field>
    {error && <p role="alert" className="tt-valuation__wide text-red-600">{error}</p>}
    <div className="tt-valuation__wide flex gap-3"><Button type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu giá tham chiếu'}</Button><Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Hủy</Button></div>
  </form>;
}
