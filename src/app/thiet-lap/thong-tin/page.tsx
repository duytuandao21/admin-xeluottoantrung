'use client';
import SettingsPage from '@/components/SettingsPage';
export default function ThongTinPage() {
  return <SettingsPage title="Thiết lập thông tin" subtitle="Cấu hình thông tin chung của website" fields={[
    { name: 'loanPercent', label: 'Khoản vay (%)', type: 'number' },
    { name: 'interestRate', label: 'Lãi suất (%)/năm', type: 'number' },
    { name: 'loanMonths', label: 'Số tháng vay', type: 'number' },
    { name: 'siteName', label: 'Tên website', defaultValue: 'Xe Lướt Toàn Trung', placeholder: 'Tên website' },
    { name: 'phone', label: 'Số điện thoại', defaultValue: '0901 234 567', placeholder: '0901 234 567' },
    { name: 'zalo', label: 'Zalo', defaultValue: '0777393985' },
    { name: 'website', label: 'Website', type: 'url', defaultValue: 'https://xeluottoantrung.com/' },
    { name: 'fanpage', label: 'Fanpage', type: 'url' },
    { name: 'insuranceUrl', label: 'Link bảo hiểm', type: 'url' },
    { name: 'email', label: 'Email', defaultValue: 'info@xeluottoantrung.com', placeholder: 'email@domain.com' },
    { name: 'hotline', label: 'Hotline', defaultValue: '1900 1234', placeholder: '1900 xxxx' },
    { name: 'address', label: 'Địa chỉ', defaultValue: '123 Nguyễn Thị Thập, Q.7, TP.HCM' },
    { name: 'workingHours', label: 'Giờ làm việc', defaultValue: '8:00 - 20:00 (T2-CN)' },
    { name: 'directionsUrl', label: 'Chỉ đường', type: 'url' },
    { name: 'productsPerPage', label: 'Số sản phẩm mỗi trang', type: 'number' },
    { name: 'relatedProductsPerPage', label: 'Số sản phẩm liên quan', type: 'number' },
    { name: 'newsPerPage', label: 'Số tin mỗi trang', type: 'number' },
    { name: 'relatedNewsPerPage', label: 'Số tin liên quan', type: 'number' },
    { name: 'mapUrl', label: 'Google Maps Embed URL', type: 'url', placeholder: 'https://maps.google.com/...' },
    { name: 'taxCode', label: 'Mã số thuế', placeholder: 'MST' },
    { name: 'description', label: 'Mô tả website', type: 'textarea', defaultValue: 'Chuyên mua bán xe ô tô đã qua sử dụng uy tín tại TP.HCM' },
    { name: 'keywords', label: 'Từ khóa SEO', type: 'textarea', defaultValue: 'xe lướt, xe ô tô cũ, mua bán xe, toàn trung' },
  ]} />;
}
