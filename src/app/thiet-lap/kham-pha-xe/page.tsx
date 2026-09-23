'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Khám phá xe" subtitle="Cấu hình trang khám phá xe" fields={[{name:'title',label:'Tiêu đề',defaultValue:'Khám phá xe tại Toàn Trung'},{name:'description',label:'Mô tả',type:'textarea'},{name:'bannerImage',label:'Ảnh banner',type:'file'}]} />;
}
