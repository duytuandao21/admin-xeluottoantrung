'use client';
import SettingsPage from '@/components/SettingsPage';
export default function ThongTinPage() {
  return <SettingsPage title="Thiết lập thông tin" subtitle="Cấu hình thông tin chung của website" fields={[
    { name: 'siteName', label: 'Tên website', defaultValue: 'Xe Lướt Toàn Trung', placeholder: 'Tên website' },
    { name: 'phone', label: 'Số điện thoại', type: 'tel', defaultValue: '0777393913', placeholder: '0777393913', hint: 'Hiển thị trên thanh đầu trang.' },
    { name: 'zalo', label: 'Số Zalo', type: 'tel', defaultValue: '0777393913', placeholder: '0777393913', hint: 'Dùng cho nút liên hệ Zalo trên website.' },
    { name: 'website', label: 'Website', type: 'url', defaultValue: 'https://xeluottoantrung.com/' },
    { name: 'fanpage', label: 'Fanpage', type: 'url' },
    { name: 'email', label: 'Email', defaultValue: 'info@xeluottoantrung.com', placeholder: 'email@domain.com' },
    { name: 'description', label: 'Mô tả website', type: 'textarea', defaultValue: 'Chuyên mua bán xe ô tô đã qua sử dụng uy tín tại TP.HCM' },
    { name: 'keywords', label: 'Từ khóa SEO', type: 'textarea', defaultValue: 'xe lướt, xe ô tô cũ, mua bán xe, toàn trung' },
  ]} />;
}
