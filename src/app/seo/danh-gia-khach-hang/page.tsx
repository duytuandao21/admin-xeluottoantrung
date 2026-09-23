'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="SEO - Đánh giá khách hàng" subtitle="Cấu hình SEO cho trang đánh giá" fields={[
    { name: 'title', label: 'Meta Title', defaultValue: 'Đánh giá khách hàng - Xe Lướt Toàn Trung' },
    { name: 'description', label: 'Meta Description', type: 'textarea', defaultValue: 'Cảm nhận và đánh giá từ khách hàng đã mua xe tại Toàn Trung' },
    { name: 'keywords', label: 'Keywords', type: 'textarea', defaultValue: 'đánh giá, cảm nhận khách hàng, mua xe' },
    { name: 'ogImage', label: 'OG Image', type: 'file' },
    { name: 'canonical', label: 'Canonical URL', type: 'url' },
  ]} />;
}
