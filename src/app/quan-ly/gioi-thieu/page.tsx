'use client';
import { PageHeader, Button, FormField, Input, Textarea } from '@/components/ui';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
export default function GioiThieuPage() {
  const [content, setContent] = useState('Xe Lướt Toàn Trung - Chuyên mua bán xe ô tô đã qua sử dụng uy tín tại TP.HCM. Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến cho khách hàng những chiếc xe chất lượng nhất với giá cả hợp lý.');
  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý giới thiệu" subtitle="Chỉnh sửa nội dung trang giới thiệu" actions={<Button size="sm" onClick={() => toast.success('Đã lưu thành công!')}><Save className="w-4 h-4" /> Lưu thay đổi</Button>} />
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
        <FormField label="Tiêu đề trang"><Input defaultValue="Giới thiệu Xe Lướt Toàn Trung" /></FormField>
        <FormField label="Mô tả ngắn"><Textarea rows={3} defaultValue="Chuyên mua bán xe ô tô đã qua sử dụng uy tín #1 tại TP.HCM" /></FormField>
        <FormField label="Nội dung giới thiệu"><Textarea rows={12} value={content} onChange={e => setContent(e.target.value)} /></FormField>
        <FormField label="Ảnh giới thiệu"><Input type="file" accept="image/*" /></FormField>
      </div>
    </div>
  );
}
