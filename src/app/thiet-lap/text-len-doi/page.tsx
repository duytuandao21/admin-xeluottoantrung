'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Text lên đời" subtitle="Nội dung trang lên đời xe" fields={[{name:'title',label:'Tiêu đề',defaultValue:'Lên đời xe tại Toàn Trung'},{name:'subtitle',label:'Phụ đề',defaultValue:'Đổi xe cũ - Lấy xe mới dễ dàng'},{name:'content',label:'Nội dung chi tiết',type:'textarea'},{name:'process',label:'Quy trình đổi xe',type:'textarea'}]} />;
}
