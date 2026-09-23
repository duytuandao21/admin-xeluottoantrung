'use client';
import CrudPage from '@/components/CrudPage';
import { mockFAQs } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
export default function FAQPage() {
  return <CrudPage title="Câu hỏi thường gặp" data={mockFAQs as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'question', label: 'Câu hỏi', sortable: true, render: (item) => <span className="font-medium text-sm">{String(item.question)}</span> },
    { key: 'answer', label: 'Trả lời', render: (item) => <span className="text-sm text-[var(--muted-fg)] truncate max-w-xs block">{String(item.answer).substring(0, 80)}...</span> },
    { key: 'order', label: 'Thứ tự', sortable: true },
    { key: 'featured', label: 'Nổi bật', render: (item) => item.featured ? '★' : '—' },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'question', label: 'Câu hỏi', required: true, placeholder: 'Nhập câu hỏi...' },
    { name: 'answer', label: 'Trả lời', type: 'textarea', required: true, placeholder: 'Nhập câu trả lời...' },
    { name: 'featured', label: 'Nổi bật', type: 'checkbox' },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['question', 'answer']} nameField="question" />;
}
