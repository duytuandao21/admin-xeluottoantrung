'use client';

import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';

export default function BranchCategoryPage() {
  return <CrudPage title="Danh mục chi nhánh" data={[
    { id: 1, name: 'Miền Nam', order: 1, status: 'active' },
    { id: 2, name: 'Miền Trung', order: 2, status: 'active' },
  ] as Record<string, unknown>[]} columns={[
    { key: 'order', label: 'STT', sortable: true },
    { key: 'name', label: 'Tiêu đề', sortable: true },
    { key: 'status', label: 'Hiển thị', render: item => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Tiêu đề', required: true },
    { name: 'order', label: 'Thứ tự', type: 'number', min: 0 },
    { name: 'status', label: 'Hiển thị', type: 'select', defaultValue: 'active', options: [{ value: 'active', label: 'Có' }, { value: 'inactive', label: 'Không' }] },
  ]} searchPlaceholder="Tìm danh mục chi nhánh..." searchFields={['name']} />;
}
