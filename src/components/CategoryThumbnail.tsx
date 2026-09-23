'use client';

import { useState } from 'react';
import { CarFront, Factory } from 'lucide-react';

export default function CategoryThumbnail({ src, kind }: { src?: string; kind: 'brand' | 'model' }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = Boolean(src && src !== failedSrc && !src.startsWith('/placeholder-'));
  const Icon = kind === 'brand' ? Factory : CarFront;

  return (
    <span className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-color)] ${kind === 'brand' ? 'bg-white' : 'bg-[var(--muted)]'}`} title={hasImage ? undefined : 'Chưa có hình ảnh'}>
      {hasImage ? (
        <img src={src} alt="" onError={() => setFailedSrc(src || null)} className={`h-full w-full ${kind === 'brand' ? 'object-contain p-1.5' : 'object-cover'}`} />
      ) : (
        <Icon aria-hidden="true" className="h-6 w-6 text-[var(--muted-fg)]" />
      )}
    </span>
  );
}
