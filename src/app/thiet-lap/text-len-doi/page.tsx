'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="Text lên đời" subtitle="Nội dung trang lên đời xe" fields={[{name:'visible',label:'Hiển thị',type:'select',defaultValue:'1',options:[{value:'1',label:'Có'},{value:'0',label:'Không'}]},{name:'title',label:'Tiêu đề',defaultValue:'Lên đời xe của bạn'},{name:'image',label:'Hình ảnh',type:'file'},{name:'seoTitle',label:'SEO Title'},{name:'seoKeywords',label:'SEO Keywords'},{name:'seoDescription',label:'SEO Description',type:'textarea'}]} />;
}
