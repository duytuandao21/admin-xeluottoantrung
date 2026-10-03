'use client';
import CrudPage from '@/components/CrudPage';
import { richTextPreview } from '@/lib/rich-text';
export default function FAQPage() {
  return <CrudPage title="Câu hỏi thường gặp" subtitle="Bài viết hiển thị trong phần Câu hỏi thường gặp của trang Tin tức" statusToggle columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'question', label: 'Câu hỏi', sortable: true, render: (item) => <span className="font-medium text-sm">{String(item.question)}</span> },
    { key: 'answer', label: 'Nội dung', render: (item) => <span className="text-sm text-[var(--muted-fg)] truncate max-w-xs block">{richTextPreview(String(item.answer))}</span> },
    { key: 'featured', label: 'Nổi bật', render: (item) => item.featured ? '★' : '—' },
    { key: 'status', label: 'Hiển thị' },
  ]} formFields={[
    { name: 'question', label: 'Tiêu đề / Câu hỏi', required: true, placeholder: 'Nhập tiêu đề câu hỏi...' },
    { name: 'image', label: 'Ảnh đại diện', type: 'image' },
    { name: 'excerpt', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Tóm tắt nội dung bài viết...' },
    { name: 'answer', label: 'Nội dung bài viết', type: 'richtext', required: true, placeholder: 'Nhập nội dung giải đáp...' },
    { name: 'order', label: 'Thứ tự', type: 'number', defaultValue: 0, min: 0, max: 100000 },
    { name: 'featured', label: 'Nổi bật', type: 'checkbox' },
    { name: 'status', label: 'Trạng thái', type: 'select', defaultValue: 'active', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['question', 'answer']} nameField="question" />;
}
