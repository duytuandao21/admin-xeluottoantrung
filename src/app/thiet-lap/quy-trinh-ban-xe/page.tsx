'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Quy trình bán xe" subtitle="Chỉnh sửa quy trình bán xe" fields={[{name:'step1',label:'Bước 1',defaultValue:'Liên hệ & đặt lịch'},{name:'step1Desc',label:'Mô tả bước 1',type:'textarea'},{name:'step2',label:'Bước 2',defaultValue:'Kiểm tra & định giá xe'},{name:'step2Desc',label:'Mô tả bước 2',type:'textarea'},{name:'step3',label:'Bước 3',defaultValue:'Thỏa thuận giá'},{name:'step3Desc',label:'Mô tả bước 3',type:'textarea'},{name:'step4',label:'Bước 4',defaultValue:'Hoàn tất thủ tục & thanh toán'},{name:'step4Desc',label:'Mô tả bước 4',type:'textarea'}]} />;
}
