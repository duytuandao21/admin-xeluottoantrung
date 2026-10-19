'use client';
import { useEffect, useState } from 'react';
import { resourceRows } from './resources';
import { toast } from 'sonner';

export function useResourceRows<T>(route: string): T[] {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    let live = true;
    const load = async () => {
      const data = await resourceRows(route);
      if (live) setRows(data as T[]);
    };
    void load().catch(failure => { if (live) toast.error(failure instanceof Error ? failure.message : 'Không thể tải danh mục.'); });
    return () => { live = false; };
  }, [route]);
  return rows;
}
