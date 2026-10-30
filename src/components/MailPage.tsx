'use client';
import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, Modal, ConfirmDialog, Button } from '@/components/ui';
import { useAdminList, useWriteAction } from '@/lib/api/use-admin-list';
import { api, json, query, type PageResult } from '@/lib/api/client';
import { CheckCircle, Phone, User, Calendar, Car, Eye, MailOpen, Mail as MailIcon, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Mail } from '@/lib/types';
import { formatDate } from '@/lib/date';

function MailPage({ type, title, subtitle }: { type: Mail['type']; title: string; subtitle: string }) {
  const write = useWriteAction();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ sortBy?: string; sortDirection?: 'asc' | 'desc' }>({});
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied' | 'unviewed' | 'viewed'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const newsletter = type === 'dang-ky';
  const endpoint = newsletter ? '/admin/newsletter-subscribers' : '/admin/leads';
  const leadType = { 'ban-xe': 'sell', 'len-doi': 'trade_in', 'goi-lai': 'callback', 'dang-ky': '' }[type];
  const { data: mails, meta, error, loading, reload } = useAdminList<Mail>(JSON.stringify([endpoint, page, search, leadType, filter, sort]), async signal => {
    const result = await api<PageResult<Record<string, unknown>>>(`${endpoint}${query({ page, limit: 10, search, type: leadType,
      status: !newsletter && filter !== 'all' ? filter : undefined, view: newsletter && filter !== 'all' ? filter : undefined, ...sort })}`, { signal });
    if (!signal.aborted && page > Math.max(1, result.meta.totalPages)) setPage(Math.max(1, result.meta.totalPages)); return { ...result, data: result.data.map(row => ({ ...row, type, name: String(row.name || row.email || 'Khách hàng'), phone: String(row.phone || ''),
        carName: String(row.carName || row.offeredModel || ''), currentCar: String(row.currentCar || [row.offeredBrand, row.offeredModel, row.offeredYear].filter(Boolean).join(' ')),
        desiredCar: String(row.desiredCar || ''), status: String(row.status || 'active'),
        viewedAt: row.viewedAt ? String(row.viewedAt) : null, createdAt: String(row.createdAt || '') })) as Mail[] };
  });
  const total = meta.total;
  const changed = () => window.dispatchEvent(new Event('admin-leads-change'));
  const [viewItem, setViewItem] = useState<Mail | null>(null);
  const [deleteItem, setDeleteItem] = useState<Mail | null>(null);

  const updateStatus = (mail: Mail, status: 'unread' | 'read' | 'replied' | 'unviewed' | 'viewed') => write(async () => {
    try {
      if (newsletter) await api(`${endpoint}/${mail.id}/view`, json('PATCH', { viewed: status === 'viewed' }));
      else await api(`${endpoint}/${mail.id}`, json('PATCH', { status }));
      setViewItem(current => {
        if (current?.id !== mail.id) return current;
        if (newsletter) return { ...current, viewedAt: status === 'viewed' ? new Date().toISOString() : null };
        return { ...current, status: status as 'unread' | 'read' | 'replied' };
      });
      setSelected(new Set()); changed(); await reload();
      toast.success(`Đã đánh dấu ${status === 'unviewed' ? 'chưa xem' : status === 'viewed' ? 'đã xem' : status === 'unread' ? 'chưa đọc' : status === 'read' ? 'đã đọc' : 'đã liên hệ'}.`);
    }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể cập nhật.'); }
  });

  const bulkUpdate = (status: 'unread' | 'read' | 'replied' | 'unviewed' | 'viewed') => write(async () => {
    const ids = [...selected];
    if (!ids.length) return;
    try {
      const result = await api<{ updated: number }>(newsletter ? `${endpoint}/bulk-view` : `${endpoint}/bulk-status`,
        json('PATCH', newsletter ? { ids, viewed: status === 'viewed' } : { ids, status }));
      setSelected(new Set()); changed(); await reload();
      toast.success(`Đã cập nhật ${result.updated} ${newsletter ? 'đăng ký' : 'thư'}.`);
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể cập nhật.'); }
  });

  const columns = [
    { key: 'id', label: 'STT', width: '60px', render: (item: Record<string, unknown>) => <span className="text-[var(--muted-fg)]">#{String(item.id)}</span> },
    ...(type !== 'dang-ky' ? [{
      key: 'name', label: 'Khách hàng', render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${item.status === 'unread' ? 'bg-red-500' : 'bg-gray-400'}`}>
            {String(item.name).charAt(0)}
          </div>
          <div className="min-w-0 max-w-80">
            <p title={String(item.name)} className={`admin-list-text text-sm ${item.status === 'unread' ? 'font-bold' : 'font-medium'}`}>{String(item.name)}</p>
            <p className="text-xs text-[var(--muted-fg)]">{String(item.phone)}</p>
          </div>
        </div>
      )
    }] : []),
    ...(type === 'ban-xe' ? [{ key: 'carName', label: 'Xe muốn bán', render: (item: Record<string, unknown>) => <span className="admin-list-text text-sm" title={String(item.carName || '—')}>{String(item.carName || '—')}</span> }] : []),
    ...(type === 'len-doi' ? [
      { key: 'currentCar', label: 'Xe hiện tại', render: (item: Record<string, unknown>) => <span className="admin-list-text text-sm" title={String(item.currentCar || '—')}>{String(item.currentCar || '—')}</span> },
      { key: 'desiredCar', label: 'Xe muốn đổi', render: (item: Record<string, unknown>) => <span className="admin-list-text text-sm font-medium text-red-600" title={String(item.desiredCar || '—')}>{String(item.desiredCar || '—')}</span> },
    ] : []),
    ...(type === 'goi-lai' ? [{ key: 'carName', label: 'Xe quan tâm', render: (item: Record<string, unknown>) => <span className="admin-list-text text-sm" title={String(item.carName || '—')}>{String(item.carName || '—')}</span> }] : []),
    ...(type === 'dang-ky' ? [{ key: 'email', label: 'Email', render: (item: Record<string, unknown>) => <span className="admin-list-text text-sm" title={String(item.email || '—')}>{String(item.email || '—')}</span> }] : []),
    { key: 'createdAt', label: 'Ngày gửi', sortable: true },
    ...(newsletter ? [
      { key: 'viewedAt', label: 'Đã xem', render: (item: Record<string, unknown>) => <StatusBadge status={item.viewedAt ? 'read' : 'unread'} labels={{ read: 'Đã xem', unread: 'Chưa xem' }} /> },
      { key: 'status', label: 'Đăng ký', render: (item: Record<string, unknown>) => <StatusBadge status={String(item.status)} labels={{ active: 'Hoạt động', inactive: 'Ngừng nhận tin' }} /> },
    ] : [{ key: 'status', label: 'Xử lý', render: (item: Record<string, unknown>) => <StatusBadge status={String(item.status)} labels={{ replied: 'Đã liên hệ' }} /> }]),
  ];

  const counts = meta.counts;
  const unreadCount = counts?.[newsletter ? 'unviewed' : 'unread'] ?? 0;
  const filterOptions = newsletter
    ? [{ key: 'all', label: 'Tất cả' }, { key: 'unviewed', label: 'Chưa xem' }, { key: 'viewed', label: 'Đã xem' }]
    : [{ key: 'all', label: 'Tất cả' }, { key: 'unread', label: 'Chưa đọc' }, { key: 'read', label: 'Đã đọc' }, { key: 'replied', label: 'Đã liên hệ' }];
  const selectFilter = (key: string) => { setFilter(key as typeof filter); setPage(1); setSelected(new Set()); };
  const openMail = (mail: Mail) => { setViewItem(mail); if (newsletter ? !mail.viewedAt : mail.status === 'unread') void updateStatus(mail, newsletter ? 'viewed' : 'read'); };
  const exportEmails = async () => {
    try {
    const csv = await api<string>('/admin/newsletter-subscribers/export');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'dang-ky-nhan-tin.csv'; link.click(); URL.revokeObjectURL(url);
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể xuất danh sách.'); }
  };

  return (
    <div className="space-y-6">
      {!viewItem && <><PageHeader
        title={title}
        subtitle={`${subtitle} • ${counts?.all ?? total} ${newsletter ? 'đăng ký' : 'thư'} • ${unreadCount} ${newsletter ? 'chưa xem' : 'chưa đọc'}`}
        actions={
          newsletter ? <Button variant="secondary" size="sm" onClick={exportEmails}>Xuất danh sách email</Button> : undefined
        }
      />

      {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error} <button className="underline" onClick={() => void reload()}>Thử lại</button></div>}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-2" aria-label="Lọc theo trạng thái">
        {filterOptions.map(option => <button key={option.key} type="button" onClick={() => selectFilter(option.key)}
          aria-pressed={filter === option.key}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${filter === option.key ? 'bg-red-600 text-white shadow-sm' : 'text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'}`}>
          {option.label} <span className={filter === option.key ? 'text-red-100' : 'text-[var(--muted-fg)]'}>({counts?.[option.key] ?? 0})</span>
        </button>)}
      </div>
      {selected.size > 0 && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-slate-800 dark:border-red-900 dark:bg-red-950/30 dark:text-slate-100">
        <strong className="mr-2">Đã chọn {selected.size} {newsletter ? 'đăng ký' : 'thư'} trên trang</strong>
        <Button variant="secondary" size="sm" onClick={() => void bulkUpdate(newsletter ? 'viewed' : 'read')}><CheckCircle className="h-4 w-4" /> {newsletter ? 'Đã xem' : 'Đã đọc'}</Button>
        <Button variant="secondary" size="sm" onClick={() => void bulkUpdate(newsletter ? 'unviewed' : 'unread')}><RotateCcw className="h-4 w-4" /> {newsletter ? 'Chưa xem' : 'Chưa đọc'}</Button>
        {!newsletter && <Button variant="secondary" size="sm" onClick={() => void bulkUpdate('replied')}>Đã liên hệ</Button>}
        <button type="button" className="ml-auto underline" onClick={() => setSelected(new Set())}>Bỏ chọn</button>
      </div>}
      <DataTable
        columns={columns}
        data={mails as unknown as Record<string, unknown>[]}
        selection={{ selected, onChange: setSelected }}
        emptyMessage={loading ? 'Đang tải dữ liệu...' : undefined}
        remote={{ ...sort, onSort: (sortBy, sortDirection) => { setPage(1); setSelected(new Set()); setSort({ sortBy, sortDirection }); }, page, total, perPage: 10, search,
          onPage: value => { setPage(value); setSelected(new Set()); }, onSearch: value => { setPage(1); setSelected(new Set()); setSearch(value); } }}
        searchPlaceholder={newsletter ? 'Tìm theo email...' : 'Tìm theo tên, số điện thoại, xe...'}
        searchFields={['name', 'phone', 'email', 'carName', 'desiredCar']}
        actions={item => { const mail = item as unknown as Mail; return <>
          <button type="button" aria-label="Xem chi tiết" title="Xem chi tiết" onClick={() => openMail(mail)} className="rounded-lg p-2 text-[var(--muted-fg)] hover:bg-blue-500/10 hover:text-blue-600"><Eye className="h-5 w-5" /></button>
          <button type="button" aria-label={newsletter ? mail.viewedAt ? 'Đánh dấu chưa xem' : 'Đánh dấu đã xem' : mail.status === 'unread' ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
            title={newsletter ? mail.viewedAt ? 'Đánh dấu chưa xem' : 'Đánh dấu đã xem' : mail.status === 'unread' ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
            onClick={() => void updateStatus(mail, newsletter ? mail.viewedAt ? 'unviewed' : 'viewed' : mail.status === 'unread' ? 'read' : 'unread')}
            className="rounded-lg p-2 text-[var(--muted-fg)] hover:bg-amber-500/10 hover:text-amber-600">{newsletter ? mail.viewedAt ? <MailIcon className="h-5 w-5" /> : <MailOpen className="h-5 w-5" /> : mail.status === 'unread' ? <MailOpen className="h-5 w-5" /> : <MailIcon className="h-5 w-5" />}</button>
          {!newsletter && mail.status !== 'replied' && <button type="button" aria-label="Đánh dấu đã liên hệ" title="Đánh dấu đã liên hệ" onClick={() => void updateStatus(mail, 'replied')} className="rounded-lg p-2 text-[var(--muted-fg)] hover:bg-emerald-500/10 hover:text-emerald-600"><CheckCircle className="h-5 w-5" /></button>}
          <button type="button" aria-label="Xóa" title="Xóa" onClick={() => setDeleteItem(mail)} className="rounded-lg p-2 text-[var(--muted-fg)] hover:bg-red-500/10 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
        </>; }}
      />
      </>}

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title={newsletter ? 'Chi tiết đăng ký nhận tin' : 'Chi tiết thư'} size="md">
        {viewItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--muted)]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold">
                {viewItem.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{viewItem.name}</h3>
                <p className="break-all text-sm text-[var(--muted-fg)]">{newsletter ? viewItem.email : viewItem.phone}{!newsletter && viewItem.email ? ` • ${viewItem.email}` : ''}</p>
                <div className="mt-2 flex flex-wrap gap-2">{newsletter ? <><StatusBadge status={viewItem.viewedAt ? 'read' : 'unread'} labels={{ read: 'Đã xem', unread: 'Chưa xem' }} /><StatusBadge status={viewItem.status} labels={{ inactive: 'Ngừng nhận tin' }} /></> : <StatusBadge status={viewItem.status} labels={{ replied: 'Đã liên hệ' }} />}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {viewItem.phone && <InfoCard icon={<Phone className="w-4 h-4" />} label="Số điện thoại" value={viewItem.phone} />}
              <InfoCard icon={<Calendar className="w-4 h-4" />} label="Ngày gửi" value={formatDate(viewItem.createdAt)} />
              {viewItem.carName && <InfoCard icon={<Car className="w-4 h-4" />} label="Xe" value={viewItem.carName} />}
              {viewItem.currentCar && <InfoCard icon={<Car className="w-4 h-4" />} label="Xe hiện tại" value={viewItem.currentCar} />}
              {viewItem.desiredCar && <InfoCard icon={<Car className="w-4 h-4" />} label="Xe muốn đổi" value={viewItem.desiredCar} />}
              {viewItem.email && <InfoCard icon={<User className="w-4 h-4" />} label="Email" value={viewItem.email} />}
            </div>
            {viewItem.content && (
              <div className="p-4 rounded-xl bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-fg)] mb-2">Nội dung</p>
                <p className="text-sm">{viewItem.content}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 border-t border-[var(--border-color)] pt-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => void updateStatus(viewItem, newsletter ? viewItem.viewedAt ? 'unviewed' : 'viewed' : viewItem.status === 'unread' ? 'read' : 'unread')}>
                {newsletter ? viewItem.viewedAt ? 'Đánh dấu chưa xem' : 'Đánh dấu đã xem' : viewItem.status === 'unread' ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
              </Button>
              {!newsletter && viewItem.status !== 'replied' && <Button type="button" size="sm" onClick={() => void updateStatus(viewItem, 'replied')}>Đánh dấu đã liên hệ</Button>}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => write(async () => { if (deleteItem) { try { await api(`${endpoint}/${deleteItem.id}`, json('DELETE')); toast.success('Đã xóa thư!'); setDeleteItem(null); setSelected(new Set()); changed(); await reload(); } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể xóa.'); } } })} message={`Xóa thư của "${deleteItem?.name}"?`} />
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--muted)] flex items-start gap-3">
      <div className="text-[var(--muted-fg)] mt-0.5">{icon}</div>
      <div>
        <p className="text-sm text-[var(--muted-fg)]">{label}</p>
        <p className="break-all text-base font-medium">{value}</p>
      </div>
    </div>
  );
}

export default MailPage;
