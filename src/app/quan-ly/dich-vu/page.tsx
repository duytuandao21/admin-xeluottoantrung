'use client';
import CrudPage from '@/components/CrudPage';
import { mockServices } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
export default function DichVuPage() {
  return <CrudPage title="Quản lý dịch vụ" data={mockServices as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'title', label: 'Tên dịch vụ', sortable: true, render: (item) => <span className="font-medium">{String(item.title)}</span> },
    { key: 'description', label: 'Mô tả', render: (item) => <span className="text-sm text-[var(--muted-fg)] truncate max-w-xs block">{String(item.description)}</span> },
    { key: 'order', label: 'Thứ tự', sortable: true },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'title', label: 'Tên dịch vụ', required: true, placeholder: 'VD: Mua bán xe ô tô' },
    { name: 'description', label: 'Mô tả', type: 'textarea', required: true, placeholder: 'Mô tả dịch vụ...' },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm dịch vụ..." searchFields={['title', 'description']} nameField="title" />;
}
