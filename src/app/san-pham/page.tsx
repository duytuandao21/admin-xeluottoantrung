'use client';

import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge, Modal, ConfirmDialog, FormField, Input, Select, Textarea, Button } from '@/components/ui';
import { mockProducts, formatPrice, formatNumber } from '@/lib/mock-data';
import { Plus, Download, Car } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [viewItem, setViewItem] = useState<Product | null>(null);

  const columns = [
    { key: 'id', label: 'STT', width: '60px', sortable: true, render: (item: Product) => <span className="text-[var(--muted-fg)]">#{item.id}</span> },
    {
      key: 'name', label: 'Tên xe', sortable: true, render: (item: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center shrink-0 overflow-hidden">
            <Car className="w-6 h-6 text-[var(--muted-fg)]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-[var(--muted-fg)]">{item.brand} • {item.year}</p>
          </div>
        </div>
      )
    },
    { key: 'price', label: 'Giá bán', sortable: true, render: (item: Product) => <span className="font-semibold text-red-600">{formatPrice(item.price)}</span> },
    { key: 'mileage', label: 'Số KM', sortable: true, render: (item: Product) => <span>{formatNumber(item.mileage)} km</span> },
    { key: 'transmission', label: 'Hộp số' },
    { key: 'status', label: 'Trạng thái', render: (item: Product) => <StatusBadge status={item.status} labels={{ active: 'Đang bán', inactive: 'Ẩn', sold: 'Đã bán' }} /> },
    { key: 'createdAt', label: 'Ngày tạo', sortable: true },
  ];

  const handleDelete = () => {
    if (deleteItem) {
      setProducts(prev => prev.filter(p => p.id !== deleteItem.id));
      toast.success('Đã xóa sản phẩm thành công!');
      setDeleteItem(null);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    if (editItem) {
      setProducts(prev => prev.map(p => p.id === editItem.id ? { ...p, ...data, price: Number(data.price), mileage: Number(data.mileage), year: Number(data.year), updatedAt: new Date().toISOString().split('T')[0] } : p));
      toast.success('Đã cập nhật sản phẩm!');
    } else {
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name: String(data.name),
        slug: String(data.name).toLowerCase().replace(/\s/g, '-'),
        brand: String(data.brand),
        model: String(data.model || ''),
        year: Number(data.year),
        price: Number(data.price),
        mileage: Number(data.mileage),
        transmission: String(data.transmission),
        fuel: String(data.fuel || 'Xăng'),
        color: String(data.color || ''),
        status: 'active',
        condition: 'Đã qua sử dụng',
        images: [],
        licensePlate: String(data.licensePlate || ''),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        featured: false,
        description: String(data.description || ''),
      };
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Đã thêm sản phẩm mới!');
    }
    setEditItem(null);
    setShowAdd(false);
  };

  const formModal = showAdd || editItem;
  const formData = editItem || {} as Partial<Product>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle={`${products.length} xe đang quản lý`}
        actions={
          <>
            <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Xuất Excel</Button>
            <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Thêm xe</Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={products as unknown as Record<string, unknown>[]}
        searchPlaceholder="Tìm kiếm theo tên xe, hãng..."
        searchFields={['name', 'brand', 'model']}
        onEdit={(item) => setEditItem(item as unknown as Product)}
        onDelete={(item) => setDeleteItem(item as unknown as Product)}
        onView={(item) => setViewItem(item as unknown as Product)}
      />

      {/* Add/Edit Modal */}
      <Modal open={!!formModal} onClose={() => { setEditItem(null); setShowAdd(false); }} title={editItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tên xe" required>
              <Input name="name" defaultValue={formData.name} required placeholder="VD: Toyota Camry 2.5Q" />
            </FormField>
            <FormField label="Hãng xe" required>
              <Select name="brand" defaultValue={formData.brand} required>
                <option value="">-- Chọn hãng --</option>
                {['Toyota', 'Honda', 'Mazda', 'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW', 'Ford', 'VinFast'].map(b => <option key={b} value={b}>{b}</option>)}
              </Select>
            </FormField>
            <FormField label="Model">
              <Input name="model" defaultValue={formData.model} placeholder="VD: Camry" />
            </FormField>
            <FormField label="Năm sản xuất" required>
              <Input name="year" type="number" defaultValue={formData.year} required placeholder="VD: 2022" />
            </FormField>
            <FormField label="Giá bán (VNĐ)" required>
              <Input name="price" type="number" defaultValue={formData.price} required placeholder="VD: 890000000" />
            </FormField>
            <FormField label="Số KM đã đi">
              <Input name="mileage" type="number" defaultValue={formData.mileage} placeholder="VD: 25000" />
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
                ['Số KM', `${formatNumber(viewItem.mileage)} km`],
                ['Hộp số', viewItem.transmission],
                ['Nhiên liệu', viewItem.fuel],
                ['Màu sắc', viewItem.color],
                ['Biển số', viewItem.licensePlate || 'N/A'],
                ['Ngày tạo', viewItem.createdAt],
                ['Cập nhật', viewItem.updatedAt],
              ].map(([label, val]) => (
                <div key={label} className="p-3 rounded-xl bg-[var(--muted)]">
                  <p className="text-xs text-[var(--muted-fg)] mb-1">{label}</p>
                  <p className="text-sm font-medium">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} message={`Bạn có chắc muốn xóa "${deleteItem?.name}"?`} />
    </div>
  );
}
