'use client';

import CrudPage from '@/components/CrudPage';

export default function ArticleManagementPage({ title, defaultCategory }: { title: string; defaultCategory?: string }) {
  return <CrudPage title={title} statusToggle={{ visible: 'published', hidden: 'draft' }} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'title', label: 'Tiêu đề', sortable: true, render: item => <span className="admin-list-text font-medium text-sm" title={String(item.title)}>{String(item.title)}</span> },
    { key: 'category', label: 'Danh mục', render: item => <span className="admin-list-text px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium" title={String(item.category)}>{String(item.category)}</span> },
    { key: 'views', label: 'Lượt xem', render: () => <span className="font-semibold text-[var(--muted-fg)]">—</span> },
    { key: 'createdAt', label: 'Ngày đăng', sortable: true },
    { key: 'status', label: 'Hiển thị' },
  ]} formFields={[
    { name: 'title', label: 'Tiêu đề', required: true, placeholder: 'Nhập tiêu đề bài viết...' },
    { name: 'image', label: 'Ảnh đại diện', type: 'image' },
    { name: 'slug', label: 'Slug' },
    { name: 'category', label: 'Danh mục', type: 'select', required: true, defaultValue: defaultCategory, options: [{ value: 'Tin tức', label: 'Tin tức' }, { value: 'Tư vấn', label: 'Tư vấn' }, { value: 'Kinh nghiệm', label: 'Kinh nghiệm' }, { value: 'Đánh giá xe', label: 'Đánh giá xe' }] },
    { name: 'excerpt', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Mô tả ngắn bài viết...' },
    { name: 'content', label: 'Nội dung bài viết', type: 'richtext', required: true, placeholder: 'Nội dung bài viết...' },
    { name: 'status', label: 'Hiển thị trên website', type: 'select', options: [{ value: 'published', label: 'Hiển thị' }, { value: 'draft', label: 'Ẩn (nháp)' }] },
  ]} searchPlaceholder="Tìm kiếm bài viết..." searchFields={['title', 'category']} nameField="title" />;
}
