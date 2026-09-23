export const defaultCarColors: Record<string, string> = {
  'Xanh': '#2563EB',
  'Xám': '#6B7280',
  'Nâu': '#92400E',
  'Cam': '#F97316',
  'Vàng': '#EAB308',
  'Bạc': '#CBD5E1',
  'Trắng': '#FFFFFF',
  'Đỏ': '#DC2626',
  'Đen': '#111827',
};

export function resolveCarColorCode(value: unknown, name?: string): string {
  const code = String(value || '').trim();
  return /^#[\da-f]{6}$/i.test(code) ? code.toUpperCase() : defaultCarColors[name || ''] || '#DC2626';
}
