'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Tại sao chọn chúng tôi" subtitle="Chỉnh sửa lý do chọn Toàn Trung" fields={[{name:'reason1',label:'Lý do 1',defaultValue:'Uy tín hàng đầu'},{name:'reason1Desc',label:'Mô tả lý do 1',type:'textarea'},{name:'reason2',label:'Lý do 2',defaultValue:'Giá cả hợp lý'},{name:'reason2Desc',label:'Mô tả lý do 2',type:'textarea'},{name:'reason3',label:'Lý do 3',defaultValue:'Bảo hành dài hạn'},{name:'reason3Desc',label:'Mô tả lý do 3',type:'textarea'},{name:'reason4',label:'Lý do 4',defaultValue:'Hỗ trợ trả góp'},{name:'reason4Desc',label:'Mô tả lý do 4',type:'textarea'}]} />;
}
