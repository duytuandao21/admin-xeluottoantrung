'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Text bán xe" subtitle="Nội dung trang bán xe" fields={[{name:'title',label:'Tiêu đề',defaultValue:'Bán xe cho Toàn Trung'},{name:'subtitle',label:'Phụ đề',defaultValue:'Bán xe nhanh chóng, giá tốt nhất thị trường'},{name:'content',label:'Nội dung chi tiết',type:'textarea'},{name:'advantages',label:'Ưu điểm',type:'textarea',defaultValue:'Định giá miễn phí, thanh toán trong ngày, thủ tục nhanh gọn'}]} />;
}
