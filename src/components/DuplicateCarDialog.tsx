'use client';

import { useEffect, useRef } from 'react';
import { CopyPlus } from 'lucide-react';
import { Button } from './ui';

export default function DuplicateCarDialog({ car, onCancel, onConfirm }: {
  car: { name: string; slug: string } | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (car && !element.open) { element.showModal(); cancel.current?.focus(); }
    else if (!car && element.open) element.close();
  }, [car]);

  return <dialog ref={dialog} aria-labelledby="duplicate-car-title" aria-describedby="duplicate-car-description"
    onCancel={event => { event.preventDefault(); onCancel(); }}
    className="m-auto max-h-[90dvh] max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 text-[var(--foreground)] shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm" style={{ width: 'calc(100% - 2rem)' }}>
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700"><CopyPlus className="h-6 w-6" /></div>
    <h2 id="duplicate-car-title" className="mb-3 text-xl font-bold">Xác nhận thêm xe trùng tên</h2>
    <div id="duplicate-car-description" className="space-y-3 break-words text-sm leading-6">
      <p>Đường dẫn từ tên xe <strong>{car?.name}</strong> đã được sử dụng bởi xe hoặc nội dung khác. Xe đã bán, đã ẩn hoặc đã xóa vẫn giữ đường dẫn cũ.</p>
      <p className="break-all rounded-lg bg-[var(--muted)] px-3 py-2">/{car?.slug}</p>
      <p>Nếu tiếp tục, hệ thống sẽ giữ tên xe và tự thêm hậu tố <strong>-2, -3, …</strong> để tạo đường dẫn riêng. Xe cũ không bị thay đổi.</p>
      <p>Bạn cũng có thể quay lại đổi tên. Thông tin và ảnh đã chọn sẽ được giữ nguyên.</p>
    </div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button ref={cancel} type="button" onClick={onCancel} className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--muted)]">Quay lại đổi tên</button>
      <Button type="button" onClick={onConfirm}>Xác nhận thêm xe</Button>
    </div>
  </dialog>;
}
