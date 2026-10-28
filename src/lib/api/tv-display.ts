import { api, json } from './client';
import { defaultTVMusic, parseTVMusic, type TVMusicSettings } from '../tv-music-settings';
import { defaultTVAnniversary, parseTVAnniversary, type TVAnniversarySettings } from '../tv-anniversary-settings';

export type TVHotline = { name: string; phone: string };
export type TVConfig = {
  music: TVMusicSettings;
  theme: 'standard' | 'anniversary-4';
  anniversary: TVAnniversarySettings;
  logoUrl: string; title: string; hotlineTitle: string; carIntervalSeconds: number;
  hotlineIntervalSeconds: number; syncSalesContacts: boolean; hotlines: TVHotline[];
};
export const defaultTVConfig: TVConfig = { music: defaultTVMusic, theme: 'standard', anniversary: defaultTVAnniversary, logoUrl: '', title: 'Bảng giá xe đang bán', hotlineTitle: 'Hotline',
  carIntervalSeconds: 15, hotlineIntervalSeconds: 5, syncSalesContacts: true, hotlines: [] };
export async function loadTVDisplay() {
  const [rows, contacts, logos] = await Promise.all([
    api<{key:string;value:string}[]>('/admin/site-settings/tv-display'),
    api<{title:string;body?:string;phone?:string;status:string}[]>('/admin/content?group=thiet-lap-nut-goi'),
    api<{key:string;value:string}[]>('/admin/site-settings/thiet-lap-logo'),
  ]);
  const saved = rows.find(row => row.key === 'config')?.value;
  const config: TVConfig = saved ? { theme: 'standard', ...JSON.parse(saved) } : { ...defaultTVConfig, hotlines: [] };
  if (!config || !Array.isArray(config.hotlines) || typeof config.syncSalesContacts !== 'boolean') throw new Error('Cấu hình TV Display không hợp lệ.');
  if (config.theme !== 'standard' && config.theme !== 'anniversary-4') throw new Error('Giao diện TV Display không hợp lệ.');
  config.anniversary = parseTVAnniversary(config.anniversary);
  config.music = parseTVMusic(config.music);
  const seen = new Set<string>();
  const sales = contacts.filter(row => row.status === 'active' &&
    /tu\s*van\s*ban\s*hang/.test((row.body || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()))
    .flatMap(row => {
      const phone = (row.phone || '').replace(/[\s().-]/g, '');
      const identity = phone.replace(/^\+?84(?=\d{9}$)/, '0');
      if (!/^\+?\d{9,12}$/.test(phone) || seen.has(identity)) return [];
      seen.add(identity); return [{ name: row.title, phone }];
    });
  return { config, sales, websiteLogo: logos.find(row => row.key === 'logo')?.value || '' };
}
export function saveTVDisplay(config: TVConfig) {
  return api<{ value: string }>('/admin/site-settings/tv-display/config', json('PUT', { value: JSON.stringify(config), valueType: 'json' }));
}
