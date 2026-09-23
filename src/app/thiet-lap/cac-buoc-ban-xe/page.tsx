'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Các bước bán xe" subtitle="Chỉnh sửa hướng dẫn bán xe" fields={[{name:'step1',label:'Bước 1',defaultValue:'Đăng ký bán xe online'},{name:'step1Desc',label:'Mô tả bước 1',type:'textarea'},{name:'step2',label:'Bước 2',defaultValue:'Định giá xe miễn phí'},{name:'step2Desc',label:'Mô tả bước 2',type:'textarea'},{name:'step3',label:'Bước 3',defaultValue:'Thỏa thuận & ký hợp đồng'},{name:'step3Desc',label:'Mô tả bước 3',type:'textarea'},{name:'step4',label:'Bước 4',defaultValue:'Thanh toán ngay'},{name:'step4Desc',label:'Mô tả bước 4',type:'textarea'}]} />;
}
