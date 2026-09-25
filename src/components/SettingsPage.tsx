'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PageHeader, Button, FormField, Input, Textarea, Select } from '@/components/ui';
import { ApiError, api, json, query } from '@/lib/api/client';
import { uploadAsset } from '@/lib/api/media';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import { sanitizeRichText } from '@/lib/rich-text';

interface SettingsField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'richtext' | 'number' | 'file' | 'color' | 'url' | 'select' | 'email';
  defaultValue?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  hint?: string;
}

export default function SettingsPage({ title, subtitle, fields, children }: { title: string; subtitle?: string; fields: SettingsField[]; children?: ReactNode }) {
  const pathname = usePathname();
  const defaults = Object.fromEntries(fields.map(field => [field.name, '']));
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const isSeo = pathname.startsWith('/seo/');
  const group = pathname.slice(1).replaceAll('/', '-');
  const seoRoute: Record<string, string> = { '/seo/tin-tuc': '/tin-tuc', '/seo/mua-xe': '/mua-xe', '/seo/danh-gia-khach-hang': '/danh-gia-khach-hang', '/seo/cau-hoi-thuong-gap': '/cau-hoi-thuong-gap' };
  const load = useCallback(async () => {
    setLoaded(false); setError('');
    try {
      if (isSeo) {
        const item = await api<Record<string, unknown>>(`/admin/seo/by-route${query({ route: seoRoute[pathname] || pathname })}`).catch(failure => { if (failure instanceof ApiError && failure.status === 404) return null; throw failure; });
        setValues({ ...defaults, ...(item ? { title: String(item.metaTitle || ''), description: String(item.metaDescription || ''), keywords: String(item.keywords || ''), ogImage: String(item.ogImageUrl || ''), canonical: String(item.canonicalUrl || '') } : {}) });
      } else {
        const rows = await api<{ key: string; value: string }[]>(`/admin/site-settings/${group}`);
        setValues({ ...defaults, ...Object.fromEntries(rows.map(row => [row.key, row.value])) });
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể tải dữ liệu.'); }
    finally { setLoaded(true); }
  // Defaults are based on static page fields; pathname controls the fetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, group, isSeo]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updated = { ...values };
    try {
      for (const field of fields) {
        const entry = form.get(field.name);
        if (field.type === 'file') {
          if (entry instanceof File && entry.size) updated[field.name] = await uploadAsset(entry);
          else if (form.has(`${field.name}__remove`)) updated[field.name] = '';
        } else if (field.type === 'richtext') {
          updated[field.name] = sanitizeRichText(String(entry ?? ''));
        } else {
          updated[field.name] = String(entry ?? '').trim();
        }
      }
      if (isSeo) {
        await api('/admin/seo', json('PUT', { routePath: seoRoute[pathname] || pathname, metaTitle: updated.title || null, metaDescription: updated.description || null, keywords: updated.keywords || null, ogImageUrl: updated.ogImage || null, canonicalUrl: updated.canonical || null }));
      } else {
        await Promise.all(fields.map(field => api(`/admin/site-settings/${group}/${field.name}`, json('PUT', { value: updated[field.name] || '', valueType: field.type === 'number' && updated[field.name] ? 'number' : 'text' }))));
      }
      setValues(updated);
      toast.success('Đã lưu thay đổi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu thay đổi.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} actions={
        <Button size="sm" type="submit" form="settings-form"><Save className="w-4 h-4" /> Lưu thay đổi</Button>
      } />
      {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error} <button className="underline" onClick={() => void load()}>Thử lại</button></div>}
      <form id="settings-form" onSubmit={handleSave} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
        {loaded && <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map(field => (
            <div key={field.name} className={field.type === 'textarea' || field.type === 'richtext' || field.type === 'file' ? 'md:col-span-2' : ''}>
              <FormField label={field.label}>
                {field.type === 'richtext' ? (
                  <RichTextEditor name={field.name} defaultValue={values[field.name] ?? ''} placeholder={field.placeholder} />
                ) : field.type === 'textarea' ? (
                  <Textarea name={field.name} defaultValue={values[field.name] ?? ''} placeholder={field.placeholder} rows={4} />
                ) : field.type === 'select' ? (
                  <Select name={field.name} defaultValue={values[field.name] ?? ''}>
                    {field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                ) : field.type === 'file' ? (
                  <ImageUpload key={`${field.name}:${values[field.name]}`} name={field.name} existing={values[field.name]} hint={field.hint} />
                ) : field.type === 'color' ? (
                  <Input name={field.name} type="color" defaultValue={values[field.name] || '#dc2626'} className="h-11 cursor-pointer" />
                ) : (
                  <Input name={field.name} type={field.type || 'text'} defaultValue={values[field.name] ?? ''} placeholder={field.placeholder} />
                )}
              </FormField>
            </div>
          ))}
        </div>}
        {children}
      </form>
    </div>
  );
}
