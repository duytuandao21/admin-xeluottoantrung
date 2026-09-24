'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Quản lý Footer" subtitle="Chỉnh sửa nội dung footer website" fields={[
    { name: 'visible', label: 'Hiển thị', type: 'select', defaultValue: '1', options: [{ value: '1', label: 'Có' }, { value: '0', label: 'Không' }] },
    { name: 'content', label: 'Nội dung (vi)', type: 'richtext' },
    { name: 'footerAbout', label: 'Mô tả về công ty', type: 'richtext', defaultValue: 'Xe Lướt Toàn Trung - Chuyên mua bán xe ô tô đã qua sử dụng uy tín hàng đầu tại TP.HCM' },
    { name: 'footerCopyright', label: 'Copyright', defaultValue: '© 2024 Xe Lướt Toàn Trung. All rights reserved.' },
    { name: 'footerAddress', label: 'Địa chỉ', defaultValue: '123 Nguyễn Thị Thập, Q.7, TP.HCM' },
    { name: 'footerPhone', label: 'Điện thoại', defaultValue: '0901 234 567' },
    { name: 'footerEmail', label: 'Email', defaultValue: 'info@xeluottoantrung.com' },
  ]} />;
}
