'use client';

import { useState, ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Trash2, Edit2, Eye, MoreHorizontal } from 'lucide-react';

// --- StatusBadge ---
export function StatusBadge({ status, labels }: { status: string; labels?: Record<string, string> }) {
  const defaultLabels: Record<string, string> = {
    active: 'Hoạt động', inactive: 'Ẩn', sold: 'Đã bán', unread: 'Chưa đọc', read: 'Đã đọc', replied: 'Đã trả lời',
    published: 'Đã đăng', draft: 'Nháp', blocked: 'Khóa',
  };
  const colorMap: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    sold: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    unread: 'bg-red-500/10 text-red-600 border-red-500/20',
    read: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    replied: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    published: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    blocked: 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  const label = labels?.[status] || defaultLabels[status] || status;
  const color = colorMap[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' || status === 'read' || status === 'published' ? 'bg-emerald-500' : status === 'unread' || status === 'blocked' ? 'bg-red-500' : status === 'sold' || status === 'replied' ? 'bg-blue-500' : status === 'draft' ? 'bg-amber-500' : 'bg-gray-400'}`} />
      {label}
    </span>
  );
}

// --- Modal ---
export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  if (!open) return null;
  const sizeClass = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className={`relative w-full ${sizeClass} bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--border-color)] animate-scaleIn max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--muted-fg)]">✕</button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// --- ConfirmDialog ---
export function ConfirmDialog({ open, onClose, onConfirm, title, message }: { open: boolean; onClose: () => void; onConfirm: () => void; title?: string; message?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--border-color)] p-6 animate-scaleIn text-center" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title || 'Xác nhận xóa'}</h3>
        <p className="text-sm text-[var(--muted-fg)] mb-6">{message || 'Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.'}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium hover:bg-[var(--muted)] transition-colors">Hủy</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Xóa</button>
        </div>
      </div>
    </div>
  );
}

// --- StatsCard ---
export function StatsCard({ title, value, icon, trend, trendLabel, color = 'red' }: { title: string; value: string | number; icon: ReactNode; trend?: number; trendLabel?: string; color?: 'red' | 'blue' | 'green' | 'amber' }) {
  const gradients = {
    red: 'from-red-500 to-rose-600',
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mb-1">{typeof value === 'number' ? value.toLocaleString('vi-VN') : value}</p>
      <p className="text-sm text-[var(--muted-fg)]">{title}</p>
    </div>
  );
}

// --- PageHeader ---
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--muted-fg)] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// --- DataTable ---
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  searchPlaceholder?: string;
  searchFields?: string[];
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns, data, onEdit, onDelete, onView, searchPlaceholder, searchFields, actions, emptyMessage
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Filter
  let filtered = data;
  if (search && searchFields) {
    const q = search.toLowerCase();
    filtered = data.filter(item =>
      searchFields.some(f => String(item[f] || '').toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }

  // Paginate
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
      {/* Search bar */}
      {searchPlaceholder && (
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
            <input
              type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm transition-colors"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider" style={col.width ? { width: col.width } : {}}>
                  {col.sortable ? (
                    <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors">
                      {col.label}
                      {sortKey === col.key ? (sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ChevronDown className="w-3.5 h-3.5 opacity-30" />}
                    </button>
                  ) : col.label}
                </th>
              ))}
              {(onEdit || onDelete || onView || actions) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider w-32">Hành động</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-sm text-[var(--muted-fg)]">
                  {emptyMessage || 'Không có dữ liệu'}
                </td>
              </tr>
            ) : (
              paginated.map((item, i) => (
                <tr key={i} className="border-b border-[var(--border-color)] last:border-0">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm">
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView || actions) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions ? actions(item) : (
                          <>
                            {onView && <button onClick={() => onView(item)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[var(--muted-fg)] hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>}
                            {onEdit && <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-[var(--muted-fg)] hover:text-amber-600 transition-colors"><Edit2 className="w-4 h-4" /></button>}
                            {onDelete && <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--muted-fg)] hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--muted-fg)]">Hiển thị {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} / {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-red-600 text-white' : 'hover:bg-[var(--muted)]'}`}>
                  {p}
                </button>
              );
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- FormField ---
export function FormField({ label, required, children, error }: { label: string; required?: boolean; children: ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// --- Input ---
export function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm transition-colors ${props.className || ''}`} />;
}

// --- Textarea ---
export function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm transition-colors resize-y ${props.className || ''}`} />;
}

// --- Select ---
export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select {...props} className={`w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm transition-colors ${props.className || ''}`}>{children}</select>;
}

// --- Button ---
export function Button({ variant = 'primary', size = 'md', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; children: ReactNode }) {
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20',
    secondary: 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border-color)] border border-[var(--border-color)]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${props.className || ''}`}>
      {children}
    </button>
  );
}
