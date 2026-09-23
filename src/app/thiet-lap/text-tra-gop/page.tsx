'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Text trả góp" subtitle="Nội dung trang trả góp" fields={[{name:'visible',label:'Hiển thị',type:'select',defaultValue:'1',options:[{value:'1',label:'Có'},{value:'0',label:'Không'}]},{name:'content',label:'Nội dung',type:'textarea'}]} />;
}
