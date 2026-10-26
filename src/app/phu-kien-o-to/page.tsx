'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
import { catalogueRows } from '@/lib/api/client';
import { formatNumber } from '@/lib/format';

type Lookup = { id: string; name: string };

const allOptions = (path: string) => catalogueRows<Lookup>(path);

export default function AccessoriesPage() {
  const [brands, setBrands] = useState<Lookup[]>([]);
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([allOptions('/admin/collections/accessory-brands'), allOptions('/admin/collections/accessory-categories')])
      .then(([brandItems, categoryItems]) => { if (active) { setBrands(brandItems); setCategories(categoryItems); } })
      .catch(failure => { if (active) setError(failure instanceof Error ? failure.message : 'Không thể tải danh mục và thương hiệu.'); });
    return () => { active = false; };
  }, []);
  return <>
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
    {!brands.length && !error && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">Chưa có thương hiệu. <Link href="/phu-kien-o-to/thuong-hieu" className="underline">Thêm thương hiệu phụ kiện</Link> trước khi thêm sản phẩm.</p>}
    <CrudPage
      title="Danh sách phụ kiện"
      subtitle="Quản lý sản phẩm phụ kiện ô tô"
      stickyActions
      generatedSlugPrefix="/phu-kien-o-to"
      columns={[
        { key: 'rowNumber', label: 'STT', width: '60px' },
        { key: 'imageUrl', label: 'Ảnh', render: item => item.imageUrl
          ? <img src={String(item.imageUrl)} alt="" className="h-14 w-20 rounded-lg object-cover" /> : '—' },
        { key: 'name', label: 'Tên phụ kiện', render: item => <strong className="block max-w-[160px] truncate font-semibold sm:max-w-[240px]" title={String(item.name)}>{String(item.name)}</strong> },
        { key: 'brand', label: 'Thương hiệu', render: item => <span className="block max-w-[100px] truncate sm:max-w-[140px]" title={String(item.brand || '—')}>{String(item.brand || '—')}</span> },
        { key: 'categoryId', label: 'Danh mục', render: item => {
          const name = categories.find(category => category.id === item.categoryId)?.name || 'Chưa phân loại';
          return <span className="block max-w-[100px] truncate sm:max-w-[140px]" title={name}>{name}</span>;
        } },
        { key: 'price', label: 'Giá bán', render: item => `${formatNumber(Number(item.price))} đ` },
        { key: 'status', label: 'Trạng thái', render: item => <StatusBadge status={String(item.status)} /> },
      ]}
      formFields={[
        { name: 'name', label: 'Tên phụ kiện', required: true, placeholder: 'Ví dụ: Camera hành trình' },
        { name: 'brandId', label: 'Thương hiệu', type: 'select', required: true, options: brands.map(item => ({ value: item.id, label: item.name })) },
        { name: 'categoryId', label: 'Danh mục phụ kiện', type: 'select', options: categories.map(item => ({ value: item.id, label: item.name })) },
        { name: 'price', label: 'Giá bán (đ)', type: 'price', required: true, min: 0, max: 1_000_000_000_000, placeholder: 'VD: 1.500.000' },
        { name: 'imageUrl', label: 'Ảnh đại diện', type: 'image', required: true, hint: 'Ảnh xuất hiện trên thẻ phụ kiện.' },
        { name: 'imageUrls', label: 'Ảnh bổ sung', type: 'images', hint: 'Tối đa 10 ảnh; có thể chọn nhiều ảnh cùng lúc.' },
        { name: 'description', label: 'Mô tả chi tiết', type: 'richtext', placeholder: 'Thông tin và tính năng của phụ kiện...' },
        { name: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number', min: 0, defaultValue: 0 },
        { name: 'status', label: 'Trạng thái', type: 'select', defaultValue: 'active', options: [
          { value: 'active', label: 'Hiển thị' }, { value: 'inactive', label: 'Ẩn' },
        ] },
      ]}
      searchPlaceholder="Tìm phụ kiện..."
      searchFields={['name', 'brand']}
    />
  </>;
}
