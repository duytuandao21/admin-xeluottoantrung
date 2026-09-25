'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
export default function NganSachPage() {
  return <CrudPage title="Quản lý ngân sách" columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Khoảng ngân sách', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'slug', label: 'Slug' },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Khoảng ngân sách', required: true, placeholder: 'VD: 500 - 800 triệu' },
    { name: 'slug', label: 'Slug', placeholder: 'VD: 500-800' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['name']} />;
}
