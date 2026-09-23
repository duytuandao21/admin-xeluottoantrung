'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Gợi ý năm sản xuất" subtitle="Cấu hình gợi ý năm sản xuất trên trang chủ" fields={[{name:'startYear',label:'Năm bắt đầu',type:'number',defaultValue:'2015'},{name:'endYear',label:'Năm kết thúc',type:'number',defaultValue:'2024'},{name:'display',label:'Hiển thị',type:'select',options:[{value:'1',label:'Có'},{value:'0',label:'Không'}]}]} />;
}
