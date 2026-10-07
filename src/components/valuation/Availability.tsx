'use client';
import { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { Field } from '@/components/auspicious-date/Editor';
import type { Settings } from '@/lib/valuation';

export default function Availability({ settings, busy, onSave }: {
  settings: Settings; busy: boolean;
  onSave: (values: { isEnabled: boolean; confirmed?: boolean; expectedUpdatedAt: string; disclaimer: string; ctaLabel: string; reason: string }) => void;
}) {
  const [enabled, setEnabled] = useState(settings.isEnabled);
  const activating = enabled && !settings.isEnabled;
  return <form className="space-y-4" onSubmit={event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    onSave({ isEnabled: enabled, ...(activating ? { confirmed: form.get('confirmed') === 'on' } : {}), expectedUpdatedAt: settings.updatedAt, disclaimer: String(form.get('disclaimer')), ctaLabel: String(form.get('ctaLabel')), reason: String(form.get('reason')) });
  }}>
    <Field label="Hiển thị tiện ích trên website"><Select name="isEnabled" value={String(enabled)} disabled={busy} onChange={event => setEnabled(event.target.value === 'true')}><option value="false">Tắt tra cứu</option><option value="true">Bật tra cứu</option></Select></Field>
    <p className="text-sm text-[var(--muted-fg)]">Hệ thống kiểm tra giá đang có hiệu lực, danh mục và toàn bộ quy tắc trước khi bật. Các thay đổi hợp lệ được áp dụng ngay sau khi lưu.</p>
    {activating && <label className="flex items-start gap-2"><input name="confirmed" type="checkbox" required disabled={busy} className="mt-1" /><span>Tôi đã rà soát giá có nguồn và các tỷ lệ định giá, đồng ý mở tra cứu cho khách hàng.</span></label>}
    <Field label="Thông báo giá tham khảo"><Textarea name="disclaimer" defaultValue={settings.disclaimer} required minLength={10} maxLength={2000} rows={4} disabled={busy} /></Field>
    <Field label="Tên nút liên hệ"><Input name="ctaLabel" defaultValue={settings.ctaLabel} required maxLength={150} disabled={busy} /></Field>
    <Field label="Lý do"><Input name="reason" required minLength={3} maxLength={1000} disabled={busy} /></Field>
    <Button type="submit" disabled={busy}>{busy ? 'Đang lưu…' : activating ? 'Bật tiện ích và lưu' : !enabled && settings.isEnabled ? 'Tắt tiện ích và lưu' : 'Lưu cấu hình chung'}</Button>
  </form>;
}
