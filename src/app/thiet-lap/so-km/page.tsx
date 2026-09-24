'use client';
import CrudPage from '@/components/CrudPage';
import { mockMileages } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
export default function Page() {
  return <CrudPage title="Quản lý số km" data={mockMileages as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Khoảng số km', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'slug', label: 'Slug' },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Khoảng số km', required: true },
    { name: 'slug', label: 'Slug' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['name']} />;
}
