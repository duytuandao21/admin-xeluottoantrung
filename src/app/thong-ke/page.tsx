'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { PageHeader, StatsCard } from '@/components/ui';
import { Eye, Activity, Globe, HardDrive, Users, MousePointerClick } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getAnalytics, type AnalyticsRow, type AnalyticsTrafficRow, type CloudflareAnalytics } from '@/lib/api/analytics';
import TrafficTrend from '@/components/analytics/TrafficTrend';

const count = (value: number | null | undefined) => value == null ? 'N/A' : value.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
const pageLabels: Record<string, string> = { '/': 'Trang chủ', '/san-pham': 'Danh sách xe', '/ban-xe': 'Bán xe', '/len-doi': 'Lên đời xe', '/tin-tuc': 'Tin tức', '/phu-kien-o-to': 'Phụ kiện ô tô' };
const deviceLabels: Record<string, string> = { mobile: 'Điện thoại', desktop: 'Máy tính', tablet: 'Máy tính bảng', other: 'Khác', unknown: 'Không xác định' };
function countryLabel(code: string) {
  try { return new Intl.DisplayNames(['vi'], { type: 'region' }).of(code.toUpperCase()) || code; } catch { return code; }
}
function bytes(value: number | null | undefined) {
  if (value == null) return 'N/A';
  if (value < 1024) return `${value} B`;
  const unit = Math.min(3, Math.floor(Math.log(value) / Math.log(1024)));
  return `${(value / 1024 ** unit).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ${['B', 'KiB', 'MiB', 'GiB'][unit]}`;
}
function Empty({ reason }: { reason?: string | null }) {
  return <div className="flex h-full min-h-24 items-center justify-center text-center text-sm text-[var(--muted-fg)] px-3">{reason ? `N/A — ${reason}` : 'Không có dữ liệu trong khoảng thời gian này.'}</div>;
}
function Panel({ title, detail, wide, children }: { title: string; detail: string; wide?: boolean; children: ReactNode }) {
  return <section className={`${wide ? 'lg:col-span-2' : ''} min-w-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5`}>
    <h3 className="font-semibold mb-1">{title}</h3><p className="text-sm text-[var(--muted-fg)]">{detail}</p>
    <div className="h-[280px] overflow-y-auto mt-3">{children}</div>
  </section>;
}
function Breakdown({ rows, reason, label }: { rows?: AnalyticsRow[] | null; reason?: string | null; label?: (name: string) => string }) {
  if (!rows?.length) return <Empty reason={rows == null ? reason || 'Nhóm dữ liệu này chưa khả dụng.' : null} />;
  const max = Math.max(1, ...rows.map(row => row.count));
  return <ul className="space-y-3 py-2">{rows.map(row => <li key={row.name}>
    <div className="flex items-start justify-between gap-3 text-sm"><span className="min-w-0 break-words [overflow-wrap:anywhere]">{label ? label(row.name) : row.name || 'Không xác định'}</span><span className="shrink-0 tabular-nums">{count(row.count)}</span></div>
    <div className="h-1.5 mt-1 rounded-full bg-[var(--muted)]"><div className="h-full rounded-full bg-blue-500" style={{ width: `${row.count / max * 100}%` }} /></div>
  </li>)}</ul>;
}
function Trend({ rows, reason, bucket }: { rows?: AnalyticsTrafficRow[] | null; reason?: string | null; bucket?: 'minute' | 'hour' | 'day' }) {
  if (!rows?.length) return <Empty reason={rows == null ? reason || 'Xu hướng chưa khả dụng.' : null} />;
  return <TrafficTrend rows={rows} bucket={bucket} />;
}

