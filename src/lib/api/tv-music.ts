import { api, json } from './client';
import { TV_MUSIC_MAX_BYTES, type TVMusicSettings, type TVMusicTrack } from '../tv-music-settings';

export type TVMusicUsage = { count: number; bytes: number; maxCount: number; maxBytes: number };
export const musicUsage = () => api<TVMusicUsage>('/admin/tv-music/usage');
export const cancelMusicUpload = (id: string) => api<void>(`/admin/tv-music/uploads/${id}`, { method: 'DELETE' });
export const removeMusicTrack = (id: string, revision: number) =>
  api<TVMusicSettings>(`/admin/tv-music/tracks/${id}`, json('DELETE', { revision }));
export function validateMP3(file: File) {
  if (!/\.mp3$/i.test(file.name) || !['', 'audio/mpeg', 'audio/mp3'].includes(file.type)) throw new Error('Chỉ hỗ trợ file MP3.');
  if (file.size < 3 || file.size > TV_MUSIC_MAX_BYTES) throw new Error('File nhạc phải từ 3 byte đến 1 GB.');
}
export async function uploadMusic(file: File, signal: AbortSignal, reserved: (id: string) => void): Promise<TVMusicTrack> {
  validateMP3(file);
  const ticket = await api<{ id: string }>('/admin/tv-music/uploads', json('POST', { name: file.name.replace(/\.mp3$/i, '').slice(0, 120), sizeBytes: file.size }));
  reserved(ticket.id);
  try {
    if (signal.aborted) throw new Error('Đã hủy upload.');
    return await api<TVMusicTrack>(`/admin/tv-music/uploads/${ticket.id}`, {
      method: 'PUT', body: file, headers: { 'Content-Type': 'audio/mpeg' }, signal,
    }, false);
  } catch (error) { await cancelMusicUpload(ticket.id).catch(() => undefined); throw error; }
}
