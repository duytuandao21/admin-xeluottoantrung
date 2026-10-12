'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { Sparkles } from 'lucide-react';
import { canEditNewArrival, newArrivalExpiresAt } from '@/lib/car-new-arrival';
import { formatDate } from '@/lib/date';
import type { Product } from '@/lib/types';

export default function CarNewArrivalOption({ product, readOnly = false }: {
  product?: Pick<Product, 'createdAt' | 'newArrival'> | null; readOnly?: boolean;
}) {
  const createdAt = product?.createdAt;
  const subscribe = useCallback((notify: () => void) => {
    const expires = newArrivalExpiresAt(createdAt);
    if (expires === null || !canEditNewArrival(createdAt)) return () => {};
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      notify();
      const remaining = expires - Date.now();
      if (remaining > 0) timer = setTimeout(update, remaining);
    };
    const visible = () => { if (!document.hidden) update(); };
    timer = setTimeout(update, Math.max(1, expires - Date.now()));
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', visible);
    return () => { clearTimeout(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', visible); };
  }, [createdAt]);
  const getSnapshot = useCallback(() => canEditNewArrival(createdAt), [createdAt]);
  const withinWindow = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const creating = !product;
  const [selected, setSelected] = useState(creating || Boolean(product?.newArrival));
  const checked = creating || (withinWindow && selected);
  const disabled = creating || !withinWindow || readOnly;
  const expires = newArrivalExpiresAt(createdAt);
  return <label className={`product-option flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-red-300'}`}>
    <input name="newArrival" aria-label="Xe mới về" type="checkbox" checked={checked} disabled={disabled}
      onChange={event => setSelected(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-red-600 disabled:cursor-not-allowed" />
    <span className="min-w-0">
      <span className="flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5 shrink-0 text-emerald-500" /> Xe mới về</span>
      <span className="mt-1 block text-sm text-[var(--muted-fg)]">Ngày nhập: {creating ? 'Ghi nhận khi tạo xe' : createdAt ? <time dateTime={createdAt}>{formatDate(createdAt)}</time> : 'Chưa có ngày nhập'}</span>
      <span role="status" className={`mt-2 inline-block max-w-full rounded-md px-2 py-1 text-xs font-medium ${checked ? 'bg-red-50 text-red-600' : 'bg-[var(--muted)] text-[var(--muted-fg)]'}`}>
        {creating ? 'Mặc định bật' : !withinWindow ? 'Hết thời hạn · Đã ẩn nhãn' : selected ? 'Đang bật' : 'Đang tắt'}
      </span>
      <span className="mt-2 block text-xs leading-relaxed text-[var(--muted-fg)]">
        {creating ? 'Có thể bật/tắt trong 7 ngày đầu sau khi tạo xe.' : withinWindow && expires !== null ? `Được thay đổi đến ${formatDate(new Date(expires).toISOString())}.` : 'Đã khóa tùy chọn sau 7 ngày kể từ ngày nhập.'}
      </span>
    </span>
  </label>;
}
