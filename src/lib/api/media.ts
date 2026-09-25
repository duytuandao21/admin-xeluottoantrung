import { api, json } from './client';

interface Presigned { storageKey: string; uploadUrl: string; headers: Record<string, string>; publicUrl: string }
const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/vnd.microsoft.icon', 'image/x-icon'];
function validate(file: File) {
  if (!imageTypes.includes(file.type)) throw new Error('Chỉ hỗ trợ ảnh JPEG, PNG, WebP hoặc AVIF.');
  if (file.size < 1 || file.size > 10_000_000) throw new Error('Ảnh phải nhỏ hơn 10 MB.');
}
async function put(file: File, signed: Presigned) {
  const response = await fetch(signed.uploadUrl, { method: 'PUT', headers: signed.headers, body: file });
  if (!response.ok) throw new Error(`Không thể tải ảnh lên R2 (${response.status}). Kiểm tra cấu hình CORS của bucket.`);
}
export async function uploadAsset(file: File) {
  validate(file);
  const signed = await api<Presigned>('/admin/media/assets/presign', json('POST', { mimeType: file.type, sizeBytes: file.size }));
  await put(file, signed);
  return signed.publicUrl;
}
export async function uploadCarImage(carId: string, file: File, isCover = false) {
  validate(file);
  if (file.type === 'image/vnd.microsoft.icon' || file.type === 'image/x-icon') throw new Error('Ảnh xe không hỗ trợ định dạng ICO.');
  const signed = await api<Presigned>('/admin/media/presign', json('POST', { carId, type: 'image', mimeType: file.type, sizeBytes: file.size }));
  await put(file, signed);
  return api<{ id: string; publicUrl: string }>(`/admin/cars/${carId}/media`, json('POST', { storageKey: signed.storageKey, type: 'image', mimeType: file.type, sizeBytes: file.size, isCover }));
}
