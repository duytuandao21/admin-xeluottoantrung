'use client';
import CrudPage from '@/components/CrudPage';
import { mockRecruitments } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
export default function TuyenDungPage() {
  return <CrudPage title="Quản lý tuyển dụng" data={mockRecruitments as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'title', label: 'Vị trí', sortable: true, render: (item) => <span className="font-medium">{String(item.title)}</span> },
    { key: 'salary', label: 'Mức lương', render: (item) => <span className="font-semibold text-emerald-600">{String(item.salary || 'Thỏa thuận')}</span> },
    { key: 'location', label: 'Địa điểm' },
    { key: 'deadline', label: 'Hạn nộp', sortable: true },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'title', label: 'Vị trí tuyển dụng', required: true, placeholder: 'VD: Nhân viên kinh doanh' },
    { name: 'description', label: 'Mô tả công việc', type: 'textarea', required: true },
    { name: 'requirements', label: 'Yêu cầu', type: 'textarea', required: true },
    { name: 'salary', label: 'Mức lương', placeholder: 'VD: 10-20 triệu' },
    { name: 'location', label: 'Địa điểm', placeholder: 'VD: TP.HCM' },
    { name: 'deadline', label: 'Hạn nộp', placeholder: 'VD: 2024-04-30' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Đang tuyển' }, { value: 'inactive', label: 'Đã đóng' }] },
  ]} searchPlaceholder="Tìm kiếm vị trí..." searchFields={['title', 'location']} nameField="title" />;
}
