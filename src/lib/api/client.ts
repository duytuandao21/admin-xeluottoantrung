import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cachedCatalogue, invalidateCatalogues, scopeCatalogues } from './catalogue-cache';

const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
let supabase: SupabaseClient | null = null;

export function authClient(): SupabaseClient {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  supabase = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  supabase.auth.onAuthStateChange((_event, session) => scopeCatalogues(session?.access_token));
  return supabase;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const { data: { session } } = await authClient().auth.getSession();
  scopeCatalogues(session?.access_token);
  if (!session) throw new ApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401);
  const catalogueWrite = !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase()) &&
    /^\/admin\/(brands|car-models|lookups|collections|cars)(\/|\?|$)/.test(path);
  if (catalogueWrite) invalidateCatalogues();
  try {
  const response = await fetch(`${apiBase}/api/v1${path}`, {
    ...options,
    headers: {
      ...(typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
    cache: 'no-store',
  });
  if (response.status === 401 && retry) {
    const { error } = await authClient().auth.refreshSession();
    if (!error) return api<T>(path, options, false);
    await authClient().auth.signOut();
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    const code = body.details?.code ?? body.code;
    throw new ApiError(typeof detail === 'string' ? detail : `Yêu cầu thất bại (${response.status}).`, response.status, typeof code === 'string' ? code : undefined);
  }
  if (response.status === 204) return undefined as T;
  if (response.headers.get('content-type')?.includes('text/csv')) return response.text() as Promise<T>;
  return response.json() as Promise<T>;
  } finally { if (catalogueWrite) invalidateCatalogues(); }
}

/** Full option sets only: never use for inventory, customers, leads or history. */
export async function catalogueRows<T>(path: string): Promise<T[]> {
  if (!/^\/admin\/(brands|car-models)(\?|$)|^\/admin\/lookups\/(body-styles|transmissions|car-colors|branches|branch-regions|car-versions)(\?|$)|^\/admin\/collections\/(article-categories|accessory-brands|accessory-categories)(\?|$)/.test(path))
    throw new Error('Unsupported catalogue');
  const { data: { session } } = await authClient().auth.getSession();
  scopeCatalogues(session?.access_token);
  if (!session) throw new ApiError('Phiên đăng nhập đã hết hạn.', 401);
  return cachedCatalogue(path, async () => {
    if (/^\/admin\/(brands|car-models)(\?|$)/.test(path)) return api<T[]>(path);
    const separator = path.includes('?') ? '&' : '?';
    const first = await api<PageResult<T>>(`${path}${separator}limit=100&page=1`);
    const data = [...first.data];
    for (let page = 2; page <= first.meta.totalPages; page++) data.push(...(await api<PageResult<T>>(`${path}${separator}limit=100&page=${page}`)).data);
    return data;
  });
}

export function query(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  return search.size ? `?${search}` : '';
}

export function json(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body?: unknown): RequestInit {
  return { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) };
}

export interface PageResult<T> { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } }
