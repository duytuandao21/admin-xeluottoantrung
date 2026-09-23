'use client';
import { PageHeader, StatsCard } from '@/components/ui';
import { mockDashboardStats, formatNumber } from '@/lib/mock-data';
import { Eye, Users, Car, TrendingUp, Globe, Monitor, Smartphone, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const browserData = [
  { name: 'Chrome', value: 45, color: '#4285F4' },
  { name: 'Safari', value: 25, color: '#000000' },
  { name: 'Firefox', value: 15, color: '#FF7139' },
  { name: 'Edge', value: 10, color: '#0078D7' },
  { name: 'Khác', value: 5, color: '#94a3b8' },
];

const deviceData = [
  { name: 'Desktop', value: 55, color: '#3b82f6' },
  { name: 'Mobile', value: 38, color: '#22c55e' },
  { name: 'Tablet', value: 7, color: '#f59e0b' },
];

const weeklyData = [
  { day: 'T2', visitors: 320, pageViews: 890 },
  { day: 'T3', visitors: 450, pageViews: 1200 },
  { day: 'T4', visitors: 380, pageViews: 1050 },
  { day: 'T5', visitors: 520, pageViews: 1400 },
  { day: 'T6', visitors: 600, pageViews: 1650 },
  { day: 'T7', visitors: 750, pageViews: 2100 },
  { day: 'CN', visitors: 680, pageViews: 1850 },
];

const topPagesData = [
  { page: 'Trang chủ', views: 12500, percentage: 28 },
  { page: 'Danh sách xe', views: 8900, percentage: 20 },
  { page: 'Chi tiết xe', views: 7200, percentage: 16 },
  { page: 'Liên hệ', views: 4500, percentage: 10 },
  { page: 'Tin tức', views: 3800, percentage: 9 },
  { page: 'Giới thiệu', views: 2900, percentage: 7 },
  { page: 'Trả góp', views: 2400, percentage: 5 },
  { page: 'Bán xe', views: 2100, percentage: 5 },
];

export default function ThongKePage() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      <PageHeader title="Thống kê" subtitle="Thống kê truy cập & hiệu suất website" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard title="Tổng lượt xem" value={formatNumber(stats.totalViews)} icon={<Eye className="w-6 h-6" />} trend={24} color="blue" />
        <StatsCard title="Người truy cập" value="12,450" icon={<Users className="w-6 h-6" />} trend={18} color="green" />
        <StatsCard title="Trang/phiên" value="3.7" icon={<Globe className="w-6 h-6" />} trend={5} color="amber" />
        <StatsCard title="Thời gian TB" value="2:35" icon={<Clock className="w-6 h-6" />} trend={-3} color="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Traffic */}
        <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
          <h3 className="font-semibold mb-1">Lưu lượng truy cập tuần</h3>
          <p className="text-sm text-[var(--muted-fg)] mb-4">Visitors & Page Views</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" stroke="var(--muted-fg)" fontSize={12} />
              <YAxis stroke="var(--muted-fg)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '13px' }} />
              <Legend />
              <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
              <Line type="monotone" dataKey="pageViews" name="Page Views" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
          <h3 className="font-semibold mb-1">Thiết bị</h3>
          <p className="text-sm text-[var(--muted-fg)] mb-4">Phân bổ theo thiết bị</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {deviceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {deviceData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-sm">{d.name}</span>
                </div>
                <span className="text-sm font-semibold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart + Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Traffic */}
        <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
          <h3 className="font-semibold mb-1">Lượt truy cập theo tháng</h3>
          <p className="text-sm text-[var(--muted-fg)] mb-4">12 tháng gần nhất</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--muted-fg)" fontSize={12} />
              <YAxis stroke="var(--muted-fg)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '13px' }} />
              <Bar dataKey="views" name="Lượt xem" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Browser Breakdown */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
          <h3 className="font-semibold mb-1">Trình duyệt</h3>
          <p className="text-sm text-[var(--muted-fg)] mb-4">Phân bổ theo trình duyệt</p>
          <div className="space-y-3 mt-4">
            {browserData.map((b, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{b.name}</span>
                  <span className="text-sm font-semibold">{b.value}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--muted)]">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${b.value}%`, background: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Trang được xem nhiều nhất</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4">Trang</th>
                <th className="text-right text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4">Lượt xem</th>
                <th className="text-right text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4">Tỷ lệ</th>
                <th className="text-left text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4 w-40">Biểu đồ</th>
              </tr>
            </thead>
            <tbody>
              {topPagesData.map((p, i) => (
                <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--muted)] transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{p.page}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold">{p.views.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-right text-[var(--muted-fg)]">{p.percentage}%</td>
                  <td className="py-3 px-4">
                    <div className="w-full h-2 rounded-full bg-[var(--muted)]">
                      <div className="h-2 rounded-full bg-red-500 transition-all duration-700" style={{ width: `${p.percentage}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
