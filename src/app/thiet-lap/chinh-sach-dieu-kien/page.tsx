'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Chính sách & Điều kiện" subtitle="Chỉnh sửa chính sách và điều kiện" fields={[{name:'warrantyPolicy',label:'Chính sách bảo hành',type:'textarea',defaultValue:'Bảo hành 6-12 tháng cho tất cả xe...'},{name:'returnPolicy',label:'Chính sách đổi trả',type:'textarea',defaultValue:'Đổi trả trong 7 ngày nếu phát hiện lỗi...'},{name:'paymentPolicy',label:'Chính sách thanh toán',type:'textarea'},{name:'terms',label:'Điều khoản sử dụng',type:'textarea'},{name:'privacy',label:'Chính sách bảo mật',type:'textarea'}]} />;
}
