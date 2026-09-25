import { api, json, query, type PageResult } from './client';
import { slugify } from '@/lib/slug';

type Row = Record<string, unknown>;
type Kind = 'brand' | 'model' | 'lookup' | 'collection' | 'entry' | 'customer';
interface Resource { kind: Kind; path: string; group?: string }
const lookup = (path: string, group?: string): Resource => ({ kind: 'lookup', path: `/admin/lookups/${path}`, group });
const collection = (path: string): Resource => ({ kind: 'collection', path: `/admin/collections/${path}` });
const entry = (group: string): Resource => ({ kind: 'entry', path: '/admin/content', group });
const resources: Record<string, Resource> = {
  '/danh-muc/cap-1': { kind: 'brand', path: '/admin/brands' },
  '/danh-muc/cap-2': { kind: 'model', path: '/admin/car-models' },
  '/san-pham/hang-xe': { kind: 'brand', path: '/admin/brands' },
  '/san-pham/dong-xe': { kind: 'model', path: '/admin/car-models' },
  '/quan-ly/kieu-dang': lookup('body-styles'),
  '/quan-ly/hop-so': lookup('transmissions'),
  '/quan-ly/nam-san-xuat': lookup('filter-options', 'year'),
  '/quan-ly/ngan-sach': lookup('filter-options', 'budget'),
  '/thiet-lap/so-km': lookup('filter-options', 'mileage'),
  '/thiet-lap/bien-so': lookup('filter-options', 'license-plate'),
  '/thiet-lap/tinh-trang': lookup('filter-options', 'condition'),
  '/thiet-lap/mau-sac': lookup('car-colors'),
  '/quan-ly/danh-muc-chi-nhanh': lookup('branch-regions'),
  '/quan-ly/chi-nhanh': lookup('branches'),
  '/san-pham/phien-ban': lookup('car-versions'),
  '/quan-ly/tin-tuc': collection('articles'),
  '/quan-ly/cau-hoi-thuong-gap': collection('faqs'),
  '/quan-ly/cam-nhan-khach-hang': collection('testimonials'),
  '/quan-ly/dich-vu': collection('services'),
  '/quan-ly/tuyen-dung': collection('recruitments'),
  '/thiet-lap/slideshow': collection('slides'),
  '/tai-khoan/khach-hang': { kind: 'customer', path: '/admin/customers' },
};
const entryRoutes = ['/quan-ly/gioi-thieu', '/quan-ly/thong-ke-noi-dung', '/thiet-lap/banner-dong-xe', '/thiet-lap/cac-buoc-mua-xe', '/thiet-lap/cac-buoc-ban-xe', '/thiet-lap/cac-buoc-len-doi', '/thiet-lap/chinh-sach-dieu-kien', '/thiet-lap/kham-pha-xe', '/thiet-lap/quy-trinh-ban-xe', '/thiet-lap/tai-sao-chon', '/thiet-lap/goi-y-nam-san-xuat', '/thiet-lap/nut-goi', '/thiet-lap/mang-xa-hoi', '/thiet-lap/ung-dung'];
for (const route of entryRoutes) resources[route] = entry(route.slice(1).replaceAll('/', '-'));

