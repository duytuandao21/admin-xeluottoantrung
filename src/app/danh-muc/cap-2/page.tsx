'use client';
import CrudPage from '@/components/CrudPage';
import { mockSubCategories, mockCategories } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';

export default function Category2Page() {
  return (
    <CrudPage
      title="Danh mục cấp 2"
      subtitle="Quản lý dòng xe"
      data={mockSubCategories as unknown as Record<string, unknown>[]}
      columns={[
        { key: 'id', label: 'STT', width: '60px', sortable: true },
        { key: 'name', label: 'Tên dòng xe', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
        { key: 'parentId', label: 'Hãng xe', render: (item) => { const parent = mockCategories.find(c => c.id === Number(item.parentId)); return <span className="text-[var(--muted-fg)]">{parent?.name || '—'}</span>; } },
        { key: 'slug', label: 'Slug' },
        { key: 'count', label: 'Số xe', sortable: true, render: (item) => <span className="font-semibold text-red-600">{String(item.count || 0)}</span> },
        { key: 'order', label: 'Thứ tự', sortable: true },
        { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
      ]}
      formFields={[
        { name: 'name', label: 'Tên dòng xe', required: true, placeholder: 'VD: Camry' },
        { name: 'parentId', label: 'Hãng xe', type: 'select', required: true, options: mockCategories.map(c => ({ value: String(c.id), label: c.name })) },
        { name: 'slug', label: 'Slug', placeholder: 'VD: camry' },
        { name: 'order', label: 'Thứ tự', type: 'number', placeholder: '1' },
        { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
      ]}
      searchPlaceholder="Tìm kiếm dòng xe..."
      searchFields={['name', 'slug']}
    />
  );
}
