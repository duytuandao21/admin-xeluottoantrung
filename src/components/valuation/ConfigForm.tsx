'use client';
import { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { Field } from '@/components/auspicious-date/Editor';
import type { Policy, PolicyConfig } from '@/lib/valuation';
const fields: { key: Exclude<keyof PolicyConfig, 'confidenceWeights' | 'showSeverePriceRange'>; label: string; min: number; max: number; step: number; group: string }[] = [
  { key: 'expectedKmPerYear', label: 'ODO kỳ vọng (km/năm)', min: 1, max: 200000, step: 1, group: 'ODO' },
  { key: 'youngVehicleAgeFloor', label: 'Tuổi nền tối thiểu cho ODO xe mới (năm)', min: 0.01, max: 1, step: 0.01, group: 'ODO' },
  { key: 'odoMaxBonusPercent', label: 'Thưởng ODO tối đa (%)', min: 0, max: 100, step: 0.01, group: 'ODO' },
  { key: 'odoMaxPenaltyPercent', label: 'Phạt ODO tối đa (%)', min: 0, max: 95, step: 0.01, group: 'ODO' },
  { key: 'dealerMarginMinPercent', label: 'Biên thu mua tối thiểu (%)', min: 0, max: 95, step: 0.01, group: 'DEALER' },
  { key: 'dealerMarginMaxPercent', label: 'Biên thu mua tối đa (%)', min: 0, max: 95, step: 0.01, group: 'DEALER' },
  { key: 'minValueFactor', label: 'Sàn giá / giá nền (hệ số)', min: 0.01, max: 1, step: 0.0001, group: 'GENERAL' },
  { key: 'maxValueFactor', label: 'Trần giá / giá nền (hệ số)', min: 1, max: 3, step: 0.0001, group: 'GENERAL' },
  { key: 'marketRangeMinusPercent', label: 'Khoảng thị trường phía dưới (%)', min: 0, max: 95, step: 0.01, group: 'GENERAL' },
  { key: 'marketRangePlusPercent', label: 'Khoảng thị trường phía trên (%)', min: 0, max: 100, step: 0.01, group: 'GENERAL' },
  { key: 'roundingVnd', label: 'Bước làm tròn (VNĐ)', min: 1, max: 10000000, step: 1, group: 'GENERAL' },
  { key: 'minModelYear', label: 'Năm sản xuất nhỏ nhất', min: 1886, max: 2100, step: 1, group: 'GENERAL' },
  { key: 'maxVehicleAge', label: 'Tuổi xe lớn nhất (năm)', min: 1, max: 100, step: 1, group: 'GENERAL' },
  { key: 'maxOdometerKm', label: 'ODO lớn nhất (km)', min: 1, max: 20000000, step: 1, group: 'GENERAL' },
  { key: 'mediumConfidenceThreshold', label: 'Ngưỡng đầy đủ dữ liệu trung bình', min: 1, max: 99, step: 1, group: 'GENERAL' },
  { key: 'highConfidenceThreshold', label: 'Ngưỡng đầy đủ dữ liệu cao', min: 2, max: 100, step: 1, group: 'GENERAL' },
];
const weightLabels: Record<keyof PolicyConfig['confidenceWeights'], string> = { odo: 'ODO', exterior: 'Ngoại thất', interior: 'Nội thất', accident: 'Tai nạn', flood: 'Ngập nước', engine: 'Máy', transmission: 'Hộp số', service: 'Bảo dưỡng', owners: 'Số chủ', usage: 'Mục đích sử dụng', color: 'Màu xe' };
export default function ConfigForm({ policy, mode = 'ALL', busy, onSave, onClose }: { policy: Policy; mode?: string; busy: boolean; onSave: (value: Record<string, unknown>) => Promise<boolean>; onClose: () => void }) {
  const [error, setError] = useState('');
  return <form className="tt-valuation__form rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6" onSubmit={async event => {
    event.preventDefault(); const data = new FormData(event.currentTarget), config = structuredClone(policy.config);
    for (const field of fields.filter(field => mode === 'ALL' || field.group === mode)) config[field.key] = Number(data.get(field.key));
    if (mode === 'ALL') {
      for (const key of Object.keys(weightLabels) as (keyof typeof weightLabels)[]) config.confidenceWeights[key] = Number(data.get(`weight-${key}`));
      config.showSeverePriceRange = data.get('showSeverePriceRange') === 'true';
    }
    if (config.dealerMarginMinPercent > config.dealerMarginMaxPercent) { setError('Biên thu mua tối thiểu phải nhỏ hơn hoặc bằng tối đa.'); return; }
    if (config.mediumConfidenceThreshold >= config.highConfidenceThreshold) { setError('Ngưỡng cao phải lớn hơn ngưỡng trung bình.'); return; }
    if (!Object.values(config.confidenceWeights).some(value => value > 0)) { setError('Cần ít nhất một trọng số lớn hơn 0.'); return; }
    setError(''); await onSave({ config, reason: String(data.get('reason')) });
  }}>
    <h2 className="tt-valuation__wide text-xl font-bold">{mode === 'ODO' ? 'Cấu hình ODO' : mode === 'DEALER' ? 'Cấu hình giá thu mua' : 'Cấu hình định giá'}</h2>
    <p className="tt-valuation__wide text-[var(--muted-fg)]">Lưu để áp dụng các thay đổi vào bộ quy tắc chung. Độ đầy đủ dữ liệu không phải độ chính xác giá.</p>
    {fields.filter(field => mode === 'ALL' || field.group === mode).map(field => <Field key={field.key} label={field.label}><Input name={field.key} type="number" defaultValue={policy.config[field.key]} required min={field.min} max={field.max} step={field.step} disabled={busy} /></Field>)}
    {mode === 'ALL' && <><Field label="Khi cần kiểm định, cho phép khoảng giá rộng"><Select name="showSeverePriceRange" defaultValue={String(policy.config.showSeverePriceRange)} disabled={busy}><option value="false">Không hiển thị khoảng giá</option><option value="true">Cho phép khi có giá nền hợp lệ</option></Select></Field><h3 className="tt-valuation__wide text-lg font-semibold">Trọng số mức đầy đủ dữ liệu</h3>{(Object.keys(weightLabels) as (keyof typeof weightLabels)[]).map(key => <Field key={key} label={weightLabels[key]}><Input name={`weight-${key}`} type="number" min={0} max={100} step={1} defaultValue={policy.config.confidenceWeights[key]} required disabled={busy} /></Field>)}</>}
    <Field label="Lý do thay đổi"><Input name="reason" required minLength={3} maxLength={1000} disabled={busy} /></Field>
    {error && <p role="alert" className="tt-valuation__wide text-red-600">{error}</p>}
    <div className="tt-valuation__wide flex gap-3"><Button type="submit" disabled={busy}>{busy ? 'Đang áp dụng…' : 'Lưu và áp dụng'}</Button><Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Hủy</Button></div>
  </form>;
}
