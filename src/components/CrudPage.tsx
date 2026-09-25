'use client';

import { useCallback, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { slugify } from '@/lib/slug';
import { deleteResource, listResource, saveResource } from '@/lib/api/resources';
import { uploadAsset } from '@/lib/api/media';
import { PageHeader, DataTable, Modal, ConfirmDialog, FormField, Input, Textarea, Select, Button, type Column } from '@/components/ui';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ImageUpload';
import ColorCodeInput from '@/components/ColorCodeInput';
import { isVietnamesePhone, normalizeVietnamesePhone } from '@/lib/phone';
import { formatDate, parseDateInput } from '@/lib/date';
import RichTextEditor from '@/components/RichTextEditor';
import { hasRichTextContent, sanitizeRichText } from '@/lib/rich-text';

interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'richtext' | 'select' | 'color' | 'image' | 'url' | 'email' | 'date' | 'checkbox' | 'tel';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
  min?: number;
  max?: number;
}

interface CrudPageProps<T> {
  title: string;
  subtitle?: string;
  columns: { key: string; label: string; sortable?: boolean; render?: (item: T) => ReactNode; width?: string }[];
  formFields: FieldConfig[];
  searchPlaceholder?: string;
  searchFields?: string[];
  idField?: string;
  nameField?: string;
  storageKey?: string;
}

