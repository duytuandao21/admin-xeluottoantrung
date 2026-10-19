'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PageResult } from './client';

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [settled, setSettled] = useState(value);
  useEffect(() => { const timer = setTimeout(() => setSettled(value), delay); return () => clearTimeout(timer); }, [value, delay]);
  return settled;
}

export function useWriteAction() {
  const pending = useRef(false);
  return async (work: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    try { await work(); } finally { pending.current = false; }
  };
}

// Immediately invalidates old responses when input changes, including while
// debounce is pending. A mutation reload uses the latest query and cancels GETs.
export function useAdminList<T>(key: string, load: (signal: AbortSignal) => Promise<PageResult<T>>) {
  const loader = useRef(load);
  useEffect(() => { loader.current = load; });
  const revision = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const [result, setResult] = useState<PageResult<T>>({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController(); controller.current = current;
    const version = ++revision.current;
    setLoading(true); setError('');
    try {
      const next = await loader.current(current.signal);
      if (!current.signal.aborted && version === revision.current) setResult(next);
    } catch (failure) {
      if (!current.signal.aborted && version === revision.current) setError(failure instanceof Error ? failure.message : 'Không thể tải dữ liệu.');
    } finally { if (!current.signal.aborted && version === revision.current) setLoading(false); }
  }, []);
  useEffect(() => {
    // Debounce the request, not the controlled search input.
    controller.current?.abort(); revision.current++;
    const timer = setTimeout(() => void reload(), mounted.current ? 300 : 0);
    mounted.current = true;
    return () => { clearTimeout(timer); controller.current?.abort(); };
  }, [key, reload]);
  return { ...result, loading, error, reload };
}
