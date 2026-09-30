'use client';

import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';

export default function AccessoryCategoriesPage() {
  return <CrudPage
    title="Danh mục phụ kiện"
    subtitle="Tạo và quản lý nhóm phụ kiện ô tô"
    columns={[
      { key: 'name', label: 'Tên danh mục', render: item => <strong>{String(item.name)}</strong> },
      { key: 'status', label: 'Trạng thái', render: item => <StatusBadge status={String(item.status)} /> },
    ]}
    formFields={[
      { name: 'name', label: 'Tên danh mục', required: true, placeholder: 'Ví dụ: Camera hành trình' },
      { name: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number', min: 0, defaultValue: 0 },
      { name: 'status', label: 'Trạng thái', type: 'select', defaultValue: 'active', options: [
        { value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' },
      ] },
    ]}
    searchPlaceholder="Tìm danh mục..."
  />;
}
