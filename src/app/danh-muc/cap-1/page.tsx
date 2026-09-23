'use client';
import CrudPage from '@/components/CrudPage';
import { mockCategories } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';

export default function Category1Page() {
  return (
    <CrudPage
      title="Danh mục cấp 1"
      subtitle="Quản lý hãng xe"
      data={mockCategories as unknown as Record<string, unknown>[]}
      columns={[
        { key: 'id', label: 'STT', width: '60px', sortable: true },
        { key: 'name', label: 'Tên hãng', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
        { key: 'slug', label: 'Slug' },
        { key: 'count', label: 'Số xe', sortable: true, render: (item) => <span className="font-semibold text-red-600">{String(item.count || 0)}</span> },
        { key: 'order', label: 'Thứ tự', sortable: true },
        { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
      ]}
      formFields={[
        { name: 'name', label: 'Tên hãng xe', required: true, placeholder: 'VD: Toyota' },
        { name: 'slug', label: 'Slug', placeholder: 'VD: toyota' },
        { name: 'order', label: 'Thứ tự', type: 'number', placeholder: '1' },
        { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
      ]}
      searchPlaceholder="Tìm kiếm hãng xe..."
      searchFields={['name', 'slug']}
    />
  );
}
