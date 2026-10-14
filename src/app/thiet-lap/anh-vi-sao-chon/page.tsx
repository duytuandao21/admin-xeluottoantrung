'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Ảnh vì sao chọn" subtitle="Quản lý 3 ảnh trong phần Tại sao chọn chúng tôi trên trang Bán xe và Lên đời"
    settingsGroup="thiet-lap-anh-vi-sao-chon"
    fields={[
      { name: 'image', label: 'Ảnh lớn bên trái', type: 'file', hint: 'Nên chọn ảnh dọc hoặc gần vuông, có chủ thể ở giữa.' },
      { name: 'image-secondary', label: 'Ảnh nhỏ bên phải — phía trên', type: 'file' },
      { name: 'image-tertiary', label: 'Ảnh nhỏ bên phải — phía dưới', type: 'file' },
    ]} />;
}
