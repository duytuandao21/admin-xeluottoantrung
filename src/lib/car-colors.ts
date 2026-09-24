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

export interface ManagedCarColor {
  id: number;
  title: string;
  order: number;
  status: 'active' | 'inactive';
  image: string;
  link: string;
  description: string;
  colorCode: string;
  featured: boolean;
}

export const initialManagedCarColors: ManagedCarColor[] = Object.entries(defaultCarColors).map(([title, colorCode], index) => ({
  id: index + 1,
  title,
  order: index + 1,
  status: 'active',
  image: '',
  link: '',
  description: '',
  colorCode,
  featured: false,
}));

export function resolveCarColorCode(value: unknown, name?: string): string {
  const code = String(value || '').trim();
  return /^#[\da-f]{6}$/i.test(code) ? code.toUpperCase() : defaultCarColors[name || ''] || '#DC2626';
}
