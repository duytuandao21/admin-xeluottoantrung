'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { ArrowLeft, CalendarDays, ImagePlus, Megaphone, Plus, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button, DataTable, ConfirmDialog, Input, PageHeader, Select } from '@/components/ui';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import { useAuth } from '@/lib/auth-context';
import { api, json, query } from '@/lib/api/client';
import { uploadAsset } from '@/lib/api/media';
import { sanitizeRichText } from '@/lib/rich-text';
import { formatPromotionInput, fromPromotionInput, promotionDate, promotionLabels, promotionNextDay, promotionToday, toPromotionInput, type Promotion, type PromotionList } from '@/lib/promotions';

function PeriodBadge({ status }: { status: Promotion['status'] }) {
  const color = { ongoing: 'bg-emerald-500/10 text-emerald-600', upcoming: 'bg-amber-500/10 text-amber-600', ended: 'bg-gray-500/10 text-gray-500' };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap ${color[status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{promotionLabels[status]}</span>;
}
function PromotionForm({ initial, onSaved, onBack }: { initial?: Promotion; onSaved: () => void; onBack: () => void }) {
  const [saving, setSaving] = useState(false), [dirty, setDirty] = useState(false), [published, setPublished] = useState(initial?.isPublished ?? true);
  const [startInput, setStartInput] = useState(initial ? toPromotionInput(initial.startsAt) : '');
  const [endInput, setEndInput] = useState(initial ? toPromotionInput(initial.endsAt) : '');
  const [formToday] = useState(promotionToday);
  let expired = false;
  try { expired = !!endInput && fromPromotionInput(endInput) < formToday; } catch { /* Validate incomplete dates when saving. */ }
  const savingRef = useRef(false);
  useEffect(() => {
    if(!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', unload); return () => window.removeEventListener('beforeunload', unload);
  }, [dirty]);
  const back = () => { if(!dirty || window.confirm('Bạn có thay đổi chưa lưu. Rời khỏi biểu mẫu?')) onBack(); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if(savingRef.current) return;
    const form = new FormData(event.currentTarget);
    savingRef.current = true; setSaving(true);
    try {
      const startsAt = fromPromotionInput(String(form.get('startsAt'))), endsAt = fromPromotionInput(String(form.get('endsAt')));
      if(endsAt < startsAt) throw new Error('Ngày kết thúc không được trước ngày bắt đầu.');
      const file = form.get('image');
      let imageUrl = form.has('image__remove') ? '' : initial?.imageUrl || '';
      if(file instanceof File && file.size) imageUrl = await uploadAsset(file);
      if(!imageUrl) throw new Error('Vui lòng chọn một ảnh chương trình.');
      const payload = { title: String(form.get('title') || '').trim(), kind: String(form.get('kind')),
        imageUrl, content: sanitizeRichText(String(form.get('content') || '')), startsAt, endsAt,
        isPublished: published, popupEnabled: published && form.has('popupEnabled') };
      await api(initial ? `/admin/promotions/${initial.id}` : '/admin/promotions', json(initial ? 'PATCH' : 'POST', payload));
      setDirty(false); toast.success(initial ? 'Đã cập nhật chương trình.' : 'Đã tạo chương trình.'); onSaved();
    } catch(error) { toast.error(error instanceof Error ? error.message : 'Không thể lưu chương trình.'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  return <>
    <PageHeader title={initial ? 'Chỉnh sửa chương trình' : 'Thêm chương trình'} subtitle="Một ảnh chương trình và nội dung chi tiết cho khách hàng." actions={<Button variant="secondary" onClick={back} disabled={saving}><ArrowLeft className="h-4 w-4" />Quay lại</Button>} />
    <form onSubmit={save} onInput={() => setDirty(true)} onChange={() => setDirty(true)} onDrop={() => setDirty(true)} className="space-y-5">
      <fieldset disabled={saving} className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 space-y-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><Megaphone className="h-5 w-5 text-red-600" />Thông tin chương trình</h2>
            <label className="block space-y-2 text-base font-medium"><span>Tiêu đề <span className="text-red-600">*</span></span><Input name="title" required maxLength={240} defaultValue={initial?.title} placeholder="Ví dụ: Ưu đãi đặc biệt tháng 10" /></label>
            <label className="block space-y-2 text-base font-medium"><span>Loại chương trình</span><Select name="kind" aria-label="Loại chương trình" defaultValue={initial?.kind || 'promotion'}><option value="promotion">Khuyến mãi</option><option value="event">Sự kiện</option></Select></label>
            <div className="space-y-2"><h3 className="text-base font-medium">Mô tả chi tiết</h3><RichTextEditor name="content" defaultValue={initial?.content} placeholder="Nội dung ưu đãi, điều kiện áp dụng và cách tham gia..." /></div>
          </section>
        </div>
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><ImagePlus className="h-5 w-5 text-red-600" />Ảnh chương trình</h2>
            <ImageUpload name="image" existing={initial?.imageUrl} required hint="Chọn 1 ảnh JPEG, PNG, WebP hoặc AVIF, tối đa 10 MB. Ảnh được dùng cho thẻ tin, chi tiết và popup quảng cáo." />
          </section>
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><CalendarDays className="h-5 w-5 text-red-600" />Ngày áp dụng</h2>
            <label className="block space-y-2 text-base font-medium"><span>Bắt đầu <span className="text-red-600">*</span></span><Input name="startsAt" inputMode="numeric" maxLength={10} pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" placeholder="dd/mm/yyyy" required value={startInput} onChange={event => setStartInput(formatPromotionInput(event.target.value))} /></label>
            <label className="block space-y-2 text-base font-medium"><span>Kết thúc <span className="text-red-600">*</span></span><Input name="endsAt" inputMode="numeric" maxLength={10} pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" placeholder="dd/mm/yyyy" required value={endInput} onChange={event => setEndInput(formatPromotionInput(event.target.value))} /></label>
            <p className="text-sm leading-6 text-[var(--muted-fg)]">Áp dụng hết ngày kết thúc. Trạng thái được xác định tự động theo ngày.</p>
          </section>
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Hiển thị trên website</h2>
            <label className="flex items-start gap-3 cursor-pointer text-base"><input className="mt-1 h-4 w-4 accent-red-600" type="checkbox" name="isPublished" checked={published} onChange={event => setPublished(event.target.checked)} /><span>Đăng chương trình<span className="block mt-1 text-sm text-[var(--muted-fg)]">Bỏ chọn để lưu bản nháp.</span></span></label>
            <label className={`flex items-start gap-3 text-base ${published ? 'cursor-pointer' : 'opacity-50'}`}><input className="mt-1 h-4 w-4 accent-red-600" type="checkbox" name="popupEnabled" defaultChecked={initial?.popupEnabled} disabled={!published || expired} /><span>Dùng ảnh làm popup quảng cáo<span className="block mt-1 text-sm leading-6 text-[var(--muted-fg)]">Chỉ một chương trình được chọn. Chọn ảnh này sẽ thay ảnh trước đó. Popup tự ngừng khi chương trình kết thúc.</span></span></label>
          </section>
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4">
        {dirty && <span className="mr-auto text-sm text-amber-600">Có thay đổi chưa lưu</span>}
        <Button variant="secondary" type="button" onClick={back} disabled={saving}>Hủy</Button>
        <Button type="submit" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Đang lưu...' : 'Lưu chương trình'}</Button>
      </div>
    </form>
  </>;
}

export default function PromotionManager() {
  const { identity } = useAuth();
  const canRead = !!identity?.permissions.includes('content.read'), canCreate = !!identity?.permissions.includes('content.create');
  const canUpdate = !!identity?.permissions.includes('content.update'), canDelete = !!identity?.permissions.includes('content.delete');
  const [result, setResult] = useState<PromotionList | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Promotion | 'new' | null>(null), [deleting, setDeleting] = useState<Promotion | null>(null);
  const [page, setPage] = useState(1), [search, setSearch] = useState(''), [status, setStatus] = useState(''), [revision, setRevision] = useState(0), [switching, setSwitching] = useState(false);
  useEffect(() => {
    if(!canRead) return;
    const controller = new AbortController();
    queueMicrotask(() => { if(!controller.signal.aborted) { setLoading(true); setError(''); } });
    void api<PromotionList>(`/admin/promotions${query({ page, limit: 10, search, status })}`, { signal: controller.signal })
      .then(value => { if(!controller.signal.aborted) setResult(value); })
      .catch(failure => { if(!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Không tải được chương trình.'); })
      .finally(() => { if(!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [canRead, page, search, status, revision]);
  useEffect(() => {
    const future = (result?.data || []).flatMap(row => [+new Date(`${row.startsAt}T00:00:00+07:00`), promotionNextDay(row.endsAt)]).filter(time => time > Date.now());
    if(!future.length || editing) return;
    const timer = setTimeout(() => setRevision(value => value + 1), Math.min(2147483647, Math.max(100, Math.min(...future) - Date.now() + 100)));
    return () => clearTimeout(timer);
  }, [result, editing]);
  const refresh = () => setRevision(value => value + 1);
  const toggle = async (row: Pick<Promotion, 'id' | 'title' | 'popupEnabled'>) => {
    if(switching) return;
    setSwitching(true);
    try { await api(`/admin/promotions/${row.id}/popup`, json('PATCH', { enabled: !row.popupEnabled })); refresh(); toast.success(row.popupEnabled ? 'Đã tắt popup quảng cáo.' : 'Đã chọn ảnh popup quảng cáo.'); }
    catch(failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể đổi popup.'); }
    finally { setSwitching(false); }
  };
  if(!canRead) return <p className="text-base text-[var(--muted-fg)]">Bạn chưa có quyền xem sự kiện và khuyến mãi.</p>;
  if(editing) return <PromotionForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? undefined : editing} onBack={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />;
  return <>
    <PageHeader title="Sự kiện / Khuyến mãi" subtitle="Quản lý thời gian áp dụng, bài giới thiệu và ảnh quảng cáo trên website." actions={<><Button variant="secondary" onClick={refresh} disabled={loading}><RefreshCw className="h-4 w-4" />Làm mới</Button>{canCreate && <Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" />Thêm chương trình</Button>}</>} />
    <section className="mb-5 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600"><Megaphone className="h-6 w-6" /></div>
      <div className="min-w-0 flex-1"><h2 className="text-lg font-semibold">Ảnh popup quảng cáo</h2>{result?.popup ? <><p className="admin-list-text mt-1 font-medium text-base" title={result.popup.title}>{result.popup.title}</p><p className="mt-1 text-sm text-[var(--muted-fg)]">Hiển thị đến {promotionDate(result.popup.endsAt)}. Tự ngừng khi kết thúc.</p></> : <p className="mt-1 text-base text-[var(--muted-fg)]">Chưa chọn ảnh. Website sẽ không hiện popup quảng cáo.</p>}</div>
      {result?.popup && <><Image src={result.popup.imageUrl} alt={result.popup.title} unoptimized width={96} height={72} className="h-20 w-28 rounded-lg bg-[var(--muted)] object-contain" />{canUpdate && <Button variant="secondary" disabled={switching} onClick={() => void toggle({ ...result.popup!, popupEnabled: true })}>Tắt popup</Button>}</>}
    </section>
    <div className="mb-4 max-w-xs"><Select aria-label="Lọc theo trạng thái" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option>{Object.entries(promotionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-4 text-red-600">{error}</p>}
    {loading && <p role="status" className="mb-3 text-base text-[var(--muted-fg)]">Đang tải chương trình...</p>}
    <DataTable<Promotion> data={result?.data || []} columns={[
      { key: 'title', label: 'Chương trình', render: row => <div className="flex items-center gap-3 min-w-[260px]"><Image src={row.imageUrl} alt="" width={88} height={66} unoptimized className="h-16 w-22 shrink-0 rounded-lg bg-[var(--muted)] object-contain" /><div><span className="admin-list-text block text-base font-semibold" title={row.title}>{row.title}</span><span className="mt-1 block text-sm text-[var(--muted-fg)]">{row.kind === 'event' ? 'Sự kiện' : 'Khuyến mãi'} · {row.isPublished ? 'Đã đăng' : 'Bản nháp'}</span></div></div> },
      { key: 'startsAt', label: 'Ngày áp dụng', render: row => <div className="text-sm leading-6 whitespace-nowrap"><span className="block">Từ {promotionDate(row.startsAt)}</span><span className="block text-[var(--muted-fg)]">Đến {promotionDate(row.endsAt)}</span></div> },
      { key: 'status', label: 'Trạng thái', render: row => <PeriodBadge status={row.status} /> },
      { key: 'popupEnabled', label: 'Popup quảng cáo', render: row => canUpdate ? <button type="button" aria-pressed={row.popupEnabled} aria-label={`${row.popupEnabled ? 'Tắt' : 'Bật'} popup: ${row.title}`} disabled={switching || !row.isPublished || row.status === 'ended'} onClick={() => void toggle(row)} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${row.popupEnabled ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : 'border-[var(--border-color)] hover:bg-[var(--muted)]'}`}><span className={`h-2 w-2 rounded-full ${row.popupEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />{row.popupEnabled ? 'Đang bật' : 'Bật popup'}</button> : row.popupEnabled ? 'Đang bật' : 'Tắt' },
    ]} onEdit={canUpdate ? row => { void api<Promotion>(`/admin/promotions/${row.id}`).then(setEditing).catch(failure => toast.error(failure instanceof Error ? failure.message : 'Không tải được chương trình.')); } : undefined}
      onDelete={canDelete ? setDeleting : undefined} emptyMessage="Chưa có chương trình phù hợp." searchPlaceholder="Tìm tiêu đề chương trình..."
      remote={{ page, total: result?.meta.total || 0, perPage: 10, search, onPage: setPage, onSearch: value => { setSearch(value); setPage(1); } }} />
    <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Xóa chương trình" message={`Xóa “${deleting?.title || ''}”? Nếu đang dùng làm popup, ảnh quảng cáo cũng sẽ được tắt.`} onConfirm={() => {
      if(!deleting) return;
      void api(`/admin/promotions/${deleting.id}`, json('DELETE')).then(() => { refresh(); toast.success('Đã xóa chương trình.'); }).catch(failure => toast.error(failure instanceof Error ? failure.message : 'Không thể xóa.'));
    }} />
  </>;
}
