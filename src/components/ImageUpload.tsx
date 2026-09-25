'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

type Preview = { file: File; url: string };

interface ImageUploadProps {
  name: string;
  existing?: string | string[];
  multiple?: boolean;
  maxFiles?: number;
  required?: boolean;
  hint?: string;
}

export default function ImageUpload({ name, existing, multiple = false, maxFiles = 5, required = false, hint }: ImageUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [removedExisting, setRemovedExisting] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const existingImages = (Array.isArray(existing) ? existing : existing ? [existing] : []).filter(Boolean);
  const visibleExisting = existingImages.map((src, index) => ({ src, index })).filter(image => !removedExisting.includes(image.index));

  useEffect(() => () => {
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const syncInput = (files: File[]) => {
    const transfer = new DataTransfer();
    files.forEach(file => transfer.items.add(file));
    if (inputRef.current) inputRef.current.files = transfer.files;
  };

  const updateFiles = (files: File[]) => {
    syncInput(files);
    setPreviews(files.map(file => ({ file, url: URL.createObjectURL(file) })));
  };

  const addFiles = (incoming: FileList | File[]) => {
    const selected = Array.from(incoming);
    if (!selected.length) return;
    if (selected.some(file => !['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/vnd.microsoft.icon', 'image/x-icon'].includes(file.type))) {
      syncInput(previews.map(preview => preview.file));
      setError('Vui lòng chọn tệp hình ảnh.');
      return;
    }
    const files = multiple ? [...previews.map(preview => preview.file), ...selected] : selected.slice(0, 1);
    if (files.length + (multiple ? visibleExisting.length : 0) > (multiple ? maxFiles : 1)) {
      syncInput(previews.map(preview => preview.file));
      setError(`Chỉ được chọn tối đa ${maxFiles} ảnh.`);
      return;
    }
    setError('');
    updateFiles(files);
  };

  const removeSelected = (index: number) => {
    updateFiles(previews.filter((_, selectedIndex) => selectedIndex !== index).map(preview => preview.file));
    setError('');
  };

  return (
    <div className="min-w-0 space-y-2.5">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/vnd.microsoft.icon,image/x-icon,.ico"
        multiple={multiple}
        required={required && !visibleExisting.length && !previews.length}
        tabIndex={-1}
        className="sr-only"
        onChange={event => addFiles(event.target.files || [])}
      />
      <label
        htmlFor={id}
        tabIndex={0}
        role="button"
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={event => { event.preventDefault(); setDragging(true); }}
        onDragLeave={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={event => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${dragging ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-[var(--border-color)] bg-[var(--muted)] hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10'}`}
      >
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40"><ImagePlus className="h-6 w-6" aria-hidden="true" /></span>
        <span className="text-base font-semibold text-[var(--foreground)]">Chọn ảnh hoặc kéo thả vào đây</span>
        <span className="mt-1 text-sm text-[var(--muted-fg)]">{multiple ? `Có thể chọn nhiều ảnh (tối đa ${maxFiles})` : 'PNG, JPG, WebP, AVIF hoặc ICO'}</span>
      </label>
      {hint && <p className="text-xs text-[var(--muted-fg)]">{hint}</p>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      {(visibleExisting.length > 0 || previews.length > 0) && (
        <div className="space-y-2" aria-live="polite">
          {visibleExisting.map(({ src, index }) => (
            <div key={`existing-${index}`} className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-2">
              <img src={src} alt="Ảnh hiện tại" className="h-24 w-28 shrink-0 rounded-lg bg-[var(--muted)] object-contain" />
              <span className="min-w-0 flex-1 truncate text-base text-[var(--muted-fg)]">Ảnh hiện tại {multiple ? index + 1 : ''}</span>
              <button type="button" onClick={() => setRemovedExisting(current => [...current, index])} aria-label={`Bỏ ảnh hiện tại ${index + 1}`} className="rounded-lg p-2 text-[var(--muted-fg)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"><X className="h-4 w-4" /></button>
            </div>
          ))}
          {previews.map((preview, index) => (
            <div key={preview.url} className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-2">
              <img src={preview.url} alt={`Xem trước ${preview.file.name}`} className="h-24 w-28 shrink-0 rounded-lg bg-[var(--muted)] object-contain" />
              <span className="min-w-0 flex-1 truncate text-base" title={preview.file.name}>{preview.file.name}<span className="block text-sm text-[var(--muted-fg)]">{preview.file.size >= 1024 * 1024 ? `${(preview.file.size / (1024 * 1024)).toFixed(1)} MB` : `${(preview.file.size / 1024).toFixed(0)} KB`}</span></span>
              <button type="button" onClick={() => removeSelected(index)} aria-label={`Bỏ ảnh ${preview.file.name}`} className="rounded-lg p-2 text-[var(--muted-fg)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
      {removedExisting.map(index => <input key={index} type="hidden" name={multiple ? `${name}__removeIndex` : `${name}__remove`} value={multiple ? index : '1'} />)}
    </div>
  );
}
