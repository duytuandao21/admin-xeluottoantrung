'use client';
import { PageHeader, StatsCard } from '@/components/ui';
import { Eye, Users, Globe, Clock } from 'lucide-react';

const panels = [
  { title: 'Lưu lượng truy cập tuần', detail: 'Visitors & Page Views', wide: true },
  { title: 'Thiết bị', detail: 'Phân bổ theo thiết bị' },
  { title: 'Lượt truy cập theo tháng', detail: '12 tháng gần nhất', wide: true },
  { title: 'Trình duyệt', detail: 'Phân bổ theo trình duyệt' },
];

export default function ThongKePage() {
  return <div className="space-y-6">
    <PageHeader title="Thống kê" subtitle="Cần kết nối hệ thống analytics để xem số liệu truy cập thực" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      <StatsCard title="Tổng lượt xem" value="—" icon={<Eye className="w-6 h-6" />} color="blue" />
      <StatsCard title="Người truy cập" value="—" icon={<Users className="w-6 h-6" />} color="green" />
      <StatsCard title="Trang/phiên" value="—" icon={<Globe className="w-6 h-6" />} color="amber" />
      <StatsCard title="Thời gian TB" value="—" icon={<Clock className="w-6 h-6" />} color="red" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {panels.map(panel => <section key={panel.title} className={`${panel.wide ? 'lg:col-span-2' : ''} bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5`}>
        <h3 className="font-semibold mb-1">{panel.title}</h3><p className="text-sm text-[var(--muted-fg)]">{panel.detail}</p>
        <div className="flex h-[280px] items-center justify-center text-sm text-[var(--muted-fg)]">Chưa có dữ liệu lượt truy cập</div>
      </section>)}
    </div>
    <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
      <h3 className="font-semibold mb-4">Trang được xem nhiều nhất</h3>
      <div className="flex h-40 items-center justify-center text-sm text-[var(--muted-fg)]">Chưa có dữ liệu lượt truy cập</div>
    </section>
  </div>;
}
