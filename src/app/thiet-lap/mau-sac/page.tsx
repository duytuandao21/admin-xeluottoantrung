'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Quản lý màu sắc" subtitle="Cấu hình bảng màu website" fields={[{name:'primaryColor',label:'Màu chính',type:'color',defaultValue:'#dc2626'},{name:'secondaryColor',label:'Màu phụ',type:'color',defaultValue:'#f59e0b'},{name:'headerBg',label:'Màu header',type:'color',defaultValue:'#ffffff'},{name:'footerBg',label:'Màu footer',type:'color',defaultValue:'#1a1c2e'},{name:'buttonColor',label:'Màu nút',type:'color',defaultValue:'#dc2626'},{name:'linkColor',label:'Màu liên kết',type:'color',defaultValue:'#2563eb'}]} />;
}
