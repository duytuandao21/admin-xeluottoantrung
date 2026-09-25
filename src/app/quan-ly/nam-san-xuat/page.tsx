'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
export default function NamSanXuatPage() {
  return <CrudPage title="Quản lý năm sản xuất" columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Năm sản xuất', sortable: true, render: (item) => <span className="font-semibold">{String(item.name)}</span> },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Năm sản xuất', required: true, placeholder: 'VD: 2024' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm năm..." searchFields={['name']} />;
}
