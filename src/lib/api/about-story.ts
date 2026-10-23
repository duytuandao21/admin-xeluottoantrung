import { api, json } from './client';
import { readUploadImageDimensions } from './image-dimensions';

import { chapterKeys } from '../about-story-rules';
export { chapterKeys, chapterNames } from '../about-story-rules';
export type ChapterKey = typeof chapterKeys[number];
export interface Section { id: string; chapterKey: ChapterKey; title: string; subtitle: string | null; body: string | null; ctaLabel: string | null; ctaHref: string | null; visible: boolean }
export interface Milestone { id: string; slug: string; periodLabel: string; eventDate: string | null; stage: '1997-2017' | '2018-2022' | '2024-2025' | '2026'; title: string; summary: string; body: string | null; featured: boolean; sortOrder: number; sourceNote: string | null }
export interface Story { id: string; title: string; body: string; quote: string | null; displayName: string | null; sortOrder: number }
export interface StoryAsset { id: string; ownerType: 'section' | 'milestone' | 'story'; ownerKey: string; placement: 'desktop' | 'mobile' | 'gallery'; publicUrl: string; width: number; height: number; altText: string; sortOrder: number }
export interface AboutContent { revision: number; updatedAt: string; sections: Section[]; milestones: Milestone[]; stories: Story[]; assets: StoryAsset[] }

const base = '/admin/about-story';
export const getAboutContent = () => api<AboutContent>(base);
export const saveSection = (key: ChapterKey, section: Omit<Section, 'id' | 'chapterKey'>, expectedRevision: number) =>
  api(`${base}/sections/${key}`, json('PATCH', { ...section, expectedRevision }));
export const saveMilestone = (item: Omit<Milestone, 'id'>, expectedRevision: number, id?: string) => {
  const { slug, periodLabel, eventDate, stage, title, summary, body, featured, sortOrder, sourceNote } = item;
  return api(`${base}/milestones${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST',
    { slug, periodLabel, eventDate, stage, title, summary, body, featured, sortOrder, sourceNote, expectedRevision }));
};
export const saveStory = (item: Omit<Story, 'id'>, expectedRevision: number, id?: string) => {
  const { title, body, quote, displayName, sortOrder } = item;
  return api(`${base}/stories${id ? `/${id}` : ''}`, json(id ? 'PATCH' : 'POST',
    { title, body, quote, displayName, sortOrder, expectedRevision }));
};
export const deleteAboutItem = (kind: 'milestones' | 'stories' | 'assets', id: string, expectedRevision: number) =>
  api<void>(`${base}/${kind}/${id}`, json('DELETE', { expectedRevision }));
export const reorderAboutItems = (kind: 'milestone' | 'story' | 'asset', ids: string[], expectedRevision: number) =>
  api(`${base}/order`, json('PATCH', { kind, ids, expectedRevision }));
export const updateAboutAsset = (asset: StoryAsset, expectedRevision: number) =>
  api(`${base}/assets/${asset.id}`, json('PATCH', { altText: asset.altText, placement: asset.placement, sortOrder: asset.sortOrder, expectedRevision }));

/** Upload without re-encoding; registration is separate so failed PUT never creates an asset row. */
export async function addAboutAsset(file: File, ownerType: StoryAsset['ownerType'], ownerKey: string,
  placement: StoryAsset['placement'], altText: string, sortOrder: number, expectedRevision: number) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size < 1 || file.size > 10_000_000)
    throw new Error('Chọn ảnh JPEG, PNG, WebP hoặc AVIF dưới 10 MB.');
  const dimensions = await readUploadImageDimensions(file);
  if (!dimensions) throw new Error('Không đọc được kích thước ảnh tĩnh. Vui lòng chọn ảnh khác.');
  if (!altText.trim()) throw new Error('Cần nhập mô tả ảnh (alt text).');
  const signed = await api<{storageKey:string;uploadUrl:string;headers:Record<string,string>}>(
    '/admin/media/assets/presign', json('POST', { mimeType: file.type, sizeBytes: file.size }));
  const uploaded = await fetch(signed.uploadUrl, { method: 'PUT', headers: signed.headers, body: file });
  if (!uploaded.ok) throw new Error(`Tải ảnh lên R2 thất bại (${uploaded.status}).`);
  return api(`${base}/assets`, json('POST', { ownerType, ownerKey, placement, storageKey: signed.storageKey,
    altText: altText.trim(), ...dimensions, sortOrder, expectedRevision }));
}
