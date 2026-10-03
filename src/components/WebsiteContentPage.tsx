'use client';

import CrudPage from '@/components/CrudPage';
import { richTextPreview } from '@/lib/rich-text';

export default function WebsiteContentPage({ policy = false }: { policy?: boolean }) {
  return <CrudPage title={policy ? 'Chính sách và điều kiện' : 'Tại sao chọn chúng tôi'}
    subtitle={policy ? 'Chỉnh nội dung các trang chính sách trên website' : 'Các thẻ hiển thị trên trang Bán xe và Lên đời'} statusToggle nameField="title"
    columns={[
      { key: 'sortOrder', label: 'Thứ tự', sortable: true, width: '80px' },
      ...(!policy ? [{ key: 'image', label: 'Hình', render: (item: Record<string, unknown>) => item.image ? <img src={String(item.image)} alt="" className="h-12 w-12 rounded-lg object-contain" /> : '—' }] : []),
      { key: 'title', label: 'Tiêu đề', sortable: true },
      { key: 'description', label: 'Nội dung', render: item => <span className="block max-w-xs truncate text-sm text-[var(--muted-fg)]">{richTextPreview(String(item.description || ''))}</span> },
      ...(policy ? [{ key: 'key', label: 'Trang trên website', render: (item: Record<string, unknown>) => <span className="text-sm">/{String(item.key)}</span> }] : []),
      { key: 'status', label: 'Hiển thị' },
    ]}
    formFields={[
      { name: 'title', label: 'Tiêu đề', required: true },
      { name: 'image', label: policy ? 'Ảnh đại diện (tùy chọn)' : 'Ảnh minh họa', type: 'image' },
      { name: 'description', label: 'Nội dung', type: 'richtext', required: true },
      { name: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number', min: 0, max: 100000, defaultValue: 0 },
      { name: 'status', label: 'Hiển thị trên website', type: 'select', defaultValue: 'active', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
    ]} searchPlaceholder="Tìm tiêu đề..." searchFields={['title']} />;
}
