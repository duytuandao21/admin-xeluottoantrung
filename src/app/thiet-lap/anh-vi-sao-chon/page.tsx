'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Ảnh vì sao chọn" subtitle="Quản lý hình ảnh minh họa" fields={[{name:'image1',label:'Ảnh 1',type:'file'},{name:'image2',label:'Ảnh 2',type:'file'},{name:'image3',label:'Ảnh 3',type:'file'},{name:'image4',label:'Ảnh 4',type:'file'}]} />;
}
