'use client';

import { StatsCard, PageHeader } from '@/components/ui';
import { mockDashboardStats, mockProducts, mockMails, mockCustomers, formatPrice, formatNumber } from '@/lib/mock-data';
import { useLocalStore } from '@/lib/local-store';
import type { Product, Mail as MailRecord, Customer } from '@/lib/types';
import { Car, Mail, Eye, Users, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import ProductThumbnail from '@/components/ProductThumbnail';
import { formatDate } from '@/lib/date';

export default function DashboardPage() {
  const [products] = useLocalStore<Product[]>('/san-pham', mockProducts);
  const [sellMails] = useLocalStore<MailRecord[]>('/thu/ban-xe', mockMails.filter(mail => mail.type === 'ban-xe'));
  const [tradeMails] = useLocalStore<MailRecord[]>('/thu/len-doi', mockMails.filter(mail => mail.type === 'len-doi'));
  const [callMails] = useLocalStore<MailRecord[]>('/thu/goi-lai', mockMails.filter(mail => mail.type === 'goi-lai'));
  const [newsletterMails] = useLocalStore<MailRecord[]>('/thu/dang-ky', mockMails.filter(mail => mail.type === 'dang-ky'));
  const [customers] = useLocalStore<Customer[]>('/tai-khoan/khach-hang', mockCustomers);
  const allMails = [...sellMails, ...tradeMails, ...callMails, ...newsletterMails];
  const stats = { ...mockDashboardStats, totalProducts: products.length, totalMails: allMails.filter(mail => mail.status === 'unread').length, totalCustomers: customers.length, recentMails: [...allMails].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5), topProducts: products.filter(product => product.featured).slice(0, 5) };

  return (
    <div className="space-y-6">
      <PageHeader title="Tổng quan" subtitle="Sản phẩm, thư và khách hàng cập nhật theo dữ liệu trình duyệt; lượt truy cập là số liệu minh họa" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard title="Tổng sản phẩm" value={stats.totalProducts} icon={<Car className="w-6 h-6" />} trend={12} color="red" />
        <StatsCard title="Tổng thư mới" value={stats.totalMails} icon={<Mail className="w-6 h-6" />} trend={8} color="amber" />
        <StatsCard title="Lượt truy cập" value={formatNumber(stats.totalViews)} icon={<Eye className="w-6 h-6" />} trend={24} color="blue" />
        <StatsCard title="Khách hàng" value={stats.totalCustomers} icon={<Users className="w-6 h-6" />} trend={5} color="green" />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Lượt truy cập</h3>
              <p className="text-sm text-[var(--muted-fg)]">12 tháng gần nhất</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +24%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.monthlyViews}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--muted-fg)" fontSize={12} />
              <YAxis stroke="var(--muted-fg)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '13px' }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Area type="monotone" dataKey="views" stroke="#dc2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Mails */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Thư mới nhất</h3>
            <Link href="/thu/ban-xe" className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
              Xem tất cả <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentMails.map(mail => (
              <div key={mail.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors cursor-pointer group">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${mail.status === 'unread' ? 'bg-red-500' : 'bg-gray-400'}`}>
                  {mail.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{mail.name}</p>
                  <p className="text-xs text-[var(--muted-fg)] truncate">{mail.carName || mail.phone}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--muted-fg)] shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatDate(mail.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sản phẩm nổi bật</h3>
          <Link href="/san-pham" className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
            Xem tất cả <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4">Xe</th>
                <th className="text-left text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4">Hãng</th>
                <th className="text-left text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4">Năm</th>
                <th className="text-right text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4">Giá</th>
                <th className="text-center text-xs font-semibold text-[var(--muted-fg)] uppercase py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map(product => (
                <tr key={product.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--muted)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <ProductThumbnail images={product.images} size="sm" />
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{product.brand}</td>
                  <td className="py-3 px-4 text-sm">{product.year}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">{formatPrice(product.price)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : product.status === 'deposit' ? 'bg-amber-500/10 text-amber-600' : product.status === 'sold' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-emerald-500' : product.status === 'deposit' ? 'bg-amber-500' : product.status === 'sold' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                      {product.status === 'active' ? 'Đang bán' : product.status === 'deposit' ? 'Đã nhận cọc' : product.status === 'sold' ? 'Đã bán' : 'Ẩn'}
                    </span>
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
