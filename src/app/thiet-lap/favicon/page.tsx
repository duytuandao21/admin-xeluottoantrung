'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Quản lý Favicon" subtitle="Thay đổi favicon website" fields={[{name:'favicon',label:'Favicon',type:'file',hint:'Kích thước: 32x32px, định dạng .ico hoặc .png'}]} />;
}
