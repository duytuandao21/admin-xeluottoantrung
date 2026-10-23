import type { Milestone, Section, Story } from './api/about-story';

export const chapterKeys = ['opening', 'milestones', 'stories', 'people', 'future'] as const;
export const chapterNames = ['Mở đầu', 'Cột mốc lịch sử', 'Câu chuyện khách hàng', 'Con người Toàn Trung', 'Chặng đường phía trước'];

export function may(permissions: readonly string[] | undefined, permission: string) {
  return Boolean(permissions?.includes(permission));
}

export function sectionProblem(row: Section): string | null {
  if (!row.title.trim()) return 'Cần nhập tiêu đề.';
  if (Boolean(row.ctaLabel?.trim()) !== Boolean(row.ctaHref?.trim())) return 'CTA cần đủ nhãn và đường dẫn.';
  if (row.ctaHref && !/^\/(?!\/)[a-z0-9/\-]*(?:#[a-z0-9\-]+)?$/.test(row.ctaHref)) return 'CTA chỉ dùng đường dẫn nội bộ.';
  return null;
}

export function milestoneProblem(row: Milestone): string | null {
  if (!row.slug.trim() || !row.periodLabel.trim() || !row.title.trim() || !row.summary.trim()) return 'Thiếu slug, thời gian, tiêu đề hoặc tóm tắt.';
  return null;
}

export function storyProblem(row: Story): string | null {
  if (!row.title.trim() || !row.body.trim()) return 'Thiếu tiêu đề hoặc nội dung.';
  return null;
}

/** Caller only clears its form when ok is true; failed writes cannot discard the current draft. */
export async function attemptSave(task: () => Promise<unknown>): Promise<{ok:true}|{ok:false;error:unknown}> {
  try { await task(); return {ok:true}; } catch(error) { return {ok:false,error}; }
}

