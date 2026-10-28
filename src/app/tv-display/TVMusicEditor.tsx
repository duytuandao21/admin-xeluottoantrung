'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Music2, RefreshCw, Replace, Trash2, Upload, Volume2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { cancelMusicUpload, musicUsage, removeMusicTrack, uploadMusic, validateMP3, type TVMusicUsage } from '@/lib/api/tv-music';
import { TV_MUSIC_MAX_BYTES, TV_MUSIC_MAX_TRACKS, type TVMusicSettings, type TVMusicTrack } from '@/lib/tv-music-settings';

const bytes = (value: number) => value >= 1_000_000_000 ? '1 GB' : value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)} MB` : `${value} byte`;
type Props = { value: TVMusicSettings; saved: TVMusicSettings; disabled: boolean;
  onChange: (value: TVMusicSettings) => void; onPersistedChange: (value: TVMusicSettings) => void; onBusy: (busy: boolean) => void };

export default function TVMusicEditor({ value, saved, disabled, onChange, onPersistedChange, onBusy }: Props) {
  const [usage, setUsage] = useState<TVMusicUsage | null>(null);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceId = useRef<string | null>(null);
  const aborter = useRef<AbortController | null>(null);
  const pending = useRef(new Set<string>());
  const current = useRef(value);
  const persisted = useRef(saved);
  const live = useRef(true);
  useEffect(() => { current.current = value; }, [value]);
  useEffect(() => { persisted.current = saved; for (const track of saved.tracks) pending.current.delete(track.id); }, [saved]);
  useEffect(() => {
    live.current = true;
    void musicUsage().then(data => { if (live.current) setUsage(data); }).catch(() => { if (live.current) setError('Chưa kiểm tra được dung lượng kho nhạc.'); });
    const owned = pending.current;
    return () => {
      live.current = false; aborter.current?.abort();
      for (const id of owned) void cancelMusicUpload(id).catch(() => undefined);
    };
  }, []);
  const refresh = async () => { const data = await musicUsage(); if (live.current) setUsage(data); return data; };
  const busy = (next: boolean) => { setWorking(next); onBusy(next); };

  const discard = async (track: TVMusicTrack) => {
    if (persisted.current.tracks.some(row => row.id === track.id)) {
      const result = await removeMusicTrack(track.id, current.current.revision);
      onPersistedChange(result);
      const next = { ...current.current, revision: result.revision, tracks: current.current.tracks.filter(row => row.id !== track.id) };
      current.current = next; onChange(next);
    } else {
      await cancelMusicUpload(track.id); pending.current.delete(track.id);
      const next = { ...current.current, tracks: current.current.tracks.filter(row => row.id !== track.id) };
      current.current = next; onChange(next);
    }
    await refresh();
  };
  const remove = async (track: TVMusicTrack) => {
    if (!window.confirm(`Xóa “${track.name}” khỏi TV và dọn file trên R2? Thao tác có hiệu lực ngay, không chờ nút Lưu thay đổi.`)) return;
    busy(true); setError('');
    try { await discard(track); toast.success('Đã bỏ bài. File R2 được dọn; nếu storage lỗi, hệ thống tự thử lại.'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể xóa bài.'); }
    finally { busy(false); }
  };
  const select = (id: string | null) => { replaceId.current = id; fileInput.current?.click(); };
  const picked = async (file: File) => {
    busy(true); setUploading(true); setError('');
    const controller = new AbortController(); aborter.current = controller;
    try {
      validateMP3(file);
      const replacement = current.current.tracks.find(track => track.id === replaceId.current);
      const replacementIndex = replacement ? current.current.tracks.findIndex(track => track.id === replacement.id) : -1;
      const used = await refresh();
      const afterCount = used.count + 1 - (replacement ? 1 : 0);
      const afterBytes = used.bytes + file.size - (replacement?.sizeBytes ?? 0);
      if (afterCount > TV_MUSIC_MAX_TRACKS || afterBytes > TV_MUSIC_MAX_BYTES) throw new Error('Vượt giới hạn 10 bài hoặc 1 GB. Hãy xóa bài và chờ dọn file trước.');
      if (replacement) {
        if (!window.confirm(`Thay “${replacement.name}”? Bài cũ sẽ được xóa trước để giữ giới hạn kho. Nếu upload mới thất bại, hãy tải lại bài mới.`)) return;
        await discard(replacement);
      }
      const result = await uploadMusic(file, controller.signal, id => pending.current.add(id));
      if (!live.current) { await cancelMusicUpload(result.id); return; }
      const tracks = [...current.current.tracks];
      tracks.splice(replacementIndex < 0 ? tracks.length : replacementIndex, 0, result);
      const next = { ...current.current, tracks };
      current.current = next; onChange(next);
      await refresh(); toast.success('Đã tải nhạc. Nhấn Lưu thay đổi để đưa vào trình chiếu.');
    } catch (failure) { if (live.current) setError(controller.signal.aborted ? 'Đã hủy upload. File tạm sẽ được dọn tự động.' : failure instanceof Error ? failure.message : 'Không thể tải nhạc.'); }
    finally { aborter.current = null; replaceId.current = null; if (live.current) { setUploading(false); busy(false); void refresh().catch(() => undefined); } }
  };
  const move = (index: number, direction: number) => {
    const tracks = [...value.tracks]; [tracks[index], tracks[index + direction]] = [tracks[index + direction], tracks[index]];
    onChange({ ...value, tracks });
  };
  const total = value.tracks.reduce((sum, track) => sum + track.sizeBytes, 0);
  return <section className="space-y-5 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6" aria-labelledby="tv-music-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 id="tv-music-title" className="flex items-center gap-2 text-lg font-semibold"><Music2 size={20} className="text-red-500"/>Nhạc nền trình chiếu</h2>
        <p className="mt-2 text-sm text-[var(--muted-fg)]">Phát liên tục khi chuyển xe và slide tri ân. TV không hiển thị thanh điều khiển nhạc.</p></div>
      <label className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-red-600" checked={value.enabled} disabled={disabled || working} onChange={event => onChange({ ...value, enabled: event.target.checked })}/>Bật nhạc nền</label>
    </div>
    <div className="grid gap-5 rounded-xl bg-red-500/5 p-4 md:grid-cols-2">
      <div className="space-y-2"><p className="text-sm font-medium">Playlist: {value.tracks.length}/10 bài · {bytes(total)} / 1 GB</p>
        <progress aria-label="Dung lượng playlist" value={total} max={TV_MUSIC_MAX_BYTES} className="h-2 w-full accent-red-600"/>
        <div className="flex items-center gap-2 text-xs text-[var(--muted-fg)]"><span>{usage ? `Kho R2 đang giữ ${usage.count}/10 file · ${bytes(usage.bytes)}, gồm file chờ lưu/xóa.` : 'Đang kiểm tra kho nhạc…'}</span>
          <Button type="button" variant="ghost" disabled={working} aria-label="Cập nhật dung lượng nhạc" onClick={() => void refresh().then(() => setError('')).catch(() => setError('Không kiểm tra được kho nhạc.'))}><RefreshCw size={14}/></Button></div>
      </div>
      <div className="space-y-2"><label htmlFor="tv-music-volume" className="flex items-center gap-2 text-sm font-medium"><Volume2 size={16}/>Âm lượng: {value.volume}%</label>
        <input id="tv-music-volume" type="range" min={0} max={100} step={1} value={value.volume} disabled={disabled || working} onChange={event => onChange({ ...value, volume: Number(event.target.value) })} className="w-full accent-red-600"/>
        <p className="text-xs text-[var(--muted-fg)]">TV có thể cần chạm một lần để bật tiếng. Âm lượng thực tế còn phụ thuộc TV/loa.</p></div>
    </div>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="space-y-3">{value.tracks.map((track, index) => <div key={track.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-color)] p-3 sm:p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-sm font-semibold text-red-600">{index + 1}</span>
      <div className="min-w-0 flex-1 basis-40"><Input aria-label={`Tên bài ${index + 1}`} value={track.name} maxLength={120} required disabled={disabled || working} onChange={event => onChange({ ...value, tracks: value.tracks.map(row => row.id === track.id ? { ...row, name: event.target.value } : row) })}/>
        <p className="mt-1 text-xs text-[var(--muted-fg)]">MP3 · {bytes(track.sizeBytes)}{saved.tracks.some(row => row.id === track.id) ? '' : ' · Chờ lưu'}</p></div>
      <div className="ml-auto grid max-w-full grid-cols-2 gap-1 sm:flex"><Button type="button" variant="ghost" size="sm" disabled={disabled || working || index === 0} aria-label={`Đưa bài ${index + 1} lên`} onClick={() => move(index, -1)}><ArrowUp size={16}/></Button>
        <Button type="button" variant="ghost" size="sm" disabled={disabled || working || index === value.tracks.length - 1} aria-label={`Đưa bài ${index + 1} xuống`} onClick={() => move(index, 1)}><ArrowDown size={16}/></Button>
        <Button type="button" variant="ghost" size="sm" disabled={disabled || working} aria-label={`Thay bài ${index + 1}`} onClick={() => select(track.id)}><Replace size={16}/></Button>
        <Button type="button" variant="ghost" size="sm" disabled={disabled || working} aria-label={`Xóa bài ${index + 1}`} onClick={() => void remove(track)}><Trash2 size={16} className="text-red-500"/></Button></div>
    </div>)}</div>
    {!value.tracks.length && <div className="rounded-xl border border-dashed border-[var(--border-color)] px-5 py-8 text-center text-sm text-[var(--muted-fg)]">Chưa có bài nhạc. Thêm MP3 để tạo playlist cho TV.</div>}
    <input ref={fileInput} type="file" accept=".mp3,audio/mpeg,audio/mp3" className="hidden" disabled={disabled || working} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void picked(file); }}/>
    <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="secondary" disabled={disabled || working || value.tracks.length >= TV_MUSIC_MAX_TRACKS} onClick={() => select(null)}><Upload size={16}/>{working ? 'Đang xử lý nhạc…' : 'Thêm bài MP3'}</Button>
      {uploading && <Button type="button" variant="ghost" onClick={() => aborter.current?.abort()}><X size={16}/>Hủy upload</Button>}</div>
    <p className="text-sm leading-relaxed text-[var(--muted-fg)]">Tối đa 10 file và tổng 1 GB (1.000.000.000 byte), tính cả file chờ lưu/xóa. Bài mới cần nhấn “Lưu thay đổi”; file chưa lưu được tự dọn sau 20 phút. Xóa/thay bài đã lưu có hiệu lực ngay và dọn R2; khi kho đầy cần dọn bài cũ trước. Nhạc phát theo thứ tự và tự lặp playlist.</p>
  </section>;
}
