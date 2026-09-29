'use client';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
export default function SlideshowPage() {
  return <CrudPage title="Quản lý Slideshow" subtitle="Banner trang chủ · Nên dùng ảnh 1920 × 773 px (tỉ lệ 2,48:1), JPG/WebP, dưới 10 MB" columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'title', label: 'Tiêu đề', sortable: true, render: (item) => <span className="font-medium">{String(item.title)}</span> },
    { key: 'image', label: 'Hình', render: (item) => item.image && item.image !== '/placeholder-banner.jpg' ? <img src={String(item.image)} alt="" className="h-10 w-16 rounded object-cover" /> : '—' },
    { key: 'sortOrder', label: 'Thứ tự', render: (item) => String(item.sortOrder ?? 0) },
    { key: 'link', label: 'Liên kết', render: (item) => <span className="text-sm text-blue-600">{String(item.link || '—')}</span> },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'title', label: 'Tiêu đề', required: true },
    { name: 'image', label: 'Ảnh slideshow', type: 'image', required: true, hint: 'Kích thước đề xuất: 1920 × 773 px (tỉ lệ 2,48:1). Ảnh JPG/WebP dưới 10 MB.' },
    { name: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number', min: 0, max: 100000, defaultValue: 0, placeholder: '0' },
    { name: 'link', label: 'Liên kết', placeholder: '/san-pham' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['title']} nameField="title" />;
}