export default function ThongKePage() {
  const { identity, loading: authLoading } = useAuth();
  const permitted = Boolean(identity?.permissions.includes('analytics.read'));
  const [range, setRange] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ range?: string; attempt: number; data?: CloudflareAnalytics; error?: string }>();
  useEffect(() => {
    if (!permitted) return;
    const controller = new AbortController();
    void getAnalytics(range, controller.signal).then(data => { if (!controller.signal.aborted) setResult({ range, attempt, data }); })
      .catch(error => { if (!controller.signal.aborted) setResult({ range, attempt, error: error instanceof Error ? error.message : 'Không lấy được thống kê.' }); });
    return () => controller.abort();
  }, [range, attempt, permitted]);
  const current = result?.range === range && result?.attempt === attempt ? result : undefined;
  const data = permitted ? current?.data : undefined;
  const loading = permitted && !current;
  const unavailable = loading ? 'Đang lấy dữ liệu Cloudflare…' : current?.error || 'Chưa có dữ liệu Cloudflare.';
  if (authLoading) return <p>Đang kiểm tra quyền truy cập…</p>;
  if (!permitted) return <div role="alert">Bạn chưa được cấp quyền quản trị thống kê (analytics.read).</div>;
  return <div className="space-y-6" aria-busy={loading}>
    <PageHeader title="Thống kê" subtitle={`Lượt truy cập và nội dung khách quan tâm · ${data?.hostname || 'Website công khai'}`}
      actions={<div className="flex items-center gap-2">
        <label className="text-sm" htmlFor="analytics-range">Thời gian</label>
        <select id="analytics-range" className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm" disabled={loading || !data?.availableRanges.length}
          value={range || data?.period.range || ''} onChange={event => setRange(event.target.value)}>
          {!data?.availableRanges.length && <option value="">Chưa khả dụng</option>}
          {data?.availableRanges.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
        <button type="button" disabled={loading} onClick={() => setAttempt(value => value + 1)} className="text-sm underline disabled:opacity-50">Tải lại</button>
      </div>} />
    {current?.error && <p role="alert" className="text-sm text-red-600">{current.error}</p>}
    {loading && <p role="status" className="text-sm text-[var(--muted-fg)]">{unavailable}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
      <StatsCard title="Lượt truy cập" value={count(data?.webAnalytics.visits)} icon={<MousePointerClick className="w-6 h-6" />} color="blue" />
      <StatsCard title="Lượt xem trang" value={count(data?.webAnalytics.pageViews)} icon={<Eye className="w-6 h-6" />} color="green" />
      <StatsCard title="Người truy cập riêng biệt" value="Chưa có dữ liệu" icon={<Users className="w-6 h-6" />} color="amber" />
    </div>
    {data?.webAnalytics.reason && <p role="status" className="text-sm text-[var(--muted-fg)]">Web Analytics: N/A — {data.webAnalytics.reason}</p>}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Panel title="Xu hướng truy cập" detail={`Lượt truy cập và lượt xem theo ${data?.webAnalytics.bucket === 'day' ? 'ngày' : data?.webAnalytics.bucket === 'minute' ? 'phút' : 'giờ'} · Giờ Việt Nam`} wide><Trend rows={data?.webAnalytics.trend} bucket={data?.webAnalytics.bucket} reason={data?.webAnalytics.reason || unavailable} /></Panel>
      <Panel title="Thiết bị truy cập" detail="Phân bổ theo lượt xem trang"><Breakdown rows={data?.webAnalytics.devices} label={name => deviceLabels[name.toLowerCase()] || name || 'Không xác định'} reason={data?.webAnalytics.reason || unavailable} /></Panel>
      <Panel title="Xe được xem nhiều nhất" detail="Top 10 theo lượt xem trang xe" wide>
        {data?.webAnalytics.cars?.length ? <ol className="space-y-4 py-2">{data.webAnalytics.cars.map((car, index) => <li key={car.path} className="flex items-start gap-3 text-sm">
          <span className="text-[var(--muted-fg)] w-5 shrink-0">{index + 1}.</span>
          <div className="flex-1 min-w-0"><p className="font-medium break-words">{car.name}</p><p className="text-xs text-[var(--muted-fg)] mt-1 [overflow-wrap:anywhere]">{car.path}</p></div>
          <span className="shrink-0 tabular-nums">{count(car.count)} lượt xem</span>
        </li>)}</ol> : <Empty reason={data?.webAnalytics.cars == null ? data?.webAnalytics.carsReason || data?.webAnalytics.reason || 'Chưa có dữ liệu lượt xem xe.' : null} />}
        {data?.webAnalytics.pathsLimited && <p className="text-xs text-[var(--muted-fg)]">Danh sách được đối chiếu trong {data.webAnalytics.pathsLimit} đường dẫn xem nhiều nhất; có thể chưa bao gồm mọi xe.</p>}
      </Panel>
      <Panel title="Khách truy cập từ đâu?" detail="Top 10 quốc gia theo lượt xem trang"><Breakdown rows={data?.webAnalytics.countries} label={countryLabel} reason={data?.webAnalytics.reason || unavailable} /></Panel>
    </div>
    <section className="min-w-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
      <h3 className="font-semibold mb-1">Trang được xem nhiều nhất</h3>
      <p className="text-sm text-[var(--muted-fg)] mb-4">Top 10 theo lượt xem trang · Web Analytics</p>
      <div className="max-h-96 overflow-y-auto"><Breakdown rows={data?.webAnalytics.pages} label={name => pageLabels[name] ? `${pageLabels[name]} (${name})` : name} reason={data?.webAnalytics.reason || unavailable} /></div>
    </section>
    <details className="min-w-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
      <summary className="font-semibold cursor-pointer">Thông tin kỹ thuật</summary>
      <div className="space-y-5 mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="HTTP requests (gồm tài nguyên và bot)" value={count(data?.http.requests)} icon={<Activity className="w-6 h-6" />} color="blue" />
          <StatsCard title="Dữ liệu truyền từ edge" value={bytes(data?.http.bytes)} icon={<HardDrive className="w-6 h-6" />} color="amber" />
          <StatsCard title="Cache HIT / tổng requests" value={data?.http.cacheHitRatio == null ? 'N/A' : `${(data.http.cacheHitRatio * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`} icon={<Globe className="w-6 h-6" />} color="red" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Cache HIT / MISS" detail="Phân bổ HTTP requests theo trạng thái cache"><Breakdown rows={data?.http.cache} reason={data?.http.reason || unavailable} /></Panel>
          <Panel title="Sự kiện bảo mật / WAF" detail={`${count(data?.security.events)} sự kiện bảo mật`}><Breakdown rows={data?.security.actions} reason={data?.security.reason || unavailable} /></Panel>
        </div>
      </div>
    </details>
  </div>;
}