export function resourceFor(route: string): Resource { const resource = resources[route]; if (!resource) throw new Error(`Chưa có API cho màn ${route}`); return resource; }
export function mapRow(resource: Resource, item: Row): Row {
  if (resource.kind === 'entry') return { ...item, image: item.imageUrl ?? '', description: item.body ?? '', order: item.sortOrder ?? 0 };
  return { ...item, image: item.imageUrl ?? item.avatarUrl ?? '', avatar: item.avatarUrl ?? '', order: item.sortOrder ?? 0,
    lastLogin: item.lastLoginAt ?? '',
    title: item.title ?? (resource.path.endsWith('/car-colors') ? item.name : undefined),
    parentId: item.brandId ?? item.modelId ?? item.parentId,
    category: item.categoryName ?? '', author: item.authorName ?? '',
    minPrice: item.minValue, maxPrice: item.maxValue, minKm: item.minValue, maxKm: item.maxValue,
  };
}
export async function listResource(route: string, page = 1, search = ''): Promise<PageResult<Row>> {
  const resource = resourceFor(route);
  if (resource.kind === 'entry') {
    const list = await api<Row[]>(`${resource.path}${query({ group: resource.group })}`);
    const filtered = search ? list.filter(row => String(row.title ?? '').toLowerCase().includes(search.toLowerCase())) : list;
    return { data: filtered.slice((page - 1) * 10, page * 10).map(row => mapRow(resource, row)), meta: { page, limit: 10, total: filtered.length, totalPages: Math.ceil(filtered.length / 10) } };
  }
  if (resource.kind === 'brand' || resource.kind === 'model') {
    const list = await api<Row[]>(resource.path);
    const filtered = search ? list.filter(row => String(row.name ?? '').toLowerCase().includes(search.toLowerCase())) : list;
    return { data: filtered.slice((page - 1) * 10, page * 10).map(row => mapRow(resource, row)), meta: { page, limit: 10, total: filtered.length, totalPages: Math.ceil(filtered.length / 10) } };
  }
  const result = await api<PageResult<Row>>(`${resource.path}${query({ page, limit: 10, search, group: resource.group })}`);
  if (resource.path.endsWith('/articles')) {
    const categories = await api<PageResult<{ id: string; name: string }>>('/admin/collections/article-categories?page=1&limit=100');
    return { ...result, data: result.data.map(row => ({ ...mapRow(resource, row), category: categories.data.find(item => item.id === row.categoryId)?.name || '—' })) };
  }
  return { ...result, data: result.data.map(row => mapRow(resource, row)) };
}
function payload(resource: Resource, form: Row, editing: boolean): Row {
  const data = { ...form };
  delete data.id; delete data.createdAt; delete data.updatedAt; delete data.count;
  if (data.image !== undefined) { data.imageUrl = data.image || null; delete data.image; }
  if (data.avatar !== undefined) { data.avatarUrl = data.avatar || null; delete data.avatar; }
  if (data.order !== undefined) { data.sortOrder = Number(data.order); delete data.order; }
  if (resource.kind === 'entry') {
    data.body = data.description || null; delete data.description;
    if (!editing) { data.group = resource.group; data.key = slugify(String(data.slug || data.title || '')).slice(0, 100).replace(/-$/, '') || crypto.randomUUID(); }
    delete data.slug; delete data.featured;
  }
  if (resource.kind === 'lookup') {
    if (resource.group) data.group = resource.group;
    if (data.title !== undefined && resource.path.endsWith('/car-colors')) { data.name = data.title; delete data.title; }
    if (data.parentId !== undefined) { data.modelId = data.parentId; delete data.parentId; }
    if (data.minPrice !== undefined) { data.minValue = data.minPrice; delete data.minPrice; }
    if (data.maxPrice !== undefined) { data.maxValue = data.maxPrice; delete data.maxPrice; }
    if (data.minKm !== undefined) { data.minValue = data.minKm; delete data.minKm; }
    if (data.maxKm !== undefined) { data.maxValue = data.maxKm; delete data.maxKm; }
  }
  if (resource.kind === 'model') { data.brandId = data.parentId; delete data.parentId; }
  if (resource.kind === 'collection') {
    if (data.author !== undefined) { data.authorName = data.author; delete data.author; }
    delete data.category; delete data.views;
  }
  if (resource.kind === 'customer') delete data.lastLogin;
  if (editing) delete data.slug;
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined && value !== ''));
}
export async function saveResource(route: string, form: Row, old?: Row | null) {
  const resource = resourceFor(route);
  const data = payload(resource, form, !!old);
  if (resource.path.endsWith('/articles') && form.category) {
    const categoryName = String(form.category);
    const categories = await api<PageResult<{ id: string; name: string }>>('/admin/collections/article-categories?page=1&limit=100');
    let category = categories.data.find(item => item.name === categoryName);
    if (!category) category = await api<{ id: string; name: string }>('/admin/collections/article-categories', json('POST', { name: categoryName, slug: slugify(categoryName) }));
    data.categoryId = category.id;
  }
  const path = old ? resource.kind === 'entry' ? `${resource.path}/${resource.group}/${old.key}` : `${resource.path}/${old.id}` : resource.path;
  return api<Row>(path, json(old ? 'PATCH' : 'POST', data));
}
export async function deleteResource(route: string, item: Row) {
  const resource = resourceFor(route);
  const path = resource.kind === 'entry' ? `${resource.path}/${resource.group}/${item.key}` : `${resource.path}/${item.id}`;
  await api<void>(path, json('DELETE'));
}
