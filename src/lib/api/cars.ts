import type { Product } from '@/lib/types';
import { api, json, query, type PageResult } from './client';

type CarRecord = Record<string, unknown>;
type Ref = { id: string; name: string; slug: string };
export interface CarListRecord extends CarRecord { id: string; brand: Ref; model: Ref; cover?: string | null }
export function carToProduct(row: CarListRecord): Product {
  return {
    id: row.id as unknown as number, name: String(row.name || ''), slug: String(row.slug || ''), brand: row.brand?.name || '', model: row.model?.name || '',
    version: String(row.version || ''), year: Number(row.year || 0), price: Number(row.price || 0), originalPrice: Number(row.originalPrice || 0),
    mileage: Number(row.mileage || 0), transmission: String(row.transmission || ''), fuel: String(row.fuel || ''), color: String(row.color || ''),
    status: String(row.status || 'inactive') as Product['status'], condition: String(row.condition || ''), images: row.cover ? [row.cover] : [],
    description: String(row.description || ''), licensePlate: String(row.licensePlate || ''), branchId: row.branchId as number | undefined,
    branchName: String(row.branch || ''), createdAt: String(row.createdAt || ''), updatedAt: String(row.updatedAt || ''), featured: Boolean(row.featured), installment: Boolean(row.installment), newArrival: Boolean(row.newArrival),
  };
}
export async function listCars(params: { page?: number; search?: string; brand?: string; model?: string; version?: string; status?: string }) {
  return api<PageResult<CarListRecord>>(`/admin/cars${query({ ...params, limit: 10 })}`);
}
export async function carDetail(id: string) { return api<CarRecord & { media: { id: string; publicUrl: string; isCover: boolean; sortOrder: number }[] }>(`/admin/cars/${id}`); }
export async function saveCar(form: Record<string, unknown>, id?: string) { return api<CarRecord>(id ? `/admin/cars/${id}` : '/admin/cars', json(id ? 'PATCH' : 'POST', form)); }
export async function deleteCar(id: string) { await api<void>(`/admin/cars/${id}`, json('DELETE')); }
export async function setCarPublished(id: string, publish: boolean) { return api(`/admin/cars/${id}/${publish ? 'publish' : 'unpublish'}`, json('POST')); }