export default function CrudPage<T extends Record<string, unknown>>({
  title, subtitle, columns, formFields, searchPlaceholder, searchFields, idField = 'id', nameField = 'name', storageKey
}: CrudPageProps<T>) {
  const pathname = usePathname();
  const route = storageKey || pathname;
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await listResource(route, page, search); setData(result.data as T[]); setTotal(result.meta.total); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể tải dữ liệu.'); setData([]); }
    finally { setLoading(false); }
  }, [route, page, search]);
  useEffect(() => { queueMicrotask(() => void reload()); }, [reload]);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<T | null>(null);
  const [slugPreview, setSlugPreview] = useState('');
  const editableFields = formFields.filter(field => field.name !== 'order' && field.name !== idField);
  const hasSlug = editableFields.some(field => field.name === 'slug');
  const slugSourceField = editableFields.some(field => field.name === nameField) ? nameField : 'title';

  const handleDelete = async () => {
    if (deleteItem) {
      try { await deleteResource(route, deleteItem); toast.success('Đã xóa thành công!'); setDeleteItem(null); await reload(); }
      catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể xóa.'); }
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const formDataObj: Record<string, unknown> = {};
    try {
      for (const field of editableFields) {
        const val = form.get(field.name);
        if (field.type === 'image') {
          if (val instanceof File && val.size) formDataObj[field.name] = await uploadAsset(val);
          else formDataObj[field.name] = form.has(`${field.name}__remove`) ? '' : editItem?.[field.name] || '';
        } else if (field.type === 'checkbox') {
          formDataObj[field.name] = form.has(field.name);
        } else if (field.type === 'richtext') {
          const html = sanitizeRichText(String(val || ''));
          if (field.required && !hasRichTextContent(html)) throw new Error(`Vui lòng nhập ${field.label.toLowerCase()}.`);
          formDataObj[field.name] = html;
        } else if (field.type === 'date') {
          formDataObj[field.name] = parseDateInput(String(val || ''));
        } else if (field.type === 'tel') {
          const phone = String(val || '');
          if (phone || field.required) {
            if (!isVietnamesePhone(phone)) throw new Error('Số điện thoại không hợp lệ. Nhập số di động 10 số hoặc số bàn 10–11 số của Việt Nam.');
            formDataObj[field.name] = normalizeVietnamesePhone(phone);
          } else formDataObj[field.name] = '';
        } else if (field.type === 'number') {
          const number = val === '' || val === null ? 0 : Number(val);
          if (field.name === 'rating' && (!Number.isInteger(number) || number < 1 || number > 5)) throw new Error('Đánh giá phải là số nguyên từ 1 đến 5.');
          formDataObj[field.name] = number;
        } else {
          formDataObj[field.name] = String(val || (field.name === 'status' ? field.options?.[0]?.value || '' : '')).trim();
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu ảnh.');
      return;
    }

    if (hasSlug) {
      formDataObj.slug = editItem?.slug || slugify(String(formDataObj[slugSourceField] || ''));
      if (!formDataObj.slug) {
        toast.error('Tên hoặc tiêu đề cần có chữ hay số để tạo slug.');
        return;
      }
    }

    try { await saveResource(route, formDataObj, editItem); toast.success(editItem ? 'Đã cập nhật thành công!' : 'Đã thêm mới thành công!'); await reload(); }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể lưu dữ liệu.'); return; }
    setEditItem(null);
    setShowAdd(false);
  };

  const isOpen = showAdd || !!editItem;
  const toggleBoolean = async (item: T, field: string) => {
    try { await saveResource(route, { [field]: !Boolean(item[field]) }, item); await reload(); }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể cập nhật.'); }
  };
  const listColumns = columns.filter(column => column.key !== 'order' || column.label === 'STT').map(column => ['featured', 'installment'].includes(column.key) ? {
    ...column,
    render: (item: T) => <button type="button" role="switch" aria-checked={Boolean(item[column.key])} aria-label={`${column.label}: ${Boolean(item[column.key]) ? 'Bật' : 'Tắt'}`} onClick={() => toggleBoolean(item, column.key)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${item[column.key] ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${item[column.key] ? 'translate-x-6' : 'translate-x-1'}`} /></button>,
  } : column);

  return (
    <div className="space-y-6">
      {!isOpen && <><PageHeader title={title} subtitle={subtitle || `${total} mục`} actions={
        <Button size="sm" onClick={() => { setSlugPreview(''); setShowAdd(true); }}><Plus className="w-4 h-4" /> Thêm mới</Button>
      } />

      {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error} <button type="button" className="underline" onClick={() => void reload()}>Thử lại</button></div>}
      <DataTable
        columns={listColumns as Column<T>[]}
        data={data}
        emptyMessage={loading ? 'Đang tải dữ liệu...' : undefined}
        remote={{ page, total, perPage: 10, search, onPage: setPage, onSearch: value => { setPage(1); setSearch(value); } }}
        searchPlaceholder={searchPlaceholder}
        searchFields={searchFields}
        onEdit={(item) => { setSlugPreview(slugify(String(item[slugSourceField] || ''))); setEditItem(item as T); }}
        onDelete={(item) => setDeleteItem(item as T)}
      /></>}

      <Modal open={isOpen} onClose={() => { setEditItem(null); setShowAdd(false); }} title={editItem ? `Sửa ${title.toLowerCase()}` : `Thêm ${title.toLowerCase()}`} size="md">
        <form key={editItem ? String(editItem[idField]) : 'new'} onSubmit={handleSave} className="space-y-7">
          <div className="border-b border-[var(--border-color)] pb-5"><h2 className="text-xl font-semibold">Thông tin {title.toLowerCase()}</h2><p className="mt-1 text-sm text-[var(--muted-fg)]">Các trường có dấu * là bắt buộc.</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {editableFields.map(field => (
              <div key={field.name} className={field.type === 'textarea' || field.type === 'richtext' || field.type === 'image' ? 'lg:col-span-2' : ''}><FormField label={field.label} required={field.required}>
                {field.type === 'richtext' ? (
                  <RichTextEditor name={field.name} defaultValue={editItem ? String(editItem[field.name] ?? '') : String(field.defaultValue ?? '')} placeholder={field.placeholder} required={field.required} />
                ) : field.type === 'textarea' ? (
                  <Textarea name={field.name} defaultValue={editItem ? String(editItem[field.name] ?? '') : String(field.defaultValue ?? '')} rows={3} placeholder={field.placeholder} required={field.required} />
                ) : field.type === 'select' ? (
                  <Select name={field.name} defaultValue={editItem ? String(editItem[field.name] ?? '') : String(field.defaultValue ?? (field.name === 'status' ? field.options?.[0]?.value || '' : ''))} required={field.required}>
                    <option value="">-- Chọn --</option>
                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                ) : field.type === 'image' ? (
                  <ImageUpload name={field.name} existing={String(editItem?.[field.name] || '')} required={field.required} />
                ) : field.type === 'color' ? (
                  <ColorCodeInput name={field.name} defaultValue={String(editItem?.[field.name] || field.defaultValue || '')} colorName={String(editItem?.title || '')} />
                ) : field.type === 'date' ? (
                  <Input name={field.name} type="text" defaultValue={formatDate(String(editItem?.[field.name] ?? field.defaultValue ?? ''))} placeholder="dd/mm/yyyy" inputMode="numeric" maxLength={10} pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" required={field.required} />
                ) : field.name === 'slug' ? (
                  <Input value={slugPreview} readOnly aria-label="Slug tự tạo" placeholder="Tự tạo từ tên hoặc tiêu đề" className="cursor-default bg-[var(--muted)] text-[var(--muted-fg)]" />
                ) : field.type === 'checkbox' ? (
                  <input name={field.name} type="checkbox" defaultChecked={Boolean(editItem ? editItem[field.name] : field.defaultValue)} className="h-4 w-4 accent-red-600" />
                ) : (
                  <><Input name={field.name} type={field.type || 'text'} defaultValue={editItem ? String(editItem[field.name] ?? '') : String(field.defaultValue ?? '')} placeholder={field.placeholder} required={field.required} min={field.name === 'rating' ? 1 : field.min} max={field.name === 'rating' ? 5 : field.max} step={field.name === 'rating' ? 1 : undefined} inputMode={field.type === 'tel' ? 'tel' : undefined} maxLength={field.type === 'tel' ? 20 : undefined} onChange={hasSlug && field.name === slugSourceField ? event => setSlugPreview(slugify(event.currentTarget.value)) : undefined} onBlur={field.type === 'tel' ? event => { event.currentTarget.value = normalizeVietnamesePhone(event.currentTarget.value); } : undefined} />{field.type === 'tel' && <p className="mt-2 text-sm text-[var(--muted-fg)]">Nhập số di động (03, 05, 07, 08, 09) hoặc số điện thoại bàn; chấp nhận +84.</p>}</>
                )}
              </FormField></div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <Button type="button" variant="secondary" onClick={() => { setEditItem(null); setShowAdd(false); }}>Hủy</Button>
            <Button type="submit">{editItem ? 'Cập nhật' : 'Thêm mới'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} message={`Bạn có chắc muốn xóa "${deleteItem?.[nameField] || ''}"?`} />
    </div>
  );
}
