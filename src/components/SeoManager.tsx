'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button, ConfirmDialog, DataTable, FormField, Input, PageHeader, Select, Textarea } from '@/components/ui';
import ImageUpload from '@/components/ImageUpload';
import { api, json } from '@/lib/api/client';
import { uploadAsset } from '@/lib/api/media';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { emptySeo, normalizeSeoRoute, seoRouteAliases, seoSections, type SeoRecord } from '@/lib/seo';

const origin = 'https://xeluottoantrung.com';
const labelFor = (row: SeoRecord) => Object.values(seoSections).find(item => item.route === row.routePath)?.label || row.metaTitle?.split('|')[0].trim() || row.routePath;

export default function SeoManager({ initialRoute }: { initialRoute?: string }) {
  const { identity } = useAuth();
  const { setSidebarOpen } = useTheme();
  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) setSidebarOpen(false);
  }, [setSidebarOpen]);
  const canEdit = identity?.permissions.includes('seo.update') ?? false;
  const [rows, setRows] = useState<SeoRecord[]>([]);
  const [editor, setEditor] = useState<SeoRecord | null>(null);
  const [remove, setRemove] = useState<SeoRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let live = true;
    api<SeoRecord[]>('/admin/seo').then(items => {
      if (!live) return;
      const current = items.filter(item => !seoRouteAliases[item.routePath] || !items.some(other => other.routePath === seoRouteAliases[item.routePath]));
      setRows(current);
      if (initialRoute) setEditor(current.find(item => item.routePath === initialRoute) || emptySeo(initialRoute));
      setError('');
    }).catch(failure => { if (live) setError(failure instanceof Error ? failure.message : 'Không thể tải SEO.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [initialRoute, reload]);
  const deleteSeo = async () => {
    if (!remove || !canEdit || deleting) return;
    const route = remove.routePath;
    setDeleting(true);
    try {
      await api(`/admin/seo?${new URLSearchParams({ route })}`, { method: 'DELETE' });
      setRows(current => current.filter(row => row.routePath !== route));
      toast.success('Đã xóa SEO riêng. Trang dùng lại thông tin của nội dung.');
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể xóa SEO.'); }
    finally { setDeleting(false); }
  };
  if (loading) return <p>Đang tải cấu hình SEO...</p>;
  if (error) return <div role="alert" className="space-y-3"><p>{error}</p><Button onClick={() => { setLoading(true); setReload(value => value + 1); }}>Thử lại</Button></div>;
  if (editor) return <SeoEditor key={editor.routePath} record={editor} canEdit={canEdit} onBack={() => setEditor(null)} onSaved={item => {
    setRows(current => [...current.filter(row => row.routePath !== item.routePath), item].sort((a, b) => a.routePath.localeCompare(b.routePath)));
    setEditor(null);
  }} />;
  return <div className="space-y-5">
    <PageHeader title="Quản lý SEO" subtitle="Quản lý thông tin tìm kiếm và chia sẻ liên kết của từng trang trên website." actions={canEdit && <Button onClick={() => setEditor(emptySeo())}><Plus className="h-4 w-4" />Thêm đường dẫn</Button>} />
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 text-[var(--muted-fg)]">
      Có {rows.length} trang đã có SEO. Với xe, phụ kiện hoặc bài viết mới, thêm đường dẫn của trang để thiết lập SEO riêng.
    </div>
    <DataTable data={rows.map(row => ({ ...row, label: labelFor(row) }))} searchFields={['routePath', 'metaTitle', 'label']} searchPlaceholder="Tìm theo trang, tên xe, phụ kiện hoặc bài viết..." columns={[
      { key: 'label', label: 'Trang', render: row => <div className="min-w-0"><strong>{row.label}</strong><p className="mt-1 break-all text-sm text-[var(--muted-fg)]">{row.routePath}</p></div> },
      { key: 'metaTitle', label: 'Tiêu đề SEO', render: row => row.metaTitle || 'Dùng tên nội dung' },
      { key: 'robotsIndex', label: 'Lập chỉ mục', render: row => row.robotsIndex ? 'Cho phép' : 'Không cho phép' },
    ]} onEdit={row => setEditor(row)} onDelete={canEdit && !deleting ? row => setRemove(row) : undefined} emptyMessage="Chưa có cấu hình SEO. Thêm đường dẫn để bắt đầu." />
    <ConfirmDialog open={Boolean(remove)} onClose={() => setRemove(null)} onConfirm={() => void deleteSeo()} title="Xóa cấu hình SEO?" message={`Xóa SEO riêng của ${remove?.routePath || ''}. Trang sẽ dùng lại tiêu đề, mô tả và ảnh của nội dung hiện có.`} />
  </div>;
}

function SeoEditor({ record, canEdit, onBack, onSaved }: { record: SeoRecord; canEdit: boolean; onBack: () => void; onSaved: (record: SeoRecord) => void }) {
  const [values, setValues] = useState(record);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof SeoRecord, value: string | boolean) => setValues(current => ({ ...current, [key]: value }));
  const text = (key: keyof SeoRecord) => String(values[key] ?? '');
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || saving) return;
    const form = new FormData(event.currentTarget);
    const routePath = normalizeSeoRoute(values.routePath);
    setSaving(true);
    try {
      const payload = { routePath, metaTitle: values.metaTitle, metaDescription: values.metaDescription, keywords: values.keywords,
        ogTitle: values.ogTitle, ogDescription: values.ogDescription, ogImageUrl: values.ogImageUrl, canonicalUrl: values.canonicalUrl,
        robotsIndex: values.robotsIndex, robotsFollow: values.robotsFollow };
      const image = form.get('ogImage');
      if (image instanceof File && image.size) payload.ogImageUrl = await uploadAsset(image);
      else if (form.has('ogImage__remove') && values.ogImageUrl === record.ogImageUrl) payload.ogImageUrl = null;
      for (const key of ['metaTitle', 'metaDescription', 'keywords', 'ogTitle', 'ogDescription', 'ogImageUrl', 'canonicalUrl'] as const) payload[key] = payload[key]?.trim() || null;
      const saved = await api<SeoRecord>('/admin/seo', json('PUT', payload));
      toast.success('Đã lưu SEO. Website áp dụng khi tải lại trang.');
      onSaved(saved);
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể lưu SEO.'); }
    finally { setSaving(false); }
  };
  const field = (key: keyof SeoRecord, label: string, limit: number, multiline = false) => <FormField label={label}>
    {multiline ? <Textarea name={key} value={text(key)} onChange={event => set(key, event.target.value)} maxLength={limit} rows={3} />
      : <Input name={key} value={text(key)} onChange={event => set(key, event.target.value)} maxLength={limit} />}
    <p className="text-xs text-[var(--muted-fg)]">{text(key).length}/{limit} ký tự</p>
  </FormField>;
  return <div className="space-y-5">
    <PageHeader title={`SEO — ${record.routePath ? labelFor(record) : 'Thêm đường dẫn'}`} actions={<div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={onBack} disabled={saving}><ArrowLeft className="h-4 w-4" />Danh sách SEO</Button>
      {canEdit && <Button type="submit" form="seo-form" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>}
    </div>} />
    <form id="seo-form" onSubmit={save} className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6">
      <fieldset disabled={!canEdit || saving} className="min-w-0 space-y-6">
        <FormField label="Đường dẫn trên website" required>
          <Input name="routePath" value={values.routePath} onChange={event => set('routePath', event.target.value)} required readOnly={Boolean(record.id)} pattern="/(?:(?:[a-z0-9]|-)+/?)*" maxLength={300} placeholder="/san-pham hoặc /phu-kien-o-to/mã-phụ-kiện" />
          <p className="text-sm text-[var(--muted-fg)]">Nhập phần đường dẫn sau tên miền, không kèm bộ lọc hoặc dấu #.</p>
        </FormField>
        <section className="space-y-4"><h2 className="border-b border-[var(--border-color)] pb-2 text-lg font-semibold">Hiển thị trên công cụ tìm kiếm</h2>
          <p className="text-sm text-[var(--muted-fg)]">Để trống các trường nội dung để website dùng thông tin hiện có của trang.</p>
          {field('metaTitle', 'Tiêu đề SEO (Meta Title)', 160)}
          {field('metaDescription', 'Mô tả SEO (Meta Description)', 320, true)}
          {field('keywords', 'Từ khóa', 500, true)}
        </section>
        <section className="space-y-4"><h2 className="border-b border-[var(--border-color)] pb-2 text-lg font-semibold">Chia sẻ liên kết</h2>
          {field('ogTitle', 'Tiêu đề khi chia sẻ', 160)}
          {field('ogDescription', 'Mô tả khi chia sẻ', 320, true)}
          <FormField label="Ảnh khi chia sẻ"><ImageUpload name="ogImage" existing={record.ogImageUrl || undefined} hint="Nên dùng ảnh ngang, kích thước 1200 × 630 px." /></FormField>
          <FormField label="Hoặc dùng đường dẫn ảnh"><Input name="ogImageUrl" value={text('ogImageUrl')} onChange={event => set('ogImageUrl', event.target.value)} maxLength={2000} placeholder="https://... hoặc /upload/..." /></FormField>
        </section>
        <section className="space-y-4"><h2 className="border-b border-[var(--border-color)] pb-2 text-lg font-semibold">Đường dẫn chuẩn và lập chỉ mục</h2>
          <FormField label="Đường dẫn chuẩn (Canonical URL)"><Input type="url" name="canonicalUrl" value={text('canonicalUrl')} onChange={event => set('canonicalUrl', event.target.value)} maxLength={2000} placeholder={`${origin}${values.routePath || '/'}`} /></FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Cho phép lập chỉ mục"><Select name="robotsIndex" value={String(values.robotsIndex)} onChange={event => set('robotsIndex', event.target.value === 'true')}><option value="true">Cho phép</option><option value="false">Không cho phép (noindex)</option></Select></FormField>
            <FormField label="Cho phép theo liên kết"><Select name="robotsFollow" value={String(values.robotsFollow)} onChange={event => set('robotsFollow', event.target.value === 'true')}><option value="true">Cho phép</option><option value="false">Không cho phép (nofollow)</option></Select></FormField>
          </div>
        </section>
      </fieldset>
    </form>
    <section className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">Xem trước thông tin tìm kiếm</h2>
      <p className="break-all text-sm text-[var(--muted-fg)]">{values.canonicalUrl || `${origin}${values.routePath || '/'}`}</p>
      <p className="mt-2 break-words text-xl text-blue-600">{values.metaTitle || 'Tiêu đề hiện có của trang'}</p>
      <p className="mt-2 break-words text-[var(--muted-fg)]">{values.metaDescription || 'Mô tả hiện có của trang'}</p>
      {record.routePath && <a href={`${origin}${record.routePath}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-red-600"><ExternalLink className="h-4 w-4" />Mở trang trên website</a>}
    </section>
  </div>;
}
