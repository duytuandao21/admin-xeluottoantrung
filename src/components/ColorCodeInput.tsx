'use client';

import { useState } from 'react';
import { Input } from '@/components/ui';
import { resolveCarColorCode } from '@/lib/car-colors';

export default function ColorCodeInput({ name, defaultValue, colorName }: { name: string; defaultValue?: string; colorName?: string }) {
  const initial = resolveCarColorCode(defaultValue, colorName);
  const [code, setCode] = useState(initial);
  const [preview, setPreview] = useState(initial);

  const updateCode = (value: string) => {
    const next = value.toUpperCase();
    setCode(next);
    if (/^#[\da-f]{6}$/i.test(next)) setPreview(next);
  };

  return (
    <div className="grid gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--muted)] p-4 sm:grid-cols-[auto_minmax(0,1fr)]">
      <input type="color" aria-label="Chọn màu" value={preview} onChange={event => updateCode(event.target.value)} className="h-16 w-20 cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-1" />
      <div className="min-w-0 space-y-2">
        <Input name={name} value={code} onChange={event => updateCode(event.target.value)} onBlur={() => setCode(current => current.trim())} pattern="#[0-9A-Fa-f]{6}" maxLength={7} required aria-label="Mã màu HEX" placeholder="#2563EB" className="font-mono uppercase" />
        <p className="text-sm text-[var(--muted-fg)]">Chọn trên bảng màu hoặc nhập mã HEX gồm 6 ký tự.</p>
      </div>
      <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-3">
        <span className="h-14 w-24 shrink-0 rounded-lg border border-[var(--border-color)] shadow-sm" style={{ backgroundColor: preview }} />
        <span className="min-w-0"><span className="block text-sm text-[var(--muted-fg)]">Màu đang chọn</span><strong className="font-mono text-base">{preview.toUpperCase()}</strong></span>
      </div>
    </div>
  );
}
