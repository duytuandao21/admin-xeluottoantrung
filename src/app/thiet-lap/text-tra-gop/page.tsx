'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Text trả góp" subtitle="Nội dung trang trả góp" fields={[{name:'title',label:'Tiêu đề',defaultValue:'Hỗ trợ trả góp lãi suất ưu đãi'},{name:'subtitle',label:'Phụ đề',defaultValue:'Trả góp lên đến 80% giá trị xe'},{name:'content',label:'Nội dung chi tiết',type:'textarea',defaultValue:'Chúng tôi hỗ trợ khách hàng vay mua xe trả góp với lãi suất ưu đãi qua các ngân hàng liên kết...'},{name:'bankList',label:'Danh sách ngân hàng',type:'textarea',defaultValue:'Vietcombank, BIDV, Techcombank, VPBank, MB Bank'}]} />;
}
