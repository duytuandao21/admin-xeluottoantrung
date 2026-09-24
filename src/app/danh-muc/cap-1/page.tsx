'use client';
import CrudPage from '@/components/CrudPage';
import { mockCategories, mockProducts } from '@/lib/mock-data';
import { useLocalStore } from '@/lib/local-store';
import type { Product } from '@/lib/types';
import { StatusBadge } from '@/components/ui';
import CategoryThumbnail from '@/components/CategoryThumbnail';

export default function Category1Page() {
  const [products] = useLocalStore<Product[]>('/san-pham', mockProducts);
  return (
    <CrudPage
      storageKey="/danh-muc/cap-1"
      title="Hãng xe"
      subtitle="Quản lý hãng xe"
      data={mockCategories as unknown as Record<string, unknown>[]}
      columns={[
        { key: 'id', label: 'STT', width: '60px', sortable: true },
        { key: 'name', label: 'Tên hãng', sortable: true, render: (item) => <div className="flex items-center gap-3"><CategoryThumbnail src={String(item.image || '')} kind="brand" /><span className="font-semibold">{String(item.name)}</span></div> },
        { key: 'slug', label: 'Slug' },
        { key: 'count', label: 'Số xe', render: (item) => <span className="font-semibold text-red-600">{products.filter(product => product.brand === item.name).length}</span> },
        { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
      ]}
      formFields={[
        { name: 'name', label: 'Tên hãng xe', required: true, placeholder: 'VD: Toyota' },
        { name: 'image', label: 'Logo hãng', type: 'image' },
        { name: 'slug', label: 'Slug', placeholder: 'VD: toyota' },
        { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
      ]}
      searchPlaceholder="Tìm kiếm hãng xe..."
      searchFields={['name', 'slug']}
    />
  );
}
