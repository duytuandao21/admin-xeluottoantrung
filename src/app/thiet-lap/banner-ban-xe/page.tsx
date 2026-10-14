'use client';
import SettingsPage from '@/components/SettingsPage';

export default function Page() {
  return <SettingsPage title="Banner bán xe" subtitle="Quản lý nội dung và ảnh nền đầu trang Bán xe"
    settingsGroup="thiet-lap-text-ban-xe"
    fields={[
      { name: 'image', label: 'Ảnh minh họa bên trái', section: 'Nội dung banner', type: 'file' },
      { name: 'title', label: 'Tiêu đề', section: 'Nội dung banner' },
      { name: 'subtitle', label: 'Tiêu đề biểu mẫu', section: 'Nội dung banner', type: 'textarea' },
      { name: 'background-image', label: 'Ảnh nền phía sau biểu mẫu', section: 'Ảnh nền', type: 'file', hint: 'Ảnh được tự động làm mờ trên trang Bán xe. Nên chọn ảnh ngang, rộng từ 1.200 px.' },
    ]} />;
}
