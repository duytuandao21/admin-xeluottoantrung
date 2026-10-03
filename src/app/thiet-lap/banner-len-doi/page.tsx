'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Banner lên đời" subtitle="Ảnh và tiêu đề đầu trang Lên đời" settingsGroup="thiet-lap-text-len-doi" fields={[{name:'image',label:'Ảnh banner',type:'file'},{name:'title',label:'Tiêu đề'},{name:'subtitle',label:'Tiêu đề biểu mẫu',type:'textarea'}]} />;
}
