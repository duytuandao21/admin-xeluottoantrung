'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader, DataTable, StatusBadge, Modal, ConfirmDialog, FormField, Input, Select, Button, type Column } from '@/components/ui';
import { formatPrice, formatNumber } from '@/lib/format';
import { slugify } from '@/lib/slug';
import { api, json, query, type PageResult } from '@/lib/api/client';
import { carDetail, carToProduct, deleteCar, listCars, saveCar } from '@/lib/api/cars';
import { uploadCarImage } from '@/lib/api/media';
import { Plus, Download, Car, Star, CreditCard, Sparkles, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Category, CarAttribute, Branch } from '@/lib/types';
import ImageUpload from '@/components/ImageUpload';
import PriceInput from '@/components/PriceInput';
import ProductThumbnail from '@/components/ProductThumbnail';
import { formatDate } from '@/lib/date';
import RichTextEditor, { RichTextContent } from '@/components/RichTextEditor';
import { sanitizeRichText } from '@/lib/rich-text';
import { resolveCarColorCode, type ManagedCarColor } from '@/lib/car-colors';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [versions, setVersions] = useState<Category[]>([]);
  const [bodyStyles, setBodyStyles] = useState<CarAttribute[]>([]);
  const [managedColors, setManagedColors] = useState<ManagedCarColor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mediaIds, setMediaIds] = useState<Record<string, string>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [viewItem, setViewItem] = useState<Product | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterVersion, setFilterVersion] = useState('');
  const [slugPreview, setSlugPreview] = useState('');
  const all = useCallback(async <T,>(path: string): Promise<T[]> => {
    const first = await api<PageResult<T>>(`${path}${query({ page: 1, limit: 100 })}`);
    const rows = [...first.data];
    for (let next = 2; next <= first.meta.totalPages; next++) rows.push(...(await api<PageResult<T>>(`${path}${query({ page: next, limit: 100 })}`)).data);
    return rows;
  }, []);
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await listCars({ page, search, brand: categories.find(c => c.name === filterBrand)?.slug, model: subCategories.find(c => c.name === filterModel)?.slug, version: versions.find(c => c.name === filterVersion)?.slug });
      setProducts(result.data.map(carToProduct)); setTotal(result.meta.total);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể tải danh sách xe.'); setProducts([]); }
    finally { setLoading(false); }
  }, [page, search, filterBrand, filterModel, filterVersion, categories, subCategories, versions]);
  useEffect(() => { queueMicrotask(() => void reload()); }, [reload]);
  useEffect(() => {
    void Promise.all([
      api<Category[]>('/admin/brands'), api<Category[]>('/admin/car-models'), all<Category>('/admin/lookups/car-versions'),
      all<CarAttribute>('/admin/lookups/body-styles'), all<ManagedCarColor>('/admin/lookups/car-colors'), all<Branch>('/admin/lookups/branches'),
    ]).then(([brands, models, versions, styles, colors, branches]) => {
      setCategories(brands); setSubCategories(models.map(model => ({ ...model, parentId: (model as unknown as { brandId: number }).brandId })));
      setVersions(versions.map(version => ({ ...version, parentId: (version as unknown as { modelId: number }).modelId })));
      setBodyStyles(styles); setManagedColors(colors.map(color => ({ ...color, title: (color as unknown as { name: string }).name })));
      setBranches(branches);
    }).catch(failure => setError(failure instanceof Error ? failure.message : 'Không thể tải danh mục xe.'));
  }, [all]);
  const visibleProducts = products;
  const selectedBrand = categories.find(category => category.name === brand);
  const availableModels = subCategories.filter(category => category.parentId === selectedBrand?.id && (category.status === 'active' || (editItem?.brand === brand && editItem.model === category.name)));
  const selectedModel = availableModels.find(category => category.name === model);
  const selectedBodyStyle = bodyStyles.find(style => style.id === selectedModel?.bodyStyleId);
  const availableColors = managedColors.filter(color => color.status === 'active' || (editItem && color.title === editItem.color));
  const colorPreview = managedColors.find(color => color.title === selectedColor);
  const availableVersions = versions.filter(category => category.parentId === selectedModel?.id && (category.status === 'active' || (editItem?.brand === brand && editItem?.model === model && editItem?.version === category.name)));
  const unavailableCurrentModel = Boolean(editItem && brand === editItem.brand && model === editItem.model && model && !availableModels.some(category => category.name === model));
  const unavailableCurrentVersion = Boolean(editItem && brand === editItem.brand && model === editItem.model && version === editItem.version && version && !availableVersions.some(category => category.name === version));
  const getProductBodyStyle = (product: Product) => {
    const carBrand = categories.find(category => category.name === product.brand);
    const carModel = subCategories.find(category => category.parentId === carBrand?.id && category.name === product.model);
    return bodyStyles.find(style => style.id === carModel?.bodyStyleId)?.name || '—';
  };
  const getProductBranchName = (product: Product) => product.branchId
    ? branches.find(branch => branch.id === product.branchId)?.name || 'Chi nhánh không còn tồn tại'
    : product.branchName || 'Chưa chọn';
  const getProductListName = (product: Product) => [product.brand, product.model || product.name, product.version, product.year].filter(Boolean).join(' ');

  const columns = [
    { key: 'id', label: 'STT', width: '60px', sortable: true, render: (item: Product) => <span className="text-[var(--muted-fg)]">#{item.id}</span> },
    {
      key: 'name', label: 'Tên xe', sortable: true, render: (item: Product) => (
        <div className="flex items-center gap-3">
          <ProductThumbnail images={item.images} />
          <div className="min-w-0 max-w-[320px]">
            <p className="truncate text-sm font-semibold" title={getProductListName(item)}>{getProductListName(item)}</p>
            <p className="flex min-w-0 items-center gap-1 text-xs text-[var(--muted-fg)]" title={getProductBranchName(item)}><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{getProductBranchName(item)}</span></p>
          </div>
        </div>
      )
    },
    { key: 'price', label: 'Giá bán', sortable: true, render: (item: Product) => <span className="font-semibold tabular-nums text-red-600">{formatPrice(item.price)}</span> },
    { key: 'mileage', label: 'Số km', sortable: true, render: (item: Product) => <span>{formatNumber(item.mileage)} km</span> },
    { key: 'transmission', label: 'Hộp số' },
    { key: 'status', label: 'Trạng thái', render: (item: Product) => <StatusBadge status={item.status} labels={{ active: 'Đang bán', inactive: 'Ẩn', deposit: 'Đã nhận cọc', sold: 'Đã bán' }} /> },
    { key: 'featured', label: 'Nổi bật', render: (item: Product) => <button type="button" role="switch" aria-checked={item.featured} aria-label={`Nổi bật: ${item.name}`} onClick={() => void toggleCar(item, 'featured')} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${item.featured ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${item.featured ? 'translate-x-6' : 'translate-x-1'}`} /></button> },
    { key: 'installment', label: 'Trả góp', render: (item: Product) => <button type="button" role="switch" aria-checked={Boolean(item.installment)} aria-label={`Trả góp: ${item.name}`} onClick={() => void toggleCar(item, 'installment')} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${item.installment ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${item.installment ? 'translate-x-6' : 'translate-x-1'}`} /></button> },
    { key: 'createdAt', label: 'Ngày tạo', sortable: true },
  ];

  const toggleCar = async (item: Product, field: 'featured' | 'installment') => {
    try { await saveCar({ [field]: !item[field] }, String(item.id)); await reload(); }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể cập nhật xe.'); }
  };
  const openEdit = async (product: Product) => {
    try {
      const detail = await carDetail(String(product.id));
      const images = [...detail.media].sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.sortOrder - b.sortOrder);
      setMediaIds(Object.fromEntries(images.map(media => [media.publicUrl, media.id])));
      const hydrated: Product = { ...product, images: images.map(media => media.publicUrl), branchId: detail.branchId as number | undefined,
        color: managedColors.find(color => String(color.id) === detail.colorId)?.title || '',
        transmission: bodyStyles.length >= 0 ? String((await all<Record<string, unknown>>('/admin/lookups/transmissions')).find(row => row.id === detail.transmissionId)?.name || 'Tự động') : 'Tự động',
        condition: String(detail.condition || ''), licensePlate: String(detail.licensePlate || ''), description: String(detail.description || ''), fuel: String(detail.fuel || ''),
        updatedAt: String(detail.updatedAt || ''), originalPrice: Number(detail.originalPrice || 0) };
      setBrand(hydrated.brand); setModel(hydrated.model); setVersion(hydrated.version || ''); setSelectedColor(hydrated.color);
      setSlugPreview(hydrated.slug); setEditItem(hydrated);
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể tải chi tiết xe.'); }
  };
  const openView = async (product: Product) => {
    try {
      const detail = await carDetail(String(product.id));
      const images = [...detail.media].sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.sortOrder - b.sortOrder);
      setViewItem({ ...product, images: images.map(media => media.publicUrl),
        branchId: detail.branchId as number | undefined,
        color: managedColors.find(color => String(color.id) === detail.colorId)?.title || product.color,
        condition: String(detail.condition || ''), licensePlate: String(detail.licensePlate || ''),
        description: String(detail.description || ''), updatedAt: String(detail.updatedAt || product.updatedAt) });
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể tải chi tiết xe.'); }
  };
  const handleDelete = async () => {
    if (deleteItem) {
      try { await deleteCar(String(deleteItem.id)); toast.success('Đã xóa sản phẩm thành công!'); setDeleteItem(null); await reload(); }
      catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể xóa xe.'); }
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const chosenBrand = categories.find(category => category.name === String(data.brand) && (category.status === 'active' || category.name === editItem?.brand));
    const chosenModel = subCategories.find(category => category.parentId === chosenBrand?.id && category.name === String(data.model) && (category.status === 'active' || (editItem?.brand === chosenBrand?.name && editItem?.model === category.name)));
    const chosenVersion = versions.find(category => category.parentId === chosenModel?.id && category.name === String(data.version) && (category.status === 'active' || (editItem?.brand === chosenBrand?.name && editItem?.model === chosenModel?.name && editItem?.version === category.name)));
    if (!chosenBrand || !chosenModel || !chosenVersion) {
      toast.error('Vui lòng chọn đúng hãng xe, dòng xe và phiên bản có sẵn.');
      return;
    }
    if (!bodyStyles.some(style => style.id === chosenModel.bodyStyleId)) {
      toast.error('Dòng xe chưa có kiểu dáng hợp lệ. Vui lòng cập nhật kiểu dáng ở mục Dòng xe.');
      return;
    }
    const chosenColor = managedColors.find(color => color.title === String(data.color) && (color.status === 'active' || color.title === editItem?.color));
    if (!chosenColor) {
      toast.error('Vui lòng chọn màu từ danh sách Quản lý màu sắc.');
      return;
    }
    const branchId = String(data.branchId || '');
    const chosenBranch = branches.find(branch => String(branch.id) === branchId && (branch.status === 'active' || branch.id === editItem?.branchId));
    if (branchId && !chosenBranch) {
      toast.error('Vui lòng chọn chi nhánh có trong danh sách.');
      return;
    }
    const currentImages = editItem?.images?.filter(image => image && image !== '/placeholder-car.jpg') || [];
    const removedGallery = new Set(form.getAll('gallery__removeIndex').map(index => Number(index)));
    const remainingGallery = currentImages.slice(1).filter((_, index) => !removedGallery.has(index));
    const coverFile = form.get('cover');
    const images = [...(!form.has('cover__remove') && !(coverFile instanceof File && coverFile.size) && currentImages[0] ? [currentImages[0]] : []), ...remainingGallery];
    try {
      const gallery = form.getAll('gallery').filter((entry): entry is File => entry instanceof File && entry.size > 0);
      if (images.length + gallery.length + (coverFile instanceof File && coverFile.size ? 1 : 0) > 10) throw new Error('Mỗi xe chỉ được có tối đa 10 ảnh.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu ảnh.');
      return;
    }
    const fields = {
      name: String(data.name).trim(), brandId: String(chosenBrand.id), modelId: String(chosenModel.id), versionId: String(chosenVersion.id),
      bodyStyleId: String(selectedBodyStyle?.id), year: Number(data.year), price: Number(String(data.price).replace(/\D/g, '')),
      originalPrice: Number(String(data.originalPrice || '').replace(/\D/g, '')), mileage: Number(String(data.mileage || '').replace(/\D/g, '')),
      transmissionId: undefined as string | undefined, fuel: String(data.fuel), colorId: String(chosenColor.id),
      branchId: chosenBranch ? String(chosenBranch.id) : null,
      licensePlate: String(data.licensePlate || ''), condition: String(data.condition || ''),
      status: String(data.status) as Product['status'], description: sanitizeRichText(String(data.description || '')),
      featured: form.has('featured'), installment: form.has('installment'), newArrival: form.has('newArrival'),
    };
    if (!slugify(fields.name)) {
      toast.error('Tên xe cần có chữ hay số để tạo slug.');
      return;
    }

    let savedCarId: string | undefined;
    try {
      const transmissions = await all<Record<string, unknown>>('/admin/lookups/transmissions');
      fields.transmissionId = String(transmissions.find(item => item.name === data.transmission)?.id || '') || undefined;
      const saved = await saveCar({ ...fields, ...(editItem ? {} : { slug: slugify(fields.name) }) }, editItem ? String(editItem.id) : undefined);
      const carId = String(saved.id);
      savedCarId = carId;
      if (coverFile instanceof File && coverFile.size) await uploadCarImage(carId, coverFile, true);
      for (const file of form.getAll('gallery')) if (file instanceof File && file.size) await uploadCarImage(carId, file);
      if (editItem) for (const url of currentImages.filter(url => !images.includes(url))) {
        const mediaId = mediaIds[url]; if (mediaId) await api(`/admin/cars/${carId}/media/${mediaId}`, json('DELETE'));
      }
      if (fields.status !== 'inactive') await api(`/admin/cars/${carId}/publish`, json('POST'));
      else if (editItem) await api(`/admin/cars/${carId}/unpublish`, json('POST'));
      toast.success(editItem ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm mới!'); await reload();
    } catch (failure) {
      toast.error(`${savedCarId ? 'Xe đã lưu nhưng thao tác ảnh hoặc xuất bản chưa hoàn tất. ' : ''}${failure instanceof Error ? failure.message : 'Không thể lưu sản phẩm.'}`);
      if (savedCarId) { await reload(); setEditItem(null); setShowAdd(false); }
      return;
    }
    setEditItem(null);
    setShowAdd(false);
  };

  const formModal = showAdd || editItem;
  const formData = editItem || {} as Partial<Product>;
  const exportCsv = async () => {
    try {
    const filters = { search, brand: categories.find(c => c.name === filterBrand)?.slug, model: subCategories.find(c => c.name === filterModel)?.slug, version: versions.find(c => c.name === filterVersion)?.slug };
    const first = await listCars({ ...filters, page: 1 });
    const allCars = [...first.data];
    for (let next = 2; next <= first.meta.totalPages; next++) allCars.push(...(await listCars({ ...filters, page: next })).data);
    const rows = [['ID', 'Tên xe', 'Hãng', 'Dòng xe', 'Phiên bản', 'Kiểu dáng', 'Chi nhánh', 'Năm', 'Giá bán', 'Số km', 'Trạng thái'], ...allCars.map(row => { const p = carToProduct(row); return [p.id, p.name, p.brand, p.model, p.version || '', String(row.bodyType || ''), p.branchName || '', p.year, p.price, p.mileage, p.status]; })];
    const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'san-pham.csv'; link.click();
    URL.revokeObjectURL(url);
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể xuất danh sách xe.'); }
  };

  return (
    <div className="space-y-6">
      {!formModal && !viewItem && <><PageHeader
        title="Quản lý sản phẩm"
        subtitle={`${total} xe đang quản lý`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={exportCsv}><Download className="w-4 h-4" /> Xuất CSV</Button>
            <Button size="sm" onClick={() => { setBrand(''); setModel(''); setVersion(''); setSelectedColor(''); setSlugPreview(''); setShowAdd(true); }}><Plus className="w-4 h-4" /> Thêm xe</Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Select value={filterBrand} onChange={event => { setPage(1); setFilterBrand(event.target.value); setFilterModel(''); setFilterVersion(''); }} className="max-w-52"><option value="">Tất cả hãng xe</option>{categories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}</Select>
        <Select value={filterModel} onChange={event => { setPage(1); setFilterModel(event.target.value); setFilterVersion(''); }} className="max-w-52"><option value="">Tất cả dòng xe</option>{subCategories.filter(item => !filterBrand || String(item.parentId) === String(categories.find(brand => brand.name === filterBrand)?.id)).map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</Select>
        <Select value={filterVersion} onChange={event => { setPage(1); setFilterVersion(event.target.value); }} className="max-w-52"><option value="">Tất cả phiên bản</option>{versions.filter(item => !filterModel || String(item.parentId) === String(subCategories.find(model => model.name === filterModel)?.id)).map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</Select>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">{error} <button className="underline" onClick={() => void reload()}>Thử lại</button></div>}
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={visibleProducts as unknown as Record<string, unknown>[]}
        emptyMessage={loading ? 'Đang tải dữ liệu...' : undefined}
        remote={{ page, total, perPage: 10, search, onPage: setPage, onSearch: value => { setPage(1); setSearch(value); } }}
        searchPlaceholder="Tìm kiếm theo tên xe, hãng..."
        searchFields={['name', 'brand', 'model']}
        onEdit={(item) => { void openEdit(item as unknown as Product); }}
        onDelete={(item) => setDeleteItem(item as unknown as Product)}
        onView={(item) => { void openView(item as unknown as Product); }}
      />
      </>}

      {/* Add/Edit Modal */}
      <Modal open={!!formModal} onClose={() => { setEditItem(null); setShowAdd(false); }} title={editItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'} size="lg">
        <form key={editItem?.id || 'new'} onSubmit={handleSave} className="space-y-8">
          <div><h2 className="text-xl font-semibold">Thông tin xe</h2><p className="mt-1 text-sm text-[var(--muted-fg)]">Nhập thông tin cơ bản, giá bán và trạng thái của xe.</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            <FormField label="Tên xe" required>
              <Input name="name" defaultValue={formData.name} onChange={event => setSlugPreview(slugify(event.currentTarget.value))} required placeholder="VD: Toyota Camry 2.5Q" />
            </FormField>
            <FormField label="Slug">
              <Input value={slugPreview} readOnly aria-label="Slug tự tạo" placeholder="Tự tạo từ tên xe" className="cursor-default bg-[var(--muted)] text-[var(--muted-fg)]" />
            </FormField>
            <FormField label="Hãng xe" required>
              <Select name="brand" value={brand} onChange={event => { setBrand(event.target.value); setModel(''); setVersion(''); }} required>
                <option value="">-- Chọn hãng --</option>
                {categories.filter(category => category.status === 'active' || category.name === editItem?.brand).map(category => <option key={category.id} value={category.name}>{category.name}{category.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}
              </Select>
            </FormField>
            <FormField label="Dòng xe" required>
              <Select name="model" value={model} onChange={event => { setModel(event.target.value); setVersion(''); }} disabled={!brand} required>
                <option value="">{!brand ? '-- Chọn hãng xe trước --' : availableModels.length ? '-- Chọn dòng xe --' : '-- Hãng này chưa có dòng xe --'}</option>
                {unavailableCurrentModel && <option value={model} disabled>{model} (không còn trong danh sách)</option>}
                {availableModels.map(category => <option key={category.id} value={category.name}>{category.name}{category.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}
              </Select>
              {brand && (!availableModels.length || unavailableCurrentModel) && <p className="mt-2 text-sm text-[var(--muted-fg)]">Chưa có dòng xe phù hợp? <Link href="/san-pham/dong-xe" className="font-medium text-red-600 hover:underline">Quản lý dòng xe</Link></p>}
            </FormField>
            <FormField label="Phiên bản xe" required>
              <Select name="version" value={version} onChange={event => setVersion(event.target.value)} disabled={!model || unavailableCurrentModel} required>
                <option value="">{!model ? '-- Chọn dòng xe trước --' : availableVersions.length ? '-- Chọn phiên bản --' : '-- Dòng này chưa có phiên bản --'}</option>
                {unavailableCurrentVersion && <option value={version} disabled>{version} (không còn trong danh sách)</option>}
                {availableVersions.map(category => <option key={category.id} value={category.name}>{category.name}{category.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}
              </Select>
              {model && (!availableVersions.length || unavailableCurrentVersion) && <p className="mt-2 text-sm text-[var(--muted-fg)]">Chưa có phiên bản phù hợp? <Link href="/san-pham/phien-ban" className="font-medium text-red-600 hover:underline">Quản lý phiên bản xe</Link></p>}
            </FormField>
            <FormField label="Kiểu dáng">
              <Input value={selectedBodyStyle?.name || (model ? 'Dòng xe chưa có kiểu dáng' : 'Chọn dòng xe để xem kiểu dáng')} readOnly aria-label="Kiểu dáng tự động theo dòng xe" className="cursor-default bg-[var(--muted)]" />
              {model && !selectedBodyStyle && <p className="mt-2 text-sm text-[var(--muted-fg)]">Cập nhật kiểu dáng tại <Link href="/san-pham/dong-xe" className="font-medium text-red-600 hover:underline">Dòng xe</Link> trước khi lưu xe.</p>}
            </FormField>
            <FormField label="Năm sản xuất" required>
              <Input name="year" type="number" defaultValue={formData.year} required placeholder="VD: 2022" />
            </FormField>
            <FormField label="Giá bán (VNĐ)" required>
              <PriceInput name="price" defaultValue={formData.price} required />
            </FormField>
            <FormField label="Giá cũ (VNĐ)"><PriceInput name="originalPrice" defaultValue={formData.originalPrice} /></FormField>
            <FormField label="Số km đã đi">
              <PriceInput name="mileage" defaultValue={formData.mileage} placeholder="VD: 25.000" />
            </FormField>
            <FormField label="Hộp số">
              <Select name="transmission" defaultValue={formData.transmission}>
                <option value="Tự động">Tự động</option>
                <option value="Số sàn">Số sàn</option>
              </Select>
            </FormField>
            <FormField label="Nhiên liệu">
              <Select name="fuel" defaultValue={formData.fuel}>
                <option value="Xăng">Xăng</option>
                <option value="Dầu">Dầu</option>
                <option value="Điện">Điện</option>
                <option value="Hybrid">Hybrid</option>
              </Select>
            </FormField>
            <FormField label="Màu sắc" required>
              <Select name="color" value={selectedColor} onChange={event => setSelectedColor(event.target.value)} required>
                <option value="">-- Chọn màu xe --</option>
                {availableColors.map(color => <option key={color.id} value={color.title}>{color.title}{color.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}
              </Select>
              {colorPreview && <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-fg)]"><span className="h-5 w-5 rounded-md border border-[var(--border-color)] shadow-sm" style={{ backgroundColor: resolveCarColorCode(colorPreview.colorCode, colorPreview.title) }} />{colorPreview.title}</div>}
              {!availableColors.length && <p className="mt-2 text-sm text-[var(--muted-fg)]">Chưa có màu để chọn. <Link href="/thiet-lap/mau-sac" className="font-medium text-red-600 hover:underline">Quản lý màu sắc</Link></p>}
            </FormField>
            <FormField label="Chi nhánh đang có xe">
              <Select name="branchId" defaultValue={formData.branchId ? String(formData.branchId) : ''}>
                <option value="">-- Chưa chọn chi nhánh --</option>
                {branches.filter(branch => branch.status === 'active' || branch.id === editItem?.branchId).map(branch => <option key={branch.id} value={branch.id}>{branch.name}{branch.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}
              </Select>
              {!branches.some(branch => branch.status === 'active') && <p className="mt-2 text-sm text-[var(--muted-fg)]">Chưa có chi nhánh hoạt động. <Link href="/quan-ly/chi-nhanh" className="font-medium text-red-600 hover:underline">Quản lý chi nhánh</Link></p>}
            </FormField>
            <FormField label="Biển số">
              <Input name="licensePlate" defaultValue={formData.licensePlate} placeholder="VD: 30A" />
            </FormField>
            <FormField label="Tình trạng xe"><Select name="condition" defaultValue={formData.condition || 'Đã qua sử dụng'}><option>Đã qua sử dụng</option><option>Xe mới</option></Select></FormField>
            <FormField label="Trạng thái"><Select name="status" defaultValue={formData.status || 'active'}><option value="active">Đang bán</option><option value="deposit">Đã nhận cọc</option><option value="sold">Đã bán</option><option value="inactive">Ẩn</option></Select></FormField>
          </div>
          <div className="border-t border-[var(--border-color)] pt-7"><h2 className="mb-5 text-xl font-semibold">Hình ảnh xe</h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><FormField label="Ảnh đại diện"><ImageUpload name="cover" existing={formData.images?.[0] !== '/placeholder-car.jpg' ? formData.images?.[0] : undefined} /></FormField><FormField label="Thư viện ảnh"><ImageUpload name="gallery" multiple maxFiles={10} existing={formData.images?.slice(1).filter(image => image !== '/placeholder-car.jpg')} hint="Tối đa 10 ảnh cho mỗi xe, tính cả ảnh đại diện." /></FormField></div></div>
          <div className="border-t border-[var(--border-color)] pt-7">
            <h2 className="mb-5 text-xl font-semibold">Nhãn hiển thị</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <label className="product-option flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 transition-colors hover:border-red-300">
                <input name="featured" type="checkbox" defaultChecked={formData.featured} className="mt-1 h-5 w-5 shrink-0 accent-red-600" />
                <span className="min-w-0"><span className="flex items-center gap-2 font-semibold"><Star className="h-5 w-5 shrink-0 text-amber-500" /> Nổi bật</span><span className="mt-1 block text-sm text-[var(--muted-fg)]">Ưu tiên giới thiệu xe này</span></span>
              </label>
              <label className="product-option flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 transition-colors hover:border-red-300">
                <input name="installment" type="checkbox" defaultChecked={formData.installment} className="mt-1 h-5 w-5 shrink-0 accent-red-600" />
                <span className="min-w-0"><span className="flex items-center gap-2 font-semibold"><CreditCard className="h-5 w-5 shrink-0 text-red-500" /> Hỗ trợ trả góp</span><span className="mt-1 block text-sm text-[var(--muted-fg)]">Hiển thị tùy chọn trả góp</span></span>
              </label>
              <label className="product-option flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 transition-colors hover:border-red-300">
                <input name="newArrival" type="checkbox" defaultChecked={formData.newArrival} className="mt-1 h-5 w-5 shrink-0 accent-red-600" />
                <span className="min-w-0"><span className="flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5 shrink-0 text-emerald-500" /> Xe mới về</span><span className="mt-1 block text-sm text-[var(--muted-fg)]">Gắn nhãn xe vừa nhập</span></span>
              </label>
            </div>
          </div>
          <FormField label="Mô tả">
            <RichTextEditor name="description" defaultValue={formData.description} placeholder="Mô tả chi tiết về xe..." />
          </FormField>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <Button type="button" variant="secondary" onClick={() => { setEditItem(null); setShowAdd(false); }}>Hủy</Button>
            <Button type="submit">{editItem ? 'Cập nhật' : 'Thêm mới'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Chi tiết sản phẩm" size="md">
        {viewItem && (
          <div className="space-y-4">
            {viewItem.images?.some(image => image && image !== '/placeholder-car.jpg') && <div className="flex gap-3 overflow-x-auto">{viewItem.images.filter(image => image && image !== '/placeholder-car.jpg').map((image, index) => <img key={index} src={image} alt={`${viewItem.name} ${index + 1}`} className="h-40 w-56 shrink-0 rounded-xl object-cover" />)}</div>}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--muted)]">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center"><Car className="w-8 h-8 text-white" /></div>
              <div>
                <h3 className="font-bold text-lg">{viewItem.name}</h3>
                <p className="text-sm text-[var(--muted-fg)]">{viewItem.brand} • {viewItem.model}{viewItem.version ? ` • ${viewItem.version}` : ''} • {viewItem.year}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Phiên bản', viewItem.version || '—'],
                ['Kiểu dáng', getProductBodyStyle(viewItem)],
                ['Chi nhánh', getProductBranchName(viewItem)],
                ['Giá bán', formatPrice(viewItem.price)],
                ['Số km', `${formatNumber(viewItem.mileage)} km`],
                ['Hộp số', viewItem.transmission],
                ['Nhiên liệu', viewItem.fuel],
                ['Màu sắc', viewItem.color],
                ['Biển số', viewItem.licensePlate || 'N/A'],
                ['Tình trạng', viewItem.condition],
                ['Nổi bật', viewItem.featured ? 'Có' : 'Không'],
                ['Trả góp', viewItem.installment ? 'Có' : 'Không'],
                ['Ngày tạo', formatDate(viewItem.createdAt)],
                ['Cập nhật', formatDate(viewItem.updatedAt)],
              ].map(([label, val]) => (
                <div key={label} className="p-5 rounded-xl bg-[var(--muted)]">
                  <p className="text-sm text-[var(--muted-fg)] mb-1">{label}</p>
                  <p className="text-base font-medium">{val}</p>
                </div>
              ))}
            </div>
            {viewItem.description && <div className="p-3 rounded-xl bg-[var(--muted)]"><p className="text-xs text-[var(--muted-fg)] mb-1">Mô tả</p><RichTextContent html={viewItem.description} /></div>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} message={`Bạn có chắc muốn xóa "${deleteItem?.name}"?`} />
    </div>
  );
}
