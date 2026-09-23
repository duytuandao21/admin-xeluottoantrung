'use client';
import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, Modal, ConfirmDialog, Button } from '@/components/ui';
import { mockMails } from '@/lib/mock-data';
import { useLocalStore } from '@/lib/local-store';
import { CheckCircle, Phone, User, Calendar, Car } from 'lucide-react';
import { toast } from 'sonner';
import type { Mail } from '@/lib/types';

function MailPage({ type, title, subtitle }: { type: Mail['type']; title: string; subtitle: string }) {
  const [mails, setMails] = useLocalStore<Mail[]>(`/thu/${type}`, mockMails.filter(m => m.type === type));
  const [viewItem, setViewItem] = useState<Mail | null>(null);
  const [deleteItem, setDeleteItem] = useState<Mail | null>(null);

  const markRead = (mail: Mail) => {
    setMails(prev => prev.map(m => m.id === mail.id ? { ...m, status: 'read' } : m));
    toast.success('Đã đánh dấu đã đọc');
  };

  const columns = [
    { key: 'id', label: 'STT', width: '60px', render: (item: Record<string, unknown>) => <span className="text-[var(--muted-fg)]">#{String(item.id)}</span> },
    ...(type !== 'dang-ky' ? [{
      key: 'name', label: 'Khách hàng', render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${item.status === 'unread' ? 'bg-red-500' : 'bg-gray-400'}`}>
            {String(item.name).charAt(0)}
          </div>
          <div className="min-w-0">
            <p className={`text-sm truncate ${item.status === 'unread' ? 'font-bold' : 'font-medium'}`}>{String(item.name)}</p>
            <p className="text-xs text-[var(--muted-fg)]">{String(item.phone)}</p>
          </div>
        </div>
      )
    }] : []),
    ...(type === 'ban-xe' ? [{ key: 'carName', label: 'Xe muốn bán', render: (item: Record<string, unknown>) => <span className="text-sm">{String(item.carName || '—')}</span> }] : []),
    ...(type === 'len-doi' ? [
      { key: 'currentCar', label: 'Xe hiện tại', render: (item: Record<string, unknown>) => <span className="text-sm">{String(item.currentCar || '—')}</span> },
      { key: 'desiredCar', label: 'Xe muốn đổi', render: (item: Record<string, unknown>) => <span className="text-sm font-medium text-red-600">{String(item.desiredCar || '—')}</span> },
    ] : []),
    ...(type === 'goi-lai' ? [{ key: 'carName', label: 'Xe quan tâm', render: (item: Record<string, unknown>) => <span className="text-sm">{String(item.carName || '—')}</span> }] : []),
    ...(type === 'dang-ky' ? [{ key: 'email', label: 'Email', render: (item: Record<string, unknown>) => <span className="text-sm">{String(item.email || '—')}</span> }] : []),
    { key: 'createdAt', label: 'Ngày gửi', sortable: true },
    { key: 'status', label: 'Trạng thái', render: (item: Record<string, unknown>) => <StatusBadge status={String(item.status)} /> },
  ];

  const unreadCount = mails.filter(m => m.status === 'unread').length;
  const exportEmails = () => {
    const csv = '\uFEFFEmail\r\n' + mails.map(mail => `"${String(mail.email || '').replaceAll('"', '""')}"`).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'dang-ky-nhan-tin.csv'; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!viewItem && <><PageHeader
        title={title}
        subtitle={`${subtitle} • ${mails.length} thư • ${unreadCount} chưa đọc`}
        actions={
          type === 'dang-ky' ? <Button variant="secondary" size="sm" onClick={exportEmails}>Xuất danh sách email</Button> :
          <Button variant="secondary" size="sm" onClick={() => { setMails(prev => prev.map(m => ({ ...m, status: 'read' as const }))); toast.success('Đã đánh dấu tất cả đã đọc'); }}><CheckCircle className="w-4 h-4" /> Đánh dấu tất cả đã đọc</Button>
        }
      />

      <DataTable
        columns={columns}
        data={mails as unknown as Record<string, unknown>[]}
        searchPlaceholder="Tìm kiếm theo tên, SĐT..."
        searchFields={['name', 'phone', 'email', 'carName', 'desiredCar']}
        onView={(item) => { const m = item as unknown as Mail; setViewItem(m); if (m.status === 'unread') markRead(m); }}
        onDelete={(item) => setDeleteItem(item as unknown as Mail)}
      />
      </>}

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Chi tiết thư" size="md">
        {viewItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--muted)]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold">
                {viewItem.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{viewItem.name}</h3>
                <p className="text-sm text-[var(--muted-fg)]">{viewItem.phone}{viewItem.email ? ` • ${viewItem.email}` : ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon={<Phone className="w-4 h-4" />} label="Số điện thoại" value={viewItem.phone} />
              <InfoCard icon={<Calendar className="w-4 h-4" />} label="Ngày gửi" value={viewItem.createdAt} />
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
            {viewItem.status !== 'replied' && <div className="flex justify-end"><Button type="button" onClick={() => { setMails(prev => prev.map(mail => mail.id === viewItem.id ? { ...mail, status: 'replied' } : mail)); setViewItem({ ...viewItem, status: 'replied' }); toast.success('Đã đánh dấu đã liên hệ.'); }}>Đánh dấu đã liên hệ</Button></div>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => { if (deleteItem) { setMails(prev => prev.filter(m => m.id !== deleteItem.id)); toast.success('Đã xóa thư!'); setDeleteItem(null); } }} message={`Xóa thư của "${deleteItem?.name}"?`} />
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--muted)] flex items-start gap-3">
      <div className="text-[var(--muted-fg)] mt-0.5">{icon}</div>
      <div>
        <p className="text-sm text-[var(--muted-fg)]">{label}</p>
        <p className="text-base font-medium">{value}</p>
      </div>
    </div>
  );
}

export default MailPage;
