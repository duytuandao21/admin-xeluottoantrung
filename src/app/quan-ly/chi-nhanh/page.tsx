'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';

export default function ChiNhanhPage() {
  return (
    <CrudPage
      title="Quản lý chi nhánh"
      columns={[
        { key: 'id', label: 'STT', width: '60px' },
        { key: 'name', label: 'Tên chi nhánh', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
        { key: 'address', label: 'Địa chỉ', render: (item) => <span className="text-sm text-[var(--muted-fg)]">{String(item.address)}</span> },
        { key: 'phone', label: 'Điện thoại' },
        { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
      ]}
      formFields={[
        { name: 'name', label: 'Tên chi nhánh', required: true, placeholder: 'VD: Chi nhánh Quận 7' },
        { name: 'image', label: 'Hình chi nhánh', type: 'image' },
        { name: 'phone', label: 'Số điện thoại', required: true, placeholder: '028 1234 5678' },
        { name: 'address', label: 'Địa chỉ', required: true, placeholder: 'Số nhà, đường, quận, TP' },
        { name: 'mapUrl', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...' },
        { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
      ]}
      searchPlaceholder="Tìm kiếm chi nhánh..."
      searchFields={['name', 'address', 'phone']}
    />
  );
}
