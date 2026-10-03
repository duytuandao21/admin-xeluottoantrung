'use client';
import CrudPage from '@/components/CrudPage';
import { richTextPreview } from '@/lib/rich-text';
export default function TuyenDungPage() {
  return <CrudPage title="Quản lý tuyển dụng" subtitle="Soạn bài tuyển dụng và chọn bài được hiển thị trên website" statusToggle columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'title', label: 'Tiêu đề', sortable: true, render: (item) => <span className="font-medium">{String(item.title)}</span> },
    { key: 'description', label: 'Nội dung', render: item => <span className="block max-w-xs truncate text-sm text-[var(--muted-fg)]">{richTextPreview(String(item.description || ''))}</span> },
    { key: 'createdAt', label: 'Ngày tạo', sortable: true },
    { key: 'status', label: 'Hiển thị' },
  ]} formFields={[
    { name: 'title', label: 'Tiêu đề', required: true, placeholder: 'Nhập tiêu đề bài tuyển dụng...' },
    { name: 'image', label: 'Ảnh đại diện', type: 'image' },
    { name: 'excerpt', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Giới thiệu ngắn về bài tuyển dụng...' },
    { name: 'description', label: 'Nội dung bài viết', type: 'richtext', required: true, placeholder: 'Nhập nội dung tuyển dụng...' },
    { name: 'status', label: 'Hiển thị trên website', type: 'select', defaultValue: 'active', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm bài tuyển dụng..." searchFields={['title']} nameField="title" />;
}
