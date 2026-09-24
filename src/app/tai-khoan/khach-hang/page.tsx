'use client';
import CrudPage from '@/components/CrudPage';
import { mockCustomers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/date';
export default function KhachHangPage() {
  return <CrudPage title="Tài khoản khách hàng" subtitle="Quản lý tài khoản khách hàng" data={mockCustomers as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Họ tên', sortable: true, render: (item) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{String(item.name).charAt(0)}</div>
        <span className="font-medium">{String(item.name)}</span>
      </div>
    )},
    { key: 'email', label: 'Email', render: (item) => <span className="text-sm text-[var(--muted-fg)]">{String(item.email)}</span> },
    { key: 'phone', label: 'SĐT' },
    { key: 'createdAt', label: 'Ngày tạo', sortable: true },
    { key: 'lastLogin', label: 'Đăng nhập cuối', render: (item) => <span className="text-sm text-[var(--muted-fg)]">{item.lastLogin ? formatDate(String(item.lastLogin)) : 'Chưa đăng nhập'}</span> },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: 'Họ tên', required: true },
    { name: 'email', label: 'Email', required: true },
    { name: 'phone', label: 'Số điện thoại', required: true },
    { name: 'address', label: 'Địa chỉ' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'blocked', label: 'Khóa' }] },
  ]} searchPlaceholder="Tìm kiếm khách hàng..." searchFields={['name', 'email', 'phone']} />;
}
