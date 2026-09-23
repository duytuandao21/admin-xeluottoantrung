'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="SEO - Câu hỏi thường gặp" subtitle="Cấu hình SEO cho trang câu hỏi thường gặp" fields={[
    { name: 'title', label: 'Meta Title', defaultValue: 'Câu hỏi thường gặp - Xe Lướt Toàn Trung' },
    { name: 'description', label: 'Meta Description', type: 'textarea', defaultValue: 'Giải đáp các câu hỏi thường gặp về mua bán xe ô tô tại Toàn Trung' },
    { name: 'keywords', label: 'Keywords', type: 'textarea', defaultValue: 'câu hỏi thường gặp, mua xe cũ, bán xe, trả góp' },
    { name: 'ogImage', label: 'OG Image', type: 'file', hint: 'Ảnh hiển thị khi chia sẻ link (1200x630px)' },
    { name: 'canonical', label: 'Canonical URL', type: 'url', defaultValue: 'https://xeluottoantrung.com/cau-hoi-thuong-gap' },
  ]} />;
}
