'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
export default function TinTucPage() {
  return <CrudPage title="Quản lý tin tức" columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'title', label: 'Tiêu đề', sortable: true, render: (item) => <span className="font-medium text-sm">{String(item.title)}</span> },
    { key: 'category', label: 'Danh mục', render: (item) => <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium">{String(item.category)}</span> },
    { key: 'views', label: 'Lượt xem', render: () => <span className="font-semibold text-[var(--muted-fg)]">—</span> },
    { key: 'featured', label: 'Nổi bật', render: (item) => item.featured ? '★' : '—' },
    { key: 'createdAt', label: 'Ngày đăng', sortable: true },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'title', label: 'Tiêu đề', required: true, placeholder: 'Nhập tiêu đề bài viết...' },
    { name: 'image', label: 'Ảnh đại diện', type: 'image' },
    { name: 'slug', label: 'Slug' },
    { name: 'category', label: 'Danh mục', type: 'select', required: true, options: [{ value: 'Tin tức', label: 'Tin tức' }, { value: 'Tư vấn', label: 'Tư vấn' }, { value: 'Kinh nghiệm', label: 'Kinh nghiệm' }, { value: 'Đánh giá xe', label: 'Đánh giá xe' }] },
    { name: 'excerpt', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Mô tả ngắn bài viết...' },
    { name: 'content', label: 'Nội dung bài viết', type: 'richtext', required: true, placeholder: 'Nội dung bài viết...' },
    { name: 'featured', label: 'Nổi bật', type: 'checkbox' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'published', label: 'Đã đăng' }, { value: 'draft', label: 'Nháp' }] },
  ]} searchPlaceholder="Tìm kiếm bài viết..." searchFields={['title', 'category']} nameField="title" />;
}
