import { api } from './client';

export interface AnalyticsRow { name: string; count: number }
export interface AnalyticsTrafficRow extends AnalyticsRow { visits: number | null }
export interface AnalyticsCarRow extends AnalyticsRow { path: string }
interface DatasetStatus {
  reason: string | null;
  limits: { enabled: boolean; notOlderThan: number; maxDuration: number; maxPageSize: number; maxNumberOfFields: number } | null;
}
export interface CloudflareAnalytics {
  hostname: string;
  generatedAt: string;
  expiresAt: string;
  period: { range: string; from: string; to: string; lagSeconds: number };
  availableRanges: { id: string; label: string }[];
  http: DatasetStatus & {
    requests: number | null; bytes: number | null; visits: number | null; sampleInterval: number | null;
    trend: AnalyticsRow[] | null; countries: AnalyticsRow[] | null; paths: AnalyticsRow[] | null;
    cache: AnalyticsRow[] | null; cacheHitRatio: number | null;
  };
  webAnalytics: DatasetStatus & {
    pageViews: number | null; visits: number | null; uniqueVisitors: null;
    trend: AnalyticsTrafficRow[] | null; bucket: 'minute' | 'hour' | 'day';
    devices: AnalyticsRow[] | null; countries: AnalyticsRow[] | null; pages: AnalyticsRow[] | null;
    cars: AnalyticsCarRow[] | null; carsReason: string | null; pathsLimited: boolean; pathsLimit: number;
  };
  security: DatasetStatus & { events: number | null; actions: AnalyticsRow[] | null };
}
export function getAnalytics(range: string | undefined, signal: AbortSignal) {
  return api<CloudflareAnalytics>(`/admin/dashboard/analytics${range ? `?range=${encodeURIComponent(range)}` : ''}`, { signal });
}
