'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Banner dòng xe" subtitle="Quản lý banner cho trang dòng xe" fields={[{name:'bannerImage',label:'Ảnh banner',type:'file',hint:'Kích thước đề xuất: 1920x400px'},{name:'title',label:'Tiêu đề',defaultValue:'Dòng xe phổ biến'},{name:'subtitle',label:'Phụ đề',type:'textarea'}]} />;
}
