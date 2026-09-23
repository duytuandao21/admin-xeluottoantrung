'use client';

import { useEffect, useState } from 'react';

const prefix = 'xeluottoantrung-admin:v1:';

export function useLocalStore<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(prefix + key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved !== null) setValue(JSON.parse(saved) as T);
    } catch {
      // Invalid or unavailable browser storage falls back to the supplied data.
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      const serialized = JSON.stringify(value);
      if (window.localStorage.getItem(prefix + key) !== serialized) {
        window.localStorage.setItem(prefix + key, serialized);
        window.dispatchEvent(new CustomEvent('admin-store-change', { detail: key }));
      }
    } catch {
      // The caller can still edit during this session if browser storage is full.
    }
  }, [key, loaded, value]);

  useEffect(() => {
    const refresh = (event: Event) => {
      if (event instanceof CustomEvent && event.detail !== key) return;
      if (event instanceof StorageEvent && event.key !== prefix + key) return;
      try {
        const saved = window.localStorage.getItem(prefix + key);
        if (saved !== null) setValue(previous => JSON.stringify(previous) === saved ? previous : JSON.parse(saved) as T);
      } catch { /* Keep the current value if storage is unavailable. */ }
    };
    window.addEventListener('admin-store-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('admin-store-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [key]);

  return [value, setValue, loaded] as const;
}

export function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Vui lòng chọn tập tin ảnh.'));
    if (file.size > 1024 * 1024) return reject(new Error('Ảnh phải nhỏ hơn 1 MB để lưu trên trình duyệt.'));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không thể đọc ảnh.'));
    reader.readAsDataURL(file);
  });
}

export function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
