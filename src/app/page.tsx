'use client';

import { StatsCard, PageHeader } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import { api, type PageResult } from '@/lib/api/client';
import { carToProduct, type CarListRecord } from '@/lib/api/cars';
import type { Product, Mail as MailRecord } from '@/lib/types';
import { Car, Mail, Eye, Users, Clock, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductThumbnail from '@/components/ProductThumbnail';
import { formatDate } from '@/lib/date';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalProducts: 0, totalMails: 0, totalCustomers: 0, recentMails: [] as MailRecord[], topProducts: [] as Product[] });
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    void Promise.all([
      api<{ cars: number; unreadLeads: number; customers: number }>('/admin/dashboard'),
      Promise.allSettled([
        api<PageResult<MailRecord>>('/admin/leads?page=1&limit=5'),
        api<PageResult<CarListRecord>>('/admin/cars?page=1&limit=5&featured=true'),
      ]),
    ]).then(([summary, [leadsResult, carsResult]]) => { if (live) setStats({ totalProducts: summary.cars, totalMails: summary.unreadLeads, totalCustomers: summary.customers,
      recentMails: leadsResult.status === 'fulfilled' ? leadsResult.value.data.map(lead => ({ ...lead, name: lead.name || 'Khách hàng', carName: lead.carName || '', phone: lead.phone || '' })) : [],
      topProducts: carsResult.status === 'fulfilled' ? carsResult.value.data.filter(car => car.featured).slice(0, 5).map(carToProduct) : [] }); })
      .catch(failure => { if (live) setError(failure instanceof Error ? failure.message : 'Không thể tải tổng quan.'); });
    return () => { live = false; };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Tổng quan" subtitle="Sản phẩm, thư và khách hàng cập nhật từ hệ thống" />
      {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard title="Tổng sản phẩm" value={stats.totalProducts} icon={<Car className="w-6 h-6" />} color="red" />
        <StatsCard title="Tổng thư mới" value={stats.totalMails} icon={<Mail className="w-6 h-6" />} color="amber" />
        <StatsCard title="Lượt truy cập" value="—" icon={<Eye className="w-6 h-6" />} color="blue" />
        <StatsCard title="Khách hàng" value={stats.totalCustomers} icon={<Users className="w-6 h-6" />} color="green" />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Lượt truy cập</h3>
              <p className="text-sm text-[var(--muted-fg)]">Chưa cấu hình nguồn phân tích truy cập</p>
            </div>
          </div>
          <div className="flex h-[280px] items-center justify-center text-sm text-[var(--muted-fg)]">Chưa có dữ liệu lượt truy cập</div>
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
