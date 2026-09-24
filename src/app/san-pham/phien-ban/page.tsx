'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button, ConfirmDialog, DataTable, FormField, Input, Modal, PageHeader, Select, StatusBadge, type Column } from '@/components/ui';
import CategoryThumbnail from '@/components/CategoryThumbnail';
import ImageUpload from '@/components/ImageUpload';
import { useLocalStore, readImage, slugify } from '@/lib/local-store';
import { mockCategories, mockProducts, mockSubCategories, mockVersions } from '@/lib/mock-data';
import type { Category, Product } from '@/lib/types';

export default function VersionsPage() {
  const [versions, setVersions] = useLocalStore<Category[]>('/san-pham/phien-ban', mockVersions);
  const [brands] = useLocalStore<Category[]>('/danh-muc/cap-1', mockCategories);
  const [models] = useLocalStore<Category[]>('/danh-muc/cap-2', mockSubCategories);
  const [products, setProducts] = useLocalStore<Product[]>('/san-pham', mockProducts);
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

  const countProducts = (version: Category) => {
    const model = models.find(candidate => candidate.id === version.parentId);
    const brand = brands.find(candidate => candidate.id === model?.parentId);
    return products.filter(product => product.brand === brand?.name && product.model === model?.name && product.version === version.name).length;
  };

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
    if (editing && editing.parentId !== model.id && countProducts(editing)) {
      toast.error('Phiên bản đang được xe sử dụng; không thể chuyển sang dòng xe khác.');
      return;
    }

    let image = editing?.image || '';
    try {
      const file = form.get('image');
      if (file instanceof File && file.size) image = await readImage(file);
      else if (form.has('image__remove')) image = '';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu hình ảnh.');
      return;
    }

    const status = form.get('status') === 'inactive' ? 'inactive' as const : 'active' as const;
    if (editing) {
      setVersions(previous => previous.map(version => version.id === editing.id ? { ...version, name: trimmedName, slug, parentId: model.id, image, status } : version));
      if (editing.name !== trimmedName) {
        setProducts(previous => previous.map(product => product.brand === brand.name && product.model === model.name && product.version === editing.name ? { ...product, version: trimmedName } : product));
      }
      toast.success('Đã cập nhật phiên bản xe.');
    } else {
      const nextId = Math.max(0, ...versions.map(version => version.id)) + 1;
      const nextOrder = Math.max(0, ...versions.filter(version => version.parentId === model.id).map(version => version.order)) + 1;
      setVersions(previous => [{ id: nextId, name: trimmedName, slug, parentId: model.id, image, order: nextOrder, status }, ...previous]);
      toast.success('Đã thêm phiên bản xe.');
    }
    closeForm();
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: 'Phiên bản', sortable: true, render: item => <div className="flex items-center gap-3"><CategoryThumbnail src={String(item.image || '')} kind="model" /><span className="font-semibold">{String(item.name)}</span></div> },
    { key: 'brand', label: 'Hãng xe', render: item => { const model = models.find(candidate => candidate.id === Number(item.parentId)); return brands.find(candidate => candidate.id === model?.parentId)?.name || '—'; } },
    { key: 'model', label: 'Dòng xe', render: item => models.find(candidate => candidate.id === Number(item.parentId))?.name || '—' },
    { key: 'slug', label: 'Slug' },
    { key: 'count', label: 'Số xe', render: item => <span className="font-semibold text-red-600">{countProducts(item as unknown as Category)}</span> },
    { key: 'status', label: 'Trạng thái', render: item => <StatusBadge status={String(item.status)} /> },
  ];

  return (
    <div className="space-y-6">
      {!adding && !editing && <>
        <PageHeader title="Phiên bản xe" subtitle={`${versions.length} phiên bản`} actions={<Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" /> Thêm phiên bản</Button>} />
        <div className="flex flex-wrap gap-3">
          <Select value={filterBrand} onChange={event => { setFilterBrand(event.target.value); setFilterModel(''); }} className="max-w-56"><option value="">Tất cả hãng xe</option>{brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</Select>
          <Select value={filterModel} onChange={event => setFilterModel(event.target.value)} className="max-w-56"><option value="">Tất cả dòng xe</option>{models.filter(model => !filterBrand || String(model.parentId) === filterBrand).map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</Select>
        </div>
        <DataTable columns={columns} data={filteredVersions as unknown as Record<string, unknown>[]} searchPlaceholder="Tìm phiên bản xe..." searchFields={['name', 'slug']} onEdit={item => openEdit(item as unknown as Category)} onDelete={item => { const version = item as unknown as Category; if (countProducts(version)) toast.error('Không thể xóa phiên bản đang được xe sử dụng.'); else setDeleting(version); }} />
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
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => { if (deleting) { setVersions(previous => previous.filter(version => version.id !== deleting.id)); setDeleting(null); toast.success('Đã xóa phiên bản xe.'); } }} message={`Xóa phiên bản "${deleting?.name || ''}"?`} />
    </div>
  );
}
