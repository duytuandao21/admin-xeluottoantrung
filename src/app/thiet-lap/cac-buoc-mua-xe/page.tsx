'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Các bước mua xe" subtitle="Chỉnh sửa hướng dẫn mua xe" fields={[{name:'step1',label:'Bước 1',defaultValue:'Chọn xe phù hợp'},{name:'step1Desc',label:'Mô tả bước 1',type:'textarea'},{name:'step2',label:'Bước 2',defaultValue:'Kiểm tra xe & lái thử'},{name:'step2Desc',label:'Mô tả bước 2',type:'textarea'},{name:'step3',label:'Bước 3',defaultValue:'Thỏa thuận giá & ký hợp đồng'},{name:'step3Desc',label:'Mô tả bước 3',type:'textarea'},{name:'step4',label:'Bước 4',defaultValue:'Nhận xe & bảo hành'},{name:'step4Desc',label:'Mô tả bước 4',type:'textarea'}]} />;
}
