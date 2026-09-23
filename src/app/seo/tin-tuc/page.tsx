'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="SEO - Tin tức" subtitle="Cấu hình SEO cho trang tin tức" fields={[
    { name: 'title', label: 'Meta Title', defaultValue: 'Tin tức ô tô - Xe Lướt Toàn Trung' },
    { name: 'description', label: 'Meta Description', type: 'textarea', defaultValue: 'Cập nhật tin tức, kinh nghiệm mua bán xe ô tô mới nhất' },
    { name: 'keywords', label: 'Keywords', type: 'textarea', defaultValue: 'tin tức ô tô, kinh nghiệm mua xe, đánh giá xe' },
    { name: 'ogImage', label: 'OG Image', type: 'file' },
    { name: 'canonical', label: 'Canonical URL', type: 'url' },
  ]} />;
}
