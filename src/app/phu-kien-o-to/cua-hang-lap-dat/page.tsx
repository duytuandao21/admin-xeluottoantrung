'use client';

import SettingsPage, { type SettingsField } from '@/components/SettingsPage';

const fields: SettingsField[] = [
  { section: 'Hình ảnh cửa hàng', name: 'coverImageUrl', label: 'Ảnh cửa hàng lắp đặt', type: 'file' },
  { name: 'logoImageUrl', label: 'Logo cửa hàng', type: 'file' },
  { section: 'Thông tin liên hệ', name: 'storeName', label: 'Tên cửa hàng', defaultValue: 'Toàn Trung' },
  { name: 'location', label: 'Khu vực hiển thị', defaultValue: 'TP.HCM', hint: 'Ví dụ: TP.HCM. Nội dung này hiển thị cạnh biểu tượng định vị.' },
  { name: 'mapUrl', label: 'Liên kết Google Maps', type: 'url', defaultValue: 'https://maps.app.goo.gl/ngdzfJ3qnvWKDbS79' },
  { name: 'phone', label: 'Số điện thoại cửa hàng', type: 'text', defaultValue: '0777393913' },
];

export default function InstallationStoreSettingsPage() {
  return <SettingsPage title="Cửa hàng lắp đặt" subtitle="Thông tin này hiển thị chung trên trang chi tiết của tất cả phụ kiện ô tô." fields={fields} />;
}
