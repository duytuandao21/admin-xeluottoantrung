'use client';

import { useState } from 'react';
import { Car } from 'lucide-react';

type ProductThumbnailProps = {
  images?: string[];
  size?: 'sm' | 'md';
};

export default function ProductThumbnail({ images, size = 'md' }: ProductThumbnailProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = images?.find(image => image && image !== '/placeholder-car.jpg' && image !== failedSource);

  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--muted)] ${size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'}`}>
      {source ? (
        <img src={source} alt="" onError={() => setFailedSource(source)} className="h-full w-full object-cover" />
      ) : (
        <Car aria-hidden="true" className={`${size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} text-[var(--muted-fg)]`} />
      )}
    </span>
  );
}
