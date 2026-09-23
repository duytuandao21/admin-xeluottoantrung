'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Ảnh chi nhánh" subtitle="Quản lý hình ảnh chi nhánh" fields={[{name:'image1',label:'Ảnh chi nhánh 1',type:'file'},{name:'caption1',label:'Chú thích 1'},{name:'image2',label:'Ảnh chi nhánh 2',type:'file'},{name:'caption2',label:'Chú thích 2'},{name:'image3',label:'Ảnh chi nhánh 3',type:'file'},{name:'caption3',label:'Chú thích 3'}]} />;
}
