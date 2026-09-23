'use client';

import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, Modal, ConfirmDialog, FormField, Input, Select, Textarea, Button, type Column } from '@/components/ui';
import { mockProducts, mockCategories, mockSubCategories, formatPrice, formatNumber } from '@/lib/mock-data';
import { useLocalStore, readImage, slugify } from '@/lib/local-store';
import { Plus, Download, Car, Star, CreditCard, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Category } from '@/lib/types';
import ImageUpload from '@/components/ImageUpload';
import PriceInput from '@/components/PriceInput';

export default function ProductsPage() {
  const [products, setProducts] = useLocalStore<Product[]>('/san-pham', mockProducts);
  const [categories] = useLocalStore<Category[]>('/danh-muc/cap-1', mockCategories);
  const [subCategories] = useLocalStore<Category[]>('/danh-muc/cap-2', mockSubCategories);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [viewItem, setViewItem] = useState<Product | null>(null);
  const [brand, setBrand] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const visibleProducts = products.filter(product => (!filterBrand || product.brand === filterBrand) && (!filterModel || product.model === filterModel));

  const columns = [
    { key: 'id', label: 'STT', width: '60px', sortable: true, render: (item: Product) => <span className="text-[var(--muted-fg)]">#{item.id}</span> },
    {
      key: 'name', label: 'Tên xe', sortable: true, render: (item: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center shrink-0 overflow-hidden">
            {item.images?.[0] && item.images[0] !== '/placeholder-car.jpg' ? <img src={item.images[0]} alt="" className="w-full h-full object-cover" /> : <Car className="w-6 h-6 text-[var(--muted-fg)]" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-[var(--muted-fg)]">{item.brand} • {item.year}</p>
          </div>
        </div>
      )
    },
    { key: 'price', label: 'Giá bán', sortable: true, render: (item: Product) => <span className="font-semibold text-red-600">{formatPrice(item.price)}</span> },
    { key: 'mileage', label: 'Số km', sortable: true, render: (item: Product) => <span>{formatNumber(item.mileage)} km</span> },
    { key: 'transmission', label: 'Hộp số' },
    { key: 'status', label: 'Trạng thái', render: (item: Product) => <StatusBadge status={item.status} labels={{ active: 'Đang bán', inactive: 'Ẩn', deposit: 'Đã nhận cọc', sold: 'Đã bán' }} /> },
    { key: 'featured', label: 'Nổi bật', render: (item: Product) => <button type="button" role="switch" aria-checked={item.featured} aria-label={`Nổi bật: ${item.name}`} onClick={() => setProducts(previous => previous.map(product => product.id === item.id ? { ...product, featured: !product.featured } : product))} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${item.featured ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${item.featured ? 'translate-x-6' : 'translate-x-1'}`} /></button> },
    { key: 'installment', label: 'Trả góp', render: (item: Product) => <button type="button" role="switch" aria-checked={Boolean(item.installment)} aria-label={`Trả góp: ${item.name}`} onClick={() => setProducts(previous => previous.map(product => product.id === item.id ? { ...product, installment: !product.installment } : product))} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${item.installment ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${item.installment ? 'translate-x-6' : 'translate-x-1'}`} /></button> },
    { key: 'createdAt', label: 'Ngày tạo', sortable: true },
  ];

  const handleDelete = () => {
    if (deleteItem) {
      setProducts(prev => prev.filter(p => p.id !== deleteItem.id));
      toast.success('Đã xóa sản phẩm thành công!');
      setDeleteItem(null);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const currentImages = editItem?.images?.filter(image => image && image !== '/placeholder-car.jpg') || [];
    const removedGallery = new Set(form.getAll('gallery__removeIndex').map(index => Number(index)));
    const remainingGallery = currentImages.slice(1).filter((_, index) => !removedGallery.has(index));
    let images = [
      ...(!form.has('cover__remove') && currentImages[0] ? [currentImages[0]] : []),
      ...remainingGallery,
    ];
    try {
      const cover = form.get('cover');
      if (cover instanceof File && cover.size) images = [await readImage(cover), ...remainingGallery];
      const gallery = form.getAll('gallery').filter((entry): entry is File => entry instanceof File && entry.size > 0);
      if (images.length + gallery.length > 5) throw new Error('Mỗi xe chỉ được có tối đa 5 ảnh.');
      if (gallery.length) images = [...images, ...await Promise.all(gallery.map(readImage))];
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu ảnh.');
      return;
    }
    const now = new Date().toISOString().split('T')[0];
    const fields = {
      name: String(data.name).trim(), brand: String(data.brand), model: String(data.model || ''),
      slug: slugify(String(data.name)), year: Number(data.year), price: Number(String(data.price).replace(/\D/g, '')),
      originalPrice: Number(String(data.originalPrice || '').replace(/\D/g, '')), mileage: Number(String(data.mileage || '').replace(/\D/g, '')),
      transmission: String(data.transmission), fuel: String(data.fuel), color: String(data.color || ''),
      licensePlate: String(data.licensePlate || ''), condition: String(data.condition || ''),
      status: String(data.status) as Product['status'], description: String(data.description || ''),
      featured: form.has('featured'), installment: form.has('installment'), newArrival: form.has('newArrival'), images,
      updatedAt: now,
    };

    if (editItem) {
      setProducts(prev => prev.map(p => p.id === editItem.id ? { ...p, ...fields } : p));
      toast.success('Đã cập nhật sản phẩm!');
    } else {
      const newProduct: Product = {
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        ...fields,
        createdAt: now,
      };
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Đã thêm sản phẩm mới!');
    }
    setEditItem(null);
    setShowAdd(false);
  };

  const formModal = showAdd || editItem;
  const formData = editItem || {} as Partial<Product>;
  const exportCsv = () => {
    const rows = [['ID', 'Tên xe', 'Hãng', 'Dòng xe', 'Năm', 'Giá bán', 'Số km', 'Trạng thái'], ...products.map(p => [p.id, p.name, p.brand, p.model, p.year, p.price, p.mileage, p.status])];
    const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'san-pham.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!formModal && !viewItem && <><PageHeader
        title="Quản lý sản phẩm"
        subtitle={`${products.length} xe đang quản lý`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={exportCsv}><Download className="w-4 h-4" /> Xuất CSV</Button>
            <Button size="sm" onClick={() => { setBrand(''); setShowAdd(true); }}><Plus className="w-4 h-4" /> Thêm xe</Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Select value={filterBrand} onChange={event => { setFilterBrand(event.target.value); setFilterModel(''); }} className="max-w-52"><option value="">Tất cả hãng xe</option>{categories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}</Select>
        <Select value={filterModel} onChange={event => setFilterModel(event.target.value)} className="max-w-52"><option value="">Tất cả dòng xe</option>{Array.from(new Set([...subCategories.filter(model => !filterBrand || categories.find(category => category.id === model.parentId)?.name === filterBrand).map(model => model.name), ...products.filter(product => !filterBrand || product.brand === filterBrand).map(product => product.model)])).filter(Boolean).map(model => <option key={model} value={model}>{model}</option>)}</Select>
      </div>
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={visibleProducts as unknown as Record<string, unknown>[]}
        searchPlaceholder="Tìm kiếm theo tên xe, hãng..."
        searchFields={['name', 'brand', 'model']}
        onEdit={(item) => { const product = item as unknown as Product; setBrand(product.brand); setEditItem(product); }}
        onDelete={(item) => setDeleteItem(item as unknown as Product)}
        onView={(item) => setViewItem(item as unknown as Product)}
      />
      </>}

      {/* Add/Edit Modal */}
      <Modal open={!!formModal} onClose={() => { setEditItem(null); setShowAdd(false); }} title={editItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'} size="lg">
        <form key={editItem?.id || 'new'} onSubmit={handleSave} className="space-y-8">
          <div><h2 className="text-xl font-semibold">Thông tin xe</h2><p className="mt-1 text-sm text-[var(--muted-fg)]">Nhập thông tin cơ bản, giá bán và trạng thái của xe.</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            <FormField label="Tên xe" required>
              <Input name="name" defaultValue={formData.name} required placeholder="VD: Toyota Camry 2.5Q" />
            </FormField>
            <FormField label="Hãng xe" required>
              <Select name="brand" defaultValue={formData.brand} onChange={event => setBrand(event.target.value)} required>
                <option value="">-- Chọn hãng --</option>
                {categories.filter(category => category.status === 'active').map(category => <option key={category.id} value={category.name}>{category.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Dòng xe">
              <Input name="model" list="car-models" defaultValue={formData.model} placeholder="VD: Camry" />
              <datalist id="car-models">{subCategories.filter(model => model.status === 'active' && (!brand || categories.find(category => category.id === model.parentId)?.name === brand)).map(model => <option key={model.id} value={model.name} />)}</datalist>
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
            <FormField label="Màu sắc">
              <Input name="color" defaultValue={formData.color} placeholder="VD: Trắng" />
            </FormField>
            <FormField label="Biển số">
              <Input name="licensePlate" defaultValue={formData.licensePlate} placeholder="VD: 30A" />
            </FormField>
            <FormField label="Tình trạng xe"><Select name="condition" defaultValue={formData.condition || 'Đã qua sử dụng'}><option>Đã qua sử dụng</option><option>Xe mới</option></Select></FormField>
            <FormField label="Trạng thái"><Select name="status" defaultValue={formData.status || 'active'}><option value="active">Đang bán</option><option value="deposit">Đã nhận cọc</option><option value="sold">Đã bán</option><option value="inactive">Ẩn</option></Select></FormField>
          </div>
          <div className="border-t border-[var(--border-color)] pt-7"><h2 className="mb-5 text-xl font-semibold">Hình ảnh xe</h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><FormField label="Ảnh đại diện"><ImageUpload name="cover" existing={formData.images?.[0] !== '/placeholder-car.jpg' ? formData.images?.[0] : undefined} /></FormField><FormField label="Thư viện ảnh"><ImageUpload name="gallery" multiple maxFiles={5} existing={formData.images?.slice(1).filter(image => image !== '/placeholder-car.jpg')} hint="Tối đa 5 ảnh cho mỗi xe, tính cả ảnh đại diện." /></FormField></div></div>
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
            <Textarea name="description" defaultValue={formData.description} rows={4} placeholder="Mô tả chi tiết về xe..." />
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
            {viewItem.images?.some(image => image && image !== '/placeholder-car.jpg') && <div className="flex gap-3 overflow-x-auto">{viewItem.images.filter(image => image && image !== '/placeholder-car.jpg').map((image, index) => <img key={index} src={image} alt={`${viewItem.name} ${index + 1}`} className="h-40 w-56 rounded-xl object-cover" />)}</div>}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--muted)]">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center"><Car className="w-8 h-8 text-white" /></div>
              <div>
                <h3 className="font-bold text-lg">{viewItem.name}</h3>
                <p className="text-sm text-[var(--muted-fg)]">{viewItem.brand} • {viewItem.model} • {viewItem.year}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Giá bán', formatPrice(viewItem.price)],
                ['Số km', `${formatNumber(viewItem.mileage)} km`],
                ['Hộp số', viewItem.transmission],
                ['Nhiên liệu', viewItem.fuel],
                ['Màu sắc', viewItem.color],
                ['Biển số', viewItem.licensePlate || 'N/A'],
                ['Tình trạng', viewItem.condition],
                ['Nổi bật', viewItem.featured ? 'Có' : 'Không'],
                ['Trả góp', viewItem.installment ? 'Có' : 'Không'],
                ['Ngày tạo', viewItem.createdAt],
                ['Cập nhật', viewItem.updatedAt],
              ].map(([label, val]) => (
                <div key={label} className="p-5 rounded-xl bg-[var(--muted)]">
                  <p className="text-sm text-[var(--muted-fg)] mb-1">{label}</p>
                  <p className="text-base font-medium">{val}</p>
                </div>
              ))}
            </div>
            {viewItem.description && <div className="p-3 rounded-xl bg-[var(--muted)]"><p className="text-xs text-[var(--muted-fg)] mb-1">Mô tả</p><p className="text-sm whitespace-pre-wrap">{viewItem.description}</p></div>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} message={`Bạn có chắc muốn xóa "${deleteItem?.name}"?`} />
    </div>
  );
}
