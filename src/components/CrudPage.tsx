'use client';

import { useState, ReactNode } from 'react';
import { PageHeader, DataTable, Modal, ConfirmDialog, FormField, Input, Textarea, Select, Button, StatusBadge } from '@/components/ui';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'color';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

interface CrudPageProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: { key: string; label: string; sortable?: boolean; render?: (item: T) => ReactNode; width?: string }[];
  formFields: FieldConfig[];
  searchPlaceholder?: string;
  searchFields?: string[];
  idField?: string;
  nameField?: string;
}

export default function CrudPage<T extends Record<string, unknown>>({
  title, subtitle, data: initialData, columns, formFields, searchPlaceholder, searchFields, idField = 'id', nameField = 'name'
}: CrudPageProps<T>) {
  const [data, setData] = useState(initialData);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<T | null>(null);

  const handleDelete = () => {
    if (deleteItem) {
      setData(prev => prev.filter(item => item[idField] !== deleteItem[idField]));
      toast.success('Đã xóa thành công!');
      setDeleteItem(null);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const formDataObj: Record<string, unknown> = {};
    formFields.forEach(f => {
      const val = form.get(f.name);
      formDataObj[f.name] = f.type === 'number' ? Number(val) : val;
    });

    if (editItem) {
      setData(prev => prev.map(item =>
        item[idField] === editItem[idField] ? { ...item, ...formDataObj } : item
      ));
      toast.success('Đã cập nhật thành công!');
    } else {
      const maxId = data.length > 0 ? Math.max(...data.map(d => Number(d[idField]) || 0)) : 0;
      const newItem = { ...formDataObj, [idField]: maxId + 1, status: 'active', order: data.length + 1 } as T;
      setData(prev => [newItem, ...prev]);
      toast.success('Đã thêm mới thành công!');
    }
    setEditItem(null);
    setShowAdd(false);
  };

  const isOpen = showAdd || !!editItem;

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle || `${data.length} mục`} actions={
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Thêm mới</Button>
      } />

      <DataTable
        columns={columns}
        data={data as unknown as Record<string, unknown>[]}
        searchPlaceholder={searchPlaceholder}
        searchFields={searchFields}
        onEdit={(item) => setEditItem(item as unknown as T)}
        onDelete={(item) => setDeleteItem(item as unknown as T)}
      />

      <Modal open={isOpen} onClose={() => { setEditItem(null); setShowAdd(false); }} title={editItem ? `Sửa ${title.toLowerCase()}` : `Thêm ${title.toLowerCase()}`} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map(field => (
              <FormField key={field.name} label={field.label} required={field.required}>
                {field.type === 'textarea' ? (
                  <Textarea name={field.name} defaultValue={editItem ? String(editItem[field.name] ?? '') : ''} rows={3} placeholder={field.placeholder} required={field.required} />
                ) : field.type === 'select' ? (
                  <Select name={field.name} defaultValue={editItem ? String(editItem[field.name] ?? '') : ''} required={field.required}>
                    <option value="">-- Chọn --</option>
                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                ) : (
                  <Input name={field.name} type={field.type || 'text'} defaultValue={editItem ? String(editItem[field.name] ?? '') : ''} placeholder={field.placeholder} required={field.required} />
                )}
              </FormField>
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
