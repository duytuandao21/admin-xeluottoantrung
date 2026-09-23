'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Banner lên đời" subtitle="Quản lý banner trang lên đời xe" fields={[{name:'bannerImage',label:'Ảnh banner',type:'file',hint:'Kích thước đề xuất: 1920x400px'},{name:'title',label:'Tiêu đề',defaultValue:'Lên đời xe dễ dàng'},{name:'subtitle',label:'Phụ đề',type:'textarea'}]} />;
}
