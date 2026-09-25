'use client';
import CrudPage from '@/components/CrudPage';
import { useResourceRows } from '@/lib/api/use-resource';
import type { CarAttribute, Category } from '@/lib/types';
import { StatusBadge } from '@/components/ui';
import CategoryThumbnail from '@/components/CategoryThumbnail';

export default function Category2Page() {
  const categories = useResourceRows<Category>('/danh-muc/cap-1');
  const bodyStyles = useResourceRows<CarAttribute>('/quan-ly/kieu-dang');

  return (
    <CrudPage
      storageKey="/danh-muc/cap-2"
      title="Dòng xe"
      subtitle="Quản lý dòng xe"
      columns={[
        { key: 'id', label: 'STT', width: '60px', sortable: true },
        { key: 'name', label: 'Tên dòng xe', sortable: true, render: (item) => <div className="flex items-center gap-3"><CategoryThumbnail src={String(item.image || '')} kind="model" /><span className="font-semibold">{String(item.name)}</span></div> },
        { key: 'parentId', label: 'Hãng xe', render: (item) => { const parent = categories.find(c => String(c.id) === String(item.parentId)); return <span className="text-[var(--muted-fg)]">{parent?.name || '—'}</span>; } },
        { key: 'bodyStyleId', label: 'Kiểu dáng', render: (item) => bodyStyles.find(style => String(style.id) === String(item.bodyStyleId))?.name || 'Chưa chọn' },
        { key: 'slug', label: 'Slug' },
        { key: 'count', label: 'Số xe', render: (item) => <span className="font-semibold text-red-600">{String(item.count ?? '—')}</span> },
        { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
      ]}
      formFields={[
        { name: 'name', label: 'Tên dòng xe', required: true, placeholder: 'VD: Camry' },
        { name: 'image', label: 'Hình dòng xe', type: 'image' },
        { name: 'parentId', label: 'Hãng xe', type: 'select', required: true, options: categories.filter(c => c.status === 'active').map(c => ({ value: String(c.id), label: c.name })) },
        { name: 'bodyStyleId', label: 'Kiểu dáng', type: 'select', required: true, options: bodyStyles.map(style => ({ value: String(style.id), label: `${style.name}${style.status !== 'active' ? ' (đã ẩn)' : ''}` })) },
        { name: 'slug', label: 'Slug', placeholder: 'VD: camry' },
        { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
      ]}
      searchPlaceholder="Tìm kiếm dòng xe..."
      searchFields={['name', 'slug']}
    />
  );
}
