'use client';

import SettingsPage from '@/components/SettingsPage';

export default function LienHePage() {
  return <SettingsPage title="Liên hệ" subtitle="Nội dung trang liên hệ" fields={[
    { name: 'visible', label: 'Hiển thị', type: 'select', defaultValue: '1', options: [{ value: '1', label: 'Có' }, { value: '0', label: 'Không' }] },
    { name: 'content', label: 'Nội dung (vi)', type: 'textarea' },
    { name: 'image', label: 'Hình ảnh liên hệ', type: 'file' },
    { name: 'seoTitle', label: 'SEO Title' },
    { name: 'seoKeywords', label: 'SEO Keywords' },
    { name: 'seoDescription', label: 'SEO Description', type: 'textarea' },
  ]} />;
}
