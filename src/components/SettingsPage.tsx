'use client';
import { ReactNode, useState } from 'react';
import { PageHeader, Button, FormField, Input, Textarea, Select } from '@/components/ui';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'file' | 'color' | 'url' | 'select';
  defaultValue?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  hint?: string;
}

export default function SettingsPage({ title, subtitle, fields, children }: { title: string; subtitle?: string; fields: SettingsField[]; children?: ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} actions={
        <Button size="sm" onClick={() => toast.success('Đã lưu thay đổi thành công!')}><Save className="w-4 h-4" /> Lưu thay đổi</Button>
      } />
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map(field => (
            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <FormField label={field.label}>
                {field.type === 'textarea' ? (
                  <Textarea defaultValue={field.defaultValue} placeholder={field.placeholder} rows={4} />
                ) : field.type === 'select' ? (
                  <Select defaultValue={field.defaultValue}>
                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                ) : field.type === 'file' ? (
                  <div>
                    <Input type="file" accept="image/*" />
                    {field.hint && <p className="text-xs text-[var(--muted-fg)] mt-1">{field.hint}</p>}
                  </div>
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue={field.defaultValue || '#dc2626'} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                    <Input defaultValue={field.defaultValue || '#dc2626'} placeholder="#dc2626" className="flex-1" />
                  </div>
                ) : (
                  <Input type={field.type || 'text'} defaultValue={field.defaultValue} placeholder={field.placeholder} />
                )}
              </FormField>
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
