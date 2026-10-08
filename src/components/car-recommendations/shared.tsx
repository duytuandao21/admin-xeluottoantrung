'use client';
import { cloneElement, isValidElement, useEffect, useId, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui';
import { api } from '@/lib/api/client';
export function useNeedsData<T>(path: string | null, revision = 0) {
  const [state, setState] = useState<{ data: T | null; error: string; loading: boolean }>({ data: null, error: '', loading: !!path });
  useEffect(() => {
    if (!path) return;
    const abort = new AbortController();
    void Promise.resolve().then(async () => {
      if (abort.signal.aborted) return;
      setState({ data: null, error: '', loading: true });
      try { const data = await api<T>(path, { signal: abort.signal }); if (!abort.signal.aborted) setState({ data, error: '', loading: false }); }
      catch (failure) { if (!abort.signal.aborted) setState({ data: null, error: failure instanceof Error ? failure.message : 'Không thể tải dữ liệu.', loading: false }); }
    });
    return () => abort.abort();
  }, [path, revision]);
  return state;
}
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 ${className}`}>{children}</section>; }
export function Field({ label, children }: { label: string; children: ReactNode }) {
  const generatedId = useId(), id = isValidElement<{ id?: string }>(children) ? children.props.id || generatedId : generatedId;
  return <div className="min-w-0"><label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>{isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children}</div>;
}
export function LoadState({ error, loading, retry }: { error: string; loading: boolean; retry: () => void }) { return error ? <Panel><p role="alert">{error}</p><Button variant="secondary" className="mt-3" onClick={retry}>Thử lại</Button></Panel> : loading ? <Panel><p role="status">Đang tải dữ liệu…</p></Panel> : null; }
