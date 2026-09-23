'use client';
import CrudPage from '@/components/CrudPage';
import { mockColors } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
export default function Page() {
  return <CrudPage title="Quản lý biển số" data={mockColors as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Loại biển số', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'slug', label: 'Slug' },
    { key: 'order', label: 'Thứ tự', sortable: true },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Loại biển số', required: true },
    { name: 'slug', label: 'Slug' },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['name']} />;
}
