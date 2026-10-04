'use client';
import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return <label className="block min-w-0 space-y-1.5"><span id={id} className="block text-base font-semibold">{label}</span>{isValidElement(children) ? cloneElement(children as ReactElement<{ 'aria-labelledby'?: string }>, { 'aria-labelledby': id }) : children}</label>;
}
export interface EditorField { key: string; label: string; type?: 'text' | 'number' | 'date' | 'boolean' | 'textarea' | 'json' | 'select'; options?: Record<string, string>; required?: boolean; min?: number; max?: number; maxLength?: number }
export default function Editor({ title, fields, initial, onSave, onClose, busy, note, submitLabel }: { title: string; fields: EditorField[]; initial: Record<string, unknown>; onSave: (value: Record<string, unknown>) => Promise<boolean>; onClose: () => void; busy: boolean; note?: string; submitLabel?: string }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(field => [field.key, field.type === 'json' ? JSON.stringify(initial[field.key] ?? {}, null, 2) : String(initial[field.key] ?? '')])));
  const [error, setError] = useState('');
  if (!fields.length) return <section className="rounded-2xl border border-[var(--border-color)] p-5 space-y-4"><h2 className="text-xl font-bold">{title}</h2><p>{note}</p><Button variant="secondary" onClick={onClose}>Quay lại</Button></section>;
  return <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6 space-y-4">
    <h2 className="text-xl font-bold">{title}</h2>{note && <p className="text-[var(--muted-fg)] break-words">{note}</p>}
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={async event => {
      event.preventDefault(); setError('');
      try {
        const payload = Object.fromEntries(fields.map(field => [field.key, field.type === 'json' ? JSON.parse(values[field.key]) : field.type === 'boolean' ? values[field.key] === 'true' : field.type === 'number' ? values[field.key] === '' ? null : Number(values[field.key]) : values[field.key]]));
        if (await onSave(payload)) onClose();
      } catch { setError('JSON không hợp lệ. Vui lòng kiểm tra nội dung đã nhập.'); }
    }}>
      {fields.map(field => <div key={field.key} className={['textarea', 'json'].includes(field.type ?? '') ? 'sm:col-span-2' : ''}><Field label={field.label}>
        {field.type === 'select' || field.type === 'boolean' ? <Select name={field.key} value={values[field.key]} required={field.required} onChange={event => setValues(old => ({ ...old, [field.key]: event.target.value }))}>
          {Object.entries(field.type === 'boolean' ? { true: 'Bật', false: 'Tắt' } : field.options ?? {}).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select> : field.type === 'textarea' || field.type === 'json' ? <Textarea name={field.key} rows={field.type === 'json' ? 8 : 3} maxLength={field.type === 'json' ? 16000 : field.maxLength ?? 6000} className={field.type === 'json' ? 'font-mono text-sm' : ''} value={values[field.key]} required={field.required} onChange={event => setValues(old => ({ ...old, [field.key]: event.target.value }))} />
          : <Input name={field.key} type={field.type ?? 'text'} value={values[field.key]} required={field.required} min={field.min} max={field.max} minLength={field.type === 'number' ? undefined : field.min} maxLength={field.maxLength ?? 1000} onChange={event => setValues(old => ({ ...old, [field.key]: event.target.value }))} />}
      </Field></div>)}
      {error && <p role="alert" className="sm:col-span-2 text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3 sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? 'Đang xử lý…' : submitLabel ?? 'Lưu thay đổi'}</Button><Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Hủy</Button></div>
    </form>
  </section>;
}
export const reasonField: EditorField = { key: 'reason', label: 'Lý do thay đổi', required: true, min: 3, maxLength: 1000 };
