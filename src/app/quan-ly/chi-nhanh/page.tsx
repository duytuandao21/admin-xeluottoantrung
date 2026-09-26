'use client';
import { useCallback, useEffect, useState } from 'react';
import CrudPage from '@/components/CrudPage';
import { StatusBadge } from '@/components/ui';
import { api, type PageResult } from '@/lib/api/client';

type Region = { id: string; name: string; status: string };

export default function ChiNhanhPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadRegions = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const first = await api<PageResult<Region>>('/admin/lookups/branch-regions?limit=100');
      const rest = await Promise.all(Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, index) =>
        api<PageResult<Region>>(`/admin/lookups/branch-regions?limit=100&page=${index + 2}`)));
      setRegions([...first.data, ...rest.flatMap(page => page.data)]);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể tải danh mục chi nhánh.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { queueMicrotask(() => void loadRegions()); }, [loadRegions]);
  if (loading) return <p className="p-6">Đang tải danh mục chi nhánh...</p>;
  if (error) return <div className="p-6" role="alert"><p>{error}</p><button type="button" onClick={() => void loadRegions()}>Thử lại</button></div>;
  return (
    <CrudPage
      subtitle={regions.length ? undefined : 'Hãy tạo danh mục chi nhánh trước khi thêm chi nhánh.'}
      title="Quản lý chi nhánh"
      columns={[
        { key: 'regionId', label: 'Danh mục chi nhánh', render: (item) => regions.find(region => region.id === item.regionId)?.name || 'Chưa phân vùng' },
        { key: 'id', label: 'STT', width: '60px' },
        { key: 'name', label: 'Tên chi nhánh', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
        { key: 'address', label: 'Địa chỉ', render: (item) => <span className="text-sm text-[var(--muted-fg)]">{String(item.address)}</span> },
        { key: 'phone', label: 'Điện thoại' },
        { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
      ]}
      formFields={[
        { name: 'regionId', label: 'Danh mục chi nhánh', type: 'select', required: true,
          options: regions.map(region => ({ value: region.id, label: `${region.name}${region.status === 'active' ? '' : ' (Đang ẩn)'}` })) },
        { name: 'name', label: 'Tên chi nhánh', required: true, placeholder: 'VD: Chi nhánh Quận 7' },
        { name: 'image', label: 'Hình chi nhánh', type: 'image' },
        { name: 'phone', label: 'Số điện thoại', required: true, placeholder: '028 1234 5678' },
        { name: 'address', label: 'Địa chỉ', required: true, placeholder: 'Số nhà, đường, quận, TP' },
        { name: 'mapUrl', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...' },
        { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
      ]}
      searchPlaceholder="Tìm kiếm chi nhánh..."
      searchFields={['name', 'address', 'phone']}
    />
  );
}
