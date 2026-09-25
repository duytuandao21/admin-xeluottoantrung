'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button, ConfirmDialog, DataTable, FormField, Input, Modal, PageHeader, Select, StatusBadge, type Column } from '@/components/ui';
import CategoryThumbnail from '@/components/CategoryThumbnail';
import ImageUpload from '@/components/ImageUpload';
import { slugify } from '@/lib/slug';
import { api, json } from '@/lib/api/client';
import { uploadAsset } from '@/lib/api/media';
import { useResourceRows } from '@/lib/api/use-resource';
import { listResource } from '@/lib/api/resources';
import type { Category } from '@/lib/types';

export default function VersionsPage() {
  const [versions, setVersions] = useState<Category[]>([]);
  const brands = useResourceRows<Category>('/danh-muc/cap-1');
  const models = useResourceRows<Category>('/danh-muc/cap-2');
  const [error, setError] = useState('');
  const reload = async () => {
    try {
      const first = await listResource('/san-pham/phien-ban', 1);
      const rows = [...first.data];
      for (let page = 2; page <= first.meta.totalPages; page++) rows.push(...(await listResource('/san-pham/phien-ban', page)).data);
      setVersions(rows as unknown as Category[]); setError('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể tải phiên bản xe.'); }
  };
  useEffect(() => { queueMicrotask(() => void reload()); }, []);
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [name, setName] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');

  const selectedBrand = brands.find(brand => String(brand.id) === brandId);
  const availableModels = models.filter(model => model.parentId === selectedBrand?.id && (model.status === 'active' || model.id === editing?.parentId));
  const filteredVersions = versions.filter(version => {
    const model = models.find(candidate => candidate.id === version.parentId);
    return (!filterBrand || String(model?.parentId) === filterBrand) && (!filterModel || String(model?.id) === filterModel);
  });


  const openAdd = () => {
    setBrandId('');
    setModelId('');
    setName('');
    setAdding(true);
  };

  const openEdit = (version: Category) => {
    const model = models.find(candidate => candidate.id === version.parentId);
    setBrandId(model?.parentId ? String(model.parentId) : '');
    setModelId(model ? String(model.id) : '');
    setName(version.name);
    setEditing(version);
  };

  const closeForm = () => {
    setEditing(null);
    setAdding(false);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const trimmedName = name.trim();
    const originalModel = models.find(candidate => candidate.id === editing?.parentId);
    const brand = brands.find(candidate => String(candidate.id) === brandId && (candidate.status === 'active' || candidate.id === originalModel?.parentId));
    const model = models.find(candidate => String(candidate.id) === modelId && candidate.parentId === brand?.id && (candidate.status === 'active' || candidate.id === editing?.parentId));
    if (!brand || !model) {
      toast.error('Vui lòng chọn hãng xe và dòng xe phù hợp.');
      return;
    }
    const slug = slugify(trimmedName);
    if (!slug) {
      toast.error('Tên phiên bản cần có chữ hoặc số.');
      return;
    }
    if (versions.some(version => version.id !== editing?.id && version.parentId === model.id && version.name.toLocaleLowerCase('vi') === trimmedName.toLocaleLowerCase('vi'))) {
      toast.error('Phiên bản này đã có trong dòng xe đã chọn.');
      return;
    }

    let image = editing?.image || '';
    try {
      const file = form.get('image');
      if (file instanceof File && file.size) image = await uploadAsset(file);
      else if (form.has('image__remove')) image = '';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu hình ảnh.');
      return;
    }

    const status = form.get('status') === 'inactive' ? 'inactive' as const : 'active' as const;
    try {
      await api(editing ? `/admin/lookups/car-versions/${editing.id}` : '/admin/lookups/car-versions', json(editing ? 'PATCH' : 'POST', { name: trimmedName, ...(!editing ? { slug } : {}), modelId: String(model.id), imageUrl: image || null, status }));
      toast.success(editing ? 'Đã cập nhật phiên bản xe.' : 'Đã thêm phiên bản xe.'); await reload();
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể lưu phiên bản.'); return; }
    closeForm();
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Phiên bản', sortable: true, render: item => <div className="flex items-center gap-3"><CategoryThumbnail src={String(item.image || '')} kind="model" /><span className="font-semibold">{String(item.name)}</span></div> },
    { key: 'brand', label: 'Hãng xe', render: item => { const model = models.find(candidate => String(candidate.id) === String(item.parentId)); return brands.find(candidate => String(candidate.id) === String(model?.parentId))?.name || '—'; } },
    { key: 'model', label: 'Dòng xe', render: item => models.find(candidate => String(candidate.id) === String(item.parentId))?.name || '—' },
    { key: 'slug', label: 'Slug' },
    { key: 'count', label: 'Số xe', render: () => <span className="font-semibold text-red-600">—</span> },
    { key: 'status', label: 'Trạng thái', render: item => <StatusBadge status={String(item.status)} /> },
  ];

  return (
    <div className="space-y-6">
      {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}
      {!adding && !editing && <>
        <PageHeader title="Phiên bản xe" subtitle={`${versions.length} phiên bản`} actions={<Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" /> Thêm phiên bản</Button>} />
        <div className="flex flex-wrap gap-3">
          <Select value={filterBrand} onChange={event => { setFilterBrand(event.target.value); setFilterModel(''); }} className="max-w-56"><option value="">Tất cả hãng xe</option>{brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</Select>
          <Select value={filterModel} onChange={event => setFilterModel(event.target.value)} className="max-w-56"><option value="">Tất cả dòng xe</option>{models.filter(model => !filterBrand || String(model.parentId) === filterBrand).map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</Select>
        </div>
        <DataTable columns={columns} data={filteredVersions as unknown as Record<string, unknown>[]} searchPlaceholder="Tìm phiên bản xe..." searchFields={['name', 'slug']} onEdit={item => openEdit(item as unknown as Category)} onDelete={item => setDeleting(item as unknown as Category)} />
      </>}

      <Modal open={adding || !!editing} onClose={closeForm} title={editing ? 'Sửa phiên bản xe' : 'Thêm phiên bản xe'}>
        <form key={editing?.id || 'new'} onSubmit={handleSave} className="space-y-7">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
            <FormField label="Hãng xe" required>
              <Select value={brandId} onChange={event => { setBrandId(event.target.value); setModelId(''); }} required>
                <option value="">-- Chọn hãng xe --</option>
                {brands.filter(brand => brand.status === 'active' || brand.id === selectedBrand?.id).map(brand => <option key={brand.id} value={brand.id}>{brand.name}{brand.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}
              </Select>
            </FormField>
            <FormField label="Dòng xe" required>
              <Select value={modelId} onChange={event => setModelId(event.target.value)} disabled={!brandId} required>
                <option value="">{!brandId ? '-- Chọn hãng xe trước --' : availableModels.length ? '-- Chọn dòng xe --' : '-- Hãng này chưa có dòng xe --'}</option>
                {availableModels.map(model => <option key={model.id} value={model.id}>{model.name}{model.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}
              </Select>
              {brandId && !availableModels.length && <p className="mt-2 text-sm text-[var(--muted-fg)]">Bạn có thể <Link href="/san-pham/dong-xe" className="font-medium text-red-600 hover:underline">thêm dòng xe</Link> trước.</p>}
            </FormField>
            <FormField label="Tên phiên bản" required><Input value={name} onChange={event => setName(event.target.value)} placeholder="VD: 2.5Q, Premium, Luxury" required /></FormField>
            <FormField label="Slug"><Input value={slugify(name)} readOnly aria-label="Slug tự tạo" placeholder="Tự tạo từ tên phiên bản" className="cursor-default bg-[var(--muted)] text-[var(--muted-fg)]" /></FormField>
            <div className="lg:col-span-2"><FormField label="Hình phiên bản"><ImageUpload name="image" existing={editing?.image || ''} /></FormField></div>
            <FormField label="Trạng thái"><Select name="status" defaultValue={editing?.status || 'active'}><option value="active">Hoạt động</option><option value="inactive">Ẩn</option></Select></FormField>
          </div>
          <div className="flex justify-end gap-3 border-t border-[var(--border-color)] pt-4"><Button type="button" variant="secondary" onClick={closeForm}>Hủy</Button><Button type="submit">{editing ? 'Cập nhật' : 'Thêm mới'}</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={async () => { if (deleting) { try { await api(`/admin/lookups/car-versions/${deleting.id}`, json('DELETE')); setDeleting(null); toast.success('Đã xóa phiên bản xe.'); await reload(); } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể xóa phiên bản.'); } } }} message={`Xóa phiên bản "${deleting?.name || ''}"?`} />
    </div>
  );
}
