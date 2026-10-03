'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Ảnh vì sao chọn" subtitle="Ảnh banner bên phải phần Tại sao chọn chúng tôi trên trang Bán xe và Lên đời"
    fields={[{ name: 'image', label: 'Ảnh banner', type: 'file' }]} />;
}
