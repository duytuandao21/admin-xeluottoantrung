'use client';

import CrudPage from '@/components/CrudPage';
import { richTextPreview } from '@/lib/rich-text';

export default function DichVuPage() {
  return <CrudPage
    title="Quản lý dịch vụ"
    subtitle="Tạo bài giới thiệu và chọn dịch vụ được hiển thị trên website"
    statusToggle
    columns={[
      { key: 'id', label: 'STT', width: '60px' },
      { key: 'title', label: 'Tên dịch vụ', sortable: true, render: (item) => <span className="font-medium">{String(item.title)}</span> },
      { key: 'description', label: 'Nội dung', render: (item) => <span className="text-sm text-[var(--muted-fg)] truncate max-w-xs block">{richTextPreview(String(item.description))}</span> },
      { key: 'status', label: 'Hiển thị' },
    ]}
    formFields={[
      { name: 'title', label: 'Tên dịch vụ', required: true, placeholder: 'VD: Vận chuyển nhanh' },
      { name: 'image', label: 'Ảnh đại diện', type: 'image' },
      { name: 'description', label: 'Nội dung bài viết', type: 'richtext', required: true, placeholder: 'Giới thiệu chi tiết về dịch vụ...' },
      { name: 'status', label: 'Hiển thị trên website', type: 'select', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
    ]}
    searchPlaceholder="Tìm kiếm dịch vụ..."
    searchFields={['title', 'description']}
    nameField="title"
  />;
}
