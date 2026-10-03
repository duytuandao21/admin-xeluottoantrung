'use client';
import CrudPage from '@/components/CrudPage';

export default function CallContactsPage() {
  return <CrudPage title="Nút gọi" subtitle="Quản lý danh sách liên hệ hiển thị khi khách bấm nút gọi trên website" statusToggle
    nameField="title" searchPlaceholder="Tìm tên liên hệ..." searchFields={['title']}
    columns={[
      { key: 'sortOrder', label: 'Thứ tự', sortable: true, width: '80px' },
      { key: 'title', label: 'Tên liên hệ', sortable: true },
      { key: 'description', label: 'Bộ phận / khu vực' },
      { key: 'phone', label: 'Số điện thoại', render: item => <a className="font-medium text-red-600" href={`tel:${item.phone}`}>{String(item.phone || '')}</a> },
      { key: 'status', label: 'Hiển thị' },
    ]}
    formFields={[
      { name: 'title', label: 'Tên liên hệ', required: true },
      { name: 'phone', label: 'Số điện thoại', type: 'tel', required: true },
      { name: 'description', label: 'Bộ phận / khu vực', type: 'textarea', placeholder: 'VD: Tư vấn bán hàng (HCM)' },
      { name: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number', min: 0, max: 100000, defaultValue: 0 },
      { name: 'status', label: 'Hiển thị trên website', type: 'select', defaultValue: 'active', options: [{ value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' }] },
    ]} />;
}
