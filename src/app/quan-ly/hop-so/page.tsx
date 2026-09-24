'use client';
import CrudPage from '@/components/CrudPage';
import { mockGearBoxes } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
export default function HopSoPage() {
  return <CrudPage title="Quản lý hộp số" data={mockGearBoxes as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Loại hộp số', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'slug', label: 'Slug' },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Loại hộp số', required: true, placeholder: 'VD: Tự động (AT)' },
    { name: 'slug', label: 'Slug', placeholder: 'VD: tu-dong' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['name']} />;
}
