'use client';
import CrudPage from '@/components/CrudPage';
import { mockSlideshows } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
export default function SlideshowPage() {
  return <CrudPage title="Quản lý Slideshow" subtitle="Banner trang chủ" data={mockSlideshows as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'title', label: 'Tiêu đề', sortable: true, render: (item) => <span className="font-medium">{String(item.title)}</span> },
    { key: 'image', label: 'Hình', render: (item) => item.image && item.image !== '/placeholder-banner.jpg' ? <img src={String(item.image)} alt="" className="h-10 w-16 rounded object-cover" /> : '—' },
    { key: 'link', label: 'Liên kết', render: (item) => <span className="text-sm text-blue-600">{String(item.link || '—')}</span> },
    { key: 'order', label: 'Thứ tự', sortable: true },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'title', label: 'Tiêu đề', required: true },
    { name: 'image', label: 'Ảnh slideshow', type: 'image' },
    { name: 'link', label: 'Liên kết', placeholder: '/san-pham' },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['title']} nameField="title" />;
}
