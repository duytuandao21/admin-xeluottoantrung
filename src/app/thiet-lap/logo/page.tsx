'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Quản lý Logo" subtitle="Thay đổi logo website" fields={[{name:'logo',label:'Logo chính',type:'file',hint:'Kích thước đề xuất: 200x60px'},{name:'logoDark',label:'Logo nền tối',type:'file',hint:'Logo hiển thị trên nền tối'},{name:'logoMobile',label:'Logo mobile',type:'file',hint:'Logo cho thiết bị di động'}]} />;
}
