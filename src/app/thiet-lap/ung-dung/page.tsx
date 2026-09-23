'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Ứng dụng di động" subtitle="Liên kết tải ứng dụng" fields={[{name:'iosUrl',label:'App Store URL',type:'url',placeholder:'https://apps.apple.com/...'},{name:'androidUrl',label:'Google Play URL',type:'url',placeholder:'https://play.google.com/...'},{name:'appName',label:'Tên ứng dụng',defaultValue:'Xe Lướt Toàn Trung'},{name:'appDescription',label:'Mô tả ứng dụng',type:'textarea'}]} />;
}
