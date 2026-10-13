'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, LoaderCircle, type LucideIcon } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { api } from '@/lib/api/client';
export const vnd = (value: number) => `${value.toLocaleString('vi-VN')} ₫`;
export function useOwnershipData<T>(path: string | null, revision = 0) {
  const key = `${path}:${revision}`;
  const [state, setState] = useState<{ key: string; data: T | null; error: string }>({ key: '', data: null, error: '' });
  useEffect(() => {
    if (!path) return;
    const abort = new AbortController();
    api<T>(path, { signal: abort.signal }).then(data => { if (!abort.signal.aborted) setState({ key, data, error: '' }); }).catch(e => { if (!abort.signal.aborted) setState({ key, data: null, error: e instanceof Error ? e.message : 'Không tải được dữ liệu.' }); });
    return () => abort.abort();
  }, [path, key]);
  return { data: state.key === key ? state.data : null, error: state.key === key ? state.error : '', loading: !!path && state.key !== key };
}
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`tt-ownership-panel ${className}`}>{children}</section>; }
export function SectionHeading({ icon: Icon, title, description, actions }: { icon?: LucideIcon; title: string; description?: string; actions?: ReactNode }) {
  return <div className="tt-ownership-heading"><div className="tt-ownership-section-title">{Icon && <span className="tt-ownership-section-icon"><Icon size={22} aria-hidden="true" /></span>}<div><h2>{title}</h2>{description && <p className="tt-ownership-hint">{description}</p>}</div></div>{actions}</div>;
}
export function LoadState({ error, loading }: { error: string; loading: boolean }) { return <>{loading && <p role="status" className="tt-ownership-loading"><LoaderCircle size={18} aria-hidden="true" />Đang tải dữ liệu…</p>}{error && <p className="tt-ownership-error" role="alert"><AlertCircle size={20} aria-hidden="true" />{error}</p>}</>; }
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="tt-ownership-empty"><Inbox size={32} aria-hidden="true" /><h3>{title}</h3>{description && <p>{description}</p>}{action}</div>;
}
export function NumberField({ label, value, change, min = 0, max = 100000000, step = 1, hint }: { label: string; value: number; change: (n: number) => void; min?: number; max?: number; step?: number; hint?: string }) {
  const id = useId();
  return <label className="tt-ownership-field"><span id={`${id}-label`}>{label}</span><Input aria-labelledby={`${id}-label`} aria-describedby={hint ? `${id}-hint` : undefined} type="number" inputMode={step < 1 ? 'decimal' : 'numeric'} value={Number.isFinite(value) ? value : ''} min={min} max={max} step={step} required onChange={e => change(e.target.value === '' ? NaN : Number(e.target.value))} />{hint && <small id={`${id}-hint`}>{hint}</small>}</label>;
}
export function Pagination({ page, totalPages, change }: { page: number; totalPages: number; change: (n: number) => void }) { return <div className="tt-ownership-pagination"><span>Trang {page} / {Math.max(1, totalPages)}</span><div><Button type="button" size="sm" variant="secondary" disabled={page <= 1} onClick={() => change(page - 1)}><ChevronLeft size={16} aria-hidden="true" />Trước</Button><Button type="button" size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => change(page + 1)}>Sau<ChevronRight size={16} aria-hidden="true" /></Button></div></div>; }

/** Shares dirty state with the page and protects drafts on a browser reload. */
export function useDraftGuard(dirty: boolean, changed?: (dirty: boolean) => void) {
  useEffect(() => { changed?.(dirty); return () => changed?.(false); }, [dirty, changed]);
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', handler); return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}

export function ConfirmAction({ title, description, confirmLabel = 'Xác nhận', confirm, close }: { title: string; description: string; confirmLabel?: string; confirm: () => void; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = ref.current, previous = document.activeElement as HTMLElement | null; element?.showModal(); return () => { element?.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} className="tt-ownership-confirm" onCancel={e => { e.preventDefault(); close(); }}><div className="tt-ownership-section-icon"><AlertCircle size={24} aria-hidden="true" /></div><h2>{title}</h2><p>{description}</p><div className="tt-ownership-actions"><Button type="button" variant="secondary" onClick={close} autoFocus>Hủy</Button><Button type="button" onClick={() => { close(); confirm(); }}>{confirmLabel}</Button></div></dialog>;
}
