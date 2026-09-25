'use client';

import { usePathname } from 'next/navigation';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
import { resolveCarColorCode } from '@/lib/car-colors';

type Kind = 'image' | 'link' | 'text' | 'color';
type Definition = { title: string; kind: Kind; featured?: boolean; description?: boolean };

const definitions: Record<string, Definition> = {
  '/quan-ly/gioi-thieu': { title: 'Giới thiệu', kind: 'image', description: true },
  '/quan-ly/thong-ke-noi-dung': { title: 'Nội dung thống kê', kind: 'text' },
  '/thiet-lap/banner-dong-xe': { title: 'Banner dòng xe', kind: 'link' },
  '/thiet-lap/cac-buoc-mua-xe': { title: 'Các bước mua xe', kind: 'image', description: true },
  '/thiet-lap/cac-buoc-ban-xe': { title: 'Các bước bán xe', kind: 'image', description: true },
  '/thiet-lap/cac-buoc-len-doi': { title: 'Các bước lên đời', kind: 'image', description: true },
  '/thiet-lap/chinh-sach-dieu-kien': { title: 'Chính sách và điều kiện', kind: 'image', description: true },
  '/thiet-lap/kham-pha-xe': { title: 'Khám phá xe', kind: 'image', description: true },
  '/thiet-lap/quy-trinh-ban-xe': { title: 'Quy trình bán xe', kind: 'image', description: true },
  '/thiet-lap/tai-sao-chon': { title: 'Tại sao chọn chúng tôi', kind: 'image', description: true },
  '/thiet-lap/goi-y-nam-san-xuat': { title: 'Gợi ý năm sản xuất', kind: 'text' },
  '/thiet-lap/nut-goi': { title: 'Nút gọi', kind: 'text' },
  '/thiet-lap/mau-sac': { title: 'Màu sắc', kind: 'color' },
  '/thiet-lap/mang-xa-hoi': { title: 'Mạng xã hội', kind: 'link' },
  '/thiet-lap/ung-dung': { title: 'Ứng dụng', kind: 'link' },
};

export default function LegacyCollectionPage() {
  const pathname = usePathname();
  const config = definitions[pathname];
  if (!config) return null;
  const hasImage = config.kind === 'image' || config.kind === 'link';
  const columns = [
    { key: 'order', label: 'STT', sortable: true, width: '70px' },
    ...(hasImage ? [{ key: 'image', label: 'Hình', render: (item: Record<string, unknown>) => item.image ? <img src={String(item.image)} alt="" className="h-10 w-16 rounded object-cover" /> : <span className="text-[var(--muted-fg)]">—</span> }] : []),
    { key: 'title', label: 'Tiêu đề', sortable: true, render: (item: Record<string, unknown>) => <span className="font-medium">{String(item.title)}</span> },
    ...(config.kind === 'link' ? [{ key: 'link', label: 'Link' }] : []),
    ...(config.kind === 'color' ? [{ key: 'colorCode', label: 'Mã màu', render: (item: Record<string, unknown>) => { const code = resolveCarColorCode(item.colorCode, String(item.title)); return <span className="inline-flex items-center gap-3"><span className="h-11 w-16 rounded-lg border border-[var(--border-color)] shadow-sm" style={{ backgroundColor: code }} /><strong className="font-mono text-sm tracking-wide">{code}</strong></span>; } }] : []),
    ...(pathname === '/thiet-lap/nut-goi' ? [{ key: 'phone', label: 'Số điện thoại', render: (item: Record<string, unknown>) => item.phone ? <a href={`tel:${String(item.phone)}`} className="font-medium text-red-600 hover:underline">{String(item.phone)}</a> : <span className="text-[var(--muted-fg)]">Chưa cập nhật</span> }] : []),
    ...(config.featured ? [{ key: 'featured', label: 'Nổi bật', render: (item: Record<string, unknown>) => item.featured ? '★' : '—' }] : []),
    { key: 'status', label: 'Hiển thị', render: (item: Record<string, unknown>) => <StatusBadge status={String(item.status)} /> },
  ];
  const formFields = [
    { name: 'title', label: 'Tiêu đề', required: true },
    ...(hasImage ? [{ name: 'image', label: 'Hình ảnh', type: 'image' as const }] : []),
    ...(config.kind === 'link' ? [{ name: 'link', label: 'Liên kết', type: 'text' as const, placeholder: 'https://... hoặc /duong-dan' }] : []),
    ...(config.kind === 'color' ? [{ name: 'colorCode', label: 'Mã màu', type: 'color' as const }] : []),
    ...(pathname === '/thiet-lap/nut-goi' ? [{ name: 'phone', label: 'Số điện thoại', type: 'tel' as const, required: true, placeholder: 'VD: 0912345678 hoặc +84912345678' }] : []),
    ...(config.description ? [{ name: 'description', label: 'Nội dung', type: 'richtext' as const }] : []),
    ...(config.featured ? [{ name: 'featured', label: 'Nổi bật', type: 'checkbox' as const }] : []),
    { name: 'status', label: 'Hiển thị', type: 'select' as const, defaultValue: 'active', options: [{ value: 'active', label: 'Có' }, { value: 'inactive', label: 'Không' }] },
  ];
  return <CrudPage title={config.title} columns={columns} formFields={formFields} searchPlaceholder="Tìm kiếm..." searchFields={['title', 'link', 'phone']} nameField="title" />;
}
