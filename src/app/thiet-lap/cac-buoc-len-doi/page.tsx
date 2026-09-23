'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Các bước lên đời" subtitle="Chỉnh sửa quy trình lên đời xe" fields={[{name:'step1',label:'Bước 1',defaultValue:'Chọn xe muốn đổi'},{name:'step1Desc',label:'Mô tả bước 1',type:'textarea'},{name:'step2',label:'Bước 2',defaultValue:'Định giá xe cũ'},{name:'step2Desc',label:'Mô tả bước 2',type:'textarea'},{name:'step3',label:'Bước 3',defaultValue:'Bù trừ chênh lệch'},{name:'step3Desc',label:'Mô tả bước 3',type:'textarea'},{name:'step4',label:'Bước 4',defaultValue:'Nhận xe mới'},{name:'step4Desc',label:'Mô tả bước 4',type:'textarea'}]} />;
}
