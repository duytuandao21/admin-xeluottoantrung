'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PageHeader, Button, FormField, Input, Textarea, Select } from '@/components/ui';
import { useLocalStore, readImage } from '@/lib/local-store';
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
  const defaults = Object.fromEntries(fields.map(field => [field.name, field.defaultValue || '']));
  const [values, setValues, loaded] = useLocalStore<Record<string, string>>(pathname, defaults);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updated = { ...values };
    try {
      for (const field of fields) {
        const entry = form.get(field.name);
        if (field.type === 'file') {
          if (entry instanceof File && entry.size) updated[field.name] = await readImage(entry);
          else if (form.has(`${field.name}__remove`)) updated[field.name] = '';
        } else if (field.type === 'richtext') {
          updated[field.name] = sanitizeRichText(String(entry ?? ''));
        } else {
          updated[field.name] = String(entry ?? '').trim();
        }
      }
      setValues(updated);
      toast.success('Đã lưu thay đổi trên trình duyệt này.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu thay đổi.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} actions={
        <Button size="sm" type="submit" form="settings-form"><Save className="w-4 h-4" /> Lưu thay đổi</Button>
      } />
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
