'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Quản lý nút gọi" subtitle="Cấu hình nút gọi điện & Zalo" fields={[{name:'phone',label:'Số điện thoại',defaultValue:'0901234567'},{name:'zaloNumber',label:'Số Zalo',defaultValue:'0901234567'},{name:'showCallButton',label:'Hiển thị nút gọi',type:'select',options:[{value:'1',label:'Có'},{value:'0',label:'Không'}]},{name:'showZaloButton',label:'Hiển thị Zalo',type:'select',options:[{value:'1',label:'Có'},{value:'0',label:'Không'}]},{name:'buttonPosition',label:'Vị trí nút',type:'select',options:[{value:'bottom-right',label:'Dưới phải'},{value:'bottom-left',label:'Dưới trái'}]},{name:'buttonColor',label:'Màu nút gọi',type:'color',defaultValue:'#dc2626'}]} />;
}
