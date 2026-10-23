'use client';
/* eslint-disable @next/next/no-img-element -- Preview the existing or uploaded logo directly. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Monitor, Phone, Plus, Save, Timer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, PageHeader } from '@/components/ui';
import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/lib/auth-context';
import { loadTVDisplay, saveTVDisplay, type TVConfig, type TVHotline } from '@/lib/api/tv-display';
import { uploadAsset } from '@/lib/api/media';

const panel = 'rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6';
const muted = 'text-sm text-[var(--muted-fg)]';

export default function TVDisplayPage() {
  const { identity, loading: authLoading } = useAuth();
  const canRead = Boolean(identity?.permissions.includes('content.read'));
  const canWrite = Boolean(identity?.permissions.includes('content.update'));
  const [config, setConfig] = useState<TVConfig | null>(null);
  const [sales, setSales] = useState<TVHotline[]>([]);
  const [websiteLogo, setWebsiteLogo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [saved, setSaved] = useState('');
  const uploaded = useRef<{ signature: string; url: string } | null>(null);
  const load = useCallback(async () => {
    const data = await loadTVDisplay();
    setConfig(data.config); setSales(data.sales); setWebsiteLogo(data.websiteLogo);
    setSaved(JSON.stringify(data.config)); setError('');
  }, []);
  useEffect(() => {
    if (authLoading || !canRead) return;
    let live = true;
    loadTVDisplay().then(data => {
      if (!live) return;
      setConfig(data.config); setSales(data.sales); setWebsiteLogo(data.websiteLogo); setSaved(JSON.stringify(data.config));
    }).catch(failure => { if (live) setError(failure instanceof Error ? failure.message : 'Không tải được TV Display.'); });
    return () => { live = false; };
  }, [authLoading, canRead]);
  const changed = config && saved !== JSON.stringify(config);
  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changed]);
  const update = (patch: Partial<TVConfig>) => setConfig(previous => previous ? { ...previous, ...patch } : previous);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!config || !canWrite || busy) return;
    const form = new FormData(event.currentTarget);
    const next = { ...config, title: config.title.trim(), hotlineTitle: config.hotlineTitle.trim(),
      hotlines: config.syncSalesContacts ? [] : config.hotlines.map(row => ({ name: row.name.trim(), phone: row.phone.replace(/[\s().-]/g, '') })) };
    const selected = new Set<string>();
    if (!next.title || !next.hotlineTitle) { toast.error('Vui lòng nhập đủ tiêu đề.'); return; }
    if (!next.syncSalesContacts && !next.hotlines.length) { toast.error('Vui lòng thêm ít nhất một số hotline.'); return; }
    for (const row of next.hotlines) {
      const phoneIdentity = row.phone.replace(/^\+?84(?=\d{9}$)/, '0');
      if (!/^\+?\d{9,12}$/.test(row.phone)) { toast.error('Hotline phải có 9–12 chữ số.'); return; }
      if (selected.has(phoneIdentity)) { toast.error('Danh sách hotline bị trùng số.'); return; }
      selected.add(phoneIdentity);
    }
    setBusy(true);
    try {
      const file = form.get('logo');
      if (file instanceof File && file.size) {
        const signature = `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
        if (uploaded.current?.signature !== signature) uploaded.current = { signature, url: await uploadAsset(file) };
        next.logoUrl = uploaded.current.url;
      } else if (form.has('logo__remove')) next.logoUrl = '';
      await saveTVDisplay(next);
      setConfig(next); setSaved(JSON.stringify(next)); setImageKey(value => value + 1); uploaded.current = null;
      toast.success('Đã lưu TV Display. Màn hình TV nhận cấu hình trong lần cập nhật kế tiếp.');
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể lưu. Nội dung đang nhập được giữ lại.'); }
    finally { setBusy(false); }
  };
  if (authLoading) return <p className="p-6 text-[var(--muted-fg)]">Đang tải TV Display…</p>;
  if (!canRead) return <p className="p-6 text-red-600">Tài khoản chưa có quyền xem TV Display.</p>;
  if (!config) return <div className={panel}>{error ? <div role="alert"><p>{error}</p><Button className="mt-4" onClick={() => void load().catch(failure => setError(failure.message))}>Thử lại</Button></div> : <p className={muted}>Đang tải TV Display…</p>}</div>;
  const displayed = config.syncSalesContacts ? sales : config.hotlines;
  const contact = (index: number, patch: Partial<TVHotline>) => update({ hotlines: config.hotlines.map((row, i) => i === index ? { ...row, ...patch } : row) });
  const move = (index: number, direction: number) => {
    const rows = [...config.hotlines];
    [rows[index], rows[index + direction]] = [rows[index + direction], rows[index]];
    update({ hotlines: rows });
  };
  return <div className="space-y-6">
    <PageHeader title="TV Display" subtitle="Quản lý bảng giá và hotline trình chiếu tại cửa hàng." actions={
      canWrite && <Button type="submit" form="tv-display-form" disabled={busy}><Save size={17}/>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</Button>}/>
    {!canWrite && <p className={muted}>Bạn có quyền xem; cần quyền chỉnh sửa nội dung để lưu thay đổi.</p>}
    <form id="tv-display-form" onSubmit={save}>
      <fieldset disabled={busy || !canWrite} className="min-w-0 space-y-6">
        <div className="grid gap-6 xl:grid-cols-3">
          <section className={`${panel} space-y-5 xl:col-span-2`}>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Monitor size={20} className="text-red-500"/>Nội dung hiển thị</h2>
            <div className="space-y-2"><label htmlFor="tv-title" className="text-sm font-semibold">Tiêu đề bảng giá</label>
              <Input id="tv-title" required maxLength={60} value={config.title} onChange={event => update({ title: event.target.value })}/></div>
            <div className="space-y-2"><label htmlFor="tv-hotline-title" className="text-sm font-semibold">Tiêu đề hotline</label>
              <Input id="tv-hotline-title" required maxLength={24} value={config.hotlineTitle} onChange={event => update({ hotlineTitle: event.target.value })}/></div>
            <div className="space-y-2"><p className="text-sm font-semibold">Logo TV Display</p>
              <ImageUpload key={imageKey} name="logo" existing={config.logoUrl} hint="Để trống để dùng logo website. Nhấn × trước khi thay logo riêng."/></div>
          </section>
          <aside className={`${panel} space-y-5`}>
            <h2 className="text-lg font-semibold">Thông tin trình chiếu</h2>
            {(config.logoUrl || websiteLogo) && <div className="rounded-xl bg-white p-5"><img src={config.logoUrl || websiteLogo} alt="Logo đang cấu hình cho TV" className="mx-auto h-20 max-w-full object-contain"/></div>}
            <div className="rounded-xl bg-[var(--muted)] p-4"><p className="break-words font-semibold">{config.title}</p><p className={`${muted} mt-2`}>{config.hotlineTitle}</p><p className="mt-1 text-xl font-bold text-red-600">{displayed[0]?.phone || 'Dùng hotline website'}</p></div>
            <p className={muted}>Thay đổi chỉ áp dụng cho /TV. Màn hình đang mở kiểm tra cấu hình mỗi 5 phút; tải lại /TV để áp dụng ngay.</p>
          </aside>
        </div>
        <section className={`${panel} space-y-5`}>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Timer size={20} className="text-red-500"/>Thời gian chuyển</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2"><label htmlFor="tv-car-seconds" className="text-sm font-semibold">Chuyển lượt xe (giây)</label>
              <Input id="tv-car-seconds" type="number" min={5} max={300} step={1} required value={config.carIntervalSeconds} onChange={event => update({ carIntervalSeconds: Number(event.target.value) })}/>
              <p className={muted}>Mặc định 15 giây, cho phép 5–300 giây. Nếu ảnh chưa sẵn sàng, tiếp tục giữ lượt hiện tại.</p></div>
            <div className="space-y-2"><label htmlFor="tv-phone-seconds" className="text-sm font-semibold">Chuyển số hotline (giây)</label>
              <Input id="tv-phone-seconds" type="number" min={2} max={120} step={1} required value={config.hotlineIntervalSeconds} onChange={event => update({ hotlineIntervalSeconds: Number(event.target.value) })}/>
              <p className={muted}>Mặc định 5 giây, cho phép 2–120 giây. Hotline chuyển độc lập với các thẻ xe.</p></div>
          </div>
        </section>
        <section className={`${panel} space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-semibold"><Phone size={20} className="text-red-500"/>Danh sách hotline <span className="text-sm font-normal text-[var(--muted-fg)]">({displayed.length} số)</span></h2>
            <a href="/thiet-lap/nut-goi" className="inline-flex items-center gap-1 text-sm text-red-600">Quản lý Nút gọi<ExternalLink size={14}/></a></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[var(--muted)] p-4">
            <input type="checkbox" checked={config.syncSalesContacts} onChange={event => update({ syncSalesContacts: event.target.checked,
              hotlines: !event.target.checked && !config.hotlines.length ? sales.map(row => ({ ...row })) : config.hotlines })} className="mt-1 h-4 w-4 accent-red-600"/>
            <span><span className="font-medium">Đồng bộ số tư vấn bán hàng từ Nút gọi</span><span className={`mt-1 block ${muted}`}>Chỉ lấy liên hệ đang hoạt động có mô tả “Tư vấn bán hàng”. Tắt để dùng danh sách riêng cho TV.</span></span>
          </label>
          {config.syncSalesContacts ? <div className="grid gap-3 md:grid-cols-2">{sales.map(row => <div key={row.phone} className="flex flex-wrap justify-between gap-2 rounded-xl border border-[var(--border-color)] p-4"><span>{row.name}</span><strong className="text-red-600">{row.phone}</strong></div>)}
            {!sales.length && <p className={muted}>Chưa có số tư vấn bán hàng hợp lệ. TV tạm dùng hotline chung của website.</p>}</div> : <div className="space-y-3">
            {config.hotlines.map((row, index) => <div key={index} className="grid items-end gap-3 rounded-xl border border-[var(--border-color)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="space-y-2"><label htmlFor={`tv-name-${index}`} className="text-sm font-semibold">Tên liên hệ {index + 1}</label><Input id={`tv-name-${index}`} maxLength={80} value={row.name} onChange={event => contact(index, { name: event.target.value })}/></div>
              <div className="space-y-2"><label htmlFor={`tv-number-${index}`} className="text-sm font-semibold">Số điện thoại</label><Input id={`tv-number-${index}`} type="tel" required maxLength={30} value={row.phone} onChange={event => contact(index, { phone: event.target.value })}/></div>
              <div className="flex gap-1"><Button type="button" variant="ghost" disabled={index === 0} aria-label={`Đưa số ${index + 1} lên`} onClick={() => move(index, -1)}><ArrowUp size={17}/></Button><Button type="button" variant="ghost" disabled={index === config.hotlines.length - 1} aria-label={`Đưa số ${index + 1} xuống`} onClick={() => move(index, 1)}><ArrowDown size={17}/></Button><Button type="button" variant="ghost" aria-label={`Xóa số ${index + 1}`} onClick={() => update({ hotlines: config.hotlines.filter((_, i) => i !== index) })}><Trash2 size={17} className="text-red-500"/></Button></div>
            </div>)}
            <Button type="button" variant="secondary" disabled={config.hotlines.length >= 30} onClick={() => update({ hotlines: [...config.hotlines, { name: '', phone: '' }] })}><Plus size={17}/>Thêm hotline</Button>
          </div>}
        </section>
      </fieldset>
    </form>
  </div>;
}
