'use client';
import SettingsPage from '@/components/SettingsPage';

export default function Page() {
  return <SettingsPage title="Banner bán xe" subtitle="Ảnh và tiêu đề đầu trang Bán xe"
    settingsGroup="thiet-lap-text-ban-xe"
    fields={[
      { name: 'image', label: 'Ảnh banner', type: 'file' },
      { name: 'title', label: 'Tiêu đề' },
      { name: 'subtitle', label: 'Tiêu đề biểu mẫu', type: 'textarea' },
    ]} />;
}
