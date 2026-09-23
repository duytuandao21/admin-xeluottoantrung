'use client';
import CrudPage from '@/components/CrudPage';
import { mockTestimonials } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
import { Star } from 'lucide-react';
export default function CamNhanKHPage() {
  return <CrudPage title="Cảm nhận khách hàng" data={mockTestimonials as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Khách hàng', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'content', label: 'Nội dung', render: (item) => <span className="text-sm text-[var(--muted-fg)] truncate max-w-xs block">{String(item.content).substring(0, 60)}...</span> },
    { key: 'rating', label: 'Đánh giá', render: (item) => <div className="flex gap-0.5">{Array.from({ length: Math.max(1, Math.min(5, Number(item.rating) || 1)) }, (_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}</div> },
    { key: 'featured', label: 'Nổi bật', render: (item) => item.featured ? '★' : '—' },
    { key: 'carBought', label: 'Xe đã mua' },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Tên khách hàng', required: true, placeholder: 'VD: Nguyễn Văn A' },
    { name: 'avatar', label: 'Ảnh khách hàng', type: 'image' },
    { name: 'content', label: 'Nội dung cảm nhận', type: 'textarea', required: true },
    { name: 'rating', label: 'Đánh giá (1-5)', type: 'number', placeholder: '5' },
    { name: 'carBought', label: 'Xe đã mua', placeholder: 'VD: Toyota Camry 2022' },
    { name: 'featured', label: 'Nổi bật', type: 'checkbox' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['name', 'content']} />;
}
