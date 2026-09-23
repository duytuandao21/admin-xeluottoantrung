'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="SEO - Mua xe" subtitle="Cấu hình SEO cho trang mua xe" fields={[
    { name: 'title', label: 'Meta Title', defaultValue: 'Mua xe ô tô cũ giá tốt - Xe Lướt Toàn Trung' },
    { name: 'description', label: 'Meta Description', type: 'textarea', defaultValue: 'Mua xe ô tô đã qua sử dụng uy tín, giá tốt nhất tại TP.HCM. Bảo hành dài hạn, hỗ trợ trả góp.' },
    { name: 'keywords', label: 'Keywords', type: 'textarea', defaultValue: 'mua xe cũ, xe ô tô giá rẻ, xe lướt' },
    { name: 'ogImage', label: 'OG Image', type: 'file' },
    { name: 'canonical', label: 'Canonical URL', type: 'url' },
  ]} />;
}
