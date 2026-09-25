'use client';
import { useEffect, useState } from 'react';
import { listResource } from './resources';

export function useResourceRows<T>(route: string): T[] {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    let live = true;
    const load = async () => {
      const first = await listResource(route, 1);
      const data = [...first.data];
      for (let page = 2; page <= first.meta.totalPages; page++) data.push(...(await listResource(route, page)).data);
      if (live) setRows(data as T[]);
    };
    void load().catch(() => { if (live) setRows([]); });
    return () => { live = false; };
  }, [route]);
  return rows;
}
