'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Mạng xã hội" subtitle="Cấu hình liên kết mạng xã hội" fields={[{name:'facebook',label:'Facebook',type:'url',defaultValue:'https://facebook.com/xeluottoantrung'},{name:'youtube',label:'Youtube',type:'url',placeholder:'https://youtube.com/...'},{name:'zalo',label:'Zalo OA',placeholder:'Zalo OA ID'},{name:'tiktok',label:'TikTok',type:'url',placeholder:'https://tiktok.com/@...'},{name:'instagram',label:'Instagram',type:'url',placeholder:'https://instagram.com/...'},{name:'twitter',label:'Twitter/X',type:'url',placeholder:'https://x.com/...'}]} />;
}
