'use client';

import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';

export default function AccessoryBrandsPage() {
  return <CrudPage
    title="Thương hiệu phụ kiện"
    subtitle="Thương hiệu cũ được đưa vào đây; có thể thêm logo và thương hiệu mới"
    columns={[
      { key: 'imageUrl', label: 'Logo', render: item => item.imageUrl
        ? <img src={String(item.imageUrl)} alt="" className="h-12 w-16 rounded-lg bg-white object-contain" /> : '—' },
      { key: 'name', label: 'Thương hiệu', render: item => <strong>{String(item.name)}</strong> },
      { key: 'status', label: 'Trạng thái', render: item => <StatusBadge status={String(item.status)} /> },
    ]}
    formFields={[
      { name: 'name', label: 'Tên thương hiệu', required: true, placeholder: 'Ví dụ: 70mai' },
      { name: 'imageUrl', label: 'Logo / ảnh đại diện', type: 'image', hint: 'Nên dùng ảnh vuông hoặc logo nền trong suốt.' },
      { name: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number', min: 0, defaultValue: 0 },
      { name: 'status', label: 'Trạng thái', type: 'select', defaultValue: 'active', options: [
        { value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' },
      ] },
    ]}
    searchPlaceholder="Tìm thương hiệu..."
  />;
}
