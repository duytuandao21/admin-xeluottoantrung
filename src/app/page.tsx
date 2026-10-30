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
import { useAuth } from '@/lib/auth-context';
import { getAnalytics, type CloudflareAnalytics } from '@/lib/api/analytics';
import TrafficTrend from '@/components/analytics/TrafficTrend';

export default function DashboardPage() {
  const { identity } = useAuth();
  const canReadAnalytics = Boolean(identity?.permissions.includes('analytics.read'));
  const [trafficRange, setTrafficRange] = useState<string>();
  const [trafficAttempt, setTrafficAttempt] = useState(0);
  const [trafficResult, setTrafficResult] = useState<{ range?: string; attempt: number; data?: CloudflareAnalytics; error?: string }>();
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

  useEffect(() => {
    if (!canReadAnalytics) return;
    const controller = new AbortController();
    void getAnalytics(trafficRange, controller.signal)
      .then(data => { if (!controller.signal.aborted) setTrafficResult({ range: trafficRange, attempt: trafficAttempt, data }); })
      .catch(failure => { if (!controller.signal.aborted) setTrafficResult({ range: trafficRange, attempt: trafficAttempt,
        error: failure instanceof Error ? failure.message : 'Không thể tải thống kê truy cập.' }); });
    return () => controller.abort();
  }, [canReadAnalytics, trafficRange, trafficAttempt]);
  const currentTraffic = canReadAnalytics && trafficResult?.range === trafficRange && trafficResult?.attempt === trafficAttempt ? trafficResult : undefined;
  const traffic = currentTraffic?.data;
  const trafficLoading = canReadAnalytics && !currentTraffic;
  const rangeLabel = traffic?.availableRanges.find(option => option.id === traffic.period.range)?.label;
  const trafficMessage = !canReadAnalytics ? 'Bạn chưa được cấp quyền xem thống kê truy cập.'
    : trafficLoading ? 'Đang tải thống kê truy cập…'
      : currentTraffic?.error || traffic?.webAnalytics.reason || 'Chưa có dữ liệu lượt truy cập trong khoảng thời gian này.';

  return (
    <div className="space-y-6">
      <PageHeader title="Tổng quan" subtitle="Sản phẩm, thư và khách hàng cập nhật từ hệ thống" />
      {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard title="Tổng sản phẩm" value={stats.totalProducts} icon={<Car className="w-6 h-6" />} color="red" />
        <StatsCard title="Tổng thư mới" value={stats.totalMails} icon={<Mail className="w-6 h-6" />} color="amber" />
        <StatsCard title={`Lượt truy cập${rangeLabel ? ` (${rangeLabel})` : ''}`} value={trafficLoading ? '—' : traffic?.webAnalytics.visits ?? 'N/A'} icon={<Eye className="w-6 h-6" />} color="blue" />
        <StatsCard title="Khách hàng" value={stats.totalCustomers} icon={<Users className="w-6 h-6" />} color="green" />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 min-w-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5" aria-busy={trafficLoading}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-semibold">Lượt truy cập</h3>
              <p className="text-sm text-[var(--muted-fg)]">{rangeLabel ? `${rangeLabel} · ` : ''}Lượt truy cập và lượt xem · Giờ Việt Nam</p>
            </div>
            {canReadAnalytics && <div className="flex flex-wrap items-center gap-3 text-xs">
              <label htmlFor="dashboard-traffic-range">Thời gian truy cập</label>
              <select id="dashboard-traffic-range" className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-2 py-2" disabled={trafficLoading || !traffic?.availableRanges.length}
                value={trafficRange || traffic?.period.range || ''} onChange={event => setTrafficRange(event.target.value)}>
                {!traffic?.availableRanges.length && <option value="">Chưa khả dụng</option>}
                {traffic?.availableRanges.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
              <button type="button" disabled={trafficLoading} onClick={() => setTrafficAttempt(value => value + 1)} className="underline disabled:opacity-50">Tải lại</button>
              <Link href="/thong-ke" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1">Xem chi tiết <ArrowUpRight className="w-3 h-3" /></Link>
            </div>}
          </div>
          <div className="h-[280px]">
            {traffic?.webAnalytics.trend?.length
              ? <TrafficTrend rows={traffic.webAnalytics.trend} bucket={traffic.webAnalytics.bucket} />
              : <div role="status" className="flex h-full items-center justify-center text-center text-sm text-[var(--muted-fg)]">{trafficMessage}</div>}
          </div>
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
                      <span className="admin-list-text text-sm font-medium" title={product.name}>{product.name}</span>
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
