'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
export default function NganSachPage() {
  return <CrudPage title="Quản lý ngân sách" subtitle="Nhập giá theo triệu đồng (1 tỷ = 1000 triệu). Danh sách tự sắp xếp từ thấp đến cao." columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Khoảng ngân sách', render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'minPrice', label: 'Giá từ (triệu đồng)', type: 'number', min: 0, max: 2_000_000_000, required: true, placeholder: 'VD: 500' },
    { name: 'maxPrice', label: 'Giá đến (triệu đồng)', type: 'number', min: 1, max: 2_000_000_000, required: true, placeholder: 'VD: 1000 (1 tỷ)' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['name']} />;
}
