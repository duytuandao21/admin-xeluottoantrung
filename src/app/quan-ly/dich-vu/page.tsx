'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
import { richTextPreview } from '@/lib/rich-text';
export default function DichVuPage() {
  return <CrudPage title="Quản lý dịch vụ" columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'title', label: 'Tên dịch vụ', sortable: true, render: (item) => <span className="font-medium">{String(item.title)}</span> },
    { key: 'description', label: 'Mô tả', render: (item) => <span className="text-sm text-[var(--muted-fg)] truncate max-w-xs block">{richTextPreview(String(item.description))}</span> },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'title', label: 'Tên dịch vụ', required: true, placeholder: 'VD: Mua bán xe ô tô' },
    { name: 'image', label: 'Hình dịch vụ', type: 'image' },
    { name: 'description', label: 'Mô tả', type: 'richtext', required: true, placeholder: 'Mô tả dịch vụ...' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm dịch vụ..." searchFields={['title', 'description']} nameField="title" />;
}
