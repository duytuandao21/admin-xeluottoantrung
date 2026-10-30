'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { api, json } from '@/lib/api/client';

type OrderItem = { id: string; label: string };

export default function DisplayOrderEditor({ path, title, onClose, onSaved }: {
  path: string; title: string; onClose: () => void; onSaved: () => Promise<unknown>;
}) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [original, setOriginal] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [destination, setDestination] = useState(1);
  const [dragged, setDragged] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    api<OrderItem[]>(path, { signal: controller.signal }).then(rows => {
      setItems(rows);
      setOriginal(rows.map(row => row.id));
      setSelected(rows[0]?.id || '');
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Không tải được danh sách.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path]);

  const move = (sourceId: string, targetIndex: number) => {
    setItems(current => {
      const from = current.findIndex(item => item.id === sourceId);
      if (from < 0 || targetIndex < 0 || targetIndex >= current.length || from === targetIndex) return current;
      const next = [...current];
      next.splice(targetIndex, 0, next.splice(from, 1)[0]);
      return next;
    });
  };
  const changed = items.some((item, index) => item.id !== original[index]);
  const cancel = () => { if (!changed || window.confirm('Bỏ các thay đổi thứ tự chưa lưu?')) onClose(); };
  const save = async () => {
    if (!changed || saving) return;
    setSaving(true);
    setError('');
    let applied = false;
    try {
      await api(path, json('PATCH', { expectedIds: original, ids: items.map(item => item.id) }));
      applied = true;
      setOriginal(items.map(item => item.id));
      toast.success('Đã lưu thứ tự hiển thị.');
      await onSaved();
      onClose();
    } catch (failure) {
      setError(applied ? 'Đã lưu thứ tự nhưng chưa tải lại được danh sách. Vui lòng tải lại trang.' :
        failure instanceof Error ? failure.message : 'Không lưu được thứ tự.');
    } finally { setSaving(false); }
  };

  return <section className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-color)] p-5 sm:p-6">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-red-600">Thứ tự hiển thị</p>
        <h2 className="mt-1 text-xl font-semibold">Sắp xếp {title.toLowerCase()}</h2>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">Kéo thả hoặc dùng mũi tên. Chỉ gửi thay đổi khi bạn bấm Lưu.</p></div>
      <button type="button" onClick={cancel} disabled={saving} aria-label="Đóng sắp xếp" className="rounded-lg p-2 text-[var(--muted-fg)] hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-red-600 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
    </div>
    {error && <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {loading ? <p className="p-6 text-sm text-[var(--muted-fg)]">Đang tải thứ tự...</p> : items.length === 0 ? <p className="p-6 text-sm text-[var(--muted-fg)]">Chưa có mục nào để sắp xếp.</p> : <>
      <div className="flex flex-wrap items-end gap-3 border-b border-[var(--border-color)] bg-slate-50/70 p-4 dark:bg-slate-800/30 sm:px-6">
        <label className="min-w-0 flex-1 basis-48 text-xs font-medium text-[var(--muted-fg)]">Chọn mục
          <select title={items.find(item => item.id === selected)?.label} value={selected} onChange={event => setSelected(event.target.value)} className="mt-1 block h-10 min-w-0 max-w-full w-full truncate rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--foreground)]">
            {items.map(item => <option key={item.id} value={item.id}>{item.label || 'Không có tiêu đề'}</option>)}
          </select></label>
        <label className="text-xs font-medium text-[var(--muted-fg)]">Đến vị trí
          <input type="number" min={1} max={items.length} value={destination} onChange={event => setDestination(Number(event.target.value))} className="mt-1 block h-10 w-24 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm text-[var(--foreground)]" /></label>
        <button type="button" disabled={!Number.isInteger(destination) || destination < 1 || destination > items.length} onClick={() => move(selected, destination - 1)} className="h-10 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:bg-slate-900">Di chuyển</button>
      </div>
      <ol className="max-h-[min(60vh,700px)] space-y-2 overflow-y-auto p-4 sm:p-6">
        {items.map((item, index) => <li key={item.id} draggable onDragStart={event => { setDragged(item.id); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDragged(null)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (dragged) move(dragged, index); setDragged(null); }}
          className={`flex items-center gap-3 rounded-xl border bg-[var(--card-bg)] px-3 py-2.5 transition-colors ${dragged === item.id ? 'border-red-400 opacity-60' : 'border-[var(--border-color)]'}`}>
          <GripVertical className="hidden h-4 w-4 shrink-0 cursor-grab text-slate-400 sm:block" aria-hidden="true" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-700">{index + 1}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium" title={item.label}>{item.label || 'Không có tiêu đề'}</span>
          <button type="button" onClick={() => move(item.id, index - 1)} disabled={index === 0} aria-label={`Đưa ${item.label} lên`} className="rounded-lg border border-[var(--border-color)] p-2 hover:bg-slate-100 disabled:opacity-35 dark:hover:bg-slate-800"><ArrowUp className="h-4 w-4" /></button>
          <button type="button" onClick={() => move(item.id, index + 1)} disabled={index === items.length - 1} aria-label={`Đưa ${item.label} xuống`} className="rounded-lg border border-[var(--border-color)] p-2 hover:bg-slate-100 disabled:opacity-35 dark:hover:bg-slate-800"><ArrowDown className="h-4 w-4" /></button>
        </li>)}
      </ol>
    </>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] p-4 sm:px-6">
      <p className="text-sm text-[var(--muted-fg)]">{changed ? 'Có thay đổi chưa lưu' : `${items.length} mục · Chưa có thay đổi`}</p>
      <div className="flex gap-2"><button type="button" disabled={saving} onClick={cancel} className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm font-medium">Hủy</button>
        <button type="button" disabled={!changed || saving} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Đang lưu...' : 'Lưu thứ tự'}</button></div>
    </div>
  </section>;
}
