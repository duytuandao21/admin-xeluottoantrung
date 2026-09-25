'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
export default function KieuDangPage() {
  return <CrudPage title="Quản lý kiểu dáng" columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Tên kiểu dáng', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'slug', label: 'Slug' },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Tên kiểu dáng', required: true, placeholder: 'VD: Sedan' },
    { name: 'image', label: 'Hình kiểu dáng', type: 'image' },
    { name: 'slug', label: 'Slug', placeholder: 'VD: sedan' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm kiểu dáng..." searchFields={['name']} />;
}
