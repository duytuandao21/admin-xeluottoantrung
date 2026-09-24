'use client';
import CrudPage from '@/components/CrudPage';
import { mockSubCategories, mockCategories, mockProducts } from '@/lib/mock-data';
import { useLocalStore } from '@/lib/local-store';
import type { Category, Product } from '@/lib/types';
import { StatusBadge } from '@/components/ui';
import CategoryThumbnail from '@/components/CategoryThumbnail';

export default function Category2Page() {
  const [categories] = useLocalStore<Category[]>('/danh-muc/cap-1', mockCategories);
  const [products] = useLocalStore<Product[]>('/san-pham', mockProducts);
  return (
    <CrudPage
      storageKey="/danh-muc/cap-2"
      title="Dòng xe"
      subtitle="Quản lý dòng xe"
      data={mockSubCategories as unknown as Record<string, unknown>[]}
      columns={[
        { key: 'id', label: 'STT', width: '60px', sortable: true },
        { key: 'name', label: 'Tên dòng xe', sortable: true, render: (item) => <div className="flex items-center gap-3"><CategoryThumbnail src={String(item.image || '')} kind="model" /><span className="font-semibold">{String(item.name)}</span></div> },
        { key: 'parentId', label: 'Hãng xe', render: (item) => { const parent = categories.find(c => c.id === Number(item.parentId)); return <span className="text-[var(--muted-fg)]">{parent?.name || '—'}</span>; } },
        { key: 'slug', label: 'Slug' },
        { key: 'count', label: 'Số xe', render: (item) => <span className="font-semibold text-red-600">{products.filter(product => product.model === item.name).length}</span> },
        { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
      ]}
      formFields={[
        { name: 'name', label: 'Tên dòng xe', required: true, placeholder: 'VD: Camry' },
        { name: 'image', label: 'Hình dòng xe', type: 'image' },
        { name: 'parentId', label: 'Hãng xe', type: 'select', required: true, options: categories.filter(c => c.status === 'active').map(c => ({ value: String(c.id), label: c.name })) },
        { name: 'slug', label: 'Slug', placeholder: 'VD: camry' },
        { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
      ]}
      searchPlaceholder="Tìm kiếm dòng xe..."
      searchFields={['name', 'slug']}
    />
  );
}
