'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
export default function Page() {
  return <CrudPage title="Quản lý tình trạng xe" columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Tình trạng', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'slug', label: 'Slug' },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Tình trạng', required: true },
    { name: 'slug', label: 'Slug' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['name']} />;
}
